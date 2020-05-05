/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./TempNode"],function(e){"use strict";function t(t,r){(r=r||{}).shared=void 0!==r.shared&&r.shared,e.call(this,t,r),this.readonly=!1}return t.prototype=Object.create(e.prototype),t.prototype.constructor=t,t.prototype.setReadonly=function(e){return this.readonly=e,this},t.prototype.getReadonly=function(){return this.readonly},t.prototype.copy=function(t){return e.prototype.copy.call(this,t),void 0!==t.readonly&&(this.readonly=t.readonly),this},t.prototype.createJSONNode=function(t){var r=e.prototype.createJSONNode.call(this,t);return!0===this.readonly&&(r.readonly=this.readonly),r},t.prototype.generate=function(e,t,r,o,n,a){r=e.getUuid(r||this.getUuid()),o=o||this.getType(e);var i=e.getNodeData(r);return this.getReadonly(e)&&void 0!==this.generateReadonly?this.generateReadonly(e,t,r,o,n,a):e.isShader("vertex")?(i.vertex||(i.vertex=e.createVertexUniform(o,this,n,a,this.getLabel())),e.format(i.vertex.name,o,t)):(i.fragment||(i.fragment=e.createFragmentUniform(o,this,n,a,this.getLabel())),e.format(i.fragment.name,o,t))},t});
//# sourceMappingURL=../../sourcemaps/nodes/core/InputNode.js.map
