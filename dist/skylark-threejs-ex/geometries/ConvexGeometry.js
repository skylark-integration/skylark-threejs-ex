/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../math/ConvexHull"],function(e,t){"use strict";var r=function(t){e.Geometry.call(this),this.fromBufferGeometry(new ConvexBufferGeometry(t)),this.mergeVertices()};return(r.prototype=Object.create(e.Geometry.prototype)).constructor=r,r});
//# sourceMappingURL=../sourcemaps/geometries/ConvexGeometry.js.map
