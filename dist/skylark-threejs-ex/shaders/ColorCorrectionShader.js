/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,r){"use strict";var o={uniforms:{tDiffuse:{value:null},powRGB:{value:new e.Vector3(2,2,2)},mulRGB:{value:new e.Vector3(1,1,1)},addRGB:{value:new e.Vector3(0,0,0)}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform vec3 powRGB;","uniform vec3 mulRGB;","uniform vec3 addRGB;","varying vec2 vUv;","void main() {","\tgl_FragColor = texture2D( tDiffuse, vUv );","\tgl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );","}"].join("\n")};return r.shaders.ColorCorrectionShader=o});
//# sourceMappingURL=../sourcemaps/shaders/ColorCorrectionShader.js.map
