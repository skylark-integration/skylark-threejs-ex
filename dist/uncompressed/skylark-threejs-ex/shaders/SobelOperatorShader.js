define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var SobelOperatorShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'resolution': { value: new THREE.Vector2() }
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
            'uniform vec2 resolution;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );',
            '\tconst mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );',
            '\tconst mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );',
            '\tfloat tx0y0 = texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) ).r;',
            '\tfloat tx0y1 = texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) ).r;',
            '\tfloat tx0y2 = texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) ).r;',
            '\tfloat tx1y0 = texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) ).r;',
            '\tfloat tx1y1 = texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).r;',
            '\tfloat tx1y2 = texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) ).r;',
            '\tfloat tx2y0 = texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) ).r;',
            '\tfloat tx2y1 = texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) ).r;',
            '\tfloat tx2y2 = texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) ).r;',
            '\tfloat valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 + ',
            '\t\tGx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 + ',
            '\t\tGx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2; ',
            '\tfloat valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 + ',
            '\t\tGy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 + ',
            '\t\tGy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2; ',
            '\tfloat G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );',
            '\tgl_FragColor = vec4( vec3( G ), 1 );',
            '}'
        ].join('\n')
    };
    return  threex.shaders.SobelOperatorShader = SobelOperatorShader;
});