/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./NURBSUtils"],function(t,n){"use strict";var o=function(n,o,s,e,i){t.Curve.call(this),this.degree=n,this.knots=o,this.controlPoints=[],this.startKnot=e||0,this.endKnot=i||this.knots.length-1;for(var r=0;r<s.length;++r){var h=s[r];this.controlPoints[r]=new t.Vector4(h.x,h.y,h.z,h.w)}};return(o.prototype=Object.create(t.Curve.prototype)).constructor=o,o.prototype.getPoint=function(o){var s=this.knots[this.startKnot]+o*(this.knots[this.endKnot]-this.knots[this.startKnot]),e=n.calcBSplinePoint(this.degree,this.knots,this.controlPoints,s);return 1!=e.w&&e.divideScalar(e.w),new t.Vector3(e.x,e.y,e.z)},o.prototype.getTangent=function(t){var o=this.knots[0]+t*(this.knots[this.knots.length-1]-this.knots[0]),s=n.calcNURBSDerivatives(this.degree,this.knots,this.controlPoints,o,1)[1].clone();return s.normalize(),s},o});
//# sourceMappingURL=../sourcemaps/curves/NURBSCurve.js.map
