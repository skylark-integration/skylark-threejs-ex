define([
    "skylark-threejs",
    "../threex",
    '../postprocessing/Pass',
    '../shaders/CopyShader',
    '../shaders/ConvolutionShader'
], function (
    THREE, 
    threex,
    Pass, 
    CopyShader, 
    ConvolutionShader
) {
    'use strict';
    var BloomPass = function (strength, kernelSize, sigma, resolution) {
        Pass.call(this);
        strength = strength !== undefined ? strength : 1;
        kernelSize = kernelSize !== undefined ? kernelSize : 25;
        sigma = sigma !== undefined ? sigma : 4;
        resolution = resolution !== undefined ? resolution : 256;
        var pars = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        };
        this.renderTargetX = new THREE.WebGLRenderTarget(resolution, resolution, pars);
        this.renderTargetX.texture.name = 'BloomPass.x';
        this.renderTargetY = new THREE.WebGLRenderTarget(resolution, resolution, pars);
        this.renderTargetY.texture.name = 'BloomPass.y';
        if (CopyShader === undefined)
            console.error('BloomPass relies on CopyShader');
        var copyShader = CopyShader;
        this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
        this.copyUniforms['opacity'].value = strength;
        this.materialCopy = new THREE.ShaderMaterial({
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        if (ConvolutionShader === undefined)
            console.error('BloomPass relies on ConvolutionShader');
        var convolutionShader = ConvolutionShader;
        this.convolutionUniforms = THREE.UniformsUtils.clone(convolutionShader.uniforms);
        this.convolutionUniforms['uImageIncrement'].value = BloomPass.blurX;
        this.convolutionUniforms['cKernel'].value = ConvolutionShader.buildKernel(sigma);
        this.materialConvolution = new THREE.ShaderMaterial({
            uniforms: this.convolutionUniforms,
            vertexShader: convolutionShader.vertexShader,
            fragmentShader: convolutionShader.fragmentShader,
            defines: {
                'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
                'KERNEL_SIZE_INT': kernelSize.toFixed(0)
            }
        });
        this.needsSwap = false;
        this.fsQuad = new Pass.FullScreenQuad(null);
    };
    BloomPass.prototype = Object.assign(Object.create(Pass.prototype), {
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
    BloomPass.blurX = new THREE.Vector2(0.001953125, 0);
    BloomPass.blurY = new THREE.Vector2(0, 0.001953125);

    return threex.postprocessing.BloomPass = BloomPass;
});