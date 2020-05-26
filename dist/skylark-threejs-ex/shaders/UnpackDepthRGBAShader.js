/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(e){"use strict";var i={uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float opacity;","uniform sampler2D tDiffuse;","varying vec2 vUv;","#include <packing>","void main() {","\tfloat depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );","\tgl_FragColor = vec4( vec3( depth ), opacity );","}"].join("\n")};return e.shaders.UnpackDepthRGBAShader=i});
//# sourceMappingURL=../sourcemaps/shaders/UnpackDepthRGBAShader.js.map
