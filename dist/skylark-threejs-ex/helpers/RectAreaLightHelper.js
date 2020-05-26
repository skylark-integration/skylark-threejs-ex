/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";function i(e,i){this.type="RectAreaLightHelper",this.light=e,this.color=i;var r=new t.BufferGeometry;r.setAttribute("position",new t.Float32BufferAttribute([1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],3)),r.computeBoundingSphere();var o=new t.LineBasicMaterial({fog:!1});t.Line.call(this,r,o);var s=new t.BufferGeometry;s.setAttribute("position",new t.Float32BufferAttribute([1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],3)),s.computeBoundingSphere(),this.add(new t.Mesh(s,new t.MeshBasicMaterial({side:t.BackSide,fog:!1}))),this.update()}return i.prototype=Object.create(t.Line.prototype),i.prototype.constructor=i,i.prototype.update=function(){if(this.scale.set(.5*this.light.width,.5*this.light.height,1),void 0!==this.color)this.material.color.set(this.color),this.children[0].material.color.set(this.color);else{this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);var t=this.material.color,e=Math.max(t.r,t.g,t.b);e>1&&t.multiplyScalar(1/e),this.children[0].material.color.copy(this.material.color)}},i.prototype.dispose=function(){this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()},e.helpers.RectAreaLightHelper=i});
//# sourceMappingURL=../sourcemaps/helpers/RectAreaLightHelper.js.map
