/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var t=function(){e.Mesh.call(this,new e.PlaneBufferGeometry(1e5,1e5,2,2),new e.MeshBasicMaterial({visible:!1,wireframe:!0,side:e.DoubleSide,transparent:!0,opacity:.1})),this.type="TransformControlsPlane";var t=new e.Vector3(1,0,0),o=new e.Vector3(0,1,0),s=new e.Vector3(0,0,1),a=new e.Vector3,r=new e.Vector3,c=new e.Vector3,i=new e.Matrix4,n=new e.Quaternion;this.updateMatrixWorld=function(){var l=this.space;switch(this.position.copy(this.worldPosition),"scale"===this.mode&&(l="local"),t.set(1,0,0).applyQuaternion("local"===l?this.worldQuaternion:n),o.set(0,1,0).applyQuaternion("local"===l?this.worldQuaternion:n),s.set(0,0,1).applyQuaternion("local"===l?this.worldQuaternion:n),c.copy(o),this.mode){case"translate":case"scale":switch(this.axis){case"X":c.copy(this.eye).cross(t),r.copy(t).cross(c);break;case"Y":c.copy(this.eye).cross(o),r.copy(o).cross(c);break;case"Z":c.copy(this.eye).cross(s),r.copy(s).cross(c);break;case"XY":r.copy(s);break;case"YZ":r.copy(t);break;case"XZ":c.copy(s),r.copy(o);break;case"XYZ":case"E":r.set(0,0,0)}break;case"rotate":default:r.set(0,0,0)}0===r.length()?this.quaternion.copy(this.cameraQuaternion):(i.lookAt(a.set(0,0,0),r,c),this.quaternion.setFromRotationMatrix(i)),e.Object3D.prototype.updateMatrixWorld.call(this)}};return t.prototype=Object.assign(Object.create(e.Mesh.prototype),{constructor:t,isTransformControlsPlane:!0}),t});
//# sourceMappingURL=../sourcemaps/controls/TransformControlsPlane.js.map
