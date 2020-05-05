define(['../core/InputNode.js'], function (a) {
    'use strict';
    function PropertyNode(object, property, type) {
        a.InputNode.call(this, type);
        this.object = object;
        this.property = property;
    }
    PropertyNode.prototype = Object.create(a.InputNode.prototype);
    PropertyNode.prototype.constructor = PropertyNode;
    PropertyNode.prototype.nodeType = 'Property';
    Object.defineProperties(PropertyNode.prototype, {
        value: {
            get: function () {
                return this.object[this.property];
            },
            set: function (val) {
                this.object[this.property] = val;
            }
        }
    });
    PropertyNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.value = this.value;
            data.property = this.property;
        }
        return data;
    };
    return PropertyNode;
});