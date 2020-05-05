define([
    "skylark-threejs",
    '../core/InputNode.js'
], function (a, b) {
    'use strict';
    function Matrix4Node(matrix) {
        b.InputNode.call(this, 'm4');
        this.value = matrix || new a.Matrix4();
    }
    Matrix4Node.prototype = Object.create(b.InputNode.prototype);
    Matrix4Node.prototype.constructor = Matrix4Node;
    Matrix4Node.prototype.nodeType = 'Matrix4';
    Object.defineProperties(Matrix4Node.prototype, {
        elements: {
            set: function (val) {
                this.value.elements = val;
            },
            get: function () {
                return this.value.elements;
            }
        }
    });
    Matrix4Node.prototype.generateReadonly = function (builder, output, uuid, type) {
        return builder.format('mat4( ' + this.value.elements.join(', ') + ' )', type, output);
    };
    Matrix4Node.prototype.copy = function (source) {
        b.InputNode.prototype.copy.call(this, source);
        this.scope.value.fromArray(source.elements);
        return this;
    };
    Matrix4Node.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.elements = this.value.elements.concat();
        }
        return data;
    };
    return Matrix4Node;
});