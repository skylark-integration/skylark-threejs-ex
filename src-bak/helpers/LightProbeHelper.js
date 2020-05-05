define(["skylark-threejs"], function (a) {
    'use strict';
    function LightProbeHelper(lightProbe, size) {
        this.lightProbe = lightProbe;
        this.size = size;
        var material = new a.ShaderMaterial({
            type: 'LightProbeHelperMaterial',
            uniforms: {
                sh: { value: this.lightProbe.sh.coefficients },
                intensity: { value: this.lightProbe.intensity }
            },
            vertexShader: [
                'varying vec3 vNormal;',
                'void main() {',
                '\tvNormal = normalize( normalMatrix * normal );',
                '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                '#define RECIPROCAL_PI 0.318309886',
                'vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {',
                '\t// matrix is assumed to be orthogonal',
                '\treturn normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );',
                '}',
                '// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf',
                'vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {',
                '\t// normal is assumed to have unit length',
                '\tfloat x = normal.x, y = normal.y, z = normal.z;',
                '\t// band 0',
                '\tvec3 result = shCoefficients[ 0 ] * 0.886227;',
                '\t// band 1',
                '\tresult += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;',
                '\tresult += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;',
                '\tresult += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;',
                '\t// band 2',
                '\tresult += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;',
                '\tresult += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;',
                '\tresult += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );',
                '\tresult += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;',
                '\tresult += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );',
                '\treturn result;',
                '}',
                'uniform vec3 sh[ 9 ]; // sh coefficients',
                'uniform float intensity; // light probe intensity',
                'varying vec3 vNormal;',
                'void main() {',
                '\tvec3 normal = normalize( vNormal );',
                '\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );',
                '\tvec3 irradiance = shGetIrradianceAt( worldNormal, sh );',
                '\tvec3 outgoingLight = RECIPROCAL_PI * irradiance * intensity;',
                '\tgl_FragColor = linearToOutputTexel( vec4( outgoingLight, 1.0 ) );',
                '}'
            ].join('\n')
        });
        var geometry = new a.SphereBufferGeometry(1, 32, 16);
        a.Mesh.call(this, geometry, material);
        this.onBeforeRender();
    }
    LightProbeHelper.prototype = Object.create(a.Mesh.prototype);
    LightProbeHelper.prototype.constructor = LightProbeHelper;
    LightProbeHelper.prototype.dispose = function () {
        this.geometry.dispose();
        this.material.dispose();
    };
    LightProbeHelper.prototype.onBeforeRender = function () {
        this.position.copy(this.lightProbe.position);
        this.scale.set(1, 1, 1).multiplyScalar(this.size);
        this.material.uniforms.intensity.value = this.lightProbe.intensity;
    };
    return { LightProbeHelper };
});