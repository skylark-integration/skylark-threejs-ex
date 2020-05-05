define([
    '../lines/LineSegments2.js',
    '../lines/LineGeometry.js',
    '../lines/LineMaterial.js'
], function (a, b, c) {
    'use strict';
    var Line2 = function (geometry, material) {
        a.LineSegments2.call(this);
        this.type = 'Line2';
        this.geometry = geometry !== undefined ? geometry : new b.LineGeometry();
        this.material = material !== undefined ? material : new c.LineMaterial({ color: Math.random() * 16777215 });
    };
    Line2.prototype = Object.assign(Object.create(a.LineSegments2.prototype), {
        constructor: Line2,
        isLine2: true
    });
    return Line2;
});