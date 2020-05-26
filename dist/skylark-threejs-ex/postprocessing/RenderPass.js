/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex","./Pass"],function(e,r){"use strict";var t=function(e,t,a,i,l){r.call(this),this.scene=e,this.camera=t,this.overrideMaterial=a,this.clearColor=i,this.clearAlpha=void 0!==l?l:0,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1};return t.prototype=Object.assign(Object.create(r.prototype),{constructor:t,render:function(e,r,t){var a,i,l,s=e.autoClear;e.autoClear=!1,void 0!==this.overrideMaterial&&(l=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor&&(a=e.getClearColor().getHex(),i=e.getClearAlpha(),e.setClearColor(this.clearColor,this.clearAlpha)),this.clearDepth&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor&&e.setClearColor(a,i),void 0!==this.overrideMaterial&&(this.scene.overrideMaterial=l),e.autoClear=s}}),e.postprocessing.RenderPass=t});
//# sourceMappingURL=../sourcemaps/postprocessing/RenderPass.js.map
