/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../../core/Node"],function(t){"use strict";function e(e){t.call(this,"v4"),this.value=e}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Raw",e.prototype.generate=function(t){var e=this.value.analyzeAndFlow(t,this.type),o=e.code+"\n";return t.isShader("vertex")?o+="gl_Position = "+e.result+";":o+="gl_FragColor = "+e.result+";",o},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.value=e.value,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).value=this.value.toJSON(t).uuid),e},e});
//# sourceMappingURL=../../../sourcemaps/nodes/materials/nodes/RawNode.js.map
