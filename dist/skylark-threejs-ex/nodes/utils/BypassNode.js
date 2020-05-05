/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/Node"],function(t){"use strict";function e(e,o){t.call(this),this.code=e,this.value=o}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Bypass",e.prototype.getType=function(t){return this.value?this.value.getType(t):t.isShader("fragment")?"f":"void"},e.prototype.generate=function(t,e){var o=this.code.build(t,e)+";";return t.addNodeCode(o),t.isShader("vertex")?this.value?this.value.build(t,e):void 0:this.value?this.value.build(t,e):t.format("0.0","f",e)},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.code=e.code,this.value=e.value,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).code=this.code.toJSON(t).uuid,this.value&&(e.value=this.value.toJSON(t).uuid)),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/utils/BypassNode.js.map
