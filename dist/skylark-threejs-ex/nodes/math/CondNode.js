/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode"],function(e){"use strict";function t(t,o,i,s,p){e.call(this),this.a=t,this.b=o,this.op=i,this.ifNode=s,this.elseNode=p}return t.EQUAL="==",t.NOT_EQUAL="!=",t.GREATER=">",t.GREATER_EQUAL=">=",t.LESS="<",t.LESS_EQUAL="<=",t.prototype=Object.create(e.prototype),t.prototype.constructor=t,t.prototype.nodeType="Cond",t.prototype.getType=function(e){if(this.ifNode){var t=this.ifNode.getType(e),o=this.elseNode.getType(e);return e.getTypeLength(o)>e.getTypeLength(t)?o:t}return"b"},t.prototype.getCondType=function(e){return e.getTypeLength(this.b.getType(e))>e.getTypeLength(this.a.getType(e))?this.b.getType(e):this.a.getType(e)},t.prototype.generate=function(e,t){var o,i=this.getType(e),s=this.getCondType(e),p=this.a.build(e,s),h=this.b.build(e,s);if(this.ifNode){var r=this.ifNode.build(e,i),d=this.elseNode.build(e,i);o="( "+[p,this.op,h,"?",r,":",d].join(" ")+" )"}else o="( "+p+" "+this.op+" "+h+" )";return e.format(o,this.getType(e),t)},t.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.a=t.a,this.b=t.b,this.op=t.op,this.ifNode=t.ifNode,this.elseNode=t.elseNode,this},t.prototype.toJSON=function(e){var t=this.getJSONNode(e);return t||((t=this.createJSONNode(e)).a=this.a.toJSON(e).uuid,t.b=this.b.toJSON(e).uuid,t.op=this.op,t.ifNode&&(t.ifNode=this.ifNode.toJSON(e).uuid),t.elseNode&&(t.elseNode=this.elseNode.toJSON(e).uuid)),t},t});
//# sourceMappingURL=../../sourcemaps/nodes/math/CondNode.js.map
