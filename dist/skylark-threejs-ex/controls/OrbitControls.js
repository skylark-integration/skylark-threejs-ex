/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var n=function(t,n){var o,a,i,c,r;void 0===n&&console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.'),n===document&&console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'),this.object=t,this.domElement=n,this.enabled=!0,this.target=new e.Vector3,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!1,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.enableKeys=!0,this.keys={LEFT:37,UP:38,RIGHT:39,BOTTOM:40},this.mouseButtons={LEFT:e.MOUSE.ROTATE,MIDDLE:e.MOUSE.DOLLY,RIGHT:e.MOUSE.PAN},this.touches={ONE:e.TOUCH.ROTATE,TWO:e.TOUCH.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=function(){return b.phi},this.getAzimuthalAngle=function(){return b.theta},this.saveState=function(){s.target0.copy(s.target),s.position0.copy(s.object.position),s.zoom0=s.object.zoom},this.reset=function(){s.target.copy(s.target0),s.object.position.copy(s.position0),s.object.zoom=s.zoom0,s.object.updateProjectionMatrix(),s.dispatchEvent(u),s.update(),p=h.NONE},this.update=(o=new e.Vector3,a=(new e.Quaternion).setFromUnitVectors(t.up,new e.Vector3(0,1,0)),i=a.clone().inverse(),c=new e.Vector3,r=new e.Quaternion,function(){var e=s.object.position;return o.copy(e).sub(s.target),o.applyQuaternion(a),b.setFromVector3(o),s.autoRotate&&p===h.NONE&&R(2*Math.PI/60/60*s.autoRotateSpeed),s.enableDamping?(b.theta+=E.theta*s.dampingFactor,b.phi+=E.phi*s.dampingFactor):(b.theta+=E.theta,b.phi+=E.phi),b.theta=Math.max(s.minAzimuthAngle,Math.min(s.maxAzimuthAngle,b.theta)),b.phi=Math.max(s.minPolarAngle,Math.min(s.maxPolarAngle,b.phi)),b.makeSafe(),b.radius*=f,b.radius=Math.max(s.minDistance,Math.min(s.maxDistance,b.radius)),!0===s.enableDamping?s.target.addScaledVector(g,s.dampingFactor):s.target.add(g),o.setFromSpherical(b),o.applyQuaternion(i),e.copy(s.target).add(o),s.object.lookAt(s.target),!0===s.enableDamping?(E.theta*=1-s.dampingFactor,E.phi*=1-s.dampingFactor,g.multiplyScalar(1-s.dampingFactor)):(E.set(0,0,0),g.set(0,0,0)),f=1,!!(O||c.distanceToSquared(s.object.position)>d||8*(1-r.dot(s.object.quaternion))>d)&&(s.dispatchEvent(u),c.copy(s.object.position),r.copy(s.object.quaternion),O=!1,!0)}),this.dispose=function(){s.domElement.removeEventListener("contextmenu",ee,!1),s.domElement.removeEventListener("mousedown",K,!1),s.domElement.removeEventListener("wheel",W,!1),s.domElement.removeEventListener("touchstart",Q,!1),s.domElement.removeEventListener("touchend",$,!1),s.domElement.removeEventListener("touchmove",J,!1),document.removeEventListener("mousemove",G,!1),document.removeEventListener("mouseup",B,!1),s.domElement.removeEventListener("keydown",q,!1)};var s=this,u={type:"change"},m={type:"start"},l={type:"end"},h={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},p=h.NONE,d=1e-6,b=new e.Spherical,E=new e.Spherical,f=1,g=new e.Vector3,O=!1,v=new e.Vector2,T=new e.Vector2,y=new e.Vector2,P=new e.Vector2,L=new e.Vector2,N=new e.Vector2,A=new e.Vector2,j=new e.Vector2,w=new e.Vector2;function k(){return Math.pow(.95,s.zoomSpeed)}function R(e){E.theta-=e}function M(e){E.phi-=e}var S,Y=(S=new e.Vector3,function(e,t){S.setFromMatrixColumn(t,0),S.multiplyScalar(-e),g.add(S)}),C=function(){var t=new e.Vector3;return function(e,n){!0===s.screenSpacePanning?t.setFromMatrixColumn(n,1):(t.setFromMatrixColumn(n,0),t.crossVectors(s.object.up,t)),t.multiplyScalar(e),g.add(t)}}(),D=function(){var t=new e.Vector3;return function(e,n){var o=s.domElement;if(s.object.isPerspectiveCamera){var a=s.object.position;t.copy(a).sub(s.target);var i=t.length();i*=Math.tan(s.object.fov/2*Math.PI/180),Y(2*e*i/o.clientHeight,s.object.matrix),C(2*n*i/o.clientHeight,s.object.matrix)}else s.object.isOrthographicCamera?(Y(e*(s.object.right-s.object.left)/s.object.zoom/o.clientWidth,s.object.matrix),C(n*(s.object.top-s.object.bottom)/s.object.zoom/o.clientHeight,s.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),s.enablePan=!1)}}();function x(e){s.object.isPerspectiveCamera?f/=e:s.object.isOrthographicCamera?(s.object.zoom=Math.max(s.minZoom,Math.min(s.maxZoom,s.object.zoom*e)),s.object.updateProjectionMatrix(),O=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),s.enableZoom=!1)}function H(e){s.object.isPerspectiveCamera?f*=e:s.object.isOrthographicCamera?(s.object.zoom=Math.max(s.minZoom,Math.min(s.maxZoom,s.object.zoom/e)),s.object.updateProjectionMatrix(),O=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),s.enableZoom=!1)}function U(e){v.set(e.clientX,e.clientY)}function V(e){P.set(e.clientX,e.clientY)}function z(e){if(1==e.touches.length)v.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);v.set(t,n)}}function X(e){if(1==e.touches.length)P.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);P.set(t,n)}}function _(e){var t=e.touches[0].pageX-e.touches[1].pageX,n=e.touches[0].pageY-e.touches[1].pageY,o=Math.sqrt(t*t+n*n);A.set(0,o)}function Z(e){if(1==e.touches.length)T.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);T.set(t,n)}y.subVectors(T,v).multiplyScalar(s.rotateSpeed);var o=s.domElement;R(2*Math.PI*y.x/o.clientHeight),M(2*Math.PI*y.y/o.clientHeight),v.copy(T)}function I(e){if(1==e.touches.length)L.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);L.set(t,n)}N.subVectors(L,P).multiplyScalar(s.panSpeed),D(N.x,N.y),P.copy(L)}function F(e){var t=e.touches[0].pageX-e.touches[1].pageX,n=e.touches[0].pageY-e.touches[1].pageY,o=Math.sqrt(t*t+n*n);j.set(0,o),w.set(0,Math.pow(j.y/A.y,s.zoomSpeed)),x(w.y),A.copy(j)}function K(t){if(!1!==s.enabled){var n;switch(t.preventDefault(),s.domElement.focus?s.domElement.focus():window.focus(),t.button){case 0:n=s.mouseButtons.LEFT;break;case 1:n=s.mouseButtons.MIDDLE;break;case 2:n=s.mouseButtons.RIGHT;break;default:n=-1}switch(n){case e.MOUSE.DOLLY:if(!1===s.enableZoom)return;!function(e){A.set(e.clientX,e.clientY)}(t),p=h.DOLLY;break;case e.MOUSE.ROTATE:if(t.ctrlKey||t.metaKey||t.shiftKey){if(!1===s.enablePan)return;V(t),p=h.PAN}else{if(!1===s.enableRotate)return;U(t),p=h.ROTATE}break;case e.MOUSE.PAN:if(t.ctrlKey||t.metaKey||t.shiftKey){if(!1===s.enableRotate)return;U(t),p=h.ROTATE}else{if(!1===s.enablePan)return;V(t),p=h.PAN}break;default:p=h.NONE}p!==h.NONE&&(document.addEventListener("mousemove",G,!1),document.addEventListener("mouseup",B,!1),s.dispatchEvent(m))}}function G(e){if(!1!==s.enabled)switch(e.preventDefault(),p){case h.ROTATE:if(!1===s.enableRotate)return;!function(e){T.set(e.clientX,e.clientY),y.subVectors(T,v).multiplyScalar(s.rotateSpeed);var t=s.domElement;R(2*Math.PI*y.x/t.clientHeight),M(2*Math.PI*y.y/t.clientHeight),v.copy(T),s.update()}(e);break;case h.DOLLY:if(!1===s.enableZoom)return;!function(e){j.set(e.clientX,e.clientY),w.subVectors(j,A),w.y>0?x(k()):w.y<0&&H(k()),A.copy(j),s.update()}(e);break;case h.PAN:if(!1===s.enablePan)return;!function(e){L.set(e.clientX,e.clientY),N.subVectors(L,P).multiplyScalar(s.panSpeed),D(N.x,N.y),P.copy(L),s.update()}(e)}}function B(e){!1!==s.enabled&&(document.removeEventListener("mousemove",G,!1),document.removeEventListener("mouseup",B,!1),s.dispatchEvent(l),p=h.NONE)}function W(e){!1===s.enabled||!1===s.enableZoom||p!==h.NONE&&p!==h.ROTATE||(e.preventDefault(),e.stopPropagation(),s.dispatchEvent(m),function(e){e.deltaY<0?H(k()):e.deltaY>0&&x(k()),s.update()}(e),s.dispatchEvent(l))}function q(e){!1!==s.enabled&&!1!==s.enableKeys&&!1!==s.enablePan&&function(e){var t=!1;switch(e.keyCode){case s.keys.UP:D(0,s.keyPanSpeed),t=!0;break;case s.keys.BOTTOM:D(0,-s.keyPanSpeed),t=!0;break;case s.keys.LEFT:D(s.keyPanSpeed,0),t=!0;break;case s.keys.RIGHT:D(-s.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),s.update())}(e)}function Q(t){if(!1!==s.enabled){switch(t.preventDefault(),t.touches.length){case 1:switch(s.touches.ONE){case e.TOUCH.ROTATE:if(!1===s.enableRotate)return;z(t),p=h.TOUCH_ROTATE;break;case e.TOUCH.PAN:if(!1===s.enablePan)return;X(t),p=h.TOUCH_PAN;break;default:p=h.NONE}break;case 2:switch(s.touches.TWO){case e.TOUCH.DOLLY_PAN:if(!1===s.enableZoom&&!1===s.enablePan)return;!function(e){s.enableZoom&&_(e),s.enablePan&&X(e)}(t),p=h.TOUCH_DOLLY_PAN;break;case e.TOUCH.DOLLY_ROTATE:if(!1===s.enableZoom&&!1===s.enableRotate)return;!function(e){s.enableZoom&&_(e),s.enableRotate&&z(e)}(t),p=h.TOUCH_DOLLY_ROTATE;break;default:p=h.NONE}break;default:p=h.NONE}p!==h.NONE&&s.dispatchEvent(m)}}function J(e){if(!1!==s.enabled)switch(e.preventDefault(),e.stopPropagation(),p){case h.TOUCH_ROTATE:if(!1===s.enableRotate)return;Z(e),s.update();break;case h.TOUCH_PAN:if(!1===s.enablePan)return;I(e),s.update();break;case h.TOUCH_DOLLY_PAN:if(!1===s.enableZoom&&!1===s.enablePan)return;!function(e){s.enableZoom&&F(e),s.enablePan&&I(e)}(e),s.update();break;case h.TOUCH_DOLLY_ROTATE:if(!1===s.enableZoom&&!1===s.enableRotate)return;!function(e){s.enableZoom&&F(e),s.enableRotate&&Z(e)}(e),s.update();break;default:p=h.NONE}}function $(e){!1!==s.enabled&&(s.dispatchEvent(l),p=h.NONE)}function ee(e){!1!==s.enabled&&e.preventDefault()}s.domElement.addEventListener("contextmenu",ee,!1),s.domElement.addEventListener("mousedown",K,!1),s.domElement.addEventListener("wheel",W,!1),s.domElement.addEventListener("touchstart",Q,!1),s.domElement.addEventListener("touchend",$,!1),s.domElement.addEventListener("touchmove",J,!1),s.domElement.addEventListener("keydown",q,!1),-1===s.domElement.tabIndex&&(s.domElement.tabIndex=0),this.update()};return(n.prototype=Object.create(e.EventDispatcher.prototype)).constructor=n,t.controls.OrbitControls=n});
//# sourceMappingURL=../sourcemaps/controls/OrbitControls.js.map
