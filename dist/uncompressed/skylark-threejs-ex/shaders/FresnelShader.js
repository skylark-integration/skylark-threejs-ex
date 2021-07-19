define([
    "../threex"
],function (threex) {
    'use strict';
    var FresnelShader = {
        uniforms: {
            'mRefractionRatio': { value: 1.02 },
            'mFresnelBias': { value: 0.1 },
            'mFresnelPower': { value: 2 },
            'mFresnelScale': { value: 1 },
            'tCube': { value: null }
        },
        vertexShader: [
            'uniform float mRefractionRatio;',
            'uniform float mFresnelBias;',
            'uniform float mFresnelScale;',
            'uniform float mFresnelPower;',
            'varying vec3 vReflect;',
            'varying vec3 vRefract[3];',
            'varying float vReflectionFactor;',
            'void main() {',
            '\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
            '\tvec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
            '\tvec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );',
            '\tvec3 I = worldPosition.xyz - cameraPosition;',
            '\tvReflect = reflect( I, worldNormal );',
            '\tvRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );',
            '\tvRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );',
            '\tvRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );',
            '\tvReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );',
            '\tgl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform samplerCube tCube;',
            'varying vec3 vReflect;',
            'varying vec3 vRefract[3];',
            'varying float vReflectionFactor;',
            'void main() {',
            '\tvec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );',
            '\tvec4 refractedColor = vec4( 1.0 );',
            '\trefractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;',
            '\trefractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;',
            '\trefractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;',
            '\tgl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );',
            '}'
        ].join('\n')
    };
    return threex.shaders.FresnelShader = FresnelShader;
});