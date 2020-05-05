/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/InputNode","./TextureNode"],function(t,e){"use strict";function o(t){e.call(this,void 0,t)}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype.nodeType="Screen",o.prototype.getUnique=function(){return!0},o.prototype.getTexture=function(e,o){return t.prototype.generate.call(this,e,o,this.getUuid(),"t","renderTexture")},o});
//# sourceMappingURL=../../sourcemaps/nodes/inputs/ScreenNode.js.map
