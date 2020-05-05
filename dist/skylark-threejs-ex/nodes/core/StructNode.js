/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./TempNode"],function(t){"use strict";var e=/^struct\s*([a-z_0-9]+)\s*{\s*((.|\n)*?)}/gim,r=/\s*(\w*?)\s*(\w*?)(\=|\;)/gim;function s(e){t.call(this),this.parse(e)}return s.prototype=Object.create(t.prototype),s.prototype.constructor=s,s.prototype.nodeType="Struct",s.prototype.getType=function(t){return t.getTypeByFormat(this.name)},s.prototype.getInputByName=function(t){for(var e=this.inputs.length;e--;)if(this.inputs[e].name===t)return this.inputs[e]},s.prototype.generate=function(t,e){return"source"===e?this.src+";":t.format("( "+this.src+" )",this.getType(t),e)},s.prototype.parse=function(t){this.src=t||"",this.inputs=[];var s=e.exec(this.src);if(s){for(var i,n=s[2];i=r.exec(n);)this.inputs.push({type:i[1],name:i[2]});this.name=s[1]}else this.name="";this.type=this.name},s.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).src=this.src),e},s});
//# sourceMappingURL=../../sourcemaps/nodes/core/StructNode.js.map
