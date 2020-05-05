define([
    './nodes/PhongNode.js',
    './NodeMaterial.js',
    '../core/NodeUtils.js'
], function (a, b, c) {
    'use strict';
    function PhongNodeMaterial() {
        var node = new a.PhongNode();
        b.NodeMaterial.call(this, node, node);
        this.type = 'PhongNodeMaterial';
    }
    PhongNodeMaterial.prototype = Object.create(b.NodeMaterial.prototype);
    PhongNodeMaterial.prototype.constructor = PhongNodeMaterial;
    c.NodeUtils.addShortcuts(PhongNodeMaterial.prototype, 'fragment', [
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