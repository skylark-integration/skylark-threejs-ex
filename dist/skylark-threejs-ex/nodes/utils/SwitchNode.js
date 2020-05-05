/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/Node"],function(t){"use strict";function e(e,o){t.call(this),this.node=e,this.components=o||"x"}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Switch",e.prototype.getType=function(t){return t.getTypeFromLength(this.components.length)},e.prototype.generate=function(t,e){var o=this.node.getType(t),n=this.node.build(t,o),r=t.getTypeLength(o)-1;if(r>0){var p,c=0,i=t.colorToVectorProperties(this.components),s=i.length;for(p=0;p<s;p++)c=Math.max(c,t.getIndexByElement(i.charAt(p)));for(c>r&&(c=r),n+=".",p=0;p<s;p++){var h=t.getIndexByElement(i.charAt(p));h>c&&(h=c),n+=t.getElementByIndex(h)}return t.format(n,this.getType(t),e)}return t.format(n,o,e)},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.node=e.node,this.components=e.components,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).node=this.node.toJSON(t).uuid,e.components=this.components),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/utils/SwitchNode.js.map
