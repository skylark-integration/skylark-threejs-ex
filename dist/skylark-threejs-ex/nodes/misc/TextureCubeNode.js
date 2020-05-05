/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../inputs/FloatNode","./TextureCubeUVNode","../accessors/ReflectNode","../accessors/NormalNode"],function(e,t,o,r,i){"use strict";function o(o,a,n){e.call(this,"v4"),this.value=o,this.radianceNode=new TextureCubeUVNode(this.value,a||new r(r.VECTOR),n),this.irradianceNode=new TextureCubeUVNode(this.value,new i(i.WORLD),new t(1).setReadonly(!0))}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype.nodeType="TextureCube",o.prototype.generate=function(e,t){return e.isShader("fragment")?(e.require("irradiance"),e.context.bias&&e.context.bias.setTexture(this.value),("irradiance"===e.slot?this.irradianceNode:this.radianceNode).build(e,t)):(console.warn("THREE.TextureCubeNode is not compatible with "+e.shader+" shader."),e.format("vec4( 0.0 )",this.getType(e),t))},o.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.value=t.value,this},o.prototype.toJSON=function(e){var t=this.getJSONNode(e);return t||((t=this.createJSONNode(e)).value=this.value.toJSON(e).uuid),t},o});
//# sourceMappingURL=../../sourcemaps/nodes/misc/TextureCubeNode.js.map
