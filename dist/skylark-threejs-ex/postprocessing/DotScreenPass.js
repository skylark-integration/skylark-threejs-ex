/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","../postprocessing/Pass","../shaders/DotScreenShader"],function(e,r,t,s){"use strict";var i=function(r,i,n){t.call(this),void 0===s&&console.error("DotScreenPass relies on DotScreenShader");var a=s;this.uniforms=e.UniformsUtils.clone(a.uniforms),void 0!==r&&this.uniforms.center.value.copy(r),void 0!==i&&(this.uniforms.angle.value=i),void 0!==n&&(this.uniforms.scale.value=n),this.material=new e.ShaderMaterial({uniforms:this.uniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.fsQuad=new t.FullScreenQuad(this.material)};return i.prototype=Object.assign(Object.create(t.prototype),{constructor:i,render:function(e,r,t){this.uniforms.tDiffuse.value=t.texture,this.uniforms.tSize.value.set(t.width,t.height),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))}}),r.postprocessing.DotScreenPass=i});
//# sourceMappingURL=../sourcemaps/postprocessing/DotScreenPass.js.map
