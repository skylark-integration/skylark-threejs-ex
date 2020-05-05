/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";return function(t,i){void 0===i&&(console.warn('THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.'),i=document),this.object=t,this.domElement=i,this.enabled=!0,this.movementSpeed=1,this.lookSpeed=.005,this.lookVertical=!0,this.autoForward=!1,this.activeLook=!0,this.heightSpeed=!1,this.heightCoef=1,this.heightMin=0,this.heightMax=1,this.constrainVertical=!1,this.verticalMin=0,this.verticalMax=Math.PI,this.mouseDragOn=!1,this.autoSpeedFactor=0,this.mouseX=0,this.mouseY=0,this.moveForward=!1,this.moveBackward=!1,this.moveLeft=!1,this.moveRight=!1,this.viewHalfX=0,this.viewHalfY=0;var s,o=0,h=0,a=new e.Vector3,n=new e.Spherical,r=new e.Vector3;function m(e){e.preventDefault()}this.domElement!==document&&this.domElement.setAttribute("tabindex",-1),this.handleResize=function(){this.domElement===document?(this.viewHalfX=window.innerWidth/2,this.viewHalfY=window.innerHeight/2):(this.viewHalfX=this.domElement.offsetWidth/2,this.viewHalfY=this.domElement.offsetHeight/2)},this.onMouseDown=function(e){if(this.domElement!==document&&this.domElement.focus(),e.preventDefault(),e.stopPropagation(),this.activeLook)switch(e.button){case 0:this.moveForward=!0;break;case 2:this.moveBackward=!0}this.mouseDragOn=!0},this.onMouseUp=function(e){if(e.preventDefault(),e.stopPropagation(),this.activeLook)switch(e.button){case 0:this.moveForward=!1;break;case 2:this.moveBackward=!1}this.mouseDragOn=!1},this.onMouseMove=function(e){this.domElement===document?(this.mouseX=e.pageX-this.viewHalfX,this.mouseY=e.pageY-this.viewHalfY):(this.mouseX=e.pageX-this.domElement.offsetLeft-this.viewHalfX,this.mouseY=e.pageY-this.domElement.offsetTop-this.viewHalfY)},this.onKeyDown=function(e){switch(e.keyCode){case 38:case 87:this.moveForward=!0;break;case 37:case 65:this.moveLeft=!0;break;case 40:case 83:this.moveBackward=!0;break;case 39:case 68:this.moveRight=!0;break;case 82:this.moveUp=!0;break;case 70:this.moveDown=!0}},this.onKeyUp=function(e){switch(e.keyCode){case 38:case 87:this.moveForward=!1;break;case 37:case 65:this.moveLeft=!1;break;case 40:case 83:this.moveBackward=!1;break;case 39:case 68:this.moveRight=!1;break;case 82:this.moveUp=!1;break;case 70:this.moveDown=!1}},this.lookAt=function(e,t,i){return e.isVector3?r.copy(e):r.set(e,t,i),this.object.lookAt(r),f(this),this},this.update=(s=new e.Vector3,function(t){if(!1!==this.enabled){if(this.heightSpeed){var i=e.MathUtils.clamp(this.object.position.y,this.heightMin,this.heightMax)-this.heightMin;this.autoSpeedFactor=t*(i*this.heightCoef)}else this.autoSpeedFactor=0;var a=t*this.movementSpeed;(this.moveForward||this.autoForward&&!this.moveBackward)&&this.object.translateZ(-(a+this.autoSpeedFactor)),this.moveBackward&&this.object.translateZ(a),this.moveLeft&&this.object.translateX(-a),this.moveRight&&this.object.translateX(a),this.moveUp&&this.object.translateY(a),this.moveDown&&this.object.translateY(-a);var n=t*this.lookSpeed;this.activeLook||(n=0);var r=1;this.constrainVertical&&(r=Math.PI/(this.verticalMax-this.verticalMin)),h-=this.mouseX*n,this.lookVertical&&(o-=this.mouseY*n*r),o=Math.max(-85,Math.min(85,o));var m=e.MathUtils.degToRad(90-o),c=e.MathUtils.degToRad(h);this.constrainVertical&&(m=e.MathUtils.mapLinear(m,0,Math.PI,this.verticalMin,this.verticalMax));var d=this.object.position;s.setFromSphericalCoords(1,m,c).add(d),this.object.lookAt(s)}}),this.dispose=function(){this.domElement.removeEventListener("contextmenu",m,!1),this.domElement.removeEventListener("mousedown",d,!1),this.domElement.removeEventListener("mousemove",c,!1),this.domElement.removeEventListener("mouseup",v,!1),window.removeEventListener("keydown",l,!1),window.removeEventListener("keyup",u,!1)};var c=w(this,this.onMouseMove),d=w(this,this.onMouseDown),v=w(this,this.onMouseUp),l=w(this,this.onKeyDown),u=w(this,this.onKeyUp);function w(e,t){return function(){t.apply(e,arguments)}}function f(t){var i=t.object.quaternion;a.set(0,0,-1).applyQuaternion(i),n.setFromVector3(a),o=90-e.MathUtils.radToDeg(n.phi),h=e.MathUtils.radToDeg(n.theta)}this.domElement.addEventListener("contextmenu",m,!1),this.domElement.addEventListener("mousemove",c,!1),this.domElement.addEventListener("mousedown",d,!1),this.domElement.addEventListener("mouseup",v,!1),window.addEventListener("keydown",l,!1),window.addEventListener("keyup",u,!1),this.handleResize(),f(this)}});
//# sourceMappingURL=../sourcemaps/controls/FirstPersonControls.js.map
