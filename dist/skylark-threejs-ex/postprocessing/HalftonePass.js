/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Pass","../shaders/HalftoneShader"],function(e,r,t){"use strict";var s=function(s,i,a){for(var n in r.call(this),void 0===t&&console.error("THREE.HalftonePass requires HalftoneShader"),this.uniforms=e.UniformsUtils.clone(t.uniforms),this.material=new e.ShaderMaterial({uniforms:this.uniforms,fragmentShader:t.fragmentShader,vertexShader:t.vertexShader}),this.uniforms.width.value=s,this.uniforms.height.value=i,a)a.hasOwnProperty(n)&&this.uniforms.hasOwnProperty(n)&&(this.uniforms[n].value=a[n]);this.fsQuad=new r.FullScreenQuad(this.material)};return s.prototype=Object.assign(Object.create(r.prototype),{constructor:s,render:function(e,r,t){this.material.uniforms.tDiffuse.value=t.texture,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.clear&&e.clear(),this.fsQuad.render(e))},setSize:function(e,r){this.uniforms.width.value=e,this.uniforms.height.value=r}}),s});
//# sourceMappingURL=../sourcemaps/postprocessing/HalftonePass.js.map
