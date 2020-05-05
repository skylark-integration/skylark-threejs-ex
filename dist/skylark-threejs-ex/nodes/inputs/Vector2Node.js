/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../core/InputNode","../core/NodeUtils"],function(t,e,o){"use strict";function r(o,r){e.call(this,"v2"),this.value=o instanceof t.Vector2?o:new t.Vector2(o,r)}return r.prototype=Object.create(e.prototype),r.prototype.constructor=r,r.prototype.nodeType="Vector2",o.addShortcuts(r.prototype,"value",["x","y"]),r.prototype.generateReadonly=function(t,e,o,r){return t.format("vec2( "+this.x+", "+this.y+" )",r,e)},r.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.value.copy(t),this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).x=this.x,e.y=this.y,!0===this.readonly&&(e.readonly=!0)),e},r});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/Vector2Node.js.map
