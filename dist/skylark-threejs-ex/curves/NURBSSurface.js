/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./NURBSUtils"],function(t,s){"use strict";var n=function(s,n,o,i,e){this.degree1=s,this.degree2=n,this.knots1=o,this.knots2=i,this.controlPoints=[];for(var h=o.length-s-1,r=i.length-n-1,c=0;c<h;++c){this.controlPoints[c]=[];for(var k=0;k<r;++k){var l=e[c][k];this.controlPoints[c][k]=new t.Vector4(l.x,l.y,l.z,l.w)}}};return n.prototype={constructor:n,getPoint:function(t,n,o){var i=this.knots1[0]+t*(this.knots1[this.knots1.length-1]-this.knots1[0]),e=this.knots2[0]+n*(this.knots2[this.knots2.length-1]-this.knots2[0]);s.calcSurfacePoint(this.degree1,this.degree2,this.knots1,this.knots2,this.controlPoints,i,e,o)}},n});
//# sourceMappingURL=../sourcemaps/curves/NURBSSurface.js.map
