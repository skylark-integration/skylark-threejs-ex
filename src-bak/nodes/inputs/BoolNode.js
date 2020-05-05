define(['../core/InputNode.js'], function (a) {
    'use strict';
    function BoolNode(value) {
        a.InputNode.call(this, 'b');
        this.value = Boolean(value);
    }
    BoolNode.prototype = Object.create(a.InputNode.prototype);
    BoolNode.prototype.constructor = BoolNode;
    BoolNode.prototype.nodeType = 'Bool';
    BoolNode.prototype.generateReadonly = function (builder, output, uuid, type) {
        return builder.format(this.value, type, output);
    };
    BoolNode.prototype.copy = function (source) {
        a.InputNode.prototype.copy.call(this, source);
        this.value = source.value;
        return this;
    };
    BoolNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.value = this.value;
            if (this.readonly === true)
                data.readonly = true;
        }
        return data;
    };
    return BoolNode;
});