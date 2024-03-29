define([
    "skylark-threejs",
    "../threex",
    './Pass',
    '../shaders/CopyShader',
    '../shaders/LuminosityHighPassShader'
], function (
    THREE, 
    threex,
    Pass, 
    CopyShader, 
    LuminosityHighPassShader
) {
    'use strict';
    var UnrealBloomPass = function (resolution, strength, radius, threshold) {
        Pass.call(this);
        this.strength = strength !== undefined ? strength : 1;
        this.radius = radius;
        this.threshold = threshold;
        this.resolution = resolution !== undefined ? new THREE.Vector2(resolution.x, resolution.y) : new THREE.Vector2(256, 256);
        this.clearColor = new THREE.Color(0, 0, 0);
        var pars = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        };
        this.renderTargetsHorizontal = [];
        this.renderTargetsVertical = [];
        this.nMips = 5;
        var resx = Math.round(this.resolution.x / 2);
        var resy = Math.round(this.resolution.y / 2);
        this.renderTargetBright = new THREE.WebGLRenderTarget(resx, resy, pars);
        this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
        this.renderTargetBright.texture.generateMipmaps = false;
        for (var i = 0; i < this.nMips; i++) {
            var renderTargetHorizonal = new THREE.WebGLRenderTarget(resx, resy, pars);
            renderTargetHorizonal.texture.name = 'UnrealBloomPass.h' + i;
            renderTargetHorizonal.texture.generateMipmaps = false;
            this.renderTargetsHorizontal.push(renderTargetHorizonal);
            var renderTargetVertical = new THREE.WebGLRenderTarget(resx, resy, pars);
            renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i;
            renderTargetVertical.texture.generateMipmaps = false;
            this.renderTargetsVertical.push(renderTargetVertical);
            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
        }
        if (LuminosityHighPassShader === undefined)
            console.error('UnrealBloomPass relies on LuminosityHighPassShader');
        var highPassShader = LuminosityHighPassShader;
        this.highPassUniforms = THREE.UniformsUtils.clone(highPassShader.uniforms);
        this.highPassUniforms['luminosityThreshold'].value = threshold;
        this.highPassUniforms['smoothWidth'].value = 0.01;
        this.materialHighPassFilter = new THREE.ShaderMaterial({
            uniforms: this.highPassUniforms,
            vertexShader: highPassShader.vertexShader,
            fragmentShader: highPassShader.fragmentShader,
            defines: {}
        });
        this.separableBlurMaterials = [];
        var kernelSizeArray = [
            3,
            5,
            7,
            9,
            11
        ];
        var resx = Math.round(this.resolution.x / 2);
        var resy = Math.round(this.resolution.y / 2);
        for (var i = 0; i < this.nMips; i++) {
            this.separableBlurMaterials.push(this.getSeperableBlurMaterial(kernelSizeArray[i]));
            this.separableBlurMaterials[i].uniforms['texSize'].value = new THREE.Vector2(resx, resy);
            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
        }
        this.compositeMaterial = this.getCompositeMaterial(this.nMips);
        this.compositeMaterial.uniforms['blurTexture1'].value = this.renderTargetsVertical[0].texture;
        this.compositeMaterial.uniforms['blurTexture2'].value = this.renderTargetsVertical[1].texture;
        this.compositeMaterial.uniforms['blurTexture3'].value = this.renderTargetsVertical[2].texture;
        this.compositeMaterial.uniforms['blurTexture4'].value = this.renderTargetsVertical[3].texture;
        this.compositeMaterial.uniforms['blurTexture5'].value = this.renderTargetsVertical[4].texture;
        this.compositeMaterial.uniforms['bloomStrength'].value = strength;
        this.compositeMaterial.uniforms['bloomRadius'].value = 0.1;
        this.compositeMaterial.needsUpdate = true;
        var bloomFactors = [
            1,
            0.8,
            0.6,
            0.4,
            0.2
        ];
        this.compositeMaterial.uniforms['bloomFactors'].value = bloomFactors;
        this.bloomTintColors = [
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1)
        ];
        this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;
        if (CopyShader === undefined) {
            console.error('UnrealBloomPass relies on CopyShader');
        }
        var copyShader = CopyShader;
        this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
        this.copyUniforms['opacity'].value = 1;
        this.materialCopy = new THREE.ShaderMaterial({
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true
        });
        this.enabled = true;
        this.needsSwap = false;
        this.oldClearColor = new THREE.Color();
        this.oldClearAlpha = 1;
        this.basic = new THREE.MeshBasicMaterial();
        this.fsQuad = new Pass.FullScreenQuad(null);
    };
    UnrealBloomPass.prototype = Object.assign(Object.create(Pass.prototype), {
        constructor: UnrealBloomPass,
        dispose: function () {
            for (var i = 0; i < this.renderTargetsHorizontal.length; i++) {
                this.renderTargetsHorizontal[i].dispose();
            }
            for (var i = 0; i < this.renderTargetsVertical.length; i++) {
                this.renderTargetsVertical[i].dispose();
            }
            this.renderTargetBright.dispose();
        },
        setSize: function (width, height) {
            var resx = Math.round(width / 2);
            var resy = Math.round(height / 2);
            this.renderTargetBright.setSize(resx, resy);
            for (var i = 0; i < this.nMips; i++) {
                this.renderTargetsHorizontal[i].setSize(resx, resy);
                this.renderTargetsVertical[i].setSize(resx, resy);
                this.separableBlurMaterials[i].uniforms['texSize'].value = new THREE.Vector2(resx, resy);
                resx = Math.round(resx / 2);
                resy = Math.round(resy / 2);
            }
        },
        render: function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
            this.oldClearColor.copy(renderer.getClearColor());
            this.oldClearAlpha = renderer.getClearAlpha();
            var oldAutoClear = renderer.autoClear;
            renderer.autoClear = false;
            renderer.setClearColor(this.clearColor, 0);
            if (maskActive)
                renderer.state.buffers.stencil.setTest(false);
            if (this.renderToScreen) {
                this.fsQuad.material = this.basic;
                this.basic.map = readBuffer.texture;
                renderer.setRenderTarget(null);
                renderer.clear();
                this.fsQuad.render(renderer);
            }
            this.highPassUniforms['tDiffuse'].value = readBuffer.texture;
            this.highPassUniforms['luminosityThreshold'].value = this.threshold;
            this.fsQuad.material = this.materialHighPassFilter;
            renderer.setRenderTarget(this.renderTargetBright);
            renderer.clear();
            this.fsQuad.render(renderer);
            var inputRenderTarget = this.renderTargetBright;
            for (var i = 0; i < this.nMips; i++) {
                this.fsQuad.material = this.separableBlurMaterials[i];
                this.separableBlurMaterials[i].uniforms['colorTexture'].value = inputRenderTarget.texture;
                this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionX;
                renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
                renderer.clear();
                this.fsQuad.render(renderer);
                this.separableBlurMaterials[i].uniforms['colorTexture'].value = this.renderTargetsHorizontal[i].texture;
                this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionY;
                renderer.setRenderTarget(this.renderTargetsVertical[i]);
                renderer.clear();
                this.fsQuad.render(renderer);
                inputRenderTarget = this.renderTargetsVertical[i];
            }
            this.fsQuad.material = this.compositeMaterial;
            this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
            this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;
            this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;
            renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
            renderer.clear();
            this.fsQuad.render(renderer);
            this.fsQuad.material = this.materialCopy;
            this.copyUniforms['tDiffuse'].value = this.renderTargetsHorizontal[0].texture;
            if (maskActive)
                renderer.state.buffers.stencil.setTest(true);
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.fsQuad.render(renderer);
            } else {
                renderer.setRenderTarget(readBuffer);
                this.fsQuad.render(renderer);
            }
            renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
            renderer.autoClear = oldAutoClear;
        },
        getSeperableBlurMaterial: function (kernelRadius) {
            return new THREE.ShaderMaterial({
                defines: {
                    'KERNEL_RADIUS': kernelRadius,
                    'SIGMA': kernelRadius
                },
                uniforms: {
                    'colorTexture': { value: null },
                    'texSize': { value: new THREE.Vector2(0.5, 0.5) },
                    'direction': { value: new THREE.Vector2(0.5, 0.5) }
                },
                vertexShader: 'varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}',
                fragmentShader: '#include <common>\t\t\t\tvarying vec2 vUv;\n\t\t\t\tuniform sampler2D colorTexture;\n\t\t\t\tuniform vec2 texSize;\t\t\t\tuniform vec2 direction;\t\t\t\t\t\t\t\tfloat gaussianPdf(in float x, in float sigma) {\t\t\t\t\treturn 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\t\t\t\t}\t\t\t\tvoid main() {\n\t\t\t\t\tvec2 invSize = 1.0 / texSize;\t\t\t\t\tfloat fSigma = float(SIGMA);\t\t\t\t\tfloat weightSum = gaussianPdf(0.0, fSigma);\t\t\t\t\tvec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\t\t\t\t\tfor( int i = 1; i < KERNEL_RADIUS; i ++ ) {\t\t\t\t\t\tfloat x = float(i);\t\t\t\t\t\tfloat w = gaussianPdf(x, fSigma);\t\t\t\t\t\tvec2 uvOffset = direction * invSize * x;\t\t\t\t\t\tvec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;\t\t\t\t\t\tvec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;\t\t\t\t\t\tdiffuseSum += (sample1 + sample2) * w;\t\t\t\t\t\tweightSum += 2.0 * w;\t\t\t\t\t}\t\t\t\t\tgl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\t\t\t\t}'
            });
        },
        getCompositeMaterial: function (nMips) {
            return new THREE.ShaderMaterial({
                defines: { 'NUM_MIPS': nMips },
                uniforms: {
                    'blurTexture1': { value: null },
                    'blurTexture2': { value: null },
                    'blurTexture3': { value: null },
                    'blurTexture4': { value: null },
                    'blurTexture5': { value: null },
                    'dirtTexture': { value: null },
                    'bloomStrength': { value: 1 },
                    'bloomFactors': { value: null },
                    'bloomTintColors': { value: null },
                    'bloomRadius': { value: 0 }
                },
                vertexShader: 'varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}',
                fragmentShader: 'varying vec2 vUv;\t\t\t\tuniform sampler2D blurTexture1;\t\t\t\tuniform sampler2D blurTexture2;\t\t\t\tuniform sampler2D blurTexture3;\t\t\t\tuniform sampler2D blurTexture4;\t\t\t\tuniform sampler2D blurTexture5;\t\t\t\tuniform sampler2D dirtTexture;\t\t\t\tuniform float bloomStrength;\t\t\t\tuniform float bloomRadius;\t\t\t\tuniform float bloomFactors[NUM_MIPS];\t\t\t\tuniform vec3 bloomTintColors[NUM_MIPS];\t\t\t\t\t\t\t\tfloat lerpBloomFactor(const in float factor) { \t\t\t\t\tfloat mirrorFactor = 1.2 - factor;\t\t\t\t\treturn mix(factor, mirrorFactor, bloomRadius);\t\t\t\t}\t\t\t\t\t\t\t\tvoid main() {\t\t\t\t\tgl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + \t\t\t\t\t\t\t\t\t\t\t\t\t lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + \t\t\t\t\t\t\t\t\t\t\t\t\t lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + \t\t\t\t\t\t\t\t\t\t\t\t\t lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + \t\t\t\t\t\t\t\t\t\t\t\t\t lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );\t\t\t\t}'
            });
        }
    });
    UnrealBloomPass.BlurDirectionX = new THREE.Vector2(1, 0);
    UnrealBloomPass.BlurDirectionY = new THREE.Vector2(0, 1);

    return threex.postprocessing.UnrealBloomPass = UnrealBloomPass;
});