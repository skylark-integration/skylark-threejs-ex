define([
    '../core/TempNode.js',
    '../core/FunctionNode.js',
    '../accessors/UVNode.js'
], function (a, b, c) {
    'use strict';
    function CheckerNode(uv) {
        a.TempNode.call(this, 'f');
        this.uv = uv || new c.UVNode();
    }
    CheckerNode.prototype = Object.create(a.TempNode.prototype);
    CheckerNode.prototype.constructor = CheckerNode;
    CheckerNode.prototype.nodeType = 'Noise';
    CheckerNode.Nodes = function () {
        var checker = new b.FunctionNode([
            'float checker( vec2 uv ) {',
            '\tfloat cx = floor( uv.x );',
            '\tfloat cy = floor( uv.y ); ',
            '\tfloat result = mod( cx + cy, 2.0 );',
            '\treturn sign( result );',
            '}'
        ].join('\n'));
        return { checker: checker };
    }();
    CheckerNode.prototype.generate = function (builder, output) {
        var snoise = builder.include(CheckerNode.Nodes.checker);
        return builder.format(snoise + '( ' + this.uv.build(builder, 'v2') + ' )', this.getType(builder), output);
    };
    CheckerNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.uv = source.uv;
        return this;
    };
    CheckerNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.uv = this.uv.toJSON(meta).uuid;
        }
        return data;
    };
    return CheckerNode;
});