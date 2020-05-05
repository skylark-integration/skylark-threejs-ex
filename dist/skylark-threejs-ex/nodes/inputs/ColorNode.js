/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../core/InputNode","../core/NodeUtils"],function(t,o,e){"use strict";function r(e,r,n){o.call(this,"c"),this.value=e instanceof t.Color?e:new t.Color(e||0,r,n)}return r.prototype=Object.create(o.prototype),r.prototype.constructor=r,r.prototype.nodeType="Color",e.addShortcuts(r.prototype,"value",["r","g","b"]),r.prototype.generateReadonly=function(t,o,e,r){return t.format("vec3( "+this.r+", "+this.g+", "+this.b+" )",r,o)},r.prototype.copy=function(t){return o.prototype.copy.call(this,t),this.value.copy(t),this},r.prototype.toJSON=function(t){var o=this.getJSONNode(t);return o||((o=this.createJSONNode(t)).r=this.r,o.g=this.g,o.b=this.b,!0===this.readonly&&(o.readonly=!0)),o},r});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/ColorNode.js.map
