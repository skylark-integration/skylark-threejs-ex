define([
    '../core/TempNode.js',
    '../core/NodeLib.js'
], function (a, b) {
    'use strict';
    function NormalNode(scope) {
        a.TempNode.call(this, 'v3');
        this.scope = scope || NormalNode.VIEW;
    }
    NormalNode.LOCAL = 'local';
    NormalNode.WORLD = 'world';
    NormalNode.VIEW = 'view';
    NormalNode.prototype = Object.create(a.TempNode.prototype);
    NormalNode.prototype.constructor = NormalNode;
    NormalNode.prototype.nodeType = 'Normal';
    NormalNode.prototype.getShared = function () {
        return this.scope === NormalNode.WORLD;
    };
    NormalNode.prototype.build = function (builder, output, uuid, ns) {
        var contextNormal = builder.context[this.scope + 'Normal'];
        if (contextNormal) {
            return contextNormal.build(builder, output, uuid, ns);
        }
        return a.TempNode.prototype.build.call(this, builder, output, uuid);
    };
    NormalNode.prototype.generate = function (builder, output) {
        var result;
        switch (this.scope) {
        case NormalNode.VIEW:
            if (builder.isShader('vertex'))
                result = 'transformedNormal';
            else
                result = 'geometryNormal';
            break;
        case NormalNode.LOCAL:
            if (builder.isShader('vertex')) {
                result = 'objectNormal';
            } else {
                builder.requires.normal = true;
                result = 'vObjectNormal';
            }
            break;
        case NormalNode.WORLD:
            if (builder.isShader('vertex')) {
                result = 'inverseTransformDirection( transformedNormal, viewMatrix ).xyz';
            } else {
                builder.requires.worldNormal = true;
                result = 'vWNormal';
            }
            break;
        }
        return builder.format(result, this.getType(builder), output);
    };
    NormalNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.scope = source.scope;
        return this;
    };
    NormalNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.scope = this.scope;
        }
        return data;
    };
    b.NodeLib.addKeyword('viewNormal', function () {
        return new NormalNode(NormalNode.VIEW);
    });
    b.NodeLib.addKeyword('localNormal', function () {
        return new NormalNode(NormalNode.NORMAL);
    });
    b.NodeLib.addKeyword('worldNormal', function () {
        return new NormalNode(NormalNode.WORLD);
    });
    return NormalNode;
});