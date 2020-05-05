define(function () {
    'use strict';
    var BasicShader = {
        uniforms: {},
        vertexShader: [
            'void main() {',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'void main() {',
            '\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );',
            '}'
        ].join('\n')
    };
    return  BasicShader ;
});