/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/NodeUtils"],function(t,e){"use strict";var o=e.elements;function r(e,o,r,n){t.call(this,"f"),this.x=e,this.y=o,this.z=r,this.w=n}return r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.nodeType="Join",r.prototype.getNumElements=function(){for(var t=o.length;t--;)if(void 0!==this[o[t]]){++t;break}return Math.max(t,2)},r.prototype.getType=function(t){return t.getTypeFromLength(this.getNumElements())},r.prototype.generate=function(t,e){for(var r=this.getType(t),n=this.getNumElements(),i=[],p=0;p<n;p++){var s=this[o[p]];i.push(s?s.build(t,"f"):"0.0")}var u=(n>1?t.getConstructorFromLength(n):"")+"( "+i.join(", ")+" )";return t.format(u,r,e)},r.prototype.copy=function(e){for(var o in t.prototype.copy.call(this,e),e.inputs)this[o]=e.inputs[o];return this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);if(!e){(e=this.createJSONNode(t)).inputs={};for(var r=this.getNumElements(),n=0;n<r;n++){var i=this[o[n]];i&&(e.inputs[o[n]]=i.toJSON(t).uuid)}}return e},r});
//# sourceMappingURL=../../sourcemaps/nodes/utils/JoinNode.js.map
