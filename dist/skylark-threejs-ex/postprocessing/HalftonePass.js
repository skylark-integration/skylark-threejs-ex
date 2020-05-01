/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/HalftoneShader","./Pass"],function(e,r,s){return e.HalftonePass=function(r,s,t){for(var a in e.Pass.call(this),void 0===e.HalftoneShader&&console.error("THREE.HalftonePass requires THREE.HalftoneShader"),this.uniforms=e.UniformsUtils.clone(e.HalftoneShader.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,fragmentShader:e.HalftoneShader.fragmentShader,vertexShader:e.HalftoneShader.vertexShader}),this.uniforms.width.value=r,this.uniforms.height.value=s,t)t.hasOwnProperty(a)&&this.uniforms.hasOwnProperty(a)&&(this.uniforms[a].value=t[a]);this.fsQuad=new e.Pass.FullScreenQuad(this.material)},e.HalftonePass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.HalftonePass,render:function(e,r,s){this.material.uniforms.tDiffuse.value=s.texture,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))},setSize:function(e,r){this.uniforms.width.value=e,this.uniforms.height.value=r}}),e.HalftonePass});
//# sourceMappingURL=../sourcemaps/postprocessing/HalftonePass.js.map
