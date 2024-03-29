define([
    "../threex"
],function (threex) {
    'use strict';
    var CopyShader = {
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
            '\tvec4 texel = texture2D( tDiffuse, vUv );',
            '\tgl_FragColor = opacity * texel;',
            '}'
        ].join('\n')
    };
    return threex.shaders.CopyShader = CopyShader;
});