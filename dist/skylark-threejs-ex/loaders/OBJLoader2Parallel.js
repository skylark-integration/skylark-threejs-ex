/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./obj2/worker/main/WorkerExecutionSupport","./obj2/utils/CodeSerializer","./OBJLoader2","./obj2/OBJLoader2Parser","./obj2/worker/parallel/WorkerRunner"],function(e,r,t,a,o,s,l){"use strict";const i=function(e){o.call(this,e),this.preferJsmWorker=!1,this.jsmWorkerUrl=null,this.executeParallel=!0,this.workerExecutionSupport=new t};return i.OBJLOADER2_PARALLEL_VERSION="3.2.0",console.info("Using OBJLoader2Parallel version: "+i.OBJLOADER2_PARALLEL_VERSION),i.DEFAULT_JSM_WORKER_PATH="./jsm/loaders/obj2/worker/parallel/OBJLoader2JsmWorker",i.prototype=Object.assign(Object.create(o.prototype),{constructor:i,setExecuteParallel:function(e){return this.executeParallel=!0===e,this},setJsmWorker:function(e,r){if(this.preferJsmWorker=!0===e,void 0===r||null===r)throw"The url to the jsm worker is not valid. Aborting...";return this.jsmWorkerUrl=r,this},getWorkerExecutionSupport:function(){return this.workerExecutionSupport},buildWorkerCode:function(){let e=new CodeBuilderInstructions(!0,!0,this.preferJsmWorker);if(e.isSupportsJsmWorker()&&e.setJsmWorkerUrl(this.jsmWorkerUrl),e.isSupportsStandardWorker()){let r=new ObjectManipulator,t=new DefaultWorkerPayloadHandler(this.parser),o=new l({});e.addCodeFragment(a.serializeClass(s,this.parser)),e.addCodeFragment(a.serializeClass(ObjectManipulator,r)),e.addCodeFragment(a.serializeClass(DefaultWorkerPayloadHandler,t)),e.addCodeFragment(a.serializeClass(l,o));let i="new "+o.constructor.name+"( new "+t.constructor.name+"( new "+this.parser.constructor.name+"() ) );";e.addStartCode(i)}return e},load:function(e,r,t,a,s){let l=this;o.prototype.load.call(this,e,function(e,t){"OBJLoader2ParallelDummy"===e.name?l.parser.logging.enabled&&l.parser.logging.debug&&console.debug("Received dummy answer from OBJLoader2Parallel#parse"):r(e,t)},t,a,s)},parse:function(r){if(this.executeParallel){if(this.parser.callbacks.onLoad===this.parser._onLoad)throw"No callback other than the default callback was provided! Aborting!";if(!this.workerExecutionSupport.isWorkerLoaded(this.preferJsmWorker)){this.workerExecutionSupport.buildWorker(this.buildWorkerCode());let e=this,r=function(r){e._onAssetAvailable(r)};this.workerExecutionSupport.updateCallbacks(r,function(r){e.parser.callbacks.onLoad(e.baseObject3d,r)})}this.materialHandler.createDefaultMaterials(!1),this.workerExecutionSupport.executeParallel({params:{modelName:this.modelName,instanceNo:this.instanceNo,useIndices:this.parser.useIndices,disregardNormals:this.parser.disregardNormals,materialPerSmoothingGroup:this.parser.materialPerSmoothingGroup,useOAsMesh:this.parser.useOAsMesh,materials:this.materialHandler.getMaterialsJSON()},data:{input:r,options:null},logging:{enabled:this.parser.logging.enabled,debug:this.parser.logging.debug}});let t=new e.Object3D;return t.name="OBJLoader2ParallelDummy",t}return o.prototype.parse.call(this,r)}}),r.loaders.OBJLoader2Parallel=i});
//# sourceMappingURL=../sourcemaps/loaders/OBJLoader2Parallel.js.map
