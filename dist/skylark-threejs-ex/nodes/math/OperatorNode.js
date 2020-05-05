/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode"],function(t){"use strict";function e(e,o,p){t.call(this),this.a=e,this.b=o,this.op=p}return e.ADD="+",e.SUB="-",e.MUL="*",e.DIV="/",e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Operator",e.prototype.getType=function(t){var e=this.a.getType(t),o=this.b.getType(t);return t.isTypeMatrix(e)?"v4":t.getTypeLength(o)>t.getTypeLength(e)?o:e},e.prototype.generate=function(t,e){var o=this.getType(t),p=this.a.build(t,o),i=this.b.build(t,o);return t.format("( "+p+" "+this.op+" "+i+" )",o,e)},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.a=e.a,this.b=e.b,this.op=e.op,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).a=this.a.toJSON(t).uuid,e.b=this.b.toJSON(t).uuid,e.op=this.op),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/math/OperatorNode.js.map
