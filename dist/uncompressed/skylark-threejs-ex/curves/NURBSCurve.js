define([
    "skylark-threejs",
    "../threex",
    './NURBSUtils'
], function (
    THREE,
    threex,
    NURBSUtils
) {
    'use strict';
    var NURBSCurve = function (degree, knots, controlPoints, startKnot, endKnot) {
        THREE.Curve.call(this);
        this.degree = degree;
        this.knots = knots;
        this.controlPoints = [];
        this.startKnot = startKnot || 0;
        this.endKnot = endKnot || this.knots.length - 1;
        for (var i = 0; i < controlPoints.length; ++i) {
            var point = controlPoints[i];
            this.controlPoints[i] = new THREE.Vector4(point.x, point.y, point.z, point.w);
        }
    };
    NURBSCurve.prototype = Object.create(THREE.Curve.prototype);
    NURBSCurve.prototype.constructor = NURBSCurve;
    NURBSCurve.prototype.getPoint = function (t) {
        var u = this.knots[this.startKnot] + t * (this.knots[this.endKnot] - this.knots[this.startKnot]);
        var hpoint = NURBSUtils.calcBSplinePoint(this.degree, this.knots, this.controlPoints, u);
        if (hpoint.w != 1) {
            hpoint.divideScalar(hpoint.w);
        }
        return new THREE.Vector3(hpoint.x, hpoint.y, hpoint.z);
    };
    NURBSCurve.prototype.getTangent = function (t) {
        var u = this.knots[0] + t * (this.knots[this.knots.length - 1] - this.knots[0]);
        var ders = NURBSUtils.calcNURBSDerivatives(this.degree, this.knots, this.controlPoints, u, 1);
        var tangent = ders[1].clone();
        tangent.normalize();
        return tangent;
    };
    
    return threex.curves.NURBSCurve = NURBSCurve;
});