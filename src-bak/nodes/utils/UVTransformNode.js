define([
    '../core/ExpressionNode.js',
    '../inputs/Matrix3Node.js',
    '../accessors/UVNode.js'
], function (a, b, c) {
    'use strict';
    function UVTransformNode(uv, position) {
        a.ExpressionNode.call(this, '( uvTransform * vec3( uvNode, 1 ) ).xy', 'vec2');
        this.uv = uv || new c.UVNode();
        this.position = position || new b.Matrix3Node();
    }
    UVTransformNode.prototype = Object.create(a.ExpressionNode.prototype);
    UVTransformNode.prototype.constructor = UVTransformNode;
    UVTransformNode.prototype.nodeType = 'UVTransform';
    UVTransformNode.prototype.generate = function (builder, output) {
        this.keywords['uvNode'] = this.uv;
        this.keywords['uvTransform'] = this.position;
        return a.ExpressionNode.prototype.generate.call(this, builder, output);
    };
    UVTransformNode.prototype.setUvTransform = function (tx, ty, sx, sy, rotation, cx, cy) {
        cx = cx !== undefined ? cx : 0.5;
        cy = cy !== undefined ? cy : 0.5;
        this.position.value.setUvTransform(tx, ty, sx, sy, rotation, cx, cy);
    };
    UVTransformNode.prototype.copy = function (source) {
        a.ExpressionNode.prototype.copy.call(this, source);
        this.uv = source.uv;
        this.position = source.position;
        return this;
    };
    UVTransformNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.uv = this.uv.toJSON(meta).uuid;
            data.position = this.position.toJSON(meta).uuid;
        }
        return data;
    };
    return UVTransformNode;
});