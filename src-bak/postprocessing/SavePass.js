define([
    "skylark-threejs",
    '../postprocessing/Pass.js',
    '../shaders/CopyShader.js'
], function (a, b, c) {
    'use strict';
    var SavePass = function (renderTarget) {
        b.Pass.call(this);
        if (c.CopyShader === undefined)
            console.error('SavePass relies on CopyShader');
        var shader = c.CopyShader;
        this.textureID = 'tDiffuse';
        this.uniforms = a.UniformsUtils.clone(shader.uniforms);
        this.material = new a.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        this.renderTarget = renderTarget;
        if (this.renderTarget === undefined) {
            this.renderTarget = new a.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
                minFilter: a.LinearFilter,
                magFilter: a.LinearFilter,
                format: a.RGBFormat,
                stencilBuffer: false
            });
            this.renderTarget.texture.name = 'SavePass.rt';
        }
        this.needsSwap = false;
        this.fsQuad = new b.Pass.FullScreenQuad(this.material);
    };
    SavePass.prototype = Object.assign(Object.create(b.Pass.prototype), {
        constructor: SavePass,
        render: function (renderer, writeBuffer, readBuffer) {
            if (this.uniforms[this.textureID]) {
                this.uniforms[this.textureID].value = readBuffer.texture;
            }
            renderer.setRenderTarget(this.renderTarget);
            if (this.clear)
                renderer.clear();
            this.fsQuad.render(renderer);
        }
    });
    return SavePass;
});