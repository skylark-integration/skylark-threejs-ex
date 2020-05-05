define([
    "skylark-threejs",
    '../loaders/RGBELoader.js'
], function (a, b) {
    'use strict';
    var HDRCubeTextureLoader = function (manager) {
        a.Loader.call(this, manager);
        this.hdrLoader = new b.RGBELoader();
        this.type = a.UnsignedByteType;
    };
    HDRCubeTextureLoader.prototype = Object.assign(Object.create(a.Loader.prototype), {
        constructor: HDRCubeTextureLoader,
        load: function (urls, onLoad, onProgress, onError) {
            if (!Array.isArray(urls)) {
                console.warn('THREE.HDRCubeTextureLoader signature has changed. Use .setDataType() instead.');
                this.setDataType(urls);
                urls = onLoad;
                onLoad = onProgress;
                onProgress = onError;
                onError = arguments[4];
            }
            var texture = new a.CubeTexture();
            texture.type = this.type;
            switch (texture.type) {
            case a.UnsignedByteType:
                texture.encoding = a.RGBEEncoding;
                texture.format = a.RGBAFormat;
                texture.minFilter = a.NearestFilter;
                texture.magFilter = a.NearestFilter;
                texture.generateMipmaps = false;
                break;
            case a.FloatType:
                texture.encoding = a.LinearEncoding;
                texture.format = a.RGBFormat;
                texture.minFilter = a.LinearFilter;
                texture.magFilter = a.LinearFilter;
                texture.generateMipmaps = false;
                break;
            case a.HalfFloatType:
                texture.encoding = a.LinearEncoding;
                texture.format = a.RGBFormat;
                texture.minFilter = a.LinearFilter;
                texture.magFilter = a.LinearFilter;
                texture.generateMipmaps = false;
                break;
            }
            var scope = this;
            var loaded = 0;
            function loadHDRData(i, onLoad, onProgress, onError) {
                new a.FileLoader(scope.manager).setPath(scope.path).setResponseType('arraybuffer').load(urls[i], function (buffer) {
                    loaded++;
                    var texData = scope.hdrLoader.parse(buffer);
                    if (!texData)
                        return;
                    if (texData.data !== undefined) {
                        var dataTexture = new a.DataTexture(texData.data, texData.width, texData.height);
                        dataTexture.type = texture.type;
                        dataTexture.encoding = texture.encoding;
                        dataTexture.format = texture.format;
                        dataTexture.minFilter = texture.minFilter;
                        dataTexture.magFilter = texture.magFilter;
                        dataTexture.generateMipmaps = texture.generateMipmaps;
                        texture.images[i] = dataTexture;
                    }
                    if (loaded === 6) {
                        texture.needsUpdate = true;
                        if (onLoad)
                            onLoad(texture);
                    }
                }, onProgress, onError);
            }
            for (var i = 0; i < urls.length; i++) {
                loadHDRData(i, onLoad, onProgress, onError);
            }
            return texture;
        },
        setDataType: function (value) {
            this.type = value;
            this.hdrLoader.setDataType(value);
            return this;
        }
    });
    return HDRCubeTextureLoader;
});