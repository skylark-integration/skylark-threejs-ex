define([
    '../core/TempNode.js',
    '../core/ConstNode.js',
    '../core/FunctionNode.js'
], function (a, b, c) {
    'use strict';
    function LuminanceNode(rgb) {
        a.TempNode.call(this, 'f');
        this.rgb = rgb;
    }
    LuminanceNode.Nodes = function () {
        var LUMA = new b.ConstNode('vec3 LUMA vec3( 0.2125, 0.7154, 0.0721 )');
        var luminance = new c.FunctionNode([
            'float luminance( vec3 rgb ) {',
            '\treturn dot( rgb, LUMA );',
            '}'
        ].join('\n'), [LUMA]);
        return {
            LUMA: LUMA,
            luminance: luminance
        };
    }();
    LuminanceNode.prototype = Object.create(a.TempNode.prototype);
    LuminanceNode.prototype.constructor = LuminanceNode;
    LuminanceNode.prototype.nodeType = 'Luminance';
    LuminanceNode.prototype.generate = function (builder, output) {
        var luminance = builder.include(LuminanceNode.Nodes.luminance);
        return builder.format(luminance + '( ' + this.rgb.build(builder, 'v3') + ' )', this.getType(builder), output);
    };
    LuminanceNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.rgb = source.rgb;
        return this;
    };
    LuminanceNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.rgb = this.rgb.toJSON(meta).uuid;
        }
        return data;
    };
    return LuminanceNode;
});