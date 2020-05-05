/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/ConstNode","../core/FunctionNode"],function(t,e,o){"use strict";function r(e){t.call(this,"f"),this.rgb=e}var n;return r.Nodes={LUMA:n=new e("vec3 LUMA vec3( 0.2125, 0.7154, 0.0721 )"),luminance:new o(["float luminance( vec3 rgb ) {","\treturn dot( rgb, LUMA );","}"].join("\n"),[n])},r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.nodeType="Luminance",r.prototype.generate=function(t,e){var o=t.include(r.Nodes.luminance);return t.format(o+"( "+this.rgb.build(t,"v3")+" )",this.getType(t),e)},r.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.rgb=e.rgb,this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).rgb=this.rgb.toJSON(t).uuid),e},r});
//# sourceMappingURL=../../sourcemaps/nodes/effects/LuminanceNode.js.map
