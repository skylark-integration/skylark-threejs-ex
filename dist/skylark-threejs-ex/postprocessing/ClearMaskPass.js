/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../postprocessing/Pass"],function(t){"use strict";var e=function(){t.call(this),this.needsSwap=!1};return e.prototype=Object.create(t.prototype),Object.assign(e.prototype,{render:function(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}),e});
//# sourceMappingURL=../sourcemaps/postprocessing/ClearMaskPass.js.map
