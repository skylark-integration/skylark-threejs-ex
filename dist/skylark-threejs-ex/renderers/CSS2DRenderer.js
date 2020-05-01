/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.CSS2DObject=function(t){e.Object3D.call(this),this.element=t,this.element.style.position="absolute",this.addEventListener("removed",function(){this.traverse(function(e){e.element instanceof Element&&null!==e.element.parentNode&&e.element.parentNode.removeChild(e.element)})})},e.CSS2DObject.prototype=Object.create(e.Object3D.prototype),e.CSS2DObject.prototype.constructor=e.CSS2DObject,e.CSS2DRenderer=function(){var t,n,r,o,i=this,a=new e.Vector3,s=new e.Matrix4,l=new e.Matrix4,c={objects:new WeakMap},d=document.createElement("div");d.style.overflow="hidden",this.domElement=d,this.getSize=function(){return{width:t,height:n}},this.setSize=function(e,i){r=(t=e)/2,o=(n=i)/2,d.style.width=e+"px",d.style.height=i+"px"};var u,m,f=function(t,n,s){if(t instanceof e.CSS2DObject){t.onBeforeRender(i,n,s),a.setFromMatrixPosition(t.matrixWorld),a.applyMatrix4(l);var u=t.element,m="translate(-50%,-50%) translate("+(a.x*r+r)+"px,"+(-a.y*o+o)+"px)";u.style.WebkitTransform=m,u.style.MozTransform=m,u.style.oTransform=m,u.style.transform=m,u.style.display=t.visible&&a.z>=-1&&a.z<=1?"":"none";var h={distanceToCameraSquared:p(s,t)};c.objects.set(t,h),u.parentNode!==d&&d.appendChild(u),t.onAfterRender(i,n,s)}for(var S=0,x=t.children.length;S<x;S++)f(t.children[S],n,s)},p=(u=new e.Vector3,m=new e.Vector3,function(e,t){return u.setFromMatrixPosition(e.matrixWorld),m.setFromMatrixPosition(t.matrixWorld),u.distanceToSquared(m)}),h=function(t){for(var n=function(t){var n=[];return t.traverse(function(t){t instanceof e.CSS2DObject&&n.push(t)}),n}(t).sort(function(e,t){return c.objects.get(e).distanceToCameraSquared-c.objects.get(t).distanceToCameraSquared}),r=n.length,o=0,i=n.length;o<i;o++)n[o].element.style.zIndex=r-o};this.render=function(e,t){!0===e.autoUpdate&&e.updateMatrixWorld(),null===t.parent&&t.updateMatrixWorld(),s.copy(t.matrixWorldInverse),l.multiplyMatrices(t.projectionMatrix,s),f(e,e,t),h(e)}},e.CSS2DRenderer});
//# sourceMappingURL=../sourcemaps/renderers/CSS2DRenderer.js.map
