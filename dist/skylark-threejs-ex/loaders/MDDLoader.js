/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var t=function(t){e.Loader.call(this,t)};return t.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:t,load:function(t,r,a,n){var o=this,i=new e.FileLoader(this.manager);i.setPath(this.path),i.setResponseType("arraybuffer"),i.load(t,function(e){r(o.parse(e))},a,n)},parse:function(t){for(var r=new DataView(t),a=r.getUint32(0),n=r.getUint32(4),o=8,i=new Float32Array(a),l=new Float32Array(a*a).fill(0),s=0;s<a;s++)i[s]=r.getFloat32(o),o+=4,l[a*s+s]=1;var f=new e.NumberKeyframeTrack(".morphTargetInfluences",i,l),u=new e.AnimationClip("default",i[i.length-1],[f]),c=[];for(s=0;s<a;s++){for(var p=new Float32Array(3*n),h=0;h<n;h++){var g=3*h;p[g+0]=r.getFloat32(o),o+=4,p[g+1]=r.getFloat32(o),o+=4,p[g+2]=r.getFloat32(o),o+=4}var w=new e.BufferAttribute(p,3);w.name="morph_"+s,c.push(w)}return{morphTargets:c,clip:u}}}),t});
//# sourceMappingURL=../sourcemaps/loaders/MDDLoader.js.map
