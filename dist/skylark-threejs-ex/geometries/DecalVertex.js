/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var n=function(t,n){this.position=t,this.normal=n};return n.prototype.clone=function(){return new this.constructor(this.position.clone(),this.normal.clone())},n});
//# sourceMappingURL=../sourcemaps/geometries/DecalVertex.js.map
