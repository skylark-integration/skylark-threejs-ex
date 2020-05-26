/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(v){"use strict";var e={uniforms:{tDiffuse:{value:null},h:{value:1/512},r:{value:.35}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform float h;","uniform float r;","varying vec2 vUv;","void main() {","\tvec4 sum = vec4( 0.0 );","\tfloat hh = h * abs( r - vUv.y );","\tsum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;","\tsum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;","\tsum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;","\tsum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;","\tsum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;","\tsum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;","\tsum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;","\tsum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;","\tsum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;","\tgl_FragColor = sum;","}"].join("\n")};return v.shaders.HorizontalTiltShiftShader=e});
//# sourceMappingURL=../sourcemaps/shaders/HorizontalTiltShiftShader.js.map
