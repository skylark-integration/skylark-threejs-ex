/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";return{uniforms:{heightMap:{value:null},resolution:{value:new e.Vector2(512,512)},scale:{value:new e.Vector2(1,1)},height:{value:.05}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float height;","uniform vec2 resolution;","uniform sampler2D heightMap;","varying vec2 vUv;","void main() {","\tfloat val = texture2D( heightMap, vUv ).x;","\tfloat valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;","\tfloat valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;","\tgl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );","}"].join("\n")}});
//# sourceMappingURL=../sourcemaps/shaders/NormalMapShader.js.map
