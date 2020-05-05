define([
    'skylark-threejs',
    './StandardNode',
    '../../inputs/PropertyNode',
    '../../math/OperatorNode',
    '../../utils/SwitchNode',
    '../../misc/NormalMapNode'
], function (
    THREE, 
    StandardNode, 
    PropertyNode, 
    OperatorNode, 
    SwitchNode, 
    NormalMapNode
) {
    'use strict';
    function MeshStandardNode() {
        StandardNode.call(this);
        this.properties = {
            color: new THREE.Color(16777215),
            roughness: 0.5,
            metalness: 0.5,
            normalScale: new THREE.Vector2(1, 1)
        };
        this.inputs = {
            color: new PropertyNode(this.properties, 'color', 'c'),
            roughness: new PropertyNode(this.properties, 'roughness', 'f'),
            metalness: new PropertyNode(this.properties, 'metalness', 'f'),
            normalScale: new PropertyNode(this.properties, 'normalScale', 'v2')
        };
    }
    MeshStandardNode.prototype = Object.create(StandardNode.prototype);
    MeshStandardNode.prototype.constructor = MeshStandardNode;
    MeshStandardNode.prototype.nodeType = 'MeshStandard';
    MeshStandardNode.prototype.build = function (builder) {
        var props = this.properties, inputs = this.inputs;
        if (builder.isShader('fragment')) {
            var color = builder.findNode(props.color, inputs.color), map = builder.resolve(props.map);
            this.color = map ? new OperatorNode(color, map, OperatorNode.MUL) : color;
            var roughness = builder.findNode(props.roughness, inputs.roughness), roughnessMap = builder.resolve(props.roughnessMap);
            this.roughness = roughnessMap ? new OperatorNode(roughness, new SwitchNode(roughnessMap, 'g'), OperatorNode.MUL) : roughness;
            var metalness = builder.findNode(props.metalness, inputs.metalness), metalnessMap = builder.resolve(props.metalnessMap);
            this.metalness = metalnessMap ? new OperatorNode(metalness, new SwitchNode(metalnessMap, 'b'), OperatorNode.MUL) : metalness;
            if (props.normalMap) {
                this.normal = new NormalMapNode(builder.resolve(props.normalMap));
                this.normal.scale = builder.findNode(props.normalScale, inputs.normalScale);
            } else {
                this.normal = undefined;
            }
            this.environment = builder.resolve(props.envMap);
        }
        return StandardNode.prototype.build.call(this, builder);
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