/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var r=new e.Vector3,o=new e.Vector3,i=new e.Matrix3;function a(t,r,o,i){this.object=t,this.size=void 0!==r?r:1;var a=void 0!==o?o:16776960,s=void 0!==i?i:1,n=0,c=this.object.geometry;c&&c.isGeometry?n=c.faces.length:console.warn("THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead.");var l=new e.BufferGeometry,p=new e.Float32BufferAttribute(2*n*3,3);l.setAttribute("position",p),e.LineSegments.call(this,l,new e.LineBasicMaterial({color:a,linewidth:s})),this.matrixAutoUpdate=!1,this.update()}return a.prototype=Object.create(e.LineSegments.prototype),a.prototype.constructor=a,a.prototype.update=function(){this.object.updateMatrixWorld(!0),i.getNormalMatrix(this.object.matrixWorld);for(var e=this.object.matrixWorld,t=this.geometry.attributes.position,a=this.object.geometry,s=a.vertices,n=a.faces,c=0,l=0,p=n.length;l<p;l++){var d=n[l],y=d.normal;r.copy(s[d.a]).add(s[d.b]).add(s[d.c]).divideScalar(3).applyMatrix4(e),o.copy(y).applyMatrix3(i).normalize().multiplyScalar(this.size).add(r),t.setXYZ(c,r.x,r.y,r.z),c+=1,t.setXYZ(c,o.x,o.y,o.z),c+=1}t.needsUpdate=!0},t.helpers.FaceNormalsHelper=a});
//# sourceMappingURL=../sourcemaps/helpers/FaceNormalsHelper.js.map
