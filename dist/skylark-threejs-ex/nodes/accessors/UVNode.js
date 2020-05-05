/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","../core/NodeLib"],function(e,t){"use strict";function o(t){e.call(this,"v2",{shared:!1}),this.index=t||0}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype.nodeType="UV",o.prototype.generate=function(e,t){e.requires.uv[this.index]=!0;var o=this.index>0?this.index+1:"",r=e.isShader("vertex")?"uv"+o:"vUv"+o;return e.format(r,this.getType(e),t)},o.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.index=t.index,this},o.prototype.toJSON=function(e){var t=this.getJSONNode(e);return t||((t=this.createJSONNode(e)).index=this.index),t},t.addKeyword("uv",function(){return new o}),t.addKeyword("uv2",function(){return new o(1)}),o});
//# sourceMappingURL=../../sourcemaps/nodes/accessors/UVNode.js.map
