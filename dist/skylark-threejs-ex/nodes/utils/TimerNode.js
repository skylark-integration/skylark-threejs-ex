/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../inputs/FloatNode","../core/NodeLib"],function(t,e){"use strict";function o(e,i,c){t.call(this),this.scale=void 0!==e?e:1,this.scope=i||o.GLOBAL,this.timeScale=void 0!==c?c:void 0!==e}return o.GLOBAL="global",o.LOCAL="local",o.DELTA="delta",o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.prototype.nodeType="Timer",o.prototype.getReadonly=function(){return!1},o.prototype.getUnique=function(){return this.timeScale&&(this.scope===o.GLOBAL||this.scope===o.DELTA)},o.prototype.updateFrame=function(t){var e=this.timeScale?this.scale:1;switch(this.scope){case o.LOCAL:this.value+=t.delta*e;break;case o.DELTA:this.value=t.delta*e;break;default:this.value=t.time*e}},o.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.scope=e.scope,this.scale=e.scale,this.timeScale=e.timeScale,this},o.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).scope=this.scope,e.scale=this.scale,e.timeScale=this.timeScale),e},e.addKeyword("time",function(){return new o}),o});
//# sourceMappingURL=../../sourcemaps/nodes/utils/TimerNode.js.map
