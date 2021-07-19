define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    var LensflareElement = function (texture, size, distance, color) {
        this.texture = texture;
        this.size = size || 1;
        this.distance = distance || 0;
        this.color = color || new THREE.Color(16777215);
    };
    LensflareElement.Shader = {
        uniforms: {
            'map': { value: null },
            'occlusionMap': { value: null },
            'color': { value: null },
            'scale': { value: null },
            'screenPosition': { value: null }
        },
        vertexShader: [
            'precision highp float;',
            'uniform vec3 screenPosition;',
            'uniform vec2 scale;',
            'uniform sampler2D occlusionMap;',
            'attribute vec3 position;',
            'attribute vec2 uv;',
            'varying vec2 vUV;',
            'varying float vVisibility;',
            'void main() {',
            '\tvUV = uv;',
            '\tvec2 pos = position.xy;',
            '\tvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );',
            '\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );',
            '\tvVisibility =        visibility.r / 9.0;',
            '\tvVisibility *= 1.0 - visibility.g / 9.0;',
            '\tvVisibility *=       visibility.b / 9.0;',
            '\tgl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'precision highp float;',
            'uniform sampler2D map;',
            'uniform vec3 color;',
            'varying vec2 vUV;',
            'varying float vVisibility;',
            'void main() {',
            '\tvec4 texture = texture2D( map, vUV );',
            '\ttexture.a *= vVisibility;',
            '\tgl_FragColor = texture;',
            '\tgl_FragColor.rgb *= color;',
            '}'
        ].join('\n')
    };


    return  threex.objects.LensflareElement = LensflareElement;
});