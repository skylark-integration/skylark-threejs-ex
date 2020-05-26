/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var n=null,r=null;function l(){for(var t=0,e=0;e<1e7;e++)t+=Math.random();r.textContent=t}return e.offscreen.jank=function(){var t=document.getElementById("button");t.addEventListener("click",function(){null===n?(n=setInterval(l,1e3/60),t.textContent="STOP JANK"):(clearInterval(n),n=null,t.textContent="START JANK",r.textContent="")}),r=document.getElementById("result")}});
//# sourceMappingURL=../sourcemaps/offscreen/jank.js.map
