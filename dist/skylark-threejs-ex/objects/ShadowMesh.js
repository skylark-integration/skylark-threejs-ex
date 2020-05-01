/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){var a;return t.ShadowMesh=function(a){var o=new t.MeshBasicMaterial({color:0,transparent:!0,opacity:.6,depthWrite:!1});t.Mesh.call(this,a.geometry,o),this.meshMatrix=a.matrixWorld,this.frustumCulled=!1,this.matrixAutoUpdate=!1},t.ShadowMesh.prototype=Object.create(t.Mesh.prototype),t.ShadowMesh.prototype.constructor=t.ShadowMesh,t.ShadowMesh.prototype.update=(a=new t.Matrix4,function(t,o){var r=t.normal.x*o.x+t.normal.y*o.y+t.normal.z*o.z+-t.constant*o.w,n=a.elements;n[0]=r-o.x*t.normal.x,n[4]=-o.x*t.normal.y,n[8]=-o.x*t.normal.z,n[12]=-o.x*-t.constant,n[1]=-o.y*t.normal.x,n[5]=r-o.y*t.normal.y,n[9]=-o.y*t.normal.z,n[13]=-o.y*-t.constant,n[2]=-o.z*t.normal.x,n[6]=-o.z*t.normal.y,n[10]=r-o.z*t.normal.z,n[14]=-o.z*-t.constant,n[3]=-o.w*t.normal.x,n[7]=-o.w*t.normal.y,n[11]=-o.w*t.normal.z,n[15]=r-o.w*-t.constant,this.matrix.multiplyMatrices(a,this.meshMatrix)}),t.ShadowMesh});
//# sourceMappingURL=../sourcemaps/objects/ShadowMesh.js.map
