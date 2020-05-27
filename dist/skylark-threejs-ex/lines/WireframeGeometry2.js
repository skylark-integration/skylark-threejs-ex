/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./LineSegmentsGeometry"],function(e,r,t){"use strict";var i=function(r){t.call(this),this.type="WireframeGeometry2",this.fromWireframeGeometry(new e.WireframeGeometry(r))};return i.prototype=Object.assign(Object.create(t.prototype),{constructor:i,isWireframeGeometry2:!0}),r.lines.WireframeGeometry2=i});
//# sourceMappingURL=../sourcemaps/lines/WireframeGeometry2.js.map
