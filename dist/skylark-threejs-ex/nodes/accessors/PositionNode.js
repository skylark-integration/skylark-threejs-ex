/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/NodeLib"],function(e,t){"use strict";function o(t){e.call(this,"v3"),this.scope=t||o.LOCAL}return o.LOCAL="local",o.WORLD="world",o.VIEW="view",o.PROJECTION="projection",o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype.nodeType="Position",o.prototype.getType=function(){switch(this.scope){case o.PROJECTION:return"v4"}return this.type},o.prototype.getShared=function(){switch(this.scope){case o.LOCAL:case o.WORLD:return!1}return!0},o.prototype.generate=function(e,t){var r;switch(this.scope){case o.LOCAL:e.isShader("vertex")?r="transformed":(e.requires.position=!0,r="vPosition");break;case o.WORLD:if(e.isShader("vertex"))return"( modelMatrix * vec4( transformed, 1.0 ) ).xyz";e.requires.worldPosition=!0,r="vWPosition";break;case o.VIEW:r=e.isShader("vertex")?"-mvPosition.xyz":"vViewPosition";break;case o.PROJECTION:r=e.isShader("vertex")?"( projectionMatrix * modelViewMatrix * vec4( position, 1.0 ) )":"vec4( 0.0 )"}return e.format(r,this.getType(e),t)},o.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.scope=t.scope,this},o.prototype.toJSON=function(e){var t=this.getJSONNode(e);return t||((t=this.createJSONNode(e)).scope=this.scope),t},t.addKeyword("position",function(){return new o}),t.addKeyword("worldPosition",function(){return new o(o.WORLD)}),t.addKeyword("viewPosition",function(){return new o(o.VIEW)}),o});
//# sourceMappingURL=../../sourcemaps/nodes/accessors/PositionNode.js.map
