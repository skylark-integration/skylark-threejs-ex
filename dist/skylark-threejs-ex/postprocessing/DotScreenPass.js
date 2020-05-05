/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../postprocessing/Pass","../shaders/DotScreenShader"],function(e,r,t){"use strict";var s=function(s,i,n){r.call(this),void 0===t&&console.error("DotScreenPass relies on DotScreenShader");var a=t;this.uniforms=e.UniformsUtils.clone(a.uniforms),void 0!==s&&this.uniforms.center.value.copy(s),void 0!==i&&(this.uniforms.angle.value=i),void 0!==n&&(this.uniforms.scale.value=n),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.fsQuad=new r.FullScreenQuad(this.material)};return s.prototype=Object.assign(Object.create(r.prototype),{constructor:s,render:function(e,r,t){this.uniforms.tDiffuse.value=t.texture,this.uniforms.tSize.value.set(t.width,t.height),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))}}),s});
//# sourceMappingURL=../sourcemaps/postprocessing/DotScreenPass.js.map
