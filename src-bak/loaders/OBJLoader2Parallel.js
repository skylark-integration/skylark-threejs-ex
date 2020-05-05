define([
    "skylark-threejs",
    './obj2/worker/main/WorkerExecutionSupport.js',
    './obj2/utils/CodeSerializer.js',
    './OBJLoader2.js',
    './obj2/OBJLoader2Parser.js',
    './obj2/worker/parallel/WorkerRunner.js'
], function (a, b, c, d, e, f) {
    'use strict';
    const OBJLoader2Parallel = function (manager) {
        d.OBJLoader2.call(this, manager);
        this.preferJsmWorker = false;
        this.jsmWorkerUrl = null;
        this.executeParallel = true;
        this.workerExecutionSupport = new b.WorkerExecutionSupport();
    };
    OBJLoader2Parallel.OBJLOADER2_PARALLEL_VERSION = '3.2.0';
    console.info('Using OBJLoader2Parallel version: ' + OBJLoader2Parallel.OBJLOADER2_PARALLEL_VERSION);
    OBJLoader2Parallel.DEFAULT_JSM_WORKER_PATH = './jsm/loaders/obj2/worker/parallel/OBJLoader2JsmWorker.js';
    OBJLoader2Parallel.prototype = Object.assign(Object.create(d.OBJLoader2.prototype), {
        constructor: OBJLoader2Parallel,
        setExecuteParallel: function (executeParallel) {
            this.executeParallel = executeParallel === true;
            return this;
        },
        setJsmWorker: function (preferJsmWorker, jsmWorkerUrl) {
            this.preferJsmWorker = preferJsmWorker === true;
            if (jsmWorkerUrl === undefined || jsmWorkerUrl === null) {
                throw 'The url to the jsm worker is not valid. Aborting...';
            }
            this.jsmWorkerUrl = jsmWorkerUrl;
            return this;
        },
        getWorkerExecutionSupport: function () {
            return this.workerExecutionSupport;
        },
        buildWorkerCode: function () {
            let codeBuilderInstructions = new b.CodeBuilderInstructions(true, true, this.preferJsmWorker);
            if (codeBuilderInstructions.isSupportsJsmWorker()) {
                codeBuilderInstructions.setJsmWorkerUrl(this.jsmWorkerUrl);
            }
            if (codeBuilderInstructions.isSupportsStandardWorker()) {
                let objectManipulator = new f.ObjectManipulator();
                let defaultWorkerPayloadHandler = new f.DefaultWorkerPayloadHandler(this.parser);
                let workerRunner = new f.WorkerRunner({});
                codeBuilderInstructions.addCodeFragment(c.CodeSerializer.serializeClass(e.OBJLoader2Parser, this.parser));
                codeBuilderInstructions.addCodeFragment(c.CodeSerializer.serializeClass(f.ObjectManipulator, objectManipulator));
                codeBuilderInstructions.addCodeFragment(c.CodeSerializer.serializeClass(f.DefaultWorkerPayloadHandler, defaultWorkerPayloadHandler));
                codeBuilderInstructions.addCodeFragment(c.CodeSerializer.serializeClass(f.WorkerRunner, workerRunner));
                let startCode = 'new ' + workerRunner.constructor.name + '( new ' + defaultWorkerPayloadHandler.constructor.name + '( new ' + this.parser.constructor.name + '() ) );';
                codeBuilderInstructions.addStartCode(startCode);
            }
            return codeBuilderInstructions;
        },
        load: function (content, onLoad, onFileLoadProgress, onError, onMeshAlter) {
            let scope = this;
            function interceptOnLoad(object3d, message) {
                if (object3d.name === 'OBJLoader2ParallelDummy') {
                    if (scope.parser.logging.enabled && scope.parser.logging.debug) {
                        console.debug('Received dummy answer from OBJLoader2Parallel#parse');
                    }
                } else {
                    onLoad(object3d, message);
                }
            }
            d.OBJLoader2.prototype.load.call(this, content, interceptOnLoad, onFileLoadProgress, onError, onMeshAlter);
        },
        parse: function (content) {
            if (this.executeParallel) {
                if (this.parser.callbacks.onLoad === this.parser._onLoad) {
                    throw 'No callback other than the default callback was provided! Aborting!';
                }
                if (!this.workerExecutionSupport.isWorkerLoaded(this.preferJsmWorker)) {
                    this.workerExecutionSupport.buildWorker(this.buildWorkerCode());
                    let scope = this;
                    let scopedOnAssetAvailable = function (payload) {
                        scope._onAssetAvailable(payload);
                    };
                    function scopedOnLoad(message) {
                        scope.parser.callbacks.onLoad(scope.baseObject3d, message);
                    }
                    this.workerExecutionSupport.updateCallbacks(scopedOnAssetAvailable, scopedOnLoad);
                }
                this.materialHandler.createDefaultMaterials(false);
                this.workerExecutionSupport.executeParallel({
                    params: {
                        modelName: this.modelName,
                        instanceNo: this.instanceNo,
                        useIndices: this.parser.useIndices,
                        disregardNormals: this.parser.disregardNormals,
                        materialPerSmoothingGroup: this.parser.materialPerSmoothingGroup,
                        useOAsMesh: this.parser.useOAsMesh,
                        materials: this.materialHandler.getMaterialsJSON()
                    },
                    data: {
                        input: content,
                        options: null
                    },
                    logging: {
                        enabled: this.parser.logging.enabled,
                        debug: this.parser.logging.debug
                    }
                });
                let dummy = new a.Object3D();
                dummy.name = 'OBJLoader2ParallelDummy';
                return dummy;
            } else {
                return d.OBJLoader2.prototype.parse.call(this, content);
            }
        }
    });
    return OBJLoader2Parallel;
});