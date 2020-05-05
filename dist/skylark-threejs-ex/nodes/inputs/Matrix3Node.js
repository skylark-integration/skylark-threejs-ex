/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../core/InputNode"],function(e,t){"use strict";function o(o){t.call(this,"m3"),this.value=o||new e.Matrix3}return o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.prototype.nodeType="Matrix3",Object.defineProperties(o.prototype,{elements:{set:function(e){this.value.elements=e},get:function(){return this.value.elements}}}),o.prototype.generateReadonly=function(e,t,o,r){return e.format("mat3( "+this.value.elements.join(", ")+" )",r,t)},o.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.value.fromArray(e.elements),this},o.prototype.toJSON=function(e){var t=this.getJSONNode(e);return t||((t=this.createJSONNode(e)).elements=this.value.elements.concat()),t},o});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/Matrix3Node.js.map
