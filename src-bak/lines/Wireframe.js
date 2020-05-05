define([
    "skylark-threejs",
    '../lines/LineSegmentsGeometry.js',
    '../lines/LineMaterial.js'
], function (a, b, c) {
    'use strict';
    var Wireframe = function (geometry, material) {
        a.Mesh.call(this);
        this.type = 'Wireframe';
        this.geometry = geometry !== undefined ? geometry : new b.LineSegmentsGeometry();
        this.material = material !== undefined ? material : new c.LineMaterial({ color: Math.random() * 16777215 });
    };
    Wireframe.prototype = Object.assign(Object.create(a.Mesh.prototype), {
        constructor: Wireframe,
        isWireframe: true,
        computeLineDistances: function () {
            var start = new a.Vector3();
            var end = new a.Vector3();
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
                var instanceDistanceBuffer = new a.InstancedInterleavedBuffer(lineDistances, 2, 1);
                geometry.setAttribute('instanceDistanceStart', new a.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0));
                geometry.setAttribute('instanceDistanceEnd', new a.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1));
                return this;
            };
        }()
    });
    return Wireframe ;
});