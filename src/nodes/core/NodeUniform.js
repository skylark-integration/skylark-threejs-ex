define(function () {
    'use strict';
    function NodeUniform(params) {
        params = params || {};
        this.name = params.name;
        this.type = params.type;
        this.node = params.node;
        this.needsUpdate = params.needsUpdate;
    }
    Object.defineProperties(NodeUniform.prototype, {
        value: {
            get: function () {
                return this.node.value;
            },
            set: function (val) {
                this.node.value = val;
            }
        }
    });
    return NodeUniform;
});