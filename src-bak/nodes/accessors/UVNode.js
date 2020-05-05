define([
    '../core/TempNode.js',
    '../core/NodeLib.js'
], function (a, b) {
    'use strict';
    function UVNode(index) {
        a.TempNode.call(this, 'v2', { shared: false });
        this.index = index || 0;
    }
    UVNode.prototype = Object.create(a.TempNode.prototype);
    UVNode.prototype.constructor = UVNode;
    UVNode.prototype.nodeType = 'UV';
    UVNode.prototype.generate = function (builder, output) {
        builder.requires.uv[this.index] = true;
        var uvIndex = this.index > 0 ? this.index + 1 : '';
        var result = builder.isShader('vertex') ? 'uv' + uvIndex : 'vUv' + uvIndex;
        return builder.format(result, this.getType(builder), output);
    };
    UVNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.index = source.index;
        return this;
    };
    UVNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.index = this.index;
        }
        return data;
    };
    b.NodeLib.addKeyword('uv', function () {
        return new UVNode();
    });
    b.NodeLib.addKeyword('uv2', function () {
        return new UVNode(1);
    });
    return UVNode;
});