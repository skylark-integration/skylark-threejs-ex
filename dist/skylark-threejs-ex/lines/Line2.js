/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./LineSegments2","./LineGeometry","./LineMaterial"],function(e,t,i){"use strict";var n=function(n,o){e.call(this),this.type="Line2",this.geometry=void 0!==n?n:new t,this.material=void 0!==o?o:new i({color:16777215*Math.random()})};return n.prototype=Object.assign(Object.create(e.prototype),{constructor:n,isLine2:!0}),n});
//# sourceMappingURL=../sourcemaps/lines/Line2.js.map
