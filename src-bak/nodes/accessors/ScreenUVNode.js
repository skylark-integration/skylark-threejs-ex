define([
    '../core/TempNode.js',
    './ResolutionNode.js'
], function (a, b) {
    'use strict';
    function ScreenUVNode(resolution) {
        a.TempNode.call(this, 'v2');
        this.resolution = resolution || new b.ResolutionNode();
    }
    ScreenUVNode.prototype = Object.create(a.TempNode.prototype);
    ScreenUVNode.prototype.constructor = ScreenUVNode;
    ScreenUVNode.prototype.nodeType = 'ScreenUV';
    ScreenUVNode.prototype.generate = function (builder, output) {
        var result;
        if (builder.isShader('fragment')) {
            result = '( gl_FragCoord.xy / ' + this.resolution.build(builder, 'v2') + ')';
        } else {
            console.warn('THREE.ScreenUVNode is not compatible with ' + builder.shader + ' shader.');
            result = 'vec2( 0.0 )';
        }
        return builder.format(result, this.getType(builder), output);
    };
    ScreenUVNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.resolution = source.resolution;
        return this;
    };
    ScreenUVNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.resolution = this.resolution.toJSON(meta).uuid;
        }
        return data;
    };
    return ScreenUVNode;
});