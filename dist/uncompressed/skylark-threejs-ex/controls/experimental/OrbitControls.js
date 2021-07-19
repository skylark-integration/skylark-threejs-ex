define([
    "skylark-threejs",
    "../../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var OrbitControls = function (object, domElement) {
        CameraControls.call(this, object, domElement);
        this.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        this.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        this.touches.ONE = THREE.TOUCH.ROTATE;
        this.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    };
    OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
    OrbitControls.prototype.constructor = OrbitControls;

    return threex.controls.experimental.OrbitControls = OrbitControls;
});