/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(n){"use strict";var e=function(){};return e.CreateRotationAnimation=function(e,r){var a=[0,e],t=".rotation["+(r=r||"x")+"]",i=new n.NumberKeyframeTrack(t,a,[0,360]);return new n.AnimationClip(null,e,[i])},e.CreateScaleAxisAnimation=function(e,r){var a=[0,e],t=".scale["+(r=r||"x")+"]",i=new n.NumberKeyframeTrack(t,a,[0,1]);return new n.AnimationClip(null,e,[i])},e.CreateShakeAnimation=function(e,r){for(var a=[],t=[],i=new n.Vector3,o=0;o<10*e;o++)a.push(o/10),i.set(2*Math.random()-1,2*Math.random()-1,2*Math.random()-1).multiply(r).toArray(t,t.length);var l=new n.VectorKeyframeTrack(".position",a,t);return new n.AnimationClip(null,e,[l])},e.CreatePulsationAnimation=function(e,r){for(var a=[],t=[],i=new n.Vector3,o=0;o<10*e;o++){a.push(o/10);var l=Math.random()*r;i.set(l,l,l).toArray(t,t.length)}var u=new n.VectorKeyframeTrack(".scale",a,t);return new n.AnimationClip(null,e,[u])},e.CreateVisibilityAnimation=function(e){var r=[0,e/2,e],a=new n.BooleanKeyframeTrack(".visible",r,[!0,!1,!0]);return new n.AnimationClip(null,e,[a])},e.CreateMaterialColorAnimation=function(e,r){for(var a=[],t=[],i=e/r.length,o=0;o<=r.length;o++)a.push(o*i),t.push(r[o%r.length]);var l=new n.ColorKeyframeTrack(".material[0].color",a,t);return new n.AnimationClip(null,e,[l])},e});
//# sourceMappingURL=../sourcemaps/animation/AnimationClipCreator.js.map
