define([
    "../threex"
],function (threex) {
    'use strict';
    var AfterimageShader = {
        uniforms: {
            'damp': { value: 0.96 },
            'tOld': { value: null },
            'tNew': { value: null }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float damp;',
            'uniform sampler2D tOld;',
            'uniform sampler2D tNew;',
            'varying vec2 vUv;',
            'vec4 when_gt( vec4 x, float y ) {',
            '\treturn max( sign( x - y ), 0.0 );',
            '}',
            'void main() {',
            '\tvec4 texelOld = texture2D( tOld, vUv );',
            '\tvec4 texelNew = texture2D( tNew, vUv );',
            '\ttexelOld *= damp * when_gt( texelOld, 0.1 );',
            '\tgl_FragColor = max(texelNew, texelOld);',
            '}'
        ].join('\n')
    };
    return threex.shaders.AfterimageShader = AfterimageShader;
});