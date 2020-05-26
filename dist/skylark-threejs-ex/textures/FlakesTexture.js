/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(t){"use strict";return t.textures.FlakesTexture=class{constructor(t=512,e=512){var r=document.createElement("canvas");r.width=t,r.height=e;var a=r.getContext("2d");a.fillStyle="rgb(127,127,255)",a.fillRect(0,0,t,e);for(var n=0;n<4e3;n++){var l=Math.random()*t,h=Math.random()*e,o=3*Math.random()+3,c=2*Math.random()-1,i=2*Math.random()-1,d=1.5,s=Math.sqrt(c*c+i*i+d*d);c/=s,i/=s,d/=s,a.fillStyle="rgb("+(127*c+127)+","+(127*i+127)+","+255*d+")",a.beginPath(),a.arc(l,h,o,0,2*Math.PI),a.fill()}return r}}});
//# sourceMappingURL=../sourcemaps/textures/FlakesTexture.js.map
