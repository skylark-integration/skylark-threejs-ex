define([
    "../threex",
    '../postprocessing/Pass'
], function (
    threex,
    Pass
) {
    'use strict';
    var ClearPass = function (clearColor, clearAlpha) {
        Pass.call(this);
        this.needsSwap = false;
        this.clearColor = clearColor !== undefined ? clearColor : 0;
        this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
    };
    ClearPass.prototype = Object.assign(Object.create(Pass.prototype), {
        constructor: ClearPass,
        render: function (renderer, writeBuffer, readBuffer) {
            var oldClearColor, oldClearAlpha;
            if (this.clearColor) {
                oldClearColor = renderer.getClearColor().getHex();
                oldClearAlpha = renderer.getClearAlpha();
                renderer.setClearColor(this.clearColor, this.clearAlpha);
            }
            renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
            renderer.clear();
            if (this.clearColor) {
                renderer.setClearColor(oldClearColor, oldClearAlpha);
            }
        }
    });

    return threex.postprocessing.ClearPass = ClearPass;
});