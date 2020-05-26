/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./Pass","../shaders/CopyShader"],function(e,r,t,i){"use strict";var s=function(r){t.call(this),void 0===i&&console.error("SavePass relies on CopyShader");var s=i;this.textureID="tDiffuse",this.uniforms=e.UniformsUtils.clone(s.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader}),this.renderTarget=r,void 0===this.renderTarget&&(this.renderTarget=new e.WebGLRenderTarget(window.innerWidth,window.innerHeight,{minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBFormat,stencilBuffer:!1}),this.renderTarget.texture.name="SavePass.rt"),this.needsSwap=!1,this.fsQuad=new t.FullScreenQuad(this.material)};return s.prototype=Object.assign(Object.create(t.prototype),{constructor:s,render:function(e,r,t){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=t.texture),e.setRenderTarget(this.renderTarget),this.clear&&e.clear(),this.fsQuad.render(e)}}),r.postprocessing.SavePass=s});
//# sourceMappingURL=../sourcemaps/postprocessing/SavePass.js.map
