define([
    './nodes/PhongNode',
    './NodeMaterial',
    '../core/NodeUtils'
], function (
    PhongNode, 
    NodeMaterial, 
    NodeUtils
) {
    'use strict';
    function PhongNodeMaterial() {
        var node = new PhongNode();
        NodeMaterial.call(this, node, node);
        this.type = 'PhongNodeMaterial';
    }
    PhongNodeMaterial.prototype = Object.create(NodeMaterial.prototype);
    PhongNodeMaterial.prototype.constructor = PhongNodeMaterial;
    NodeUtils.addShortcuts(PhongNodeMaterial.prototype, 'fragment', [
        'color',
        'alpha',
        'specular',
        'shininess',
        'normal',
        'emissive',
        'ambient',
        'light',
        'shadow',
        'ao',
        'environment',
        'environmentAlpha',
        'mask',
        'position'
    ]);
    return PhongNodeMaterial;
});