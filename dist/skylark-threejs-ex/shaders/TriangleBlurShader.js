/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){return t.TriangleBlurShader={uniforms:{texture:{value:null},delta:{value:new t.Vector2(1,1)}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["#include <common>","#define ITERATIONS 10.0","uniform sampler2D texture;","uniform vec2 delta;","varying vec2 vUv;","void main() {","\tvec4 color = vec4( 0.0 );","\tfloat total = 0.0;","\tfloat offset = rand( vUv );","\tfor ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {","\t\tfloat percent = ( t + offset - 0.5 ) / ITERATIONS;","\t\tfloat weight = 1.0 - abs( percent );","\t\tcolor += texture2D( texture, vUv + delta * percent ) * weight;","\t\ttotal += weight;","\t}","\tgl_FragColor = color / total;","}"].join("\n")},t.TriangleBlurShader});
//# sourceMappingURL=../sourcemaps/shaders/TriangleBlurShader.js.map
