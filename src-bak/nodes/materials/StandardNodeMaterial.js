define([
    './nodes/StandardNode.js',
    './NodeMaterial.js',
    '../core/NodeUtils.js'
], function (a, b, c) {
    'use strict';
    function StandardNodeMaterial() {
        var node = new a.StandardNode();
        b.NodeMaterial.call(this, node, node);
        this.type = 'StandardNodeMaterial';
    }
    StandardNodeMaterial.prototype = Object.create(b.NodeMaterial.prototype);
    StandardNodeMaterial.prototype.constructor = StandardNodeMaterial;
    c.NodeUtils.addShortcuts(StandardNodeMaterial.prototype, 'fragment', [
        'color',
        'alpha',
        'roughness',
        'metalness',
        'reflectivity',
        'clearcoat',
        'clearcoatRoughness',
        'clearcoatNormal',
        'normal',
        'emissive',
        'ambient',
        'light',
        'shadow',
        'ao',
        'environment',
        'mask',
        'position',
        'sheen'
    ]);
    return StandardNodeMaterial;
});