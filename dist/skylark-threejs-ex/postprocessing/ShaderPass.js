/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Pass"],function(e,t){"use strict";var r=function(r,s){t.call(this),this.textureID=void 0!==s?s:"tDiffuse",r instanceof e.ShaderMaterial?(this.uniforms=r.uniforms,this.material=r):r&&(this.uniforms=e.UniformsUtils.clone(r.uniforms),this.material=new e.ShaderMaterial({defines:Object.assign({},r.defines),uniforms:this.uniforms,vertexShader:r.vertexShader,fragmentShader:r.fragmentShader})),this.fsQuad=new t.FullScreenQuad(this.material)};return r.prototype=Object.assign(Object.create(t.prototype),{constructor:r,render:function(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}}),r});
//# sourceMappingURL=../sourcemaps/postprocessing/ShaderPass.js.map
