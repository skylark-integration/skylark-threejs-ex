/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var r={uniforms:{tDiffuse:{value:null},tSize:{value:new e.Vector2(256,256)},center:{value:new e.Vector2(.5,.5)},angle:{value:1.57},scale:{value:1}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform vec2 center;","uniform float angle;","uniform float scale;","uniform vec2 tSize;","uniform sampler2D tDiffuse;","varying vec2 vUv;","float pattern() {","\tfloat s = sin( angle ), c = cos( angle );","\tvec2 tex = vUv * tSize - center;","\tvec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;","\treturn ( sin( point.x ) * sin( point.y ) ) * 4.0;","}","void main() {","\tvec4 color = texture2D( tDiffuse, vUv );","\tfloat average = ( color.r + color.g + color.b ) / 3.0;","\tgl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );","}"].join("\n")};return t.shaders.DotScreenShader=r});
//# sourceMappingURL=../sourcemaps/shaders/DotScreenShader.js.map
