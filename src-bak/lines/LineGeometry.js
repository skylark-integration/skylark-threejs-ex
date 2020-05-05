define(['../lines/LineSegmentsGeometry.js'], function (a) {
    'use strict';
    var LineGeometry = function () {
        a.LineSegmentsGeometry.call(this);
        this.type = 'LineGeometry';
    };
    LineGeometry.prototype = Object.assign(Object.create(a.LineSegmentsGeometry.prototype), {
        constructor: LineGeometry,
        isLineGeometry: true,
        setPositions: function (array) {
            var length = array.length - 3;
            var points = new Float32Array(2 * length);
            for (var i = 0; i < length; i += 3) {
                points[2 * i] = array[i];
                points[2 * i + 1] = array[i + 1];
                points[2 * i + 2] = array[i + 2];
                points[2 * i + 3] = array[i + 3];
                points[2 * i + 4] = array[i + 4];
                points[2 * i + 5] = array[i + 5];
            }
            a.LineSegmentsGeometry.prototype.setPositions.call(this, points);
            return this;
        },
        setColors: function (array) {
            var length = array.length - 3;
            var colors = new Float32Array(2 * length);
            for (var i = 0; i < length; i += 3) {
                colors[2 * i] = array[i];
                colors[2 * i + 1] = array[i + 1];
                colors[2 * i + 2] = array[i + 2];
                colors[2 * i + 3] = array[i + 3];
                colors[2 * i + 4] = array[i + 4];
                colors[2 * i + 5] = array[i + 5];
            }
            a.LineSegmentsGeometry.prototype.setColors.call(this, colors);
            return this;
        },
        fromLine: function (line) {
            var geometry = line.geometry;
            if (geometry.isGeometry) {
                this.setPositions(geometry.vertices);
            } else if (geometry.isBufferGeometry) {
                this.setPositions(geometry.position.array);
            }
            return this;
        },
        copy: function () {
            return this;
        }
    });
    return LineGeometry;
});