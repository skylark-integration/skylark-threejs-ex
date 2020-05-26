/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./NURBSUtils"],function(t,s,n){"use strict";var o=function(s,n,o,i,e){this.degree1=s,this.degree2=n,this.knots1=o,this.knots2=i,this.controlPoints=[];for(var r=o.length-s-1,h=i.length-n-1,c=0;c<r;++c){this.controlPoints[c]=[];for(var k=0;k<h;++k){var l=e[c][k];this.controlPoints[c][k]=new t.Vector4(l.x,l.y,l.z,l.w)}}};return o.prototype={constructor:o,getPoint:function(t,s,o){var i=this.knots1[0]+t*(this.knots1[this.knots1.length-1]-this.knots1[0]),e=this.knots2[0]+s*(this.knots2[this.knots2.length-1]-this.knots2[0]);n.calcSurfacePoint(this.degree1,this.degree2,this.knots1,this.knots2,this.controlPoints,i,e,o)}},s.curves.NURBSSurface=o});
//# sourceMappingURL=../sourcemaps/curves/NURBSSurface.js.map
