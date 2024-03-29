define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var ColorCorrectionShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'powRGB': { value: new THREE.Vector3(2, 2, 2) },
            'mulRGB': { value: new THREE.Vector3(1, 1, 1) },
            'addRGB': { value: new THREE.Vector3(0, 0, 0) }
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
            'uniform vec3 powRGB;',
            'uniform vec3 mulRGB;',
            'uniform vec3 addRGB;',
            'varying vec2 vUv;',
            'void main() {',
            '\tgl_FragColor = texture2D( tDiffuse, vUv );',
            '\tgl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );',
            '}'
        ].join('\n')
    };
    return threex.shaders.ColorCorrectionShader = ColorCorrectionShader;
});