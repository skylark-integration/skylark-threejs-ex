define([
    "skylark-threejs",
    '../core/InputNode',
    '../core/NodeUtils'
], function (
    THREE, 
    InputNode, 
    NodeUtils
) {
    'use strict';
    function Vector3Node(x, y, z) {
        InputNode.call(this, 'v3');
        this.value = x instanceof THREE.Vector3 ? x : new THREE.Vector3(x, y, z);
    }
    Vector3Node.prototype = Object.create(InputNode.prototype);
    Vector3Node.prototype.constructor = Vector3Node;
    Vector3Node.prototype.nodeType = 'Vector3';
    NodeUtils.addShortcuts(Vector3Node.prototype, 'value', [
        'x',
        'y',
        'z'
    ]);
    Vector3Node.prototype.generateReadonly = function (builder, output, uuid, type) {
        return builder.format('vec3( ' + this.x + ', ' + this.y + ', ' + this.z + ' )', type, output);
    };
    Vector3Node.prototype.copy = function (source) {
        InputNode.prototype.copy.call(this, source);
        this.value.copy(source);
        return this;
    };
    Vector3Node.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.x = this.x;
            data.y = this.y;
            data.z = this.z;
            if (this.readonly === true)
                data.readonly = true;
        }
        return data;
    };
    return Vector3Node;
});