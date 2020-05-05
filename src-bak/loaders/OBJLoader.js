define(["skylark-threejs"], function (a) {
    'use strict';
    var OBJLoader = function () {
        var object_pattern = /^[og]\s*(.+)?/;
        var material_library_pattern = /^mtllib /;
        var material_use_pattern = /^usemtl /;
        var map_use_pattern = /^usemap /;
        function ParserState() {
            var state = {
                objects: [],
                object: {},
                vertices: [],
                normals: [],
                colors: [],
                uvs: [],
                materials: {},
                materialLibraries: [],
                startObject: function (name, fromDeclaration) {
                    if (this.object && this.object.fromDeclaration === false) {
                        this.object.name = name;
                        this.object.fromDeclaration = fromDeclaration !== false;
                        return;
                    }
                    var previousMaterial = this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined;
                    if (this.object && typeof this.object._finalize === 'function') {
                        this.object._finalize(true);
                    }
                    this.object = {
                        name: name || '',
                        fromDeclaration: fromDeclaration !== false,
                        geometry: {
                            vertices: [],
                            normals: [],
                            colors: [],
                            uvs: []
                        },
                        materials: [],
                        smooth: true,
                        startMaterial: function (name, libraries) {
                            var previous = this._finalize(false);
                            if (previous && (previous.inherited || previous.groupCount <= 0)) {
                                this.materials.splice(previous.index, 1);
                            }
                            var material = {
                                index: this.materials.length,
                                name: name || '',
                                mtllib: Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : '',
                                smooth: previous !== undefined ? previous.smooth : this.smooth,
                                groupStart: previous !== undefined ? previous.groupEnd : 0,
                                groupEnd: -1,
                                groupCount: -1,
                                inherited: false,
                                clone: function (index) {
                                    var cloned = {
                                        index: typeof index === 'number' ? index : this.index,
                                        name: this.name,
                                        mtllib: this.mtllib,
                                        smooth: this.smooth,
                                        groupStart: 0,
                                        groupEnd: -1,
                                        groupCount: -1,
                                        inherited: false
                                    };
                                    cloned.clone = this.clone.bind(cloned);
                                    return cloned;
                                }
                            };
                            this.materials.push(material);
                            return material;
                        },
                        currentMaterial: function () {
                            if (this.materials.length > 0) {
                                return this.materials[this.materials.length - 1];
                            }
                            return undefined;
                        },
                        _finalize: function (end) {
                            var lastMultiMaterial = this.currentMaterial();
                            if (lastMultiMaterial && lastMultiMaterial.groupEnd === -1) {
                                lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                                lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                                lastMultiMaterial.inherited = false;
                            }
                            if (end && this.materials.length > 1) {
                                for (var mi = this.materials.length - 1; mi >= 0; mi--) {
                                    if (this.materials[mi].groupCount <= 0) {
                                        this.materials.splice(mi, 1);
                                    }
                                }
                            }
                            if (end && this.materials.length === 0) {
                                this.materials.push({
                                    name: '',
                                    smooth: this.smooth
                                });
                            }
                            return lastMultiMaterial;
                        }
                    };
                    if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function') {
                        var declared = previousMaterial.clone(0);
                        declared.inherited = true;
                        this.object.materials.push(declared);
                    }
                    this.objects.push(this.object);
                },
                finalize: function () {
                    if (this.object && typeof this.object._finalize === 'function') {
                        this.object._finalize(true);
                    }
                },
                parseVertexIndex: function (value, len) {
                    var index = parseInt(value, 10);
                    return (index >= 0 ? index - 1 : index + len / 3) * 3;
                },
                parseNormalIndex: function (value, len) {
                    var index = parseInt(value, 10);
                    return (index >= 0 ? index - 1 : index + len / 3) * 3;
                },
                parseUVIndex: function (value, len) {
                    var index = parseInt(value, 10);
                    return (index >= 0 ? index - 1 : index + len / 2) * 2;
                },
                addVertex: function (a, b, c) {
                    var src = this.vertices;
                    var dst = this.object.geometry.vertices;
                    dst.push(src[a + 0], src[a + 1], src[a + 2]);
                    dst.push(src[b + 0], src[b + 1], src[b + 2]);
                    dst.push(src[c + 0], src[c + 1], src[c + 2]);
                },
                addVertexPoint: function (a) {
                    var src = this.vertices;
                    var dst = this.object.geometry.vertices;
                    dst.push(src[a + 0], src[a + 1], src[a + 2]);
                },
                addVertexLine: function (a) {
                    var src = this.vertices;
                    var dst = this.object.geometry.vertices;
                    dst.push(src[a + 0], src[a + 1], src[a + 2]);
                },
                addNormal: function (a, b, c) {
                    var src = this.normals;
                    var dst = this.object.geometry.normals;
                    dst.push(src[a + 0], src[a + 1], src[a + 2]);
                    dst.push(src[b + 0], src[b + 1], src[b + 2]);
                    dst.push(src[c + 0], src[c + 1], src[c + 2]);
                },
                addColor: function (a, b, c) {
                    var src = this.colors;
                    var dst = this.object.geometry.colors;
                    dst.push(src[a + 0], src[a + 1], src[a + 2]);
                    dst.push(src[b + 0], src[b + 1], src[b + 2]);
                    dst.push(src[c + 0], src[c + 1], src[c + 2]);
                },
                addUV: function (a, b, c) {
                    var src = this.uvs;
                    var dst = this.object.geometry.uvs;
                    dst.push(src[a + 0], src[a + 1]);
                    dst.push(src[b + 0], src[b + 1]);
                    dst.push(src[c + 0], src[c + 1]);
                },
                addUVLine: function (a) {
                    var src = this.uvs;
                    var dst = this.object.geometry.uvs;
                    dst.push(src[a + 0], src[a + 1]);
                },
                addFace: function (a, b, c, ua, ub, uc, na, nb, nc) {
                    var vLen = this.vertices.length;
                    var ia = this.parseVertexIndex(a, vLen);
                    var ib = this.parseVertexIndex(b, vLen);
                    var ic = this.parseVertexIndex(c, vLen);
                    this.addVertex(ia, ib, ic);
                    if (this.colors.length > 0) {
                        this.addColor(ia, ib, ic);
                    }
                    if (ua !== undefined && ua !== '') {
                        var uvLen = this.uvs.length;
                        ia = this.parseUVIndex(ua, uvLen);
                        ib = this.parseUVIndex(ub, uvLen);
                        ic = this.parseUVIndex(uc, uvLen);
                        this.addUV(ia, ib, ic);
                    }
                    if (na !== undefined && na !== '') {
                        var nLen = this.normals.length;
                        ia = this.parseNormalIndex(na, nLen);
                        ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
                        ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);
                        this.addNormal(ia, ib, ic);
                    }
                },
                addPointGeometry: function (vertices) {
                    this.object.geometry.type = 'Points';
                    var vLen = this.vertices.length;
                    for (var vi = 0, l = vertices.length; vi < l; vi++) {
                        this.addVertexPoint(this.parseVertexIndex(vertices[vi], vLen));
                    }
                },
                addLineGeometry: function (vertices, uvs) {
                    this.object.geometry.type = 'Line';
                    var vLen = this.vertices.length;
                    var uvLen = this.uvs.length;
                    for (var vi = 0, l = vertices.length; vi < l; vi++) {
                        this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));
                    }
                    for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {
                        this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));
                    }
                }
            };
            state.startObject('', false);
            return state;
        }
        function OBJLoader(manager) {
            a.Loader.call(this, manager);
            this.materials = null;
        }
        OBJLoader.prototype = Object.assign(Object.create(a.Loader.prototype), {
            constructor: OBJLoader,
            load: function (url, onLoad, onProgress, onError) {
                var scope = this;
                var loader = new a.FileLoader(scope.manager);
                loader.setPath(this.path);
                loader.load(url, function (text) {
                    onLoad(scope.parse(text));
                }, onProgress, onError);
            },
            setMaterials: function (materials) {
                this.materials = materials;
                return this;
            },
            parse: function (text) {
                var state = new ParserState();
                if (text.indexOf('\r\n') !== -1) {
                    text = text.replace(/\r\n/g, '\n');
                }
                if (text.indexOf('\\\n') !== -1) {
                    text = text.replace(/\\\n/g, '');
                }
                var lines = text.split('\n');
                var line = '', lineFirstChar = '';
                var lineLength = 0;
                var result = [];
                var trimLeft = typeof ''.trimLeft === 'function';
                for (var i = 0, l = lines.length; i < l; i++) {
                    line = lines[i];
                    line = trimLeft ? line.trimLeft() : line.trim();
                    lineLength = line.length;
                    if (lineLength === 0)
                        continue;
                    lineFirstChar = line.charAt(0);
                    if (lineFirstChar === '#')
                        continue;
                    if (lineFirstChar === 'v') {
                        var data = line.split(/\s+/);
                        switch (data[0]) {
                        case 'v':
                            state.vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
                            if (data.length >= 7) {
                                state.colors.push(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]));
                            }
                            break;
                        case 'vn':
                            state.normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
                            break;
                        case 'vt':
                            state.uvs.push(parseFloat(data[1]), parseFloat(data[2]));
                            break;
                        }
                    } else if (lineFirstChar === 'f') {
                        var lineData = line.substr(1).trim();
                        var vertexData = lineData.split(/\s+/);
                        var faceVertices = [];
                        for (var j = 0, jl = vertexData.length; j < jl; j++) {
                            var vertex = vertexData[j];
                            if (vertex.length > 0) {
                                var vertexParts = vertex.split('/');
                                faceVertices.push(vertexParts);
                            }
                        }
                        var v1 = faceVertices[0];
                        for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {
                            var v2 = faceVertices[j];
                            var v3 = faceVertices[j + 1];
                            state.addFace(v1[0], v2[0], v3[0], v1[1], v2[1], v3[1], v1[2], v2[2], v3[2]);
                        }
                    } else if (lineFirstChar === 'l') {
                        var lineParts = line.substring(1).trim().split(' ');
                        var lineVertices = [], lineUVs = [];
                        if (line.indexOf('/') === -1) {
                            lineVertices = lineParts;
                        } else {
                            for (var li = 0, llen = lineParts.length; li < llen; li++) {
                                var parts = lineParts[li].split('/');
                                if (parts[0] !== '')
                                    lineVertices.push(parts[0]);
                                if (parts[1] !== '')
                                    lineUVs.push(parts[1]);
                            }
                        }
                        state.addLineGeometry(lineVertices, lineUVs);
                    } else if (lineFirstChar === 'p') {
                        var lineData = line.substr(1).trim();
                        var pointData = lineData.split(' ');
                        state.addPointGeometry(pointData);
                    } else if ((result = object_pattern.exec(line)) !== null) {
                        var name = (' ' + result[0].substr(1).trim()).substr(1);
                        state.startObject(name);
                    } else if (material_use_pattern.test(line)) {
                        state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
                    } else if (material_library_pattern.test(line)) {
                        state.materialLibraries.push(line.substring(7).trim());
                    } else if (map_use_pattern.test(line)) {
                        console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');
                    } else if (lineFirstChar === 's') {
                        result = line.split(' ');
                        if (result.length > 1) {
                            var value = result[1].trim().toLowerCase();
                            state.object.smooth = value !== '0' && value !== 'off';
                        } else {
                            state.object.smooth = true;
                        }
                        var material = state.object.currentMaterial();
                        if (material)
                            material.smooth = state.object.smooth;
                    } else {
                        if (line === '\0')
                            continue;
                        console.warn('THREE.OBJLoader: Unexpected line: "' + line + '"');
                    }
                }
                state.finalize();
                var container = new a.Group();
                container.materialLibraries = [].concat(state.materialLibraries);
                for (var i = 0, l = state.objects.length; i < l; i++) {
                    var object = state.objects[i];
                    var geometry = object.geometry;
                    var materials = object.materials;
                    var isLine = geometry.type === 'Line';
                    var isPoints = geometry.type === 'Points';
                    var hasVertexColors = false;
                    if (geometry.vertices.length === 0)
                        continue;
                    var buffergeometry = new a.BufferGeometry();
                    buffergeometry.setAttribute('position', new a.Float32BufferAttribute(geometry.vertices, 3));
                    if (geometry.normals.length > 0) {
                        buffergeometry.setAttribute('normal', new a.Float32BufferAttribute(geometry.normals, 3));
                    } else {
                        buffergeometry.computeVertexNormals();
                    }
                    if (geometry.colors.length > 0) {
                        hasVertexColors = true;
                        buffergeometry.setAttribute('color', new a.Float32BufferAttribute(geometry.colors, 3));
                    }
                    if (geometry.uvs.length > 0) {
                        buffergeometry.setAttribute('uv', new a.Float32BufferAttribute(geometry.uvs, 2));
                    }
                    var createdMaterials = [];
                    for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
                        var sourceMaterial = materials[mi];
                        var materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
                        var material = state.materials[materialHash];
                        if (this.materials !== null) {
                            material = this.materials.create(sourceMaterial.name);
                            if (isLine && material && !(material instanceof a.LineBasicMaterial)) {
                                var materialLine = new a.LineBasicMaterial();
                                a.Material.prototype.copy.call(materialLine, material);
                                materialLine.color.copy(material.color);
                                material = materialLine;
                            } else if (isPoints && material && !(material instanceof a.PointsMaterial)) {
                                var materialPoints = new a.PointsMaterial({
                                    size: 10,
                                    sizeAttenuation: false
                                });
                                a.Material.prototype.copy.call(materialPoints, material);
                                materialPoints.color.copy(material.color);
                                materialPoints.map = material.map;
                                material = materialPoints;
                            }
                        }
                        if (material === undefined) {
                            if (isLine) {
                                material = new a.LineBasicMaterial();
                            } else if (isPoints) {
                                material = new a.PointsMaterial({
                                    size: 1,
                                    sizeAttenuation: false
                                });
                            } else {
                                material = new a.MeshPhongMaterial();
                            }
                            material.name = sourceMaterial.name;
                            material.flatShading = sourceMaterial.smooth ? false : true;
                            material.vertexColors = hasVertexColors;
                            state.materials[materialHash] = material;
                        }
                        createdMaterials.push(material);
                    }
                    var mesh;
                    if (createdMaterials.length > 1) {
                        for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
                            var sourceMaterial = materials[mi];
                            buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
                        }
                        if (isLine) {
                            mesh = new a.LineSegments(buffergeometry, createdMaterials);
                        } else if (isPoints) {
                            mesh = new a.Points(buffergeometry, createdMaterials);
                        } else {
                            mesh = new a.Mesh(buffergeometry, createdMaterials);
                        }
                    } else {
                        if (isLine) {
                            mesh = new a.LineSegments(buffergeometry, createdMaterials[0]);
                        } else if (isPoints) {
                            mesh = new a.Points(buffergeometry, createdMaterials[0]);
                        } else {
                            mesh = new a.Mesh(buffergeometry, createdMaterials[0]);
                        }
                    }
                    mesh.name = object.name;
                    container.add(mesh);
                }
                return container;
            }
        });
        return OBJLoader;
    }();
    return OBJLoader;
});