define([
    "skylark-threejs",
    '../core/InputNode.js'
], function (a, b) {
    'use strict';
    function Matrix3Node(matrix) {
        b.InputNode.call(this, 'm3');
        this.value = matrix || new a.Matrix3();
    }
    Matrix3Node.prototype = Object.create(b.InputNode.prototype);
    Matrix3Node.prototype.constructor = Matrix3Node;
    Matrix3Node.prototype.nodeType = 'Matrix3';
    Object.defineProperties(Matrix3Node.prototype, {
        elements: {
            set: function (val) {
                this.value.elements = val;
            },
            get: function () {
                return this.value.elements;
            }
        }
    });
    Matrix3Node.prototype.generateReadonly = function (builder, output, uuid, type) {
        return builder.format('mat3( ' + this.value.elements.join(', ') + ' )', type, output);
    };
    Matrix3Node.prototype.copy = function (source) {
        b.InputNode.prototype.copy.call(this, source);
        this.value.fromArray(source.elements);
        return this;
    };
    Matrix3Node.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.elements = this.value.elements.concat();
        }
        return data;
    };
    return Matrix3Node;
});