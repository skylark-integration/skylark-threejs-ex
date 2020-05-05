define(["skylark-threejs"], function (a) {
    'use strict';
    var FreiChenShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'aspect': { value: new a.Vector2(512, 512) }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'varying vec2 vUv;',
            'uniform vec2 aspect;',
            'vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);',
            'mat3 G[9];',
            'const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 );',
            'const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 );',
            'const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 );',
            'const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 );',
            'const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 );',
            'const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 );',
            'const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 );',
            'const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 );',
            'const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );',
            'void main(void)',
            '{',
            '\tG[0] = g0,',
            '\tG[1] = g1,',
            '\tG[2] = g2,',
            '\tG[3] = g3,',
            '\tG[4] = g4,',
            '\tG[5] = g5,',
            '\tG[6] = g6,',
            '\tG[7] = g7,',
            '\tG[8] = g8;',
            '\tmat3 I;',
            '\tfloat cnv[9];',
            '\tvec3 sample;',
            '\tfor (float i=0.0; i<3.0; i++) {',
            '\t\tfor (float j=0.0; j<3.0; j++) {',
            '\t\t\tsample = texture2D(tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;',
            '\t\t\tI[int(i)][int(j)] = length(sample);',
            '\t\t}',
            '\t}',
            '\tfor (int i=0; i<9; i++) {',
            '\t\tfloat dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);',
            '\t\tcnv[i] = dp3 * dp3;',
            '\t}',
            '\tfloat M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);',
            '\tfloat S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);',
            '\tgl_FragColor = vec4(vec3(sqrt(M/S)), 1.0);',
            '}'
        ].join('\n')
    };
    return FreiChenShader;
});