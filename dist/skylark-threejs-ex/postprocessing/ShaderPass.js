/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./Pass"],function(e,t,r){"use strict";var s=function(t,s){r.call(this),this.textureID=void 0!==s?s:"tDiffuse",t instanceof e.ShaderMaterial?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=e.UniformsUtils.clone(t.uniforms),this.material=new e.ShaderMaterial({defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new r.FullScreenQuad(this.material)};return s.prototype=Object.assign(Object.create(r.prototype),{constructor:s,render:function(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}}),t.postprocessing.ShaderPass=s});
//# sourceMappingURL=../sourcemaps/postprocessing/ShaderPass.js.map
