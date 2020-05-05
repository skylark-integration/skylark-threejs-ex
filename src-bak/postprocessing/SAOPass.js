define([
    "skylark-threejs",
    '../postprocessing/Pass.js',
    '../shaders/SAOShader.js',
    '../shaders/DepthLimitedBlurShader.js',
    '../shaders/CopyShader.js',
    '../shaders/UnpackDepthRGBAShader.js'
], function (a, b, c, d, e, f) {
    'use strict';
    var SAOPass = function (scene, camera, depthTexture, useNormals, resolution) {
        b.Pass.call(this);
        this.scene = scene;
        this.camera = camera;
        this.clear = true;
        this.needsSwap = false;
        this.supportsDepthTextureExtension = depthTexture !== undefined ? depthTexture : false;
        this.supportsNormalTexture = useNormals !== undefined ? useNormals : false;
        this.originalClearColor = new a.Color();
        this.oldClearColor = new a.Color();
        this.oldClearAlpha = 1;
        this.params = {
            output: 0,
            saoBias: 0.5,
            saoIntensity: 0.18,
            saoScale: 1,
            saoKernelRadius: 100,
            saoMinResolution: 0,
            saoBlur: true,
            saoBlurRadius: 8,
            saoBlurStdDev: 4,
            saoBlurDepthCutoff: 0.01
        };
        this.resolution = resolution !== undefined ? new a.Vector2(resolution.x, resolution.y) : new a.Vector2(256, 256);
        this.saoRenderTarget = new a.WebGLRenderTarget(this.resolution.x, this.resolution.y, {
            minFilter: a.LinearFilter,
            magFilter: a.LinearFilter,
            format: a.RGBAFormat
        });
        this.blurIntermediateRenderTarget = this.saoRenderTarget.clone();
        this.beautyRenderTarget = this.saoRenderTarget.clone();
        this.normalRenderTarget = new a.WebGLRenderTarget(this.resolution.x, this.resolution.y, {
            minFilter: a.NearestFilter,
            magFilter: a.NearestFilter,
            format: a.RGBAFormat
        });
        this.depthRenderTarget = this.normalRenderTarget.clone();
        if (this.supportsDepthTextureExtension) {
            var depthTexture = new a.DepthTexture();
            depthTexture.type = a.UnsignedShortType;
            depthTexture.minFilter = a.NearestFilter;
            depthTexture.maxFilter = a.NearestFilter;
            this.beautyRenderTarget.depthTexture = depthTexture;
            this.beautyRenderTarget.depthBuffer = true;
        }
        this.depthMaterial = new a.MeshDepthMaterial();
        this.depthMaterial.depthPacking = a.RGBADepthPacking;
        this.depthMaterial.blending = a.NoBlending;
        this.normalMaterial = new a.MeshNormalMaterial();
        this.normalMaterial.blending = a.NoBlending;
        if (c.SAOShader === undefined) {
            console.error('THREE.SAOPass relies on SAOShader');
        }
        this.saoMaterial = new a.ShaderMaterial({
            defines: Object.assign({}, c.SAOShader.defines),
            fragmentShader: c.SAOShader.fragmentShader,
            vertexShader: c.SAOShader.vertexShader,
            uniforms: a.UniformsUtils.clone(c.SAOShader.uniforms)
        });
        this.saoMaterial.extensions.derivatives = true;
        this.saoMaterial.defines['DEPTH_PACKING'] = this.supportsDepthTextureExtension ? 0 : 1;
        this.saoMaterial.defines['NORMAL_TEXTURE'] = this.supportsNormalTexture ? 1 : 0;
        this.saoMaterial.defines['PERSPECTIVE_CAMERA'] = this.camera.isPerspectiveCamera ? 1 : 0;
        this.saoMaterial.uniforms['tDepth'].value = this.supportsDepthTextureExtension ? depthTexture : this.depthRenderTarget.texture;
        this.saoMaterial.uniforms['tNormal'].value = this.normalRenderTarget.texture;
        this.saoMaterial.uniforms['size'].value.set(this.resolution.x, this.resolution.y);
        this.saoMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);
        this.saoMaterial.uniforms['cameraProjectionMatrix'].value = this.camera.projectionMatrix;
        this.saoMaterial.blending = a.NoBlending;
        if (d.DepthLimitedBlurShader === undefined) {
            console.error('THREE.SAOPass relies on DepthLimitedBlurShader');
        }
        this.vBlurMaterial = new a.ShaderMaterial({
            uniforms: a.UniformsUtils.clone(d.DepthLimitedBlurShader.uniforms),
            defines: Object.assign({}, d.DepthLimitedBlurShader.defines),
            vertexShader: d.DepthLimitedBlurShader.vertexShader,
            fragmentShader: d.DepthLimitedBlurShader.fragmentShader
        });
        this.vBlurMaterial.defines['DEPTH_PACKING'] = this.supportsDepthTextureExtension ? 0 : 1;
        this.vBlurMaterial.defines['PERSPECTIVE_CAMERA'] = this.camera.isPerspectiveCamera ? 1 : 0;
        this.vBlurMaterial.uniforms['tDiffuse'].value = this.saoRenderTarget.texture;
        this.vBlurMaterial.uniforms['tDepth'].value = this.supportsDepthTextureExtension ? depthTexture : this.depthRenderTarget.texture;
        this.vBlurMaterial.uniforms['size'].value.set(this.resolution.x, this.resolution.y);
        this.vBlurMaterial.blending = a.NoBlending;
        this.hBlurMaterial = new a.ShaderMaterial({
            uniforms: a.UniformsUtils.clone(d.DepthLimitedBlurShader.uniforms),
            defines: Object.assign({}, d.DepthLimitedBlurShader.defines),
            vertexShader: d.DepthLimitedBlurShader.vertexShader,
            fragmentShader: d.DepthLimitedBlurShader.fragmentShader
        });
        this.hBlurMaterial.defines['DEPTH_PACKING'] = this.supportsDepthTextureExtension ? 0 : 1;
        this.hBlurMaterial.defines['PERSPECTIVE_CAMERA'] = this.camera.isPerspectiveCamera ? 1 : 0;
        this.hBlurMaterial.uniforms['tDiffuse'].value = this.blurIntermediateRenderTarget.texture;
        this.hBlurMaterial.uniforms['tDepth'].value = this.supportsDepthTextureExtension ? depthTexture : this.depthRenderTarget.texture;
        this.hBlurMaterial.uniforms['size'].value.set(this.resolution.x, this.resolution.y);
        this.hBlurMaterial.blending = a.NoBlending;
        if (e.CopyShader === undefined) {
            console.error('THREE.SAOPass relies on CopyShader');
        }
        this.materialCopy = new a.ShaderMaterial({
            uniforms: a.UniformsUtils.clone(e.CopyShader.uniforms),
            vertexShader: e.CopyShader.vertexShader,
            fragmentShader: e.CopyShader.fragmentShader,
            blending: a.NoBlending
        });
        this.materialCopy.transparent = true;
        this.materialCopy.depthTest = false;
        this.materialCopy.depthWrite = false;
        this.materialCopy.blending = a.CustomBlending;
        this.materialCopy.blendSrc = a.DstColorFactor;
        this.materialCopy.blendDst = a.ZeroFactor;
        this.materialCopy.blendEquation = a.AddEquation;
        this.materialCopy.blendSrcAlpha = a.DstAlphaFactor;
        this.materialCopy.blendDstAlpha = a.ZeroFactor;
        this.materialCopy.blendEquationAlpha = a.AddEquation;
        if (f.UnpackDepthRGBAShader === undefined) {
            console.error('THREE.SAOPass relies on UnpackDepthRGBAShader');
        }
        this.depthCopy = new a.ShaderMaterial({
            uniforms: a.UniformsUtils.clone(f.UnpackDepthRGBAShader.uniforms),
            vertexShader: f.UnpackDepthRGBAShader.vertexShader,
            fragmentShader: f.UnpackDepthRGBAShader.fragmentShader,
            blending: a.NoBlending
        });
        this.fsQuad = new b.Pass.FullScreenQuad(null);
    };
    SAOPass.OUTPUT = {
        'Beauty': 1,
        'Default': 0,
        'SAO': 2,
        'Depth': 3,
        'Normal': 4
    };
    SAOPass.prototype = Object.assign(Object.create(b.Pass.prototype), {
        constructor: SAOPass,
        render: function (renderer, writeBuffer, readBuffer) {
            if (this.renderToScreen) {
                this.materialCopy.blending = a.NoBlending;
                this.materialCopy.uniforms['tDiffuse'].value = readBuffer.texture;
                this.materialCopy.needsUpdate = true;
                this.renderPass(renderer, this.materialCopy, null);
            }
            if (this.params.output === 1) {
                return;
            }
            this.oldClearColor.copy(renderer.getClearColor());
            this.oldClearAlpha = renderer.getClearAlpha();
            var oldAutoClear = renderer.autoClear;
            renderer.autoClear = false;
            renderer.setRenderTarget(this.depthRenderTarget);
            renderer.clear();
            this.saoMaterial.uniforms['bias'].value = this.params.saoBias;
            this.saoMaterial.uniforms['intensity'].value = this.params.saoIntensity;
            this.saoMaterial.uniforms['scale'].value = this.params.saoScale;
            this.saoMaterial.uniforms['kernelRadius'].value = this.params.saoKernelRadius;
            this.saoMaterial.uniforms['minResolution'].value = this.params.saoMinResolution;
            this.saoMaterial.uniforms['cameraNear'].value = this.camera.near;
            this.saoMaterial.uniforms['cameraFar'].value = this.camera.far;
            var depthCutoff = this.params.saoBlurDepthCutoff * (this.camera.far - this.camera.near);
            this.vBlurMaterial.uniforms['depthCutoff'].value = depthCutoff;
            this.hBlurMaterial.uniforms['depthCutoff'].value = depthCutoff;
            this.vBlurMaterial.uniforms['cameraNear'].value = this.camera.near;
            this.vBlurMaterial.uniforms['cameraFar'].value = this.camera.far;
            this.hBlurMaterial.uniforms['cameraNear'].value = this.camera.near;
            this.hBlurMaterial.uniforms['cameraFar'].value = this.camera.far;
            this.params.saoBlurRadius = Math.floor(this.params.saoBlurRadius);
            if (this.prevStdDev !== this.params.saoBlurStdDev || this.prevNumSamples !== this.params.saoBlurRadius) {
                d.BlurShaderUtils.configure(this.vBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new a.Vector2(0, 1));
                d.BlurShaderUtils.configure(this.hBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new a.Vector2(1, 0));
                this.prevStdDev = this.params.saoBlurStdDev;
                this.prevNumSamples = this.params.saoBlurRadius;
            }
            renderer.setClearColor(0);
            renderer.setRenderTarget(this.beautyRenderTarget);
            renderer.clear();
            renderer.render(this.scene, this.camera);
            if (!this.supportsDepthTextureExtension) {
                this.renderOverride(renderer, this.depthMaterial, this.depthRenderTarget, 0, 1);
            }
            if (this.supportsNormalTexture) {
                this.renderOverride(renderer, this.normalMaterial, this.normalRenderTarget, 7829503, 1);
            }
            this.renderPass(renderer, this.saoMaterial, this.saoRenderTarget, 16777215, 1);
            if (this.params.saoBlur) {
                this.renderPass(renderer, this.vBlurMaterial, this.blurIntermediateRenderTarget, 16777215, 1);
                this.renderPass(renderer, this.hBlurMaterial, this.saoRenderTarget, 16777215, 1);
            }
            var outputMaterial = this.materialCopy;
            if (this.params.output === 3) {
                if (this.supportsDepthTextureExtension) {
                    this.materialCopy.uniforms['tDiffuse'].value = this.beautyRenderTarget.depthTexture;
                    this.materialCopy.needsUpdate = true;
                } else {
                    this.depthCopy.uniforms['tDiffuse'].value = this.depthRenderTarget.texture;
                    this.depthCopy.needsUpdate = true;
                    outputMaterial = this.depthCopy;
                }
            } else if (this.params.output === 4) {
                this.materialCopy.uniforms['tDiffuse'].value = this.normalRenderTarget.texture;
                this.materialCopy.needsUpdate = true;
            } else {
                this.materialCopy.uniforms['tDiffuse'].value = this.saoRenderTarget.texture;
                this.materialCopy.needsUpdate = true;
            }
            if (this.params.output === 0) {
                outputMaterial.blending = a.CustomBlending;
            } else {
                outputMaterial.blending = a.NoBlending;
            }
            this.renderPass(renderer, outputMaterial, this.renderToScreen ? null : readBuffer);
            renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
            renderer.autoClear = oldAutoClear;
        },
        renderPass: function (renderer, passMaterial, renderTarget, clearColor, clearAlpha) {
            this.originalClearColor.copy(renderer.getClearColor());
            var originalClearAlpha = renderer.getClearAlpha();
            var originalAutoClear = renderer.autoClear;
            renderer.setRenderTarget(renderTarget);
            renderer.autoClear = false;
            if (clearColor !== undefined && clearColor !== null) {
                renderer.setClearColor(clearColor);
                renderer.setClearAlpha(clearAlpha || 0);
                renderer.clear();
            }
            this.fsQuad.material = passMaterial;
            this.fsQuad.render(renderer);
            renderer.autoClear = originalAutoClear;
            renderer.setClearColor(this.originalClearColor);
            renderer.setClearAlpha(originalClearAlpha);
        },
        renderOverride: function (renderer, overrideMaterial, renderTarget, clearColor, clearAlpha) {
            this.originalClearColor.copy(renderer.getClearColor());
            var originalClearAlpha = renderer.getClearAlpha();
            var originalAutoClear = renderer.autoClear;
            renderer.setRenderTarget(renderTarget);
            renderer.autoClear = false;
            clearColor = overrideMaterial.clearColor || clearColor;
            clearAlpha = overrideMaterial.clearAlpha || clearAlpha;
            if (clearColor !== undefined && clearColor !== null) {
                renderer.setClearColor(clearColor);
                renderer.setClearAlpha(clearAlpha || 0);
                renderer.clear();
            }
            this.scene.overrideMaterial = overrideMaterial;
            renderer.render(this.scene, this.camera);
            this.scene.overrideMaterial = null;
            renderer.autoClear = originalAutoClear;
            renderer.setClearColor(this.originalClearColor);
            renderer.setClearAlpha(originalClearAlpha);
        },
        setSize: function (width, height) {
            this.beautyRenderTarget.setSize(width, height);
            this.saoRenderTarget.setSize(width, height);
            this.blurIntermediateRenderTarget.setSize(width, height);
            this.normalRenderTarget.setSize(width, height);
            this.depthRenderTarget.setSize(width, height);
            this.saoMaterial.uniforms['size'].value.set(width, height);
            this.saoMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);
            this.saoMaterial.uniforms['cameraProjectionMatrix'].value = this.camera.projectionMatrix;
            this.saoMaterial.needsUpdate = true;
            this.vBlurMaterial.uniforms['size'].value.set(width, height);
            this.vBlurMaterial.needsUpdate = true;
            this.hBlurMaterial.uniforms['size'].value.set(width, height);
            this.hBlurMaterial.needsUpdate = true;
        }
    });
    return SAOPass;
});