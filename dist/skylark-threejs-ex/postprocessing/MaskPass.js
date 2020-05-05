/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./Pass"],function(e){"use strict";var s=function(s,t){e.call(this),this.scene=s,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1};return s.prototype=Object.assign(Object.create(e.prototype),{constructor:s,render:function(e,s,t){var r,c,f=e.getContext(),n=e.state;n.buffers.color.setMask(!1),n.buffers.depth.setMask(!1),n.buffers.color.setLocked(!0),n.buffers.depth.setLocked(!0),this.inverse?(r=0,c=1):(r=1,c=0),n.buffers.stencil.setTest(!0),n.buffers.stencil.setOp(f.REPLACE,f.REPLACE,f.REPLACE),n.buffers.stencil.setFunc(f.ALWAYS,r,4294967295),n.buffers.stencil.setClear(c),n.buffers.stencil.setLocked(!0),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),n.buffers.color.setLocked(!1),n.buffers.depth.setLocked(!1),n.buffers.stencil.setLocked(!1),n.buffers.stencil.setFunc(f.EQUAL,1,4294967295),n.buffers.stencil.setOp(f.KEEP,f.KEEP,f.KEEP),n.buffers.stencil.setLocked(!0)}}),s});
//# sourceMappingURL=../sourcemaps/postprocessing/MaskPass.js.map
