define([
    "skylark-threejs",
    './obj2/OBJLoader2Parser',
    './obj2/shared/MeshReceiver',
    './obj2/shared/MaterialHandler'
], function (
    THREE, 
    OBJLoader2Parser, 
    MeshReceiver, 
    MaterialHandler
) {
    'use strict';
    const OBJLoader2 = function (manager) {
        THREE.Loader.call(this, manager);
        this.parser = new OBJLoader2Parser();
        this.modelName = '';
        this.instanceNo = 0;
        this.baseObject3d = new THREE.Object3D();
        this.materialHandler = new MaterialHandler();
        this.meshReceiver = new MeshReceiver(this.materialHandler);
        let scope = this;
        let defaultOnAssetAvailable = function (payload) {
            scope._onAssetAvailable(payload);
        };
        this.parser.setCallbackOnAssetAvailable(defaultOnAssetAvailable);
    };
    OBJLoader2.OBJLOADER2_VERSION = '3.2.0';
    console.info('Using OBJLoader2 version: ' + OBJLoader2.OBJLOADER2_VERSION);
    OBJLoader2.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
        constructor: OBJLoader2,
        setLogging: function (enabled, debug) {
            this.parser.setLogging(enabled, debug);
            return this;
        },
        setMaterialPerSmoothingGroup: function (materialPerSmoothingGroup) {
            this.parser.setMaterialPerSmoothingGroup(materialPerSmoothingGroup);
            return this;
        },
        setUseOAsMesh: function (useOAsMesh) {
            this.parser.setUseOAsMesh(useOAsMesh);
            return this;
        },
        setUseIndices: function (useIndices) {
            this.parser.setUseIndices(useIndices);
            return this;
        },
        setDisregardNormals: function (disregardNormals) {
            this.parser.setDisregardNormals(disregardNormals);
            return this;
        },
        setModelName: function (modelName) {
            this.modelName = modelName ? modelName : this.modelName;
            return this;
        },
        setBaseObject3d: function (baseObject3d) {
            this.baseObject3d = baseObject3d === undefined || baseObject3d === null ? this.baseObject3d : baseObject3d;
            return this;
        },
        addMaterials: function (materials, overrideExisting) {
            this.materialHandler.addMaterials(materials, overrideExisting);
            return this;
        },
        setCallbackOnAssetAvailable: function (onAssetAvailable) {
            this.parser.setCallbackOnAssetAvailable(onAssetAvailable);
            return this;
        },
        setCallbackOnProgress: function (onProgress) {
            this.parser.setCallbackOnProgress(onProgress);
            return this;
        },
        setCallbackOnError: function (onError) {
            this.parser.setCallbackOnError(onError);
            return this;
        },
        setCallbackOnLoad: function (onLoad) {
            this.parser.setCallbackOnLoad(onLoad);
            return this;
        },
        setCallbackOnMeshAlter: function (onMeshAlter) {
            this.meshReceiver._setCallbacks(this.parser.callbacks.onProgress, onMeshAlter);
            return this;
        },
        setCallbackOnLoadMaterials: function (onLoadMaterials) {
            this.materialHandler._setCallbacks(onLoadMaterials);
            return this;
        },
        load: function (url, onLoad, onFileLoadProgress, onError, onMeshAlter) {
            let scope = this;
            if (onLoad === null || onLoad === undefined || !(onLoad instanceof Function)) {
                let errorMessage = 'onLoad is not a function! Aborting...';
                scope.parser.callbacks.onError(errorMessage);
                throw errorMessage;
            } else {
                this.parser.setCallbackOnLoad(onLoad);
            }
            if (onError === null || onError === undefined || !(onError instanceof Function)) {
                onError = function (event) {
                    let errorMessage = event;
                    if (event.currentTarget && event.currentTarget.statusText !== null) {
                        errorMessage = 'Error occurred while downloading!\nurl: ' + event.currentTarget.responseURL + '\nstatus: ' + event.currentTarget.statusText;
                    }
                    scope.parser.callbacks.onError(errorMessage);
                };
            }
            if (!url) {
                onError('An invalid url was provided. Unable to continue!');
            }
            let urlFull = new URL(url, window.location.href).href;
            let filename = urlFull;
            let urlParts = urlFull.split('/');
            if (urlParts.length > 2) {
                filename = urlParts[urlParts.length - 1];
                this.path = urlParts.slice(0, urlParts.length - 1).join('/') + '/';
            }
            if (onFileLoadProgress === null || onFileLoadProgress === undefined || !(onFileLoadProgress instanceof Function)) {
                let numericalValueRef = 0;
                let numericalValue = 0;
                onFileLoadProgress = function (event) {
                    if (!event.lengthComputable)
                        return;
                    numericalValue = event.loaded / event.total;
                    if (numericalValue > numericalValueRef) {
                        numericalValueRef = numericalValue;
                        let output = 'Download of "' + url + '": ' + (numericalValue * 100).toFixed(2) + '%';
                        scope.parser.callbacks.onProgress('progressLoad', output, numericalValue);
                    }
                };
            }
            this.setCallbackOnMeshAlter(onMeshAlter);
            let fileLoaderOnLoad = function (content) {
                scope.parser.callbacks.onLoad(scope.parse(content), 'OBJLoader2#load: Parsing completed');
            };
            let fileLoader = new THREE.FileLoader(this.manager);
            fileLoader.setPath(this.path || this.resourcePath);
            fileLoader.setResponseType('arraybuffer');
            fileLoader.load(filename, fileLoaderOnLoad, onFileLoadProgress, onError);
        },
        parse: function (content) {
            if (content === null || content === undefined) {
                throw 'Provided content is not a valid ArrayBuffer or String. Unable to continue parsing';
            }
            if (this.parser.logging.enabled) {
                console.time('OBJLoader parse: ' + this.modelName);
            }
            this.materialHandler.createDefaultMaterials(false);
            this.parser.setMaterials(this.materialHandler.getMaterials());
            if (content instanceof ArrayBuffer || content instanceof Uint8Array) {
                if (this.parser.logging.enabled)
                    console.info('Parsing arrayBuffer...');
                this.parser.execute(content);
            } else if (typeof content === 'string' || content instanceof String) {
                if (this.parser.logging.enabled)
                    console.info('Parsing text...');
                this.parser.executeLegacy(content);
            } else {
                this.parser.callbacks.onError('Provided content was neither of type String nor Uint8Array! Aborting...');
            }
            if (this.parser.logging.enabled) {
                console.timeEnd('OBJLoader parse: ' + this.modelName);
            }
            return this.baseObject3d;
        },
        _onAssetAvailable: function (payload) {
            if (payload.cmd !== 'assetAvailable')
                return;
            if (payload.type === 'mesh') {
                let meshes = this.meshReceiver.buildMeshes(payload);
                for (let mesh of meshes) {
                    this.baseObject3d.add(mesh);
                }
            } else if (payload.type === 'material') {
                this.materialHandler.addPayloadMaterials(payload);
            }
        }
    });
    return OBJLoader2;
});