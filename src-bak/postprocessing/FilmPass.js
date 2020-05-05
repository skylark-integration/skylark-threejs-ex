define([
    "skylark-threejs",
    '../postprocessing/Pass.js',
    '../shaders/FilmShader.js'
], function (a, b, c) {
    'use strict';
    var FilmPass = function (noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale) {
        b.Pass.call(this);
        if (c.FilmShader === undefined)
            console.error('FilmPass relies on FilmShader');
        var shader = c.FilmShader;
        this.uniforms = a.UniformsUtils.clone(shader.uniforms);
        this.material = new a.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        if (grayscale !== undefined)
            this.uniforms.grayscale.value = grayscale;
        if (noiseIntensity !== undefined)
            this.uniforms.nIntensity.value = noiseIntensity;
        if (scanlinesIntensity !== undefined)
            this.uniforms.sIntensity.value = scanlinesIntensity;
        if (scanlinesCount !== undefined)
            this.uniforms.sCount.value = scanlinesCount;
        this.fsQuad = new b.Pass.FullScreenQuad(this.material);
    };
    FilmPass.prototype = Object.assign(Object.create(b.Pass.prototype), {
        constructor: FilmPass,
        render: function (renderer, writeBuffer, readBuffer, deltaTime) {
            this.uniforms['tDiffuse'].value = readBuffer.texture;
            this.uniforms['time'].value += deltaTime;
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
    return FilmPass;
});