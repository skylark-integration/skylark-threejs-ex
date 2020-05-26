/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./Pass","../shaders/HalftoneShader"],function(e,r,t,s){"use strict";var i=function(r,i,a){for(var n in t.call(this),void 0===s&&console.error("THREE.HalftonePass requires HalftoneShader"),this.uniforms=e.UniformsUtils.clone(s.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,fragmentShader:s.fragmentShader,vertexShader:s.vertexShader}),this.uniforms.width.value=r,this.uniforms.height.value=i,a)a.hasOwnProperty(n)&&this.uniforms.hasOwnProperty(n)&&(this.uniforms[n].value=a[n]);this.fsQuad=new t.FullScreenQuad(this.material)};return i.prototype=Object.assign(Object.create(t.prototype),{constructor:i,render:function(e,r,t){this.material.uniforms.tDiffuse.value=t.texture,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))},setSize:function(e,r){this.uniforms.width.value=e,this.uniforms.height.value=r}}),r.postprocessing.HalftonePass=i});
//# sourceMappingURL=../sourcemaps/postprocessing/HalftonePass.js.map
