/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(i){return i.BasicShader={uniforms:{},vertexShader:["void main() {","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["void main() {","\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );","}"].join("\n")},i.BasicShader});
//# sourceMappingURL=../sourcemaps/shaders/BasicShader.js.map
