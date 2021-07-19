define([
    "skylark-threejs",
    "../threex",
    '../postprocessing/Pass',
    '../shaders/CopyShader'
], function (
    THREE, 
    threex,
    Pass, 
    CopyShader
) {
    'use strict';
    var TexturePass = function (map, opacity) {
        Pass.call(this);
        if (CopyShader === undefined)
            console.error('TexturePass relies on CopyShader');
        var shader = CopyShader;
        this.map = map;
        this.opacity = opacity !== undefined ? opacity : 1;
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            depthTest: false,
            depthWrite: false
        });
        this.needsSwap = false;
        this.fsQuad = new Pass.FullScreenQuad(null);
    };
    TexturePass.prototype = Object.assign(Object.create(Pass.prototype), {
        constructor: TexturePass,
        render: function (renderer, writeBuffer, readBuffer) {
            var oldAutoClear = renderer.autoClear;
            renderer.autoClear = false;
            this.fsQuad.material = this.material;
            this.uniforms['opacity'].value = this.opacity;
            this.uniforms['tDiffuse'].value = this.map;
            this.material.transparent = this.opacity < 1;
            renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
            if (this.clear)
                renderer.clear();
            this.fsQuad.render(renderer);
            renderer.autoClear = oldAutoClear;
        }
    });
    return threex.postprocessing.TexturePass = TexturePass;
});