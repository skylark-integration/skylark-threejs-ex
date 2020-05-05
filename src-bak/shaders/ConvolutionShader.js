define(["skylark-threejs"], function (a) {
    'use strict';
    var ConvolutionShader = {
        defines: {
            'KERNEL_SIZE_FLOAT': '25.0',
            'KERNEL_SIZE_INT': '25'
        },
        uniforms: {
            'tDiffuse': { value: null },
            'uImageIncrement': { value: new a.Vector2(0.001953125, 0) },
            'cKernel': { value: [] }
        },
        vertexShader: [
            'uniform vec2 uImageIncrement;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float cKernel[ KERNEL_SIZE_INT ];',
            'uniform sampler2D tDiffuse;',
            'uniform vec2 uImageIncrement;',
            'varying vec2 vUv;',
            'void main() {',
            '\tvec2 imageCoord = vUv;',
            '\tvec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );',
            '\tfor( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {',
            '\t\tsum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];',
            '\t\timageCoord += uImageIncrement;',
            '\t}',
            '\tgl_FragColor = sum;',
            '}'
        ].join('\n'),
        buildKernel: function (sigma) {
            function gauss(x, sigma) {
                return Math.exp(-(x * x) / (2 * sigma * sigma));
            }
            var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil(sigma * 3) + 1;
            if (kernelSize > kMaxKernelSize)
                kernelSize = kMaxKernelSize;
            halfWidth = (kernelSize - 1) * 0.5;
            values = new Array(kernelSize);
            sum = 0;
            for (i = 0; i < kernelSize; ++i) {
                values[i] = gauss(i - halfWidth, sigma);
                sum += values[i];
            }
            for (i = 0; i < kernelSize; ++i)
                values[i] /= sum;
            return values;
        }
    };
    return ConvolutionShader;
});