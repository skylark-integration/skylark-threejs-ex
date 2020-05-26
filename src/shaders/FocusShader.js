define([
    "../threex"
],function (threex) {
    'use strict';
    var FocusShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'screenWidth': { value: 1024 },
            'screenHeight': { value: 1024 },
            'sampleDistance': { value: 0.94 },
            'waveFactor': { value: 0.00125 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float screenWidth;',
            'uniform float screenHeight;',
            'uniform float sampleDistance;',
            'uniform float waveFactor;',
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec4 color, org, tmp, add;',
            '\tfloat sample_dist, f;',
            '\tvec2 vin;',
            '\tvec2 uv = vUv;',
            '\tadd = color = org = texture2D( tDiffuse, uv );',
            '\tvin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );',
            '\tsample_dist = dot( vin, vin ) * 2.0;',
            '\tf = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;',
            '\tvec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );',
            '\tadd += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );',
            '\tif( tmp.b < color.b ) color = tmp;',
            '\tadd += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );',
            '\tif( tmp.b < color.b ) color = tmp;',
            '\tadd += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );',
            '\tif( tmp.b < color.b ) color = tmp;',
            '\tadd += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );',
            '\tif( tmp.b < color.b ) color = tmp;',
            '\tadd += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );',
            '\tif( tmp.b < color.b ) color = tmp;',
            '\tadd += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );',
            '\tif( tmp.b < color.b ) color = tmp;',
            '\tadd += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );',
            '\tif( tmp.b < color.b ) color = tmp;',
            '\tcolor = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );',
            '\tcolor = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );',
            '\tgl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );',
            '}'
        ].join('\n')
    };
    return threex.shaders.FocusShader = FocusShader;
});