define([
    '../core/TempNode',
    '../inputs/FloatNode',
    './TextureCubeUVNode',
    '../accessors/ReflectNode',
    '../accessors/NormalNode'
], function (
    TempNode, 
    FloatNode, 
    TextureCubeNode, 
    ReflectNode, 
    NormalNode
) {
    'use strict';
    function TextureCubeNode(value, uv, bias) {
        TempNode.call(this, 'v4');
        this.value = value;
        this.radianceNode = new TextureCubeUVNode(this.value, uv || new ReflectNode(ReflectNode.VECTOR), bias);
        this.irradianceNode = new TextureCubeUVNode(this.value, new NormalNode(NormalNode.WORLD), new FloatNode(1).setReadonly(true));
    }
    TextureCubeNode.prototype = Object.create(TempNode.prototype);
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
        TempNode.prototype.copy.call(this, source);
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