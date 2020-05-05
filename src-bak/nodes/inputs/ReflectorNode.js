define([
    '../core/TempNode.js',
    '../core/InputNode.js',
    '../accessors/PositionNode.js',
    '../math/OperatorNode.js',
    './TextureNode.js',
    './Matrix4Node.js'
], function (a, b, c, d, e, f) {
    'use strict';
    function ReflectorNode(mirror) {
        a.TempNode.call(this, 'v4');
        if (mirror)
            this.setMirror(mirror);
    }
    ReflectorNode.prototype = Object.create(a.TempNode.prototype);
    ReflectorNode.prototype.constructor = ReflectorNode;
    ReflectorNode.prototype.nodeType = 'Reflector';
    ReflectorNode.prototype.setMirror = function (mirror) {
        this.mirror = mirror;
        this.textureMatrix = new f.Matrix4Node(this.mirror.material.uniforms.textureMatrix.value);
        this.localPosition = new c.PositionNode(c.PositionNode.LOCAL);
        this.uv = new d.OperatorNode(this.textureMatrix, this.localPosition, d.OperatorNode.MUL);
        this.uvResult = new d.OperatorNode(null, this.uv, d.OperatorNode.ADD);
        this.texture = new e.TextureNode(this.mirror.material.uniforms.tDiffuse.value, this.uv, null, true);
    };
    ReflectorNode.prototype.generate = function (builder, output) {
        if (builder.isShader('fragment')) {
            this.uvResult.a = this.offset;
            this.texture.uv = this.offset ? this.uvResult : this.uv;
            if (output === 'sampler2D') {
                return this.texture.build(builder, output);
            }
            return builder.format(this.texture.build(builder, this.type), this.type, output);
        } else {
            console.warn('THREE.ReflectorNode is not compatible with ' + builder.shader + ' shader.');
            return builder.format('vec4( 0.0 )', this.type, output);
        }
    };
    ReflectorNode.prototype.copy = function (source) {
        b.InputNode.prototype.copy.call(this, source);
        this.scope.mirror = source.mirror;
        return this;
    };
    ReflectorNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.mirror = this.mirror.uuid;
            if (this.offset)
                data.offset = this.offset.toJSON(meta).uuid;
        }
        return data;
    };
    return ReflectorNode;
});