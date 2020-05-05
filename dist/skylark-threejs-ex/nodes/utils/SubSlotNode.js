/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode"],function(t){"use strict";function o(o){t.call(this),this.slots=o||{}}return o.prototype=Object.create(t.prototype),o.prototype.constructor=o,o.prototype.nodeType="SubSlot",o.prototype.getType=function(t,o){return o},o.prototype.generate=function(t,o){return this.slots[t.slot]?this.slots[t.slot].build(t,o):t.format("0.0","f",o)},o.prototype.copy=function(o){for(var s in t.prototype.copy.call(this,o),o.slots)this.slots[s]=o.slots[s];return this},o.prototype.toJSON=function(t){var o=this.getJSONNode(t);if(!o)for(var s in(o=this.createJSONNode(t)).slots={},this.slots){var e=this.slots[s];e&&(o.slots[s]=e.toJSON(t).uuid)}return o},o});
//# sourceMappingURL=../../sourcemaps/nodes/utils/SubSlotNode.js.map
