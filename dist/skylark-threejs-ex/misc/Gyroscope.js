/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){var r,e,o,i,s,a;return t.Gyroscope=function(){t.Object3D.call(this)},t.Gyroscope.prototype=Object.create(t.Object3D.prototype),t.Gyroscope.prototype.constructor=t.Gyroscope,t.Gyroscope.prototype.updateMatrixWorld=(r=new t.Vector3,e=new t.Quaternion,o=new t.Vector3,i=new t.Vector3,s=new t.Quaternion,a=new t.Vector3,function(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(null!==this.parent?(this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorld.decompose(i,s,a),this.matrix.decompose(r,e,o),this.matrixWorld.compose(i,e,a)):this.matrixWorld.copy(this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);for(var c=0,p=this.children.length;c<p;c++)this.children[c].updateMatrixWorld(t)}),t.Gyroscope});
//# sourceMappingURL=../sourcemaps/misc/Gyroscope.js.map
