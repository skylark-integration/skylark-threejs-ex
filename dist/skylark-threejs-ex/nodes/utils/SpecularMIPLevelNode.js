/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/FunctionNode","./MaxMIPLevelNode"],function(e,t,r){"use strict";function o(t,r){e.call(this,"f"),this.roughness=t,this.texture=r,this.maxMIPLevel=void 0}return o.Nodes={getSpecularMIPLevel:new t(["float getSpecularMIPLevel( const in float roughness, const in float maxMIPLevelScalar ) {","\tfloat sigma = PI * roughness * roughness / ( 1.0 + roughness );","\tfloat desiredMIPLevel = maxMIPLevelScalar + log2( sigma );","\treturn clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );","}"].join("\n"))},o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype.nodeType="SpecularMIPLevel",o.prototype.setTexture=function(e){return this.texture=e,this},o.prototype.generate=function(e,t){if(e.isShader("fragment")){this.maxMIPLevel=this.maxMIPLevel||new r,this.maxMIPLevel.texture=this.texture;var s=e.include(o.Nodes.getSpecularMIPLevel);return e.format(s+"( "+this.roughness.build(e,"f")+", "+this.maxMIPLevel.build(e,"f")+" )",this.type,t)}return console.warn("THREE.SpecularMIPLevelNode is not compatible with "+e.shader+" shader."),e.format("0.0",this.type,t)},o.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.texture=t.texture,this.roughness=t.roughness,this},o.prototype.toJSON=function(e){var t=this.getJSONNode(e);return t||((t=this.createJSONNode(e)).texture=this.texture,t.roughness=this.roughness),t},o});
//# sourceMappingURL=../../sourcemaps/nodes/utils/SpecularMIPLevelNode.js.map
