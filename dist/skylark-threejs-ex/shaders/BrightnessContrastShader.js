/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return{uniforms:{tDiffuse:{value:null},brightness:{value:0},contrast:{value:0}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform float brightness;","uniform float contrast;","varying vec2 vUv;","void main() {","\tgl_FragColor = texture2D( tDiffuse, vUv );","\tgl_FragColor.rgb += brightness;","\tif (contrast > 0.0) {","\t\tgl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;","\t} else {","\t\tgl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;","\t}","}"].join("\n")}});
//# sourceMappingURL=../sourcemaps/shaders/BrightnessContrastShader.js.map
