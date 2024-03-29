define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var OceanShaders = {};
    OceanShaders['ocean_sim_vertex'] = {
        vertexShader: [
            'varying vec2 vUV;',
            'void main (void) {',
            '\tvUV = position.xy * 0.5 + 0.5;',
            '\tgl_Position = vec4(position, 1.0 );',
            '}'
        ].join('\n')
    };
    OceanShaders['ocean_subtransform'] = {
        uniforms: {
            'u_input': { value: null },
            'u_transformSize': { value: 512 },
            'u_subtransformSize': { value: 250 }
        },
        fragmentShader: [
            'precision highp float;',
            '#include <common>',
            'uniform sampler2D u_input;',
            'uniform float u_transformSize;',
            'uniform float u_subtransformSize;',
            'varying vec2 vUV;',
            'vec2 multiplyComplex (vec2 a, vec2 b) {',
            '\treturn vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
            '}',
            'void main (void) {',
            '\t#ifdef HORIZONTAL',
            '\tfloat index = vUV.x * u_transformSize - 0.5;',
            '\t#else',
            '\tfloat index = vUV.y * u_transformSize - 0.5;',
            '\t#endif',
            '\tfloat evenIndex = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5) + mod(index, u_subtransformSize * 0.5);',
            '\t#ifdef HORIZONTAL',
            '\tvec4 even = texture2D(u_input, vec2(evenIndex + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
            '\tvec4 odd = texture2D(u_input, vec2(evenIndex + u_transformSize * 0.5 + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
            '\t#else',
            '\tvec4 even = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + 0.5) / u_transformSize).rgba;',
            '\tvec4 odd = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + u_transformSize * 0.5 + 0.5) / u_transformSize).rgba;',
            '\t#endif',
            '\tfloat twiddleArgument = -2.0 * PI * (index / u_subtransformSize);',
            '\tvec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));',
            '\tvec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);',
            '\tvec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);',
            '\tgl_FragColor = vec4(outputA, outputB);',
            '}'
        ].join('\n')
    };
    OceanShaders['ocean_initial_spectrum'] = {
        uniforms: {
            'u_wind': { value: new THREE.Vector2(10, 10) },
            'u_resolution': { value: 512 },
            'u_size': { value: 250 }
        },
        vertexShader: [
            'void main (void) {',
            '\tgl_Position = vec4(position, 1.0);',
            '}'
        ].join('\n'),
        fragmentShader: [
            'precision highp float;',
            '#include <common>',
            'const float G = 9.81;',
            'const float KM = 370.0;',
            'const float CM = 0.23;',
            'uniform vec2 u_wind;',
            'uniform float u_resolution;',
            'uniform float u_size;',
            'float omega (float k) {',
            '\treturn sqrt(G * k * (1.0 + pow2(k / KM)));',
            '}',
            '#if __VERSION__ == 100',
            'float tanh (float x) {',
            '\treturn (1.0 - exp(-2.0 * x)) / (1.0 + exp(-2.0 * x));',
            '}',
            '#endif',
            'void main (void) {',
            '\tvec2 coordinates = gl_FragCoord.xy - 0.5;',
            '\tfloat n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
            '\tfloat m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
            '\tvec2 K = (2.0 * PI * vec2(n, m)) / u_size;',
            '\tfloat k = length(K);',
            '\tfloat l_wind = length(u_wind);',
            '\tfloat Omega = 0.84;',
            '\tfloat kp = G * pow2(Omega / l_wind);',
            '\tfloat c = omega(k) / k;',
            '\tfloat cp = omega(kp) / kp;',
            '\tfloat Lpm = exp(-1.25 * pow2(kp / k));',
            '\tfloat gamma = 1.7;',
            '\tfloat sigma = 0.08 * (1.0 + 4.0 * pow(Omega, -3.0));',
            '\tfloat Gamma = exp(-pow2(sqrt(k / kp) - 1.0) / 2.0 * pow2(sigma));',
            '\tfloat Jp = pow(gamma, Gamma);',
            '\tfloat Fp = Lpm * Jp * exp(-Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0));',
            '\tfloat alphap = 0.006 * sqrt(Omega);',
            '\tfloat Bl = 0.5 * alphap * cp / c * Fp;',
            '\tfloat z0 = 0.000037 * pow2(l_wind) / G * pow(l_wind / cp, 0.9);',
            '\tfloat uStar = 0.41 * l_wind / log(10.0 / z0);',
            '\tfloat alpham = 0.01 * ((uStar < CM) ? (1.0 + log(uStar / CM)) : (1.0 + 3.0 * log(uStar / CM)));',
            '\tfloat Fm = exp(-0.25 * pow2(k / KM - 1.0));',
            '\tfloat Bh = 0.5 * alpham * CM / c * Fm * Lpm;',
            '\tfloat a0 = log(2.0) / 4.0;',
            '\tfloat am = 0.13 * uStar / CM;',
            '\tfloat Delta = tanh(a0 + 4.0 * pow(c / cp, 2.5) + am * pow(CM / c, 2.5));',
            '\tfloat cosPhi = dot(normalize(u_wind), normalize(K));',
            '\tfloat S = (1.0 / (2.0 * PI)) * pow(k, -4.0) * (Bl + Bh) * (1.0 + Delta * (2.0 * cosPhi * cosPhi - 1.0));',
            '\tfloat dk = 2.0 * PI / u_size;',
            '\tfloat h = sqrt(S / 2.0) * dk;',
            '\tif (K.x == 0.0 && K.y == 0.0) {',
            '\t\th = 0.0;',
            '\t}',
            '\tgl_FragColor = vec4(h, 0.0, 0.0, 0.0);',
            '}'
        ].join('\n')
    };
    OceanShaders['ocean_phase'] = {
        uniforms: {
            'u_phases': { value: null },
            'u_deltaTime': { value: null },
            'u_resolution': { value: null },
            'u_size': { value: null }
        },
        fragmentShader: [
            'precision highp float;',
            '#include <common>',
            'const float G = 9.81;',
            'const float KM = 370.0;',
            'varying vec2 vUV;',
            'uniform sampler2D u_phases;',
            'uniform float u_deltaTime;',
            'uniform float u_resolution;',
            'uniform float u_size;',
            'float omega (float k) {',
            '\treturn sqrt(G * k * (1.0 + k * k / KM * KM));',
            '}',
            'void main (void) {',
            '\tfloat deltaTime = 1.0 / 60.0;',
            '\tvec2 coordinates = gl_FragCoord.xy - 0.5;',
            '\tfloat n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
            '\tfloat m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
            '\tvec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',
            '\tfloat phase = texture2D(u_phases, vUV).r;',
            '\tfloat deltaPhase = omega(length(waveVector)) * u_deltaTime;',
            '\tphase = mod(phase + deltaPhase, 2.0 * PI);',
            '\tgl_FragColor = vec4(phase, 0.0, 0.0, 0.0);',
            '}'
        ].join('\n')
    };
    OceanShaders['ocean_spectrum'] = {
        uniforms: {
            'u_size': { value: null },
            'u_resolution': { value: null },
            'u_choppiness': { value: null },
            'u_phases': { value: null },
            'u_initialSpectrum': { value: null }
        },
        fragmentShader: [
            'precision highp float;',
            '#include <common>',
            'const float G = 9.81;',
            'const float KM = 370.0;',
            'varying vec2 vUV;',
            'uniform float u_size;',
            'uniform float u_resolution;',
            'uniform float u_choppiness;',
            'uniform sampler2D u_phases;',
            'uniform sampler2D u_initialSpectrum;',
            'vec2 multiplyComplex (vec2 a, vec2 b) {',
            '\treturn vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
            '}',
            'vec2 multiplyByI (vec2 z) {',
            '\treturn vec2(-z[1], z[0]);',
            '}',
            'float omega (float k) {',
            '\treturn sqrt(G * k * (1.0 + k * k / KM * KM));',
            '}',
            'void main (void) {',
            '\tvec2 coordinates = gl_FragCoord.xy - 0.5;',
            '\tfloat n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
            '\tfloat m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
            '\tvec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',
            '\tfloat phase = texture2D(u_phases, vUV).r;',
            '\tvec2 phaseVector = vec2(cos(phase), sin(phase));',
            '\tvec2 h0 = texture2D(u_initialSpectrum, vUV).rg;',
            '\tvec2 h0Star = texture2D(u_initialSpectrum, vec2(1.0 - vUV + 1.0 / u_resolution)).rg;',
            '\th0Star.y *= -1.0;',
            '\tvec2 h = multiplyComplex(h0, phaseVector) + multiplyComplex(h0Star, vec2(phaseVector.x, -phaseVector.y));',
            '\tvec2 hX = -multiplyByI(h * (waveVector.x / length(waveVector))) * u_choppiness;',
            '\tvec2 hZ = -multiplyByI(h * (waveVector.y / length(waveVector))) * u_choppiness;',
            '\tif (waveVector.x == 0.0 && waveVector.y == 0.0) {',
            '\t\th = vec2(0.0);',
            '\t\thX = vec2(0.0);',
            '\t\thZ = vec2(0.0);',
            '\t}',
            '\tgl_FragColor = vec4(hX + multiplyByI(h), hZ);',
            '}'
        ].join('\n')
    };
    OceanShaders['ocean_normals'] = {
        uniforms: {
            'u_displacementMap': { value: null },
            'u_resolution': { value: null },
            'u_size': { value: null }
        },
        fragmentShader: [
            'precision highp float;',
            'varying vec2 vUV;',
            'uniform sampler2D u_displacementMap;',
            'uniform float u_resolution;',
            'uniform float u_size;',
            'void main (void) {',
            '\tfloat texel = 1.0 / u_resolution;',
            '\tfloat texelSize = u_size / u_resolution;',
            '\tvec3 center = texture2D(u_displacementMap, vUV).rgb;',
            '\tvec3 right = vec3(texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(texel, 0.0)).rgb - center;',
            '\tvec3 left = vec3(-texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(-texel, 0.0)).rgb - center;',
            '\tvec3 top = vec3(0.0, 0.0, -texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, -texel)).rgb - center;',
            '\tvec3 bottom = vec3(0.0, 0.0, texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, texel)).rgb - center;',
            '\tvec3 topRight = cross(right, top);',
            '\tvec3 topLeft = cross(top, left);',
            '\tvec3 bottomLeft = cross(left, bottom);',
            '\tvec3 bottomRight = cross(bottom, right);',
            '\tgl_FragColor = vec4(normalize(topRight + topLeft + bottomLeft + bottomRight), 1.0);',
            '}'
        ].join('\n')
    };
    OceanShaders['ocean_main'] = {
        uniforms: {
            'u_displacementMap': { value: null },
            'u_normalMap': { value: null },
            'u_geometrySize': { value: null },
            'u_size': { value: null },
            'u_projectionMatrix': { value: null },
            'u_viewMatrix': { value: null },
            'u_cameraPosition': { value: null },
            'u_skyColor': { value: null },
            'u_oceanColor': { value: null },
            'u_sunDirection': { value: null },
            'u_exposure': { value: null }
        },
        vertexShader: [
            'precision highp float;',
            'varying vec3 vPos;',
            'varying vec2 vUV;',
            'uniform mat4 u_projectionMatrix;',
            'uniform mat4 u_viewMatrix;',
            'uniform float u_size;',
            'uniform float u_geometrySize;',
            'uniform sampler2D u_displacementMap;',
            'void main (void) {',
            '\tvec3 newPos = position + texture2D(u_displacementMap, uv).rgb * (u_geometrySize / u_size);',
            '\tvPos = newPos;',
            '\tvUV = uv;',
            '\tgl_Position = u_projectionMatrix * u_viewMatrix * vec4(newPos, 1.0);',
            '}'
        ].join('\n'),
        fragmentShader: [
            'precision highp float;',
            'varying vec3 vPos;',
            'varying vec2 vUV;',
            'uniform sampler2D u_displacementMap;',
            'uniform sampler2D u_normalMap;',
            'uniform vec3 u_cameraPosition;',
            'uniform vec3 u_oceanColor;',
            'uniform vec3 u_skyColor;',
            'uniform vec3 u_sunDirection;',
            'uniform float u_exposure;',
            'vec3 hdr (vec3 color, float exposure) {',
            '\treturn 1.0 - exp(-color * exposure);',
            '}',
            'void main (void) {',
            '\tvec3 normal = texture2D(u_normalMap, vUV).rgb;',
            '\tvec3 view = normalize(u_cameraPosition - vPos);',
            '\tfloat fresnel = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);',
            '\tvec3 sky = fresnel * u_skyColor;',
            '\tfloat diffuse = clamp(dot(normal, normalize(u_sunDirection)), 0.0, 1.0);',
            '\tvec3 water = (1.0 - fresnel) * u_oceanColor * u_skyColor * diffuse;',
            '\tvec3 color = sky + water;',
            '\tgl_FragColor = vec4(hdr(color, u_exposure), 1.0);',
            '}'
        ].join('\n')
    };
    return threex.shaders.OceanShaders = OceanShaders;
});