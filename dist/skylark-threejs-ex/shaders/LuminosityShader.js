/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.LuminosityShader={uniforms:{tDiffuse:{value:null}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["#include <common>","uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","\tvec4 texel = texture2D( tDiffuse, vUv );","\tfloat l = linearToRelativeLuminance( texel.rgb );","\tgl_FragColor = vec4( l, l, l, texel.w );","}"].join("\n")},e.LuminosityShader});
//# sourceMappingURL=../sourcemaps/shaders/LuminosityShader.js.map
