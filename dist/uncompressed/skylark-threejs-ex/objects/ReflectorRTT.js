define([
    "../threex",
	'../objects/Reflector'
], function (
	threex,
	Reflector
) {
    'use strict';
    var ReflectorRTT = function (geometry, options) {
        Reflector.call(this, geometry, options);
        this.geometry.setDrawRange(0, 0);
    };
    ReflectorRTT.prototype = Object.create(Reflector.prototype);

    return threex.objects.ReflectorRTT = ReflectorRTT;
});