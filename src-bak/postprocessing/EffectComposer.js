define([
    "skylark-threejs",
    '../shaders/CopyShader.js',
    '../postprocessing/ShaderPass.js',
    '../postprocessing/MaskPass.js'
], function (a, b, c, d) {
    'use strict';
    var EffectComposer = function (renderer, renderTarget) {
        this.renderer = renderer;
        if (renderTarget === undefined) {
            var parameters = {
                minFilter: a.LinearFilter,
                magFilter: a.LinearFilter,
                format: a.RGBAFormat,
                stencilBuffer: false
            };
            var size = renderer.getSize(new a.Vector2());
            this._pixelRatio = renderer.getPixelRatio();
            this._width = size.width;
            this._height = size.height;
            renderTarget = new a.WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, parameters);
            renderTarget.texture.name = 'EffectComposer.rt1';
        } else {
            this._pixelRatio = 1;
            this._width = renderTarget.width;
            this._height = renderTarget.height;
        }
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();
        this.renderTarget2.texture.name = 'EffectComposer.rt2';
        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;
        this.renderToScreen = true;
        this.passes = [];
        if (b.CopyShader === undefined) {
            console.error('THREE.EffectComposer relies on CopyShader');
        }
        if (c.ShaderPass === undefined) {
            console.error('THREE.EffectComposer relies on ShaderPass');
        }
        this.copyPass = new c.ShaderPass(b.CopyShader);
        this.clock = new a.Clock();
    };
    Object.assign(EffectComposer.prototype, {
        swapBuffers: function () {
            var tmp = this.readBuffer;
            this.readBuffer = this.writeBuffer;
            this.writeBuffer = tmp;
        },
        addPass: function (pass) {
            this.passes.push(pass);
            pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
        },
        insertPass: function (pass, index) {
            this.passes.splice(index, 0, pass);
        },
        isLastEnabledPass: function (passIndex) {
            for (var i = passIndex + 1; i < this.passes.length; i++) {
                if (this.passes[i].enabled) {
                    return false;
                }
            }
            return true;
        },
        render: function (deltaTime) {
            if (deltaTime === undefined) {
                deltaTime = this.clock.getDelta();
            }
            var currentRenderTarget = this.renderer.getRenderTarget();
            var maskActive = false;
            var pass, i, il = this.passes.length;
            for (i = 0; i < il; i++) {
                pass = this.passes[i];
                if (pass.enabled === false)
                    continue;
                pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
                pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);
                if (pass.needsSwap) {
                    if (maskActive) {
                        var context = this.renderer.getContext();
                        var stencil = this.renderer.state.buffers.stencil;
                        stencil.setFunc(context.NOTEQUAL, 1, 4294967295);
                        this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);
                        stencil.setFunc(context.EQUAL, 1, 4294967295);
                    }
                    this.swapBuffers();
                }
                if (d.MaskPass !== undefined) {
                    if (pass instanceof d.MaskPass) {
                        maskActive = true;
                    } else if (pass instanceof d.ClearMaskPass) {
                        maskActive = false;
                    }
                }
            }
            this.renderer.setRenderTarget(currentRenderTarget);
        },
        reset: function (renderTarget) {
            if (renderTarget === undefined) {
                var size = this.renderer.getSize(new a.Vector2());
                this._pixelRatio = this.renderer.getPixelRatio();
                this._width = size.width;
                this._height = size.height;
                renderTarget = this.renderTarget1.clone();
                renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
            }
            this.renderTarget1.dispose();
            this.renderTarget2.dispose();
            this.renderTarget1 = renderTarget;
            this.renderTarget2 = renderTarget.clone();
            this.writeBuffer = this.renderTarget1;
            this.readBuffer = this.renderTarget2;
        },
        setSize: function (width, height) {
            this._width = width;
            this._height = height;
            var effectiveWidth = this._width * this._pixelRatio;
            var effectiveHeight = this._height * this._pixelRatio;
            this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
            this.renderTarget2.setSize(effectiveWidth, effectiveHeight);
            for (var i = 0; i < this.passes.length; i++) {
                this.passes[i].setSize(effectiveWidth, effectiveHeight);
            }
        },
        setPixelRatio: function (pixelRatio) {
            this._pixelRatio = pixelRatio;
            this.setSize(this._width, this._height);
        }
    });

    return  EffectComposer;
});