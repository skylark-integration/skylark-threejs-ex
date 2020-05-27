define([
    "../threex",
    './LineSegments2',
    './LineGeometry',
    './LineMaterial'
], function (
    threex,
    LineSegments2, 
    LineGeometry, 
    LineMaterial
) {
    'use strict';
    var Line2 = function (geometry, material) {
        LineSegments2.call(this);
        this.type = 'Line2';
        this.geometry = geometry !== undefined ? geometry : new LineGeometry();
        this.material = material !== undefined ? material : new LineMaterial({ color: Math.random() * 16777215 });
    };
    Line2.prototype = Object.assign(Object.create(LineSegments2.prototype), {
        constructor: Line2,
        isLine2: true
    });

    return threex.lines.Line2 = Line2;
});