/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(e){"use strict";var t={uniforms:{tDiffuse:{value:null},amount:{value:.005},angle:{value:0}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform float amount;","uniform float angle;","varying vec2 vUv;","void main() {","\tvec2 offset = amount * vec2( cos(angle), sin(angle));","\tvec4 cr = texture2D(tDiffuse, vUv + offset);","\tvec4 cga = texture2D(tDiffuse, vUv);","\tvec4 cb = texture2D(tDiffuse, vUv - offset);","\tgl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);","}"].join("\n")};return e.shaders.RGBShiftShader=t});
//# sourceMappingURL=../sourcemaps/shaders/RGBShiftShader.js.map
