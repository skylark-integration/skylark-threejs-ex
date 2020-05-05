/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../postprocessing/Pass","../shaders/FilmShader"],function(e,r,s){"use strict";var t=function(t,i,n,a){r.call(this),void 0===s&&console.error("FilmPass relies on FilmShader");var o=s;this.uniforms=e.UniformsUtils.clone(o.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),void 0!==a&&(this.uniforms.grayscale.value=a),void 0!==t&&(this.uniforms.nIntensity.value=t),void 0!==i&&(this.uniforms.sIntensity.value=i),void 0!==n&&(this.uniforms.sCount.value=n),this.fsQuad=new r.FullScreenQuad(this.material)};return t.prototype=Object.assign(Object.create(r.prototype),{constructor:t,render:function(e,r,s,t){this.uniforms.tDiffuse.value=s.texture,this.uniforms.time.value+=t,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))}}),t});
//# sourceMappingURL=../sourcemaps/postprocessing/FilmPass.js.map
