/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../../postprocessing/ShaderPass","../materials/NodeMaterial","../inputs/ScreenNode"],function(t,e,s,i){"use strict";function r(){e.call(this),this.name="",this.uuid=t.MathUtils.generateUUID(),this.userData={},this.textureID="renderTexture",this.input=new i,this.material=new s,this.needsUpdate=!0}return r.prototype=Object.create(e.prototype),r.prototype.constructor=r,r.prototype.render=function(){this.needsUpdate&&(this.material.dispose(),this.material.fragment.value=this.input,this.needsUpdate=!1),this.uniforms=this.material.uniforms,e.prototype.render.apply(this,arguments)},r.prototype.copy=function(t){return this.input=t.input,this},r.prototype.toJSON=function(t){if((void 0===t||"string"==typeof t)&&(t={nodes:{}}),t&&!t.passes&&(t.passes={}),!t.passes[this.uuid]){var e={};e.uuid=this.uuid,e.type="NodePass",t.passes[this.uuid]=e,""!==this.name&&(e.name=this.name),"{}"!==JSON.stringify(this.userData)&&(e.userData=this.userData),e.input=this.input.toJSON(t).uuid}return t.pass=this.uuid,t},r});
//# sourceMappingURL=../../sourcemaps/nodes/postprocessing/NodePass.js.map
