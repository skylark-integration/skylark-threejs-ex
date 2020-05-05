/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../core/TempNode","../core/ConstNode","../inputs/FloatNode","../core/FunctionNode","../core/ExpressionNode"],function(e,n,a,o,t,r){"use strict";function i(e,a){n.call(this,"v4"),this.input=e,this.method=a||i.LINEAR_TO_LINEAR}var v,u,c,l,L,R,p,m,s,g,T,G,_,B;return i.Nodes=(v=new t(["vec4 LinearToLinear( in vec4 value ) {","\treturn value;","}"].join("\n")),u=new t(["vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {","\treturn vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );","}"].join("\n")),c=new t(["vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {","\treturn vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );","}"].join("\n")),l=new t(["vec4 sRGBToLinear( in vec4 value ) {","\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );","}"].join("\n")),L=new t(["vec4 LinearTosRGB( in vec4 value ) {","\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );","}"].join("\n")),R=new t(["vec4 RGBEToLinear( in vec4 value ) {","\treturn vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );","}"].join("\n")),p=new t(["vec4 LinearToRGBE( in vec4 value ) {","\tfloat maxComponent = max( max( value.r, value.g ), value.b );","\tfloat fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );","\treturn vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );","}"].join("\n")),m=new t(["vec3 RGBMToLinear( in vec4 value, in float maxRange ) {","\treturn vec4( value.xyz * value.w * maxRange, 1.0 );","}"].join("\n")),s=new t(["vec3 LinearToRGBM( in vec4 value, in float maxRange ) {","\tfloat maxRGB = max( value.x, max( value.g, value.b ) );","\tfloat M      = clamp( maxRGB / maxRange, 0.0, 1.0 );","\tM            = ceil( M * 255.0 ) / 255.0;","\treturn vec4( value.rgb / ( M * maxRange ), M );","}"].join("\n")),g=new t(["vec3 RGBDToLinear( in vec4 value, in float maxRange ) {","\treturn vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );","}"].join("\n")),T=new t(["vec3 LinearToRGBD( in vec4 value, in float maxRange ) {","\tfloat maxRGB = max( value.x, max( value.g, value.b ) );","\tfloat D      = max( maxRange / maxRGB, 1.0 );","\tD            = clamp( floor( D ) / 255.0, 0.0, 1.0 );","\treturn vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );","}"].join("\n")),G=new a("const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );"),_=new t(["vec4 LinearToLogLuv( in vec4 value ) {","\tvec3 Xp_Y_XYZp = cLogLuvM * value.rgb;","\tXp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));","\tvec4 vResult;","\tvResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;","\tfloat Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;","\tvResult.w = fract(Le);","\tvResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;","\treturn vResult;","}"].join("\n"),[G]),B=new a("const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );"),{LinearToLinear:v,GammaToLinear:u,LinearToGamma:c,sRGBToLinear:l,LinearTosRGB:L,RGBEToLinear:R,LinearToRGBE:p,RGBMToLinear:m,LinearToRGBM:s,RGBDToLinear:g,LinearToRGBD:T,cLogLuvM:G,LinearToLogLuv:_,cLogLuvInverseM:B,LogLuvToLinear:new t(["vec4 LogLuvToLinear( in vec4 value ) {","\tfloat Le = value.z * 255.0 + value.w;","\tvec3 Xp_Y_XYZp;","\tXp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);","\tXp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;","\tXp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;","\tvec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;","\treturn vec4( max(vRGB, 0.0), 1.0 );","}"].join("\n"),[B])}),i.LINEAR_TO_LINEAR="LinearToLinear",i.GAMMA_TO_LINEAR="GammaToLinear",i.LINEAR_TO_GAMMA="LinearToGamma",i.SRGB_TO_LINEAR="sRGBToLinear",i.LINEAR_TO_SRGB="LinearTosRGB",i.RGBE_TO_LINEAR="RGBEToLinear",i.LINEAR_TO_RGBE="LinearToRGBE",i.RGBM_TO_LINEAR="RGBMToLinear",i.LINEAR_TO_RGBM="LinearToRGBM",i.RGBD_TO_LINEAR="RGBDToLinear",i.LINEAR_TO_RGBD="LinearToRGBD",i.LINEAR_TO_LOG_LUV="LinearToLogLuv",i.LOG_LUV_TO_LINEAR="LogLuvToLinear",i.getEncodingComponents=function(n){switch(n){case e.LinearEncoding:return["Linear"];case e.sRGBEncoding:return["sRGB"];case e.RGBEEncoding:return["RGBE"];case e.RGBM7Encoding:return["RGBM",new o(7).setReadonly(!0)];case e.RGBM16Encoding:return["RGBM",new o(16).setReadonly(!0)];case e.RGBDEncoding:return["RGBD",new o(256).setReadonly(!0)];case e.GammaEncoding:return["Gamma",new r("float( GAMMA_FACTOR )","f")]}},i.prototype=Object.create(n.prototype),i.prototype.constructor=i,i.prototype.nodeType="ColorSpace",i.prototype.generate=function(e,n){var a=this.input.build(e,"v4"),o=this.getType(e),t=i.Nodes[this.method],r=e.include(t);if(r===i.LINEAR_TO_LINEAR)return e.format(a,o,n);if(2===t.inputs.length){var v=this.factor.build(e,"f");return e.format(r+"( "+a+", "+v+" )",o,n)}return e.format(r+"( "+a+" )",o,n)},i.prototype.fromEncoding=function(e){var n=i.getEncodingComponents(e);this.method="LinearTo"+n[0],this.factor=n[1]},i.prototype.fromDecoding=function(e){var n=i.getEncodingComponents(e);this.method=n[0]+"ToLinear",this.factor=n[1]},i.prototype.copy=function(e){return n.prototype.copy.call(this,e),this.input=e.input,this.method=e.method,this},i.prototype.toJSON=function(e){var n=this.getJSONNode(e);return n||((n=this.createJSONNode(e)).input=this.input.toJSON(e).uuid,n.method=this.method),n},i});
//# sourceMappingURL=../../sourcemaps/nodes/utils/ColorSpaceNode.js.map