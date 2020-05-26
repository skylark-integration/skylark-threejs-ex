/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";return t.effects.PeppersGhostEffect=function(t){var r,o,n,s=this;s.cameraDistance=15,s.reflectFromAbove=!1;var i=new e.PerspectiveCamera,a=new e.PerspectiveCamera,c=new e.PerspectiveCamera,p=new e.PerspectiveCamera,l=new e.Vector3,d=new e.Quaternion,m=new e.Vector3;t.autoClear=!1,this.setSize=function(e,s){r=e/2,e<s?(o=e/3,n=e/3):(o=s/3,n=s/3),t.setSize(e,s)},this.render=function(e,u){e.updateMatrixWorld(),null===u.parent&&u.updateMatrixWorld(),u.matrixWorld.decompose(l,d,m),i.position.copy(l),i.quaternion.copy(d),i.translateZ(s.cameraDistance),i.lookAt(e.position),a.position.copy(l),a.quaternion.copy(d),a.translateZ(-s.cameraDistance),a.lookAt(e.position),a.rotation.z+=Math.PI/180*180,c.position.copy(l),c.quaternion.copy(d),c.translateX(-s.cameraDistance),c.lookAt(e.position),c.rotation.x+=Math.PI/180*90,p.position.copy(l),p.quaternion.copy(d),p.translateX(s.cameraDistance),p.lookAt(e.position),p.rotation.x+=Math.PI/180*90,t.clear(),t.setScissorTest(!0),t.setScissor(r-o/2,2*n,o,n),t.setViewport(r-o/2,2*n,o,n),s.reflectFromAbove?t.render(e,a):t.render(e,i),t.setScissor(r-o/2,0,o,n),t.setViewport(r-o/2,0,o,n),s.reflectFromAbove?t.render(e,i):t.render(e,a),t.setScissor(r-o/2-o,n,o,n),t.setViewport(r-o/2-o,n,o,n),s.reflectFromAbove?t.render(e,p):t.render(e,c),t.setScissor(r+o/2,n,o,n),t.setViewport(r+o/2,n,o,n),s.reflectFromAbove?t.render(e,c):t.render(e,p),t.setScissorTest(!1)}}});
//# sourceMappingURL=../sourcemaps/effects/PeppersGhostEffect.js.map
