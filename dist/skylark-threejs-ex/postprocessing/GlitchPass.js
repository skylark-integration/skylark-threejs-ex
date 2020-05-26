/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./Pass","../shaders/DigitalGlitch"],function(t,a,i,r){"use strict";var e=function(a){i.call(this),void 0===r&&console.error("GlitchPass relies on DigitalGlitch");var e=r;this.uniforms=t.UniformsUtils.clone(e.uniforms),void 0==a&&(a=64),this.uniforms.tDisp.value=this.generateHeightmap(a),this.material=new t.ShaderMaterial({uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new i.FullScreenQuad(this.material),this.goWild=!1,this.curF=0,this.generateTrigger()};return e.prototype=Object.assign(Object.create(i.prototype),{constructor:e,render:function(a,i,r){this.uniforms.tDiffuse.value=r.texture,this.uniforms.seed.value=Math.random(),this.uniforms.byp.value=0,this.curF%this.randX==0||1==this.goWild?(this.uniforms.amount.value=Math.random()/30,this.uniforms.angle.value=t.MathUtils.randFloat(-Math.PI,Math.PI),this.uniforms.seed_x.value=t.MathUtils.randFloat(-1,1),this.uniforms.seed_y.value=t.MathUtils.randFloat(-1,1),this.uniforms.distortion_x.value=t.MathUtils.randFloat(0,1),this.uniforms.distortion_y.value=t.MathUtils.randFloat(0,1),this.curF=0,this.generateTrigger()):this.curF%this.randX<this.randX/5?(this.uniforms.amount.value=Math.random()/90,this.uniforms.angle.value=t.MathUtils.randFloat(-Math.PI,Math.PI),this.uniforms.distortion_x.value=t.MathUtils.randFloat(0,1),this.uniforms.distortion_y.value=t.MathUtils.randFloat(0,1),this.uniforms.seed_x.value=t.MathUtils.randFloat(-.3,.3),this.uniforms.seed_y.value=t.MathUtils.randFloat(-.3,.3)):0==this.goWild&&(this.uniforms.byp.value=1),this.curF++,this.renderToScreen?(a.setRenderTarget(null),this.fsQuad.render(a)):(a.setRenderTarget(i),this.clear&&a.clear(),this.fsQuad.render(a))},generateTrigger:function(){this.randX=t.MathUtils.randInt(120,240)},generateHeightmap:function(a){for(var i=new Float32Array(a*a*3),r=a*a,e=0;e<r;e++){var s=t.MathUtils.randFloat(0,1);i[3*e+0]=s,i[3*e+1]=s,i[3*e+2]=s}return new t.DataTexture(i,a,a,t.RGBFormat,t.FloatType)}}),a.postprocessing.GlitchPass=e});
//# sourceMappingURL=../sourcemaps/postprocessing/GlitchPass.js.map
