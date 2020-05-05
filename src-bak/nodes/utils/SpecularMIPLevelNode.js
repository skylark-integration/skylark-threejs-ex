define([
    '../core/TempNode.js',
    '../core/FunctionNode.js',
    './MaxMIPLevelNode.js'
], function (a, b, c) {
    'use strict';
    function SpecularMIPLevelNode(roughness, texture) {
        a.TempNode.call(this, 'f');
        this.roughness = roughness;
        this.texture = texture;
        this.maxMIPLevel = undefined;
    }
    SpecularMIPLevelNode.Nodes = function () {
        var getSpecularMIPLevel = new b.FunctionNode([
            'float getSpecularMIPLevel( const in float roughness, const in float maxMIPLevelScalar ) {',
            '\tfloat sigma = PI * roughness * roughness / ( 1.0 + roughness );',
            '\tfloat desiredMIPLevel = maxMIPLevelScalar + log2( sigma );',
            '\treturn clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );',
            '}'
        ].join('\n'));
        return { getSpecularMIPLevel: getSpecularMIPLevel };
    }();
    SpecularMIPLevelNode.prototype = Object.create(a.TempNode.prototype);
    SpecularMIPLevelNode.prototype.constructor = SpecularMIPLevelNode;
    SpecularMIPLevelNode.prototype.nodeType = 'SpecularMIPLevel';
    SpecularMIPLevelNode.prototype.setTexture = function (texture) {
        this.texture = texture;
        return this;
    };
    SpecularMIPLevelNode.prototype.generate = function (builder, output) {
        if (builder.isShader('fragment')) {
            this.maxMIPLevel = this.maxMIPLevel || new c.MaxMIPLevelNode();
            this.maxMIPLevel.texture = this.texture;
            var getSpecularMIPLevel = builder.include(SpecularMIPLevelNode.Nodes.getSpecularMIPLevel);
            return builder.format(getSpecularMIPLevel + '( ' + this.roughness.build(builder, 'f') + ', ' + this.maxMIPLevel.build(builder, 'f') + ' )', this.type, output);
        } else {
            console.warn('THREE.SpecularMIPLevelNode is not compatible with ' + builder.shader + ' shader.');
            return builder.format('0.0', this.type, output);
        }
    };
    SpecularMIPLevelNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.texture = source.texture;
        this.roughness = source.roughness;
        return this;
    };
    SpecularMIPLevelNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.texture = this.texture;
            data.roughness = this.roughness;
        }
        return data;
    };
    return SpecularMIPLevelNode;
});