/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";function e(e,i,s,n){this.audio=e,this.range=i||1,this.divisionsInnerAngle=s||16,this.divisionsOuterAngle=n||2;var o=new t.BufferGeometry,r=this.divisionsInnerAngle+2*this.divisionsOuterAngle,a=new Float32Array(3*(3*r+3));o.setAttribute("position",new t.BufferAttribute(a,3));var h=new t.LineBasicMaterial({color:65280}),d=new t.LineBasicMaterial({color:16776960});t.Line.call(this,o,[d,h]),this.update()}return e.prototype=Object.create(t.Line.prototype),e.prototype.constructor=e,e.prototype.update=function(){var e,i,s=this.audio,n=this.range,o=this.divisionsInnerAngle,r=this.divisionsOuterAngle,a=t.MathUtils.degToRad(s.panner.coneInnerAngle),h=t.MathUtils.degToRad(s.panner.coneOuterAngle),d=a/2,l=h/2,p=0,u=0,c=this.geometry,g=c.attributes.position;function f(t,s,o,r){var a=(s-t)/o;for(g.setXYZ(p,0,0,0),u++,e=t;e<s;e+=a)i=p+u,g.setXYZ(i,Math.sin(e)*n,0,Math.cos(e)*n),g.setXYZ(i+1,Math.sin(Math.min(e+a,s))*n,0,Math.cos(Math.min(e+a,s))*n),g.setXYZ(i+2,0,0,0),u+=3;c.addGroup(p,u,r),p+=u,u=0}c.clearGroups(),f(-l,-d,r,0),f(-d,d,o,1),f(d,l,r,0),g.needsUpdate=!0,a===h&&(this.material[0].visible=!1)},e.prototype.dispose=function(){this.geometry.dispose(),this.material[0].dispose(),this.material[1].dispose()},e});
//# sourceMappingURL=../sourcemaps/helpers/PositionalAudioHelper.js.map
