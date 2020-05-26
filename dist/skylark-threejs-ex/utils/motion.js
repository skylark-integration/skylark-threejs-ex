/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(e){"use strict";const t={Handedness:Object.freeze({NONE:"none",LEFT:"left",RIGHT:"right"}),ComponentState:Object.freeze({DEFAULT:"default",TOUCHED:"touched",PRESSED:"pressed"}),ComponentProperty:Object.freeze({BUTTON:"button",X_AXIS:"xAxis",Y_AXIS:"yAxis",STATE:"state"}),ComponentType:Object.freeze({TRIGGER:"trigger",SQUEEZE:"squeeze",TOUCHPAD:"touchpad",THUMBSTICK:"thumbstick",BUTTON:"button"}),ButtonTouchThreshold:.05,AxisTouchThreshold:.1,VisualResponseProperty:Object.freeze({TRANSFORM:"transform",VISIBILITY:"visibility"})};async function s(e){const t=await fetch(e);if(t.ok)return t.json();throw new Error(t.statusText)}async function o(e){if(!e)throw new Error("No basePath supplied");return await s(`${e}/profilesList.json`)}const i={xAxis:0,yAxis:0,button:0,state:t.ComponentState.DEFAULT};class a{constructor(e){this.componentProperty=e.componentProperty,this.states=e.states,this.valueNodeName=e.valueNodeName,this.valueNodeProperty=e.valueNodeProperty,this.valueNodeProperty===t.VisualResponseProperty.TRANSFORM&&(this.minNodeName=e.minNodeName,this.maxNodeName=e.maxNodeName),this.value=0,this.updateFromComponent(i)}updateFromComponent({xAxis:e,yAxis:s,button:o,state:i}){const{normalizedXAxis:a,normalizedYAxis:n}=function(e=0,t=0){let s=e,o=t;if(Math.sqrt(e*e+t*t)>1){const i=Math.atan2(t,e);s=Math.cos(i),o=Math.sin(i)}return{normalizedXAxis:.5*s+.5,normalizedYAxis:.5*o+.5}}(e,s);switch(this.componentProperty){case t.ComponentProperty.X_AXIS:this.value=this.states.includes(i)?a:.5;break;case t.ComponentProperty.Y_AXIS:this.value=this.states.includes(i)?n:.5;break;case t.ComponentProperty.BUTTON:this.value=this.states.includes(i)?o:0;break;case t.ComponentProperty.STATE:this.valueNodeProperty===t.VisualResponseProperty.VISIBILITY?this.value=this.states.includes(i):this.value=this.states.includes(i)?1:0;break;default:throw new Error(`Unexpected visualResponse componentProperty ${this.componentProperty}`)}}}class n{constructor(e,s){if(!(e&&s&&s.visualResponses&&s.gamepadIndices&&0!==Object.keys(s.gamepadIndices).length))throw new Error("Invalid arguments supplied");this.id=e,this.type=s.type,this.rootNodeName=s.rootNodeName,this.touchPointNodeName=s.touchPointNodeName,this.visualResponses={},Object.keys(s.visualResponses).forEach(e=>{const t=new a(s.visualResponses[e]);this.visualResponses[e]=t}),this.gamepadIndices=Object.assign({},s.gamepadIndices),this.values={state:t.ComponentState.DEFAULT,button:void 0!==this.gamepadIndices.button?0:void 0,xAxis:void 0!==this.gamepadIndices.xAxis?0:void 0,yAxis:void 0!==this.gamepadIndices.yAxis?0:void 0}}get data(){return{id:this.id,...this.values}}updateFromGamepad(e){if(this.values.state=t.ComponentState.DEFAULT,void 0!==this.gamepadIndices.button&&e.buttons.length>this.gamepadIndices.button){const s=e.buttons[this.gamepadIndices.button];this.values.button=s.value,this.values.button=this.values.button<0?0:this.values.button,this.values.button=this.values.button>1?1:this.values.button,s.pressed||1===this.values.button?this.values.state=t.ComponentState.PRESSED:(s.touched||this.values.button>t.ButtonTouchThreshold)&&(this.values.state=t.ComponentState.TOUCHED)}void 0!==this.gamepadIndices.xAxis&&e.axes.length>this.gamepadIndices.xAxis&&(this.values.xAxis=e.axes[this.gamepadIndices.xAxis],this.values.xAxis=this.values.xAxis<-1?-1:this.values.xAxis,this.values.xAxis=this.values.xAxis>1?1:this.values.xAxis,this.values.state===t.ComponentState.DEFAULT&&Math.abs(this.values.xAxis)>t.AxisTouchThreshold&&(this.values.state=t.ComponentState.TOUCHED)),void 0!==this.gamepadIndices.yAxis&&e.axes.length>this.gamepadIndices.yAxis&&(this.values.yAxis=e.axes[this.gamepadIndices.yAxis],this.values.yAxis=this.values.yAxis<-1?-1:this.values.yAxis,this.values.yAxis=this.values.yAxis>1?1:this.values.yAxis,this.values.state===t.ComponentState.DEFAULT&&Math.abs(this.values.yAxis)>t.AxisTouchThreshold&&(this.values.state=t.ComponentState.TOUCHED)),Object.values(this.visualResponses).forEach(e=>{e.updateFromComponent(this.values)})}}return e.utils.motion={Constants:t,MotionController:class{constructor(e,t,s){if(!e)throw new Error("No xrInputSource supplied");if(!t)throw new Error("No profile supplied");this.xrInputSource=e,this.assetUrl=s,this.id=t.profileId,this.layoutDescription=t.layouts[e.handedness],this.components={},Object.keys(this.layoutDescription.components).forEach(e=>{const t=this.layoutDescription.components[e];this.components[e]=new n(e,t)}),this.updateFromGamepad()}get gripSpace(){return this.xrInputSource.gripSpace}get targetRaySpace(){return this.xrInputSource.targetRaySpace}get data(){const e=[];return Object.values(this.components).forEach(t=>{e.push(t.data)}),e}updateFromGamepad(){Object.values(this.components).forEach(e=>{e.updateFromGamepad(this.xrInputSource.gamepad)})}},fetchProfile:async function(e,t,i=null,a=!0){if(!e)throw new Error("No xrInputSource supplied");if(!t)throw new Error("No basePath supplied");const n=await o(t);let r;if(e.profiles.some(e=>{const s=n[e];return s&&(r={profileId:e,profilePath:`${t}/${s.path}`,deprecated:!!s.deprecated}),!!r}),!r){if(!i)throw new Error("No matching profile name found");const e=n[i];if(!e)throw new Error(`No matching profile name found and default profile "${i}" missing.`);r={profileId:i,profilePath:`${t}/${e.path}`,deprecated:!!e.deprecated}}const h=await s(r.profilePath);let u;if(a){let t;if(!(t="any"===e.handedness?h.layouts[Object.keys(h.layouts)[0]]:h.layouts[e.handedness]))throw new Error(`No matching handedness, ${e.handedness}, in profile ${r.profileId}`);t.assetPath&&(u=r.profilePath.replace("profile.json",t.assetPath))}return{profile:h,assetPath:u}},fetchProfilesList:o}});
//# sourceMappingURL=../sourcemaps/utils/motion.js.map
