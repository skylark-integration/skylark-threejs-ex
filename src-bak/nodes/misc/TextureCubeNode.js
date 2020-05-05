define([
    '../core/TempNode.js',
    '../inputs/FloatNode.js',
    './TextureCubeUVNode.js',
    '../accessors/ReflectNode.js',
    '../accessors/NormalNode.js'
], function (a, b, c, d, e) {
    'use strict';
    function TextureCubeNode(value, uv, bias) {
        a.TempNode.call(this, 'v4');
        this.value = value;
        this.radianceNode = new c.TextureCubeUVNode(this.value, uv || new d.ReflectNode(d.ReflectNode.VECTOR), bias);
        this.irradianceNode = new c.TextureCubeUVNode(this.value, new e.NormalNode(e.NormalNode.WORLD), new b.FloatNode(1).setReadonly(true));
    }
    TextureCubeNode.prototype = Object.create(a.TempNode.prototype);
    TextureCubeNode.prototype.constructor = TextureCubeNode;
    TextureCubeNode.prototype.nodeType = 'TextureCube';
    TextureCubeNode.prototype.generate = function (builder, output) {
        if (builder.isShader('fragment')) {
            builder.require('irradiance');
            if (builder.context.bias) {
                builder.context.bias.setTexture(this.value);
            }
            var scopeNode = builder.slot === 'irradiance' ? this.irradianceNode : this.radianceNode;
            return scopeNode.build(builder, output);
        } else {
            console.warn('THREE.TextureCubeNode is not compatible with ' + builder.shader + ' shader.');
            return builder.format('vec4( 0.0 )', this.getType(builder), output);
        }
    };
    TextureCubeNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.value = source.value;
        return this;
    };
    TextureCubeNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.value = this.value.toJSON(meta).uuid;
        }
        return data;
    };
    return TextureCubeNode;
});