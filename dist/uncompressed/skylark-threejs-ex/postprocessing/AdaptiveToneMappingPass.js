define([
    "skylark-threejs",
    "../threex",
    '../postprocessing/Pass',
    '../shaders/CopyShader',
    '../shaders/LuminosityShader',
    '../shaders/ToneMapShader'
], function (
    THREE, 
    threex,
    Pass, 
    CopyShader, 
    LuminosityShader, 
    ToneMapShader
) {
    'use strict';
    var AdaptiveToneMappingPass = function (adaptive, resolution) {
        Pass.call(this);
        this.resolution = resolution !== undefined ? resolution : 256;
        this.needsInit = true;
        this.adaptive = adaptive !== undefined ? !!adaptive : true;
        this.luminanceRT = null;
        this.previousLuminanceRT = null;
        this.currentLuminanceRT = null;
        if (CopyShader === undefined)
            console.error('AdaptiveToneMappingPass relies on CopyShader');
        var copyShader = CopyShader;
        this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
        this.materialCopy = new THREE.ShaderMaterial({
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: THREE.NoBlending,
            depthTest: false
        });
        if (LuminosityShader === undefined)
            console.error('AdaptiveToneMappingPass relies on LuminosityShader');
        this.materialLuminance = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(LuminosityShader.uniforms),
            vertexShader: LuminosityShader.vertexShader,
            fragmentShader: LuminosityShader.fragmentShader,
            blending: THREE.NoBlending
        });
        this.adaptLuminanceShader = {
            defines: { 'MIP_LEVEL_1X1': (Math.log(this.resolution) / Math.log(2)).toFixed(1) },
            uniforms: {
                'lastLum': { value: null },
                'currentLum': { value: null },
                'minLuminance': { value: 0.01 },
                'delta': { value: 0.016 },
                'tau': { value: 1 }
            },
            vertexShader: [
                'varying vec2 vUv;',
                'void main() {',
                '\tvUv = uv;',
                '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec2 vUv;',
                'uniform sampler2D lastLum;',
                'uniform sampler2D currentLum;',
                'uniform float minLuminance;',
                'uniform float delta;',
                'uniform float tau;',
                'void main() {',
                '\tvec4 lastLum = texture2D( lastLum, vUv, MIP_LEVEL_1X1 );',
                '\tvec4 currentLum = texture2D( currentLum, vUv, MIP_LEVEL_1X1 );',
                '\tfloat fLastLum = max( minLuminance, lastLum.r );',
                '\tfloat fCurrentLum = max( minLuminance, currentLum.r );',
                '\tfCurrentLum *= fCurrentLum;',
                '\tfloat fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));',
                '\tgl_FragColor.r = fAdaptedLum;',
                '}'
            ].join('\n')
        };
        this.materialAdaptiveLum = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(this.adaptLuminanceShader.uniforms),
            vertexShader: this.adaptLuminanceShader.vertexShader,
            fragmentShader: this.adaptLuminanceShader.fragmentShader,
            defines: Object.assign({}, this.adaptLuminanceShader.defines),
            blending: THREE.NoBlending
        });
        if (ToneMapShader === undefined)
            console.error('AdaptiveToneMappingPass relies on ToneMapShader');
        this.materialToneMap = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(ToneMapShader.uniforms),
            vertexShader: ToneMapShader.vertexShader,
            fragmentShader: ToneMapShader.fragmentShader,
            blending: THREE.NoBlending
        });
        this.fsQuad = new Pass.FullScreenQuad(null);
    };
    AdaptiveToneMappingPass.prototype = Object.assign(Object.create(Pass.prototype), {
        constructor: AdaptiveToneMappingPass,
        render: function (renderer, writeBuffer, readBuffer, deltaTime) {
            if (this.needsInit) {
                this.reset(renderer);
                this.luminanceRT.texture.type = readBuffer.texture.type;
                this.previousLuminanceRT.texture.type = readBuffer.texture.type;
                this.currentLuminanceRT.texture.type = readBuffer.texture.type;
                this.needsInit = false;
            }
            if (this.adaptive) {
                this.fsQuad.material = this.materialLuminance;
                this.materialLuminance.uniforms.tDiffuse.value = readBuffer.texture;
                renderer.setRenderTarget(this.currentLuminanceRT);
                this.fsQuad.render(renderer);
                this.fsQuad.material = this.materialAdaptiveLum;
                this.materialAdaptiveLum.uniforms.delta.value = deltaTime;
                this.materialAdaptiveLum.uniforms.lastLum.value = this.previousLuminanceRT.texture;
                this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRT.texture;
                renderer.setRenderTarget(this.luminanceRT);
                this.fsQuad.render(renderer);
                this.fsQuad.material = this.materialCopy;
                this.copyUniforms.tDiffuse.value = this.luminanceRT.texture;
                renderer.setRenderTarget(this.previousLuminanceRT);
                this.fsQuad.render(renderer);
            }
            this.fsQuad.material = this.materialToneMap;
            this.materialToneMap.uniforms.tDiffuse.value = readBuffer.texture;
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
        reset: function () {
            if (this.luminanceRT) {
                this.luminanceRT.dispose();
            }
            if (this.currentLuminanceRT) {
                this.currentLuminanceRT.dispose();
            }
            if (this.previousLuminanceRT) {
                this.previousLuminanceRT.dispose();
            }
            var pars = {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            };
            this.luminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);
            this.luminanceRT.texture.name = 'AdaptiveToneMappingPass.l';
            this.luminanceRT.texture.generateMipmaps = false;
            this.previousLuminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);
            this.previousLuminanceRT.texture.name = 'AdaptiveToneMappingPass.pl';
            this.previousLuminanceRT.texture.generateMipmaps = false;
            pars.minFilter = THREE.LinearMipmapLinearFilter;
            pars.generateMipmaps = true;
            this.currentLuminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);
            this.currentLuminanceRT.texture.name = 'AdaptiveToneMappingPass.cl';
            if (this.adaptive) {
                this.materialToneMap.defines['ADAPTED_LUMINANCE'] = '';
                this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;
            }
            this.fsQuad.material = new THREE.MeshBasicMaterial({ color: 7829367 });
            this.materialLuminance.needsUpdate = true;
            this.materialAdaptiveLum.needsUpdate = true;
            this.materialToneMap.needsUpdate = true;
        },
        setAdaptive: function (adaptive) {
            if (adaptive) {
                this.adaptive = true;
                this.materialToneMap.defines['ADAPTED_LUMINANCE'] = '';
                this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;
            } else {
                this.adaptive = false;
                delete this.materialToneMap.defines['ADAPTED_LUMINANCE'];
                this.materialToneMap.uniforms.luminanceMap.value = null;
            }
            this.materialToneMap.needsUpdate = true;
        },
        setAdaptionRate: function (rate) {
            if (rate) {
                this.materialAdaptiveLum.uniforms.tau.value = Math.abs(rate);
            }
        },
        setMinLuminance: function (minLum) {
            if (minLum) {
                this.materialToneMap.uniforms.minLuminance.value = minLum;
                this.materialAdaptiveLum.uniforms.minLuminance.value = minLum;
            }
        },
        setMaxLuminance: function (maxLum) {
            if (maxLum) {
                this.materialToneMap.uniforms.maxLuminance.value = maxLum;
            }
        },
        setAverageLuminance: function (avgLum) {
            if (avgLum) {
                this.materialToneMap.uniforms.averageLuminance.value = avgLum;
            }
        },
        setMiddleGrey: function (middleGrey) {
            if (middleGrey) {
                this.materialToneMap.uniforms.middleGrey.value = middleGrey;
            }
        },
        dispose: function () {
            if (this.luminanceRT) {
                this.luminanceRT.dispose();
            }
            if (this.previousLuminanceRT) {
                this.previousLuminanceRT.dispose();
            }
            if (this.currentLuminanceRT) {
                this.currentLuminanceRT.dispose();
            }
            if (this.materialLuminance) {
                this.materialLuminance.dispose();
            }
            if (this.materialAdaptiveLum) {
                this.materialAdaptiveLum.dispose();
            }
            if (this.materialCopy) {
                this.materialCopy.dispose();
            }
            if (this.materialToneMap) {
                this.materialToneMap.dispose();
            }
        }
    });
    return threex.postprocessing.AdaptiveToneMappingPass = AdaptiveToneMappingPass;
});