define(["skylark-threejs"], function (a) {
    'use strict';
    var AWDLoader = function () {
        var AWD_FIELD_INT8 = 1, AWD_FIELD_INT16 = 2, AWD_FIELD_INT32 = 3, AWD_FIELD_UINT8 = 4, AWD_FIELD_UINT16 = 5, AWD_FIELD_UINT32 = 6, AWD_FIELD_FLOAT32 = 7, AWD_FIELD_FLOAT64 = 8, AWD_FIELD_BOOL = 21, AWD_FIELD_BADDR = 23, AWD_FIELD_VECTOR2x1 = 41, AWD_FIELD_VECTOR3x1 = 42, AWD_FIELD_VECTOR4x1 = 43, AWD_FIELD_MTX3x2 = 44, AWD_FIELD_MTX3x3 = 45, AWD_FIELD_MTX4x3 = 46, AWD_FIELD_MTX4x4 = 47, BOOL = 21, BADDR = 23, UINT8 = 4, UINT16 = 5, FLOAT32 = 7, FLOAT64 = 8;
        var littleEndian = true;
        function Block() {
            this.id = 0;
            this.data = null;
            this.namespace = 0;
            this.flags = 0;
        }
        function AWDProperties() {
        }
        AWDProperties.prototype = {
            set: function (key, value) {
                this[key] = value;
            },
            get: function (key, fallback) {
                if (this.hasOwnProperty(key)) {
                    return this[key];
                } else {
                    return fallback;
                }
            }
        };
        var AWDLoader = function (manager) {
            a.Loader.call(this, manager);
            this.trunk = new a.Object3D();
            this.materialFactory = undefined;
            this._url = '';
            this._baseDir = '';
            this._data = undefined;
            this._ptr = 0;
            this._version = [];
            this._streaming = false;
            this._optimized_for_accuracy = false;
            this._compression = 0;
            this._bodylen = 4294967295;
            this._blocks = [new Block()];
            this._accuracyMatrix = false;
            this._accuracyGeo = false;
            this._accuracyProps = false;
        };
        AWDLoader.prototype = Object.assign(Object.create(a.Loader.prototype), {
            constructor: AWDLoader,
            load: function (url, onLoad, onProgress, onError) {
                var scope = this;
                this._url = url;
                this._baseDir = url.substr(0, url.lastIndexOf('/') + 1);
                var loader = new a.FileLoader(this.manager);
                loader.setPath(this.path);
                loader.setResponseType('arraybuffer');
                loader.load(url, function (text) {
                    onLoad(scope.parse(text));
                }, onProgress, onError);
            },
            parse: function (data) {
                var blen = data.byteLength;
                this._ptr = 0;
                this._data = new DataView(data);
                this._parseHeader();
                if (this._compression != 0) {
                    console.error('compressed AWD not supported');
                }
                if (!this._streaming && this._bodylen != data.byteLength - this._ptr) {
                    console.error('AWDLoader: body len does not match file length', this._bodylen, blen - this._ptr);
                }
                while (this._ptr < blen) {
                    this.parseNextBlock();
                }
                return this.trunk;
            },
            parseNextBlock: function () {
                var assetData, block, blockId = this.readU32(), ns = this.readU8(), type = this.readU8(), flags = this.readU8(), len = this.readU32();
                switch (type) {
                case 1:
                    assetData = this.parseMeshData();
                    break;
                case 22:
                    assetData = this.parseContainer();
                    break;
                case 23:
                    assetData = this.parseMeshInstance();
                    break;
                case 81:
                    assetData = this.parseMaterial();
                    break;
                case 82:
                    assetData = this.parseTexture();
                    break;
                case 101:
                    assetData = this.parseSkeleton();
                    break;
                case 112:
                    assetData = this.parseMeshPoseAnimation(false);
                    break;
                case 113:
                    assetData = this.parseVertexAnimationSet();
                    break;
                case 102:
                    assetData = this.parseSkeletonPose();
                    break;
                case 103:
                    assetData = this.parseSkeletonAnimation();
                    break;
                case 122:
                    assetData = this.parseAnimatorSet();
                    break;
                default:
                    this._ptr += len;
                    break;
                }
                this._blocks[blockId] = block = new Block();
                block.data = assetData;
                block.id = blockId;
                block.namespace = ns;
                block.flags = flags;
            },
            _parseHeader: function () {
                var version = this._version, awdmagic = this.readU8() << 16 | this.readU8() << 8 | this.readU8();
                if (awdmagic != 4282180)
                    throw new Error('AWDLoader - bad magic');
                version[0] = this.readU8();
                version[1] = this.readU8();
                var flags = this.readU16();
                this._streaming = (flags & 1) == 1;
                if (version[0] === 2 && version[1] === 1) {
                    this._accuracyMatrix = (flags & 2) === 2;
                    this._accuracyGeo = (flags & 4) === 4;
                    this._accuracyProps = (flags & 8) === 8;
                }
                this._geoNrType = this._accuracyGeo ? FLOAT64 : FLOAT32;
                this._matrixNrType = this._accuracyMatrix ? FLOAT64 : FLOAT32;
                this._propsNrType = this._accuracyProps ? FLOAT64 : FLOAT32;
                this._optimized_for_accuracy = (flags & 2) === 2;
                this._compression = this.readU8();
                this._bodylen = this.readU32();
            },
            parseContainer: function () {
                var parent, ctr = new a.Object3D(), par_id = this.readU32(), mtx = this.parseMatrix4();
                ctr.name = this.readUTF();
                ctr.applyMatrix4(mtx);
                parent = this._blocks[par_id].data || this.trunk;
                parent.add(ctr);
                this.parseProperties({
                    1: this._matrixNrType,
                    2: this._matrixNrType,
                    3: this._matrixNrType,
                    4: UINT8
                });
                ctr.extra = this.parseUserAttributes();
                return ctr;
            },
            parseMeshInstance: function () {
                var name, mesh, geometries, meshLen, meshes, par_id, data_id, mtx, materials, mat, mat_id, num_materials, parent, i;
                par_id = this.readU32();
                mtx = this.parseMatrix4();
                name = this.readUTF();
                data_id = this.readU32();
                num_materials = this.readU16();
                geometries = this.getBlock(data_id);
                materials = [];
                for (i = 0; i < num_materials; i++) {
                    mat_id = this.readU32();
                    mat = this.getBlock(mat_id);
                    materials.push(mat);
                }
                meshLen = geometries.length;
                meshes = [];
                if (meshLen > 1) {
                    mesh = new a.Object3D();
                    for (i = 0; i < meshLen; i++) {
                        var sm = new a.Mesh(geometries[i]);
                        meshes.push(sm);
                        mesh.add(sm);
                    }
                } else {
                    mesh = new a.Mesh(geometries[0]);
                    meshes.push(mesh);
                }
                mesh.applyMatrix4(mtx);
                mesh.name = name;
                parent = this.getBlock(par_id) || this.trunk;
                parent.add(mesh);
                var matLen = materials.length;
                var maxLen = Math.max(meshLen, matLen);
                for (i = 0; i < maxLen; i++)
                    meshes[i % meshLen].material = materials[i % matLen];
                this.parseProperties(null);
                mesh.extra = this.parseUserAttributes();
                return mesh;
            },
            parseMaterial: function () {
                var name, type, props, mat, attributes, num_methods, methods_parsed;
                name = this.readUTF();
                type = this.readU8();
                num_methods = this.readU8();
                props = this.parseProperties({
                    1: AWD_FIELD_INT32,
                    2: AWD_FIELD_BADDR,
                    11: AWD_FIELD_BOOL,
                    12: AWD_FIELD_FLOAT32,
                    13: AWD_FIELD_BOOL
                });
                methods_parsed = 0;
                while (methods_parsed < num_methods) {
                    this.readU16();
                    this.parseProperties(null);
                    this.parseUserAttributes();
                }
                attributes = this.parseUserAttributes();
                if (this.materialFactory !== undefined) {
                    mat = this.materialFactory(name);
                    if (mat)
                        return mat;
                }
                mat = new a.MeshPhongMaterial();
                if (type === 1) {
                    mat.color.setHex(props.get(1, 13421772));
                } else if (type === 2) {
                    var tex_addr = props.get(2, 0);
                    mat.map = this.getBlock(tex_addr);
                }
                mat.extra = attributes;
                mat.alphaThreshold = props.get(12, 0);
                mat.repeat = props.get(13, false);
                return mat;
            },
            parseTexture: function () {
                var name = this.readUTF(), type = this.readU8(), asset, data_len;
                if (type === 0) {
                    data_len = this.readU32();
                    var url = this.readUTFBytes(data_len);
                    console.log(url);
                    asset = this.loadTexture(url);
                    asset.userData = {};
                    asset.userData.name = name;
                } else {
                }
                this.parseProperties(null);
                this.parseUserAttributes();
                return asset;
            },
            loadTexture: function (url) {
                var tex = new a.Texture();
                var loader = new a.ImageLoader(this.manager);
                loader.load(this._baseDir + url, function (image) {
                    tex.image = image;
                    tex.needsUpdate = true;
                });
                return tex;
            },
            parseSkeleton: function () {
                this.readUTF();
                var num_joints = this.readU16(), skeleton = [], joints_parsed = 0;
                this.parseProperties(null);
                while (joints_parsed < num_joints) {
                    var joint, ibp;
                    this.readU16();
                    joint = new a.Bone();
                    joint.parent = this.readU16() - 1;
                    joint.name = this.readUTF();
                    ibp = this.parseMatrix4();
                    joint.skinMatrix = ibp;
                    this.parseProperties(null);
                    this.parseUserAttributes();
                    skeleton.push(joint);
                    joints_parsed++;
                }
                this.parseUserAttributes();
                return skeleton;
            },
            parseSkeletonPose: function () {
                var name = this.readUTF();
                var num_joints = this.readU16();
                this.parseProperties(null);
                var pose = [];
                var joints_parsed = 0;
                while (joints_parsed < num_joints) {
                    var has_transform;
                    var mtx_data;
                    has_transform = this.readU8();
                    if (has_transform === 1) {
                        mtx_data = this.parseMatrix4();
                    } else {
                        mtx_data = new a.Matrix4();
                    }
                    pose[joints_parsed] = mtx_data;
                    joints_parsed++;
                }
                this.parseUserAttributes();
                return pose;
            },
            parseSkeletonAnimation: function () {
                var frame_dur;
                var pose_addr;
                var pose;
                var name = this.readUTF();
                var clip = [];
                var num_frames = this.readU16();
                this.parseProperties(null);
                var frames_parsed = 0;
                while (frames_parsed < num_frames) {
                    pose_addr = this.readU32();
                    frame_dur = this.readU16();
                    pose = this._blocks[pose_addr].data;
                    clip.push({
                        pose: pose,
                        duration: frame_dur
                    });
                    frames_parsed++;
                }
                if (clip.length === 0) {
                    return;
                }
                this.parseUserAttributes();
                return clip;
            },
            parseVertexAnimationSet: function () {
                var poseBlockAdress, name = this.readUTF(), num_frames = this.readU16(), props = this.parseProperties({ 1: UINT16 }), frames_parsed = 0, skeletonFrames = [];
                while (frames_parsed < num_frames) {
                    poseBlockAdress = this.readU32();
                    skeletonFrames.push(this._blocks[poseBlockAdress].data);
                    frames_parsed++;
                }
                this.parseUserAttributes();
                return skeletonFrames;
            },
            parseAnimatorSet: function () {
                var animSetBlockAdress;
                var targetAnimationSet;
                var name = this.readUTF();
                var type = this.readU16();
                var props = this.parseProperties({ 1: BADDR });
                animSetBlockAdress = this.readU32();
                var targetMeshLength = this.readU16();
                var meshAdresses = [];
                for (var i = 0; i < targetMeshLength; i++)
                    meshAdresses.push(this.readU32());
                var activeState = this.readU16();
                var autoplay = Boolean(this.readU8());
                this.parseUserAttributes();
                this.parseUserAttributes();
                var targetMeshes = [];
                for (i = 0; i < meshAdresses.length; i++) {
                    targetMeshes.push(this._blocks[meshAdresses[i]].data);
                }
                targetAnimationSet = this._blocks[animSetBlockAdress].data;
                var thisAnimator;
                if (type == 1) {
                    thisAnimator = {
                        animationSet: targetAnimationSet,
                        skeleton: this._blocks[props.get(1, 0)].data
                    };
                } else if (type == 2) {
                }
                for (i = 0; i < targetMeshes.length; i++) {
                    targetMeshes[i].animator = thisAnimator;
                }
                return thisAnimator;
            },
            parseMeshData: function () {
                var name = this.readUTF(), num_subs = this.readU16(), geom, subs_parsed = 0, buffer, geometries = [];
                this.parseProperties({
                    1: this._geoNrType,
                    2: this._geoNrType
                });
                while (subs_parsed < num_subs) {
                    var sm_len, sm_end, attrib;
                    geom = new a.BufferGeometry();
                    geom.name = name;
                    geometries.push(geom);
                    sm_len = this.readU32();
                    sm_end = this._ptr + sm_len;
                    this.parseProperties({
                        1: this._geoNrType,
                        2: this._geoNrType
                    });
                    while (this._ptr < sm_end) {
                        var idx = 0, str_type = this.readU8(), str_ftype = this.readU8(), str_len = this.readU32(), str_end = str_len + this._ptr;
                        if (str_type === 1) {
                            buffer = new Float32Array(str_len / 12 * 3);
                            attrib = new a.BufferAttribute(buffer, 3);
                            geom.setAttribute('position', attrib);
                            idx = 0;
                            while (this._ptr < str_end) {
                                buffer[idx] = -this.readF32();
                                buffer[idx + 1] = this.readF32();
                                buffer[idx + 2] = this.readF32();
                                idx += 3;
                            }
                        } else if (str_type === 2) {
                            buffer = new Uint16Array(str_len / 2);
                            attrib = new a.BufferAttribute(buffer, 1);
                            geom.setIndex(attrib);
                            idx = 0;
                            while (this._ptr < str_end) {
                                buffer[idx + 1] = this.readU16();
                                buffer[idx] = this.readU16();
                                buffer[idx + 2] = this.readU16();
                                idx += 3;
                            }
                        } else if (str_type === 3) {
                            buffer = new Float32Array(str_len / 8 * 2);
                            attrib = new a.BufferAttribute(buffer, 2);
                            geom.setAttribute('uv', attrib);
                            idx = 0;
                            while (this._ptr < str_end) {
                                buffer[idx] = this.readF32();
                                buffer[idx + 1] = 1 - this.readF32();
                                idx += 2;
                            }
                        } else if (str_type === 4) {
                            buffer = new Float32Array(str_len / 12 * 3);
                            attrib = new a.BufferAttribute(buffer, 3);
                            geom.setAttribute('normal', attrib);
                            idx = 0;
                            while (this._ptr < str_end) {
                                buffer[idx] = -this.readF32();
                                buffer[idx + 1] = this.readF32();
                                buffer[idx + 2] = this.readF32();
                                idx += 3;
                            }
                        } else {
                            this._ptr = str_end;
                        }
                    }
                    this.parseUserAttributes();
                    geom.computeBoundingSphere();
                    subs_parsed++;
                }
                this.parseUserAttributes();
                return geometries;
            },
            parseMeshPoseAnimation: function (poseOnly) {
                var num_frames = 1, num_submeshes, frames_parsed, subMeshParsed, str_len, str_end, geom, idx = 0, clip = {}, num_Streams, streamsParsed, streamtypes = [], props, name = this.readUTF(), geoAdress = this.readU32();
                var mesh = this.getBlock(geoAdress);
                if (mesh === null) {
                    console.log('parseMeshPoseAnimation target mesh not found at:', geoAdress);
                    return;
                }
                geom = mesh.geometry;
                geom.morphTargets = [];
                if (!poseOnly)
                    num_frames = this.readU16();
                num_submeshes = this.readU16();
                num_Streams = this.readU16();
                streamsParsed = 0;
                while (streamsParsed < num_Streams) {
                    streamtypes.push(this.readU16());
                    streamsParsed++;
                }
                props = this.parseProperties({
                    1: BOOL,
                    2: BOOL
                });
                clip.looping = props.get(1, true);
                clip.stitchFinalFrame = props.get(2, false);
                frames_parsed = 0;
                while (frames_parsed < num_frames) {
                    this.readU16();
                    subMeshParsed = 0;
                    while (subMeshParsed < num_submeshes) {
                        streamsParsed = 0;
                        str_len = this.readU32();
                        str_end = this._ptr + str_len;
                        while (streamsParsed < num_Streams) {
                            if (streamtypes[streamsParsed] === 1) {
                                var buffer = new Float32Array(str_len / 4);
                                geom.morphTargets.push({ array: buffer });
                                idx = 0;
                                while (this._ptr < str_end) {
                                    buffer[idx] = this.readF32();
                                    buffer[idx + 1] = this.readF32();
                                    buffer[idx + 2] = this.readF32();
                                    idx += 3;
                                }
                                subMeshParsed++;
                            } else
                                this._ptr = str_end;
                            streamsParsed++;
                        }
                    }
                    frames_parsed++;
                }
                this.parseUserAttributes();
                return null;
            },
            getBlock: function (id) {
                return this._blocks[id].data;
            },
            parseMatrix4: function () {
                var mtx = new a.Matrix4();
                var e = mtx.elements;
                e[0] = this.readF32();
                e[1] = this.readF32();
                e[2] = this.readF32();
                e[3] = 0;
                e[4] = this.readF32();
                e[5] = this.readF32();
                e[6] = this.readF32();
                e[7] = 0;
                e[8] = this.readF32();
                e[9] = this.readF32();
                e[10] = this.readF32();
                e[11] = 0;
                e[12] = -this.readF32();
                e[13] = this.readF32();
                e[14] = this.readF32();
                e[15] = 1;
                return mtx;
            },
            parseProperties: function (expected) {
                var list_len = this.readU32();
                var list_end = this._ptr + list_len;
                var props = new AWDProperties();
                if (expected) {
                    while (this._ptr < list_end) {
                        var key = this.readU16();
                        var len = this.readU32();
                        var type;
                        if (expected.hasOwnProperty(key)) {
                            type = expected[key];
                            props.set(key, this.parseAttrValue(type, len));
                        } else {
                            this._ptr += len;
                        }
                    }
                }
                return props;
            },
            parseUserAttributes: function () {
                this._ptr = this.readU32() + this._ptr;
                return null;
            },
            parseAttrValue: function (type, len) {
                var elem_len;
                var read_func;
                switch (type) {
                case AWD_FIELD_INT8:
                    elem_len = 1;
                    read_func = this.readI8;
                    break;
                case AWD_FIELD_INT16:
                    elem_len = 2;
                    read_func = this.readI16;
                    break;
                case AWD_FIELD_INT32:
                    elem_len = 4;
                    read_func = this.readI32;
                    break;
                case AWD_FIELD_BOOL:
                case AWD_FIELD_UINT8:
                    elem_len = 1;
                    read_func = this.readU8;
                    break;
                case AWD_FIELD_UINT16:
                    elem_len = 2;
                    read_func = this.readU16;
                    break;
                case AWD_FIELD_UINT32:
                case AWD_FIELD_BADDR:
                    elem_len = 4;
                    read_func = this.readU32;
                    break;
                case AWD_FIELD_FLOAT32:
                    elem_len = 4;
                    read_func = this.readF32;
                    break;
                case AWD_FIELD_FLOAT64:
                    elem_len = 8;
                    read_func = this.readF64;
                    break;
                case AWD_FIELD_VECTOR2x1:
                case AWD_FIELD_VECTOR3x1:
                case AWD_FIELD_VECTOR4x1:
                case AWD_FIELD_MTX3x2:
                case AWD_FIELD_MTX3x3:
                case AWD_FIELD_MTX4x3:
                case AWD_FIELD_MTX4x4:
                    elem_len = 8;
                    read_func = this.readF64;
                    break;
                }
                if (elem_len < len) {
                    var list;
                    var num_read;
                    var num_elems;
                    list = [];
                    num_read = 0;
                    num_elems = len / elem_len;
                    while (num_read < num_elems) {
                        list.push(read_func.call(this));
                        num_read++;
                    }
                    return list;
                } else {
                    return read_func.call(this);
                }
            },
            readU8: function () {
                return this._data.getUint8(this._ptr++);
            },
            readI8: function () {
                return this._data.getInt8(this._ptr++);
            },
            readU16: function () {
                var a = this._data.getUint16(this._ptr, littleEndian);
                this._ptr += 2;
                return a;
            },
            readI16: function () {
                var a = this._data.getInt16(this._ptr, littleEndian);
                this._ptr += 2;
                return a;
            },
            readU32: function () {
                var a = this._data.getUint32(this._ptr, littleEndian);
                this._ptr += 4;
                return a;
            },
            readI32: function () {
                var a = this._data.getInt32(this._ptr, littleEndian);
                this._ptr += 4;
                return a;
            },
            readF32: function () {
                var a = this._data.getFloat32(this._ptr, littleEndian);
                this._ptr += 4;
                return a;
            },
            readF64: function () {
                var a = this._data.getFloat64(this._ptr, littleEndian);
                this._ptr += 8;
                return a;
            },
            readUTF: function () {
                var len = this.readU16();
                return this.readUTFBytes(len);
            },
            readUTFBytes: function (len) {
                var out = [], c = 0;
                while (out.length < len) {
                    var c1 = this._data.getUint8(this._ptr++, littleEndian);
                    if (c1 < 128) {
                        out[c++] = String.fromCharCode(c1);
                    } else if (c1 > 191 && c1 < 224) {
                        var c2 = this._data.getUint8(this._ptr++, littleEndian);
                        out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
                    } else {
                        var c2 = this._data.getUint8(this._ptr++, littleEndian);
                        var c3 = this._data.getUint8(this._ptr++, littleEndian);
                        out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    }
                }
                return out.join('');
            }
        });
        return AWDLoader;
    }();
    return AWDLoader;
});