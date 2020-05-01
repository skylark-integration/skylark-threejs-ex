/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Pass"],function(e,s){return e.MaskPass=function(s,t){e.Pass.call(this),this.scene=s,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1},e.MaskPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.MaskPass,render:function(e,s,t){var r,a,c=e.getContext(),n=e.state;n.buffers.color.setMask(!1),n.buffers.depth.setMask(!1),n.buffers.color.setLocked(!0),n.buffers.depth.setLocked(!0),this.inverse?(r=0,a=1):(r=1,a=0),n.buffers.stencil.setTest(!0),n.buffers.stencil.setOp(c.REPLACE,c.REPLACE,c.REPLACE),n.buffers.stencil.setFunc(c.ALWAYS,r,4294967295),n.buffers.stencil.setClear(a),n.buffers.stencil.setLocked(!0),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),n.buffers.color.setLocked(!1),n.buffers.depth.setLocked(!1),n.buffers.stencil.setLocked(!1),n.buffers.stencil.setFunc(c.EQUAL,1,4294967295),n.buffers.stencil.setOp(c.KEEP,c.KEEP,c.KEEP),n.buffers.stencil.setLocked(!0)}}),e.ClearMaskPass=function(){e.Pass.call(this),this.needsSwap=!1},e.ClearMaskPass.prototype=Object.create(e.Pass.prototype),Object.assign(e.ClearMaskPass.prototype,{render:function(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}),e.MaskPass});
//# sourceMappingURL=../sourcemaps/postprocessing/MaskPass.js.map
