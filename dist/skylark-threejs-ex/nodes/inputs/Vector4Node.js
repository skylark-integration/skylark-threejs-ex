/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../core/InputNode","../core/NodeUtils"],function(t,e,o){"use strict";function r(o,r,i,n){e.call(this,"v4"),this.value=o instanceof t.Vector4?o:new t.Vector4(o,r,i,n)}return r.prototype=Object.create(e.prototype),r.prototype.constructor=r,r.prototype.nodeType="Vector4",o.addShortcuts(r.prototype,"value",["x","y","z","w"]),r.prototype.generateReadonly=function(t,e,o,r){return t.format("vec4( "+this.x+", "+this.y+", "+this.z+", "+this.w+" )",r,e)},r.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.value.copy(t),this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).x=this.x,e.y=this.y,e.z=this.z,e.w=this.w,!0===this.readonly&&(e.readonly=!0)),e},r});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/Vector4Node.js.map
