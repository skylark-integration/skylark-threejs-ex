define(["skylark-threejs"], function (THREE) {
    'use strict';
    var GodRaysDepthMaskShader = {
        uniforms: { tInput: { value: null } },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            ' vUv = uv;',
            ' gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying vec2 vUv;',
            'uniform sampler2D tInput;',
            'void main() {',
            '\tgl_FragColor = vec4( 1.0 ) - texture2D( tInput, vUv );',
            '}'
        ].join('\n')
    };
    var GodRaysGenerateShader = {
        uniforms: {
            tInput: { value: null },
            fStepSize: { value: 1 },
            vSunPositionScreenSpace: { value: new THREE.Vector2(0.5, 0.5) }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            ' vUv = uv;',
            ' gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#define TAPS_PER_PASS 6.0',
            'varying vec2 vUv;',
            'uniform sampler2D tInput;',
            'uniform vec2 vSunPositionScreenSpace;',
            'uniform float fStepSize;',
            'void main() {',
            '\tvec2 delta = vSunPositionScreenSpace - vUv;',
            '\tfloat dist = length( delta );',
            '\tvec2 stepv = fStepSize * delta / dist;',
            '\tfloat iters = dist/fStepSize;',
            '\tvec2 uv = vUv.xy;',
            '\tfloat col = 0.0;',
            '\tif ( 0.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;',
            '\tuv += stepv;',
            '\tif ( 1.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;',
            '\tuv += stepv;',
            '\tif ( 2.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;',
            '\tuv += stepv;',
            '\tif ( 3.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;',
            '\tuv += stepv;',
            '\tif ( 4.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;',
            '\tuv += stepv;',
            '\tif ( 5.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;',
            '\tuv += stepv;',
            '\tgl_FragColor = vec4( col/TAPS_PER_PASS );',
            '\tgl_FragColor.a = 1.0;',
            '}'
        ].join('\n')
    };
    var GodRaysCombineShader = {
        uniforms: {
            tColors: { value: null },
            tGodRays: { value: null },
            fGodRayIntensity: { value: 0.69 },
            vSunPositionScreenSpace: { value: new THREE.Vector2(0.5, 0.5) }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying vec2 vUv;',
            'uniform sampler2D tColors;',
            'uniform sampler2D tGodRays;',
            'uniform vec2 vSunPositionScreenSpace;',
            'uniform float fGodRayIntensity;',
            'void main() {',
            '\tgl_FragColor = texture2D( tColors, vUv ) + fGodRayIntensity * vec4( 1.0 - texture2D( tGodRays, vUv ).r );',
            '\tgl_FragColor.a = 1.0;',
            '}'
        ].join('\n')
    };
    var GodRaysFakeSunShader = {
        uniforms: {
            vSunPositionScreenSpace: { value: new THREE.Vector2(0.5, 0.5) },
            fAspect: { value: 1 },
            sunColor: { value: new THREE.Color(16772608) },
            bgColor: { value: new THREE.Color(0) }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying vec2 vUv;',
            'uniform vec2 vSunPositionScreenSpace;',
            'uniform float fAspect;',
            'uniform vec3 sunColor;',
            'uniform vec3 bgColor;',
            'void main() {',
            '\tvec2 diff = vUv - vSunPositionScreenSpace;',
            '\tdiff.x *= fAspect;',
            '\tfloat prop = clamp( length( diff ) / 0.5, 0.0, 1.0 );',
            '\tprop = 0.35 * pow( 1.0 - prop, 3.0 );',
            '\tgl_FragColor.xyz = mix( sunColor, bgColor, 1.0 - prop );',
            '\tgl_FragColor.w = 1.0;',
            '}'
        ].join('\n')
    };
    return {
        GodRaysDepthMaskShader,
        GodRaysGenerateShader,
        GodRaysCombineShader,
        GodRaysFakeSunShader
    };
});