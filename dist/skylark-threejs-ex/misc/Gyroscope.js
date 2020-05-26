/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var r,i,o,a,s,n,c=function(){t.Object3D.call(this)};return(c.prototype=Object.create(t.Object3D.prototype)).constructor=c,c.prototype.updateMatrixWorld=(r=new t.Vector3,i=new t.Quaternion,o=new t.Vector3,a=new t.Vector3,s=new t.Quaternion,n=new t.Vector3,function(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(null!==this.parent?(this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorld.decompose(a,s,n),this.matrix.decompose(r,i,o),this.matrixWorld.compose(a,i,n)):this.matrixWorld.copy(this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);for(var e=0,c=this.children.length;e<c;e++)this.children[e].updateMatrixWorld(t)}),e.misc.Gyroscope=c});
//# sourceMappingURL=../sourcemaps/misc/Gyroscope.js.map
