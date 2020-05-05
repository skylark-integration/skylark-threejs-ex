define(['./FunctionNode.js'], function (a) {
    'use strict';
    function ExpressionNode(src, type, keywords, extensions, includes) {
        a.FunctionNode.call(this, src, includes, extensions, keywords, type);
    }
    ExpressionNode.prototype = Object.create(a.FunctionNode.prototype);
    ExpressionNode.prototype.constructor = ExpressionNode;
    ExpressionNode.prototype.nodeType = 'Expression';
    return ExpressionNode;
});