/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.VignetteShader={uniforms:{tDiffuse:{value:null},offset:{value:1},darkness:{value:1}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float offset;","uniform float darkness;","uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","\tvec4 texel = texture2D( tDiffuse, vUv );","\tvec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );","\tgl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );","}"].join("\n")},e.VignetteShader});
//# sourceMappingURL=../sourcemaps/shaders/VignetteShader.js.map
