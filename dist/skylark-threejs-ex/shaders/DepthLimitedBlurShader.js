/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.DepthLimitedBlurShader={defines:{KERNEL_RADIUS:4,DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tDiffuse:{value:null},size:{value:new e.Vector2(512,512)},sampleUvOffsets:{value:[new e.Vector2(0,0)]},sampleWeights:{value:[1]},tDepth:{value:null},cameraNear:{value:10},cameraFar:{value:1e3},depthCutoff:{value:10}},vertexShader:["#include <common>","uniform vec2 size;","varying vec2 vUv;","varying vec2 vInvSize;","void main() {","\tvUv = uv;","\tvInvSize = 1.0 / size;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["#include <common>","#include <packing>","uniform sampler2D tDiffuse;","uniform sampler2D tDepth;","uniform float cameraNear;","uniform float cameraFar;","uniform float depthCutoff;","uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];","uniform float sampleWeights[ KERNEL_RADIUS + 1 ];","varying vec2 vUv;","varying vec2 vInvSize;","float getDepth( const in vec2 screenPosition ) {","\t#if DEPTH_PACKING == 1","\treturn unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );","\t#else","\treturn texture2D( tDepth, screenPosition ).x;","\t#endif","}","float getViewZ( const in float depth ) {","\t#if PERSPECTIVE_CAMERA == 1","\treturn perspectiveDepthToViewZ( depth, cameraNear, cameraFar );","\t#else","\treturn orthographicDepthToViewZ( depth, cameraNear, cameraFar );","\t#endif","}","void main() {","\tfloat depth = getDepth( vUv );","\tif( depth >= ( 1.0 - EPSILON ) ) {","\t\tdiscard;","\t}","\tfloat centerViewZ = -getViewZ( depth );","\tbool rBreak = false, lBreak = false;","\tfloat weightSum = sampleWeights[0];","\tvec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;","\tfor( int i = 1; i <= KERNEL_RADIUS; i ++ ) {","\t\tfloat sampleWeight = sampleWeights[i];","\t\tvec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;","\t\tvec2 sampleUv = vUv + sampleUvOffset;","\t\tfloat viewZ = -getViewZ( getDepth( sampleUv ) );","\t\tif( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;","\t\tif( ! rBreak ) {","\t\t\tdiffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;","\t\t\tweightSum += sampleWeight;","\t\t}","\t\tsampleUv = vUv - sampleUvOffset;","\t\tviewZ = -getViewZ( getDepth( sampleUv ) );","\t\tif( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;","\t\tif( ! lBreak ) {","\t\t\tdiffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;","\t\t\tweightSum += sampleWeight;","\t\t}","\t}","\tgl_FragColor = diffuseSum / weightSum;","}"].join("\n")},e.BlurShaderUtils={createSampleWeights:function(e,t){for(var i=function(e,t){return Math.exp(-e*e/(t*t*2))/(Math.sqrt(2*Math.PI)*t)},a=[],r=0;r<=e;r++)a.push(i(r,t));return a},createSampleOffsets:function(e,t){for(var i=[],a=0;a<=e;a++)i.push(t.clone().multiplyScalar(a));return i},configure:function(t,i,a,r){t.defines.KERNEL_RADIUS=i,t.uniforms.sampleUvOffsets.value=e.BlurShaderUtils.createSampleOffsets(i,r),t.uniforms.sampleWeights.value=e.BlurShaderUtils.createSampleWeights(i,a),t.needsUpdate=!0}},e.DepthLimitedBlurShader});
//# sourceMappingURL=../sourcemaps/shaders/DepthLimitedBlurShader.js.map
