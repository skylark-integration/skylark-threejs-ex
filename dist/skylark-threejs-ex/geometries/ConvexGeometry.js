/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","../math/ConvexHull"],function(e,t,r){"use strict";var o=function(t){e.Geometry.call(this),this.fromBufferGeometry(new ConvexBufferGeometry(t)),this.mergeVertices()};return(o.prototype=Object.create(e.Geometry.prototype)).constructor=o,t.geometries.ConvexGeometry=o});
//# sourceMappingURL=../sourcemaps/geometries/ConvexGeometry.js.map
