define([
    "../threex"
],function (threex) {
    'use strict';
    var DOFMipMapShader = {
        uniforms: {
            'tColor': { value: null },
            'tDepth': { value: null },
            'focus': { value: 1 },
            'maxblur': { value: 1 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float focus;',
            'uniform float maxblur;',
            'uniform sampler2D tColor;',
            'uniform sampler2D tDepth;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 depth = texture2D( tDepth, vUv );',
            '\tfloat factor = depth.x - focus;',
            '\tvec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );',
            '\tgl_FragColor = col;',
            '\tgl_FragColor.a = 1.0;',
            '}'
        ].join('\n')
    };
    return  threex.shaders.DOFMipMapShader = DOFMipMapShader;
});