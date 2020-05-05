/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Pass","../shaders/CopyShader"],function(e,r,t){"use strict";var i=function(i){r.call(this),void 0===t&&console.error("SavePass relies on CopyShader");var s=t;this.textureID="tDiffuse",this.uniforms=e.UniformsUtils.clone(s.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader}),this.renderTarget=i,void 0===this.renderTarget&&(this.renderTarget=new e.WebGLRenderTarget(window.innerWidth,window.innerHeight,{minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBFormat,stencilBuffer:!1}),this.renderTarget.texture.name="SavePass.rt"),this.needsSwap=!1,this.fsQuad=new r.FullScreenQuad(this.material)};return i.prototype=Object.assign(Object.create(r.prototype),{constructor:i,render:function(e,r,t){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=t.texture),e.setRenderTarget(this.renderTarget),this.clear&&e.clear(),this.fsQuad.render(e)}}),i});
//# sourceMappingURL=../sourcemaps/postprocessing/SavePass.js.map
