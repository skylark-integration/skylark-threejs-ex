/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var r,a=function(r){var a=new t.MeshBasicMaterial({color:0,transparent:!0,opacity:.6,depthWrite:!1});t.Mesh.call(this,r.geometry,a),this.meshMatrix=r.matrixWorld,this.frustumCulled=!1,this.matrixAutoUpdate=!1};return(a.prototype=Object.create(t.Mesh.prototype)).constructor=a,a.prototype.update=(r=new t.Matrix4,function(t,a){var n=t.normal.x*a.x+t.normal.y*a.y+t.normal.z*a.z+-t.constant*a.w,o=r.elements;o[0]=n-a.x*t.normal.x,o[4]=-a.x*t.normal.y,o[8]=-a.x*t.normal.z,o[12]=-a.x*-t.constant,o[1]=-a.y*t.normal.x,o[5]=n-a.y*t.normal.y,o[9]=-a.y*t.normal.z,o[13]=-a.y*-t.constant,o[2]=-a.z*t.normal.x,o[6]=-a.z*t.normal.y,o[10]=n-a.z*t.normal.z,o[14]=-a.z*-t.constant,o[3]=-a.w*t.normal.x,o[7]=-a.w*t.normal.y,o[11]=-a.w*t.normal.z,o[15]=n-a.w*-t.constant,this.matrix.multiplyMatrices(r,this.meshMatrix)}),a});
//# sourceMappingURL=../sourcemaps/objects/ShadowMesh.js.map
