/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/CopyShader","./Pass"],function(e){return e.SavePass=function(r){e.Pass.call(this),void 0===e.CopyShader&&console.error("THREE.SavePass relies on THREE.CopyShader");var t=e.CopyShader;this.textureID="tDiffuse",this.uniforms=e.UniformsUtils.clone(t.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.renderTarget=r,void 0===this.renderTarget&&(this.renderTarget=new e.WebGLRenderTarget(window.innerWidth,window.innerHeight,{minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBFormat,stencilBuffer:!1}),this.renderTarget.texture.name="SavePass.rt"),this.needsSwap=!1,this.fsQuad=new e.Pass.FullScreenQuad(this.material)},e.SavePass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.SavePass,render:function(e,r,t){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=t.texture),e.setRenderTarget(this.renderTarget),this.clear&&e.clear(),this.fsQuad.render(e)}}),e.SavePass});
//# sourceMappingURL=../sourcemaps/postprocessing/SavePass.js.map
