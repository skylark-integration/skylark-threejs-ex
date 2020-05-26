/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,r){"use strict";var o={uniforms:{tDiffuse:{value:null},color:{value:new e.Color(16777215)}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform vec3 color;","uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","\tvec4 texel = texture2D( tDiffuse, vUv );","\tvec3 luma = vec3( 0.299, 0.587, 0.114 );","\tfloat v = dot( texel.xyz, luma );","\tgl_FragColor = vec4( v * color, texel.w );","}"].join("\n")};return r.shaders.ColorifyShader=o});
//# sourceMappingURL=../sourcemaps/shaders/ColorifyShader.js.map
