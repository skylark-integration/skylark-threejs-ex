define([
    "../threex"
],function (threex) {
    'use strict';
    var FilmShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'time': { value: 0 },
            'nIntensity': { value: 0.5 },
            'sIntensity': { value: 0.05 },
            'sCount': { value: 4096 },
            'grayscale': { value: 1 }
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
            'uniform float time;',
            'uniform bool grayscale;',
            'uniform float nIntensity;',
            'uniform float sIntensity;',
            'uniform float sCount;',
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 cTextureScreen = texture2D( tDiffuse, vUv );',
            '\tfloat dx = rand( vUv + time );',
            '\tvec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );',
            '\tvec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );',
            '\tcResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;',
            '\tcResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );',
            '\tif( grayscale ) {',
            '\t\tcResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );',
            '\t}',
            '\tgl_FragColor =  vec4( cResult, cTextureScreen.a );',
            '}'
        ].join('\n')
    };
    return  threex.shaders.FilmShader = FilmShader;
});