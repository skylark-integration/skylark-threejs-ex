/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/CopyShader","./Pass"],function(e){return e.TexturePass=function(r,t){e.Pass.call(this),void 0===e.CopyShader&&console.error("THREE.TexturePass relies on THREE.CopyShader");var s=e.CopyShader;this.map=r,this.opacity=void 0!==t?t:1,this.uniforms=e.UniformsUtils.clone(s.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,depthTest:!1,depthWrite:!1}),this.needsSwap=!1,this.fsQuad=new e.Pass.FullScreenQuad(null)},e.TexturePass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.TexturePass,render:function(e,r,t){var s=e.autoClear;e.autoClear=!1,this.fsQuad.material=this.material,this.uniforms.opacity.value=this.opacity,this.uniforms.tDiffuse.value=this.map,this.material.transparent=this.opacity<1,e.setRenderTarget(this.renderToScreen?null:t),this.clear&&e.clear(),this.fsQuad.render(e),e.autoClear=s}}),e.TexturePass});
//# sourceMappingURL=../sourcemaps/postprocessing/TexturePass.js.map
