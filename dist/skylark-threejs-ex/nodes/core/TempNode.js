/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./Node"],function(t,e){"use strict";function r(t,r){e.call(this,t),r=r||{},this.shared=void 0===r.shared||r.shared,this.unique=void 0!==r.unique&&r.unique}return r.prototype=Object.create(e.prototype),r.prototype.constructor=r,r.prototype.build=function(i,o,u,n){if(o=o||this.getType(i),this.getShared(i,o)){var s=this.getUnique(i,o);s&&void 0===this.constructor.uuid&&(this.constructor.uuid=t.MathUtils.generateUUID()),u=i.getUuid(u||this.getUuid(),!s);var a=i.getNodeData(u),p=a.output||this.getType(i);if(i.analyzing)return(a.deps||0)>0||this.getLabel()?(this.appendDepsNode(i,a,o),this.generate(i,o,u)):e.prototype.build.call(this,i,o,u);if(s)return a.name=a.name||e.prototype.build.call(this,i,o,u),a.name;if(!this.getLabel()&&(!this.getShared(i,p)||i.context.ignoreCache||1===a.deps))return e.prototype.build.call(this,i,o,u);u=this.getUuid(!1);var h=this.getTemp(i,u);if(h)return i.format(h,p,o);h=r.prototype.generate.call(this,i,o,u,a.output,n);var d=this.generate(i,p,u);return i.addNodeCode(h+" = "+d+";"),i.format(h,p,o)}return e.prototype.build.call(this,i,o,u)},r.prototype.getShared=function(t,e){return"sampler2D"!==e&&"samplerCube"!==e&&this.shared},r.prototype.getUnique=function(){return this.unique},r.prototype.setLabel=function(t){return this.label=t,this},r.prototype.getLabel=function(){return this.label},r.prototype.getUuid=function(t){var e=(t||void 0==t)&&this.constructor.uuid||this.uuid;return"string"==typeof this.scope&&(e=this.scope+"-"+e),e},r.prototype.getTemp=function(t,e){e=e||this.uuid;var r=t.getVars()[e];return r?r.name:void 0},r.prototype.generate=function(t,e,r,i,o){return this.getShared(t,e)||console.error("THREE.TempNode is not shared!"),r=r||this.uuid,t.getTempVar(r,i||this.getType(t),o,this.getLabel()).name},r});
//# sourceMappingURL=../../sourcemaps/nodes/core/TempNode.js.map
