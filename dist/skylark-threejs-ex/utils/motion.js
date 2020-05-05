/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";const e={Handedness:Object.freeze({NONE:"none",LEFT:"left",RIGHT:"right"}),ComponentState:Object.freeze({DEFAULT:"default",TOUCHED:"touched",PRESSED:"pressed"}),ComponentProperty:Object.freeze({BUTTON:"button",X_AXIS:"xAxis",Y_AXIS:"yAxis",STATE:"state"}),ComponentType:Object.freeze({TRIGGER:"trigger",SQUEEZE:"squeeze",TOUCHPAD:"touchpad",THUMBSTICK:"thumbstick",BUTTON:"button"}),ButtonTouchThreshold:.05,AxisTouchThreshold:.1,VisualResponseProperty:Object.freeze({TRANSFORM:"transform",VISIBILITY:"visibility"})};async function t(e){const t=await fetch(e);if(t.ok)return t.json();throw new Error(t.statusText)}async function s(e){if(!e)throw new Error("No basePath supplied");return await t(`${e}/profilesList.json`)}const o={xAxis:0,yAxis:0,button:0,state:e.ComponentState.DEFAULT};class a{constructor(t){this.componentProperty=t.componentProperty,this.states=t.states,this.valueNodeName=t.valueNodeName,this.valueNodeProperty=t.valueNodeProperty,this.valueNodeProperty===e.VisualResponseProperty.TRANSFORM&&(this.minNodeName=t.minNodeName,this.maxNodeName=t.maxNodeName),this.value=0,this.updateFromComponent(o)}updateFromComponent({xAxis:t,yAxis:s,button:o,state:a}){const{normalizedXAxis:i,normalizedYAxis:n}=function(e=0,t=0){let s=e,o=t;if(Math.sqrt(e*e+t*t)>1){const a=Math.atan2(t,e);s=Math.cos(a),o=Math.sin(a)}return{normalizedXAxis:.5*s+.5,normalizedYAxis:.5*o+.5}}(t,s);switch(this.componentProperty){case e.ComponentProperty.X_AXIS:this.value=this.states.includes(a)?i:.5;break;case e.ComponentProperty.Y_AXIS:this.value=this.states.includes(a)?n:.5;break;case e.ComponentProperty.BUTTON:this.value=this.states.includes(a)?o:0;break;case e.ComponentProperty.STATE:this.valueNodeProperty===e.VisualResponseProperty.VISIBILITY?this.value=this.states.includes(a):this.value=this.states.includes(a)?1:0;break;default:throw new Error(`Unexpected visualResponse componentProperty ${this.componentProperty}`)}}}class i{constructor(t,s){if(!(t&&s&&s.visualResponses&&s.gamepadIndices&&0!==Object.keys(s.gamepadIndices).length))throw new Error("Invalid arguments supplied");this.id=t,this.type=s.type,this.rootNodeName=s.rootNodeName,this.touchPointNodeName=s.touchPointNodeName,this.visualResponses={},Object.keys(s.visualResponses).forEach(e=>{const t=new a(s.visualResponses[e]);this.visualResponses[e]=t}),this.gamepadIndices=Object.assign({},s.gamepadIndices),this.values={state:e.ComponentState.DEFAULT,button:void 0!==this.gamepadIndices.button?0:void 0,xAxis:void 0!==this.gamepadIndices.xAxis?0:void 0,yAxis:void 0!==this.gamepadIndices.yAxis?0:void 0}}get data(){return{id:this.id,...this.values}}updateFromGamepad(t){if(this.values.state=e.ComponentState.DEFAULT,void 0!==this.gamepadIndices.button&&t.buttons.length>this.gamepadIndices.button){const s=t.buttons[this.gamepadIndices.button];this.values.button=s.value,this.values.button=this.values.button<0?0:this.values.button,this.values.button=this.values.button>1?1:this.values.button,s.pressed||1===this.values.button?this.values.state=e.ComponentState.PRESSED:(s.touched||this.values.button>e.ButtonTouchThreshold)&&(this.values.state=e.ComponentState.TOUCHED)}void 0!==this.gamepadIndices.xAxis&&t.axes.length>this.gamepadIndices.xAxis&&(this.values.xAxis=t.axes[this.gamepadIndices.xAxis],this.values.xAxis=this.values.xAxis<-1?-1:this.values.xAxis,this.values.xAxis=this.values.xAxis>1?1:this.values.xAxis,this.values.state===e.ComponentState.DEFAULT&&Math.abs(this.values.xAxis)>e.AxisTouchThreshold&&(this.values.state=e.ComponentState.TOUCHED)),void 0!==this.gamepadIndices.yAxis&&t.axes.length>this.gamepadIndices.yAxis&&(this.values.yAxis=t.axes[this.gamepadIndices.yAxis],this.values.yAxis=this.values.yAxis<-1?-1:this.values.yAxis,this.values.yAxis=this.values.yAxis>1?1:this.values.yAxis,this.values.state===e.ComponentState.DEFAULT&&Math.abs(this.values.yAxis)>e.AxisTouchThreshold&&(this.values.state=e.ComponentState.TOUCHED)),Object.values(this.visualResponses).forEach(e=>{e.updateFromComponent(this.values)})}}return{Constants:e,MotionController:class{constructor(e,t,s){if(!e)throw new Error("No xrInputSource supplied");if(!t)throw new Error("No profile supplied");this.xrInputSource=e,this.assetUrl=s,this.id=t.profileId,this.layoutDescription=t.layouts[e.handedness],this.components={},Object.keys(this.layoutDescription.components).forEach(e=>{const t=this.layoutDescription.components[e];this.components[e]=new i(e,t)}),this.updateFromGamepad()}get gripSpace(){return this.xrInputSource.gripSpace}get targetRaySpace(){return this.xrInputSource.targetRaySpace}get data(){const e=[];return Object.values(this.components).forEach(t=>{e.push(t.data)}),e}updateFromGamepad(){Object.values(this.components).forEach(e=>{e.updateFromGamepad(this.xrInputSource.gamepad)})}},fetchProfile:async function(e,o,a=null,i=!0){if(!e)throw new Error("No xrInputSource supplied");if(!o)throw new Error("No basePath supplied");const n=await s(o);let r;if(e.profiles.some(e=>{const t=n[e];return t&&(r={profileId:e,profilePath:`${o}/${t.path}`,deprecated:!!t.deprecated}),!!r}),!r){if(!a)throw new Error("No matching profile name found");const e=n[a];if(!e)throw new Error(`No matching profile name found and default profile "${a}" missing.`);r={profileId:a,profilePath:`${o}/${e.path}`,deprecated:!!e.deprecated}}const h=await t(r.profilePath);let u;if(i){let t;if(!(t="any"===e.handedness?h.layouts[Object.keys(h.layouts)[0]]:h.layouts[e.handedness]))throw new Error(`No matching handedness, ${e.handedness}, in profile ${r.profileId}`);t.assetPath&&(u=r.profilePath.replace("profile.json",t.assetPath))}return{profile:h,assetPath:u}},fetchProfilesList:s}});
//# sourceMappingURL=../sourcemaps/utils/motion.js.map
