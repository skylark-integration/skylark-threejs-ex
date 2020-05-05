define(["skylark-threejs"], function (a) {
    'use strict';
    var SSAOShader = {
        defines: {
            'PERSPECTIVE_CAMERA': 1,
            'KERNEL_SIZE': 32
        },
        uniforms: {
            'tDiffuse': { value: null },
            'tNormal': { value: null },
            'tDepth': { value: null },
            'tNoise': { value: null },
            'kernel': { value: null },
            'cameraNear': { value: null },
            'cameraFar': { value: null },
            'resolution': { value: new a.Vector2() },
            'cameraProjectionMatrix': { value: new a.Matrix4() },
            'cameraInverseProjectionMatrix': { value: new a.Matrix4() },
            'kernelRadius': { value: 8 },
            'minDistance': { value: 0.005 },
            'maxDistance': { value: 0.05 }
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
            'uniform sampler2D tNormal;',
            'uniform sampler2D tDepth;',
            'uniform sampler2D tNoise;',
            'uniform vec3 kernel[ KERNEL_SIZE ];',
            'uniform vec2 resolution;',
            'uniform float cameraNear;',
            'uniform float cameraFar;',
            'uniform mat4 cameraProjectionMatrix;',
            'uniform mat4 cameraInverseProjectionMatrix;',
            'uniform float kernelRadius;',
            'uniform float minDistance;',
            'uniform float maxDistance;',
            'varying vec2 vUv;',
            '#include <packing>',
            'float getDepth( const in vec2 screenPosition ) {',
            '\treturn texture2D( tDepth, screenPosition ).x;',
            '}',
            'float getLinearDepth( const in vec2 screenPosition ) {',
            '\t#if PERSPECTIVE_CAMERA == 1',
            '\t\tfloat fragCoordZ = texture2D( tDepth, screenPosition ).x;',
            '\t\tfloat viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );',
            '\t\treturn viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );',
            '\t#else',
            '\t\treturn texture2D( depthSampler, coord ).x;',
            '\t#endif',
            '}',
            'float getViewZ( const in float depth ) {',
            '\t#if PERSPECTIVE_CAMERA == 1',
            '\t\treturn perspectiveDepthToViewZ( depth, cameraNear, cameraFar );',
            '\t#else',
            '\t\treturn orthographicDepthToViewZ( depth, cameraNear, cameraFar );',
            '\t#endif',
            '}',
            'vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {',
            '\tfloat clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];',
            '\tvec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );',
            '\tclipPosition *= clipW; // unprojection.',
            '\treturn ( cameraInverseProjectionMatrix * clipPosition ).xyz;',
            '}',
            'vec3 getViewNormal( const in vec2 screenPosition ) {',
            '\treturn unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );',
            '}',
            'void main() {',
            '\tfloat depth = getDepth( vUv );',
            '\tfloat viewZ = getViewZ( depth );',
            '\tvec3 viewPosition = getViewPosition( vUv, depth, viewZ );',
            '\tvec3 viewNormal = getViewNormal( vUv );',
            ' vec2 noiseScale = vec2( resolution.x / 4.0, resolution.y / 4.0 );',
            '\tvec3 random = texture2D( tNoise, vUv * noiseScale ).xyz;',
            '\tvec3 tangent = normalize( random - viewNormal * dot( random, viewNormal ) );',
            '\tvec3 bitangent = cross( viewNormal, tangent );',
            '\tmat3 kernelMatrix = mat3( tangent, bitangent, viewNormal );',
            ' float occlusion = 0.0;',
            ' for ( int i = 0; i < KERNEL_SIZE; i ++ ) {',
            '\t\tvec3 sampleVector = kernelMatrix * kernel[ i ];',
            '\t\tvec3 samplePoint = viewPosition + ( sampleVector * kernelRadius );',
            '\t\tvec4 samplePointNDC = cameraProjectionMatrix * vec4( samplePoint, 1.0 );',
            '\t\tsamplePointNDC /= samplePointNDC.w;',
            '\t\tvec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5;',
            '\t\tfloat realDepth = getLinearDepth( samplePointUv );',
            '\t\tfloat sampleDepth = viewZToOrthographicDepth( samplePoint.z, cameraNear, cameraFar );',
            '\t\tfloat delta = sampleDepth - realDepth;',
            '\t\tif ( delta > minDistance && delta < maxDistance ) {',
            '\t\t\tocclusion += 1.0;',
            '\t\t}',
            '\t}',
            '\tocclusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );',
            '\tgl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );',
            '}'
        ].join('\n')
    };
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
    var SSAOBlurShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'resolution': { value: new a.Vector2() }
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
            '\tvec2 texelSize = ( 1.0 / resolution );',
            '\tfloat result = 0.0;',
            '\tfor ( int i = - 2; i <= 2; i ++ ) {',
            '\t\tfor ( int j = - 2; j <= 2; j ++ ) {',
            '\t\t\tvec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;',
            '\t\t\tresult += texture2D( tDiffuse, vUv + offset ).r;',
            '\t\t}',
            '\t}',
            '\tgl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );',
            '}'
        ].join('\n')
    };
    return {
        SSAOShader,
        SSAODepthShader,
        SSAOBlurShader
    };
});