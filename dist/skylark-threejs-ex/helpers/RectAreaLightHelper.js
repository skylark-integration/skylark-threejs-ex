/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";function e(e,i){this.type="RectAreaLightHelper",this.light=e,this.color=i;var o=new t.BufferGeometry;o.setAttribute("position",new t.Float32BufferAttribute([1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],3)),o.computeBoundingSphere();var r=new t.LineBasicMaterial({fog:!1});t.Line.call(this,o,r);var s=new t.BufferGeometry;s.setAttribute("position",new t.Float32BufferAttribute([1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],3)),s.computeBoundingSphere(),this.add(new t.Mesh(s,new t.MeshBasicMaterial({side:t.BackSide,fog:!1}))),this.update()}return e.prototype=Object.create(t.Line.prototype),e.prototype.constructor=e,e.prototype.update=function(){if(this.scale.set(.5*this.light.width,.5*this.light.height,1),void 0!==this.color)this.material.color.set(this.color),this.children[0].material.color.set(this.color);else{this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);var t=this.material.color,e=Math.max(t.r,t.g,t.b);e>1&&t.multiplyScalar(1/e),this.children[0].material.color.copy(this.material.color)}},e.prototype.dispose=function(){this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()},e});
//# sourceMappingURL=../sourcemaps/helpers/RectAreaLightHelper.js.map
