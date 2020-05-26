/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var i={uniforms:{tDiffuse:{value:null},resolution:{value:new e.Vector2}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform vec2 resolution;","varying vec2 vUv;","void main() {","\tvec2 texelSize = ( 1.0 / resolution );","\tfloat result = 0.0;","\tfor ( int i = - 2; i <= 2; i ++ ) {","\t\tfor ( int j = - 2; j <= 2; j ++ ) {","\t\t\tvec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;","\t\t\tresult += texture2D( tDiffuse, vUv + offset ).r;","\t\t}","\t}","\tgl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );","}"].join("\n")};return t.shaders.SSAOBlurShader=i});
//# sourceMappingURL=../sourcemaps/shaders/SSAOBlurShader.js.map
