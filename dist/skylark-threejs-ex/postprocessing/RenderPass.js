/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Pass"],function(e,r){return e.RenderPass=function(r,a,t,s,i){e.Pass.call(this),this.scene=r,this.camera=a,this.overrideMaterial=t,this.clearColor=s,this.clearAlpha=void 0!==i?i:0,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1},e.RenderPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.RenderPass,render:function(e,r,a){var t,s,i,l=e.autoClear;e.autoClear=!1,void 0!==this.overrideMaterial&&(i=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor&&(t=e.getClearColor().getHex(),s=e.getClearAlpha(),e.setClearColor(this.clearColor,this.clearAlpha)),this.clearDepth&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:a),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor&&e.setClearColor(t,s),void 0!==this.overrideMaterial&&(this.scene.overrideMaterial=i),e.autoClear=l}}),e.RenderPass});
//# sourceMappingURL=../sourcemaps/postprocessing/RenderPass.js.map
