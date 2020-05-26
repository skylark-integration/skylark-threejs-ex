define([
    "../threex"
],function (threex) {
    'use strict';
    var GammaCorrectionShader = {
        uniforms: { 'tDiffuse': { value: null } },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 tex = texture2D( tDiffuse, vUv );',
            '\tgl_FragColor = LinearTosRGB( tex );',
            '}'
        ].join('\n')
    };
    return threex.shaders.GammaCorrectionShader = GammaCorrectionShader;
});