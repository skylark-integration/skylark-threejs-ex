/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return{elements:["x","y","z","w"],addShortcuts:function(){function t(t,n,e){return e?{get:function(){return this[t][n][e]},set:function(i){this[t][n][e]=i}}:{get:function(){return this[t][n]},set:function(e){this[t][n]=e}}}return function(n,e,i){for(var r={},u=0;u<i.length;++u){var s=i[u].split("."),c=s[0],f=s[1];r[c]=t(e,c,f)}Object.defineProperties(n,r)}}()}});
//# sourceMappingURL=../../sourcemaps/nodes/core/NodeUtils.js.map
