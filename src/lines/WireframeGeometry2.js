define([
    "skylark-threejs",
    './LineSegmentsGeometry'
], function (THREE, LineSegmentsGeometry) {
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
    return threex.lins.WireframeGeometry2 = WireframeGeometry2;
});