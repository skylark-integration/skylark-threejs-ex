/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./LineSegments2","./LineGeometry","./LineMaterial"],function(e){return e.Line2=function(t,i){e.LineSegments2.call(this),this.type="Line2",this.geometry=void 0!==t?t:new e.LineGeometry,this.material=void 0!==i?i:new e.LineMaterial({color:16777215*Math.random()})},e.Line2.prototype=Object.assign(Object.create(e.LineSegments2.prototype),{constructor:e.Line2,isLine2:!0}),e.Line2});
//# sourceMappingURL=../sourcemaps/lines/Line2.js.map
