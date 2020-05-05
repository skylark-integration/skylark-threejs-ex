define([
    './nodes/SpriteNode.js',
    './NodeMaterial.js',
    '../core/NodeUtils.js'
], function (a, b, c) {
    'use strict';
    function SpriteNodeMaterial() {
        var node = new a.SpriteNode();
        b.NodeMaterial.call(this, node, node);
        this.type = 'SpriteNodeMaterial';
    }
    SpriteNodeMaterial.prototype = Object.create(b.NodeMaterial.prototype);
    SpriteNodeMaterial.prototype.constructor = SpriteNodeMaterial;
    c.NodeUtils.addShortcuts(SpriteNodeMaterial.prototype, 'fragment', [
        'color',
        'alpha',
        'mask',
        'position',
        'spherical'
    ]);
    return SpriteNodeMaterial;
});