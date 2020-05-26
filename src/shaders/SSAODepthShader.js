define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';

    var SSAODepthShader = {
        defines: { 'PERSPECTIVE_CAMERA': 1 },
        uniforms: {
            'tDepth': { value: null },
            'cameraNear': { value: null },
            'cameraFar': { value: null }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDepth;',
            'uniform float cameraNear;',
            'uniform float cameraFar;',
            'varying vec2 vUv;',
            '#include <packing>',
            'float getLinearDepth( const in vec2 screenPosition ) {',
            '\t#if PERSPECTIVE_CAMERA == 1',
            '\t\tfloat fragCoordZ = texture2D( tDepth, screenPosition ).x;',
            '\t\tfloat viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );',
            '\t\treturn viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );',
            '\t#else',
            '\t\treturn texture2D( depthSampler, coord ).x;',
            '\t#endif',
            '}',
            'void main() {',
            '\tfloat depth = getLinearDepth( vUv );',
            '\tgl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );',
            '}'
        ].join('\n')
    };
    return threex.shaders.SSAODepthShader = SSAODepthShader;
});