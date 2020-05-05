define([
    "skylark-threejs",
    '../postprocessing/Pass.js',
    '../shaders/CopyShader.js',
    '../shaders/ConvolutionShader.js'
], function (a, b, c, d) {
    'use strict';
    var BloomPass = function (strength, kernelSize, sigma, resolution) {
        b.Pass.call(this);
        strength = strength !== undefined ? strength : 1;
        kernelSize = kernelSize !== undefined ? kernelSize : 25;
        sigma = sigma !== undefined ? sigma : 4;
        resolution = resolution !== undefined ? resolution : 256;
        var pars = {
            minFilter: a.LinearFilter,
            magFilter: a.LinearFilter,
            format: a.RGBAFormat
        };
        this.renderTargetX = new a.WebGLRenderTarget(resolution, resolution, pars);
        this.renderTargetX.texture.name = 'BloomPass.x';
        this.renderTargetY = new a.WebGLRenderTarget(resolution, resolution, pars);
        this.renderTargetY.texture.name = 'BloomPass.y';
        if (c.CopyShader === undefined)
            console.error('BloomPass relies on CopyShader');
        var copyShader = c.CopyShader;
        this.copyUniforms = a.UniformsUtils.clone(copyShader.uniforms);
        this.copyUniforms['opacity'].value = strength;
        this.materialCopy = new a.ShaderMaterial({
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: a.AdditiveBlending,
            transparent: true
        });
        if (d.ConvolutionShader === undefined)
            console.error('BloomPass relies on ConvolutionShader');
        var convolutionShader = d.ConvolutionShader;
        this.convolutionUniforms = a.UniformsUtils.clone(convolutionShader.uniforms);
        this.convolutionUniforms['uImageIncrement'].value = BloomPass.blurX;
        this.convolutionUniforms['cKernel'].value = d.ConvolutionShader.buildKernel(sigma);
        this.materialConvolution = new a.ShaderMaterial({
            uniforms: this.convolutionUniforms,
            vertexShader: convolutionShader.vertexShader,
            fragmentShader: convolutionShader.fragmentShader,
            defines: {
                'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
                'KERNEL_SIZE_INT': kernelSize.toFixed(0)
            }
        });
        this.needsSwap = false;
        this.fsQuad = new b.Pass.FullScreenQuad(null);
    };
    BloomPass.prototype = Object.assign(Object.create(b.Pass.prototype), {
        constructor: BloomPass,
        render: function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
            if (maskActive)
                renderer.state.buffers.stencil.setTest(false);
            this.fsQuad.material = this.materialConvolution;
            this.convolutionUniforms['tDiffuse'].value = readBuffer.texture;
            this.convolutionUniforms['uImageIncrement'].value = BloomPass.blurX;
            renderer.setRenderTarget(this.renderTargetX);
            renderer.clear();
            this.fsQuad.render(renderer);
            this.convolutionUniforms['tDiffuse'].value = this.renderTargetX.texture;
            this.convolutionUniforms['uImageIncrement'].value = BloomPass.blurY;
            renderer.setRenderTarget(this.renderTargetY);
            renderer.clear();
            this.fsQuad.render(renderer);
            this.fsQuad.material = this.materialCopy;
            this.copyUniforms['tDiffuse'].value = this.renderTargetY.texture;
            if (maskActive)
                renderer.state.buffers.stencil.setTest(true);
            renderer.setRenderTarget(readBuffer);
            if (this.clear)
                renderer.clear();
            this.fsQuad.render(renderer);
        }
    });
    BloomPass.blurX = new a.Vector2(0.001953125, 0);
    BloomPass.blurY = new a.Vector2(0, 0.001953125);
    return BloomPass;
});