define([
    "skylark-threejs",
    '../postprocessing/Pass',
    '../shaders/BokehShader'
], function (
    THREE, 
    Pass, 
    BokehShader
) {
    'use strict';
    var BokehPass = function (scene, camera, params) {
        Pass.call(this);
        this.scene = scene;
        this.camera = camera;
        var focus = params.focus !== undefined ? params.focus : 1;
        var aspect = params.aspect !== undefined ? params.aspect : camera.aspect;
        var aperture = params.aperture !== undefined ? params.aperture : 0.025;
        var maxblur = params.maxblur !== undefined ? params.maxblur : 1;
        var width = params.width || window.innerWidth || 1;
        var height = params.height || window.innerHeight || 1;
        this.renderTargetDepth = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            stencilBuffer: false
        });
        this.renderTargetDepth.texture.name = 'BokehPass.depth';
        this.materialDepth = new THREE.MeshDepthMaterial();
        this.materialDepth.depthPacking = THREE.RGBADepthPacking;
        this.materialDepth.blending = THREE.NoBlending;
        if (BokehShader === undefined) {
            console.error('BokehPass relies on BokehShader');
        }
        var bokehShader = BokehShader;
        var bokehUniforms = THREE.UniformsUtils.clone(bokehShader.uniforms);
        bokehUniforms['tDepth'].value = this.renderTargetDepth.texture;
        bokehUniforms['focus'].value = focus;
        bokehUniforms['aspect'].value = aspect;
        bokehUniforms['aperture'].value = aperture;
        bokehUniforms['maxblur'].value = maxblur;
        bokehUniforms['nearClip'].value = camera.near;
        bokehUniforms['farClip'].value = camera.far;
        this.materialBokeh = new THREE.ShaderMaterial({
            defines: Object.assign({}, bokehShader.defines),
            uniforms: bokehUniforms,
            vertexShader: bokehShader.vertexShader,
            fragmentShader: bokehShader.fragmentShader
        });
        this.uniforms = bokehUniforms;
        this.needsSwap = false;
        this.fsQuad = new Pass.FullScreenQuad(this.materialBokeh);
        this.oldClearColor = new THREE.Color();
    };
    BokehPass.prototype = Object.assign(Object.create(Pass.prototype), {
        constructor: BokehPass,
        render: function (renderer, writeBuffer, readBuffer) {
            this.scene.overrideMaterial = this.materialDepth;
            this.oldClearColor.copy(renderer.getClearColor());
            var oldClearAlpha = renderer.getClearAlpha();
            var oldAutoClear = renderer.autoClear;
            renderer.autoClear = false;
            renderer.setClearColor(16777215);
            renderer.setClearAlpha(1);
            renderer.setRenderTarget(this.renderTargetDepth);
            renderer.clear();
            renderer.render(this.scene, this.camera);
            this.uniforms['tColor'].value = readBuffer.texture;
            this.uniforms['nearClip'].value = this.camera.near;
            this.uniforms['farClip'].value = this.camera.far;
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.fsQuad.render(renderer);
            } else {
                renderer.setRenderTarget(writeBuffer);
                renderer.clear();
                this.fsQuad.render(renderer);
            }
            this.scene.overrideMaterial = null;
            renderer.setClearColor(this.oldClearColor);
            renderer.setClearAlpha(oldClearAlpha);
            renderer.autoClear = oldAutoClear;
        }
    });
    return BokehPass;
});