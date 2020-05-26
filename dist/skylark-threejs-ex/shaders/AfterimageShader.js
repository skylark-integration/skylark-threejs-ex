/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(e){"use strict";var t={uniforms:{damp:{value:.96},tOld:{value:null},tNew:{value:null}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float damp;","uniform sampler2D tOld;","uniform sampler2D tNew;","varying vec2 vUv;","vec4 when_gt( vec4 x, float y ) {","\treturn max( sign( x - y ), 0.0 );","}","void main() {","\tvec4 texelOld = texture2D( tOld, vUv );","\tvec4 texelNew = texture2D( tNew, vUv );","\ttexelOld *= damp * when_gt( texelOld, 0.1 );","\tgl_FragColor = max(texelNew, texelOld);","}"].join("\n")};return e.shaders.AfterimageShader=t});
//# sourceMappingURL=../sourcemaps/shaders/AfterimageShader.js.map
