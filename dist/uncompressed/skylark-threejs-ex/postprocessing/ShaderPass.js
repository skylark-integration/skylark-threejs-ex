define([
    "skylark-threejs",
    './Pass'
], function (
    THREE, 
    Pass
) {
    'use strict';
    var ShaderPass = function (shader, textureID) {
        Pass.call(this);
        this.textureID = textureID !== undefined ? textureID : 'tDiffuse';
        if (shader instanceof THREE.ShaderMaterial) {
            this.uniforms = shader.uniforms;
            this.material = shader;
        } else if (shader) {
            this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
            this.material = new THREE.ShaderMaterial({
                defines: Object.assign({}, shader.defines),
                uniforms: this.uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader
            });
        }
        this.fsQuad = new Pass.FullScreenQuad(this.material);
    };
    ShaderPass.prototype = Object.assign(Object.create(Pass.prototype), {
        constructor: ShaderPass,
        render: function (renderer, writeBuffer, readBuffer) {
            if (this.uniforms[this.textureID]) {
                this.uniforms[this.textureID].value = readBuffer.texture;
            }
            this.fsQuad.material = this.material;
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.fsQuad.render(renderer);
            } else {
                renderer.setRenderTarget(writeBuffer);
                if (this.clear)
                    renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
                this.fsQuad.render(renderer);
            }
        }
    });
    return ShaderPass;
});