define([
    "skylark-threejs",
    '../postprocessing/Pass.js',
    '../shaders/AfterimageShader.js'
], function (a, b, c) {
    'use strict';
    var AfterimagePass = function (damp) {
        b.Pass.call(this);
        if (c.AfterimageShader === undefined)
            console.error('AfterimagePass relies on AfterimageShader');
        this.shader = c.AfterimageShader;
        this.uniforms = a.UniformsUtils.clone(this.shader.uniforms);
        this.uniforms['damp'].value = damp !== undefined ? damp : 0.96;
        this.textureComp = new a.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: a.LinearFilter,
            magFilter: a.NearestFilter,
            format: a.RGBAFormat
        });
        this.textureOld = new a.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: a.LinearFilter,
            magFilter: a.NearestFilter,
            format: a.RGBAFormat
        });
        this.shaderMaterial = new a.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader
        });
        this.compFsQuad = new b.Pass.FullScreenQuad(this.shaderMaterial);
        var material = new a.MeshBasicMaterial();
        this.copyFsQuad = new b.Pass.FullScreenQuad(material);
    };
    AfterimagePass.prototype = Object.assign(Object.create(b.Pass.prototype), {
        constructor: AfterimagePass,
        render: function (renderer, writeBuffer, readBuffer) {
            this.uniforms['tOld'].value = this.textureOld.texture;
            this.uniforms['tNew'].value = readBuffer.texture;
            renderer.setRenderTarget(this.textureComp);
            this.compFsQuad.render(renderer);
            this.copyFsQuad.material.map = this.textureComp.texture;
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.copyFsQuad.render(renderer);
            } else {
                renderer.setRenderTarget(writeBuffer);
                if (this.clear)
                    renderer.clear();
                this.copyFsQuad.render(renderer);
            }
            var temp = this.textureOld;
            this.textureOld = this.textureComp;
            this.textureComp = temp;
        },
        setSize: function (width, height) {
            this.textureComp.setSize(width, height);
            this.textureOld.setSize(width, height);
        }
    });
    return AfterimagePass;
});