define(["skylark-threejs"], function (THREE) {
    'use strict';
    var DepthLimitedBlurShader = {
        defines: {
            'KERNEL_RADIUS': 4,
            'DEPTH_PACKING': 1,
            'PERSPECTIVE_CAMERA': 1
        },
        uniforms: {
            'tDiffuse': { value: null },
            'size': { value: new THREE.Vector2(512, 512) },
            'sampleUvOffsets': { value: [new THREE.Vector2(0, 0)] },
            'sampleWeights': { value: [1] },
            'tDepth': { value: null },
            'cameraNear': { value: 10 },
            'cameraFar': { value: 1000 },
            'depthCutoff': { value: 10 }
        },
        vertexShader: [
            '#include <common>',
            'uniform vec2 size;',
            'varying vec2 vUv;',
            'varying vec2 vInvSize;',
            'void main() {',
            '\tvUv = uv;',
            '\tvInvSize = 1.0 / size;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#include <common>',
            '#include <packing>',
            'uniform sampler2D tDiffuse;',
            'uniform sampler2D tDepth;',
            'uniform float cameraNear;',
            'uniform float cameraFar;',
            'uniform float depthCutoff;',
            'uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];',
            'uniform float sampleWeights[ KERNEL_RADIUS + 1 ];',
            'varying vec2 vUv;',
            'varying vec2 vInvSize;',
            'float getDepth( const in vec2 screenPosition ) {',
            '\t#if DEPTH_PACKING == 1',
            '\treturn unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );',
            '\t#else',
            '\treturn texture2D( tDepth, screenPosition ).x;',
            '\t#endif',
            '}',
            'float getViewZ( const in float depth ) {',
            '\t#if PERSPECTIVE_CAMERA == 1',
            '\treturn perspectiveDepthToViewZ( depth, cameraNear, cameraFar );',
            '\t#else',
            '\treturn orthographicDepthToViewZ( depth, cameraNear, cameraFar );',
            '\t#endif',
            '}',
            'void main() {',
            '\tfloat depth = getDepth( vUv );',
            '\tif( depth >= ( 1.0 - EPSILON ) ) {',
            '\t\tdiscard;',
            '\t}',
            '\tfloat centerViewZ = -getViewZ( depth );',
            '\tbool rBreak = false, lBreak = false;',
            '\tfloat weightSum = sampleWeights[0];',
            '\tvec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;',
            '\tfor( int i = 1; i <= KERNEL_RADIUS; i ++ ) {',
            '\t\tfloat sampleWeight = sampleWeights[i];',
            '\t\tvec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;',
            '\t\tvec2 sampleUv = vUv + sampleUvOffset;',
            '\t\tfloat viewZ = -getViewZ( getDepth( sampleUv ) );',
            '\t\tif( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;',
            '\t\tif( ! rBreak ) {',
            '\t\t\tdiffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;',
            '\t\t\tweightSum += sampleWeight;',
            '\t\t}',
            '\t\tsampleUv = vUv - sampleUvOffset;',
            '\t\tviewZ = -getViewZ( getDepth( sampleUv ) );',
            '\t\tif( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;',
            '\t\tif( ! lBreak ) {',
            '\t\t\tdiffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;',
            '\t\t\tweightSum += sampleWeight;',
            '\t\t}',
            '\t}',
            '\tgl_FragColor = diffuseSum / weightSum;',
            '}'
        ].join('\n')
    };
    var BlurShaderUtils = DepthLimitedBlurShader.BlurShaderUtils = {
        createSampleWeights: function (kernelRadius, stdDev) {
            var gaussian = function (x, stdDev) {
                return Math.exp(-(x * x) / (2 * (stdDev * stdDev))) / (Math.sqrt(2 * Math.PI) * stdDev);
            };
            var weights = [];
            for (var i = 0; i <= kernelRadius; i++) {
                weights.push(gaussian(i, stdDev));
            }
            return weights;
        },
        createSampleOffsets: function (kernelRadius, uvIncrement) {
            var offsets = [];
            for (var i = 0; i <= kernelRadius; i++) {
                offsets.push(uvIncrement.clone().multiplyScalar(i));
            }
            return offsets;
        },
        configure: function (material, kernelRadius, stdDev, uvIncrement) {
            material.defines['KERNEL_RADIUS'] = kernelRadius;
            material.uniforms['sampleUvOffsets'].value = BlurShaderUtils.createSampleOffsets(kernelRadius, uvIncrement);
            material.uniforms['sampleWeights'].value = BlurShaderUtils.createSampleWeights(kernelRadius, stdDev);
            material.needsUpdate = true;
        }
    };

    return DepthLimitedBlurShader;
    
});