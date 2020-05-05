define(['../core/TempNode.js'], function (a) {
    'use strict';
    function OperatorNode(a, b, op) {
        a.TempNode.call(this);
        this.a = a;
        this.b = b;
        this.op = op;
    }
    OperatorNode.ADD = '+';
    OperatorNode.SUB = '-';
    OperatorNode.MUL = '*';
    OperatorNode.DIV = '/';
    OperatorNode.prototype = Object.create(a.TempNode.prototype);
    OperatorNode.prototype.constructor = OperatorNode;
    OperatorNode.prototype.nodeType = 'Operator';
    OperatorNode.prototype.getType = function (builder) {
        var a = this.a.getType(builder), b = this.b.getType(builder);
        if (builder.isTypeMatrix(a)) {
            return 'v4';
        } else if (builder.getTypeLength(b) > builder.getTypeLength(a)) {
            return b;
        }
        return a;
    };
    OperatorNode.prototype.generate = function (builder, output) {
        var type = this.getType(builder);
        var a = this.a.build(builder, type), b = this.b.build(builder, type);
        return builder.format('( ' + a + ' ' + this.op + ' ' + b + ' )', type, output);
    };
    OperatorNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.a = source.a;
        this.b = source.b;
        this.op = source.op;
        return this;
    };
    OperatorNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.a = this.a.toJSON(meta).uuid;
            data.b = this.b.toJSON(meta).uuid;
            data.op = this.op;
        }
        return data;
    };
    return OperatorNode;
});