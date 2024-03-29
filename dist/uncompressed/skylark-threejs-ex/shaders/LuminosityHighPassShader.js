define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var LuminosityHighPassShader = {
        shaderID: 'luminosityHighPass',
        uniforms: {
            'tDiffuse': { value: null },
            'luminosityThreshold': { value: 1 },
            'smoothWidth': { value: 1 },
            'defaultColor': { value: new THREE.Color(0) },
            'defaultOpacity': { value: 0 }
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
            'uniform vec3 defaultColor;',
            'uniform float defaultOpacity;',
            'uniform float luminosityThreshold;',
            'uniform float smoothWidth;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 texel = texture2D( tDiffuse, vUv );',
            '\tvec3 luma = vec3( 0.299, 0.587, 0.114 );',
            '\tfloat v = dot( texel.xyz, luma );',
            '\tvec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );',
            '\tfloat alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );',
            '\tgl_FragColor = mix( outputColor, texel, alpha );',
            '}'
        ].join('\n')
    };
    return threex.shaders.LuminosityHighPassShader = LuminosityHighPassShader;
});