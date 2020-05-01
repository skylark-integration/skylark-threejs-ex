/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../math/SimplexNoise","../shaders/SSAOShader","../shaders/SSAOShader","../shaders/SSAOShader","../shaders/CopyShader","./Pass"],function(e){return e.SSAOPass=function(r,a,t,s){e.Pass.call(this),this.width=void 0!==t?t:512,this.height=void 0!==s?s:512,this.clear=!0,this.camera=a,this.scene=r,this.kernelRadius=8,this.kernelSize=32,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this.generateSampleKernel(),this.generateRandomKernelRotations();var i=new e.DepthTexture;i.type=e.UnsignedShortType,i.minFilter=e.NearestFilter,i.maxFilter=e.NearestFilter,this.beautyRenderTarget=new e.WebGLRenderTarget(this.width,this.height,{minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBAFormat,depthTexture:i,depthBuffer:!0}),this.normalRenderTarget=new e.WebGLRenderTarget(this.width,this.height,{minFilter:e.NearestFilter,magFilter:e.NearestFilter,format:e.RGBAFormat}),this.ssaoRenderTarget=new e.WebGLRenderTarget(this.width,this.height,{minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBAFormat}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),void 0===e.SSAOShader&&console.error("THREE.SSAOPass: The pass relies on THREE.SSAOShader."),this.ssaoMaterial=new e.ShaderMaterial({defines:Object.assign({},e.SSAOShader.defines),uniforms:e.UniformsUtils.clone(e.SSAOShader.uniforms),vertexShader:e.SSAOShader.vertexShader,fragmentShader:e.SSAOShader.fragmentShader,blending:e.NoBlending}),this.ssaoMaterial.uniforms.tDiffuse.value=this.beautyRenderTarget.texture,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.beautyRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.getInverse(this.camera.projectionMatrix),this.normalMaterial=new e.MeshNormalMaterial,this.normalMaterial.blending=e.NoBlending,this.blurMaterial=new e.ShaderMaterial({defines:Object.assign({},e.SSAOBlurShader.defines),uniforms:e.UniformsUtils.clone(e.SSAOBlurShader.uniforms),vertexShader:e.SSAOBlurShader.vertexShader,fragmentShader:e.SSAOBlurShader.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new e.ShaderMaterial({defines:Object.assign({},e.SSAODepthShader.defines),uniforms:e.UniformsUtils.clone(e.SSAODepthShader.uniforms),vertexShader:e.SSAODepthShader.vertexShader,fragmentShader:e.SSAODepthShader.fragmentShader,blending:e.NoBlending}),this.depthRenderMaterial.uniforms.tDepth.value=this.beautyRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new e.ShaderMaterial({uniforms:e.UniformsUtils.clone(e.CopyShader.uniforms),vertexShader:e.CopyShader.vertexShader,fragmentShader:e.CopyShader.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:e.DstColorFactor,blendDst:e.ZeroFactor,blendEquation:e.AddEquation,blendSrcAlpha:e.DstAlphaFactor,blendDstAlpha:e.ZeroFactor,blendEquationAlpha:e.AddEquation}),this.fsQuad=new e.Pass.FullScreenQuad(null),this.originalClearColor=new e.Color},e.SSAOPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.SSAOPass,dispose:function(){this.beautyRenderTarget.dispose(),this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()},render:function(r,a){switch(r.setRenderTarget(this.beautyRenderTarget),r.clear(),r.render(this.scene,this.camera),this.renderOverride(r,this.normalMaterial,this.normalRenderTarget,7829503,1),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this.renderPass(r,this.ssaoMaterial,this.ssaoRenderTarget),this.renderPass(r,this.blurMaterial,this.blurRenderTarget),this.output){case e.SSAOPass.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=e.NoBlending,this.renderPass(r,this.copyMaterial,this.renderToScreen?null:a);break;case e.SSAOPass.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=e.NoBlending,this.renderPass(r,this.copyMaterial,this.renderToScreen?null:a);break;case e.SSAOPass.OUTPUT.Beauty:this.copyMaterial.uniforms.tDiffuse.value=this.beautyRenderTarget.texture,this.copyMaterial.blending=e.NoBlending,this.renderPass(r,this.copyMaterial,this.renderToScreen?null:a);break;case e.SSAOPass.OUTPUT.Depth:this.renderPass(r,this.depthRenderMaterial,this.renderToScreen?null:a);break;case e.SSAOPass.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=e.NoBlending,this.renderPass(r,this.copyMaterial,this.renderToScreen?null:a);break;case e.SSAOPass.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.beautyRenderTarget.texture,this.copyMaterial.blending=e.NoBlending,this.renderPass(r,this.copyMaterial,this.renderToScreen?null:a),this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=e.CustomBlending,this.renderPass(r,this.copyMaterial,this.renderToScreen?null:a);break;default:console.warn("THREE.SSAOPass: Unknown output type.")}},renderPass:function(e,r,a,t,s){this.originalClearColor.copy(e.getClearColor());var i=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(a),e.autoClear=!1,void 0!==t&&null!==t&&(e.setClearColor(t),e.setClearAlpha(s||0),e.clear()),this.fsQuad.material=r,this.fsQuad.render(e),e.autoClear=n,e.setClearColor(this.originalClearColor),e.setClearAlpha(i)},renderOverride:function(e,r,a,t,s){this.originalClearColor.copy(e.getClearColor());var i=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(a),e.autoClear=!1,t=r.clearColor||t,s=r.clearAlpha||s,void 0!==t&&null!==t&&(e.setClearColor(t),e.setClearAlpha(s||0),e.clear()),this.scene.overrideMaterial=r,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this.originalClearColor),e.setClearAlpha(i)},setSize:function(e,r){this.width=e,this.height=r,this.beautyRenderTarget.setSize(e,r),this.ssaoRenderTarget.setSize(e,r),this.normalRenderTarget.setSize(e,r),this.blurRenderTarget.setSize(e,r),this.ssaoMaterial.uniforms.resolution.value.set(e,r),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.getInverse(this.camera.projectionMatrix),this.blurMaterial.uniforms.resolution.value.set(e,r)},generateSampleKernel:function(){for(var r=this.kernelSize,a=this.kernel,t=0;t<r;t++){var s=new e.Vector3;s.x=2*Math.random()-1,s.y=2*Math.random()-1,s.z=Math.random(),s.normalize();var i=t/r;i=e.MathUtils.lerp(.1,1,i*i),s.multiplyScalar(i),a.push(s)}},generateRandomKernelRotations:function(){void 0===e.SimplexNoise&&console.error("THREE.SSAOPass: The pass relies on THREE.SimplexNoise.");for(var r=new e.SimplexNoise,a=new Float32Array(64),t=0;t<16;t++){var s=4*t,i=2*Math.random()-1,n=2*Math.random()-1,l=r.noise3d(i,n,0);a[s]=l,a[s+1]=l,a[s+2]=l,a[s+3]=1}this.noiseTexture=new e.DataTexture(a,4,4,e.RGBAFormat,e.FloatType),this.noiseTexture.wrapS=e.RepeatWrapping,this.noiseTexture.wrapT=e.RepeatWrapping}}),e.SSAOPass.OUTPUT={Default:0,SSAO:1,Blur:2,Beauty:3,Depth:4,Normal:5},e.SSAOPass});
//# sourceMappingURL=../sourcemaps/postprocessing/SSAOPass.js.map