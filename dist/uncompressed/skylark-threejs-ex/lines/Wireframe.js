define([
    "skylark-threejs",
    "../threex",
    './LineSegmentsGeometry',
    './LineMaterial'
], function (
    THREE, 
    threex,
    LineSegmentsGeometry, 
    LineMaterial
) {
    'use strict';
    var Wireframe = function (geometry, material) {
        THREE.Mesh.call(this);
        this.type = 'Wireframe';
        this.geometry = geometry !== undefined ? geometry : new LineSegmentsGeometry();
        this.material = material !== undefined ? material : new LineMaterial({ color: Math.random() * 16777215 });
    };
    Wireframe.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
        constructor: Wireframe,
        isWireframe: true,
        computeLineDistances: function () {
            var start = new THREE.Vector3();
            var end = new THREE.Vector3();
            return function computeLineDistances() {
                var geometry = this.geometry;
                var instanceStart = geometry.attributes.instanceStart;
                var instanceEnd = geometry.attributes.instanceEnd;
                var lineDistances = new Float32Array(2 * instanceStart.data.count);
                for (var i = 0, j = 0, l = instanceStart.data.count; i < l; i++, j += 2) {
                    start.fromBufferAttribute(instanceStart, i);
                    end.fromBufferAttribute(instanceEnd, i);
                    lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
                    lineDistances[j + 1] = lineDistances[j] + start.distanceTo(end);
                }
                var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1);
                geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0));
                geometry.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1));
                return this;
            };
        }()
    });
    return threex.lines.Wireframe = Wireframe;
});