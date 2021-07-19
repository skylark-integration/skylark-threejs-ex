define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var KTXLoader = function (manager) {
        THREE.CompressedTextureLoader.call(this, manager);
    };
    KTXLoader.prototype = Object.assign(Object.create(THREE.CompressedTextureLoader.prototype), {
        constructor: KTXLoader,
        parse: function (buffer, loadMipmaps) {
            var ktx = new KhronosTextureContainer(buffer, 1);
            return {
                mipmaps: ktx.mipmaps(loadMipmaps),
                width: ktx.pixelWidth,
                height: ktx.pixelHeight,
                format: ktx.glInternalFormat,
                isCubemap: ktx.numberOfFaces === 6,
                mipmapCount: ktx.numberOfMipmapLevels
            };
        }
    });
    var KhronosTextureContainer = function () {
        function KhronosTextureContainer(arrayBuffer, facesExpected) {
            this.arrayBuffer = arrayBuffer;
            var identifier = new Uint8Array(this.arrayBuffer, 0, 12);
            if (identifier[0] !== 171 || identifier[1] !== 75 || identifier[2] !== 84 || identifier[3] !== 88 || identifier[4] !== 32 || identifier[5] !== 49 || identifier[6] !== 49 || identifier[7] !== 187 || identifier[8] !== 13 || identifier[9] !== 10 || identifier[10] !== 26 || identifier[11] !== 10) {
                console.error('texture missing KTX identifier');
                return;
            }
            var dataSize = Uint32Array.BYTES_PER_ELEMENT;
            var headerDataView = new DataView(this.arrayBuffer, 12, 13 * dataSize);
            var endianness = headerDataView.getUint32(0, true);
            var littleEndian = endianness === 67305985;
            this.glType = headerDataView.getUint32(1 * dataSize, littleEndian);
            this.glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian);
            this.glFormat = headerDataView.getUint32(3 * dataSize, littleEndian);
            this.glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian);
            this.glBaseInternalFormat = headerDataView.getUint32(5 * dataSize, littleEndian);
            this.pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian);
            this.pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian);
            this.pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian);
            this.numberOfArrayElements = headerDataView.getUint32(9 * dataSize, littleEndian);
            this.numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian);
            this.numberOfMipmapLevels = headerDataView.getUint32(11 * dataSize, littleEndian);
            this.bytesOfKeyValueData = headerDataView.getUint32(12 * dataSize, littleEndian);
            if (this.glType !== 0) {
                console.warn('only compressed formats currently supported');
                return;
            } else {
                this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);
            }
            if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
                console.warn('only 2D textures currently supported');
                return;
            }
            if (this.numberOfArrayElements !== 0) {
                console.warn('texture arrays not currently supported');
                return;
            }
            if (this.numberOfFaces !== facesExpected) {
                console.warn('number of faces expected' + facesExpected + ', but found ' + this.numberOfFaces);
                return;
            }
            this.loadType = KhronosTextureContainer.COMPRESSED_2D;
        }
        KhronosTextureContainer.prototype.mipmaps = function (loadMipmaps) {
            var mipmaps = [];
            var dataOffset = KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData;
            var width = this.pixelWidth;
            var height = this.pixelHeight;
            var mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1;
            for (var level = 0; level < mipmapCount; level++) {
                var imageSize = new Int32Array(this.arrayBuffer, dataOffset, 1)[0];
                dataOffset += 4;
                for (var face = 0; face < this.numberOfFaces; face++) {
                    var byteArray = new Uint8Array(this.arrayBuffer, dataOffset, imageSize);
                    mipmaps.push({
                        'data': byteArray,
                        'width': width,
                        'height': height
                    });
                    dataOffset += imageSize;
                    dataOffset += 3 - (imageSize + 3) % 4;
                }
                width = Math.max(1, width * 0.5);
                height = Math.max(1, height * 0.5);
            }
            return mipmaps;
        };
        KhronosTextureContainer.HEADER_LEN = 12 + 13 * 4;
        KhronosTextureContainer.COMPRESSED_2D = 0;
        KhronosTextureContainer.COMPRESSED_3D = 1;
        KhronosTextureContainer.TEX_2D = 2;
        KhronosTextureContainer.TEX_3D = 3;
        return KhronosTextureContainer;
    }();

    return threex.loaders.KTXLoader = KTXLoader;
});