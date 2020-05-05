define([
    "skylark-threejs",
    '../core/InputNode.js',
    '../core/NodeUtils.js'
], function (a, b, c) {
    'use strict';
    function ColorNode(color, g, b) {
        b.InputNode.call(this, 'c');
        this.value = color instanceof a.Color ? color : new a.Color(color || 0, g, b);
    }
    ColorNode.prototype = Object.create(b.InputNode.prototype);
    ColorNode.prototype.constructor = ColorNode;
    ColorNode.prototype.nodeType = 'Color';
    c.NodeUtils.addShortcuts(ColorNode.prototype, 'value', [
        'r',
        'g',
        'b'
    ]);
    ColorNode.prototype.generateReadonly = function (builder, output, uuid, type) {
        return builder.format('vec3( ' + this.r + ', ' + this.g + ', ' + this.b + ' )', type, output);
    };
    ColorNode.prototype.copy = function (source) {
        b.InputNode.prototype.copy.call(this, source);
        this.value.copy(source);
        return this;
    };
    ColorNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.r = this.r;
            data.g = this.g;
            data.b = this.b;
            if (this.readonly === true)
                data.readonly = true;
        }
        return data;
    };
    return ColorNode;
});