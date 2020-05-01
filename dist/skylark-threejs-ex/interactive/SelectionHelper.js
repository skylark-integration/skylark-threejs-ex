/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){return t.SelectionHelper=function(){function e(e,i,n){this.element=document.createElement("div"),this.element.classList.add(n),this.element.style.pointerEvents="none",this.renderer=i,this.startPoint=new t.Vector2,this.pointTopLeft=new t.Vector2,this.pointBottomRight=new t.Vector2,this.isDown=!1,this.renderer.domElement.addEventListener("mousedown",function(t){this.isDown=!0,this.onSelectStart(t)}.bind(this),!1),this.renderer.domElement.addEventListener("mousemove",function(t){this.isDown&&this.onSelectMove(t)}.bind(this),!1),this.renderer.domElement.addEventListener("mouseup",function(t){this.isDown=!1,this.onSelectOver(t)}.bind(this),!1)}return e.prototype.onSelectStart=function(t){this.renderer.domElement.parentElement.appendChild(this.element),this.element.style.left=t.clientX+"px",this.element.style.top=t.clientY+"px",this.element.style.width="0px",this.element.style.height="0px",this.startPoint.x=t.clientX,this.startPoint.y=t.clientY},e.prototype.onSelectMove=function(t){this.pointBottomRight.x=Math.max(this.startPoint.x,t.clientX),this.pointBottomRight.y=Math.max(this.startPoint.y,t.clientY),this.pointTopLeft.x=Math.min(this.startPoint.x,t.clientX),this.pointTopLeft.y=Math.min(this.startPoint.y,t.clientY),this.element.style.left=this.pointTopLeft.x+"px",this.element.style.top=this.pointTopLeft.y+"px",this.element.style.width=this.pointBottomRight.x-this.pointTopLeft.x+"px",this.element.style.height=this.pointBottomRight.y-this.pointTopLeft.y+"px"},e.prototype.onSelectOver=function(){this.element.parentElement.removeChild(this.element)},e}(),t.SelectionHelper});
//# sourceMappingURL=../sourcemaps/interactive/SelectionHelper.js.map