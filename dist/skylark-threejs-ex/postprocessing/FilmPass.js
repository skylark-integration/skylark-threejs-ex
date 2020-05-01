/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/FilmShader","./Pass"],function(e,s,r){return e.FilmPass=function(s,r,i,t){e.Pass.call(this),void 0===e.FilmShader&&console.error("THREE.FilmPass relies on THREE.FilmShader");var a=e.FilmShader;this.uniforms=e.UniformsUtils.clone(a.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),void 0!==t&&(this.uniforms.grayscale.value=t),void 0!==s&&(this.uniforms.nIntensity.value=s),void 0!==r&&(this.uniforms.sIntensity.value=r),void 0!==i&&(this.uniforms.sCount.value=i),this.fsQuad=new e.Pass.FullScreenQuad(this.material)},e.FilmPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.FilmPass,render:function(e,s,r,i){this.uniforms.tDiffuse.value=r.texture,this.uniforms.time.value+=i,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(),this.fsQuad.render(e))}}),e.FilmPass});
//# sourceMappingURL=../sourcemaps/postprocessing/FilmPass.js.map
