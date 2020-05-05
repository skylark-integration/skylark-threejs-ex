/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/InputNode"],function(t){"use strict";function e(e,o,r){t.call(this,r),this.object=e,this.property=o}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Property",Object.defineProperties(e.prototype,{value:{get:function(){return this.object[this.property]},set:function(t){this.object[this.property]=t}}}),e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).value=this.value,e.property=this.property),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/PropertyNode.js.map
