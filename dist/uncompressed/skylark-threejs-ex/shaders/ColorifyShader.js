define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var ColorifyShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'color': { value: new THREE.Color(16777215) }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 color;',
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 texel = texture2D( tDiffuse, vUv );',
            '\tvec3 luma = vec3( 0.299, 0.587, 0.114 );',
            '\tfloat v = dot( texel.xyz, luma );',
            '\tgl_FragColor = vec4( v * color, texel.w );',
            '}'
        ].join('\n')
    };
    return threex.shaders.ColorifyShader = ColorifyShader;
});