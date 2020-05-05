/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/InputNode","../accessors/PositionNode","../math/OperatorNode","./TextureNode","./Matrix4Node"],function(t,e,r,o,i,s){"use strict";function u(e){t.call(this,"v4"),e&&this.setMirror(e)}return u.prototype=Object.create(t.prototype),u.prototype.constructor=u,u.prototype.nodeType="Reflector",u.prototype.setMirror=function(t){this.mirror=t,this.textureMatrix=new s(this.mirror.material.uniforms.textureMatrix.value),this.localPosition=new r(r.LOCAL),this.uv=new o(this.textureMatrix,this.localPosition,o.MUL),this.uvResult=new o(null,this.uv,o.ADD),this.texture=new i(this.mirror.material.uniforms.tDiffuse.value,this.uv,null,!0)},u.prototype.generate=function(t,e){return t.isShader("fragment")?(this.uvResult.a=this.offset,this.texture.uv=this.offset?this.uvResult:this.uv,"sampler2D"===e?this.texture.build(t,e):t.format(this.texture.build(t,this.type),this.type,e)):(console.warn("THREE.ReflectorNode is not compatible with "+t.shader+" shader."),t.format("vec4( 0.0 )",this.type,e))},u.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.scope.mirror=t.mirror,this},u.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).mirror=this.mirror.uuid,this.offset&&(e.offset=this.offset.toJSON(t).uuid)),e},u});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/ReflectorNode.js.map
