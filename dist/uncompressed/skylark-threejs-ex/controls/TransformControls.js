define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var TransformControls = function (camera, domElement) {
        if (domElement === undefined) {
            console.warn('THREE.TransformControls: The second parameter "domElement" is now mandatory.');
            domElement = document;
        }
        THREE.Object3D.call(this);
        this.visible = false;
        this.domElement = domElement;
        var _gizmo = new TransformControlsGizmo();
        this.add(_gizmo);
        var _plane = new TransformControlsPlane();
        this.add(_plane);
        var scope = this;
        defineProperty('camera', camera);
        defineProperty('object', undefined);
        defineProperty('enabled', true);
        defineProperty('axis', null);
        defineProperty('mode', 'translate');
        defineProperty('translationSnap', null);
        defineProperty('rotationSnap', null);
        defineProperty('scaleSnap', null);
        defineProperty('space', 'world');
        defineProperty('size', 1);
        defineProperty('dragging', false);
        defineProperty('showX', true);
        defineProperty('showY', true);
        defineProperty('showZ', true);
        var changeEvent = { type: 'change' };
        var mouseDownEvent = { type: 'mouseDown' };
        var mouseUpEvent = {
            type: 'mouseUp',
            mode: scope.mode
        };
        var objectChangeEvent = { type: 'objectChange' };
        var ray = new THREE.Raycaster();
        var _tempVector = new THREE.Vector3();
        var _tempVector2 = new THREE.Vector3();
        var _tempQuaternion = new THREE.Quaternion();
        var _unit = {
            X: new THREE.Vector3(1, 0, 0),
            Y: new THREE.Vector3(0, 1, 0),
            Z: new THREE.Vector3(0, 0, 1)
        };
        var pointStart = new THREE.Vector3();
        var pointEnd = new THREE.Vector3();
        var offset = new THREE.Vector3();
        var rotationAxis = new THREE.Vector3();
        var startNorm = new THREE.Vector3();
        var endNorm = new THREE.Vector3();
        var rotationAngle = 0;
        var cameraPosition = new THREE.Vector3();
        var cameraQuaternion = new THREE.Quaternion();
        var cameraScale = new THREE.Vector3();
        var parentPosition = new THREE.Vector3();
        var parentQuaternion = new THREE.Quaternion();
        var parentQuaternionInv = new THREE.Quaternion();
        var parentScale = new THREE.Vector3();
        var worldPositionStart = new THREE.Vector3();
        var worldQuaternionStart = new THREE.Quaternion();
        var worldScaleStart = new THREE.Vector3();
        var worldPosition = new THREE.Vector3();
        var worldQuaternion = new THREE.Quaternion();
        var worldQuaternionInv = new THREE.Quaternion();
        var worldScale = new THREE.Vector3();
        var eye = new THREE.Vector3();
        var positionStart = new THREE.Vector3();
        var quaternionStart = new THREE.Quaternion();
        var scaleStart = new THREE.Vector3();
        defineProperty('worldPosition', worldPosition);
        defineProperty('worldPositionStart', worldPositionStart);
        defineProperty('worldQuaternion', worldQuaternion);
        defineProperty('worldQuaternionStart', worldQuaternionStart);
        defineProperty('cameraPosition', cameraPosition);
        defineProperty('cameraQuaternion', cameraQuaternion);
        defineProperty('pointStart', pointStart);
        defineProperty('pointEnd', pointEnd);
        defineProperty('rotationAxis', rotationAxis);
        defineProperty('rotationAngle', rotationAngle);
        defineProperty('eye', eye);
        {
            domElement.addEventListener('mousedown', onPointerDown, false);
            domElement.addEventListener('touchstart', onPointerDown, false);
            domElement.addEventListener('mousemove', onPointerHover, false);
            domElement.addEventListener('touchmove', onPointerHover, false);
            domElement.addEventListener('touchmove', onPointerMove, false);
            document.addEventListener('mouseup', onPointerUp, false);
            domElement.addEventListener('touchend', onPointerUp, false);
            domElement.addEventListener('touchcancel', onPointerUp, false);
            domElement.addEventListener('touchleave', onPointerUp, false);
        }
        this.dispose = function () {
            domElement.removeEventListener('mousedown', onPointerDown);
            domElement.removeEventListener('touchstart', onPointerDown);
            domElement.removeEventListener('mousemove', onPointerHover);
            document.removeEventListener('mousemove', onPointerMove);
            domElement.removeEventListener('touchmove', onPointerHover);
            domElement.removeEventListener('touchmove', onPointerMove);
            document.removeEventListener('mouseup', onPointerUp);
            domElement.removeEventListener('touchend', onPointerUp);
            domElement.removeEventListener('touchcancel', onPointerUp);
            domElement.removeEventListener('touchleave', onPointerUp);
            this.traverse(function (child) {
                if (child.geometry)
                    child.geometry.dispose();
                if (child.material)
                    child.material.dispose();
            });
        };
        this.attach = function (object) {
            this.object = object;
            this.visible = true;
            return this;
        };
        this.detach = function () {
            this.object = undefined;
            this.visible = false;
            this.axis = null;
            return this;
        };
        function defineProperty(propName, defaultValue) {
            var propValue = defaultValue;
            Object.defineProperty(scope, propName, {
                get: function () {
                    return propValue !== undefined ? propValue : defaultValue;
                },
                set: function (value) {
                    if (propValue !== value) {
                        propValue = value;
                        _plane[propName] = value;
                        _gizmo[propName] = value;
                        scope.dispatchEvent({
                            type: propName + '-changed',
                            value: value
                        });
                        scope.dispatchEvent(changeEvent);
                    }
                }
            });
            scope[propName] = defaultValue;
            _plane[propName] = defaultValue;
            _gizmo[propName] = defaultValue;
        }
        this.updateMatrixWorld = function () {
            if (this.object !== undefined) {
                this.object.updateMatrixWorld();
                if (this.object.parent === null) {
                    console.error('TransformControls: The attached 3D object must be THREE part of the scene graph.');
                } else {
                    this.object.parent.matrixWorld.decompose(parentPosition, parentQuaternion, parentScale);
                }
                this.object.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
                parentQuaternionInv.copy(parentQuaternion).inverse();
                worldQuaternionInv.copy(worldQuaternion).inverse();
            }
            this.camera.updateMatrixWorld();
            this.camera.matrixWorld.decompose(cameraPosition, cameraQuaternion, cameraScale);
            eye.copy(cameraPosition).sub(worldPosition).normalize();
            THREE.Object3D.prototype.updateMatrixWorld.call(this);
        };
        this.pointerHover = function (pointer) {
            if (this.object === undefined || this.dragging === true || pointer.button !== undefined && pointer.button !== 0)
                return;
            ray.setFromCamera(pointer, this.camera);
            var intersect = ray.intersectObjects(_gizmo.picker[this.mode].children, true)[0] || false;
            if (intersect) {
                this.axis = intersect.object.name;
            } else {
                this.axis = null;
            }
        };
        this.pointerDown = function (pointer) {
            if (this.object === undefined || this.dragging === true || pointer.button !== undefined && pointer.button !== 0)
                return;
            if ((pointer.button === 0 || pointer.button === undefined) && this.axis !== null) {
                ray.setFromCamera(pointer, this.camera);
                var planeIntersect = ray.intersectObjects([_plane], true)[0] || false;
                if (planeIntersect) {
                    var space = this.space;
                    if (this.mode === 'scale') {
                        space = 'local';
                    } else if (this.axis === 'E' || this.axis === 'XYZE' || this.axis === 'XYZ') {
                        space = 'world';
                    }
                    if (space === 'local' && this.mode === 'rotate') {
                        var snap = this.rotationSnap;
                        if (this.axis === 'X' && snap)
                            this.object.rotation.x = Math.round(this.object.rotation.x / snap) * snap;
                        if (this.axis === 'Y' && snap)
                            this.object.rotation.y = Math.round(this.object.rotation.y / snap) * snap;
                        if (this.axis === 'Z' && snap)
                            this.object.rotation.z = Math.round(this.object.rotation.z / snap) * snap;
                    }
                    this.object.updateMatrixWorld();
                    this.object.parent.updateMatrixWorld();
                    positionStart.copy(this.object.position);
                    quaternionStart.copy(this.object.quaternion);
                    scaleStart.copy(this.object.scale);
                    this.object.matrixWorld.decompose(worldPositionStart, worldQuaternionStart, worldScaleStart);
                    pointStart.copy(planeIntersect.point).sub(worldPositionStart);
                }
                this.dragging = true;
                mouseDownEvent.mode = this.mode;
                this.dispatchEvent(mouseDownEvent);
            }
        };
        this.pointerMove = function (pointer) {
            var axis = this.axis;
            var mode = this.mode;
            var object = this.object;
            var space = this.space;
            if (mode === 'scale') {
                space = 'local';
            } else if (axis === 'E' || axis === 'XYZE' || axis === 'XYZ') {
                space = 'world';
            }
            if (object === undefined || axis === null || this.dragging === false || pointer.button !== undefined && pointer.button !== 0)
                return;
            ray.setFromCamera(pointer, this.camera);
            var planeIntersect = ray.intersectObjects([_plane], true)[0] || false;
            if (planeIntersect === false)
                return;
            pointEnd.copy(planeIntersect.point).sub(worldPositionStart);
            if (mode === 'translate') {
                offset.copy(pointEnd).sub(pointStart);
                if (space === 'local' && axis !== 'XYZ') {
                    offset.applyQuaternion(worldQuaternionInv);
                }
                if (axis.indexOf('X') === -1)
                    offset.x = 0;
                if (axis.indexOf('Y') === -1)
                    offset.y = 0;
                if (axis.indexOf('Z') === -1)
                    offset.z = 0;
                if (space === 'local' && axis !== 'XYZ') {
                    offset.applyQuaternion(quaternionStart).divide(parentScale);
                } else {
                    offset.applyQuaternion(parentQuaternionInv).divide(parentScale);
                }
                object.position.copy(offset).add(positionStart);
                if (this.translationSnap) {
                    if (space === 'local') {
                        object.position.applyQuaternion(_tempQuaternion.copy(quaternionStart).inverse());
                        if (axis.search('X') !== -1) {
                            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
                        }
                        if (axis.search('Y') !== -1) {
                            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
                        }
                        if (axis.search('Z') !== -1) {
                            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
                        }
                        object.position.applyQuaternion(quaternionStart);
                    }
                    if (space === 'world') {
                        if (object.parent) {
                            object.position.add(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
                        }
                        if (axis.search('X') !== -1) {
                            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
                        }
                        if (axis.search('Y') !== -1) {
                            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
                        }
                        if (axis.search('Z') !== -1) {
                            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
                        }
                        if (object.parent) {
                            object.position.sub(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
                        }
                    }
                }
            } else if (mode === 'scale') {
                if (axis.search('XYZ') !== -1) {
                    var d = pointEnd.length() / pointStart.length();
                    if (pointEnd.dot(pointStart) < 0)
                        d *= -1;
                    _tempVector2.set(d, d, d);
                } else {
                    _tempVector.copy(pointStart);
                    _tempVector2.copy(pointEnd);
                    _tempVector.applyQuaternion(worldQuaternionInv);
                    _tempVector2.applyQuaternion(worldQuaternionInv);
                    _tempVector2.divide(_tempVector);
                    if (axis.search('X') === -1) {
                        _tempVector2.x = 1;
                    }
                    if (axis.search('Y') === -1) {
                        _tempVector2.y = 1;
                    }
                    if (axis.search('Z') === -1) {
                        _tempVector2.z = 1;
                    }
                }
                object.scale.copy(scaleStart).multiply(_tempVector2);
                if (this.scaleSnap) {
                    if (axis.search('X') !== -1) {
                        object.scale.x = Math.round(object.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
                    }
                    if (axis.search('Y') !== -1) {
                        object.scale.y = Math.round(object.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
                    }
                    if (axis.search('Z') !== -1) {
                        object.scale.z = Math.round(object.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
                    }
                }
            } else if (mode === 'rotate') {
                offset.copy(pointEnd).sub(pointStart);
                var ROTATION_SPEED = 20 / worldPosition.distanceTo(_tempVector.setFromMatrixPosition(this.camera.matrixWorld));
                if (axis === 'E') {
                    rotationAxis.copy(eye);
                    rotationAngle = pointEnd.angleTo(pointStart);
                    startNorm.copy(pointStart).normalize();
                    endNorm.copy(pointEnd).normalize();
                    rotationAngle *= endNorm.cross(startNorm).dot(eye) < 0 ? 1 : -1;
                } else if (axis === 'XYZE') {
                    rotationAxis.copy(offset).cross(eye).normalize();
                    rotationAngle = offset.dot(_tempVector.copy(rotationAxis).cross(this.eye)) * ROTATION_SPEED;
                } else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
                    rotationAxis.copy(_unit[axis]);
                    _tempVector.copy(_unit[axis]);
                    if (space === 'local') {
                        _tempVector.applyQuaternion(worldQuaternion);
                    }
                    rotationAngle = offset.dot(_tempVector.cross(eye).normalize()) * ROTATION_SPEED;
                }
                if (this.rotationSnap)
                    rotationAngle = Math.round(rotationAngle / this.rotationSnap) * this.rotationSnap;
                this.rotationAngle = rotationAngle;
                if (space === 'local' && axis !== 'E' && axis !== 'XYZE') {
                    object.quaternion.copy(quaternionStart);
                    object.quaternion.multiply(_tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle)).normalize();
                } else {
                    rotationAxis.applyQuaternion(parentQuaternionInv);
                    object.quaternion.copy(_tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle));
                    object.quaternion.multiply(quaternionStart).normalize();
                }
            }
            this.dispatchEvent(changeEvent);
            this.dispatchEvent(objectChangeEvent);
        };
        this.pointerUp = function (pointer) {
            if (pointer.button !== undefined && pointer.button !== 0)
                return;
            if (this.dragging && this.axis !== null) {
                mouseUpEvent.mode = this.mode;
                this.dispatchEvent(mouseUpEvent);
            }
            this.dragging = false;
            if (pointer.button === undefined)
                this.axis = null;
        };
        function getPointer(event) {
            if (document.pointerLockElement) {
                return {
                    x: 0,
                    y: 0,
                    button: event.button
                };
            } else {
                var pointer = event.changedTouches ? event.changedTouches[0] : event;
                var rect = domElement.getBoundingClientRect();
                return {
                    x: (pointer.clientX - rect.left) / rect.width * 2 - 1,
                    y: -(pointer.clientY - rect.top) / rect.height * 2 + 1,
                    button: event.button
                };
            }
        }
        function onPointerHover(event) {
            if (!scope.enabled)
                return;
            scope.pointerHover(getPointer(event));
        }
        function onPointerDown(event) {
            if (!scope.enabled)
                return;
            document.addEventListener('mousemove', onPointerMove, false);
            scope.pointerHover(getPointer(event));
            scope.pointerDown(getPointer(event));
        }
        function onPointerMove(event) {
            if (!scope.enabled)
                return;
            scope.pointerMove(getPointer(event));
        }
        function onPointerUp(event) {
            if (!scope.enabled)
                return;
            document.removeEventListener('mousemove', onPointerMove, false);
            scope.pointerUp(getPointer(event));
        }
        this.getMode = function () {
            return scope.mode;
        };
        this.setMode = function (mode) {
            scope.mode = mode;
        };
        this.setTranslationSnap = function (translationSnap) {
            scope.translationSnap = translationSnap;
        };
        this.setRotationSnap = function (rotationSnap) {
            scope.rotationSnap = rotationSnap;
        };
        this.setScaleSnap = function (scaleSnap) {
            scope.scaleSnap = scaleSnap;
        };
        this.setSize = function (size) {
            scope.size = size;
        };
        this.setSpace = function (space) {
            scope.space = space;
        };
        this.update = function () {
            console.warn('THREE.TransformControls: update function has no more functionality and therefore has been deprecated.');
        };
    };
    TransformControls.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: TransformControls,
        isTransformControls: true
    });

    return threex.controls.TransformControls = TransformControls;
});