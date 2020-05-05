/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./Node"],function(t){"use strict";function e(e,o){t.call(this,e),this.value=o}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Var",e.prototype.getType=function(t){return t.getTypeByFormat(this.type)},e.prototype.generate=function(t,e){var o=t.getVar(this.uuid,this.type);return this.value&&t.isShader("vertex")&&t.addNodeCode(o.name+" = "+this.value.build(t,this.getType(t))+";"),t.format(o.name,this.getType(t),e)},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.type=e.type,this.value=e.value,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).type=this.type,this.value&&(e.value=this.value.toJSON(t).uuid)),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/core/VarNode.js.map
