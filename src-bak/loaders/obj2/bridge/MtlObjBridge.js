define(['../../../../jsm/loaders/MTLLoader.js'], function (a) {
    'use strict';
    const MtlObjBridge = {
        link: function (processResult, assetLoader) {
            if (typeof assetLoader.addMaterials === 'function') {
                assetLoader.addMaterials(this.addMaterialsFromMtlLoader(processResult), true);
            }
        },
        addMaterialsFromMtlLoader: function (materialCreator) {
            let newMaterials = {};
            if (materialCreator instanceof a.MTLLoader.MaterialCreator) {
                materialCreator.preload();
                newMaterials = materialCreator.materials;
            }
            return newMaterials;
        }
    };
    return MtlObjBridge;
});