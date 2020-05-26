define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var SMAAEdgesShader = {
        defines: { 'SMAA_THRESHOLD': '0.1' },
        uniforms: {
            'tDiffuse': { value: null },
            'resolution': { value: new THREE.Vector2(1 / 1024, 1 / 512) }
        },
        vertexShader: [
            'uniform vec2 resolution;',
            'varying vec2 vUv;',
            'varying vec4 vOffset[ 3 ];',
            'void SMAAEdgeDetectionVS( vec2 texcoord ) {',
            '\tvOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 );',
            '\tvOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 );',
            '\tvOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 );',
            '}',
            'void main() {',
            '\tvUv = uv;',
            '\tSMAAEdgeDetectionVS( vUv );',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'varying vec4 vOffset[ 3 ];',
            'vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {',
            '\tvec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );',
            '\tvec4 delta;',
            '\tvec3 C = texture2D( colorTex, texcoord ).rgb;',
            '\tvec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;',
            '\tvec3 t = abs( C - Cleft );',
            '\tdelta.x = max( max( t.r, t.g ), t.b );',
            '\tvec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;',
            '\tt = abs( C - Ctop );',
            '\tdelta.y = max( max( t.r, t.g ), t.b );',
            '\tvec2 edges = step( threshold, delta.xy );',
            '\tif ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )',
            '\t\tdiscard;',
            '\tvec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;',
            '\tt = abs( C - Cright );',
            '\tdelta.z = max( max( t.r, t.g ), t.b );',
            '\tvec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;',
            '\tt = abs( C - Cbottom );',
            '\tdelta.w = max( max( t.r, t.g ), t.b );',
            '\tfloat maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );',
            '\tvec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;',
            '\tt = abs( C - Cleftleft );',
            '\tdelta.z = max( max( t.r, t.g ), t.b );',
            '\tvec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;',
            '\tt = abs( C - Ctoptop );',
            '\tdelta.w = max( max( t.r, t.g ), t.b );',
            '\tmaxDelta = max( max( maxDelta, delta.z ), delta.w );',
            '\tedges.xy *= step( 0.5 * maxDelta, delta.xy );',
            '\treturn vec4( edges, 0.0, 0.0 );',
            '}',
            'void main() {',
            '\tgl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );',
            '}'
        ].join('\n')
    };
    var SMAAWeightsShader = {
        defines: {
            'SMAA_MAX_SEARCH_STEPS': '8',
            'SMAA_AREATEX_MAX_DISTANCE': '16',
            'SMAA_AREATEX_PIXEL_SIZE': '( 1.0 / vec2( 160.0, 560.0 ) )',
            'SMAA_AREATEX_SUBTEX_SIZE': '( 1.0 / 7.0 )'
        },
        uniforms: {
            'tDiffuse': { value: null },
            'tArea': { value: null },
            'tSearch': { value: null },
            'resolution': { value: new THREE.Vector2(1 / 1024, 1 / 512) }
        },
        vertexShader: [
            'uniform vec2 resolution;',
            'varying vec2 vUv;',
            'varying vec4 vOffset[ 3 ];',
            'varying vec2 vPixcoord;',
            'void SMAABlendingWeightCalculationVS( vec2 texcoord ) {',
            '\tvPixcoord = texcoord / resolution;',
            '\tvOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 );',
            '\tvOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 );',
            '\tvOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );',
            '}',
            'void main() {',
            '\tvUv = uv;',
            '\tSMAABlendingWeightCalculationVS( vUv );',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )',
            'uniform sampler2D tDiffuse;',
            'uniform sampler2D tArea;',
            'uniform sampler2D tSearch;',
            'uniform vec2 resolution;',
            'varying vec2 vUv;',
            'varying vec4 vOffset[3];',
            'varying vec2 vPixcoord;',
            '#if __VERSION__ == 100',
            'vec2 round( vec2 x ) {',
            '\treturn sign( x ) * floor( abs( x ) + 0.5 );',
            '}',
            '#endif',
            'float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {',
            '\te.r = bias + e.r * scale;',
            '\treturn 255.0 * texture2D( searchTex, e, 0.0 ).r;',
            '}',
            'float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {',
            '\tvec2 e = vec2( 0.0, 1.0 );',
            '\tfor ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {',
            '\t\te = texture2D( edgesTex, texcoord, 0.0 ).rg;',
            '\t\ttexcoord -= vec2( 2.0, 0.0 ) * resolution;',
            '\t\tif ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;',
            '\t}',
            '\ttexcoord.x += 0.25 * resolution.x;',
            '\ttexcoord.x += resolution.x;',
            '\ttexcoord.x += 2.0 * resolution.x;',
            '\ttexcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);',
            '\treturn texcoord.x;',
            '}',
            'float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {',
            '\tvec2 e = vec2( 0.0, 1.0 );',
            '\tfor ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {',
            '\t\te = texture2D( edgesTex, texcoord, 0.0 ).rg;',
            '\t\ttexcoord += vec2( 2.0, 0.0 ) * resolution;',
            '\t\tif ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;',
            '\t}',
            '\ttexcoord.x -= 0.25 * resolution.x;',
            '\ttexcoord.x -= resolution.x;',
            '\ttexcoord.x -= 2.0 * resolution.x;',
            '\ttexcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );',
            '\treturn texcoord.x;',
            '}',
            'float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {',
            '\tvec2 e = vec2( 1.0, 0.0 );',
            '\tfor ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {',
            '\t\te = texture2D( edgesTex, texcoord, 0.0 ).rg;',
            '\t\ttexcoord += vec2( 0.0, 2.0 ) * resolution;',
            '\t\tif ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;',
            '\t}',
            '\ttexcoord.y -= 0.25 * resolution.y;',
            '\ttexcoord.y -= resolution.y;',
            '\ttexcoord.y -= 2.0 * resolution.y;',
            '\ttexcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 );',
            '\treturn texcoord.y;',
            '}',
            'float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {',
            '\tvec2 e = vec2( 1.0, 0.0 );',
            '\tfor ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {',
            '\t\te = texture2D( edgesTex, texcoord, 0.0 ).rg;',
            '\t\ttexcoord -= vec2( 0.0, 2.0 ) * resolution;',
            '\t\tif ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;',
            '\t}',
            '\ttexcoord.y += 0.25 * resolution.y;',
            '\ttexcoord.y += resolution.y;',
            '\ttexcoord.y += 2.0 * resolution.y;',
            '\ttexcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 );',
            '\treturn texcoord.y;',
            '}',
            'vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {',
            '\tvec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;',
            '\ttexcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );',
            '\ttexcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;',
            '\treturn texture2D( areaTex, texcoord, 0.0 ).rg;',
            '}',
            'vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {',
            '\tvec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );',
            '\tvec2 e = texture2D( edgesTex, texcoord ).rg;',
            '\tif ( e.g > 0.0 ) {',
            '\t\tvec2 d;',
            '\t\tvec2 coords;',
            '\t\tcoords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );',
            '\t\tcoords.y = offset[ 1 ].y;',
            '\t\td.x = coords.x;',
            '\t\tfloat e1 = texture2D( edgesTex, coords, 0.0 ).r;',
            '\t\tcoords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );',
            '\t\td.y = coords.x;',
            '\t\td = d / resolution.x - pixcoord.x;',
            '\t\tvec2 sqrt_d = sqrt( abs( d ) );',
            '\t\tcoords.y -= 1.0 * resolution.y;',
            '\t\tfloat e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;',
            '\t\tweights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );',
            '\t}',
            '\tif ( e.r > 0.0 ) {',
            '\t\tvec2 d;',
            '\t\tvec2 coords;',
            '\t\tcoords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );',
            '\t\tcoords.x = offset[ 0 ].x;',
            '\t\td.x = coords.y;',
            '\t\tfloat e1 = texture2D( edgesTex, coords, 0.0 ).g;',
            '\t\tcoords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );',
            '\t\td.y = coords.y;',
            '\t\td = d / resolution.y - pixcoord.y;',
            '\t\tvec2 sqrt_d = sqrt( abs( d ) );',
            '\t\tcoords.y -= 1.0 * resolution.y;',
            '\t\tfloat e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;',
            '\t\tweights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );',
            '\t}',
            '\treturn weights;',
            '}',
            'void main() {',
            '\tgl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );',
            '}'
        ].join('\n')
    };
    var SMAABlendShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'tColor': { value: null },
            'resolution': { value: new THREE.Vector2(1 / 1024, 1 / 512) }
        },
        vertexShader: [
            'uniform vec2 resolution;',
            'varying vec2 vUv;',
            'varying vec4 vOffset[ 2 ];',
            'void SMAANeighborhoodBlendingVS( vec2 texcoord ) {',
            '\tvOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 );',
            '\tvOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 );',
            '}',
            'void main() {',
            '\tvUv = uv;',
            '\tSMAANeighborhoodBlendingVS( vUv );',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'uniform sampler2D tColor;',
            'uniform vec2 resolution;',
            'varying vec2 vUv;',
            'varying vec4 vOffset[ 2 ];',
            'vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {',
            '\tvec4 a;',
            '\ta.xz = texture2D( blendTex, texcoord ).xz;',
            '\ta.y = texture2D( blendTex, offset[ 1 ].zw ).g;',
            '\ta.w = texture2D( blendTex, offset[ 1 ].xy ).a;',
            '\tif ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {',
            '\t\treturn texture2D( colorTex, texcoord, 0.0 );',
            '\t} else {',
            '\t\tvec2 offset;',
            '\t\toffset.x = a.a > a.b ? a.a : -a.b;',
            '\t\toffset.y = a.g > a.r ? -a.g : a.r;',
            '\t\tif ( abs( offset.x ) > abs( offset.y )) {',
            '\t\t\toffset.y = 0.0;',
            '\t\t} else {',
            '\t\t\toffset.x = 0.0;',
            '\t\t}',
            '\t\tvec4 C = texture2D( colorTex, texcoord, 0.0 );',
            '\t\ttexcoord += sign( offset ) * resolution;',
            '\t\tvec4 Cop = texture2D( colorTex, texcoord, 0.0 );',
            '\t\tfloat s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );',
            '\t\tC.xyz = pow(C.xyz, vec3(2.2));',
            '\t\tCop.xyz = pow(Cop.xyz, vec3(2.2));',
            '\t\tvec4 mixed = mix(C, Cop, s);',
            '\t\tmixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));',
            '\t\treturn mixed;',
            '\t}',
            '}',
            'void main() {',
            '\tgl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );',
            '}'
        ].join('\n')
    };
    return threex.shaders.SMAAShader = {
        SMAAEdgesShader,
        SMAAWeightsShader,
        SMAABlendShader
    };
});