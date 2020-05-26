/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(o){"use strict";var t={uniforms:{tDiffuse:{value:null},amount:{value:1}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float amount;","uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","\tvec4 color = texture2D( tDiffuse, vUv );","\tvec3 c = color.rgb;","\tcolor.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );","\tcolor.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );","\tcolor.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );","\tgl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );","}"].join("\n")};return o.shaders.SepiaShader=t});
//# sourceMappingURL=../sourcemaps/shaders/SepiaShader.js.map
