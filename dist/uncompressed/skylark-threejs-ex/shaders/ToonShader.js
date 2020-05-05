define([
    "skylark-threejs"
], function (THREE) {
    'use strict';
    var ToonShader1 = {
        uniforms: {
            'uDirLightPos': { value: new THREE.Vector3() },
            'uDirLightColor': { value: new THREE.Color(15658734) },
            'uAmbientLightColor': { value: new THREE.Color(328965) },
            'uBaseColor': { value: new THREE.Color(16777215) }
        },
        vertexShader: [
            'varying vec3 vNormal;',
            'varying vec3 vRefract;',
            'void main() {',
            '\tvec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
            '\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
            '\tvec3 worldNormal = normalize ( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );',
            '\tvNormal = normalize( normalMatrix * normal );',
            '\tvec3 I = worldPosition.xyz - cameraPosition;',
            '\tvRefract = refract( normalize( I ), worldNormal, 1.02 );',
            '\tgl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 uBaseColor;',
            'uniform vec3 uDirLightPos;',
            'uniform vec3 uDirLightColor;',
            'uniform vec3 uAmbientLightColor;',
            'varying vec3 vNormal;',
            'varying vec3 vRefract;',
            'void main() {',
            '\tfloat directionalLightWeighting = max( dot( normalize( vNormal ), uDirLightPos ), 0.0);',
            '\tvec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;',
            '\tfloat intensity = smoothstep( - 0.5, 1.0, pow( length(lightWeighting), 20.0 ) );',
            '\tintensity += length(lightWeighting) * 0.2;',
            '\tfloat cameraWeighting = dot( normalize( vNormal ), vRefract );',
            '\tintensity += pow( 1.0 - length( cameraWeighting ), 6.0 );',
            '\tintensity = intensity * 0.2 + 0.3;',
            '\tif ( intensity < 0.50 ) {',
            '\t\tgl_FragColor = vec4( 2.0 * intensity * uBaseColor, 1.0 );',
            '\t} else {',
            '\t\tgl_FragColor = vec4( 1.0 - 2.0 * ( 1.0 - intensity ) * ( 1.0 - uBaseColor ), 1.0 );',
            '}',
            '}'
        ].join('\n')
    };
    var ToonShader2 = {
        uniforms: {
            'uDirLightPos': { value: new THREE.Vector3() },
            'uDirLightColor': { value: new THREE.Color(15658734) },
            'uAmbientLightColor': { value: new THREE.Color(328965) },
            'uBaseColor': { value: new THREE.Color(15658734) },
            'uLineColor1': { value: new THREE.Color(8421504) },
            'uLineColor2': { value: new THREE.Color(0) },
            'uLineColor3': { value: new THREE.Color(0) },
            'uLineColor4': { value: new THREE.Color(0) }
        },
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '\tvNormal = normalize( normalMatrix * normal );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 uBaseColor;',
            'uniform vec3 uLineColor1;',
            'uniform vec3 uLineColor2;',
            'uniform vec3 uLineColor3;',
            'uniform vec3 uLineColor4;',
            'uniform vec3 uDirLightPos;',
            'uniform vec3 uDirLightColor;',
            'uniform vec3 uAmbientLightColor;',
            'varying vec3 vNormal;',
            'void main() {',
            '\tfloat camera = max( dot( normalize( vNormal ), vec3( 0.0, 0.0, 1.0 ) ), 0.4);',
            '\tfloat light = max( dot( normalize( vNormal ), uDirLightPos ), 0.0);',
            '\tgl_FragColor = vec4( uBaseColor, 1.0 );',
            '\tif ( length(uAmbientLightColor + uDirLightColor * light) < 1.00 ) {',
            '\t\tgl_FragColor *= vec4( uLineColor1, 1.0 );',
            '\t}',
            '\tif ( length(uAmbientLightColor + uDirLightColor * camera) < 0.50 ) {',
            '\t\tgl_FragColor *= vec4( uLineColor2, 1.0 );',
            '\t}',
            '}'
        ].join('\n')
    };
    var ToonShaderHatching = {
        uniforms: {
            'uDirLightPos': { value: new THREE.Vector3() },
            'uDirLightColor': { value: new THREE.Color(15658734) },
            'uAmbientLightColor': { value: new THREE.Color(328965) },
            'uBaseColor': { value: new THREE.Color(16777215) },
            'uLineColor1': { value: new THREE.Color(0) },
            'uLineColor2': { value: new THREE.Color(0) },
            'uLineColor3': { value: new THREE.Color(0) },
            'uLineColor4': { value: new THREE.Color(0) }
        },
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '\tvNormal = normalize( normalMatrix * normal );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 uBaseColor;',
            'uniform vec3 uLineColor1;',
            'uniform vec3 uLineColor2;',
            'uniform vec3 uLineColor3;',
            'uniform vec3 uLineColor4;',
            'uniform vec3 uDirLightPos;',
            'uniform vec3 uDirLightColor;',
            'uniform vec3 uAmbientLightColor;',
            'varying vec3 vNormal;',
            'void main() {',
            '\tfloat directionalLightWeighting = max( dot( normalize(vNormal), uDirLightPos ), 0.0);',
            '\tvec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;',
            '\tgl_FragColor = vec4( uBaseColor, 1.0 );',
            '\tif ( length(lightWeighting) < 1.00 ) {',
            '\t\tif ( mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {',
            '\t\t\tgl_FragColor = vec4( uLineColor1, 1.0 );',
            '\t\t}',
            '\t}',
            '\tif ( length(lightWeighting) < 0.75 ) {',
            '\t\tif (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {',
            '\t\t\tgl_FragColor = vec4( uLineColor2, 1.0 );',
            '\t\t}',
            '\t}',
            '\tif ( length(lightWeighting) < 0.50 ) {',
            '\t\tif (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {',
            '\t\t\tgl_FragColor = vec4( uLineColor3, 1.0 );',
            '\t\t}',
            '\t}',
            '\tif ( length(lightWeighting) < 0.3465 ) {',
            '\t\tif (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {',
            '\t\t\tgl_FragColor = vec4( uLineColor4, 1.0 );',
            '\t}',
            '\t}',
            '}'
        ].join('\n')
    };
    var ToonShaderDotted = {
        uniforms: {
            'uDirLightPos': { value: new THREE.Vector3() },
            'uDirLightColor': { value: new THREE.Color(15658734) },
            'uAmbientLightColor': { value: new THREE.Color(328965) },
            'uBaseColor': { value: new THREE.Color(16777215) },
            'uLineColor1': { value: new THREE.Color(0) }
        },
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '\tvNormal = normalize( normalMatrix * normal );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 uBaseColor;',
            'uniform vec3 uLineColor1;',
            'uniform vec3 uLineColor2;',
            'uniform vec3 uLineColor3;',
            'uniform vec3 uLineColor4;',
            'uniform vec3 uDirLightPos;',
            'uniform vec3 uDirLightColor;',
            'uniform vec3 uAmbientLightColor;',
            'varying vec3 vNormal;',
            'void main() {',
            'float directionalLightWeighting = max( dot( normalize(vNormal), uDirLightPos ), 0.0);',
            'vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;',
            'gl_FragColor = vec4( uBaseColor, 1.0 );',
            'if ( length(lightWeighting) < 1.00 ) {',
            '\t\tif ( ( mod(gl_FragCoord.x, 4.001) + mod(gl_FragCoord.y, 4.0) ) > 6.00 ) {',
            '\t\t\tgl_FragColor = vec4( uLineColor1, 1.0 );',
            '\t\t}',
            '\t}',
            '\tif ( length(lightWeighting) < 0.50 ) {',
            '\t\tif ( ( mod(gl_FragCoord.x + 2.0, 4.001) + mod(gl_FragCoord.y + 2.0, 4.0) ) > 6.00 ) {',
            '\t\t\tgl_FragColor = vec4( uLineColor1, 1.0 );',
            '\t\t}',
            '\t}',
            '}'
        ].join('\n')
    };
    return {
        ToonShader1,
        ToonShader2,
        ToonShaderHatching,
        ToonShaderDotted
    };
});