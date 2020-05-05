define(function () {
    'use strict';
    const CodeBuilderInstructions = function (supportsStandardWorker, supportsJsmWorker, preferJsmWorker) {
        this.supportsStandardWorker = supportsStandardWorker;
        this.supportsJsmWorker = supportsJsmWorker;
        this.preferJsmWorker = preferJsmWorker;
        this.startCode = '';
        this.codeFragments = [];
        this.importStatements = [];
        this.jsmWorkerUrl = null;
        this.defaultGeometryType = 0;
    };
    CodeBuilderInstructions.prototype = {
        constructor: CodeBuilderInstructions,
        isSupportsStandardWorker: function () {
            return this.supportsStandardWorker;
        },
        isSupportsJsmWorker: function () {
            return this.supportsJsmWorker;
        },
        isPreferJsmWorker: function () {
            return this.preferJsmWorker;
        },
        setJsmWorkerUrl: function (jsmWorkerUrl) {
            if (jsmWorkerUrl !== undefined && jsmWorkerUrl !== null) {
                this.jsmWorkerUrl = jsmWorkerUrl;
            }
        },
        addStartCode: function (startCode) {
            this.startCode = startCode;
        },
        addCodeFragment: function (code) {
            this.codeFragments.push(code);
        },
        addLibraryImport: function (libraryPath) {
            let libraryUrl = new URL(libraryPath, window.location.href).href;
            let code = 'importScripts( "' + libraryUrl + '" );';
            this.importStatements.push(code);
        },
        getImportStatements: function () {
            return this.importStatements;
        },
        getCodeFragments: function () {
            return this.codeFragments;
        },
        getStartCode: function () {
            return this.startCode;
        }
    };
    const WorkerExecutionSupport = function () {
        if (window.Worker === undefined)
            throw 'This browser does not support web workers!';
        if (window.Blob === undefined)
            throw 'This browser does not support Blob!';
        if (typeof window.URL.createObjectURL !== 'function')
            throw 'This browser does not support Object creation from URL!';
        this._reset();
    };
    WorkerExecutionSupport.WORKER_SUPPORT_VERSION = '3.2.0';
    console.info('Using WorkerSupport version: ' + WorkerExecutionSupport.WORKER_SUPPORT_VERSION);
    WorkerExecutionSupport.prototype = {
        constructor: WorkerExecutionSupport,
        _reset: function () {
            this.logging = {
                enabled: false,
                debug: false
            };
            let scope = this;
            let scopeTerminate = function () {
                scope._terminate();
            };
            this.worker = {
                native: null,
                jsmWorker: false,
                logging: true,
                workerRunner: {
                    name: 'WorkerRunner',
                    usesMeshDisassembler: false,
                    defaultGeometryType: 0
                },
                terminateWorkerOnLoad: true,
                forceWorkerDataCopy: false,
                started: false,
                queuedMessage: null,
                callbacks: {
                    onAssetAvailable: null,
                    onLoad: null,
                    terminate: scopeTerminate
                }
            };
        },
        setLogging: function (enabled, debug) {
            this.logging.enabled = enabled === true;
            this.logging.debug = debug === true;
            this.worker.logging = enabled === true;
            return this;
        },
        setForceWorkerDataCopy: function (forceWorkerDataCopy) {
            this.worker.forceWorkerDataCopy = forceWorkerDataCopy === true;
            return this;
        },
        setTerminateWorkerOnLoad: function (terminateWorkerOnLoad) {
            this.worker.terminateWorkerOnLoad = terminateWorkerOnLoad === true;
            if (this.worker.terminateWorkerOnLoad && this.isWorkerLoaded(this.worker.jsmWorker) && this.worker.queuedMessage === null && this.worker.started) {
                if (this.logging.enabled) {
                    console.info('Worker is terminated immediately as it is not running!');
                }
                this._terminate();
            }
            return this;
        },
        updateCallbacks: function (onAssetAvailable, onLoad) {
            if (onAssetAvailable !== undefined && onAssetAvailable !== null) {
                this.worker.callbacks.onAssetAvailable = onAssetAvailable;
            }
            if (onLoad !== undefined && onLoad !== null) {
                this.worker.callbacks.onLoad = onLoad;
            }
            this._verifyCallbacks();
        },
        _verifyCallbacks: function () {
            if (this.worker.callbacks.onAssetAvailable === undefined || this.worker.callbacks.onAssetAvailable === null) {
                throw 'Unable to run as no "onAssetAvailable" callback is set.';
            }
        },
        buildWorker: function (codeBuilderInstructions) {
            let jsmSuccess = false;
            if (codeBuilderInstructions.isSupportsJsmWorker() && codeBuilderInstructions.isPreferJsmWorker()) {
                jsmSuccess = this._buildWorkerJsm(codeBuilderInstructions);
            }
            if (!jsmSuccess && codeBuilderInstructions.isSupportsStandardWorker()) {
                this._buildWorkerStandard(codeBuilderInstructions);
            }
        },
        _buildWorkerJsm: function (codeBuilderInstructions) {
            let jsmSuccess = true;
            let timeLabel = 'buildWorkerJsm';
            let workerAvailable = this._buildWorkerCheckPreconditions(true, timeLabel);
            if (!workerAvailable) {
                try {
                    let worker = new Worker(codeBuilderInstructions.jsmWorkerUrl.href, { type: 'module' });
                    this._configureWorkerCommunication(worker, true, codeBuilderInstructions.defaultGeometryType, timeLabel);
                } catch (e) {
                    jsmSuccess = false;
                    if (e instanceof TypeError || e instanceof SyntaxError) {
                        console.error('Modules are not supported in workers.');
                    }
                }
            }
            return jsmSuccess;
        },
        _buildWorkerStandard: function (codeBuilderInstructions) {
            let timeLabel = 'buildWorkerStandard';
            let workerAvailable = this._buildWorkerCheckPreconditions(false, timeLabel);
            if (!workerAvailable) {
                let concatenateCode = '';
                codeBuilderInstructions.getImportStatements().forEach(function (element) {
                    concatenateCode += element + '\n';
                });
                concatenateCode += '\n';
                codeBuilderInstructions.getCodeFragments().forEach(function (element) {
                    concatenateCode += element + '\n';
                });
                concatenateCode += '\n';
                concatenateCode += codeBuilderInstructions.getStartCode();
                let blob = new Blob([concatenateCode], { type: 'application/javascript' });
                let worker = new Worker(window.URL.createObjectURL(blob));
                this._configureWorkerCommunication(worker, false, codeBuilderInstructions.defaultGeometryType, timeLabel);
            }
        },
        _buildWorkerCheckPreconditions: function (requireJsmWorker, timeLabel) {
            let workerAvailable = false;
            if (this.isWorkerLoaded(requireJsmWorker)) {
                workerAvailable = true;
            } else {
                if (this.logging.enabled) {
                    console.info('WorkerExecutionSupport: Building ' + (requireJsmWorker ? 'jsm' : 'standard') + ' worker code...');
                    console.time(timeLabel);
                }
            }
            return workerAvailable;
        },
        _configureWorkerCommunication: function (worker, haveJsmWorker, defaultGeometryType, timeLabel) {
            this.worker.native = worker;
            this.worker.jsmWorker = haveJsmWorker;
            let scope = this;
            let scopedReceiveWorkerMessage = function (event) {
                scope._receiveWorkerMessage(event);
            };
            this.worker.native.onmessage = scopedReceiveWorkerMessage;
            this.worker.native.onerror = scopedReceiveWorkerMessage;
            if (defaultGeometryType !== undefined && defaultGeometryType !== null) {
                this.worker.workerRunner.defaultGeometryType = defaultGeometryType;
            }
            if (this.logging.enabled) {
                console.timeEnd(timeLabel);
            }
        },
        isWorkerLoaded: function (requireJsmWorker) {
            return this.worker.native !== null && (requireJsmWorker && this.worker.jsmWorker || !requireJsmWorker && !this.worker.jsmWorker);
        },
        _receiveWorkerMessage: function (event) {
            if (event.type === 'error') {
                console.error(event);
                return;
            }
            let payload = event.data;
            let workerRunnerName = this.worker.workerRunner.name;
            switch (payload.cmd) {
            case 'assetAvailable':
                this.worker.callbacks.onAssetAvailable(payload);
                break;
            case 'completeOverall':
                this.worker.queuedMessage = null;
                this.worker.started = false;
                if (this.worker.callbacks.onLoad !== null) {
                    this.worker.callbacks.onLoad(payload.msg);
                }
                if (this.worker.terminateWorkerOnLoad) {
                    if (this.worker.logging.enabled) {
                        console.info('WorkerSupport [' + workerRunnerName + ']: Run is complete. Terminating application on request!');
                    }
                    this.worker.callbacks.terminate();
                }
                break;
            case 'error':
                console.error('WorkerSupport [' + workerRunnerName + ']: Reported error: ' + payload.msg);
                this.worker.queuedMessage = null;
                this.worker.started = false;
                if (this.worker.callbacks.onLoad !== null) {
                    this.worker.callbacks.onLoad(payload.msg);
                }
                if (this.worker.terminateWorkerOnLoad) {
                    if (this.worker.logging.enabled) {
                        console.info('WorkerSupport [' + workerRunnerName + ']: Run reported error. Terminating application on request!');
                    }
                    this.worker.callbacks.terminate();
                }
                break;
            default:
                console.error('WorkerSupport [' + workerRunnerName + ']: Received unknown command: ' + payload.cmd);
                break;
            }
        },
        executeParallel: function (payload, transferables) {
            payload.cmd = 'parse';
            payload.usesMeshDisassembler = this.worker.workerRunner.usesMeshDisassembler;
            payload.defaultGeometryType = this.worker.workerRunner.defaultGeometryType;
            if (!this._verifyWorkerIsAvailable(payload, transferables))
                return;
            this._postMessage();
        },
        _verifyWorkerIsAvailable: function (payload, transferables) {
            this._verifyCallbacks();
            let ready = true;
            if (this.worker.queuedMessage !== null) {
                console.warn('Already processing message. Rejecting new run instruction');
                ready = false;
            } else {
                this.worker.queuedMessage = {
                    payload: payload,
                    transferables: transferables === undefined || transferables === null ? [] : transferables
                };
                this.worker.started = true;
            }
            return ready;
        },
        _postMessage: function () {
            if (this.worker.queuedMessage !== null) {
                if (this.worker.queuedMessage.payload.data.input instanceof ArrayBuffer) {
                    let transferables = [];
                    if (this.worker.forceWorkerDataCopy) {
                        transferables.push(this.worker.queuedMessage.payload.data.input.slice(0));
                    } else {
                        transferables.push(this.worker.queuedMessage.payload.data.input);
                    }
                    if (this.worker.queuedMessage.transferables.length > 0) {
                        transferables = transferables.concat(this.worker.queuedMessage.transferables);
                    }
                    this.worker.native.postMessage(this.worker.queuedMessage.payload, transferables);
                } else {
                    this.worker.native.postMessage(this.worker.queuedMessage.payload);
                }
            }
        },
        _terminate: function () {
            this.worker.native.terminate();
            this._reset();
        }
    };
    return {
        CodeBuilderInstructions,
        WorkerExecutionSupport
    };
});