define([
    './nodes/MeshStandardNode',
    './NodeMaterial',
    '../core/NodeUtils'
], function (
    MeshStandardNode, 
    NodeMaterial, 
    NodeUtils
) {
    'use strict';
    function MeshStandardNodeMaterial() {
        var node = new MeshStandardNode();
        NodeMaterial.call(this, node, node);
        this.type = 'MeshStandardNodeMaterial';
    }
    MeshStandardNodeMaterial.prototype = Object.create(NodeMaterial.prototype);
    MeshStandardNodeMaterial.prototype.constructor = MeshStandardNodeMaterial;
    NodeUtils.addShortcuts(MeshStandardNodeMaterial.prototype, 'properties', [
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