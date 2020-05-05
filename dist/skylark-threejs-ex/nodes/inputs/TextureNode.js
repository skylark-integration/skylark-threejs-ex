/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/InputNode","../accessors/UVNode","../utils/ColorSpaceNode","../core/ExpressionNode"],function(t,e,o,i){"use strict";function r(o,i,r,s){t.call(this,"v4",{shared:!0}),this.value=o,this.uv=i||new e,this.bias=r,this.project=void 0!==s&&s}return r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.nodeType="Texture",r.prototype.getTexture=function(e,o){return t.prototype.generate.call(this,e,o,this.value.uuid,"t")},r.prototype.generate=function(t,e){if("sampler2D"===e)return this.getTexture(t,e);var r,s,u=this.getTexture(t,e),a=this.uv.build(t,this.project?"v4":"v2"),c=this.bias?this.bias.build(t,"f"):void 0;void 0===c&&t.context.bias&&(c=t.context.bias.setTexture(this).build(t,"f")),r=this.project?"texture2DProj":c?"tex2DBias":"tex2D",s=c?r+"( "+u+", "+a+", "+c+" )":r+"( "+u+", "+a+" )";var p={include:t.isShader("vertex"),ignoreCache:!0},h=this.getType(t);return t.addContext(p),this.colorSpace=this.colorSpace||new o(new i("",h)),this.colorSpace.fromDecoding(t.getTextureEncodingFromMap(this.value)),this.colorSpace.input.parse(s),s=this.colorSpace.build(t,h),t.removeContext(),t.format(s,h,e)},r.prototype.copy=function(e){return t.prototype.copy.call(this,e),e.value&&(this.value=e.value),this.uv=e.uv,e.bias&&(this.bias=e.bias),void 0!==e.project&&(this.project=e.project),this},r.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||(e=this.createJSONNode(t),this.value&&(e.value=this.value.uuid),e.uv=this.uv.toJSON(t).uuid,e.project=this.project,this.bias&&(e.bias=this.bias.toJSON(t).uuid)),e},r});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/TextureNode.js.map