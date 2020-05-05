/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/InputNode","../accessors/ReflectNode","../utils/ColorSpaceNode","../core/ExpressionNode"],function(t,e,i,o){"use strict";function r(i,o,r){t.call(this,"v4",{shared:!0}),this.value=i,this.uv=o||new e,this.bias=r}return r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.nodeType="CubeTexture",r.prototype.getTexture=function(e,i){return t.prototype.generate.call(this,e,i,this.value.uuid,"tc")},r.prototype.generate=function(t,e){if("samplerCube"===e)return this.getTexture(t,e);var r,s=this.getTexture(t,e),u=this.uv.build(t,"v3"),a=this.bias?this.bias.build(t,"f"):void 0;void 0===a&&t.context.bias&&(a=t.context.bias.setTexture(this).build(t,"f")),r=a?"texCubeBias( "+s+", "+u+", "+a+" )":"texCube( "+s+", "+u+" )";var c={include:t.isShader("vertex"),ignoreCache:!0},n=this.getType(t);return t.addContext(c),this.colorSpace=this.colorSpace||new i(new o("",n)),this.colorSpace.fromDecoding(t.getTextureEncodingFromMap(this.value)),this.colorSpace.input.parse(r),r=this.colorSpace.build(t,n),t.removeContext(),t.format(r,n,e)},r.prototype.copy=function(e){return t.prototype.copy.call(this,e),e.value&&(this.value=e.value),this.uv=e.uv,e.bias&&(this.bias=e.bias),this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).value=this.value.uuid,e.uv=this.uv.toJSON(t).uuid,this.bias&&(e.bias=this.bias.toJSON(t).uuid)),e},r});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/CubeTextureNode.js.map
