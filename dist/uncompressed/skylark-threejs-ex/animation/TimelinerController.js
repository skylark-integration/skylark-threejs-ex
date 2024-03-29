define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var TimelinerController = function TimelinerController(scene, trackInfo, onUpdate) {
        this._scene = scene;
        this._trackInfo = trackInfo;
        this._onUpdate = onUpdate;
        this._mixer = new THREE.AnimationMixer(scene);
        this._clip = null;
        this._action = null;
        this._tracks = {};
        this._propRefs = {};
        this._channelNames = [];
    };
    TimelinerController.prototype = {
        constructor: TimelinerController,
        init: function () {
            var tracks = [], trackInfo = this._trackInfo;
            for (var i = 0, n = trackInfo.length; i !== n; ++i) {
                var spec = trackInfo[i];
                tracks.push(this._addTrack(spec.type, spec.propertyPath, spec.initialValue, spec.interpolation));
            }
            this._clip = new THREE.AnimationClip('editclip', 0, tracks);
            this._action = this._mixer.clipAction(this._clip).play();
        },
        setDisplayTime: function (time) {
            this._action.time = time;
            this._mixer.update(0);
            this._onUpdate();
        },
        setDuration: function (duration) {
            this._clip.duration = duration;
        },
        getChannelNames: function () {
            return this._channelNames;
        },
        getChannelKeyTimes: function (channelName) {
            return this._tracks[channelName].times;
        },
        setKeyframe: function (channelName, time) {
            var track = this._tracks[channelName], times = track.times, index = Timeliner.binarySearch(times, time), values = track.values, stride = track.getValueSize(), offset = index * stride;
            if (index < 0) {
                index = ~index;
                offset = index * stride;
                var nTimes = times.length + 1, nValues = values.length + stride;
                for (var i = nTimes - 1; i !== index; --i) {
                    times[i] = times[i - 1];
                }
                for (var i = nValues - 1, e = offset + stride - 1; i !== e; --i) {
                    values[i] = values[i - stride];
                }
            }
            times[index] = time;
            this._propRefs[channelName].getValue(values, offset);
        },
        delKeyframe: function (channelName, time) {
            var track = this._tracks[channelName], times = track.times, index = Timeliner.binarySearch(times, time);
            if (times.length > 1 && index >= 0) {
                var nTimes = times.length - 1, values = track.values, stride = track.getValueSize(), nValues = values.length - stride;
                for (var i = index; i !== nTimes; ++i) {
                    times[i] = times[i + 1];
                }
                times.pop();
                for (var offset = index * stride; offset !== nValues; ++offset) {
                    values[offset] = values[offset + stride];
                }
                values.length = nValues;
            }
        },
        moveKeyframe: function (channelName, time, delta, moveRemaining) {
            var track = this._tracks[channelName], times = track.times, index = Timeliner.binarySearch(times, time);
            if (index >= 0) {
                var endAt = moveRemaining ? times.length : index + 1, needsSort = times[index - 1] <= time || !moveRemaining && time >= times[index + 1];
                while (index !== endAt)
                    times[index++] += delta;
                if (needsSort)
                    this._sort(track);
            }
        },
        serialize: function () {
            var result = {
                    duration: this._clip.duration,
                    channels: {}
                }, names = this._channelNames, tracks = this._tracks, channels = result.channels;
            for (var i = 0, n = names.length; i !== n; ++i) {
                var name = names[i], track = tracks[name];
                channels[name] = {
                    times: track.times,
                    values: track.values
                };
            }
            return result;
        },
        deserialize: function (structs) {
            var names = this._channelNames, tracks = this._tracks, channels = structs.channels;
            this.setDuration(structs.duration);
            for (var i = 0, n = names.length; i !== n; ++i) {
                var name = names[i], track = tracks[name], data = channels[name];
                this._setArray(track.times, data.times);
                this._setArray(track.values, data.values);
            }
            this.setDisplayTime(this._mixer.time);
        },
        _sort: function (track) {
            var times = track.times, order = THREE.AnimationUtils.getKeyframeOrder(times);
            this._setArray(times, THREE.AnimationUtils.sortedArray(times, 1, order));
            var values = track.values, stride = track.getValueSize();
            this._setArray(values, THREE.AnimationUtils.sortedArray(values, stride, order));
        },
        _setArray: function (dst, src) {
            dst.length = 0;
            dst.push.apply(dst, src);
        },
        _addTrack: function (type, prop, initialValue, interpolation) {
            var track = new type(prop, [0], initialValue, interpolation);
            track.times = Array.prototype.slice.call(track.times);
            track.values = Array.prototype.slice.call(track.values);
            this._channelNames.push(prop);
            this._tracks[prop] = track;
            this._propRefs[prop] = new THREE.PropertyBinding(this._scene, prop);
            return track;
        }
    };

    return threex.animation.TimelinerController = TimelinerController;
});