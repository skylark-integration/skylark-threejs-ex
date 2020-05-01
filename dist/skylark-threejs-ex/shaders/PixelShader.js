/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.PixelShader={uniforms:{tDiffuse:{value:null},resolution:{value:null},pixelSize:{value:1}},vertexShader:["varying highp vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform float pixelSize;","uniform vec2 resolution;","varying highp vec2 vUv;","void main(){","vec2 dxy = pixelSize / resolution;","vec2 coord = dxy * floor( vUv / dxy );","gl_FragColor = texture2D(tDiffuse, coord);","}"].join("\n")},e.PixelShader});
//# sourceMappingURL=../sourcemaps/shaders/PixelShader.js.map
