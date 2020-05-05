define(["skylark-threejs"], function (a) {
    'use strict';
    var MDDLoader = function (manager) {
        a.Loader.call(this, manager);
    };
    MDDLoader.prototype = Object.assign(Object.create(a.Loader.prototype), {
        constructor: MDDLoader,
        load: function (url, onLoad, onProgress, onError) {
            var scope = this;
            var loader = new a.FileLoader(this.manager);
            loader.setPath(this.path);
            loader.setResponseType('arraybuffer');
            loader.load(url, function (data) {
                onLoad(scope.parse(data));
            }, onProgress, onError);
        },
        parse: function (data) {
            var view = new DataView(data);
            var totalFrames = view.getUint32(0);
            var totalPoints = view.getUint32(4);
            var offset = 8;
            var times = new Float32Array(totalFrames);
            var values = new Float32Array(totalFrames * totalFrames).fill(0);
            for (var i = 0; i < totalFrames; i++) {
                times[i] = view.getFloat32(offset);
                offset += 4;
                values[totalFrames * i + i] = 1;
            }
            var track = new a.NumberKeyframeTrack('.morphTargetInfluences', times, values);
            var clip = new a.AnimationClip('default', times[times.length - 1], [track]);
            var morphTargets = [];
            for (var i = 0; i < totalFrames; i++) {
                var morphTarget = new Float32Array(totalPoints * 3);
                for (var j = 0; j < totalPoints; j++) {
                    var stride = j * 3;
                    morphTarget[stride + 0] = view.getFloat32(offset);
                    offset += 4;
                    morphTarget[stride + 1] = view.getFloat32(offset);
                    offset += 4;
                    morphTarget[stride + 2] = view.getFloat32(offset);
                    offset += 4;
                }
                var attribute = new a.BufferAttribute(morphTarget, 3);
                attribute.name = 'morph_' + i;
                morphTargets.push(attribute);
            }
            return {
                morphTargets: morphTargets,
                clip: clip
            };
        }
    });
    return MDDLoader;
});