define([
    "skylark-threejs",
    "../threex",
    './Pass',
    '../shaders/CopyShader'
], function (
    THREE,
    threex, 
    Pass, 
    CopyShader
) {
    'use strict';
    var OutlinePass = function (resolution, scene, camera, selectedObjects) {
        this.renderScene = scene;
        this.renderCamera = camera;
        this.selectedObjects = selectedObjects !== undefined ? selectedObjects : [];
        this.visibleEdgeColor = new THREE.Color(1, 1, 1);
        this.hiddenEdgeColor = new THREE.Color(0.1, 0.04, 0.02);
        this.edgeGlow = 0;
        this.usePatternTexture = false;
        this.edgeThickness = 1;
        this.edgeStrength = 3;
        this.downSampleRatio = 2;
        this.pulsePeriod = 0;
        Pass.call(this);
        this.resolution = resolution !== undefined ? new THREE.Vector2(resolution.x, resolution.y) : new THREE.Vector2(256, 256);
        var pars = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        };
        var resx = Math.round(this.resolution.x / this.downSampleRatio);
        var resy = Math.round(this.resolution.y / this.downSampleRatio);
        this.maskBufferMaterial = new THREE.MeshBasicMaterial({ color: 16777215 });
        this.maskBufferMaterial.side = THREE.DoubleSide;
        this.renderTargetMaskBuffer = new THREE.WebGLRenderTarget(this.resolution.x, this.resolution.y, pars);
        this.renderTargetMaskBuffer.texture.name = 'OutlinePass.mask';
        this.renderTargetMaskBuffer.texture.generateMipmaps = false;
        this.depthMaterial = new THREE.MeshDepthMaterial();
        this.depthMaterial.side = THREE.DoubleSide;
        this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
        this.depthMaterial.blending = THREE.NoBlending;
        this.prepareMaskMaterial = this.getPrepareMaskMaterial();
        this.prepareMaskMaterial.side = THREE.DoubleSide;
        this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ(this.prepareMaskMaterial.fragmentShader, this.renderCamera);
        this.renderTargetDepthBuffer = new THREE.WebGLRenderTarget(this.resolution.x, this.resolution.y, pars);
        this.renderTargetDepthBuffer.texture.name = 'OutlinePass.depth';
        this.renderTargetDepthBuffer.texture.generateMipmaps = false;
        this.renderTargetMaskDownSampleBuffer = new THREE.WebGLRenderTarget(resx, resy, pars);
        this.renderTargetMaskDownSampleBuffer.texture.name = 'OutlinePass.depthDownSample';
        this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;
        this.renderTargetBlurBuffer1 = new THREE.WebGLRenderTarget(resx, resy, pars);
        this.renderTargetBlurBuffer1.texture.name = 'OutlinePass.blur1';
        this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
        this.renderTargetBlurBuffer2 = new THREE.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), pars);
        this.renderTargetBlurBuffer2.texture.name = 'OutlinePass.blur2';
        this.renderTargetBlurBuffer2.texture.generateMipmaps = false;
        this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
        this.renderTargetEdgeBuffer1 = new THREE.WebGLRenderTarget(resx, resy, pars);
        this.renderTargetEdgeBuffer1.texture.name = 'OutlinePass.edge1';
        this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
        this.renderTargetEdgeBuffer2 = new THREE.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), pars);
        this.renderTargetEdgeBuffer2.texture.name = 'OutlinePass.edge2';
        this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;
        var MAX_EDGE_THICKNESS = 4;
        var MAX_EDGE_GLOW = 4;
        this.separableBlurMaterial1 = this.getSeperableBlurMaterial(MAX_EDGE_THICKNESS);
        this.separableBlurMaterial1.uniforms['texSize'].value.set(resx, resy);
        this.separableBlurMaterial1.uniforms['kernelRadius'].value = 1;
        this.separableBlurMaterial2 = this.getSeperableBlurMaterial(MAX_EDGE_GLOW);
        this.separableBlurMaterial2.uniforms['texSize'].value.set(Math.round(resx / 2), Math.round(resy / 2));
        this.separableBlurMaterial2.uniforms['kernelRadius'].value = MAX_EDGE_GLOW;
        this.overlayMaterial = this.getOverlayMaterial();
        if (CopyShader === undefined)
            console.error('OutlinePass relies on CopyShader');
        var copyShader = CopyShader;
        this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
        this.copyUniforms['opacity'].value = 1;
        this.materialCopy = new THREE.ShaderMaterial({
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: THREE.NoBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true
        });
        this.enabled = true;
        this.needsSwap = false;
        this.oldClearColor = new THREE.Color();
        this.oldClearAlpha = 1;
        this.fsQuad = new Pass.FullScreenQuad(null);
        this.tempPulseColor1 = new THREE.Color();
        this.tempPulseColor2 = new THREE.Color();
        this.textureMatrix = new THREE.Matrix4();
        function replaceDepthToViewZ(string, camera) {
            var type = camera.isPerspectiveCamera ? 'perspective' : 'orthographic';
            return string.replace(/DEPTH_TO_VIEW_Z/g, type + 'DepthToViewZ');
        }
    };
    OutlinePass.prototype = Object.assign(Object.create(Pass.prototype), {
        constructor: OutlinePass,
        dispose: function () {
            this.renderTargetMaskBuffer.dispose();
            this.renderTargetDepthBuffer.dispose();
            this.renderTargetMaskDownSampleBuffer.dispose();
            this.renderTargetBlurBuffer1.dispose();
            this.renderTargetBlurBuffer2.dispose();
            this.renderTargetEdgeBuffer1.dispose();
            this.renderTargetEdgeBuffer2.dispose();
        },
        setSize: function (width, height) {
            this.renderTargetMaskBuffer.setSize(width, height);
            var resx = Math.round(width / this.downSampleRatio);
            var resy = Math.round(height / this.downSampleRatio);
            this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
            this.renderTargetBlurBuffer1.setSize(resx, resy);
            this.renderTargetEdgeBuffer1.setSize(resx, resy);
            this.separableBlurMaterial1.uniforms['texSize'].value.set(resx, resy);
            resx = Math.round(resx / 2);
            resy = Math.round(resy / 2);
            this.renderTargetBlurBuffer2.setSize(resx, resy);
            this.renderTargetEdgeBuffer2.setSize(resx, resy);
            this.separableBlurMaterial2.uniforms['texSize'].value.set(resx, resy);
        },
        changeVisibilityOfSelectedObjects: function (bVisible) {
            function gatherSelectedMeshesCallBack(object) {
                if (object.isMesh) {
                    if (bVisible) {
                        object.visible = object.userData.oldVisible;
                        delete object.userData.oldVisible;
                    } else {
                        object.userData.oldVisible = object.visible;
                        object.visible = bVisible;
                    }
                }
            }
            for (var i = 0; i < this.selectedObjects.length; i++) {
                var selectedObject = this.selectedObjects[i];
                selectedObject.traverse(gatherSelectedMeshesCallBack);
            }
        },
        changeVisibilityOfNonSelectedObjects: function (bVisible) {
            var selectedMeshes = [];
            function gatherSelectedMeshesCallBack(object) {
                if (object.isMesh)
                    selectedMeshes.push(object);
            }
            for (var i = 0; i < this.selectedObjects.length; i++) {
                var selectedObject = this.selectedObjects[i];
                selectedObject.traverse(gatherSelectedMeshesCallBack);
            }
            function VisibilityChangeCallBack(object) {
                if (object.isMesh || object.isLine || object.isSprite) {
                    var bFound = false;
                    for (var i = 0; i < selectedMeshes.length; i++) {
                        var selectedObjectId = selectedMeshes[i].id;
                        if (selectedObjectId === object.id) {
                            bFound = true;
                            break;
                        }
                    }
                    if (!bFound) {
                        var visibility = object.visible;
                        if (!bVisible || object.bVisible)
                            object.visible = bVisible;
                        object.bVisible = visibility;
                    }
                }
            }
            this.renderScene.traverse(VisibilityChangeCallBack);
        },
        updateTextureMatrix: function () {
            this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
            this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
            this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
        },
        render: function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
            if (this.selectedObjects.length > 0) {
                this.oldClearColor.copy(renderer.getClearColor());
                this.oldClearAlpha = renderer.getClearAlpha();
                var oldAutoClear = renderer.autoClear;
                renderer.autoClear = false;
                if (maskActive)
                    renderer.state.buffers.stencil.setTest(false);
                renderer.setClearColor(16777215, 1);
                this.changeVisibilityOfSelectedObjects(false);
                var currentBackground = this.renderScene.background;
                this.renderScene.background = null;
                this.renderScene.overrideMaterial = this.depthMaterial;
                renderer.setRenderTarget(this.renderTargetDepthBuffer);
                renderer.clear();
                renderer.render(this.renderScene, this.renderCamera);
                this.changeVisibilityOfSelectedObjects(true);
                this.updateTextureMatrix();
                this.changeVisibilityOfNonSelectedObjects(false);
                this.renderScene.overrideMaterial = this.prepareMaskMaterial;
                this.prepareMaskMaterial.uniforms['cameraNearFar'].value.set(this.renderCamera.near, this.renderCamera.far);
                this.prepareMaskMaterial.uniforms['depthTexture'].value = this.renderTargetDepthBuffer.texture;
                this.prepareMaskMaterial.uniforms['textureMatrix'].value = this.textureMatrix;
                renderer.setRenderTarget(this.renderTargetMaskBuffer);
                renderer.clear();
                renderer.render(this.renderScene, this.renderCamera);
                this.renderScene.overrideMaterial = null;
                this.changeVisibilityOfNonSelectedObjects(true);
                this.renderScene.background = currentBackground;
                this.fsQuad.material = this.materialCopy;
                this.copyUniforms['tDiffuse'].value = this.renderTargetMaskBuffer.texture;
                renderer.setRenderTarget(this.renderTargetMaskDownSampleBuffer);
                renderer.clear();
                this.fsQuad.render(renderer);
                this.tempPulseColor1.copy(this.visibleEdgeColor);
                this.tempPulseColor2.copy(this.hiddenEdgeColor);
                if (this.pulsePeriod > 0) {
                    var scalar = (1 + 0.25) / 2 + Math.cos(performance.now() * 0.01 / this.pulsePeriod) * (1 - 0.25) / 2;
                    this.tempPulseColor1.multiplyScalar(scalar);
                    this.tempPulseColor2.multiplyScalar(scalar);
                }
                this.fsQuad.material = this.edgeDetectionMaterial;
                this.edgeDetectionMaterial.uniforms['maskTexture'].value = this.renderTargetMaskDownSampleBuffer.texture;
                this.edgeDetectionMaterial.uniforms['texSize'].value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height);
                this.edgeDetectionMaterial.uniforms['visibleEdgeColor'].value = this.tempPulseColor1;
                this.edgeDetectionMaterial.uniforms['hiddenEdgeColor'].value = this.tempPulseColor2;
                renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
                renderer.clear();
                this.fsQuad.render(renderer);
                this.fsQuad.material = this.separableBlurMaterial1;
                this.separableBlurMaterial1.uniforms['colorTexture'].value = this.renderTargetEdgeBuffer1.texture;
                this.separableBlurMaterial1.uniforms['direction'].value = OutlinePass.BlurDirectionX;
                this.separableBlurMaterial1.uniforms['kernelRadius'].value = this.edgeThickness;
                renderer.setRenderTarget(this.renderTargetBlurBuffer1);
                renderer.clear();
                this.fsQuad.render(renderer);
                this.separableBlurMaterial1.uniforms['colorTexture'].value = this.renderTargetBlurBuffer1.texture;
                this.separableBlurMaterial1.uniforms['direction'].value = OutlinePass.BlurDirectionY;
                renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
                renderer.clear();
                this.fsQuad.render(renderer);
                this.fsQuad.material = this.separableBlurMaterial2;
                this.separableBlurMaterial2.uniforms['colorTexture'].value = this.renderTargetEdgeBuffer1.texture;
                this.separableBlurMaterial2.uniforms['direction'].value = OutlinePass.BlurDirectionX;
                renderer.setRenderTarget(this.renderTargetBlurBuffer2);
                renderer.clear();
                this.fsQuad.render(renderer);
                this.separableBlurMaterial2.uniforms['colorTexture'].value = this.renderTargetBlurBuffer2.texture;
                this.separableBlurMaterial2.uniforms['direction'].value = OutlinePass.BlurDirectionY;
                renderer.setRenderTarget(this.renderTargetEdgeBuffer2);
                renderer.clear();
                this.fsQuad.render(renderer);
                this.fsQuad.material = this.overlayMaterial;
                this.overlayMaterial.uniforms['maskTexture'].value = this.renderTargetMaskBuffer.texture;
                this.overlayMaterial.uniforms['edgeTexture1'].value = this.renderTargetEdgeBuffer1.texture;
                this.overlayMaterial.uniforms['edgeTexture2'].value = this.renderTargetEdgeBuffer2.texture;
                this.overlayMaterial.uniforms['patternTexture'].value = this.patternTexture;
                this.overlayMaterial.uniforms['edgeStrength'].value = this.edgeStrength;
                this.overlayMaterial.uniforms['edgeGlow'].value = this.edgeGlow;
                this.overlayMaterial.uniforms['usePatternTexture'].value = this.usePatternTexture;
                if (maskActive)
                    renderer.state.buffers.stencil.setTest(true);
                renderer.setRenderTarget(readBuffer);
                this.fsQuad.render(renderer);
                renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
                renderer.autoClear = oldAutoClear;
            }
            if (this.renderToScreen) {
                this.fsQuad.material = this.materialCopy;
                this.copyUniforms['tDiffuse'].value = readBuffer.texture;
                renderer.setRenderTarget(null);
                this.fsQuad.render(renderer);
            }
        },
        getPrepareMaskMaterial: function () {
            return new THREE.ShaderMaterial({
                uniforms: {
                    'depthTexture': { value: null },
                    'cameraNearFar': { value: new THREE.Vector2(0.5, 0.5) },
                    'textureMatrix': { value: null }
                },
                vertexShader: [
                    '#include <morphtarget_pars_vertex>',
                    '#include <skinning_pars_vertex>',
                    'varying vec4 projTexCoord;',
                    'varying vec4 vPosition;',
                    'uniform mat4 textureMatrix;',
                    'void main() {',
                    '\t#include <skinbase_vertex>',
                    '\t#include <begin_vertex>',
                    '\t#include <morphtarget_vertex>',
                    '\t#include <skinning_vertex>',
                    '\t#include <project_vertex>',
                    '\tvPosition = mvPosition;',
                    '\tvec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
                    '\tprojTexCoord = textureMatrix * worldPosition;',
                    '}'
                ].join('\n'),
                fragmentShader: [
                    '#include <packing>',
                    'varying vec4 vPosition;',
                    'varying vec4 projTexCoord;',
                    'uniform sampler2D depthTexture;',
                    'uniform vec2 cameraNearFar;',
                    'void main() {',
                    '\tfloat depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));',
                    '\tfloat viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );',
                    '\tfloat depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;',
                    '\tgl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);',
                    '}'
                ].join('\n')
            });
        },
        getEdgeDetectionMaterial: function () {
            return new THREE.ShaderMaterial({
                uniforms: {
                    'maskTexture': { value: null },
                    'texSize': { value: new THREE.Vector2(0.5, 0.5) },
                    'visibleEdgeColor': { value: new THREE.Vector3(1, 1, 1) },
                    'hiddenEdgeColor': { value: new THREE.Vector3(1, 1, 1) }
                },
                vertexShader: 'varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}',
                fragmentShader: 'varying vec2 vUv;\t\t\t\tuniform sampler2D maskTexture;\t\t\t\tuniform vec2 texSize;\t\t\t\tuniform vec3 visibleEdgeColor;\t\t\t\tuniform vec3 hiddenEdgeColor;\t\t\t\t\t\t\t\tvoid main() {\n\t\t\t\t\tvec2 invSize = 1.0 / texSize;\t\t\t\t\tvec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);\t\t\t\t\tvec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);\t\t\t\t\tvec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);\t\t\t\t\tvec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);\t\t\t\t\tvec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);\t\t\t\t\tfloat diff1 = (c1.r - c2.r)*0.5;\t\t\t\t\tfloat diff2 = (c3.r - c4.r)*0.5;\t\t\t\t\tfloat d = length( vec2(diff1, diff2) );\t\t\t\t\tfloat a1 = min(c1.g, c2.g);\t\t\t\t\tfloat a2 = min(c3.g, c4.g);\t\t\t\t\tfloat visibilityFactor = min(a1, a2);\t\t\t\t\tvec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;\t\t\t\t\tgl_FragColor = vec4(edgeColor, 1.0) * vec4(d);\t\t\t\t}'
            });
        },
        getSeperableBlurMaterial: function (maxRadius) {
            return new THREE.ShaderMaterial({
                defines: { 'MAX_RADIUS': maxRadius },
                uniforms: {
                    'colorTexture': { value: null },
                    'texSize': { value: new THREE.Vector2(0.5, 0.5) },
                    'direction': { value: new THREE.Vector2(0.5, 0.5) },
                    'kernelRadius': { value: 1 }
                },
                vertexShader: 'varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}',
                fragmentShader: '#include <common>\t\t\t\tvarying vec2 vUv;\t\t\t\tuniform sampler2D colorTexture;\t\t\t\tuniform vec2 texSize;\t\t\t\tuniform vec2 direction;\t\t\t\tuniform float kernelRadius;\t\t\t\t\t\t\t\tfloat gaussianPdf(in float x, in float sigma) {\t\t\t\t\treturn 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\t\t\t\t}\t\t\t\tvoid main() {\t\t\t\t\tvec2 invSize = 1.0 / texSize;\t\t\t\t\tfloat weightSum = gaussianPdf(0.0, kernelRadius);\t\t\t\t\tvec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;\t\t\t\t\tvec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\t\t\t\t\tvec2 uvOffset = delta;\t\t\t\t\tfor( int i = 1; i <= MAX_RADIUS; i ++ ) {\t\t\t\t\t\tfloat w = gaussianPdf(uvOffset.x, kernelRadius);\t\t\t\t\t\tvec4 sample1 = texture2D( colorTexture, vUv + uvOffset);\t\t\t\t\t\tvec4 sample2 = texture2D( colorTexture, vUv - uvOffset);\t\t\t\t\t\tdiffuseSum += ((sample1 + sample2) * w);\t\t\t\t\t\tweightSum += (2.0 * w);\t\t\t\t\t\tuvOffset += delta;\t\t\t\t\t}\t\t\t\t\tgl_FragColor = diffuseSum/weightSum;\t\t\t\t}'
            });
        },
        getOverlayMaterial: function () {
            return new THREE.ShaderMaterial({
                uniforms: {
                    'maskTexture': { value: null },
                    'edgeTexture1': { value: null },
                    'edgeTexture2': { value: null },
                    'patternTexture': { value: null },
                    'edgeStrength': { value: 1 },
                    'edgeGlow': { value: 1 },
                    'usePatternTexture': { value: 0 }
                },
                vertexShader: 'varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}',
                fragmentShader: 'varying vec2 vUv;\t\t\t\tuniform sampler2D maskTexture;\t\t\t\tuniform sampler2D edgeTexture1;\t\t\t\tuniform sampler2D edgeTexture2;\t\t\t\tuniform sampler2D patternTexture;\t\t\t\tuniform float edgeStrength;\t\t\t\tuniform float edgeGlow;\t\t\t\tuniform bool usePatternTexture;\t\t\t\t\t\t\t\tvoid main() {\t\t\t\t\tvec4 edgeValue1 = texture2D(edgeTexture1, vUv);\t\t\t\t\tvec4 edgeValue2 = texture2D(edgeTexture2, vUv);\t\t\t\t\tvec4 maskColor = texture2D(maskTexture, vUv);\t\t\t\t\tvec4 patternColor = texture2D(patternTexture, 6.0 * vUv);\t\t\t\t\tfloat visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;\t\t\t\t\tvec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;\t\t\t\t\tvec4 finalColor = edgeStrength * maskColor.r * edgeValue;\t\t\t\t\tif(usePatternTexture)\t\t\t\t\t\tfinalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);\t\t\t\t\tgl_FragColor = finalColor;\t\t\t\t}',
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
                transparent: true
            });
        }
    });
    OutlinePass.BlurDirectionX = new THREE.Vector2(1, 0);
    OutlinePass.BlurDirectionY = new THREE.Vector2(0, 1);

    return threex.postprocessing.OutlinePass = OutlinePass;
});