/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./LineSegmentsGeometry"],function(e,r){"use strict";var t=function(t){r.call(this),this.type="WireframeGeometry2",this.fromWireframeGeometry(new e.WireframeGeometry(t))};return t.prototype=Object.assign(Object.create(r.prototype),{constructor:t,isWireframeGeometry2:!0}),threex.lins.WireframeGeometry2=t});
//# sourceMappingURL=../sourcemaps/lines/WireframeGeometry2.js.map
