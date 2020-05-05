/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../postprocessing/Pass"],function(e,t){"use strict";var r=function(r,a,i){t.call(this),this.camera=r,this.needsSwap=!1,this.cubeShader=e.ShaderLib.cube,this.cubeMesh=new e.Mesh(new e.BoxBufferGeometry(10,10,10),new e.ShaderMaterial({uniforms:this.cubeShader.uniforms,vertexShader:this.cubeShader.vertexShader,fragmentShader:this.cubeShader.fragmentShader,depthTest:!1,depthWrite:!1,side:e.BackSide})),Object.defineProperty(this.cubeMesh.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),this.envMap=a,this.opacity=void 0!==i?i:1,this.cubeScene=new e.Scene,this.cubeCamera=new e.PerspectiveCamera,this.cubeScene.add(this.cubeMesh)};return r.prototype=Object.assign(Object.create(t.prototype),{constructor:r,render:function(e,t,r){var a=e.autoClear;e.autoClear=!1,this.cubeCamera.projectionMatrix.copy(this.camera.projectionMatrix),this.cubeCamera.quaternion.setFromRotationMatrix(this.camera.matrixWorld),this.cubeMesh.material.uniforms.envMap.value=this.envMap,this.cubeMesh.material.uniforms.opacity.value=this.opacity,this.cubeMesh.material.transparent=this.opacity<1,e.setRenderTarget(this.renderToScreen?null:r),this.clear&&e.clear(),e.render(this.cubeScene,this.cubeCamera),e.autoClear=a}}),r});
//# sourceMappingURL=../sourcemaps/postprocessing/CubeTexturePass.js.map
