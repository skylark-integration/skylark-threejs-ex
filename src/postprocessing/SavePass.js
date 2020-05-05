define([
    "skylark-threejs",
    './Pass',
    '../shaders/CopyShader'
], function (
    THREE, 
    Pass, 
    CopyShader
) {
    'use strict';
    var SavePass = function (renderTarget) {
        Pass.call(this);
        if (CopyShader === undefined)
            console.error('SavePass relies on CopyShader');
        var shader = CopyShader;
        this.textureID = 'tDiffuse';
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        this.renderTarget = renderTarget;
        if (this.renderTarget === undefined) {
            this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBFormat,
                stencilBuffer: false
            });
            this.renderTarget.texture.name = 'SavePass.rt';
        }
        this.needsSwap = false;
        this.fsQuad = new Pass.FullScreenQuad(this.material);
    };
    SavePass.prototype = Object.assign(Object.create(Pass.prototype), {
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