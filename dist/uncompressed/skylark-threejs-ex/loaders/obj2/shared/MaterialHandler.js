define([
    'skylark-threejs'
], function (THREE) {
    'use strict';
    const MaterialHandler = function () {
        this.logging = {
            enabled: false,
            debug: false
        };
        this.callbacks = { onLoadMaterials: null };
        this.materials = {};
    };
    MaterialHandler.prototype = {
        constructor: MaterialHandler,
        setLogging: function (enabled, debug) {
            this.logging.enabled = enabled === true;
            this.logging.debug = debug === true;
        },
        _setCallbacks: function (onLoadMaterials) {
            if (onLoadMaterials !== undefined && onLoadMaterials !== null && onLoadMaterials instanceof Function) {
                this.callbacks.onLoadMaterials = onLoadMaterials;
            }
        },
        createDefaultMaterials: function (overrideExisting) {
            let defaultMaterial = new THREE.MeshStandardMaterial({ color: 14479871 });
            defaultMaterial.name = 'defaultMaterial';
            let defaultVertexColorMaterial = new THREE.MeshStandardMaterial({ color: 14479871 });
            defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
            defaultVertexColorMaterial.vertexColors = THREE.VertexColors;
            let defaultLineMaterial = new THREE.LineBasicMaterial();
            defaultLineMaterial.name = 'defaultLineMaterial';
            let defaultPointMaterial = new THREE.PointsMaterial({ size: 0.1 });
            defaultPointMaterial.name = 'defaultPointMaterial';
            let runtimeMaterials = {};
            runtimeMaterials[defaultMaterial.name] = defaultMaterial;
            runtimeMaterials[defaultVertexColorMaterial.name] = defaultVertexColorMaterial;
            runtimeMaterials[defaultLineMaterial.name] = defaultLineMaterial;
            runtimeMaterials[defaultPointMaterial.name] = defaultPointMaterial;
            this.addMaterials(runtimeMaterials, overrideExisting);
        },
        addPayloadMaterials: function (materialPayload) {
            let material, materialName;
            let materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
            let newMaterials = {};
            if (materialCloneInstructions !== undefined && materialCloneInstructions !== null) {
                let materialNameOrg = materialCloneInstructions.materialNameOrg;
                materialNameOrg = materialNameOrg !== undefined && materialNameOrg !== null ? materialNameOrg : '';
                let materialOrg = this.materials[materialNameOrg];
                if (materialOrg) {
                    material = materialOrg.clone();
                    materialName = materialCloneInstructions.materialName;
                    material.name = materialName;
                    Object.assign(material, materialCloneInstructions.materialProperties);
                    this.materials[materialName] = material;
                    newMaterials[materialName] = material;
                } else {
                    if (this.logging.enabled) {
                        console.info('Requested material "' + materialNameOrg + '" is not available!');
                    }
                }
            }
            let materials = materialPayload.materials.serializedMaterials;
            if (materials !== undefined && materials !== null && Object.keys(materials).length > 0) {
                let loader = new THREE.MaterialLoader();
                let materialJson;
                for (materialName in materials) {
                    materialJson = materials[materialName];
                    if (materialJson !== undefined && materialJson !== null) {
                        material = loader.parse(materialJson);
                        if (this.logging.enabled) {
                            console.info('De-serialized material with name "' + materialName + '" will be added.');
                        }
                        this.materials[materialName] = material;
                        newMaterials[materialName] = material;
                    }
                }
            }
            materials = materialPayload.materials.runtimeMaterials;
            newMaterials = this.addMaterials(materials, true, newMaterials);
            return newMaterials;
        },
        addMaterials: function (materials, overrideExisting, newMaterials) {
            if (newMaterials === undefined || newMaterials === null) {
                newMaterials = {};
            }
            if (materials !== undefined && materials !== null && Object.keys(materials).length > 0) {
                let material;
                let existingMaterial;
                let add;
                for (let materialName in materials) {
                    material = materials[materialName];
                    add = overrideExisting === true;
                    if (!add) {
                        existingMaterial = this.materials[materialName];
                        add = existingMaterial === null || existingMaterial === undefined;
                    }
                    if (add) {
                        this.materials[materialName] = material;
                        newMaterials[materialName] = material;
                    }
                    if (this.logging.enabled && this.logging.debug) {
                        console.info('Material with name "' + materialName + '" was added.');
                    }
                }
            }
            if (this.callbacks.onLoadMaterials) {
                this.callbacks.onLoadMaterials(newMaterials);
            }
            return newMaterials;
        },
        getMaterials: function () {
            return this.materials;
        },
        getMaterial: function (materialName) {
            return this.materials[materialName];
        },
        getMaterialsJSON: function () {
            let materialsJSON = {};
            let material;
            for (let materialName in this.materials) {
                material = this.materials[materialName];
                materialsJSON[materialName] = material.toJSON();
            }
            return materialsJSON;
        },
        clearMaterials: function () {
            this.materials = {};
        }
    };
    return MaterialHandler;
});