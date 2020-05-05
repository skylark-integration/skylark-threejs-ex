/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../math/ConvexHull"],function(e,t){"use strict";var r=function(r){e.BufferGeometry.call(this);var o=[],n=[];void 0===t&&console.error("THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on ConvexHull");for(var u=(new t).setFromPoints(r).faces,i=0;i<u.length;i++){var s=u[i],a=s.edge;do{var f=a.head().point;o.push(f.x,f.y,f.z),n.push(s.normal.x,s.normal.y,s.normal.z),a=a.next}while(a!==s.edge)}this.setAttribute("position",new e.Float32BufferAttribute(o,3)),this.setAttribute("normal",new e.Float32BufferAttribute(n,3))};return(r.prototype=Object.create(e.BufferGeometry.prototype)).constructor=r,r});
//# sourceMappingURL=../sourcemaps/geometries/ConvexBufferGeometry.js.map
