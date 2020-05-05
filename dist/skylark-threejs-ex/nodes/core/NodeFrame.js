/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";function t(t){this.time=void 0!==t?t:0,this.id=0}return t.prototype={constructor:t,update:function(t){return++this.id,this.time+=t,this.delta=t,this},setRenderer:function(t){return this.renderer=t,this},setRenderTexture:function(t){return this.renderTexture=t,this},updateNode:function(t){return t.frameId===this.id?this:(t.updateFrame(this),t.frameId=this.id,this)}},t});
//# sourceMappingURL=../../sourcemaps/nodes/core/NodeFrame.js.map
