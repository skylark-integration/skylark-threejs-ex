define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var PRWMLoader = function () {
        var bigEndianPlatform = null;
        function isBigEndianPlatform() {
            if (bigEndianPlatform === null) {
                var buffer = new ArrayBuffer(2), uint8Array = new Uint8Array(buffer), uint16Array = new Uint16Array(buffer);
                uint8Array[0] = 170;
                uint8Array[1] = 187;
                bigEndianPlatform = uint16Array[0] === 43707;
            }
            return bigEndianPlatform;
        }
        var InvertedEncodingTypes = [
            null,
            Float32Array,
            null,
            Int8Array,
            Int16Array,
            null,
            Int32Array,
            Uint8Array,
            Uint16Array,
            null,
            Uint32Array
        ];
        var getMethods = {
            Uint16Array: 'getUint16',
            Uint32Array: 'getUint32',
            Int16Array: 'getInt16',
            Int32Array: 'getInt32',
            Float32Array: 'getFloat32',
            Float64Array: 'getFloat64'
        };
        function copyFromBuffer(sourceArrayBuffer, viewType, position, length, fromBigEndian) {
            var bytesPerElement = viewType.BYTES_PER_ELEMENT, result;
            if (fromBigEndian === isBigEndianPlatform() || bytesPerElement === 1) {
                result = new viewType(sourceArrayBuffer, position, length);
            } else {
                var readView = new DataView(sourceArrayBuffer, position, length * bytesPerElement), getMethod = getMethods[viewType.name], littleEndian = !fromBigEndian, i = 0;
                result = new viewType(length);
                for (; i < length; i++) {
                    result[i] = readView[getMethod](i * bytesPerElement, littleEndian);
                }
            }
            return result;
        }
        function decodePrwm(buffer) {
            var array = new Uint8Array(buffer), version = array[0], flags = array[1], indexedGeometry = !!(flags >> 7 & 1), indicesType = flags >> 6 & 1, bigEndian = (flags >> 5 & 1) === 1, attributesNumber = flags & 31, valuesNumber = 0, indicesNumber = 0;
            if (bigEndian) {
                valuesNumber = (array[2] << 16) + (array[3] << 8) + array[4];
                indicesNumber = (array[5] << 16) + (array[6] << 8) + array[7];
            } else {
                valuesNumber = array[2] + (array[3] << 8) + (array[4] << 16);
                indicesNumber = array[5] + (array[6] << 8) + (array[7] << 16);
            }
            if (version === 0) {
                throw new Error('PRWM decoder: Invalid format version: 0');
            } else if (version !== 1) {
                throw new Error('PRWM decoder: Unsupported format version: ' + version);
            }
            if (!indexedGeometry) {
                if (indicesType !== 0) {
                    throw new Error('PRWM decoder: Indices type must be set to 0 for non-indexed geometries');
                } else if (indicesNumber !== 0) {
                    throw new Error('PRWM decoder: Number of indices must be set to 0 for non-indexed geometries');
                }
            }
            var pos = 8;
            var attributes = {}, attributeName, char, attributeType, cardinality, encodingType, arrayType, values, indices, i;
            for (i = 0; i < attributesNumber; i++) {
                attributeName = '';
                while (pos < array.length) {
                    char = array[pos];
                    pos++;
                    if (char === 0) {
                        break;
                    } else {
                        attributeName += String.fromCharCode(char);
                    }
                }
                flags = array[pos];
                attributeType = flags >> 7 & 1;
                cardinality = (flags >> 4 & 3) + 1;
                encodingType = flags & 15;
                arrayType = InvertedEncodingTypes[encodingType];
                pos++;
                pos = Math.ceil(pos / 4) * 4;
                values = copyFromBuffer(buffer, arrayType, pos, cardinality * valuesNumber, bigEndian);
                pos += arrayType.BYTES_PER_ELEMENT * cardinality * valuesNumber;
                attributes[attributeName] = {
                    type: attributeType,
                    cardinality: cardinality,
                    values: values
                };
            }
            pos = Math.ceil(pos / 4) * 4;
            indices = null;
            if (indexedGeometry) {
                indices = copyFromBuffer(buffer, indicesType === 1 ? Uint32Array : Uint16Array, pos, indicesNumber, bigEndian);
            }
            return {
                version: version,
                attributes: attributes,
                indices: indices
            };
        }
        function PRWMLoader(manager) {
            THREE.Loader.call(this, manager);
        }
        PRWMLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
            constructor: PRWMLoader,
            load: function (url, onLoad, onProgress, onError) {
                var scope = this;
                var loader = new THREE.FileLoader(scope.manager);
                loader.setPath(scope.path);
                loader.setResponseType('arraybuffer');
                url = url.replace(/\*/g, isBigEndianPlatform() ? 'be' : 'le');
                loader.load(url, function (arrayBuffer) {
                    onLoad(scope.parse(arrayBuffer));
                }, onProgress, onError);
            },
            parse: function (arrayBuffer) {
                var data = decodePrwm(arrayBuffer), attributesKey = Object.keys(data.attributes), bufferGeometry = new THREE.BufferGeometry(), attribute, i;
                for (i = 0; i < attributesKey.length; i++) {
                    attribute = data.attributes[attributesKey[i]];
                    bufferGeometry.setAttribute(attributesKey[i], new THREE.BufferAttribute(attribute.values, attribute.cardinality, attribute.normalized));
                }
                if (data.indices !== null) {
                    bufferGeometry.setIndex(new THREE.BufferAttribute(data.indices, 1));
                }
                return bufferGeometry;
            }
        });
        PRWMLoader.isBigEndianPlatform = function () {
            return isBigEndianPlatform();
        };
        return PRWMLoader;
    }();

    return threex.loaders.PRWMLoader = PRWMLoader;
});