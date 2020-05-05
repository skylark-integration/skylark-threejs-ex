define([
    "skylark-threejs",
    '../postprocessing/Pass.js',
    '../shaders/HalftoneShader.js'
], function (a, b, c) {
    'use strict';
    var HalftonePass = function (width, height, params) {
        b.Pass.call(this);
        if (c.HalftoneShader === undefined) {
            console.error('THREE.HalftonePass requires HalftoneShader');
        }
        this.uniforms = a.UniformsUtils.clone(c.HalftoneShader.uniforms);
        this.material = new a.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: c.HalftoneShader.fragmentShader,
            vertexShader: c.HalftoneShader.vertexShader
        });
        this.uniforms.width.value = width;
        this.uniforms.height.value = height;
        for (var key in params) {
            if (params.hasOwnProperty(key) && this.uniforms.hasOwnProperty(key)) {
                this.uniforms[key].value = params[key];
            }
        }
        this.fsQuad = new b.Pass.FullScreenQuad(this.material);
    };
    HalftonePass.prototype = Object.assign(Object.create(b.Pass.prototype), {
        constructor: HalftonePass,
        render: function (renderer, writeBuffer, readBuffer) {
            this.material.uniforms['tDiffuse'].value = readBuffer.texture;
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.fsQuad.render(renderer);
            } else {
                renderer.setRenderTarget(writeBuffer);
                if (this.clear)
                    renderer.clear();
                this.fsQuad.render(renderer);
            }
        },
        setSize: function (width, height) {
            this.uniforms.width.value = width;
            this.uniforms.height.value = height;
        }
    });
    return HalftonePass;
});