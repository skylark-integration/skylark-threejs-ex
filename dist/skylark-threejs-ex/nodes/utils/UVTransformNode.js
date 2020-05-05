/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/ExpressionNode","../inputs/Matrix3Node","../accessors/UVNode"],function(t,o,e){"use strict";function i(i,r){t.call(this,"( uvTransform * vec3( uvNode, 1 ) ).xy","vec2"),this.uv=i||new e,this.position=r||new o}return i.prototype=Object.create(t.prototype),i.prototype.constructor=i,i.prototype.nodeType="UVTransform",i.prototype.generate=function(o,e){return this.keywords.uvNode=this.uv,this.keywords.uvTransform=this.position,t.prototype.generate.call(this,o,e)},i.prototype.setUvTransform=function(t,o,e,i,r,s,n){s=void 0!==s?s:.5,n=void 0!==n?n:.5,this.position.value.setUvTransform(t,o,e,i,r,s,n)},i.prototype.copy=function(o){return t.prototype.copy.call(this,o),this.uv=o.uv,this.position=o.position,this},i.prototype.toJSON=function(t){var o=this.getJSONNode(t);return o||((o=this.createJSONNode(t)).uv=this.uv.toJSON(t).uuid,o.position=this.position.toJSON(t).uuid),o},i});
//# sourceMappingURL=../../sourcemaps/nodes/utils/UVTransformNode.js.map
