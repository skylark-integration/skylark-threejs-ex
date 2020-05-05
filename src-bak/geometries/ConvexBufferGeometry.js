define([
    "skylark-threejs",
    '../math/ConvexHull.js'
], function (THREE, b) {
    'use strict';
    var ConvexBufferGeometry = function (points) {
        THREE.BufferGeometry.call(this);
        var vertices = [];
        var normals = [];
        if (b.ConvexHull === undefined) {
            console.error('THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on ConvexHull');
        }
        var convexHull = new b.ConvexHull().setFromPoints(points);
        var faces = convexHull.faces;
        for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            var edge = face.edge;
            do {
                var point = edge.head().point;
                vertices.push(point.x, point.y, point.z);
                normals.push(face.normal.x, face.normal.y, face.normal.z);
                edge = edge.next;
            } while (edge !== face.edge);
        }
        this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    };
    ConvexBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
    ConvexBufferGeometry.prototype.constructor = ConvexBufferGeometry;
    return ConvexBufferGeometry;
});