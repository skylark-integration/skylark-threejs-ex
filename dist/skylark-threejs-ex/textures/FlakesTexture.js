/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return class{constructor(t=512,a=512){var r=document.createElement("canvas");r.width=t,r.height=a;var e=r.getContext("2d");e.fillStyle="rgb(127,127,255)",e.fillRect(0,0,t,a);for(var n=0;n<4e3;n++){var l=Math.random()*t,h=Math.random()*a,o=3*Math.random()+3,c=2*Math.random()-1,i=2*Math.random()-1,d=1.5,f=Math.sqrt(c*c+i*i+d*d);c/=f,i/=f,d/=f,e.fillStyle="rgb("+(127*c+127)+","+(127*i+127)+","+255*d+")",e.beginPath(),e.arc(l,h,o,0,2*Math.PI),e.fill()}return r}}});
//# sourceMappingURL=../sourcemaps/textures/FlakesTexture.js.map
