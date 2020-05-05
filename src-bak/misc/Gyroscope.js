define(["skylark-threejs"], function (a) {
    'use strict';
    var Gyroscope = function () {
        a.Object3D.call(this);
    };
    Gyroscope.prototype = Object.create(a.Object3D.prototype);
    Gyroscope.prototype.constructor = Gyroscope;
    Gyroscope.prototype.updateMatrixWorld = function () {
        var translationObject = new a.Vector3();
        var quaternionObject = new a.Quaternion();
        var scaleObject = new a.Vector3();
        var translationWorld = new a.Vector3();
        var quaternionWorld = new a.Quaternion();
        var scaleWorld = new a.Vector3();
        return function updateMatrixWorld(force) {
            this.matrixAutoUpdate && this.updateMatrix();
            if (this.matrixWorldNeedsUpdate || force) {
                if (this.parent !== null) {
                    this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
                    this.matrixWorld.decompose(translationWorld, quaternionWorld, scaleWorld);
                    this.matrix.decompose(translationObject, quaternionObject, scaleObject);
                    this.matrixWorld.compose(translationWorld, quaternionObject, scaleWorld);
                } else {
                    this.matrixWorld.copy(this.matrix);
                }
                this.matrixWorldNeedsUpdate = false;
                force = true;
            }
            for (var i = 0, l = this.children.length; i < l; i++) {
                this.children[i].updateMatrixWorld(force);
            }
        };
    }();
    return Gyroscope;
});