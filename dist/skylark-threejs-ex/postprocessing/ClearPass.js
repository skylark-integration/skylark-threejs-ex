/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../postprocessing/Pass"],function(e){"use strict";var r=function(r,t){e.call(this),this.needsSwap=!1,this.clearColor=void 0!==r?r:0,this.clearAlpha=void 0!==t?t:0};return r.prototype=Object.assign(Object.create(e.prototype),{constructor:r,render:function(e,r,t){var o,l;this.clearColor&&(o=e.getClearColor().getHex(),l=e.getClearAlpha(),e.setClearColor(this.clearColor,this.clearAlpha)),e.setRenderTarget(this.renderToScreen?null:t),e.clear(),this.clearColor&&e.setClearColor(o,l)}}),r});
//# sourceMappingURL=../sourcemaps/postprocessing/ClearPass.js.map
