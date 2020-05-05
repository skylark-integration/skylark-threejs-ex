/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/FunctionNode","../accessors/UVNode"],function(t,e,o){"use strict";function r(e){t.call(this,"f"),this.uv=e||new o}return r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.nodeType="Noise",r.Nodes={snoise:new e(["float snoise(vec2 co) {","\treturn fract( sin( dot( co.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );","}"].join("\n"))},r.prototype.generate=function(t,e){var o=t.include(r.Nodes.snoise);return t.format(o+"( "+this.uv.build(t,"v2")+" )",this.getType(t),e)},r.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.uv=e.uv,this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).uv=this.uv.toJSON(t).uuid),e},r});
//# sourceMappingURL=../../sourcemaps/nodes/procedural/NoiseNode.js.map
