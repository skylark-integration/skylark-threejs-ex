/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,r){"use strict";var a,n=function(r){var a=new t.MeshBasicMaterial({color:0,transparent:!0,opacity:.6,depthWrite:!1});t.Mesh.call(this,r.geometry,a),this.meshMatrix=r.matrixWorld,this.frustumCulled=!1,this.matrixAutoUpdate=!1};return(n.prototype=Object.create(t.Mesh.prototype)).constructor=n,n.prototype.update=(a=new t.Matrix4,function(t,r){var n=t.normal.x*r.x+t.normal.y*r.y+t.normal.z*r.z+-t.constant*r.w,o=a.elements;o[0]=n-r.x*t.normal.x,o[4]=-r.x*t.normal.y,o[8]=-r.x*t.normal.z,o[12]=-r.x*-t.constant,o[1]=-r.y*t.normal.x,o[5]=n-r.y*t.normal.y,o[9]=-r.y*t.normal.z,o[13]=-r.y*-t.constant,o[2]=-r.z*t.normal.x,o[6]=-r.z*t.normal.y,o[10]=n-r.z*t.normal.z,o[14]=-r.z*-t.constant,o[3]=-r.w*t.normal.x,o[7]=-r.w*t.normal.y,o[11]=-r.w*t.normal.z,o[15]=n-r.w*-t.constant,this.matrix.multiplyMatrices(a,this.meshMatrix)}),r.objects.ShadowMesh=n});
//# sourceMappingURL=../sourcemaps/objects/ShadowMesh.js.map
