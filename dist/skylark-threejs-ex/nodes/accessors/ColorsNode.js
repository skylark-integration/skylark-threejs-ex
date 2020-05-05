/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode"],function(t){"use strict";var e=["color","color2"],o=["vColor","vColor2"];function r(e){t.call(this,"v4",{shared:!1}),this.index=e||0}return r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.nodeType="Colors",r.prototype.generate=function(t,r){t.requires.color[this.index]=!0;var i=t.isShader("vertex")?e[this.index]:o[this.index];return t.format(i,this.getType(t),r)},r.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.index=e.index,this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).index=this.index),e},r});
//# sourceMappingURL=../../sourcemaps/nodes/accessors/ColorsNode.js.map
