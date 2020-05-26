/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","../postprocessing/Pass","../shaders/FilmShader"],function(e,r,s,t){"use strict";var i=function(r,i,n,a){s.call(this),void 0===t&&console.error("FilmPass relies on FilmShader");var o=t;this.uniforms=e.UniformsUtils.clone(o.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),void 0!==a&&(this.uniforms.grayscale.value=a),void 0!==r&&(this.uniforms.nIntensity.value=r),void 0!==i&&(this.uniforms.sIntensity.value=i),void 0!==n&&(this.uniforms.sCount.value=n),this.fsQuad=new s.FullScreenQuad(this.material)};return i.prototype=Object.assign(Object.create(s.prototype),{constructor:i,render:function(e,r,s,t){this.uniforms.tDiffuse.value=s.texture,this.uniforms.time.value+=t,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))}}),r.postprocessing.FilmPass=i});
//# sourceMappingURL=../sourcemaps/postprocessing/FilmPass.js.map
