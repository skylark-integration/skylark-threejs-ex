/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.DragControls=function(t,n,r){var o=new e.Plane,i=new e.Raycaster,a=new e.Vector2,s=new e.Vector3,c=new e.Vector3,l=new e.Vector3,u=new e.Matrix4,d=[],v=null,p=null,m=this;function h(){r.addEventListener("mousemove",y,!1),r.addEventListener("mousedown",f,!1),r.addEventListener("mouseup",b,!1),r.addEventListener("mouseleave",b,!1),r.addEventListener("touchmove",E,!1),r.addEventListener("touchstart",j,!1),r.addEventListener("touchend",x,!1)}function g(){r.removeEventListener("mousemove",y,!1),r.removeEventListener("mousedown",f,!1),r.removeEventListener("mouseup",b,!1),r.removeEventListener("mouseleave",b,!1),r.removeEventListener("touchmove",E,!1),r.removeEventListener("touchstart",j,!1),r.removeEventListener("touchend",x,!1)}function y(e){e.preventDefault();var h=r.getBoundingClientRect();if(a.x=(e.clientX-h.left)/h.width*2-1,a.y=-(e.clientY-h.top)/h.height*2+1,i.setFromCamera(a,n),v&&m.enabled)return i.ray.intersectPlane(o,c)&&v.position.copy(c.sub(s).applyMatrix4(u)),void m.dispatchEvent({type:"drag",object:v});if(d.length=0,i.setFromCamera(a,n),i.intersectObjects(t,!0,d),d.length>0){var g=d[0].object;o.setFromNormalAndCoplanarPoint(n.getWorldDirection(o.normal),l.setFromMatrixPosition(g.matrixWorld)),p!==g&&(m.dispatchEvent({type:"hoveron",object:g}),r.style.cursor="pointer",p=g)}else null!==p&&(m.dispatchEvent({type:"hoveroff",object:p}),r.style.cursor="auto",p=null)}function f(e){e.preventDefault(),d.length=0,i.setFromCamera(a,n),i.intersectObjects(t,!0,d),d.length>0&&(v=!0===m.transformGroup?t[0]:d[0].object,i.ray.intersectPlane(o,c)&&(u.getInverse(v.parent.matrixWorld),s.copy(c).sub(l.setFromMatrixPosition(v.matrixWorld))),r.style.cursor="move",m.dispatchEvent({type:"dragstart",object:v}))}function b(e){e.preventDefault(),v&&(m.dispatchEvent({type:"dragend",object:v}),v=null),r.style.cursor=p?"pointer":"auto"}function E(e){e.preventDefault(),e=e.changedTouches[0];var t=r.getBoundingClientRect();if(a.x=(e.clientX-t.left)/t.width*2-1,a.y=-(e.clientY-t.top)/t.height*2+1,i.setFromCamera(a,n),v&&m.enabled)return i.ray.intersectPlane(o,c)&&v.position.copy(c.sub(s).applyMatrix4(u)),void m.dispatchEvent({type:"drag",object:v})}function j(e){e.preventDefault(),e=e.changedTouches[0];var p=r.getBoundingClientRect();a.x=(e.clientX-p.left)/p.width*2-1,a.y=-(e.clientY-p.top)/p.height*2+1,d.length=0,i.setFromCamera(a,n),i.intersectObjects(t,!0,d),d.length>0&&(v=!0===m.transformGroup?t[0]:d[0].object,o.setFromNormalAndCoplanarPoint(n.getWorldDirection(o.normal),l.setFromMatrixPosition(v.matrixWorld)),i.ray.intersectPlane(o,c)&&(u.getInverse(v.parent.matrixWorld),s.copy(c).sub(l.setFromMatrixPosition(v.matrixWorld))),r.style.cursor="move",m.dispatchEvent({type:"dragstart",object:v}))}function x(e){e.preventDefault(),v&&(m.dispatchEvent({type:"dragend",object:v}),v=null),r.style.cursor="auto"}h(),this.enabled=!0,this.transformGroup=!1,this.activate=h,this.deactivate=g,this.dispose=function(){g()},this.getObjects=function(){return t}},e.DragControls.prototype=Object.create(e.EventDispatcher.prototype),e.DragControls.prototype.constructor=e.DragControls,e.DragControls});
//# sourceMappingURL=../sourcemaps/controls/DragControls.js.map