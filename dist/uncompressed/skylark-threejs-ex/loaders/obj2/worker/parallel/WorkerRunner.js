define(function () {
    'use strict';
    const ObjectManipulator = function () {
    };
    ObjectManipulator.prototype = {
        constructor: ObjectManipulator,
        applyProperties: function (objToAlter, params, forceCreation) {
            if (objToAlter === undefined || objToAlter === null || params === undefined || params === null)
                return;
            let property, funcName, values;
            for (property in params) {
                funcName = 'set' + property.substring(0, 1).toLocaleUpperCase() + property.substring(1);
                values = params[property];
                if (typeof objToAlter[funcName] === 'function') {
                    objToAlter[funcName](values);
                } else if (objToAlter.hasOwnProperty(property) || forceCreation) {
                    objToAlter[property] = values;
                }
            }
        }
    };
    const DefaultWorkerPayloadHandler = function (parser) {
        this.parser = parser;
        this.logging = {
            enabled: false,
            debug: false
        };
    };
    DefaultWorkerPayloadHandler.prototype = {
        constructor: DefaultWorkerPayloadHandler,
        handlePayload: function (payload) {
            if (payload.logging) {
                this.logging.enabled = payload.logging.enabled === true;
                this.logging.debug = payload.logging.debug === true;
            }
            if (payload.cmd === 'parse') {
                let scope = this;
                let callbacks = {
                    callbackOnAssetAvailable: function (payload) {
                        self.postMessage(payload);
                    },
                    callbackOnProgress: function (text) {
                        if (scope.logging.enabled && scope.logging.debug)
                            console.debug('WorkerRunner: progress: ' + text);
                    }
                };
                let parser = this.parser;
                if (typeof parser['setLogging'] === 'function') {
                    parser.setLogging(this.logging.enabled, this.logging.debug);
                }
                let objectManipulator = new ObjectManipulator();
                objectManipulator.applyProperties(parser, payload.params, false);
                objectManipulator.applyProperties(parser, callbacks, false);
                let arraybuffer = payload.data.input;
                let executeFunctionName = 'execute';
                if (typeof parser.getParseFunctionName === 'function')
                    executeFunctionName = parser.getParseFunctionName();
                if (payload.usesMeshDisassembler) {
                } else {
                    parser[executeFunctionName](arraybuffer, payload.data.options);
                }
                if (this.logging.enabled)
                    console.log('WorkerRunner: Run complete!');
                self.postMessage({
                    cmd: 'completeOverall',
                    msg: 'WorkerRunner completed run.'
                });
            } else {
                console.error('WorkerRunner: Received unknown command: ' + payload.cmd);
            }
        }
    };
    const WorkerRunner = function (payloadHandler) {
        this.payloadHandler = payloadHandler;
        let scope = this;
        let scopedRunner = function (event) {
            scope.processMessage(event.data);
        };
        self.addEventListener('message', scopedRunner, false);
    };
    WorkerRunner.prototype = {
        constructor: WorkerRunner,
        processMessage: function (payload) {
            this.payloadHandler.handlePayload(payload);
        }
    };
    return {
        WorkerRunner,
        DefaultWorkerPayloadHandler,
        ObjectManipulator
    };
});