/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex","./LineSegments2","./LineGeometry","./LineMaterial"],function(e,t,i,n){"use strict";var r=function(e,r){t.call(this),this.type="Line2",this.geometry=void 0!==e?e:new i,this.material=void 0!==r?r:new n({color:16777215*Math.random()})};return r.prototype=Object.assign(Object.create(t.prototype),{constructor:r,isLine2:!0}),e.lines.Line2=r});
//# sourceMappingURL=../sourcemaps/lines/Line2.js.map
