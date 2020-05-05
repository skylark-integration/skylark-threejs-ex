/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/NodeLib"],function(e,r){"use strict";function o(r){e.call(this,"v3"),this.scope=r||o.VIEW}return o.LOCAL="local",o.WORLD="world",o.VIEW="view",o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype.nodeType="Normal",o.prototype.getShared=function(){return this.scope===o.WORLD},o.prototype.build=function(r,o,t,n){var i=r.context[this.scope+"Normal"];return i?i.build(r,o,t,n):e.prototype.build.call(this,r,o,t)},o.prototype.generate=function(e,r){var t;switch(this.scope){case o.VIEW:t=e.isShader("vertex")?"transformedNormal":"geometryNormal";break;case o.LOCAL:e.isShader("vertex")?t="objectNormal":(e.requires.normal=!0,t="vObjectNormal");break;case o.WORLD:e.isShader("vertex")?t="inverseTransformDirection( transformedNormal, viewMatrix ).xyz":(e.requires.worldNormal=!0,t="vWNormal")}return e.format(t,this.getType(e),r)},o.prototype.copy=function(r){return e.prototype.copy.call(this,r),this.scope=r.scope,this},o.prototype.toJSON=function(e){var r=this.getJSONNode(e);return r||((r=this.createJSONNode(e)).scope=this.scope),r},r.addKeyword("viewNormal",function(){return new o(o.VIEW)}),r.addKeyword("localNormal",function(){return new o(o.NORMAL)}),r.addKeyword("worldNormal",function(){return new o(o.WORLD)}),o});
//# sourceMappingURL=../../sourcemaps/nodes/accessors/NormalNode.js.map
