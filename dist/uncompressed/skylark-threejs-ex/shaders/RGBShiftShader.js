define([
    "../threex"
],function (threex) {
    'use strict';
    var RGBShiftShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'amount': { value: 0.005 },
            'angle': { value: 0 }
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
            'uniform float amount;',
            'uniform float angle;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec2 offset = amount * vec2( cos(angle), sin(angle));',
            '\tvec4 cr = texture2D(tDiffuse, vUv + offset);',
            '\tvec4 cga = texture2D(tDiffuse, vUv);',
            '\tvec4 cb = texture2D(tDiffuse, vUv - offset);',
            '\tgl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);',
            '}'
        ].join('\n')
    };
    return threex.shaders.RGBShiftShader = RGBShiftShader;
});