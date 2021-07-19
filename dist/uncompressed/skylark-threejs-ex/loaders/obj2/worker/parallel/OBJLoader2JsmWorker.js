define([
    '../../OBJLoader2Parser',
    './WorkerRunner'
], function (OBJLoader2Parser, WorkerRunner) {
    'use strict';
    new WorkerRunner(new DefaultWorkerPayloadHandler(new OBJLoader2Parser()));
});