/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./StandardNode","../../inputs/PropertyNode","../../math/OperatorNode","../../utils/SwitchNode","../../misc/NormalMapNode"],function(e,o,t,r,s,n){"use strict";function a(){o.call(this),this.properties={color:new e.Color(16777215),roughness:.5,metalness:.5,normalScale:new e.Vector2(1,1)},this.inputs={color:new t(this.properties,"color","c"),roughness:new t(this.properties,"roughness","f"),metalness:new t(this.properties,"metalness","f"),normalScale:new t(this.properties,"normalScale","v2")}}return a.prototype=Object.create(o.prototype),a.prototype.constructor=a,a.prototype.nodeType="MeshStandard",a.prototype.build=function(e){var t=this.properties,a=this.inputs;if(e.isShader("fragment")){var i=e.findNode(t.color,a.color),l=e.resolve(t.map);this.color=l?new r(i,l,r.MUL):i;var p=e.findNode(t.roughness,a.roughness),h=e.resolve(t.roughnessMap);this.roughness=h?new r(p,new s(h,"g"),r.MUL):p;var c=e.findNode(t.metalness,a.metalness),d=e.resolve(t.metalnessMap);this.metalness=d?new r(c,new s(d,"b"),r.MUL):c,t.normalMap?(this.normal=new n(e.resolve(t.normalMap)),this.normal.scale=e.findNode(t.normalScale,a.normalScale)):this.normal=void 0,this.environment=e.resolve(t.envMap)}return o.prototype.build.call(this,e)},a.prototype.toJSON=function(e){var o=this.getJSONNode(e);return o||(o=this.createJSONNode(e),console.warn(".toJSON not implemented in",this)),o},a});
//# sourceMappingURL=../../../sourcemaps/nodes/materials/nodes/MeshStandardNode.js.map
