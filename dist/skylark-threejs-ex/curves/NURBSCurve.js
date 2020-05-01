/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./NURBSUtils"],function(t){return t.NURBSCurve=function(e,n,o,s,r){t.Curve.call(this),this.degree=e,this.knots=n,this.controlPoints=[],this.startKnot=s||0,this.endKnot=r||this.knots.length-1;for(var i=0;i<o.length;++i){var h=o[i];this.controlPoints[i]=new t.Vector4(h.x,h.y,h.z,h.w)}},t.NURBSCurve.prototype=Object.create(t.Curve.prototype),t.NURBSCurve.prototype.constructor=t.NURBSCurve,t.NURBSCurve.prototype.getPoint=function(e){var n=this.knots[this.startKnot]+e*(this.knots[this.endKnot]-this.knots[this.startKnot]),o=t.NURBSUtils.calcBSplinePoint(this.degree,this.knots,this.controlPoints,n);return 1!=o.w&&o.divideScalar(o.w),new t.Vector3(o.x,o.y,o.z)},t.NURBSCurve.prototype.getTangent=function(e){var n=this.knots[0]+e*(this.knots[this.knots.length-1]-this.knots[0]),o=t.NURBSUtils.calcNURBSDerivatives(this.degree,this.knots,this.controlPoints,n,1)[1].clone();return o.normalize(),o},t.NURBSCurve});
//# sourceMappingURL=../sourcemaps/curves/NURBSCurve.js.map
