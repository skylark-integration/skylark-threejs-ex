define(["skylark-threejs"], function (a) {
    'use strict';
    var GLTFLoader = function () {
        function GLTFLoader(manager) {
            a.Loader.call(this, manager);
            this.dracoLoader = null;
            this.ddsLoader = null;
        }
        GLTFLoader.prototype = Object.assign(Object.create(a.Loader.prototype), {
            constructor: GLTFLoader,
            load: function (url, onLoad, onProgress, onError) {
                var scope = this;
                var resourcePath;
                if (this.resourcePath !== '') {
                    resourcePath = this.resourcePath;
                } else if (this.path !== '') {
                    resourcePath = this.path;
                } else {
                    resourcePath = a.LoaderUtils.extractUrlBase(url);
                }
                scope.manager.itemStart(url);
                var _onError = function (e) {
                    if (onError) {
                        onError(e);
                    } else {
                        console.error(e);
                    }
                    scope.manager.itemError(url);
                    scope.manager.itemEnd(url);
                };
                var loader = new a.FileLoader(scope.manager);
                loader.setPath(this.path);
                loader.setResponseType('arraybuffer');
                if (scope.crossOrigin === 'use-credentials') {
                    loader.setWithCredentials(true);
                }
                loader.load(url, function (data) {
                    try {
                        scope.parse(data, resourcePath, function (gltf) {
                            onLoad(gltf);
                            scope.manager.itemEnd(url);
                        }, _onError);
                    } catch (e) {
                        _onError(e);
                    }
                }, onProgress, _onError);
            },
            setDRACOLoader: function (dracoLoader) {
                this.dracoLoader = dracoLoader;
                return this;
            },
            setDDSLoader: function (ddsLoader) {
                this.ddsLoader = ddsLoader;
                return this;
            },
            parse: function (data, path, onLoad, onError) {
                var content;
                var extensions = {};
                if (typeof data === 'string') {
                    content = data;
                } else {
                    var magic = a.LoaderUtils.decodeText(new Uint8Array(data, 0, 4));
                    if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
                        try {
                            extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
                        } catch (error) {
                            if (onError)
                                onError(error);
                            return;
                        }
                        content = extensions[EXTENSIONS.KHR_BINARY_GLTF].content;
                    } else {
                        content = a.LoaderUtils.decodeText(new Uint8Array(data));
                    }
                }
                var json = JSON.parse(content);
                if (json.asset === undefined || json.asset.version[0] < 2) {
                    if (onError)
                        onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'));
                    return;
                }
                if (json.extensionsUsed) {
                    for (var i = 0; i < json.extensionsUsed.length; ++i) {
                        var extensionName = json.extensionsUsed[i];
                        var extensionsRequired = json.extensionsRequired || [];
                        switch (extensionName) {
                        case EXTENSIONS.KHR_LIGHTS_PUNCTUAL:
                            extensions[extensionName] = new GLTFLightsExtension(json);
                            break;
                        case EXTENSIONS.KHR_MATERIALS_CLEARCOAT:
                            extensions[extensionName] = new GLTFMaterialsClearcoatExtension();
                            break;
                        case EXTENSIONS.KHR_MATERIALS_UNLIT:
                            extensions[extensionName] = new GLTFMaterialsUnlitExtension();
                            break;
                        case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
                            extensions[extensionName] = new GLTFMaterialsPbrSpecularGlossinessExtension();
                            break;
                        case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
                            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
                            break;
                        case EXTENSIONS.MSFT_TEXTURE_DDS:
                            extensions[extensionName] = new GLTFTextureDDSExtension(this.ddsLoader);
                            break;
                        case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
                            extensions[extensionName] = new GLTFTextureTransformExtension();
                            break;
                        case EXTENSIONS.KHR_MESH_QUANTIZATION:
                            extensions[extensionName] = new GLTFMeshQuantizationExtension();
                            break;
                        default:
                            if (extensionsRequired.indexOf(extensionName) >= 0) {
                                console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');
                            }
                        }
                    }
                }
                var parser = new GLTFParser(json, extensions, {
                    path: path || this.resourcePath || '',
                    crossOrigin: this.crossOrigin,
                    manager: this.manager
                });
                parser.parse(onLoad, onError);
            }
        });
        function GLTFRegistry() {
            var objects = {};
            return {
                get: function (key) {
                    return objects[key];
                },
                add: function (key, object) {
                    objects[key] = object;
                },
                remove: function (key) {
                    delete objects[key];
                },
                removeAll: function () {
                    objects = {};
                }
            };
        }
        var EXTENSIONS = {
            KHR_BINARY_GLTF: 'KHR_binary_glTF',
            KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
            KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
            KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
            KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
            KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
            KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
            KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
            MSFT_TEXTURE_DDS: 'MSFT_texture_dds'
        };
        function GLTFTextureDDSExtension(ddsLoader) {
            if (!ddsLoader) {
                throw new Error('THREE.GLTFLoader: Attempting to load .dds texture without importing DDSLoader');
            }
            this.name = EXTENSIONS.MSFT_TEXTURE_DDS;
            this.ddsLoader = ddsLoader;
        }
        function GLTFLightsExtension(json) {
            this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
            var extension = json.extensions && json.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL] || {};
            this.lightDefs = extension.lights || [];
        }
        GLTFLightsExtension.prototype.loadLight = function (lightIndex) {
            var lightDef = this.lightDefs[lightIndex];
            var lightNode;
            var color = new a.Color(16777215);
            if (lightDef.color !== undefined)
                color.fromArray(lightDef.color);
            var range = lightDef.range !== undefined ? lightDef.range : 0;
            switch (lightDef.type) {
            case 'directional':
                lightNode = new a.DirectionalLight(color);
                lightNode.target.position.set(0, 0, -1);
                lightNode.add(lightNode.target);
                break;
            case 'point':
                lightNode = new a.PointLight(color);
                lightNode.distance = range;
                break;
            case 'spot':
                lightNode = new a.SpotLight(color);
                lightNode.distance = range;
                lightDef.spot = lightDef.spot || {};
                lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
                lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4;
                lightNode.angle = lightDef.spot.outerConeAngle;
                lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
                lightNode.target.position.set(0, 0, -1);
                lightNode.add(lightNode.target);
                break;
            default:
                throw new Error('THREE.GLTFLoader: Unexpected light type, "' + lightDef.type + '".');
            }
            lightNode.position.set(0, 0, 0);
            lightNode.decay = 2;
            if (lightDef.intensity !== undefined)
                lightNode.intensity = lightDef.intensity;
            lightNode.name = lightDef.name || 'light_' + lightIndex;
            return Promise.resolve(lightNode);
        };
        function GLTFMaterialsUnlitExtension() {
            this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
        }
        GLTFMaterialsUnlitExtension.prototype.getMaterialType = function () {
            return a.MeshBasicMaterial;
        };
        GLTFMaterialsUnlitExtension.prototype.extendParams = function (materialParams, materialDef, parser) {
            var pending = [];
            materialParams.color = new a.Color(1, 1, 1);
            materialParams.opacity = 1;
            var metallicRoughness = materialDef.pbrMetallicRoughness;
            if (metallicRoughness) {
                if (Array.isArray(metallicRoughness.baseColorFactor)) {
                    var array = metallicRoughness.baseColorFactor;
                    materialParams.color.fromArray(array);
                    materialParams.opacity = array[3];
                }
                if (metallicRoughness.baseColorTexture !== undefined) {
                    pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));
                }
            }
            return Promise.all(pending);
        };
        function GLTFMaterialsClearcoatExtension() {
            this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
        }
        GLTFMaterialsClearcoatExtension.prototype.getMaterialType = function () {
            return a.MeshPhysicalMaterial;
        };
        GLTFMaterialsClearcoatExtension.prototype.extendParams = function (materialParams, materialDef, parser) {
            var pending = [];
            var extension = materialDef.extensions[this.name];
            if (extension.clearcoatFactor !== undefined) {
                materialParams.clearcoat = extension.clearcoatFactor;
            }
            if (extension.clearcoatTexture !== undefined) {
                pending.push(parser.assignTexture(materialParams, 'clearcoatMap', extension.clearcoatTexture));
            }
            if (extension.clearcoatRoughnessFactor !== undefined) {
                materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
            }
            if (extension.clearcoatRoughnessTexture !== undefined) {
                pending.push(parser.assignTexture(materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture));
            }
            if (extension.clearcoatNormalTexture !== undefined) {
                pending.push(parser.assignTexture(materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture));
                if (extension.clearcoatNormalTexture.scale !== undefined) {
                    var scale = extension.clearcoatNormalTexture.scale;
                    materialParams.clearcoatNormalScale = new a.Vector2(scale, scale);
                }
            }
            return Promise.all(pending);
        };
        var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
        var BINARY_EXTENSION_HEADER_LENGTH = 12;
        var BINARY_EXTENSION_CHUNK_TYPES = {
            JSON: 1313821514,
            BIN: 5130562
        };
        function GLTFBinaryExtension(data) {
            this.name = EXTENSIONS.KHR_BINARY_GLTF;
            this.content = null;
            this.body = null;
            var headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
            this.header = {
                magic: a.LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
                version: headerView.getUint32(4, true),
                length: headerView.getUint32(8, true)
            };
            if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
                throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');
            } else if (this.header.version < 2) {
                throw new Error('THREE.GLTFLoader: Legacy binary file detected.');
            }
            var chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
            var chunkIndex = 0;
            while (chunkIndex < chunkView.byteLength) {
                var chunkLength = chunkView.getUint32(chunkIndex, true);
                chunkIndex += 4;
                var chunkType = chunkView.getUint32(chunkIndex, true);
                chunkIndex += 4;
                if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
                    var contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
                    this.content = a.LoaderUtils.decodeText(contentArray);
                } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
                    var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
                    this.body = data.slice(byteOffset, byteOffset + chunkLength);
                }
                chunkIndex += chunkLength;
            }
            if (this.content === null) {
                throw new Error('THREE.GLTFLoader: JSON content not found.');
            }
        }
        function GLTFDracoMeshCompressionExtension(json, dracoLoader) {
            if (!dracoLoader) {
                throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.');
            }
            this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
            this.json = json;
            this.dracoLoader = dracoLoader;
            this.dracoLoader.preload();
        }
        GLTFDracoMeshCompressionExtension.prototype.decodePrimitive = function (primitive, parser) {
            var json = this.json;
            var dracoLoader = this.dracoLoader;
            var bufferViewIndex = primitive.extensions[this.name].bufferView;
            var gltfAttributeMap = primitive.extensions[this.name].attributes;
            var threeAttributeMap = {};
            var attributeNormalizedMap = {};
            var attributeTypeMap = {};
            for (var attributeName in gltfAttributeMap) {
                var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
                threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
            }
            for (attributeName in primitive.attributes) {
                var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
                if (gltfAttributeMap[attributeName] !== undefined) {
                    var accessorDef = json.accessors[primitive.attributes[attributeName]];
                    var componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
                    attributeTypeMap[threeAttributeName] = componentType;
                    attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
                }
            }
            return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {
                return new Promise(function (resolve) {
                    dracoLoader.decodeDracoFile(bufferView, function (geometry) {
                        for (var attributeName in geometry.attributes) {
                            var attribute = geometry.attributes[attributeName];
                            var normalized = attributeNormalizedMap[attributeName];
                            if (normalized !== undefined)
                                attribute.normalized = normalized;
                        }
                        resolve(geometry);
                    }, threeAttributeMap, attributeTypeMap);
                });
            });
        };
        function GLTFTextureTransformExtension() {
            this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
        }
        GLTFTextureTransformExtension.prototype.extendTexture = function (texture, transform) {
            texture = texture.clone();
            if (transform.offset !== undefined) {
                texture.offset.fromArray(transform.offset);
            }
            if (transform.rotation !== undefined) {
                texture.rotation = transform.rotation;
            }
            if (transform.scale !== undefined) {
                texture.repeat.fromArray(transform.scale);
            }
            if (transform.texCoord !== undefined) {
                console.warn('THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.');
            }
            texture.needsUpdate = true;
            return texture;
        };
        function GLTFMeshStandardSGMaterial(params) {
            a.MeshStandardMaterial.call(this);
            this.isGLTFSpecularGlossinessMaterial = true;
            var specularMapParsFragmentChunk = [
                '#ifdef USE_SPECULARMAP',
                '\tuniform sampler2D specularMap;',
                '#endif'
            ].join('\n');
            var glossinessMapParsFragmentChunk = [
                '#ifdef USE_GLOSSINESSMAP',
                '\tuniform sampler2D glossinessMap;',
                '#endif'
            ].join('\n');
            var specularMapFragmentChunk = [
                'vec3 specularFactor = specular;',
                '#ifdef USE_SPECULARMAP',
                '\tvec4 texelSpecular = texture2D( specularMap, vUv );',
                '\ttexelSpecular = sRGBToLinear( texelSpecular );',
                '\t// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
                '\tspecularFactor *= texelSpecular.rgb;',
                '#endif'
            ].join('\n');
            var glossinessMapFragmentChunk = [
                'float glossinessFactor = glossiness;',
                '#ifdef USE_GLOSSINESSMAP',
                '\tvec4 texelGlossiness = texture2D( glossinessMap, vUv );',
                '\t// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
                '\tglossinessFactor *= texelGlossiness.a;',
                '#endif'
            ].join('\n');
            var lightPhysicalFragmentChunk = [
                'PhysicalMaterial material;',
                'material.diffuseColor = diffuseColor.rgb;',
                'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
                'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
                'material.specularRoughness = max( 1.0 - glossinessFactor, 0.0525 );// 0.0525 corresponds to the base mip of a 256 cubemap.',
                'material.specularRoughness += geometryRoughness;',
                'material.specularRoughness = min( material.specularRoughness, 1.0 );',
                'material.specularColor = specularFactor.rgb;'
            ].join('\n');
            var uniforms = {
                specular: { value: new a.Color().setHex(16777215) },
                glossiness: { value: 1 },
                specularMap: { value: null },
                glossinessMap: { value: null }
            };
            this._extraUniforms = uniforms;
            this.onBeforeCompile = function (shader) {
                for (var uniformName in uniforms) {
                    shader.uniforms[uniformName] = uniforms[uniformName];
                }
                shader.fragmentShader = shader.fragmentShader.replace('uniform float roughness;', 'uniform vec3 specular;');
                shader.fragmentShader = shader.fragmentShader.replace('uniform float metalness;', 'uniform float glossiness;');
                shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk);
                shader.fragmentShader = shader.fragmentShader.replace('#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk);
                shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', specularMapFragmentChunk);
                shader.fragmentShader = shader.fragmentShader.replace('#include <metalnessmap_fragment>', glossinessMapFragmentChunk);
                shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_fragment>', lightPhysicalFragmentChunk);
            };
            Object.defineProperties(this, {
                specular: {
                    get: function () {
                        return uniforms.specular.value;
                    },
                    set: function (v) {
                        uniforms.specular.value = v;
                    }
                },
                specularMap: {
                    get: function () {
                        return uniforms.specularMap.value;
                    },
                    set: function (v) {
                        uniforms.specularMap.value = v;
                    }
                },
                glossiness: {
                    get: function () {
                        return uniforms.glossiness.value;
                    },
                    set: function (v) {
                        uniforms.glossiness.value = v;
                    }
                },
                glossinessMap: {
                    get: function () {
                        return uniforms.glossinessMap.value;
                    },
                    set: function (v) {
                        uniforms.glossinessMap.value = v;
                        if (v) {
                            this.defines.USE_GLOSSINESSMAP = '';
                            this.defines.USE_ROUGHNESSMAP = '';
                        } else {
                            delete this.defines.USE_ROUGHNESSMAP;
                            delete this.defines.USE_GLOSSINESSMAP;
                        }
                    }
                }
            });
            delete this.metalness;
            delete this.roughness;
            delete this.metalnessMap;
            delete this.roughnessMap;
            this.setValues(params);
        }
        GLTFMeshStandardSGMaterial.prototype = Object.create(a.MeshStandardMaterial.prototype);
        GLTFMeshStandardSGMaterial.prototype.constructor = GLTFMeshStandardSGMaterial;
        GLTFMeshStandardSGMaterial.prototype.copy = function (source) {
            a.MeshStandardMaterial.prototype.copy.call(this, source);
            this.specularMap = source.specularMap;
            this.specular.copy(source.specular);
            this.glossinessMap = source.glossinessMap;
            this.glossiness = source.glossiness;
            delete this.metalness;
            delete this.roughness;
            delete this.metalnessMap;
            delete this.roughnessMap;
            return this;
        };
        function GLTFMaterialsPbrSpecularGlossinessExtension() {
            return {
                name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,
                specularGlossinessParams: [
                    'color',
                    'map',
                    'lightMap',
                    'lightMapIntensity',
                    'aoMap',
                    'aoMapIntensity',
                    'emissive',
                    'emissiveIntensity',
                    'emissiveMap',
                    'bumpMap',
                    'bumpScale',
                    'normalMap',
                    'normalMapType',
                    'displacementMap',
                    'displacementScale',
                    'displacementBias',
                    'specularMap',
                    'specular',
                    'glossinessMap',
                    'glossiness',
                    'alphaMap',
                    'envMap',
                    'envMapIntensity',
                    'refractionRatio'
                ],
                getMaterialType: function () {
                    return GLTFMeshStandardSGMaterial;
                },
                extendParams: function (materialParams, materialDef, parser) {
                    var pbrSpecularGlossiness = materialDef.extensions[this.name];
                    materialParams.color = new a.Color(1, 1, 1);
                    materialParams.opacity = 1;
                    var pending = [];
                    if (Array.isArray(pbrSpecularGlossiness.diffuseFactor)) {
                        var array = pbrSpecularGlossiness.diffuseFactor;
                        materialParams.color.fromArray(array);
                        materialParams.opacity = array[3];
                    }
                    if (pbrSpecularGlossiness.diffuseTexture !== undefined) {
                        pending.push(parser.assignTexture(materialParams, 'map', pbrSpecularGlossiness.diffuseTexture));
                    }
                    materialParams.emissive = new a.Color(0, 0, 0);
                    materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1;
                    materialParams.specular = new a.Color(1, 1, 1);
                    if (Array.isArray(pbrSpecularGlossiness.specularFactor)) {
                        materialParams.specular.fromArray(pbrSpecularGlossiness.specularFactor);
                    }
                    if (pbrSpecularGlossiness.specularGlossinessTexture !== undefined) {
                        var specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
                        pending.push(parser.assignTexture(materialParams, 'glossinessMap', specGlossMapDef));
                        pending.push(parser.assignTexture(materialParams, 'specularMap', specGlossMapDef));
                    }
                    return Promise.all(pending);
                },
                createMaterial: function (materialParams) {
                    var material = new GLTFMeshStandardSGMaterial(materialParams);
                    material.fog = true;
                    material.color = materialParams.color;
                    material.map = materialParams.map === undefined ? null : materialParams.map;
                    material.lightMap = null;
                    material.lightMapIntensity = 1;
                    material.aoMap = materialParams.aoMap === undefined ? null : materialParams.aoMap;
                    material.aoMapIntensity = 1;
                    material.emissive = materialParams.emissive;
                    material.emissiveIntensity = 1;
                    material.emissiveMap = materialParams.emissiveMap === undefined ? null : materialParams.emissiveMap;
                    material.bumpMap = materialParams.bumpMap === undefined ? null : materialParams.bumpMap;
                    material.bumpScale = 1;
                    material.normalMap = materialParams.normalMap === undefined ? null : materialParams.normalMap;
                    material.normalMapType = a.TangentSpaceNormalMap;
                    if (materialParams.normalScale)
                        material.normalScale = materialParams.normalScale;
                    material.displacementMap = null;
                    material.displacementScale = 1;
                    material.displacementBias = 0;
                    material.specularMap = materialParams.specularMap === undefined ? null : materialParams.specularMap;
                    material.specular = materialParams.specular;
                    material.glossinessMap = materialParams.glossinessMap === undefined ? null : materialParams.glossinessMap;
                    material.glossiness = materialParams.glossiness;
                    material.alphaMap = null;
                    material.envMap = materialParams.envMap === undefined ? null : materialParams.envMap;
                    material.envMapIntensity = 1;
                    material.refractionRatio = 0.98;
                    return material;
                }
            };
        }
        function GLTFMeshQuantizationExtension() {
            this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
        }
        function GLTFCubicSplineInterpolant(parameterPositions, sampleValues, sampleSize, resultBuffer) {
            a.Interpolant.call(this, parameterPositions, sampleValues, sampleSize, resultBuffer);
        }
        GLTFCubicSplineInterpolant.prototype = Object.create(a.Interpolant.prototype);
        GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;
        GLTFCubicSplineInterpolant.prototype.copySampleValue_ = function (index) {
            var result = this.resultBuffer, values = this.sampleValues, valueSize = this.valueSize, offset = index * valueSize * 3 + valueSize;
            for (var i = 0; i !== valueSize; i++) {
                result[i] = values[offset + i];
            }
            return result;
        };
        GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;
        GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;
        GLTFCubicSplineInterpolant.prototype.interpolate_ = function (i1, t0, t, t1) {
            var result = this.resultBuffer;
            var values = this.sampleValues;
            var stride = this.valueSize;
            var stride2 = stride * 2;
            var stride3 = stride * 3;
            var td = t1 - t0;
            var p = (t - t0) / td;
            var pp = p * p;
            var ppp = pp * p;
            var offset1 = i1 * stride3;
            var offset0 = offset1 - stride3;
            var s2 = -2 * ppp + 3 * pp;
            var s3 = ppp - pp;
            var s0 = 1 - s2;
            var s1 = s3 - pp + p;
            for (var i = 0; i !== stride; i++) {
                var p0 = values[offset0 + i + stride];
                var m0 = values[offset0 + i + stride2] * td;
                var p1 = values[offset1 + i + stride];
                var m1 = values[offset1 + i] * td;
                result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
            }
            return result;
        };
        var WEBGL_CONSTANTS = {
            FLOAT: 5126,
            FLOAT_MAT3: 35675,
            FLOAT_MAT4: 35676,
            FLOAT_VEC2: 35664,
            FLOAT_VEC3: 35665,
            FLOAT_VEC4: 35666,
            LINEAR: 9729,
            REPEAT: 10497,
            SAMPLER_2D: 35678,
            POINTS: 0,
            LINES: 1,
            LINE_LOOP: 2,
            LINE_STRIP: 3,
            TRIANGLES: 4,
            TRIANGLE_STRIP: 5,
            TRIANGLE_FAN: 6,
            UNSIGNED_BYTE: 5121,
            UNSIGNED_SHORT: 5123
        };
        var WEBGL_COMPONENT_TYPES = {
            5120: Int8Array,
            5121: Uint8Array,
            5122: Int16Array,
            5123: Uint16Array,
            5125: Uint32Array,
            5126: Float32Array
        };
        var WEBGL_FILTERS = {
            9728: a.NearestFilter,
            9729: a.LinearFilter,
            9984: a.NearestMipmapNearestFilter,
            9985: a.LinearMipmapNearestFilter,
            9986: a.NearestMipmapLinearFilter,
            9987: a.LinearMipmapLinearFilter
        };
        var WEBGL_WRAPPINGS = {
            33071: a.ClampToEdgeWrapping,
            33648: a.MirroredRepeatWrapping,
            10497: a.RepeatWrapping
        };
        var WEBGL_TYPE_SIZES = {
            'SCALAR': 1,
            'VEC2': 2,
            'VEC3': 3,
            'VEC4': 4,
            'MAT2': 4,
            'MAT3': 9,
            'MAT4': 16
        };
        var ATTRIBUTES = {
            POSITION: 'position',
            NORMAL: 'normal',
            TANGENT: 'tangent',
            TEXCOORD_0: 'uv',
            TEXCOORD_1: 'uv2',
            COLOR_0: 'color',
            WEIGHTS_0: 'skinWeight',
            JOINTS_0: 'skinIndex'
        };
        var PATH_PROPERTIES = {
            scale: 'scale',
            translation: 'position',
            rotation: 'quaternion',
            weights: 'morphTargetInfluences'
        };
        var INTERPOLATION = {
            CUBICSPLINE: undefined,
            LINEAR: a.InterpolateLinear,
            STEP: a.InterpolateDiscrete
        };
        var ALPHA_MODES = {
            OPAQUE: 'OPAQUE',
            MASK: 'MASK',
            BLEND: 'BLEND'
        };
        var MIME_TYPE_FORMATS = {
            'image/png': a.RGBAFormat,
            'image/jpeg': a.RGBFormat
        };
        function resolveURL(url, path) {
            if (typeof url !== 'string' || url === '')
                return '';
            if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
                path = path.replace(/(^https?:\/\/[^\/]+).*/i, '$1');
            }
            if (/^(https?:)?\/\//i.test(url))
                return url;
            if (/^data:.*,.*$/i.test(url))
                return url;
            if (/^blob:.*$/i.test(url))
                return url;
            return path + url;
        }
        function createDefaultMaterial(cache) {
            if (cache['DefaultMaterial'] === undefined) {
                cache['DefaultMaterial'] = new a.MeshStandardMaterial({
                    color: 16777215,
                    emissive: 0,
                    metalness: 1,
                    roughness: 1,
                    transparent: false,
                    depthTest: true,
                    side: a.FrontSide
                });
            }
            return cache['DefaultMaterial'];
        }
        function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
            for (var name in objectDef.extensions) {
                if (knownExtensions[name] === undefined) {
                    object.userData.gltfExtensions = object.userData.gltfExtensions || {};
                    object.userData.gltfExtensions[name] = objectDef.extensions[name];
                }
            }
        }
        function assignExtrasToUserData(object, gltfDef) {
            if (gltfDef.extras !== undefined) {
                if (typeof gltfDef.extras === 'object') {
                    Object.assign(object.userData, gltfDef.extras);
                } else {
                    console.warn('THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras);
                }
            }
        }
        function addMorphTargets(geometry, targets, parser) {
            var hasMorphPosition = false;
            var hasMorphNormal = false;
            for (var i = 0, il = targets.length; i < il; i++) {
                var target = targets[i];
                if (target.POSITION !== undefined)
                    hasMorphPosition = true;
                if (target.NORMAL !== undefined)
                    hasMorphNormal = true;
                if (hasMorphPosition && hasMorphNormal)
                    break;
            }
            if (!hasMorphPosition && !hasMorphNormal)
                return Promise.resolve(geometry);
            var pendingPositionAccessors = [];
            var pendingNormalAccessors = [];
            for (var i = 0, il = targets.length; i < il; i++) {
                var target = targets[i];
                if (hasMorphPosition) {
                    var pendingAccessor = target.POSITION !== undefined ? parser.getDependency('accessor', target.POSITION) : geometry.attributes.position;
                    pendingPositionAccessors.push(pendingAccessor);
                }
                if (hasMorphNormal) {
                    var pendingAccessor = target.NORMAL !== undefined ? parser.getDependency('accessor', target.NORMAL) : geometry.attributes.normal;
                    pendingNormalAccessors.push(pendingAccessor);
                }
            }
            return Promise.all([
                Promise.all(pendingPositionAccessors),
                Promise.all(pendingNormalAccessors)
            ]).then(function (accessors) {
                var morphPositions = accessors[0];
                var morphNormals = accessors[1];
                if (hasMorphPosition)
                    geometry.morphAttributes.position = morphPositions;
                if (hasMorphNormal)
                    geometry.morphAttributes.normal = morphNormals;
                geometry.morphTargetsRelative = true;
                return geometry;
            });
        }
        function updateMorphTargets(mesh, meshDef) {
            mesh.updateMorphTargets();
            if (meshDef.weights !== undefined) {
                for (var i = 0, il = meshDef.weights.length; i < il; i++) {
                    mesh.morphTargetInfluences[i] = meshDef.weights[i];
                }
            }
            if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
                var targetNames = meshDef.extras.targetNames;
                if (mesh.morphTargetInfluences.length === targetNames.length) {
                    mesh.morphTargetDictionary = {};
                    for (var i = 0, il = targetNames.length; i < il; i++) {
                        mesh.morphTargetDictionary[targetNames[i]] = i;
                    }
                } else {
                    console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.');
                }
            }
        }
        function createPrimitiveKey(primitiveDef) {
            var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
            var geometryKey;
            if (dracoExtension) {
                geometryKey = 'draco:' + dracoExtension.bufferView + ':' + dracoExtension.indices + ':' + createAttributesKey(dracoExtension.attributes);
            } else {
                geometryKey = primitiveDef.indices + ':' + createAttributesKey(primitiveDef.attributes) + ':' + primitiveDef.mode;
            }
            return geometryKey;
        }
        function createAttributesKey(attributes) {
            var attributesKey = '';
            var keys = Object.keys(attributes).sort();
            for (var i = 0, il = keys.length; i < il; i++) {
                attributesKey += keys[i] + ':' + attributes[keys[i]] + ';';
            }
            return attributesKey;
        }
        function GLTFParser(json, extensions, options) {
            this.json = json || {};
            this.extensions = extensions || {};
            this.options = options || {};
            this.cache = new GLTFRegistry();
            this.primitiveCache = {};
            this.textureLoader = new a.TextureLoader(this.options.manager);
            this.textureLoader.setCrossOrigin(this.options.crossOrigin);
            this.fileLoader = new a.FileLoader(this.options.manager);
            this.fileLoader.setResponseType('arraybuffer');
            if (this.options.crossOrigin === 'use-credentials') {
                this.fileLoader.setWithCredentials(true);
            }
        }
        GLTFParser.prototype.parse = function (onLoad, onError) {
            var parser = this;
            var json = this.json;
            var extensions = this.extensions;
            this.cache.removeAll();
            this.markDefs();
            Promise.all([
                this.getDependencies('scene'),
                this.getDependencies('animation'),
                this.getDependencies('camera')
            ]).then(function (dependencies) {
                var result = {
                    scene: dependencies[0][json.scene || 0],
                    scenes: dependencies[0],
                    animations: dependencies[1],
                    cameras: dependencies[2],
                    asset: json.asset,
                    parser: parser,
                    userData: {}
                };
                addUnknownExtensionsToUserData(extensions, result, json);
                assignExtrasToUserData(result, json);
                onLoad(result);
            }).catch(onError);
        };
        GLTFParser.prototype.markDefs = function () {
            var nodeDefs = this.json.nodes || [];
            var skinDefs = this.json.skins || [];
            var meshDefs = this.json.meshes || [];
            var meshReferences = {};
            var meshUses = {};
            for (var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
                var joints = skinDefs[skinIndex].joints;
                for (var i = 0, il = joints.length; i < il; i++) {
                    nodeDefs[joints[i]].isBone = true;
                }
            }
            for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
                var nodeDef = nodeDefs[nodeIndex];
                if (nodeDef.mesh !== undefined) {
                    if (meshReferences[nodeDef.mesh] === undefined) {
                        meshReferences[nodeDef.mesh] = meshUses[nodeDef.mesh] = 0;
                    }
                    meshReferences[nodeDef.mesh]++;
                    if (nodeDef.skin !== undefined) {
                        meshDefs[nodeDef.mesh].isSkinnedMesh = true;
                    }
                }
            }
            this.json.meshReferences = meshReferences;
            this.json.meshUses = meshUses;
        };
        GLTFParser.prototype.getDependency = function (type, index) {
            var cacheKey = type + ':' + index;
            var dependency = this.cache.get(cacheKey);
            if (!dependency) {
                switch (type) {
                case 'scene':
                    dependency = this.loadScene(index);
                    break;
                case 'node':
                    dependency = this.loadNode(index);
                    break;
                case 'mesh':
                    dependency = this.loadMesh(index);
                    break;
                case 'accessor':
                    dependency = this.loadAccessor(index);
                    break;
                case 'bufferView':
                    dependency = this.loadBufferView(index);
                    break;
                case 'buffer':
                    dependency = this.loadBuffer(index);
                    break;
                case 'material':
                    dependency = this.loadMaterial(index);
                    break;
                case 'texture':
                    dependency = this.loadTexture(index);
                    break;
                case 'skin':
                    dependency = this.loadSkin(index);
                    break;
                case 'animation':
                    dependency = this.loadAnimation(index);
                    break;
                case 'camera':
                    dependency = this.loadCamera(index);
                    break;
                case 'light':
                    dependency = this.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].loadLight(index);
                    break;
                default:
                    throw new Error('Unknown type: ' + type);
                }
                this.cache.add(cacheKey, dependency);
            }
            return dependency;
        };
        GLTFParser.prototype.getDependencies = function (type) {
            var dependencies = this.cache.get(type);
            if (!dependencies) {
                var parser = this;
                var defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || [];
                dependencies = Promise.all(defs.map(function (def, index) {
                    return parser.getDependency(type, index);
                }));
                this.cache.add(type, dependencies);
            }
            return dependencies;
        };
        GLTFParser.prototype.loadBuffer = function (bufferIndex) {
            var bufferDef = this.json.buffers[bufferIndex];
            var loader = this.fileLoader;
            if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
                throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.');
            }
            if (bufferDef.uri === undefined && bufferIndex === 0) {
                return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
            }
            var options = this.options;
            return new Promise(function (resolve, reject) {
                loader.load(resolveURL(bufferDef.uri, options.path), resolve, undefined, function () {
                    reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));
                });
            });
        };
        GLTFParser.prototype.loadBufferView = function (bufferViewIndex) {
            var bufferViewDef = this.json.bufferViews[bufferViewIndex];
            return this.getDependency('buffer', bufferViewDef.buffer).then(function (buffer) {
                var byteLength = bufferViewDef.byteLength || 0;
                var byteOffset = bufferViewDef.byteOffset || 0;
                return buffer.slice(byteOffset, byteOffset + byteLength);
            });
        };
        GLTFParser.prototype.loadAccessor = function (accessorIndex) {
            var parser = this;
            var json = this.json;
            var accessorDef = this.json.accessors[accessorIndex];
            if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
                return Promise.resolve(null);
            }
            var pendingBufferViews = [];
            if (accessorDef.bufferView !== undefined) {
                pendingBufferViews.push(this.getDependency('bufferView', accessorDef.bufferView));
            } else {
                pendingBufferViews.push(null);
            }
            if (accessorDef.sparse !== undefined) {
                pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.indices.bufferView));
                pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.values.bufferView));
            }
            return Promise.all(pendingBufferViews).then(function (bufferViews) {
                var bufferView = bufferViews[0];
                var itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
                var TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
                var elementBytes = TypedArray.BYTES_PER_ELEMENT;
                var itemBytes = elementBytes * itemSize;
                var byteOffset = accessorDef.byteOffset || 0;
                var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[accessorDef.bufferView].byteStride : undefined;
                var normalized = accessorDef.normalized === true;
                var array, bufferAttribute;
                if (byteStride && byteStride !== itemBytes) {
                    var ibSlice = Math.floor(byteOffset / byteStride);
                    var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
                    var ib = parser.cache.get(ibCacheKey);
                    if (!ib) {
                        array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
                        ib = new a.InterleavedBuffer(array, byteStride / elementBytes);
                        parser.cache.add(ibCacheKey, ib);
                    }
                    bufferAttribute = new a.InterleavedBufferAttribute(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
                } else {
                    if (bufferView === null) {
                        array = new TypedArray(accessorDef.count * itemSize);
                    } else {
                        array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
                    }
                    bufferAttribute = new a.BufferAttribute(array, itemSize, normalized);
                }
                if (accessorDef.sparse !== undefined) {
                    var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
                    var TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
                    var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
                    var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
                    var sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
                    var sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);
                    if (bufferView !== null) {
                        bufferAttribute = new a.BufferAttribute(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);
                    }
                    for (var i = 0, il = sparseIndices.length; i < il; i++) {
                        var index = sparseIndices[i];
                        bufferAttribute.setX(index, sparseValues[i * itemSize]);
                        if (itemSize >= 2)
                            bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
                        if (itemSize >= 3)
                            bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
                        if (itemSize >= 4)
                            bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
                        if (itemSize >= 5)
                            throw new Error('THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.');
                    }
                }
                return bufferAttribute;
            });
        };
        GLTFParser.prototype.loadTexture = function (textureIndex) {
            var parser = this;
            var json = this.json;
            var options = this.options;
            var textureLoader = this.textureLoader;
            var URL = self.URL || self.webkitURL;
            var textureDef = json.textures[textureIndex];
            var textureExtensions = textureDef.extensions || {};
            var source;
            if (textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS]) {
                source = json.images[textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS].source];
            } else {
                source = json.images[textureDef.source];
            }
            var sourceURI = source.uri;
            var isObjectURL = false;
            if (source.bufferView !== undefined) {
                sourceURI = parser.getDependency('bufferView', source.bufferView).then(function (bufferView) {
                    isObjectURL = true;
                    var blob = new Blob([bufferView], { type: source.mimeType });
                    sourceURI = URL.createObjectURL(blob);
                    return sourceURI;
                });
            }
            return Promise.resolve(sourceURI).then(function (sourceURI) {
                var loader = options.manager.getHandler(sourceURI);
                if (!loader) {
                    loader = textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS] ? parser.extensions[EXTENSIONS.MSFT_TEXTURE_DDS].ddsLoader : textureLoader;
                }
                return new Promise(function (resolve, reject) {
                    loader.load(resolveURL(sourceURI, options.path), resolve, undefined, reject);
                });
            }).then(function (texture) {
                if (isObjectURL === true) {
                    URL.revokeObjectURL(sourceURI);
                }
                texture.flipY = false;
                if (textureDef.name)
                    texture.name = textureDef.name;
                if (source.mimeType in MIME_TYPE_FORMATS) {
                    texture.format = MIME_TYPE_FORMATS[source.mimeType];
                }
                var samplers = json.samplers || {};
                var sampler = samplers[textureDef.sampler] || {};
                texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || a.LinearFilter;
                texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || a.LinearMipmapLinearFilter;
                texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || a.RepeatWrapping;
                texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || a.RepeatWrapping;
                return texture;
            });
        };
        GLTFParser.prototype.assignTexture = function (materialParams, mapName, mapDef) {
            var parser = this;
            return this.getDependency('texture', mapDef.index).then(function (texture) {
                if (!texture.isCompressedTexture) {
                    switch (mapName) {
                    case 'aoMap':
                    case 'emissiveMap':
                    case 'metalnessMap':
                    case 'normalMap':
                    case 'roughnessMap':
                        texture.format = a.RGBFormat;
                        break;
                    }
                }
                if (mapDef.texCoord !== undefined && mapDef.texCoord != 0 && !(mapName === 'aoMap' && mapDef.texCoord == 1)) {
                    console.warn('THREE.GLTFLoader: Custom UV set ' + mapDef.texCoord + ' for texture ' + mapName + ' not yet supported.');
                }
                if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
                    var transform = mapDef.extensions !== undefined ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : undefined;
                    if (transform) {
                        texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
                    }
                }
                materialParams[mapName] = texture;
            });
        };
        GLTFParser.prototype.assignFinalMaterial = function (mesh) {
            var geometry = mesh.geometry;
            var material = mesh.material;
            var useVertexTangents = geometry.attributes.tangent !== undefined;
            var useVertexColors = geometry.attributes.color !== undefined;
            var useFlatShading = geometry.attributes.normal === undefined;
            var useSkinning = mesh.isSkinnedMesh === true;
            var useMorphTargets = Object.keys(geometry.morphAttributes).length > 0;
            var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;
            if (mesh.isPoints) {
                var cacheKey = 'PointsMaterial:' + material.uuid;
                var pointsMaterial = this.cache.get(cacheKey);
                if (!pointsMaterial) {
                    pointsMaterial = new a.PointsMaterial();
                    a.Material.prototype.copy.call(pointsMaterial, material);
                    pointsMaterial.color.copy(material.color);
                    pointsMaterial.map = material.map;
                    pointsMaterial.sizeAttenuation = false;
                    this.cache.add(cacheKey, pointsMaterial);
                }
                material = pointsMaterial;
            } else if (mesh.isLine) {
                var cacheKey = 'LineBasicMaterial:' + material.uuid;
                var lineMaterial = this.cache.get(cacheKey);
                if (!lineMaterial) {
                    lineMaterial = new a.LineBasicMaterial();
                    a.Material.prototype.copy.call(lineMaterial, material);
                    lineMaterial.color.copy(material.color);
                    this.cache.add(cacheKey, lineMaterial);
                }
                material = lineMaterial;
            }
            if (useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets) {
                var cacheKey = 'ClonedMaterial:' + material.uuid + ':';
                if (material.isGLTFSpecularGlossinessMaterial)
                    cacheKey += 'specular-glossiness:';
                if (useSkinning)
                    cacheKey += 'skinning:';
                if (useVertexTangents)
                    cacheKey += 'vertex-tangents:';
                if (useVertexColors)
                    cacheKey += 'vertex-colors:';
                if (useFlatShading)
                    cacheKey += 'flat-shading:';
                if (useMorphTargets)
                    cacheKey += 'morph-targets:';
                if (useMorphNormals)
                    cacheKey += 'morph-normals:';
                var cachedMaterial = this.cache.get(cacheKey);
                if (!cachedMaterial) {
                    cachedMaterial = material.clone();
                    if (useSkinning)
                        cachedMaterial.skinning = true;
                    if (useVertexTangents)
                        cachedMaterial.vertexTangents = true;
                    if (useVertexColors)
                        cachedMaterial.vertexColors = true;
                    if (useFlatShading)
                        cachedMaterial.flatShading = true;
                    if (useMorphTargets)
                        cachedMaterial.morphTargets = true;
                    if (useMorphNormals)
                        cachedMaterial.morphNormals = true;
                    this.cache.add(cacheKey, cachedMaterial);
                }
                material = cachedMaterial;
            }
            if (material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined) {
                geometry.setAttribute('uv2', new a.BufferAttribute(geometry.attributes.uv.array, 2));
            }
            if (material.normalScale && !useVertexTangents) {
                material.normalScale.y = -material.normalScale.y;
            }
            if (material.clearcoatNormalScale && !useVertexTangents) {
                material.clearcoatNormalScale.y = -material.clearcoatNormalScale.y;
            }
            mesh.material = material;
        };
        GLTFParser.prototype.loadMaterial = function (materialIndex) {
            var parser = this;
            var json = this.json;
            var extensions = this.extensions;
            var materialDef = json.materials[materialIndex];
            var materialType;
            var materialParams = {};
            var materialExtensions = materialDef.extensions || {};
            var pending = [];
            if (materialExtensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {
                var sgExtension = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
                materialType = sgExtension.getMaterialType();
                pending.push(sgExtension.extendParams(materialParams, materialDef, parser));
            } else if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
                var kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
                materialType = kmuExtension.getMaterialType();
                pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
            } else {
                materialType = a.MeshStandardMaterial;
                var metallicRoughness = materialDef.pbrMetallicRoughness || {};
                materialParams.color = new a.Color(1, 1, 1);
                materialParams.opacity = 1;
                if (Array.isArray(metallicRoughness.baseColorFactor)) {
                    var array = metallicRoughness.baseColorFactor;
                    materialParams.color.fromArray(array);
                    materialParams.opacity = array[3];
                }
                if (metallicRoughness.baseColorTexture !== undefined) {
                    pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));
                }
                materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1;
                materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1;
                if (metallicRoughness.metallicRoughnessTexture !== undefined) {
                    pending.push(parser.assignTexture(materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture));
                    pending.push(parser.assignTexture(materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture));
                }
            }
            if (materialDef.doubleSided === true) {
                materialParams.side = a.DoubleSide;
            }
            var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
            if (alphaMode === ALPHA_MODES.BLEND) {
                materialParams.transparent = true;
                materialParams.depthWrite = false;
            } else {
                materialParams.transparent = false;
                if (alphaMode === ALPHA_MODES.MASK) {
                    materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;
                }
            }
            if (materialDef.normalTexture !== undefined && materialType !== a.MeshBasicMaterial) {
                pending.push(parser.assignTexture(materialParams, 'normalMap', materialDef.normalTexture));
                materialParams.normalScale = new a.Vector2(1, 1);
                if (materialDef.normalTexture.scale !== undefined) {
                    materialParams.normalScale.set(materialDef.normalTexture.scale, materialDef.normalTexture.scale);
                }
            }
            if (materialDef.occlusionTexture !== undefined && materialType !== a.MeshBasicMaterial) {
                pending.push(parser.assignTexture(materialParams, 'aoMap', materialDef.occlusionTexture));
                if (materialDef.occlusionTexture.strength !== undefined) {
                    materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
                }
            }
            if (materialDef.emissiveFactor !== undefined && materialType !== a.MeshBasicMaterial) {
                materialParams.emissive = new a.Color().fromArray(materialDef.emissiveFactor);
            }
            if (materialDef.emissiveTexture !== undefined && materialType !== a.MeshBasicMaterial) {
                pending.push(parser.assignTexture(materialParams, 'emissiveMap', materialDef.emissiveTexture));
            }
            if (materialExtensions[EXTENSIONS.KHR_MATERIALS_CLEARCOAT]) {
                var clearcoatExtension = extensions[EXTENSIONS.KHR_MATERIALS_CLEARCOAT];
                materialType = clearcoatExtension.getMaterialType();
                pending.push(clearcoatExtension.extendParams(materialParams, { extensions: materialExtensions }, parser));
            }
            return Promise.all(pending).then(function () {
                var material;
                if (materialType === GLTFMeshStandardSGMaterial) {
                    material = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].createMaterial(materialParams);
                } else {
                    material = new materialType(materialParams);
                }
                if (materialDef.name)
                    material.name = materialDef.name;
                if (material.map)
                    material.map.encoding = a.sRGBEncoding;
                if (material.emissiveMap)
                    material.emissiveMap.encoding = a.sRGBEncoding;
                assignExtrasToUserData(material, materialDef);
                if (materialDef.extensions)
                    addUnknownExtensionsToUserData(extensions, material, materialDef);
                return material;
            });
        };
        function computeBounds(geometry, primitiveDef, parser) {
            var attributes = primitiveDef.attributes;
            var box = new a.Box3();
            if (attributes.POSITION !== undefined) {
                var accessor = parser.json.accessors[attributes.POSITION];
                var min = accessor.min;
                var max = accessor.max;
                if (min !== undefined && max !== undefined) {
                    box.set(new a.Vector3(min[0], min[1], min[2]), new a.Vector3(max[0], max[1], max[2]));
                } else {
                    console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.');
                    return;
                }
            } else {
                return;
            }
            var targets = primitiveDef.targets;
            if (targets !== undefined) {
                var maxDisplacement = new a.Vector3();
                var vector = new a.Vector3();
                for (var i = 0, il = targets.length; i < il; i++) {
                    var target = targets[i];
                    if (target.POSITION !== undefined) {
                        var accessor = parser.json.accessors[target.POSITION];
                        var min = accessor.min;
                        var max = accessor.max;
                        if (min !== undefined && max !== undefined) {
                            vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
                            vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
                            vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));
                            maxDisplacement.max(vector);
                        } else {
                            console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.');
                        }
                    }
                }
                box.expandByVector(maxDisplacement);
            }
            geometry.boundingBox = box;
            var sphere = new a.Sphere();
            box.getCenter(sphere.center);
            sphere.radius = box.min.distanceTo(box.max) / 2;
            geometry.boundingSphere = sphere;
        }
        function addPrimitiveAttributes(geometry, primitiveDef, parser) {
            var attributes = primitiveDef.attributes;
            var pending = [];
            function assignAttributeAccessor(accessorIndex, attributeName) {
                return parser.getDependency('accessor', accessorIndex).then(function (accessor) {
                    geometry.setAttribute(attributeName, accessor);
                });
            }
            for (var gltfAttributeName in attributes) {
                var threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
                if (threeAttributeName in geometry.attributes)
                    continue;
                pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
            }
            if (primitiveDef.indices !== undefined && !geometry.index) {
                var accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {
                    geometry.setIndex(accessor);
                });
                pending.push(accessor);
            }
            assignExtrasToUserData(geometry, primitiveDef);
            computeBounds(geometry, primitiveDef, parser);
            return Promise.all(pending).then(function () {
                return primitiveDef.targets !== undefined ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
            });
        }
        function toTrianglesDrawMode(geometry, drawMode) {
            var index = geometry.getIndex();
            if (index === null) {
                var indices = [];
                var position = geometry.getAttribute('position');
                if (position !== undefined) {
                    for (var i = 0; i < position.count; i++) {
                        indices.push(i);
                    }
                    geometry.setIndex(indices);
                    index = geometry.getIndex();
                } else {
                    console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.');
                    return geometry;
                }
            }
            var numberOfTriangles = index.count - 2;
            var newIndices = [];
            if (drawMode === a.TriangleFanDrawMode) {
                for (var i = 1; i <= numberOfTriangles; i++) {
                    newIndices.push(index.getX(0));
                    newIndices.push(index.getX(i));
                    newIndices.push(index.getX(i + 1));
                }
            } else {
                for (var i = 0; i < numberOfTriangles; i++) {
                    if (i % 2 === 0) {
                        newIndices.push(index.getX(i));
                        newIndices.push(index.getX(i + 1));
                        newIndices.push(index.getX(i + 2));
                    } else {
                        newIndices.push(index.getX(i + 2));
                        newIndices.push(index.getX(i + 1));
                        newIndices.push(index.getX(i));
                    }
                }
            }
            if (newIndices.length / 3 !== numberOfTriangles) {
                console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.');
            }
            var newGeometry = geometry.clone();
            newGeometry.setIndex(newIndices);
            return newGeometry;
        }
        GLTFParser.prototype.loadGeometries = function (primitives) {
            var parser = this;
            var extensions = this.extensions;
            var cache = this.primitiveCache;
            function createDracoPrimitive(primitive) {
                return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive, parser).then(function (geometry) {
                    return addPrimitiveAttributes(geometry, primitive, parser);
                });
            }
            var pending = [];
            for (var i = 0, il = primitives.length; i < il; i++) {
                var primitive = primitives[i];
                var cacheKey = createPrimitiveKey(primitive);
                var cached = cache[cacheKey];
                if (cached) {
                    pending.push(cached.promise);
                } else {
                    var geometryPromise;
                    if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {
                        geometryPromise = createDracoPrimitive(primitive);
                    } else {
                        geometryPromise = addPrimitiveAttributes(new a.BufferGeometry(), primitive, parser);
                    }
                    cache[cacheKey] = {
                        primitive: primitive,
                        promise: geometryPromise
                    };
                    pending.push(geometryPromise);
                }
            }
            return Promise.all(pending);
        };
        GLTFParser.prototype.loadMesh = function (meshIndex) {
            var parser = this;
            var json = this.json;
            var meshDef = json.meshes[meshIndex];
            var primitives = meshDef.primitives;
            var pending = [];
            for (var i = 0, il = primitives.length; i < il; i++) {
                var material = primitives[i].material === undefined ? createDefaultMaterial(this.cache) : this.getDependency('material', primitives[i].material);
                pending.push(material);
            }
            pending.push(parser.loadGeometries(primitives));
            return Promise.all(pending).then(function (results) {
                var materials = results.slice(0, results.length - 1);
                var geometries = results[results.length - 1];
                var meshes = [];
                for (var i = 0, il = geometries.length; i < il; i++) {
                    var geometry = geometries[i];
                    var primitive = primitives[i];
                    var mesh;
                    var material = materials[i];
                    if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === undefined) {
                        mesh = meshDef.isSkinnedMesh === true ? new a.SkinnedMesh(geometry, material) : new a.Mesh(geometry, material);
                        if (mesh.isSkinnedMesh === true && !mesh.geometry.attributes.skinWeight.normalized) {
                            mesh.normalizeSkinWeights();
                        }
                        if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
                            mesh.geometry = toTrianglesDrawMode(mesh.geometry, a.TriangleStripDrawMode);
                        } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
                            mesh.geometry = toTrianglesDrawMode(mesh.geometry, a.TriangleFanDrawMode);
                        }
                    } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
                        mesh = new a.LineSegments(geometry, material);
                    } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
                        mesh = new a.Line(geometry, material);
                    } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
                        mesh = new a.LineLoop(geometry, material);
                    } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
                        mesh = new a.Points(geometry, material);
                    } else {
                        throw new Error('THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode);
                    }
                    if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
                        updateMorphTargets(mesh, meshDef);
                    }
                    mesh.name = meshDef.name || 'mesh_' + meshIndex;
                    if (geometries.length > 1)
                        mesh.name += '_' + i;
                    assignExtrasToUserData(mesh, meshDef);
                    parser.assignFinalMaterial(mesh);
                    meshes.push(mesh);
                }
                if (meshes.length === 1) {
                    return meshes[0];
                }
                var group = new a.Group();
                for (var i = 0, il = meshes.length; i < il; i++) {
                    group.add(meshes[i]);
                }
                return group;
            });
        };
        GLTFParser.prototype.loadCamera = function (cameraIndex) {
            var camera;
            var cameraDef = this.json.cameras[cameraIndex];
            var params = cameraDef[cameraDef.type];
            if (!params) {
                console.warn('THREE.GLTFLoader: Missing camera parameters.');
                return;
            }
            if (cameraDef.type === 'perspective') {
                camera = new a.PerspectiveCamera(a.MathUtils.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2000000);
            } else if (cameraDef.type === 'orthographic') {
                camera = new a.OrthographicCamera(params.xmag / -2, params.xmag / 2, params.ymag / 2, params.ymag / -2, params.znear, params.zfar);
            }
            if (cameraDef.name)
                camera.name = cameraDef.name;
            assignExtrasToUserData(camera, cameraDef);
            return Promise.resolve(camera);
        };
        GLTFParser.prototype.loadSkin = function (skinIndex) {
            var skinDef = this.json.skins[skinIndex];
            var skinEntry = { joints: skinDef.joints };
            if (skinDef.inverseBindMatrices === undefined) {
                return Promise.resolve(skinEntry);
            }
            return this.getDependency('accessor', skinDef.inverseBindMatrices).then(function (accessor) {
                skinEntry.inverseBindMatrices = accessor;
                return skinEntry;
            });
        };
        GLTFParser.prototype.loadAnimation = function (animationIndex) {
            var json = this.json;
            var animationDef = json.animations[animationIndex];
            var pendingNodes = [];
            var pendingInputAccessors = [];
            var pendingOutputAccessors = [];
            var pendingSamplers = [];
            var pendingTargets = [];
            for (var i = 0, il = animationDef.channels.length; i < il; i++) {
                var channel = animationDef.channels[i];
                var sampler = animationDef.samplers[channel.sampler];
                var target = channel.target;
                var name = target.node !== undefined ? target.node : target.id;
                var input = animationDef.parameters !== undefined ? animationDef.parameters[sampler.input] : sampler.input;
                var output = animationDef.parameters !== undefined ? animationDef.parameters[sampler.output] : sampler.output;
                pendingNodes.push(this.getDependency('node', name));
                pendingInputAccessors.push(this.getDependency('accessor', input));
                pendingOutputAccessors.push(this.getDependency('accessor', output));
                pendingSamplers.push(sampler);
                pendingTargets.push(target);
            }
            return Promise.all([
                Promise.all(pendingNodes),
                Promise.all(pendingInputAccessors),
                Promise.all(pendingOutputAccessors),
                Promise.all(pendingSamplers),
                Promise.all(pendingTargets)
            ]).then(function (dependencies) {
                var nodes = dependencies[0];
                var inputAccessors = dependencies[1];
                var outputAccessors = dependencies[2];
                var samplers = dependencies[3];
                var targets = dependencies[4];
                var tracks = [];
                for (var i = 0, il = nodes.length; i < il; i++) {
                    var node = nodes[i];
                    var inputAccessor = inputAccessors[i];
                    var outputAccessor = outputAccessors[i];
                    var sampler = samplers[i];
                    var target = targets[i];
                    if (node === undefined)
                        continue;
                    node.updateMatrix();
                    node.matrixAutoUpdate = true;
                    var TypedKeyframeTrack;
                    switch (PATH_PROPERTIES[target.path]) {
                    case PATH_PROPERTIES.weights:
                        TypedKeyframeTrack = a.NumberKeyframeTrack;
                        break;
                    case PATH_PROPERTIES.rotation:
                        TypedKeyframeTrack = a.QuaternionKeyframeTrack;
                        break;
                    case PATH_PROPERTIES.position:
                    case PATH_PROPERTIES.scale:
                    default:
                        TypedKeyframeTrack = a.VectorKeyframeTrack;
                        break;
                    }
                    var targetName = node.name ? node.name : node.uuid;
                    var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[sampler.interpolation] : a.InterpolateLinear;
                    var targetNames = [];
                    if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
                        node.traverse(function (object) {
                            if (object.isMesh === true && object.morphTargetInfluences) {
                                targetNames.push(object.name ? object.name : object.uuid);
                            }
                        });
                    } else {
                        targetNames.push(targetName);
                    }
                    var outputArray = outputAccessor.array;
                    if (outputAccessor.normalized) {
                        var scale;
                        if (outputArray.constructor === Int8Array) {
                            scale = 1 / 127;
                        } else if (outputArray.constructor === Uint8Array) {
                            scale = 1 / 255;
                        } else if (outputArray.constructor == Int16Array) {
                            scale = 1 / 32767;
                        } else if (outputArray.constructor === Uint16Array) {
                            scale = 1 / 65535;
                        } else {
                            throw new Error('THREE.GLTFLoader: Unsupported output accessor component type.');
                        }
                        var scaled = new Float32Array(outputArray.length);
                        for (var j = 0, jl = outputArray.length; j < jl; j++) {
                            scaled[j] = outputArray[j] * scale;
                        }
                        outputArray = scaled;
                    }
                    for (var j = 0, jl = targetNames.length; j < jl; j++) {
                        var track = new TypedKeyframeTrack(targetNames[j] + '.' + PATH_PROPERTIES[target.path], inputAccessor.array, outputArray, interpolation);
                        if (sampler.interpolation === 'CUBICSPLINE') {
                            track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
                                return new GLTFCubicSplineInterpolant(this.times, this.values, this.getValueSize() / 3, result);
                            };
                            track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
                        }
                        tracks.push(track);
                    }
                }
                var name = animationDef.name ? animationDef.name : 'animation_' + animationIndex;
                return new a.AnimationClip(name, undefined, tracks);
            });
        };
        GLTFParser.prototype.loadNode = function (nodeIndex) {
            var json = this.json;
            var extensions = this.extensions;
            var parser = this;
            var meshReferences = json.meshReferences;
            var meshUses = json.meshUses;
            var nodeDef = json.nodes[nodeIndex];
            return function () {
                var pending = [];
                if (nodeDef.mesh !== undefined) {
                    pending.push(parser.getDependency('mesh', nodeDef.mesh).then(function (mesh) {
                        var node;
                        if (meshReferences[nodeDef.mesh] > 1) {
                            var instanceNum = meshUses[nodeDef.mesh]++;
                            node = mesh.clone();
                            node.name += '_instance_' + instanceNum;
                        } else {
                            node = mesh;
                        }
                        if (nodeDef.weights !== undefined) {
                            node.traverse(function (o) {
                                if (!o.isMesh)
                                    return;
                                for (var i = 0, il = nodeDef.weights.length; i < il; i++) {
                                    o.morphTargetInfluences[i] = nodeDef.weights[i];
                                }
                            });
                        }
                        return node;
                    }));
                }
                if (nodeDef.camera !== undefined) {
                    pending.push(parser.getDependency('camera', nodeDef.camera));
                }
                if (nodeDef.extensions && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL] && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].light !== undefined) {
                    pending.push(parser.getDependency('light', nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].light));
                }
                return Promise.all(pending);
            }().then(function (objects) {
                var node;
                if (nodeDef.isBone === true) {
                    node = new a.Bone();
                } else if (objects.length > 1) {
                    node = new a.Group();
                } else if (objects.length === 1) {
                    node = objects[0];
                } else {
                    node = new a.Object3D();
                }
                if (node !== objects[0]) {
                    for (var i = 0, il = objects.length; i < il; i++) {
                        node.add(objects[i]);
                    }
                }
                if (nodeDef.name) {
                    node.userData.name = nodeDef.name;
                    node.name = a.PropertyBinding.sanitizeNodeName(nodeDef.name);
                }
                assignExtrasToUserData(node, nodeDef);
                if (nodeDef.extensions)
                    addUnknownExtensionsToUserData(extensions, node, nodeDef);
                if (nodeDef.matrix !== undefined) {
                    var matrix = new a.Matrix4();
                    matrix.fromArray(nodeDef.matrix);
                    node.applyMatrix4(matrix);
                } else {
                    if (nodeDef.translation !== undefined) {
                        node.position.fromArray(nodeDef.translation);
                    }
                    if (nodeDef.rotation !== undefined) {
                        node.quaternion.fromArray(nodeDef.rotation);
                    }
                    if (nodeDef.scale !== undefined) {
                        node.scale.fromArray(nodeDef.scale);
                    }
                }
                return node;
            });
        };
        GLTFParser.prototype.loadScene = function () {
            function buildNodeHierachy(nodeId, parentObject, json, parser) {
                var nodeDef = json.nodes[nodeId];
                return parser.getDependency('node', nodeId).then(function (node) {
                    if (nodeDef.skin === undefined)
                        return node;
                    var skinEntry;
                    return parser.getDependency('skin', nodeDef.skin).then(function (skin) {
                        skinEntry = skin;
                        var pendingJoints = [];
                        for (var i = 0, il = skinEntry.joints.length; i < il; i++) {
                            pendingJoints.push(parser.getDependency('node', skinEntry.joints[i]));
                        }
                        return Promise.all(pendingJoints);
                    }).then(function (jointNodes) {
                        node.traverse(function (mesh) {
                            if (!mesh.isMesh)
                                return;
                            var bones = [];
                            var boneInverses = [];
                            for (var j = 0, jl = jointNodes.length; j < jl; j++) {
                                var jointNode = jointNodes[j];
                                if (jointNode) {
                                    bones.push(jointNode);
                                    var mat = new a.Matrix4();
                                    if (skinEntry.inverseBindMatrices !== undefined) {
                                        mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);
                                    }
                                    boneInverses.push(mat);
                                } else {
                                    console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j]);
                                }
                            }
                            mesh.bind(new a.Skeleton(bones, boneInverses), mesh.matrixWorld);
                        });
                        return node;
                    });
                }).then(function (node) {
                    parentObject.add(node);
                    var pending = [];
                    if (nodeDef.children) {
                        var children = nodeDef.children;
                        for (var i = 0, il = children.length; i < il; i++) {
                            var child = children[i];
                            pending.push(buildNodeHierachy(child, node, json, parser));
                        }
                    }
                    return Promise.all(pending);
                });
            }
            return function loadScene(sceneIndex) {
                var json = this.json;
                var extensions = this.extensions;
                var sceneDef = this.json.scenes[sceneIndex];
                var parser = this;
                var scene = new a.Group();
                if (sceneDef.name)
                    scene.name = sceneDef.name;
                assignExtrasToUserData(scene, sceneDef);
                if (sceneDef.extensions)
                    addUnknownExtensionsToUserData(extensions, scene, sceneDef);
                var nodeIds = sceneDef.nodes || [];
                var pending = [];
                for (var i = 0, il = nodeIds.length; i < il; i++) {
                    pending.push(buildNodeHierachy(nodeIds[i], scene, json, parser));
                }
                return Promise.all(pending).then(function () {
                    return scene;
                });
            };
        }();
        return GLTFLoader;
    }();
    return GLTFLoader ;
});