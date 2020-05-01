/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Pass"],function(e){return e.ShaderPass=function(t,r){e.Pass.call(this),this.textureID=void 0!==r?r:"tDiffuse",t instanceof e.ShaderMaterial?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=e.UniformsUtils.clone(t.uniforms),this.material=new e.ShaderMaterial({defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new e.Pass.FullScreenQuad(this.material)},e.ShaderPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.ShaderPass,render:function(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}}),e.ShaderPass});
//# sourceMappingURL=../sourcemaps/postprocessing/ShaderPass.js.map
