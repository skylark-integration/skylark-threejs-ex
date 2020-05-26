/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,r){"use strict";var n={defines:{KERNEL_SIZE_FLOAT:"25.0",KERNEL_SIZE_INT:"25"},uniforms:{tDiffuse:{value:null},uImageIncrement:{value:new e.Vector2(.001953125,0)},cKernel:{value:[]}},vertexShader:["uniform vec2 uImageIncrement;","varying vec2 vUv;","void main() {","\tvUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float cKernel[ KERNEL_SIZE_INT ];","uniform sampler2D tDiffuse;","uniform vec2 uImageIncrement;","varying vec2 vUv;","void main() {","\tvec2 imageCoord = vUv;","\tvec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );","\tfor( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {","\t\tsum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];","\t\timageCoord += uImageIncrement;","\t}","\tgl_FragColor = sum;","}"].join("\n"),buildKernel:function(e){function r(e,r){return Math.exp(-e*e/(2*r*r))}var n,t,i,o,a=2*Math.ceil(3*e)+1;for(a>25&&(a=25),o=.5*(a-1),t=new Array(a),i=0,n=0;n<a;++n)t[n]=r(n-o,e),i+=t[n];for(n=0;n<a;++n)t[n]/=i;return t}};return r.shaders.ConvolutionShader=n});
//# sourceMappingURL=../sourcemaps/shaders/ConvolutionShader.js.map
