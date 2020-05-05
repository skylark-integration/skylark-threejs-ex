define(['../postprocessing/Pass.js'], function (a) {
    'use strict';
    var ClearMaskPass = function () {
        a.Pass.call(this);
        this.needsSwap = false;
    };
    ClearMaskPass.prototype = Object.create(a.Pass.prototype);
    Object.assign(ClearMaskPass.prototype, {
        render: function (renderer) {
            renderer.state.buffers.stencil.setLocked(false);
            renderer.state.buffers.stencil.setTest(false);
        }
    });
    return ClearMaskPass;
});