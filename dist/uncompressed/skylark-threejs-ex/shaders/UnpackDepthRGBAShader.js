define([
    "../threex"
],function (threex) {
    'use strict';
    var UnpackDepthRGBAShader = {
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
            '#include <packing>',
            'void main() {',
            '\tfloat depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );',
            '\tgl_FragColor = vec4( vec3( depth ), opacity );',
            '}'
        ].join('\n')
    };
    return  threex.shaders.UnpackDepthRGBAShader = UnpackDepthRGBAShader;
});