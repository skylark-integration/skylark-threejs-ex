/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex","../postprocessing/Pass"],function(e,t){"use strict";var s=function(){t.call(this),this.needsSwap=!1};return s.prototype=Object.create(t.prototype),Object.assign(s.prototype,{render:function(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}),e.postprocessing.ClearMaskPass=s});
//# sourceMappingURL=../sourcemaps/postprocessing/ClearMaskPass.js.map
