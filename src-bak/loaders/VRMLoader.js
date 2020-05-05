define([
    "skylark-threejs",
    '../loaders/GLTFLoader.js'
], function (a, b) {
    'use strict';
    var VRMLoader = function () {
        function VRMLoader(manager) {
            if (b.GLTFLoader === undefined) {
                throw new Error('THREE.VRMLoader: Import GLTFLoader.');
            }
            a.Loader.call(this, manager);
            this.gltfLoader = new b.GLTFLoader(this.manager);
        }
        VRMLoader.prototype = Object.assign(Object.create(a.Loader.prototype), {
            constructor: VRMLoader,
            load: function (url, onLoad, onProgress, onError) {
                var scope = this;
                this.gltfLoader.load(url, function (gltf) {
                    scope.parse(gltf, onLoad);
                }, onProgress, onError);
            },
            setDRACOLoader: function (dracoLoader) {
                this.glTFLoader.setDRACOLoader(dracoLoader);
                return this;
            },
            parse: function (gltf, onLoad) {
                onLoad(gltf);
            }
        });
        return VRMLoader;
    }();
    
    return VRMLoader;
});