/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
ddefine(["skylark-threejs","./LineSegmentsGeometry"],function(e){return e.WireframeGeometry2=function(r){e.LineSegmentsGeometry.call(this),this.type="WireframeGeometry2",this.fromWireframeGeometry(new e.WireframeGeometry(r))},e.WireframeGeometry2.prototype=Object.assign(Object.create(e.LineSegmentsGeometry.prototype),{constructor:e.WireframeGeometry2,isWireframeGeometry2:!0}),e.WireframeGeometry2});
//# sourceMappingURL=../sourcemaps/lines/WireframeGeometry2.js.map
