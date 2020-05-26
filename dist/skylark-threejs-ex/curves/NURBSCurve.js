/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./NURBSUtils"],function(t,n,s){"use strict";var o=function(n,s,o,e,i){t.Curve.call(this),this.degree=n,this.knots=s,this.controlPoints=[],this.startKnot=e||0,this.endKnot=i||this.knots.length-1;for(var r=0;r<o.length;++r){var h=o[r];this.controlPoints[r]=new t.Vector4(h.x,h.y,h.z,h.w)}};return(o.prototype=Object.create(t.Curve.prototype)).constructor=o,o.prototype.getPoint=function(n){var o=this.knots[this.startKnot]+n*(this.knots[this.endKnot]-this.knots[this.startKnot]),e=s.calcBSplinePoint(this.degree,this.knots,this.controlPoints,o);return 1!=e.w&&e.divideScalar(e.w),new t.Vector3(e.x,e.y,e.z)},o.prototype.getTangent=function(t){var n=this.knots[0]+t*(this.knots[this.knots.length-1]-this.knots[0]),o=s.calcNURBSDerivatives(this.degree,this.knots,this.controlPoints,n,1)[1].clone();return o.normalize(),o},n.curves.NURBSCurve=o});
//# sourceMappingURL=../sourcemaps/curves/NURBSCurve.js.map
