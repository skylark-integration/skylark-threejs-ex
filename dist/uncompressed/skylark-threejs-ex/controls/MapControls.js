define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var MapControls = function (object, domElement) {
        OrbitControls.call(this, object, domElement);
        this.mouseButtons.LEFT = THREE.MOUSE.PAN;
        this.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        this.touches.ONE = THREE.TOUCH.PAN;
        this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    };
    MapControls.prototype = Object.create(THREE.EventDispatcher.prototype);
    MapControls.prototype.constructor = MapControls;

	return threex.controls.MapControls = MapControls;
});    