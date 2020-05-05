define([
    '../core/InputNode.js',
    './TextureNode.js'
], function (a, b) {
    'use strict';
    function ScreenNode(uv) {
        b.TextureNode.call(this, undefined, uv);
    }
    ScreenNode.prototype = Object.create(b.TextureNode.prototype);
    ScreenNode.prototype.constructor = ScreenNode;
    ScreenNode.prototype.nodeType = 'Screen';
    ScreenNode.prototype.getUnique = function () {
        return true;
    };
    ScreenNode.prototype.getTexture = function (builder, output) {
        return a.InputNode.prototype.generate.call(this, builder, output, this.getUuid(), 't', 'renderTexture');
    };
    return ScreenNode;
});