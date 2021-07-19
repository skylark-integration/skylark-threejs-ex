define([
    'skylark-threejs'
], function (THREE) {
    'use strict';

    const LoadedMeshUserOverride = function (disregardMesh, alteredMesh) {
        this.disregardMesh = disregardMesh === true;
        this.alteredMesh = alteredMesh === true;
        this.meshes = [];
    };
    LoadedMeshUserOverride.prototype = {
        constructor: LoadedMeshUserOverride,
        addMesh: function (mesh) {
            this.meshes.push(mesh);
            this.alteredMesh = true;
        },
        isDisregardMesh: function () {
            return this.disregardMesh;
        },
        providesAlteredMeshes: function () {
            return this.alteredMesh;
        }
    };
    return LoadedMeshUserOverride;
});