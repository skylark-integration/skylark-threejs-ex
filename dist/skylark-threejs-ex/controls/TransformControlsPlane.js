/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var o=function(){e.Mesh.call(this,new e.PlaneBufferGeometry(1e5,1e5,2,2),new e.MeshBasicMaterial({visible:!1,wireframe:!0,side:e.DoubleSide,transparent:!0,opacity:.1})),this.type="TransformControlsPlane";var t=new e.Vector3(1,0,0),o=new e.Vector3(0,1,0),s=new e.Vector3(0,0,1),r=new e.Vector3,a=new e.Vector3,c=new e.Vector3,n=new e.Matrix4,i=new e.Quaternion;this.updateMatrixWorld=function(){var l=this.space;switch(this.position.copy(this.worldPosition),"scale"===this.mode&&(l="local"),t.set(1,0,0).applyQuaternion("local"===l?this.worldQuaternion:i),o.set(0,1,0).applyQuaternion("local"===l?this.worldQuaternion:i),s.set(0,0,1).applyQuaternion("local"===l?this.worldQuaternion:i),c.copy(o),this.mode){case"translate":case"scale":switch(this.axis){case"X":c.copy(this.eye).cross(t),a.copy(t).cross(c);break;case"Y":c.copy(this.eye).cross(o),a.copy(o).cross(c);break;case"Z":c.copy(this.eye).cross(s),a.copy(s).cross(c);break;case"XY":a.copy(s);break;case"YZ":a.copy(t);break;case"XZ":c.copy(s),a.copy(o);break;case"XYZ":case"E":a.set(0,0,0)}break;case"rotate":default:a.set(0,0,0)}0===a.length()?this.quaternion.copy(this.cameraQuaternion):(n.lookAt(r.set(0,0,0),a,c),this.quaternion.setFromRotationMatrix(n)),e.Object3D.prototype.updateMatrixWorld.call(this)}};return o.prototype=Object.assign(Object.create(e.Mesh.prototype),{constructor:o,isTransformControlsPlane:!0}),t.controls.TransformControlsPlane=o});
//# sourceMappingURL=../sourcemaps/controls/TransformControlsPlane.js.map
