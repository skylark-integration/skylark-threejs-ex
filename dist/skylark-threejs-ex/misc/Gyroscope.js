/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var r,e,i,o,a,s,n=function(){t.Object3D.call(this)};return(n.prototype=Object.create(t.Object3D.prototype)).constructor=n,n.prototype.updateMatrixWorld=(r=new t.Vector3,e=new t.Quaternion,i=new t.Vector3,o=new t.Vector3,a=new t.Quaternion,s=new t.Vector3,function(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(null!==this.parent?(this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorld.decompose(o,a,s),this.matrix.decompose(r,e,i),this.matrixWorld.compose(o,e,s)):this.matrixWorld.copy(this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);for(var n=0,c=this.children.length;n<c;n++)this.children[n].updateMatrixWorld(t)}),n});
//# sourceMappingURL=../sourcemaps/misc/Gyroscope.js.map
