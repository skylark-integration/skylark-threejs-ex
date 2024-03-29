define([
    "../threex"
],function (threex) {
    'use strict';
    var LuminosityShader = {
        uniforms: { 'tDiffuse': { value: null } },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#include <common>',
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 texel = texture2D( tDiffuse, vUv );',
            '\tfloat l = linearToRelativeLuminance( texel.rgb );',
            '\tgl_FragColor = vec4( l, l, l, texel.w );',
            '}'
        ].join('\n')
    };
    return  threex.shaders.LuminosityShader = LuminosityShader;
});