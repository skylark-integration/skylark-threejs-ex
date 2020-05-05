/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var e=new t.Vector3,r=new t.Vector3,o=new t.Matrix3;function i(e,r,o,i){this.object=e,this.size=void 0!==r?r:1;var a=void 0!==o?o:16776960,s=void 0!==i?i:1,n=0,c=this.object.geometry;c&&c.isGeometry?n=c.faces.length:console.warn("THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead.");var l=new t.BufferGeometry,p=new t.Float32BufferAttribute(2*n*3,3);l.setAttribute("position",p),t.LineSegments.call(this,l,new t.LineBasicMaterial({color:a,linewidth:s})),this.matrixAutoUpdate=!1,this.update()}return i.prototype=Object.create(t.LineSegments.prototype),i.prototype.constructor=i,i.prototype.update=function(){this.object.updateMatrixWorld(!0),o.getNormalMatrix(this.object.matrixWorld);for(var t=this.object.matrixWorld,i=this.geometry.attributes.position,a=this.object.geometry,s=a.vertices,n=a.faces,c=0,l=0,p=n.length;l<p;l++){var d=n[l],y=d.normal;e.copy(s[d.a]).add(s[d.b]).add(s[d.c]).divideScalar(3).applyMatrix4(t),r.copy(y).applyMatrix3(o).normalize().multiplyScalar(this.size).add(e),i.setXYZ(c,e.x,e.y,e.z),c+=1,i.setXYZ(c,r.x,r.y,r.z),c+=1}i.needsUpdate=!0},i});
//# sourceMappingURL=../sourcemaps/helpers/FaceNormalsHelper.js.map
