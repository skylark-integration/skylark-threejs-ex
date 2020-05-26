/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(i){"use strict";var e={uniforms:{},vertexShader:["void main() {","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["void main() {","\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );","}"].join("\n")};return i.shaders.BasicShader=e});
//# sourceMappingURL=../sourcemaps/shaders/BasicShader.js.map
