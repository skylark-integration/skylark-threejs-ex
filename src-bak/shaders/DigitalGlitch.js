define(function () {
    'use strict';
    var DigitalGlitch = {
        uniforms: {
            'tDiffuse': { value: null },
            'tDisp': { value: null },
            'byp': { value: 0 },
            'amount': { value: 0.08 },
            'angle': { value: 0.02 },
            'seed': { value: 0.02 },
            'seed_x': { value: 0.02 },
            'seed_y': { value: 0.02 },
            'distortion_x': { value: 0.5 },
            'distortion_y': { value: 0.6 },
            'col_s': { value: 0.05 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform int byp;',
            'uniform sampler2D tDiffuse;',
            'uniform sampler2D tDisp;',
            'uniform float amount;',
            'uniform float angle;',
            'uniform float seed;',
            'uniform float seed_x;',
            'uniform float seed_y;',
            'uniform float distortion_x;',
            'uniform float distortion_y;',
            'uniform float col_s;',
            'varying vec2 vUv;',
            'float rand(vec2 co){',
            '\treturn fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
            '}',
            'void main() {',
            '\tif(byp<1) {',
            '\t\tvec2 p = vUv;',
            '\t\tfloat xs = floor(gl_FragCoord.x / 0.5);',
            '\t\tfloat ys = floor(gl_FragCoord.y / 0.5);',
            '\t\tvec4 normal = texture2D (tDisp, p*seed*seed);',
            '\t\tif(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {',
            '\t\t\tif(seed_x>0.){',
            '\t\t\t\tp.y = 1. - (p.y + distortion_y);',
            '\t\t\t}',
            '\t\t\telse {',
            '\t\t\t\tp.y = distortion_y;',
            '\t\t\t}',
            '\t\t}',
            '\t\tif(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {',
            '\t\t\tif(seed_y>0.){',
            '\t\t\t\tp.x=distortion_x;',
            '\t\t\t}',
            '\t\t\telse {',
            '\t\t\t\tp.x = 1. - (p.x + distortion_x);',
            '\t\t\t}',
            '\t\t}',
            '\t\tp.x+=normal.x*seed_x*(seed/5.);',
            '\t\tp.y+=normal.y*seed_y*(seed/5.);',
            '\t\tvec2 offset = amount * vec2( cos(angle), sin(angle));',
            '\t\tvec4 cr = texture2D(tDiffuse, p + offset);',
            '\t\tvec4 cga = texture2D(tDiffuse, p);',
            '\t\tvec4 cb = texture2D(tDiffuse, p - offset);',
            '\t\tgl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);',
            '\t\tvec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);',
            '\t\tgl_FragColor = gl_FragColor+ snow;',
            '\t}',
            '\telse {',
            '\t\tgl_FragColor=texture2D (tDiffuse, vUv);',
            '\t}',
            '}'
        ].join('\n')
    };
    return  DigitalGlitch ;
});