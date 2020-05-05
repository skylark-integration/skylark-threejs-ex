define(function () {
    'use strict';
    var HorizontalBlurShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'h': { value: 1 / 512 }
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
            'uniform float h;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 sum = vec4( 0.0 );',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;',
            '\tsum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;',
            '\tgl_FragColor = sum;',
            '}'
        ].join('\n')
    };
    return  HorizontalBlurShader ;
});