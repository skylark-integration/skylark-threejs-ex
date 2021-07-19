define([
    'skylark-threejs'
], function (THREE) {
    'use strict';
    const MeshReceiver = function (materialHandler) {
        this.logging = {
            enabled: false,
            debug: false
        };
        this.callbacks = {
            onProgress: null,
            onMeshAlter: null
        };
        this.materialHandler = materialHandler;
    };
    MeshReceiver.prototype = {
        constructor: MeshReceiver,
        setLogging: function (enabled, debug) {
            this.logging.enabled = enabled === true;
            this.logging.debug = debug === true;
        },
        _setCallbacks: function (onProgress, onMeshAlter) {
            if (onProgress !== null && onProgress !== undefined && onProgress instanceof Function) {
                this.callbacks.onProgress = onProgress;
            }
            if (onMeshAlter !== null && onMeshAlter !== undefined && onMeshAlter instanceof Function) {
                this.callbacks.onMeshAlter = onMeshAlter;
            }
        },
        buildMeshes: function (meshPayload) {
            let meshName = meshPayload.params.meshName;
            let buffers = meshPayload.buffers;
            let bufferGeometry = new THREE.BufferGeometry();
            if (buffers.vertices !== undefined && buffers.vertices !== null) {
                bufferGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffers.vertices), 3));
            }
            if (buffers.indices !== undefined && buffers.indices !== null) {
                bufferGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffers.indices), 1));
            }
            if (buffers.colors !== undefined && buffers.colors !== null) {
                bufferGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(buffers.colors), 3));
            }
            if (buffers.normals !== undefined && buffers.normals !== null) {
                bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(buffers.normals), 3));
            } else {
                bufferGeometry.computeVertexNormals();
            }
            if (buffers.uvs !== undefined && buffers.uvs !== null) {
                bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(buffers.uvs), 2));
            }
            if (buffers.skinIndex !== undefined && buffers.skinIndex !== null) {
                bufferGeometry.setAttribute('skinIndex', new THREE.BufferAttribute(new Uint16Array(buffers.skinIndex), 4));
            }
            if (buffers.skinWeight !== undefined && buffers.skinWeight !== null) {
                bufferGeometry.setAttribute('skinWeight', new THREE.BufferAttribute(new Float32Array(buffers.skinWeight), 4));
            }
            let material, materialName, key;
            let materialNames = meshPayload.materials.materialNames;
            let createMultiMaterial = meshPayload.materials.multiMaterial;
            let multiMaterials = [];
            for (key in materialNames) {
                materialName = materialNames[key];
                material = this.materialHandler.getMaterial(materialName);
                if (createMultiMaterial)
                    multiMaterials.push(material);
            }
            if (createMultiMaterial) {
                material = multiMaterials;
                let materialGroups = meshPayload.materials.materialGroups;
                let materialGroup;
                for (key in materialGroups) {
                    materialGroup = materialGroups[key];
                    bufferGeometry.addGroup(materialGroup.start, materialGroup.count, materialGroup.index);
                }
            }
            let meshes = [];
            let mesh;
            let callbackOnMeshAlterResult;
            let useOrgMesh = true;
            let geometryType = meshPayload.geometryType === null ? 0 : meshPayload.geometryType;
            if (this.callbacks.onMeshAlter) {
                callbackOnMeshAlterResult = this.callbacks.onMeshAlter({
                    detail: {
                        meshName: meshName,
                        bufferGeometry: bufferGeometry,
                        material: material,
                        geometryType: geometryType
                    }
                });
            }
            if (callbackOnMeshAlterResult) {
                if (callbackOnMeshAlterResult.isDisregardMesh()) {
                    useOrgMesh = false;
                } else if (callbackOnMeshAlterResult.providesAlteredMeshes()) {
                    for (let i in callbackOnMeshAlterResult.meshes) {
                        meshes.push(callbackOnMeshAlterResult.meshes[i]);
                    }
                    useOrgMesh = false;
                }
            }
            if (useOrgMesh) {
                if (meshPayload.computeBoundingSphere)
                    bufferGeometry.computeBoundingSphere();
                if (geometryType === 0) {
                    mesh = new THREE.Mesh(bufferGeometry, material);
                } else if (geometryType === 1) {
                    mesh = new THREE.LineSegments(bufferGeometry, material);
                } else {
                    mesh = new THREE.Points(bufferGeometry, material);
                }
                mesh.name = meshName;
                meshes.push(mesh);
            }
            let progressMessage = meshPayload.params.meshName;
            if (meshes.length > 0) {
                let meshNames = [];
                for (let i in meshes) {
                    mesh = meshes[i];
                    meshNames[i] = mesh.name;
                }
                progressMessage += ': Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
                progressMessage += ' (' + (meshPayload.progress.numericalValue * 100).toFixed(2) + '%)';
            } else {
                progressMessage += ': Not adding mesh: ' + meshName;
                progressMessage += ' (' + (meshPayload.progress.numericalValue * 100).toFixed(2) + '%)';
            }
            if (this.callbacks.onProgress) {
                this.callbacks.onProgress('progress', progressMessage, meshPayload.progress.numericalValue);
            }
            return meshes;
        }
    };

    return  MeshReceiver;
});