/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/CopyShader","../shaders/ConvolutionShader","./Pass"],function(e,r,t,o){return e.BloomPass=function(r,t,o,s){e.Pass.call(this),r=void 0!==r?r:1,t=void 0!==t?t:25,o=void 0!==o?o:4,s=void 0!==s?s:256;var n={minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBAFormat};this.renderTargetX=new e.WebGLRenderTarget(s,s,n),this.renderTargetX.texture.name="BloomPass.x",this.renderTargetY=new e.WebGLRenderTarget(s,s,n),this.renderTargetY.texture.name="BloomPass.y",void 0===e.CopyShader&&console.error("THREE.BloomPass relies on THREE.CopyShader");var a=e.CopyShader;this.copyUniforms=e.UniformsUtils.clone(a.uniforms),this.copyUniforms.opacity.value=r,this.materialCopy=new e.ShaderMaterial({uniforms:this.copyUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader,blending:e.AdditiveBlending,transparent:!0}),void 0===e.ConvolutionShader&&console.error("THREE.BloomPass relies on THREE.ConvolutionShader");var i=e.ConvolutionShader;this.convolutionUniforms=e.UniformsUtils.clone(i.uniforms),this.convolutionUniforms.uImageIncrement.value=e.BloomPass.blurX,this.convolutionUniforms.cKernel.value=e.ConvolutionShader.buildKernel(o),this.materialConvolution=new e.ShaderMaterial({uniforms:this.convolutionUniforms,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,defines:{KERNEL_SIZE_FLOAT:t.toFixed(1),KERNEL_SIZE_INT:t.toFixed(0)}}),this.needsSwap=!1,this.fsQuad=new e.Pass.FullScreenQuad(null)},e.BloomPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.BloomPass,render:function(r,t,o,s,n){n&&r.state.buffers.stencil.setTest(!1),this.fsQuad.material=this.materialConvolution,this.convolutionUniforms.tDiffuse.value=o.texture,this.convolutionUniforms.uImageIncrement.value=e.BloomPass.blurX,r.setRenderTarget(this.renderTargetX),r.clear(),this.fsQuad.render(r),this.convolutionUniforms.tDiffuse.value=this.renderTargetX.texture,this.convolutionUniforms.uImageIncrement.value=e.BloomPass.blurY,r.setRenderTarget(this.renderTargetY),r.clear(),this.fsQuad.render(r),this.fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=this.renderTargetY.texture,n&&r.state.buffers.stencil.setTest(!0),r.setRenderTarget(o),this.clear&&r.clear(),this.fsQuad.render(r)}}),e.BloomPass.blurX=new e.Vector2(.001953125,0),e.BloomPass.blurY=new e.Vector2(0,.001953125),e.BloomPass});
//# sourceMappingURL=../sourcemaps/postprocessing/BloomPass.js.map