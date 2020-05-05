define([
    "skylark-threejs",
    '../math/ConvexHull.js'
], function (THREE, b) {
    'use strict';
    var ConvexGeometry = function (points) {
        THREE.Geometry.call(this);
        this.fromBufferGeometry(new ConvexBufferGeometry(points));
        this.mergeVertices();
    };
    ConvexGeometry.prototype = Object.create(THREE.Geometry.prototype);
    ConvexGeometry.prototype.constructor = ConvexGeometry;

    return ConvexGeometry;
});