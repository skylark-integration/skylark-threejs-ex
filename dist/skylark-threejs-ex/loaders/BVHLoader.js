/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var o=function(t){e.Loader.call(this,t),this.animateBonePositions=!0,this.animateBoneRotations=!0};return o.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:o,load:function(t,o,r,a){var n=this,i=new e.FileLoader(n.manager);i.setPath(n.path),i.load(t,function(e){o(n.parse(e))},r,a)},parse:function(t){function o(t,r,a){if("ENDSITE"!==a.type){var n={time:r,position:new e.Vector3,rotation:new e.Quaternion};a.frames.push(n);for(var i=new e.Quaternion,s=new e.Vector3(1,0,0),p=new e.Vector3(0,1,0),l=new e.Vector3(0,0,1),c=0;c<a.channels.length;c++)switch(a.channels[c]){case"Xposition":n.position.x=parseFloat(t.shift().trim());break;case"Yposition":n.position.y=parseFloat(t.shift().trim());break;case"Zposition":n.position.z=parseFloat(t.shift().trim());break;case"Xrotation":i.setFromAxisAngle(s,parseFloat(t.shift().trim())*Math.PI/180),n.rotation.multiply(i);break;case"Yrotation":i.setFromAxisAngle(p,parseFloat(t.shift().trim())*Math.PI/180),n.rotation.multiply(i);break;case"Zrotation":i.setFromAxisAngle(l,parseFloat(t.shift().trim())*Math.PI/180),n.rotation.multiply(i);break;default:console.warn("THREE.BVHLoader: Invalid channel type.")}for(c=0;c<a.children.length;c++)o(t,r,a.children[c])}}function r(e){for(var t;0===(t=e.shift().trim()).length;);return t}var a=this,n=function(t){"HIERARCHY"!==r(t)&&console.error("THREE.BVHLoader: HIERARCHY expected.");var a=[],n=function t(o,a,n){var i={name:"",type:"",frames:[]};n.push(i);var s=a.split(/[\s]+/);"END"===s[0].toUpperCase()&&"SITE"===s[1].toUpperCase()?(i.type="ENDSITE",i.name="ENDSITE"):(i.name=s[1],i.type=s[0].toUpperCase()),"{"!==r(o)&&console.error("THREE.BVHLoader: Expected opening { after type & name"),"OFFSET"!==(s=r(o).split(/[\s]+/))[0]&&console.error("THREE.BVHLoader: Expected OFFSET but got: "+s[0]),4!==s.length&&console.error("THREE.BVHLoader: Invalid number of values for OFFSET.");var p=new e.Vector3(parseFloat(s[1]),parseFloat(s[2]),parseFloat(s[3]));if((isNaN(p.x)||isNaN(p.y)||isNaN(p.z))&&console.error("THREE.BVHLoader: Invalid values of OFFSET."),i.offset=p,"ENDSITE"!==i.type){"CHANNELS"!==(s=r(o).split(/[\s]+/))[0]&&console.error("THREE.BVHLoader: Expected CHANNELS definition.");var l=parseInt(s[1]);i.channels=s.splice(2,l),i.children=[]}for(;;){var c=r(o);if("}"===c)return i;i.children.push(t(o,c,n))}}(t,r(t),a);"MOTION"!==r(t)&&console.error("THREE.BVHLoader: MOTION expected.");var i=r(t).split(/[\s]+/),s=parseInt(i[1]);isNaN(s)&&console.error("THREE.BVHLoader: Failed to read number of frames."),i=r(t).split(/[\s]+/);var p=parseFloat(i[2]);isNaN(p)&&console.error("THREE.BVHLoader: Failed to read frame time.");for(var l=0;l<s;l++)o(i=r(t).split(/[\s]+/),l*p,n);return a}(t.split(/[\r\n]+/g)),i=[];!function t(o,r){var a=new e.Bone;if(r.push(a),a.position.add(o.offset),a.name=o.name,"ENDSITE"!==o.type)for(var n=0;n<o.children.length;n++)a.add(t(o.children[n],r));return a}(n[0],i);var s=function(t){for(var o=[],r=0;r<t.length;r++){var n=t[r];if("ENDSITE"!==n.type){for(var i=[],s=[],p=[],l=0;l<n.frames.length;l++){var c=n.frames[l];i.push(c.time),s.push(c.position.x+n.offset.x),s.push(c.position.y+n.offset.y),s.push(c.position.z+n.offset.z),p.push(c.rotation.x),p.push(c.rotation.y),p.push(c.rotation.z),p.push(c.rotation.w)}a.animateBonePositions&&o.push(new e.VectorKeyframeTrack(".bones["+n.name+"].position",i,s)),a.animateBoneRotations&&o.push(new e.QuaternionKeyframeTrack(".bones["+n.name+"].quaternion",i,p))}}return new e.AnimationClip("animation",-1,o)}(n);return{skeleton:new e.Skeleton(i),clip:s}}}),t.loaders.BVHLoader=o});
//# sourceMappingURL=../sourcemaps/loaders/BVHLoader.js.map
