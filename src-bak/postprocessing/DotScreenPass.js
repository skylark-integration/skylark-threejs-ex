define([
    "skylark-threejs",
    '../postprocessing/Pass.js',
    '../shaders/DotScreenShader.js'
], function (a, b, c) {
    'use strict';
    var DotScreenPass = function (center, angle, scale) {
        b.Pass.call(this);
        if (c.DotScreenShader === undefined)
            console.error('DotScreenPass relies on DotScreenShader');
        var shader = c.DotScreenShader;
        this.uniforms = a.UniformsUtils.clone(shader.uniforms);
        if (center !== undefined)
            this.uniforms['center'].value.copy(center);
        if (angle !== undefined)
            this.uniforms['angle'].value = angle;
        if (scale !== undefined)
            this.uniforms['scale'].value = scale;
        this.material = new a.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        this.fsQuad = new b.Pass.FullScreenQuad(this.material);
    };
    DotScreenPass.prototype = Object.assign(Object.create(b.Pass.prototype), {
        constructor: DotScreenPass,
        render: function (renderer, writeBuffer, readBuffer) {
            this.uniforms['tDiffuse'].value = readBuffer.texture;
            this.uniforms['tSize'].value.set(readBuffer.width, readBuffer.height);
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.fsQuad.render(renderer);
            } else {
                renderer.setRenderTarget(writeBuffer);
                if (this.clear)
                    renderer.clear();
                this.fsQuad.render(renderer);
            }
        }
    });
    return DotScreenPass;
});