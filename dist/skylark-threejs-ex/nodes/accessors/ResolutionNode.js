/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../inputs/Vector2Node"],function(e,t){"use strict";function r(){t.call(this),this.size=new e.Vector2}return r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.nodeType="Resolution",r.prototype.updateFrame=function(e){if(e.renderer){e.renderer.getSize(this.size);var t=e.renderer.getPixelRatio();this.x=this.size.width*t,this.y=this.size.height*t}else console.warn("ResolutionNode need a renderer in NodeFrame")},r.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.renderer=e.renderer,this},r.prototype.toJSON=function(e){var t=this.getJSONNode(e);return t||((t=this.createJSONNode(e)).renderer=this.renderer.uuid),t},r});
//# sourceMappingURL=../../sourcemaps/nodes/accessors/ResolutionNode.js.map
