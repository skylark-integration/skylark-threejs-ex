define([
    "../threex"
],function (threex) {
    'use strict';
    var BleachBypassShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'opacity': { value: 1 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float opacity;',
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 base = texture2D( tDiffuse, vUv );',
            '\tvec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );',
            '\tfloat lum = dot( lumCoeff, base.rgb );',
            '\tvec3 blend = vec3( lum );',
            '\tfloat L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );',
            '\tvec3 result1 = 2.0 * base.rgb * blend;',
            '\tvec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );',
            '\tvec3 newColor = mix( result1, result2, L );',
            '\tfloat A2 = opacity * base.a;',
            '\tvec3 mixRGB = A2 * newColor.rgb;',
            '\tmixRGB += ( ( 1.0 - A2 ) * base.rgb );',
            '\tgl_FragColor = vec4( mixRGB, base.a );',
            '}'
        ].join('\n')
    };
    return threex.shaders.BleachBypassShader = BleachBypassShader;
});