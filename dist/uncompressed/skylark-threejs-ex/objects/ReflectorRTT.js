define([
	'../objects/Reflector'
], function (
	Reflector
) {
    'use strict';
    var ReflectorRTT = function (geometry, options) {
        Reflector.call(this, geometry, options);
        this.geometry.setDrawRange(0, 0);
    };
    ReflectorRTT.prototype = Object.create(Reflector.prototype);
    return ReflectorRTT;
});