define([
    "../threex"
],function (threex) {
    'use strict';
    var BlendShader = {
        uniforms: {
            'tDiffuse1': { value: null },
            'tDiffuse2': { value: null },
            'mixRatio': { value: 0.5 },
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
            'uniform float mixRatio;',
            'uniform sampler2D tDiffuse1;',
            'uniform sampler2D tDiffuse2;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 texel1 = texture2D( tDiffuse1, vUv );',
            '\tvec4 texel2 = texture2D( tDiffuse2, vUv );',
            '\tgl_FragColor = opacity * mix( texel1, texel2, mixRatio );',
            '}'
        ].join('\n')
    };
    return threex.shaders.BlendShader = BlendShader;
});