/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.Refractor=function(r,t){e.Mesh.call(this,r),this.type="Refractor";var a=this,o=void 0!==(t=t||{}).color?new e.Color(t.color):new e.Color(8355711),n=t.textureWidth||512,i=t.textureHeight||512,l=t.clipBias||0,s=t.shader||e.Refractor.RefractorShader,c=void 0!==t.encoding?t.encoding:e.LinearEncoding,d=new e.PerspectiveCamera;d.matrixAutoUpdate=!1,d.userData.refractor=!0;var m=new e.Plane,u=new e.Matrix4,v={minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBFormat,stencilBuffer:!1,encoding:c},f=new e.WebGLRenderTarget(n,i,v);e.MathUtils.isPowerOfTwo(n)&&e.MathUtils.isPowerOfTwo(i)||(f.texture.generateMipmaps=!1),this.material=new e.ShaderMaterial({uniforms:e.UniformsUtils.clone(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,transparent:!0}),this.material.uniforms.color.value=o,this.material.uniforms.tDiffuse.value=f.texture,this.material.uniforms.textureMatrix.value=u;var x,p,b,h,w,g,y,M,R=(x=new e.Vector3,p=new e.Vector3,b=new e.Matrix4,h=new e.Vector3,w=new e.Vector3,function(e){return x.setFromMatrixPosition(a.matrixWorld),p.setFromMatrixPosition(e.matrixWorld),h.subVectors(x,p),b.extractRotation(a.matrixWorld),w.set(0,0,1),w.applyMatrix4(b),h.dot(w)<0}),W=function(){var r=new e.Vector3,t=new e.Vector3,o=new e.Quaternion,n=new e.Vector3;return function(){a.matrixWorld.decompose(t,o,n),r.set(0,0,1).applyQuaternion(o).normalize(),r.negate(),m.setFromNormalAndCoplanarPoint(r,t)}}(),U=(g=new e.Plane,y=new e.Vector4,M=new e.Vector4,function(e){d.matrixWorld.copy(e.matrixWorld),d.matrixWorldInverse.getInverse(d.matrixWorld),d.projectionMatrix.copy(e.projectionMatrix),d.far=e.far,g.copy(m),g.applyMatrix4(d.matrixWorldInverse),y.set(g.normal.x,g.normal.y,g.normal.z,g.constant);var r=d.projectionMatrix;M.x=(Math.sign(y.x)+r.elements[8])/r.elements[0],M.y=(Math.sign(y.y)+r.elements[9])/r.elements[5],M.z=-1,M.w=(1+r.elements[10])/r.elements[14],y.multiplyScalar(2/y.dot(M)),r.elements[2]=y.x,r.elements[6]=y.y,r.elements[10]=y.z+1-l,r.elements[14]=y.w});this.onBeforeRender=function(e,r,t){!0!==t.userData.refractor&&!0!=!R(t)&&(W(),function(e){u.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),u.multiply(e.projectionMatrix),u.multiply(e.matrixWorldInverse),u.multiply(a.matrixWorld)}(t),U(t),function(e,r,t){a.visible=!1;var o=e.getRenderTarget(),n=e.xr.enabled,i=e.shadowMap.autoUpdate;e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.setRenderTarget(f),!1===e.autoClear&&e.clear(),e.render(r,d),e.xr.enabled=n,e.shadowMap.autoUpdate=i,e.setRenderTarget(o);var l=t.viewport;void 0!==l&&e.state.viewport(l),a.visible=!0}(e,r,t))},this.getRenderTarget=function(){return f}},e.Refractor.prototype=Object.create(e.Mesh.prototype),e.Refractor.prototype.constructor=e.Refractor,e.Refractor.RefractorShader={uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:["uniform mat4 textureMatrix;","varying vec4 vUv;","void main() {","\tvUv = textureMatrix * vec4( position, 1.0 );","\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform vec3 color;","uniform sampler2D tDiffuse;","varying vec4 vUv;","float blendOverlay( float base, float blend ) {","\treturn( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );","}","vec3 blendOverlay( vec3 base, vec3 blend ) {","\treturn vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );","}","void main() {","\tvec4 base = texture2DProj( tDiffuse, vUv );","\tgl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );","}"].join("\n")},e.Refractor});
//# sourceMappingURL=../sourcemaps/objects/Refractor.js.map
