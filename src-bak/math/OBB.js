define(["skylark-threejs"], function (a) {
    'use strict';
    var a = {
        c: null,
        u: [
            new a.Vector3(),
            new a.Vector3(),
            new a.Vector3()
        ],
        e: []
    };
    var b = {
        c: null,
        u: [
            new a.Vector3(),
            new a.Vector3(),
            new a.Vector3()
        ],
        e: []
    };
    var R = [
        [],
        [],
        []
    ];
    var AbsR = [
        [],
        [],
        []
    ];
    var t = [];
    var xAxis = new a.Vector3();
    var yAxis = new a.Vector3();
    var zAxis = new a.Vector3();
    var v1 = new a.Vector3();
    var size = new a.Vector3();
    var closestPoint = new a.Vector3();
    var rotationMatrix = new a.Matrix3();
    var aabb = new a.Box3();
    var matrix = new a.Matrix4();
    var inverse = new a.Matrix4();
    var localRay = new a.Ray();
    function OBB(center = new a.Vector3(), halfSize = new a.Vector3(), rotation = new a.Matrix3()) {
        this.center = center;
        this.halfSize = halfSize;
        this.rotation = rotation;
    }
    Object.assign(OBB.prototype, {
        set: function (center, halfSize, rotation) {
            this.center = center;
            this.halfSize = halfSize;
            this.rotation = rotation;
            return this;
        },
        copy: function (obb) {
            this.center.copy(obb.center);
            this.halfSize.copy(obb.halfSize);
            this.rotation.copy(obb.rotation);
            return this;
        },
        clone: function () {
            return new this.constructor().copy(this);
        },
        getSize: function (result) {
            return result.copy(this.halfSize).multiplyScalar(2);
        },
        clampPoint: function (point, result) {
            var halfSize = this.halfSize;
            v1.subVectors(point, this.center);
            this.rotation.extractBasis(xAxis, yAxis, zAxis);
            result.copy(this.center);
            var x = a.MathUtils.clamp(v1.dot(xAxis), -halfSize.x, halfSize.x);
            result.add(xAxis.multiplyScalar(x));
            var y = a.MathUtils.clamp(v1.dot(yAxis), -halfSize.y, halfSize.y);
            result.add(yAxis.multiplyScalar(y));
            var z = a.MathUtils.clamp(v1.dot(zAxis), -halfSize.z, halfSize.z);
            result.add(zAxis.multiplyScalar(z));
            return result;
        },
        containsPoint: function (point) {
            v1.subVectors(point, this.center);
            this.rotation.extractBasis(xAxis, yAxis, zAxis);
            return Math.abs(v1.dot(xAxis)) <= this.halfSize.x && Math.abs(v1.dot(yAxis)) <= this.halfSize.y && Math.abs(v1.dot(zAxis)) <= this.halfSize.z;
        },
        intersectsBox3: function (box3) {
            return this.intersectsOBB(obb.fromBox3(box3));
        },
        intersectsSphere: function (sphere) {
            this.clampPoint(sphere.center, closestPoint);
            return closestPoint.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
        },
        intersectsOBB: function (obb, epsilon = Number.EPSILON) {
            a.c = this.center;
            a.e[0] = this.halfSize.x;
            a.e[1] = this.halfSize.y;
            a.e[2] = this.halfSize.z;
            this.rotation.extractBasis(a.u[0], a.u[1], a.u[2]);
            b.c = obb.center;
            b.e[0] = obb.halfSize.x;
            b.e[1] = obb.halfSize.y;
            b.e[2] = obb.halfSize.z;
            obb.rotation.extractBasis(b.u[0], b.u[1], b.u[2]);
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    R[i][j] = a.u[i].dot(b.u[j]);
                }
            }
            v1.subVectors(b.c, a.c);
            t[0] = v1.dot(a.u[0]);
            t[1] = v1.dot(a.u[1]);
            t[2] = v1.dot(a.u[2]);
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    AbsR[i][j] = Math.abs(R[i][j]) + epsilon;
                }
            }
            var ra, rb;
            for (var i = 0; i < 3; i++) {
                ra = a.e[i];
                rb = b.e[0] * AbsR[i][0] + b.e[1] * AbsR[i][1] + b.e[2] * AbsR[i][2];
                if (Math.abs(t[i]) > ra + rb)
                    return false;
            }
            for (var i = 0; i < 3; i++) {
                ra = a.e[0] * AbsR[0][i] + a.e[1] * AbsR[1][i] + a.e[2] * AbsR[2][i];
                rb = b.e[i];
                if (Math.abs(t[0] * R[0][i] + t[1] * R[1][i] + t[2] * R[2][i]) > ra + rb)
                    return false;
            }
            ra = a.e[1] * AbsR[2][0] + a.e[2] * AbsR[1][0];
            rb = b.e[1] * AbsR[0][2] + b.e[2] * AbsR[0][1];
            if (Math.abs(t[2] * R[1][0] - t[1] * R[2][0]) > ra + rb)
                return false;
            ra = a.e[1] * AbsR[2][1] + a.e[2] * AbsR[1][1];
            rb = b.e[0] * AbsR[0][2] + b.e[2] * AbsR[0][0];
            if (Math.abs(t[2] * R[1][1] - t[1] * R[2][1]) > ra + rb)
                return false;
            ra = a.e[1] * AbsR[2][2] + a.e[2] * AbsR[1][2];
            rb = b.e[0] * AbsR[0][1] + b.e[1] * AbsR[0][0];
            if (Math.abs(t[2] * R[1][2] - t[1] * R[2][2]) > ra + rb)
                return false;
            ra = a.e[0] * AbsR[2][0] + a.e[2] * AbsR[0][0];
            rb = b.e[1] * AbsR[1][2] + b.e[2] * AbsR[1][1];
            if (Math.abs(t[0] * R[2][0] - t[2] * R[0][0]) > ra + rb)
                return false;
            ra = a.e[0] * AbsR[2][1] + a.e[2] * AbsR[0][1];
            rb = b.e[0] * AbsR[1][2] + b.e[2] * AbsR[1][0];
            if (Math.abs(t[0] * R[2][1] - t[2] * R[0][1]) > ra + rb)
                return false;
            ra = a.e[0] * AbsR[2][2] + a.e[2] * AbsR[0][2];
            rb = b.e[0] * AbsR[1][1] + b.e[1] * AbsR[1][0];
            if (Math.abs(t[0] * R[2][2] - t[2] * R[0][2]) > ra + rb)
                return false;
            ra = a.e[0] * AbsR[1][0] + a.e[1] * AbsR[0][0];
            rb = b.e[1] * AbsR[2][2] + b.e[2] * AbsR[2][1];
            if (Math.abs(t[1] * R[0][0] - t[0] * R[1][0]) > ra + rb)
                return false;
            ra = a.e[0] * AbsR[1][1] + a.e[1] * AbsR[0][1];
            rb = b.e[0] * AbsR[2][2] + b.e[2] * AbsR[2][0];
            if (Math.abs(t[1] * R[0][1] - t[0] * R[1][1]) > ra + rb)
                return false;
            ra = a.e[0] * AbsR[1][2] + a.e[1] * AbsR[0][2];
            rb = b.e[0] * AbsR[2][1] + b.e[1] * AbsR[2][0];
            if (Math.abs(t[1] * R[0][2] - t[0] * R[1][2]) > ra + rb)
                return false;
            return true;
        },
        intersectsPlane: function (plane) {
            this.rotation.extractBasis(xAxis, yAxis, zAxis);
            const r = this.halfSize.x * Math.abs(plane.normal.dot(xAxis)) + this.halfSize.y * Math.abs(plane.normal.dot(yAxis)) + this.halfSize.z * Math.abs(plane.normal.dot(zAxis));
            const d = plane.normal.dot(this.center) - plane.constant;
            return Math.abs(d) <= r;
        },
        intersectRay: function (ray, result) {
            this.getSize(size);
            aabb.setFromCenterAndSize(v1.set(0, 0, 0), size);
            matrix4FromRotationMatrix(matrix, this.rotation);
            matrix.setPosition(this.center);
            localRay.copy(ray).applyMatrix4(inverse.getInverse(matrix));
            if (localRay.intersectBox(aabb, result)) {
                return result.applyMatrix4(matrix);
            } else {
                return null;
            }
        },
        intersectsRay: function (ray) {
            return this.intersectRay(ray, v1) !== null;
        },
        fromBox3: function (box3) {
            box3.getCenter(this.center);
            box3.getSize(this.halfSize).multiplyScalar(0.5);
            this.rotation.identity();
            return this;
        },
        equals: function (obb) {
            return obb.center.equals(this.center) && obb.halfSize.equals(this.halfSize) && obb.rotation.equals(this.rotation);
        },
        applyMatrix4: function (matrix) {
            var e = matrix.elements;
            var sx = v1.set(e[0], e[1], e[2]).length();
            var sy = v1.set(e[4], e[5], e[6]).length();
            var sz = v1.set(e[8], e[9], e[10]).length();
            var det = matrix.determinant();
            if (det < 0)
                sx = -sx;
            rotationMatrix.setFromMatrix4(matrix);
            var invSX = 1 / sx;
            var invSY = 1 / sy;
            var invSZ = 1 / sz;
            rotationMatrix.elements[0] *= invSX;
            rotationMatrix.elements[1] *= invSX;
            rotationMatrix.elements[2] *= invSX;
            rotationMatrix.elements[3] *= invSY;
            rotationMatrix.elements[4] *= invSY;
            rotationMatrix.elements[5] *= invSY;
            rotationMatrix.elements[6] *= invSZ;
            rotationMatrix.elements[7] *= invSZ;
            rotationMatrix.elements[8] *= invSZ;
            this.rotation.multiply(rotationMatrix);
            this.halfSize.x *= sx;
            this.halfSize.y *= sy;
            this.halfSize.z *= sz;
            v1.setFromMatrixPosition(matrix);
            this.center.add(v1);
            return this;
        }
    });
    function matrix4FromRotationMatrix(matrix4, matrix3) {
        var e = matrix4.elements;
        var me = matrix3.elements;
        e[0] = me[0];
        e[1] = me[1];
        e[2] = me[2];
        e[3] = 0;
        e[4] = me[3];
        e[5] = me[4];
        e[6] = me[5];
        e[7] = 0;
        e[8] = me[6];
        e[9] = me[7];
        e[10] = me[8];
        e[11] = 0;
        e[12] = 0;
        e[13] = 0;
        e[14] = 0;
        e[15] = 1;
    }
    var obb = new OBB();

    
    return OBB;
});