/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return{nodes:{},keywords:{},add:function(e){this.nodes[e.name]=e},addKeyword:function(e,n,t){t=void 0===t||t,this.keywords[e]={callback:n,cache:t}},remove:function(e){delete this.nodes[e.name]},removeKeyword:function(e){delete this.keywords[e]},get:function(e){return this.nodes[e]},getKeyword:function(e,n){return this.keywords[e].callback.call(this,n)},getKeywordData:function(e){return this.keywords[e]},contains:function(e){return void 0!==this.nodes[e]},containsKeyword:function(e){return void 0!==this.keywords[e]}}});
//# sourceMappingURL=../../sourcemaps/nodes/core/NodeLib.js.map
