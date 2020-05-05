/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";return function(r){var t=new e.OrthographicCamera(-1,1,1,-1,0,1),a=new e.Scene,n=new e.StereoCamera,i={minFilter:e.LinearFilter,magFilter:e.NearestFilter,format:e.RGBAFormat},o=new e.WebGLRenderTarget(512,512,i),l=new e.WebGLRenderTarget(512,512,i),v=new e.ShaderMaterial({uniforms:{mapLeft:{value:o.texture},mapRight:{value:l.texture}},vertexShader:["varying vec2 vUv;","void main() {","\tvUv = vec2( uv.x, uv.y );","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D mapLeft;","uniform sampler2D mapRight;","varying vec2 vUv;","void main() {","\tvec2 uv = vUv;","\tif ( ( mod( gl_FragCoord.y, 2.0 ) ) > 1.00 ) {","\t\tgl_FragColor = texture2D( mapLeft, uv );","\t} else {","\t\tgl_FragColor = texture2D( mapRight, uv );","\t}","}"].join("\n")}),u=new e.Mesh(new e.PlaneBufferGeometry(2,2),v);a.add(u),this.setSize=function(e,t){r.setSize(e,t);var a=r.getPixelRatio();o.setSize(e*a,t*a),l.setSize(e*a,t*a)},this.render=function(e,i){e.updateMatrixWorld(),null===i.parent&&i.updateMatrixWorld(),n.update(i),r.setRenderTarget(o),r.clear(),r.render(e,n.cameraL),r.setRenderTarget(l),r.clear(),r.render(e,n.cameraR),r.setRenderTarget(null),r.render(a,t)}}});
//# sourceMappingURL=../sourcemaps/effects/ParallaxBarrierEffect.js.map
