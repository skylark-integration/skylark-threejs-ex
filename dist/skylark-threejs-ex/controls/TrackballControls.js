/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var t=function(t,o){void 0===o&&console.warn('THREE.TrackballControls: The second parameter "domElement" is now mandatory.'),o===document&&console.error('THREE.TrackballControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');var n=this,a={NONE:-1,ROTATE:0,ZOOM:1,PAN:2,TOUCH_ROTATE:3,TOUCH_ZOOM_PAN:4};this.object=t,this.domElement=o,this.enabled=!0,this.screen={left:0,top:0,width:0,height:0},this.rotateSpeed=1,this.zoomSpeed=1.2,this.panSpeed=.3,this.noRotate=!1,this.noZoom=!1,this.noPan=!1,this.staticMoving=!1,this.dynamicDampingFactor=.2,this.minDistance=0,this.maxDistance=1/0,this.keys=[65,83,68],this.mouseButtons={LEFT:e.MOUSE.ROTATE,MIDDLE:e.MOUSE.ZOOM,RIGHT:e.MOUSE.PAN},this.target=new e.Vector3;var c=new e.Vector3,s=1,i=a.NONE,r=a.NONE,p=new e.Vector3,d=new e.Vector2,h=new e.Vector2,m=new e.Vector3,u=0,l=new e.Vector2,g=new e.Vector2,E=0,y=0,b=new e.Vector2,v=new e.Vector2;this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.up0=this.object.up.clone(),this.zoom0=this.object.zoom;var w={type:"change"},O={type:"start"},f={type:"end"};this.handleResize=function(){var e=this.domElement.getBoundingClientRect(),t=this.domElement.ownerDocument.documentElement;this.screen.left=e.left+window.pageXOffset-t.clientLeft,this.screen.top=e.top+window.pageYOffset-t.clientTop,this.screen.width=e.width,this.screen.height=e.height};var j,T,N,L,k,C,P,V,A,D,M,R=(j=new e.Vector2,function(e,t){return j.set((e-n.screen.left)/n.screen.width,(t-n.screen.top)/n.screen.height),j}),z=function(){var t=new e.Vector2;return function(e,o){return t.set((e-.5*n.screen.width-n.screen.left)/(.5*n.screen.width),(n.screen.height+2*(n.screen.top-o))/n.screen.width),t}}();function Y(e){!1!==n.enabled&&(window.removeEventListener("keydown",Y),r===a.NONE&&(e.keyCode!==n.keys[a.ROTATE]||n.noRotate?e.keyCode!==n.keys[a.ZOOM]||n.noZoom?e.keyCode!==n.keys[a.PAN]||n.noPan||(r=a.PAN):r=a.ZOOM:r=a.ROTATE))}function S(){!1!==n.enabled&&(r=a.NONE,window.addEventListener("keydown",Y,!1))}function X(e){if(!1!==n.enabled){if(e.preventDefault(),e.stopPropagation(),i===a.NONE)switch(e.button){case n.mouseButtons.LEFT:i=a.ROTATE;break;case n.mouseButtons.MIDDLE:i=a.ZOOM;break;case n.mouseButtons.RIGHT:i=a.PAN;break;default:i=a.NONE}var t=r!==a.NONE?r:i;t!==a.ROTATE||n.noRotate?t!==a.ZOOM||n.noZoom?t!==a.PAN||n.noPan||(b.copy(R(e.pageX,e.pageY)),v.copy(b)):(l.copy(R(e.pageX,e.pageY)),g.copy(l)):(h.copy(z(e.pageX,e.pageY)),d.copy(h)),document.addEventListener("mousemove",x,!1),document.addEventListener("mouseup",Z,!1),n.dispatchEvent(O)}}function x(e){if(!1!==n.enabled){e.preventDefault(),e.stopPropagation();var t=r!==a.NONE?r:i;t!==a.ROTATE||n.noRotate?t!==a.ZOOM||n.noZoom?t!==a.PAN||n.noPan||v.copy(R(e.pageX,e.pageY)):g.copy(R(e.pageX,e.pageY)):(d.copy(h),h.copy(z(e.pageX,e.pageY)))}}function Z(e){!1!==n.enabled&&(e.preventDefault(),e.stopPropagation(),i=a.NONE,document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",Z),n.dispatchEvent(f))}function H(e){if(!1!==n.enabled&&!0!==n.noZoom){switch(e.preventDefault(),e.stopPropagation(),e.deltaMode){case 2:l.y-=.025*e.deltaY;break;case 1:l.y-=.01*e.deltaY;break;default:l.y-=25e-5*e.deltaY}n.dispatchEvent(O),n.dispatchEvent(f)}}function U(e){if(!1!==n.enabled){switch(e.preventDefault(),e.touches.length){case 1:i=a.TOUCH_ROTATE,h.copy(z(e.touches[0].pageX,e.touches[0].pageY)),d.copy(h);break;default:i=a.TOUCH_ZOOM_PAN;var t=e.touches[0].pageX-e.touches[1].pageX,o=e.touches[0].pageY-e.touches[1].pageY;y=E=Math.sqrt(t*t+o*o);var c=(e.touches[0].pageX+e.touches[1].pageX)/2,s=(e.touches[0].pageY+e.touches[1].pageY)/2;b.copy(R(c,s)),v.copy(b)}n.dispatchEvent(O)}}function _(e){if(!1!==n.enabled)switch(e.preventDefault(),e.stopPropagation(),e.touches.length){case 1:d.copy(h),h.copy(z(e.touches[0].pageX,e.touches[0].pageY));break;default:var t=e.touches[0].pageX-e.touches[1].pageX,o=e.touches[0].pageY-e.touches[1].pageY;y=Math.sqrt(t*t+o*o);var a=(e.touches[0].pageX+e.touches[1].pageX)/2,c=(e.touches[0].pageY+e.touches[1].pageY)/2;v.copy(R(a,c))}}function q(e){if(!1!==n.enabled){switch(e.touches.length){case 0:i=a.NONE;break;case 1:i=a.TOUCH_ROTATE,h.copy(z(e.touches[0].pageX,e.touches[0].pageY)),d.copy(h)}n.dispatchEvent(f)}}function F(e){!1!==n.enabled&&e.preventDefault()}this.rotateCamera=(N=new e.Vector3,L=new e.Quaternion,k=new e.Vector3,C=new e.Vector3,P=new e.Vector3,V=new e.Vector3,function(){V.set(h.x-d.x,h.y-d.y,0),(T=V.length())?(p.copy(n.object.position).sub(n.target),k.copy(p).normalize(),C.copy(n.object.up).normalize(),P.crossVectors(C,k).normalize(),C.setLength(h.y-d.y),P.setLength(h.x-d.x),V.copy(C.add(P)),N.crossVectors(V,p).normalize(),T*=n.rotateSpeed,L.setFromAxisAngle(N,T),p.applyQuaternion(L),n.object.up.applyQuaternion(L),m.copy(N),u=T):!n.staticMoving&&u&&(u*=Math.sqrt(1-n.dynamicDampingFactor),p.copy(n.object.position).sub(n.target),L.setFromAxisAngle(m,u),p.applyQuaternion(L),n.object.up.applyQuaternion(L)),d.copy(h)}),this.zoomCamera=function(){var e;i===a.TOUCH_ZOOM_PAN?(e=E/y,E=y,n.object.isPerspectiveCamera?p.multiplyScalar(e):n.object.isOrthographicCamera?(n.object.zoom*=e,n.object.updateProjectionMatrix()):console.warn("THREE.TrackballControls: Unsupported camera type")):(1!==(e=1+(g.y-l.y)*n.zoomSpeed)&&e>0&&(n.object.isPerspectiveCamera?p.multiplyScalar(e):n.object.isOrthographicCamera?(n.object.zoom/=e,n.object.updateProjectionMatrix()):console.warn("THREE.TrackballControls: Unsupported camera type")),n.staticMoving?l.copy(g):l.y+=(g.y-l.y)*this.dynamicDampingFactor)},this.panCamera=(A=new e.Vector2,D=new e.Vector3,M=new e.Vector3,function(){if(A.copy(v).sub(b),A.lengthSq()){if(n.object.isOrthographicCamera){var e=(n.object.right-n.object.left)/n.object.zoom/n.domElement.clientWidth,t=(n.object.top-n.object.bottom)/n.object.zoom/n.domElement.clientWidth;A.x*=e,A.y*=t}A.multiplyScalar(p.length()*n.panSpeed),M.copy(p).cross(n.object.up).setLength(A.x),M.add(D.copy(n.object.up).setLength(A.y)),n.object.position.add(M),n.target.add(M),n.staticMoving?b.copy(v):b.add(A.subVectors(v,b).multiplyScalar(n.dynamicDampingFactor))}}),this.checkDistances=function(){n.noZoom&&n.noPan||(p.lengthSq()>n.maxDistance*n.maxDistance&&(n.object.position.addVectors(n.target,p.setLength(n.maxDistance)),l.copy(g)),p.lengthSq()<n.minDistance*n.minDistance&&(n.object.position.addVectors(n.target,p.setLength(n.minDistance)),l.copy(g)))},this.update=function(){p.subVectors(n.object.position,n.target),n.noRotate||n.rotateCamera(),n.noZoom||n.zoomCamera(),n.noPan||n.panCamera(),n.object.position.addVectors(n.target,p),n.object.isPerspectiveCamera?(n.checkDistances(),n.object.lookAt(n.target),c.distanceToSquared(n.object.position)>1e-6&&(n.dispatchEvent(w),c.copy(n.object.position))):n.object.isOrthographicCamera?(n.object.lookAt(n.target),(c.distanceToSquared(n.object.position)>1e-6||s!==n.object.zoom)&&(n.dispatchEvent(w),c.copy(n.object.position),s=n.object.zoom)):console.warn("THREE.TrackballControls: Unsupported camera type")},this.reset=function(){i=a.NONE,r=a.NONE,n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.up.copy(n.up0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),p.subVectors(n.object.position,n.target),n.object.lookAt(n.target),n.dispatchEvent(w),c.copy(n.object.position),s=n.object.zoom},this.dispose=function(){this.domElement.removeEventListener("contextmenu",F,!1),this.domElement.removeEventListener("mousedown",X,!1),this.domElement.removeEventListener("wheel",H,!1),this.domElement.removeEventListener("touchstart",U,!1),this.domElement.removeEventListener("touchend",q,!1),this.domElement.removeEventListener("touchmove",_,!1),document.removeEventListener("mousemove",x,!1),document.removeEventListener("mouseup",Z,!1),window.removeEventListener("keydown",Y,!1),window.removeEventListener("keyup",S,!1)},this.domElement.addEventListener("contextmenu",F,!1),this.domElement.addEventListener("mousedown",X,!1),this.domElement.addEventListener("wheel",H,!1),this.domElement.addEventListener("touchstart",U,!1),this.domElement.addEventListener("touchend",q,!1),this.domElement.addEventListener("touchmove",_,!1),window.addEventListener("keydown",Y,!1),window.addEventListener("keyup",S,!1),this.handleResize(),this.update()};return(t.prototype=Object.create(e.EventDispatcher.prototype)).constructor=t,t});
//# sourceMappingURL=../sourcemaps/controls/TrackballControls.js.map
