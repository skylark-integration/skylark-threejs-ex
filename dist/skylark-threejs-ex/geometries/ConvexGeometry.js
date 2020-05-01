/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../math/ConvexHull"],function(e){return e.ConvexGeometry=function(t){e.Geometry.call(this),this.fromBufferGeometry(new e.ConvexBufferGeometry(t)),this.mergeVertices()},e.ConvexGeometry.prototype=Object.create(e.Geometry.prototype),e.ConvexGeometry.prototype.constructor=e.ConvexGeometry,e.ConvexBufferGeometry=function(t){e.BufferGeometry.call(this);var o=[],r=[];void 0===e.ConvexHull&&console.error("THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on THREE.ConvexHull");for(var n=(new e.ConvexHull).setFromPoints(t).faces,f=0;f<n.length;f++){var u=n[f],y=u.edge;do{var m=y.head().point;o.push(m.x,m.y,m.z),r.push(u.normal.x,u.normal.y,u.normal.z),y=y.next}while(y!==u.edge)}this.setAttribute("position",new e.Float32BufferAttribute(o,3)),this.setAttribute("normal",new e.Float32BufferAttribute(r,3))},e.ConvexBufferGeometry.prototype=Object.create(e.BufferGeometry.prototype),e.ConvexBufferGeometry.prototype.constructor=e.ConvexBufferGeometry,e.ConvexGeometry});
//# sourceMappingURL=../sourcemaps/geometries/ConvexGeometry.js.map
