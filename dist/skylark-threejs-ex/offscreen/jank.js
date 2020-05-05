/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";var t=null,n=null;function e(){for(var t=0,e=0;e<1e7;e++)t+=Math.random();n.textContent=t}return function(){var l=document.getElementById("button");l.addEventListener("click",function(){null===t?(t=setInterval(e,1e3/60),l.textContent="STOP JANK"):(clearInterval(t),t=null,l.textContent="START JANK",n.textContent="")}),n=document.getElementById("result")}});
//# sourceMappingURL=../sourcemaps/offscreen/jank.js.map
