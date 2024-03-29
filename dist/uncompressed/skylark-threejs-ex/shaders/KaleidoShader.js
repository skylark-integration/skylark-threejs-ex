define([
    "../threex"
],function (threex) {
    'use strict';
    var KaleidoShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'sides': { value: 6 },
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
            'uniform float sides;',
            'uniform float angle;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec2 p = vUv - 0.5;',
            '\tfloat r = length(p);',
            '\tfloat a = atan(p.y, p.x) + angle;',
            '\tfloat tau = 2. * 3.1416 ;',
            '\ta = mod(a, tau/sides);',
            '\ta = abs(a - tau/sides/2.) ;',
            '\tp = r * vec2(cos(a), sin(a));',
            '\tvec4 color = texture2D(tDiffuse, p + 0.5);',
            '\tgl_FragColor = color;',
            '}'
        ].join('\n')
    };
    return  threex.shaders.KaleidoShader = KaleidoShader;
});