/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","../postprocessing/Pass","../shaders/CopyShader"],function(e,t,r,s){"use strict";var a=function(t,a){r.call(this),void 0===s&&console.error("TexturePass relies on CopyShader");var i=s;this.map=t,this.opacity=void 0!==a?a:1,this.uniforms=e.UniformsUtils.clone(i.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,depthTest:!1,depthWrite:!1}),this.needsSwap=!1,this.fsQuad=new r.FullScreenQuad(null)};return a.prototype=Object.assign(Object.create(r.prototype),{constructor:a,render:function(e,t,r){var s=e.autoClear;e.autoClear=!1,this.fsQuad.material=this.material,this.uniforms.opacity.value=this.opacity,this.uniforms.tDiffuse.value=this.map,this.material.transparent=this.opacity<1,e.setRenderTarget(this.renderToScreen?null:r),this.clear&&e.clear(),this.fsQuad.render(e),e.autoClear=s}}),t.postprocessing.TexturePass=a});
//# sourceMappingURL=../sourcemaps/postprocessing/TexturePass.js.map
