/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","../math/ConvexHull"],function(e,t,r){"use strict";var o=function(t){e.BufferGeometry.call(this);var o=[],n=[];void 0===r&&console.error("THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on ConvexHull");for(var u=(new r).setFromPoints(t).faces,f=0;f<u.length;f++){var i=u[f],s=i.edge;do{var a=s.head().point;o.push(a.x,a.y,a.z),n.push(i.normal.x,i.normal.y,i.normal.z),s=s.next}while(s!==i.edge)}this.setAttribute("position",new e.Float32BufferAttribute(o,3)),this.setAttribute("normal",new e.Float32BufferAttribute(n,3))};return(o.prototype=Object.create(e.BufferGeometry.prototype)).constructor=o,t.geometries.ConvexBufferGeometry=o});
//# sourceMappingURL=../sourcemaps/geometries/ConvexBufferGeometry.js.map
