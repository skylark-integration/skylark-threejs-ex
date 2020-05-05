define([
    "skylark-threejs",
    './GLTFLoader'
], function (
    THREE, 
    GLTFLoader
) {
    'use strict';
    var VRMLoader = function () {
        function VRMLoader(manager) {
            if (GLTFLoader === undefined) {
                throw new Error('THREE.VRMLoader: Import GLTFLoader.');
            }
            THREE.Loader.call(this, manager);
            this.gltfLoader = new GLTFLoader(this.manager);
        }
        VRMLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
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