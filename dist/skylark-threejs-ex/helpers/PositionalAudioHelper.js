/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";function i(t,i,s,n){this.audio=t,this.range=i||1,this.divisionsInnerAngle=s||16,this.divisionsOuterAngle=n||2;var o=new e.BufferGeometry,r=this.divisionsInnerAngle+2*this.divisionsOuterAngle,a=new Float32Array(3*(3*r+3));o.setAttribute("position",new e.BufferAttribute(a,3));var h=new e.LineBasicMaterial({color:65280}),l=new e.LineBasicMaterial({color:16776960});e.Line.call(this,o,[l,h]),this.update()}return i.prototype=Object.create(e.Line.prototype),i.prototype.constructor=i,i.prototype.update=function(){var t,i,s=this.audio,n=this.range,o=this.divisionsInnerAngle,r=this.divisionsOuterAngle,a=e.MathUtils.degToRad(s.panner.coneInnerAngle),h=e.MathUtils.degToRad(s.panner.coneOuterAngle),l=a/2,p=h/2,d=0,u=0,c=this.geometry,g=c.attributes.position;function A(e,s,o,r){var a=(s-e)/o;for(g.setXYZ(d,0,0,0),u++,t=e;t<s;t+=a)i=d+u,g.setXYZ(i,Math.sin(t)*n,0,Math.cos(t)*n),g.setXYZ(i+1,Math.sin(Math.min(t+a,s))*n,0,Math.cos(Math.min(t+a,s))*n),g.setXYZ(i+2,0,0,0),u+=3;c.addGroup(d,u,r),d+=u,u=0}c.clearGroups(),A(-p,-l,r,0),A(-l,l,o,1),A(l,p,r,0),g.needsUpdate=!0,a===h&&(this.material[0].visible=!1)},i.prototype.dispose=function(){this.geometry.dispose(),this.material[0].dispose(),this.material[1].dispose()},t.helpers.PositionalAudioHelper=i});
//# sourceMappingURL=../sourcemaps/helpers/PositionalAudioHelper.js.map
