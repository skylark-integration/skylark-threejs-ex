define([
    '../../OBJLoader2Parser.js',
    './WorkerRunner.js'
], function (a, b) {
    'use strict';
    new b.WorkerRunner(new b.DefaultWorkerPayloadHandler(new a.OBJLoader2Parser()));
});