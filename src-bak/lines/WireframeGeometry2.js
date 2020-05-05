define([
    "skylark-threejs",
    '../lines/LineSegmentsGeometry.js'
], function (a, b) {
    'use strict';
    var WireframeGeometry2 = function (geometry) {
        b.LineSegmentsGeometry.call(this);
        this.type = 'WireframeGeometry2';
        this.fromWireframeGeometry(new a.WireframeGeometry(geometry));
    };
    WireframeGeometry2.prototype = Object.assign(Object.create(b.LineSegmentsGeometry.prototype), {
        constructor: WireframeGeometry2,
        isWireframeGeometry2: true
    });
    return WireframeGeometry2;
});