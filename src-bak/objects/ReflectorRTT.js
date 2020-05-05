define(['../objects/Reflector.js'], function (a) {
    'use strict';
    var ReflectorRTT = function (geometry, options) {
        a.Reflector.call(this, geometry, options);
        this.geometry.setDrawRange(0, 0);
    };
    ReflectorRTT.prototype = Object.create(a.Reflector.prototype);
    return ReflectorRTT;
});