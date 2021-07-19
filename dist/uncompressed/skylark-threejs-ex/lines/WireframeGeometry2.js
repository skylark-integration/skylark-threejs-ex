define([
    "skylark-threejs",
    "../threex",
    './LineSegmentsGeometry'
], function (
    THREE,
    threex,
    LineSegmentsGeometry
) {
    'use strict';
    var WireframeGeometry2 = function (geometry) {
        LineSegmentsGeometry.call(this);
        this.type = 'WireframeGeometry2';
        this.fromWireframeGeometry(new THREE.WireframeGeometry(geometry));
    };
    WireframeGeometry2.prototype = Object.assign(Object.create(LineSegmentsGeometry.prototype), {
        constructor: WireframeGeometry2,
        isWireframeGeometry2: true
    });
    return threex.lines.WireframeGeometry2 = WireframeGeometry2;
});