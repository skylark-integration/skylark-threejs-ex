define(['../postprocessing/Pass'], function (Pass) {
    'use strict';
    var ClearMaskPass = function () {
        Pass.call(this);
        this.needsSwap = false;
    };
    ClearMaskPass.prototype = Object.create(Pass.prototype);
    Object.assign(ClearMaskPass.prototype, {
        render: function (renderer) {
            renderer.state.buffers.stencil.setLocked(false);
            renderer.state.buffers.stencil.setTest(false);
        }
    });
    return ClearMaskPass;
});