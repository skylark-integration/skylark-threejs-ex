define([
    "../threex"
],function (threex) {
    'use strict';
    var TechnicolorShader = {
        uniforms: { 'tDiffuse': { value: null } },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );',
            '\tvec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);',
            '\tgl_FragColor = newTex;',
            '}'
        ].join('\n')
    };
    return  threex.shaders.TechnicolorShader = TechnicolorShader;
});