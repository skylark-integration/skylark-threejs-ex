/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return{uniforms:{tDiffuse:{value:null}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","\tvec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );","\tvec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);","\tgl_FragColor = newTex;","}"].join("\n")}});
//# sourceMappingURL=../sourcemaps/shaders/TechnicolorShader.js.map
