/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return{uniforms:{tDiffuse:{value:null},hue:{value:0},saturation:{value:0}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = uv;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform float hue;","uniform float saturation;","varying vec2 vUv;","void main() {","\tgl_FragColor = texture2D( tDiffuse, vUv );","\tfloat angle = hue * 3.14159265;","\tfloat s = sin(angle), c = cos(angle);","\tvec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;","\tfloat len = length(gl_FragColor.rgb);","\tgl_FragColor.rgb = vec3(","\t\tdot(gl_FragColor.rgb, weights.xyz),","\t\tdot(gl_FragColor.rgb, weights.zxy),","\t\tdot(gl_FragColor.rgb, weights.yzx)","\t);","\tfloat average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;","\tif (saturation > 0.0) {","\t\tgl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));","\t} else {","\t\tgl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);","\t}","}"].join("\n")}});
//# sourceMappingURL=../sourcemaps/shaders/HueSaturationShader.js.map
