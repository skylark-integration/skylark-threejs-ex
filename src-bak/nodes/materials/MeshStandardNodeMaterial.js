define([
    './nodes/MeshStandardNode.js',
    './NodeMaterial.js',
    '../core/NodeUtils.js'
], function (a, b, c) {
    'use strict';
    function MeshStandardNodeMaterial() {
        var node = new a.MeshStandardNode();
        b.NodeMaterial.call(this, node, node);
        this.type = 'MeshStandardNodeMaterial';
    }
    MeshStandardNodeMaterial.prototype = Object.create(b.NodeMaterial.prototype);
    MeshStandardNodeMaterial.prototype.constructor = MeshStandardNodeMaterial;
    c.NodeUtils.addShortcuts(MeshStandardNodeMaterial.prototype, 'properties', [
        'color',
        'roughness',
        'metalness',
        'map',
        'normalMap',
        'normalScale',
        'metalnessMap',
        'roughnessMap',
        'envMap'
    ]);
    return MeshStandardNodeMaterial;
});