/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./Node"],function(t){"use strict";function e(e,r){t.call(this,r),this.name=e}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Attribute",e.prototype.getAttributeType=function(t){return"number"==typeof this.type?t.getConstructorFromLength(this.type):this.type},e.prototype.getType=function(t){var e=this.getAttributeType(t);return t.getTypeByFormat(e)},e.prototype.generate=function(t,e){var r=this.getAttributeType(t),o=t.getAttribute(this.name,r),p=t.isShader("vertex")?this.name:o.varying.name;return t.format(p,this.getType(t),e)},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.type=e.type,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).type=this.type),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/core/AttributeNode.js.map
