define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var NormalMapShader = {
        uniforms: {
            'heightMap': { value: null },
            'resolution': { value: new THREE.Vector2(512, 512) },
            'scale': { value: new THREE.Vector2(1, 1) },
            'height': { value: 0.05 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float height;',
            'uniform vec2 resolution;',
            'uniform sampler2D heightMap;',
            'varying vec2 vUv;',
            'void main() {',
            '\tfloat val = texture2D( heightMap, vUv ).x;',
            '\tfloat valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;',
            '\tfloat valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;',
            '\tgl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );',
            '}'
        ].join('\n')
    };
    return  threex.shaders.NormalMapShader = NormalMapShader;
});