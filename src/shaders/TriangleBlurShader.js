define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var TriangleBlurShader = {
        uniforms: {
            'texture': { value: null },
            'delta': { value: new THREE.Vector2(1, 1) }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#include <common>',
            '#define ITERATIONS 10.0',
            'uniform sampler2D texture;',
            'uniform vec2 delta;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 color = vec4( 0.0 );',
            '\tfloat total = 0.0;',
            '\tfloat offset = rand( vUv );',
            '\tfor ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {',
            '\t\tfloat percent = ( t + offset - 0.5 ) / ITERATIONS;',
            '\t\tfloat weight = 1.0 - abs( percent );',
            '\t\tcolor += texture2D( texture, vUv + delta * percent ) * weight;',
            '\t\ttotal += weight;',
            '\t}',
            '\tgl_FragColor = color / total;',
            '}'
        ].join('\n')
    };
    return threex.shaders.TriangleBlurShader = TriangleBlurShader;
});