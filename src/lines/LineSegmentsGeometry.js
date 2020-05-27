define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var LineSegmentsGeometry = function () {
        THREE.InstancedBufferGeometry.call(this);
        this.type = 'LineSegmentsGeometry';
        var positions = [
            -1,
            2,
            0,
            1,
            2,
            0,
            -1,
            1,
            0,
            1,
            1,
            0,
            -1,
            0,
            0,
            1,
            0,
            0,
            -1,
            -1,
            0,
            1,
            -1,
            0
        ];
        var uvs = [
            -1,
            2,
            1,
            2,
            -1,
            1,
            1,
            1,
            -1,
            -1,
            1,
            -1,
            -1,
            -2,
            1,
            -2
        ];
        var index = [
            0,
            2,
            1,
            2,
            3,
            1,
            2,
            4,
            3,
            4,
            5,
            3,
            4,
            6,
            5,
            6,
            7,
            5
        ];
        this.setIndex(index);
        this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    };
    LineSegmentsGeometry.prototype = Object.assign(Object.create(THREE.InstancedBufferGeometry.prototype), {
        constructor: LineSegmentsGeometry,
        isLineSegmentsGeometry: true,
        applyMatrix4: function (matrix) {
            var start = this.attributes.instanceStart;
            var end = this.attributes.instanceEnd;
            if (start !== undefined) {
                start.applyMatrix4(matrix);
                end.applyMatrix4(matrix);
                start.data.needsUpdate = true;
            }
            if (this.boundingBox !== null) {
                this.computeBoundingBox();
            }
            if (this.boundingSphere !== null) {
                this.computeBoundingSphere();
            }
            return this;
        },
        setPositions: function (array) {
            var lineSegments;
            if (array instanceof Float32Array) {
                lineSegments = array;
            } else if (Array.isArray(array)) {
                lineSegments = new Float32Array(array);
            }
            var instanceBuffer = new THREE.InstancedInterleavedBuffer(lineSegments, 6, 1);
            this.setAttribute('instanceStart', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0));
            this.setAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3));
            this.computeBoundingBox();
            this.computeBoundingSphere();
            return this;
        },
        setColors: function (array) {
            var colors;
            if (array instanceof Float32Array) {
                colors = array;
            } else if (Array.isArray(array)) {
                colors = new Float32Array(array);
            }
            var instanceColorBuffer = new THREE.InstancedInterleavedBuffer(colors, 6, 1);
            this.setAttribute('instanceColorStart', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 0));
            this.setAttribute('instanceColorEnd', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 3));
            return this;
        },
        fromWireframeGeometry: function (geometry) {
            this.setPositions(geometry.attributes.position.array);
            return this;
        },
        fromEdgesGeometry: function (geometry) {
            this.setPositions(geometry.attributes.position.array);
            return this;
        },
        fromMesh: function (mesh) {
            this.fromWireframeGeometry(new THREE.WireframeGeometry(mesh.geometry));
            return this;
        },
        fromLineSegements: function (lineSegments) {
            var geometry = lineSegments.geometry;
            if (geometry.isGeometry) {
                this.setPositions(geometry.vertices);
            } else if (geometry.isBufferGeometry) {
                this.setPositions(geometry.position.array);
            }
            return this;
        },
        computeBoundingBox: function () {
            var box = new THREE.Box3();
            return function computeBoundingBox() {
                if (this.boundingBox === null) {
                    this.boundingBox = new THREE.Box3();
                }
                var start = this.attributes.instanceStart;
                var end = this.attributes.instanceEnd;
                if (start !== undefined && end !== undefined) {
                    this.boundingBox.setFromBufferAttribute(start);
                    box.setFromBufferAttribute(end);
                    this.boundingBox.union(box);
                }
            };
        }(),
        computeBoundingSphere: function () {
            var vector = new THREE.Vector3();
            return function computeBoundingSphere() {
                if (this.boundingSphere === null) {
                    this.boundingSphere = new THREE.Sphere();
                }
                if (this.boundingBox === null) {
                    this.computeBoundingBox();
                }
                var start = this.attributes.instanceStart;
                var end = this.attributes.instanceEnd;
                if (start !== undefined && end !== undefined) {
                    var center = this.boundingSphere.center;
                    this.boundingBox.getCenter(center);
                    var maxRadiusSq = 0;
                    for (var i = 0, il = start.count; i < il; i++) {
                        vector.fromBufferAttribute(start, i);
                        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
                        vector.fromBufferAttribute(end, i);
                        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
                    }
                    this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
                    if (isNaN(this.boundingSphere.radius)) {
                        console.error('THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this);
                    }
                }
            };
        }(),
        toJSON: function () {
        },
        applyMatrix: function (matrix) {
            console.warn('THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().');
            return this.applyMatrix4(matrix);
        }
    });

    return threex.lines.LineSegmentsGeometry = LineSegmentsGeometry;
});