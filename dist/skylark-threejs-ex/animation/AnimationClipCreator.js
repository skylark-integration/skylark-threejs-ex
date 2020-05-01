/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(n){return n.AnimationClipCreator=function(){},n.AnimationClipCreator.CreateRotationAnimation=function(r,a){var e=[0,r],i=".rotation["+(a=a||"x")+"]",t=new n.NumberKeyframeTrack(i,e,[0,360]);return new n.AnimationClip(null,r,[t])},n.AnimationClipCreator.CreateScaleAxisAnimation=function(r,a){var e=[0,r],i=".scale["+(a=a||"x")+"]",t=new n.NumberKeyframeTrack(i,e,[0,1]);return new n.AnimationClip(null,r,[t])},n.AnimationClipCreator.CreateShakeAnimation=function(r,a){for(var e=[],i=[],t=new n.Vector3,o=0;o<10*r;o++)e.push(o/10),t.set(2*Math.random()-1,2*Math.random()-1,2*Math.random()-1).multiply(a).toArray(i,i.length);var l=new n.VectorKeyframeTrack(".position",e,i);return new n.AnimationClip(null,r,[l])},n.AnimationClipCreator.CreatePulsationAnimation=function(r,a){for(var e=[],i=[],t=new n.Vector3,o=0;o<10*r;o++){e.push(o/10);var l=Math.random()*a;t.set(l,l,l).toArray(i,i.length)}var m=new n.VectorKeyframeTrack(".scale",e,i);return new n.AnimationClip(null,r,[m])},n.AnimationClipCreator.CreateVisibilityAnimation=function(r){var a=[0,r/2,r],e=new n.BooleanKeyframeTrack(".visible",a,[!0,!1,!0]);return new n.AnimationClip(null,r,[e])},n.AnimationClipCreator.CreateMaterialColorAnimation=function(r,a){for(var e=[],i=[],t=r/a.length,o=0;o<=a.length;o++)e.push(o*t),i.push(a[o%a.length]);var l=new n.ColorKeyframeTrack(".material[0].color",e,i);return new n.AnimationClip(null,r,[l])},n.AnimationClipCreator});
//# sourceMappingURL=../sourcemaps/animation/AnimationClipCreator.js.map
