/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./TempNode"],function(t){"use strict";var e=/^([a-z_0-9]+)\s([a-z_0-9]+)\s?\=?\s?(.*?)(\;|$)/i;function s(e,i){t.call(this),this.parse(e||s.PI,i)}return s.PI="PI",s.PI2="PI2",s.RECIPROCAL_PI="RECIPROCAL_PI",s.RECIPROCAL_PI2="RECIPROCAL_PI2",s.LOG2="LOG2",s.EPSILON="EPSILON",s.prototype=Object.create(t.prototype),s.prototype.constructor=s,s.prototype.nodeType="Const",s.prototype.getType=function(t){return t.getTypeByFormat(this.type)},s.prototype.parse=function(t,s){this.src=t||"";var i,r,o="",n=this.src.match(e);this.useDefine=s||"#"===this.src.charAt(0),n&&n.length>1?(r=n[1],i=n[2],o=n[3]):(i=this.src,r="f"),this.name=i,this.type=r,this.value=o},s.prototype.build=function(t,e){return"source"!==e?(t.include(this),t.format(this.name,this.getType(t),e)):this.value?this.useDefine?"#define "+this.name+" "+this.value:"const "+this.type+" "+this.name+" = "+this.value+";":this.useDefine?this.src:void 0},s.prototype.generate=function(t,e){return t.format(this.name,this.getType(t),e)},s.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.parse(e.src,e.useDefine),this},s.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).src=this.src,!0===e.useDefine&&(e.useDefine=!0)),e},s});
//# sourceMappingURL=../../sourcemaps/nodes/core/ConstNode.js.map
