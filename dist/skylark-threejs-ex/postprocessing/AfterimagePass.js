/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/AfterimageShader","./Pass"],function(e,t,r){return e.AfterimagePass=function(t){e.Pass.call(this),void 0===e.AfterimageShader&&console.error("THREE.AfterimagePass relies on THREE.AfterimageShader"),this.shader=e.AfterimageShader,this.uniforms=e.UniformsUtils.clone(this.shader.uniforms),this.uniforms.damp.value=void 0!==t?t:.96,this.textureComp=new e.WebGLRenderTarget(window.innerWidth,window.innerHeight,{minFilter:e.LinearFilter,magFilter:e.NearestFilter,format:e.RGBAFormat}),this.textureOld=new e.WebGLRenderTarget(window.innerWidth,window.innerHeight,{minFilter:e.LinearFilter,magFilter:e.NearestFilter,format:e.RGBAFormat}),this.shaderMaterial=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:this.shader.vertexShader,fragmentShader:this.shader.fragmentShader}),this.compFsQuad=new e.Pass.FullScreenQuad(this.shaderMaterial);var r=new e.MeshBasicMaterial;this.copyFsQuad=new e.Pass.FullScreenQuad(r)},e.AfterimagePass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.AfterimagePass,render:function(e,t,r){this.uniforms.tOld.value=this.textureOld.texture,this.uniforms.tNew.value=r.texture,e.setRenderTarget(this.textureComp),this.compFsQuad.render(e),this.copyFsQuad.material.map=this.textureComp.texture,this.renderToScreen?(e.setRenderTarget(null),this.copyFsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(),this.copyFsQuad.render(e));var i=this.textureOld;this.textureOld=this.textureComp,this.textureComp=i},setSize:function(e,t){this.textureComp.setSize(e,t),this.textureOld.setSize(e,t)}}),e.AfterimagePass});
//# sourceMappingURL=../sourcemaps/postprocessing/AfterimagePass.js.map