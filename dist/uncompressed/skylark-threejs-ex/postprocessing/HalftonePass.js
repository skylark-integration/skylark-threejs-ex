define([
    "skylark-threejs",
    './Pass',
    '../shaders/HalftoneShader'
], function (
    THREE, 
    Pass, 
    HalftoneShader
) {
    'use strict';
    var HalftonePass = function (width, height, params) {
        Pass.call(this);
        if (HalftoneShader === undefined) {
            console.error('THREE.HalftonePass requires HalftoneShader');
        }
        this.uniforms = THREE.UniformsUtils.clone(HalftoneShader.uniforms);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: HalftoneShader.fragmentShader,
            vertexShader: HalftoneShader.vertexShader
        });
        this.uniforms.width.value = width;
        this.uniforms.height.value = height;
        for (var key in params) {
            if (params.hasOwnProperty(key) && this.uniforms.hasOwnProperty(key)) {
                this.uniforms[key].value = params[key];
            }
        }
        this.fsQuad = new Pass.FullScreenQuad(this.material);
    };
    HalftonePass.prototype = Object.assign(Object.create(Pass.prototype), {
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