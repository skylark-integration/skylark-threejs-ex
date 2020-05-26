/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var n=function(t,e){this.position=t,this.normal=e};return n.prototype.clone=function(){return new this.constructor(this.position.clone(),this.normal.clone())},e.geometries.DecalVertex=n});
//# sourceMappingURL=../sourcemaps/geometries/DecalVertex.js.map
