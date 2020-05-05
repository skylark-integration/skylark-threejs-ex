/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";return function(t){var r,o,n,i=this;i.cameraDistance=15,i.reflectFromAbove=!1;var s=new e.PerspectiveCamera,a=new e.PerspectiveCamera,c=new e.PerspectiveCamera,p=new e.PerspectiveCamera,l=new e.Vector3,d=new e.Quaternion,m=new e.Vector3;t.autoClear=!1,this.setSize=function(e,i){r=e/2,e<i?(o=e/3,n=e/3):(o=i/3,n=i/3),t.setSize(e,i)},this.render=function(e,u){e.updateMatrixWorld(),null===u.parent&&u.updateMatrixWorld(),u.matrixWorld.decompose(l,d,m),s.position.copy(l),s.quaternion.copy(d),s.translateZ(i.cameraDistance),s.lookAt(e.position),a.position.copy(l),a.quaternion.copy(d),a.translateZ(-i.cameraDistance),a.lookAt(e.position),a.rotation.z+=Math.PI/180*180,c.position.copy(l),c.quaternion.copy(d),c.translateX(-i.cameraDistance),c.lookAt(e.position),c.rotation.x+=Math.PI/180*90,p.position.copy(l),p.quaternion.copy(d),p.translateX(i.cameraDistance),p.lookAt(e.position),p.rotation.x+=Math.PI/180*90,t.clear(),t.setScissorTest(!0),t.setScissor(r-o/2,2*n,o,n),t.setViewport(r-o/2,2*n,o,n),i.reflectFromAbove?t.render(e,a):t.render(e,s),t.setScissor(r-o/2,0,o,n),t.setViewport(r-o/2,0,o,n),i.reflectFromAbove?t.render(e,s):t.render(e,a),t.setScissor(r-o/2-o,n,o,n),t.setViewport(r-o/2-o,n,o,n),i.reflectFromAbove?t.render(e,p):t.render(e,c),t.setScissor(r+o/2,n,o,n),t.setViewport(r+o/2,n,o,n),i.reflectFromAbove?t.render(e,c):t.render(e,p),t.setScissorTest(!1)}}});
//# sourceMappingURL=../sourcemaps/effects/PeppersGhostEffect.js.map
