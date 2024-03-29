define([
    "../threex"
],function (threex) {
    'use strict';
    var ToneMapShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'averageLuminance': { value: 1 },
            'luminanceMap': { value: null },
            'maxLuminance': { value: 16 },
            'minLuminance': { value: 0.01 },
            'middleGrey': { value: 0.6 }
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
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'uniform float middleGrey;',
            'uniform float minLuminance;',
            'uniform float maxLuminance;',
            '#ifdef ADAPTED_LUMINANCE',
            '\tuniform sampler2D luminanceMap;',
            '#else',
            '\tuniform float averageLuminance;',
            '#endif',
            'vec3 ToneMap( vec3 vColor ) {',
            '\t#ifdef ADAPTED_LUMINANCE',
            '\t\tfloat fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;',
            '\t#else',
            '\t\tfloat fLumAvg = averageLuminance;',
            '\t#endif',
            '\tfloat fLumPixel = linearToRelativeLuminance( vColor );',
            '\tfloat fLumScaled = (fLumPixel * middleGrey) / max( minLuminance, fLumAvg );',
            '\tfloat fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);',
            '\treturn fLumCompressed * vColor;',
            '}',
            'void main() {',
            '\tvec4 texel = texture2D( tDiffuse, vUv );',
            '\tgl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );',
            '}'
        ].join('\n')
    };
    return  threex.shaders.ToneMapShader = ToneMapShader;
});