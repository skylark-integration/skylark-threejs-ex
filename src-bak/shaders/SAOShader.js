define(["skylark-threejs"], function (a) {
    'use strict';
    var SAOShader = {
        defines: {
            'NUM_SAMPLES': 7,
            'NUM_RINGS': 4,
            'NORMAL_TEXTURE': 0,
            'DIFFUSE_TEXTURE': 0,
            'DEPTH_PACKING': 1,
            'PERSPECTIVE_CAMERA': 1
        },
        uniforms: {
            'tDepth': { value: null },
            'tDiffuse': { value: null },
            'tNormal': { value: null },
            'size': { value: new a.Vector2(512, 512) },
            'cameraNear': { value: 1 },
            'cameraFar': { value: 100 },
            'cameraProjectionMatrix': { value: new a.Matrix4() },
            'cameraInverseProjectionMatrix': { value: new a.Matrix4() },
            'scale': { value: 1 },
            'intensity': { value: 0.1 },
            'bias': { value: 0.5 },
            'minResolution': { value: 0 },
            'kernelRadius': { value: 100 },
            'randomSeed': { value: 0 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#include <common>',
            'varying vec2 vUv;',
            '#if DIFFUSE_TEXTURE == 1',
            'uniform sampler2D tDiffuse;',
            '#endif',
            'uniform sampler2D tDepth;',
            '#if NORMAL_TEXTURE == 1',
            'uniform sampler2D tNormal;',
            '#endif',
            'uniform float cameraNear;',
            'uniform float cameraFar;',
            'uniform mat4 cameraProjectionMatrix;',
            'uniform mat4 cameraInverseProjectionMatrix;',
            'uniform float scale;',
            'uniform float intensity;',
            'uniform float bias;',
            'uniform float kernelRadius;',
            'uniform float minResolution;',
            'uniform vec2 size;',
            'uniform float randomSeed;',
            '// RGBA depth',
            '#include <packing>',
            'vec4 getDefaultColor( const in vec2 screenPosition ) {',
            '\t#if DIFFUSE_TEXTURE == 1',
            '\treturn texture2D( tDiffuse, vUv );',
            '\t#else',
            '\treturn vec4( 1.0 );',
            '\t#endif',
            '}',
            'float getDepth( const in vec2 screenPosition ) {',
            '\t#if DEPTH_PACKING == 1',
            '\treturn unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );',
            '\t#else',
            '\treturn texture2D( tDepth, screenPosition ).x;',
            '\t#endif',
            '}',
            'float getViewZ( const in float depth ) {',
            '\t#if PERSPECTIVE_CAMERA == 1',
            '\treturn perspectiveDepthToViewZ( depth, cameraNear, cameraFar );',
            '\t#else',
            '\treturn orthographicDepthToViewZ( depth, cameraNear, cameraFar );',
            '\t#endif',
            '}',
            'vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {',
            '\tfloat clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];',
            '\tvec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );',
            '\tclipPosition *= clipW; // unprojection.',
            '\treturn ( cameraInverseProjectionMatrix * clipPosition ).xyz;',
            '}',
            'vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {',
            '\t#if NORMAL_TEXTURE == 1',
            '\treturn unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );',
            '\t#else',
            '\treturn normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );',
            '\t#endif',
            '}',
            'float scaleDividedByCameraFar;',
            'float minResolutionMultipliedByCameraFar;',
            'float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {',
            '\tvec3 viewDelta = sampleViewPosition - centerViewPosition;',
            '\tfloat viewDistance = length( viewDelta );',
            '\tfloat scaledScreenDistance = scaleDividedByCameraFar * viewDistance;',
            '\treturn max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );',
            '}',
            '// moving costly divides into consts',
            'const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );',
            'const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );',
            'float getAmbientOcclusion( const in vec3 centerViewPosition ) {',
            '\t// precompute some variables require in getOcclusion.',
            '\tscaleDividedByCameraFar = scale / cameraFar;',
            '\tminResolutionMultipliedByCameraFar = minResolution * cameraFar;',
            '\tvec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );',
            '\t// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/',
            '\tfloat angle = rand( vUv + randomSeed ) * PI2;',
            '\tvec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;',
            '\tvec2 radiusStep = radius;',
            '\tfloat occlusionSum = 0.0;',
            '\tfloat weightSum = 0.0;',
            '\tfor( int i = 0; i < NUM_SAMPLES; i ++ ) {',
            '\t\tvec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;',
            '\t\tradius += radiusStep;',
            '\t\tangle += ANGLE_STEP;',
            '\t\tfloat sampleDepth = getDepth( sampleUv );',
            '\t\tif( sampleDepth >= ( 1.0 - EPSILON ) ) {',
            '\t\t\tcontinue;',
            '\t\t}',
            '\t\tfloat sampleViewZ = getViewZ( sampleDepth );',
            '\t\tvec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );',
            '\t\tocclusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );',
            '\t\tweightSum += 1.0;',
            '\t}',
            '\tif( weightSum == 0.0 ) discard;',
            '\treturn occlusionSum * ( intensity / weightSum );',
            '}',
            'void main() {',
            '\tfloat centerDepth = getDepth( vUv );',
            '\tif( centerDepth >= ( 1.0 - EPSILON ) ) {',
            '\t\tdiscard;',
            '\t}',
            '\tfloat centerViewZ = getViewZ( centerDepth );',
            '\tvec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );',
            '\tfloat ambientOcclusion = getAmbientOcclusion( viewPosition );',
            '\tgl_FragColor = getDefaultColor( vUv );',
            '\tgl_FragColor.xyz *=  1.0 - ambientOcclusion;',
            '}'
        ].join('\n')
    };
    return SAOShader;
});