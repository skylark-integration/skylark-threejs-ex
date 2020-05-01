/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../shaders/BokehShader","./Pass"],function(e,r,a){return e.BokehPass=function(r,a,t){e.Pass.call(this),this.scene=r,this.camera=a;var s=void 0!==t.focus?t.focus:1,i=void 0!==t.aspect?t.aspect:a.aspect,h=void 0!==t.aperture?t.aperture:.025,l=void 0!==t.maxblur?t.maxblur:1,n=t.width||window.innerWidth||1,o=t.height||window.innerHeight||1;this.renderTargetDepth=new e.WebGLRenderTarget(n,o,{minFilter:e.NearestFilter,magFilter:e.NearestFilter,stencilBuffer:!1}),this.renderTargetDepth.texture.name="BokehPass.depth",this.materialDepth=new e.MeshDepthMaterial,this.materialDepth.depthPacking=e.RGBADepthPacking,this.materialDepth.blending=e.NoBlending,void 0===e.BokehShader&&console.error("THREE.BokehPass relies on THREE.BokehShader");var d=e.BokehShader,u=e.UniformsUtils.clone(d.uniforms);u.tDepth.value=this.renderTargetDepth.texture,u.focus.value=s,u.aspect.value=i,u.aperture.value=h,u.maxblur.value=l,u.nearClip.value=a.near,u.farClip.value=a.far,this.materialBokeh=new e.ShaderMaterial({defines:Object.assign({},d.defines),uniforms:u,vertexShader:d.vertexShader,fragmentShader:d.fragmentShader}),this.uniforms=u,this.needsSwap=!1,this.fsQuad=new e.Pass.FullScreenQuad(this.materialBokeh),this.oldClearColor=new e.Color},e.BokehPass.prototype=Object.assign(Object.create(e.Pass.prototype),{constructor:e.BokehPass,render:function(e,r,a){this.scene.overrideMaterial=this.materialDepth,this.oldClearColor.copy(e.getClearColor());var t=e.getClearAlpha(),s=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this.renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=a.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),e.clear(),this.fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this.oldClearColor),e.setClearAlpha(t),e.autoClear=s}}),e.BokehPass});
//# sourceMappingURL=../sourcemaps/postprocessing/BokehPass.js.map
