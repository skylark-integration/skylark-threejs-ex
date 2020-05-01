/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(i){return i.MirrorShader={uniforms:{tDiffuse:{value:null},side:{value:1}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform int side;","varying vec2 vUv;","void main() {","\tvec2 p = vUv;","\tif (side == 0){","\t\tif (p.x > 0.5) p.x = 1.0 - p.x;","\t}else if (side == 1){","\t\tif (p.x < 0.5) p.x = 1.0 - p.x;","\t}else if (side == 2){","\t\tif (p.y < 0.5) p.y = 1.0 - p.y;","\t}else if (side == 3){","\t\tif (p.y > 0.5) p.y = 1.0 - p.y;","\t} ","\tvec4 color = texture2D(tDiffuse, p);","\tgl_FragColor = color;","}"].join("\n")},i.MirrorShader});
//# sourceMappingURL=../sourcemaps/shaders/MirrorShader.js.map
