define([
    "skylark-threejs"
], function (THREE) {
    'use strict';
    var _v1 = new THREE.Vector3();
    var _v2 = new THREE.Vector3();
    var _normalMatrix = new THREE.Matrix3();
    function FaceNormalsHelper(object, size, hex, linewidth) {
        this.object = object;
        this.size = size !== undefined ? size : 1;
        var color = hex !== undefined ? hex : 16776960;
        var width = linewidth !== undefined ? linewidth : 1;
        var nNormals = 0;
        var objGeometry = this.object.geometry;
        if (objGeometry && objGeometry.isGeometry) {
            nNormals = objGeometry.faces.length;
        } else {
            console.warn('THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead.');
        }
        var geometry = new THREE.BufferGeometry();
        var positions = new THREE.Float32BufferAttribute(nNormals * 2 * 3, 3);
        geometry.setAttribute('position', positions);
        THREE.LineSegments.call(this, geometry, new THREE.LineBasicMaterial({
            color: color,
            linewidth: width
        }));
        this.matrixAutoUpdate = false;
        this.update();
    }
    FaceNormalsHelper.prototype = Object.create(THREE.LineSegments.prototype);
    FaceNormalsHelper.prototype.constructor = FaceNormalsHelper;
    FaceNormalsHelper.prototype.update = function () {
        this.object.updateMatrixWorld(true);
        _normalMatrix.getNormalMatrix(this.object.matrixWorld);
        var matrixWorld = this.object.matrixWorld;
        var position = this.geometry.attributes.position;
        var objGeometry = this.object.geometry;
        var vertices = objGeometry.vertices;
        var faces = objGeometry.faces;
        var idx = 0;
        for (var i = 0, l = faces.length; i < l; i++) {
            var face = faces[i];
            var normal = face.normal;
            _v1.copy(vertices[face.a]).add(vertices[face.b]).add(vertices[face.c]).divideScalar(3).applyMatrix4(matrixWorld);
            _v2.copy(normal).applyMatrix3(_normalMatrix).normalize().multiplyScalar(this.size).add(_v1);
            position.setXYZ(idx, _v1.x, _v1.y, _v1.z);
            idx = idx + 1;
            position.setXYZ(idx, _v2.x, _v2.y, _v2.z);
            idx = idx + 1;
        }
        position.needsUpdate = true;
    };
    return FaceNormalsHelper;
});