define([
    "../threex"
],function (threex) {
    'use strict';
    var WaterRefractionShader = {
        uniforms: {
            'color': { value: null },
            'time': { value: 0 },
            'tDiffuse': { value: null },
            'tDudv': { value: null },
            'textureMatrix': { value: null }
        },
        vertexShader: [
            'uniform mat4 textureMatrix;',
            'varying vec2 vUv;',
            'varying vec4 vUvRefraction;',
            'void main() {',
            '\tvUv = uv;',
            '\tvUvRefraction = textureMatrix * vec4( position, 1.0 );',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 color;',
            'uniform float time;',
            'uniform sampler2D tDiffuse;',
            'uniform sampler2D tDudv;',
            'varying vec2 vUv;',
            'varying vec4 vUvRefraction;',
            'float blendOverlay( float base, float blend ) {',
            '\treturn( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );',
            '}',
            'vec3 blendOverlay( vec3 base, vec3 blend ) {',
            '\treturn vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ),blendOverlay( base.b, blend.b ) );',
            '}',
            'void main() {',
            ' float waveStrength = 0.1;',
            ' float waveSpeed = 0.03;',
            '\tvec2 distortedUv = texture2D( tDudv, vec2( vUv.x + time * waveSpeed, vUv.y ) ).rg * waveStrength;',
            '\tdistortedUv = vUv.xy + vec2( distortedUv.x, distortedUv.y + time * waveSpeed );',
            '\tvec2 distortion = ( texture2D( tDudv, distortedUv ).rg * 2.0 - 1.0 ) * waveStrength;',
            ' vec4 uv = vec4( vUvRefraction );',
            ' uv.xy += distortion;',
            '\tvec4 base = texture2DProj( tDiffuse, uv );',
            '\tgl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',
            '}'
        ].join('\n')
    };
    return  threex.shaders.WaterRefractionShader = WaterRefractionShader;
});