define(["skylark-threejs"], function (a) {
    'use strict';
    var BufferGeometryUtils = {
        computeTangents: function (geometry) {
            var index = geometry.index;
            var attributes = geometry.attributes;
            if (index === null || attributes.position === undefined || attributes.normal === undefined || attributes.uv === undefined) {
                console.warn('THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()');
                return;
            }
            var indices = index.array;
            var positions = attributes.position.array;
            var normals = attributes.normal.array;
            var uvs = attributes.uv.array;
            var nVertices = positions.length / 3;
            if (attributes.tangent === undefined) {
                geometry.setAttribute('tangent', new a.BufferAttribute(new Float32Array(4 * nVertices), 4));
            }
            var tangents = attributes.tangent.array;
            var tan1 = [], tan2 = [];
            for (var i = 0; i < nVertices; i++) {
                tan1[i] = new a.Vector3();
                tan2[i] = new a.Vector3();
            }
            var vA = new a.Vector3(), vB = new a.Vector3(), vC = new a.Vector3(), uvA = new a.Vector2(), uvB = new a.Vector2(), uvC = new a.Vector2(), sdir = new a.Vector3(), tdir = new a.Vector3();
            function handleTriangle(a, b, c) {
                vA.fromArray(positions, a * 3);
                vB.fromArray(positions, b * 3);
                vC.fromArray(positions, c * 3);
                uvA.fromArray(uvs, a * 2);
                uvB.fromArray(uvs, b * 2);
                uvC.fromArray(uvs, c * 2);
                vB.sub(vA);
                vC.sub(vA);
                uvB.sub(uvA);
                uvC.sub(uvA);
                var r = 1 / (uvB.x * uvC.y - uvC.x * uvB.y);
                if (!isFinite(r))
                    return;
                sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, -uvB.y).multiplyScalar(r);
                tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, -uvC.x).multiplyScalar(r);
                tan1[a].add(sdir);
                tan1[b].add(sdir);
                tan1[c].add(sdir);
                tan2[a].add(tdir);
                tan2[b].add(tdir);
                tan2[c].add(tdir);
            }
            var groups = geometry.groups;
            if (groups.length === 0) {
                groups = [{
                        start: 0,
                        count: indices.length
                    }];
            }
            for (var i = 0, il = groups.length; i < il; ++i) {
                var group = groups[i];
                var start = group.start;
                var count = group.count;
                for (var j = start, jl = start + count; j < jl; j += 3) {
                    handleTriangle(indices[j + 0], indices[j + 1], indices[j + 2]);
                }
            }
            var tmp = new a.Vector3(), tmp2 = new a.Vector3();
            var n = new a.Vector3(), n2 = new a.Vector3();
            var w, t, test;
            function handleVertex(v) {
                n.fromArray(normals, v * 3);
                n2.copy(n);
                t = tan1[v];
                tmp.copy(t);
                tmp.sub(n.multiplyScalar(n.dot(t))).normalize();
                tmp2.crossVectors(n2, t);
                test = tmp2.dot(tan2[v]);
                w = test < 0 ? -1 : 1;
                tangents[v * 4] = tmp.x;
                tangents[v * 4 + 1] = tmp.y;
                tangents[v * 4 + 2] = tmp.z;
                tangents[v * 4 + 3] = w;
            }
            for (var i = 0, il = groups.length; i < il; ++i) {
                var group = groups[i];
                var start = group.start;
                var count = group.count;
                for (var j = start, jl = start + count; j < jl; j += 3) {
                    handleVertex(indices[j + 0]);
                    handleVertex(indices[j + 1]);
                    handleVertex(indices[j + 2]);
                }
            }
        },
        mergeBufferGeometries: function (geometries, useGroups) {
            var isIndexed = geometries[0].index !== null;
            var attributesUsed = new Set(Object.keys(geometries[0].attributes));
            var morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
            var attributes = {};
            var morphAttributes = {};
            var morphTargetsRelative = geometries[0].morphTargetsRelative;
            var mergedGeometry = new a.BufferGeometry();
            var offset = 0;
            for (var i = 0; i < geometries.length; ++i) {
                var geometry = geometries[i];
                if (isIndexed !== (geometry.index !== null))
                    return null;
                for (var name in geometry.attributes) {
                    if (!attributesUsed.has(name))
                        return null;
                    if (attributes[name] === undefined)
                        attributes[name] = [];
                    attributes[name].push(geometry.attributes[name]);
                }
                if (morphTargetsRelative !== geometry.morphTargetsRelative)
                    return null;
                for (var name in geometry.morphAttributes) {
                    if (!morphAttributesUsed.has(name))
                        return null;
                    if (morphAttributes[name] === undefined)
                        morphAttributes[name] = [];
                    morphAttributes[name].push(geometry.morphAttributes[name]);
                }
                mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
                mergedGeometry.userData.mergedUserData.push(geometry.userData);
                if (useGroups) {
                    var count;
                    if (isIndexed) {
                        count = geometry.index.count;
                    } else if (geometry.attributes.position !== undefined) {
                        count = geometry.attributes.position.count;
                    } else {
                        return null;
                    }
                    mergedGeometry.addGroup(offset, count, i);
                    offset += count;
                }
            }
            if (isIndexed) {
                var indexOffset = 0;
                var mergedIndex = [];
                for (var i = 0; i < geometries.length; ++i) {
                    var index = geometries[i].index;
                    for (var j = 0; j < index.count; ++j) {
                        mergedIndex.push(index.getX(j) + indexOffset);
                    }
                    indexOffset += geometries[i].attributes.position.count;
                }
                mergedGeometry.setIndex(mergedIndex);
            }
            for (var name in attributes) {
                var mergedAttribute = this.mergeBufferAttributes(attributes[name]);
                if (!mergedAttribute)
                    return null;
                mergedGeometry.setAttribute(name, mergedAttribute);
            }
            for (var name in morphAttributes) {
                var numMorphTargets = morphAttributes[name][0].length;
                if (numMorphTargets === 0)
                    break;
                mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
                mergedGeometry.morphAttributes[name] = [];
                for (var i = 0; i < numMorphTargets; ++i) {
                    var morphAttributesToMerge = [];
                    for (var j = 0; j < morphAttributes[name].length; ++j) {
                        morphAttributesToMerge.push(morphAttributes[name][j][i]);
                    }
                    var mergedMorphAttribute = this.mergeBufferAttributes(morphAttributesToMerge);
                    if (!mergedMorphAttribute)
                        return null;
                    mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
                }
            }
            return mergedGeometry;
        },
        mergeBufferAttributes: function (attributes) {
            var TypedArray;
            var itemSize;
            var normalized;
            var arrayLength = 0;
            for (var i = 0; i < attributes.length; ++i) {
                var attribute = attributes[i];
                if (attribute.isInterleavedBufferAttribute)
                    return null;
                if (TypedArray === undefined)
                    TypedArray = attribute.array.constructor;
                if (TypedArray !== attribute.array.constructor)
                    return null;
                if (itemSize === undefined)
                    itemSize = attribute.itemSize;
                if (itemSize !== attribute.itemSize)
                    return null;
                if (normalized === undefined)
                    normalized = attribute.normalized;
                if (normalized !== attribute.normalized)
                    return null;
                arrayLength += attribute.array.length;
            }
            var array = new TypedArray(arrayLength);
            var offset = 0;
            for (var i = 0; i < attributes.length; ++i) {
                array.set(attributes[i].array, offset);
                offset += attributes[i].array.length;
            }
            return new a.BufferAttribute(array, itemSize, normalized);
        },
        interleaveAttributes: function (attributes) {
            var TypedArray;
            var arrayLength = 0;
            var stride = 0;
            for (var i = 0, l = attributes.length; i < l; ++i) {
                var attribute = attributes[i];
                if (TypedArray === undefined)
                    TypedArray = attribute.array.constructor;
                if (TypedArray !== attribute.array.constructor) {
                    console.warn('AttributeBuffers of different types cannot be interleaved');
                    return null;
                }
                arrayLength += attribute.array.length;
                stride += attribute.itemSize;
            }
            var interleavedBuffer = new a.InterleavedBuffer(new TypedArray(arrayLength), stride);
            var offset = 0;
            var res = [];
            var getters = [
                'getX',
                'getY',
                'getZ',
                'getW'
            ];
            var setters = [
                'setX',
                'setY',
                'setZ',
                'setW'
            ];
            for (var j = 0, l = attributes.length; j < l; j++) {
                var attribute = attributes[j];
                var itemSize = attribute.itemSize;
                var count = attribute.count;
                var iba = new a.InterleavedBufferAttribute(interleavedBuffer, itemSize, offset, attribute.normalized);
                res.push(iba);
                offset += itemSize;
                for (var c = 0; c < count; c++) {
                    for (var k = 0; k < itemSize; k++) {
                        iba[setters[k]](c, attribute[getters[k]](c));
                    }
                }
            }
            return res;
        },
        estimateBytesUsed: function (geometry) {
            var mem = 0;
            for (var name in geometry.attributes) {
                var attr = geometry.getAttribute(name);
                mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;
            }
            var indices = geometry.getIndex();
            mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
            return mem;
        },
        mergeVertices: function (geometry, tolerance = 0.0001) {
            tolerance = Math.max(tolerance, Number.EPSILON);
            var hashToIndex = {};
            var indices = geometry.getIndex();
            var positions = geometry.getAttribute('position');
            var vertexCount = indices ? indices.count : positions.count;
            var nextIndex = 0;
            var attributeNames = Object.keys(geometry.attributes);
            var attrArrays = {};
            var morphAttrsArrays = {};
            var newIndices = [];
            var getters = [
                'getX',
                'getY',
                'getZ',
                'getW'
            ];
            for (var i = 0, l = attributeNames.length; i < l; i++) {
                var name = attributeNames[i];
                attrArrays[name] = [];
                var morphAttr = geometry.morphAttributes[name];
                if (morphAttr) {
                    morphAttrsArrays[name] = new Array(morphAttr.length).fill().map(() => []);
                }
            }
            var decimalShift = Math.log10(1 / tolerance);
            var shiftMultiplier = Math.pow(10, decimalShift);
            for (var i = 0; i < vertexCount; i++) {
                var index = indices ? indices.getX(i) : i;
                var hash = '';
                for (var j = 0, l = attributeNames.length; j < l; j++) {
                    var name = attributeNames[j];
                    var attribute = geometry.getAttribute(name);
                    var itemSize = attribute.itemSize;
                    for (var k = 0; k < itemSize; k++) {
                        hash += `${ ~~(attribute[getters[k]](index) * shiftMultiplier) },`;
                    }
                }
                if (hash in hashToIndex) {
                    newIndices.push(hashToIndex[hash]);
                } else {
                    for (var j = 0, l = attributeNames.length; j < l; j++) {
                        var name = attributeNames[j];
                        var attribute = geometry.getAttribute(name);
                        var morphAttr = geometry.morphAttributes[name];
                        var itemSize = attribute.itemSize;
                        var newarray = attrArrays[name];
                        var newMorphArrays = morphAttrsArrays[name];
                        for (var k = 0; k < itemSize; k++) {
                            var getterFunc = getters[k];
                            newarray.push(attribute[getterFunc](index));
                            if (morphAttr) {
                                for (var m = 0, ml = morphAttr.length; m < ml; m++) {
                                    newMorphArrays[m].push(morphAttr[m][getterFunc](index));
                                }
                            }
                        }
                    }
                    hashToIndex[hash] = nextIndex;
                    newIndices.push(nextIndex);
                    nextIndex++;
                }
            }
            const result = geometry.clone();
            for (var i = 0, l = attributeNames.length; i < l; i++) {
                var name = attributeNames[i];
                var oldAttribute = geometry.getAttribute(name);
                var buffer = new oldAttribute.array.constructor(attrArrays[name]);
                var attribute = new a.BufferAttribute(buffer, oldAttribute.itemSize, oldAttribute.normalized);
                result.setAttribute(name, attribute);
                if (name in morphAttrsArrays) {
                    for (var j = 0; j < morphAttrsArrays[name].length; j++) {
                        var oldMorphAttribute = geometry.morphAttributes[name][j];
                        var buffer = new oldMorphAttribute.array.constructor(morphAttrsArrays[name][j]);
                        var morphAttribute = new a.BufferAttribute(buffer, oldMorphAttribute.itemSize, oldMorphAttribute.normalized);
                        result.morphAttributes[name][j] = morphAttribute;
                    }
                }
            }
            result.setIndex(newIndices);
            return result;
        },
        toTrianglesDrawMode: function (geometry, drawMode) {
            if (drawMode === a.TrianglesDrawMode) {
                console.warn('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.');
                return geometry;
            }
            if (drawMode === a.TriangleFanDrawMode || drawMode === a.TriangleStripDrawMode) {
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
                        console.error('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.');
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
                    console.error('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.');
                }
                var newGeometry = geometry.clone();
                newGeometry.setIndex(newIndices);
                newGeometry.clearGroups();
                return newGeometry;
            } else {
                console.error('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode);
                return geometry;
            }
        }
    };
    return BufferGeometryUtils;
});