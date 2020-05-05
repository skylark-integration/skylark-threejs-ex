define([
    '../../../../../build/three.module.js',
    './StandardNode.js',
    '../../inputs/PropertyNode.js',
    '../../math/OperatorNode.js',
    '../../utils/SwitchNode.js',
    '../../misc/NormalMapNode.js'
], function (a, b, c, d, e, f) {
    'use strict';
    function MeshStandardNode() {
        b.StandardNode.call(this);
        this.properties = {
            color: new a.Color(16777215),
            roughness: 0.5,
            metalness: 0.5,
            normalScale: new a.Vector2(1, 1)
        };
        this.inputs = {
            color: new c.PropertyNode(this.properties, 'color', 'c'),
            roughness: new c.PropertyNode(this.properties, 'roughness', 'f'),
            metalness: new c.PropertyNode(this.properties, 'metalness', 'f'),
            normalScale: new c.PropertyNode(this.properties, 'normalScale', 'v2')
        };
    }
    MeshStandardNode.prototype = Object.create(b.StandardNode.prototype);
    MeshStandardNode.prototype.constructor = MeshStandardNode;
    MeshStandardNode.prototype.nodeType = 'MeshStandard';
    MeshStandardNode.prototype.build = function (builder) {
        var props = this.properties, inputs = this.inputs;
        if (builder.isShader('fragment')) {
            var color = builder.findNode(props.color, inputs.color), map = builder.resolve(props.map);
            this.color = map ? new d.OperatorNode(color, map, d.OperatorNode.MUL) : color;
            var roughness = builder.findNode(props.roughness, inputs.roughness), roughnessMap = builder.resolve(props.roughnessMap);
            this.roughness = roughnessMap ? new d.OperatorNode(roughness, new e.SwitchNode(roughnessMap, 'g'), d.OperatorNode.MUL) : roughness;
            var metalness = builder.findNode(props.metalness, inputs.metalness), metalnessMap = builder.resolve(props.metalnessMap);
            this.metalness = metalnessMap ? new d.OperatorNode(metalness, new e.SwitchNode(metalnessMap, 'b'), d.OperatorNode.MUL) : metalness;
            if (props.normalMap) {
                this.normal = new f.NormalMapNode(builder.resolve(props.normalMap));
                this.normal.scale = builder.findNode(props.normalScale, inputs.normalScale);
            } else {
                this.normal = undefined;
            }
            this.environment = builder.resolve(props.envMap);
        }
        return b.StandardNode.prototype.build.call(this, builder);
    };
    MeshStandardNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            console.warn('.toJSON not implemented in', this);
        }
        return data;
    };
    return MeshStandardNode;
});