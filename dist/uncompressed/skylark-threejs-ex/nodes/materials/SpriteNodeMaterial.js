define([
    './nodes/SpriteNode',
    './NodeMaterial',
    '../core/NodeUtils'
], function (
    SpriteNode, 
    NodeMaterial, 
    NodeUtils
) {
    'use strict';
    function SpriteNodeMaterial() {
        var node = new SpriteNode();
        NodeMaterial.call(this, node, node);
        this.type = 'SpriteNodeMaterial';
    }
    SpriteNodeMaterial.prototype = Object.create(NodeMaterial.prototype);
    SpriteNodeMaterial.prototype.constructor = SpriteNodeMaterial;
    NodeUtils.addShortcuts(SpriteNodeMaterial.prototype, 'fragment', [
        'color',
        'alpha',
        'mask',
        'position',
        'spherical'
    ]);
    return SpriteNodeMaterial;
});