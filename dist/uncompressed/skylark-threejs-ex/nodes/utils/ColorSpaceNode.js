define([
    "skylark-threejs",
    '../core/TempNode',
    '../core/ConstNode',
    '../inputs/FloatNode',
    '../core/FunctionNode',
    '../core/ExpressionNode'
], function (
    THREE, 
    TempNode, 
    ConstNode, 
    FloatNode, 
    FunctionNode, 
    ExpressionNode
) {
    'use strict';
    function ColorSpaceNode(input, method) {
         TempNode.call(this, 'v4');
        this.input = input;
        this.method = method || ColorSpaceNode.LINEAR_TO_LINEAR;
    }
    ColorSpaceNode.Nodes = function () {
        var LinearToLinear = new FunctionNode([
            'vec4 LinearToLinear( in vec4 value ) {',
            '\treturn value;',
            '}'
        ].join('\n'));
        var GammaToLinear = new FunctionNode([
            'vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {',
            '\treturn vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );',
            '}'
        ].join('\n'));
        var LinearToGamma = new FunctionNode([
            'vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {',
            '\treturn vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );',
            '}'
        ].join('\n'));
        var sRGBToLinear = new FunctionNode([
            'vec4 sRGBToLinear( in vec4 value ) {',
            '\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );',
            '}'
        ].join('\n'));
        var LinearTosRGB = new FunctionNode([
            'vec4 LinearTosRGB( in vec4 value ) {',
            '\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );',
            '}'
        ].join('\n'));
        var RGBEToLinear = new FunctionNode([
            'vec4 RGBEToLinear( in vec4 value ) {',
            '\treturn vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );',
            '}'
        ].join('\n'));
        var LinearToRGBE = new FunctionNode([
            'vec4 LinearToRGBE( in vec4 value ) {',
            '\tfloat maxComponent = max( max( value.r, value.g ), value.b );',
            '\tfloat fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );',
            '\treturn vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );',
            '}'
        ].join('\n'));
        var RGBMToLinear = new FunctionNode([
            'vec3 RGBMToLinear( in vec4 value, in float maxRange ) {',
            '\treturn vec4( value.xyz * value.w * maxRange, 1.0 );',
            '}'
        ].join('\n'));
        var LinearToRGBM = new FunctionNode([
            'vec3 LinearToRGBM( in vec4 value, in float maxRange ) {',
            '\tfloat maxRGB = max( value.x, max( value.g, value.b ) );',
            '\tfloat M      = clamp( maxRGB / maxRange, 0.0, 1.0 );',
            '\tM            = ceil( M * 255.0 ) / 255.0;',
            '\treturn vec4( value.rgb / ( M * maxRange ), M );',
            '}'
        ].join('\n'));
        var RGBDToLinear = new FunctionNode([
            'vec3 RGBDToLinear( in vec4 value, in float maxRange ) {',
            '\treturn vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );',
            '}'
        ].join('\n'));
        var LinearToRGBD = new FunctionNode([
            'vec3 LinearToRGBD( in vec4 value, in float maxRange ) {',
            '\tfloat maxRGB = max( value.x, max( value.g, value.b ) );',
            '\tfloat D      = max( maxRange / maxRGB, 1.0 );',
            '\tD            = clamp( floor( D ) / 255.0, 0.0, 1.0 );',
            '\treturn vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );',
            '}'
        ].join('\n'));
        var cLogLuvM = new  ConstNode('const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );');
        var LinearToLogLuv = new FunctionNode([
            'vec4 LinearToLogLuv( in vec4 value ) {',
            '\tvec3 Xp_Y_XYZp = cLogLuvM * value.rgb;',
            '\tXp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));',
            '\tvec4 vResult;',
            '\tvResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;',
            '\tfloat Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;',
            '\tvResult.w = fract(Le);',
            '\tvResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;',
            '\treturn vResult;',
            '}'
        ].join('\n'), [cLogLuvM]);
        var cLogLuvInverseM = new  ConstNode('const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );');
        var LogLuvToLinear = new FunctionNode([
            'vec4 LogLuvToLinear( in vec4 value ) {',
            '\tfloat Le = value.z * 255.0 + value.w;',
            '\tvec3 Xp_Y_XYZp;',
            '\tXp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);',
            '\tXp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;',
            '\tXp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;',
            '\tvec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;',
            '\treturn vec4( max(vRGB, 0.0), 1.0 );',
            '}'
        ].join('\n'), [cLogLuvInverseM]);
        return {
            LinearToLinear: LinearToLinear,
            GammaToLinear: GammaToLinear,
            LinearToGamma: LinearToGamma,
            sRGBToLinear: sRGBToLinear,
            LinearTosRGB: LinearTosRGB,
            RGBEToLinear: RGBEToLinear,
            LinearToRGBE: LinearToRGBE,
            RGBMToLinear: RGBMToLinear,
            LinearToRGBM: LinearToRGBM,
            RGBDToLinear: RGBDToLinear,
            LinearToRGBD: LinearToRGBD,
            cLogLuvM: cLogLuvM,
            LinearToLogLuv: LinearToLogLuv,
            cLogLuvInverseM: cLogLuvInverseM,
            LogLuvToLinear: LogLuvToLinear
        };
    }();
    ColorSpaceNode.LINEAR_TO_LINEAR = 'LinearToLinear';
    ColorSpaceNode.GAMMA_TO_LINEAR = 'GammaToLinear';
    ColorSpaceNode.LINEAR_TO_GAMMA = 'LinearToGamma';
    ColorSpaceNode.SRGB_TO_LINEAR = 'sRGBToLinear';
    ColorSpaceNode.LINEAR_TO_SRGB = 'LinearTosRGB';
    ColorSpaceNode.RGBE_TO_LINEAR = 'RGBEToLinear';
    ColorSpaceNode.LINEAR_TO_RGBE = 'LinearToRGBE';
    ColorSpaceNode.RGBM_TO_LINEAR = 'RGBMToLinear';
    ColorSpaceNode.LINEAR_TO_RGBM = 'LinearToRGBM';
    ColorSpaceNode.RGBD_TO_LINEAR = 'RGBDToLinear';
    ColorSpaceNode.LINEAR_TO_RGBD = 'LinearToRGBD';
    ColorSpaceNode.LINEAR_TO_LOG_LUV = 'LinearToLogLuv';
    ColorSpaceNode.LOG_LUV_TO_LINEAR = 'LogLuvToLinear';
    ColorSpaceNode.getEncodingComponents = function (encoding) {
        switch (encoding) {
        case THREE.LinearEncoding:
            return ['Linear'];
        case THREE.sRGBEncoding:
            return ['sRGB'];
        case THREE.RGBEEncoding:
            return ['RGBE'];
        case THREE.RGBM7Encoding:
            return [
                'RGBM',
                new  FloatNode(7).setReadonly(true)
            ];
        case THREE.RGBM16Encoding:
            return [
                'RGBM',
                new FloatNode(16).setReadonly(true)
            ];
        case THREE.RGBDEncoding:
            return [
                'RGBD',
                new FloatNode(256).setReadonly(true)
            ];
        case THREE.GammaEncoding:
            return [
                'Gamma',
                new ExpressionNode('float( GAMMA_FACTOR )', 'f')
            ];
        }
    };
    ColorSpaceNode.prototype = Object.create(TempNode.prototype);
    ColorSpaceNode.prototype.constructor = ColorSpaceNode;
    ColorSpaceNode.prototype.nodeType = 'ColorSpace';
    ColorSpaceNode.prototype.generate = function (builder, output) {
        var input = this.input.build(builder, 'v4');
        var outputType = this.getType(builder);
        var methodNode = ColorSpaceNode.Nodes[this.method];
        var method = builder.include(methodNode);
        if (method === ColorSpaceNode.LINEAR_TO_LINEAR) {
            return builder.format(input, outputType, output);
        } else {
            if (methodNode.inputs.length === 2) {
                var factor = this.factor.build(builder, 'f');
                return builder.format(method + '( ' + input + ', ' + factor + ' )', outputType, output);
            } else {
                return builder.format(method + '( ' + input + ' )', outputType, output);
            }
        }
    };
    ColorSpaceNode.prototype.fromEncoding = function (encoding) {
        var components = ColorSpaceNode.getEncodingComponents(encoding);
        this.method = 'LinearTo' + components[0];
        this.factor = components[1];
    };
    ColorSpaceNode.prototype.fromDecoding = function (encoding) {
        var components = ColorSpaceNode.getEncodingComponents(encoding);
        this.method = components[0] + 'ToLinear';
        this.factor = components[1];
    };
    ColorSpaceNode.prototype.copy = function (source) {
        TempNode.prototype.copy.call(this, source);
        this.input = source.input;
        this.method = source.method;
        return this;
    };
    ColorSpaceNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.input = this.input.toJSON(meta).uuid;
            data.method = this.method;
        }
        return data;
    };
    return ColorSpaceNode;
});