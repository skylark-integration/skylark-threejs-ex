define([
    '../core/TempNode.js',
    '../core/NodeLib.js'
], function (a, b) {
    'use strict';
    function PositionNode(scope) {
        a.TempNode.call(this, 'v3');
        this.scope = scope || PositionNode.LOCAL;
    }
    PositionNode.LOCAL = 'local';
    PositionNode.WORLD = 'world';
    PositionNode.VIEW = 'view';
    PositionNode.PROJECTION = 'projection';
    PositionNode.prototype = Object.create(a.TempNode.prototype);
    PositionNode.prototype.constructor = PositionNode;
    PositionNode.prototype.nodeType = 'Position';
    PositionNode.prototype.getType = function () {
        switch (this.scope) {
        case PositionNode.PROJECTION:
            return 'v4';
        }
        return this.type;
    };
    PositionNode.prototype.getShared = function () {
        switch (this.scope) {
        case PositionNode.LOCAL:
        case PositionNode.WORLD:
            return false;
        }
        return true;
    };
    PositionNode.prototype.generate = function (builder, output) {
        var result;
        switch (this.scope) {
        case PositionNode.LOCAL:
            if (builder.isShader('vertex')) {
                result = 'transformed';
            } else {
                builder.requires.position = true;
                result = 'vPosition';
            }
            break;
        case PositionNode.WORLD:
            if (builder.isShader('vertex')) {
                return '( modelMatrix * vec4( transformed, 1.0 ) ).xyz';
            } else {
                builder.requires.worldPosition = true;
                result = 'vWPosition';
            }
            break;
        case PositionNode.VIEW:
            result = builder.isShader('vertex') ? '-mvPosition.xyz' : 'vViewPosition';
            break;
        case PositionNode.PROJECTION:
            result = builder.isShader('vertex') ? '( projectionMatrix * modelViewMatrix * vec4( position, 1.0 ) )' : 'vec4( 0.0 )';
            break;
        }
        return builder.format(result, this.getType(builder), output);
    };
    PositionNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.scope = source.scope;
        return this;
    };
    PositionNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.scope = this.scope;
        }
        return data;
    };
    b.NodeLib.addKeyword('position', function () {
        return new PositionNode();
    });
    b.NodeLib.addKeyword('worldPosition', function () {
        return new PositionNode(PositionNode.WORLD);
    });
    b.NodeLib.addKeyword('viewPosition', function () {
        return new PositionNode(PositionNode.VIEW);
    });
    return PositionNode;
});