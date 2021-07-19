define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var DecalVertex = function (position, normal) {
        this.position = position;
        this.normal = normal;
    };
    DecalVertex.prototype.clone = function () {
        return new this.constructor(this.position.clone(), this.normal.clone());
    };

    return threex.geometries.DecalVertex = DecalVertex;
});