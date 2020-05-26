/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex","../postprocessing/Pass"],function(e,r){"use strict";var t=function(e,t){r.call(this),this.needsSwap=!1,this.clearColor=void 0!==e?e:0,this.clearAlpha=void 0!==t?t:0};return t.prototype=Object.assign(Object.create(r.prototype),{constructor:t,render:function(e,r,t){var o,s;this.clearColor&&(o=e.getClearColor().getHex(),s=e.getClearAlpha(),e.setClearColor(this.clearColor,this.clearAlpha)),e.setRenderTarget(this.renderToScreen?null:t),e.clear(),this.clearColor&&e.setClearColor(o,s)}}),e.postprocessing.ClearPass=t});
//# sourceMappingURL=../sourcemaps/postprocessing/ClearPass.js.map
