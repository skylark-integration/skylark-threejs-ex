/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.DRACOLoader=function(t){e.Loader.call(this,t),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}},e.DRACOLoader.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:e.DRACOLoader,setDecoderPath:function(e){return this.decoderPath=e,this},setDecoderConfig:function(e){return this.decoderConfig=e,this},setWorkerLimit:function(e){return this.workerLimit=e,this},setVerbosity:function(){console.warn("THREE.DRACOLoader: The .setVerbosity() method has been removed.")},setDrawMode:function(){console.warn("THREE.DRACOLoader: The .setDrawMode() method has been removed.")},setSkipDequantization:function(){console.warn("THREE.DRACOLoader: The .setSkipDequantization() method has been removed.")},load:function(t,r,o,a){var n=new e.FileLoader(this.manager);n.setPath(this.path),n.setResponseType("arraybuffer"),"use-credentials"===this.crossOrigin&&n.setWithCredentials(!0),n.load(t,e=>{var t={attributeIDs:this.defaultAttributeIDs,attributeTypes:this.defaultAttributeTypes,useUniqueIDs:!1};this.decodeGeometry(e,t).then(r).catch(a)},o,a)},decodeDracoFile:function(e,t,r,o){var a={attributeIDs:r||this.defaultAttributeIDs,attributeTypes:o||this.defaultAttributeTypes,useUniqueIDs:!!r};this.decodeGeometry(e,a).then(t)},decodeGeometry:function(t,r){for(var o in r.attributeTypes){var a=r.attributeTypes[o];void 0!==a.BYTES_PER_ELEMENT&&(r.attributeTypes[o]=a.name)}var n,s=JSON.stringify(r);if(e.DRACOLoader.taskCache.has(t)){var i=e.DRACOLoader.taskCache.get(t);if(i.key===s)return i.promise;if(0===t.byteLength)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}var d=this.workerNextTaskID++,c=t.byteLength,u=this._getWorker(d,c).then(e=>(n=e,new Promise((e,o)=>{n._callbacks[d]={resolve:e,reject:o},n.postMessage({type:"decode",id:d,taskConfig:r,buffer:t},[t])}))).then(e=>this._createGeometry(e.geometry));return u.finally(()=>{n&&d&&this._releaseTask(n,d)}),e.DRACOLoader.taskCache.set(t,{key:s,promise:u}),u},_createGeometry:function(t){var r=new e.BufferGeometry;t.index&&r.setIndex(new e.BufferAttribute(t.index.array,1));for(var o=0;o<t.attributes.length;o++){var a=t.attributes[o],n=a.name,s=a.array,i=a.itemSize;r.setAttribute(n,new e.BufferAttribute(s,i))}return r},_loadLibrary:function(t,r){var o=new e.FileLoader(this.manager);return o.setPath(this.decoderPath),o.setResponseType(r),new Promise((e,r)=>{o.load(t,e,void 0,r)})},preload:function(){return this._initDecoder(),this},_initDecoder:function(){if(this.decoderPending)return this.decoderPending;var t="object"!=typeof WebAssembly||"js"===this.decoderConfig.type,r=[];return t?r.push(this._loadLibrary("draco_decoder.js","text")):(r.push(this._loadLibrary("draco_wasm_wrapper.js","text")),r.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(r).then(r=>{var o=r[0];t||(this.decoderConfig.wasmBinary=r[1]);var a=e.DRACOLoader.DRACOWorker.toString(),n=["/* draco decoder */",o,"","/* worker */",a.substring(a.indexOf("{")+1,a.lastIndexOf("}"))].join("\n");this.workerSourceURL=URL.createObjectURL(new Blob([n]))}),this.decoderPending},_getWorker:function(e,t){return this._initDecoder().then(()=>{var r;this.workerPool.length<this.workerLimit?((r=new Worker(this.workerSourceURL))._callbacks={},r._taskCosts={},r._taskLoad=0,r.postMessage({type:"init",decoderConfig:this.decoderConfig}),r.onmessage=function(e){var t=e.data;switch(t.type){case"decode":r._callbacks[t.id].resolve(t);break;case"error":r._callbacks[t.id].reject(t);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+t.type+'"')}},this.workerPool.push(r)):this.workerPool.sort(function(e,t){return e._taskLoad>t._taskLoad?-1:1});return(r=this.workerPool[this.workerPool.length-1])._taskCosts[e]=t,r._taskLoad+=t,r})},_releaseTask:function(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]},debug:function(){console.log("Task load: ",this.workerPool.map(e=>e._taskLoad))},dispose:function(){for(var e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this}}),e.DRACOLoader.DRACOWorker=function(){var e,t;function r(e,t,r,o,a,n){var s,i,d=n.num_components(),c=r.num_points()*d;switch(a){case Float32Array:s=new e.DracoFloat32Array,t.GetAttributeFloatForAllPoints(r,n,s),i=new Float32Array(c);break;case Int8Array:s=new e.DracoInt8Array,t.GetAttributeInt8ForAllPoints(r,n,s),i=new Int8Array(c);break;case Int16Array:s=new e.DracoInt16Array,t.GetAttributeInt16ForAllPoints(r,n,s),i=new Int16Array(c);break;case Int32Array:s=new e.DracoInt32Array,t.GetAttributeInt32ForAllPoints(r,n,s),i=new Int32Array(c);break;case Uint8Array:s=new e.DracoUInt8Array,t.GetAttributeUInt8ForAllPoints(r,n,s),i=new Uint8Array(c);break;case Uint16Array:s=new e.DracoUInt16Array,t.GetAttributeUInt16ForAllPoints(r,n,s),i=new Uint16Array(c);break;case Uint32Array:s=new e.DracoUInt32Array,t.GetAttributeUInt32ForAllPoints(r,n,s),i=new Uint32Array(c);break;default:throw new Error("THREE.DRACOLoader: Unexpected attribute type.")}for(var u=0;u<c;u++)i[u]=s.GetValue(u);return e.destroy(s),{name:o,array:i,itemSize:d}}onmessage=function(o){var a=o.data;switch(a.type){case"init":e=a.decoderConfig,t=new Promise(function(t){e.onModuleLoaded=function(e){t({draco:e})},DracoDecoderModule(e)});break;case"decode":var n=a.buffer,s=a.taskConfig;t.then(module=>{var e=module.draco,t=new e.Decoder,o=new e.DecoderBuffer;o.Init(new Int8Array(n),n.byteLength);try{var i=function(e,t,o,a){var n,s,i=a.attributeIDs,d=a.attributeTypes,c=t.GetEncodedGeometryType(o);if(c===e.TRIANGULAR_MESH)n=new e.Mesh,s=t.DecodeBufferToMesh(o,n);else{if(c!==e.POINT_CLOUD)throw new Error("THREE.DRACOLoader: Unexpected geometry type.");n=new e.PointCloud,s=t.DecodeBufferToPointCloud(o,n)}if(!s.ok()||0===n.ptr)throw new Error("THREE.DRACOLoader: Decoding failed: "+s.error_msg());var u={index:null,attributes:[]};for(var h in i){var l,f,y=self[d[h]];if(a.useUniqueIDs)f=i[h],l=t.GetAttributeByUniqueId(n,f);else{if(-1===(f=t.GetAttributeId(n,e[i[h]])))continue;l=t.GetAttribute(n,f)}u.attributes.push(r(e,t,n,h,y,l))}if(c===e.TRIANGULAR_MESH){for(var A=n.num_faces(),b=3*A,w=new Uint32Array(b),D=new e.DracoInt32Array,k=0;k<A;++k){t.GetFaceFromMesh(n,k,D);for(var m=0;m<3;++m)w[3*k+m]=D.GetValue(m)}u.index={array:w,itemSize:1},e.destroy(D)}return e.destroy(n),u}(e,t,o,s),d=i.attributes.map(e=>e.array.buffer);i.index&&d.push(i.index.array.buffer),self.postMessage({type:"decode",id:a.id,geometry:i},d)}catch(e){console.error(e),self.postMessage({type:"error",id:a.id,error:e.message})}finally{e.destroy(o),e.destroy(t)}})}}},e.DRACOLoader.taskCache=new WeakMap,e.DRACOLoader.setDecoderPath=function(){console.warn("THREE.DRACOLoader: The .setDecoderPath() method has been removed. Use instance methods.")},e.DRACOLoader.setDecoderConfig=function(){console.warn("THREE.DRACOLoader: The .setDecoderConfig() method has been removed. Use instance methods.")},e.DRACOLoader.releaseDecoderModule=function(){console.warn("THREE.DRACOLoader: The .releaseDecoderModule() method has been removed. Use instance methods.")},e.DRACOLoader.getDecoderModule=function(){console.warn("THREE.DRACOLoader: The .getDecoderModule() method has been removed. Use instance methods.")},e.DRACOLoader});
//# sourceMappingURL=../sourcemaps/loaders/DRACOLoader.js.map