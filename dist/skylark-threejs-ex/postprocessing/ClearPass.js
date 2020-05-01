/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Pass"],function(e,r){return e.ClearPass=function(r,a){e.Pass.call(this),this.needsSwap=!1,this.clearColor=void 0!==r?r:0,this.clearAlpha=void 0!==a?a:0},e.ClearPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.ClearPass,render:function(e,r,a){var s,l;this.clearColor&&(s=e.getClearColor().getHex(),l=e.getClearAlpha(),e.setClearColor(this.clearColor,this.clearAlpha)),e.setRenderTarget(this.renderToScreen?null:a),e.clear(),this.clearColor&&e.setClearColor(s,l)}}),e.ClearPass});
//# sourceMappingURL=../sourcemaps/postprocessing/ClearPass.js.map
