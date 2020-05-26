define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var TDSLoader = function (manager) {
        THREE.Loader.call(this, manager);
        this.debug = false;
        this.group = null;
        this.position = 0;
        this.materials = [];
        this.meshes = [];
    };
    TDSLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
        constructor: TDSLoader,
        load: function (url, onLoad, onProgress, onError) {
            var scope = this;
            var path = scope.path === '' ? THREE.LoaderUtils.extractUrlBase(url) : scope.path;
            var loader = new THREE.FileLoader(this.manager);
            loader.setPath(this.path);
            loader.setResponseType('arraybuffer');
            loader.load(url, function (data) {
                onLoad(scope.parse(data, path));
            }, onProgress, onError);
        },
        parse: function (arraybuffer, path) {
            this.group = new THREE.Group();
            this.position = 0;
            this.materials = [];
            this.meshes = [];
            this.readFile(arraybuffer, path);
            for (var i = 0; i < this.meshes.length; i++) {
                this.group.add(this.meshes[i]);
            }
            return this.group;
        },
        readFile: function (arraybuffer, path) {
            var data = new DataView(arraybuffer);
            var chunk = this.readChunk(data);
            if (chunk.id === MLIBMAGIC || chunk.id === CMAGIC || chunk.id === M3DMAGIC) {
                var next = this.nextChunk(data, chunk);
                while (next !== 0) {
                    if (next === M3D_VERSION) {
                        var version = this.readDWord(data);
                        this.debugMessage('3DS file version: ' + version);
                    } else if (next === MDATA) {
                        this.resetPosition(data);
                        this.readMeshData(data, path);
                    } else {
                        this.debugMessage('Unknown main chunk: ' + next.toString(16));
                    }
                    next = this.nextChunk(data, chunk);
                }
            }
            this.debugMessage('Parsed ' + this.meshes.length + ' meshes');
        },
        readMeshData: function (data, path) {
            var chunk = this.readChunk(data);
            var next = this.nextChunk(data, chunk);
            while (next !== 0) {
                if (next === MESH_VERSION) {
                    var version = +this.readDWord(data);
                    this.debugMessage('Mesh Version: ' + version);
                } else if (next === MASTER_SCALE) {
                    var scale = this.readFloat(data);
                    this.debugMessage('Master scale: ' + scale);
                    this.group.scale.set(scale, scale, scale);
                } else if (next === NAMED_OBJECT) {
                    this.debugMessage('Named Object');
                    this.resetPosition(data);
                    this.readNamedObject(data);
                } else if (next === MAT_ENTRY) {
                    this.debugMessage('Material');
                    this.resetPosition(data);
                    this.readMaterialEntry(data, path);
                } else {
                    this.debugMessage('Unknown MDATA chunk: ' + next.toString(16));
                }
                next = this.nextChunk(data, chunk);
            }
        },
        readNamedObject: function (data) {
            var chunk = this.readChunk(data);
            var name = this.readString(data, 64);
            chunk.cur = this.position;
            var next = this.nextChunk(data, chunk);
            while (next !== 0) {
                if (next === N_TRI_OBJECT) {
                    this.resetPosition(data);
                    var mesh = this.readMesh(data);
                    mesh.name = name;
                    this.meshes.push(mesh);
                } else {
                    this.debugMessage('Unknown named object chunk: ' + next.toString(16));
                }
                next = this.nextChunk(data, chunk);
            }
            this.endChunk(chunk);
        },
        readMaterialEntry: function (data, path) {
            var chunk = this.readChunk(data);
            var next = this.nextChunk(data, chunk);
            var material = new THREE.MeshPhongMaterial();
            while (next !== 0) {
                if (next === MAT_NAME) {
                    material.name = this.readString(data, 64);
                    this.debugMessage('   Name: ' + material.name);
                } else if (next === MAT_WIRE) {
                    this.debugMessage('   Wireframe');
                    material.wireframe = true;
                } else if (next === MAT_WIRE_SIZE) {
                    var value = this.readByte(data);
                    material.wireframeLinewidth = value;
                    this.debugMessage('   Wireframe Thickness: ' + value);
                } else if (next === MAT_TWO_SIDE) {
                    material.side = THREE.DoubleSide;
                    this.debugMessage('   DoubleSided');
                } else if (next === MAT_ADDITIVE) {
                    this.debugMessage('   Additive Blending');
                    material.blending = THREE.AdditiveBlending;
                } else if (next === MAT_DIFFUSE) {
                    this.debugMessage('   Diffuse Color');
                    material.color = this.readColor(data);
                } else if (next === MAT_SPECULAR) {
                    this.debugMessage('   Specular Color');
                    material.specular = this.readColor(data);
                } else if (next === MAT_AMBIENT) {
                    this.debugMessage('   Ambient color');
                    material.color = this.readColor(data);
                } else if (next === MAT_SHININESS) {
                    var shininess = this.readWord(data);
                    material.shininess = shininess;
                    this.debugMessage('   Shininess : ' + shininess);
                } else if (next === MAT_TRANSPARENCY) {
                    var opacity = this.readWord(data);
                    material.opacity = opacity * 0.01;
                    this.debugMessage('  Opacity : ' + opacity);
                    material.transparent = opacity < 100 ? true : false;
                } else if (next === MAT_TEXMAP) {
                    this.debugMessage('   ColorMap');
                    this.resetPosition(data);
                    material.map = this.readMap(data, path);
                } else if (next === MAT_BUMPMAP) {
                    this.debugMessage('   BumpMap');
                    this.resetPosition(data);
                    material.bumpMap = this.readMap(data, path);
                } else if (next === MAT_OPACMAP) {
                    this.debugMessage('   OpacityMap');
                    this.resetPosition(data);
                    material.alphaMap = this.readMap(data, path);
                } else if (next === MAT_SPECMAP) {
                    this.debugMessage('   SpecularMap');
                    this.resetPosition(data);
                    material.specularMap = this.readMap(data, path);
                } else {
                    this.debugMessage('   Unknown material chunk: ' + next.toString(16));
                }
                next = this.nextChunk(data, chunk);
            }
            this.endChunk(chunk);
            this.materials[material.name] = material;
        },
        readMesh: function (data) {
            var chunk = this.readChunk(data);
            var next = this.nextChunk(data, chunk);
            var geometry = new THREE.BufferGeometry();
            var uvs = [];
            var material = new THREE.MeshPhongMaterial();
            var mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'mesh';
            while (next !== 0) {
                if (next === POINT_ARRAY) {
                    var points = this.readWord(data);
                    this.debugMessage('   Vertex: ' + points);
                    var vertices = [];
                    for (var i = 0; i < points; i++) {
                        vertices.push(this.readFloat(data));
                        vertices.push(this.readFloat(data));
                        vertices.push(this.readFloat(data));
                    }
                    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                } else if (next === FACE_ARRAY) {
                    this.resetPosition(data);
                    this.readFaceArray(data, mesh);
                } else if (next === TEX_VERTS) {
                    var texels = this.readWord(data);
                    this.debugMessage('   UV: ' + texels);
                    var uvs = [];
                    for (var i = 0; i < texels; i++) {
                        uvs.push(this.readFloat(data));
                        uvs.push(this.readFloat(data));
                    }
                    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                } else if (next === MESH_MATRIX) {
                    this.debugMessage('   Tranformation Matrix (TODO)');
                    var values = [];
                    for (var i = 0; i < 12; i++) {
                        values[i] = this.readFloat(data);
                    }
                    var matrix = new THREE.Matrix4();
                    matrix.elements[0] = values[0];
                    matrix.elements[1] = values[6];
                    matrix.elements[2] = values[3];
                    matrix.elements[3] = values[9];
                    matrix.elements[4] = values[2];
                    matrix.elements[5] = values[8];
                    matrix.elements[6] = values[5];
                    matrix.elements[7] = values[11];
                    matrix.elements[8] = values[1];
                    matrix.elements[9] = values[7];
                    matrix.elements[10] = values[4];
                    matrix.elements[11] = values[10];
                    matrix.elements[12] = 0;
                    matrix.elements[13] = 0;
                    matrix.elements[14] = 0;
                    matrix.elements[15] = 1;
                    matrix.transpose();
                    var inverse = new THREE.Matrix4();
                    inverse.getInverse(matrix);
                    geometry.applyMatrix4(inverse);
                    matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
                } else {
                    this.debugMessage('   Unknown mesh chunk: ' + next.toString(16));
                }
                next = this.nextChunk(data, chunk);
            }
            this.endChunk(chunk);
            geometry.computeVertexNormals();
            return mesh;
        },
        readFaceArray: function (data, mesh) {
            var chunk = this.readChunk(data);
            var faces = this.readWord(data);
            this.debugMessage('   Faces: ' + faces);
            var index = [];
            for (var i = 0; i < faces; ++i) {
                index.push(this.readWord(data), this.readWord(data), this.readWord(data));
                this.readWord(data);
            }
            mesh.geometry.setIndex(index);
            while (this.position < chunk.end) {
                var chunk = this.readChunk(data);
                if (chunk.id === MSH_MAT_GROUP) {
                    this.debugMessage('      Material Group');
                    this.resetPosition(data);
                    var group = this.readMaterialGroup(data);
                    var material = this.materials[group.name];
                    if (material !== undefined) {
                        mesh.material = material;
                        if (material.name === '') {
                            material.name = mesh.name;
                        }
                    }
                } else {
                    this.debugMessage('      Unknown face array chunk: ' + chunk.toString(16));
                }
                this.endChunk(chunk);
            }
            this.endChunk(chunk);
        },
        readMap: function (data, path) {
            var chunk = this.readChunk(data);
            var next = this.nextChunk(data, chunk);
            var texture = {};
            var loader = new THREE.TextureLoader(this.manager);
            loader.setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);
            while (next !== 0) {
                if (next === MAT_MAPNAME) {
                    var name = this.readString(data, 128);
                    texture = loader.load(name);
                    this.debugMessage('      File: ' + path + name);
                } else if (next === MAT_MAP_UOFFSET) {
                    texture.offset.x = this.readFloat(data);
                    this.debugMessage('      OffsetX: ' + texture.offset.x);
                } else if (next === MAT_MAP_VOFFSET) {
                    texture.offset.y = this.readFloat(data);
                    this.debugMessage('      OffsetY: ' + texture.offset.y);
                } else if (next === MAT_MAP_USCALE) {
                    texture.repeat.x = this.readFloat(data);
                    this.debugMessage('      RepeatX: ' + texture.repeat.x);
                } else if (next === MAT_MAP_VSCALE) {
                    texture.repeat.y = this.readFloat(data);
                    this.debugMessage('      RepeatY: ' + texture.repeat.y);
                } else {
                    this.debugMessage('      Unknown map chunk: ' + next.toString(16));
                }
                next = this.nextChunk(data, chunk);
            }
            this.endChunk(chunk);
            return texture;
        },
        readMaterialGroup: function (data) {
            this.readChunk(data);
            var name = this.readString(data, 64);
            var numFaces = this.readWord(data);
            this.debugMessage('         Name: ' + name);
            this.debugMessage('         Faces: ' + numFaces);
            var index = [];
            for (var i = 0; i < numFaces; ++i) {
                index.push(this.readWord(data));
            }
            return {
                name: name,
                index: index
            };
        },
        readColor: function (data) {
            var chunk = this.readChunk(data);
            var color = new THREE.Color();
            if (chunk.id === COLOR_24 || chunk.id === LIN_COLOR_24) {
                var r = this.readByte(data);
                var g = this.readByte(data);
                var b = this.readByte(data);
                color.setRGB(r / 255, g / 255, b / 255);
                this.debugMessage('      Color: ' + color.r + ', ' + color.g + ', ' + color.b);
            } else if (chunk.id === COLOR_F || chunk.id === LIN_COLOR_F) {
                var r = this.readFloat(data);
                var g = this.readFloat(data);
                var b = this.readFloat(data);
                color.setRGB(r, g, b);
                this.debugMessage('      Color: ' + color.r + ', ' + color.g + ', ' + color.b);
            } else {
                this.debugMessage('      Unknown color chunk: ' + chunk.toString(16));
            }
            this.endChunk(chunk);
            return color;
        },
        readChunk: function (data) {
            var chunk = {};
            chunk.cur = this.position;
            chunk.id = this.readWord(data);
            chunk.size = this.readDWord(data);
            chunk.end = chunk.cur + chunk.size;
            chunk.cur += 6;
            return chunk;
        },
        endChunk: function (chunk) {
            this.position = chunk.end;
        },
        nextChunk: function (data, chunk) {
            if (chunk.cur >= chunk.end) {
                return 0;
            }
            this.position = chunk.cur;
            try {
                var next = this.readChunk(data);
                chunk.cur += next.size;
                return next.id;
            } catch (e) {
                this.debugMessage('Unable to read chunk at ' + this.position);
                return 0;
            }
        },
        resetPosition: function () {
            this.position -= 6;
        },
        readByte: function (data) {
            var v = data.getUint8(this.position, true);
            this.position += 1;
            return v;
        },
        readFloat: function (data) {
            try {
                var v = data.getFloat32(this.position, true);
                this.position += 4;
                return v;
            } catch (e) {
                this.debugMessage(e + ' ' + this.position + ' ' + data.byteLength);
            }
        },
        readInt: function (data) {
            var v = data.getInt32(this.position, true);
            this.position += 4;
            return v;
        },
        readShort: function (data) {
            var v = data.getInt16(this.position, true);
            this.position += 2;
            return v;
        },
        readDWord: function (data) {
            var v = data.getUint32(this.position, true);
            this.position += 4;
            return v;
        },
        readWord: function (data) {
            var v = data.getUint16(this.position, true);
            this.position += 2;
            return v;
        },
        readString: function (data, maxLength) {
            var s = '';
            for (var i = 0; i < maxLength; i++) {
                var c = this.readByte(data);
                if (!c) {
                    break;
                }
                s += String.fromCharCode(c);
            }
            return s;
        },
        debugMessage: function (message) {
            if (this.debug) {
                console.log(message);
            }
        }
    });
    var M3DMAGIC = 19789;
    var MLIBMAGIC = 15786;
    var CMAGIC = 49725;
    var M3D_VERSION = 2;
    var COLOR_F = 16;
    var COLOR_24 = 17;
    var LIN_COLOR_24 = 18;
    var LIN_COLOR_F = 19;
    var MDATA = 15677;
    var MESH_VERSION = 15678;
    var MASTER_SCALE = 256;
    var MAT_ENTRY = 45055;
    var MAT_NAME = 40960;
    var MAT_AMBIENT = 40976;
    var MAT_DIFFUSE = 40992;
    var MAT_SPECULAR = 41008;
    var MAT_SHININESS = 41024;
    var MAT_TRANSPARENCY = 41040;
    var MAT_TWO_SIDE = 41089;
    var MAT_ADDITIVE = 41091;
    var MAT_WIRE = 41093;
    var MAT_WIRE_SIZE = 41095;
    var MAT_TEXMAP = 41472;
    var MAT_OPACMAP = 41488;
    var MAT_BUMPMAP = 41520;
    var MAT_SPECMAP = 41476;
    var MAT_MAPNAME = 41728;
    var MAT_MAP_USCALE = 41812;
    var MAT_MAP_VSCALE = 41814;
    var MAT_MAP_UOFFSET = 41816;
    var MAT_MAP_VOFFSET = 41818;
    var NAMED_OBJECT = 16384;
    var N_TRI_OBJECT = 16640;
    var POINT_ARRAY = 16656;
    var FACE_ARRAY = 16672;
    var MSH_MAT_GROUP = 16688;
    var TEX_VERTS = 16704;
    var MESH_MATRIX = 16736;

    return threex.loaders.TDSLoader = TDSLoader;
});