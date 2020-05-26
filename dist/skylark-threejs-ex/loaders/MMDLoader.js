/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","../loaders/TGALoader","../libs/mmdparser"],function(e,t,a,r){"use strict";var n=function(){function t(t){e.Loader.call(this,t),this.loader=new e.FileLoader(this.manager),this.parser=null,this.meshBuilder=new i(this.manager),this.animationBuilder=new A}t.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:t,setAnimationPath:function(e){return this.animationPath=e,this},load:function(t,a,r,n){var i,o=this.meshBuilder.setCrossOrigin(this.crossOrigin);i=""!==this.resourcePath?this.resourcePath:""!==this.path?this.path:e.LoaderUtils.extractUrlBase(t);var s=this._extractExtension(t).toLowerCase();"pmd"===s||"pmx"===s?this["pmd"===s?"loadPMD":"loadPMX"](t,function(e){a(o.build(e,i,r,n))},r,n):n&&n(new Error("THREE.MMDLoader: Unknown model file extension ."+s+"."))},loadAnimation:function(e,t,a,r,n){var i=this.animationBuilder;this.loadVMD(e,function(e){a(t.isCamera?i.buildCameraAnimation(e):i.build(e,t))},r,n)},loadWithAnimation:function(e,t,a,r,n){var i=this;this.load(e,function(e){i.loadAnimation(t,e,function(t){a({mesh:e,animation:t})},r,n)},r,n)},loadPMD:function(e,t,a,r){var n=this._getParser();this.loader.setMimeType(void 0).setPath(this.path).setResponseType("arraybuffer").load(e,function(e){t(n.parsePmd(e,!0))},a,r)},loadPMX:function(e,t,a,r){var n=this._getParser();this.loader.setMimeType(void 0).setPath(this.path).setResponseType("arraybuffer").load(e,function(e){t(n.parsePmx(e,!0))},a,r)},loadVMD:function(e,t,a,r){var n=Array.isArray(e)?e:[e],i=[],o=n.length,s=this._getParser();this.loader.setMimeType(void 0).setPath(this.animationPath).setResponseType("arraybuffer");for(var A=0,l=n.length;A<l;A++)this.loader.load(n[A],function(e){i.push(s.parseVmd(e,!0)),i.length===o&&t(s.mergeVmds(i))},a,r)},loadVPD:function(e,t,a,r,n){var i=this._getParser();this.loader.setMimeType(t?void 0:"text/plain; charset=shift_jis").setPath(this.animationPath).setResponseType("text").load(e,function(e){a(i.parseVpd(e,!0))},r,n)},_extractExtension:function(e){var t=e.lastIndexOf(".");return t<0?"":e.slice(t+1)},_getParser:function(){if(null===this.parser){if(void 0===r)throw new Error("THREE.MMDLoader: Import MMDParser https://github.com/takahirox/mmd-parser");this.parser=new r.Parser}return this.parser}});var n=["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/bWiiMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh8aBHZBl14e8wAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOUlEQVRYR+3WMREAMAwDsYY/yoDI7MLwIiP40+RJklfcCCBAgAABAgTqArfb/QMCCBAgQIAAgbbAB3z/e0F3js2cAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/B5ilMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh81dWyx0gFwKAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVRYR+3WoREAMAwDsWb/UQtCy9wxTOQJ/oQ8SXKKGwEECBAgQIBAXeDt7f4BAQQIECBAgEBb4AOz8Hzx7WLY4wAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABPUlEQVRYR+1XwW7CMAy1+f9fZOMysSEOEweEOPRNdm3HbdOyIhAcklPrOs/PLy9RygBALxzcCDQFmgJNgaZAU6Ap0BR4PwX8gsRMVLssMRH5HcpzJEaWL7EVg9F1IHRlyqQohgVr4FGUlUcMJSjcUlDw0zvjeun70cLWmneoyf7NgBTQSniBTQQSuJAZsOnnaczjIMb5hCiuHKxokCrJfVnrctyZL0PkJAJe1HMil4nxeyi3Ypfn1kX51jpPvo/JeCNC4PhVdHdJw2XjBR8brF8PEIhNVn12AgP7uHsTBguBn53MUZCqv7Lp07Pn5k1Ro+uWmUNn7D+M57rtk7aG0Vo73xyF/fbFf0bPJjDXngnGocDTdFhygZjwUQrMNrDcmZlQT50VJ/g/UwNyHpu778+yW+/ksOz/BFo54P4AsUXMfRq7XWsAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACMElEQVRYR+2Xv4pTQRTGf2dubhLdICiii2KnYKHVolhauKWPoGAnNr6BD6CvIVaihYuI2i1ia0BY0MZGRHQXjZj/mSPnnskfNWiWZUlzJ5k7M2cm833nO5Mziej2DWWJRUoCpQKlAntSQCqgw39/iUWAGmh37jrRnVsKlgpiqmkoGVABA7E57fvY+pJDdgKqF6HzFCSADkDq+F6AHABtQ+UMVE5D7zXod7fFNhTEckTbj5XQgHzNN+5tQvc5NG7C6BNkp6D3EmpXHDR+dQAjFLchW3VS9rlw3JBh+B7ys5Cf9z0GW1C/7P32AyBAOAz1q4jGliIH3YPuBnSfQX4OGreTIgEYQb/pBDtPnEQ4CivXYPAWBk13oHrB54yA9QuSn2H4AcKRpEILDt0BUzj+RLR1V5EqjD66NPRBVpLcQwjHoHYJOhsQv6U4mnzmrIXJCFr4LDwm/xBUoboG9XX4cc9VKdYoSA2yk5NQLJaKDUjTBoveG3Z2TElTxwjNK4M3LEZgUdDdruvcXzKBpStgp2NPiWi3ks9ZXxIoFVi+AvHLdc9TqtjL3/aYjpPlrzOcEnK62Szhimdd7xX232zFDTgtxezOu3WNMRLjiKgjtOhHVMd1loynVHvOgjuIIJMaELEqhJAV/RCSLbWTcfPFakFgFlALTRRvx+ok6Hlp/Q+v3fmx90bMyUzaEAhmM3KvHlXTL5DxnbGf/1M8RNNACLL5MNtPxP/mypJAqcDSFfgFhpYqWUzhTEAAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII="];function i(e){this.geometryBuilder=new o,this.materialBuilder=new s(e)}function o(){}function s(t){this.manager=t,this.textureLoader=new e.TextureLoader(this.manager),this.tgaLoader=null}function A(){}function l(t,a,r,n,i){e.Interpolant.call(this,t,a,r,n),this.interpolationParams=i}return i.prototype={constructor:i,crossOrigin:"anonymous",setCrossOrigin:function(e){return this.crossOrigin=e,this},build:function(t,a,r,n){var i=this.geometryBuilder.build(t),o=this.materialBuilder.setCrossOrigin(this.crossOrigin).setResourcePath(a).build(t,i,r,n),s=new e.SkinnedMesh(i,o),A=new e.Skeleton(function(t){var a,r,n,i,o=t.geometry,s=[];if(o&&void 0!==o.bones){for(n=0,i=o.bones.length;n<i;n++)r=o.bones[n],a=new e.Bone,s.push(a),a.name=r.name,a.position.fromArray(r.pos),a.quaternion.fromArray(r.rotq),void 0!==r.scl&&a.scale.fromArray(r.scl);for(n=0,i=o.bones.length;n<i;n++)-1!==(r=o.bones[n]).parent&&null!==r.parent&&void 0!==s[r.parent]?s[r.parent].add(s[n]):t.add(s[n])}return t.updateMatrixWorld(!0),s}(s));return s.bind(A),s}},o.prototype={constructor:o,build:function(t){for(var a=[],r=[],n=[],i=[],o=[],s=[],A=[],l=[],u=[],h=[],p=[],d=[],f=[],m=[],g=0,c={},v=0;v<t.metadata.vertexCount;v++){for(var C=t.vertices[v],b=0,x=C.position.length;b<x;b++)a.push(C.position[b]);for(b=0,x=C.normal.length;b<x;b++)n.push(C.normal[b]);for(b=0,x=C.uv.length;b<x;b++)r.push(C.uv[b]);for(b=0;b<4;b++)A.push(C.skinIndices.length-1>=b?C.skinIndices[b]:0);for(b=0;b<4;b++)l.push(C.skinWeights.length-1>=b?C.skinWeights[b]:0)}for(v=0;v<t.metadata.faceCount;v++){var y=t.faces[v];for(b=0,x=y.indices.length;b<x;b++)i.push(y.indices[b])}for(v=0;v<t.metadata.materialCount;v++){var B=t.materials[v];o.push({offset:3*g,count:3*B.faceCount}),g+=B.faceCount}for(v=0;v<t.metadata.rigidBodyCount;v++){var I=t.rigidBodies[v],R=c[I.boneIndex];R=void 0===R?I.type:Math.max(I.type,R),c[I.boneIndex]=R}for(v=0;v<t.metadata.boneCount;v++){-1!==(K={parent:(P=t.bones[v]).parentIndex,name:P.name,pos:P.position.slice(0,3),rotq:[0,0,0,1],scl:[1,1,1],rigidBodyType:void 0!==c[v]?c[v]:-1}).parent&&(K.pos[0]-=t.bones[K.parent].position[0],K.pos[1]-=t.bones[K.parent].position[1],K.pos[2]-=t.bones[K.parent].position[2]),s.push(K)}if("pmd"===t.metadata.format)for(v=0;v<t.metadata.ikCount;v++){var w={target:(T=t.iks[v]).target,effector:T.effector,iteration:T.iteration,maxAngle:4*T.maxAngle,links:[]};for(b=0,x=T.links.length;b<x;b++){(E={}).index=T.links[b].index,E.enabled=!0,t.bones[E.index].name.indexOf("ひざ")>=0&&(E.limitation=new e.Vector3(1,0,0)),w.links.push(E)}p.push(w)}else for(v=0;v<t.metadata.boneCount;v++){var T;if(void 0!==(T=t.bones[v].ik)){for(w={target:v,effector:T.effector,iteration:T.iteration,maxAngle:T.maxAngle,links:[]},b=0,x=T.links.length;b<x;b++){var E;if((E={}).index=T.links[b].index,E.enabled=!0,1===T.links[b].angleLimitation){var k=T.links[b].lowerLimitationAngle,M=T.links[b].upperLimitationAngle,Q=-M[0],U=-M[1];M[0]=-k[0],M[1]=-k[1],k[0]=Q,k[1]=U,E.rotationMin=(new e.Vector3).fromArray(k),E.rotationMax=(new e.Vector3).fromArray(M)}w.links.push(E)}p.push(w)}}if("pmx"===t.metadata.format){for(v=0;v<t.metadata.boneCount;v++){var P,V=(P=t.bones[v]).grant;if(void 0!==V){w={index:v,parentIndex:V.parentIndex,ratio:V.ratio,isLocal:V.isLocal,affectRotation:V.affectRotation,affectPosition:V.affectPosition,transformationClass:P.transformationClass};d.push(w)}}d.sort(function(e,t){return e.transformationClass-t.transformationClass})}function O(e,a,r){for(var n=0;n<a.elementCount;n++){var i,o=a.elements[n];i="pmd"===t.metadata.format?t.morphs[0].elements[o.index].index:o.index,e.array[3*i+0]+=o.position[0]*r,e.array[3*i+1]+=o.position[1]*r,e.array[3*i+2]+=o.position[2]*r}}for(v=0;v<t.metadata.morphCount;v++){var L=t.morphs[v],N={name:L.name},S=new e.Float32BufferAttribute(3*t.metadata.vertexCount,3);S.name=L.name;for(b=0;b<3*t.metadata.vertexCount;b++)S.array[b]=a[b];if("pmd"===t.metadata.format)0!==v&&O(S,L,1);else if(0===L.type)for(b=0;b<L.elementCount;b++){var D=t.morphs[L.elements[b].index],F=L.elements[b].ratio;1===D.type&&O(S,D,F)}else 1===L.type?O(S,L,1):2===L.type||3===L.type||4===L.type||5===L.type||6===L.type||7===L.type||L.type;u.push(N),h.push(S)}for(v=0;v<t.metadata.rigidBodyCount;v++){var Y=t.rigidBodies[v];N={};for(var z in Y)N[z]=Y[z];if("pmx"===t.metadata.format&&-1!==N.boneIndex){var K=t.bones[N.boneIndex];N.position[0]-=K.position[0],N.position[1]-=K.position[1],N.position[2]-=K.position[2]}f.push(N)}for(v=0;v<t.metadata.constraintCount;v++){var J=t.constraints[v];N={};for(var z in J)N[z]=J[z];var W=f[N.rigidBodyIndex1],_=f[N.rigidBodyIndex2];0!==W.type&&2===_.type&&-1!==W.boneIndex&&-1!==_.boneIndex&&t.bones[_.boneIndex].parentIndex===W.boneIndex&&(_.type=1),m.push(N)}var G=new e.BufferGeometry;G.setAttribute("position",new e.Float32BufferAttribute(a,3)),G.setAttribute("normal",new e.Float32BufferAttribute(n,3)),G.setAttribute("uv",new e.Float32BufferAttribute(r,2)),G.setAttribute("skinIndex",new e.Uint16BufferAttribute(A,4)),G.setAttribute("skinWeight",new e.Float32BufferAttribute(l,4)),G.setIndex(i);v=0;for(var j=o.length;v<j;v++)G.addGroup(o[v].offset,o[v].count,v);return G.bones=s,G.morphTargets=u,G.morphAttributes.position=h,G.morphTargetsRelative=!1,G.userData.MMD={bones:s,iks:p,grants:d,rigidBodies:f,constraints:m,format:t.metadata.format},G.computeBoundingSphere(),G}},s.prototype={constructor:s,crossOrigin:"anonymous",resourcePath:void 0,setCrossOrigin:function(e){return this.crossOrigin=e,this},setResourcePath:function(e){return this.resourcePath=e,this},build:function(t,a){var r=[],n={};this.textureLoader.setCrossOrigin(this.crossOrigin);for(var i=0;i<t.metadata.materialCount;i++){var o=t.materials[i],s={userData:{}};if(void 0!==o.name&&(s.name=o.name),s.color=(new e.Color).fromArray(o.diffuse),s.opacity=o.diffuse[3],s.specular=(new e.Color).fromArray(o.specular),s.emissive=(new e.Color).fromArray(o.ambient),s.shininess=Math.max(o.shininess,1e-4),s.transparent=1!==s.opacity,s.skinning=a.bones.length>0,s.morphTargets=a.morphTargets.length>0,s.fog=!0,s.blending=e.CustomBlending,s.blendSrc=e.SrcAlphaFactor,s.blendDst=e.OneMinusSrcAlphaFactor,s.blendSrcAlpha=e.SrcAlphaFactor,s.blendDstAlpha=e.DstAlphaFactor,"pmx"===t.metadata.format&&1==(1&o.flag)?s.side=e.DoubleSide:s.side=1===s.opacity?e.FrontSide:e.DoubleSide,"pmd"===t.metadata.format){if(o.fileName){var A=o.fileName.split("*");if(s.map=this._loadTexture(A[0],n),A.length>1){var l=A[1].slice(-4).toLowerCase();s.envMap=this._loadTexture(A[1],n,{sphericalReflectionMapping:!0}),s.combine=".sph"===l?e.MultiplyOperation:e.AddOperation}}var u=-1===o.toonIndex?"toon00.bmp":t.toonTextures[o.toonIndex].fileName;s.gradientMap=this._loadTexture(u,n,{isToonTexture:!0,isDefaultToonTexture:this._isDefaultToonTexture(u)}),s.userData.outlineParameters={thickness:1===o.edgeFlag?.003:0,color:[0,0,0],alpha:1,visible:1===o.edgeFlag}}else{var h;-1!==o.textureIndex&&(s.map=this._loadTexture(t.textures[o.textureIndex],n)),-1===o.envTextureIndex||1!==o.envFlag&&2!=o.envFlag||(s.envMap=this._loadTexture(t.textures[o.envTextureIndex],n,{sphericalReflectionMapping:!0}),s.combine=1===o.envFlag?e.MultiplyOperation:e.AddOperation),-1===o.toonIndex||0!==o.toonFlag?(u="toon"+("0"+(o.toonIndex+1)).slice(-2)+".bmp",h=!0):(u=t.textures[o.toonIndex],h=!1),s.gradientMap=this._loadTexture(u,n,{isToonTexture:!0,isDefaultToonTexture:h}),s.userData.outlineParameters={thickness:o.edgeSize/300,color:o.edgeColor.slice(0,3),alpha:o.edgeColor[3],visible:0!=(16&o.flag)&&o.edgeSize>0}}void 0!==s.map&&(s.transparent||this._checkImageTransparency(s.map,a,i),s.emissive.multiplyScalar(.2)),r.push(new e.MeshToonMaterial(s))}if("pmx"===t.metadata.format){function p(e,t){for(var a=0,r=e.length;a<r;a++){var n=e[a];if(-1!==n.index){var i=t[n.index];i.opacity!==n.diffuse[3]&&(i.transparent=!0)}}}i=0;for(var d=t.morphs.length;i<d;i++){var f=t.morphs[i],m=f.elements;if(0===f.type)for(var g=0,c=m.length;g<c;g++){var v=t.morphs[m[g].index];8===v.type&&p(v.elements,r)}else 8===f.type&&p(m,r)}}return r},_getTGALoader:function(){if(null===this.tgaLoader){if(void 0===b.TGALoader)throw new Error("THREE.MMDLoader: Import TGALoader");this.tgaLoader=new a(this.manager)}return this.tgaLoader},_isDefaultToonTexture:function(e){return 10===e.length&&/toon(10|0[0-9])\.bmp/.test(e)},_loadTexture:function(t,a,r,i,o){var s,A=this;if(!0===(r=r||{}).isDefaultToonTexture){var l;try{l=parseInt(t.match(/toon([0-9]{2})\.bmp$/)[1])}catch(e){console.warn("THREE.MMDLoader: "+t+" seems like a not right default texture path. Using toon00.bmp instead."),l=0}s=n[l]}else s=this.resourcePath+t;if(void 0!==a[s])return a[s];var u=this.manager.getHandler(s);null===u&&(u=".tga"===t.slice(-4).toLowerCase()?this._getTGALoader():this.textureLoader);var h=u.load(s,function(t){!0===r.isToonTexture&&(t.image=A._getRotatedImage(t.image),t.magFilter=e.NearestFilter,t.minFilter=e.NearestFilter),t.flipY=!1,t.wrapS=e.RepeatWrapping,t.wrapT=e.RepeatWrapping;for(var a=0;a<h.readyCallbacks.length;a++)h.readyCallbacks[a](h);delete h.readyCallbacks},i,o);return!0===r.sphericalReflectionMapping&&(h.mapping=e.SphericalReflectionMapping),h.readyCallbacks=[],a[s]=h,h},_getRotatedImage:function(e){var t=document.createElement("canvas"),a=t.getContext("2d"),r=e.width,n=e.height;return t.width=r,t.height=n,a.clearRect(0,0,r,n),a.translate(r/2,n/2),a.rotate(.5*Math.PI),a.translate(-r/2,-n/2),a.drawImage(e,0,0),a.getImageData(0,0,r,n)},_checkImageTransparency:function(e,t,a){e.readyCallbacks.push(function(r){function n(e,t){var a=e.width,r=e.height,n=Math.round(t.x*a)%a,i=Math.round(t.y*r)%r;n<0&&(n+=a),i<0&&(i+=r);var o=i*a+n;return e.data[4*o+3]}var i=void 0!==r.image.data?r.image:function(e){var t=document.createElement("canvas");t.width=e.width,t.height=e.height;var a=t.getContext("2d");return a.drawImage(e,0,0),a.getImageData(0,0,t.width,t.height)}(r.image),o=t.groups[a];(function(e,t,a){var r=e.width,i=e.height;if(e.data.length/(r*i)!=4)return!1;for(var o=0;o<a.length;o+=3){for(var s={x:0,y:0},A=0;A<3;A++){var l=a[3*o+A],u={x:t[2*l+0],y:t[2*l+1]};if(n(e,u)<253)return!0;s.x+=u.x,s.y+=u.y}if(s.x/=3,s.y/=3,n(e,s)<253)return!0}return!1})(i,t.attributes.uv.array,t.index.array.slice(o.start,o.start+o.count))&&(e.transparent=!0)})}},A.prototype={constructor:A,build:function(t,a){for(var r=this.buildSkeletalAnimation(t,a).tracks,n=this.buildMorphAnimation(t,a).tracks,i=0,o=n.length;i<o;i++)r.push(n[i]);return new e.AnimationClip("",-1,r)},buildSkeletalAnimation:function(t,a){function r(e,t,a){e.push(t[a+0]/127),e.push(t[a+8]/127),e.push(t[a+4]/127),e.push(t[a+12]/127)}for(var n=[],i={},o=a.skeleton.bones,s={},A=0,l=o.length;A<l;A++)s[o[A].name]=!0;for(A=0;A<t.metadata.motionCount;A++){var u=t.motions[A],h=u.boneName;void 0!==s[h]&&(i[h]=i[h]||[],i[h].push(u))}for(var p in i){var d=i[p];d.sort(function(e,t){return e.frameNum-t.frameNum});var f=[],m=[],g=[],c=[],v=[],C=a.skeleton.getBoneByName(p).position.toArray();for(A=0,l=d.length;A<l;A++){var b=d[A].frameNum/30,x=d[A].position,y=d[A].rotation,B=d[A].interpolation;f.push(b);for(var I=0;I<3;I++)m.push(C[I]+x[I]);for(I=0;I<4;I++)g.push(y[I]);for(I=0;I<3;I++)r(c,B,I);r(v,B,3)}var R=".bones["+p+"]";n.push(this._createTrack(R+".position",e.VectorKeyframeTrack,f,m,c)),n.push(this._createTrack(R+".quaternion",e.QuaternionKeyframeTrack,f,g,v))}return new e.AnimationClip("",-1,n)},buildMorphAnimation:function(t,a){for(var r=[],n={},i=a.morphTargetDictionary,o=0;o<t.metadata.morphCount;o++){var s=t.morphs[o],A=s.morphName;void 0!==i[A]&&(n[A]=n[A]||[],n[A].push(s))}for(var l in n){var u=n[l];u.sort(function(e,t){return e.frameNum-t.frameNum});for(var h=[],p=[],d=(o=0,u.length);o<d;o++)h.push(u[o].frameNum/30),p.push(u[o].weight);r.push(new e.NumberKeyframeTrack(".morphTargetInfluences["+i[l]+"]",h,p))}return new e.AnimationClip("",-1,r)},buildCameraAnimation:function(t){function a(e,t){e.push(t.x),e.push(t.y),e.push(t.z)}function r(e,t,a){e.push(t[4*a+0]/127),e.push(t[4*a+1]/127),e.push(t[4*a+2]/127),e.push(t[4*a+3]/127)}var n=[],i=void 0===t.cameras?[]:t.cameras.slice();i.sort(function(e,t){return e.frameNum-t.frameNum});for(var o,s,A=[],l=[],u=[],h=[],p=[],d=[],f=[],m=[],g=[],c=new e.Quaternion,v=new e.Euler,C=new e.Vector3,b=new e.Vector3,x=0,y=i.length;x<y;x++){var B=i[x],I=B.frameNum/30,R=B.position,w=B.rotation,T=B.distance,E=B.fov,k=B.interpolation;A.push(I),C.set(0,0,-T),b.set(R[0],R[1],R[2]),v.set(-w[0],-w[1],-w[2]),c.setFromEuler(v),C.add(b),C.applyQuaternion(c),a(l,b),(o=u).push((s=c).x),o.push(s.y),o.push(s.z),o.push(s.w),a(h,C),p.push(E);for(var M=0;M<3;M++)r(d,k,M);r(f,k,3);for(M=0;M<3;M++)r(m,k,4);r(g,k,5)}return(n=[]).push(this._createTrack("target.position",e.VectorKeyframeTrack,A,l,d)),n.push(this._createTrack(".quaternion",e.QuaternionKeyframeTrack,A,u,f)),n.push(this._createTrack(".position",e.VectorKeyframeTrack,A,h,m)),n.push(this._createTrack(".fov",e.NumberKeyframeTrack,A,p,g)),new e.AnimationClip("",-1,n)},_createTrack:function(e,t,a,r,n){if(a.length>2){a=a.slice(),r=r.slice(),n=n.slice();for(var i=r.length/a.length,o=n.length/a.length,s=1,A=2,u=a.length;A<u;A++){for(var h=0;h<i;h++)if(r[s*i+h]!==r[(s-1)*i+h]||r[s*i+h]!==r[A*i+h]){s++;break}if(A>s){a[s]=a[A];for(h=0;h<i;h++)r[s*i+h]=r[A*i+h];for(h=0;h<o;h++)n[s*o+h]=n[A*o+h]}}a.length=s+1,r.length=(s+1)*i,n.length=(s+1)*o}var p=new t(e,a,r);return p.createInterpolant=function(e){return new l(this.times,this.values,this.getValueSize(),e,new Float32Array(n))},p}},l.prototype=Object.assign(Object.create(e.Interpolant.prototype),{constructor:l,interpolate_:function(t,a,r,n){var i=this.resultBuffer,o=this.sampleValues,s=this.valueSize,A=this.interpolationParams,l=t*s,u=l-s,h=n-a<.05?0:(r-a)/(n-a);if(4===s){var p=A[4*t+0],d=A[4*t+1],f=A[4*t+2],m=A[4*t+3],g=this._calculate(p,d,f,m,h);e.Quaternion.slerpFlat(i,0,o,u,o,l,g)}else if(3===s)for(var c=0;c!==s;++c){p=A[12*t+4*c+0],d=A[12*t+4*c+1],f=A[12*t+4*c+2],m=A[12*t+4*c+3],g=this._calculate(p,d,f,m,h);i[c]=o[u+c]*(1-g)+o[l+c]*g}else{p=A[4*t+0],d=A[4*t+1],f=A[4*t+2],m=A[4*t+3],g=this._calculate(p,d,f,m,h);i[0]=o[u]*(1-g)+o[l]*g}return i},_calculate:function(e,t,a,r,n){for(var i,o,s,A=.5,l=A,u=1-l,h=Math,p=0;p<15;p++){var d=(i=3*u*u*l)*e+(o=3*u*l*l)*t+(s=l*l*l)-n;if(h.abs(d)<1e-5)break;A/=2,u=1-(l+=d<0?A:-A)}return i*a+o*r+s}}),t}();return t.loaders.MMDLoader=n});
//# sourceMappingURL=../sourcemaps/loaders/MMDLoader.js.map
