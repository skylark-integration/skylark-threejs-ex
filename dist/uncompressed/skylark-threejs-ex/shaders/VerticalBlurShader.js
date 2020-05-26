define([
    "../threex"
],function (threex) {
    'use strict';
    var VerticalBlurShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'v': { value: 1 / 512 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'uniform float v;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 sum = vec4( 0.0 );',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;',
            '\tgl_FragColor = sum;',
            '}'
        ].join('\n')
    };
    return threex.shaders.VerticalBlurShader = VerticalBlurShader;
});