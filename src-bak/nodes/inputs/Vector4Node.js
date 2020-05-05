define([
    "skylark-threejs",
    '../core/InputNode.js',
    '../core/NodeUtils.js'
], function (a, b, c) {
    'use strict';
    function Vector4Node(x, y, z, w) {
        b.InputNode.call(this, 'v4');
        this.value = x instanceof a.Vector4 ? x : new a.Vector4(x, y, z, w);
    }
    Vector4Node.prototype = Object.create(b.InputNode.prototype);
    Vector4Node.prototype.constructor = Vector4Node;
    Vector4Node.prototype.nodeType = 'Vector4';
    c.NodeUtils.addShortcuts(Vector4Node.prototype, 'value', [
        'x',
        'y',
        'z',
        'w'
    ]);
    Vector4Node.prototype.generateReadonly = function (builder, output, uuid, type) {
        return builder.format('vec4( ' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ' )', type, output);
    };
    Vector4Node.prototype.copy = function (source) {
        b.InputNode.prototype.copy.call(this, source);
        this.value.copy(source);
        return this;
    };
    Vector4Node.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.x = this.x;
            data.y = this.y;
            data.z = this.z;
            data.w = this.w;
            if (this.readonly === true)
                data.readonly = true;
        }
        return data;
    };
    return Vector4Node;
});