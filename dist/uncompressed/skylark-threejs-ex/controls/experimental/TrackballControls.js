define([
    "skylark-threejs",
    "../../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var TrackballControls = function (object, domElement) {
        CameraControls.call(this, object, domElement);
        this.trackball = true;
        this.screenSpacePanning = true;
        this.autoRotate = false;
        this.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        this.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        this.touches.ONE = THREE.TOUCH.ROTATE;
        this.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    };
    TrackballControls.prototype = Object.create(THREE.EventDispatcher.prototype);
    TrackballControls.prototype.constructor = TrackballControls;
    
    return threex.controls.experimental.TrackballControls = TrackballControls;
});