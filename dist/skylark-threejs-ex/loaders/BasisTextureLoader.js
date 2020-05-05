/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var r=function(r){e.Loader.call(this,r),this.transcoderPath="",this.transcoderBinary=null,this.transcoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.workerConfig={format:null,astcSupported:!1,bptcSupported:!1,etcSupported:!1,dxtSupported:!1,pvrtcSupported:!1}};return r.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:r,setTranscoderPath:function(e){return this.transcoderPath=e,this},setWorkerLimit:function(e){return this.workerLimit=e,this},detectSupport:function(e){var t=this.workerConfig;if(t.astcSupported=!!e.extensions.get("WEBGL_compressed_texture_astc"),t.bptcSupported=!!e.extensions.get("EXT_texture_compression_bptc"),t.etcSupported=!!e.extensions.get("WEBGL_compressed_texture_etc1"),t.dxtSupported=!!e.extensions.get("WEBGL_compressed_texture_s3tc"),t.pvrtcSupported=!!e.extensions.get("WEBGL_compressed_texture_pvrtc")||!!e.extensions.get("WEBKIT_WEBGL_compressed_texture_pvrtc"),t.astcSupported)t.format=r.BASIS_FORMAT.cTFASTC_4x4;else if(t.bptcSupported)t.format=r.BASIS_FORMAT.cTFBC7_M5;else if(t.dxtSupported)t.format=r.BASIS_FORMAT.cTFBC3;else if(t.pvrtcSupported)t.format=r.BASIS_FORMAT.cTFPVRTC1_4_RGBA;else{if(!t.etcSupported)throw new Error("THREE.BasisTextureLoader: No suitable compressed texture format found.");t.format=r.BASIS_FORMAT.cTFETC1}return this},load:function(r,t,s,a){var o=new e.FileLoader(this.manager);o.setResponseType("arraybuffer"),o.load(r,e=>{this._createTexture(e).then(t).catch(a)},s,a)},_createTexture:function(t){var s,a,o=t.byteLength,i=this._allocateWorker(o).then(e=>(s=e,a=this.workerNextTaskID++,new Promise((e,r)=>{s._callbacks[a]={resolve:e,reject:r},s.postMessage({type:"transcode",id:a,buffer:t},[t])}))).then(t=>{var s,a=this.workerConfig,{width:o,height:i,mipmaps:n,format:c}=t;switch(c){case r.BASIS_FORMAT.cTFASTC_4x4:s=new e.CompressedTexture(n,o,i,e.RGBA_ASTC_4x4_Format);break;case r.BASIS_FORMAT.cTFBC7_M5:s=new e.CompressedTexture(n,o,i,e.RGBA_BPTC_Format);break;case r.BASIS_FORMAT.cTFBC1:case r.BASIS_FORMAT.cTFBC3:s=new e.CompressedTexture(n,o,i,r.DXT_FORMAT_MAP[a.format],e.UnsignedByteType);break;case r.BASIS_FORMAT.cTFETC1:s=new e.CompressedTexture(n,o,i,e.RGB_ETC1_Format);break;case r.BASIS_FORMAT.cTFPVRTC1_4_RGB:s=new e.CompressedTexture(n,o,i,e.RGB_PVRTC_4BPPV1_Format);break;case r.BASIS_FORMAT.cTFPVRTC1_4_RGBA:s=new e.CompressedTexture(n,o,i,e.RGBA_PVRTC_4BPPV1_Format);break;default:throw new Error("THREE.BasisTextureLoader: No supported format available.")}return s.minFilter=1===n.length?e.LinearFilter:e.LinearMipmapLinearFilter,s.magFilter=e.LinearFilter,s.generateMipmaps=!1,s.needsUpdate=!0,s});return i.finally(()=>{s&&a&&(s._taskLoad-=o,delete s._callbacks[a])}),i},_initTranscoder:function(){if(!this.transcoderPending){var t=new e.FileLoader(this.manager);t.setPath(this.transcoderPath);var s=new Promise((e,r)=>{t.load("basis_transcoder",e,void 0,r)}),a=new e.FileLoader(this.manager);a.setPath(this.transcoderPath),a.setResponseType("arraybuffer");var o=new Promise((e,r)=>{a.load("basis_transcoder.wasm",e,void 0,r)});this.transcoderPending=Promise.all([s,o]).then(([e,t])=>{var s=r.BasisWorker.toString(),a=["/* basis_transcoder.js */",e,"/* worker */",s.substring(s.indexOf("{")+1,s.lastIndexOf("}"))].join("\n");this.workerSourceURL=URL.createObjectURL(new Blob([a])),this.transcoderBinary=t})}return this.transcoderPending},_allocateWorker:function(e){return this._initTranscoder().then(()=>{var r;this.workerPool.length<this.workerLimit?((r=new Worker(this.workerSourceURL))._callbacks={},r._taskLoad=0,r.postMessage({type:"init",config:this.workerConfig,transcoderBinary:this.transcoderBinary}),r.onmessage=function(e){var t=e.data;switch(t.type){case"transcode":r._callbacks[t.id].resolve(t);break;case"error":r._callbacks[t.id].reject(t);break;default:console.error('THREE.BasisTextureLoader: Unexpected message, "'+t.type+'"')}},this.workerPool.push(r)):this.workerPool.sort(function(e,r){return e._taskLoad>r._taskLoad?-1:1});return(r=this.workerPool[this.workerPool.length-1])._taskLoad+=e,r})},dispose:function(){for(var e=0;e<this.workerPool.length;e++)this.workerPool[e].terminate();return this.workerPool.length=0,this}}),r.BASIS_FORMAT={cTFETC1:0,cTFETC2:1,cTFBC1:2,cTFBC3:3,cTFBC4:4,cTFBC5:5,cTFBC7_M6_OPAQUE_ONLY:6,cTFBC7_M5:7,cTFPVRTC1_4_RGB:8,cTFPVRTC1_4_RGBA:9,cTFASTC_4x4:10,cTFATC_RGB:11,cTFATC_RGBA_INTERPOLATED_ALPHA:12,cTFRGBA32:13,cTFRGB565:14,cTFBGR565:15,cTFRGBA4444:16},r.DXT_FORMAT={COMPRESSED_RGB_S3TC_DXT1_EXT:33776,COMPRESSED_RGBA_S3TC_DXT1_EXT:33777,COMPRESSED_RGBA_S3TC_DXT3_EXT:33778,COMPRESSED_RGBA_S3TC_DXT5_EXT:33779},(r.DXT_FORMAT_MAP={})[r.BASIS_FORMAT.cTFBC1]=r.DXT_FORMAT.COMPRESSED_RGB_S3TC_DXT1_EXT,r.DXT_FORMAT_MAP[r.BASIS_FORMAT.cTFBC3]=r.DXT_FORMAT.COMPRESSED_RGBA_S3TC_DXT5_EXT,r.BasisWorker=function(){var e,r,t;onmessage=function(s){var a,o,i=s.data;switch(i.type){case"init":e=i.config,a=i.transcoderBinary,r=new Promise(e=>{o={wasmBinary:a,onRuntimeInitialized:e},BASIS(o)}).then(()=>{var{BasisFile:e,initializeBasis:r}=o;t=e,r()});break;case"transcode":r.then(()=>{try{for(var{width:r,height:s,hasAlpha:a,mipmaps:o,format:n}=function(r){var s=new t(new Uint8Array(r)),a=s.getImageWidth(0,0),o=s.getImageHeight(0,0),i=s.getNumLevels(0),n=s.getHasAlpha();function c(){s.close(),s.delete()}if(!n)switch(e.format){case 9:e.format=8}if(!a||!o||!i)throw c(),new Error("THREE.BasisTextureLoader:  Invalid .basis file");if(!s.startTranscoding())throw c(),new Error("THREE.BasisTextureLoader: .startTranscoding failed");for(var T=[],d=0;d<i;d++){var _=s.getImageWidth(0,d),h=s.getImageHeight(0,d),p=new Uint8Array(s.getImageTranscodedSizeInBytes(0,d,e.format)),u=s.transcodeImage(p,0,d,e.format,0,n);if(!u)throw c(),new Error("THREE.BasisTextureLoader: .transcodeImage failed.");T.push({data:p,width:_,height:h})}return c(),{width:a,height:o,hasAlpha:n,mipmaps:T,format:e.format}}(i.buffer),c=[],T=0;T<o.length;++T)c.push(o[T].data.buffer);self.postMessage({type:"transcode",id:i.id,width:r,height:s,hasAlpha:a,mipmaps:o,format:n},c)}catch(e){console.error(e),self.postMessage({type:"error",id:i.id,error:e.message})}})}}},r});
//# sourceMappingURL=../sourcemaps/loaders/BasisTextureLoader.js.map
