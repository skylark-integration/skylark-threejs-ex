define([
    '../core/Node'
], function (
    Node
) {
    'use strict';
    function SwitchNode(node, components) {
        Node.call(this);
        this.node = node;
        this.components = components || 'x';
    }
    SwitchNode.prototype = Object.create(Node.prototype);
    SwitchNode.prototype.constructor = SwitchNode;
    SwitchNode.prototype.nodeType = 'Switch';
    SwitchNode.prototype.getType = function (builder) {
        return builder.getTypeFromLength(this.components.length);
    };
    SwitchNode.prototype.generate = function (builder, output) {
        var type = this.node.getType(builder), node = this.node.build(builder, type), inputLength = builder.getTypeLength(type) - 1;
        if (inputLength > 0) {
            var outputLength = 0, components = builder.colorToVectorProperties(this.components);
            var i, len = components.length;
            for (i = 0; i < len; i++) {
                outputLength = Math.max(outputLength, builder.getIndexByElement(components.charAt(i)));
            }
            if (outputLength > inputLength)
                outputLength = inputLength;
            node += '.';
            for (i = 0; i < len; i++) {
                var idx = builder.getIndexByElement(components.charAt(i));
                if (idx > outputLength)
                    idx = outputLength;
                node += builder.getElementByIndex(idx);
            }
            return builder.format(node, this.getType(builder), output);
        } else {
            return builder.format(node, type, output);
        }
    };
    SwitchNode.prototype.copy = function (source) {
        Node.prototype.copy.call(this, source);
        this.node = source.node;
        this.components = source.components;
        return this;
    };
    SwitchNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.node = this.node.toJSON(meta).uuid;
            data.components = this.components;
        }
        return data;
    };
    return SwitchNode;
});