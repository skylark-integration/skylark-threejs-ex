/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../inputs/FloatNode"],function(t){"use strict";function e(e){t.call(this),this.texture=e,this.maxMIPLevel=0}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="MaxMIPLevel",Object.defineProperties(e.prototype,{value:{get:function(){if(0===this.maxMIPLevel){var t=this.texture.value.image;Array.isArray(t)&&(t=t[0]),this.maxMIPLevel=void 0!==t?Math.log(Math.max(t.width,t.height))*Math.LOG2E:0}return this.maxMIPLevel},set:function(){}}}),e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).texture=this.texture.uuid),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/utils/MaxMIPLevelNode.js.map
