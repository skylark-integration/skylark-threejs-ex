/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./TempNode"],function(t){"use strict";function e(e,i){t.call(this),this.setFunction(e,i)}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="FunctionCall",e.prototype.setFunction=function(t,e){this.value=t,this.inputs=e||[]},e.prototype.getFunction=function(){return this.value},e.prototype.getType=function(t){return this.value.getType(t)},e.prototype.generate=function(t,e){for(var i=this.getType(t),n=this.value,o=n.build(t,e)+"( ",u=[],p=0;p<n.inputs.length;p++){var r=n.inputs[p],s=this.inputs[p]||this.inputs[r.name];u.push(s.build(t,t.getTypeByFormat(r.type)))}return o+=u.join(", ")+" )",t.format(o,i,e)},e.prototype.copy=function(e){for(var i in t.prototype.copy.call(this,e),e.inputs)this.inputs[i]=e.inputs[i];return this.value=e.value,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);if(!e){var i=this.value;if((e=this.createJSONNode(t)).value=this.value.toJSON(t).uuid,i.inputs.length){e.inputs={};for(var n=0;n<i.inputs.length;n++){var o=i.inputs[n],u=this.inputs[n]||this.inputs[o.name];e.inputs[o.name]=u.toJSON(t).uuid}}}return e},e});
//# sourceMappingURL=../../sourcemaps/nodes/core/FunctionCallNode.js.map
