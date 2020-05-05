/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var t=function(t){e.Object3D.call(this),this.element=t,this.element.style.position="absolute",this.addEventListener("removed",function(){this.traverse(function(e){e.element instanceof Element&&null!==e.element.parentNode&&e.element.parentNode.removeChild(e.element)})})};(t.prototype=Object.create(e.Object3D.prototype)).constructor=t;var n=function(){var n,r,o,i,a=this,s=new e.Vector3,l=new e.Matrix4,c=new e.Matrix4,d={objects:new WeakMap},u=document.createElement("div");u.style.overflow="hidden",this.domElement=u,this.getSize=function(){return{width:n,height:r}},this.setSize=function(e,t){o=(n=e)/2,i=(r=t)/2,u.style.width=e+"px",u.style.height=t+"px"};var m,f,h=function(e,n,r){if(e instanceof t){e.onBeforeRender(a,n,r),s.setFromMatrixPosition(e.matrixWorld),s.applyMatrix4(c);var l=e.element,m="translate(-50%,-50%) translate("+(s.x*o+o)+"px,"+(-s.y*i+i)+"px)";l.style.WebkitTransform=m,l.style.MozTransform=m,l.style.oTransform=m,l.style.transform=m,l.style.display=e.visible&&s.z>=-1&&s.z<=1?"":"none";var f={distanceToCameraSquared:p(r,e)};d.objects.set(e,f),l.parentNode!==u&&u.appendChild(l),e.onAfterRender(a,n,r)}for(var x=0,v=e.children.length;x<v;x++)h(e.children[x],n,r)},p=(m=new e.Vector3,f=new e.Vector3,function(e,t){return m.setFromMatrixPosition(e.matrixWorld),f.setFromMatrixPosition(t.matrixWorld),m.distanceToSquared(f)}),x=function(e){for(var n=function(e){var n=[];return e.traverse(function(e){e instanceof t&&n.push(e)}),n}(e).sort(function(e,t){return d.objects.get(e).distanceToCameraSquared-d.objects.get(t).distanceToCameraSquared}),r=n.length,o=0,i=n.length;o<i;o++)n[o].element.style.zIndex=r-o};this.render=function(e,t){!0===e.autoUpdate&&e.updateMatrixWorld(),null===t.parent&&t.updateMatrixWorld(),l.copy(t.matrixWorldInverse),c.multiplyMatrices(t.projectionMatrix,l),h(e,e,t),x(e)}};return n.CSS2DObject=t,n});
//# sourceMappingURL=../sourcemaps/renderers/CSS2DRenderer.js.map
