/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/InputNode"],function(t){"use strict";function e(e){t.call(this,"b"),this.value=Boolean(e)}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Bool",e.prototype.generateReadonly=function(t,e,o,r){return t.format(this.value,r,e)},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.value=e.value,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).value=this.value,!0===this.readonly&&(e.readonly=!0)),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/BoolNode.js.map
