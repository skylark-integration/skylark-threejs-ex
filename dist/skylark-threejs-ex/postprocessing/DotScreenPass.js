/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/DotScreenShader","./Pass"],function(e,r,s){return e.DotScreenPass=function(r,s,t){e.Pass.call(this),void 0===e.DotScreenShader&&console.error("THREE.DotScreenPass relies on THREE.DotScreenShader");var a=e.DotScreenShader;this.uniforms=e.UniformsUtils.clone(a.uniforms),void 0!==r&&this.uniforms.center.value.copy(r),void 0!==s&&(this.uniforms.angle.value=s),void 0!==t&&(this.uniforms.scale.value=t),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.fsQuad=new e.Pass.FullScreenQuad(this.material)},e.DotScreenPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.DotScreenPass,render:function(e,r,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.tSize.value.set(s.width,s.height),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))}}),e.DotScreenPass});
//# sourceMappingURL=../sourcemaps/postprocessing/DotScreenPass.js.map
