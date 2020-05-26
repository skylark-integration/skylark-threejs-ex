/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var r={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDepth;","uniform float cameraNear;","uniform float cameraFar;","varying vec2 vUv;","#include <packing>","float getLinearDepth( const in vec2 screenPosition ) {","\t#if PERSPECTIVE_CAMERA == 1","\t\tfloat fragCoordZ = texture2D( tDepth, screenPosition ).x;","\t\tfloat viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );","\t\treturn viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );","\t#else","\t\treturn texture2D( depthSampler, coord ).x;","\t#endif","}","void main() {","\tfloat depth = getLinearDepth( vUv );","\tgl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );","}"].join("\n")};return t.shaders.SSAODepthShader=r});
//# sourceMappingURL=../sourcemaps/shaders/SSAODepthShader.js.map
