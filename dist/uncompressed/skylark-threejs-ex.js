/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-threejs-ex/shaders/CopyShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Full-screen textured quad shader
	 */

	THREE.CopyShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"opacity": { value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

			"	vec4 texel = texture2D( tDiffuse, vUv );",
			"	gl_FragColor = opacity * texel;",

			"}"

		].join( "\n" )

	};
	
	return THREE.CopyShader;
});

define('skylark-threejs-ex/shaders/BokehShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Depth-of-field shader with bokeh
	 * ported from GLSL shader by Martins Upitis
	 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
	 */

	THREE.BokehShader = {

		defines: {
			"DEPTH_PACKING": 1,
			"PERSPECTIVE_CAMERA": 1,
		},

		uniforms: {

			"tColor": { value: null },
			"tDepth": { value: null },
			"focus": { value: 1.0 },
			"aspect": { value: 1.0 },
			"aperture": { value: 0.025 },
			"maxblur": { value: 1.0 },
			"nearClip": { value: 1.0 },
			"farClip": { value: 1000.0 },

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [
			"#include <common>",

			"varying vec2 vUv;",

			"uniform sampler2D tColor;",
			"uniform sampler2D tDepth;",

			"uniform float maxblur;", // max blur amount
			"uniform float aperture;", // aperture - bigger values for shallower depth of field

			"uniform float nearClip;",
			"uniform float farClip;",

			"uniform float focus;",
			"uniform float aspect;",

			"#include <packing>",

			"float getDepth( const in vec2 screenPosition ) {",
			"	#if DEPTH_PACKING == 1",
			"	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
			"	#else",
			"	return texture2D( tDepth, screenPosition ).x;",
			"	#endif",
			"}",

			"float getViewZ( const in float depth ) {",
			"	#if PERSPECTIVE_CAMERA == 1",
			"	return perspectiveDepthToViewZ( depth, nearClip, farClip );",
			"	#else",
			"	return orthographicDepthToViewZ( depth, nearClip, farClip );",
			"	#endif",
			"}",


			"void main() {",

			"	vec2 aspectcorrect = vec2( 1.0, aspect );",

			"	float viewZ = getViewZ( getDepth( vUv ) );",

			"	float factor = ( focus + viewZ );", // viewZ is <= 0, so this is a difference equation

			"	vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );",

			"	vec2 dofblur9 = dofblur * 0.9;",
			"	vec2 dofblur7 = dofblur * 0.7;",
			"	vec2 dofblur4 = dofblur * 0.4;",

			"	vec4 col = vec4( 0.0 );",

			"	col += texture2D( tColor, vUv.xy );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );",

			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",

			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );",

			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"	col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );",

			"	gl_FragColor = col / 41.0;",
			"	gl_FragColor.a = 1.0;",

			"}"

		].join( "\n" )

	};
	
	return THREE.BokehShader;
});

define('skylark-threejs-ex/shaders/SAOShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * TODO
	 */

	THREE.SAOShader = {
		defines: {
			"NUM_SAMPLES": 7,
			"NUM_RINGS": 4,
			"NORMAL_TEXTURE": 0,
			"DIFFUSE_TEXTURE": 0,
			"DEPTH_PACKING": 1,
			"PERSPECTIVE_CAMERA": 1
		},
		uniforms: {

			"tDepth": { value: null },
			"tDiffuse": { value: null },
			"tNormal": { value: null },
			"size": { value: new THREE.Vector2( 512, 512 ) },

			"cameraNear": { value: 1 },
			"cameraFar": { value: 100 },
			"cameraProjectionMatrix": { value: new THREE.Matrix4() },
			"cameraInverseProjectionMatrix": { value: new THREE.Matrix4() },

			"scale": { value: 1.0 },
			"intensity": { value: 0.1 },
			"bias": { value: 0.5 },

			"minResolution": { value: 0.0 },
			"kernelRadius": { value: 100.0 },
			"randomSeed": { value: 0.0 }
		},
		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",
			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),
		fragmentShader: [
			"#include <common>",

			"varying vec2 vUv;",

			"#if DIFFUSE_TEXTURE == 1",
			"uniform sampler2D tDiffuse;",
			"#endif",

			"uniform sampler2D tDepth;",

			"#if NORMAL_TEXTURE == 1",
			"uniform sampler2D tNormal;",
			"#endif",

			"uniform float cameraNear;",
			"uniform float cameraFar;",
			"uniform mat4 cameraProjectionMatrix;",
			"uniform mat4 cameraInverseProjectionMatrix;",

			"uniform float scale;",
			"uniform float intensity;",
			"uniform float bias;",
			"uniform float kernelRadius;",
			"uniform float minResolution;",
			"uniform vec2 size;",
			"uniform float randomSeed;",

			"// RGBA depth",

			"#include <packing>",

			"vec4 getDefaultColor( const in vec2 screenPosition ) {",
			"	#if DIFFUSE_TEXTURE == 1",
			"	return texture2D( tDiffuse, vUv );",
			"	#else",
			"	return vec4( 1.0 );",
			"	#endif",
			"}",

			"float getDepth( const in vec2 screenPosition ) {",
			"	#if DEPTH_PACKING == 1",
			"	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
			"	#else",
			"	return texture2D( tDepth, screenPosition ).x;",
			"	#endif",
			"}",

			"float getViewZ( const in float depth ) {",
			"	#if PERSPECTIVE_CAMERA == 1",
			"	return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",
			"	#else",
			"	return orthographicDepthToViewZ( depth, cameraNear, cameraFar );",
			"	#endif",
			"}",

			"vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {",
			"	float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];",
			"	vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );",
			"	clipPosition *= clipW; // unprojection.",

			"	return ( cameraInverseProjectionMatrix * clipPosition ).xyz;",
			"}",

			"vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {",
			"	#if NORMAL_TEXTURE == 1",
			"	return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );",
			"	#else",
			"	return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );",
			"	#endif",
			"}",

			"float scaleDividedByCameraFar;",
			"float minResolutionMultipliedByCameraFar;",

			"float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {",
			"	vec3 viewDelta = sampleViewPosition - centerViewPosition;",
			"	float viewDistance = length( viewDelta );",
			"	float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;",

			"	return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );",
			"}",

			"// moving costly divides into consts",
			"const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );",
			"const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );",

			"float getAmbientOcclusion( const in vec3 centerViewPosition ) {",
			"	// precompute some variables require in getOcclusion.",
			"	scaleDividedByCameraFar = scale / cameraFar;",
			"	minResolutionMultipliedByCameraFar = minResolution * cameraFar;",
			"	vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );",

			"	// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/",
			"	float angle = rand( vUv + randomSeed ) * PI2;",
			"	vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;",
			"	vec2 radiusStep = radius;",

			"	float occlusionSum = 0.0;",
			"	float weightSum = 0.0;",

			"	for( int i = 0; i < NUM_SAMPLES; i ++ ) {",
			"		vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;",
			"		radius += radiusStep;",
			"		angle += ANGLE_STEP;",

			"		float sampleDepth = getDepth( sampleUv );",
			"		if( sampleDepth >= ( 1.0 - EPSILON ) ) {",
			"			continue;",
			"		}",

			"		float sampleViewZ = getViewZ( sampleDepth );",
			"		vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );",
			"		occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );",
			"		weightSum += 1.0;",
			"	}",

			"	if( weightSum == 0.0 ) discard;",

			"	return occlusionSum * ( intensity / weightSum );",
			"}",


			"void main() {",
			"	float centerDepth = getDepth( vUv );",
			"	if( centerDepth >= ( 1.0 - EPSILON ) ) {",
			"		discard;",
			"	}",

			"	float centerViewZ = getViewZ( centerDepth );",
			"	vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );",

			"	float ambientOcclusion = getAmbientOcclusion( viewPosition );",

			"	gl_FragColor = getDefaultColor( vUv );",
			"	gl_FragColor.xyz *=  1.0 - ambientOcclusion;",
			"}"
		].join( "\n" )
	};
	
	return THREE.SAOShader;
});

define('skylark-threejs-ex/shaders/DepthLimitedBlurShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * TODO
	 */

	THREE.DepthLimitedBlurShader = {
		defines: {
			"KERNEL_RADIUS": 4,
			"DEPTH_PACKING": 1,
			"PERSPECTIVE_CAMERA": 1
		},
		uniforms: {
			"tDiffuse": { value: null },
			"size": { value: new THREE.Vector2( 512, 512 ) },
			"sampleUvOffsets": { value: [ new THREE.Vector2( 0, 0 ) ] },
			"sampleWeights": { value: [ 1.0 ] },
			"tDepth": { value: null },
			"cameraNear": { value: 10 },
			"cameraFar": { value: 1000 },
			"depthCutoff": { value: 10 },
		},
		vertexShader: [
			"#include <common>",

			"uniform vec2 size;",

			"varying vec2 vUv;",
			"varying vec2 vInvSize;",

			"void main() {",
			"	vUv = uv;",
			"	vInvSize = 1.0 / size;",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),
		fragmentShader: [
			"#include <common>",
			"#include <packing>",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tDepth;",

			"uniform float cameraNear;",
			"uniform float cameraFar;",
			"uniform float depthCutoff;",

			"uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];",
			"uniform float sampleWeights[ KERNEL_RADIUS + 1 ];",

			"varying vec2 vUv;",
			"varying vec2 vInvSize;",

			"float getDepth( const in vec2 screenPosition ) {",
			"	#if DEPTH_PACKING == 1",
			"	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
			"	#else",
			"	return texture2D( tDepth, screenPosition ).x;",
			"	#endif",
			"}",

			"float getViewZ( const in float depth ) {",
			"	#if PERSPECTIVE_CAMERA == 1",
			"	return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",
			"	#else",
			"	return orthographicDepthToViewZ( depth, cameraNear, cameraFar );",
			"	#endif",
			"}",

			"void main() {",
			"	float depth = getDepth( vUv );",
			"	if( depth >= ( 1.0 - EPSILON ) ) {",
			"		discard;",
			"	}",

			"	float centerViewZ = -getViewZ( depth );",
			"	bool rBreak = false, lBreak = false;",

			"	float weightSum = sampleWeights[0];",
			"	vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;",

			"	for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {",

			"		float sampleWeight = sampleWeights[i];",
			"		vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;",

			"		vec2 sampleUv = vUv + sampleUvOffset;",
			"		float viewZ = -getViewZ( getDepth( sampleUv ) );",

			"		if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;",

			"		if( ! rBreak ) {",
			"			diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
			"			weightSum += sampleWeight;",
			"		}",

			"		sampleUv = vUv - sampleUvOffset;",
			"		viewZ = -getViewZ( getDepth( sampleUv ) );",

			"		if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;",

			"		if( ! lBreak ) {",
			"			diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
			"			weightSum += sampleWeight;",
			"		}",

			"	}",

			"	gl_FragColor = diffuseSum / weightSum;",
			"}"
		].join( "\n" )
	};

	THREE.BlurShaderUtils = {

		createSampleWeights: function ( kernelRadius, stdDev ) {

			var gaussian = function ( x, stdDev ) {

				return Math.exp( - ( x * x ) / ( 2.0 * ( stdDev * stdDev ) ) ) / ( Math.sqrt( 2.0 * Math.PI ) * stdDev );

			};

			var weights = [];

			for ( var i = 0; i <= kernelRadius; i ++ ) {

				weights.push( gaussian( i, stdDev ) );

			}

			return weights;

		},

		createSampleOffsets: function ( kernelRadius, uvIncrement ) {

			var offsets = [];

			for ( var i = 0; i <= kernelRadius; i ++ ) {

				offsets.push( uvIncrement.clone().multiplyScalar( i ) );

			}

			return offsets;

		},

		configure: function ( material, kernelRadius, stdDev, uvIncrement ) {

			material.defines[ "KERNEL_RADIUS" ] = kernelRadius;
			material.uniforms[ "sampleUvOffsets" ].value = THREE.BlurShaderUtils.createSampleOffsets( kernelRadius, uvIncrement );
			material.uniforms[ "sampleWeights" ].value = THREE.BlurShaderUtils.createSampleWeights( kernelRadius, stdDev );
			material.needsUpdate = true;

		}

	};
	
	return THREE.DepthLimitedBlurShader;
});

define('skylark-threejs-ex/shaders/UnpackDepthRGBAShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Unpack RGBA depth shader
	 * - show RGBA encoded depth as monochrome color
	 */

	THREE.UnpackDepthRGBAShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"opacity": { value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"#include <packing>",

			"void main() {",

			"	float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );",
			"	gl_FragColor = vec4( vec3( depth ), opacity );",

			"}"

		].join( "\n" )

	};
	
	return THREE.UnpackDepthRGBAShader;
});

define('skylark-threejs-ex/shaders/ConvolutionShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Convolution shader
	 * ported from o3d sample to WebGL / GLSL
	 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
	 */

	THREE.ConvolutionShader = {

		defines: {

			"KERNEL_SIZE_FLOAT": "25.0",
			"KERNEL_SIZE_INT": "25"

		},

		uniforms: {

			"tDiffuse": { value: null },
			"uImageIncrement": { value: new THREE.Vector2( 0.001953125, 0.0 ) },
			"cKernel": { value: [] }

		},

		vertexShader: [

			"uniform vec2 uImageIncrement;",

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float cKernel[ KERNEL_SIZE_INT ];",

			"uniform sampler2D tDiffuse;",
			"uniform vec2 uImageIncrement;",

			"varying vec2 vUv;",

			"void main() {",

			"	vec2 imageCoord = vUv;",
			"	vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"	for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

			"		sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
			"		imageCoord += uImageIncrement;",

			"	}",

			"	gl_FragColor = sum;",

			"}"


		].join( "\n" ),

		buildKernel: function ( sigma ) {

			// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

			function gauss( x, sigma ) {

				return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

			}

			var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

			if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
			halfWidth = ( kernelSize - 1 ) * 0.5;

			values = new Array( kernelSize );
			sum = 0.0;
			for ( i = 0; i < kernelSize; ++ i ) {

				values[ i ] = gauss( i - halfWidth, sigma );
				sum += values[ i ];

			}

			// normalize the kernel

			for ( i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

			return values;

		}

	};
	
	return THREE.ConvolutionShader;
});
define('skylark-threejs-ex/shaders/LuminosityHighPassShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author bhouston / http://clara.io/
	 *
	 * Luminosity
	 * http://en.wikipedia.org/wiki/Luminosity
	 */

	THREE.LuminosityHighPassShader = {

		shaderID: "luminosityHighPass",

		uniforms: {

			"tDiffuse": { value: null },
			"luminosityThreshold": { value: 1.0 },
			"smoothWidth": { value: 1.0 },
			"defaultColor": { value: new THREE.Color( 0x000000 ) },
			"defaultOpacity": { value: 0.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform vec3 defaultColor;",
			"uniform float defaultOpacity;",
			"uniform float luminosityThreshold;",
			"uniform float smoothWidth;",

			"varying vec2 vUv;",

			"void main() {",

			"	vec4 texel = texture2D( tDiffuse, vUv );",

			"	vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"	float v = dot( texel.xyz, luma );",

			"	vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

			"	float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

			"	gl_FragColor = mix( outputColor, texel, alpha );",

			"}"

		].join( "\n" )

	};
	
	return THREE.LuminosityHighPassShader;
});

define('skylark-threejs-ex/shaders/FXAAShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 * @author davidedc / http://www.sketchpatch.net/
	 *
	 * NVIDIA FXAA by Timothy Lottes
	 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
	 * - WebGL port by @supereggbert
	 * http://www.glge.org/demos/fxaa/
	 */

	THREE.FXAAShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [
			"precision highp float;",
			"",
			"uniform sampler2D tDiffuse;",
			"",
			"uniform vec2 resolution;",
			"",
			"varying vec2 vUv;",
			"",
			"// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)",
			"",
			"//----------------------------------------------------------------------------------",
			"// File:        es3-kepler\FXAA\assets\shaders/FXAA_DefaultES.frag",
			"// SDK Version: v3.00",
			"// Email:       gameworks@nvidia.com",
			"// Site:        http://developer.nvidia.com/",
			"//",
			"// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.",
			"//",
			"// Redistribution and use in source and binary forms, with or without",
			"// modification, are permitted provided that the following conditions",
			"// are met:",
			"//  * Redistributions of source code must retain the above copyright",
			"//    notice, this list of conditions and the following disclaimer.",
			"//  * Redistributions in binary form must reproduce the above copyright",
			"//    notice, this list of conditions and the following disclaimer in the",
			"//    documentation and/or other materials provided with the distribution.",
			"//  * Neither the name of NVIDIA CORPORATION nor the names of its",
			"//    contributors may be used to endorse or promote products derived",
			"//    from this software without specific prior written permission.",
			"//",
			"// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ``AS IS'' AND ANY",
			"// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE",
			"// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR",
			"// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR",
			"// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,",
			"// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,",
			"// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR",
			"// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY",
			"// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT",
			"// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE",
			"// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",
			"//",
			"//----------------------------------------------------------------------------------",
			"",
			"#define FXAA_PC 1",
			"#define FXAA_GLSL_100 1",
			"#define FXAA_QUALITY_PRESET 12",
			"",
			"#define FXAA_GREEN_AS_LUMA 1",
			"",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_PC_CONSOLE",
			"    //",
			"    // The console algorithm for PC is included",
			"    // for developers targeting really low spec machines.",
			"    // Likely better to just run FXAA_PC, and use a really low preset.",
			"    //",
			"    #define FXAA_PC_CONSOLE 0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_GLSL_120",
			"    #define FXAA_GLSL_120 0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_GLSL_130",
			"    #define FXAA_GLSL_130 0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_HLSL_3",
			"    #define FXAA_HLSL_3 0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_HLSL_4",
			"    #define FXAA_HLSL_4 0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_HLSL_5",
			"    #define FXAA_HLSL_5 0",
			"#endif",
			"/*==========================================================================*/",
			"#ifndef FXAA_GREEN_AS_LUMA",
			"    //",
			"    // For those using non-linear color,",
			"    // and either not able to get luma in alpha, or not wanting to,",
			"    // this enables FXAA to run using green as a proxy for luma.",
			"    // So with this enabled, no need to pack luma in alpha.",
			"    //",
			"    // This will turn off AA on anything which lacks some amount of green.",
			"    // Pure red and blue or combination of only R and B, will get no AA.",
			"    //",
			"    // Might want to lower the settings for both,",
			"    //    fxaaConsoleEdgeThresholdMin",
			"    //    fxaaQualityEdgeThresholdMin",
			"    // In order to insure AA does not get turned off on colors",
			"    // which contain a minor amount of green.",
			"    //",
			"    // 1 = On.",
			"    // 0 = Off.",
			"    //",
			"    #define FXAA_GREEN_AS_LUMA 0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_EARLY_EXIT",
			"    //",
			"    // Controls algorithm's early exit path.",
			"    // On PS3 turning this ON adds 2 cycles to the shader.",
			"    // On 360 turning this OFF adds 10ths of a millisecond to the shader.",
			"    // Turning this off on console will result in a more blurry image.",
			"    // So this defaults to on.",
			"    //",
			"    // 1 = On.",
			"    // 0 = Off.",
			"    //",
			"    #define FXAA_EARLY_EXIT 1",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_DISCARD",
			"    //",
			"    // Only valid for PC OpenGL currently.",
			"    // Probably will not work when FXAA_GREEN_AS_LUMA = 1.",
			"    //",
			"    // 1 = Use discard on pixels which don't need AA.",
			"    //     For APIs which enable concurrent TEX+ROP from same surface.",
			"    // 0 = Return unchanged color on pixels which don't need AA.",
			"    //",
			"    #define FXAA_DISCARD 0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_FAST_PIXEL_OFFSET",
			"    //",
			"    // Used for GLSL 120 only.",
			"    //",
			"    // 1 = GL API supports fast pixel offsets",
			"    // 0 = do not use fast pixel offsets",
			"    //",
			"    #ifdef GL_EXT_gpu_shader4",
			"        #define FXAA_FAST_PIXEL_OFFSET 1",
			"    #endif",
			"    #ifdef GL_NV_gpu_shader5",
			"        #define FXAA_FAST_PIXEL_OFFSET 1",
			"    #endif",
			"    #ifdef GL_ARB_gpu_shader5",
			"        #define FXAA_FAST_PIXEL_OFFSET 1",
			"    #endif",
			"    #ifndef FXAA_FAST_PIXEL_OFFSET",
			"        #define FXAA_FAST_PIXEL_OFFSET 0",
			"    #endif",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#ifndef FXAA_GATHER4_ALPHA",
			"    //",
			"    // 1 = API supports gather4 on alpha channel.",
			"    // 0 = API does not support gather4 on alpha channel.",
			"    //",
			"    #if (FXAA_HLSL_5 == 1)",
			"        #define FXAA_GATHER4_ALPHA 1",
			"    #endif",
			"    #ifdef GL_ARB_gpu_shader5",
			"        #define FXAA_GATHER4_ALPHA 1",
			"    #endif",
			"    #ifdef GL_NV_gpu_shader5",
			"        #define FXAA_GATHER4_ALPHA 1",
			"    #endif",
			"    #ifndef FXAA_GATHER4_ALPHA",
			"        #define FXAA_GATHER4_ALPHA 0",
			"    #endif",
			"#endif",
			"",
			"",
			"/*============================================================================",
			"                        FXAA QUALITY - TUNING KNOBS",
			"------------------------------------------------------------------------------",
			"NOTE the other tuning knobs are now in the shader function inputs!",
			"============================================================================*/",
			"#ifndef FXAA_QUALITY_PRESET",
			"    //",
			"    // Choose the quality preset.",
			"    // This needs to be compiled into the shader as it effects code.",
			"    // Best option to include multiple presets is to",
			"    // in each shader define the preset, then include this file.",
			"    //",
			"    // OPTIONS",
			"    // -----------------------------------------------------------------------",
			"    // 10 to 15 - default medium dither (10=fastest, 15=highest quality)",
			"    // 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)",
			"    // 39       - no dither, very expensive",
			"    //",
			"    // NOTES",
			"    // -----------------------------------------------------------------------",
			"    // 12 = slightly faster then FXAA 3.9 and higher edge quality (default)",
			"    // 13 = about same speed as FXAA 3.9 and better than 12",
			"    // 23 = closest to FXAA 3.9 visually and performance wise",
			"    //  _ = the lowest digit is directly related to performance",
			"    // _  = the highest digit is directly related to style",
			"    //",
			"    #define FXAA_QUALITY_PRESET 12",
			"#endif",
			"",
			"",
			"/*============================================================================",
			"",
			"                           FXAA QUALITY - PRESETS",
			"",
			"============================================================================*/",
			"",
			"/*============================================================================",
			"                     FXAA QUALITY - MEDIUM DITHER PRESETS",
			"============================================================================*/",
			"#if (FXAA_QUALITY_PRESET == 10)",
			"    #define FXAA_QUALITY_PS 3",
			"    #define FXAA_QUALITY_P0 1.5",
			"    #define FXAA_QUALITY_P1 3.0",
			"    #define FXAA_QUALITY_P2 12.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 11)",
			"    #define FXAA_QUALITY_PS 4",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 3.0",
			"    #define FXAA_QUALITY_P3 12.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 12)",
			"    #define FXAA_QUALITY_PS 5",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 4.0",
			"    #define FXAA_QUALITY_P4 12.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 13)",
			"    #define FXAA_QUALITY_PS 6",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 4.0",
			"    #define FXAA_QUALITY_P5 12.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 14)",
			"    #define FXAA_QUALITY_PS 7",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 4.0",
			"    #define FXAA_QUALITY_P6 12.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 15)",
			"    #define FXAA_QUALITY_PS 8",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 2.0",
			"    #define FXAA_QUALITY_P6 4.0",
			"    #define FXAA_QUALITY_P7 12.0",
			"#endif",
			"",
			"/*============================================================================",
			"                     FXAA QUALITY - LOW DITHER PRESETS",
			"============================================================================*/",
			"#if (FXAA_QUALITY_PRESET == 20)",
			"    #define FXAA_QUALITY_PS 3",
			"    #define FXAA_QUALITY_P0 1.5",
			"    #define FXAA_QUALITY_P1 2.0",
			"    #define FXAA_QUALITY_P2 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 21)",
			"    #define FXAA_QUALITY_PS 4",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 22)",
			"    #define FXAA_QUALITY_PS 5",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 23)",
			"    #define FXAA_QUALITY_PS 6",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 24)",
			"    #define FXAA_QUALITY_PS 7",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 3.0",
			"    #define FXAA_QUALITY_P6 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 25)",
			"    #define FXAA_QUALITY_PS 8",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 2.0",
			"    #define FXAA_QUALITY_P6 4.0",
			"    #define FXAA_QUALITY_P7 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 26)",
			"    #define FXAA_QUALITY_PS 9",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 2.0",
			"    #define FXAA_QUALITY_P6 2.0",
			"    #define FXAA_QUALITY_P7 4.0",
			"    #define FXAA_QUALITY_P8 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 27)",
			"    #define FXAA_QUALITY_PS 10",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 2.0",
			"    #define FXAA_QUALITY_P6 2.0",
			"    #define FXAA_QUALITY_P7 2.0",
			"    #define FXAA_QUALITY_P8 4.0",
			"    #define FXAA_QUALITY_P9 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 28)",
			"    #define FXAA_QUALITY_PS 11",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 2.0",
			"    #define FXAA_QUALITY_P6 2.0",
			"    #define FXAA_QUALITY_P7 2.0",
			"    #define FXAA_QUALITY_P8 2.0",
			"    #define FXAA_QUALITY_P9 4.0",
			"    #define FXAA_QUALITY_P10 8.0",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_QUALITY_PRESET == 29)",
			"    #define FXAA_QUALITY_PS 12",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.5",
			"    #define FXAA_QUALITY_P2 2.0",
			"    #define FXAA_QUALITY_P3 2.0",
			"    #define FXAA_QUALITY_P4 2.0",
			"    #define FXAA_QUALITY_P5 2.0",
			"    #define FXAA_QUALITY_P6 2.0",
			"    #define FXAA_QUALITY_P7 2.0",
			"    #define FXAA_QUALITY_P8 2.0",
			"    #define FXAA_QUALITY_P9 2.0",
			"    #define FXAA_QUALITY_P10 4.0",
			"    #define FXAA_QUALITY_P11 8.0",
			"#endif",
			"",
			"/*============================================================================",
			"                     FXAA QUALITY - EXTREME QUALITY",
			"============================================================================*/",
			"#if (FXAA_QUALITY_PRESET == 39)",
			"    #define FXAA_QUALITY_PS 12",
			"    #define FXAA_QUALITY_P0 1.0",
			"    #define FXAA_QUALITY_P1 1.0",
			"    #define FXAA_QUALITY_P2 1.0",
			"    #define FXAA_QUALITY_P3 1.0",
			"    #define FXAA_QUALITY_P4 1.0",
			"    #define FXAA_QUALITY_P5 1.5",
			"    #define FXAA_QUALITY_P6 2.0",
			"    #define FXAA_QUALITY_P7 2.0",
			"    #define FXAA_QUALITY_P8 2.0",
			"    #define FXAA_QUALITY_P9 2.0",
			"    #define FXAA_QUALITY_P10 4.0",
			"    #define FXAA_QUALITY_P11 8.0",
			"#endif",
			"",
			"",
			"",
			"/*============================================================================",
			"",
			"                                API PORTING",
			"",
			"============================================================================*/",
			"#if (FXAA_GLSL_100 == 1) || (FXAA_GLSL_120 == 1) || (FXAA_GLSL_130 == 1)",
			"    #define FxaaBool bool",
			"    #define FxaaDiscard discard",
			"    #define FxaaFloat float",
			"    #define FxaaFloat2 vec2",
			"    #define FxaaFloat3 vec3",
			"    #define FxaaFloat4 vec4",
			"    #define FxaaHalf float",
			"    #define FxaaHalf2 vec2",
			"    #define FxaaHalf3 vec3",
			"    #define FxaaHalf4 vec4",
			"    #define FxaaInt2 ivec2",
			"    #define FxaaSat(x) clamp(x, 0.0, 1.0)",
			"    #define FxaaTex sampler2D",
			"#else",
			"    #define FxaaBool bool",
			"    #define FxaaDiscard clip(-1)",
			"    #define FxaaFloat float",
			"    #define FxaaFloat2 float2",
			"    #define FxaaFloat3 float3",
			"    #define FxaaFloat4 float4",
			"    #define FxaaHalf half",
			"    #define FxaaHalf2 half2",
			"    #define FxaaHalf3 half3",
			"    #define FxaaHalf4 half4",
			"    #define FxaaSat(x) saturate(x)",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_GLSL_100 == 1)",
			"  #define FxaaTexTop(t, p) texture2D(t, p, 0.0)",
			"  #define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), 0.0)",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_GLSL_120 == 1)",
			"    // Requires,",
			"    //  #version 120",
			"    // And at least,",
			"    //  #extension GL_EXT_gpu_shader4 : enable",
			"    //  (or set FXAA_FAST_PIXEL_OFFSET 1 to work like DX9)",
			"    #define FxaaTexTop(t, p) texture2DLod(t, p, 0.0)",
			"    #if (FXAA_FAST_PIXEL_OFFSET == 1)",
			"        #define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)",
			"    #else",
			"        #define FxaaTexOff(t, p, o, r) texture2DLod(t, p + (o * r), 0.0)",
			"    #endif",
			"    #if (FXAA_GATHER4_ALPHA == 1)",
			"        // use #extension GL_ARB_gpu_shader5 : enable",
			"        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
			"        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
			"        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
			"        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
			"    #endif",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_GLSL_130 == 1)",
			"    // Requires \"#version 130\" or better",
			"    #define FxaaTexTop(t, p) textureLod(t, p, 0.0)",
			"    #define FxaaTexOff(t, p, o, r) textureLodOffset(t, p, 0.0, o)",
			"    #if (FXAA_GATHER4_ALPHA == 1)",
			"        // use #extension GL_ARB_gpu_shader5 : enable",
			"        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
			"        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
			"        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
			"        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
			"    #endif",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_HLSL_3 == 1)",
			"    #define FxaaInt2 float2",
			"    #define FxaaTex sampler2D",
			"    #define FxaaTexTop(t, p) tex2Dlod(t, float4(p, 0.0, 0.0))",
			"    #define FxaaTexOff(t, p, o, r) tex2Dlod(t, float4(p + (o * r), 0, 0))",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_HLSL_4 == 1)",
			"    #define FxaaInt2 int2",
			"    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
			"    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
			"    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
			"#endif",
			"/*--------------------------------------------------------------------------*/",
			"#if (FXAA_HLSL_5 == 1)",
			"    #define FxaaInt2 int2",
			"    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
			"    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
			"    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
			"    #define FxaaTexAlpha4(t, p) t.tex.GatherAlpha(t.smpl, p)",
			"    #define FxaaTexOffAlpha4(t, p, o) t.tex.GatherAlpha(t.smpl, p, o)",
			"    #define FxaaTexGreen4(t, p) t.tex.GatherGreen(t.smpl, p)",
			"    #define FxaaTexOffGreen4(t, p, o) t.tex.GatherGreen(t.smpl, p, o)",
			"#endif",
			"",
			"",
			"/*============================================================================",
			"                   GREEN AS LUMA OPTION SUPPORT FUNCTION",
			"============================================================================*/",
			"#if (FXAA_GREEN_AS_LUMA == 0)",
			"    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.w; }",
			"#else",
			"    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.y; }",
			"#endif",
			"",
			"",
			"",
			"",
			"/*============================================================================",
			"",
			"                             FXAA3 QUALITY - PC",
			"",
			"============================================================================*/",
			"#if (FXAA_PC == 1)",
			"/*--------------------------------------------------------------------------*/",
			"FxaaFloat4 FxaaPixelShader(",
			"    //",
			"    // Use noperspective interpolation here (turn off perspective interpolation).",
			"    // {xy} = center of pixel",
			"    FxaaFloat2 pos,",
			"    //",
			"    // Used only for FXAA Console, and not used on the 360 version.",
			"    // Use noperspective interpolation here (turn off perspective interpolation).",
			"    // {xy_} = upper left of pixel",
			"    // {_zw} = lower right of pixel",
			"    FxaaFloat4 fxaaConsolePosPos,",
			"    //",
			"    // Input color texture.",
			"    // {rgb_} = color in linear or perceptual color space",
			"    // if (FXAA_GREEN_AS_LUMA == 0)",
			"    //     {__a} = luma in perceptual color space (not linear)",
			"    FxaaTex tex,",
			"    //",
			"    // Only used on the optimized 360 version of FXAA Console.",
			"    // For everything but 360, just use the same input here as for \"tex\".",
			"    // For 360, same texture, just alias with a 2nd sampler.",
			"    // This sampler needs to have an exponent bias of -1.",
			"    FxaaTex fxaaConsole360TexExpBiasNegOne,",
			"    //",
			"    // Only used on the optimized 360 version of FXAA Console.",
			"    // For everything but 360, just use the same input here as for \"tex\".",
			"    // For 360, same texture, just alias with a 3nd sampler.",
			"    // This sampler needs to have an exponent bias of -2.",
			"    FxaaTex fxaaConsole360TexExpBiasNegTwo,",
			"    //",
			"    // Only used on FXAA Quality.",
			"    // This must be from a constant/uniform.",
			"    // {x_} = 1.0/screenWidthInPixels",
			"    // {_y} = 1.0/screenHeightInPixels",
			"    FxaaFloat2 fxaaQualityRcpFrame,",
			"    //",
			"    // Only used on FXAA Console.",
			"    // This must be from a constant/uniform.",
			"    // This effects sub-pixel AA quality and inversely sharpness.",
			"    //   Where N ranges between,",
			"    //     N = 0.50 (default)",
			"    //     N = 0.33 (sharper)",
			"    // {x__} = -N/screenWidthInPixels",
			"    // {_y_} = -N/screenHeightInPixels",
			"    // {_z_} =  N/screenWidthInPixels",
			"    // {__w} =  N/screenHeightInPixels",
			"    FxaaFloat4 fxaaConsoleRcpFrameOpt,",
			"    //",
			"    // Only used on FXAA Console.",
			"    // Not used on 360, but used on PS3 and PC.",
			"    // This must be from a constant/uniform.",
			"    // {x__} = -2.0/screenWidthInPixels",
			"    // {_y_} = -2.0/screenHeightInPixels",
			"    // {_z_} =  2.0/screenWidthInPixels",
			"    // {__w} =  2.0/screenHeightInPixels",
			"    FxaaFloat4 fxaaConsoleRcpFrameOpt2,",
			"    //",
			"    // Only used on FXAA Console.",
			"    // Only used on 360 in place of fxaaConsoleRcpFrameOpt2.",
			"    // This must be from a constant/uniform.",
			"    // {x__} =  8.0/screenWidthInPixels",
			"    // {_y_} =  8.0/screenHeightInPixels",
			"    // {_z_} = -4.0/screenWidthInPixels",
			"    // {__w} = -4.0/screenHeightInPixels",
			"    FxaaFloat4 fxaaConsole360RcpFrameOpt2,",
			"    //",
			"    // Only used on FXAA Quality.",
			"    // This used to be the FXAA_QUALITY_SUBPIX define.",
			"    // It is here now to allow easier tuning.",
			"    // Choose the amount of sub-pixel aliasing removal.",
			"    // This can effect sharpness.",
			"    //   1.00 - upper limit (softer)",
			"    //   0.75 - default amount of filtering",
			"    //   0.50 - lower limit (sharper, less sub-pixel aliasing removal)",
			"    //   0.25 - almost off",
			"    //   0.00 - completely off",
			"    FxaaFloat fxaaQualitySubpix,",
			"    //",
			"    // Only used on FXAA Quality.",
			"    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD define.",
			"    // It is here now to allow easier tuning.",
			"    // The minimum amount of local contrast required to apply algorithm.",
			"    //   0.333 - too little (faster)",
			"    //   0.250 - low quality",
			"    //   0.166 - default",
			"    //   0.125 - high quality",
			"    //   0.063 - overkill (slower)",
			"    FxaaFloat fxaaQualityEdgeThreshold,",
			"    //",
			"    // Only used on FXAA Quality.",
			"    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD_MIN define.",
			"    // It is here now to allow easier tuning.",
			"    // Trims the algorithm from processing darks.",
			"    //   0.0833 - upper limit (default, the start of visible unfiltered edges)",
			"    //   0.0625 - high quality (faster)",
			"    //   0.0312 - visible limit (slower)",
			"    // Special notes when using FXAA_GREEN_AS_LUMA,",
			"    //   Likely want to set this to zero.",
			"    //   As colors that are mostly not-green",
			"    //   will appear very dark in the green channel!",
			"    //   Tune by looking at mostly non-green content,",
			"    //   then start at zero and increase until aliasing is a problem.",
			"    FxaaFloat fxaaQualityEdgeThresholdMin,",
			"    //",
			"    // Only used on FXAA Console.",
			"    // This used to be the FXAA_CONSOLE_EDGE_SHARPNESS define.",
			"    // It is here now to allow easier tuning.",
			"    // This does not effect PS3, as this needs to be compiled in.",
			"    //   Use FXAA_CONSOLE_PS3_EDGE_SHARPNESS for PS3.",
			"    //   Due to the PS3 being ALU bound,",
			"    //   there are only three safe values here: 2 and 4 and 8.",
			"    //   These options use the shaders ability to a free *|/ by 2|4|8.",
			"    // For all other platforms can be a non-power of two.",
			"    //   8.0 is sharper (default!!!)",
			"    //   4.0 is softer",
			"    //   2.0 is really soft (good only for vector graphics inputs)",
			"    FxaaFloat fxaaConsoleEdgeSharpness,",
			"    //",
			"    // Only used on FXAA Console.",
			"    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD define.",
			"    // It is here now to allow easier tuning.",
			"    // This does not effect PS3, as this needs to be compiled in.",
			"    //   Use FXAA_CONSOLE_PS3_EDGE_THRESHOLD for PS3.",
			"    //   Due to the PS3 being ALU bound,",
			"    //   there are only two safe values here: 1/4 and 1/8.",
			"    //   These options use the shaders ability to a free *|/ by 2|4|8.",
			"    // The console setting has a different mapping than the quality setting.",
			"    // Other platforms can use other values.",
			"    //   0.125 leaves less aliasing, but is softer (default!!!)",
			"    //   0.25 leaves more aliasing, and is sharper",
			"    FxaaFloat fxaaConsoleEdgeThreshold,",
			"    //",
			"    // Only used on FXAA Console.",
			"    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD_MIN define.",
			"    // It is here now to allow easier tuning.",
			"    // Trims the algorithm from processing darks.",
			"    // The console setting has a different mapping than the quality setting.",
			"    // This only applies when FXAA_EARLY_EXIT is 1.",
			"    // This does not apply to PS3,",
			"    // PS3 was simplified to avoid more shader instructions.",
			"    //   0.06 - faster but more aliasing in darks",
			"    //   0.05 - default",
			"    //   0.04 - slower and less aliasing in darks",
			"    // Special notes when using FXAA_GREEN_AS_LUMA,",
			"    //   Likely want to set this to zero.",
			"    //   As colors that are mostly not-green",
			"    //   will appear very dark in the green channel!",
			"    //   Tune by looking at mostly non-green content,",
			"    //   then start at zero and increase until aliasing is a problem.",
			"    FxaaFloat fxaaConsoleEdgeThresholdMin,",
			"    //",
			"    // Extra constants for 360 FXAA Console only.",
			"    // Use zeros or anything else for other platforms.",
			"    // These must be in physical constant registers and NOT immediates.",
			"    // Immediates will result in compiler un-optimizing.",
			"    // {xyzw} = float4(1.0, -1.0, 0.25, -0.25)",
			"    FxaaFloat4 fxaaConsole360ConstDir",
			") {",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat2 posM;",
			"    posM.x = pos.x;",
			"    posM.y = pos.y;",
			"    #if (FXAA_GATHER4_ALPHA == 1)",
			"        #if (FXAA_DISCARD == 0)",
			"            FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
			"            #if (FXAA_GREEN_AS_LUMA == 0)",
			"                #define lumaM rgbyM.w",
			"            #else",
			"                #define lumaM rgbyM.y",
			"            #endif",
			"        #endif",
			"        #if (FXAA_GREEN_AS_LUMA == 0)",
			"            FxaaFloat4 luma4A = FxaaTexAlpha4(tex, posM);",
			"            FxaaFloat4 luma4B = FxaaTexOffAlpha4(tex, posM, FxaaInt2(-1, -1));",
			"        #else",
			"            FxaaFloat4 luma4A = FxaaTexGreen4(tex, posM);",
			"            FxaaFloat4 luma4B = FxaaTexOffGreen4(tex, posM, FxaaInt2(-1, -1));",
			"        #endif",
			"        #if (FXAA_DISCARD == 1)",
			"            #define lumaM luma4A.w",
			"        #endif",
			"        #define lumaE luma4A.z",
			"        #define lumaS luma4A.x",
			"        #define lumaSE luma4A.y",
			"        #define lumaNW luma4B.w",
			"        #define lumaN luma4B.z",
			"        #define lumaW luma4B.x",
			"    #else",
			"        FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
			"        #if (FXAA_GREEN_AS_LUMA == 0)",
			"            #define lumaM rgbyM.w",
			"        #else",
			"            #define lumaM rgbyM.y",
			"        #endif",
			"        #if (FXAA_GLSL_100 == 1)",
			"          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0, 1.0), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 0.0), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0,-1.0), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 0.0), fxaaQualityRcpFrame.xy));",
			"        #else",
			"          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0, 1), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 0), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0,-1), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 0), fxaaQualityRcpFrame.xy));",
			"        #endif",
			"    #endif",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat maxSM = max(lumaS, lumaM);",
			"    FxaaFloat minSM = min(lumaS, lumaM);",
			"    FxaaFloat maxESM = max(lumaE, maxSM);",
			"    FxaaFloat minESM = min(lumaE, minSM);",
			"    FxaaFloat maxWN = max(lumaN, lumaW);",
			"    FxaaFloat minWN = min(lumaN, lumaW);",
			"    FxaaFloat rangeMax = max(maxWN, maxESM);",
			"    FxaaFloat rangeMin = min(minWN, minESM);",
			"    FxaaFloat rangeMaxScaled = rangeMax * fxaaQualityEdgeThreshold;",
			"    FxaaFloat range = rangeMax - rangeMin;",
			"    FxaaFloat rangeMaxClamped = max(fxaaQualityEdgeThresholdMin, rangeMaxScaled);",
			"    FxaaBool earlyExit = range < rangeMaxClamped;",
			"/*--------------------------------------------------------------------------*/",
			"    if(earlyExit)",
			"        #if (FXAA_DISCARD == 1)",
			"            FxaaDiscard;",
			"        #else",
			"            return rgbyM;",
			"        #endif",
			"/*--------------------------------------------------------------------------*/",
			"    #if (FXAA_GATHER4_ALPHA == 0)",
			"        #if (FXAA_GLSL_100 == 1)",
			"          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0,-1.0), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 1.0), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0,-1.0), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 1.0), fxaaQualityRcpFrame.xy));",
			"        #else",
			"          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1,-1), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 1), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1,-1), fxaaQualityRcpFrame.xy));",
			"          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
			"        #endif",
			"    #else",
			"        FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(1, -1), fxaaQualityRcpFrame.xy));",
			"        FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
			"    #endif",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat lumaNS = lumaN + lumaS;",
			"    FxaaFloat lumaWE = lumaW + lumaE;",
			"    FxaaFloat subpixRcpRange = 1.0/range;",
			"    FxaaFloat subpixNSWE = lumaNS + lumaWE;",
			"    FxaaFloat edgeHorz1 = (-2.0 * lumaM) + lumaNS;",
			"    FxaaFloat edgeVert1 = (-2.0 * lumaM) + lumaWE;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat lumaNESE = lumaNE + lumaSE;",
			"    FxaaFloat lumaNWNE = lumaNW + lumaNE;",
			"    FxaaFloat edgeHorz2 = (-2.0 * lumaE) + lumaNESE;",
			"    FxaaFloat edgeVert2 = (-2.0 * lumaN) + lumaNWNE;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat lumaNWSW = lumaNW + lumaSW;",
			"    FxaaFloat lumaSWSE = lumaSW + lumaSE;",
			"    FxaaFloat edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);",
			"    FxaaFloat edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);",
			"    FxaaFloat edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;",
			"    FxaaFloat edgeVert3 = (-2.0 * lumaS) + lumaSWSE;",
			"    FxaaFloat edgeHorz = abs(edgeHorz3) + edgeHorz4;",
			"    FxaaFloat edgeVert = abs(edgeVert3) + edgeVert4;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat subpixNWSWNESE = lumaNWSW + lumaNESE;",
			"    FxaaFloat lengthSign = fxaaQualityRcpFrame.x;",
			"    FxaaBool horzSpan = edgeHorz >= edgeVert;",
			"    FxaaFloat subpixA = subpixNSWE * 2.0 + subpixNWSWNESE;",
			"/*--------------------------------------------------------------------------*/",
			"    if(!horzSpan) lumaN = lumaW;",
			"    if(!horzSpan) lumaS = lumaE;",
			"    if(horzSpan) lengthSign = fxaaQualityRcpFrame.y;",
			"    FxaaFloat subpixB = (subpixA * (1.0/12.0)) - lumaM;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat gradientN = lumaN - lumaM;",
			"    FxaaFloat gradientS = lumaS - lumaM;",
			"    FxaaFloat lumaNN = lumaN + lumaM;",
			"    FxaaFloat lumaSS = lumaS + lumaM;",
			"    FxaaBool pairN = abs(gradientN) >= abs(gradientS);",
			"    FxaaFloat gradient = max(abs(gradientN), abs(gradientS));",
			"    if(pairN) lengthSign = -lengthSign;",
			"    FxaaFloat subpixC = FxaaSat(abs(subpixB) * subpixRcpRange);",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat2 posB;",
			"    posB.x = posM.x;",
			"    posB.y = posM.y;",
			"    FxaaFloat2 offNP;",
			"    offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;",
			"    offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;",
			"    if(!horzSpan) posB.x += lengthSign * 0.5;",
			"    if( horzSpan) posB.y += lengthSign * 0.5;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat2 posN;",
			"    posN.x = posB.x - offNP.x * FXAA_QUALITY_P0;",
			"    posN.y = posB.y - offNP.y * FXAA_QUALITY_P0;",
			"    FxaaFloat2 posP;",
			"    posP.x = posB.x + offNP.x * FXAA_QUALITY_P0;",
			"    posP.y = posB.y + offNP.y * FXAA_QUALITY_P0;",
			"    FxaaFloat subpixD = ((-2.0)*subpixC) + 3.0;",
			"    FxaaFloat lumaEndN = FxaaLuma(FxaaTexTop(tex, posN));",
			"    FxaaFloat subpixE = subpixC * subpixC;",
			"    FxaaFloat lumaEndP = FxaaLuma(FxaaTexTop(tex, posP));",
			"/*--------------------------------------------------------------------------*/",
			"    if(!pairN) lumaNN = lumaSS;",
			"    FxaaFloat gradientScaled = gradient * 1.0/4.0;",
			"    FxaaFloat lumaMM = lumaM - lumaNN * 0.5;",
			"    FxaaFloat subpixF = subpixD * subpixE;",
			"    FxaaBool lumaMLTZero = lumaMM < 0.0;",
			"/*--------------------------------------------------------------------------*/",
			"    lumaEndN -= lumaNN * 0.5;",
			"    lumaEndP -= lumaNN * 0.5;",
			"    FxaaBool doneN = abs(lumaEndN) >= gradientScaled;",
			"    FxaaBool doneP = abs(lumaEndP) >= gradientScaled;",
			"    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P1;",
			"    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P1;",
			"    FxaaBool doneNP = (!doneN) || (!doneP);",
			"    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P1;",
			"    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P1;",
			"/*--------------------------------------------------------------------------*/",
			"    if(doneNP) {",
			"        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"        doneN = abs(lumaEndN) >= gradientScaled;",
			"        doneP = abs(lumaEndP) >= gradientScaled;",
			"        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P2;",
			"        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P2;",
			"        doneNP = (!doneN) || (!doneP);",
			"        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P2;",
			"        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P2;",
			"/*--------------------------------------------------------------------------*/",
			"        #if (FXAA_QUALITY_PS > 3)",
			"        if(doneNP) {",
			"            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"            doneN = abs(lumaEndN) >= gradientScaled;",
			"            doneP = abs(lumaEndP) >= gradientScaled;",
			"            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P3;",
			"            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P3;",
			"            doneNP = (!doneN) || (!doneP);",
			"            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P3;",
			"            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P3;",
			"/*--------------------------------------------------------------------------*/",
			"            #if (FXAA_QUALITY_PS > 4)",
			"            if(doneNP) {",
			"                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"                doneN = abs(lumaEndN) >= gradientScaled;",
			"                doneP = abs(lumaEndP) >= gradientScaled;",
			"                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P4;",
			"                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P4;",
			"                doneNP = (!doneN) || (!doneP);",
			"                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P4;",
			"                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P4;",
			"/*--------------------------------------------------------------------------*/",
			"                #if (FXAA_QUALITY_PS > 5)",
			"                if(doneNP) {",
			"                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"                    doneN = abs(lumaEndN) >= gradientScaled;",
			"                    doneP = abs(lumaEndP) >= gradientScaled;",
			"                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P5;",
			"                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P5;",
			"                    doneNP = (!doneN) || (!doneP);",
			"                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P5;",
			"                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P5;",
			"/*--------------------------------------------------------------------------*/",
			"                    #if (FXAA_QUALITY_PS > 6)",
			"                    if(doneNP) {",
			"                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"                        doneN = abs(lumaEndN) >= gradientScaled;",
			"                        doneP = abs(lumaEndP) >= gradientScaled;",
			"                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P6;",
			"                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P6;",
			"                        doneNP = (!doneN) || (!doneP);",
			"                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P6;",
			"                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P6;",
			"/*--------------------------------------------------------------------------*/",
			"                        #if (FXAA_QUALITY_PS > 7)",
			"                        if(doneNP) {",
			"                            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"                            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"                            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"                            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"                            doneN = abs(lumaEndN) >= gradientScaled;",
			"                            doneP = abs(lumaEndP) >= gradientScaled;",
			"                            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P7;",
			"                            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P7;",
			"                            doneNP = (!doneN) || (!doneP);",
			"                            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P7;",
			"                            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P7;",
			"/*--------------------------------------------------------------------------*/",
			"    #if (FXAA_QUALITY_PS > 8)",
			"    if(doneNP) {",
			"        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"        doneN = abs(lumaEndN) >= gradientScaled;",
			"        doneP = abs(lumaEndP) >= gradientScaled;",
			"        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P8;",
			"        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P8;",
			"        doneNP = (!doneN) || (!doneP);",
			"        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P8;",
			"        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P8;",
			"/*--------------------------------------------------------------------------*/",
			"        #if (FXAA_QUALITY_PS > 9)",
			"        if(doneNP) {",
			"            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"            doneN = abs(lumaEndN) >= gradientScaled;",
			"            doneP = abs(lumaEndP) >= gradientScaled;",
			"            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P9;",
			"            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P9;",
			"            doneNP = (!doneN) || (!doneP);",
			"            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P9;",
			"            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P9;",
			"/*--------------------------------------------------------------------------*/",
			"            #if (FXAA_QUALITY_PS > 10)",
			"            if(doneNP) {",
			"                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"                doneN = abs(lumaEndN) >= gradientScaled;",
			"                doneP = abs(lumaEndP) >= gradientScaled;",
			"                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P10;",
			"                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P10;",
			"                doneNP = (!doneN) || (!doneP);",
			"                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P10;",
			"                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P10;",
			"/*--------------------------------------------------------------------------*/",
			"                #if (FXAA_QUALITY_PS > 11)",
			"                if(doneNP) {",
			"                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"                    doneN = abs(lumaEndN) >= gradientScaled;",
			"                    doneP = abs(lumaEndP) >= gradientScaled;",
			"                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P11;",
			"                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P11;",
			"                    doneNP = (!doneN) || (!doneP);",
			"                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P11;",
			"                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P11;",
			"/*--------------------------------------------------------------------------*/",
			"                    #if (FXAA_QUALITY_PS > 12)",
			"                    if(doneNP) {",
			"                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
			"                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
			"                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
			"                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
			"                        doneN = abs(lumaEndN) >= gradientScaled;",
			"                        doneP = abs(lumaEndP) >= gradientScaled;",
			"                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P12;",
			"                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P12;",
			"                        doneNP = (!doneN) || (!doneP);",
			"                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P12;",
			"                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P12;",
			"/*--------------------------------------------------------------------------*/",
			"                    }",
			"                    #endif",
			"/*--------------------------------------------------------------------------*/",
			"                }",
			"                #endif",
			"/*--------------------------------------------------------------------------*/",
			"            }",
			"            #endif",
			"/*--------------------------------------------------------------------------*/",
			"        }",
			"        #endif",
			"/*--------------------------------------------------------------------------*/",
			"    }",
			"    #endif",
			"/*--------------------------------------------------------------------------*/",
			"                        }",
			"                        #endif",
			"/*--------------------------------------------------------------------------*/",
			"                    }",
			"                    #endif",
			"/*--------------------------------------------------------------------------*/",
			"                }",
			"                #endif",
			"/*--------------------------------------------------------------------------*/",
			"            }",
			"            #endif",
			"/*--------------------------------------------------------------------------*/",
			"        }",
			"        #endif",
			"/*--------------------------------------------------------------------------*/",
			"    }",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat dstN = posM.x - posN.x;",
			"    FxaaFloat dstP = posP.x - posM.x;",
			"    if(!horzSpan) dstN = posM.y - posN.y;",
			"    if(!horzSpan) dstP = posP.y - posM.y;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaBool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;",
			"    FxaaFloat spanLength = (dstP + dstN);",
			"    FxaaBool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;",
			"    FxaaFloat spanLengthRcp = 1.0/spanLength;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaBool directionN = dstN < dstP;",
			"    FxaaFloat dst = min(dstN, dstP);",
			"    FxaaBool goodSpan = directionN ? goodSpanN : goodSpanP;",
			"    FxaaFloat subpixG = subpixF * subpixF;",
			"    FxaaFloat pixelOffset = (dst * (-spanLengthRcp)) + 0.5;",
			"    FxaaFloat subpixH = subpixG * fxaaQualitySubpix;",
			"/*--------------------------------------------------------------------------*/",
			"    FxaaFloat pixelOffsetGood = goodSpan ? pixelOffset : 0.0;",
			"    FxaaFloat pixelOffsetSubpix = max(pixelOffsetGood, subpixH);",
			"    if(!horzSpan) posM.x += pixelOffsetSubpix * lengthSign;",
			"    if( horzSpan) posM.y += pixelOffsetSubpix * lengthSign;",
			"    #if (FXAA_DISCARD == 1)",
			"        return FxaaTexTop(tex, posM);",
			"    #else",
			"        return FxaaFloat4(FxaaTexTop(tex, posM).xyz, lumaM);",
			"    #endif",
			"}",
			"/*==========================================================================*/",
			"#endif",
			"",
			"void main() {",
			"  gl_FragColor = FxaaPixelShader(",
			"    vUv,",
			"    vec4(0.0),",
			"    tDiffuse,",
			"    tDiffuse,",
			"    tDiffuse,",
			"    resolution,",
			"    vec4(0.0),",
			"    vec4(0.0),",
			"    vec4(0.0),",
			"    0.75,",
			"    0.166,",
			"    0.0833,",
			"    0.0,",
			"    0.0,",
			"    0.0,",
			"    vec4(0.0)",
			"  );",
			"",
			"  // TODO avoid querying texture twice for same texel",
			"  gl_FragColor.a = texture2D(tDiffuse, vUv).a;",
			"}"
		].join( "\n" )

	};
	
	return THREE.FXAAShader;
});

define('skylark-threejs-ex/shaders/SSAOShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * References:
	 * http://john-chapman-graphics.blogspot.com/2013/01/ssao-tutorial.html
	 * https://learnopengl.com/Advanced-Lighting/SSAO
	 * https://github.com/McNopper/OpenGL/blob/master/Example28/shader/ssao.frag.glsl
	 */

	THREE.SSAOShader = {

		defines: {
			"PERSPECTIVE_CAMERA": 1,
			"KERNEL_SIZE": 32
		},

		uniforms: {

			"tDiffuse": { value: null },
			"tNormal": { value: null },
			"tDepth": { value: null },
			"tNoise": { value: null },
			"kernel": { value: null },
			"cameraNear": { value: null },
			"cameraFar": { value: null },
			"resolution": { value: new THREE.Vector2() },
			"cameraProjectionMatrix": { value: new THREE.Matrix4() },
			"cameraInverseProjectionMatrix": { value: new THREE.Matrix4() },
			"kernelRadius": { value: 8 },
			"minDistance": { value: 0.005 },
			"maxDistance": { value: 0.05 },

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tNormal;",
			"uniform sampler2D tDepth;",
			"uniform sampler2D tNoise;",

			"uniform vec3 kernel[ KERNEL_SIZE ];",

			"uniform vec2 resolution;",

			"uniform float cameraNear;",
			"uniform float cameraFar;",
			"uniform mat4 cameraProjectionMatrix;",
			"uniform mat4 cameraInverseProjectionMatrix;",

			"uniform float kernelRadius;",
			"uniform float minDistance;", // avoid artifacts caused by neighbour fragments with minimal depth difference
			"uniform float maxDistance;", // avoid the influence of fragments which are too far away

			"varying vec2 vUv;",

			"#include <packing>",

			"float getDepth( const in vec2 screenPosition ) {",

			"	return texture2D( tDepth, screenPosition ).x;",

			"}",

			"float getLinearDepth( const in vec2 screenPosition ) {",

			"	#if PERSPECTIVE_CAMERA == 1",

			"		float fragCoordZ = texture2D( tDepth, screenPosition ).x;",
			"		float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );",
			"		return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );",

			"	#else",

			"		return texture2D( depthSampler, coord ).x;",

			"	#endif",

			"}",

			"float getViewZ( const in float depth ) {",

			"	#if PERSPECTIVE_CAMERA == 1",

			"		return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",

			"	#else",

			"		return orthographicDepthToViewZ( depth, cameraNear, cameraFar );",

			"	#endif",

			"}",

			"vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {",

			"	float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];",

			"	vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );",

			"	clipPosition *= clipW; // unprojection.",

			"	return ( cameraInverseProjectionMatrix * clipPosition ).xyz;",

			"}",

			"vec3 getViewNormal( const in vec2 screenPosition ) {",

			"	return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );",

			"}",

			"void main() {",

			"	float depth = getDepth( vUv );",
			"	float viewZ = getViewZ( depth );",

			"	vec3 viewPosition = getViewPosition( vUv, depth, viewZ );",
			"	vec3 viewNormal = getViewNormal( vUv );",

			" vec2 noiseScale = vec2( resolution.x / 4.0, resolution.y / 4.0 );",
			"	vec3 random = texture2D( tNoise, vUv * noiseScale ).xyz;",

			// compute matrix used to reorient a kernel vector

			"	vec3 tangent = normalize( random - viewNormal * dot( random, viewNormal ) );",
			"	vec3 bitangent = cross( viewNormal, tangent );",
			"	mat3 kernelMatrix = mat3( tangent, bitangent, viewNormal );",

			" float occlusion = 0.0;",

			" for ( int i = 0; i < KERNEL_SIZE; i ++ ) {",

			"		vec3 sampleVector = kernelMatrix * kernel[ i ];", // reorient sample vector in view space
			"		vec3 samplePoint = viewPosition + ( sampleVector * kernelRadius );", // calculate sample point

			"		vec4 samplePointNDC = cameraProjectionMatrix * vec4( samplePoint, 1.0 );", // project point and calculate NDC
			"		samplePointNDC /= samplePointNDC.w;",

			"		vec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5;", // compute uv coordinates

			"		float realDepth = getLinearDepth( samplePointUv );", // get linear depth from depth texture
			"		float sampleDepth = viewZToOrthographicDepth( samplePoint.z, cameraNear, cameraFar );", // compute linear depth of the sample view Z value
			"		float delta = sampleDepth - realDepth;",

			"		if ( delta > minDistance && delta < maxDistance ) {", // if fragment is before sample point, increase occlusion

			"			occlusion += 1.0;",

			"		}",

			"	}",

			"	occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );",

			"	gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );",

			"}"

		].join( "\n" )

	};

	THREE.SSAODepthShader = {

		defines: {
			"PERSPECTIVE_CAMERA": 1
		},

		uniforms: {

			"tDepth": { value: null },
			"cameraNear": { value: null },
			"cameraFar": { value: null },

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tDepth;",

			"uniform float cameraNear;",
			"uniform float cameraFar;",

			"varying vec2 vUv;",

			"#include <packing>",

			"float getLinearDepth( const in vec2 screenPosition ) {",

			"	#if PERSPECTIVE_CAMERA == 1",

			"		float fragCoordZ = texture2D( tDepth, screenPosition ).x;",
			"		float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );",
			"		return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );",

			"	#else",

			"		return texture2D( depthSampler, coord ).x;",

			"	#endif",

			"}",

			"void main() {",

			"	float depth = getLinearDepth( vUv );",
			"	gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );",

			"}"

		].join( "\n" )

	};

	THREE.SSAOBlurShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"resolution": { value: new THREE.Vector2() }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",

			"uniform vec2 resolution;",

			"varying vec2 vUv;",

			"void main() {",

			"	vec2 texelSize = ( 1.0 / resolution );",
			"	float result = 0.0;",

			"	for ( int i = - 2; i <= 2; i ++ ) {",

			"		for ( int j = - 2; j <= 2; j ++ ) {",

			"			vec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;",
			"			result += texture2D( tDiffuse, vUv + offset ).r;",

			"		}",

			"	}",

			"	gl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );",

			"}"

		].join( "\n" )

	};
	
	return THREE.SSAOShader;
});

define('skylark-threejs-ex/shaders/FilmShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Film grain & scanlines shader
	 *
	 * - ported from HLSL to WebGL / GLSL
	 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
	 *
	 * Screen Space Static Postprocessor
	 *
	 * Produces an analogue noise overlay similar to a film grain / TV static
	 *
	 * Original implementation and noise algorithm
	 * Pat 'Hawthorne' Shearon
	 *
	 * Optimized scanlines + noise version with intensity scaling
	 * Georg 'Leviathan' Steinrohder
	 *
	 * This version is provided under a Creative Commons Attribution 3.0 License
	 * http://creativecommons.org/licenses/by/3.0/
	 */

	THREE.FilmShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"time": { value: 0.0 },
			"nIntensity": { value: 0.5 },
			"sIntensity": { value: 0.05 },
			"sCount": { value: 4096 },
			"grayscale": { value: 1 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"#include <common>",

			// control parameter
			"uniform float time;",

			"uniform bool grayscale;",

			// noise effect intensity value (0 = no effect, 1 = full effect)
			"uniform float nIntensity;",

			// scanlines effect intensity value (0 = no effect, 1 = full effect)
			"uniform float sIntensity;",

			// scanlines effect count value (0 = no effect, 4096 = full effect)
			"uniform float sCount;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

			// sample the source
			"	vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

			// make some noise
			"	float dx = rand( vUv + time );",

			// add noise
			"	vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );",

			// get us a sine and cosine
			"	vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

			// add scanlines
			"	cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"	cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			"	if( grayscale ) {",

			"		cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			"	}",

			"	gl_FragColor =  vec4( cResult, cTextureScreen.a );",

			"}"

		].join( "\n" )

	};
	
	return THREE.FilmShader;
});

define('skylark-threejs-ex/shaders/DotScreenShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Dot screen shader
	 * based on glfx.js sepia shader
	 * https://github.com/evanw/glfx.js
	 */

	THREE.DotScreenShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"tSize": { value: new THREE.Vector2( 256, 256 ) },
			"center": { value: new THREE.Vector2( 0.5, 0.5 ) },
			"angle": { value: 1.57 },
			"scale": { value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec2 center;",
			"uniform float angle;",
			"uniform float scale;",
			"uniform vec2 tSize;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"float pattern() {",

			"	float s = sin( angle ), c = cos( angle );",

			"	vec2 tex = vUv * tSize - center;",
			"	vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"	return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

			"}",

			"void main() {",

			"	vec4 color = texture2D( tDiffuse, vUv );",

			"	float average = ( color.r + color.g + color.b ) / 3.0;",

			"	gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

			"}"

		].join( "\n" )

	};
	
	return THREE.DotScreenShader;
});

define('skylark-threejs-ex/shaders/LuminosityShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Luminosity
	 * http://en.wikipedia.org/wiki/Luminosity
	 */

	THREE.LuminosityShader = {

		uniforms: {

			"tDiffuse": { value: null }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"#include <common>",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

			"	vec4 texel = texture2D( tDiffuse, vUv );",

			"	float l = linearToRelativeLuminance( texel.rgb );",

			"	gl_FragColor = vec4( l, l, l, texel.w );",

			"}"

		].join( "\n" )

	};
	
	return THREE.LuminosityShader;
});
define('skylark-threejs-ex/shaders/SobelOperatorShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Sobel Edge Detection (see https://youtu.be/uihBwtPIBxM)
	 *
	 * As mentioned in the video the Sobel operator expects a grayscale image as input.
	 *
	 */

	THREE.SobelOperatorShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"resolution": { value: new THREE.Vector2() }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform vec2 resolution;",
			"varying vec2 vUv;",

			"void main() {",

			"	vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );",

			// kernel definition (in glsl matrices are filled in column-major order)

			"	const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );", // x direction kernel
			"	const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );", // y direction kernel

			// fetch the 3x3 neighbourhood of a fragment

			// first column

			"	float tx0y0 = texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) ).r;",
			"	float tx0y1 = texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) ).r;",
			"	float tx0y2 = texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) ).r;",

			// second column

			"	float tx1y0 = texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) ).r;",
			"	float tx1y1 = texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).r;",
			"	float tx1y2 = texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) ).r;",

			// third column

			"	float tx2y0 = texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) ).r;",
			"	float tx2y1 = texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) ).r;",
			"	float tx2y2 = texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) ).r;",

			// gradient value in x direction

			"	float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 + ",
			"		Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 + ",
			"		Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2; ",

			// gradient value in y direction

			"	float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 + ",
			"		Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 + ",
			"		Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2; ",

			// magnitute of the total gradient

			"	float G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );",

			"	gl_FragColor = vec4( vec3( G ), 1 );",

			"}"

		].join( "\n" )

	};
	
	return THREE.SobelOperatorShader;
});

define('skylark-threejs-ex/shaders/ColorifyShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Colorify shader
	 */

	THREE.ColorifyShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"color": { value: new THREE.Color( 0xffffff ) }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 color;",
			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

			"	vec4 texel = texture2D( tDiffuse, vUv );",

			"	vec3 luma = vec3( 0.299, 0.587, 0.114 );",
			"	float v = dot( texel.xyz, luma );",

			"	gl_FragColor = vec4( v * color, texel.w );",

			"}"

		].join( "\n" )

	};
	
	return THREE.ColorifyShader;
});

define('skylark-threejs-ex/shaders/ToneMapShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author miibond
	 *
	 * Full-screen tone-mapping shader based on http://www.cis.rit.edu/people/faculty/ferwerda/publications/sig02_paper.pdf
	 */

	THREE.ToneMapShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"averageLuminance": { value: 1.0 },
			"luminanceMap": { value: null },
			"maxLuminance": { value: 16.0 },
			"minLuminance": { value: 0.01 },
			"middleGrey": { value: 0.6 }
		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"#include <common>",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"uniform float middleGrey;",
			"uniform float minLuminance;",
			"uniform float maxLuminance;",
			"#ifdef ADAPTED_LUMINANCE",
			"	uniform sampler2D luminanceMap;",
			"#else",
			"	uniform float averageLuminance;",
			"#endif",

			"vec3 ToneMap( vec3 vColor ) {",
			"	#ifdef ADAPTED_LUMINANCE",
			// Get the calculated average luminance
			"		float fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;",
			"	#else",
			"		float fLumAvg = averageLuminance;",
			"	#endif",

			// Calculate the luminance of the current pixel
			"	float fLumPixel = linearToRelativeLuminance( vColor );",

			// Apply the modified operator (Eq. 4)
			"	float fLumScaled = (fLumPixel * middleGrey) / max( minLuminance, fLumAvg );",

			"	float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);",
			"	return fLumCompressed * vColor;",
			"}",

			"void main() {",

			"	vec4 texel = texture2D( tDiffuse, vUv );",

			"	gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );",

			"}"

		].join( "\n" )

	};
	
	return THREE.ToneMapShader;
});

define('skylark-threejs-ex/shaders/TechnicolorShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author flimshaw / http://charliehoey.com
	 *
	 * Technicolor Shader
	 * Simulates the look of the two-strip technicolor process popular in early 20th century films.
	 * More historical info here: http://www.widescreenmuseum.com/oldcolor/technicolor1.htm
	 * Demo here: http://charliehoey.com/technicolor_shader/shader_test.html
	 */

	THREE.TechnicolorShader = {

		uniforms: {

			"tDiffuse": { value: null }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"varying vec2 vUv;",

			"void main() {",

			"	vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",
			"	vec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);",

			"	gl_FragColor = newTex;",

			"}"

		].join( "\n" )

	};
	
	return THREE.TechnicolorShader;
});

define('skylark-threejs-ex/shaders/HueSaturationShader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author tapio / http://tapio.github.com/
	 *
	 * Hue and saturation adjustment
	 * https://github.com/evanw/glfx.js
	 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
	 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
	 */

	THREE.HueSaturationShader = {

		uniforms: {

			"tDiffuse": { value: null },
			"hue": { value: 0 },
			"saturation": { value: 0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float hue;",
			"uniform float saturation;",

			"varying vec2 vUv;",

			"void main() {",

			"	gl_FragColor = texture2D( tDiffuse, vUv );",

			// hue
			"	float angle = hue * 3.14159265;",
			"	float s = sin(angle), c = cos(angle);",
			"	vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
			"	float len = length(gl_FragColor.rgb);",
			"	gl_FragColor.rgb = vec3(",
			"		dot(gl_FragColor.rgb, weights.xyz),",
			"		dot(gl_FragColor.rgb, weights.zxy),",
			"		dot(gl_FragColor.rgb, weights.yzx)",
			"	);",

			// saturation
			"	float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;",
			"	if (saturation > 0.0) {",
			"		gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));",
			"	} else {",
			"		gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);",
			"	}",

			"}"

		].join( "\n" )

	};
	
	return THREE.HueSaturationShader;
});

define('skylark-threejs-ex/postprocessing/Pass',[
	"skylark-threejs"
],function(THREE){
	THREE.Pass = function () {

		// if set to true, the pass is processed by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;

	};

	Object.assign( THREE.Pass.prototype, {

		setSize: function ( /* width, height */ ) {},

		render: function ( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

			console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

		}

	} );

	// Helper for passes that need to fill the viewport with a single quad.
	THREE.Pass.FullScreenQuad = ( function () {

		var camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

		var FullScreenQuad = function ( material ) {

			this._mesh = new THREE.Mesh( geometry, material );

		};

		Object.defineProperty( FullScreenQuad.prototype, 'material', {

			get: function () {

				return this._mesh.material;

			},

			set: function ( value ) {

				this._mesh.material = value;

			}

		} );

		Object.assign( FullScreenQuad.prototype, {

			dispose: function () {

				this._mesh.geometry.dispose();

			},

			render: function ( renderer ) {

				renderer.render( this._mesh, camera );

			}

		} );

		return FullScreenQuad;

	} )();

	return THREE.Pass;
});
define('skylark-threejs-ex/postprocessing/ShaderPass',[
	"skylark-threejs",
	"./Pass"
],function(THREE){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	THREE.ShaderPass = function ( shader, textureID ) {

		THREE.Pass.call( this );

		this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

		if ( shader instanceof THREE.ShaderMaterial ) {

			this.uniforms = shader.uniforms;

			this.material = shader;

		} else if ( shader ) {

			this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

			this.material = new THREE.ShaderMaterial( {

				defines: Object.assign( {}, shader.defines ),
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader

			} );

		}

		this.fsQuad = new THREE.Pass.FullScreenQuad( this.material );

	};

	THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

		constructor: THREE.ShaderPass,

		render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

			if ( this.uniforms[ this.textureID ] ) {

				this.uniforms[ this.textureID ].value = readBuffer.texture;

			}

			this.fsQuad.material = this.material;

			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.fsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( writeBuffer );
				// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
				if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
				this.fsQuad.render( renderer );

			}

		}

	} );
	
	return THREE.ShaderPass;
});

define('skylark-threejs-ex/postprocessing/MaskPass',[
	"skylark-threejs",
	"./Pass"
],function(THREE,Pass){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	THREE.MaskPass = function ( scene, camera ) {

		THREE.Pass.call( this );

		this.scene = scene;
		this.camera = camera;

		this.clear = true;
		this.needsSwap = false;

		this.inverse = false;

	};

	THREE.MaskPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

		constructor: THREE.MaskPass,

		render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

			var context = renderer.getContext();
			var state = renderer.state;

			// don't update color or depth

			state.buffers.color.setMask( false );
			state.buffers.depth.setMask( false );

			// lock buffers

			state.buffers.color.setLocked( true );
			state.buffers.depth.setLocked( true );

			// set up stencil

			var writeValue, clearValue;

			if ( this.inverse ) {

				writeValue = 0;
				clearValue = 1;

			} else {

				writeValue = 1;
				clearValue = 0;

			}

			state.buffers.stencil.setTest( true );
			state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
			state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
			state.buffers.stencil.setClear( clearValue );
			state.buffers.stencil.setLocked( true );

			// draw into the stencil buffer

			renderer.setRenderTarget( readBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.scene, this.camera );

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.scene, this.camera );

			// unlock color and depth buffer for subsequent rendering

			state.buffers.color.setLocked( false );
			state.buffers.depth.setLocked( false );

			// only render where stencil is set to 1

			state.buffers.stencil.setLocked( false );
			state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
			state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
			state.buffers.stencil.setLocked( true );

		}

	} );


	THREE.ClearMaskPass = function () {

		THREE.Pass.call( this );

		this.needsSwap = false;

	};

	THREE.ClearMaskPass.prototype = Object.create( THREE.Pass.prototype );

	Object.assign( THREE.ClearMaskPass.prototype, {

		render: function ( renderer /*, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

			renderer.state.buffers.stencil.setLocked( false );
			renderer.state.buffers.stencil.setTest( false );

		}

	} );
	
	return THREE.MaskPass;
});

define('skylark-threejs-ex/postprocessing/EffectComposer',[
	"skylark-threejs",
	"../shaders/CopyShader",
	"./ShaderPass",
	"./MaskPass"
],function(THREE){

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	THREE.EffectComposer = function ( renderer, renderTarget ) {

		this.renderer = renderer;

		if ( renderTarget === undefined ) {

			var parameters = {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat,
				stencilBuffer: false
			};

			var size = renderer.getSize( new THREE.Vector2() );
			this._pixelRatio = renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = new THREE.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, parameters );
			renderTarget.texture.name = 'EffectComposer.rt1';

		} else {

			this._pixelRatio = 1;
			this._width = renderTarget.width;
			this._height = renderTarget.height;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.renderToScreen = true;

		this.passes = [];

		// dependencies

		if ( THREE.CopyShader === undefined ) {

			console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

		}

		if ( THREE.ShaderPass === undefined ) {

			console.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );

		}

		this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

		this.clock = new THREE.Clock();

	};

	Object.assign( THREE.EffectComposer.prototype, {

		swapBuffers: function () {

			var tmp = this.readBuffer;
			this.readBuffer = this.writeBuffer;
			this.writeBuffer = tmp;

		},

		addPass: function ( pass ) {

			this.passes.push( pass );
			pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		},

		insertPass: function ( pass, index ) {

			this.passes.splice( index, 0, pass );

		},

		isLastEnabledPass: function ( passIndex ) {

			for ( var i = passIndex + 1; i < this.passes.length; i ++ ) {

				if ( this.passes[ i ].enabled ) {

					return false;

				}

			}

			return true;

		},

		render: function ( deltaTime ) {

			// deltaTime value is in seconds

			if ( deltaTime === undefined ) {

				deltaTime = this.clock.getDelta();

			}

			var currentRenderTarget = this.renderer.getRenderTarget();

			var maskActive = false;

			var pass, i, il = this.passes.length;

			for ( i = 0; i < il; i ++ ) {

				pass = this.passes[ i ];

				if ( pass.enabled === false ) continue;

				pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
				pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

				if ( pass.needsSwap ) {

					if ( maskActive ) {

						var context = this.renderer.getContext();
						var stencil = this.renderer.state.buffers.stencil;

						//context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
						stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );

						this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

						//context.stencilFunc( context.EQUAL, 1, 0xffffffff );
						stencil.setFunc( context.EQUAL, 1, 0xffffffff );

					}

					this.swapBuffers();

				}

				if ( THREE.MaskPass !== undefined ) {

					if ( pass instanceof THREE.MaskPass ) {

						maskActive = true;

					} else if ( pass instanceof THREE.ClearMaskPass ) {

						maskActive = false;

					}

				}

			}

			this.renderer.setRenderTarget( currentRenderTarget );

		},

		reset: function ( renderTarget ) {

			if ( renderTarget === undefined ) {

				var size = this.renderer.getSize( new THREE.Vector2() );
				this._pixelRatio = this.renderer.getPixelRatio();
				this._width = size.width;
				this._height = size.height;

				renderTarget = this.renderTarget1.clone();
				renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

			}

			this.renderTarget1.dispose();
			this.renderTarget2.dispose();
			this.renderTarget1 = renderTarget;
			this.renderTarget2 = renderTarget.clone();

			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;

		},

		setSize: function ( width, height ) {

			this._width = width;
			this._height = height;

			var effectiveWidth = this._width * this._pixelRatio;
			var effectiveHeight = this._height * this._pixelRatio;

			this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
			this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

			for ( var i = 0; i < this.passes.length; i ++ ) {

				this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

			}

		},

		setPixelRatio: function ( pixelRatio ) {

			this._pixelRatio = pixelRatio;

			this.setSize( this._width, this._height );

		}

	} );


	
	return THREE.EffectComposer;
});

define('skylark-threejs-ex/postprocessing/RenderPass',[
	"skylark-threejs",
	"./Pass"
],function(THREE,Pass){
	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

		THREE.Pass.call( this );

		this.scene = scene;
		this.camera = camera;

		this.overrideMaterial = overrideMaterial;

		this.clearColor = clearColor;
		this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

		this.clear = true;
		this.clearDepth = false;
		this.needsSwap = false;

	};

	THREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

		constructor: THREE.RenderPass,

		render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

			var oldAutoClear = renderer.autoClear;
			renderer.autoClear = false;

			var oldClearColor, oldClearAlpha, oldOverrideMaterial;

			if ( this.overrideMaterial !== undefined ) {

				oldOverrideMaterial = this.scene.overrideMaterial;

				this.scene.overrideMaterial = this.overrideMaterial;

			}

			if ( this.clearColor ) {

				oldClearColor = renderer.getClearColor().getHex();
				oldClearAlpha = renderer.getClearAlpha();

				renderer.setClearColor( this.clearColor, this.clearAlpha );

			}

			if ( this.clearDepth ) {

				renderer.clearDepth();

			}

			renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			renderer.render( this.scene, this.camera );

			if ( this.clearColor ) {

				renderer.setClearColor( oldClearColor, oldClearAlpha );

			}

			if ( this.overrideMaterial !== undefined ) {

				this.scene.overrideMaterial = oldOverrideMaterial;

			}

			renderer.autoClear = oldAutoClear;

		}

	} );
	
	return THREE.RenderPass;
});

define('skylark-threejs-ex/curves/NURBSUtils',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author renej
	 * NURBS utils
	 *
	 * See NURBSCurve and NURBSSurface.
	 *
	 **/


	/**************************************************************
	 *	NURBS Utils
	 **************************************************************/

	THREE.NURBSUtils = {

		/*
		Finds knot vector span.

		p : degree
		u : parametric value
		U : knot vector

		returns the span
		*/
		findSpan: function ( p, u, U ) {

			var n = U.length - p - 1;

			if ( u >= U[ n ] ) {

				return n - 1;

			}

			if ( u <= U[ p ] ) {

				return p;

			}

			var low = p;
			var high = n;
			var mid = Math.floor( ( low + high ) / 2 );

			while ( u < U[ mid ] || u >= U[ mid + 1 ] ) {

				if ( u < U[ mid ] ) {

					high = mid;

				} else {

					low = mid;

				}

				mid = Math.floor( ( low + high ) / 2 );

			}

			return mid;

		},


		/*
		Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2

		span : span in which u lies
		u    : parametric point
		p    : degree
		U    : knot vector

		returns array[p+1] with basis functions values.
		*/
		calcBasisFunctions: function ( span, u, p, U ) {

			var N = [];
			var left = [];
			var right = [];
			N[ 0 ] = 1.0;

			for ( var j = 1; j <= p; ++ j ) {

				left[ j ] = u - U[ span + 1 - j ];
				right[ j ] = U[ span + j ] - u;

				var saved = 0.0;

				for ( var r = 0; r < j; ++ r ) {

					var rv = right[ r + 1 ];
					var lv = left[ j - r ];
					var temp = N[ r ] / ( rv + lv );
					N[ r ] = saved + rv * temp;
					saved = lv * temp;

				 }

				 N[ j ] = saved;

			 }

			 return N;

		},


		/*
		Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.

		p : degree of B-Spline
		U : knot vector
		P : control points (x, y, z, w)
		u : parametric point

		returns point for given u
		*/
		calcBSplinePoint: function ( p, U, P, u ) {

			var span = this.findSpan( p, u, U );
			var N = this.calcBasisFunctions( span, u, p, U );
			var C = new THREE.Vector4( 0, 0, 0, 0 );

			for ( var j = 0; j <= p; ++ j ) {

				var point = P[ span - p + j ];
				var Nj = N[ j ];
				var wNj = point.w * Nj;
				C.x += point.x * wNj;
				C.y += point.y * wNj;
				C.z += point.z * wNj;
				C.w += point.w * Nj;

			}

			return C;

		},


		/*
		Calculate basis functions derivatives. See The NURBS Book, page 72, algorithm A2.3.

		span : span in which u lies
		u    : parametric point
		p    : degree
		n    : number of derivatives to calculate
		U    : knot vector

		returns array[n+1][p+1] with basis functions derivatives
		*/
		calcBasisFunctionDerivatives: function ( span, u, p, n, U ) {

			var zeroArr = [];
			for ( var i = 0; i <= p; ++ i )
				zeroArr[ i ] = 0.0;

			var ders = [];
			for ( var i = 0; i <= n; ++ i )
				ders[ i ] = zeroArr.slice( 0 );

			var ndu = [];
			for ( var i = 0; i <= p; ++ i )
				ndu[ i ] = zeroArr.slice( 0 );

			ndu[ 0 ][ 0 ] = 1.0;

			var left = zeroArr.slice( 0 );
			var right = zeroArr.slice( 0 );

			for ( var j = 1; j <= p; ++ j ) {

				left[ j ] = u - U[ span + 1 - j ];
				right[ j ] = U[ span + j ] - u;

				var saved = 0.0;

				for ( var r = 0; r < j; ++ r ) {

					var rv = right[ r + 1 ];
					var lv = left[ j - r ];
					ndu[ j ][ r ] = rv + lv;

					var temp = ndu[ r ][ j - 1 ] / ndu[ j ][ r ];
					ndu[ r ][ j ] = saved + rv * temp;
					saved = lv * temp;

				}

				ndu[ j ][ j ] = saved;

			}

			for ( var j = 0; j <= p; ++ j ) {

				ders[ 0 ][ j ] = ndu[ j ][ p ];

			}

			for ( var r = 0; r <= p; ++ r ) {

				var s1 = 0;
				var s2 = 1;

				var a = [];
				for ( var i = 0; i <= p; ++ i ) {

					a[ i ] = zeroArr.slice( 0 );

				}
				a[ 0 ][ 0 ] = 1.0;

				for ( var k = 1; k <= n; ++ k ) {

					var d = 0.0;
					var rk = r - k;
					var pk = p - k;

					if ( r >= k ) {

						a[ s2 ][ 0 ] = a[ s1 ][ 0 ] / ndu[ pk + 1 ][ rk ];
						d = a[ s2 ][ 0 ] * ndu[ rk ][ pk ];

					}

					var j1 = ( rk >= - 1 ) ? 1 : - rk;
					var j2 = ( r - 1 <= pk ) ? k - 1 : p - r;

					for ( var j = j1; j <= j2; ++ j ) {

						a[ s2 ][ j ] = ( a[ s1 ][ j ] - a[ s1 ][ j - 1 ] ) / ndu[ pk + 1 ][ rk + j ];
						d += a[ s2 ][ j ] * ndu[ rk + j ][ pk ];

					}

					if ( r <= pk ) {

						a[ s2 ][ k ] = - a[ s1 ][ k - 1 ] / ndu[ pk + 1 ][ r ];
						d += a[ s2 ][ k ] * ndu[ r ][ pk ];

					}

					ders[ k ][ r ] = d;

					var j = s1;
					s1 = s2;
					s2 = j;

				}

			}

			var r = p;

			for ( var k = 1; k <= n; ++ k ) {

				for ( var j = 0; j <= p; ++ j ) {

					ders[ k ][ j ] *= r;

				}
				r *= p - k;

			}

			return ders;

		},


		/*
			Calculate derivatives of a B-Spline. See The NURBS Book, page 93, algorithm A3.2.

			p  : degree
			U  : knot vector
			P  : control points
			u  : Parametric points
			nd : number of derivatives

			returns array[d+1] with derivatives
			*/
		calcBSplineDerivatives: function ( p, U, P, u, nd ) {

			var du = nd < p ? nd : p;
			var CK = [];
			var span = this.findSpan( p, u, U );
			var nders = this.calcBasisFunctionDerivatives( span, u, p, du, U );
			var Pw = [];

			for ( var i = 0; i < P.length; ++ i ) {

				var point = P[ i ].clone();
				var w = point.w;

				point.x *= w;
				point.y *= w;
				point.z *= w;

				Pw[ i ] = point;

			}
			for ( var k = 0; k <= du; ++ k ) {

				var point = Pw[ span - p ].clone().multiplyScalar( nders[ k ][ 0 ] );

				for ( var j = 1; j <= p; ++ j ) {

					point.add( Pw[ span - p + j ].clone().multiplyScalar( nders[ k ][ j ] ) );

				}

				CK[ k ] = point;

			}

			for ( var k = du + 1; k <= nd + 1; ++ k ) {

				CK[ k ] = new THREE.Vector4( 0, 0, 0 );

			}

			return CK;

		},


		/*
		Calculate "K over I"

		returns k!/(i!(k-i)!)
		*/
		calcKoverI: function ( k, i ) {

			var nom = 1;

			for ( var j = 2; j <= k; ++ j ) {

				nom *= j;

			}

			var denom = 1;

			for ( var j = 2; j <= i; ++ j ) {

				denom *= j;

			}

			for ( var j = 2; j <= k - i; ++ j ) {

				denom *= j;

			}

			return nom / denom;

		},


		/*
		Calculate derivatives (0-nd) of rational curve. See The NURBS Book, page 127, algorithm A4.2.

		Pders : result of function calcBSplineDerivatives

		returns array with derivatives for rational curve.
		*/
		calcRationalCurveDerivatives: function ( Pders ) {

			var nd = Pders.length;
			var Aders = [];
			var wders = [];

			for ( var i = 0; i < nd; ++ i ) {

				var point = Pders[ i ];
				Aders[ i ] = new THREE.Vector3( point.x, point.y, point.z );
				wders[ i ] = point.w;

			}

			var CK = [];

			for ( var k = 0; k < nd; ++ k ) {

				var v = Aders[ k ].clone();

				for ( var i = 1; i <= k; ++ i ) {

					v.sub( CK[ k - i ].clone().multiplyScalar( this.calcKoverI( k, i ) * wders[ i ] ) );

				}

				CK[ k ] = v.divideScalar( wders[ 0 ] );

			}

			return CK;

		},


		/*
		Calculate NURBS curve derivatives. See The NURBS Book, page 127, algorithm A4.2.

		p  : degree
		U  : knot vector
		P  : control points in homogeneous space
		u  : parametric points
		nd : number of derivatives

		returns array with derivatives.
		*/
		calcNURBSDerivatives: function ( p, U, P, u, nd ) {

			var Pders = this.calcBSplineDerivatives( p, U, P, u, nd );
			return this.calcRationalCurveDerivatives( Pders );

		},


		/*
		Calculate rational B-Spline surface point. See The NURBS Book, page 134, algorithm A4.3.

		p1, p2 : degrees of B-Spline surface
		U1, U2 : knot vectors
		P      : control points (x, y, z, w)
		u, v   : parametric values

		returns point for given (u, v)
		*/
		calcSurfacePoint: function ( p, q, U, V, P, u, v, target ) {

			var uspan = this.findSpan( p, u, U );
			var vspan = this.findSpan( q, v, V );
			var Nu = this.calcBasisFunctions( uspan, u, p, U );
			var Nv = this.calcBasisFunctions( vspan, v, q, V );
			var temp = [];

			for ( var l = 0; l <= q; ++ l ) {

				temp[ l ] = new THREE.Vector4( 0, 0, 0, 0 );
				for ( var k = 0; k <= p; ++ k ) {

					var point = P[ uspan - p + k ][ vspan - q + l ].clone();
					var w = point.w;
					point.x *= w;
					point.y *= w;
					point.z *= w;
					temp[ l ].add( point.multiplyScalar( Nu[ k ] ) );

				}

			}

			var Sw = new THREE.Vector4( 0, 0, 0, 0 );
			for ( var l = 0; l <= q; ++ l ) {

				Sw.add( temp[ l ].multiplyScalar( Nv[ l ] ) );

			}

			Sw.divideScalar( Sw.w );
			target.set( Sw.x, Sw.y, Sw.z );

		}

	};
	return THREE.NURBSUtils;
});

define('skylark-threejs-ex/curves/NURBSCurve',[
	"skylark-threejs",
	"./NURBSUtils"
],function(THREE){
	/**
	 * @author renej
	 * NURBS curve object
	 *
	 * Derives from Curve, overriding getPoint and getTangent.
	 *
	 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
	 *
	 **/


	/**************************************************************
	 *	NURBS curve
	 **************************************************************/

	THREE.NURBSCurve = function ( degree, knots /* array of reals */, controlPoints /* array of Vector(2|3|4) */, startKnot /* index in knots */, endKnot /* index in knots */ ) {

		THREE.Curve.call( this );

		this.degree = degree;
		this.knots = knots;
		this.controlPoints = [];
		// Used by periodic NURBS to remove hidden spans
		this.startKnot = startKnot || 0;
		this.endKnot = endKnot || ( this.knots.length - 1 );
		for ( var i = 0; i < controlPoints.length; ++ i ) {

			// ensure Vector4 for control points
			var point = controlPoints[ i ];
			this.controlPoints[ i ] = new THREE.Vector4( point.x, point.y, point.z, point.w );

		}

	};


	THREE.NURBSCurve.prototype = Object.create( THREE.Curve.prototype );
	THREE.NURBSCurve.prototype.constructor = THREE.NURBSCurve;


	THREE.NURBSCurve.prototype.getPoint = function ( t ) {

		var u = this.knots[ this.startKnot ] + t * ( this.knots[ this.endKnot ] - this.knots[ this.startKnot ] ); // linear mapping t->u

		// following results in (wx, wy, wz, w) homogeneous point
		var hpoint = THREE.NURBSUtils.calcBSplinePoint( this.degree, this.knots, this.controlPoints, u );

		if ( hpoint.w != 1.0 ) {

			// project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
			hpoint.divideScalar( hpoint.w );

		}

		return new THREE.Vector3( hpoint.x, hpoint.y, hpoint.z );

	};


	THREE.NURBSCurve.prototype.getTangent = function ( t ) {

		var u = this.knots[ 0 ] + t * ( this.knots[ this.knots.length - 1 ] - this.knots[ 0 ] );
		var ders = THREE.NURBSUtils.calcNURBSDerivatives( this.degree, this.knots, this.controlPoints, u, 1 );
		var tangent = ders[ 1 ].clone();
		tangent.normalize();

		return tangent;

	};
	return THREE.NURBSCurve;
});

define('skylark-threejs-ex/curves/NURBSSurface',[
	"skylark-threejs",
	"./NURBSUtils"
],function(THREE){
	/**
	 * @author renej
	 * NURBS surface object
	 *
	 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
	 *
	 **/


	/**************************************************************
	 *	NURBS surface
	 **************************************************************/

	THREE.NURBSSurface = function ( degree1, degree2, knots1, knots2 /* arrays of reals */, controlPoints /* array^2 of Vector(2|3|4) */ ) {

		this.degree1 = degree1;
		this.degree2 = degree2;
		this.knots1 = knots1;
		this.knots2 = knots2;
		this.controlPoints = [];

		var len1 = knots1.length - degree1 - 1;
		var len2 = knots2.length - degree2 - 1;

		// ensure Vector4 for control points
		for ( var i = 0; i < len1; ++ i ) {

			this.controlPoints[ i ] = [];
			for ( var j = 0; j < len2; ++ j ) {

				var point = controlPoints[ i ][ j ];
				this.controlPoints[ i ][ j ] = new THREE.Vector4( point.x, point.y, point.z, point.w );

			}

		}

	};


	THREE.NURBSSurface.prototype = {

		constructor: THREE.NURBSSurface,

		getPoint: function ( t1, t2, target ) {

			var u = this.knots1[ 0 ] + t1 * ( this.knots1[ this.knots1.length - 1 ] - this.knots1[ 0 ] ); // linear mapping t1->u
			var v = this.knots2[ 0 ] + t2 * ( this.knots2[ this.knots2.length - 1 ] - this.knots2[ 0 ] ); // linear mapping t2->u

			THREE.NURBSUtils.calcSurfacePoint( this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, target );

		}
	};
	return THREE.NURBSSurface;
});

define('skylark-threejs-ex/objects/Lensflare',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 * @author mrdoob / http://mrdoob.com/
	 */

	THREE.Lensflare = function () {

		THREE.Mesh.call( this, THREE.Lensflare.Geometry, new THREE.MeshBasicMaterial( { opacity: 0, transparent: true } ) );

		this.type = 'Lensflare';
		this.frustumCulled = false;
		this.renderOrder = Infinity;

		//

		var positionScreen = new THREE.Vector3();
		var positionView = new THREE.Vector3();

		// textures

		var tempMap = new THREE.DataTexture( new Uint8Array( 16 * 16 * 3 ), 16, 16, THREE.RGBFormat );
		tempMap.minFilter = THREE.NearestFilter;
		tempMap.magFilter = THREE.NearestFilter;
		tempMap.wrapS = THREE.ClampToEdgeWrapping;
		tempMap.wrapT = THREE.ClampToEdgeWrapping;

		var occlusionMap = new THREE.DataTexture( new Uint8Array( 16 * 16 * 3 ), 16, 16, THREE.RGBFormat );
		occlusionMap.minFilter = THREE.NearestFilter;
		occlusionMap.magFilter = THREE.NearestFilter;
		occlusionMap.wrapS = THREE.ClampToEdgeWrapping;
		occlusionMap.wrapT = THREE.ClampToEdgeWrapping;

		// material

		var geometry = THREE.Lensflare.Geometry;

		var material1a = new THREE.RawShaderMaterial( {
			uniforms: {
				'scale': { value: null },
				'screenPosition': { value: null }
			},
			vertexShader: [

				'precision highp float;',

				'uniform vec3 screenPosition;',
				'uniform vec2 scale;',

				'attribute vec3 position;',

				'void main() {',

				'	gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );',

				'}'

			].join( '\n' ),
			fragmentShader: [

				'precision highp float;',

				'void main() {',

				'	gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );',

				'}'

			].join( '\n' ),
			depthTest: true,
			depthWrite: false,
			transparent: false
		} );

		var material1b = new THREE.RawShaderMaterial( {
			uniforms: {
				'map': { value: tempMap },
				'scale': { value: null },
				'screenPosition': { value: null }
			},
			vertexShader: [

				'precision highp float;',

				'uniform vec3 screenPosition;',
				'uniform vec2 scale;',

				'attribute vec3 position;',
				'attribute vec2 uv;',

				'varying vec2 vUV;',

				'void main() {',

				'	vUV = uv;',

				'	gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );',

				'}'

			].join( '\n' ),
			fragmentShader: [

				'precision highp float;',

				'uniform sampler2D map;',

				'varying vec2 vUV;',

				'void main() {',

				'	gl_FragColor = texture2D( map, vUV );',

				'}'

			].join( '\n' ),
			depthTest: false,
			depthWrite: false,
			transparent: false
		} );

		// the following object is used for occlusionMap generation

		var mesh1 = new THREE.Mesh( geometry, material1a );

		//

		var elements = [];

		var shader = THREE.LensflareElement.Shader;

		var material2 = new THREE.RawShaderMaterial( {
			uniforms: {
				'map': { value: null },
				'occlusionMap': { value: occlusionMap },
				'color': { value: new THREE.Color( 0xffffff ) },
				'scale': { value: new THREE.Vector2() },
				'screenPosition': { value: new THREE.Vector3() }
			},
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false
		} );

		var mesh2 = new THREE.Mesh( geometry, material2 );

		this.addElement = function ( element ) {

			elements.push( element );

		};

		//

		var scale = new THREE.Vector2();
		var screenPositionPixels = new THREE.Vector2();
		var validArea = new THREE.Box2();
		var viewport = new THREE.Vector4();

		this.onBeforeRender = function ( renderer, scene, camera ) {

			renderer.getCurrentViewport( viewport );

			var invAspect = viewport.w / viewport.z;
			var halfViewportWidth = viewport.z / 2.0;
			var halfViewportHeight = viewport.w / 2.0;

			var size = 16 / viewport.w;
			scale.set( size * invAspect, size );

			validArea.min.set( viewport.x, viewport.y );
			validArea.max.set( viewport.x + ( viewport.z - 16 ), viewport.y + ( viewport.w - 16 ) );

			// calculate position in screen space

			positionView.setFromMatrixPosition( this.matrixWorld );
			positionView.applyMatrix4( camera.matrixWorldInverse );

			if ( positionView.z > 0 ) return; // lensflare is behind the camera

			positionScreen.copy( positionView ).applyMatrix4( camera.projectionMatrix );

			// horizontal and vertical coordinate of the lower left corner of the pixels to copy

			screenPositionPixels.x = viewport.x + ( positionScreen.x * halfViewportWidth ) + halfViewportWidth - 8;
			screenPositionPixels.y = viewport.y + ( positionScreen.y * halfViewportHeight ) + halfViewportHeight - 8;

			// screen cull

			if ( validArea.containsPoint( screenPositionPixels ) ) {

				// save current RGB to temp texture

				renderer.copyFramebufferToTexture( screenPositionPixels, tempMap );

				// render pink quad

				var uniforms = material1a.uniforms;
				uniforms[ "scale" ].value = scale;
				uniforms[ "screenPosition" ].value = positionScreen;

				renderer.renderBufferDirect( camera, null, geometry, material1a, mesh1, null );

				// copy result to occlusionMap

				renderer.copyFramebufferToTexture( screenPositionPixels, occlusionMap );

				// restore graphics

				var uniforms = material1b.uniforms;
				uniforms[ "scale" ].value = scale;
				uniforms[ "screenPosition" ].value = positionScreen;

				renderer.renderBufferDirect( camera, null, geometry, material1b, mesh1, null );

				// render elements

				var vecX = - positionScreen.x * 2;
				var vecY = - positionScreen.y * 2;

				for ( var i = 0, l = elements.length; i < l; i ++ ) {

					var element = elements[ i ];

					var uniforms = material2.uniforms;

					uniforms[ "color" ].value.copy( element.color );
					uniforms[ "map" ].value = element.texture;
					uniforms[ "screenPosition" ].value.x = positionScreen.x + vecX * element.distance;
					uniforms[ "screenPosition" ].value.y = positionScreen.y + vecY * element.distance;

					var size = element.size / viewport.w;
					var invAspect = viewport.w / viewport.z;

					uniforms[ "scale" ].value.set( size * invAspect, size );

					material2.uniformsNeedUpdate = true;

					renderer.renderBufferDirect( camera, null, geometry, material2, mesh2, null );

				}

			}

		};

		this.dispose = function () {

			material1a.dispose();
			material1b.dispose();
			material2.dispose();

			tempMap.dispose();
			occlusionMap.dispose();

			for ( var i = 0, l = elements.length; i < l; i ++ ) {

				elements[ i ].texture.dispose();

			}

		};

	};

	THREE.Lensflare.prototype = Object.create( THREE.Mesh.prototype );
	THREE.Lensflare.prototype.constructor = THREE.Lensflare;
	THREE.Lensflare.prototype.isLensflare = true;

	//

	THREE.LensflareElement = function ( texture, size, distance, color ) {

		this.texture = texture;
		this.size = size || 1;
		this.distance = distance || 0;
		this.color = color || new THREE.Color( 0xffffff );

	};

	THREE.LensflareElement.Shader = {

		uniforms: {

			'map': { value: null },
			'occlusionMap': { value: null },
			'color': { value: null },
			'scale': { value: null },
			'screenPosition': { value: null }

		},

		vertexShader: [

			'precision highp float;',

			'uniform vec3 screenPosition;',
			'uniform vec2 scale;',

			'uniform sampler2D occlusionMap;',

			'attribute vec3 position;',
			'attribute vec2 uv;',

			'varying vec2 vUV;',
			'varying float vVisibility;',

			'void main() {',

			'	vUV = uv;',

			'	vec2 pos = position.xy;',

			'	vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );',
			'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );',

			'	vVisibility =        visibility.r / 9.0;',
			'	vVisibility *= 1.0 - visibility.g / 9.0;',
			'	vVisibility *=       visibility.b / 9.0;',

			'	gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );',

			'}'

		].join( '\n' ),

		fragmentShader: [

			'precision highp float;',

			'uniform sampler2D map;',
			'uniform vec3 color;',

			'varying vec2 vUV;',
			'varying float vVisibility;',

			'void main() {',

			'	vec4 texture = texture2D( map, vUV );',
			'	texture.a *= vVisibility;',
			'	gl_FragColor = texture;',
			'	gl_FragColor.rgb *= color;',

			'}'

		].join( '\n' )

	};

	THREE.Lensflare.Geometry = ( function () {

		var geometry = new THREE.BufferGeometry();

		var float32Array = new Float32Array( [
			- 1, - 1, 0, 0, 0,
			1, - 1, 0, 1, 0,
			1, 1, 0, 1, 1,
			- 1, 1, 0, 0, 1
		] );

		var interleavedBuffer = new THREE.InterleavedBuffer( float32Array, 5 );

		geometry.setIndex( [ 0, 1, 2,	0, 2, 3 ] );
		geometry.setAttribute( 'position', new THREE.InterleavedBufferAttribute( interleavedBuffer, 3, 0, false ) );
		geometry.setAttribute( 'uv', new THREE.InterleavedBufferAttribute( interleavedBuffer, 2, 3, false ) );

		return geometry;

	} )();
	
	return THREE.Lensflare;
});

define('skylark-threejs-ex/objects/Reflector',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Slayvin / http://slayvin.net
	 */

	THREE.Reflector = function ( geometry, options ) {

		THREE.Mesh.call( this, geometry );

		this.type = 'Reflector';

		var scope = this;

		options = options || {};

		var color = ( options.color !== undefined ) ? new THREE.Color( options.color ) : new THREE.Color( 0x7F7F7F );
		var textureWidth = options.textureWidth || 512;
		var textureHeight = options.textureHeight || 512;
		var clipBias = options.clipBias || 0;
		var shader = options.shader || THREE.Reflector.ReflectorShader;
		var recursion = options.recursion !== undefined ? options.recursion : 0;
		var encoding = options.encoding !== undefined ? options.encoding : THREE.LinearEncoding;

		//

		var reflectorPlane = new THREE.Plane();
		var normal = new THREE.Vector3();
		var reflectorWorldPosition = new THREE.Vector3();
		var cameraWorldPosition = new THREE.Vector3();
		var rotationMatrix = new THREE.Matrix4();
		var lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
		var clipPlane = new THREE.Vector4();

		var view = new THREE.Vector3();
		var target = new THREE.Vector3();
		var q = new THREE.Vector4();

		var textureMatrix = new THREE.Matrix4();
		var virtualCamera = new THREE.PerspectiveCamera();

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false,
			encoding: encoding
		};

		var renderTarget = new THREE.WebGLRenderTarget( textureWidth, textureHeight, parameters );

		if ( ! THREE.MathUtils.isPowerOfTwo( textureWidth ) || ! THREE.MathUtils.isPowerOfTwo( textureHeight ) ) {

			renderTarget.texture.generateMipmaps = false;

		}

		var material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader
		} );

		material.uniforms[ "tDiffuse" ].value = renderTarget.texture;
		material.uniforms[ "color" ].value = color;
		material.uniforms[ "textureMatrix" ].value = textureMatrix;

		this.material = material;

		this.onBeforeRender = function ( renderer, scene, camera ) {

			if ( 'recursion' in camera.userData ) {

				if ( camera.userData.recursion === recursion ) return;

				camera.userData.recursion ++;

			}

			reflectorWorldPosition.setFromMatrixPosition( scope.matrixWorld );
			cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

			rotationMatrix.extractRotation( scope.matrixWorld );

			normal.set( 0, 0, 1 );
			normal.applyMatrix4( rotationMatrix );

			view.subVectors( reflectorWorldPosition, cameraWorldPosition );

			// Avoid rendering when reflector is facing away

			if ( view.dot( normal ) > 0 ) return;

			view.reflect( normal ).negate();
			view.add( reflectorWorldPosition );

			rotationMatrix.extractRotation( camera.matrixWorld );

			lookAtPosition.set( 0, 0, - 1 );
			lookAtPosition.applyMatrix4( rotationMatrix );
			lookAtPosition.add( cameraWorldPosition );

			target.subVectors( reflectorWorldPosition, lookAtPosition );
			target.reflect( normal ).negate();
			target.add( reflectorWorldPosition );

			virtualCamera.position.copy( view );
			virtualCamera.up.set( 0, 1, 0 );
			virtualCamera.up.applyMatrix4( rotationMatrix );
			virtualCamera.up.reflect( normal );
			virtualCamera.lookAt( target );

			virtualCamera.far = camera.far; // Used in WebGLBackground

			virtualCamera.updateMatrixWorld();
			virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

			virtualCamera.userData.recursion = 0;

			// Update the texture matrix
			textureMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);
			textureMatrix.multiply( virtualCamera.projectionMatrix );
			textureMatrix.multiply( virtualCamera.matrixWorldInverse );
			textureMatrix.multiply( scope.matrixWorld );

			// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
			// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
			reflectorPlane.setFromNormalAndCoplanarPoint( normal, reflectorWorldPosition );
			reflectorPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

			clipPlane.set( reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant );

			var projectionMatrix = virtualCamera.projectionMatrix;

			q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
			q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
			q.z = - 1.0;
			q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

			// Calculate the scaled plane vector
			clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

			// Replacing the third row of the projection matrix
			projectionMatrix.elements[ 2 ] = clipPlane.x;
			projectionMatrix.elements[ 6 ] = clipPlane.y;
			projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - clipBias;
			projectionMatrix.elements[ 14 ] = clipPlane.w;

			// Render

			scope.visible = false;

			var currentRenderTarget = renderer.getRenderTarget();

			var currentXrEnabled = renderer.xr.enabled;
			var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			renderer.xr.enabled = false; // Avoid camera modification and recursion
			renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

			renderer.setRenderTarget( renderTarget );
			if ( renderer.autoClear === false ) renderer.clear();
			renderer.render( scene, virtualCamera );

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget( currentRenderTarget );

			// Restore viewport

			var viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

			scope.visible = true;

		};

		this.getRenderTarget = function () {

			return renderTarget;

		};

	};

	THREE.Reflector.prototype = Object.create( THREE.Mesh.prototype );
	THREE.Reflector.prototype.constructor = THREE.Reflector;

	THREE.Reflector.ReflectorShader = {

		uniforms: {

			'color': {
				value: null
			},

			'tDiffuse': {
				value: null
			},

			'textureMatrix': {
				value: null
			}

		},

		vertexShader: [
			'uniform mat4 textureMatrix;',
			'varying vec4 vUv;',

			'void main() {',

			'	vUv = textureMatrix * vec4( position, 1.0 );',

			'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

			'}'
		].join( '\n' ),

		fragmentShader: [
			'uniform vec3 color;',
			'uniform sampler2D tDiffuse;',
			'varying vec4 vUv;',

			'float blendOverlay( float base, float blend ) {',

			'	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );',

			'}',

			'vec3 blendOverlay( vec3 base, vec3 blend ) {',

			'	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );',

			'}',

			'void main() {',

			'	vec4 base = texture2DProj( tDiffuse, vUv );',
			'	gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',

			'}'
		].join( '\n' )
	};
	
	return THREE.Reflector;
});

define('skylark-threejs-ex/objects/Refractor',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 */

	THREE.Refractor = function ( geometry, options ) {

		THREE.Mesh.call( this, geometry );

		this.type = 'Refractor';

		var scope = this;

		options = options || {};

		var color = ( options.color !== undefined ) ? new THREE.Color( options.color ) : new THREE.Color( 0x7F7F7F );
		var textureWidth = options.textureWidth || 512;
		var textureHeight = options.textureHeight || 512;
		var clipBias = options.clipBias || 0;
		var shader = options.shader || THREE.Refractor.RefractorShader;
		var encoding = options.encoding !== undefined ? options.encoding : THREE.LinearEncoding;

		//

		var virtualCamera = new THREE.PerspectiveCamera();
		virtualCamera.matrixAutoUpdate = false;
		virtualCamera.userData.refractor = true;

		//

		var refractorPlane = new THREE.Plane();
		var textureMatrix = new THREE.Matrix4();

		// render target

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false,
			encoding: encoding
		};

		var renderTarget = new THREE.WebGLRenderTarget( textureWidth, textureHeight, parameters );

		if ( ! THREE.MathUtils.isPowerOfTwo( textureWidth ) || ! THREE.MathUtils.isPowerOfTwo( textureHeight ) ) {

			renderTarget.texture.generateMipmaps = false;

		}

		// material

		this.material = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true // ensures, refractors are drawn from farthest to closest
		} );

		this.material.uniforms[ "color" ].value = color;
		this.material.uniforms[ "tDiffuse" ].value = renderTarget.texture;
		this.material.uniforms[ "textureMatrix" ].value = textureMatrix;

		// functions

		var visible = ( function () {

			var refractorWorldPosition = new THREE.Vector3();
			var cameraWorldPosition = new THREE.Vector3();
			var rotationMatrix = new THREE.Matrix4();

			var view = new THREE.Vector3();
			var normal = new THREE.Vector3();

			return function visible( camera ) {

				refractorWorldPosition.setFromMatrixPosition( scope.matrixWorld );
				cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

				view.subVectors( refractorWorldPosition, cameraWorldPosition );

				rotationMatrix.extractRotation( scope.matrixWorld );

				normal.set( 0, 0, 1 );
				normal.applyMatrix4( rotationMatrix );

				return view.dot( normal ) < 0;

			};

		} )();

		var updateRefractorPlane = ( function () {

			var normal = new THREE.Vector3();
			var position = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			var scale = new THREE.Vector3();

			return function updateRefractorPlane() {

				scope.matrixWorld.decompose( position, quaternion, scale );
				normal.set( 0, 0, 1 ).applyQuaternion( quaternion ).normalize();

				// flip the normal because we want to cull everything above the plane

				normal.negate();

				refractorPlane.setFromNormalAndCoplanarPoint( normal, position );

			};

		} )();

		var updateVirtualCamera = ( function () {

			var clipPlane = new THREE.Plane();
			var clipVector = new THREE.Vector4();
			var q = new THREE.Vector4();

			return function updateVirtualCamera( camera ) {

				virtualCamera.matrixWorld.copy( camera.matrixWorld );
				virtualCamera.matrixWorldInverse.getInverse( virtualCamera.matrixWorld );
				virtualCamera.projectionMatrix.copy( camera.projectionMatrix );
				virtualCamera.far = camera.far; // used in WebGLBackground

				// The following code creates an oblique view frustum for clipping.
				// see: Lengyel, Eric. “Oblique View Frustum Depth Projection and Clipping”.
				// Journal of Game Development, Vol. 1, No. 2 (2005), Charles River Media, pp. 5–16

				clipPlane.copy( refractorPlane );
				clipPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

				clipVector.set( clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant );

				// calculate the clip-space corner point opposite the clipping plane and
				// transform it into camera space by multiplying it by the inverse of the projection matrix

				var projectionMatrix = virtualCamera.projectionMatrix;

				q.x = ( Math.sign( clipVector.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
				q.y = ( Math.sign( clipVector.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
				q.z = - 1.0;
				q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

				// calculate the scaled plane vector

				clipVector.multiplyScalar( 2.0 / clipVector.dot( q ) );

				// replacing the third row of the projection matrix

				projectionMatrix.elements[ 2 ] = clipVector.x;
				projectionMatrix.elements[ 6 ] = clipVector.y;
				projectionMatrix.elements[ 10 ] = clipVector.z + 1.0 - clipBias;
				projectionMatrix.elements[ 14 ] = clipVector.w;

			};

		} )();

		// This will update the texture matrix that is used for projective texture mapping in the shader.
		// see: http://developer.download.nvidia.com/assets/gamedev/docs/projective_texture_mapping.pdf

		function updateTextureMatrix( camera ) {

			// this matrix does range mapping to [ 0, 1 ]

			textureMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);

			// we use "Object Linear Texgen", so we need to multiply the texture matrix T
			// (matrix above) with the projection and view matrix of the virtual camera
			// and the model matrix of the refractor

			textureMatrix.multiply( camera.projectionMatrix );
			textureMatrix.multiply( camera.matrixWorldInverse );
			textureMatrix.multiply( scope.matrixWorld );

		}

		//

		function render( renderer, scene, camera ) {

			scope.visible = false;

			var currentRenderTarget = renderer.getRenderTarget();
			var currentXrEnabled = renderer.xr.enabled;
			var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			renderer.xr.enabled = false; // avoid camera modification
			renderer.shadowMap.autoUpdate = false; // avoid re-computing shadows

			renderer.setRenderTarget( renderTarget );
			if ( renderer.autoClear === false ) renderer.clear();
			renderer.render( scene, virtualCamera );

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
			renderer.setRenderTarget( currentRenderTarget );

			// restore viewport

			var viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

			scope.visible = true;

		}

		//

		this.onBeforeRender = function ( renderer, scene, camera ) {

			// ensure refractors are rendered only once per frame

			if ( camera.userData.refractor === true ) return;

			// avoid rendering when the refractor is viewed from behind

			if ( ! visible( camera ) === true ) return;

			// update

			updateRefractorPlane();

			updateTextureMatrix( camera );

			updateVirtualCamera( camera );

			render( renderer, scene, camera );

		};

		this.getRenderTarget = function () {

			return renderTarget;

		};

	};

	THREE.Refractor.prototype = Object.create( THREE.Mesh.prototype );
	THREE.Refractor.prototype.constructor = THREE.Refractor;

	THREE.Refractor.RefractorShader = {

		uniforms: {

			'color': {
				value: null
			},

			'tDiffuse': {
				value: null
			},

			'textureMatrix': {
				value: null
			}

		},

		vertexShader: [

			'uniform mat4 textureMatrix;',

			'varying vec4 vUv;',

			'void main() {',

			'	vUv = textureMatrix * vec4( position, 1.0 );',

			'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

			'}'

		].join( '\n' ),

		fragmentShader: [

			'uniform vec3 color;',
			'uniform sampler2D tDiffuse;',

			'varying vec4 vUv;',

			'float blendOverlay( float base, float blend ) {',

			'	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );',

			'}',

			'vec3 blendOverlay( vec3 base, vec3 blend ) {',

			'	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );',

			'}',

			'void main() {',

			'	vec4 base = texture2DProj( tDiffuse, vUv );',

			'	gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',

			'}'

		].join( '\n' )
	};
	
	return THREE.Refractor;
});

define('skylark-threejs-ex/loaders/TTFLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author gero3 / https://github.com/gero3
	 * @author tentone / https://github.com/tentone
	 * @author troy351 / https://github.com/troy351
	 *
	 * Requires opentype.js to be included in the project.
	 * Loads TTF files and converts them into typeface JSON that can be used directly
	 * to create THREE.Font objects.
	 */

	THREE.TTFLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		this.reversed = false;

	};


	THREE.TTFLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.TTFLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( buffer ) {

				onLoad( scope.parse( buffer ) );

			}, onProgress, onError );

		},

		parse: function ( arraybuffer ) {

			function convert( font, reversed ) {

				var round = Math.round;

				var glyphs = {};
				var scale = ( 100000 ) / ( ( font.unitsPerEm || 2048 ) * 72 );

				var glyphIndexMap = font.encoding.cmap.glyphIndexMap;
				var unicodes = Object.keys( glyphIndexMap );

				for ( var i = 0; i < unicodes.length; i ++ ) {

					var unicode = unicodes[ i ];
					var glyph = font.glyphs.glyphs[ glyphIndexMap[ unicode ] ];

					if ( unicode !== undefined ) {

						var token = {
							ha: round( glyph.advanceWidth * scale ),
							x_min: round( glyph.xMin * scale ),
							x_max: round( glyph.xMax * scale ),
							o: ''
						};

						if ( reversed ) {

							glyph.path.commands = reverseCommands( glyph.path.commands );

						}

						glyph.path.commands.forEach( function ( command ) {

							if ( command.type.toLowerCase() === 'c' ) {

								command.type = 'b';

							}

							token.o += command.type.toLowerCase() + ' ';

							if ( command.x !== undefined && command.y !== undefined ) {

								token.o += round( command.x * scale ) + ' ' + round( command.y * scale ) + ' ';

							}

							if ( command.x1 !== undefined && command.y1 !== undefined ) {

								token.o += round( command.x1 * scale ) + ' ' + round( command.y1 * scale ) + ' ';

							}

							if ( command.x2 !== undefined && command.y2 !== undefined ) {

								token.o += round( command.x2 * scale ) + ' ' + round( command.y2 * scale ) + ' ';

							}

						} );

						glyphs[ String.fromCodePoint( glyph.unicode ) ] = token;

					}

				}

				return {
					glyphs: glyphs,
					familyName: font.getEnglishName( 'fullName' ),
					ascender: round( font.ascender * scale ),
					descender: round( font.descender * scale ),
					underlinePosition: font.tables.post.underlinePosition,
					underlineThickness: font.tables.post.underlineThickness,
					boundingBox: {
						xMin: font.tables.head.xMin,
						xMax: font.tables.head.xMax,
						yMin: font.tables.head.yMin,
						yMax: font.tables.head.yMax
					},
					resolution: 1000,
					original_font_information: font.tables.name
				};

			}

			function reverseCommands( commands ) {

				var paths = [];
				var path;

				commands.forEach( function ( c ) {

					if ( c.type.toLowerCase() === 'm' ) {

						path = [ c ];
						paths.push( path );

					} else if ( c.type.toLowerCase() !== 'z' ) {

						path.push( c );

					}

				} );

				var reversed = [];

				paths.forEach( function ( p ) {

					var result = {
						type: 'm',
						x: p[ p.length - 1 ].x,
						y: p[ p.length - 1 ].y
					};

					reversed.push( result );

					for ( var i = p.length - 1; i > 0; i -- ) {

						var command = p[ i ];
						var result = { type: command.type };

						if ( command.x2 !== undefined && command.y2 !== undefined ) {

							result.x1 = command.x2;
							result.y1 = command.y2;
							result.x2 = command.x1;
							result.y2 = command.y1;

						} else if ( command.x1 !== undefined && command.y1 !== undefined ) {

							result.x1 = command.x1;
							result.y1 = command.y1;

						}

						result.x = p[ i - 1 ].x;
						result.y = p[ i - 1 ].y;
						reversed.push( result );

					}

				} );

				return reversed;

			}

			if ( typeof opentype === 'undefined' ) {

				console.warn( 'THREE.TTFLoader: The loader requires opentype.js. Make sure it\'s included before using the loader.' );
				return null;

			}

			return convert( opentype.parse( arraybuffer ), this.reversed );

		}

	} );
	
	return THREE.TTFLoader;
});

define('skylark-threejs-ex/loaders/3MFLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author technohippy / https://github.com/technohippy
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * 3D Manufacturing Format (3MF) specification: https://3mf.io/specification/
	 *
	 * The following features from the core specification are supported:
	 *
	 * - 3D Models
	 * - Object Resources (Meshes and Components)
	 * - Material Resources (Base Materials)
	 *
	 * 3MF Materials and Properties Extension are only partially supported.
	 *
	 * - Texture 2D
	 * - Texture 2D Groups
	 * - Color Groups (Vertex Colors)
	 * - Metallic Display Properties (PBR)
	 */

	THREE.ThreeMFLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		this.availableExtensions = [];

	};

	THREE.ThreeMFLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.ThreeMFLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;
			var loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( buffer ) {

				onLoad( scope.parse( buffer ) );

			}, onProgress, onError );

		},

		parse: function ( data ) {

			var scope = this;
			var textureLoader = new THREE.TextureLoader( this.manager );

			function loadDocument( data ) {

				var zip = null;
				var file = null;

				var relsName;
				var modelRelsName;
				var modelPartNames = [];
				var printTicketPartNames = [];
				var texturesPartNames = [];
				var otherPartNames = [];

				var rels;
				var modelRels;
				var modelParts = {};
				var printTicketParts = {};
				var texturesParts = {};
				var otherParts = {};

				try {

					zip = new JSZip( data ); // eslint-disable-line no-undef

				} catch ( e ) {

					if ( e instanceof ReferenceError ) {

						console.error( 'THREE.3MFLoader: jszip missing and file is compressed.' );
						return null;

					}

				}

				for ( file in zip.files ) {

					if ( file.match( /\_rels\/.rels$/ ) ) {

						relsName = file;

					} else if ( file.match( /3D\/_rels\/.*\.model\.rels$/ ) ) {

						modelRelsName = file;

					} else if ( file.match( /^3D\/.*\.model$/ ) ) {

						modelPartNames.push( file );

					} else if ( file.match( /^3D\/Metadata\/.*\.xml$/ ) ) {

						printTicketPartNames.push( file );

					} else if ( file.match( /^3D\/Textures?\/.*/ ) ) {

						texturesPartNames.push( file );

					} else if ( file.match( /^3D\/Other\/.*/ ) ) {

						otherPartNames.push( file );

					}

				}

				//

				var relsView = new Uint8Array( zip.file( relsName ).asArrayBuffer() );
				var relsFileText = THREE.LoaderUtils.decodeText( relsView );
				rels = parseRelsXml( relsFileText );

				//

				if ( modelRelsName ) {

					var relsView = new Uint8Array( zip.file( modelRelsName ).asArrayBuffer() );
					var relsFileText = THREE.LoaderUtils.decodeText( relsView );
					modelRels = parseRelsXml( relsFileText );

				}

				//

				for ( var i = 0; i < modelPartNames.length; i ++ ) {

					var modelPart = modelPartNames[ i ];
					var view = new Uint8Array( zip.file( modelPart ).asArrayBuffer() );

					var fileText = THREE.LoaderUtils.decodeText( view );
					var xmlData = new DOMParser().parseFromString( fileText, 'application/xml' );

					if ( xmlData.documentElement.nodeName.toLowerCase() !== 'model' ) {

						console.error( 'THREE.3MFLoader: Error loading 3MF - no 3MF document found: ', modelPart );

					}

					var modelNode = xmlData.querySelector( 'model' );
					var extensions = {};

					for ( var i = 0; i < modelNode.attributes.length; i ++ ) {

						var attr = modelNode.attributes[ i ];
						if ( attr.name.match( /^xmlns:(.+)$/ ) ) {

							extensions[ attr.value ] = RegExp.$1;

						}

					}

					var modelData = parseModelNode( modelNode );
					modelData[ 'xml' ] = modelNode;

					if ( 0 < Object.keys( extensions ).length ) {

						modelData[ 'extensions' ] = extensions;

					}

					modelParts[ modelPart ] = modelData;

				}

				//

				for ( var i = 0; i < texturesPartNames.length; i ++ ) {

					var texturesPartName = texturesPartNames[ i ];
					texturesParts[ texturesPartName ] = zip.file( texturesPartName ).asArrayBuffer();

				}

				return {
					rels: rels,
					modelRels: modelRels,
					model: modelParts,
					printTicket: printTicketParts,
					texture: texturesParts,
					other: otherParts
				};

			}

			function parseRelsXml( relsFileText ) {

				var relationships = [];

				var relsXmlData = new DOMParser().parseFromString( relsFileText, 'application/xml' );

				var relsNodes = relsXmlData.querySelectorAll( 'Relationship' );

				for ( var i = 0; i < relsNodes.length; i ++ ) {

					var relsNode = relsNodes[ i ];

					var relationship = {
						target: relsNode.getAttribute( 'Target' ), //required
						id: relsNode.getAttribute( 'Id' ), //required
						type: relsNode.getAttribute( 'Type' ) //required
					};

					relationships.push( relationship );

				}

				return relationships;

			}

			function parseMetadataNodes( metadataNodes ) {

				var metadataData = {};

				for ( var i = 0; i < metadataNodes.length; i ++ ) {

					var metadataNode = metadataNodes[ i ];
					var name = metadataNode.getAttribute( 'name' );
					var validNames = [
						'Title',
						'Designer',
						'Description',
						'Copyright',
						'LicenseTerms',
						'Rating',
						'CreationDate',
						'ModificationDate'
					];

					if ( 0 <= validNames.indexOf( name ) ) {

						metadataData[ name ] = metadataNode.textContent;

					}

				}

				return metadataData;

			}

			function parseBasematerialsNode( basematerialsNode ) {

				var basematerialsData = {
					id: basematerialsNode.getAttribute( 'id' ), // required
					basematerials: []
				};

				var basematerialNodes = basematerialsNode.querySelectorAll( 'base' );

				for ( var i = 0; i < basematerialNodes.length; i ++ ) {

					var basematerialNode = basematerialNodes[ i ];
					var basematerialData = parseBasematerialNode( basematerialNode );
					basematerialData.index = i; // the order and count of the material nodes form an implicit 0-based index
					basematerialsData.basematerials.push( basematerialData );

				}

				return basematerialsData;

			}

			function parseTexture2DNode( texture2DNode ) {

				var texture2dData = {
					id: texture2DNode.getAttribute( 'id' ), // required
					path: texture2DNode.getAttribute( 'path' ), // required
					contenttype: texture2DNode.getAttribute( 'contenttype' ), // required
					tilestyleu: texture2DNode.getAttribute( 'tilestyleu' ),
					tilestylev: texture2DNode.getAttribute( 'tilestylev' ),
					filter: texture2DNode.getAttribute( 'filter' ),
				};

				return texture2dData;

			}

			function parseTextures2DGroupNode( texture2DGroupNode ) {

				var texture2DGroupData = {
					id: texture2DGroupNode.getAttribute( 'id' ), // required
					texid: texture2DGroupNode.getAttribute( 'texid' ), // required
					displaypropertiesid: texture2DGroupNode.getAttribute( 'displaypropertiesid' )
				};

				var tex2coordNodes = texture2DGroupNode.querySelectorAll( 'tex2coord' );

				var uvs = [];

				for ( var i = 0; i < tex2coordNodes.length; i ++ ) {

					var tex2coordNode = tex2coordNodes[ i ];
					var u = tex2coordNode.getAttribute( 'u' );
					var v = tex2coordNode.getAttribute( 'v' );

					uvs.push( parseFloat( u ), parseFloat( v ) );

				}

				texture2DGroupData[ 'uvs' ] = new Float32Array( uvs );

				return texture2DGroupData;

			}

			function parseColorGroupNode( colorGroupNode ) {

				var colorGroupData = {
					id: colorGroupNode.getAttribute( 'id' ), // required
					displaypropertiesid: colorGroupNode.getAttribute( 'displaypropertiesid' )
				};

				var colorNodes = colorGroupNode.querySelectorAll( 'color' );

				var colors = [];
				var colorObject = new THREE.Color();

				for ( var i = 0; i < colorNodes.length; i ++ ) {

					var colorNode = colorNodes[ i ];
					var color = colorNode.getAttribute( 'color' );

					colorObject.setStyle( color.substring( 0, 7 ) );
					colorObject.convertSRGBToLinear(); // color is in sRGB

					colors.push( colorObject.r, colorObject.g, colorObject.b );

				}

				colorGroupData[ 'colors' ] = new Float32Array( colors );

				return colorGroupData;

			}

			function parseMetallicDisplaypropertiesNode( metallicDisplaypropetiesNode ) {

				var metallicDisplaypropertiesData = {
					id: metallicDisplaypropetiesNode.getAttribute( 'id' ) // required
				};

				var metallicNodes = metallicDisplaypropetiesNode.querySelectorAll( 'pbmetallic' );

				var metallicData = [];

				for ( var i = 0; i < metallicNodes.length; i ++ ) {

					var metallicNode = metallicNodes[ i ];

					metallicData.push( {
						name: metallicNode.getAttribute( 'name' ), // required
						metallicness: parseFloat( metallicNode.getAttribute( 'metallicness' ) ), // required
						roughness: parseFloat( metallicNode.getAttribute( 'roughness' ) ) // required
					} );

				}

				metallicDisplaypropertiesData.data = metallicData;

				return metallicDisplaypropertiesData;

			}

			function parseBasematerialNode( basematerialNode ) {

				var basematerialData = {};

				basematerialData[ 'name' ] = basematerialNode.getAttribute( 'name' ); // required
				basematerialData[ 'displaycolor' ] = basematerialNode.getAttribute( 'displaycolor' ); // required
				basematerialData[ 'displaypropertiesid' ] = basematerialNode.getAttribute( 'displaypropertiesid' );

				return basematerialData;

			}

			function parseMeshNode( meshNode ) {

				var meshData = {};

				var vertices = [];
				var vertexNodes = meshNode.querySelectorAll( 'vertices vertex' );

				for ( var i = 0; i < vertexNodes.length; i ++ ) {

					var vertexNode = vertexNodes[ i ];
					var x = vertexNode.getAttribute( 'x' );
					var y = vertexNode.getAttribute( 'y' );
					var z = vertexNode.getAttribute( 'z' );

					vertices.push( parseFloat( x ), parseFloat( y ), parseFloat( z ) );

				}

				meshData[ 'vertices' ] = new Float32Array( vertices );

				var triangleProperties = [];
				var triangles = [];
				var triangleNodes = meshNode.querySelectorAll( 'triangles triangle' );

				for ( var i = 0; i < triangleNodes.length; i ++ ) {

					var triangleNode = triangleNodes[ i ];
					var v1 = triangleNode.getAttribute( 'v1' );
					var v2 = triangleNode.getAttribute( 'v2' );
					var v3 = triangleNode.getAttribute( 'v3' );
					var p1 = triangleNode.getAttribute( 'p1' );
					var p2 = triangleNode.getAttribute( 'p2' );
					var p3 = triangleNode.getAttribute( 'p3' );
					var pid = triangleNode.getAttribute( 'pid' );

					var triangleProperty = {};

					triangleProperty[ 'v1' ] = parseInt( v1, 10 );
					triangleProperty[ 'v2' ] = parseInt( v2, 10 );
					triangleProperty[ 'v3' ] = parseInt( v3, 10 );

					triangles.push( triangleProperty[ 'v1' ], triangleProperty[ 'v2' ], triangleProperty[ 'v3' ] );

					// optional

					if ( p1 ) {

						triangleProperty[ 'p1' ] = parseInt( p1, 10 );

					}

					if ( p2 ) {

						triangleProperty[ 'p2' ] = parseInt( p2, 10 );

					}

					if ( p3 ) {

						triangleProperty[ 'p3' ] = parseInt( p3, 10 );

					}

					if ( pid ) {

						triangleProperty[ 'pid' ] = pid;

					}

					if ( 0 < Object.keys( triangleProperty ).length ) {

						triangleProperties.push( triangleProperty );

					}

				}

				meshData[ 'triangleProperties' ] = triangleProperties;
				meshData[ 'triangles' ] = new Uint32Array( triangles );

				return meshData;

			}

			function parseComponentsNode( componentsNode ) {

				var components = [];

				var componentNodes = componentsNode.querySelectorAll( 'component' );

				for ( var i = 0; i < componentNodes.length; i ++ ) {

					var componentNode = componentNodes[ i ];
					var componentData = parseComponentNode( componentNode );
					components.push( componentData );

				}

				return components;

			}

			function parseComponentNode( componentNode ) {

				var componentData = {};

				componentData[ 'objectId' ] = componentNode.getAttribute( 'objectid' ); // required

				var transform = componentNode.getAttribute( 'transform' );

				if ( transform ) {

					componentData[ 'transform' ] = parseTransform( transform );

				}

				return componentData;

			}

			function parseTransform( transform ) {

				var t = [];
				transform.split( ' ' ).forEach( function ( s ) {

					t.push( parseFloat( s ) );

				} );

				var matrix = new THREE.Matrix4();
				matrix.set(
					t[ 0 ], t[ 3 ], t[ 6 ], t[ 9 ],
					t[ 1 ], t[ 4 ], t[ 7 ], t[ 10 ],
					t[ 2 ], t[ 5 ], t[ 8 ], t[ 11 ],
					 0.0, 0.0, 0.0, 1.0
				);

				return matrix;

			}

			function parseObjectNode( objectNode ) {

				var objectData = {
					type: objectNode.getAttribute( 'type' )
				};

				var id = objectNode.getAttribute( 'id' );

				if ( id ) {

					objectData[ 'id' ] = id;

				}

				var pid = objectNode.getAttribute( 'pid' );

				if ( pid ) {

					objectData[ 'pid' ] = pid;

				}

				var pindex = objectNode.getAttribute( 'pindex' );

				if ( pindex ) {

					objectData[ 'pindex' ] = pindex;

				}

				var thumbnail = objectNode.getAttribute( 'thumbnail' );

				if ( thumbnail ) {

					objectData[ 'thumbnail' ] = thumbnail;

				}

				var partnumber = objectNode.getAttribute( 'partnumber' );

				if ( partnumber ) {

					objectData[ 'partnumber' ] = partnumber;

				}

				var name = objectNode.getAttribute( 'name' );

				if ( name ) {

					objectData[ 'name' ] = name;

				}

				var meshNode = objectNode.querySelector( 'mesh' );

				if ( meshNode ) {

					objectData[ 'mesh' ] = parseMeshNode( meshNode );

				}

				var componentsNode = objectNode.querySelector( 'components' );

				if ( componentsNode ) {

					objectData[ 'components' ] = parseComponentsNode( componentsNode );

				}

				return objectData;

			}

			function parseResourcesNode( resourcesNode ) {

				var resourcesData = {};

				resourcesData[ 'basematerials' ] = {};
				var basematerialsNodes = resourcesNode.querySelectorAll( 'basematerials' );

				for ( var i = 0; i < basematerialsNodes.length; i ++ ) {

					var basematerialsNode = basematerialsNodes[ i ];
					var basematerialsData = parseBasematerialsNode( basematerialsNode );
					resourcesData[ 'basematerials' ][ basematerialsData[ 'id' ] ] = basematerialsData;

				}

				//

				resourcesData[ 'texture2d' ] = {};
				var textures2DNodes = resourcesNode.querySelectorAll( 'texture2d' );

				for ( var i = 0; i < textures2DNodes.length; i ++ ) {

					var textures2DNode = textures2DNodes[ i ];
					var texture2DData = parseTexture2DNode( textures2DNode );
					resourcesData[ 'texture2d' ][ texture2DData[ 'id' ] ] = texture2DData;

				}

				//

				resourcesData[ 'colorgroup' ] = {};
				var colorGroupNodes = resourcesNode.querySelectorAll( 'colorgroup' );

				for ( var i = 0; i < colorGroupNodes.length; i ++ ) {

					var colorGroupNode = colorGroupNodes[ i ];
					var colorGroupData = parseColorGroupNode( colorGroupNode );
					resourcesData[ 'colorgroup' ][ colorGroupData[ 'id' ] ] = colorGroupData;

				}

				//

				resourcesData[ 'pbmetallicdisplayproperties' ] = {};
				var pbmetallicdisplaypropertiesNodes = resourcesNode.querySelectorAll( 'pbmetallicdisplayproperties' );

				for ( var i = 0; i < pbmetallicdisplaypropertiesNodes.length; i ++ ) {

					var pbmetallicdisplaypropertiesNode = pbmetallicdisplaypropertiesNodes[ i ];
					var pbmetallicdisplaypropertiesData = parseMetallicDisplaypropertiesNode( pbmetallicdisplaypropertiesNode );
					resourcesData[ 'pbmetallicdisplayproperties' ][ pbmetallicdisplaypropertiesData[ 'id' ] ] = pbmetallicdisplaypropertiesData;

				}

				//

				resourcesData[ 'texture2dgroup' ] = {};
				var textures2DGroupNodes = resourcesNode.querySelectorAll( 'texture2dgroup' );

				for ( var i = 0; i < textures2DGroupNodes.length; i ++ ) {

					var textures2DGroupNode = textures2DGroupNodes[ i ];
					var textures2DGroupData = parseTextures2DGroupNode( textures2DGroupNode );
					resourcesData[ 'texture2dgroup' ][ textures2DGroupData[ 'id' ] ] = textures2DGroupData;

				}

				//

				resourcesData[ 'object' ] = {};
				var objectNodes = resourcesNode.querySelectorAll( 'object' );

				for ( var i = 0; i < objectNodes.length; i ++ ) {

					var objectNode = objectNodes[ i ];
					var objectData = parseObjectNode( objectNode );
					resourcesData[ 'object' ][ objectData[ 'id' ] ] = objectData;

				}

				return resourcesData;

			}

			function parseBuildNode( buildNode ) {

				var buildData = [];
				var itemNodes = buildNode.querySelectorAll( 'item' );

				for ( var i = 0; i < itemNodes.length; i ++ ) {

					var itemNode = itemNodes[ i ];
					var buildItem = {
						objectId: itemNode.getAttribute( 'objectid' )
					};
					var transform = itemNode.getAttribute( 'transform' );

					if ( transform ) {

						buildItem[ 'transform' ] = parseTransform( transform );

					}

					buildData.push( buildItem );

				}

				return buildData;

			}

			function parseModelNode( modelNode ) {

				var modelData = { unit: modelNode.getAttribute( 'unit' ) || 'millimeter' };
				var metadataNodes = modelNode.querySelectorAll( 'metadata' );

				if ( metadataNodes ) {

					modelData[ 'metadata' ] = parseMetadataNodes( metadataNodes );

				}

				var resourcesNode = modelNode.querySelector( 'resources' );

				if ( resourcesNode ) {

					modelData[ 'resources' ] = parseResourcesNode( resourcesNode );

				}

				var buildNode = modelNode.querySelector( 'build' );

				if ( buildNode ) {

					modelData[ 'build' ] = parseBuildNode( buildNode );

				}

				return modelData;

			}

			function buildTexture( texture2dgroup, objects, modelData, textureData ) {

				var texid = texture2dgroup.texid;
				var texture2ds = modelData.resources.texture2d;
				var texture2d = texture2ds[ texid ];

				if ( texture2d ) {

					var data = textureData[ texture2d.path ];
					var type = texture2d.contenttype;

					var blob = new Blob( [ data ], { type: type } );
					var sourceURI = URL.createObjectURL( blob );

					var texture = textureLoader.load( sourceURI, function () {

						URL.revokeObjectURL( sourceURI );

					} );

					texture.encoding = THREE.sRGBEncoding;

					// texture parameters

					switch ( texture2d.tilestyleu ) {

						case 'wrap':
							texture.wrapS = THREE.RepeatWrapping;
							break;

						case 'mirror':
							texture.wrapS = THREE.MirroredRepeatWrapping;
							break;

						case 'none':
						case 'clamp':
							texture.wrapS = THREE.ClampToEdgeWrapping;
							break;

						default:
							texture.wrapS = THREE.RepeatWrapping;

					}

					switch ( texture2d.tilestylev ) {

						case 'wrap':
							texture.wrapT = THREE.RepeatWrapping;
							break;

						case 'mirror':
							texture.wrapT = THREE.MirroredRepeatWrapping;
							break;

						case 'none':
						case 'clamp':
							texture.wrapT = THREE.ClampToEdgeWrapping;
							break;

						default:
							texture.wrapT = THREE.RepeatWrapping;

					}

					switch ( texture2d.filter ) {

						case 'auto':
							texture.magFilter = THREE.LinearFilter;
							texture.minFilter = THREE.LinearMipmapLinearFilter;
							break;

						case 'linear':
							texture.magFilter = THREE.LinearFilter;
							texture.minFilter = THREE.LinearFilter;
							break;

						case 'nearest':
							texture.magFilter = THREE.NearestFilter;
							texture.minFilter = THREE.NearestFilter;
							break;

						default:
							texture.magFilter = THREE.LinearFilter;
							texture.minFilter = THREE.LinearMipmapLinearFilter;

					}

					return texture;

				} else {

					return null;

				}

			}

			function buildBasematerialsMeshes( basematerials, triangleProperties, modelData, meshData, textureData, objectData ) {

				var objectPindex = objectData.pindex;

				var materialMap = {};

				for ( var i = 0, l = triangleProperties.length; i < l; i ++ ) {

					var triangleProperty = triangleProperties[ i ];
					var pindex = ( triangleProperty.p1 !== undefined ) ? triangleProperty.p1 : objectPindex;

					if ( materialMap[ pindex ] === undefined ) materialMap[ pindex ] = [];

					materialMap[ pindex ].push( triangleProperty );

				}

				//

				var keys = Object.keys( materialMap );
				var meshes = [];

				for ( var i = 0, l = keys.length; i < l; i ++ ) {

					var materialIndex = keys[ i ];
					var trianglePropertiesProps = materialMap[ materialIndex ];
					var basematerialData = basematerials.basematerials[ materialIndex ];
					var material = getBuild( basematerialData, objects, modelData, textureData, objectData, buildBasematerial );

					//

					var geometry = new THREE.BufferGeometry();

					var positionData = [];

					var vertices = meshData.vertices;

					for ( var j = 0, jl = trianglePropertiesProps.length; j < jl; j ++ ) {

						var triangleProperty = trianglePropertiesProps[ j ];

						positionData.push( vertices[ ( triangleProperty.v1 * 3 ) + 0 ] );
						positionData.push( vertices[ ( triangleProperty.v1 * 3 ) + 1 ] );
						positionData.push( vertices[ ( triangleProperty.v1 * 3 ) + 2 ] );

						positionData.push( vertices[ ( triangleProperty.v2 * 3 ) + 0 ] );
						positionData.push( vertices[ ( triangleProperty.v2 * 3 ) + 1 ] );
						positionData.push( vertices[ ( triangleProperty.v2 * 3 ) + 2 ] );

						positionData.push( vertices[ ( triangleProperty.v3 * 3 ) + 0 ] );
						positionData.push( vertices[ ( triangleProperty.v3 * 3 ) + 1 ] );
						positionData.push( vertices[ ( triangleProperty.v3 * 3 ) + 2 ] );


					}

					geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positionData, 3 ) );

					//

					var mesh = new THREE.Mesh( geometry, material );
					meshes.push( mesh );

				}

				return meshes;

			}

			function buildTexturedMesh( texture2dgroup, triangleProperties, modelData, meshData, textureData, objectData ) {

				// geometry

				var geometry = new THREE.BufferGeometry();

				var positionData = [];
				var uvData = [];

				var vertices = meshData.vertices;
				var uvs = texture2dgroup.uvs;

				for ( var i = 0, l = triangleProperties.length; i < l; i ++ ) {

					var triangleProperty = triangleProperties[ i ];

					positionData.push( vertices[ ( triangleProperty.v1 * 3 ) + 0 ] );
					positionData.push( vertices[ ( triangleProperty.v1 * 3 ) + 1 ] );
					positionData.push( vertices[ ( triangleProperty.v1 * 3 ) + 2 ] );

					positionData.push( vertices[ ( triangleProperty.v2 * 3 ) + 0 ] );
					positionData.push( vertices[ ( triangleProperty.v2 * 3 ) + 1 ] );
					positionData.push( vertices[ ( triangleProperty.v2 * 3 ) + 2 ] );

					positionData.push( vertices[ ( triangleProperty.v3 * 3 ) + 0 ] );
					positionData.push( vertices[ ( triangleProperty.v3 * 3 ) + 1 ] );
					positionData.push( vertices[ ( triangleProperty.v3 * 3 ) + 2 ] );

					//

					uvData.push( uvs[ ( triangleProperty.p1 * 2 ) + 0 ] );
					uvData.push( uvs[ ( triangleProperty.p1 * 2 ) + 1 ] );

					uvData.push( uvs[ ( triangleProperty.p2 * 2 ) + 0 ] );
					uvData.push( uvs[ ( triangleProperty.p2 * 2 ) + 1 ] );

					uvData.push( uvs[ ( triangleProperty.p3 * 2 ) + 0 ] );
					uvData.push( uvs[ ( triangleProperty.p3 * 2 ) + 1 ] );

				}

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positionData, 3 ) );
				geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvData, 2 ) );

				// material

				var texture = getBuild( texture2dgroup, objects, modelData, textureData, objectData, buildTexture );

				var material = new THREE.MeshPhongMaterial( { map: texture, flatShading: true } );

				// mesh

				var mesh = new THREE.Mesh( geometry, material );

				return mesh;

			}

			function buildVertexColorMesh( colorgroup, triangleProperties, modelData, meshData ) {

				// geometry

				var geometry = new THREE.BufferGeometry();

				var positionData = [];
				var colorData = [];

				var vertices = meshData.vertices;
				var colors = colorgroup.colors;

				for ( var i = 0, l = triangleProperties.length; i < l; i ++ ) {

					var triangleProperty = triangleProperties[ i ];

					var v1 = triangleProperty.v1;
					var v2 = triangleProperty.v2;
					var v3 = triangleProperty.v3;

					positionData.push( vertices[ ( v1 * 3 ) + 0 ] );
					positionData.push( vertices[ ( v1 * 3 ) + 1 ] );
					positionData.push( vertices[ ( v1 * 3 ) + 2 ] );

					positionData.push( vertices[ ( v2 * 3 ) + 0 ] );
					positionData.push( vertices[ ( v2 * 3 ) + 1 ] );
					positionData.push( vertices[ ( v2 * 3 ) + 2 ] );

					positionData.push( vertices[ ( v3 * 3 ) + 0 ] );
					positionData.push( vertices[ ( v3 * 3 ) + 1 ] );
					positionData.push( vertices[ ( v3 * 3 ) + 2 ] );

					//

					var p1 = triangleProperty.p1;
					var p2 = triangleProperty.p2;
					var p3 = triangleProperty.p3;

					colorData.push( colors[ ( p1 * 3 ) + 0 ] );
					colorData.push( colors[ ( p1 * 3 ) + 1 ] );
					colorData.push( colors[ ( p1 * 3 ) + 2 ] );

					colorData.push( colors[ ( ( p2 || p1 ) * 3 ) + 0 ] );
					colorData.push( colors[ ( ( p2 || p1 ) * 3 ) + 1 ] );
					colorData.push( colors[ ( ( p2 || p1 ) * 3 ) + 2 ] );

					colorData.push( colors[ ( ( p3 || p1 ) * 3 ) + 0 ] );
					colorData.push( colors[ ( ( p3 || p1 ) * 3 ) + 1 ] );
					colorData.push( colors[ ( ( p3 || p1 ) * 3 ) + 2 ] );

				}

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positionData, 3 ) );
				geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorData, 3 ) );

				// material

				var material = new THREE.MeshPhongMaterial( { vertexColors: true, flatShading: true } );

				// mesh

				var mesh = new THREE.Mesh( geometry, material );

				return mesh;

			}

			function buildDefaultMesh( meshData ) {

				var geometry = new THREE.BufferGeometry();
				geometry.setIndex( new THREE.BufferAttribute( meshData[ 'triangles' ], 1 ) );
				geometry.setAttribute( 'position', new THREE.BufferAttribute( meshData[ 'vertices' ], 3 ) );

				var material = new THREE.MeshPhongMaterial( { color: 0xaaaaff, flatShading: true } );

				var mesh = new THREE.Mesh( geometry, material );

				return mesh;

			}

			function buildMeshes( resourceMap, modelData, meshData, textureData, objectData ) {

				var keys = Object.keys( resourceMap );
				var meshes = [];

				for ( var i = 0, il = keys.length; i < il; i ++ ) {

					var resourceId = keys[ i ];
					var triangleProperties = resourceMap[ resourceId ];
					var resourceType = getResourceType( resourceId, modelData );

					switch ( resourceType ) {

						case 'material':
							var basematerials = modelData.resources.basematerials[ resourceId ];
							var newMeshes = buildBasematerialsMeshes( basematerials, triangleProperties, modelData, meshData, textureData, objectData );

							for ( var j = 0, jl = newMeshes.length; j < jl; j ++ ) {

								meshes.push( newMeshes[ j ] );

							}
							break;

						case 'texture':
							var texture2dgroup = modelData.resources.texture2dgroup[ resourceId ];
							meshes.push( buildTexturedMesh( texture2dgroup, triangleProperties, modelData, meshData, textureData, objectData ) );
							break;

						case 'vertexColors':
							var colorgroup = modelData.resources.colorgroup[ resourceId ];
							meshes.push( buildVertexColorMesh( colorgroup, triangleProperties, modelData, meshData ) );
							break;

						case 'default':
							meshes.push( buildDefaultMesh( meshData ) );
							break;

						default:
							console.error( 'THREE.3MFLoader: Unsupported resource type.' );

					}

				}

				return meshes;

			}

			function getResourceType( pid, modelData ) {

				if ( modelData.resources.texture2dgroup[ pid ] !== undefined ) {

					return 'texture';

				} else if ( modelData.resources.basematerials[ pid ] !== undefined ) {

					return 'material';

				} else if ( modelData.resources.colorgroup[ pid ] !== undefined ) {

					return 'vertexColors';

				} else if ( pid === 'default' ) {

					return 'default';

				} else {

					return undefined;

				}

			}

			function analyzeObject( modelData, meshData, objectData ) {

				var resourceMap = {};

				var triangleProperties = meshData[ 'triangleProperties' ];

				var objectPid = objectData.pid;

				for ( var i = 0, l = triangleProperties.length; i < l; i ++ ) {

					var triangleProperty = triangleProperties[ i ];
					var pid = ( triangleProperty.pid !== undefined ) ? triangleProperty.pid : objectPid;

					if ( pid === undefined ) pid = 'default';

					if ( resourceMap[ pid ] === undefined ) resourceMap[ pid ] = [];

					resourceMap[ pid ].push( triangleProperty );

				}

				return resourceMap;

			}

			function buildGroup( meshData, objects, modelData, textureData, objectData ) {

				var group = new THREE.Group();

				var resourceMap = analyzeObject( modelData, meshData, objectData );
				var meshes = buildMeshes( resourceMap, modelData, meshData, textureData, objectData );

				for ( var i = 0, l = meshes.length; i < l; i ++ ) {

					group.add( meshes[ i ] );

				}

				return group;

			}

			function applyExtensions( extensions, meshData, modelXml ) {

				if ( ! extensions ) {

					return;

				}

				var availableExtensions = [];
				var keys = Object.keys( extensions );

				for ( var i = 0; i < keys.length; i ++ ) {

					var ns = keys[ i ];

					for ( var j = 0; j < scope.availableExtensions.length; j ++ ) {

						var extension = scope.availableExtensions[ j ];

						if ( extension.ns === ns ) {

							availableExtensions.push( extension );

						}

					}

				}

				for ( var i = 0; i < availableExtensions.length; i ++ ) {

					var extension = availableExtensions[ i ];
					extension.apply( modelXml, extensions[ extension[ 'ns' ] ], meshData );

				}

			}

			function getBuild( data, objects, modelData, textureData, objectData, builder ) {

				if ( data.build !== undefined ) return data.build;

				data.build = builder( data, objects, modelData, textureData, objectData );

				return data.build;

			}

			function buildBasematerial( materialData, objects, modelData ) {

				var material;

				var displaypropertiesid = materialData.displaypropertiesid;
				var pbmetallicdisplayproperties = modelData.resources.pbmetallicdisplayproperties;

				if ( displaypropertiesid !== null && pbmetallicdisplayproperties[ displaypropertiesid ] !== undefined ) {

					// metallic display property, use StandardMaterial

					var pbmetallicdisplayproperty = pbmetallicdisplayproperties[ displaypropertiesid ];
					var metallicData = pbmetallicdisplayproperty.data[ materialData.index ];

					material = new THREE.MeshStandardMaterial( { flatShading: true, roughness: metallicData.roughness, metalness: metallicData.metallicness } );

				} else {

					// otherwise use PhongMaterial

					material = new THREE.MeshPhongMaterial( { flatShading: true } );

				}

				material.name = materialData.name;

				// displaycolor MUST be specified with a value of a 6 or 8 digit hexadecimal number, e.g. "#RRGGBB" or "#RRGGBBAA"

				var displaycolor = materialData.displaycolor;

				var color = displaycolor.substring( 0, 7 );
				material.color.setStyle( color );
				material.color.convertSRGBToLinear(); // displaycolor is in sRGB

				// process alpha if set

				if ( displaycolor.length === 9 ) {

					material.opacity = parseInt( displaycolor.charAt( 7 ) + displaycolor.charAt( 8 ), 16 ) / 255;

				}

				return material;

			}

			function buildComposite( compositeData, objects, modelData, textureData ) {

				var composite = new THREE.Group();

				for ( var j = 0; j < compositeData.length; j ++ ) {

					var component = compositeData[ j ];
					var build = objects[ component.objectId ];

					if ( build === undefined ) {

						buildObject( component.objectId, objects, modelData, textureData );
						build = objects[ component.objectId ];

					}

					var object3D = build.clone();

					// apply component transfrom

					var transform = component.transform;

					if ( transform ) {

						object3D.applyMatrix4( transform );

					}

					composite.add( object3D );

				}

				return composite;

			}

			function buildObject( objectId, objects, modelData, textureData ) {

				var objectData = modelData[ 'resources' ][ 'object' ][ objectId ];

				if ( objectData[ 'mesh' ] ) {

					var meshData = objectData[ 'mesh' ];

					var extensions = modelData[ 'extensions' ];
					var modelXml = modelData[ 'xml' ];

					applyExtensions( extensions, meshData, modelXml );

					objects[ objectData.id ] = getBuild( meshData, objects, modelData, textureData, objectData, buildGroup );

				} else {

					var compositeData = objectData[ 'components' ];

					objects[ objectData.id ] = getBuild( compositeData, objects, modelData, textureData, objectData, buildComposite );

				}

			}

			function buildObjects( data3mf ) {

				var modelsData = data3mf.model;
				var modelRels = data3mf.modelRels;
				var objects = {};
				var modelsKeys = Object.keys( modelsData );
				var textureData = {};

				// evaluate model relationships to textures

				if ( modelRels ) {

					for ( var i = 0, l = modelRels.length; i < l; i ++ ) {

						var modelRel = modelRels[ i ];
						var textureKey = modelRel.target.substring( 1 );

						if ( data3mf.texture[ textureKey ] ) {

							textureData[ modelRel.target ] = data3mf.texture[ textureKey ];

						}

					}

				}

				// start build

				for ( var i = 0; i < modelsKeys.length; i ++ ) {

					var modelsKey = modelsKeys[ i ];
					var modelData = modelsData[ modelsKey ];

					var objectIds = Object.keys( modelData[ 'resources' ][ 'object' ] );

					for ( var j = 0; j < objectIds.length; j ++ ) {

						var objectId = objectIds[ j ];

						buildObject( objectId, objects, modelData, textureData );

					}

				}

				return objects;

			}

			function build( objects, data3mf ) {

				var group = new THREE.Group();

				var relationship = data3mf[ 'rels' ][ 0 ];
				var buildData = data3mf.model[ relationship[ 'target' ].substring( 1 ) ][ 'build' ];

				for ( var i = 0; i < buildData.length; i ++ ) {

					var buildItem = buildData[ i ];
					var object3D = objects[ buildItem[ 'objectId' ] ];

					// apply transform

					var transform = buildItem[ 'transform' ];

					if ( transform ) {

						object3D.applyMatrix4( transform );

					}

					group.add( object3D );

				}

				return group;

			}

			var data3mf = loadDocument( data );
			var objects = buildObjects( data3mf );

			return build( objects, data3mf );

		},

		addExtension: function ( extension ) {

			this.availableExtensions.push( extension );

		}

	} );
	
	return THREE.ThreeMFLoader;
});

define('skylark-threejs-ex/loaders/AMFLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author tamarintech / https://tamarintech.com
	 *
	 * Description: Early release of an AMF Loader following the pattern of the
	 * example loaders in the three.js project.
	 *
	 * More information about the AMF format: http://amf.wikispaces.com
	 *
	 * Usage:
	 *	var loader = new AMFLoader();
	 *	loader.load('/path/to/project.amf', function(objecttree) {
	 *		scene.add(objecttree);
	 *	});
	 *
	 * Materials now supported, material colors supported
	 * Zip support, requires jszip
	 * No constellation support (yet)!
	 *
	 */

	THREE.AMFLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

	};

	THREE.AMFLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.AMFLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text ) );

			}, onProgress, onError );

		},

		parse: function ( data ) {

			function loadDocument( data ) {

				var view = new DataView( data );
				var magic = String.fromCharCode( view.getUint8( 0 ), view.getUint8( 1 ) );

				if ( magic === 'PK' ) {

					var zip = null;
					var file = null;

					console.log( 'THREE.AMFLoader: Loading Zip' );

					try {

						zip = new JSZip( data ); // eslint-disable-line no-undef

					} catch ( e ) {

						if ( e instanceof ReferenceError ) {

							console.log( 'THREE.AMFLoader: jszip missing and file is compressed.' );
							return null;

						}

					}

					for ( file in zip.files ) {

						if ( file.toLowerCase().substr( - 4 ) === '.amf' ) {

							break;

						}

					}

					console.log( 'THREE.AMFLoader: Trying to load file asset: ' + file );
					view = new DataView( zip.file( file ).asArrayBuffer() );

				}

				var fileText = THREE.LoaderUtils.decodeText( view );
				var xmlData = new DOMParser().parseFromString( fileText, 'application/xml' );

				if ( xmlData.documentElement.nodeName.toLowerCase() !== 'amf' ) {

					console.log( 'THREE.AMFLoader: Error loading AMF - no AMF document found.' );
					return null;

				}

				return xmlData;

			}

			function loadDocumentScale( node ) {

				var scale = 1.0;
				var unit = 'millimeter';

				if ( node.documentElement.attributes.unit !== undefined ) {

					unit = node.documentElement.attributes.unit.value.toLowerCase();

				}

				var scaleUnits = {
					millimeter: 1.0,
					inch: 25.4,
					feet: 304.8,
					meter: 1000.0,
					micron: 0.001
				};

				if ( scaleUnits[ unit ] !== undefined ) {

					scale = scaleUnits[ unit ];

				}

				console.log( 'THREE.AMFLoader: Unit scale: ' + scale );
				return scale;

			}

			function loadMaterials( node ) {

				var matName = 'AMF Material';
				var matId = node.attributes.id.textContent;
				var color = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

				var loadedMaterial = null;

				for ( var i = 0; i < node.childNodes.length; i ++ ) {

					var matChildEl = node.childNodes[ i ];

					if ( matChildEl.nodeName === 'metadata' && matChildEl.attributes.type !== undefined ) {

						if ( matChildEl.attributes.type.value === 'name' ) {

							matName = matChildEl.textContent;

						}

					} else if ( matChildEl.nodeName === 'color' ) {

						color = loadColor( matChildEl );

					}

				}

				loadedMaterial = new THREE.MeshPhongMaterial( {
					flatShading: true,
					color: new THREE.Color( color.r, color.g, color.b ),
					name: matName
				} );

				if ( color.a !== 1.0 ) {

					loadedMaterial.transparent = true;
					loadedMaterial.opacity = color.a;

				}

				return { id: matId, material: loadedMaterial };

			}

			function loadColor( node ) {

				var color = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

				for ( var i = 0; i < node.childNodes.length; i ++ ) {

					var matColor = node.childNodes[ i ];

					if ( matColor.nodeName === 'r' ) {

						color.r = matColor.textContent;

					} else if ( matColor.nodeName === 'g' ) {

						color.g = matColor.textContent;

					} else if ( matColor.nodeName === 'b' ) {

						color.b = matColor.textContent;

					} else if ( matColor.nodeName === 'a' ) {

						color.a = matColor.textContent;

					}

				}

				return color;

			}

			function loadMeshVolume( node ) {

				var volume = { name: '', triangles: [], materialid: null };

				var currVolumeNode = node.firstElementChild;

				if ( node.attributes.materialid !== undefined ) {

					volume.materialId = node.attributes.materialid.nodeValue;

				}

				while ( currVolumeNode ) {

					if ( currVolumeNode.nodeName === 'metadata' ) {

						if ( currVolumeNode.attributes.type !== undefined ) {

							if ( currVolumeNode.attributes.type.value === 'name' ) {

								volume.name = currVolumeNode.textContent;

							}

						}

					} else if ( currVolumeNode.nodeName === 'triangle' ) {

						var v1 = currVolumeNode.getElementsByTagName( 'v1' )[ 0 ].textContent;
						var v2 = currVolumeNode.getElementsByTagName( 'v2' )[ 0 ].textContent;
						var v3 = currVolumeNode.getElementsByTagName( 'v3' )[ 0 ].textContent;

						volume.triangles.push( v1, v2, v3 );

					}

					currVolumeNode = currVolumeNode.nextElementSibling;

				}

				return volume;

			}

			function loadMeshVertices( node ) {

				var vertArray = [];
				var normalArray = [];
				var currVerticesNode = node.firstElementChild;

				while ( currVerticesNode ) {

					if ( currVerticesNode.nodeName === 'vertex' ) {

						var vNode = currVerticesNode.firstElementChild;

						while ( vNode ) {

							if ( vNode.nodeName === 'coordinates' ) {

								var x = vNode.getElementsByTagName( 'x' )[ 0 ].textContent;
								var y = vNode.getElementsByTagName( 'y' )[ 0 ].textContent;
								var z = vNode.getElementsByTagName( 'z' )[ 0 ].textContent;

								vertArray.push( x, y, z );

							} else if ( vNode.nodeName === 'normal' ) {

								var nx = vNode.getElementsByTagName( 'nx' )[ 0 ].textContent;
								var ny = vNode.getElementsByTagName( 'ny' )[ 0 ].textContent;
								var nz = vNode.getElementsByTagName( 'nz' )[ 0 ].textContent;

								normalArray.push( nx, ny, nz );

							}

							vNode = vNode.nextElementSibling;

						}

					}
					currVerticesNode = currVerticesNode.nextElementSibling;

				}

				return { 'vertices': vertArray, 'normals': normalArray };

			}

			function loadObject( node ) {

				var objId = node.attributes.id.textContent;
				var loadedObject = { name: 'amfobject', meshes: [] };
				var currColor = null;
				var currObjNode = node.firstElementChild;

				while ( currObjNode ) {

					if ( currObjNode.nodeName === 'metadata' ) {

						if ( currObjNode.attributes.type !== undefined ) {

							if ( currObjNode.attributes.type.value === 'name' ) {

								loadedObject.name = currObjNode.textContent;

							}

						}

					} else if ( currObjNode.nodeName === 'color' ) {

						currColor = loadColor( currObjNode );

					} else if ( currObjNode.nodeName === 'mesh' ) {

						var currMeshNode = currObjNode.firstElementChild;
						var mesh = { vertices: [], normals: [], volumes: [], color: currColor };

						while ( currMeshNode ) {

							if ( currMeshNode.nodeName === 'vertices' ) {

								var loadedVertices = loadMeshVertices( currMeshNode );

								mesh.normals = mesh.normals.concat( loadedVertices.normals );
								mesh.vertices = mesh.vertices.concat( loadedVertices.vertices );

							} else if ( currMeshNode.nodeName === 'volume' ) {

								mesh.volumes.push( loadMeshVolume( currMeshNode ) );

							}

							currMeshNode = currMeshNode.nextElementSibling;

						}

						loadedObject.meshes.push( mesh );

					}

					currObjNode = currObjNode.nextElementSibling;

				}

				return { 'id': objId, 'obj': loadedObject };

			}

			var xmlData = loadDocument( data );
			var amfName = '';
			var amfAuthor = '';
			var amfScale = loadDocumentScale( xmlData );
			var amfMaterials = {};
			var amfObjects = {};
			var childNodes = xmlData.documentElement.childNodes;

			var i, j;

			for ( i = 0; i < childNodes.length; i ++ ) {

				var child = childNodes[ i ];

				if ( child.nodeName === 'metadata' ) {

					if ( child.attributes.type !== undefined ) {

						if ( child.attributes.type.value === 'name' ) {

							amfName = child.textContent;

						} else if ( child.attributes.type.value === 'author' ) {

							amfAuthor = child.textContent;

						}

					}

				} else if ( child.nodeName === 'material' ) {

					var loadedMaterial = loadMaterials( child );

					amfMaterials[ loadedMaterial.id ] = loadedMaterial.material;

				} else if ( child.nodeName === 'object' ) {

					var loadedObject = loadObject( child );

					amfObjects[ loadedObject.id ] = loadedObject.obj;

				}

			}

			var sceneObject = new THREE.Group();
			var defaultMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaff, flatShading: true } );

			sceneObject.name = amfName;
			sceneObject.userData.author = amfAuthor;
			sceneObject.userData.loader = 'AMF';

			for ( var id in amfObjects ) {

				var part = amfObjects[ id ];
				var meshes = part.meshes;
				var newObject = new THREE.Group();
				newObject.name = part.name || '';

				for ( i = 0; i < meshes.length; i ++ ) {

					var objDefaultMaterial = defaultMaterial;
					var mesh = meshes[ i ];
					var vertices = new THREE.Float32BufferAttribute( mesh.vertices, 3 );
					var normals = null;

					if ( mesh.normals.length ) {

						normals = new THREE.Float32BufferAttribute( mesh.normals, 3 );

					}

					if ( mesh.color ) {

						var color = mesh.color;

						objDefaultMaterial = defaultMaterial.clone();
						objDefaultMaterial.color = new THREE.Color( color.r, color.g, color.b );

						if ( color.a !== 1.0 ) {

							objDefaultMaterial.transparent = true;
							objDefaultMaterial.opacity = color.a;

						}

					}

					var volumes = mesh.volumes;

					for ( j = 0; j < volumes.length; j ++ ) {

						var volume = volumes[ j ];
						var newGeometry = new THREE.BufferGeometry();
						var material = objDefaultMaterial;

						newGeometry.setIndex( volume.triangles );
						newGeometry.setAttribute( 'position', vertices.clone() );

						if ( normals ) {

							newGeometry.setAttribute( 'normal', normals.clone() );

						}

						if ( amfMaterials[ volume.materialId ] !== undefined ) {

							material = amfMaterials[ volume.materialId ];

						}

						newGeometry.scale( amfScale, amfScale, amfScale );
						newObject.add( new THREE.Mesh( newGeometry, material.clone() ) );

					}

				}

				sceneObject.add( newObject );

			}

			return sceneObject;

		}

	} );
	
	return THREE.AMFLoader;
});

define('skylark-threejs-ex/loaders/AssimpLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Virtulous / https://virtulo.us/
	 */

	THREE.AssimpLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

	};

	THREE.AssimpLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.AssimpLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = ( scope.path === '' ) ? THREE.LoaderUtils.extractUrlBase( url ) : scope.path;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( scope.path );
			loader.setResponseType( 'arraybuffer' );

			loader.load( url, function ( buffer ) {

				onLoad( scope.parse( buffer, path ) );

			}, onProgress, onError );

		},

		parse: function ( buffer, path ) {

			var textureLoader = new THREE.TextureLoader( this.manager );
			textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

			var Virtulous = {};

			Virtulous.KeyFrame = function ( time, matrix ) {

				this.time = time;
				this.matrix = matrix.clone();
				this.position = new THREE.Vector3();
				this.quaternion = new THREE.Quaternion();
				this.scale = new THREE.Vector3( 1, 1, 1 );
				this.matrix.decompose( this.position, this.quaternion, this.scale );
				this.clone = function () {

					var n = new Virtulous.KeyFrame( this.time, this.matrix );
					return n;

				};
				this.lerp = function ( nextKey, time ) {

					time -= this.time;
					var dist = ( nextKey.time - this.time );
					var l = time / dist;
					var l2 = 1 - l;
					var keypos = this.position;
					var keyrot = this.quaternion;
					//      var keyscl =  key.parentspaceScl || key.scl;
					var key2pos = nextKey.position;
					var key2rot = nextKey.quaternion;
					//  var key2scl =  key2.parentspaceScl || key2.scl;
					Virtulous.KeyFrame.tempAniPos.x = keypos.x * l2 + key2pos.x * l;
					Virtulous.KeyFrame.tempAniPos.y = keypos.y * l2 + key2pos.y * l;
					Virtulous.KeyFrame.tempAniPos.z = keypos.z * l2 + key2pos.z * l;
					//     tempAniScale.x = keyscl[0] * l2 + key2scl[0] * l;
					//     tempAniScale.y = keyscl[1] * l2 + key2scl[1] * l;
					//     tempAniScale.z = keyscl[2] * l2 + key2scl[2] * l;
					Virtulous.KeyFrame.tempAniQuat.set( keyrot.x, keyrot.y, keyrot.z, keyrot.w );
					Virtulous.KeyFrame.tempAniQuat.slerp( key2rot, l );
					return Virtulous.KeyFrame.tempAniMatrix.compose( Virtulous.KeyFrame.tempAniPos, Virtulous.KeyFrame.tempAniQuat, Virtulous.KeyFrame.tempAniScale );

				};

			};

			Virtulous.KeyFrame.tempAniPos = new THREE.Vector3();
			Virtulous.KeyFrame.tempAniQuat = new THREE.Quaternion();
			Virtulous.KeyFrame.tempAniScale = new THREE.Vector3( 1, 1, 1 );
			Virtulous.KeyFrame.tempAniMatrix = new THREE.Matrix4();
			Virtulous.KeyFrameTrack = function () {

				this.keys = [];
				this.target = null;
				this.time = 0;
				this.length = 0;
				this._accelTable = {};
				this.fps = 20;
				this.addKey = function ( key ) {

					this.keys.push( key );

				};
				this.init = function () {

					this.sortKeys();

					if ( this.keys.length > 0 )
						this.length = this.keys[ this.keys.length - 1 ].time;
					else
						this.length = 0;

					if ( ! this.fps ) return;

					for ( var j = 0; j < this.length * this.fps; j ++ ) {

						for ( var i = 0; i < this.keys.length; i ++ ) {

							if ( this.keys[ i ].time == j ) {

								this._accelTable[ j ] = i;
								break;

							} else if ( this.keys[ i ].time < j / this.fps && this.keys[ i + 1 ] && this.keys[ i + 1 ].time >= j / this.fps ) {

								this._accelTable[ j ] = i;
								break;

							}

						}

					}

				};

				this.parseFromThree = function ( data ) {

					var fps = data.fps;
					this.target = data.node;
					var track = data.hierarchy[ 0 ].keys;
					for ( var i = 0; i < track.length; i ++ ) {

						this.addKey( new Virtulous.KeyFrame( i / fps || track[ i ].time, track[ i ].targets[ 0 ].data ) );

					}
					this.init();

				};

				this.parseFromCollada = function ( data ) {

					var track = data.keys;
					var fps = this.fps;

					for ( var i = 0; i < track.length; i ++ ) {

						this.addKey( new Virtulous.KeyFrame( i / fps || track[ i ].time, track[ i ].matrix ) );

					}

					this.init();

				};

				this.sortKeys = function () {

					this.keys.sort( this.keySortFunc );

				};

				this.keySortFunc = function ( a, b ) {

					return a.time - b.time;

				};

				this.clone = function () {

					var t = new Virtulous.KeyFrameTrack();
					t.target = this.target;
					t.time = this.time;
					t.length = this.length;

					for ( var i = 0; i < this.keys.length; i ++ ) {

						t.addKey( this.keys[ i ].clone() );

					}

					t.init();
					return t;

				};

				this.reTarget = function ( root, compareitor ) {

					if ( ! compareitor ) compareitor = Virtulous.TrackTargetNodeNameCompare;
					this.target = compareitor( root, this.target );

				};

				this.keySearchAccel = function ( time ) {

					time *= this.fps;
					time = Math.floor( time );
					return this._accelTable[ time ] || 0;

				};

				this.setTime = function ( time ) {

					time = Math.abs( time );
					if ( this.length )
						time = time % this.length + .05;
					var key0 = null;
					var key1 = null;

					for ( var i = this.keySearchAccel( time ); i < this.keys.length; i ++ ) {

						if ( this.keys[ i ].time == time ) {

							key0 = this.keys[ i ];
							key1 = this.keys[ i ];
							break;

						} else if ( this.keys[ i ].time < time && this.keys[ i + 1 ] && this.keys[ i + 1 ].time > time ) {

							key0 = this.keys[ i ];
							key1 = this.keys[ i + 1 ];
							break;

						} else if ( this.keys[ i ].time < time && i == this.keys.length - 1 ) {

							key0 = this.keys[ i ];
							key1 = this.keys[ 0 ].clone();
							key1.time += this.length + .05;
							break;

						}

					}

					if ( key0 && key1 && key0 !== key1 ) {

						this.target.matrixAutoUpdate = false;
						this.target.matrix.copy( key0.lerp( key1, time ) );
						this.target.matrixWorldNeedsUpdate = true;
						return;

					}

					if ( key0 && key1 && key0 == key1 ) {

						this.target.matrixAutoUpdate = false;
						this.target.matrix.copy( key0.matrix );
						this.target.matrixWorldNeedsUpdate = true;
						return;

					}

				};

			};

			Virtulous.TrackTargetNodeNameCompare = function ( root, target ) {

				function find( node, name ) {

					if ( node.name == name )
						return node;

					for ( var i = 0; i < node.children.length; i ++ ) {

						var r = find( node.children[ i ], name );
						if ( r ) return r;

					}

					return null;

				}

				return find( root, target.name );

			};

			Virtulous.Animation = function () {

				this.tracks = [];
				this.length = 0;

				this.addTrack = function ( track ) {

					this.tracks.push( track );
					this.length = Math.max( track.length, this.length );

				};

				this.setTime = function ( time ) {

					this.time = time;

					for ( var i = 0; i < this.tracks.length; i ++ )
						this.tracks[ i ].setTime( time );

				};

				this.clone = function ( target, compareitor ) {

					if ( ! compareitor ) compareitor = Virtulous.TrackTargetNodeNameCompare;
					var n = new Virtulous.Animation();
					n.target = target;
					for ( var i = 0; i < this.tracks.length; i ++ ) {

						var track = this.tracks[ i ].clone();
						track.reTarget( target, compareitor );
						n.addTrack( track );

					}

					return n;

				};

			};

			var ASSBIN_CHUNK_AICAMERA = 0x1234;
			var ASSBIN_CHUNK_AILIGHT = 0x1235;
			var ASSBIN_CHUNK_AITEXTURE = 0x1236;
			var ASSBIN_CHUNK_AIMESH = 0x1237;
			var ASSBIN_CHUNK_AINODEANIM = 0x1238;
			var ASSBIN_CHUNK_AISCENE = 0x1239;
			var ASSBIN_CHUNK_AIBONE = 0x123a;
			var ASSBIN_CHUNK_AIANIMATION = 0x123b;
			var ASSBIN_CHUNK_AINODE = 0x123c;
			var ASSBIN_CHUNK_AIMATERIAL = 0x123d;
			var ASSBIN_CHUNK_AIMATERIALPROPERTY = 0x123e;
			var ASSBIN_MESH_HAS_POSITIONS = 0x1;
			var ASSBIN_MESH_HAS_NORMALS = 0x2;
			var ASSBIN_MESH_HAS_TANGENTS_AND_BITANGENTS = 0x4;
			var ASSBIN_MESH_HAS_TEXCOORD_BASE = 0x100;
			var ASSBIN_MESH_HAS_COLOR_BASE = 0x10000;
			var AI_MAX_NUMBER_OF_COLOR_SETS = 1;
			var AI_MAX_NUMBER_OF_TEXTURECOORDS = 4;
			//var aiLightSource_UNDEFINED = 0x0;
			//! A directional light source has a well-defined direction
			//! but is infinitely far away. That's quite a good
			//! approximation for sun light.
			var aiLightSource_DIRECTIONAL = 0x1;
			//! A point light source has a well-defined position
			//! in space but no direction - it emits light in all
			//! directions. A normal bulb is a point light.
			//var aiLightSource_POINT = 0x2;
			//! A spot light source emits light in a specific
			//! angle. It has a position and a direction it is pointing to.
			//! A good example for a spot light is a light spot in
			//! sport arenas.
			var aiLightSource_SPOT = 0x3;
			//! The generic light level of the world, including the bounces
			//! of all other lightsources.
			//! Typically, there's at most one ambient light in a scene.
			//! This light type doesn't have a valid position, direction, or
			//! other properties, just a color.
			//var aiLightSource_AMBIENT = 0x4;
			/** Flat shading. Shading is done on per-face base,
			 *  diffuse only. Also known as 'faceted shading'.
			 */
			//var aiShadingMode_Flat = 0x1;
			/** Simple Gouraud shading.
			 */
			//var aiShadingMode_Gouraud = 0x2;
			/** Phong-Shading -
			 */
			//var aiShadingMode_Phong = 0x3;
			/** Phong-Blinn-Shading
			 */
			//var aiShadingMode_Blinn = 0x4;
			/** Toon-Shading per pixel
			 *
			 *  Also known as 'comic' shader.
			 */
			//var aiShadingMode_Toon = 0x5;
			/** OrenNayar-Shading per pixel
			 *
			 *  Extension to standard Lambertian shading, taking the
			 *  roughness of the material into account
			 */
			//var aiShadingMode_OrenNayar = 0x6;
			/** Minnaert-Shading per pixel
			 *
			 *  Extension to standard Lambertian shading, taking the
			 *  "darkness" of the material into account
			 */
			//var aiShadingMode_Minnaert = 0x7;
			/** CookTorrance-Shading per pixel
			 *
			 *  Special shader for metallic surfaces.
			 */
			//var aiShadingMode_CookTorrance = 0x8;
			/** No shading at all. Constant light influence of 1.0.
			 */
			//var aiShadingMode_NoShading = 0x9;
			/** Fresnel shading
			 */
			//var aiShadingMode_Fresnel = 0xa;
			//var aiTextureType_NONE = 0x0;
			/** The texture is combined with the result of the diffuse
			 *  lighting equation.
			 */
			var aiTextureType_DIFFUSE = 0x1;
			/** The texture is combined with the result of the specular
			 *  lighting equation.
			 */
			//var aiTextureType_SPECULAR = 0x2;
			/** The texture is combined with the result of the ambient
			 *  lighting equation.
			 */
			//var aiTextureType_AMBIENT = 0x3;
			/** The texture is added to the result of the lighting
			 *  calculation. It isn't influenced by incoming light.
			 */
			//var aiTextureType_EMISSIVE = 0x4;
			/** The texture is a height map.
			 *
			 *  By convention, higher gray-scale values stand for
			 *  higher elevations from the base height.
			 */
			//var aiTextureType_HEIGHT = 0x5;
			/** The texture is a (tangent space) normal-map.
			 *
			 *  Again, there are several conventions for tangent-space
			 *  normal maps. Assimp does (intentionally) not
			 *  distinguish here.
			 */
			var aiTextureType_NORMALS = 0x6;
			/** The texture defines the glossiness of the material.
			 *
			 *  The glossiness is in fact the exponent of the specular
			 *  (phong) lighting equation. Usually there is a conversion
			 *  function defined to map the linear color values in the
			 *  texture to a suitable exponent. Have fun.
			 */
			//var aiTextureType_SHININESS = 0x7;
			/** The texture defines per-pixel opacity.
			 *
			 *  Usually 'white' means opaque and 'black' means
			 *  'transparency'. Or quite the opposite. Have fun.
			 */
			var aiTextureType_OPACITY = 0x8;
			/** Displacement texture
			 *
			 *  The exact purpose and format is application-dependent.
			 *  Higher color values stand for higher vertex displacements.
			 */
			//var aiTextureType_DISPLACEMENT = 0x9;
			/** Lightmap texture (aka Ambient Occlusion)
			 *
			 *  Both 'Lightmaps' and dedicated 'ambient occlusion maps' are
			 *  covered by this material property. The texture contains a
			 *  scaling value for the final color value of a pixel. Its
			 *  intensity is not affected by incoming light.
			 */
			var aiTextureType_LIGHTMAP = 0xA;
			/** Reflection texture
			 *
			 * Contains the color of a perfect mirror reflection.
			 * Rarely used, almost never for real-time applications.
			 */
			//var aiTextureType_REFLECTION = 0xB;
			/** Unknown texture
			 *
			 *  A texture reference that does not match any of the definitions
			 *  above is considered to be 'unknown'. It is still imported,
			 *  but is excluded from any further postprocessing.
			 */
			//var aiTextureType_UNKNOWN = 0xC;
			var BONESPERVERT = 4;

			function ASSBIN_MESH_HAS_TEXCOORD( n ) {

				return ASSBIN_MESH_HAS_TEXCOORD_BASE << n;

			}

			function ASSBIN_MESH_HAS_COLOR( n ) {

				return ASSBIN_MESH_HAS_COLOR_BASE << n;

			}

			function markBones( scene ) {

				for ( var i in scene.mMeshes ) {

					var mesh = scene.mMeshes[ i ];
					for ( var k in mesh.mBones ) {

						var boneNode = scene.findNode( mesh.mBones[ k ].mName );
						if ( boneNode )
							boneNode.isBone = true;

					}

				}

			}
			function cloneTreeToBones( root, scene ) {

				var rootBone = new THREE.Bone();
				rootBone.matrix.copy( root.matrix );
				rootBone.matrixWorld.copy( root.matrixWorld );
				rootBone.position.copy( root.position );
				rootBone.quaternion.copy( root.quaternion );
				rootBone.scale.copy( root.scale );
				scene.nodeCount ++;
				rootBone.name = "bone_" + root.name + scene.nodeCount.toString();

				if ( ! scene.nodeToBoneMap[ root.name ] )
					scene.nodeToBoneMap[ root.name ] = [];
				scene.nodeToBoneMap[ root.name ].push( rootBone );
				for ( var i in root.children ) {

					var child = cloneTreeToBones( root.children[ i ], scene );
					rootBone.add( child );

				}

				return rootBone;

			}

			function sortWeights( indexes, weights ) {

				var pairs = [];

				for ( var i = 0; i < indexes.length; i ++ ) {

					pairs.push( {
						i: indexes[ i ],
						w: weights[ i ]
					} );

				}

				pairs.sort( function ( a, b ) {

					return b.w - a.w;

				 } );

				while ( pairs.length < 4 ) {

					pairs.push( {
						i: 0,
						w: 0
					} );

				}

				if ( pairs.length > 4 )
					pairs.length = 4;
				var sum = 0;

				for ( var i = 0; i < 4; i ++ ) {

					sum += pairs[ i ].w * pairs[ i ].w;

				}

				sum = Math.sqrt( sum );

				for ( var i = 0; i < 4; i ++ ) {

					pairs[ i ].w = pairs[ i ].w / sum;
					indexes[ i ] = pairs[ i ].i;
					weights[ i ] = pairs[ i ].w;

				}

			}

			function findMatchingBone( root, name ) {

				if ( root.name.indexOf( "bone_" + name ) == 0 )
					return root;

				for ( var i in root.children ) {

					var ret = findMatchingBone( root.children[ i ], name );

					if ( ret )
						return ret;

				}

				return undefined;

			}

			function aiMesh() {

				this.mPrimitiveTypes = 0;
				this.mNumVertices = 0;
				this.mNumFaces = 0;
				this.mNumBones = 0;
				this.mMaterialIndex = 0;
				this.mVertices = [];
				this.mNormals = [];
				this.mTangents = [];
				this.mBitangents = [];
				this.mColors = [
					[]
				];
				this.mTextureCoords = [
					[]
				];
				this.mFaces = [];
				this.mBones = [];
				this.hookupSkeletons = function ( scene ) {

					if ( this.mBones.length == 0 ) return;

					var allBones = [];
					var offsetMatrix = [];
					var skeletonRoot = scene.findNode( this.mBones[ 0 ].mName );

					while ( skeletonRoot.mParent && skeletonRoot.mParent.isBone ) {

						skeletonRoot = skeletonRoot.mParent;

					}

					var threeSkeletonRoot = skeletonRoot.toTHREE( scene );
					var threeSkeletonRootBone = cloneTreeToBones( threeSkeletonRoot, scene );
					this.threeNode.add( threeSkeletonRootBone );

					for ( var i = 0; i < this.mBones.length; i ++ ) {

						var bone = findMatchingBone( threeSkeletonRootBone, this.mBones[ i ].mName );

						if ( bone ) {

							var tbone = bone;
							allBones.push( tbone );
							//tbone.matrixAutoUpdate = false;
							offsetMatrix.push( this.mBones[ i ].mOffsetMatrix.toTHREE() );

						} else {

							var skeletonRoot = scene.findNode( this.mBones[ i ].mName );
							if ( ! skeletonRoot ) return;
							var threeSkeletonRoot = skeletonRoot.toTHREE( scene );
							var threeSkeletonRootBone = cloneTreeToBones( threeSkeletonRoot, scene );
							this.threeNode.add( threeSkeletonRootBone );
							var bone = findMatchingBone( threeSkeletonRootBone, this.mBones[ i ].mName );
							var tbone = bone;
							allBones.push( tbone );
							//tbone.matrixAutoUpdate = false;
							offsetMatrix.push( this.mBones[ i ].mOffsetMatrix.toTHREE() );

						}

					}
					var skeleton = new THREE.Skeleton( allBones, offsetMatrix );

					this.threeNode.bind( skeleton, new THREE.Matrix4() );
					this.threeNode.material.skinning = true;

				};

				this.toTHREE = function ( scene ) {

					if ( this.threeNode ) return this.threeNode;
					var geometry = new THREE.BufferGeometry();
					var mat;
					if ( scene.mMaterials[ this.mMaterialIndex ] )
						mat = scene.mMaterials[ this.mMaterialIndex ].toTHREE( scene );
					else
						mat = new THREE.MeshLambertMaterial();
					geometry.setIndex( new THREE.BufferAttribute( new Uint32Array( this.mIndexArray ), 1 ) );
					geometry.setAttribute( 'position', new THREE.BufferAttribute( this.mVertexBuffer, 3 ) );
					if ( this.mNormalBuffer && this.mNormalBuffer.length > 0 )
						geometry.setAttribute( 'normal', new THREE.BufferAttribute( this.mNormalBuffer, 3 ) );
					if ( this.mColorBuffer && this.mColorBuffer.length > 0 )
						geometry.setAttribute( 'color', new THREE.BufferAttribute( this.mColorBuffer, 4 ) );
					if ( this.mTexCoordsBuffers[ 0 ] && this.mTexCoordsBuffers[ 0 ].length > 0 )
						geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( this.mTexCoordsBuffers[ 0 ] ), 2 ) );
					if ( this.mTexCoordsBuffers[ 1 ] && this.mTexCoordsBuffers[ 1 ].length > 0 )
						geometry.setAttribute( 'uv1', new THREE.BufferAttribute( new Float32Array( this.mTexCoordsBuffers[ 1 ] ), 2 ) );
					if ( this.mTangentBuffer && this.mTangentBuffer.length > 0 )
						geometry.setAttribute( 'tangents', new THREE.BufferAttribute( this.mTangentBuffer, 3 ) );
					if ( this.mBitangentBuffer && this.mBitangentBuffer.length > 0 )
						geometry.setAttribute( 'bitangents', new THREE.BufferAttribute( this.mBitangentBuffer, 3 ) );
					if ( this.mBones.length > 0 ) {

						var weights = [];
						var bones = [];

						for ( var i = 0; i < this.mBones.length; i ++ ) {

							for ( var j = 0; j < this.mBones[ i ].mWeights.length; j ++ ) {

								var weight = this.mBones[ i ].mWeights[ j ];
								if ( weight ) {

									if ( ! weights[ weight.mVertexId ] ) weights[ weight.mVertexId ] = [];
									if ( ! bones[ weight.mVertexId ] ) bones[ weight.mVertexId ] = [];
									weights[ weight.mVertexId ].push( weight.mWeight );
									bones[ weight.mVertexId ].push( parseInt( i ) );

								}

							}

						}

						for ( var i in bones ) {

							sortWeights( bones[ i ], weights[ i ] );

						}

						var _weights = [];
						var _bones = [];

						for ( var i = 0; i < weights.length; i ++ ) {

							for ( var j = 0; j < 4; j ++ ) {

								if ( weights[ i ] && bones[ i ] ) {

									_weights.push( weights[ i ][ j ] );
									_bones.push( bones[ i ][ j ] );

								} else {

									_weights.push( 0 );
									_bones.push( 0 );

								}

							}

						}

						geometry.setAttribute( 'skinWeight', new THREE.BufferAttribute( new Float32Array( _weights ), BONESPERVERT ) );
						geometry.setAttribute( 'skinIndex', new THREE.BufferAttribute( new Float32Array( _bones ), BONESPERVERT ) );

					}

					var mesh;

					if ( this.mBones.length == 0 )
						mesh = new THREE.Mesh( geometry, mat );

					if ( this.mBones.length > 0 ) {

						mesh = new THREE.SkinnedMesh( geometry, mat );
						mesh.normalizeSkinWeights();

					}

					this.threeNode = mesh;
					//mesh.matrixAutoUpdate = false;
					return mesh;

				};

			}

			function aiFace() {

				this.mNumIndices = 0;
				this.mIndices = [];

			}

			function aiVector3D() {

				this.x = 0;
				this.y = 0;
				this.z = 0;

				this.toTHREE = function () {

					return new THREE.Vector3( this.x, this.y, this.z );

				};

			}

			function aiColor3D() {

				this.r = 0;
				this.g = 0;
				this.b = 0;
				this.a = 0;
				this.toTHREE = function () {

					return new THREE.Color( this.r, this.g, this.b );

				};

			}

			function aiQuaternion() {

				this.x = 0;
				this.y = 0;
				this.z = 0;
				this.w = 0;
				this.toTHREE = function () {

					return new THREE.Quaternion( this.x, this.y, this.z, this.w );

				};

			}

			function aiVertexWeight() {

				this.mVertexId = 0;
				this.mWeight = 0;

			}

			function aiString() {

				this.data = [];
				this.toString = function () {

					var str = '';
					this.data.forEach( function ( i ) {

						str += ( String.fromCharCode( i ) );

					} );
					return str.replace( /[^\x20-\x7E]+/g, '' );

				};

			}

			function aiVectorKey() {

				this.mTime = 0;
				this.mValue = null;

			}

			function aiQuatKey() {

				this.mTime = 0;
				this.mValue = null;

			}

			function aiNode() {

				this.mName = '';
				this.mTransformation = [];
				this.mNumChildren = 0;
				this.mNumMeshes = 0;
				this.mMeshes = [];
				this.mChildren = [];
				this.toTHREE = function ( scene ) {

					if ( this.threeNode ) return this.threeNode;
					var o = new THREE.Object3D();
					o.name = this.mName;
					o.matrix = this.mTransformation.toTHREE();

					for ( var i = 0; i < this.mChildren.length; i ++ ) {

						o.add( this.mChildren[ i ].toTHREE( scene ) );

					}

					for ( var i = 0; i < this.mMeshes.length; i ++ ) {

						o.add( scene.mMeshes[ this.mMeshes[ i ] ].toTHREE( scene ) );

					}

					this.threeNode = o;
					//o.matrixAutoUpdate = false;
					o.matrix.decompose( o.position, o.quaternion, o.scale );
					return o;

				};

			}

			function aiBone() {

				this.mName = '';
				this.mNumWeights = 0;
				this.mOffsetMatrix = 0;

			}

			function aiMaterialProperty() {

				this.mKey = "";
				this.mSemantic = 0;
				this.mIndex = 0;
				this.mData = [];
				this.mDataLength = 0;
				this.mType = 0;
				this.dataAsColor = function () {

					var array = ( new Uint8Array( this.mData ) ).buffer;
					var reader = new DataView( array );
					var r = reader.getFloat32( 0, true );
					var g = reader.getFloat32( 4, true );
					var b = reader.getFloat32( 8, true );
					//var a = reader.getFloat32(12, true);
					return new THREE.Color( r, g, b );

				};

				this.dataAsFloat = function () {

					var array = ( new Uint8Array( this.mData ) ).buffer;
					var reader = new DataView( array );
					var r = reader.getFloat32( 0, true );
					return r;

				};

				this.dataAsBool = function () {

					var array = ( new Uint8Array( this.mData ) ).buffer;
					var reader = new DataView( array );
					var r = reader.getFloat32( 0, true );
					return !! r;

				};

				this.dataAsString = function () {

					var s = new aiString();
					s.data = this.mData;
					return s.toString();

				};

				this.dataAsMap = function () {

					var s = new aiString();
					s.data = this.mData;
					var path = s.toString();
					path = path.replace( /\\/g, '/' );

					if ( path.indexOf( '/' ) != - 1 ) {

						path = path.substr( path.lastIndexOf( '/' ) + 1 );

					}

					return textureLoader.load( path );

				};

			}
			var namePropMapping = {

				"?mat.name": "name",
				"$mat.shadingm": "shading",
				"$mat.twosided": "twoSided",
				"$mat.wireframe": "wireframe",
				"$clr.ambient": "ambient",
				"$clr.diffuse": "color",
				"$clr.specular": "specular",
				"$clr.emissive": "emissive",
				"$clr.transparent": "transparent",
				"$clr.reflective": "reflect",
				"$mat.shininess": "shininess",
				"$mat.reflectivity": "reflectivity",
				"$mat.refracti": "refraction",
				"$tex.file": "map"

			};

			var nameTypeMapping = {

				"?mat.name": "string",
				"$mat.shadingm": "bool",
				"$mat.twosided": "bool",
				"$mat.wireframe": "bool",
				"$clr.ambient": "color",
				"$clr.diffuse": "color",
				"$clr.specular": "color",
				"$clr.emissive": "color",
				"$clr.transparent": "color",
				"$clr.reflective": "color",
				"$mat.shininess": "float",
				"$mat.reflectivity": "float",
				"$mat.refracti": "float",
				"$tex.file": "map"

			};

			function aiMaterial() {

				this.mNumAllocated = 0;
				this.mNumProperties = 0;
				this.mProperties = [];
				this.toTHREE = function () {

					var mat = new THREE.MeshPhongMaterial();

					for ( var i = 0; i < this.mProperties.length; i ++ ) {

						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'float' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsFloat();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'color' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsColor();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'bool' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsBool();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'string' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsString();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'map' ) {

							var prop = this.mProperties[ i ];
							if ( prop.mSemantic == aiTextureType_DIFFUSE )
								mat.map = this.mProperties[ i ].dataAsMap();
							if ( prop.mSemantic == aiTextureType_NORMALS )
								mat.normalMap = this.mProperties[ i ].dataAsMap();
							if ( prop.mSemantic == aiTextureType_LIGHTMAP )
								mat.lightMap = this.mProperties[ i ].dataAsMap();
							if ( prop.mSemantic == aiTextureType_OPACITY )
								mat.alphaMap = this.mProperties[ i ].dataAsMap();

						}

					}

					mat.ambient.r = .53;
					mat.ambient.g = .53;
					mat.ambient.b = .53;
					mat.color.r = 1;
					mat.color.g = 1;
					mat.color.b = 1;
					return mat;

				};

			}


			function veclerp( v1, v2, l ) {

				var v = new THREE.Vector3();
				var lm1 = 1 - l;
				v.x = v1.x * l + v2.x * lm1;
				v.y = v1.y * l + v2.y * lm1;
				v.z = v1.z * l + v2.z * lm1;
				return v;

			}

			function quatlerp( q1, q2, l ) {

				return q1.clone().slerp( q2, 1 - l );

			}

			function sampleTrack( keys, time, lne, lerp ) {

				if ( keys.length == 1 ) return keys[ 0 ].mValue.toTHREE();

				var dist = Infinity;
				var key = null;
				var nextKey = null;

				for ( var i = 0; i < keys.length; i ++ ) {

					var timeDist = Math.abs( keys[ i ].mTime - time );

					if ( timeDist < dist && keys[ i ].mTime <= time ) {

						dist = timeDist;
						key = keys[ i ];
						nextKey = keys[ i + 1 ];

					}

				}

				if ( ! key ) {

					return null;

				} else if ( nextKey ) {

					var dT = nextKey.mTime - key.mTime;
					var T = key.mTime - time;
					var l = T / dT;

					return lerp( key.mValue.toTHREE(), nextKey.mValue.toTHREE(), l );

				} else {

					nextKey = keys[ 0 ].clone();
					nextKey.mTime += lne;

					var dT = nextKey.mTime - key.mTime;
					var T = key.mTime - time;
					var l = T / dT;

					return lerp( key.mValue.toTHREE(), nextKey.mValue.toTHREE(), l );

				}

			}

			function aiNodeAnim() {

				this.mNodeName = "";
				this.mNumPositionKeys = 0;
				this.mNumRotationKeys = 0;
				this.mNumScalingKeys = 0;
				this.mPositionKeys = [];
				this.mRotationKeys = [];
				this.mScalingKeys = [];
				this.mPreState = "";
				this.mPostState = "";
				this.init = function ( tps ) {

					if ( ! tps ) tps = 1;

					function t( t ) {

						t.mTime /= tps;

					}

					this.mPositionKeys.forEach( t );
					this.mRotationKeys.forEach( t );
					this.mScalingKeys.forEach( t );

				};

				this.sortKeys = function () {

					function comp( a, b ) {

						return a.mTime - b.mTime;

					}

					this.mPositionKeys.sort( comp );
					this.mRotationKeys.sort( comp );
					this.mScalingKeys.sort( comp );

				};

				this.getLength = function () {

					return Math.max(
						Math.max.apply( null, this.mPositionKeys.map( function ( a ) {

							return a.mTime;

						} ) ),
						Math.max.apply( null, this.mRotationKeys.map( function ( a ) {

							return a.mTime;

						} ) ),
						Math.max.apply( null, this.mScalingKeys.map( function ( a ) {

							return a.mTime;

					 } ) )
					);

				};

				this.toTHREE = function ( o ) {

					this.sortKeys();
					var length = this.getLength();
					var track = new Virtulous.KeyFrameTrack();

					for ( var i = 0; i < length; i += .05 ) {

						var matrix = new THREE.Matrix4();
						var time = i;
						var pos = sampleTrack( this.mPositionKeys, time, length, veclerp );
						var scale = sampleTrack( this.mScalingKeys, time, length, veclerp );
						var rotation = sampleTrack( this.mRotationKeys, time, length, quatlerp );
						matrix.compose( pos, rotation, scale );

						var key = new Virtulous.KeyFrame( time, matrix );
						track.addKey( key );

					}

					track.target = o.findNode( this.mNodeName ).toTHREE();

					var tracks = [ track ];

					if ( o.nodeToBoneMap[ this.mNodeName ] ) {

						for ( var i = 0; i < o.nodeToBoneMap[ this.mNodeName ].length; i ++ ) {

							var t2 = track.clone();
							t2.target = o.nodeToBoneMap[ this.mNodeName ][ i ];
							tracks.push( t2 );

						}

					}

					return tracks;

				};

			}

			function aiAnimation() {

				this.mName = "";
				this.mDuration = 0;
				this.mTicksPerSecond = 0;
				this.mNumChannels = 0;
				this.mChannels = [];
				this.toTHREE = function ( root ) {

					var animationHandle = new Virtulous.Animation();

					for ( var i in this.mChannels ) {

						this.mChannels[ i ].init( this.mTicksPerSecond );

						var tracks = this.mChannels[ i ].toTHREE( root );

						for ( var j in tracks ) {

							tracks[ j ].init();
							animationHandle.addTrack( tracks[ j ] );

						}

					}

					animationHandle.length = Math.max.apply( null, animationHandle.tracks.map( function ( e ) {

						return e.length;

					} ) );
					return animationHandle;

				};

			}

			function aiTexture() {

				this.mWidth = 0;
				this.mHeight = 0;
				this.texAchFormatHint = [];
				this.pcData = [];

			}

			function aiLight() {

				this.mName = '';
				this.mType = 0;
				this.mAttenuationConstant = 0;
				this.mAttenuationLinear = 0;
				this.mAttenuationQuadratic = 0;
				this.mAngleInnerCone = 0;
				this.mAngleOuterCone = 0;
				this.mColorDiffuse = null;
				this.mColorSpecular = null;
				this.mColorAmbient = null;

			}

			function aiCamera() {

				this.mName = '';
				this.mPosition = null;
				this.mLookAt = null;
				this.mUp = null;
				this.mHorizontalFOV = 0;
				this.mClipPlaneNear = 0;
				this.mClipPlaneFar = 0;
				this.mAspect = 0;

			}

			function aiScene() {

				this.versionMajor = 0;
				this.versionMinor = 0;
				this.versionRevision = 0;
				this.compileFlags = 0;
				this.mFlags = 0;
				this.mNumMeshes = 0;
				this.mNumMaterials = 0;
				this.mNumAnimations = 0;
				this.mNumTextures = 0;
				this.mNumLights = 0;
				this.mNumCameras = 0;
				this.mRootNode = null;
				this.mMeshes = [];
				this.mMaterials = [];
				this.mAnimations = [];
				this.mLights = [];
				this.mCameras = [];
				this.nodeToBoneMap = {};
				this.findNode = function ( name, root ) {

					if ( ! root ) {

						root = this.mRootNode;

					}

					if ( root.mName == name ) {

						return root;

					}

					for ( var i = 0; i < root.mChildren.length; i ++ ) {

						var ret = this.findNode( name, root.mChildren[ i ] );
						if ( ret ) return ret;

					}

					return null;

				};

				this.toTHREE = function () {

					this.nodeCount = 0;

					markBones( this );

					var o = this.mRootNode.toTHREE( this );

					for ( var i in this.mMeshes )
						this.mMeshes[ i ].hookupSkeletons( this );

					if ( this.mAnimations.length > 0 ) {

						var a = this.mAnimations[ 0 ].toTHREE( this );

					}

					return { object: o, animation: a };

				};

			}

			function aiMatrix4() {

				this.elements = [
					[],
					[],
					[],
					[]
				];
				this.toTHREE = function () {

					var m = new THREE.Matrix4();

					for ( var i = 0; i < 4; ++ i ) {

						for ( var i2 = 0; i2 < 4; ++ i2 ) {

							m.elements[ i * 4 + i2 ] = this.elements[ i2 ][ i ];

						}

					}

					return m;

				};

			}

			var littleEndian = true;

			function readFloat( dataview ) {

				var val = dataview.getFloat32( dataview.readOffset, littleEndian );
				dataview.readOffset += 4;
				return val;

			}

			function Read_double( dataview ) {

				var val = dataview.getFloat64( dataview.readOffset, littleEndian );
				dataview.readOffset += 8;
				return val;

			}

			function Read_uint8_t( dataview ) {

				var val = dataview.getUint8( dataview.readOffset );
				dataview.readOffset += 1;
				return val;

			}

			function Read_uint16_t( dataview ) {

				var val = dataview.getUint16( dataview.readOffset, littleEndian );
				dataview.readOffset += 2;
				return val;

			}

			function Read_unsigned_int( dataview ) {

				var val = dataview.getUint32( dataview.readOffset, littleEndian );
				dataview.readOffset += 4;
				return val;

			}

			function Read_uint32_t( dataview ) {

				var val = dataview.getUint32( dataview.readOffset, littleEndian );
				dataview.readOffset += 4;
				return val;

			}

			function Read_aiVector3D( stream ) {

				var v = new aiVector3D();
				v.x = readFloat( stream );
				v.y = readFloat( stream );
				v.z = readFloat( stream );
				return v;

			}

			function Read_aiColor3D( stream ) {

				var c = new aiColor3D();
				c.r = readFloat( stream );
				c.g = readFloat( stream );
				c.b = readFloat( stream );
				return c;

			}

			function Read_aiQuaternion( stream ) {

				var v = new aiQuaternion();
				v.w = readFloat( stream );
				v.x = readFloat( stream );
				v.y = readFloat( stream );
				v.z = readFloat( stream );
				return v;

			}

			function Read_aiString( stream ) {

				var s = new aiString();
				var stringlengthbytes = Read_unsigned_int( stream );
				stream.ReadBytes( s.data, 1, stringlengthbytes );
				return s.toString();

			}

			function Read_aiVertexWeight( stream ) {

				var w = new aiVertexWeight();
				w.mVertexId = Read_unsigned_int( stream );
				w.mWeight = readFloat( stream );
				return w;

			}

			function Read_aiMatrix4x4( stream ) {

				var m = new aiMatrix4();

				for ( var i = 0; i < 4; ++ i ) {

					for ( var i2 = 0; i2 < 4; ++ i2 ) {

						m.elements[ i ][ i2 ] = readFloat( stream );

					}

				}

				return m;

			}

			function Read_aiVectorKey( stream ) {

				var v = new aiVectorKey();
				v.mTime = Read_double( stream );
				v.mValue = Read_aiVector3D( stream );
				return v;

			}

			function Read_aiQuatKey( stream ) {

				var v = new aiQuatKey();
				v.mTime = Read_double( stream );
				v.mValue = Read_aiQuaternion( stream );
				return v;

			}

			function ReadArray_aiVertexWeight( stream, data, size ) {

				for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVertexWeight( stream );

			}

			function ReadArray_aiVectorKey( stream, data, size ) {

				for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVectorKey( stream );

			}

			function ReadArray_aiQuatKey( stream, data, size ) {

				for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiQuatKey( stream );

			}

			function ReadBounds( stream, T /*p*/, n ) {

				// not sure what to do here, the data isn't really useful.
				return stream.Seek( sizeof( T ) * n, aiOrigin_CUR );

			}

			function ai_assert( bool ) {

				if ( ! bool )
					throw ( "asset failed" );

			}

			function ReadBinaryNode( stream, parent, depth ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AINODE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				var node = new aiNode();
				node.mParent = parent;
				node.mDepth = depth;
				node.mName = Read_aiString( stream );
				node.mTransformation = Read_aiMatrix4x4( stream );
				node.mNumChildren = Read_unsigned_int( stream );
				node.mNumMeshes = Read_unsigned_int( stream );

				if ( node.mNumMeshes ) {

					node.mMeshes = [];

					for ( var i = 0; i < node.mNumMeshes; ++ i ) {

						node.mMeshes[ i ] = Read_unsigned_int( stream );

					}

				}

				if ( node.mNumChildren ) {

					node.mChildren = [];

					for ( var i = 0; i < node.mNumChildren; ++ i ) {

						var node2 = ReadBinaryNode( stream, node, depth ++ );
						node.mChildren[ i ] = node2;

					}

				}

				return node;

			}

			// -----------------------------------------------------------------------------------

			function ReadBinaryBone( stream, b ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIBONE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				b.mName = Read_aiString( stream );
				b.mNumWeights = Read_unsigned_int( stream );
				b.mOffsetMatrix = Read_aiMatrix4x4( stream );
				// for the moment we write dumb min/max values for the bones, too.
				// maybe I'll add a better, hash-like solution later
				if ( shortened ) {

					ReadBounds( stream, b.mWeights, b.mNumWeights );

				} else {

					// else write as usual

					b.mWeights = [];
					ReadArray_aiVertexWeight( stream, b.mWeights, b.mNumWeights );

				}

				return b;

			}

			function ReadBinaryMesh( stream, mesh ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIMESH );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				mesh.mPrimitiveTypes = Read_unsigned_int( stream );
				mesh.mNumVertices = Read_unsigned_int( stream );
				mesh.mNumFaces = Read_unsigned_int( stream );
				mesh.mNumBones = Read_unsigned_int( stream );
				mesh.mMaterialIndex = Read_unsigned_int( stream );
				mesh.mNumUVComponents = [];
				// first of all, write bits for all existent vertex components
				var c = Read_unsigned_int( stream );

				if ( c & ASSBIN_MESH_HAS_POSITIONS ) {

					if ( shortened ) {

						ReadBounds( stream, mesh.mVertices, mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mVertices = [];
						mesh.mVertexBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

					}

				}

				if ( c & ASSBIN_MESH_HAS_NORMALS ) {

					if ( shortened ) {

						ReadBounds( stream, mesh.mNormals, mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mNormals = [];
						mesh.mNormalBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

					}

				}

				if ( c & ASSBIN_MESH_HAS_TANGENTS_AND_BITANGENTS ) {

					if ( shortened ) {

						ReadBounds( stream, mesh.mTangents, mesh.mNumVertices );
						ReadBounds( stream, mesh.mBitangents, mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mTangents = [];
						mesh.mTangentBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );
						mesh.mBitangents = [];
						mesh.mBitangentBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

					}

				}

				for ( var n = 0; n < AI_MAX_NUMBER_OF_COLOR_SETS; ++ n ) {

					if ( ! ( c & ASSBIN_MESH_HAS_COLOR( n ) ) ) break;

					if ( shortened ) {

						ReadBounds( stream, mesh.mColors[ n ], mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mColors[ n ] = [];
						mesh.mColorBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 4 * 4 );
						stream.Seek( mesh.mNumVertices * 4 * 4, aiOrigin_CUR );

					}

				}

				mesh.mTexCoordsBuffers = [];

				for ( var n = 0; n < AI_MAX_NUMBER_OF_TEXTURECOORDS; ++ n ) {

					if ( ! ( c & ASSBIN_MESH_HAS_TEXCOORD( n ) ) ) break;

					// write number of UV components
					mesh.mNumUVComponents[ n ] = Read_unsigned_int( stream );

					if ( shortened ) {

						ReadBounds( stream, mesh.mTextureCoords[ n ], mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mTextureCoords[ n ] = [];
						//note that assbin always writes 3d texcoords
						mesh.mTexCoordsBuffers[ n ] = [];

						for ( var uv = 0; uv < mesh.mNumVertices; uv ++ ) {

							mesh.mTexCoordsBuffers[ n ].push( readFloat( stream ) );
							mesh.mTexCoordsBuffers[ n ].push( readFloat( stream ) );
							readFloat( stream );

						}

					}

				}
				// write faces. There are no floating-point calculations involved
				// in these, so we can write a simple hash over the face data
				// to the dump file. We generate a single 32 Bit hash for 512 faces
				// using Assimp's standard hashing function.
				if ( shortened ) {

					Read_unsigned_int( stream );

				} else {

					// else write as usual

					// if there are less than 2^16 vertices, we can simply use 16 bit integers ...
					mesh.mFaces = [];
					mesh.mIndexArray = [];

					for ( var i = 0; i < mesh.mNumFaces; ++ i ) {

						var f = mesh.mFaces[ i ] = new aiFace();
						// BOOST_STATIC_ASSERT(AI_MAX_FACE_INDICES <= 0xffff);
						f.mNumIndices = Read_uint16_t( stream );
						f.mIndices = [];

						for ( var a = 0; a < f.mNumIndices; ++ a ) {

							if ( mesh.mNumVertices < ( 1 << 16 ) ) {

								f.mIndices[ a ] = Read_uint16_t( stream );

							} else {

								f.mIndices[ a ] = Read_unsigned_int( stream );

							}



						}

						if ( f.mNumIndices === 3 ) {

							mesh.mIndexArray.push( f.mIndices[ 0 ] );
							mesh.mIndexArray.push( f.mIndices[ 1 ] );
							mesh.mIndexArray.push( f.mIndices[ 2 ] );

						} else if ( f.mNumIndices === 4 ) {

							mesh.mIndexArray.push( f.mIndices[ 0 ] );
							mesh.mIndexArray.push( f.mIndices[ 1 ] );
							mesh.mIndexArray.push( f.mIndices[ 2 ] );
							mesh.mIndexArray.push( f.mIndices[ 2 ] );
							mesh.mIndexArray.push( f.mIndices[ 3 ] );
							mesh.mIndexArray.push( f.mIndices[ 0 ] );

						} else {

							throw ( new Error( "Sorry, can't currently triangulate polys. Use the triangulate preprocessor in Assimp." ) );

						}



					}

				}
				// write bones
				if ( mesh.mNumBones ) {

					mesh.mBones = [];

					for ( var a = 0; a < mesh.mNumBones; ++ a ) {

						mesh.mBones[ a ] = new aiBone();
						ReadBinaryBone( stream, mesh.mBones[ a ] );

					}

				}

			}

			function ReadBinaryMaterialProperty( stream, prop ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIMATERIALPROPERTY );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				prop.mKey = Read_aiString( stream );
				prop.mSemantic = Read_unsigned_int( stream );
				prop.mIndex = Read_unsigned_int( stream );
				prop.mDataLength = Read_unsigned_int( stream );
				prop.mType = Read_unsigned_int( stream );
				prop.mData = [];
				stream.ReadBytes( prop.mData, 1, prop.mDataLength );

			}

			// -----------------------------------------------------------------------------------

			function ReadBinaryMaterial( stream, mat ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIMATERIAL );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				mat.mNumAllocated = mat.mNumProperties = Read_unsigned_int( stream );

				if ( mat.mNumProperties ) {

					if ( mat.mProperties ) {

						delete mat.mProperties;

					}

					mat.mProperties = [];

					for ( var i = 0; i < mat.mNumProperties; ++ i ) {

						mat.mProperties[ i ] = new aiMaterialProperty();
						ReadBinaryMaterialProperty( stream, mat.mProperties[ i ] );

					}

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryNodeAnim( stream, nd ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AINODEANIM );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				nd.mNodeName = Read_aiString( stream );
				nd.mNumPositionKeys = Read_unsigned_int( stream );
				nd.mNumRotationKeys = Read_unsigned_int( stream );
				nd.mNumScalingKeys = Read_unsigned_int( stream );
				nd.mPreState = Read_unsigned_int( stream );
				nd.mPostState = Read_unsigned_int( stream );

				if ( nd.mNumPositionKeys ) {

					if ( shortened ) {

						ReadBounds( stream, nd.mPositionKeys, nd.mNumPositionKeys );

					} else {

						// else write as usual

						nd.mPositionKeys = [];
						ReadArray_aiVectorKey( stream, nd.mPositionKeys, nd.mNumPositionKeys );

					}

				}

				if ( nd.mNumRotationKeys ) {

					if ( shortened ) {

						ReadBounds( stream, nd.mRotationKeys, nd.mNumRotationKeys );

					} else {

			 			// else write as usual

						nd.mRotationKeys = [];
						ReadArray_aiQuatKey( stream, nd.mRotationKeys, nd.mNumRotationKeys );

					}

				}

				if ( nd.mNumScalingKeys ) {

					if ( shortened ) {

						ReadBounds( stream, nd.mScalingKeys, nd.mNumScalingKeys );

					} else {

		 				// else write as usual

						nd.mScalingKeys = [];
						ReadArray_aiVectorKey( stream, nd.mScalingKeys, nd.mNumScalingKeys );

					}

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryAnim( stream, anim ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIANIMATION );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				anim.mName = Read_aiString( stream );
				anim.mDuration = Read_double( stream );
				anim.mTicksPerSecond = Read_double( stream );
				anim.mNumChannels = Read_unsigned_int( stream );

				if ( anim.mNumChannels ) {

					anim.mChannels = [];

					for ( var a = 0; a < anim.mNumChannels; ++ a ) {

						anim.mChannels[ a ] = new aiNodeAnim();
						ReadBinaryNodeAnim( stream, anim.mChannels[ a ] );

					}

				}

			}

			function ReadBinaryTexture( stream, tex ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AITEXTURE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				tex.mWidth = Read_unsigned_int( stream );
				tex.mHeight = Read_unsigned_int( stream );
				stream.ReadBytes( tex.achFormatHint, 1, 4 );

				if ( ! shortened ) {

					if ( ! tex.mHeight ) {

						tex.pcData = [];
						stream.ReadBytes( tex.pcData, 1, tex.mWidth );

					} else {

						tex.pcData = [];
						stream.ReadBytes( tex.pcData, 1, tex.mWidth * tex.mHeight * 4 );

					}

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryLight( stream, l ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AILIGHT );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				l.mName = Read_aiString( stream );
				l.mType = Read_unsigned_int( stream );

				if ( l.mType != aiLightSource_DIRECTIONAL ) {

					l.mAttenuationConstant = readFloat( stream );
					l.mAttenuationLinear = readFloat( stream );
					l.mAttenuationQuadratic = readFloat( stream );

				}

				l.mColorDiffuse = Read_aiColor3D( stream );
				l.mColorSpecular = Read_aiColor3D( stream );
				l.mColorAmbient = Read_aiColor3D( stream );

				if ( l.mType == aiLightSource_SPOT ) {

					l.mAngleInnerCone = readFloat( stream );
					l.mAngleOuterCone = readFloat( stream );

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryCamera( stream, cam ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AICAMERA );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				cam.mName = Read_aiString( stream );
				cam.mPosition = Read_aiVector3D( stream );
				cam.mLookAt = Read_aiVector3D( stream );
				cam.mUp = Read_aiVector3D( stream );
				cam.mHorizontalFOV = readFloat( stream );
				cam.mClipPlaneNear = readFloat( stream );
				cam.mClipPlaneFar = readFloat( stream );
				cam.mAspect = readFloat( stream );

			}

			function ReadBinaryScene( stream, scene ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AISCENE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				scene.mFlags = Read_unsigned_int( stream );
				scene.mNumMeshes = Read_unsigned_int( stream );
				scene.mNumMaterials = Read_unsigned_int( stream );
				scene.mNumAnimations = Read_unsigned_int( stream );
				scene.mNumTextures = Read_unsigned_int( stream );
				scene.mNumLights = Read_unsigned_int( stream );
				scene.mNumCameras = Read_unsigned_int( stream );
				// Read node graph
				scene.mRootNode = new aiNode();
				scene.mRootNode = ReadBinaryNode( stream, null, 0 );
				// Read all meshes
				if ( scene.mNumMeshes ) {

					scene.mMeshes = [];

					for ( var i = 0; i < scene.mNumMeshes; ++ i ) {

						scene.mMeshes[ i ] = new aiMesh();
						ReadBinaryMesh( stream, scene.mMeshes[ i ] );

					}

				}
				// Read materials
				if ( scene.mNumMaterials ) {

					scene.mMaterials = [];

					for ( var i = 0; i < scene.mNumMaterials; ++ i ) {

						scene.mMaterials[ i ] = new aiMaterial();
						ReadBinaryMaterial( stream, scene.mMaterials[ i ] );

					}

				}
				// Read all animations
				if ( scene.mNumAnimations ) {

					scene.mAnimations = [];

					for ( var i = 0; i < scene.mNumAnimations; ++ i ) {

						scene.mAnimations[ i ] = new aiAnimation();
						ReadBinaryAnim( stream, scene.mAnimations[ i ] );

					}

				}
				// Read all textures
				if ( scene.mNumTextures ) {

					scene.mTextures = [];

					for ( var i = 0; i < scene.mNumTextures; ++ i ) {

						scene.mTextures[ i ] = new aiTexture();
						ReadBinaryTexture( stream, scene.mTextures[ i ] );

					}

				}
				// Read lights
				if ( scene.mNumLights ) {

					scene.mLights = [];

					for ( var i = 0; i < scene.mNumLights; ++ i ) {

						scene.mLights[ i ] = new aiLight();
						ReadBinaryLight( stream, scene.mLights[ i ] );

					}

				}
				// Read cameras
				if ( scene.mNumCameras ) {

					scene.mCameras = [];

					for ( var i = 0; i < scene.mNumCameras; ++ i ) {

						scene.mCameras[ i ] = new aiCamera();
						ReadBinaryCamera( stream, scene.mCameras[ i ] );

					}

				}

			}
			var aiOrigin_CUR = 0;
			var aiOrigin_BEG = 1;

			function extendStream( stream ) {

				stream.readOffset = 0;
				stream.Seek = function ( off, ori ) {

					if ( ori == aiOrigin_CUR ) {

						stream.readOffset += off;

					}
					if ( ori == aiOrigin_BEG ) {

						stream.readOffset = off;

					}

				};

				stream.ReadBytes = function ( buff, size, n ) {

					var bytes = size * n;
					for ( var i = 0; i < bytes; i ++ )
						buff[ i ] = Read_uint8_t( this );

				};

				stream.subArray32 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Float32Array( newbuff );

				};

				stream.subArrayUint16 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Uint16Array( newbuff );

				};

				stream.subArrayUint8 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Uint8Array( newbuff );

				};

				stream.subArrayUint32 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Uint32Array( newbuff );

				};

			}

			var shortened, compressed;

			function InternReadFile( pFiledata ) {

				var pScene = new aiScene();
				var stream = new DataView( pFiledata );
				extendStream( stream );
				stream.Seek( 44, aiOrigin_CUR ); // signature
				/*unsigned int versionMajor =*/
				pScene.versionMajor = Read_unsigned_int( stream );
				/*unsigned int versionMinor =*/
				pScene.versionMinor = Read_unsigned_int( stream );
				/*unsigned int versionRevision =*/
				pScene.versionRevision = Read_unsigned_int( stream );
				/*unsigned int compileFlags =*/
				pScene.compileFlags = Read_unsigned_int( stream );
				shortened = Read_uint16_t( stream ) > 0;
				compressed = Read_uint16_t( stream ) > 0;
				if ( shortened )
					throw "Shortened binaries are not supported!";
				stream.Seek( 256, aiOrigin_CUR ); // original filename
				stream.Seek( 128, aiOrigin_CUR ); // options
				stream.Seek( 64, aiOrigin_CUR ); // padding
				if ( compressed ) {

					var uncompressedSize = Read_uint32_t( stream );
					var compressedSize = stream.FileSize() - stream.Tell();
					var compressedData = [];
					stream.Read( compressedData, 1, compressedSize );
					var uncompressedData = [];
					uncompress( uncompressedData, uncompressedSize, compressedData, compressedSize );
					var buff = new ArrayBuffer( uncompressedData );
					ReadBinaryScene( buff, pScene );

				} else {

					ReadBinaryScene( stream, pScene );

				}

				return pScene.toTHREE();

			}

			return InternReadFile( buffer );

		}

	} );
	
	return THREE.AssimpLoader;
});

define('skylark-threejs-ex/loaders/TGALoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Daosheng Mu / https://github.com/DaoshengMu/
	 * @author mrdoob / http://mrdoob.com/
	 * @author takahirox / https://github.com/takahirox/
	 */

	THREE.TGALoader = function ( manager ) {

		THREE.Loader.call( this, manager );

	};

	THREE.TGALoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.TGALoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var texture = new THREE.Texture();

			var loader = new THREE.FileLoader( this.manager );
			loader.setResponseType( 'arraybuffer' );
			loader.setPath( this.path );

			loader.load( url, function ( buffer ) {

				texture.image = scope.parse( buffer );
				texture.needsUpdate = true;

				if ( onLoad !== undefined ) {

					onLoad( texture );

				}

			}, onProgress, onError );

			return texture;

		},

		parse: function ( buffer ) {

			// reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js

			function tgaCheckHeader( header ) {

				switch ( header.image_type ) {

					// check indexed type

					case TGA_TYPE_INDEXED:
					case TGA_TYPE_RLE_INDEXED:
						if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1 ) {

							console.error( 'THREE.TGALoader: Invalid type colormap data for indexed type.' );

						}
						break;

						// check colormap type

					case TGA_TYPE_RGB:
					case TGA_TYPE_GREY:
					case TGA_TYPE_RLE_RGB:
					case TGA_TYPE_RLE_GREY:
						if ( header.colormap_type ) {

							console.error( 'THREE.TGALoader: Invalid type colormap data for colormap type.' );

						}
						break;

						// What the need of a file without data ?

					case TGA_TYPE_NO_DATA:
						console.error( 'THREE.TGALoader: No data.' );

						// Invalid type ?

					default:
						console.error( 'THREE.TGALoader: Invalid type "%s".', header.image_type );

				}

				// check image width and height

				if ( header.width <= 0 || header.height <= 0 ) {

					console.error( 'THREE.TGALoader: Invalid image size.' );

				}

				// check image pixel size

				if ( header.pixel_size !== 8 && header.pixel_size !== 16 &&
					header.pixel_size !== 24 && header.pixel_size !== 32 ) {

					console.error( 'THREE.TGALoader: Invalid pixel size "%s".', header.pixel_size );

				}

			}

			// parse tga image buffer

			function tgaParse( use_rle, use_pal, header, offset, data ) {

				var pixel_data,
					pixel_size,
					pixel_total,
					palettes;

				pixel_size = header.pixel_size >> 3;
				pixel_total = header.width * header.height * pixel_size;

				 // read palettes

				 if ( use_pal ) {

					 palettes = data.subarray( offset, offset += header.colormap_length * ( header.colormap_size >> 3 ) );

				 }

				 // read RLE

				 if ( use_rle ) {

					 pixel_data = new Uint8Array( pixel_total );

					var c, count, i;
					var shift = 0;
					var pixels = new Uint8Array( pixel_size );

					while ( shift < pixel_total ) {

						c = data[ offset ++ ];
						count = ( c & 0x7f ) + 1;

						// RLE pixels

						if ( c & 0x80 ) {

							// bind pixel tmp array

							for ( i = 0; i < pixel_size; ++ i ) {

								pixels[ i ] = data[ offset ++ ];

							}

							// copy pixel array

							for ( i = 0; i < count; ++ i ) {

								pixel_data.set( pixels, shift + i * pixel_size );

							}

							shift += pixel_size * count;

						} else {

							// raw pixels

							count *= pixel_size;
							for ( i = 0; i < count; ++ i ) {

								pixel_data[ shift + i ] = data[ offset ++ ];

							}
							shift += count;

						}

					}

				 } else {

					// raw pixels

					pixel_data = data.subarray(
						 offset, offset += ( use_pal ? header.width * header.height : pixel_total )
					);

				 }

				 return {
					pixel_data: pixel_data,
					palettes: palettes
				 };

			}

			function tgaGetImageData8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image, palettes ) {

				var colormap = palettes;
				var color, i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

						color = image[ i ];
						imageData[ ( x + width * y ) * 4 + 3 ] = 255;
						imageData[ ( x + width * y ) * 4 + 2 ] = colormap[ ( color * 3 ) + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = colormap[ ( color * 3 ) + 1 ];
						imageData[ ( x + width * y ) * 4 + 0 ] = colormap[ ( color * 3 ) + 2 ];

					}

				}

				return imageData;

			}

			function tgaGetImageData16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var color, i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

						color = image[ i + 0 ] + ( image[ i + 1 ] << 8 ); // Inversed ?
						imageData[ ( x + width * y ) * 4 + 0 ] = ( color & 0x7C00 ) >> 7;
						imageData[ ( x + width * y ) * 4 + 1 ] = ( color & 0x03E0 ) >> 2;
						imageData[ ( x + width * y ) * 4 + 2 ] = ( color & 0x001F ) >> 3;
						imageData[ ( x + width * y ) * 4 + 3 ] = ( color & 0x8000 ) ? 0 : 255;

					}

				}

				return imageData;

			}

			function tgaGetImageData24bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 3 ) {

						imageData[ ( x + width * y ) * 4 + 3 ] = 255;
						imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
						imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];

					}

				}

				return imageData;

			}

			function tgaGetImageData32bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 4 ) {

						imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
						imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];
						imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 3 ];

					}

				}

				return imageData;

			}

			function tgaGetImageDataGrey8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var color, i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

						color = image[ i ];
						imageData[ ( x + width * y ) * 4 + 0 ] = color;
						imageData[ ( x + width * y ) * 4 + 1 ] = color;
						imageData[ ( x + width * y ) * 4 + 2 ] = color;
						imageData[ ( x + width * y ) * 4 + 3 ] = 255;

					}

				}

				return imageData;

			}

			function tgaGetImageDataGrey16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

						imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 1 ];

					}

				}

				return imageData;

			}

			function getTgaRGBA( data, width, height, image, palette ) {

				var x_start,
					y_start,
					x_step,
					y_step,
					x_end,
					y_end;

				switch ( ( header.flags & TGA_ORIGIN_MASK ) >> TGA_ORIGIN_SHIFT ) {

					default:
					case TGA_ORIGIN_UL:
						x_start = 0;
						x_step = 1;
						x_end = width;
						y_start = 0;
						y_step = 1;
						y_end = height;
						break;

					case TGA_ORIGIN_BL:
						x_start = 0;
						x_step = 1;
						x_end = width;
						y_start = height - 1;
						y_step = - 1;
						y_end = - 1;
						break;

					case TGA_ORIGIN_UR:
						x_start = width - 1;
						x_step = - 1;
						x_end = - 1;
						y_start = 0;
						y_step = 1;
						y_end = height;
						break;

					case TGA_ORIGIN_BR:
						x_start = width - 1;
						x_step = - 1;
						x_end = - 1;
						y_start = height - 1;
						y_step = - 1;
						y_end = - 1;
						break;

				}

				if ( use_grey ) {

					switch ( header.pixel_size ) {

						case 8:
							tgaGetImageDataGrey8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						case 16:
							tgaGetImageDataGrey16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						default:
							console.error( 'THREE.TGALoader: Format not supported.' );
							break;

					}

				} else {

					switch ( header.pixel_size ) {

						case 8:
							tgaGetImageData8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette );
							break;

						case 16:
							tgaGetImageData16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						case 24:
							tgaGetImageData24bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						case 32:
							tgaGetImageData32bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						default:
							console.error( 'THREE.TGALoader: Format not supported.' );
							break;

					}

				}

				// Load image data according to specific method
				// var func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
				// func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
				return data;

			}

			// TGA constants

			var TGA_TYPE_NO_DATA = 0,
				TGA_TYPE_INDEXED = 1,
				TGA_TYPE_RGB = 2,
				TGA_TYPE_GREY = 3,
				TGA_TYPE_RLE_INDEXED = 9,
				TGA_TYPE_RLE_RGB = 10,
				TGA_TYPE_RLE_GREY = 11,

				TGA_ORIGIN_MASK = 0x30,
				TGA_ORIGIN_SHIFT = 0x04,
				TGA_ORIGIN_BL = 0x00,
				TGA_ORIGIN_BR = 0x01,
				TGA_ORIGIN_UL = 0x02,
				TGA_ORIGIN_UR = 0x03;

			if ( buffer.length < 19 ) console.error( 'THREE.TGALoader: Not enough data to contain header.' );

			var content = new Uint8Array( buffer ),
				offset = 0,
				header = {
					id_length: content[ offset ++ ],
					colormap_type: content[ offset ++ ],
					image_type: content[ offset ++ ],
					colormap_index: content[ offset ++ ] | content[ offset ++ ] << 8,
					colormap_length: content[ offset ++ ] | content[ offset ++ ] << 8,
					colormap_size: content[ offset ++ ],
					origin: [
						content[ offset ++ ] | content[ offset ++ ] << 8,
						content[ offset ++ ] | content[ offset ++ ] << 8
					],
					width: content[ offset ++ ] | content[ offset ++ ] << 8,
					height: content[ offset ++ ] | content[ offset ++ ] << 8,
					pixel_size: content[ offset ++ ],
					flags: content[ offset ++ ]
				};

			// check tga if it is valid format

			tgaCheckHeader( header );

			if ( header.id_length + offset > buffer.length ) {

				console.error( 'THREE.TGALoader: No data.' );

			}

			// skip the needn't data

			offset += header.id_length;

			// get targa information about RLE compression and palette

			var use_rle = false,
				use_pal = false,
				use_grey = false;

			switch ( header.image_type ) {

				case TGA_TYPE_RLE_INDEXED:
					use_rle = true;
					use_pal = true;
					break;

				case TGA_TYPE_INDEXED:
					use_pal = true;
					break;

				case TGA_TYPE_RLE_RGB:
					use_rle = true;
					break;

				case TGA_TYPE_RGB:
					break;

				case TGA_TYPE_RLE_GREY:
					use_rle = true;
					use_grey = true;
					break;

				case TGA_TYPE_GREY:
					use_grey = true;
					break;

			}

			//

			var useOffscreen = typeof OffscreenCanvas !== 'undefined';

			var canvas = useOffscreen ? new OffscreenCanvas( header.width, header.height ) : document.createElement( 'canvas' );
			canvas.width = header.width;
			canvas.height = header.height;

			var context = canvas.getContext( '2d' );
			var imageData = context.createImageData( header.width, header.height );

			var result = tgaParse( use_rle, use_pal, header, offset, content );
			var rgbaData = getTgaRGBA( imageData.data, header.width, header.height, result.pixel_data, result.palettes );

			context.putImageData( imageData, 0, 0 );

			return useOffscreen ? canvas.transferToImageBitmap() : canvas;

		}

	} );
	
	return THREE.TGALoader;
});

define('skylark-threejs-ex/loaders/ColladaLoader',[
	"skylark-threejs",
	"./TGALoader"
],function(THREE,TGALoader){
	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author Mugen87 / https://github.com/Mugen87
	 */

	THREE.ColladaLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

	};

	THREE.ColladaLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.ColladaLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = ( scope.path === '' ) ? THREE.LoaderUtils.extractUrlBase( url ) : scope.path;

			var loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text, path ) );

			}, onProgress, onError );

		},

		options: {

			set convertUpAxis( value ) {

				console.warn( 'THREE.ColladaLoader: options.convertUpAxis() has been removed. Up axis is converted automatically.' );

			}

		},

		parse: function ( text, path ) {

			function getElementsByTagName( xml, name ) {

				// Non recursive xml.getElementsByTagName() ...

				var array = [];
				var childNodes = xml.childNodes;

				for ( var i = 0, l = childNodes.length; i < l; i ++ ) {

					var child = childNodes[ i ];

					if ( child.nodeName === name ) {

						array.push( child );

					}

				}

				return array;

			}

			function parseStrings( text ) {

				if ( text.length === 0 ) return [];

				var parts = text.trim().split( /\s+/ );
				var array = new Array( parts.length );

				for ( var i = 0, l = parts.length; i < l; i ++ ) {

					array[ i ] = parts[ i ];

				}

				return array;

			}

			function parseFloats( text ) {

				if ( text.length === 0 ) return [];

				var parts = text.trim().split( /\s+/ );
				var array = new Array( parts.length );

				for ( var i = 0, l = parts.length; i < l; i ++ ) {

					array[ i ] = parseFloat( parts[ i ] );

				}

				return array;

			}

			function parseInts( text ) {

				if ( text.length === 0 ) return [];

				var parts = text.trim().split( /\s+/ );
				var array = new Array( parts.length );

				for ( var i = 0, l = parts.length; i < l; i ++ ) {

					array[ i ] = parseInt( parts[ i ] );

				}

				return array;

			}

			function parseId( text ) {

				return text.substring( 1 );

			}

			function generateId() {

				return 'three_default_' + ( count ++ );

			}

			function isEmpty( object ) {

				return Object.keys( object ).length === 0;

			}

			// asset

			function parseAsset( xml ) {

				return {
					unit: parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
					upAxis: parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
				};

			}

			function parseAssetUnit( xml ) {

				if ( ( xml !== undefined ) && ( xml.hasAttribute( 'meter' ) === true ) ) {

					return parseFloat( xml.getAttribute( 'meter' ) );

				} else {

					return 1; // default 1 meter

				}

			}

			function parseAssetUpAxis( xml ) {

				return xml !== undefined ? xml.textContent : 'Y_UP';

			}

			// library

			function parseLibrary( xml, libraryName, nodeName, parser ) {

				var library = getElementsByTagName( xml, libraryName )[ 0 ];

				if ( library !== undefined ) {

					var elements = getElementsByTagName( library, nodeName );

					for ( var i = 0; i < elements.length; i ++ ) {

						parser( elements[ i ] );

					}

				}

			}

			function buildLibrary( data, builder ) {

				for ( var name in data ) {

					var object = data[ name ];
					object.build = builder( data[ name ] );

				}

			}

			// get

			function getBuild( data, builder ) {

				if ( data.build !== undefined ) return data.build;

				data.build = builder( data );

				return data.build;

			}

			// animation

			function parseAnimation( xml ) {

				var data = {
					sources: {},
					samplers: {},
					channels: {}
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					var id;

					switch ( child.nodeName ) {

						case 'source':
							id = child.getAttribute( 'id' );
							data.sources[ id ] = parseSource( child );
							break;

						case 'sampler':
							id = child.getAttribute( 'id' );
							data.samplers[ id ] = parseAnimationSampler( child );
							break;

						case 'channel':
							id = child.getAttribute( 'target' );
							data.channels[ id ] = parseAnimationChannel( child );
							break;

						default:
							console.log( child );

					}

				}

				library.animations[ xml.getAttribute( 'id' ) ] = data;

			}

			function parseAnimationSampler( xml ) {

				var data = {
					inputs: {},
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'input':
							var id = parseId( child.getAttribute( 'source' ) );
							var semantic = child.getAttribute( 'semantic' );
							data.inputs[ semantic ] = id;
							break;

					}

				}

				return data;

			}

			function parseAnimationChannel( xml ) {

				var data = {};

				var target = xml.getAttribute( 'target' );

				// parsing SID Addressing Syntax

				var parts = target.split( '/' );

				var id = parts.shift();
				var sid = parts.shift();

				// check selection syntax

				var arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
				var memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

				if ( memberSyntax ) {

					//  member selection access

					parts = sid.split( '.' );
					sid = parts.shift();
					data.member = parts.shift();

				} else if ( arraySyntax ) {

					// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

					var indices = sid.split( '(' );
					sid = indices.shift();

					for ( var i = 0; i < indices.length; i ++ ) {

						indices[ i ] = parseInt( indices[ i ].replace( /\)/, '' ) );

					}

					data.indices = indices;

				}

				data.id = id;
				data.sid = sid;

				data.arraySyntax = arraySyntax;
				data.memberSyntax = memberSyntax;

				data.sampler = parseId( xml.getAttribute( 'source' ) );

				return data;

			}

			function buildAnimation( data ) {

				var tracks = [];

				var channels = data.channels;
				var samplers = data.samplers;
				var sources = data.sources;

				for ( var target in channels ) {

					if ( channels.hasOwnProperty( target ) ) {

						var channel = channels[ target ];
						var sampler = samplers[ channel.sampler ];

						var inputId = sampler.inputs.INPUT;
						var outputId = sampler.inputs.OUTPUT;

						var inputSource = sources[ inputId ];
						var outputSource = sources[ outputId ];

						var animation = buildAnimationChannel( channel, inputSource, outputSource );

						createKeyframeTracks( animation, tracks );

					}

				}

				return tracks;

			}

			function getAnimation( id ) {

				return getBuild( library.animations[ id ], buildAnimation );

			}

			function buildAnimationChannel( channel, inputSource, outputSource ) {

				var node = library.nodes[ channel.id ];
				var object3D = getNode( node.id );

				var transform = node.transforms[ channel.sid ];
				var defaultMatrix = node.matrix.clone().transpose();

				var time, stride;
				var i, il, j, jl;

				var data = {};

				// the collada spec allows the animation of data in various ways.
				// depending on the transform type (matrix, translate, rotate, scale), we execute different logic

				switch ( transform ) {

					case 'matrix':

						for ( i = 0, il = inputSource.array.length; i < il; i ++ ) {

							time = inputSource.array[ i ];
							stride = i * outputSource.stride;

							if ( data[ time ] === undefined ) data[ time ] = {};

							if ( channel.arraySyntax === true ) {

								var value = outputSource.array[ stride ];
								var index = channel.indices[ 0 ] + 4 * channel.indices[ 1 ];

								data[ time ][ index ] = value;

							} else {

								for ( j = 0, jl = outputSource.stride; j < jl; j ++ ) {

									data[ time ][ j ] = outputSource.array[ stride + j ];

								}

							}

						}

						break;

					case 'translate':
						console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
						break;

					case 'rotate':
						console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
						break;

					case 'scale':
						console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
						break;

				}

				var keyframes = prepareAnimationData( data, defaultMatrix );

				var animation = {
					name: object3D.uuid,
					keyframes: keyframes
				};

				return animation;

			}

			function prepareAnimationData( data, defaultMatrix ) {

				var keyframes = [];

				// transfer data into a sortable array

				for ( var time in data ) {

					keyframes.push( { time: parseFloat( time ), value: data[ time ] } );

				}

				// ensure keyframes are sorted by time

				keyframes.sort( ascending );

				// now we clean up all animation data, so we can use them for keyframe tracks

				for ( var i = 0; i < 16; i ++ ) {

					transformAnimationData( keyframes, i, defaultMatrix.elements[ i ] );

				}

				return keyframes;

				// array sort function

				function ascending( a, b ) {

					return a.time - b.time;

				}

			}

			var position = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();

			function createKeyframeTracks( animation, tracks ) {

				var keyframes = animation.keyframes;
				var name = animation.name;

				var times = [];
				var positionData = [];
				var quaternionData = [];
				var scaleData = [];

				for ( var i = 0, l = keyframes.length; i < l; i ++ ) {

					var keyframe = keyframes[ i ];

					var time = keyframe.time;
					var value = keyframe.value;

					matrix.fromArray( value ).transpose();
					matrix.decompose( position, quaternion, scale );

					times.push( time );
					positionData.push( position.x, position.y, position.z );
					quaternionData.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
					scaleData.push( scale.x, scale.y, scale.z );

				}

				if ( positionData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.position', times, positionData ) );
				if ( quaternionData.length > 0 ) tracks.push( new THREE.QuaternionKeyframeTrack( name + '.quaternion', times, quaternionData ) );
				if ( scaleData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.scale', times, scaleData ) );

				return tracks;

			}

			function transformAnimationData( keyframes, property, defaultValue ) {

				var keyframe;

				var empty = true;
				var i, l;

				// check, if values of a property are missing in our keyframes

				for ( i = 0, l = keyframes.length; i < l; i ++ ) {

					keyframe = keyframes[ i ];

					if ( keyframe.value[ property ] === undefined ) {

						keyframe.value[ property ] = null; // mark as missing

					} else {

						empty = false;

					}

				}

				if ( empty === true ) {

					// no values at all, so we set a default value

					for ( i = 0, l = keyframes.length; i < l; i ++ ) {

						keyframe = keyframes[ i ];

						keyframe.value[ property ] = defaultValue;

					}

				} else {

					// filling gaps

					createMissingKeyframes( keyframes, property );

				}

			}

			function createMissingKeyframes( keyframes, property ) {

				var prev, next;

				for ( var i = 0, l = keyframes.length; i < l; i ++ ) {

					var keyframe = keyframes[ i ];

					if ( keyframe.value[ property ] === null ) {

						prev = getPrev( keyframes, i, property );
						next = getNext( keyframes, i, property );

						if ( prev === null ) {

							keyframe.value[ property ] = next.value[ property ];
							continue;

						}

						if ( next === null ) {

							keyframe.value[ property ] = prev.value[ property ];
							continue;

						}

						interpolate( keyframe, prev, next, property );

					}

				}

			}

			function getPrev( keyframes, i, property ) {

				while ( i >= 0 ) {

					var keyframe = keyframes[ i ];

					if ( keyframe.value[ property ] !== null ) return keyframe;

					i --;

				}

				return null;

			}

			function getNext( keyframes, i, property ) {

				while ( i < keyframes.length ) {

					var keyframe = keyframes[ i ];

					if ( keyframe.value[ property ] !== null ) return keyframe;

					i ++;

				}

				return null;

			}

			function interpolate( key, prev, next, property ) {

				if ( ( next.time - prev.time ) === 0 ) {

					key.value[ property ] = prev.value[ property ];
					return;

				}

				key.value[ property ] = ( ( key.time - prev.time ) * ( next.value[ property ] - prev.value[ property ] ) / ( next.time - prev.time ) ) + prev.value[ property ];

			}

			// animation clips

			function parseAnimationClip( xml ) {

				var data = {
					name: xml.getAttribute( 'id' ) || 'default',
					start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
					end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
					animations: []
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'instance_animation':
							data.animations.push( parseId( child.getAttribute( 'url' ) ) );
							break;

					}

				}

				library.clips[ xml.getAttribute( 'id' ) ] = data;

			}

			function buildAnimationClip( data ) {

				var tracks = [];

				var name = data.name;
				var duration = ( data.end - data.start ) || - 1;
				var animations = data.animations;

				for ( var i = 0, il = animations.length; i < il; i ++ ) {

					var animationTracks = getAnimation( animations[ i ] );

					for ( var j = 0, jl = animationTracks.length; j < jl; j ++ ) {

						tracks.push( animationTracks[ j ] );

					}

				}

				return new THREE.AnimationClip( name, duration, tracks );

			}

			function getAnimationClip( id ) {

				return getBuild( library.clips[ id ], buildAnimationClip );

			}

			// controller

			function parseController( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'skin':
							// there is exactly one skin per controller
							data.id = parseId( child.getAttribute( 'source' ) );
							data.skin = parseSkin( child );
							break;

						case 'morph':
							data.id = parseId( child.getAttribute( 'source' ) );
							console.warn( 'THREE.ColladaLoader: Morph target animation not supported yet.' );
							break;

					}

				}

				library.controllers[ xml.getAttribute( 'id' ) ] = data;

			}

			function parseSkin( xml ) {

				var data = {
					sources: {}
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'bind_shape_matrix':
							data.bindShapeMatrix = parseFloats( child.textContent );
							break;

						case 'source':
							var id = child.getAttribute( 'id' );
							data.sources[ id ] = parseSource( child );
							break;

						case 'joints':
							data.joints = parseJoints( child );
							break;

						case 'vertex_weights':
							data.vertexWeights = parseVertexWeights( child );
							break;

					}

				}

				return data;

			}

			function parseJoints( xml ) {

				var data = {
					inputs: {}
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'input':
							var semantic = child.getAttribute( 'semantic' );
							var id = parseId( child.getAttribute( 'source' ) );
							data.inputs[ semantic ] = id;
							break;

					}

				}

				return data;

			}

			function parseVertexWeights( xml ) {

				var data = {
					inputs: {}
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'input':
							var semantic = child.getAttribute( 'semantic' );
							var id = parseId( child.getAttribute( 'source' ) );
							var offset = parseInt( child.getAttribute( 'offset' ) );
							data.inputs[ semantic ] = { id: id, offset: offset };
							break;

						case 'vcount':
							data.vcount = parseInts( child.textContent );
							break;

						case 'v':
							data.v = parseInts( child.textContent );
							break;

					}

				}

				return data;

			}

			function buildController( data ) {

				var build = {
					id: data.id
				};

				var geometry = library.geometries[ build.id ];

				if ( data.skin !== undefined ) {

					build.skin = buildSkin( data.skin );

					// we enhance the 'sources' property of the corresponding geometry with our skin data

					geometry.sources.skinIndices = build.skin.indices;
					geometry.sources.skinWeights = build.skin.weights;

				}

				return build;

			}

			function buildSkin( data ) {

				var BONE_LIMIT = 4;

				var build = {
					joints: [], // this must be an array to preserve the joint order
					indices: {
						array: [],
						stride: BONE_LIMIT
					},
					weights: {
						array: [],
						stride: BONE_LIMIT
					}
				};

				var sources = data.sources;
				var vertexWeights = data.vertexWeights;

				var vcount = vertexWeights.vcount;
				var v = vertexWeights.v;
				var jointOffset = vertexWeights.inputs.JOINT.offset;
				var weightOffset = vertexWeights.inputs.WEIGHT.offset;

				var jointSource = data.sources[ data.joints.inputs.JOINT ];
				var inverseSource = data.sources[ data.joints.inputs.INV_BIND_MATRIX ];

				var weights = sources[ vertexWeights.inputs.WEIGHT.id ].array;
				var stride = 0;

				var i, j, l;

				// procces skin data for each vertex

				for ( i = 0, l = vcount.length; i < l; i ++ ) {

					var jointCount = vcount[ i ]; // this is the amount of joints that affect a single vertex
					var vertexSkinData = [];

					for ( j = 0; j < jointCount; j ++ ) {

						var skinIndex = v[ stride + jointOffset ];
						var weightId = v[ stride + weightOffset ];
						var skinWeight = weights[ weightId ];

						vertexSkinData.push( { index: skinIndex, weight: skinWeight } );

						stride += 2;

					}

					// we sort the joints in descending order based on the weights.
					// this ensures, we only procced the most important joints of the vertex

					vertexSkinData.sort( descending );

					// now we provide for each vertex a set of four index and weight values.
					// the order of the skin data matches the order of vertices

					for ( j = 0; j < BONE_LIMIT; j ++ ) {

						var d = vertexSkinData[ j ];

						if ( d !== undefined ) {

							build.indices.array.push( d.index );
							build.weights.array.push( d.weight );

						} else {

							build.indices.array.push( 0 );
							build.weights.array.push( 0 );

						}

					}

				}

				// setup bind matrix

				if ( data.bindShapeMatrix ) {

					build.bindMatrix = new THREE.Matrix4().fromArray( data.bindShapeMatrix ).transpose();

				} else {

					build.bindMatrix = new THREE.Matrix4().identity();

				}

				// process bones and inverse bind matrix data

				for ( i = 0, l = jointSource.array.length; i < l; i ++ ) {

					var name = jointSource.array[ i ];
					var boneInverse = new THREE.Matrix4().fromArray( inverseSource.array, i * inverseSource.stride ).transpose();

					build.joints.push( { name: name, boneInverse: boneInverse } );

				}

				return build;

				// array sort function

				function descending( a, b ) {

					return b.weight - a.weight;

				}

			}

			function getController( id ) {

				return getBuild( library.controllers[ id ], buildController );

			}

			// image

			function parseImage( xml ) {

				var data = {
					init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
				};

				library.images[ xml.getAttribute( 'id' ) ] = data;

			}

			function buildImage( data ) {

				if ( data.build !== undefined ) return data.build;

				return data.init_from;

			}

			function getImage( id ) {

				var data = library.images[ id ];

				if ( data !== undefined ) {

					return getBuild( data, buildImage );

				}

				console.warn( 'THREE.ColladaLoader: Couldn\'t find image with ID:', id );

				return null;

			}

			// effect

			function parseEffect( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'profile_COMMON':
							data.profile = parseEffectProfileCOMMON( child );
							break;

					}

				}

				library.effects[ xml.getAttribute( 'id' ) ] = data;

			}

			function parseEffectProfileCOMMON( xml ) {

				var data = {
					surfaces: {},
					samplers: {}
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'newparam':
							parseEffectNewparam( child, data );
							break;

						case 'technique':
							data.technique = parseEffectTechnique( child );
							break;

						case 'extra':
							data.extra = parseEffectExtra( child );
							break;

					}

				}

				return data;

			}

			function parseEffectNewparam( xml, data ) {

				var sid = xml.getAttribute( 'sid' );

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'surface':
							data.surfaces[ sid ] = parseEffectSurface( child );
							break;

						case 'sampler2D':
							data.samplers[ sid ] = parseEffectSampler( child );
							break;

					}

				}

			}

			function parseEffectSurface( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'init_from':
							data.init_from = child.textContent;
							break;

					}

				}

				return data;

			}

			function parseEffectSampler( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'source':
							data.source = child.textContent;
							break;

					}

				}

				return data;

			}

			function parseEffectTechnique( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'constant':
						case 'lambert':
						case 'blinn':
						case 'phong':
							data.type = child.nodeName;
							data.parameters = parseEffectParameters( child );
							break;

					}

				}

				return data;

			}

			function parseEffectParameters( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'emission':
						case 'diffuse':
						case 'specular':
						case 'bump':
						case 'ambient':
						case 'shininess':
						case 'transparency':
							data[ child.nodeName ] = parseEffectParameter( child );
							break;
						case 'transparent':
							data[ child.nodeName ] = {
								opaque: child.getAttribute( 'opaque' ),
								data: parseEffectParameter( child )
							};
							break;

					}

				}

				return data;

			}

			function parseEffectParameter( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'color':
							data[ child.nodeName ] = parseFloats( child.textContent );
							break;

						case 'float':
							data[ child.nodeName ] = parseFloat( child.textContent );
							break;

						case 'texture':
							data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: parseEffectParameterTexture( child ) };
							break;

					}

				}

				return data;

			}

			function parseEffectParameterTexture( xml ) {

				var data = {
					technique: {}
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'extra':
							parseEffectParameterTextureExtra( child, data );
							break;

					}

				}

				return data;

			}

			function parseEffectParameterTextureExtra( xml, data ) {

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'technique':
							parseEffectParameterTextureExtraTechnique( child, data );
							break;

					}

				}

			}

			function parseEffectParameterTextureExtraTechnique( xml, data ) {

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'repeatU':
						case 'repeatV':
						case 'offsetU':
						case 'offsetV':
							data.technique[ child.nodeName ] = parseFloat( child.textContent );
							break;

						case 'wrapU':
						case 'wrapV':

							// some files have values for wrapU/wrapV which become NaN via parseInt

							if ( child.textContent.toUpperCase() === 'TRUE' ) {

								data.technique[ child.nodeName ] = 1;

							} else if ( child.textContent.toUpperCase() === 'FALSE' ) {

								data.technique[ child.nodeName ] = 0;

							} else {

								data.technique[ child.nodeName ] = parseInt( child.textContent );

							}

							break;

					}

				}

			}

			function parseEffectExtra( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'technique':
							data.technique = parseEffectExtraTechnique( child );
							break;

					}

				}

				return data;

			}

			function parseEffectExtraTechnique( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'double_sided':
							data[ child.nodeName ] = parseInt( child.textContent );
							break;

					}

				}

				return data;

			}

			function buildEffect( data ) {

				return data;

			}

			function getEffect( id ) {

				return getBuild( library.effects[ id ], buildEffect );

			}

			// material

			function parseMaterial( xml ) {

				var data = {
					name: xml.getAttribute( 'name' )
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'instance_effect':
							data.url = parseId( child.getAttribute( 'url' ) );
							break;

					}

				}

				library.materials[ xml.getAttribute( 'id' ) ] = data;

			}

			function getTextureLoader( image ) {

				var loader;

				var extension = image.slice( ( image.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ); // http://www.jstips.co/en/javascript/get-file-extension/
				extension = extension.toLowerCase();

				switch ( extension ) {

					case 'tga':
						loader = tgaLoader;
						break;

					default:
						loader = textureLoader;

				}

				return loader;

			}

			function buildMaterial( data ) {

				var effect = getEffect( data.url );
				var technique = effect.profile.technique;
				var extra = effect.profile.extra;

				var material;

				switch ( technique.type ) {

					case 'phong':
					case 'blinn':
						material = new THREE.MeshPhongMaterial();
						break;

					case 'lambert':
						material = new THREE.MeshLambertMaterial();
						break;

					default:
						material = new THREE.MeshBasicMaterial();
						break;

				}

				material.name = data.name || '';

				function getTexture( textureObject ) {

					var sampler = effect.profile.samplers[ textureObject.id ];
					var image = null;

					// get image

					if ( sampler !== undefined ) {

						var surface = effect.profile.surfaces[ sampler.source ];
						image = getImage( surface.init_from );

					} else {

						console.warn( 'THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).' );
						image = getImage( textureObject.id );

					}

					// create texture if image is avaiable

					if ( image !== null ) {

						var loader = getTextureLoader( image );

						if ( loader !== undefined ) {

							var texture = loader.load( image );

							var extra = textureObject.extra;

							if ( extra !== undefined && extra.technique !== undefined && isEmpty( extra.technique ) === false ) {

								var technique = extra.technique;

								texture.wrapS = technique.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
								texture.wrapT = technique.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

								texture.offset.set( technique.offsetU || 0, technique.offsetV || 0 );
								texture.repeat.set( technique.repeatU || 1, technique.repeatV || 1 );

							} else {

								texture.wrapS = THREE.RepeatWrapping;
								texture.wrapT = THREE.RepeatWrapping;

							}

							return texture;

						} else {

							console.warn( 'THREE.ColladaLoader: Loader for texture %s not found.', image );

							return null;

						}

					} else {

						console.warn( 'THREE.ColladaLoader: Couldn\'t create texture with ID:', textureObject.id );

						return null;

					}

				}

				var parameters = technique.parameters;

				for ( var key in parameters ) {

					var parameter = parameters[ key ];

					switch ( key ) {

						case 'diffuse':
							if ( parameter.color ) material.color.fromArray( parameter.color );
							if ( parameter.texture ) material.map = getTexture( parameter.texture );
							break;
						case 'specular':
							if ( parameter.color && material.specular ) material.specular.fromArray( parameter.color );
							if ( parameter.texture ) material.specularMap = getTexture( parameter.texture );
							break;
						case 'bump':
							if ( parameter.texture ) material.normalMap = getTexture( parameter.texture );
							break;
						case 'ambient':
							if ( parameter.texture ) material.lightMap = getTexture( parameter.texture );
							break;
						case 'shininess':
							if ( parameter.float && material.shininess ) material.shininess = parameter.float;
							break;
						case 'emission':
							if ( parameter.color && material.emissive ) material.emissive.fromArray( parameter.color );
							if ( parameter.texture ) material.emissiveMap = getTexture( parameter.texture );
							break;

					}

				}

				//

				var transparent = parameters[ 'transparent' ];
				var transparency = parameters[ 'transparency' ];

				// <transparency> does not exist but <transparent>

				if ( transparency === undefined && transparent ) {

					transparency = {
						float: 1
					};

				}

				// <transparent> does not exist but <transparency>

				if ( transparent === undefined && transparency ) {

					transparent = {
						opaque: 'A_ONE',
						data: {
							color: [ 1, 1, 1, 1 ]
						} };

				}

				if ( transparent && transparency ) {

					// handle case if a texture exists but no color

					if ( transparent.data.texture ) {

						// we do not set an alpha map (see #13792)

						material.transparent = true;

					} else {

						var color = transparent.data.color;

						switch ( transparent.opaque ) {

							case 'A_ONE':
								material.opacity = color[ 3 ] * transparency.float;
								break;
							case 'RGB_ZERO':
								material.opacity = 1 - ( color[ 0 ] * transparency.float );
								break;
							case 'A_ZERO':
								material.opacity = 1 - ( color[ 3 ] * transparency.float );
								break;
							case 'RGB_ONE':
								material.opacity = color[ 0 ] * transparency.float;
								break;
							default:
								console.warn( 'THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.', transparent.opaque );

						}

						if ( material.opacity < 1 ) material.transparent = true;

					}

				}

				//

				if ( extra !== undefined && extra.technique !== undefined && extra.technique.double_sided === 1 ) {

					material.side = THREE.DoubleSide;

				}

				return material;

			}

			function getMaterial( id ) {

				return getBuild( library.materials[ id ], buildMaterial );

			}

			// camera

			function parseCamera( xml ) {

				var data = {
					name: xml.getAttribute( 'name' )
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'optics':
							data.optics = parseCameraOptics( child );
							break;

					}

				}

				library.cameras[ xml.getAttribute( 'id' ) ] = data;

			}

			function parseCameraOptics( xml ) {

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					switch ( child.nodeName ) {

						case 'technique_common':
							return parseCameraTechnique( child );

					}

				}

				return {};

			}

			function parseCameraTechnique( xml ) {

				var data = {};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					switch ( child.nodeName ) {

						case 'perspective':
						case 'orthographic':

							data.technique = child.nodeName;
							data.parameters = parseCameraParameters( child );

							break;

					}

				}

				return data;

			}

			function parseCameraParameters( xml ) {

				var data = {};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					switch ( child.nodeName ) {

						case 'xfov':
						case 'yfov':
						case 'xmag':
						case 'ymag':
						case 'znear':
						case 'zfar':
						case 'aspect_ratio':
							data[ child.nodeName ] = parseFloat( child.textContent );
							break;

					}

				}

				return data;

			}

			function buildCamera( data ) {

				var camera;

				switch ( data.optics.technique ) {

					case 'perspective':
						camera = new THREE.PerspectiveCamera(
							data.optics.parameters.yfov,
							data.optics.parameters.aspect_ratio,
							data.optics.parameters.znear,
							data.optics.parameters.zfar
						);
						break;

					case 'orthographic':
						var ymag = data.optics.parameters.ymag;
						var xmag = data.optics.parameters.xmag;
						var aspectRatio = data.optics.parameters.aspect_ratio;

						xmag = ( xmag === undefined ) ? ( ymag * aspectRatio ) : xmag;
						ymag = ( ymag === undefined ) ? ( xmag / aspectRatio ) : ymag;

						xmag *= 0.5;
						ymag *= 0.5;

						camera = new THREE.OrthographicCamera(
							- xmag, xmag, ymag, - ymag, // left, right, top, bottom
							data.optics.parameters.znear,
							data.optics.parameters.zfar
						);
						break;

					default:
						camera = new THREE.PerspectiveCamera();
						break;

				}

				camera.name = data.name || '';

				return camera;

			}

			function getCamera( id ) {

				var data = library.cameras[ id ];

				if ( data !== undefined ) {

					return getBuild( data, buildCamera );

				}

				console.warn( 'THREE.ColladaLoader: Couldn\'t find camera with ID:', id );

				return null;

			}

			// light

			function parseLight( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'technique_common':
							data = parseLightTechnique( child );
							break;

					}

				}

				library.lights[ xml.getAttribute( 'id' ) ] = data;

			}

			function parseLightTechnique( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'directional':
						case 'point':
						case 'spot':
						case 'ambient':

							data.technique = child.nodeName;
							data.parameters = parseLightParameters( child );

					}

				}

				return data;

			}

			function parseLightParameters( xml ) {

				var data = {};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'color':
							var array = parseFloats( child.textContent );
							data.color = new THREE.Color().fromArray( array );
							break;

						case 'falloff_angle':
							data.falloffAngle = parseFloat( child.textContent );
							break;

						case 'quadratic_attenuation':
							var f = parseFloat( child.textContent );
							data.distance = f ? Math.sqrt( 1 / f ) : 0;
							break;

					}

				}

				return data;

			}

			function buildLight( data ) {

				var light;

				switch ( data.technique ) {

					case 'directional':
						light = new THREE.DirectionalLight();
						break;

					case 'point':
						light = new THREE.PointLight();
						break;

					case 'spot':
						light = new THREE.SpotLight();
						break;

					case 'ambient':
						light = new THREE.AmbientLight();
						break;

				}

				if ( data.parameters.color ) light.color.copy( data.parameters.color );
				if ( data.parameters.distance ) light.distance = data.parameters.distance;

				return light;

			}

			function getLight( id ) {

				var data = library.lights[ id ];

				if ( data !== undefined ) {

					return getBuild( data, buildLight );

				}

				console.warn( 'THREE.ColladaLoader: Couldn\'t find light with ID:', id );

				return null;

			}

			// geometry

			function parseGeometry( xml ) {

				var data = {
					name: xml.getAttribute( 'name' ),
					sources: {},
					vertices: {},
					primitives: []
				};

				var mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

				// the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
				if ( mesh === undefined ) return;

				for ( var i = 0; i < mesh.childNodes.length; i ++ ) {

					var child = mesh.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					var id = child.getAttribute( 'id' );

					switch ( child.nodeName ) {

						case 'source':
							data.sources[ id ] = parseSource( child );
							break;

						case 'vertices':
							// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
							data.vertices = parseGeometryVertices( child );
							break;

						case 'polygons':
							console.warn( 'THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName );
							break;

						case 'lines':
						case 'linestrips':
						case 'polylist':
						case 'triangles':
							data.primitives.push( parseGeometryPrimitive( child ) );
							break;

						default:
							console.log( child );

					}

				}

				library.geometries[ xml.getAttribute( 'id' ) ] = data;

			}

			function parseSource( xml ) {

				var data = {
					array: [],
					stride: 3
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'float_array':
							data.array = parseFloats( child.textContent );
							break;

						case 'Name_array':
							data.array = parseStrings( child.textContent );
							break;

						case 'technique_common':
							var accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

							if ( accessor !== undefined ) {

								data.stride = parseInt( accessor.getAttribute( 'stride' ) );

							}
							break;

					}

				}

				return data;

			}

			function parseGeometryVertices( xml ) {

				var data = {};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

				}

				return data;

			}

			function parseGeometryPrimitive( xml ) {

				var primitive = {
					type: xml.nodeName,
					material: xml.getAttribute( 'material' ),
					count: parseInt( xml.getAttribute( 'count' ) ),
					inputs: {},
					stride: 0,
					hasUV: false
				};

				for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'input':
							var id = parseId( child.getAttribute( 'source' ) );
							var semantic = child.getAttribute( 'semantic' );
							var offset = parseInt( child.getAttribute( 'offset' ) );
							var set = parseInt( child.getAttribute( 'set' ) );
							var inputname = ( set > 0 ? semantic + set : semantic );
							primitive.inputs[ inputname ] = { id: id, offset: offset };
							primitive.stride = Math.max( primitive.stride, offset + 1 );
							if ( semantic === 'TEXCOORD' ) primitive.hasUV = true;
							break;

						case 'vcount':
							primitive.vcount = parseInts( child.textContent );
							break;

						case 'p':
							primitive.p = parseInts( child.textContent );
							break;

					}

				}

				return primitive;

			}

			function groupPrimitives( primitives ) {

				var build = {};

				for ( var i = 0; i < primitives.length; i ++ ) {

					var primitive = primitives[ i ];

					if ( build[ primitive.type ] === undefined ) build[ primitive.type ] = [];

					build[ primitive.type ].push( primitive );

				}

				return build;

			}

			function checkUVCoordinates( primitives ) {

				var count = 0;

				for ( var i = 0, l = primitives.length; i < l; i ++ ) {

					var primitive = primitives[ i ];

					if ( primitive.hasUV === true ) {

						count ++;

					}

				}

				if ( count > 0 && count < primitives.length ) {

					primitives.uvsNeedsFix = true;

				}

			}

			function buildGeometry( data ) {

				var build = {};

				var sources = data.sources;
				var vertices = data.vertices;
				var primitives = data.primitives;

				if ( primitives.length === 0 ) return {};

				// our goal is to create one buffer geometry for a single type of primitives
				// first, we group all primitives by their type

				var groupedPrimitives = groupPrimitives( primitives );

				for ( var type in groupedPrimitives ) {

					var primitiveType = groupedPrimitives[ type ];

					// second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

					checkUVCoordinates( primitiveType );

					// third, create a buffer geometry for each type of primitives

					build[ type ] = buildGeometryType( primitiveType, sources, vertices );

				}

				return build;

			}

			function buildGeometryType( primitives, sources, vertices ) {

				var build = {};

				var position = { array: [], stride: 0 };
				var normal = { array: [], stride: 0 };
				var uv = { array: [], stride: 0 };
				var uv2 = { array: [], stride: 0 };
				var color = { array: [], stride: 0 };

				var skinIndex = { array: [], stride: 4 };
				var skinWeight = { array: [], stride: 4 };

				var geometry = new THREE.BufferGeometry();

				var materialKeys = [];

				var start = 0;

				for ( var p = 0; p < primitives.length; p ++ ) {

					var primitive = primitives[ p ];
					var inputs = primitive.inputs;

					// groups

					var count = 0;

					switch ( primitive.type ) {

						case 'lines':
						case 'linestrips':
							count = primitive.count * 2;
							break;

						case 'triangles':
							count = primitive.count * 3;
							break;

						case 'polylist':

							for ( var g = 0; g < primitive.count; g ++ ) {

								var vc = primitive.vcount[ g ];

								switch ( vc ) {

									case 3:
										count += 3; // single triangle
										break;

									case 4:
										count += 6; // quad, subdivided into two triangles
										break;

									default:
										count += ( vc - 2 ) * 3; // polylist with more than four vertices
										break;

								}

							}

							break;

						default:
							console.warn( 'THREE.ColladaLoader: Unknow primitive type:', primitive.type );

					}

					geometry.addGroup( start, count, p );
					start += count;

					// material

					if ( primitive.material ) {

						materialKeys.push( primitive.material );

					}

					// geometry data

					for ( var name in inputs ) {

						var input = inputs[ name ];

						switch ( name )	{

							case 'VERTEX':
								for ( var key in vertices ) {

									var id = vertices[ key ];

									switch ( key ) {

										case 'POSITION':
											var prevLength = position.array.length;
											buildGeometryData( primitive, sources[ id ], input.offset, position.array );
											position.stride = sources[ id ].stride;

											if ( sources.skinWeights && sources.skinIndices ) {

												buildGeometryData( primitive, sources.skinIndices, input.offset, skinIndex.array );
												buildGeometryData( primitive, sources.skinWeights, input.offset, skinWeight.array );

											}

											// see #3803

											if ( primitive.hasUV === false && primitives.uvsNeedsFix === true ) {

												var count = ( position.array.length - prevLength ) / position.stride;

												for ( var i = 0; i < count; i ++ ) {

													// fill missing uv coordinates

													uv.array.push( 0, 0 );

												}

											}
											break;

										case 'NORMAL':
											buildGeometryData( primitive, sources[ id ], input.offset, normal.array );
											normal.stride = sources[ id ].stride;
											break;

										case 'COLOR':
											buildGeometryData( primitive, sources[ id ], input.offset, color.array );
											color.stride = sources[ id ].stride;
											break;

										case 'TEXCOORD':
											buildGeometryData( primitive, sources[ id ], input.offset, uv.array );
											uv.stride = sources[ id ].stride;
											break;

										case 'TEXCOORD1':
											buildGeometryData( primitive, sources[ id ], input.offset, uv2.array );
											uv.stride = sources[ id ].stride;
											break;

										default:
											console.warn( 'THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key );

									}

								}
								break;

							case 'NORMAL':
								buildGeometryData( primitive, sources[ input.id ], input.offset, normal.array );
								normal.stride = sources[ input.id ].stride;
								break;

							case 'COLOR':
								buildGeometryData( primitive, sources[ input.id ], input.offset, color.array );
								color.stride = sources[ input.id ].stride;
								break;

							case 'TEXCOORD':
								buildGeometryData( primitive, sources[ input.id ], input.offset, uv.array );
								uv.stride = sources[ input.id ].stride;
								break;

							case 'TEXCOORD1':
								buildGeometryData( primitive, sources[ input.id ], input.offset, uv2.array );
								uv2.stride = sources[ input.id ].stride;
								break;

						}

					}

				}

				// build geometry

				if ( position.array.length > 0 ) geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position.array, position.stride ) );
				if ( normal.array.length > 0 ) geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normal.array, normal.stride ) );
				if ( color.array.length > 0 ) geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( color.array, color.stride ) );
				if ( uv.array.length > 0 ) geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv.array, uv.stride ) );
				if ( uv2.array.length > 0 ) geometry.setAttribute( 'uv2', new THREE.Float32BufferAttribute( uv2.array, uv2.stride ) );

				if ( skinIndex.array.length > 0 ) geometry.setAttribute( 'skinIndex', new THREE.Float32BufferAttribute( skinIndex.array, skinIndex.stride ) );
				if ( skinWeight.array.length > 0 ) geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeight.array, skinWeight.stride ) );

				build.data = geometry;
				build.type = primitives[ 0 ].type;
				build.materialKeys = materialKeys;

				return build;

			}

			function buildGeometryData( primitive, source, offset, array ) {

				var indices = primitive.p;
				var stride = primitive.stride;
				var vcount = primitive.vcount;

				function pushVector( i ) {

					var index = indices[ i + offset ] * sourceStride;
					var length = index + sourceStride;

					for ( ; index < length; index ++ ) {

						array.push( sourceArray[ index ] );

					}

				}

				var sourceArray = source.array;
				var sourceStride = source.stride;

				if ( primitive.vcount !== undefined ) {

					var index = 0;

					for ( var i = 0, l = vcount.length; i < l; i ++ ) {

						var count = vcount[ i ];

						if ( count === 4 ) {

							var a = index + stride * 0;
							var b = index + stride * 1;
							var c = index + stride * 2;
							var d = index + stride * 3;

							pushVector( a ); pushVector( b ); pushVector( d );
							pushVector( b ); pushVector( c ); pushVector( d );

						} else if ( count === 3 ) {

							var a = index + stride * 0;
							var b = index + stride * 1;
							var c = index + stride * 2;

							pushVector( a ); pushVector( b ); pushVector( c );

						} else if ( count > 4 ) {

							for ( var k = 1, kl = ( count - 2 ); k <= kl; k ++ ) {

								var a = index + stride * 0;
								var b = index + stride * k;
								var c = index + stride * ( k + 1 );

								pushVector( a ); pushVector( b ); pushVector( c );

							}

						}

						index += stride * count;

					}

				} else {

					for ( var i = 0, l = indices.length; i < l; i += stride ) {

						pushVector( i );

					}

				}

			}

			function getGeometry( id ) {

				return getBuild( library.geometries[ id ], buildGeometry );

			}

			// kinematics

			function parseKinematicsModel( xml ) {

				var data = {
					name: xml.getAttribute( 'name' ) || '',
					joints: {},
					links: []
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'technique_common':
							parseKinematicsTechniqueCommon( child, data );
							break;

					}

				}

				library.kinematicsModels[ xml.getAttribute( 'id' ) ] = data;

			}

			function buildKinematicsModel( data ) {

				if ( data.build !== undefined ) return data.build;

				return data;

			}

			function getKinematicsModel( id ) {

				return getBuild( library.kinematicsModels[ id ], buildKinematicsModel );

			}

			function parseKinematicsTechniqueCommon( xml, data ) {

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'joint':
							data.joints[ child.getAttribute( 'sid' ) ] = parseKinematicsJoint( child );
							break;

						case 'link':
							data.links.push( parseKinematicsLink( child ) );
							break;

					}

				}

			}

			function parseKinematicsJoint( xml ) {

				var data;

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'prismatic':
						case 'revolute':
							data = parseKinematicsJointParameter( child );
							break;

					}

				}

				return data;

			}

			function parseKinematicsJointParameter( xml, data ) {

				var data = {
					sid: xml.getAttribute( 'sid' ),
					name: xml.getAttribute( 'name' ) || '',
					axis: new THREE.Vector3(),
					limits: {
						min: 0,
						max: 0
					},
					type: xml.nodeName,
					static: false,
					zeroPosition: 0,
					middlePosition: 0
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'axis':
							var array = parseFloats( child.textContent );
							data.axis.fromArray( array );
							break;
						case 'limits':
							var max = child.getElementsByTagName( 'max' )[ 0 ];
							var min = child.getElementsByTagName( 'min' )[ 0 ];

							data.limits.max = parseFloat( max.textContent );
							data.limits.min = parseFloat( min.textContent );
							break;

					}

				}

				// if min is equal to or greater than max, consider the joint static

				if ( data.limits.min >= data.limits.max ) {

					data.static = true;

				}

				// calculate middle position

				data.middlePosition = ( data.limits.min + data.limits.max ) / 2.0;

				return data;

			}

			function parseKinematicsLink( xml ) {

				var data = {
					sid: xml.getAttribute( 'sid' ),
					name: xml.getAttribute( 'name' ) || '',
					attachments: [],
					transforms: []
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'attachment_full':
							data.attachments.push( parseKinematicsAttachment( child ) );
							break;

						case 'matrix':
						case 'translate':
						case 'rotate':
							data.transforms.push( parseKinematicsTransform( child ) );
							break;

					}

				}

				return data;

			}

			function parseKinematicsAttachment( xml ) {

				var data = {
					joint: xml.getAttribute( 'joint' ).split( '/' ).pop(),
					transforms: [],
					links: []
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'link':
							data.links.push( parseKinematicsLink( child ) );
							break;

						case 'matrix':
						case 'translate':
						case 'rotate':
							data.transforms.push( parseKinematicsTransform( child ) );
							break;

					}

				}

				return data;

			}

			function parseKinematicsTransform( xml ) {

				var data = {
					type: xml.nodeName
				};

				var array = parseFloats( xml.textContent );

				switch ( data.type ) {

					case 'matrix':
						data.obj = new THREE.Matrix4();
						data.obj.fromArray( array ).transpose();
						break;

					case 'translate':
						data.obj = new THREE.Vector3();
						data.obj.fromArray( array );
						break;

					case 'rotate':
						data.obj = new THREE.Vector3();
						data.obj.fromArray( array );
						data.angle = THREE.MathUtils.degToRad( array[ 3 ] );
						break;

				}

				return data;

			}

			// physics

			function parsePhysicsModel( xml ) {

				var data = {
					name: xml.getAttribute( 'name' ) || '',
					rigidBodies: {}
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'rigid_body':
							data.rigidBodies[ child.getAttribute( 'name' ) ] = {};
							parsePhysicsRigidBody( child, data.rigidBodies[ child.getAttribute( 'name' ) ] );
							break;

					}

				}

				library.physicsModels[ xml.getAttribute( 'id' ) ] = data;

			}

			function parsePhysicsRigidBody( xml, data ) {

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'technique_common':
							parsePhysicsTechniqueCommon( child, data );
							break;

					}

				}

			}

			function parsePhysicsTechniqueCommon( xml, data ) {

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'inertia':
							data.inertia = parseFloats( child.textContent );
							break;

						case 'mass':
							data.mass = parseFloats( child.textContent )[ 0 ];
							break;

					}

				}

			}

			// scene

			function parseKinematicsScene( xml ) {

				var data = {
					bindJointAxis: []
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'bind_joint_axis':
							data.bindJointAxis.push( parseKinematicsBindJointAxis( child ) );
							break;

					}

				}

				library.kinematicsScenes[ parseId( xml.getAttribute( 'url' ) ) ] = data;

			}

			function parseKinematicsBindJointAxis( xml ) {

				var data = {
					target: xml.getAttribute( 'target' ).split( '/' ).pop()
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'axis':
							var param = child.getElementsByTagName( 'param' )[ 0 ];
							data.axis = param.textContent;
							var tmpJointIndex = data.axis.split( 'inst_' ).pop().split( 'axis' )[ 0 ];
							data.jointIndex = tmpJointIndex.substr( 0, tmpJointIndex.length - 1 );
							break;

					}

				}

				return data;

			}

			function buildKinematicsScene( data ) {

				if ( data.build !== undefined ) return data.build;

				return data;

			}

			function getKinematicsScene( id ) {

				return getBuild( library.kinematicsScenes[ id ], buildKinematicsScene );

			}

			function setupKinematics() {

				var kinematicsModelId = Object.keys( library.kinematicsModels )[ 0 ];
				var kinematicsSceneId = Object.keys( library.kinematicsScenes )[ 0 ];
				var visualSceneId = Object.keys( library.visualScenes )[ 0 ];

				if ( kinematicsModelId === undefined || kinematicsSceneId === undefined ) return;

				var kinematicsModel = getKinematicsModel( kinematicsModelId );
				var kinematicsScene = getKinematicsScene( kinematicsSceneId );
				var visualScene = getVisualScene( visualSceneId );

				var bindJointAxis = kinematicsScene.bindJointAxis;
				var jointMap = {};

				for ( var i = 0, l = bindJointAxis.length; i < l; i ++ ) {

					var axis = bindJointAxis[ i ];

					// the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

					var targetElement = collada.querySelector( '[sid="' + axis.target + '"]' );

					if ( targetElement ) {

						// get the parent of the transfrom element

						var parentVisualElement = targetElement.parentElement;

						// connect the joint of the kinematics model with the element in the visual scene

						connect( axis.jointIndex, parentVisualElement );

					}

				}

				function connect( jointIndex, visualElement ) {

					var visualElementName = visualElement.getAttribute( 'name' );
					var joint = kinematicsModel.joints[ jointIndex ];

					visualScene.traverse( function ( object ) {

						if ( object.name === visualElementName ) {

							jointMap[ jointIndex ] = {
								object: object,
								transforms: buildTransformList( visualElement ),
								joint: joint,
								position: joint.zeroPosition
							};

						}

					} );

				}

				var m0 = new THREE.Matrix4();

				kinematics = {

					joints: kinematicsModel && kinematicsModel.joints,

					getJointValue: function ( jointIndex ) {

						var jointData = jointMap[ jointIndex ];

						if ( jointData ) {

							return jointData.position;

						} else {

							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.' );

						}

					},

					setJointValue: function ( jointIndex, value ) {

						var jointData = jointMap[ jointIndex ];

						if ( jointData ) {

							var joint = jointData.joint;

							if ( value > joint.limits.max || value < joint.limits.min ) {

								console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').' );

							} else if ( joint.static ) {

								console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' is static.' );

							} else {

								var object = jointData.object;
								var axis = joint.axis;
								var transforms = jointData.transforms;

								matrix.identity();

								// each update, we have to apply all transforms in the correct order

								for ( var i = 0; i < transforms.length; i ++ ) {

									var transform = transforms[ i ];

									// if there is a connection of the transform node with a joint, apply the joint value

									if ( transform.sid && transform.sid.indexOf( jointIndex ) !== - 1 ) {

										switch ( joint.type ) {

											case 'revolute':
												matrix.multiply( m0.makeRotationAxis( axis, THREE.MathUtils.degToRad( value ) ) );
												break;

											case 'prismatic':
												matrix.multiply( m0.makeTranslation( axis.x * value, axis.y * value, axis.z * value ) );
												break;

											default:
												console.warn( 'THREE.ColladaLoader: Unknown joint type: ' + joint.type );
												break;

										}

									} else {

										switch ( transform.type ) {

											case 'matrix':
												matrix.multiply( transform.obj );
												break;

											case 'translate':
												matrix.multiply( m0.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );
												break;

											case 'scale':
												matrix.scale( transform.obj );
												break;

											case 'rotate':
												matrix.multiply( m0.makeRotationAxis( transform.obj, transform.angle ) );
												break;

										}

									}

								}

								object.matrix.copy( matrix );
								object.matrix.decompose( object.position, object.quaternion, object.scale );

								jointMap[ jointIndex ].position = value;

							}

						} else {

							console.log( 'THREE.ColladaLoader: ' + jointIndex + ' does not exist.' );

						}

					}

				};

			}

			function buildTransformList( node ) {

				var transforms = [];

				var xml = collada.querySelector( '[id="' + node.id + '"]' );

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'matrix':
							var array = parseFloats( child.textContent );
							var matrix = new THREE.Matrix4().fromArray( array ).transpose();
							transforms.push( {
								sid: child.getAttribute( 'sid' ),
								type: child.nodeName,
								obj: matrix
							} );
							break;

						case 'translate':
						case 'scale':
							var array = parseFloats( child.textContent );
							var vector = new THREE.Vector3().fromArray( array );
							transforms.push( {
								sid: child.getAttribute( 'sid' ),
								type: child.nodeName,
								obj: vector
							} );
							break;

						case 'rotate':
							var array = parseFloats( child.textContent );
							var vector = new THREE.Vector3().fromArray( array );
							var angle = THREE.MathUtils.degToRad( array[ 3 ] );
							transforms.push( {
								sid: child.getAttribute( 'sid' ),
								type: child.nodeName,
								obj: vector,
								angle: angle
							} );
							break;

					}

				}

				return transforms;

			}

			// nodes

			function prepareNodes( xml ) {

				var elements = xml.getElementsByTagName( 'node' );

				// ensure all node elements have id attributes

				for ( var i = 0; i < elements.length; i ++ ) {

					var element = elements[ i ];

					if ( element.hasAttribute( 'id' ) === false ) {

						element.setAttribute( 'id', generateId() );

					}

				}

			}

			var matrix = new THREE.Matrix4();
			var vector = new THREE.Vector3();

			function parseNode( xml ) {

				var data = {
					name: xml.getAttribute( 'name' ) || '',
					type: xml.getAttribute( 'type' ),
					id: xml.getAttribute( 'id' ),
					sid: xml.getAttribute( 'sid' ),
					matrix: new THREE.Matrix4(),
					nodes: [],
					instanceCameras: [],
					instanceControllers: [],
					instanceLights: [],
					instanceGeometries: [],
					instanceNodes: [],
					transforms: {}
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					if ( child.nodeType !== 1 ) continue;

					switch ( child.nodeName ) {

						case 'node':
							data.nodes.push( child.getAttribute( 'id' ) );
							parseNode( child );
							break;

						case 'instance_camera':
							data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
							break;

						case 'instance_controller':
							data.instanceControllers.push( parseNodeInstance( child ) );
							break;

						case 'instance_light':
							data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
							break;

						case 'instance_geometry':
							data.instanceGeometries.push( parseNodeInstance( child ) );
							break;

						case 'instance_node':
							data.instanceNodes.push( parseId( child.getAttribute( 'url' ) ) );
							break;

						case 'matrix':
							var array = parseFloats( child.textContent );
							data.matrix.multiply( matrix.fromArray( array ).transpose() );
							data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
							break;

						case 'translate':
							var array = parseFloats( child.textContent );
							vector.fromArray( array );
							data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
							data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
							break;

						case 'rotate':
							var array = parseFloats( child.textContent );
							var angle = THREE.MathUtils.degToRad( array[ 3 ] );
							data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
							data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
							break;

						case 'scale':
							var array = parseFloats( child.textContent );
							data.matrix.scale( vector.fromArray( array ) );
							data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
							break;

						case 'extra':
							break;

						default:
							console.log( child );

					}

				}

				if ( hasNode( data.id ) ) {

					console.warn( 'THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id );

				} else {

					library.nodes[ data.id ] = data;

				}

				return data;

			}

			function parseNodeInstance( xml ) {

				var data = {
					id: parseId( xml.getAttribute( 'url' ) ),
					materials: {},
					skeletons: []
				};

				for ( var i = 0; i < xml.childNodes.length; i ++ ) {

					var child = xml.childNodes[ i ];

					switch ( child.nodeName ) {

						case 'bind_material':
							var instances = child.getElementsByTagName( 'instance_material' );

							for ( var j = 0; j < instances.length; j ++ ) {

								var instance = instances[ j ];
								var symbol = instance.getAttribute( 'symbol' );
								var target = instance.getAttribute( 'target' );

								data.materials[ symbol ] = parseId( target );

							}

							break;

						case 'skeleton':
							data.skeletons.push( parseId( child.textContent ) );
							break;

						default:
							break;

					}

				}

				return data;

			}

			function buildSkeleton( skeletons, joints ) {

				var boneData = [];
				var sortedBoneData = [];

				var i, j, data;

				// a skeleton can have multiple root bones. collada expresses this
				// situtation with multiple "skeleton" tags per controller instance

				for ( i = 0; i < skeletons.length; i ++ ) {

					var skeleton = skeletons[ i ];

					var root;

					if ( hasNode( skeleton ) ) {

						root = getNode( skeleton );
						buildBoneHierarchy( root, joints, boneData );

					} else if ( hasVisualScene( skeleton ) ) {

						// handle case where the skeleton refers to the visual scene (#13335)

						var visualScene = library.visualScenes[ skeleton ];
						var children = visualScene.children;

						for ( var j = 0; j < children.length; j ++ ) {

							var child = children[ j ];

							if ( child.type === 'JOINT' ) {

								var root = getNode( child.id );
								buildBoneHierarchy( root, joints, boneData );

							}

						}

					} else {

						console.error( 'THREE.ColladaLoader: Unable to find root bone of skeleton with ID:', skeleton );

					}

				}

				// sort bone data (the order is defined in the corresponding controller)

				for ( i = 0; i < joints.length; i ++ ) {

					for ( j = 0; j < boneData.length; j ++ ) {

						data = boneData[ j ];

						if ( data.bone.name === joints[ i ].name ) {

							sortedBoneData[ i ] = data;
							data.processed = true;
							break;

						}

					}

				}

				// add unprocessed bone data at the end of the list

				for ( i = 0; i < boneData.length; i ++ ) {

					data = boneData[ i ];

					if ( data.processed === false ) {

						sortedBoneData.push( data );
						data.processed = true;

					}

				}

				// setup arrays for skeleton creation

				var bones = [];
				var boneInverses = [];

				for ( i = 0; i < sortedBoneData.length; i ++ ) {

					data = sortedBoneData[ i ];

					bones.push( data.bone );
					boneInverses.push( data.boneInverse );

				}

				return new THREE.Skeleton( bones, boneInverses );

			}

			function buildBoneHierarchy( root, joints, boneData ) {

				// setup bone data from visual scene

				root.traverse( function ( object ) {

					if ( object.isBone === true ) {

						var boneInverse;

						// retrieve the boneInverse from the controller data

						for ( var i = 0; i < joints.length; i ++ ) {

							var joint = joints[ i ];

							if ( joint.name === object.name ) {

								boneInverse = joint.boneInverse;
								break;

							}

						}

						if ( boneInverse === undefined ) {

							// Unfortunately, there can be joints in the visual scene that are not part of the
							// corresponding controller. In this case, we have to create a dummy boneInverse matrix
							// for the respective bone. This bone won't affect any vertices, because there are no skin indices
							// and weights defined for it. But we still have to add the bone to the sorted bone list in order to
							// ensure a correct animation of the model.

							boneInverse = new THREE.Matrix4();

						}

						boneData.push( { bone: object, boneInverse: boneInverse, processed: false } );

					}

				} );

			}

			function buildNode( data ) {

				var objects = [];

				var matrix = data.matrix;
				var nodes = data.nodes;
				var type = data.type;
				var instanceCameras = data.instanceCameras;
				var instanceControllers = data.instanceControllers;
				var instanceLights = data.instanceLights;
				var instanceGeometries = data.instanceGeometries;
				var instanceNodes = data.instanceNodes;

				// nodes

				for ( var i = 0, l = nodes.length; i < l; i ++ ) {

					objects.push( getNode( nodes[ i ] ) );

				}

				// instance cameras

				for ( var i = 0, l = instanceCameras.length; i < l; i ++ ) {

					var instanceCamera = getCamera( instanceCameras[ i ] );

					if ( instanceCamera !== null ) {

						objects.push( instanceCamera.clone() );

					}

				}

				// instance controllers

				for ( var i = 0, l = instanceControllers.length; i < l; i ++ ) {

					var instance = instanceControllers[ i ];
					var controller = getController( instance.id );
					var geometries = getGeometry( controller.id );
					var newObjects = buildObjects( geometries, instance.materials );

					var skeletons = instance.skeletons;
					var joints = controller.skin.joints;

					var skeleton = buildSkeleton( skeletons, joints );

					for ( var j = 0, jl = newObjects.length; j < jl; j ++ ) {

						var object = newObjects[ j ];

						if ( object.isSkinnedMesh ) {

							object.bind( skeleton, controller.skin.bindMatrix );
							object.normalizeSkinWeights();

						}

						objects.push( object );

					}

				}

				// instance lights

				for ( var i = 0, l = instanceLights.length; i < l; i ++ ) {

					var instanceLight = getLight( instanceLights[ i ] );

					if ( instanceLight !== null ) {

						objects.push( instanceLight.clone() );

					}

				}

				// instance geometries

				for ( var i = 0, l = instanceGeometries.length; i < l; i ++ ) {

					var instance = instanceGeometries[ i ];

					// a single geometry instance in collada can lead to multiple object3Ds.
					// this is the case when primitives are combined like triangles and lines

					var geometries = getGeometry( instance.id );
					var newObjects = buildObjects( geometries, instance.materials );

					for ( var j = 0, jl = newObjects.length; j < jl; j ++ ) {

						objects.push( newObjects[ j ] );

					}

				}

				// instance nodes

				for ( var i = 0, l = instanceNodes.length; i < l; i ++ ) {

					objects.push( getNode( instanceNodes[ i ] ).clone() );

				}

				var object;

				if ( nodes.length === 0 && objects.length === 1 ) {

					object = objects[ 0 ];

				} else {

					object = ( type === 'JOINT' ) ? new THREE.Bone() : new THREE.Group();

					for ( var i = 0; i < objects.length; i ++ ) {

						object.add( objects[ i ] );

					}

				}

				if ( object.name === '' ) {

					object.name = ( type === 'JOINT' ) ? data.sid : data.name;

				}

				object.matrix.copy( matrix );
				object.matrix.decompose( object.position, object.quaternion, object.scale );

				return object;

			}

			var fallbackMaterial = new THREE.MeshBasicMaterial( { color: 0xff00ff } );

			function resolveMaterialBinding( keys, instanceMaterials ) {

				var materials = [];

				for ( var i = 0, l = keys.length; i < l; i ++ ) {

					var id = instanceMaterials[ keys[ i ] ];

					if ( id === undefined ) {

						console.warn( 'THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[ i ] );
						materials.push( fallbackMaterial );

					} else {

						materials.push( getMaterial( id ) );

					}

				}

				return materials;

			}

			function buildObjects( geometries, instanceMaterials ) {

				var objects = [];

				for ( var type in geometries ) {

					var geometry = geometries[ type ];

					var materials = resolveMaterialBinding( geometry.materialKeys, instanceMaterials );

					// handle case if no materials are defined

					if ( materials.length === 0 ) {

						if ( type === 'lines' || type === 'linestrips' ) {

							materials.push( new THREE.LineBasicMaterial() );

						} else {

							materials.push( new THREE.MeshPhongMaterial() );

						}

					}

					// regard skinning

					var skinning = ( geometry.data.attributes.skinIndex !== undefined );

					if ( skinning ) {

						for ( var i = 0, l = materials.length; i < l; i ++ ) {

							materials[ i ].skinning = true;

						}

					}

					// choose between a single or multi materials (material array)

					var material = ( materials.length === 1 ) ? materials[ 0 ] : materials;

					// now create a specific 3D object

					var object;

					switch ( type ) {

						case 'lines':
							object = new THREE.LineSegments( geometry.data, material );
							break;

						case 'linestrips':
							object = new THREE.Line( geometry.data, material );
							break;

						case 'triangles':
						case 'polylist':
							if ( skinning ) {

								object = new THREE.SkinnedMesh( geometry.data, material );

							} else {

								object = new THREE.Mesh( geometry.data, material );

							}
							break;

					}

					objects.push( object );

				}

				return objects;

			}

			function hasNode( id ) {

				return library.nodes[ id ] !== undefined;

			}

			function getNode( id ) {

				return getBuild( library.nodes[ id ], buildNode );

			}

			// visual scenes

			function parseVisualScene( xml ) {

				var data = {
					name: xml.getAttribute( 'name' ),
					children: []
				};

				prepareNodes( xml );

				var elements = getElementsByTagName( xml, 'node' );

				for ( var i = 0; i < elements.length; i ++ ) {

					data.children.push( parseNode( elements[ i ] ) );

				}

				library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

			}

			function buildVisualScene( data ) {

				var group = new THREE.Group();
				group.name = data.name;

				var children = data.children;

				for ( var i = 0; i < children.length; i ++ ) {

					var child = children[ i ];

					group.add( getNode( child.id ) );

				}

				return group;

			}

			function hasVisualScene( id ) {

				return library.visualScenes[ id ] !== undefined;

			}

			function getVisualScene( id ) {

				return getBuild( library.visualScenes[ id ], buildVisualScene );

			}

			// scenes

			function parseScene( xml ) {

				var instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
				return getVisualScene( parseId( instance.getAttribute( 'url' ) ) );

			}

			function setupAnimations() {

				var clips = library.clips;

				if ( isEmpty( clips ) === true ) {

					if ( isEmpty( library.animations ) === false ) {

						// if there are animations but no clips, we create a default clip for playback

						var tracks = [];

						for ( var id in library.animations ) {

							var animationTracks = getAnimation( id );

							for ( var i = 0, l = animationTracks.length; i < l; i ++ ) {

								tracks.push( animationTracks[ i ] );

							}

						}

						animations.push( new THREE.AnimationClip( 'default', - 1, tracks ) );

					}

				} else {

					for ( var id in clips ) {

						animations.push( getAnimationClip( id ) );

					}

				}

			}

			// convert the parser error element into text with each child elements text
			// separated by new lines.

			function parserErrorToText( parserError ) {

				var result = '';
				var stack = [ parserError ];

				while ( stack.length ) {

					var node = stack.shift();

					if ( node.nodeType === Node.TEXT_NODE ) {

						result += node.textContent;

					} else {

						result += '\n';
						stack.push.apply( stack, node.childNodes );

					}

				}

				return result.trim();

			}

			if ( text.length === 0 ) {

				return { scene: new THREE.Scene() };

			}

			var xml = new DOMParser().parseFromString( text, 'application/xml' );

			var collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

			var parserError = xml.getElementsByTagName( 'parsererror' )[ 0 ];
			if ( parserError !== undefined ) {

				// Chrome will return parser error with a div in it

				var errorElement = getElementsByTagName( parserError, 'div' )[ 0 ];
				var errorText;

				if ( errorElement ) {

					errorText = errorElement.textContent;

				} else {

					errorText = parserErrorToText( parserError );

				}

				console.error( 'THREE.ColladaLoader: Failed to parse collada file.\n', errorText );

				return null;

			}

			// metadata

			var version = collada.getAttribute( 'version' );
			console.log( 'THREE.ColladaLoader: File version', version );

			var asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );
			var textureLoader = new THREE.TextureLoader( this.manager );
			textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

			var tgaLoader;

			if ( THREE.TGALoader ) {

				tgaLoader = new THREE.TGALoader( this.manager );
				tgaLoader.setPath( this.resourcePath || path );

			}

			//

			var animations = [];
			var kinematics = {};
			var count = 0;

			//

			var library = {
				animations: {},
				clips: {},
				controllers: {},
				images: {},
				effects: {},
				materials: {},
				cameras: {},
				lights: {},
				geometries: {},
				nodes: {},
				visualScenes: {},
				kinematicsModels: {},
				physicsModels: {},
				kinematicsScenes: {}
			};

			parseLibrary( collada, 'library_animations', 'animation', parseAnimation );
			parseLibrary( collada, 'library_animation_clips', 'animation_clip', parseAnimationClip );
			parseLibrary( collada, 'library_controllers', 'controller', parseController );
			parseLibrary( collada, 'library_images', 'image', parseImage );
			parseLibrary( collada, 'library_effects', 'effect', parseEffect );
			parseLibrary( collada, 'library_materials', 'material', parseMaterial );
			parseLibrary( collada, 'library_cameras', 'camera', parseCamera );
			parseLibrary( collada, 'library_lights', 'light', parseLight );
			parseLibrary( collada, 'library_geometries', 'geometry', parseGeometry );
			parseLibrary( collada, 'library_nodes', 'node', parseNode );
			parseLibrary( collada, 'library_visual_scenes', 'visual_scene', parseVisualScene );
			parseLibrary( collada, 'library_kinematics_models', 'kinematics_model', parseKinematicsModel );
			parseLibrary( collada, 'library_physics_models', 'physics_model', parsePhysicsModel );
			parseLibrary( collada, 'scene', 'instance_kinematics_scene', parseKinematicsScene );

			buildLibrary( library.animations, buildAnimation );
			buildLibrary( library.clips, buildAnimationClip );
			buildLibrary( library.controllers, buildController );
			buildLibrary( library.images, buildImage );
			buildLibrary( library.effects, buildEffect );
			buildLibrary( library.materials, buildMaterial );
			buildLibrary( library.cameras, buildCamera );
			buildLibrary( library.lights, buildLight );
			buildLibrary( library.geometries, buildGeometry );
			buildLibrary( library.visualScenes, buildVisualScene );

			setupAnimations();
			setupKinematics();

			var scene = parseScene( getElementsByTagName( collada, 'scene' )[ 0 ] );

			if ( asset.upAxis === 'Z_UP' ) {

				scene.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) );

			}

			scene.scale.multiplyScalar( asset.unit );

			return {
				animations: animations,
				kinematics: kinematics,
				library: library,
				scene: scene
			};

		}

	} );
	
	return THREE.ColladaLoader;
});

define('skylark-threejs-ex/loaders/DRACOLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Don McCurdy / https://www.donmccurdy.com
	 */

	THREE.DRACOLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		this.decoderPath = '';
		this.decoderConfig = {};
		this.decoderBinary = null;
		this.decoderPending = null;

		this.workerLimit = 4;
		this.workerPool = [];
		this.workerNextTaskID = 1;
		this.workerSourceURL = '';

		this.defaultAttributeIDs = {
			position: 'POSITION',
			normal: 'NORMAL',
			color: 'COLOR',
			uv: 'TEX_COORD'
		};
		this.defaultAttributeTypes = {
			position: 'Float32Array',
			normal: 'Float32Array',
			color: 'Float32Array',
			uv: 'Float32Array'
		};

	};

	THREE.DRACOLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.DRACOLoader,

		setDecoderPath: function ( path ) {

			this.decoderPath = path;

			return this;

		},

		setDecoderConfig: function ( config ) {

			this.decoderConfig = config;

			return this;

		},

		setWorkerLimit: function ( workerLimit ) {

			this.workerLimit = workerLimit;

			return this;

		},

		/** @deprecated */
		setVerbosity: function () {

			console.warn( 'THREE.DRACOLoader: The .setVerbosity() method has been removed.' );

		},

		/** @deprecated */
		setDrawMode: function () {

			console.warn( 'THREE.DRACOLoader: The .setDrawMode() method has been removed.' );

		},

		/** @deprecated */
		setSkipDequantization: function () {

			console.warn( 'THREE.DRACOLoader: The .setSkipDequantization() method has been removed.' );

		},

		load: function ( url, onLoad, onProgress, onError ) {

			var loader = new THREE.FileLoader( this.manager );

			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );

			if ( this.crossOrigin === 'use-credentials' ) {

				loader.setWithCredentials( true );

			}

			loader.load( url, ( buffer ) => {

				var taskConfig = {
					attributeIDs: this.defaultAttributeIDs,
					attributeTypes: this.defaultAttributeTypes,
					useUniqueIDs: false
				};

				this.decodeGeometry( buffer, taskConfig )
					.then( onLoad )
					.catch( onError );

			}, onProgress, onError );

		},

		/** @deprecated Kept for backward-compatibility with previous DRACOLoader versions. */
		decodeDracoFile: function ( buffer, callback, attributeIDs, attributeTypes ) {

			var taskConfig = {
				attributeIDs: attributeIDs || this.defaultAttributeIDs,
				attributeTypes: attributeTypes || this.defaultAttributeTypes,
				useUniqueIDs: !! attributeIDs
			};

			this.decodeGeometry( buffer, taskConfig ).then( callback );

		},

		decodeGeometry: function ( buffer, taskConfig ) {

			// TODO: For backward-compatibility, support 'attributeTypes' objects containing
			// references (rather than names) to typed array constructors. These must be
			// serialized before sending them to the worker.
			for ( var attribute in taskConfig.attributeTypes ) {

				var type = taskConfig.attributeTypes[ attribute ];

				if ( type.BYTES_PER_ELEMENT !== undefined ) {

					taskConfig.attributeTypes[ attribute ] = type.name;

				}

			}

			//

			var taskKey = JSON.stringify( taskConfig );

			// Check for an existing task using this buffer. A transferred buffer cannot be transferred
			// again from this thread.
			if ( THREE.DRACOLoader.taskCache.has( buffer ) ) {

				var cachedTask = THREE.DRACOLoader.taskCache.get( buffer );

				if ( cachedTask.key === taskKey ) {

					return cachedTask.promise;

				} else if ( buffer.byteLength === 0 ) {

					// Technically, it would be possible to wait for the previous task to complete,
					// transfer the buffer back, and decode again with the second configuration. That
					// is complex, and I don't know of any reason to decode a Draco buffer twice in
					// different ways, so this is left unimplemented.
					throw new Error(

						'THREE.DRACOLoader: Unable to re-decode a buffer with different ' +
						'settings. Buffer has already been transferred.'

					);

				}

			}

			//

			var worker;
			var taskID = this.workerNextTaskID ++;
			var taskCost = buffer.byteLength;

			// Obtain a worker and assign a task, and construct a geometry instance
			// when the task completes.
			var geometryPending = this._getWorker( taskID, taskCost )
				.then( ( _worker ) => {

					worker = _worker;

					return new Promise( ( resolve, reject ) => {

						worker._callbacks[ taskID ] = { resolve, reject };

						worker.postMessage( { type: 'decode', id: taskID, taskConfig, buffer }, [ buffer ] );

						// this.debug();

					} );

				} )
				.then( ( message ) => this._createGeometry( message.geometry ) );

			// Remove task from the task list.
			geometryPending
				.finally( () => {

					if ( worker && taskID ) {

						this._releaseTask( worker, taskID );

						// this.debug();

					}

				} );

			// Cache the task result.
			THREE.DRACOLoader.taskCache.set( buffer, {

				key: taskKey,
				promise: geometryPending

			} );

			return geometryPending;

		},

		_createGeometry: function ( geometryData ) {

			var geometry = new THREE.BufferGeometry();

			if ( geometryData.index ) {

				geometry.setIndex( new THREE.BufferAttribute( geometryData.index.array, 1 ) );

			}

			for ( var i = 0; i < geometryData.attributes.length; i ++ ) {

				var attribute = geometryData.attributes[ i ];
				var name = attribute.name;
				var array = attribute.array;
				var itemSize = attribute.itemSize;

				geometry.setAttribute( name, new THREE.BufferAttribute( array, itemSize ) );

			}

			return geometry;

		},

		_loadLibrary: function ( url, responseType ) {

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.decoderPath );
			loader.setResponseType( responseType );

			return new Promise( ( resolve, reject ) => {

				loader.load( url, resolve, undefined, reject );

			} );

		},

		preload: function () {

			this._initDecoder();

			return this;

		},

		_initDecoder: function () {

			if ( this.decoderPending ) return this.decoderPending;

			var useJS = typeof WebAssembly !== 'object' || this.decoderConfig.type === 'js';
			var librariesPending = [];

			if ( useJS ) {

				librariesPending.push( this._loadLibrary( 'draco_decoder.js', 'text' ) );

			} else {

				librariesPending.push( this._loadLibrary( 'draco_wasm_wrapper.js', 'text' ) );
				librariesPending.push( this._loadLibrary( 'draco_decoder.wasm', 'arraybuffer' ) );

			}

			this.decoderPending = Promise.all( librariesPending )
				.then( ( libraries ) => {

					var jsContent = libraries[ 0 ];

					if ( ! useJS ) {

						this.decoderConfig.wasmBinary = libraries[ 1 ];

					}

					var fn = THREE.DRACOLoader.DRACOWorker.toString();

					var body = [
						'/* draco decoder */',
						jsContent,
						'',
						'/* worker */',
						fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
					].join( '\n' );

					this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );

				} );

			return this.decoderPending;

		},

		_getWorker: function ( taskID, taskCost ) {

			return this._initDecoder().then( () => {

				if ( this.workerPool.length < this.workerLimit ) {

					var worker = new Worker( this.workerSourceURL );

					worker._callbacks = {};
					worker._taskCosts = {};
					worker._taskLoad = 0;

					worker.postMessage( { type: 'init', decoderConfig: this.decoderConfig } );

					worker.onmessage = function ( e ) {

						var message = e.data;

						switch ( message.type ) {

							case 'decode':
								worker._callbacks[ message.id ].resolve( message );
								break;

							case 'error':
								worker._callbacks[ message.id ].reject( message );
								break;

							default:
								console.error( 'THREE.DRACOLoader: Unexpected message, "' + message.type + '"' );

						}

					};

					this.workerPool.push( worker );

				} else {

					this.workerPool.sort( function ( a, b ) {

						return a._taskLoad > b._taskLoad ? - 1 : 1;

					} );

				}

				var worker = this.workerPool[ this.workerPool.length - 1 ];
				worker._taskCosts[ taskID ] = taskCost;
				worker._taskLoad += taskCost;
				return worker;

			} );

		},

		_releaseTask: function ( worker, taskID ) {

			worker._taskLoad -= worker._taskCosts[ taskID ];
			delete worker._callbacks[ taskID ];
			delete worker._taskCosts[ taskID ];

		},

		debug: function () {

			console.log( 'Task load: ', this.workerPool.map( ( worker ) => worker._taskLoad ) );

		},

		dispose: function () {

			for ( var i = 0; i < this.workerPool.length; ++ i ) {

				this.workerPool[ i ].terminate();

			}

			this.workerPool.length = 0;

			return this;

		}

	} );

	/* WEB WORKER */

	THREE.DRACOLoader.DRACOWorker = function () {

		var decoderConfig;
		var decoderPending;

		onmessage = function ( e ) {

			var message = e.data;

			switch ( message.type ) {

				case 'init':
					decoderConfig = message.decoderConfig;
					decoderPending = new Promise( function ( resolve/*, reject*/ ) {

						decoderConfig.onModuleLoaded = function ( draco ) {

							// Module is Promise-like. Wrap before resolving to avoid loop.
							resolve( { draco: draco } );

						};

						DracoDecoderModule( decoderConfig );

					} );
					break;

				case 'decode':
					var buffer = message.buffer;
					var taskConfig = message.taskConfig;
					decoderPending.then( ( module ) => {

						var draco = module.draco;
						var decoder = new draco.Decoder();
						var decoderBuffer = new draco.DecoderBuffer();
						decoderBuffer.Init( new Int8Array( buffer ), buffer.byteLength );

						try {

							var geometry = decodeGeometry( draco, decoder, decoderBuffer, taskConfig );

							var buffers = geometry.attributes.map( ( attr ) => attr.array.buffer );

							if ( geometry.index ) buffers.push( geometry.index.array.buffer );

							self.postMessage( { type: 'decode', id: message.id, geometry }, buffers );

						} catch ( error ) {

							console.error( error );

							self.postMessage( { type: 'error', id: message.id, error: error.message } );

						} finally {

							draco.destroy( decoderBuffer );
							draco.destroy( decoder );

						}

					} );
					break;

			}

		};

		function decodeGeometry( draco, decoder, decoderBuffer, taskConfig ) {

			var attributeIDs = taskConfig.attributeIDs;
			var attributeTypes = taskConfig.attributeTypes;

			var dracoGeometry;
			var decodingStatus;

			var geometryType = decoder.GetEncodedGeometryType( decoderBuffer );

			if ( geometryType === draco.TRIANGULAR_MESH ) {

				dracoGeometry = new draco.Mesh();
				decodingStatus = decoder.DecodeBufferToMesh( decoderBuffer, dracoGeometry );

			} else if ( geometryType === draco.POINT_CLOUD ) {

				dracoGeometry = new draco.PointCloud();
				decodingStatus = decoder.DecodeBufferToPointCloud( decoderBuffer, dracoGeometry );

			} else {

				throw new Error( 'THREE.DRACOLoader: Unexpected geometry type.' );

			}

			if ( ! decodingStatus.ok() || dracoGeometry.ptr === 0 ) {

				throw new Error( 'THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg() );

			}

			var geometry = { index: null, attributes: [] };

			// Gather all vertex attributes.
			for ( var attributeName in attributeIDs ) {

				var attributeType = self[ attributeTypes[ attributeName ] ];

				var attribute;
				var attributeID;

				// A Draco file may be created with default vertex attributes, whose attribute IDs
				// are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
				// a Draco file may contain a custom set of attributes, identified by known unique
				// IDs. glTF files always do the latter, and `.drc` files typically do the former.
				if ( taskConfig.useUniqueIDs ) {

					attributeID = attributeIDs[ attributeName ];
					attribute = decoder.GetAttributeByUniqueId( dracoGeometry, attributeID );

				} else {

					attributeID = decoder.GetAttributeId( dracoGeometry, draco[ attributeIDs[ attributeName ] ] );

					if ( attributeID === - 1 ) continue;

					attribute = decoder.GetAttribute( dracoGeometry, attributeID );

				}

				geometry.attributes.push( decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) );

			}

			// Add index.
			if ( geometryType === draco.TRIANGULAR_MESH ) {

				// Generate mesh faces.
				var numFaces = dracoGeometry.num_faces();
				var numIndices = numFaces * 3;
				var index = new Uint32Array( numIndices );
				var indexArray = new draco.DracoInt32Array();

				for ( var i = 0; i < numFaces; ++ i ) {

					decoder.GetFaceFromMesh( dracoGeometry, i, indexArray );

					for ( var j = 0; j < 3; ++ j ) {

						index[ i * 3 + j ] = indexArray.GetValue( j );

					}

				}

				geometry.index = { array: index, itemSize: 1 };

				draco.destroy( indexArray );

			}

			draco.destroy( dracoGeometry );

			return geometry;

		}

		function decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) {

			var numComponents = attribute.num_components();
			var numPoints = dracoGeometry.num_points();
			var numValues = numPoints * numComponents;
			var dracoArray;

			var array;

			switch ( attributeType ) {

				case Float32Array:
					dracoArray = new draco.DracoFloat32Array();
					decoder.GetAttributeFloatForAllPoints( dracoGeometry, attribute, dracoArray );
					array = new Float32Array( numValues );
					break;

				case Int8Array:
					dracoArray = new draco.DracoInt8Array();
					decoder.GetAttributeInt8ForAllPoints( dracoGeometry, attribute, dracoArray );
					array = new Int8Array( numValues );
					break;

				case Int16Array:
					dracoArray = new draco.DracoInt16Array();
					decoder.GetAttributeInt16ForAllPoints( dracoGeometry, attribute, dracoArray );
					array = new Int16Array( numValues );
					break;

				case Int32Array:
					dracoArray = new draco.DracoInt32Array();
					decoder.GetAttributeInt32ForAllPoints( dracoGeometry, attribute, dracoArray );
					array = new Int32Array( numValues );
					break;

				case Uint8Array:
					dracoArray = new draco.DracoUInt8Array();
					decoder.GetAttributeUInt8ForAllPoints( dracoGeometry, attribute, dracoArray );
					array = new Uint8Array( numValues );
					break;

				case Uint16Array:
					dracoArray = new draco.DracoUInt16Array();
					decoder.GetAttributeUInt16ForAllPoints( dracoGeometry, attribute, dracoArray );
					array = new Uint16Array( numValues );
					break;

				case Uint32Array:
					dracoArray = new draco.DracoUInt32Array();
					decoder.GetAttributeUInt32ForAllPoints( dracoGeometry, attribute, dracoArray );
					array = new Uint32Array( numValues );
					break;

				default:
					throw new Error( 'THREE.DRACOLoader: Unexpected attribute type.' );

			}

			for ( var i = 0; i < numValues; i ++ ) {

				array[ i ] = dracoArray.GetValue( i );

			}

			draco.destroy( dracoArray );

			return {
				name: attributeName,
				array: array,
				itemSize: numComponents
			};

		}

	};

	THREE.DRACOLoader.taskCache = new WeakMap();

	/** Deprecated static methods */

	/** @deprecated */
	THREE.DRACOLoader.setDecoderPath = function () {

		console.warn( 'THREE.DRACOLoader: The .setDecoderPath() method has been removed. Use instance methods.' );

	};

	/** @deprecated */
	THREE.DRACOLoader.setDecoderConfig = function () {

		console.warn( 'THREE.DRACOLoader: The .setDecoderConfig() method has been removed. Use instance methods.' );

	};

	/** @deprecated */
	THREE.DRACOLoader.releaseDecoderModule = function () {

		console.warn( 'THREE.DRACOLoader: The .releaseDecoderModule() method has been removed. Use instance methods.' );

	};

	/** @deprecated */
	THREE.DRACOLoader.getDecoderModule = function () {

		console.warn( 'THREE.DRACOLoader: The .getDecoderModule() method has been removed. Use instance methods.' );

	};
	
	return THREE.DRACOLoader;
});

define('skylark-threejs-ex/loaders/FBXLoader',[
	"skylark-threejs",
	"../curves/NURBSCurve"
],function(THREE,NURBSCurve,Zlib){
	/**
	 * @author Kyle-Larson https://github.com/Kyle-Larson
	 * @author Takahiro https://github.com/takahirox
	 * @author Lewy Blue https://github.com/looeee
	 *
	 * Loader loads FBX file and generates Group representing FBX scene.
	 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
	 * Versions lower than this may load but will probably have errors
	 *
	 * Needs Support:
	 *  Morph normals / blend shape normals
	 *
	 * FBX format references:
	 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
	 * 	http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
	 *
	 * 	Binary format specification:
	 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
	 */


	THREE.FBXLoader = ( function () {

		var fbxTree;
		var connections;
		var sceneGraph;

		function FBXLoader( manager ) {

			THREE.Loader.call( this, manager );

		}

		FBXLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

			constructor: FBXLoader,

			load: function ( url, onLoad, onProgress, onError ) {

				var self = this;

				var path = ( self.path === '' ) ? THREE.LoaderUtils.extractUrlBase( url ) : self.path;

				var loader = new THREE.FileLoader( this.manager );
				loader.setPath( self.path );
				loader.setResponseType( 'arraybuffer' );

				loader.load( url, function ( buffer ) {

					try {

						onLoad( self.parse( buffer, path ) );

					} catch ( error ) {

						setTimeout( function () {

							if ( onError ) onError( error );

							self.manager.itemError( url );

						}, 0 );

					}

				}, onProgress, onError );

			},

			parse: function ( FBXBuffer, path ) {

				if ( isFbxFormatBinary( FBXBuffer ) ) {

					fbxTree = new BinaryParser().parse( FBXBuffer );

				} else {

					var FBXText = convertArrayBufferToString( FBXBuffer );

					if ( ! isFbxFormatASCII( FBXText ) ) {

						throw new Error( 'THREE.FBXLoader: Unknown format.' );

					}

					if ( getFbxVersion( FBXText ) < 7000 ) {

						throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) );

					}

					fbxTree = new TextParser().parse( FBXText );

				}

				// console.log( fbxTree );

				var textureLoader = new THREE.TextureLoader( this.manager ).setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

				return new FBXTreeParser( textureLoader, this.manager ).parse( fbxTree );

			}

		} );

		// Parse the FBXTree object returned by the BinaryParser or TextParser and return a THREE.Group
		function FBXTreeParser( textureLoader, manager ) {

			this.textureLoader = textureLoader;
			this.manager = manager;

		}

		FBXTreeParser.prototype = {

			constructor: FBXTreeParser,

			parse: function () {

				connections = this.parseConnections();

				var images = this.parseImages();
				var textures = this.parseTextures( images );
				var materials = this.parseMaterials( textures );
				var deformers = this.parseDeformers();
				var geometryMap = new GeometryParser().parse( deformers );

				this.parseScene( deformers, geometryMap, materials );

				return sceneGraph;

			},

			// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
			// and details the connection type
			parseConnections: function () {

				var connectionMap = new Map();

				if ( 'Connections' in fbxTree ) {

					var rawConnections = fbxTree.Connections.connections;

					rawConnections.forEach( function ( rawConnection ) {

						var fromID = rawConnection[ 0 ];
						var toID = rawConnection[ 1 ];
						var relationship = rawConnection[ 2 ];

						if ( ! connectionMap.has( fromID ) ) {

							connectionMap.set( fromID, {
								parents: [],
								children: []
							} );

						}

						var parentRelationship = { ID: toID, relationship: relationship };
						connectionMap.get( fromID ).parents.push( parentRelationship );

						if ( ! connectionMap.has( toID ) ) {

							connectionMap.set( toID, {
								parents: [],
								children: []
							} );

						}

						var childRelationship = { ID: fromID, relationship: relationship };
						connectionMap.get( toID ).children.push( childRelationship );

					} );

				}

				return connectionMap;

			},

			// Parse FBXTree.Objects.Video for embedded image data
			// These images are connected to textures in FBXTree.Objects.Textures
			// via FBXTree.Connections.
			parseImages: function () {

				var images = {};
				var blobs = {};

				if ( 'Video' in fbxTree.Objects ) {

					var videoNodes = fbxTree.Objects.Video;

					for ( var nodeID in videoNodes ) {

						var videoNode = videoNodes[ nodeID ];

						var id = parseInt( nodeID );

						images[ id ] = videoNode.RelativeFilename || videoNode.Filename;

						// raw image data is in videoNode.Content
						if ( 'Content' in videoNode ) {

							var arrayBufferContent = ( videoNode.Content instanceof ArrayBuffer ) && ( videoNode.Content.byteLength > 0 );
							var base64Content = ( typeof videoNode.Content === 'string' ) && ( videoNode.Content !== '' );

							if ( arrayBufferContent || base64Content ) {

								var image = this.parseImage( videoNodes[ nodeID ] );

								blobs[ videoNode.RelativeFilename || videoNode.Filename ] = image;

							}

						}

					}

				}

				for ( var id in images ) {

					var filename = images[ id ];

					if ( blobs[ filename ] !== undefined ) images[ id ] = blobs[ filename ];
					else images[ id ] = images[ id ].split( '\\' ).pop();

				}

				return images;

			},

			// Parse embedded image data in FBXTree.Video.Content
			parseImage: function ( videoNode ) {

				var content = videoNode.Content;
				var fileName = videoNode.RelativeFilename || videoNode.Filename;
				var extension = fileName.slice( fileName.lastIndexOf( '.' ) + 1 ).toLowerCase();

				var type;

				switch ( extension ) {

					case 'bmp':

						type = 'image/bmp';
						break;

					case 'jpg':
					case 'jpeg':

						type = 'image/jpeg';
						break;

					case 'png':

						type = 'image/png';
						break;

					case 'tif':

						type = 'image/tiff';
						break;

					case 'tga':

						if ( this.manager.getHandler( '.tga' ) === null ) {

							console.warn( 'FBXLoader: TGA loader not found, skipping ', fileName );

						}

						type = 'image/tga';
						break;

					default:

						console.warn( 'FBXLoader: Image type "' + extension + '" is not supported.' );
						return;

				}

				if ( typeof content === 'string' ) { // ASCII format

					return 'data:' + type + ';base64,' + content;

				} else { // Binary Format

					var array = new Uint8Array( content );
					return window.URL.createObjectURL( new Blob( [ array ], { type: type } ) );

				}

			},

			// Parse nodes in FBXTree.Objects.Texture
			// These contain details such as UV scaling, cropping, rotation etc and are connected
			// to images in FBXTree.Objects.Video
			parseTextures: function ( images ) {

				var textureMap = new Map();

				if ( 'Texture' in fbxTree.Objects ) {

					var textureNodes = fbxTree.Objects.Texture;
					for ( var nodeID in textureNodes ) {

						var texture = this.parseTexture( textureNodes[ nodeID ], images );
						textureMap.set( parseInt( nodeID ), texture );

					}

				}

				return textureMap;

			},

			// Parse individual node in FBXTree.Objects.Texture
			parseTexture: function ( textureNode, images ) {

				var texture = this.loadTexture( textureNode, images );

				texture.ID = textureNode.id;

				texture.name = textureNode.attrName;

				var wrapModeU = textureNode.WrapModeU;
				var wrapModeV = textureNode.WrapModeV;

				var valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
				var valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

				// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
				// 0: repeat(default), 1: clamp

				texture.wrapS = valueU === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
				texture.wrapT = valueV === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

				if ( 'Scaling' in textureNode ) {

					var values = textureNode.Scaling.value;

					texture.repeat.x = values[ 0 ];
					texture.repeat.y = values[ 1 ];

				}

				return texture;

			},

			// load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
			loadTexture: function ( textureNode, images ) {

				var fileName;

				var currentPath = this.textureLoader.path;

				var children = connections.get( textureNode.id ).children;

				if ( children !== undefined && children.length > 0 && images[ children[ 0 ].ID ] !== undefined ) {

					fileName = images[ children[ 0 ].ID ];

					if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

						this.textureLoader.setPath( undefined );

					}

				}

				var texture;

				var extension = textureNode.FileName.slice( - 3 ).toLowerCase();

				if ( extension === 'tga' ) {

					var loader = this.manager.getHandler( '.tga' );

					if ( loader === null ) {

						console.warn( 'FBXLoader: TGA loader not found, creating placeholder texture for', textureNode.RelativeFilename );
						texture = new THREE.Texture();

					} else {

						texture = loader.load( fileName );

					}

				} else if ( extension === 'psd' ) {

					console.warn( 'FBXLoader: PSD textures are not supported, creating placeholder texture for', textureNode.RelativeFilename );
					texture = new THREE.Texture();

				} else {

					texture = this.textureLoader.load( fileName );

				}

				this.textureLoader.setPath( currentPath );

				return texture;

			},

			// Parse nodes in FBXTree.Objects.Material
			parseMaterials: function ( textureMap ) {

				var materialMap = new Map();

				if ( 'Material' in fbxTree.Objects ) {

					var materialNodes = fbxTree.Objects.Material;

					for ( var nodeID in materialNodes ) {

						var material = this.parseMaterial( materialNodes[ nodeID ], textureMap );

						if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

					}

				}

				return materialMap;

			},

			// Parse single node in FBXTree.Objects.Material
			// Materials are connected to texture maps in FBXTree.Objects.Textures
			// FBX format currently only supports Lambert and Phong shading models
			parseMaterial: function ( materialNode, textureMap ) {

				var ID = materialNode.id;
				var name = materialNode.attrName;
				var type = materialNode.ShadingModel;

				// Case where FBX wraps shading model in property object.
				if ( typeof type === 'object' ) {

					type = type.value;

				}

				// Ignore unused materials which don't have any connections.
				if ( ! connections.has( ID ) ) return null;

				var parameters = this.parseParameters( materialNode, textureMap, ID );

				var material;

				switch ( type.toLowerCase() ) {

					case 'phong':
						material = new THREE.MeshPhongMaterial();
						break;
					case 'lambert':
						material = new THREE.MeshLambertMaterial();
						break;
					default:
						console.warn( 'THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type );
						material = new THREE.MeshPhongMaterial();
						break;

				}

				material.setValues( parameters );
				material.name = name;

				return material;

			},

			// Parse FBX material and return parameters suitable for a three.js material
			// Also parse the texture map and return any textures associated with the material
			parseParameters: function ( materialNode, textureMap, ID ) {

				var parameters = {};

				if ( materialNode.BumpFactor ) {

					parameters.bumpScale = materialNode.BumpFactor.value;

				}
				if ( materialNode.Diffuse ) {

					parameters.color = new THREE.Color().fromArray( materialNode.Diffuse.value );

				} else if ( materialNode.DiffuseColor && materialNode.DiffuseColor.type === 'Color' ) {

					// The blender exporter exports diffuse here instead of in materialNode.Diffuse
					parameters.color = new THREE.Color().fromArray( materialNode.DiffuseColor.value );

				}

				if ( materialNode.DisplacementFactor ) {

					parameters.displacementScale = materialNode.DisplacementFactor.value;

				}

				if ( materialNode.Emissive ) {

					parameters.emissive = new THREE.Color().fromArray( materialNode.Emissive.value );

				} else if ( materialNode.EmissiveColor && materialNode.EmissiveColor.type === 'Color' ) {

					// The blender exporter exports emissive color here instead of in materialNode.Emissive
					parameters.emissive = new THREE.Color().fromArray( materialNode.EmissiveColor.value );

				}

				if ( materialNode.EmissiveFactor ) {

					parameters.emissiveIntensity = parseFloat( materialNode.EmissiveFactor.value );

				}

				if ( materialNode.Opacity ) {

					parameters.opacity = parseFloat( materialNode.Opacity.value );

				}

				if ( parameters.opacity < 1.0 ) {

					parameters.transparent = true;

				}

				if ( materialNode.ReflectionFactor ) {

					parameters.reflectivity = materialNode.ReflectionFactor.value;

				}

				if ( materialNode.Shininess ) {

					parameters.shininess = materialNode.Shininess.value;

				}

				if ( materialNode.Specular ) {

					parameters.specular = new THREE.Color().fromArray( materialNode.Specular.value );

				} else if ( materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color' ) {

					// The blender exporter exports specular color here instead of in materialNode.Specular
					parameters.specular = new THREE.Color().fromArray( materialNode.SpecularColor.value );

				}

				var self = this;
				connections.get( ID ).children.forEach( function ( child ) {

					var type = child.relationship;

					switch ( type ) {

						case 'Bump':
							parameters.bumpMap = self.getTexture( textureMap, child.ID );
							break;

						case 'Maya|TEX_ao_map':
							parameters.aoMap = self.getTexture( textureMap, child.ID );
							break;

						case 'DiffuseColor':
						case 'Maya|TEX_color_map':
							parameters.map = self.getTexture( textureMap, child.ID );
							parameters.map.encoding = THREE.sRGBEncoding;
							break;

						case 'DisplacementColor':
							parameters.displacementMap = self.getTexture( textureMap, child.ID );
							break;

						case 'EmissiveColor':
							parameters.emissiveMap = self.getTexture( textureMap, child.ID );
							parameters.emissiveMap.encoding = THREE.sRGBEncoding;
							break;

						case 'NormalMap':
						case 'Maya|TEX_normal_map':
							parameters.normalMap = self.getTexture( textureMap, child.ID );
							break;

						case 'ReflectionColor':
							parameters.envMap = self.getTexture( textureMap, child.ID );
							parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
							parameters.envMap.encoding = THREE.sRGBEncoding;
							break;

						case 'SpecularColor':
							parameters.specularMap = self.getTexture( textureMap, child.ID );
							parameters.specularMap.encoding = THREE.sRGBEncoding;
							break;

						case 'TransparentColor':
							parameters.alphaMap = self.getTexture( textureMap, child.ID );
							parameters.transparent = true;
							break;

						case 'AmbientColor':
						case 'ShininessExponent': // AKA glossiness map
						case 'SpecularFactor': // AKA specularLevel
						case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
						default:
							console.warn( 'THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type );
							break;

					}

				} );

				return parameters;

			},

			// get a texture from the textureMap for use by a material.
			getTexture: function ( textureMap, id ) {

				// if the texture is a layered texture, just use the first layer and issue a warning
				if ( 'LayeredTexture' in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture ) {

					console.warn( 'THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.' );
					id = connections.get( id ).children[ 0 ].ID;

				}

				return textureMap.get( id );

			},

			// Parse nodes in FBXTree.Objects.Deformer
			// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
			// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
			parseDeformers: function () {

				var skeletons = {};
				var morphTargets = {};

				if ( 'Deformer' in fbxTree.Objects ) {

					var DeformerNodes = fbxTree.Objects.Deformer;

					for ( var nodeID in DeformerNodes ) {

						var deformerNode = DeformerNodes[ nodeID ];

						var relationships = connections.get( parseInt( nodeID ) );

						if ( deformerNode.attrType === 'Skin' ) {

							var skeleton = this.parseSkeleton( relationships, DeformerNodes );
							skeleton.ID = nodeID;

							if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: skeleton attached to more than one geometry is not supported.' );
							skeleton.geometryID = relationships.parents[ 0 ].ID;

							skeletons[ nodeID ] = skeleton;

						} else if ( deformerNode.attrType === 'BlendShape' ) {

							var morphTarget = {
								id: nodeID,
							};

							morphTarget.rawTargets = this.parseMorphTargets( relationships, DeformerNodes );
							morphTarget.id = nodeID;

							if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: morph target attached to more than one geometry is not supported.' );

							morphTargets[ nodeID ] = morphTarget;

						}

					}

				}

				return {

					skeletons: skeletons,
					morphTargets: morphTargets,

				};

			},

			// Parse single nodes in FBXTree.Objects.Deformer
			// The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
			// Each skin node represents a skeleton and each cluster node represents a bone
			parseSkeleton: function ( relationships, deformerNodes ) {

				var rawBones = [];

				relationships.children.forEach( function ( child ) {

					var boneNode = deformerNodes[ child.ID ];

					if ( boneNode.attrType !== 'Cluster' ) return;

					var rawBone = {

						ID: child.ID,
						indices: [],
						weights: [],
						transformLink: new THREE.Matrix4().fromArray( boneNode.TransformLink.a ),
						// transform: new THREE.Matrix4().fromArray( boneNode.Transform.a ),
						// linkMode: boneNode.Mode,

					};

					if ( 'Indexes' in boneNode ) {

						rawBone.indices = boneNode.Indexes.a;
						rawBone.weights = boneNode.Weights.a;

					}

					rawBones.push( rawBone );

				} );

				return {

					rawBones: rawBones,
					bones: []

				};

			},

			// The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
			parseMorphTargets: function ( relationships, deformerNodes ) {

				var rawMorphTargets = [];

				for ( var i = 0; i < relationships.children.length; i ++ ) {

					var child = relationships.children[ i ];

					var morphTargetNode = deformerNodes[ child.ID ];

					var rawMorphTarget = {

						name: morphTargetNode.attrName,
						initialWeight: morphTargetNode.DeformPercent,
						id: morphTargetNode.id,
						fullWeights: morphTargetNode.FullWeights.a

					};

					if ( morphTargetNode.attrType !== 'BlendShapeChannel' ) return;

					rawMorphTarget.geoID = connections.get( parseInt( child.ID ) ).children.filter( function ( child ) {

						return child.relationship === undefined;

					} )[ 0 ].ID;

					rawMorphTargets.push( rawMorphTarget );

				}

				return rawMorphTargets;

			},

			// create the main THREE.Group() to be returned by the loader
			parseScene: function ( deformers, geometryMap, materialMap ) {

				sceneGraph = new THREE.Group();

				var modelMap = this.parseModels( deformers.skeletons, geometryMap, materialMap );

				var modelNodes = fbxTree.Objects.Model;

				var self = this;
				modelMap.forEach( function ( model ) {

					var modelNode = modelNodes[ model.ID ];
					self.setLookAtProperties( model, modelNode );

					var parentConnections = connections.get( model.ID ).parents;

					parentConnections.forEach( function ( connection ) {

						var parent = modelMap.get( connection.ID );
						if ( parent !== undefined ) parent.add( model );

					} );

					if ( model.parent === null ) {

						sceneGraph.add( model );

					}


				} );

				this.bindSkeleton( deformers.skeletons, geometryMap, modelMap );

				this.createAmbientLight();

				this.setupMorphMaterials();

				sceneGraph.traverse( function ( node ) {

					if ( node.userData.transformData ) {

						if ( node.parent ) node.userData.transformData.parentMatrixWorld = node.parent.matrix;

						var transform = generateTransform( node.userData.transformData );

						node.applyMatrix4( transform );

					}

				} );

				var animations = new AnimationParser().parse();

				// if all the models where already combined in a single group, just return that
				if ( sceneGraph.children.length === 1 && sceneGraph.children[ 0 ].isGroup ) {

					sceneGraph.children[ 0 ].animations = animations;
					sceneGraph = sceneGraph.children[ 0 ];

				}

				sceneGraph.animations = animations;

			},

			// parse nodes in FBXTree.Objects.Model
			parseModels: function ( skeletons, geometryMap, materialMap ) {

				var modelMap = new Map();
				var modelNodes = fbxTree.Objects.Model;

				for ( var nodeID in modelNodes ) {

					var id = parseInt( nodeID );
					var node = modelNodes[ nodeID ];
					var relationships = connections.get( id );

					var model = this.buildSkeleton( relationships, skeletons, id, node.attrName );

					if ( ! model ) {

						switch ( node.attrType ) {

							case 'Camera':
								model = this.createCamera( relationships );
								break;
							case 'Light':
								model = this.createLight( relationships );
								break;
							case 'Mesh':
								model = this.createMesh( relationships, geometryMap, materialMap );
								break;
							case 'NurbsCurve':
								model = this.createCurve( relationships, geometryMap );
								break;
							case 'LimbNode':
							case 'Root':
								model = new THREE.Bone();
								break;
							case 'Null':
							default:
								model = new THREE.Group();
								break;

						}

						model.name = node.attrName ? THREE.PropertyBinding.sanitizeNodeName( node.attrName ) : '';

						model.ID = id;

					}

					this.getTransformData( model, node );
					modelMap.set( id, model );

				}

				return modelMap;

			},

			buildSkeleton: function ( relationships, skeletons, id, name ) {

				var bone = null;

				relationships.parents.forEach( function ( parent ) {

					for ( var ID in skeletons ) {

						var skeleton = skeletons[ ID ];

						skeleton.rawBones.forEach( function ( rawBone, i ) {

							if ( rawBone.ID === parent.ID ) {

								var subBone = bone;
								bone = new THREE.Bone();

								bone.matrixWorld.copy( rawBone.transformLink );

								// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id

								bone.name = name ? THREE.PropertyBinding.sanitizeNodeName( name ) : '';
								bone.ID = id;

								skeleton.bones[ i ] = bone;

								// In cases where a bone is shared between multiple meshes
								// duplicate the bone here and and it as a child of the first bone
								if ( subBone !== null ) {

									bone.add( subBone );

								}

							}

						} );

					}

				} );

				return bone;

			},

			// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
			createCamera: function ( relationships ) {

				var model;
				var cameraAttribute;

				relationships.children.forEach( function ( child ) {

					var attr = fbxTree.Objects.NodeAttribute[ child.ID ];

					if ( attr !== undefined ) {

						cameraAttribute = attr;

					}

				} );

				if ( cameraAttribute === undefined ) {

					model = new THREE.Object3D();

				} else {

					var type = 0;
					if ( cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1 ) {

						type = 1;

					}

					var nearClippingPlane = 1;
					if ( cameraAttribute.NearPlane !== undefined ) {

						nearClippingPlane = cameraAttribute.NearPlane.value / 1000;

					}

					var farClippingPlane = 1000;
					if ( cameraAttribute.FarPlane !== undefined ) {

						farClippingPlane = cameraAttribute.FarPlane.value / 1000;

					}


					var width = window.innerWidth;
					var height = window.innerHeight;

					if ( cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined ) {

						width = cameraAttribute.AspectWidth.value;
						height = cameraAttribute.AspectHeight.value;

					}

					var aspect = width / height;

					var fov = 45;
					if ( cameraAttribute.FieldOfView !== undefined ) {

						fov = cameraAttribute.FieldOfView.value;

					}

					var focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

					switch ( type ) {

						case 0: // Perspective
							model = new THREE.PerspectiveCamera( fov, aspect, nearClippingPlane, farClippingPlane );
							if ( focalLength !== null ) model.setFocalLength( focalLength );
							break;

						case 1: // Orthographic
							model = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, nearClippingPlane, farClippingPlane );
							break;

						default:
							console.warn( 'THREE.FBXLoader: Unknown camera type ' + type + '.' );
							model = new THREE.Object3D();
							break;

					}

				}

				return model;

			},

			// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
			createLight: function ( relationships ) {

				var model;
				var lightAttribute;

				relationships.children.forEach( function ( child ) {

					var attr = fbxTree.Objects.NodeAttribute[ child.ID ];

					if ( attr !== undefined ) {

						lightAttribute = attr;

					}

				} );

				if ( lightAttribute === undefined ) {

					model = new THREE.Object3D();

				} else {

					var type;

					// LightType can be undefined for Point lights
					if ( lightAttribute.LightType === undefined ) {

						type = 0;

					} else {

						type = lightAttribute.LightType.value;

					}

					var color = 0xffffff;

					if ( lightAttribute.Color !== undefined ) {

						color = new THREE.Color().fromArray( lightAttribute.Color.value );

					}

					var intensity = ( lightAttribute.Intensity === undefined ) ? 1 : lightAttribute.Intensity.value / 100;

					// light disabled
					if ( lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0 ) {

						intensity = 0;

					}

					var distance = 0;
					if ( lightAttribute.FarAttenuationEnd !== undefined ) {

						if ( lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0 ) {

							distance = 0;

						} else {

							distance = lightAttribute.FarAttenuationEnd.value;

						}

					}

					// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
					var decay = 1;

					switch ( type ) {

						case 0: // Point
							model = new THREE.PointLight( color, intensity, distance, decay );
							break;

						case 1: // Directional
							model = new THREE.DirectionalLight( color, intensity );
							break;

						case 2: // Spot
							var angle = Math.PI / 3;

							if ( lightAttribute.InnerAngle !== undefined ) {

								angle = THREE.MathUtils.degToRad( lightAttribute.InnerAngle.value );

							}

							var penumbra = 0;
							if ( lightAttribute.OuterAngle !== undefined ) {

								// TODO: this is not correct - FBX calculates outer and inner angle in degrees
								// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
								// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
								penumbra = THREE.MathUtils.degToRad( lightAttribute.OuterAngle.value );
								penumbra = Math.max( penumbra, 1 );

							}

							model = new THREE.SpotLight( color, intensity, distance, angle, penumbra, decay );
							break;

						default:
							console.warn( 'THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a THREE.PointLight.' );
							model = new THREE.PointLight( color, intensity );
							break;

					}

					if ( lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1 ) {

						model.castShadow = true;

					}

				}

				return model;

			},

			createMesh: function ( relationships, geometryMap, materialMap ) {

				var model;
				var geometry = null;
				var material = null;
				var materials = [];

				// get geometry and materials(s) from connections
				relationships.children.forEach( function ( child ) {

					if ( geometryMap.has( child.ID ) ) {

						geometry = geometryMap.get( child.ID );

					}

					if ( materialMap.has( child.ID ) ) {

						materials.push( materialMap.get( child.ID ) );

					}

				} );

				if ( materials.length > 1 ) {

					material = materials;

				} else if ( materials.length > 0 ) {

					material = materials[ 0 ];

				} else {

					material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
					materials.push( material );

				}

				if ( 'color' in geometry.attributes ) {

					materials.forEach( function ( material ) {

						material.vertexColors = true;

					} );

				}

				if ( geometry.FBX_Deformer ) {

					materials.forEach( function ( material ) {

						material.skinning = true;

					} );

					model = new THREE.SkinnedMesh( geometry, material );
					model.normalizeSkinWeights();

				} else {

					model = new THREE.Mesh( geometry, material );

				}

				return model;

			},

			createCurve: function ( relationships, geometryMap ) {

				var geometry = relationships.children.reduce( function ( geo, child ) {

					if ( geometryMap.has( child.ID ) ) geo = geometryMap.get( child.ID );

					return geo;

				}, null );

				// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
				var material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 1 } );
				return new THREE.Line( geometry, material );

			},

			// parse the model node for transform data
			getTransformData: function ( model, modelNode ) {

				var transformData = {};

				if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

				if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
				else transformData.eulerOrder = 'ZYX';

				if ( 'Lcl_Translation' in modelNode ) transformData.translation = modelNode.Lcl_Translation.value;

				if ( 'PreRotation' in modelNode ) transformData.preRotation = modelNode.PreRotation.value;
				if ( 'Lcl_Rotation' in modelNode ) transformData.rotation = modelNode.Lcl_Rotation.value;
				if ( 'PostRotation' in modelNode ) transformData.postRotation = modelNode.PostRotation.value;

				if ( 'Lcl_Scaling' in modelNode ) transformData.scale = modelNode.Lcl_Scaling.value;

				if ( 'ScalingOffset' in modelNode ) transformData.scalingOffset = modelNode.ScalingOffset.value;
				if ( 'ScalingPivot' in modelNode ) transformData.scalingPivot = modelNode.ScalingPivot.value;

				if ( 'RotationOffset' in modelNode ) transformData.rotationOffset = modelNode.RotationOffset.value;
				if ( 'RotationPivot' in modelNode ) transformData.rotationPivot = modelNode.RotationPivot.value;

				model.userData.transformData = transformData;

			},

			setLookAtProperties: function ( model, modelNode ) {

				if ( 'LookAtProperty' in modelNode ) {

					var children = connections.get( model.ID ).children;

					children.forEach( function ( child ) {

						if ( child.relationship === 'LookAtProperty' ) {

							var lookAtTarget = fbxTree.Objects.Model[ child.ID ];

							if ( 'Lcl_Translation' in lookAtTarget ) {

								var pos = lookAtTarget.Lcl_Translation.value;

								// DirectionalLight, SpotLight
								if ( model.target !== undefined ) {

									model.target.position.fromArray( pos );
									sceneGraph.add( model.target );

								} else { // Cameras and other Object3Ds

									model.lookAt( new THREE.Vector3().fromArray( pos ) );

								}

							}

						}

					} );

				}

			},

			bindSkeleton: function ( skeletons, geometryMap, modelMap ) {

				var bindMatrices = this.parsePoseNodes();

				for ( var ID in skeletons ) {

					var skeleton = skeletons[ ID ];

					var parents = connections.get( parseInt( skeleton.ID ) ).parents;

					parents.forEach( function ( parent ) {

						if ( geometryMap.has( parent.ID ) ) {

							var geoID = parent.ID;
							var geoRelationships = connections.get( geoID );

							geoRelationships.parents.forEach( function ( geoConnParent ) {

								if ( modelMap.has( geoConnParent.ID ) ) {

									var model = modelMap.get( geoConnParent.ID );

									model.bind( new THREE.Skeleton( skeleton.bones ), bindMatrices[ geoConnParent.ID ] );

								}

							} );

						}

					} );

				}

			},

			parsePoseNodes: function () {

				var bindMatrices = {};

				if ( 'Pose' in fbxTree.Objects ) {

					var BindPoseNode = fbxTree.Objects.Pose;

					for ( var nodeID in BindPoseNode ) {

						if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

							var poseNodes = BindPoseNode[ nodeID ].PoseNode;

							if ( Array.isArray( poseNodes ) ) {

								poseNodes.forEach( function ( poseNode ) {

									bindMatrices[ poseNode.Node ] = new THREE.Matrix4().fromArray( poseNode.Matrix.a );

								} );

							} else {

								bindMatrices[ poseNodes.Node ] = new THREE.Matrix4().fromArray( poseNodes.Matrix.a );

							}

						}

					}

				}

				return bindMatrices;

			},

			// Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
			createAmbientLight: function () {

				if ( 'GlobalSettings' in fbxTree && 'AmbientColor' in fbxTree.GlobalSettings ) {

					var ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
					var r = ambientColor[ 0 ];
					var g = ambientColor[ 1 ];
					var b = ambientColor[ 2 ];

					if ( r !== 0 || g !== 0 || b !== 0 ) {

						var color = new THREE.Color( r, g, b );
						sceneGraph.add( new THREE.AmbientLight( color, 1 ) );

					}

				}

			},

			setupMorphMaterials: function () {

				var self = this;
				sceneGraph.traverse( function ( child ) {

					if ( child.isMesh ) {

						if ( child.geometry.morphAttributes.position && child.geometry.morphAttributes.position.length ) {

							if ( Array.isArray( child.material ) ) {

								child.material.forEach( function ( material, i ) {

									self.setupMorphMaterial( child, material, i );

								} );

							} else {

								self.setupMorphMaterial( child, child.material );

							}

						}

					}

				} );

			},

			setupMorphMaterial: function ( child, material, index ) {

				var uuid = child.uuid;
				var matUuid = material.uuid;

				// if a geometry has morph targets, it cannot share the material with other geometries
				var sharedMat = false;

				sceneGraph.traverse( function ( node ) {

					if ( node.isMesh ) {

						if ( Array.isArray( node.material ) ) {

							node.material.forEach( function ( mat ) {

								if ( mat.uuid === matUuid && node.uuid !== uuid ) sharedMat = true;

							} );

						} else if ( node.material.uuid === matUuid && node.uuid !== uuid ) sharedMat = true;

					}

				} );

				if ( sharedMat === true ) {

					var clonedMat = material.clone();
					clonedMat.morphTargets = true;

					if ( index === undefined ) child.material = clonedMat;
					else child.material[ index ] = clonedMat;

				} else material.morphTargets = true;

			}

		};

		// parse Geometry data from FBXTree and return map of BufferGeometries
		function GeometryParser() {}

		GeometryParser.prototype = {

			constructor: GeometryParser,

			// Parse nodes in FBXTree.Objects.Geometry
			parse: function ( deformers ) {

				var geometryMap = new Map();

				if ( 'Geometry' in fbxTree.Objects ) {

					var geoNodes = fbxTree.Objects.Geometry;

					for ( var nodeID in geoNodes ) {

						var relationships = connections.get( parseInt( nodeID ) );
						var geo = this.parseGeometry( relationships, geoNodes[ nodeID ], deformers );

						geometryMap.set( parseInt( nodeID ), geo );

					}

				}

				return geometryMap;

			},

			// Parse single node in FBXTree.Objects.Geometry
			parseGeometry: function ( relationships, geoNode, deformers ) {

				switch ( geoNode.attrType ) {

					case 'Mesh':
						return this.parseMeshGeometry( relationships, geoNode, deformers );
						break;

					case 'NurbsCurve':
						return this.parseNurbsGeometry( geoNode );
						break;

				}

			},


			// Parse single node mesh geometry in FBXTree.Objects.Geometry
			parseMeshGeometry: function ( relationships, geoNode, deformers ) {

				var skeletons = deformers.skeletons;
				var morphTargets = [];

				var modelNodes = relationships.parents.map( function ( parent ) {

					return fbxTree.Objects.Model[ parent.ID ];

				} );

				// don't create geometry if it is not associated with any models
				if ( modelNodes.length === 0 ) return;

				var skeleton = relationships.children.reduce( function ( skeleton, child ) {

					if ( skeletons[ child.ID ] !== undefined ) skeleton = skeletons[ child.ID ];

					return skeleton;

				}, null );

				relationships.children.forEach( function ( child ) {

					if ( deformers.morphTargets[ child.ID ] !== undefined ) {

						morphTargets.push( deformers.morphTargets[ child.ID ] );

					}

				} );

				// Assume one model and get the preRotation from that
				// if there is more than one model associated with the geometry this may cause problems
				var modelNode = modelNodes[ 0 ];

				var transformData = {};

				if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
				if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

				if ( 'GeometricTranslation' in modelNode ) transformData.translation = modelNode.GeometricTranslation.value;
				if ( 'GeometricRotation' in modelNode ) transformData.rotation = modelNode.GeometricRotation.value;
				if ( 'GeometricScaling' in modelNode ) transformData.scale = modelNode.GeometricScaling.value;

				var transform = generateTransform( transformData );

				return this.genGeometry( geoNode, skeleton, morphTargets, transform );

			},

			// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
			genGeometry: function ( geoNode, skeleton, morphTargets, preTransform ) {

				var geo = new THREE.BufferGeometry();
				if ( geoNode.attrName ) geo.name = geoNode.attrName;

				var geoInfo = this.parseGeoNode( geoNode, skeleton );
				var buffers = this.genBuffers( geoInfo );

				var positionAttribute = new THREE.Float32BufferAttribute( buffers.vertex, 3 );

				positionAttribute.applyMatrix4( preTransform );

				geo.setAttribute( 'position', positionAttribute );

				if ( buffers.colors.length > 0 ) {

					geo.setAttribute( 'color', new THREE.Float32BufferAttribute( buffers.colors, 3 ) );

				}

				if ( skeleton ) {

					geo.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( buffers.weightsIndices, 4 ) );

					geo.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( buffers.vertexWeights, 4 ) );

					// used later to bind the skeleton to the model
					geo.FBX_Deformer = skeleton;

				}

				if ( buffers.normal.length > 0 ) {

					var normalMatrix = new THREE.Matrix3().getNormalMatrix( preTransform );

					var normalAttribute = new THREE.Float32BufferAttribute( buffers.normal, 3 );
					normalAttribute.applyNormalMatrix( normalMatrix );

					geo.setAttribute( 'normal', normalAttribute );

				}

				buffers.uvs.forEach( function ( uvBuffer, i ) {

					// subsequent uv buffers are called 'uv1', 'uv2', ...
					var name = 'uv' + ( i + 1 ).toString();

					// the first uv buffer is just called 'uv'
					if ( i === 0 ) {

						name = 'uv';

					}

					geo.setAttribute( name, new THREE.Float32BufferAttribute( buffers.uvs[ i ], 2 ) );

				} );

				if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

					// Convert the material indices of each vertex into rendering groups on the geometry.
					var prevMaterialIndex = buffers.materialIndex[ 0 ];
					var startIndex = 0;

					buffers.materialIndex.forEach( function ( currentIndex, i ) {

						if ( currentIndex !== prevMaterialIndex ) {

							geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

							prevMaterialIndex = currentIndex;
							startIndex = i;

						}

					} );

					// the loop above doesn't add the last group, do that here.
					if ( geo.groups.length > 0 ) {

						var lastGroup = geo.groups[ geo.groups.length - 1 ];
						var lastIndex = lastGroup.start + lastGroup.count;

						if ( lastIndex !== buffers.materialIndex.length ) {

							geo.addGroup( lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex );

						}

					}

					// case where there are multiple materials but the whole geometry is only
					// using one of them
					if ( geo.groups.length === 0 ) {

						geo.addGroup( 0, buffers.materialIndex.length, buffers.materialIndex[ 0 ] );

					}

				}

				this.addMorphTargets( geo, geoNode, morphTargets, preTransform );

				return geo;

			},

			parseGeoNode: function ( geoNode, skeleton ) {

				var geoInfo = {};

				geoInfo.vertexPositions = ( geoNode.Vertices !== undefined ) ? geoNode.Vertices.a : [];
				geoInfo.vertexIndices = ( geoNode.PolygonVertexIndex !== undefined ) ? geoNode.PolygonVertexIndex.a : [];

				if ( geoNode.LayerElementColor ) {

					geoInfo.color = this.parseVertexColors( geoNode.LayerElementColor[ 0 ] );

				}

				if ( geoNode.LayerElementMaterial ) {

					geoInfo.material = this.parseMaterialIndices( geoNode.LayerElementMaterial[ 0 ] );

				}

				if ( geoNode.LayerElementNormal ) {

					geoInfo.normal = this.parseNormals( geoNode.LayerElementNormal[ 0 ] );

				}

				if ( geoNode.LayerElementUV ) {

					geoInfo.uv = [];

					var i = 0;
					while ( geoNode.LayerElementUV[ i ] ) {

						geoInfo.uv.push( this.parseUVs( geoNode.LayerElementUV[ i ] ) );
						i ++;

					}

				}

				geoInfo.weightTable = {};

				if ( skeleton !== null ) {

					geoInfo.skeleton = skeleton;

					skeleton.rawBones.forEach( function ( rawBone, i ) {

						// loop over the bone's vertex indices and weights
						rawBone.indices.forEach( function ( index, j ) {

							if ( geoInfo.weightTable[ index ] === undefined ) geoInfo.weightTable[ index ] = [];

							geoInfo.weightTable[ index ].push( {

								id: i,
								weight: rawBone.weights[ j ],

							} );

						} );

					} );

				}

				return geoInfo;

			},

			genBuffers: function ( geoInfo ) {

				var buffers = {
					vertex: [],
					normal: [],
					colors: [],
					uvs: [],
					materialIndex: [],
					vertexWeights: [],
					weightsIndices: [],
				};

				var polygonIndex = 0;
				var faceLength = 0;
				var displayedWeightsWarning = false;

				// these will hold data for a single face
				var facePositionIndexes = [];
				var faceNormals = [];
				var faceColors = [];
				var faceUVs = [];
				var faceWeights = [];
				var faceWeightIndices = [];

				var self = this;
				geoInfo.vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {

					var endOfFace = false;

					// Face index and vertex index arrays are combined in a single array
					// A cube with quad faces looks like this:
					// PolygonVertexIndex: *24 {
					//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
					//  }
					// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
					// to find index of last vertex bit shift the index: ^ - 1
					if ( vertexIndex < 0 ) {

						vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
						endOfFace = true;

					}

					var weightIndices = [];
					var weights = [];

					facePositionIndexes.push( vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2 );

					if ( geoInfo.color ) {

						var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color );

						faceColors.push( data[ 0 ], data[ 1 ], data[ 2 ] );

					}

					if ( geoInfo.skeleton ) {

						if ( geoInfo.weightTable[ vertexIndex ] !== undefined ) {

							geoInfo.weightTable[ vertexIndex ].forEach( function ( wt ) {

								weights.push( wt.weight );
								weightIndices.push( wt.id );

							} );


						}

						if ( weights.length > 4 ) {

							if ( ! displayedWeightsWarning ) {

								console.warn( 'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
								displayedWeightsWarning = true;

							}

							var wIndex = [ 0, 0, 0, 0 ];
							var Weight = [ 0, 0, 0, 0 ];

							weights.forEach( function ( weight, weightIndex ) {

								var currentWeight = weight;
								var currentIndex = weightIndices[ weightIndex ];

								Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

									if ( currentWeight > comparedWeight ) {

										comparedWeightArray[ comparedWeightIndex ] = currentWeight;
										currentWeight = comparedWeight;

										var tmp = wIndex[ comparedWeightIndex ];
										wIndex[ comparedWeightIndex ] = currentIndex;
										currentIndex = tmp;

									}

								} );

							} );

							weightIndices = wIndex;
							weights = Weight;

						}

						// if the weight array is shorter than 4 pad with 0s
						while ( weights.length < 4 ) {

							weights.push( 0 );
							weightIndices.push( 0 );

						}

						for ( var i = 0; i < 4; ++ i ) {

							faceWeights.push( weights[ i ] );
							faceWeightIndices.push( weightIndices[ i ] );

						}

					}

					if ( geoInfo.normal ) {

						var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal );

						faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );

					}

					if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

						var materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material )[ 0 ];

					}

					if ( geoInfo.uv ) {

						geoInfo.uv.forEach( function ( uv, i ) {

							var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uv );

							if ( faceUVs[ i ] === undefined ) {

								faceUVs[ i ] = [];

							}

							faceUVs[ i ].push( data[ 0 ] );
							faceUVs[ i ].push( data[ 1 ] );

						} );

					}

					faceLength ++;

					if ( endOfFace ) {

						self.genFace( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength );

						polygonIndex ++;
						faceLength = 0;

						// reset arrays for the next face
						facePositionIndexes = [];
						faceNormals = [];
						faceColors = [];
						faceUVs = [];
						faceWeights = [];
						faceWeightIndices = [];

					}

				} );

				return buffers;

			},

			// Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
			genFace: function ( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength ) {

				for ( var i = 2; i < faceLength; i ++ ) {

					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 0 ] ] );
					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 1 ] ] );
					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 2 ] ] );

					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 ] ] );
					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 1 ] ] );
					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 2 ] ] );

					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 ] ] );
					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 1 ] ] );
					buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 2 ] ] );

					if ( geoInfo.skeleton ) {

						buffers.vertexWeights.push( faceWeights[ 0 ] );
						buffers.vertexWeights.push( faceWeights[ 1 ] );
						buffers.vertexWeights.push( faceWeights[ 2 ] );
						buffers.vertexWeights.push( faceWeights[ 3 ] );

						buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 ] );
						buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 1 ] );
						buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 2 ] );
						buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 3 ] );

						buffers.vertexWeights.push( faceWeights[ i * 4 ] );
						buffers.vertexWeights.push( faceWeights[ i * 4 + 1 ] );
						buffers.vertexWeights.push( faceWeights[ i * 4 + 2 ] );
						buffers.vertexWeights.push( faceWeights[ i * 4 + 3 ] );

						buffers.weightsIndices.push( faceWeightIndices[ 0 ] );
						buffers.weightsIndices.push( faceWeightIndices[ 1 ] );
						buffers.weightsIndices.push( faceWeightIndices[ 2 ] );
						buffers.weightsIndices.push( faceWeightIndices[ 3 ] );

						buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 ] );
						buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 1 ] );
						buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 2 ] );
						buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 3 ] );

						buffers.weightsIndices.push( faceWeightIndices[ i * 4 ] );
						buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 1 ] );
						buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 2 ] );
						buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 3 ] );

					}

					if ( geoInfo.color ) {

						buffers.colors.push( faceColors[ 0 ] );
						buffers.colors.push( faceColors[ 1 ] );
						buffers.colors.push( faceColors[ 2 ] );

						buffers.colors.push( faceColors[ ( i - 1 ) * 3 ] );
						buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 1 ] );
						buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 2 ] );

						buffers.colors.push( faceColors[ i * 3 ] );
						buffers.colors.push( faceColors[ i * 3 + 1 ] );
						buffers.colors.push( faceColors[ i * 3 + 2 ] );

					}

					if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

						buffers.materialIndex.push( materialIndex );
						buffers.materialIndex.push( materialIndex );
						buffers.materialIndex.push( materialIndex );

					}

					if ( geoInfo.normal ) {

						buffers.normal.push( faceNormals[ 0 ] );
						buffers.normal.push( faceNormals[ 1 ] );
						buffers.normal.push( faceNormals[ 2 ] );

						buffers.normal.push( faceNormals[ ( i - 1 ) * 3 ] );
						buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 1 ] );
						buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 2 ] );

						buffers.normal.push( faceNormals[ i * 3 ] );
						buffers.normal.push( faceNormals[ i * 3 + 1 ] );
						buffers.normal.push( faceNormals[ i * 3 + 2 ] );

					}

					if ( geoInfo.uv ) {

						geoInfo.uv.forEach( function ( uv, j ) {

							if ( buffers.uvs[ j ] === undefined ) buffers.uvs[ j ] = [];

							buffers.uvs[ j ].push( faceUVs[ j ][ 0 ] );
							buffers.uvs[ j ].push( faceUVs[ j ][ 1 ] );

							buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
							buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

							buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 ] );
							buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );

						} );

					}

				}

			},

			addMorphTargets: function ( parentGeo, parentGeoNode, morphTargets, preTransform ) {

				if ( morphTargets.length === 0 ) return;

				parentGeo.morphTargetsRelative = true;

				parentGeo.morphAttributes.position = [];
				// parentGeo.morphAttributes.normal = []; // not implemented

				var self = this;
				morphTargets.forEach( function ( morphTarget ) {

					morphTarget.rawTargets.forEach( function ( rawTarget ) {

						var morphGeoNode = fbxTree.Objects.Geometry[ rawTarget.geoID ];

						if ( morphGeoNode !== undefined ) {

							self.genMorphGeometry( parentGeo, parentGeoNode, morphGeoNode, preTransform, rawTarget.name );

						}

					} );

				} );

			},

			// a morph geometry node is similar to a standard  node, and the node is also contained
			// in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
			// and a special attribute Index defining which vertices of the original geometry are affected
			// Normal and position attributes only have data for the vertices that are affected by the morph
			genMorphGeometry: function ( parentGeo, parentGeoNode, morphGeoNode, preTransform, name ) {

				var vertexIndices = ( parentGeoNode.PolygonVertexIndex !== undefined ) ? parentGeoNode.PolygonVertexIndex.a : [];

				var morphPositionsSparse = ( morphGeoNode.Vertices !== undefined ) ? morphGeoNode.Vertices.a : [];
				var indices = ( morphGeoNode.Indexes !== undefined ) ? morphGeoNode.Indexes.a : [];

				var length = parentGeo.attributes.position.count * 3;
				var morphPositions = new Float32Array( length );

				for ( var i = 0; i < indices.length; i ++ ) {

					var morphIndex = indices[ i ] * 3;

					morphPositions[ morphIndex ] = morphPositionsSparse[ i * 3 ];
					morphPositions[ morphIndex + 1 ] = morphPositionsSparse[ i * 3 + 1 ];
					morphPositions[ morphIndex + 2 ] = morphPositionsSparse[ i * 3 + 2 ];

				}

				// TODO: add morph normal support
				var morphGeoInfo = {
					vertexIndices: vertexIndices,
					vertexPositions: morphPositions,

				};

				var morphBuffers = this.genBuffers( morphGeoInfo );

				var positionAttribute = new THREE.Float32BufferAttribute( morphBuffers.vertex, 3 );
				positionAttribute.name = name || morphGeoNode.attrName;

				positionAttribute.applyMatrix4( preTransform );

				parentGeo.morphAttributes.position.push( positionAttribute );

			},

			// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
			parseNormals: function ( NormalNode ) {

				var mappingType = NormalNode.MappingInformationType;
				var referenceType = NormalNode.ReferenceInformationType;
				var buffer = NormalNode.Normals.a;
				var indexBuffer = [];
				if ( referenceType === 'IndexToDirect' ) {

					if ( 'NormalIndex' in NormalNode ) {

						indexBuffer = NormalNode.NormalIndex.a;

					} else if ( 'NormalsIndex' in NormalNode ) {

						indexBuffer = NormalNode.NormalsIndex.a;

					}

				}

				return {
					dataSize: 3,
					buffer: buffer,
					indices: indexBuffer,
					mappingType: mappingType,
					referenceType: referenceType
				};

			},

			// Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
			parseUVs: function ( UVNode ) {

				var mappingType = UVNode.MappingInformationType;
				var referenceType = UVNode.ReferenceInformationType;
				var buffer = UVNode.UV.a;
				var indexBuffer = [];
				if ( referenceType === 'IndexToDirect' ) {

					indexBuffer = UVNode.UVIndex.a;

				}

				return {
					dataSize: 2,
					buffer: buffer,
					indices: indexBuffer,
					mappingType: mappingType,
					referenceType: referenceType
				};

			},

			// Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
			parseVertexColors: function ( ColorNode ) {

				var mappingType = ColorNode.MappingInformationType;
				var referenceType = ColorNode.ReferenceInformationType;
				var buffer = ColorNode.Colors.a;
				var indexBuffer = [];
				if ( referenceType === 'IndexToDirect' ) {

					indexBuffer = ColorNode.ColorIndex.a;

				}

				return {
					dataSize: 4,
					buffer: buffer,
					indices: indexBuffer,
					mappingType: mappingType,
					referenceType: referenceType
				};

			},

			// Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
			parseMaterialIndices: function ( MaterialNode ) {

				var mappingType = MaterialNode.MappingInformationType;
				var referenceType = MaterialNode.ReferenceInformationType;

				if ( mappingType === 'NoMappingInformation' ) {

					return {
						dataSize: 1,
						buffer: [ 0 ],
						indices: [ 0 ],
						mappingType: 'AllSame',
						referenceType: referenceType
					};

				}

				var materialIndexBuffer = MaterialNode.Materials.a;

				// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
				// we expect.So we create an intermediate buffer that points to the index in the buffer,
				// for conforming with the other functions we've written for other data.
				var materialIndices = [];

				for ( var i = 0; i < materialIndexBuffer.length; ++ i ) {

					materialIndices.push( i );

				}

				return {
					dataSize: 1,
					buffer: materialIndexBuffer,
					indices: materialIndices,
					mappingType: mappingType,
					referenceType: referenceType
				};

			},

			// Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
			parseNurbsGeometry: function ( geoNode ) {

				if ( THREE.NURBSCurve === undefined ) {

					console.error( 'THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.' );
					return new THREE.BufferGeometry();

				}

				var order = parseInt( geoNode.Order );

				if ( isNaN( order ) ) {

					console.error( 'THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id );
					return new THREE.BufferGeometry();

				}

				var degree = order - 1;

				var knots = geoNode.KnotVector.a;
				var controlPoints = [];
				var pointsValues = geoNode.Points.a;

				for ( var i = 0, l = pointsValues.length; i < l; i += 4 ) {

					controlPoints.push( new THREE.Vector4().fromArray( pointsValues, i ) );

				}

				var startKnot, endKnot;

				if ( geoNode.Form === 'Closed' ) {

					controlPoints.push( controlPoints[ 0 ] );

				} else if ( geoNode.Form === 'Periodic' ) {

					startKnot = degree;
					endKnot = knots.length - 1 - startKnot;

					for ( var i = 0; i < degree; ++ i ) {

						controlPoints.push( controlPoints[ i ] );

					}

				}

				var curve = new THREE.NURBSCurve( degree, knots, controlPoints, startKnot, endKnot );
				var vertices = curve.getPoints( controlPoints.length * 7 );

				var positions = new Float32Array( vertices.length * 3 );

				vertices.forEach( function ( vertex, i ) {

					vertex.toArray( positions, i * 3 );

				} );

				var geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

				return geometry;

			},

		};

		// parse animation data from FBXTree
		function AnimationParser() {}

		AnimationParser.prototype = {

			constructor: AnimationParser,

			// take raw animation clips and turn them into three.js animation clips
			parse: function () {

				var animationClips = [];

				var rawClips = this.parseClips();

				if ( rawClips !== undefined ) {

					for ( var key in rawClips ) {

						var rawClip = rawClips[ key ];

						var clip = this.addClip( rawClip );

						animationClips.push( clip );

					}

				}

				return animationClips;

			},

			parseClips: function () {

				// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
				// if this is undefined we can safely assume there are no animations
				if ( fbxTree.Objects.AnimationCurve === undefined ) return undefined;

				var curveNodesMap = this.parseAnimationCurveNodes();

				this.parseAnimationCurves( curveNodesMap );

				var layersMap = this.parseAnimationLayers( curveNodesMap );
				var rawClips = this.parseAnimStacks( layersMap );

				return rawClips;

			},

			// parse nodes in FBXTree.Objects.AnimationCurveNode
			// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
			// and is referenced by an AnimationLayer
			parseAnimationCurveNodes: function () {

				var rawCurveNodes = fbxTree.Objects.AnimationCurveNode;

				var curveNodesMap = new Map();

				for ( var nodeID in rawCurveNodes ) {

					var rawCurveNode = rawCurveNodes[ nodeID ];

					if ( rawCurveNode.attrName.match( /S|R|T|DeformPercent/ ) !== null ) {

						var curveNode = {

							id: rawCurveNode.id,
							attr: rawCurveNode.attrName,
							curves: {},

						};

						curveNodesMap.set( curveNode.id, curveNode );

					}

				}

				return curveNodesMap;

			},

			// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
			// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
			// axis ( e.g. times and values of x rotation)
			parseAnimationCurves: function ( curveNodesMap ) {

				var rawCurves = fbxTree.Objects.AnimationCurve;

				// TODO: Many values are identical up to roundoff error, but won't be optimised
				// e.g. position times: [0, 0.4, 0. 8]
				// position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
				// clearly, this should be optimised to
				// times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
				// this shows up in nearly every FBX file, and generally time array is length > 100

				for ( var nodeID in rawCurves ) {

					var animationCurve = {

						id: rawCurves[ nodeID ].id,
						times: rawCurves[ nodeID ].KeyTime.a.map( convertFBXTimeToSeconds ),
						values: rawCurves[ nodeID ].KeyValueFloat.a,

					};

					var relationships = connections.get( animationCurve.id );

					if ( relationships !== undefined ) {

						var animationCurveID = relationships.parents[ 0 ].ID;
						var animationCurveRelationship = relationships.parents[ 0 ].relationship;

						if ( animationCurveRelationship.match( /X/ ) ) {

							curveNodesMap.get( animationCurveID ).curves[ 'x' ] = animationCurve;

						} else if ( animationCurveRelationship.match( /Y/ ) ) {

							curveNodesMap.get( animationCurveID ).curves[ 'y' ] = animationCurve;

						} else if ( animationCurveRelationship.match( /Z/ ) ) {

							curveNodesMap.get( animationCurveID ).curves[ 'z' ] = animationCurve;

						} else if ( animationCurveRelationship.match( /d|DeformPercent/ ) && curveNodesMap.has( animationCurveID ) ) {

							curveNodesMap.get( animationCurveID ).curves[ 'morph' ] = animationCurve;

						}

					}

				}

			},

			// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
			// to various AnimationCurveNodes and is referenced by an AnimationStack node
			// note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
			parseAnimationLayers: function ( curveNodesMap ) {

				var rawLayers = fbxTree.Objects.AnimationLayer;

				var layersMap = new Map();

				for ( var nodeID in rawLayers ) {

					var layerCurveNodes = [];

					var connection = connections.get( parseInt( nodeID ) );

					if ( connection !== undefined ) {

						// all the animationCurveNodes used in the layer
						var children = connection.children;

						children.forEach( function ( child, i ) {

							if ( curveNodesMap.has( child.ID ) ) {

								var curveNode = curveNodesMap.get( child.ID );

								// check that the curves are defined for at least one axis, otherwise ignore the curveNode
								if ( curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined ) {

									if ( layerCurveNodes[ i ] === undefined ) {

										var modelID = connections.get( child.ID ).parents.filter( function ( parent ) {

											return parent.relationship !== undefined;

										} )[ 0 ].ID;

										if ( modelID !== undefined ) {

											var rawModel = fbxTree.Objects.Model[ modelID.toString() ];

											var node = {

												modelName: rawModel.attrName ? THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ) : '',
												ID: rawModel.id,
												initialPosition: [ 0, 0, 0 ],
												initialRotation: [ 0, 0, 0 ],
												initialScale: [ 1, 1, 1 ],

											};

											sceneGraph.traverse( function ( child ) {

												if ( child.ID === rawModel.id ) {

													node.transform = child.matrix;

													if ( child.userData.transformData ) node.eulerOrder = child.userData.transformData.eulerOrder;

												}

											} );

											if ( ! node.transform ) node.transform = new THREE.Matrix4();

											// if the animated model is pre rotated, we'll have to apply the pre rotations to every
											// animation value as well
											if ( 'PreRotation' in rawModel ) node.preRotation = rawModel.PreRotation.value;
											if ( 'PostRotation' in rawModel ) node.postRotation = rawModel.PostRotation.value;

											layerCurveNodes[ i ] = node;

										}

									}

									if ( layerCurveNodes[ i ] ) layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

								} else if ( curveNode.curves.morph !== undefined ) {

									if ( layerCurveNodes[ i ] === undefined ) {

										var deformerID = connections.get( child.ID ).parents.filter( function ( parent ) {

											return parent.relationship !== undefined;

										} )[ 0 ].ID;

										var morpherID = connections.get( deformerID ).parents[ 0 ].ID;
										var geoID = connections.get( morpherID ).parents[ 0 ].ID;

										// assuming geometry is not used in more than one model
										var modelID = connections.get( geoID ).parents[ 0 ].ID;

										var rawModel = fbxTree.Objects.Model[ modelID ];

										var node = {

											modelName: rawModel.attrName ? THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ) : '',
											morphName: fbxTree.Objects.Deformer[ deformerID ].attrName,

										};

										layerCurveNodes[ i ] = node;

									}

									layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

								}

							}

						} );

						layersMap.set( parseInt( nodeID ), layerCurveNodes );

					}

				}

				return layersMap;

			},

			// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
			// hierarchy. Each Stack node will be used to create a THREE.AnimationClip
			parseAnimStacks: function ( layersMap ) {

				var rawStacks = fbxTree.Objects.AnimationStack;

				// connect the stacks (clips) up to the layers
				var rawClips = {};

				for ( var nodeID in rawStacks ) {

					var children = connections.get( parseInt( nodeID ) ).children;

					if ( children.length > 1 ) {

						// it seems like stacks will always be associated with a single layer. But just in case there are files
						// where there are multiple layers per stack, we'll display a warning
						console.warn( 'THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.' );

					}

					var layer = layersMap.get( children[ 0 ].ID );

					rawClips[ nodeID ] = {

						name: rawStacks[ nodeID ].attrName,
						layer: layer,

					};

				}

				return rawClips;

			},

			addClip: function ( rawClip ) {

				var tracks = [];

				var self = this;
				rawClip.layer.forEach( function ( rawTracks ) {

					tracks = tracks.concat( self.generateTracks( rawTracks ) );

				} );

				return new THREE.AnimationClip( rawClip.name, - 1, tracks );

			},

			generateTracks: function ( rawTracks ) {

				var tracks = [];

				var initialPosition = new THREE.Vector3();
				var initialRotation = new THREE.Quaternion();
				var initialScale = new THREE.Vector3();

				if ( rawTracks.transform ) rawTracks.transform.decompose( initialPosition, initialRotation, initialScale );

				initialPosition = initialPosition.toArray();
				initialRotation = new THREE.Euler().setFromQuaternion( initialRotation, rawTracks.eulerOrder ).toArray();
				initialScale = initialScale.toArray();

				if ( rawTracks.T !== undefined && Object.keys( rawTracks.T.curves ).length > 0 ) {

					var positionTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.T.curves, initialPosition, 'position' );
					if ( positionTrack !== undefined ) tracks.push( positionTrack );

				}

				if ( rawTracks.R !== undefined && Object.keys( rawTracks.R.curves ).length > 0 ) {

					var rotationTrack = this.generateRotationTrack( rawTracks.modelName, rawTracks.R.curves, initialRotation, rawTracks.preRotation, rawTracks.postRotation, rawTracks.eulerOrder );
					if ( rotationTrack !== undefined ) tracks.push( rotationTrack );

				}

				if ( rawTracks.S !== undefined && Object.keys( rawTracks.S.curves ).length > 0 ) {

					var scaleTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale' );
					if ( scaleTrack !== undefined ) tracks.push( scaleTrack );

				}

				if ( rawTracks.DeformPercent !== undefined ) {

					var morphTrack = this.generateMorphTrack( rawTracks );
					if ( morphTrack !== undefined ) tracks.push( morphTrack );

				}

				return tracks;

			},

			generateVectorTrack: function ( modelName, curves, initialValue, type ) {

				var times = this.getTimesForAllAxes( curves );
				var values = this.getKeyframeTrackValues( times, curves, initialValue );

				return new THREE.VectorKeyframeTrack( modelName + '.' + type, times, values );

			},

			generateRotationTrack: function ( modelName, curves, initialValue, preRotation, postRotation, eulerOrder ) {

				if ( curves.x !== undefined ) {

					this.interpolateRotations( curves.x );
					curves.x.values = curves.x.values.map( THREE.MathUtils.degToRad );

				}
				if ( curves.y !== undefined ) {

					this.interpolateRotations( curves.y );
					curves.y.values = curves.y.values.map( THREE.MathUtils.degToRad );

				}
				if ( curves.z !== undefined ) {

					this.interpolateRotations( curves.z );
					curves.z.values = curves.z.values.map( THREE.MathUtils.degToRad );

				}

				var times = this.getTimesForAllAxes( curves );
				var values = this.getKeyframeTrackValues( times, curves, initialValue );

				if ( preRotation !== undefined ) {

					preRotation = preRotation.map( THREE.MathUtils.degToRad );
					preRotation.push( eulerOrder );

					preRotation = new THREE.Euler().fromArray( preRotation );
					preRotation = new THREE.Quaternion().setFromEuler( preRotation );

				}

				if ( postRotation !== undefined ) {

					postRotation = postRotation.map( THREE.MathUtils.degToRad );
					postRotation.push( eulerOrder );

					postRotation = new THREE.Euler().fromArray( postRotation );
					postRotation = new THREE.Quaternion().setFromEuler( postRotation ).inverse();

				}

				var quaternion = new THREE.Quaternion();
				var euler = new THREE.Euler();

				var quaternionValues = [];

				for ( var i = 0; i < values.length; i += 3 ) {

					euler.set( values[ i ], values[ i + 1 ], values[ i + 2 ], eulerOrder );

					quaternion.setFromEuler( euler );

					if ( preRotation !== undefined ) quaternion.premultiply( preRotation );
					if ( postRotation !== undefined ) quaternion.multiply( postRotation );

					quaternion.toArray( quaternionValues, ( i / 3 ) * 4 );

				}

				return new THREE.QuaternionKeyframeTrack( modelName + '.quaternion', times, quaternionValues );

			},

			generateMorphTrack: function ( rawTracks ) {

				var curves = rawTracks.DeformPercent.curves.morph;
				var values = curves.values.map( function ( val ) {

					return val / 100;

				} );

				var morphNum = sceneGraph.getObjectByName( rawTracks.modelName ).morphTargetDictionary[ rawTracks.morphName ];

				return new THREE.NumberKeyframeTrack( rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']', curves.times, values );

			},

			// For all animated objects, times are defined separately for each axis
			// Here we'll combine the times into one sorted array without duplicates
			getTimesForAllAxes: function ( curves ) {

				var times = [];

				// first join together the times for each axis, if defined
				if ( curves.x !== undefined ) times = times.concat( curves.x.times );
				if ( curves.y !== undefined ) times = times.concat( curves.y.times );
				if ( curves.z !== undefined ) times = times.concat( curves.z.times );

				// then sort them and remove duplicates
				times = times.sort( function ( a, b ) {

					return a - b;

				} ).filter( function ( elem, index, array ) {

					return array.indexOf( elem ) == index;

				} );

				return times;

			},

			getKeyframeTrackValues: function ( times, curves, initialValue ) {

				var prevValue = initialValue;

				var values = [];

				var xIndex = - 1;
				var yIndex = - 1;
				var zIndex = - 1;

				times.forEach( function ( time ) {

					if ( curves.x ) xIndex = curves.x.times.indexOf( time );
					if ( curves.y ) yIndex = curves.y.times.indexOf( time );
					if ( curves.z ) zIndex = curves.z.times.indexOf( time );

					// if there is an x value defined for this frame, use that
					if ( xIndex !== - 1 ) {

						var xValue = curves.x.values[ xIndex ];
						values.push( xValue );
						prevValue[ 0 ] = xValue;

					} else {

						// otherwise use the x value from the previous frame
						values.push( prevValue[ 0 ] );

					}

					if ( yIndex !== - 1 ) {

						var yValue = curves.y.values[ yIndex ];
						values.push( yValue );
						prevValue[ 1 ] = yValue;

					} else {

						values.push( prevValue[ 1 ] );

					}

					if ( zIndex !== - 1 ) {

						var zValue = curves.z.values[ zIndex ];
						values.push( zValue );
						prevValue[ 2 ] = zValue;

					} else {

						values.push( prevValue[ 2 ] );

					}

				} );

				return values;

			},

			// Rotations are defined as Euler angles which can have values  of any size
			// These will be converted to quaternions which don't support values greater than
			// PI, so we'll interpolate large rotations
			interpolateRotations: function ( curve ) {

				for ( var i = 1; i < curve.values.length; i ++ ) {

					var initialValue = curve.values[ i - 1 ];
					var valuesSpan = curve.values[ i ] - initialValue;

					var absoluteSpan = Math.abs( valuesSpan );

					if ( absoluteSpan >= 180 ) {

						var numSubIntervals = absoluteSpan / 180;

						var step = valuesSpan / numSubIntervals;
						var nextValue = initialValue + step;

						var initialTime = curve.times[ i - 1 ];
						var timeSpan = curve.times[ i ] - initialTime;
						var interval = timeSpan / numSubIntervals;
						var nextTime = initialTime + interval;

						var interpolatedTimes = [];
						var interpolatedValues = [];

						while ( nextTime < curve.times[ i ] ) {

							interpolatedTimes.push( nextTime );
							nextTime += interval;

							interpolatedValues.push( nextValue );
							nextValue += step;

						}

						curve.times = inject( curve.times, i, interpolatedTimes );
						curve.values = inject( curve.values, i, interpolatedValues );

					}

				}

			},

		};

		// parse an FBX file in ASCII format
		function TextParser() {}

		TextParser.prototype = {

			constructor: TextParser,

			getPrevNode: function () {

				return this.nodeStack[ this.currentIndent - 2 ];

			},

			getCurrentNode: function () {

				return this.nodeStack[ this.currentIndent - 1 ];

			},

			getCurrentProp: function () {

				return this.currentProp;

			},

			pushStack: function ( node ) {

				this.nodeStack.push( node );
				this.currentIndent += 1;

			},

			popStack: function () {

				this.nodeStack.pop();
				this.currentIndent -= 1;

			},

			setCurrentProp: function ( val, name ) {

				this.currentProp = val;
				this.currentPropName = name;

			},

			parse: function ( text ) {

				this.currentIndent = 0;

				this.allNodes = new FBXTree();
				this.nodeStack = [];
				this.currentProp = [];
				this.currentPropName = '';

				var self = this;

				var split = text.split( /[\r\n]+/ );

				split.forEach( function ( line, i ) {

					var matchComment = line.match( /^[\s\t]*;/ );
					var matchEmpty = line.match( /^[\s\t]*$/ );

					if ( matchComment || matchEmpty ) return;

					var matchBeginning = line.match( '^\\t{' + self.currentIndent + '}(\\w+):(.*){', '' );
					var matchProperty = line.match( '^\\t{' + ( self.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
					var matchEnd = line.match( '^\\t{' + ( self.currentIndent - 1 ) + '}}' );

					if ( matchBeginning ) {

						self.parseNodeBegin( line, matchBeginning );

					} else if ( matchProperty ) {

						self.parseNodeProperty( line, matchProperty, split[ ++ i ] );

					} else if ( matchEnd ) {

						self.popStack();

					} else if ( line.match( /^[^\s\t}]/ ) ) {

						// large arrays are split over multiple lines terminated with a ',' character
						// if this is encountered the line needs to be joined to the previous line
						self.parseNodePropertyContinued( line );

					}

				} );

				return this.allNodes;

			},

			parseNodeBegin: function ( line, property ) {

				var nodeName = property[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );

				var nodeAttrs = property[ 2 ].split( ',' ).map( function ( attr ) {

					return attr.trim().replace( /^"/, '' ).replace( /"$/, '' );

				} );

				var node = { name: nodeName };
				var attrs = this.parseNodeAttr( nodeAttrs );

				var currentNode = this.getCurrentNode();

				// a top node
				if ( this.currentIndent === 0 ) {

					this.allNodes.add( nodeName, node );

				} else { // a subnode

					// if the subnode already exists, append it
					if ( nodeName in currentNode ) {

						// special case Pose needs PoseNodes as an array
						if ( nodeName === 'PoseNode' ) {

							currentNode.PoseNode.push( node );

						} else if ( currentNode[ nodeName ].id !== undefined ) {

							currentNode[ nodeName ] = {};
							currentNode[ nodeName ][ currentNode[ nodeName ].id ] = currentNode[ nodeName ];

						}

						if ( attrs.id !== '' ) currentNode[ nodeName ][ attrs.id ] = node;

					} else if ( typeof attrs.id === 'number' ) {

						currentNode[ nodeName ] = {};
						currentNode[ nodeName ][ attrs.id ] = node;

					} else if ( nodeName !== 'Properties70' ) {

						if ( nodeName === 'PoseNode' )	currentNode[ nodeName ] = [ node ];
						else currentNode[ nodeName ] = node;

					}

				}

				if ( typeof attrs.id === 'number' ) node.id = attrs.id;
				if ( attrs.name !== '' ) node.attrName = attrs.name;
				if ( attrs.type !== '' ) node.attrType = attrs.type;

				this.pushStack( node );

			},

			parseNodeAttr: function ( attrs ) {

				var id = attrs[ 0 ];

				if ( attrs[ 0 ] !== '' ) {

					id = parseInt( attrs[ 0 ] );

					if ( isNaN( id ) ) {

						id = attrs[ 0 ];

					}

				}

				var name = '', type = '';

				if ( attrs.length > 1 ) {

					name = attrs[ 1 ].replace( /^(\w+)::/, '' );
					type = attrs[ 2 ];

				}

				return { id: id, name: name, type: type };

			},

			parseNodeProperty: function ( line, property, contentLine ) {

				var propName = property[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
				var propValue = property[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

				// for special case: base64 image data follows "Content: ," line
				//	Content: ,
				//	 "/9j/4RDaRXhpZgAATU0A..."
				if ( propName === 'Content' && propValue === ',' ) {

					propValue = contentLine.replace( /"/g, '' ).replace( /,$/, '' ).trim();

				}

				var currentNode = this.getCurrentNode();
				var parentName = currentNode.name;

				if ( parentName === 'Properties70' ) {

					this.parseNodeSpecialProperty( line, propName, propValue );
					return;

				}

				// Connections
				if ( propName === 'C' ) {

					var connProps = propValue.split( ',' ).slice( 1 );
					var from = parseInt( connProps[ 0 ] );
					var to = parseInt( connProps[ 1 ] );

					var rest = propValue.split( ',' ).slice( 3 );

					rest = rest.map( function ( elem ) {

						return elem.trim().replace( /^"/, '' );

					} );

					propName = 'connections';
					propValue = [ from, to ];
					append( propValue, rest );

					if ( currentNode[ propName ] === undefined ) {

						currentNode[ propName ] = [];

					}

				}

				// Node
				if ( propName === 'Node' ) currentNode.id = propValue;

				// connections
				if ( propName in currentNode && Array.isArray( currentNode[ propName ] ) ) {

					currentNode[ propName ].push( propValue );

				} else {

					if ( propName !== 'a' ) currentNode[ propName ] = propValue;
					else currentNode.a = propValue;

				}

				this.setCurrentProp( currentNode, propName );

				// convert string to array, unless it ends in ',' in which case more will be added to it
				if ( propName === 'a' && propValue.slice( - 1 ) !== ',' ) {

					currentNode.a = parseNumberArray( propValue );

				}

			},

			parseNodePropertyContinued: function ( line ) {

				var currentNode = this.getCurrentNode();

				currentNode.a += line;

				// if the line doesn't end in ',' we have reached the end of the property value
				// so convert the string to an array
				if ( line.slice( - 1 ) !== ',' ) {

					currentNode.a = parseNumberArray( currentNode.a );

				}

			},

			// parse "Property70"
			parseNodeSpecialProperty: function ( line, propName, propValue ) {

				// split this
				// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
				// into array like below
				// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
				var props = propValue.split( '",' ).map( function ( prop ) {

					return prop.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

				} );

				var innerPropName = props[ 0 ];
				var innerPropType1 = props[ 1 ];
				var innerPropType2 = props[ 2 ];
				var innerPropFlag = props[ 3 ];
				var innerPropValue = props[ 4 ];

				// cast values where needed, otherwise leave as strings
				switch ( innerPropType1 ) {

					case 'int':
					case 'enum':
					case 'bool':
					case 'ULongLong':
					case 'double':
					case 'Number':
					case 'FieldOfView':
						innerPropValue = parseFloat( innerPropValue );
						break;

					case 'Color':
					case 'ColorRGB':
					case 'Vector3D':
					case 'Lcl_Translation':
					case 'Lcl_Rotation':
					case 'Lcl_Scaling':
						innerPropValue = parseNumberArray( innerPropValue );
						break;

				}

				// CAUTION: these props must append to parent's parent
				this.getPrevNode()[ innerPropName ] = {

					'type': innerPropType1,
					'type2': innerPropType2,
					'flag': innerPropFlag,
					'value': innerPropValue

				};

				this.setCurrentProp( this.getPrevNode(), innerPropName );

			},

		};

		// Parse an FBX file in Binary format
		function BinaryParser() {}

		BinaryParser.prototype = {

			constructor: BinaryParser,

			parse: function ( buffer ) {

				var reader = new BinaryReader( buffer );
				reader.skip( 23 ); // skip magic 23 bytes

				var version = reader.getUint32();

				console.log( 'THREE.FBXLoader: FBX binary version: ' + version );

				var allNodes = new FBXTree();

				while ( ! this.endOfContent( reader ) ) {

					var node = this.parseNode( reader, version );
					if ( node !== null ) allNodes.add( node.name, node );

				}

				return allNodes;

			},

			// Check if reader has reached the end of content.
			endOfContent: function ( reader ) {

				// footer size: 160bytes + 16-byte alignment padding
				// - 16bytes: magic
				// - padding til 16-byte alignment (at least 1byte?)
				//	(seems like some exporters embed fixed 15 or 16bytes?)
				// - 4bytes: magic
				// - 4bytes: version
				// - 120bytes: zero
				// - 16bytes: magic
				if ( reader.size() % 16 === 0 ) {

					return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

				} else {

					return reader.getOffset() + 160 + 16 >= reader.size();

				}

			},

			// recursively parse nodes until the end of the file is reached
			parseNode: function ( reader, version ) {

				var node = {};

				// The first three data sizes depends on version.
				var endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
				var numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

				// note: do not remove this even if you get a linter warning as it moves the buffer forward
				var propertyListLen = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

				var nameLen = reader.getUint8();
				var name = reader.getString( nameLen );

				// Regards this node as NULL-record if endOffset is zero
				if ( endOffset === 0 ) return null;

				var propertyList = [];

				for ( var i = 0; i < numProperties; i ++ ) {

					propertyList.push( this.parseProperty( reader ) );

				}

				// Regards the first three elements in propertyList as id, attrName, and attrType
				var id = propertyList.length > 0 ? propertyList[ 0 ] : '';
				var attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
				var attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

				// check if this node represents just a single property
				// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
				node.singleProperty = ( numProperties === 1 && reader.getOffset() === endOffset ) ? true : false;

				while ( endOffset > reader.getOffset() ) {

					var subNode = this.parseNode( reader, version );

					if ( subNode !== null ) this.parseSubNode( name, node, subNode );

				}

				node.propertyList = propertyList; // raw property list used by parent

				if ( typeof id === 'number' ) node.id = id;
				if ( attrName !== '' ) node.attrName = attrName;
				if ( attrType !== '' ) node.attrType = attrType;
				if ( name !== '' ) node.name = name;

				return node;

			},

			parseSubNode: function ( name, node, subNode ) {

				// special case: child node is single property
				if ( subNode.singleProperty === true ) {

					var value = subNode.propertyList[ 0 ];

					if ( Array.isArray( value ) ) {

						node[ subNode.name ] = subNode;

						subNode.a = value;

					} else {

						node[ subNode.name ] = value;

					}

				} else if ( name === 'Connections' && subNode.name === 'C' ) {

					var array = [];

					subNode.propertyList.forEach( function ( property, i ) {

						// first Connection is FBX type (OO, OP, etc.). We'll discard these
						if ( i !== 0 ) array.push( property );

					} );

					if ( node.connections === undefined ) {

						node.connections = [];

					}

					node.connections.push( array );

				} else if ( subNode.name === 'Properties70' ) {

					var keys = Object.keys( subNode );

					keys.forEach( function ( key ) {

						node[ key ] = subNode[ key ];

					} );

				} else if ( name === 'Properties70' && subNode.name === 'P' ) {

					var innerPropName = subNode.propertyList[ 0 ];
					var innerPropType1 = subNode.propertyList[ 1 ];
					var innerPropType2 = subNode.propertyList[ 2 ];
					var innerPropFlag = subNode.propertyList[ 3 ];
					var innerPropValue;

					if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
					if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

					if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

						innerPropValue = [
							subNode.propertyList[ 4 ],
							subNode.propertyList[ 5 ],
							subNode.propertyList[ 6 ]
						];

					} else {

						innerPropValue = subNode.propertyList[ 4 ];

					}

					// this will be copied to parent, see above
					node[ innerPropName ] = {

						'type': innerPropType1,
						'type2': innerPropType2,
						'flag': innerPropFlag,
						'value': innerPropValue

					};

				} else if ( node[ subNode.name ] === undefined ) {

					if ( typeof subNode.id === 'number' ) {

						node[ subNode.name ] = {};
						node[ subNode.name ][ subNode.id ] = subNode;

					} else {

						node[ subNode.name ] = subNode;

					}

				} else {

					if ( subNode.name === 'PoseNode' ) {

						if ( ! Array.isArray( node[ subNode.name ] ) ) {

							node[ subNode.name ] = [ node[ subNode.name ] ];

						}

						node[ subNode.name ].push( subNode );

					} else if ( node[ subNode.name ][ subNode.id ] === undefined ) {

						node[ subNode.name ][ subNode.id ] = subNode;

					}

				}

			},

			parseProperty: function ( reader ) {

				var type = reader.getString( 1 );

				switch ( type ) {

					case 'C':
						return reader.getBoolean();

					case 'D':
						return reader.getFloat64();

					case 'F':
						return reader.getFloat32();

					case 'I':
						return reader.getInt32();

					case 'L':
						return reader.getInt64();

					case 'R':
						var length = reader.getUint32();
						return reader.getArrayBuffer( length );

					case 'S':
						var length = reader.getUint32();
						return reader.getString( length );

					case 'Y':
						return reader.getInt16();

					case 'b':
					case 'c':
					case 'd':
					case 'f':
					case 'i':
					case 'l':

						var arrayLength = reader.getUint32();
						var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
						var compressedLength = reader.getUint32();

						if ( encoding === 0 ) {

							switch ( type ) {

								case 'b':
								case 'c':
									return reader.getBooleanArray( arrayLength );

								case 'd':
									return reader.getFloat64Array( arrayLength );

								case 'f':
									return reader.getFloat32Array( arrayLength );

								case 'i':
									return reader.getInt32Array( arrayLength );

								case 'l':
									return reader.getInt64Array( arrayLength );

							}

						}

						if ( typeof Zlib === 'undefined' ) {

							console.error( 'THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );

						}

						var inflate = new Zlib.Inflate( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
						var reader2 = new BinaryReader( inflate.decompress().buffer );

						switch ( type ) {

							case 'b':
							case 'c':
								return reader2.getBooleanArray( arrayLength );

							case 'd':
								return reader2.getFloat64Array( arrayLength );

							case 'f':
								return reader2.getFloat32Array( arrayLength );

							case 'i':
								return reader2.getInt32Array( arrayLength );

							case 'l':
								return reader2.getInt64Array( arrayLength );

						}

					default:
						throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );

				}

			}

		};

		function BinaryReader( buffer, littleEndian ) {

			this.dv = new DataView( buffer );
			this.offset = 0;
			this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

		}

		BinaryReader.prototype = {

			constructor: BinaryReader,

			getOffset: function () {

				return this.offset;

			},

			size: function () {

				return this.dv.buffer.byteLength;

			},

			skip: function ( length ) {

				this.offset += length;

			},

			// seems like true/false representation depends on exporter.
			// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
			// then sees LSB.
			getBoolean: function () {

				return ( this.getUint8() & 1 ) === 1;

			},

			getBooleanArray: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getBoolean() );

				}

				return a;

			},

			getUint8: function () {

				var value = this.dv.getUint8( this.offset );
				this.offset += 1;
				return value;

			},

			getInt16: function () {

				var value = this.dv.getInt16( this.offset, this.littleEndian );
				this.offset += 2;
				return value;

			},

			getInt32: function () {

				var value = this.dv.getInt32( this.offset, this.littleEndian );
				this.offset += 4;
				return value;

			},

			getInt32Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getInt32() );

				}

				return a;

			},

			getUint32: function () {

				var value = this.dv.getUint32( this.offset, this.littleEndian );
				this.offset += 4;
				return value;

			},

			// JavaScript doesn't support 64-bit integer so calculate this here
			// 1 << 32 will return 1 so using multiply operation instead here.
			// There's a possibility that this method returns wrong value if the value
			// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
			// TODO: safely handle 64-bit integer
			getInt64: function () {

				var low, high;

				if ( this.littleEndian ) {

					low = this.getUint32();
					high = this.getUint32();

				} else {

					high = this.getUint32();
					low = this.getUint32();

				}

				// calculate negative value
				if ( high & 0x80000000 ) {

					high = ~ high & 0xFFFFFFFF;
					low = ~ low & 0xFFFFFFFF;

					if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

					low = ( low + 1 ) & 0xFFFFFFFF;

					return - ( high * 0x100000000 + low );

				}

				return high * 0x100000000 + low;

			},

			getInt64Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getInt64() );

				}

				return a;

			},

			// Note: see getInt64() comment
			getUint64: function () {

				var low, high;

				if ( this.littleEndian ) {

					low = this.getUint32();
					high = this.getUint32();

				} else {

					high = this.getUint32();
					low = this.getUint32();

				}

				return high * 0x100000000 + low;

			},

			getFloat32: function () {

				var value = this.dv.getFloat32( this.offset, this.littleEndian );
				this.offset += 4;
				return value;

			},

			getFloat32Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getFloat32() );

				}

				return a;

			},

			getFloat64: function () {

				var value = this.dv.getFloat64( this.offset, this.littleEndian );
				this.offset += 8;
				return value;

			},

			getFloat64Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getFloat64() );

				}

				return a;

			},

			getArrayBuffer: function ( size ) {

				var value = this.dv.buffer.slice( this.offset, this.offset + size );
				this.offset += size;
				return value;

			},

			getString: function ( size ) {

				// note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a[ i ] = this.getUint8();

				}

				var nullByte = a.indexOf( 0 );
				if ( nullByte >= 0 ) a = a.slice( 0, nullByte );

				return THREE.LoaderUtils.decodeText( new Uint8Array( a ) );

			}

		};

		// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
		// and BinaryParser( FBX Binary format)
		function FBXTree() {}

		FBXTree.prototype = {

			constructor: FBXTree,

			add: function ( key, val ) {

				this[ key ] = val;

			},

		};

		// ************** UTILITY FUNCTIONS **************

		function isFbxFormatBinary( buffer ) {

			var CORRECT = 'Kaydara FBX Binary  \0';

			return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString( buffer, 0, CORRECT.length );

		}

		function isFbxFormatASCII( text ) {

			var CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

			var cursor = 0;

			function read( offset ) {

				var result = text[ offset - 1 ];
				text = text.slice( cursor + offset );
				cursor ++;
				return result;

			}

			for ( var i = 0; i < CORRECT.length; ++ i ) {

				var num = read( 1 );
				if ( num === CORRECT[ i ] ) {

					return false;

				}

			}

			return true;

		}

		function getFbxVersion( text ) {

			var versionRegExp = /FBXVersion: (\d+)/;
			var match = text.match( versionRegExp );
			if ( match ) {

				var version = parseInt( match[ 1 ] );
				return version;

			}
			throw new Error( 'THREE.FBXLoader: Cannot find the version number for the file given.' );

		}

		// Converts FBX ticks into real time seconds.
		function convertFBXTimeToSeconds( time ) {

			return time / 46186158000;

		}

		var dataArray = [];

		// extracts the data from the correct position in the FBX array based on indexing type
		function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

			var index;

			switch ( infoObject.mappingType ) {

				case 'ByPolygonVertex' :
					index = polygonVertexIndex;
					break;
				case 'ByPolygon' :
					index = polygonIndex;
					break;
				case 'ByVertice' :
					index = vertexIndex;
					break;
				case 'AllSame' :
					index = infoObject.indices[ 0 ];
					break;
				default :
					console.warn( 'THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType );

			}

			if ( infoObject.referenceType === 'IndexToDirect' ) index = infoObject.indices[ index ];

			var from = index * infoObject.dataSize;
			var to = from + infoObject.dataSize;

			return slice( dataArray, infoObject.buffer, from, to );

		}

		var tempEuler = new THREE.Euler();
		var tempVec = new THREE.Vector3();

		// generate transformation from FBX transform data
		// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
		// ref: http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/_transformations_2main_8cxx-example.html,topicNumber=cpp_ref__transformations_2main_8cxx_example_htmlfc10a1e1-b18d-4e72-9dc0-70d0f1959f5e
		function generateTransform( transformData ) {

			var lTranslationM = new THREE.Matrix4();
			var lPreRotationM = new THREE.Matrix4();
			var lRotationM = new THREE.Matrix4();
			var lPostRotationM = new THREE.Matrix4();

			var lScalingM = new THREE.Matrix4();
			var lScalingPivotM = new THREE.Matrix4();
			var lScalingOffsetM = new THREE.Matrix4();
			var lRotationOffsetM = new THREE.Matrix4();
			var lRotationPivotM = new THREE.Matrix4();

			var lParentGX = new THREE.Matrix4();
			var lGlobalT = new THREE.Matrix4();

			var inheritType = ( transformData.inheritType ) ? transformData.inheritType : 0;

			if ( transformData.translation ) lTranslationM.setPosition( tempVec.fromArray( transformData.translation ) );

			if ( transformData.preRotation ) {

				var array = transformData.preRotation.map( THREE.MathUtils.degToRad );
				array.push( transformData.eulerOrder );
				lPreRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

			}

			if ( transformData.rotation ) {

				var array = transformData.rotation.map( THREE.MathUtils.degToRad );
				array.push( transformData.eulerOrder );
				lRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

			}

			if ( transformData.postRotation ) {

				var array = transformData.postRotation.map( THREE.MathUtils.degToRad );
				array.push( transformData.eulerOrder );
				lPostRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

			}

			if ( transformData.scale ) lScalingM.scale( tempVec.fromArray( transformData.scale ) );

			// Pivots and offsets
			if ( transformData.scalingOffset ) lScalingOffsetM.setPosition( tempVec.fromArray( transformData.scalingOffset ) );
			if ( transformData.scalingPivot ) lScalingPivotM.setPosition( tempVec.fromArray( transformData.scalingPivot ) );
			if ( transformData.rotationOffset ) lRotationOffsetM.setPosition( tempVec.fromArray( transformData.rotationOffset ) );
			if ( transformData.rotationPivot ) lRotationPivotM.setPosition( tempVec.fromArray( transformData.rotationPivot ) );

			// parent transform
			if ( transformData.parentMatrixWorld ) lParentGX = transformData.parentMatrixWorld;

			// Global Rotation
			var lLRM = lPreRotationM.multiply( lRotationM ).multiply( lPostRotationM );
			var lParentGRM = new THREE.Matrix4();
			lParentGX.extractRotation( lParentGRM );

			// Global Shear*Scaling
			var lParentTM = new THREE.Matrix4();
			var lLSM;
			var lParentGSM;
			var lParentGRSM;

			lParentTM.copyPosition( lParentGX );
			lParentGRSM = lParentTM.getInverse( lParentTM ).multiply( lParentGX );
			lParentGSM = lParentGRM.getInverse( lParentGRM ).multiply( lParentGRSM );
			lLSM = lScalingM;

			var lGlobalRS;
			if ( inheritType === 0 ) {

				lGlobalRS = lParentGRM.multiply( lLRM ).multiply( lParentGSM ).multiply( lLSM );

			} else if ( inheritType === 1 ) {

				lGlobalRS = lParentGRM.multiply( lParentGSM ).multiply( lLRM ).multiply( lLSM );

			} else {

				var lParentLSM = new THREE.Matrix4().copy( lScalingM );

				var lParentGSM_noLocal = lParentGSM.multiply( lParentLSM.getInverse( lParentLSM ) );

				lGlobalRS = lParentGRM.multiply( lLRM ).multiply( lParentGSM_noLocal ).multiply( lLSM );

			}

			// Calculate the local transform matrix
			var lTransform = lTranslationM.multiply( lRotationOffsetM ).multiply( lRotationPivotM ).multiply( lPreRotationM ).multiply( lRotationM ).multiply( lPostRotationM ).multiply( lRotationPivotM.getInverse( lRotationPivotM ) ).multiply( lScalingOffsetM ).multiply( lScalingPivotM ).multiply( lScalingM ).multiply( lScalingPivotM.getInverse( lScalingPivotM ) );

			var lLocalTWithAllPivotAndOffsetInfo = new THREE.Matrix4().copyPosition( lTransform );

			var lGlobalTranslation = lParentGX.multiply( lLocalTWithAllPivotAndOffsetInfo );
			lGlobalT.copyPosition( lGlobalTranslation );

			lTransform = lGlobalT.multiply( lGlobalRS );

			return lTransform;

		}

		// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
		// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
		function getEulerOrder( order ) {

			order = order || 0;

			var enums = [
				'ZYX', // -> XYZ extrinsic
				'YZX', // -> XZY extrinsic
				'XZY', // -> YZX extrinsic
				'ZXY', // -> YXZ extrinsic
				'YXZ', // -> ZXY extrinsic
				'XYZ', // -> ZYX extrinsic
				//'SphericXYZ', // not possible to support
			];

			if ( order === 6 ) {

				console.warn( 'THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.' );
				return enums[ 0 ];

			}

			return enums[ order ];

		}

		// Parses comma separated list of numbers and returns them an array.
		// Used internally by the TextParser
		function parseNumberArray( value ) {

			var array = value.split( ',' ).map( function ( val ) {

				return parseFloat( val );

			} );

			return array;

		}

		function convertArrayBufferToString( buffer, from, to ) {

			if ( from === undefined ) from = 0;
			if ( to === undefined ) to = buffer.byteLength;

			return THREE.LoaderUtils.decodeText( new Uint8Array( buffer, from, to ) );

		}

		function append( a, b ) {

			for ( var i = 0, j = a.length, l = b.length; i < l; i ++, j ++ ) {

				a[ j ] = b[ i ];

			}

		}

		function slice( a, b, from, to ) {

			for ( var i = from, j = 0; i < to; i ++, j ++ ) {

				a[ j ] = b[ i ];

			}

			return a;

		}

		// inject array a2 into array a1 at index
		function inject( a1, index, a2 ) {

			return a1.slice( 0, index ).concat( a2 ).concat( a1.slice( index ) );

		}

		return FBXLoader;

	} )();
	
	return THREE.FBXLoader;
});

define('skylark-threejs-ex/loaders/GCodeLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * THREE.GCodeLoader is used to load gcode files usually used for 3D printing or CNC applications.
	 *
	 * Gcode files are composed by commands used by machines to create objects.
	 *
	 * @class THREE.GCodeLoader
	 * @param {Manager} manager Loading manager.
	 * @author tentone
	 * @author joewalnes
	 */

	THREE.GCodeLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		this.splitLayer = false;

	};

	THREE.GCodeLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.GCodeLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var self = this;

			var loader = new THREE.FileLoader( self.manager );
			loader.setPath( self.path );
			loader.load( url, function ( text ) {

				onLoad( self.parse( text ) );

			}, onProgress, onError );

		},

		parse: function ( data ) {

			var state = { x: 0, y: 0, z: 0, e: 0, f: 0, extruding: false, relative: false };
			var layers = [];

			var currentLayer = undefined;

			var pathMaterial = new THREE.LineBasicMaterial( { color: 0xFF0000 } );
			pathMaterial.name = 'path';

			var extrudingMaterial = new THREE.LineBasicMaterial( { color: 0x00FF00 } );
			extrudingMaterial.name = 'extruded';

			function newLayer( line ) {

				currentLayer = { vertex: [], pathVertex: [], z: line.z };
				layers.push( currentLayer );

			}

			//Create lie segment between p1 and p2
			function addSegment( p1, p2 ) {

				if ( currentLayer === undefined ) {

					newLayer( p1 );

				}

				if ( line.extruding ) {

					currentLayer.vertex.push( p1.x, p1.y, p1.z );
					currentLayer.vertex.push( p2.x, p2.y, p2.z );

				} else {

					currentLayer.pathVertex.push( p1.x, p1.y, p1.z );
					currentLayer.pathVertex.push( p2.x, p2.y, p2.z );

				}

			}

			function delta( v1, v2 ) {

				return state.relative ? v2 : v2 - v1;

			}

			function absolute( v1, v2 ) {

				return state.relative ? v1 + v2 : v2;

			}

			var lines = data.replace( /;.+/g, '' ).split( '\n' );

			for ( var i = 0; i < lines.length; i ++ ) {

				var tokens = lines[ i ].split( ' ' );
				var cmd = tokens[ 0 ].toUpperCase();

				//Argumments
				var args = {};
				tokens.splice( 1 ).forEach( function ( token ) {

					if ( token[ 0 ] !== undefined ) {

						var key = token[ 0 ].toLowerCase();
						var value = parseFloat( token.substring( 1 ) );
						args[ key ] = value;

					}

				} );

				//Process commands
				//G0/G1 – Linear Movement
				if ( cmd === 'G0' || cmd === 'G1' ) {

					var line = {
						x: args.x !== undefined ? absolute( state.x, args.x ) : state.x,
						y: args.y !== undefined ? absolute( state.y, args.y ) : state.y,
						z: args.z !== undefined ? absolute( state.z, args.z ) : state.z,
						e: args.e !== undefined ? absolute( state.e, args.e ) : state.e,
						f: args.f !== undefined ? absolute( state.f, args.f ) : state.f,
					};

					//Layer change detection is or made by watching Z, it's made by watching when we extrude at a new Z position
					if ( delta( state.e, line.e ) > 0 ) {

						line.extruding = delta( state.e, line.e ) > 0;

						if ( currentLayer == undefined || line.z != currentLayer.z ) {

							newLayer( line );

						}

					}

					addSegment( state, line );
					state = line;

				} else if ( cmd === 'G2' || cmd === 'G3' ) {

					//G2/G3 - Arc Movement ( G2 clock wise and G3 counter clock wise )
					//console.warn( 'THREE.GCodeLoader: Arc command not supported' );

				} else if ( cmd === 'G90' ) {

					//G90: Set to Absolute Positioning
					state.relative = false;

				} else if ( cmd === 'G91' ) {

					//G91: Set to state.relative Positioning
					state.relative = true;

				} else if ( cmd === 'G92' ) {

					//G92: Set Position
					var line = state;
					line.x = args.x !== undefined ? args.x : line.x;
					line.y = args.y !== undefined ? args.y : line.y;
					line.z = args.z !== undefined ? args.z : line.z;
					line.e = args.e !== undefined ? args.e : line.e;
					state = line;

				} else {

					//console.warn( 'THREE.GCodeLoader: Command not supported:' + cmd );

				}

			}

			function addObject( vertex, extruding ) {

				var geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertex, 3 ) );

				var segments = new THREE.LineSegments( geometry, extruding ? extrudingMaterial : pathMaterial );
				segments.name = 'layer' + i;
				object.add( segments );

			}

			var object = new THREE.Group();
			object.name = 'gcode';

			if ( this.splitLayer ) {

				for ( var i = 0; i < layers.length; i ++ ) {

					var layer = layers[ i ];
					addObject( layer.vertex, true );
					addObject( layer.pathVertex, false );

				}

			} else {

				var vertex = [], pathVertex = [];

				for ( var i = 0; i < layers.length; i ++ ) {

					var layer = layers[ i ];

					vertex = vertex.concat( layer.vertex );
					pathVertex = pathVertex.concat( layer.pathVertex );

				}

				addObject( vertex, true );
				addObject( pathVertex, false );

			}

			object.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) );

			return object;

		}

	} );
	
	return THREE.GCodeLoader;
});

define('skylark-threejs-ex/loaders/GLTFLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Rich Tibbett / https://github.com/richtr
	 * @author mrdoob / http://mrdoob.com/
	 * @author Tony Parisi / http://www.tonyparisi.com/
	 * @author Takahiro / https://github.com/takahirox
	 * @author Don McCurdy / https://www.donmccurdy.com
	 */

	THREE.GLTFLoader = ( function () {

		function GLTFLoader( manager ) {

			THREE.Loader.call( this, manager );

			this.dracoLoader = null;
			this.ddsLoader = null;

		}

		GLTFLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

			constructor: GLTFLoader,

			load: function ( url, onLoad, onProgress, onError ) {

				var scope = this;

				var resourcePath;

				if ( this.resourcePath !== '' ) {

					resourcePath = this.resourcePath;

				} else if ( this.path !== '' ) {

					resourcePath = this.path;

				} else {

					resourcePath = THREE.LoaderUtils.extractUrlBase( url );

				}

				// Tells the LoadingManager to track an extra item, which resolves after
				// the model is fully loaded. This means the count of items loaded will
				// be incorrect, but ensures manager.onLoad() does not fire early.
				scope.manager.itemStart( url );

				var _onError = function ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						console.error( e );

					}

					scope.manager.itemError( url );
					scope.manager.itemEnd( url );

				};

				var loader = new THREE.FileLoader( scope.manager );

				loader.setPath( this.path );
				loader.setResponseType( 'arraybuffer' );

				if ( scope.crossOrigin === 'use-credentials' ) {

					loader.setWithCredentials( true );

				}

				loader.load( url, function ( data ) {

					try {

						scope.parse( data, resourcePath, function ( gltf ) {

							onLoad( gltf );

							scope.manager.itemEnd( url );

						}, _onError );

					} catch ( e ) {

						_onError( e );

					}

				}, onProgress, _onError );

			},

			setDRACOLoader: function ( dracoLoader ) {

				this.dracoLoader = dracoLoader;
				return this;

			},

			setDDSLoader: function ( ddsLoader ) {

				this.ddsLoader = ddsLoader;
				return this;

			},

			parse: function ( data, path, onLoad, onError ) {

				var content;
				var extensions = {};

				if ( typeof data === 'string' ) {

					content = data;

				} else {

					var magic = THREE.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

					if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

						try {

							extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );

						} catch ( error ) {

							if ( onError ) onError( error );
							return;

						}

						content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

					} else {

						content = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );

					}

				}

				var json = JSON.parse( content );

				if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

					if ( onError ) onError( new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.' ) );
					return;

				}

				if ( json.extensionsUsed ) {

					for ( var i = 0; i < json.extensionsUsed.length; ++ i ) {

						var extensionName = json.extensionsUsed[ i ];
						var extensionsRequired = json.extensionsRequired || [];

						switch ( extensionName ) {

							case EXTENSIONS.KHR_LIGHTS_PUNCTUAL:
								extensions[ extensionName ] = new GLTFLightsExtension( json );
								break;

							case EXTENSIONS.KHR_MATERIALS_CLEARCOAT:
								extensions[ extensionName ] = new GLTFMaterialsClearcoatExtension();
								break;

							case EXTENSIONS.KHR_MATERIALS_UNLIT:
								extensions[ extensionName ] = new GLTFMaterialsUnlitExtension();
								break;

							case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
								extensions[ extensionName ] = new GLTFMaterialsPbrSpecularGlossinessExtension();
								break;

							case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
								extensions[ extensionName ] = new GLTFDracoMeshCompressionExtension( json, this.dracoLoader );
								break;

							case EXTENSIONS.MSFT_TEXTURE_DDS:
								extensions[ extensionName ] = new GLTFTextureDDSExtension( this.ddsLoader );
								break;

							case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
								extensions[ extensionName ] = new GLTFTextureTransformExtension();
								break;

							case EXTENSIONS.KHR_MESH_QUANTIZATION:
								extensions[ extensionName ] = new GLTFMeshQuantizationExtension();
								break;

							default:

								if ( extensionsRequired.indexOf( extensionName ) >= 0 ) {

									console.warn( 'THREE.GLTFLoader: Unknown extension "' + extensionName + '".' );

								}

						}

					}

				}

				var parser = new GLTFParser( json, extensions, {

					path: path || this.resourcePath || '',
					crossOrigin: this.crossOrigin,
					manager: this.manager

				} );

				parser.parse( onLoad, onError );

			}

		} );

		/* GLTFREGISTRY */

		function GLTFRegistry() {

			var objects = {};

			return	{

				get: function ( key ) {

					return objects[ key ];

				},

				add: function ( key, object ) {

					objects[ key ] = object;

				},

				remove: function ( key ) {

					delete objects[ key ];

				},

				removeAll: function () {

					objects = {};

				}

			};

		}

		/*********************************/
		/********** EXTENSIONS ***********/
		/*********************************/

		var EXTENSIONS = {
			KHR_BINARY_GLTF: 'KHR_binary_glTF',
			KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
			KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
			KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
			KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
			KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
			KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
			KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
			MSFT_TEXTURE_DDS: 'MSFT_texture_dds'
		};

		/**
		 * DDS Texture Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/MSFT_texture_dds
		 *
		 */
		function GLTFTextureDDSExtension( ddsLoader ) {

			if ( ! ddsLoader ) {

				throw new Error( 'THREE.GLTFLoader: Attempting to load .dds texture without importing THREE.DDSLoader' );

			}

			this.name = EXTENSIONS.MSFT_TEXTURE_DDS;
			this.ddsLoader = ddsLoader;

		}

		/**
		 * Punctual Lights Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
		 */
		function GLTFLightsExtension( json ) {

			this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

			var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ] ) || {};
			this.lightDefs = extension.lights || [];

		}

		GLTFLightsExtension.prototype.loadLight = function ( lightIndex ) {

			var lightDef = this.lightDefs[ lightIndex ];
			var lightNode;

			var color = new THREE.Color( 0xffffff );
			if ( lightDef.color !== undefined ) color.fromArray( lightDef.color );

			var range = lightDef.range !== undefined ? lightDef.range : 0;

			switch ( lightDef.type ) {

				case 'directional':
					lightNode = new THREE.DirectionalLight( color );
					lightNode.target.position.set( 0, 0, - 1 );
					lightNode.add( lightNode.target );
					break;

				case 'point':
					lightNode = new THREE.PointLight( color );
					lightNode.distance = range;
					break;

				case 'spot':
					lightNode = new THREE.SpotLight( color );
					lightNode.distance = range;
					// Handle spotlight properties.
					lightDef.spot = lightDef.spot || {};
					lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
					lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
					lightNode.angle = lightDef.spot.outerConeAngle;
					lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
					lightNode.target.position.set( 0, 0, - 1 );
					lightNode.add( lightNode.target );
					break;

				default:
					throw new Error( 'THREE.GLTFLoader: Unexpected light type, "' + lightDef.type + '".' );

			}

			// Some lights (e.g. spot) default to a position other than the origin. Reset the position
			// here, because node-level parsing will only override position if explicitly specified.
			lightNode.position.set( 0, 0, 0 );

			lightNode.decay = 2;

			if ( lightDef.intensity !== undefined ) lightNode.intensity = lightDef.intensity;

			lightNode.name = lightDef.name || ( 'light_' + lightIndex );

			return Promise.resolve( lightNode );

		};

		/**
		 * Unlit Materials Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
		 */
		function GLTFMaterialsUnlitExtension() {

			this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;

		}

		GLTFMaterialsUnlitExtension.prototype.getMaterialType = function () {

			return THREE.MeshBasicMaterial;

		};

		GLTFMaterialsUnlitExtension.prototype.extendParams = function ( materialParams, materialDef, parser ) {

			var pending = [];

			materialParams.color = new THREE.Color( 1.0, 1.0, 1.0 );
			materialParams.opacity = 1.0;

			var metallicRoughness = materialDef.pbrMetallicRoughness;

			if ( metallicRoughness ) {

				if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

					var array = metallicRoughness.baseColorFactor;

					materialParams.color.fromArray( array );
					materialParams.opacity = array[ 3 ];

				}

				if ( metallicRoughness.baseColorTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

				}

			}

			return Promise.all( pending );

		};

		/**
		 * Clearcoat Materials Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
		 */
		function GLTFMaterialsClearcoatExtension() {

			this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;

		}

		GLTFMaterialsClearcoatExtension.prototype.getMaterialType = function () {

			return THREE.MeshPhysicalMaterial;

		};

		GLTFMaterialsClearcoatExtension.prototype.extendParams = function ( materialParams, materialDef, parser ) {

			var pending = [];

			var extension = materialDef.extensions[ this.name ];

			if ( extension.clearcoatFactor !== undefined ) {

				materialParams.clearcoat = extension.clearcoatFactor;

			}

			if ( extension.clearcoatTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'clearcoatMap', extension.clearcoatTexture ) );

			}

			if ( extension.clearcoatRoughnessFactor !== undefined ) {

				materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;

			}

			if ( extension.clearcoatRoughnessTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture ) );

			}

			if ( extension.clearcoatNormalTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture ) );

				if ( extension.clearcoatNormalTexture.scale !== undefined ) {

					var scale = extension.clearcoatNormalTexture.scale;

					materialParams.clearcoatNormalScale = new THREE.Vector2( scale, scale );

				}

			}

			return Promise.all( pending );

		};

		/* BINARY EXTENSION */
		var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
		var BINARY_EXTENSION_HEADER_LENGTH = 12;
		var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

		function GLTFBinaryExtension( data ) {

			this.name = EXTENSIONS.KHR_BINARY_GLTF;
			this.content = null;
			this.body = null;

			var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

			this.header = {
				magic: THREE.LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
				version: headerView.getUint32( 4, true ),
				length: headerView.getUint32( 8, true )
			};

			if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

				throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );

			} else if ( this.header.version < 2.0 ) {

				throw new Error( 'THREE.GLTFLoader: Legacy binary file detected.' );

			}

			var chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
			var chunkIndex = 0;

			while ( chunkIndex < chunkView.byteLength ) {

				var chunkLength = chunkView.getUint32( chunkIndex, true );
				chunkIndex += 4;

				var chunkType = chunkView.getUint32( chunkIndex, true );
				chunkIndex += 4;

				if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

					var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
					this.content = THREE.LoaderUtils.decodeText( contentArray );

				} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

					var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
					this.body = data.slice( byteOffset, byteOffset + chunkLength );

				}

				// Clients must ignore chunks with unknown types.

				chunkIndex += chunkLength;

			}

			if ( this.content === null ) {

				throw new Error( 'THREE.GLTFLoader: JSON content not found.' );

			}

		}

		/**
		 * DRACO Mesh Compression Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
		 */
		function GLTFDracoMeshCompressionExtension( json, dracoLoader ) {

			if ( ! dracoLoader ) {

				throw new Error( 'THREE.GLTFLoader: No DRACOLoader instance provided.' );

			}

			this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
			this.json = json;
			this.dracoLoader = dracoLoader;
			this.dracoLoader.preload();

		}

		GLTFDracoMeshCompressionExtension.prototype.decodePrimitive = function ( primitive, parser ) {

			var json = this.json;
			var dracoLoader = this.dracoLoader;
			var bufferViewIndex = primitive.extensions[ this.name ].bufferView;
			var gltfAttributeMap = primitive.extensions[ this.name ].attributes;
			var threeAttributeMap = {};
			var attributeNormalizedMap = {};
			var attributeTypeMap = {};

			for ( var attributeName in gltfAttributeMap ) {

				var threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

				threeAttributeMap[ threeAttributeName ] = gltfAttributeMap[ attributeName ];

			}

			for ( attributeName in primitive.attributes ) {

				var threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

				if ( gltfAttributeMap[ attributeName ] !== undefined ) {

					var accessorDef = json.accessors[ primitive.attributes[ attributeName ] ];
					var componentType = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

					attributeTypeMap[ threeAttributeName ] = componentType;
					attributeNormalizedMap[ threeAttributeName ] = accessorDef.normalized === true;

				}

			}

			return parser.getDependency( 'bufferView', bufferViewIndex ).then( function ( bufferView ) {

				return new Promise( function ( resolve ) {

					dracoLoader.decodeDracoFile( bufferView, function ( geometry ) {

						for ( var attributeName in geometry.attributes ) {

							var attribute = geometry.attributes[ attributeName ];
							var normalized = attributeNormalizedMap[ attributeName ];

							if ( normalized !== undefined ) attribute.normalized = normalized;

						}

						resolve( geometry );

					}, threeAttributeMap, attributeTypeMap );

				} );

			} );

		};

		/**
		 * Texture Transform Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
		 */
		function GLTFTextureTransformExtension() {

			this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;

		}

		GLTFTextureTransformExtension.prototype.extendTexture = function ( texture, transform ) {

			texture = texture.clone();

			if ( transform.offset !== undefined ) {

				texture.offset.fromArray( transform.offset );

			}

			if ( transform.rotation !== undefined ) {

				texture.rotation = transform.rotation;

			}

			if ( transform.scale !== undefined ) {

				texture.repeat.fromArray( transform.scale );

			}

			if ( transform.texCoord !== undefined ) {

				console.warn( 'THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.' );

			}

			texture.needsUpdate = true;

			return texture;

		};

		/**
		 * Specular-Glossiness Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
		 */

		/**
		 * A sub class of THREE.StandardMaterial with some of the functionality
		 * changed via the `onBeforeCompile` callback
		 * @pailhead
		 */

		function GLTFMeshStandardSGMaterial( params ) {

			THREE.MeshStandardMaterial.call( this );

			this.isGLTFSpecularGlossinessMaterial = true;

			//various chunks that need replacing
			var specularMapParsFragmentChunk = [
				'#ifdef USE_SPECULARMAP',
				'	uniform sampler2D specularMap;',
				'#endif'
			].join( '\n' );

			var glossinessMapParsFragmentChunk = [
				'#ifdef USE_GLOSSINESSMAP',
				'	uniform sampler2D glossinessMap;',
				'#endif'
			].join( '\n' );

			var specularMapFragmentChunk = [
				'vec3 specularFactor = specular;',
				'#ifdef USE_SPECULARMAP',
				'	vec4 texelSpecular = texture2D( specularMap, vUv );',
				'	texelSpecular = sRGBToLinear( texelSpecular );',
				'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
				'	specularFactor *= texelSpecular.rgb;',
				'#endif'
			].join( '\n' );

			var glossinessMapFragmentChunk = [
				'float glossinessFactor = glossiness;',
				'#ifdef USE_GLOSSINESSMAP',
				'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
				'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
				'	glossinessFactor *= texelGlossiness.a;',
				'#endif'
			].join( '\n' );

			var lightPhysicalFragmentChunk = [
				'PhysicalMaterial material;',
				'material.diffuseColor = diffuseColor.rgb;',
				'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
				'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
				'material.specularRoughness = max( 1.0 - glossinessFactor, 0.0525 );// 0.0525 corresponds to the base mip of a 256 cubemap.',
				'material.specularRoughness += geometryRoughness;',
				'material.specularRoughness = min( material.specularRoughness, 1.0 );',
				'material.specularColor = specularFactor.rgb;',
			].join( '\n' );

			var uniforms = {
				specular: { value: new THREE.Color().setHex( 0xffffff ) },
				glossiness: { value: 1 },
				specularMap: { value: null },
				glossinessMap: { value: null }
			};

			this._extraUniforms = uniforms;

			// please see #14031 or #13198 for an alternate approach
			this.onBeforeCompile = function ( shader ) {

				for ( var uniformName in uniforms ) {

					shader.uniforms[ uniformName ] = uniforms[ uniformName ];

				}

				shader.fragmentShader = shader.fragmentShader.replace( 'uniform float roughness;', 'uniform vec3 specular;' );
				shader.fragmentShader = shader.fragmentShader.replace( 'uniform float metalness;', 'uniform float glossiness;' );
				shader.fragmentShader = shader.fragmentShader.replace( '#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk );
				shader.fragmentShader = shader.fragmentShader.replace( '#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk );
				shader.fragmentShader = shader.fragmentShader.replace( '#include <roughnessmap_fragment>', specularMapFragmentChunk );
				shader.fragmentShader = shader.fragmentShader.replace( '#include <metalnessmap_fragment>', glossinessMapFragmentChunk );
				shader.fragmentShader = shader.fragmentShader.replace( '#include <lights_physical_fragment>', lightPhysicalFragmentChunk );

			};

			/*eslint-disable*/
			Object.defineProperties(
				this,
				{
					specular: {
						get: function () { return uniforms.specular.value; },
						set: function ( v ) { uniforms.specular.value = v; }
					},
					specularMap: {
						get: function () { return uniforms.specularMap.value; },
						set: function ( v ) { uniforms.specularMap.value = v; }
					},
					glossiness: {
						get: function () { return uniforms.glossiness.value; },
						set: function ( v ) { uniforms.glossiness.value = v; }
					},
					glossinessMap: {
						get: function () { return uniforms.glossinessMap.value; },
						set: function ( v ) {

							uniforms.glossinessMap.value = v;
							//how about something like this - @pailhead
							if ( v ) {

								this.defines.USE_GLOSSINESSMAP = '';
								// set USE_ROUGHNESSMAP to enable vUv
								this.defines.USE_ROUGHNESSMAP = '';

							} else {

								delete this.defines.USE_ROUGHNESSMAP;
								delete this.defines.USE_GLOSSINESSMAP;

							}

						}
					}
				}
			);

			/*eslint-enable*/
			delete this.metalness;
			delete this.roughness;
			delete this.metalnessMap;
			delete this.roughnessMap;

			this.setValues( params );

		}

		GLTFMeshStandardSGMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
		GLTFMeshStandardSGMaterial.prototype.constructor = GLTFMeshStandardSGMaterial;

		GLTFMeshStandardSGMaterial.prototype.copy = function ( source ) {

			THREE.MeshStandardMaterial.prototype.copy.call( this, source );
			this.specularMap = source.specularMap;
			this.specular.copy( source.specular );
			this.glossinessMap = source.glossinessMap;
			this.glossiness = source.glossiness;
			delete this.metalness;
			delete this.roughness;
			delete this.metalnessMap;
			delete this.roughnessMap;
			return this;

		};

		function GLTFMaterialsPbrSpecularGlossinessExtension() {

			return {

				name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,

				specularGlossinessParams: [
					'color',
					'map',
					'lightMap',
					'lightMapIntensity',
					'aoMap',
					'aoMapIntensity',
					'emissive',
					'emissiveIntensity',
					'emissiveMap',
					'bumpMap',
					'bumpScale',
					'normalMap',
					'normalMapType',
					'displacementMap',
					'displacementScale',
					'displacementBias',
					'specularMap',
					'specular',
					'glossinessMap',
					'glossiness',
					'alphaMap',
					'envMap',
					'envMapIntensity',
					'refractionRatio',
				],

				getMaterialType: function () {

					return GLTFMeshStandardSGMaterial;

				},

				extendParams: function ( materialParams, materialDef, parser ) {

					var pbrSpecularGlossiness = materialDef.extensions[ this.name ];

					materialParams.color = new THREE.Color( 1.0, 1.0, 1.0 );
					materialParams.opacity = 1.0;

					var pending = [];

					if ( Array.isArray( pbrSpecularGlossiness.diffuseFactor ) ) {

						var array = pbrSpecularGlossiness.diffuseFactor;

						materialParams.color.fromArray( array );
						materialParams.opacity = array[ 3 ];

					}

					if ( pbrSpecularGlossiness.diffuseTexture !== undefined ) {

						pending.push( parser.assignTexture( materialParams, 'map', pbrSpecularGlossiness.diffuseTexture ) );

					}

					materialParams.emissive = new THREE.Color( 0.0, 0.0, 0.0 );
					materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
					materialParams.specular = new THREE.Color( 1.0, 1.0, 1.0 );

					if ( Array.isArray( pbrSpecularGlossiness.specularFactor ) ) {

						materialParams.specular.fromArray( pbrSpecularGlossiness.specularFactor );

					}

					if ( pbrSpecularGlossiness.specularGlossinessTexture !== undefined ) {

						var specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
						pending.push( parser.assignTexture( materialParams, 'glossinessMap', specGlossMapDef ) );
						pending.push( parser.assignTexture( materialParams, 'specularMap', specGlossMapDef ) );

					}

					return Promise.all( pending );

				},

				createMaterial: function ( materialParams ) {

					var material = new GLTFMeshStandardSGMaterial( materialParams );
					material.fog = true;

					material.color = materialParams.color;

					material.map = materialParams.map === undefined ? null : materialParams.map;

					material.lightMap = null;
					material.lightMapIntensity = 1.0;

					material.aoMap = materialParams.aoMap === undefined ? null : materialParams.aoMap;
					material.aoMapIntensity = 1.0;

					material.emissive = materialParams.emissive;
					material.emissiveIntensity = 1.0;
					material.emissiveMap = materialParams.emissiveMap === undefined ? null : materialParams.emissiveMap;

					material.bumpMap = materialParams.bumpMap === undefined ? null : materialParams.bumpMap;
					material.bumpScale = 1;

					material.normalMap = materialParams.normalMap === undefined ? null : materialParams.normalMap;
					material.normalMapType = THREE.TangentSpaceNormalMap;

					if ( materialParams.normalScale ) material.normalScale = materialParams.normalScale;

					material.displacementMap = null;
					material.displacementScale = 1;
					material.displacementBias = 0;

					material.specularMap = materialParams.specularMap === undefined ? null : materialParams.specularMap;
					material.specular = materialParams.specular;

					material.glossinessMap = materialParams.glossinessMap === undefined ? null : materialParams.glossinessMap;
					material.glossiness = materialParams.glossiness;

					material.alphaMap = null;

					material.envMap = materialParams.envMap === undefined ? null : materialParams.envMap;
					material.envMapIntensity = 1.0;

					material.refractionRatio = 0.98;

					return material;

				},

			};

		}

		/**
		 * Mesh Quantization Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
		 */
		function GLTFMeshQuantizationExtension() {

			this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;

		}

		/*********************************/
		/********** INTERPOLATION ********/
		/*********************************/

		// Spline Interpolation
		// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
		function GLTFCubicSplineInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

			THREE.Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

		}

		GLTFCubicSplineInterpolant.prototype = Object.create( THREE.Interpolant.prototype );
		GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;

		GLTFCubicSplineInterpolant.prototype.copySampleValue_ = function ( index ) {

			// Copies a sample value to the result buffer. See description of glTF
			// CUBICSPLINE values layout in interpolate_() function below.

			var result = this.resultBuffer,
				values = this.sampleValues,
				valueSize = this.valueSize,
				offset = index * valueSize * 3 + valueSize;

			for ( var i = 0; i !== valueSize; i ++ ) {

				result[ i ] = values[ offset + i ];

			}

			return result;

		};

		GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

		GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

		GLTFCubicSplineInterpolant.prototype.interpolate_ = function ( i1, t0, t, t1 ) {

			var result = this.resultBuffer;
			var values = this.sampleValues;
			var stride = this.valueSize;

			var stride2 = stride * 2;
			var stride3 = stride * 3;

			var td = t1 - t0;

			var p = ( t - t0 ) / td;
			var pp = p * p;
			var ppp = pp * p;

			var offset1 = i1 * stride3;
			var offset0 = offset1 - stride3;

			var s2 = - 2 * ppp + 3 * pp;
			var s3 = ppp - pp;
			var s0 = 1 - s2;
			var s1 = s3 - pp + p;

			// Layout of keyframe output values for CUBICSPLINE animations:
			//   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
			for ( var i = 0; i !== stride; i ++ ) {

				var p0 = values[ offset0 + i + stride ]; // splineVertex_k
				var m0 = values[ offset0 + i + stride2 ] * td; // outTangent_k * (t_k+1 - t_k)
				var p1 = values[ offset1 + i + stride ]; // splineVertex_k+1
				var m1 = values[ offset1 + i ] * td; // inTangent_k+1 * (t_k+1 - t_k)

				result[ i ] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

			}

			return result;

		};

		/*********************************/
		/********** INTERNALS ************/
		/*********************************/

		/* CONSTANTS */

		var WEBGL_CONSTANTS = {
			FLOAT: 5126,
			//FLOAT_MAT2: 35674,
			FLOAT_MAT3: 35675,
			FLOAT_MAT4: 35676,
			FLOAT_VEC2: 35664,
			FLOAT_VEC3: 35665,
			FLOAT_VEC4: 35666,
			LINEAR: 9729,
			REPEAT: 10497,
			SAMPLER_2D: 35678,
			POINTS: 0,
			LINES: 1,
			LINE_LOOP: 2,
			LINE_STRIP: 3,
			TRIANGLES: 4,
			TRIANGLE_STRIP: 5,
			TRIANGLE_FAN: 6,
			UNSIGNED_BYTE: 5121,
			UNSIGNED_SHORT: 5123
		};

		var WEBGL_COMPONENT_TYPES = {
			5120: Int8Array,
			5121: Uint8Array,
			5122: Int16Array,
			5123: Uint16Array,
			5125: Uint32Array,
			5126: Float32Array
		};

		var WEBGL_FILTERS = {
			9728: THREE.NearestFilter,
			9729: THREE.LinearFilter,
			9984: THREE.NearestMipmapNearestFilter,
			9985: THREE.LinearMipmapNearestFilter,
			9986: THREE.NearestMipmapLinearFilter,
			9987: THREE.LinearMipmapLinearFilter
		};

		var WEBGL_WRAPPINGS = {
			33071: THREE.ClampToEdgeWrapping,
			33648: THREE.MirroredRepeatWrapping,
			10497: THREE.RepeatWrapping
		};

		var WEBGL_TYPE_SIZES = {
			'SCALAR': 1,
			'VEC2': 2,
			'VEC3': 3,
			'VEC4': 4,
			'MAT2': 4,
			'MAT3': 9,
			'MAT4': 16
		};

		var ATTRIBUTES = {
			POSITION: 'position',
			NORMAL: 'normal',
			TANGENT: 'tangent',
			TEXCOORD_0: 'uv',
			TEXCOORD_1: 'uv2',
			COLOR_0: 'color',
			WEIGHTS_0: 'skinWeight',
			JOINTS_0: 'skinIndex',
		};

		var PATH_PROPERTIES = {
			scale: 'scale',
			translation: 'position',
			rotation: 'quaternion',
			weights: 'morphTargetInfluences'
		};

		var INTERPOLATION = {
			CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
			                        // keyframe track will be initialized with a default interpolation type, then modified.
			LINEAR: THREE.InterpolateLinear,
			STEP: THREE.InterpolateDiscrete
		};

		var ALPHA_MODES = {
			OPAQUE: 'OPAQUE',
			MASK: 'MASK',
			BLEND: 'BLEND'
		};

		var MIME_TYPE_FORMATS = {
			'image/png': THREE.RGBAFormat,
			'image/jpeg': THREE.RGBFormat
		};

		/* UTILITY FUNCTIONS */

		function resolveURL( url, path ) {

			// Invalid URL
			if ( typeof url !== 'string' || url === '' ) return '';

			// Host Relative URL
			if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

				path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

			}

			// Absolute URL http://,https://,//
			if ( /^(https?:)?\/\//i.test( url ) ) return url;

			// Data URI
			if ( /^data:.*,.*$/i.test( url ) ) return url;

			// Blob URL
			if ( /^blob:.*$/i.test( url ) ) return url;

			// Relative URL
			return path + url;

		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
		 */
		function createDefaultMaterial( cache ) {

			if ( cache[ 'DefaultMaterial' ] === undefined ) {

				cache[ 'DefaultMaterial' ] = new THREE.MeshStandardMaterial( {
					color: 0xFFFFFF,
					emissive: 0x000000,
					metalness: 1,
					roughness: 1,
					transparent: false,
					depthTest: true,
					side: THREE.FrontSide
				} );

			}

			return cache[ 'DefaultMaterial' ];

		}

		function addUnknownExtensionsToUserData( knownExtensions, object, objectDef ) {

			// Add unknown glTF extensions to an object's userData.

			for ( var name in objectDef.extensions ) {

				if ( knownExtensions[ name ] === undefined ) {

					object.userData.gltfExtensions = object.userData.gltfExtensions || {};
					object.userData.gltfExtensions[ name ] = objectDef.extensions[ name ];

				}

			}

		}

		/**
		 * @param {THREE.Object3D|THREE.Material|THREE.BufferGeometry} object
		 * @param {GLTF.definition} gltfDef
		 */
		function assignExtrasToUserData( object, gltfDef ) {

			if ( gltfDef.extras !== undefined ) {

				if ( typeof gltfDef.extras === 'object' ) {

					Object.assign( object.userData, gltfDef.extras );

				} else {

					console.warn( 'THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras );

				}

			}

		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
		 *
		 * @param {THREE.BufferGeometry} geometry
		 * @param {Array<GLTF.Target>} targets
		 * @param {GLTFParser} parser
		 * @return {Promise<THREE.BufferGeometry>}
		 */
		function addMorphTargets( geometry, targets, parser ) {

			var hasMorphPosition = false;
			var hasMorphNormal = false;

			for ( var i = 0, il = targets.length; i < il; i ++ ) {

				var target = targets[ i ];

				if ( target.POSITION !== undefined ) hasMorphPosition = true;
				if ( target.NORMAL !== undefined ) hasMorphNormal = true;

				if ( hasMorphPosition && hasMorphNormal ) break;

			}

			if ( ! hasMorphPosition && ! hasMorphNormal ) return Promise.resolve( geometry );

			var pendingPositionAccessors = [];
			var pendingNormalAccessors = [];

			for ( var i = 0, il = targets.length; i < il; i ++ ) {

				var target = targets[ i ];

				if ( hasMorphPosition ) {

					var pendingAccessor = target.POSITION !== undefined
						? parser.getDependency( 'accessor', target.POSITION )
						: geometry.attributes.position;

					pendingPositionAccessors.push( pendingAccessor );

				}

				if ( hasMorphNormal ) {

					var pendingAccessor = target.NORMAL !== undefined
						? parser.getDependency( 'accessor', target.NORMAL )
						: geometry.attributes.normal;

					pendingNormalAccessors.push( pendingAccessor );

				}

			}

			return Promise.all( [
				Promise.all( pendingPositionAccessors ),
				Promise.all( pendingNormalAccessors )
			] ).then( function ( accessors ) {

				var morphPositions = accessors[ 0 ];
				var morphNormals = accessors[ 1 ];

				if ( hasMorphPosition ) geometry.morphAttributes.position = morphPositions;
				if ( hasMorphNormal ) geometry.morphAttributes.normal = morphNormals;
				geometry.morphTargetsRelative = true;

				return geometry;

			} );

		}

		/**
		 * @param {THREE.Mesh} mesh
		 * @param {GLTF.Mesh} meshDef
		 */
		function updateMorphTargets( mesh, meshDef ) {

			mesh.updateMorphTargets();

			if ( meshDef.weights !== undefined ) {

				for ( var i = 0, il = meshDef.weights.length; i < il; i ++ ) {

					mesh.morphTargetInfluences[ i ] = meshDef.weights[ i ];

				}

			}

			// .extras has user-defined data, so check that .extras.targetNames is an array.
			if ( meshDef.extras && Array.isArray( meshDef.extras.targetNames ) ) {

				var targetNames = meshDef.extras.targetNames;

				if ( mesh.morphTargetInfluences.length === targetNames.length ) {

					mesh.morphTargetDictionary = {};

					for ( var i = 0, il = targetNames.length; i < il; i ++ ) {

						mesh.morphTargetDictionary[ targetNames[ i ] ] = i;

					}

				} else {

					console.warn( 'THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.' );

				}

			}

		}

		function createPrimitiveKey( primitiveDef ) {

			var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ];
			var geometryKey;

			if ( dracoExtension ) {

				geometryKey = 'draco:' + dracoExtension.bufferView
					+ ':' + dracoExtension.indices
					+ ':' + createAttributesKey( dracoExtension.attributes );

			} else {

				geometryKey = primitiveDef.indices + ':' + createAttributesKey( primitiveDef.attributes ) + ':' + primitiveDef.mode;

			}

			return geometryKey;

		}

		function createAttributesKey( attributes ) {

			var attributesKey = '';

			var keys = Object.keys( attributes ).sort();

			for ( var i = 0, il = keys.length; i < il; i ++ ) {

				attributesKey += keys[ i ] + ':' + attributes[ keys[ i ] ] + ';';

			}

			return attributesKey;

		}

		/* GLTF PARSER */

		function GLTFParser( json, extensions, options ) {

			this.json = json || {};
			this.extensions = extensions || {};
			this.options = options || {};

			// loader object cache
			this.cache = new GLTFRegistry();

			// BufferGeometry caching
			this.primitiveCache = {};

			this.textureLoader = new THREE.TextureLoader( this.options.manager );
			this.textureLoader.setCrossOrigin( this.options.crossOrigin );

			this.fileLoader = new THREE.FileLoader( this.options.manager );
			this.fileLoader.setResponseType( 'arraybuffer' );

			if ( this.options.crossOrigin === 'use-credentials' ) {

				this.fileLoader.setWithCredentials( true );

			}

		}

		GLTFParser.prototype.parse = function ( onLoad, onError ) {

			var parser = this;
			var json = this.json;
			var extensions = this.extensions;

			// Clear the loader cache
			this.cache.removeAll();

			// Mark the special nodes/meshes in json for efficient parse
			this.markDefs();

			Promise.all( [

				this.getDependencies( 'scene' ),
				this.getDependencies( 'animation' ),
				this.getDependencies( 'camera' ),

			] ).then( function ( dependencies ) {

				var result = {
					scene: dependencies[ 0 ][ json.scene || 0 ],
					scenes: dependencies[ 0 ],
					animations: dependencies[ 1 ],
					cameras: dependencies[ 2 ],
					asset: json.asset,
					parser: parser,
					userData: {}
				};

				addUnknownExtensionsToUserData( extensions, result, json );

				assignExtrasToUserData( result, json );

				onLoad( result );

			} ).catch( onError );

		};

		/**
		 * Marks the special nodes/meshes in json for efficient parse.
		 */
		GLTFParser.prototype.markDefs = function () {

			var nodeDefs = this.json.nodes || [];
			var skinDefs = this.json.skins || [];
			var meshDefs = this.json.meshes || [];

			var meshReferences = {};
			var meshUses = {};

			// Nothing in the node definition indicates whether it is a Bone or an
			// Object3D. Use the skins' joint references to mark bones.
			for ( var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex ++ ) {

				var joints = skinDefs[ skinIndex ].joints;

				for ( var i = 0, il = joints.length; i < il; i ++ ) {

					nodeDefs[ joints[ i ] ].isBone = true;

				}

			}

			// Meshes can (and should) be reused by multiple nodes in a glTF asset. To
			// avoid having more than one THREE.Mesh with the same name, count
			// references and rename instances below.
			//
			// Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
			for ( var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

				var nodeDef = nodeDefs[ nodeIndex ];

				if ( nodeDef.mesh !== undefined ) {

					if ( meshReferences[ nodeDef.mesh ] === undefined ) {

						meshReferences[ nodeDef.mesh ] = meshUses[ nodeDef.mesh ] = 0;

					}

					meshReferences[ nodeDef.mesh ] ++;

					// Nothing in the mesh definition indicates whether it is
					// a SkinnedMesh or Mesh. Use the node's mesh reference
					// to mark SkinnedMesh if node has skin.
					if ( nodeDef.skin !== undefined ) {

						meshDefs[ nodeDef.mesh ].isSkinnedMesh = true;

					}

				}

			}

			this.json.meshReferences = meshReferences;
			this.json.meshUses = meshUses;

		};

		/**
		 * Requests the specified dependency asynchronously, with caching.
		 * @param {string} type
		 * @param {number} index
		 * @return {Promise<THREE.Object3D|THREE.Material|THREE.Texture|THREE.AnimationClip|ArrayBuffer|Object>}
		 */
		GLTFParser.prototype.getDependency = function ( type, index ) {

			var cacheKey = type + ':' + index;
			var dependency = this.cache.get( cacheKey );

			if ( ! dependency ) {

				switch ( type ) {

					case 'scene':
						dependency = this.loadScene( index );
						break;

					case 'node':
						dependency = this.loadNode( index );
						break;

					case 'mesh':
						dependency = this.loadMesh( index );
						break;

					case 'accessor':
						dependency = this.loadAccessor( index );
						break;

					case 'bufferView':
						dependency = this.loadBufferView( index );
						break;

					case 'buffer':
						dependency = this.loadBuffer( index );
						break;

					case 'material':
						dependency = this.loadMaterial( index );
						break;

					case 'texture':
						dependency = this.loadTexture( index );
						break;

					case 'skin':
						dependency = this.loadSkin( index );
						break;

					case 'animation':
						dependency = this.loadAnimation( index );
						break;

					case 'camera':
						dependency = this.loadCamera( index );
						break;

					case 'light':
						dependency = this.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].loadLight( index );
						break;

					default:
						throw new Error( 'Unknown type: ' + type );

				}

				this.cache.add( cacheKey, dependency );

			}

			return dependency;

		};

		/**
		 * Requests all dependencies of the specified type asynchronously, with caching.
		 * @param {string} type
		 * @return {Promise<Array<Object>>}
		 */
		GLTFParser.prototype.getDependencies = function ( type ) {

			var dependencies = this.cache.get( type );

			if ( ! dependencies ) {

				var parser = this;
				var defs = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || [];

				dependencies = Promise.all( defs.map( function ( def, index ) {

					return parser.getDependency( type, index );

				} ) );

				this.cache.add( type, dependencies );

			}

			return dependencies;

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
		 * @param {number} bufferIndex
		 * @return {Promise<ArrayBuffer>}
		 */
		GLTFParser.prototype.loadBuffer = function ( bufferIndex ) {

			var bufferDef = this.json.buffers[ bufferIndex ];
			var loader = this.fileLoader;

			if ( bufferDef.type && bufferDef.type !== 'arraybuffer' ) {

				throw new Error( 'THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.' );

			}

			// If present, GLB container is required to be the first buffer.
			if ( bufferDef.uri === undefined && bufferIndex === 0 ) {

				return Promise.resolve( this.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body );

			}

			var options = this.options;

			return new Promise( function ( resolve, reject ) {

				loader.load( resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {

					reject( new Error( 'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".' ) );

				} );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
		 * @param {number} bufferViewIndex
		 * @return {Promise<ArrayBuffer>}
		 */
		GLTFParser.prototype.loadBufferView = function ( bufferViewIndex ) {

			var bufferViewDef = this.json.bufferViews[ bufferViewIndex ];

			return this.getDependency( 'buffer', bufferViewDef.buffer ).then( function ( buffer ) {

				var byteLength = bufferViewDef.byteLength || 0;
				var byteOffset = bufferViewDef.byteOffset || 0;
				return buffer.slice( byteOffset, byteOffset + byteLength );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
		 * @param {number} accessorIndex
		 * @return {Promise<THREE.BufferAttribute|THREE.InterleavedBufferAttribute>}
		 */
		GLTFParser.prototype.loadAccessor = function ( accessorIndex ) {

			var parser = this;
			var json = this.json;

			var accessorDef = this.json.accessors[ accessorIndex ];

			if ( accessorDef.bufferView === undefined && accessorDef.sparse === undefined ) {

				// Ignore empty accessors, which may be used to declare runtime
				// information about attributes coming from another source (e.g. Draco
				// compression extension).
				return Promise.resolve( null );

			}

			var pendingBufferViews = [];

			if ( accessorDef.bufferView !== undefined ) {

				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.bufferView ) );

			} else {

				pendingBufferViews.push( null );

			}

			if ( accessorDef.sparse !== undefined ) {

				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.indices.bufferView ) );
				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.values.bufferView ) );

			}

			return Promise.all( pendingBufferViews ).then( function ( bufferViews ) {

				var bufferView = bufferViews[ 0 ];

				var itemSize = WEBGL_TYPE_SIZES[ accessorDef.type ];
				var TypedArray = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

				// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
				var elementBytes = TypedArray.BYTES_PER_ELEMENT;
				var itemBytes = elementBytes * itemSize;
				var byteOffset = accessorDef.byteOffset || 0;
				var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[ accessorDef.bufferView ].byteStride : undefined;
				var normalized = accessorDef.normalized === true;
				var array, bufferAttribute;

				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( byteStride && byteStride !== itemBytes ) {

					// Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
					// This makes sure that IBA.count reflects accessor.count properly
					var ibSlice = Math.floor( byteOffset / byteStride );
					var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
					var ib = parser.cache.get( ibCacheKey );

					if ( ! ib ) {

						array = new TypedArray( bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes );

						// Integer parameters to IB/IBA are in array elements, not bytes.
						ib = new THREE.InterleavedBuffer( array, byteStride / elementBytes );

						parser.cache.add( ibCacheKey, ib );

					}

					bufferAttribute = new THREE.InterleavedBufferAttribute( ib, itemSize, ( byteOffset % byteStride ) / elementBytes, normalized );

				} else {

					if ( bufferView === null ) {

						array = new TypedArray( accessorDef.count * itemSize );

					} else {

						array = new TypedArray( bufferView, byteOffset, accessorDef.count * itemSize );

					}

					bufferAttribute = new THREE.BufferAttribute( array, itemSize, normalized );

				}

				// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
				if ( accessorDef.sparse !== undefined ) {

					var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
					var TypedArrayIndices = WEBGL_COMPONENT_TYPES[ accessorDef.sparse.indices.componentType ];

					var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
					var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

					var sparseIndices = new TypedArrayIndices( bufferViews[ 1 ], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices );
					var sparseValues = new TypedArray( bufferViews[ 2 ], byteOffsetValues, accessorDef.sparse.count * itemSize );

					if ( bufferView !== null ) {

						// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
						bufferAttribute = new THREE.BufferAttribute( bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized );

					}

					for ( var i = 0, il = sparseIndices.length; i < il; i ++ ) {

						var index = sparseIndices[ i ];

						bufferAttribute.setX( index, sparseValues[ i * itemSize ] );
						if ( itemSize >= 2 ) bufferAttribute.setY( index, sparseValues[ i * itemSize + 1 ] );
						if ( itemSize >= 3 ) bufferAttribute.setZ( index, sparseValues[ i * itemSize + 2 ] );
						if ( itemSize >= 4 ) bufferAttribute.setW( index, sparseValues[ i * itemSize + 3 ] );
						if ( itemSize >= 5 ) throw new Error( 'THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.' );

					}

				}

				return bufferAttribute;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
		 * @param {number} textureIndex
		 * @return {Promise<THREE.Texture>}
		 */
		GLTFParser.prototype.loadTexture = function ( textureIndex ) {

			var parser = this;
			var json = this.json;
			var options = this.options;
			var textureLoader = this.textureLoader;

			var URL = self.URL || self.webkitURL;

			var textureDef = json.textures[ textureIndex ];

			var textureExtensions = textureDef.extensions || {};

			var source;

			if ( textureExtensions[ EXTENSIONS.MSFT_TEXTURE_DDS ] ) {

				source = json.images[ textureExtensions[ EXTENSIONS.MSFT_TEXTURE_DDS ].source ];

			} else {

				source = json.images[ textureDef.source ];

			}

			var sourceURI = source.uri;
			var isObjectURL = false;

			if ( source.bufferView !== undefined ) {

				// Load binary image data from bufferView, if provided.

				sourceURI = parser.getDependency( 'bufferView', source.bufferView ).then( function ( bufferView ) {

					isObjectURL = true;
					var blob = new Blob( [ bufferView ], { type: source.mimeType } );
					sourceURI = URL.createObjectURL( blob );
					return sourceURI;

				} );

			}

			return Promise.resolve( sourceURI ).then( function ( sourceURI ) {

				// Load Texture resource.

				var loader = options.manager.getHandler( sourceURI );

				if ( ! loader ) {

					loader = textureExtensions[ EXTENSIONS.MSFT_TEXTURE_DDS ]
						? parser.extensions[ EXTENSIONS.MSFT_TEXTURE_DDS ].ddsLoader
						: textureLoader;

				}

				return new Promise( function ( resolve, reject ) {

					loader.load( resolveURL( sourceURI, options.path ), resolve, undefined, reject );

				} );

			} ).then( function ( texture ) {

				// Clean up resources and configure Texture.

				if ( isObjectURL === true ) {

					URL.revokeObjectURL( sourceURI );

				}

				texture.flipY = false;

				if ( textureDef.name ) texture.name = textureDef.name;

				// Ignore unknown mime types, like DDS files.
				if ( source.mimeType in MIME_TYPE_FORMATS ) {

					texture.format = MIME_TYPE_FORMATS[ source.mimeType ];

				}

				var samplers = json.samplers || {};
				var sampler = samplers[ textureDef.sampler ] || {};

				texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || THREE.LinearFilter;
				texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || THREE.LinearMipmapLinearFilter;
				texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || THREE.RepeatWrapping;
				texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || THREE.RepeatWrapping;

				return texture;

			} );

		};

		/**
		 * Asynchronously assigns a texture to the given material parameters.
		 * @param {Object} materialParams
		 * @param {string} mapName
		 * @param {Object} mapDef
		 * @return {Promise}
		 */
		GLTFParser.prototype.assignTexture = function ( materialParams, mapName, mapDef ) {

			var parser = this;

			return this.getDependency( 'texture', mapDef.index ).then( function ( texture ) {

				if ( ! texture.isCompressedTexture ) {

					switch ( mapName ) {

						case 'aoMap':
						case 'emissiveMap':
						case 'metalnessMap':
						case 'normalMap':
						case 'roughnessMap':
							texture.format = THREE.RGBFormat;
							break;

					}

				}

				// Materials sample aoMap from UV set 1 and other maps from UV set 0 - this can't be configured
				// However, we will copy UV set 0 to UV set 1 on demand for aoMap
				if ( mapDef.texCoord !== undefined && mapDef.texCoord != 0 && ! ( mapName === 'aoMap' && mapDef.texCoord == 1 ) ) {

					console.warn( 'THREE.GLTFLoader: Custom UV set ' + mapDef.texCoord + ' for texture ' + mapName + ' not yet supported.' );

				}

				if ( parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] ) {

					var transform = mapDef.extensions !== undefined ? mapDef.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] : undefined;

					if ( transform ) {

						texture = parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ].extendTexture( texture, transform );

					}

				}

				materialParams[ mapName ] = texture;

			} );

		};

		/**
		 * Assigns final material to a Mesh, Line, or Points instance. The instance
		 * already has a material (generated from the glTF material options alone)
		 * but reuse of the same glTF material may require multiple threejs materials
		 * to accomodate different primitive types, defines, etc. New materials will
		 * be created if necessary, and reused from a cache.
		 * @param  {THREE.Object3D} mesh Mesh, Line, or Points instance.
		 */
		GLTFParser.prototype.assignFinalMaterial = function ( mesh ) {

			var geometry = mesh.geometry;
			var material = mesh.material;

			var useVertexTangents = geometry.attributes.tangent !== undefined;
			var useVertexColors = geometry.attributes.color !== undefined;
			var useFlatShading = geometry.attributes.normal === undefined;
			var useSkinning = mesh.isSkinnedMesh === true;
			var useMorphTargets = Object.keys( geometry.morphAttributes ).length > 0;
			var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;

			if ( mesh.isPoints ) {

				var cacheKey = 'PointsMaterial:' + material.uuid;

				var pointsMaterial = this.cache.get( cacheKey );

				if ( ! pointsMaterial ) {

					pointsMaterial = new THREE.PointsMaterial();
					THREE.Material.prototype.copy.call( pointsMaterial, material );
					pointsMaterial.color.copy( material.color );
					pointsMaterial.map = material.map;
					pointsMaterial.sizeAttenuation = false; // glTF spec says points should be 1px

					this.cache.add( cacheKey, pointsMaterial );

				}

				material = pointsMaterial;

			} else if ( mesh.isLine ) {

				var cacheKey = 'LineBasicMaterial:' + material.uuid;

				var lineMaterial = this.cache.get( cacheKey );

				if ( ! lineMaterial ) {

					lineMaterial = new THREE.LineBasicMaterial();
					THREE.Material.prototype.copy.call( lineMaterial, material );
					lineMaterial.color.copy( material.color );

					this.cache.add( cacheKey, lineMaterial );

				}

				material = lineMaterial;

			}

			// Clone the material if it will be modified
			if ( useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets ) {

				var cacheKey = 'ClonedMaterial:' + material.uuid + ':';

				if ( material.isGLTFSpecularGlossinessMaterial ) cacheKey += 'specular-glossiness:';
				if ( useSkinning ) cacheKey += 'skinning:';
				if ( useVertexTangents ) cacheKey += 'vertex-tangents:';
				if ( useVertexColors ) cacheKey += 'vertex-colors:';
				if ( useFlatShading ) cacheKey += 'flat-shading:';
				if ( useMorphTargets ) cacheKey += 'morph-targets:';
				if ( useMorphNormals ) cacheKey += 'morph-normals:';

				var cachedMaterial = this.cache.get( cacheKey );

				if ( ! cachedMaterial ) {

					cachedMaterial = material.clone();

					if ( useSkinning ) cachedMaterial.skinning = true;
					if ( useVertexTangents ) cachedMaterial.vertexTangents = true;
					if ( useVertexColors ) cachedMaterial.vertexColors = true;
					if ( useFlatShading ) cachedMaterial.flatShading = true;
					if ( useMorphTargets ) cachedMaterial.morphTargets = true;
					if ( useMorphNormals ) cachedMaterial.morphNormals = true;

					this.cache.add( cacheKey, cachedMaterial );

				}

				material = cachedMaterial;

			}

			// workarounds for mesh and geometry

			if ( material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined ) {

				geometry.setAttribute( 'uv2', new THREE.BufferAttribute( geometry.attributes.uv.array, 2 ) );

			}

			// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
			if ( material.normalScale && ! useVertexTangents ) {

				material.normalScale.y = - material.normalScale.y;

			}

			if ( material.clearcoatNormalScale && ! useVertexTangents ) {

				material.clearcoatNormalScale.y = - material.clearcoatNormalScale.y;

			}

			mesh.material = material;

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
		 * @param {number} materialIndex
		 * @return {Promise<THREE.Material>}
		 */
		GLTFParser.prototype.loadMaterial = function ( materialIndex ) {

			var parser = this;
			var json = this.json;
			var extensions = this.extensions;
			var materialDef = json.materials[ materialIndex ];

			var materialType;
			var materialParams = {};
			var materialExtensions = materialDef.extensions || {};

			var pending = [];

			if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] ) {

				var sgExtension = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ];
				materialType = sgExtension.getMaterialType();
				pending.push( sgExtension.extendParams( materialParams, materialDef, parser ) );

			} else if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ] ) {

				var kmuExtension = extensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ];
				materialType = kmuExtension.getMaterialType();
				pending.push( kmuExtension.extendParams( materialParams, materialDef, parser ) );

			} else {

				// Specification:
				// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

				materialType = THREE.MeshStandardMaterial;

				var metallicRoughness = materialDef.pbrMetallicRoughness || {};

				materialParams.color = new THREE.Color( 1.0, 1.0, 1.0 );
				materialParams.opacity = 1.0;

				if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

					var array = metallicRoughness.baseColorFactor;

					materialParams.color.fromArray( array );
					materialParams.opacity = array[ 3 ];

				}

				if ( metallicRoughness.baseColorTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

				}

				materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
				materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

				if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture ) );
					pending.push( parser.assignTexture( materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture ) );

				}

			}

			if ( materialDef.doubleSided === true ) {

				materialParams.side = THREE.DoubleSide;

			}

			var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

			if ( alphaMode === ALPHA_MODES.BLEND ) {

				materialParams.transparent = true;

				// See: https://github.com/mrdoob/three.js/issues/17706
				materialParams.depthWrite = false;

			} else {

				materialParams.transparent = false;

				if ( alphaMode === ALPHA_MODES.MASK ) {

					materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

				}

			}

			if ( materialDef.normalTexture !== undefined && materialType !== THREE.MeshBasicMaterial ) {

				pending.push( parser.assignTexture( materialParams, 'normalMap', materialDef.normalTexture ) );

				materialParams.normalScale = new THREE.Vector2( 1, 1 );

				if ( materialDef.normalTexture.scale !== undefined ) {

					materialParams.normalScale.set( materialDef.normalTexture.scale, materialDef.normalTexture.scale );

				}

			}

			if ( materialDef.occlusionTexture !== undefined && materialType !== THREE.MeshBasicMaterial ) {

				pending.push( parser.assignTexture( materialParams, 'aoMap', materialDef.occlusionTexture ) );

				if ( materialDef.occlusionTexture.strength !== undefined ) {

					materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

				}

			}

			if ( materialDef.emissiveFactor !== undefined && materialType !== THREE.MeshBasicMaterial ) {

				materialParams.emissive = new THREE.Color().fromArray( materialDef.emissiveFactor );

			}

			if ( materialDef.emissiveTexture !== undefined && materialType !== THREE.MeshBasicMaterial ) {

				pending.push( parser.assignTexture( materialParams, 'emissiveMap', materialDef.emissiveTexture ) );

			}

			if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_CLEARCOAT ] ) {

				var clearcoatExtension = extensions[ EXTENSIONS.KHR_MATERIALS_CLEARCOAT ];
				materialType = clearcoatExtension.getMaterialType();
				pending.push( clearcoatExtension.extendParams( materialParams, { extensions: materialExtensions }, parser ) );

			}

			return Promise.all( pending ).then( function () {

				var material;

				if ( materialType === GLTFMeshStandardSGMaterial ) {

					material = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].createMaterial( materialParams );

				} else {

					material = new materialType( materialParams );

				}

				if ( materialDef.name ) material.name = materialDef.name;

				// baseColorTexture, emissiveTexture, and specularGlossinessTexture use sRGB encoding.
				if ( material.map ) material.map.encoding = THREE.sRGBEncoding;
				if ( material.emissiveMap ) material.emissiveMap.encoding = THREE.sRGBEncoding;

				assignExtrasToUserData( material, materialDef );

				if ( materialDef.extensions ) addUnknownExtensionsToUserData( extensions, material, materialDef );

				return material;

			} );

		};

		/**
		 * @param {THREE.BufferGeometry} geometry
		 * @param {GLTF.Primitive} primitiveDef
		 * @param {GLTFParser} parser
		 */
		function computeBounds( geometry, primitiveDef, parser ) {

			var attributes = primitiveDef.attributes;

			var box = new THREE.Box3();

			if ( attributes.POSITION !== undefined ) {

				var accessor = parser.json.accessors[ attributes.POSITION ];

				var min = accessor.min;
				var max = accessor.max;

				// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

				if ( min !== undefined && max !== undefined ) {

					box.set(
						new THREE.Vector3( min[ 0 ], min[ 1 ], min[ 2 ] ),
						new THREE.Vector3( max[ 0 ], max[ 1 ], max[ 2 ] ) );

				} else {

					console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

					return;

				}

			} else {

				return;

			}

			var targets = primitiveDef.targets;

			if ( targets !== undefined ) {

				var maxDisplacement = new THREE.Vector3();
				var vector = new THREE.Vector3();

				for ( var i = 0, il = targets.length; i < il; i ++ ) {

					var target = targets[ i ];

					if ( target.POSITION !== undefined ) {

						var accessor = parser.json.accessors[ target.POSITION ];
						var min = accessor.min;
						var max = accessor.max;

						// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

						if ( min !== undefined && max !== undefined ) {

							// we need to get max of absolute components because target weight is [-1,1]
							vector.setX( Math.max( Math.abs( min[ 0 ] ), Math.abs( max[ 0 ] ) ) );
							vector.setY( Math.max( Math.abs( min[ 1 ] ), Math.abs( max[ 1 ] ) ) );
							vector.setZ( Math.max( Math.abs( min[ 2 ] ), Math.abs( max[ 2 ] ) ) );

							// Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
							// to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
							// are used to implement key-frame animations and as such only two are active at a time - this results in very large
							// boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
							maxDisplacement.max( vector );

						} else {

							console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

						}

					}

				}

				// As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
				box.expandByVector( maxDisplacement );

			}

			geometry.boundingBox = box;

			var sphere = new THREE.Sphere();

			box.getCenter( sphere.center );
			sphere.radius = box.min.distanceTo( box.max ) / 2;

			geometry.boundingSphere = sphere;

		}

		/**
		 * @param {THREE.BufferGeometry} geometry
		 * @param {GLTF.Primitive} primitiveDef
		 * @param {GLTFParser} parser
		 * @return {Promise<THREE.BufferGeometry>}
		 */
		function addPrimitiveAttributes( geometry, primitiveDef, parser ) {

			var attributes = primitiveDef.attributes;

			var pending = [];

			function assignAttributeAccessor( accessorIndex, attributeName ) {

				return parser.getDependency( 'accessor', accessorIndex )
					.then( function ( accessor ) {

						geometry.setAttribute( attributeName, accessor );

					} );

			}

			for ( var gltfAttributeName in attributes ) {

				var threeAttributeName = ATTRIBUTES[ gltfAttributeName ] || gltfAttributeName.toLowerCase();

				// Skip attributes already provided by e.g. Draco extension.
				if ( threeAttributeName in geometry.attributes ) continue;

				pending.push( assignAttributeAccessor( attributes[ gltfAttributeName ], threeAttributeName ) );

			}

			if ( primitiveDef.indices !== undefined && ! geometry.index ) {

				var accessor = parser.getDependency( 'accessor', primitiveDef.indices ).then( function ( accessor ) {

					geometry.setIndex( accessor );

				} );

				pending.push( accessor );

			}

			assignExtrasToUserData( geometry, primitiveDef );

			computeBounds( geometry, primitiveDef, parser );

			return Promise.all( pending ).then( function () {

				return primitiveDef.targets !== undefined
					? addMorphTargets( geometry, primitiveDef.targets, parser )
					: geometry;

			} );

		}

		/**
		 * @param {THREE.BufferGeometry} geometry
		 * @param {Number} drawMode
		 * @return {THREE.BufferGeometry}
		 */
		function toTrianglesDrawMode( geometry, drawMode ) {

			var index = geometry.getIndex();

			// generate index if not present

			if ( index === null ) {

				var indices = [];

				var position = geometry.getAttribute( 'position' );

				if ( position !== undefined ) {

					for ( var i = 0; i < position.count; i ++ ) {

						indices.push( i );

					}

					geometry.setIndex( indices );
					index = geometry.getIndex();

				} else {

					console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
					return geometry;

				}

			}

			//

			var numberOfTriangles = index.count - 2;
			var newIndices = [];

			if ( drawMode === THREE.TriangleFanDrawMode ) {

				// gl.TRIANGLE_FAN

				for ( var i = 1; i <= numberOfTriangles; i ++ ) {

					newIndices.push( index.getX( 0 ) );
					newIndices.push( index.getX( i ) );
					newIndices.push( index.getX( i + 1 ) );

				}

			} else {

				// gl.TRIANGLE_STRIP

				for ( var i = 0; i < numberOfTriangles; i ++ ) {

					if ( i % 2 === 0 ) {

						newIndices.push( index.getX( i ) );
						newIndices.push( index.getX( i + 1 ) );
						newIndices.push( index.getX( i + 2 ) );


					} else {

						newIndices.push( index.getX( i + 2 ) );
						newIndices.push( index.getX( i + 1 ) );
						newIndices.push( index.getX( i ) );

					}

				}

			}

			if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

				console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

			}

			// build final geometry

			var newGeometry = geometry.clone();
			newGeometry.setIndex( newIndices );

			return newGeometry;

		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
		 *
		 * Creates BufferGeometries from primitives.
		 *
		 * @param {Array<GLTF.Primitive>} primitives
		 * @return {Promise<Array<THREE.BufferGeometry>>}
		 */
		GLTFParser.prototype.loadGeometries = function ( primitives ) {

			var parser = this;
			var extensions = this.extensions;
			var cache = this.primitiveCache;

			function createDracoPrimitive( primitive ) {

				return extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ]
					.decodePrimitive( primitive, parser )
					.then( function ( geometry ) {

						return addPrimitiveAttributes( geometry, primitive, parser );

					} );

			}

			var pending = [];

			for ( var i = 0, il = primitives.length; i < il; i ++ ) {

				var primitive = primitives[ i ];
				var cacheKey = createPrimitiveKey( primitive );

				// See if we've already created this geometry
				var cached = cache[ cacheKey ];

				if ( cached ) {

					// Use the cached geometry if it exists
					pending.push( cached.promise );

				} else {

					var geometryPromise;

					if ( primitive.extensions && primitive.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ] ) {

						// Use DRACO geometry if available
						geometryPromise = createDracoPrimitive( primitive );

					} else {

						// Otherwise create a new geometry
						geometryPromise = addPrimitiveAttributes( new THREE.BufferGeometry(), primitive, parser );

					}

					// Cache this geometry
					cache[ cacheKey ] = { primitive: primitive, promise: geometryPromise };

					pending.push( geometryPromise );

				}

			}

			return Promise.all( pending );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
		 * @param {number} meshIndex
		 * @return {Promise<THREE.Group|THREE.Mesh|THREE.SkinnedMesh>}
		 */
		GLTFParser.prototype.loadMesh = function ( meshIndex ) {

			var parser = this;
			var json = this.json;

			var meshDef = json.meshes[ meshIndex ];
			var primitives = meshDef.primitives;

			var pending = [];

			for ( var i = 0, il = primitives.length; i < il; i ++ ) {

				var material = primitives[ i ].material === undefined
					? createDefaultMaterial( this.cache )
					: this.getDependency( 'material', primitives[ i ].material );

				pending.push( material );

			}

			pending.push( parser.loadGeometries( primitives ) );

			return Promise.all( pending ).then( function ( results ) {

				var materials = results.slice( 0, results.length - 1 );
				var geometries = results[ results.length - 1 ];

				var meshes = [];

				for ( var i = 0, il = geometries.length; i < il; i ++ ) {

					var geometry = geometries[ i ];
					var primitive = primitives[ i ];

					// 1. create Mesh

					var mesh;

					var material = materials[ i ];

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
						primitive.mode === undefined ) {

						// .isSkinnedMesh isn't in glTF spec. See .markDefs()
						mesh = meshDef.isSkinnedMesh === true
							? new THREE.SkinnedMesh( geometry, material )
							: new THREE.Mesh( geometry, material );

						if ( mesh.isSkinnedMesh === true && ! mesh.geometry.attributes.skinWeight.normalized ) {

							// we normalize floating point skin weight array to fix malformed assets (see #15319)
							// it's important to skip this for non-float32 data since normalizeSkinWeights assumes non-normalized inputs
							mesh.normalizeSkinWeights();

						}

						if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ) {

							mesh.geometry = toTrianglesDrawMode( mesh.geometry, THREE.TriangleStripDrawMode );

						} else if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ) {

							mesh.geometry = toTrianglesDrawMode( mesh.geometry, THREE.TriangleFanDrawMode );

						}

					} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

						mesh = new THREE.LineSegments( geometry, material );

					} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_STRIP ) {

						mesh = new THREE.Line( geometry, material );

					} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_LOOP ) {

						mesh = new THREE.LineLoop( geometry, material );

					} else if ( primitive.mode === WEBGL_CONSTANTS.POINTS ) {

						mesh = new THREE.Points( geometry, material );

					} else {

						throw new Error( 'THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode );

					}

					if ( Object.keys( mesh.geometry.morphAttributes ).length > 0 ) {

						updateMorphTargets( mesh, meshDef );

					}

					mesh.name = meshDef.name || ( 'mesh_' + meshIndex );

					if ( geometries.length > 1 ) mesh.name += '_' + i;

					assignExtrasToUserData( mesh, meshDef );

					parser.assignFinalMaterial( mesh );

					meshes.push( mesh );

				}

				if ( meshes.length === 1 ) {

					return meshes[ 0 ];

				}

				var group = new THREE.Group();

				for ( var i = 0, il = meshes.length; i < il; i ++ ) {

					group.add( meshes[ i ] );

				}

				return group;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
		 * @param {number} cameraIndex
		 * @return {Promise<THREE.Camera>}
		 */
		GLTFParser.prototype.loadCamera = function ( cameraIndex ) {

			var camera;
			var cameraDef = this.json.cameras[ cameraIndex ];
			var params = cameraDef[ cameraDef.type ];

			if ( ! params ) {

				console.warn( 'THREE.GLTFLoader: Missing camera parameters.' );
				return;

			}

			if ( cameraDef.type === 'perspective' ) {

				camera = new THREE.PerspectiveCamera( THREE.MathUtils.radToDeg( params.yfov ), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6 );

			} else if ( cameraDef.type === 'orthographic' ) {

				camera = new THREE.OrthographicCamera( params.xmag / - 2, params.xmag / 2, params.ymag / 2, params.ymag / - 2, params.znear, params.zfar );

			}

			if ( cameraDef.name ) camera.name = cameraDef.name;

			assignExtrasToUserData( camera, cameraDef );

			return Promise.resolve( camera );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
		 * @param {number} skinIndex
		 * @return {Promise<Object>}
		 */
		GLTFParser.prototype.loadSkin = function ( skinIndex ) {

			var skinDef = this.json.skins[ skinIndex ];

			var skinEntry = { joints: skinDef.joints };

			if ( skinDef.inverseBindMatrices === undefined ) {

				return Promise.resolve( skinEntry );

			}

			return this.getDependency( 'accessor', skinDef.inverseBindMatrices ).then( function ( accessor ) {

				skinEntry.inverseBindMatrices = accessor;

				return skinEntry;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
		 * @param {number} animationIndex
		 * @return {Promise<THREE.AnimationClip>}
		 */
		GLTFParser.prototype.loadAnimation = function ( animationIndex ) {

			var json = this.json;

			var animationDef = json.animations[ animationIndex ];

			var pendingNodes = [];
			var pendingInputAccessors = [];
			var pendingOutputAccessors = [];
			var pendingSamplers = [];
			var pendingTargets = [];

			for ( var i = 0, il = animationDef.channels.length; i < il; i ++ ) {

				var channel = animationDef.channels[ i ];
				var sampler = animationDef.samplers[ channel.sampler ];
				var target = channel.target;
				var name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
				var input = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.input ] : sampler.input;
				var output = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.output ] : sampler.output;

				pendingNodes.push( this.getDependency( 'node', name ) );
				pendingInputAccessors.push( this.getDependency( 'accessor', input ) );
				pendingOutputAccessors.push( this.getDependency( 'accessor', output ) );
				pendingSamplers.push( sampler );
				pendingTargets.push( target );

			}

			return Promise.all( [

				Promise.all( pendingNodes ),
				Promise.all( pendingInputAccessors ),
				Promise.all( pendingOutputAccessors ),
				Promise.all( pendingSamplers ),
				Promise.all( pendingTargets )

			] ).then( function ( dependencies ) {

				var nodes = dependencies[ 0 ];
				var inputAccessors = dependencies[ 1 ];
				var outputAccessors = dependencies[ 2 ];
				var samplers = dependencies[ 3 ];
				var targets = dependencies[ 4 ];

				var tracks = [];

				for ( var i = 0, il = nodes.length; i < il; i ++ ) {

					var node = nodes[ i ];
					var inputAccessor = inputAccessors[ i ];
					var outputAccessor = outputAccessors[ i ];
					var sampler = samplers[ i ];
					var target = targets[ i ];

					if ( node === undefined ) continue;

					node.updateMatrix();
					node.matrixAutoUpdate = true;

					var TypedKeyframeTrack;

					switch ( PATH_PROPERTIES[ target.path ] ) {

						case PATH_PROPERTIES.weights:

							TypedKeyframeTrack = THREE.NumberKeyframeTrack;
							break;

						case PATH_PROPERTIES.rotation:

							TypedKeyframeTrack = THREE.QuaternionKeyframeTrack;
							break;

						case PATH_PROPERTIES.position:
						case PATH_PROPERTIES.scale:
						default:

							TypedKeyframeTrack = THREE.VectorKeyframeTrack;
							break;

					}

					var targetName = node.name ? node.name : node.uuid;

					var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : THREE.InterpolateLinear;

					var targetNames = [];

					if ( PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.weights ) {

						// Node may be a THREE.Group (glTF mesh with several primitives) or a THREE.Mesh.
						node.traverse( function ( object ) {

							if ( object.isMesh === true && object.morphTargetInfluences ) {

								targetNames.push( object.name ? object.name : object.uuid );

							}

						} );

					} else {

						targetNames.push( targetName );

					}

					var outputArray = outputAccessor.array;

					if ( outputAccessor.normalized ) {

						var scale;

						if ( outputArray.constructor === Int8Array ) {

							scale = 1 / 127;

						} else if ( outputArray.constructor === Uint8Array ) {

							scale = 1 / 255;

						} else if ( outputArray.constructor == Int16Array ) {

							scale = 1 / 32767;

						} else if ( outputArray.constructor === Uint16Array ) {

							scale = 1 / 65535;

						} else {

							throw new Error( 'THREE.GLTFLoader: Unsupported output accessor component type.' );

						}

						var scaled = new Float32Array( outputArray.length );

						for ( var j = 0, jl = outputArray.length; j < jl; j ++ ) {

							scaled[ j ] = outputArray[ j ] * scale;

						}

						outputArray = scaled;

					}

					for ( var j = 0, jl = targetNames.length; j < jl; j ++ ) {

						var track = new TypedKeyframeTrack(
							targetNames[ j ] + '.' + PATH_PROPERTIES[ target.path ],
							inputAccessor.array,
							outputArray,
							interpolation
						);

						// Override interpolation with custom factory method.
						if ( sampler.interpolation === 'CUBICSPLINE' ) {

							track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline( result ) {

								// A CUBICSPLINE keyframe in glTF has three output values for each input value,
								// representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
								// must be divided by three to get the interpolant's sampleSize argument.

								return new GLTFCubicSplineInterpolant( this.times, this.values, this.getValueSize() / 3, result );

							};

							// Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
							track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;

						}

						tracks.push( track );

					}

				}

				var name = animationDef.name ? animationDef.name : 'animation_' + animationIndex;

				return new THREE.AnimationClip( name, undefined, tracks );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
		 * @param {number} nodeIndex
		 * @return {Promise<THREE.Object3D>}
		 */
		GLTFParser.prototype.loadNode = function ( nodeIndex ) {

			var json = this.json;
			var extensions = this.extensions;
			var parser = this;

			var meshReferences = json.meshReferences;
			var meshUses = json.meshUses;

			var nodeDef = json.nodes[ nodeIndex ];

			return ( function () {

				var pending = [];

				if ( nodeDef.mesh !== undefined ) {

					pending.push( parser.getDependency( 'mesh', nodeDef.mesh ).then( function ( mesh ) {

						var node;

						if ( meshReferences[ nodeDef.mesh ] > 1 ) {

							var instanceNum = meshUses[ nodeDef.mesh ] ++;

							node = mesh.clone();
							node.name += '_instance_' + instanceNum;

						} else {

							node = mesh;

						}

						// if weights are provided on the node, override weights on the mesh.
						if ( nodeDef.weights !== undefined ) {

							node.traverse( function ( o ) {

								if ( ! o.isMesh ) return;

								for ( var i = 0, il = nodeDef.weights.length; i < il; i ++ ) {

									o.morphTargetInfluences[ i ] = nodeDef.weights[ i ];

								}

							} );

						}

						return node;

					} ) );

				}

				if ( nodeDef.camera !== undefined ) {

					pending.push( parser.getDependency( 'camera', nodeDef.camera ) );

				}

				if ( nodeDef.extensions
					&& nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ]
					&& nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].light !== undefined ) {

					pending.push( parser.getDependency( 'light', nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].light ) );

				}

				return Promise.all( pending );

			}() ).then( function ( objects ) {

				var node;

				// .isBone isn't in glTF spec. See .markDefs
				if ( nodeDef.isBone === true ) {

					node = new THREE.Bone();

				} else if ( objects.length > 1 ) {

					node = new THREE.Group();

				} else if ( objects.length === 1 ) {

					node = objects[ 0 ];

				} else {

					node = new THREE.Object3D();

				}

				if ( node !== objects[ 0 ] ) {

					for ( var i = 0, il = objects.length; i < il; i ++ ) {

						node.add( objects[ i ] );

					}

				}

				if ( nodeDef.name ) {

					node.userData.name = nodeDef.name;
					node.name = THREE.PropertyBinding.sanitizeNodeName( nodeDef.name );

				}

				assignExtrasToUserData( node, nodeDef );

				if ( nodeDef.extensions ) addUnknownExtensionsToUserData( extensions, node, nodeDef );

				if ( nodeDef.matrix !== undefined ) {

					var matrix = new THREE.Matrix4();
					matrix.fromArray( nodeDef.matrix );
					node.applyMatrix4( matrix );

				} else {

					if ( nodeDef.translation !== undefined ) {

						node.position.fromArray( nodeDef.translation );

					}

					if ( nodeDef.rotation !== undefined ) {

						node.quaternion.fromArray( nodeDef.rotation );

					}

					if ( nodeDef.scale !== undefined ) {

						node.scale.fromArray( nodeDef.scale );

					}

				}

				return node;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
		 * @param {number} sceneIndex
		 * @return {Promise<THREE.Group>}
		 */
		GLTFParser.prototype.loadScene = function () {

			// scene node hierachy builder

			function buildNodeHierachy( nodeId, parentObject, json, parser ) {

				var nodeDef = json.nodes[ nodeId ];

				return parser.getDependency( 'node', nodeId ).then( function ( node ) {

					if ( nodeDef.skin === undefined ) return node;

					// build skeleton here as well

					var skinEntry;

					return parser.getDependency( 'skin', nodeDef.skin ).then( function ( skin ) {

						skinEntry = skin;

						var pendingJoints = [];

						for ( var i = 0, il = skinEntry.joints.length; i < il; i ++ ) {

							pendingJoints.push( parser.getDependency( 'node', skinEntry.joints[ i ] ) );

						}

						return Promise.all( pendingJoints );

					} ).then( function ( jointNodes ) {

						node.traverse( function ( mesh ) {

							if ( ! mesh.isMesh ) return;

							var bones = [];
							var boneInverses = [];

							for ( var j = 0, jl = jointNodes.length; j < jl; j ++ ) {

								var jointNode = jointNodes[ j ];

								if ( jointNode ) {

									bones.push( jointNode );

									var mat = new THREE.Matrix4();

									if ( skinEntry.inverseBindMatrices !== undefined ) {

										mat.fromArray( skinEntry.inverseBindMatrices.array, j * 16 );

									}

									boneInverses.push( mat );

								} else {

									console.warn( 'THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[ j ] );

								}

							}

							mesh.bind( new THREE.Skeleton( bones, boneInverses ), mesh.matrixWorld );

						} );

						return node;

					} );

				} ).then( function ( node ) {

					// build node hierachy

					parentObject.add( node );

					var pending = [];

					if ( nodeDef.children ) {

						var children = nodeDef.children;

						for ( var i = 0, il = children.length; i < il; i ++ ) {

							var child = children[ i ];
							pending.push( buildNodeHierachy( child, node, json, parser ) );

						}

					}

					return Promise.all( pending );

				} );

			}

			return function loadScene( sceneIndex ) {

				var json = this.json;
				var extensions = this.extensions;
				var sceneDef = this.json.scenes[ sceneIndex ];
				var parser = this;

				// Loader returns Group, not Scene.
				// See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
				var scene = new THREE.Group();
				if ( sceneDef.name ) scene.name = sceneDef.name;

				assignExtrasToUserData( scene, sceneDef );

				if ( sceneDef.extensions ) addUnknownExtensionsToUserData( extensions, scene, sceneDef );

				var nodeIds = sceneDef.nodes || [];

				var pending = [];

				for ( var i = 0, il = nodeIds.length; i < il; i ++ ) {

					pending.push( buildNodeHierachy( nodeIds[ i ], scene, json, parser ) );

				}

				return Promise.all( pending ).then( function () {

					return scene;

				} );

			};

		}();

		return GLTFLoader;

	} )();
	
	return THREE.GLTFLoader;
});

define('skylark-threejs-ex/loaders/MTLLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * Loads a Wavefront .mtl file specifying materials
	 *
	 * @author angelxuanchang
	 */

	THREE.MTLLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

	};

	THREE.MTLLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.MTLLoader,

		/**
		 * Loads and parses a MTL asset from a URL.
		 *
		 * @param {String} url - URL to the MTL file.
		 * @param {Function} [onLoad] - Callback invoked with the loaded object.
		 * @param {Function} [onProgress] - Callback for download progress.
		 * @param {Function} [onError] - Callback for download errors.
		 *
		 * @see setPath setResourcePath
		 *
		 * @note In order for relative texture references to resolve correctly
		 * you must call setResourcePath() explicitly prior to load.
		 */
		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = ( this.path === '' ) ? THREE.LoaderUtils.extractUrlBase( url ) : this.path;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text, path ) );

			}, onProgress, onError );

		},

		setMaterialOptions: function ( value ) {

			this.materialOptions = value;
			return this;

		},

		/**
		 * Parses a MTL file.
		 *
		 * @param {String} text - Content of MTL file
		 * @return {THREE.MTLLoader.MaterialCreator}
		 *
		 * @see setPath setResourcePath
		 *
		 * @note In order for relative texture references to resolve correctly
		 * you must call setResourcePath() explicitly prior to parse.
		 */
		parse: function ( text, path ) {

			var lines = text.split( '\n' );
			var info = {};
			var delimiter_pattern = /\s+/;
			var materialsInfo = {};

			for ( var i = 0; i < lines.length; i ++ ) {

				var line = lines[ i ];
				line = line.trim();

				if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

					// Blank line or comment ignore
					continue;

				}

				var pos = line.indexOf( ' ' );

				var key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
				key = key.toLowerCase();

				var value = ( pos >= 0 ) ? line.substring( pos + 1 ) : '';
				value = value.trim();

				if ( key === 'newmtl' ) {

					// New material

					info = { name: value };
					materialsInfo[ value ] = info;

				} else {

					if ( key === 'ka' || key === 'kd' || key === 'ks' || key === 'ke' ) {

						var ss = value.split( delimiter_pattern, 3 );
						info[ key ] = [ parseFloat( ss[ 0 ] ), parseFloat( ss[ 1 ] ), parseFloat( ss[ 2 ] ) ];

					} else {

						info[ key ] = value;

					}

				}

			}

			var materialCreator = new THREE.MTLLoader.MaterialCreator( this.resourcePath || path, this.materialOptions );
			materialCreator.setCrossOrigin( this.crossOrigin );
			materialCreator.setManager( this.manager );
			materialCreator.setMaterials( materialsInfo );
			return materialCreator;

		}

	} );


	/**
	 * Create a new THREE.MTLLoader.MaterialCreator
	 * @param baseUrl - Url relative to which textures are loaded
	 * @param options - Set of options on how to construct the materials
	 *                  side: Which side to apply the material
	 *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
	 *                  wrap: What type of wrapping to apply for textures
	 *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
	 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
	 *                                Default: false, assumed to be already normalized
	 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
	 *                                  Default: false
	 * @constructor
	 */

	THREE.MTLLoader.MaterialCreator = function ( baseUrl, options ) {

		this.baseUrl = baseUrl || '';
		this.options = options;
		this.materialsInfo = {};
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

		this.side = ( this.options && this.options.side ) ? this.options.side : THREE.FrontSide;
		this.wrap = ( this.options && this.options.wrap ) ? this.options.wrap : THREE.RepeatWrapping;

	};

	THREE.MTLLoader.MaterialCreator.prototype = {

		constructor: THREE.MTLLoader.MaterialCreator,

		crossOrigin: 'anonymous',

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;
			return this;

		},

		setManager: function ( value ) {

			this.manager = value;

		},

		setMaterials: function ( materialsInfo ) {

			this.materialsInfo = this.convert( materialsInfo );
			this.materials = {};
			this.materialsArray = [];
			this.nameLookup = {};

		},

		convert: function ( materialsInfo ) {

			if ( ! this.options ) return materialsInfo;

			var converted = {};

			for ( var mn in materialsInfo ) {

				// Convert materials info into normalized form based on options

				var mat = materialsInfo[ mn ];

				var covmat = {};

				converted[ mn ] = covmat;

				for ( var prop in mat ) {

					var save = true;
					var value = mat[ prop ];
					var lprop = prop.toLowerCase();

					switch ( lprop ) {

						case 'kd':
						case 'ka':
						case 'ks':

							// Diffuse color (color under white light) using RGB values

							if ( this.options && this.options.normalizeRGB ) {

								value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];

							}

							if ( this.options && this.options.ignoreZeroRGBs ) {

								if ( value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 2 ] === 0 ) {

									// ignore

									save = false;

								}

							}

							break;

						default:

							break;

					}

					if ( save ) {

						covmat[ lprop ] = value;

					}

				}

			}

			return converted;

		},

		preload: function () {

			for ( var mn in this.materialsInfo ) {

				this.create( mn );

			}

		},

		getIndex: function ( materialName ) {

			return this.nameLookup[ materialName ];

		},

		getAsArray: function () {

			var index = 0;

			for ( var mn in this.materialsInfo ) {

				this.materialsArray[ index ] = this.create( mn );
				this.nameLookup[ mn ] = index;
				index ++;

			}

			return this.materialsArray;

		},

		create: function ( materialName ) {

			if ( this.materials[ materialName ] === undefined ) {

				this.createMaterial_( materialName );

			}

			return this.materials[ materialName ];

		},

		createMaterial_: function ( materialName ) {

			// Create material

			var scope = this;
			var mat = this.materialsInfo[ materialName ];
			var params = {

				name: materialName,
				side: this.side

			};

			function resolveURL( baseUrl, url ) {

				if ( typeof url !== 'string' || url === '' )
					return '';

				// Absolute URL
				if ( /^https?:\/\//i.test( url ) ) return url;

				return baseUrl + url;

			}

			function setMapForType( mapType, value ) {

				if ( params[ mapType ] ) return; // Keep the first encountered texture

				var texParams = scope.getTextureParams( value, params );
				var map = scope.loadTexture( resolveURL( scope.baseUrl, texParams.url ) );

				map.repeat.copy( texParams.scale );
				map.offset.copy( texParams.offset );

				map.wrapS = scope.wrap;
				map.wrapT = scope.wrap;

				params[ mapType ] = map;

			}

			for ( var prop in mat ) {

				var value = mat[ prop ];
				var n;

				if ( value === '' ) continue;

				switch ( prop.toLowerCase() ) {

					// Ns is material specular exponent

					case 'kd':

						// Diffuse color (color under white light) using RGB values

						params.color = new THREE.Color().fromArray( value );

						break;

					case 'ks':

						// Specular color (color when light is reflected from shiny surface) using RGB values
						params.specular = new THREE.Color().fromArray( value );

						break;

					case 'ke':

						// Emissive using RGB values
						params.emissive = new THREE.Color().fromArray( value );

						break;

					case 'map_kd':

						// Diffuse texture map

						setMapForType( "map", value );

						break;

					case 'map_ks':

						// Specular map

						setMapForType( "specularMap", value );

						break;

					case 'map_ke':

						// Emissive map

						setMapForType( "emissiveMap", value );

						break;

					case 'norm':

						setMapForType( "normalMap", value );

						break;

					case 'map_bump':
					case 'bump':

						// Bump texture map

						setMapForType( "bumpMap", value );

						break;

					case 'map_d':

						// Alpha map

						setMapForType( "alphaMap", value );
						params.transparent = true;

						break;

					case 'ns':

						// The specular exponent (defines the focus of the specular highlight)
						// A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

						params.shininess = parseFloat( value );

						break;

					case 'd':
						n = parseFloat( value );

						if ( n < 1 ) {

							params.opacity = n;
							params.transparent = true;

						}

						break;

					case 'tr':
						n = parseFloat( value );

						if ( this.options && this.options.invertTrProperty ) n = 1 - n;

						if ( n > 0 ) {

							params.opacity = 1 - n;
							params.transparent = true;

						}

						break;

					default:
						break;

				}

			}

			this.materials[ materialName ] = new THREE.MeshPhongMaterial( params );
			return this.materials[ materialName ];

		},

		getTextureParams: function ( value, matParams ) {

			var texParams = {

				scale: new THREE.Vector2( 1, 1 ),
				offset: new THREE.Vector2( 0, 0 )

			 };

			var items = value.split( /\s+/ );
			var pos;

			pos = items.indexOf( '-bm' );

			if ( pos >= 0 ) {

				matParams.bumpScale = parseFloat( items[ pos + 1 ] );
				items.splice( pos, 2 );

			}

			pos = items.indexOf( '-s' );

			if ( pos >= 0 ) {

				texParams.scale.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
				items.splice( pos, 4 ); // we expect 3 parameters here!

			}

			pos = items.indexOf( '-o' );

			if ( pos >= 0 ) {

				texParams.offset.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
				items.splice( pos, 4 ); // we expect 3 parameters here!

			}

			texParams.url = items.join( ' ' ).trim();
			return texParams;

		},

		loadTexture: function ( url, mapping, onLoad, onProgress, onError ) {

			var texture;
			var manager = ( this.manager !== undefined ) ? this.manager : THREE.DefaultLoadingManager;
			var loader = manager.getHandler( url );

			if ( loader === null ) {

				loader = new THREE.TextureLoader( manager );

			}

			if ( loader.setCrossOrigin ) loader.setCrossOrigin( this.crossOrigin );
			texture = loader.load( url, onLoad, onProgress, onError );

			if ( mapping !== undefined ) texture.mapping = mapping;

			return texture;

		}

	};
	
	return THREE.MTLLoader;
});

define('skylark-threejs-ex/loaders/OBJLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	THREE.OBJLoader = ( function () {

		// o object_name | g group_name
		var object_pattern = /^[og]\s*(.+)?/;
		// mtllib file_reference
		var material_library_pattern = /^mtllib /;
		// usemtl material_name
		var material_use_pattern = /^usemtl /;
		// usemap map_name
		var map_use_pattern = /^usemap /;

		function ParserState() {

			var state = {
				objects: [],
				object: {},

				vertices: [],
				normals: [],
				colors: [],
				uvs: [],

				materials: {},
				materialLibraries: [],

				startObject: function ( name, fromDeclaration ) {

					// If the current object (initial from reset) is not from a g/o declaration in the parsed
					// file. We need to use it for the first parsed g/o to keep things in sync.
					if ( this.object && this.object.fromDeclaration === false ) {

						this.object.name = name;
						this.object.fromDeclaration = ( fromDeclaration !== false );
						return;

					}

					var previousMaterial = ( this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined );

					if ( this.object && typeof this.object._finalize === 'function' ) {

						this.object._finalize( true );

					}

					this.object = {
						name: name || '',
						fromDeclaration: ( fromDeclaration !== false ),

						geometry: {
							vertices: [],
							normals: [],
							colors: [],
							uvs: []
						},
						materials: [],
						smooth: true,

						startMaterial: function ( name, libraries ) {

							var previous = this._finalize( false );

							// New usemtl declaration overwrites an inherited material, except if faces were declared
							// after the material, then it must be preserved for proper MultiMaterial continuation.
							if ( previous && ( previous.inherited || previous.groupCount <= 0 ) ) {

								this.materials.splice( previous.index, 1 );

							}

							var material = {
								index: this.materials.length,
								name: name || '',
								mtllib: ( Array.isArray( libraries ) && libraries.length > 0 ? libraries[ libraries.length - 1 ] : '' ),
								smooth: ( previous !== undefined ? previous.smooth : this.smooth ),
								groupStart: ( previous !== undefined ? previous.groupEnd : 0 ),
								groupEnd: - 1,
								groupCount: - 1,
								inherited: false,

								clone: function ( index ) {

									var cloned = {
										index: ( typeof index === 'number' ? index : this.index ),
										name: this.name,
										mtllib: this.mtllib,
										smooth: this.smooth,
										groupStart: 0,
										groupEnd: - 1,
										groupCount: - 1,
										inherited: false
									};
									cloned.clone = this.clone.bind( cloned );
									return cloned;

								}
							};

							this.materials.push( material );

							return material;

						},

						currentMaterial: function () {

							if ( this.materials.length > 0 ) {

								return this.materials[ this.materials.length - 1 ];

							}

							return undefined;

						},

						_finalize: function ( end ) {

							var lastMultiMaterial = this.currentMaterial();
							if ( lastMultiMaterial && lastMultiMaterial.groupEnd === - 1 ) {

								lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
								lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
								lastMultiMaterial.inherited = false;

							}

							// Ignore objects tail materials if no face declarations followed them before a new o/g started.
							if ( end && this.materials.length > 1 ) {

								for ( var mi = this.materials.length - 1; mi >= 0; mi -- ) {

									if ( this.materials[ mi ].groupCount <= 0 ) {

										this.materials.splice( mi, 1 );

									}

								}

							}

							// Guarantee at least one empty material, this makes the creation later more straight forward.
							if ( end && this.materials.length === 0 ) {

								this.materials.push( {
									name: '',
									smooth: this.smooth
								} );

							}

							return lastMultiMaterial;

						}
					};

					// Inherit previous objects material.
					// Spec tells us that a declared material must be set to all objects until a new material is declared.
					// If a usemtl declaration is encountered while this new object is being parsed, it will
					// overwrite the inherited material. Exception being that there was already face declarations
					// to the inherited material, then it will be preserved for proper MultiMaterial continuation.

					if ( previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function' ) {

						var declared = previousMaterial.clone( 0 );
						declared.inherited = true;
						this.object.materials.push( declared );

					}

					this.objects.push( this.object );

				},

				finalize: function () {

					if ( this.object && typeof this.object._finalize === 'function' ) {

						this.object._finalize( true );

					}

				},

				parseVertexIndex: function ( value, len ) {

					var index = parseInt( value, 10 );
					return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

				},

				parseNormalIndex: function ( value, len ) {

					var index = parseInt( value, 10 );
					return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

				},

				parseUVIndex: function ( value, len ) {

					var index = parseInt( value, 10 );
					return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;

				},

				addVertex: function ( a, b, c ) {

					var src = this.vertices;
					var dst = this.object.geometry.vertices;

					dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
					dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
					dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

				},

				addVertexPoint: function ( a ) {

					var src = this.vertices;
					var dst = this.object.geometry.vertices;

					dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );

				},

				addVertexLine: function ( a ) {

					var src = this.vertices;
					var dst = this.object.geometry.vertices;

					dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );

				},

				addNormal: function ( a, b, c ) {

					var src = this.normals;
					var dst = this.object.geometry.normals;

					dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
					dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
					dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

				},

				addColor: function ( a, b, c ) {

					var src = this.colors;
					var dst = this.object.geometry.colors;

					dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
					dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
					dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

				},

				addUV: function ( a, b, c ) {

					var src = this.uvs;
					var dst = this.object.geometry.uvs;

					dst.push( src[ a + 0 ], src[ a + 1 ] );
					dst.push( src[ b + 0 ], src[ b + 1 ] );
					dst.push( src[ c + 0 ], src[ c + 1 ] );

				},

				addUVLine: function ( a ) {

					var src = this.uvs;
					var dst = this.object.geometry.uvs;

					dst.push( src[ a + 0 ], src[ a + 1 ] );

				},

				addFace: function ( a, b, c, ua, ub, uc, na, nb, nc ) {

					var vLen = this.vertices.length;

					var ia = this.parseVertexIndex( a, vLen );
					var ib = this.parseVertexIndex( b, vLen );
					var ic = this.parseVertexIndex( c, vLen );

					this.addVertex( ia, ib, ic );

					if ( this.colors.length > 0 ) {

						this.addColor( ia, ib, ic );

					}

					if ( ua !== undefined && ua !== '' ) {

						var uvLen = this.uvs.length;
						ia = this.parseUVIndex( ua, uvLen );
						ib = this.parseUVIndex( ub, uvLen );
						ic = this.parseUVIndex( uc, uvLen );
						this.addUV( ia, ib, ic );

					}

					if ( na !== undefined && na !== '' ) {

						// Normals are many times the same. If so, skip function call and parseInt.
						var nLen = this.normals.length;
						ia = this.parseNormalIndex( na, nLen );

						ib = na === nb ? ia : this.parseNormalIndex( nb, nLen );
						ic = na === nc ? ia : this.parseNormalIndex( nc, nLen );

						this.addNormal( ia, ib, ic );

					}

				},

				addPointGeometry: function ( vertices ) {

					this.object.geometry.type = 'Points';

					var vLen = this.vertices.length;

					for ( var vi = 0, l = vertices.length; vi < l; vi ++ ) {

						this.addVertexPoint( this.parseVertexIndex( vertices[ vi ], vLen ) );

					}

				},

				addLineGeometry: function ( vertices, uvs ) {

					this.object.geometry.type = 'Line';

					var vLen = this.vertices.length;
					var uvLen = this.uvs.length;

					for ( var vi = 0, l = vertices.length; vi < l; vi ++ ) {

						this.addVertexLine( this.parseVertexIndex( vertices[ vi ], vLen ) );

					}

					for ( var uvi = 0, l = uvs.length; uvi < l; uvi ++ ) {

						this.addUVLine( this.parseUVIndex( uvs[ uvi ], uvLen ) );

					}

				}

			};

			state.startObject( '', false );

			return state;

		}

		//

		function OBJLoader( manager ) {

			THREE.Loader.call( this, manager );

			this.materials = null;

		}

		OBJLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

			constructor: OBJLoader,

			load: function ( url, onLoad, onProgress, onError ) {

				var scope = this;

				var loader = new THREE.FileLoader( scope.manager );
				loader.setPath( this.path );
				loader.load( url, function ( text ) {

					onLoad( scope.parse( text ) );

				}, onProgress, onError );

			},

			setMaterials: function ( materials ) {

				this.materials = materials;

				return this;

			},

			parse: function ( text ) {

				var state = new ParserState();

				if ( text.indexOf( '\r\n' ) !== - 1 ) {

					// This is faster than String.split with regex that splits on both
					text = text.replace( /\r\n/g, '\n' );

				}

				if ( text.indexOf( '\\\n' ) !== - 1 ) {

					// join lines separated by a line continuation character (\)
					text = text.replace( /\\\n/g, '' );

				}

				var lines = text.split( '\n' );
				var line = '', lineFirstChar = '';
				var lineLength = 0;
				var result = [];

				// Faster to just trim left side of the line. Use if available.
				var trimLeft = ( typeof ''.trimLeft === 'function' );

				for ( var i = 0, l = lines.length; i < l; i ++ ) {

					line = lines[ i ];

					line = trimLeft ? line.trimLeft() : line.trim();

					lineLength = line.length;

					if ( lineLength === 0 ) continue;

					lineFirstChar = line.charAt( 0 );

					// @todo invoke passed in handler if any
					if ( lineFirstChar === '#' ) continue;

					if ( lineFirstChar === 'v' ) {

						var data = line.split( /\s+/ );

						switch ( data[ 0 ] ) {

							case 'v':
								state.vertices.push(
									parseFloat( data[ 1 ] ),
									parseFloat( data[ 2 ] ),
									parseFloat( data[ 3 ] )
								);
								if ( data.length >= 7 ) {

									state.colors.push(
										parseFloat( data[ 4 ] ),
										parseFloat( data[ 5 ] ),
										parseFloat( data[ 6 ] )

									);

								}
								break;
							case 'vn':
								state.normals.push(
									parseFloat( data[ 1 ] ),
									parseFloat( data[ 2 ] ),
									parseFloat( data[ 3 ] )
								);
								break;
							case 'vt':
								state.uvs.push(
									parseFloat( data[ 1 ] ),
									parseFloat( data[ 2 ] )
								);
								break;

						}

					} else if ( lineFirstChar === 'f' ) {

						var lineData = line.substr( 1 ).trim();
						var vertexData = lineData.split( /\s+/ );
						var faceVertices = [];

						// Parse the face vertex data into an easy to work with format

						for ( var j = 0, jl = vertexData.length; j < jl; j ++ ) {

							var vertex = vertexData[ j ];

							if ( vertex.length > 0 ) {

								var vertexParts = vertex.split( '/' );
								faceVertices.push( vertexParts );

							}

						}

						// Draw an edge between the first vertex and all subsequent vertices to form an n-gon

						var v1 = faceVertices[ 0 ];

						for ( var j = 1, jl = faceVertices.length - 1; j < jl; j ++ ) {

							var v2 = faceVertices[ j ];
							var v3 = faceVertices[ j + 1 ];

							state.addFace(
								v1[ 0 ], v2[ 0 ], v3[ 0 ],
								v1[ 1 ], v2[ 1 ], v3[ 1 ],
								v1[ 2 ], v2[ 2 ], v3[ 2 ]
							);

						}

					} else if ( lineFirstChar === 'l' ) {

						var lineParts = line.substring( 1 ).trim().split( " " );
						var lineVertices = [], lineUVs = [];

						if ( line.indexOf( "/" ) === - 1 ) {

							lineVertices = lineParts;

						} else {

							for ( var li = 0, llen = lineParts.length; li < llen; li ++ ) {

								var parts = lineParts[ li ].split( "/" );

								if ( parts[ 0 ] !== "" ) lineVertices.push( parts[ 0 ] );
								if ( parts[ 1 ] !== "" ) lineUVs.push( parts[ 1 ] );

							}

						}
						state.addLineGeometry( lineVertices, lineUVs );

					} else if ( lineFirstChar === 'p' ) {

						var lineData = line.substr( 1 ).trim();
						var pointData = lineData.split( " " );

						state.addPointGeometry( pointData );

					} else if ( ( result = object_pattern.exec( line ) ) !== null ) {

						// o object_name
						// or
						// g group_name

						// WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
						// var name = result[ 0 ].substr( 1 ).trim();
						var name = ( " " + result[ 0 ].substr( 1 ).trim() ).substr( 1 );

						state.startObject( name );

					} else if ( material_use_pattern.test( line ) ) {

						// material

						state.object.startMaterial( line.substring( 7 ).trim(), state.materialLibraries );

					} else if ( material_library_pattern.test( line ) ) {

						// mtl file

						state.materialLibraries.push( line.substring( 7 ).trim() );

					} else if ( map_use_pattern.test( line ) ) {

						// the line is parsed but ignored since the loader assumes textures are defined MTL files
						// (according to https://www.okino.com/conv/imp_wave.htm, 'usemap' is the old-style Wavefront texture reference method)

						console.warn( 'THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.' );

					} else if ( lineFirstChar === 's' ) {

						result = line.split( ' ' );

						// smooth shading

						// @todo Handle files that have varying smooth values for a set of faces inside one geometry,
						// but does not define a usemtl for each face set.
						// This should be detected and a dummy material created (later MultiMaterial and geometry groups).
						// This requires some care to not create extra material on each smooth value for "normal" obj files.
						// where explicit usemtl defines geometry groups.
						// Example asset: examples/models/obj/cerberus/Cerberus.obj

						/*
						 * http://paulbourke.net/dataformats/obj/
						 * or
						 * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
						 *
						 * From chapter "Grouping" Syntax explanation "s group_number":
						 * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
						 * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
						 * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
						 * than 0."
						 */
						if ( result.length > 1 ) {

							var value = result[ 1 ].trim().toLowerCase();
							state.object.smooth = ( value !== '0' && value !== 'off' );

						} else {

							// ZBrush can produce "s" lines #11707
							state.object.smooth = true;

						}
						var material = state.object.currentMaterial();
						if ( material ) material.smooth = state.object.smooth;

					} else {

						// Handle null terminated files without exception
						if ( line === '\0' ) continue;

						console.warn( 'THREE.OBJLoader: Unexpected line: "' + line + '"' );

					}

				}

				state.finalize();

				var container = new THREE.Group();
				container.materialLibraries = [].concat( state.materialLibraries );

				for ( var i = 0, l = state.objects.length; i < l; i ++ ) {

					var object = state.objects[ i ];
					var geometry = object.geometry;
					var materials = object.materials;
					var isLine = ( geometry.type === 'Line' );
					var isPoints = ( geometry.type === 'Points' );
					var hasVertexColors = false;

					// Skip o/g line declarations that did not follow with any faces
					if ( geometry.vertices.length === 0 ) continue;

					var buffergeometry = new THREE.BufferGeometry();

					buffergeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( geometry.vertices, 3 ) );

					if ( geometry.normals.length > 0 ) {

						buffergeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( geometry.normals, 3 ) );

					} else {

						buffergeometry.computeVertexNormals();

					}

					if ( geometry.colors.length > 0 ) {

						hasVertexColors = true;
						buffergeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( geometry.colors, 3 ) );

					}

					if ( geometry.uvs.length > 0 ) {

						buffergeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( geometry.uvs, 2 ) );

					}

					// Create materials

					var createdMaterials = [];

					for ( var mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {

						var sourceMaterial = materials[ mi ];
						var materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
						var material = state.materials[ materialHash ];

						if ( this.materials !== null ) {

							material = this.materials.create( sourceMaterial.name );

							// mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
							if ( isLine && material && ! ( material instanceof THREE.LineBasicMaterial ) ) {

								var materialLine = new THREE.LineBasicMaterial();
								THREE.Material.prototype.copy.call( materialLine, material );
								materialLine.color.copy( material.color );
								material = materialLine;

							} else if ( isPoints && material && ! ( material instanceof THREE.PointsMaterial ) ) {

								var materialPoints = new THREE.PointsMaterial( { size: 10, sizeAttenuation: false } );
								THREE.Material.prototype.copy.call( materialPoints, material );
								materialPoints.color.copy( material.color );
								materialPoints.map = material.map;
								material = materialPoints;

							}

						}

						if ( material === undefined ) {

							if ( isLine ) {

								material = new THREE.LineBasicMaterial();

							} else if ( isPoints ) {

								material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );

							} else {

								material = new THREE.MeshPhongMaterial();

							}

							material.name = sourceMaterial.name;
							material.flatShading = sourceMaterial.smooth ? false : true;
							material.vertexColors = hasVertexColors;

							state.materials[ materialHash ] = material;

						}

						createdMaterials.push( material );

					}

					// Create mesh

					var mesh;

					if ( createdMaterials.length > 1 ) {

						for ( var mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {

							var sourceMaterial = materials[ mi ];
							buffergeometry.addGroup( sourceMaterial.groupStart, sourceMaterial.groupCount, mi );

						}

						if ( isLine ) {

							mesh = new THREE.LineSegments( buffergeometry, createdMaterials );

						} else if ( isPoints ) {

							mesh = new THREE.Points( buffergeometry, createdMaterials );

						} else {

							mesh = new THREE.Mesh( buffergeometry, createdMaterials );

						}

					} else {

						if ( isLine ) {

							mesh = new THREE.LineSegments( buffergeometry, createdMaterials[ 0 ] );

						} else if ( isPoints ) {

							mesh = new THREE.Points( buffergeometry, createdMaterials[ 0 ] );

						} else {

							mesh = new THREE.Mesh( buffergeometry, createdMaterials[ 0 ] );

						}

					}

					mesh.name = object.name;

					container.add( mesh );

				}

				return container;

			}

		} );

		return OBJLoader;

	} )();
	
	return THREE.OBJLoader;
});

define('skylark-threejs-ex/loaders/PCDLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Filipe Caixeta / http://filipecaixeta.com.br
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Description: A THREE loader for PCD ascii and binary files.
	 */

	THREE.PCDLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		this.littleEndian = true;

	};


	THREE.PCDLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.PCDLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( data ) {

				try {

					onLoad( scope.parse( data, url ) );

				} catch ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						throw e;

					}

				}

			}, onProgress, onError );

		},

		parse: function ( data, url ) {

			// from https://gitlab.com/taketwo/three-pcd-loader/blob/master/decompress-lzf.js

			function decompressLZF( inData, outLength ) {

				var inLength = inData.length;
				var outData = new Uint8Array( outLength );
				var inPtr = 0;
				var outPtr = 0;
				var ctrl;
				var len;
				var ref;
				do {

					ctrl = inData[ inPtr ++ ];
					if ( ctrl < ( 1 << 5 ) ) {

						ctrl ++;
						if ( outPtr + ctrl > outLength ) throw new Error( 'Output buffer is not large enough' );
						if ( inPtr + ctrl > inLength ) throw new Error( 'Invalid compressed data' );
						do {

							outData[ outPtr ++ ] = inData[ inPtr ++ ];

						} while ( -- ctrl );

					} else {

						len = ctrl >> 5;
						ref = outPtr - ( ( ctrl & 0x1f ) << 8 ) - 1;
						if ( inPtr >= inLength ) throw new Error( 'Invalid compressed data' );
						if ( len === 7 ) {

							len += inData[ inPtr ++ ];
							if ( inPtr >= inLength ) throw new Error( 'Invalid compressed data' );

						}
						ref -= inData[ inPtr ++ ];
						if ( outPtr + len + 2 > outLength ) throw new Error( 'Output buffer is not large enough' );
						if ( ref < 0 ) throw new Error( 'Invalid compressed data' );
						if ( ref >= outPtr ) throw new Error( 'Invalid compressed data' );
						do {

							outData[ outPtr ++ ] = outData[ ref ++ ];

						} while ( -- len + 2 );

					}

				} while ( inPtr < inLength );

				return outData;

			}

			function parseHeader( data ) {

				var PCDheader = {};
				var result1 = data.search( /[\r\n]DATA\s(\S*)\s/i );
				var result2 = /[\r\n]DATA\s(\S*)\s/i.exec( data.substr( result1 - 1 ) );

				PCDheader.data = result2[ 1 ];
				PCDheader.headerLen = result2[ 0 ].length + result1;
				PCDheader.str = data.substr( 0, PCDheader.headerLen );

				// remove comments

				PCDheader.str = PCDheader.str.replace( /\#.*/gi, '' );

				// parse

				PCDheader.version = /VERSION (.*)/i.exec( PCDheader.str );
				PCDheader.fields = /FIELDS (.*)/i.exec( PCDheader.str );
				PCDheader.size = /SIZE (.*)/i.exec( PCDheader.str );
				PCDheader.type = /TYPE (.*)/i.exec( PCDheader.str );
				PCDheader.count = /COUNT (.*)/i.exec( PCDheader.str );
				PCDheader.width = /WIDTH (.*)/i.exec( PCDheader.str );
				PCDheader.height = /HEIGHT (.*)/i.exec( PCDheader.str );
				PCDheader.viewpoint = /VIEWPOINT (.*)/i.exec( PCDheader.str );
				PCDheader.points = /POINTS (.*)/i.exec( PCDheader.str );

				// evaluate

				if ( PCDheader.version !== null )
					PCDheader.version = parseFloat( PCDheader.version[ 1 ] );

				if ( PCDheader.fields !== null )
					PCDheader.fields = PCDheader.fields[ 1 ].split( ' ' );

				if ( PCDheader.type !== null )
					PCDheader.type = PCDheader.type[ 1 ].split( ' ' );

				if ( PCDheader.width !== null )
					PCDheader.width = parseInt( PCDheader.width[ 1 ] );

				if ( PCDheader.height !== null )
					PCDheader.height = parseInt( PCDheader.height[ 1 ] );

				if ( PCDheader.viewpoint !== null )
					PCDheader.viewpoint = PCDheader.viewpoint[ 1 ];

				if ( PCDheader.points !== null )
					PCDheader.points = parseInt( PCDheader.points[ 1 ], 10 );

				if ( PCDheader.points === null )
					PCDheader.points = PCDheader.width * PCDheader.height;

				if ( PCDheader.size !== null ) {

					PCDheader.size = PCDheader.size[ 1 ].split( ' ' ).map( function ( x ) {

						return parseInt( x, 10 );

					} );

				}

				if ( PCDheader.count !== null ) {

					PCDheader.count = PCDheader.count[ 1 ].split( ' ' ).map( function ( x ) {

						return parseInt( x, 10 );

					} );

				} else {

					PCDheader.count = [];

					for ( var i = 0, l = PCDheader.fields.length; i < l; i ++ ) {

						PCDheader.count.push( 1 );

					}

				}

				PCDheader.offset = {};

				var sizeSum = 0;

				for ( var i = 0, l = PCDheader.fields.length; i < l; i ++ ) {

					if ( PCDheader.data === 'ascii' ) {

						PCDheader.offset[ PCDheader.fields[ i ] ] = i;

					} else {

						PCDheader.offset[ PCDheader.fields[ i ] ] = sizeSum;
						sizeSum += PCDheader.size[ i ];

					}

				}

				// for binary only

				PCDheader.rowSize = sizeSum;

				return PCDheader;

			}

			var textData = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );

			// parse header (always ascii format)

			var PCDheader = parseHeader( textData );

			// parse data

			var position = [];
			var normal = [];
			var color = [];

			// ascii

			if ( PCDheader.data === 'ascii' ) {

				var offset = PCDheader.offset;
				var pcdData = textData.substr( PCDheader.headerLen );
				var lines = pcdData.split( '\n' );

				for ( var i = 0, l = lines.length; i < l; i ++ ) {

					if ( lines[ i ] === '' ) continue;

					var line = lines[ i ].split( ' ' );

					if ( offset.x !== undefined ) {

						position.push( parseFloat( line[ offset.x ] ) );
						position.push( parseFloat( line[ offset.y ] ) );
						position.push( parseFloat( line[ offset.z ] ) );

					}

					if ( offset.rgb !== undefined ) {

						var rgb = parseFloat( line[ offset.rgb ] );
						var r = ( rgb >> 16 ) & 0x0000ff;
						var g = ( rgb >> 8 ) & 0x0000ff;
						var b = ( rgb >> 0 ) & 0x0000ff;
						color.push( r / 255, g / 255, b / 255 );

					}

					if ( offset.normal_x !== undefined ) {

						normal.push( parseFloat( line[ offset.normal_x ] ) );
						normal.push( parseFloat( line[ offset.normal_y ] ) );
						normal.push( parseFloat( line[ offset.normal_z ] ) );

					}

				}

			}

			// binary-compressed

			// normally data in PCD files are organized as array of structures: XYZRGBXYZRGB
			// binary compressed PCD files organize their data as structure of arrays: XXYYZZRGBRGB
			// that requires a totally different parsing approach compared to non-compressed data

			if ( PCDheader.data === 'binary_compressed' ) {

				var sizes = new Uint32Array( data.slice( PCDheader.headerLen, PCDheader.headerLen + 8 ) );
				var compressedSize = sizes[ 0 ];
				var decompressedSize = sizes[ 1 ];
				var decompressed = decompressLZF( new Uint8Array( data, PCDheader.headerLen + 8, compressedSize ), decompressedSize );
				var dataview = new DataView( decompressed.buffer );

				var offset = PCDheader.offset;

				for ( var i = 0; i < PCDheader.points; i ++ ) {

					if ( offset.x !== undefined ) {

						position.push( dataview.getFloat32( ( PCDheader.points * offset.x ) + PCDheader.size[ 0 ] * i, this.littleEndian ) );
						position.push( dataview.getFloat32( ( PCDheader.points * offset.y ) + PCDheader.size[ 1 ] * i, this.littleEndian ) );
						position.push( dataview.getFloat32( ( PCDheader.points * offset.z ) + PCDheader.size[ 2 ] * i, this.littleEndian ) );

					}

					if ( offset.rgb !== undefined ) {

						color.push( dataview.getUint8( ( PCDheader.points * offset.rgb ) + PCDheader.size[ 3 ] * i + 0 ) / 255.0 );
						color.push( dataview.getUint8( ( PCDheader.points * offset.rgb ) + PCDheader.size[ 3 ] * i + 1 ) / 255.0 );
						color.push( dataview.getUint8( ( PCDheader.points * offset.rgb ) + PCDheader.size[ 3 ] * i + 2 ) / 255.0 );

					}

					if ( offset.normal_x !== undefined ) {

						normal.push( dataview.getFloat32( ( PCDheader.points * offset.normal_x ) + PCDheader.size[ 4 ] * i, this.littleEndian ) );
						normal.push( dataview.getFloat32( ( PCDheader.points * offset.normal_y ) + PCDheader.size[ 5 ] * i, this.littleEndian ) );
						normal.push( dataview.getFloat32( ( PCDheader.points * offset.normal_z ) + PCDheader.size[ 6 ] * i, this.littleEndian ) );

					}

				}

			}

			// binary

			if ( PCDheader.data === 'binary' ) {

				var dataview = new DataView( data, PCDheader.headerLen );
				var offset = PCDheader.offset;

				for ( var i = 0, row = 0; i < PCDheader.points; i ++, row += PCDheader.rowSize ) {

					if ( offset.x !== undefined ) {

						position.push( dataview.getFloat32( row + offset.x, this.littleEndian ) );
						position.push( dataview.getFloat32( row + offset.y, this.littleEndian ) );
						position.push( dataview.getFloat32( row + offset.z, this.littleEndian ) );

					}

					if ( offset.rgb !== undefined ) {

						color.push( dataview.getUint8( row + offset.rgb + 2 ) / 255.0 );
						color.push( dataview.getUint8( row + offset.rgb + 1 ) / 255.0 );
						color.push( dataview.getUint8( row + offset.rgb + 0 ) / 255.0 );

					}

					if ( offset.normal_x !== undefined ) {

						normal.push( dataview.getFloat32( row + offset.normal_x, this.littleEndian ) );
						normal.push( dataview.getFloat32( row + offset.normal_y, this.littleEndian ) );
						normal.push( dataview.getFloat32( row + offset.normal_z, this.littleEndian ) );

					}

				}

			}

			// build geometry

			var geometry = new THREE.BufferGeometry();

			if ( position.length > 0 ) geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
			if ( normal.length > 0 ) geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normal, 3 ) );
			if ( color.length > 0 ) geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( color, 3 ) );

			geometry.computeBoundingSphere();

			// build material

			var material = new THREE.PointsMaterial( { size: 0.005 } );

			if ( color.length > 0 ) {

				material.vertexColors = true;

			} else {

				material.color.setHex( Math.random() * 0xffffff );

			}

			// build point cloud

			var mesh = new THREE.Points( geometry, material );
			var name = url.split( '' ).reverse().join( '' );
			name = /([^\/]*)/.exec( name );
			name = name[ 1 ].split( '' ).reverse().join( '' );
			mesh.name = name;

			return mesh;

		}

	} );
	
	return THREE.PCDLoader;
});

define('skylark-threejs-ex/loaders/PLYLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Wei Meng / http://about.me/menway
	 *
	 * Description: A THREE loader for PLY ASCII files (known as the Polygon
	 * File Format or the Stanford Triangle Format).
	 *
	 * Limitations: ASCII decoding assumes file is UTF-8.
	 *
	 * Usage:
	 *	var loader = new THREE.PLYLoader();
	 *	loader.load('./models/ply/ascii/dolphins.ply', function (geometry) {
	 *
	 *		scene.add( new THREE.Mesh( geometry ) );
	 *
	 *	} );
	 *
	 * If the PLY file uses non standard property names, they can be mapped while
	 * loading. For example, the following maps the properties
	 * “diffuse_(red|green|blue)” in the file to standard color names.
	 *
	 * loader.setPropertyNameMapping( {
	 *	diffuse_red: 'red',
	 *	diffuse_green: 'green',
	 *	diffuse_blue: 'blue'
	 * } );
	 *
	 */


	THREE.PLYLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		this.propertyNameMapping = {};

	};

	THREE.PLYLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.PLYLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text ) );

			}, onProgress, onError );

		},

		setPropertyNameMapping: function ( mapping ) {

			this.propertyNameMapping = mapping;

		},

		parse: function ( data ) {

			function parseHeader( data ) {

				var patternHeader = /ply([\s\S]*)end_header\r?\n/;
				var headerText = '';
				var headerLength = 0;
				var result = patternHeader.exec( data );

				if ( result !== null ) {

					headerText = result[ 1 ];
					headerLength = result[ 0 ].length;

				}

				var header = {
					comments: [],
					elements: [],
					headerLength: headerLength
				};

				var lines = headerText.split( '\n' );
				var currentElement;
				var lineType, lineValues;

				function make_ply_element_property( propertValues, propertyNameMapping ) {

					var property = { type: propertValues[ 0 ] };

					if ( property.type === 'list' ) {

						property.name = propertValues[ 3 ];
						property.countType = propertValues[ 1 ];
						property.itemType = propertValues[ 2 ];

					} else {

						property.name = propertValues[ 1 ];

					}

					if ( property.name in propertyNameMapping ) {

						property.name = propertyNameMapping[ property.name ];

					}

					return property;

				}

				for ( var i = 0; i < lines.length; i ++ ) {

					var line = lines[ i ];
					line = line.trim();

					if ( line === '' ) continue;

					lineValues = line.split( /\s+/ );
					lineType = lineValues.shift();
					line = lineValues.join( ' ' );

					switch ( lineType ) {

						case 'format':

							header.format = lineValues[ 0 ];
							header.version = lineValues[ 1 ];

							break;

						case 'comment':

							header.comments.push( line );

							break;

						case 'element':

							if ( currentElement !== undefined ) {

								header.elements.push( currentElement );

							}

							currentElement = {};
							currentElement.name = lineValues[ 0 ];
							currentElement.count = parseInt( lineValues[ 1 ] );
							currentElement.properties = [];

							break;

						case 'property':

							currentElement.properties.push( make_ply_element_property( lineValues, scope.propertyNameMapping ) );

							break;


						default:

							console.log( 'unhandled', lineType, lineValues );

					}

				}

				if ( currentElement !== undefined ) {

					header.elements.push( currentElement );

				}

				return header;

			}

			function parseASCIINumber( n, type ) {

				switch ( type ) {

					case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
					case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

						return parseInt( n );

					case 'float': case 'double': case 'float32': case 'float64':

						return parseFloat( n );

				}

			}

			function parseASCIIElement( properties, line ) {

				var values = line.split( /\s+/ );

				var element = {};

				for ( var i = 0; i < properties.length; i ++ ) {

					if ( properties[ i ].type === 'list' ) {

						var list = [];
						var n = parseASCIINumber( values.shift(), properties[ i ].countType );

						for ( var j = 0; j < n; j ++ ) {

							list.push( parseASCIINumber( values.shift(), properties[ i ].itemType ) );

						}

						element[ properties[ i ].name ] = list;

					} else {

						element[ properties[ i ].name ] = parseASCIINumber( values.shift(), properties[ i ].type );

					}

				}

				return element;

			}

			function parseASCII( data, header ) {

				// PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

				var buffer = {
					indices: [],
					vertices: [],
					normals: [],
					uvs: [],
					faceVertexUvs: [],
					colors: []
				};

				var result;

				var patternBody = /end_header\s([\s\S]*)$/;
				var body = '';
				if ( ( result = patternBody.exec( data ) ) !== null ) {

					body = result[ 1 ];

				}

				var lines = body.split( '\n' );
				var currentElement = 0;
				var currentElementCount = 0;

				for ( var i = 0; i < lines.length; i ++ ) {

					var line = lines[ i ];
					line = line.trim();
					if ( line === '' ) {

						continue;

					}

					if ( currentElementCount >= header.elements[ currentElement ].count ) {

						currentElement ++;
						currentElementCount = 0;

					}

					var element = parseASCIIElement( header.elements[ currentElement ].properties, line );

					handleElement( buffer, header.elements[ currentElement ].name, element );

					currentElementCount ++;

				}

				return postProcess( buffer );

			}

			function postProcess( buffer ) {

				var geometry = new THREE.BufferGeometry();

				// mandatory buffer data

				if ( buffer.indices.length > 0 ) {

					geometry.setIndex( buffer.indices );

				}

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( buffer.vertices, 3 ) );

				// optional buffer data

				if ( buffer.normals.length > 0 ) {

					geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( buffer.normals, 3 ) );

				}

				if ( buffer.uvs.length > 0 ) {

					geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( buffer.uvs, 2 ) );

				}

				if ( buffer.colors.length > 0 ) {

					geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( buffer.colors, 3 ) );

				}

				if ( buffer.faceVertexUvs.length > 0 ) {

					geometry = geometry.toNonIndexed();
					geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( buffer.faceVertexUvs, 2 ) );

				}

				geometry.computeBoundingSphere();

				return geometry;

			}

			function handleElement( buffer, elementName, element ) {

				if ( elementName === 'vertex' ) {

					buffer.vertices.push( element.x, element.y, element.z );

					if ( 'nx' in element && 'ny' in element && 'nz' in element ) {

						buffer.normals.push( element.nx, element.ny, element.nz );

					}

					if ( 's' in element && 't' in element ) {

						buffer.uvs.push( element.s, element.t );

					}

					if ( 'red' in element && 'green' in element && 'blue' in element ) {

						buffer.colors.push( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );

					}

				} else if ( elementName === 'face' ) {

					var vertex_indices = element.vertex_indices || element.vertex_index; // issue #9338
					var texcoord = element.texcoord;

					if ( vertex_indices.length === 3 ) {

						buffer.indices.push( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 2 ] );

						if ( texcoord && texcoord.length === 6 ) {

							buffer.faceVertexUvs.push( texcoord[ 0 ], texcoord[ 1 ] );
							buffer.faceVertexUvs.push( texcoord[ 2 ], texcoord[ 3 ] );
							buffer.faceVertexUvs.push( texcoord[ 4 ], texcoord[ 5 ] );

						}

					} else if ( vertex_indices.length === 4 ) {

						buffer.indices.push( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 3 ] );
						buffer.indices.push( vertex_indices[ 1 ], vertex_indices[ 2 ], vertex_indices[ 3 ] );

					}

				}

			}

			function binaryRead( dataview, at, type, little_endian ) {

				switch ( type ) {

					// corespondences for non-specific length types here match rply:
					case 'int8':		case 'char':	 return [ dataview.getInt8( at ), 1 ];
					case 'uint8':		case 'uchar':	 return [ dataview.getUint8( at ), 1 ];
					case 'int16':		case 'short':	 return [ dataview.getInt16( at, little_endian ), 2 ];
					case 'uint16':	case 'ushort': return [ dataview.getUint16( at, little_endian ), 2 ];
					case 'int32':		case 'int':		 return [ dataview.getInt32( at, little_endian ), 4 ];
					case 'uint32':	case 'uint':	 return [ dataview.getUint32( at, little_endian ), 4 ];
					case 'float32': case 'float':	 return [ dataview.getFloat32( at, little_endian ), 4 ];
					case 'float64': case 'double': return [ dataview.getFloat64( at, little_endian ), 8 ];

				}

			}

			function binaryReadElement( dataview, at, properties, little_endian ) {

				var element = {};
				var result, read = 0;

				for ( var i = 0; i < properties.length; i ++ ) {

					if ( properties[ i ].type === 'list' ) {

						var list = [];

						result = binaryRead( dataview, at + read, properties[ i ].countType, little_endian );
						var n = result[ 0 ];
						read += result[ 1 ];

						for ( var j = 0; j < n; j ++ ) {

							result = binaryRead( dataview, at + read, properties[ i ].itemType, little_endian );
							list.push( result[ 0 ] );
							read += result[ 1 ];

						}

						element[ properties[ i ].name ] = list;

					} else {

						result = binaryRead( dataview, at + read, properties[ i ].type, little_endian );
						element[ properties[ i ].name ] = result[ 0 ];
						read += result[ 1 ];

					}

				}

				return [ element, read ];

			}

			function parseBinary( data, header ) {

				var buffer = {
					indices: [],
					vertices: [],
					normals: [],
					uvs: [],
					faceVertexUvs: [],
					colors: []
				};

				var little_endian = ( header.format === 'binary_little_endian' );
				var body = new DataView( data, header.headerLength );
				var result, loc = 0;

				for ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {

					for ( var currentElementCount = 0; currentElementCount < header.elements[ currentElement ].count; currentElementCount ++ ) {

						result = binaryReadElement( body, loc, header.elements[ currentElement ].properties, little_endian );
						loc += result[ 1 ];
						var element = result[ 0 ];

						handleElement( buffer, header.elements[ currentElement ].name, element );

					}

				}

				return postProcess( buffer );

			}

			//

			var geometry;
			var scope = this;

			if ( data instanceof ArrayBuffer ) {

				var text = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );
				var header = parseHeader( text );

				geometry = header.format === 'ascii' ? parseASCII( text, header ) : parseBinary( data, header );

			} else {

				geometry = parseASCII( data, parseHeader( data ) );

			}

			return geometry;

		}

	} );
	
	return THREE.PLYLoader;
});

define('skylark-threejs-ex/loaders/PRWMLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Kevin Chapelier / https://github.com/kchapelier
	 * See https://github.com/kchapelier/PRWM for more informations about this file format
	 */

	THREE.PRWMLoader = ( function () {

		var bigEndianPlatform = null;

		/**
		 * Check if the endianness of the platform is big-endian (most significant bit first)
		 * @returns {boolean} True if big-endian, false if little-endian
		 */
		function isBigEndianPlatform() {

			if ( bigEndianPlatform === null ) {

				var buffer = new ArrayBuffer( 2 ),
					uint8Array = new Uint8Array( buffer ),
					uint16Array = new Uint16Array( buffer );

				uint8Array[ 0 ] = 0xAA; // set first byte
				uint8Array[ 1 ] = 0xBB; // set second byte
				bigEndianPlatform = ( uint16Array[ 0 ] === 0xAABB );

			}

			return bigEndianPlatform;

		}

		// match the values defined in the spec to the TypedArray types
		var InvertedEncodingTypes = [
			null,
			Float32Array,
			null,
			Int8Array,
			Int16Array,
			null,
			Int32Array,
			Uint8Array,
			Uint16Array,
			null,
			Uint32Array
		];

		// define the method to use on a DataView, corresponding the TypedArray type
		var getMethods = {
			Uint16Array: 'getUint16',
			Uint32Array: 'getUint32',
			Int16Array: 'getInt16',
			Int32Array: 'getInt32',
			Float32Array: 'getFloat32',
			Float64Array: 'getFloat64'
		};


		function copyFromBuffer( sourceArrayBuffer, viewType, position, length, fromBigEndian ) {

			var bytesPerElement = viewType.BYTES_PER_ELEMENT,
				result;

			if ( fromBigEndian === isBigEndianPlatform() || bytesPerElement === 1 ) {

				result = new viewType( sourceArrayBuffer, position, length );

			} else {

				var readView = new DataView( sourceArrayBuffer, position, length * bytesPerElement ),
					getMethod = getMethods[ viewType.name ],
					littleEndian = ! fromBigEndian,
					i = 0;

				result = new viewType( length );

				for ( ; i < length; i ++ ) {

					result[ i ] = readView[ getMethod ]( i * bytesPerElement, littleEndian );

				}

			}

			return result;

		}


		function decodePrwm( buffer ) {

			var array = new Uint8Array( buffer ),
				version = array[ 0 ],
				flags = array[ 1 ],
				indexedGeometry = !! ( flags >> 7 & 0x01 ),
				indicesType = flags >> 6 & 0x01,
				bigEndian = ( flags >> 5 & 0x01 ) === 1,
				attributesNumber = flags & 0x1F,
				valuesNumber = 0,
				indicesNumber = 0;

			if ( bigEndian ) {

				valuesNumber = ( array[ 2 ] << 16 ) + ( array[ 3 ] << 8 ) + array[ 4 ];
				indicesNumber = ( array[ 5 ] << 16 ) + ( array[ 6 ] << 8 ) + array[ 7 ];

			} else {

				valuesNumber = array[ 2 ] + ( array[ 3 ] << 8 ) + ( array[ 4 ] << 16 );
				indicesNumber = array[ 5 ] + ( array[ 6 ] << 8 ) + ( array[ 7 ] << 16 );

			}

			/** PRELIMINARY CHECKS **/

			if ( version === 0 ) {

				throw new Error( 'PRWM decoder: Invalid format version: 0' );

			} else if ( version !== 1 ) {

				throw new Error( 'PRWM decoder: Unsupported format version: ' + version );

			}

			if ( ! indexedGeometry ) {

				if ( indicesType !== 0 ) {

					throw new Error( 'PRWM decoder: Indices type must be set to 0 for non-indexed geometries' );

				} else if ( indicesNumber !== 0 ) {

					throw new Error( 'PRWM decoder: Number of indices must be set to 0 for non-indexed geometries' );

				}

			}

			/** PARSING **/

			var pos = 8;

			var attributes = {},
				attributeName,
				char,
				attributeType,
				cardinality,
				encodingType,
				arrayType,
				values,
				indices,
				i;

			for ( i = 0; i < attributesNumber; i ++ ) {

				attributeName = '';

				while ( pos < array.length ) {

					char = array[ pos ];
					pos ++;

					if ( char === 0 ) {

						break;

					} else {

						attributeName += String.fromCharCode( char );

					}

				}

				flags = array[ pos ];

				attributeType = flags >> 7 & 0x01;
				cardinality = ( flags >> 4 & 0x03 ) + 1;
				encodingType = flags & 0x0F;
				arrayType = InvertedEncodingTypes[ encodingType ];

				pos ++;

				// padding to next multiple of 4
				pos = Math.ceil( pos / 4 ) * 4;

				values = copyFromBuffer( buffer, arrayType, pos, cardinality * valuesNumber, bigEndian );

				pos += arrayType.BYTES_PER_ELEMENT * cardinality * valuesNumber;

				attributes[ attributeName ] = {
					type: attributeType,
					cardinality: cardinality,
					values: values
				};

			}

			pos = Math.ceil( pos / 4 ) * 4;

			indices = null;

			if ( indexedGeometry ) {

				indices = copyFromBuffer(
					buffer,
					indicesType === 1 ? Uint32Array : Uint16Array,
					pos,
					indicesNumber,
					bigEndian
				);

			}

			return {
				version: version,
				attributes: attributes,
				indices: indices
			};

		}

		// Define the public interface

		function PRWMLoader( manager ) {

			THREE.Loader.call( this, manager );

		}

		PRWMLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

			constructor: PRWMLoader,

			load: function ( url, onLoad, onProgress, onError ) {

				var scope = this;

				var loader = new THREE.FileLoader( scope.manager );
				loader.setPath( scope.path );
				loader.setResponseType( 'arraybuffer' );

				url = url.replace( /\*/g, isBigEndianPlatform() ? 'be' : 'le' );

				loader.load( url, function ( arrayBuffer ) {

					onLoad( scope.parse( arrayBuffer ) );

				}, onProgress, onError );

			},

			parse: function ( arrayBuffer ) {

				var data = decodePrwm( arrayBuffer ),
					attributesKey = Object.keys( data.attributes ),
					bufferGeometry = new THREE.BufferGeometry(),
					attribute,
					i;

				for ( i = 0; i < attributesKey.length; i ++ ) {

					attribute = data.attributes[ attributesKey[ i ] ];
					bufferGeometry.setAttribute( attributesKey[ i ], new THREE.BufferAttribute( attribute.values, attribute.cardinality, attribute.normalized ) );

				}

				if ( data.indices !== null ) {

					bufferGeometry.setIndex( new THREE.BufferAttribute( data.indices, 1 ) );

				}

				return bufferGeometry;

			}

		} );

		PRWMLoader.isBigEndianPlatform = function () {

			return isBigEndianPlatform();

		};

		return PRWMLoader;

	} )();
	
	return THREE.PRWMLoader;
});

define('skylark-threejs-ex/loaders/STLLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author aleeper / http://adamleeper.com/
	 * @author mrdoob / http://mrdoob.com/
	 * @author gero3 / https://github.com/gero3
	 * @author Mugen87 / https://github.com/Mugen87
	 * @author neverhood311 / https://github.com/neverhood311
	 *
	 * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
	 *
	 * Supports both binary and ASCII encoded files, with automatic detection of type.
	 *
	 * The loader returns a non-indexed buffer geometry.
	 *
	 * Limitations:
	 *  Binary decoding supports "Magics" color format (http://en.wikipedia.org/wiki/STL_(file_format)#Color_in_binary_STL).
	 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
	 *  ASCII decoding assumes file is UTF-8.
	 *
	 * Usage:
	 *  var loader = new THREE.STLLoader();
	 *  loader.load( './models/stl/slotted_disk.stl', function ( geometry ) {
	 *    scene.add( new THREE.Mesh( geometry ) );
	 *  });
	 *
	 * For binary STLs geometry might contain colors for vertices. To use it:
	 *  // use the same code to load STL as above
	 *  if (geometry.hasColors) {
	 *    material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: true });
	 *  } else { .... }
	 *  var mesh = new THREE.Mesh( geometry, material );
	 *
	 * For ASCII STLs containing multiple solids, each solid is assigned to a different group.
	 * Groups can be used to assign a different color by defining an array of materials with the same length of
	 * geometry.groups and passing it to the Mesh constructor:
	 *
	 * var mesh = new THREE.Mesh( geometry, material );
	 *
	 * For example:
	 *
	 *  var materials = [];
	 *  var nGeometryGroups = geometry.groups.length;
	 *
	 *  var colorMap = ...; // Some logic to index colors.
	 *
	 *  for (var i = 0; i < nGeometryGroups; i++) {
	 *
	 *		var material = new THREE.MeshPhongMaterial({
	 *			color: colorMap[i],
	 *			wireframe: false
	 *		});
	 *
	 *  }
	 *
	 *  materials.push(material);
	 *  var mesh = new THREE.Mesh(geometry, materials);
	 */


	THREE.STLLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

	};

	THREE.STLLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.STLLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( text ) {

				try {

					onLoad( scope.parse( text ) );

				} catch ( exception ) {

					if ( onError ) {

						onError( exception );

					}

				}

			}, onProgress, onError );

		},

		parse: function ( data ) {

			function isBinary( data ) {

				var expect, face_size, n_faces, reader;
				reader = new DataView( data );
				face_size = ( 32 / 8 * 3 ) + ( ( 32 / 8 * 3 ) * 3 ) + ( 16 / 8 );
				n_faces = reader.getUint32( 80, true );
				expect = 80 + ( 32 / 8 ) + ( n_faces * face_size );

				if ( expect === reader.byteLength ) {

					return true;

				}

				// An ASCII STL data must begin with 'solid ' as the first six bytes.
				// However, ASCII STLs lacking the SPACE after the 'd' are known to be
				// plentiful.  So, check the first 5 bytes for 'solid'.

				// Several encodings, such as UTF-8, precede the text with up to 5 bytes:
				// https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding
				// Search for "solid" to start anywhere after those prefixes.

				// US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'

				var solid = [ 115, 111, 108, 105, 100 ];

				for ( var off = 0; off < 5; off ++ ) {

					// If "solid" text is matched to the current offset, declare it to be an ASCII STL.

					if ( matchDataViewAt( solid, reader, off ) ) return false;

				}

				// Couldn't find "solid" text at the beginning; it is binary STL.

				return true;

			}

			function matchDataViewAt( query, reader, offset ) {

				// Check if each byte in query matches the corresponding byte from the current offset

				for ( var i = 0, il = query.length; i < il; i ++ ) {

					if ( query[ i ] !== reader.getUint8( offset + i, false ) ) return false;

				}

				return true;

			}

			function parseBinary( data ) {

				var reader = new DataView( data );
				var faces = reader.getUint32( 80, true );

				var r, g, b, hasColors = false, colors;
				var defaultR, defaultG, defaultB, alpha;

				// process STL header
				// check for default color in header ("COLOR=rgba" sequence).

				for ( var index = 0; index < 80 - 10; index ++ ) {

					if ( ( reader.getUint32( index, false ) == 0x434F4C4F /*COLO*/ ) &&
						( reader.getUint8( index + 4 ) == 0x52 /*'R'*/ ) &&
						( reader.getUint8( index + 5 ) == 0x3D /*'='*/ ) ) {

						hasColors = true;
						colors = new Float32Array( faces * 3 * 3 );

						defaultR = reader.getUint8( index + 6 ) / 255;
						defaultG = reader.getUint8( index + 7 ) / 255;
						defaultB = reader.getUint8( index + 8 ) / 255;
						alpha = reader.getUint8( index + 9 ) / 255;

					}

				}

				var dataOffset = 84;
				var faceLength = 12 * 4 + 2;

				var geometry = new THREE.BufferGeometry();

				var vertices = new Float32Array( faces * 3 * 3 );
				var normals = new Float32Array( faces * 3 * 3 );

				for ( var face = 0; face < faces; face ++ ) {

					var start = dataOffset + face * faceLength;
					var normalX = reader.getFloat32( start, true );
					var normalY = reader.getFloat32( start + 4, true );
					var normalZ = reader.getFloat32( start + 8, true );

					if ( hasColors ) {

						var packedColor = reader.getUint16( start + 48, true );

						if ( ( packedColor & 0x8000 ) === 0 ) {

							// facet has its own unique color

							r = ( packedColor & 0x1F ) / 31;
							g = ( ( packedColor >> 5 ) & 0x1F ) / 31;
							b = ( ( packedColor >> 10 ) & 0x1F ) / 31;

						} else {

							r = defaultR;
							g = defaultG;
							b = defaultB;

						}

					}

					for ( var i = 1; i <= 3; i ++ ) {

						var vertexstart = start + i * 12;
						var componentIdx = ( face * 3 * 3 ) + ( ( i - 1 ) * 3 );

						vertices[ componentIdx ] = reader.getFloat32( vertexstart, true );
						vertices[ componentIdx + 1 ] = reader.getFloat32( vertexstart + 4, true );
						vertices[ componentIdx + 2 ] = reader.getFloat32( vertexstart + 8, true );

						normals[ componentIdx ] = normalX;
						normals[ componentIdx + 1 ] = normalY;
						normals[ componentIdx + 2 ] = normalZ;

						if ( hasColors ) {

							colors[ componentIdx ] = r;
							colors[ componentIdx + 1 ] = g;
							colors[ componentIdx + 2 ] = b;

						}

					}

				}

				geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
				geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

				if ( hasColors ) {

					geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
					geometry.hasColors = true;
					geometry.alpha = alpha;

				}

				return geometry;

			}

			function parseASCII( data ) {

				var geometry = new THREE.BufferGeometry();
				var patternSolid = /solid([\s\S]*?)endsolid/g;
				var patternFace = /facet([\s\S]*?)endfacet/g;
				var faceCounter = 0;

				var patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source;
				var patternVertex = new RegExp( 'vertex' + patternFloat + patternFloat + patternFloat, 'g' );
				var patternNormal = new RegExp( 'normal' + patternFloat + patternFloat + patternFloat, 'g' );

				var vertices = [];
				var normals = [];

				var normal = new THREE.Vector3();

				var result;

				var groupCount = 0;
				var startVertex = 0;
				var endVertex = 0;

				while ( ( result = patternSolid.exec( data ) ) !== null ) {

					startVertex = endVertex;

					var solid = result[ 0 ];

					while ( ( result = patternFace.exec( solid ) ) !== null ) {

						var vertexCountPerFace = 0;
						var normalCountPerFace = 0;

						var text = result[ 0 ];

						while ( ( result = patternNormal.exec( text ) ) !== null ) {

							normal.x = parseFloat( result[ 1 ] );
							normal.y = parseFloat( result[ 2 ] );
							normal.z = parseFloat( result[ 3 ] );
							normalCountPerFace ++;

						}

						while ( ( result = patternVertex.exec( text ) ) !== null ) {

							vertices.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );
							normals.push( normal.x, normal.y, normal.z );
							vertexCountPerFace ++;
							endVertex ++;

						}

						// every face have to own ONE valid normal

						if ( normalCountPerFace !== 1 ) {

							console.error( 'THREE.STLLoader: Something isn\'t right with the normal of face number ' + faceCounter );

						}

						// each face have to own THREE valid vertices

						if ( vertexCountPerFace !== 3 ) {

							console.error( 'THREE.STLLoader: Something isn\'t right with the vertices of face number ' + faceCounter );

						}

						faceCounter ++;

					}

					var start = startVertex;
					var count = endVertex - startVertex;

					geometry.addGroup( start, count, groupCount );
					groupCount ++;

				}

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
				geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

				return geometry;

			}

			function ensureString( buffer ) {

				if ( typeof buffer !== 'string' ) {

					return THREE.LoaderUtils.decodeText( new Uint8Array( buffer ) );

				}

				return buffer;

			}

			function ensureBinary( buffer ) {

				if ( typeof buffer === 'string' ) {

					var array_buffer = new Uint8Array( buffer.length );
					for ( var i = 0; i < buffer.length; i ++ ) {

						array_buffer[ i ] = buffer.charCodeAt( i ) & 0xff; // implicitly assumes little-endian

					}

					return array_buffer.buffer || array_buffer;

				} else {

					return buffer;

				}

			}

			// start

			var binData = ensureBinary( data );

			return isBinary( binData ) ? parseBinary( binData ) : parseASCII( ensureString( data ) );

		}

	} );
	
	return THREE.STLLoader;
});

define('skylark-threejs-ex/loaders/SVGLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author zz85 / http://joshuakoo.com/
	 * @author yomboprime / https://yombo.org
	 */

	THREE.SVGLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		// Default dots per inch
		this.defaultDPI = 90;

		// Accepted units: 'mm', 'cm', 'in', 'pt', 'pc', 'px'
		this.defaultUnit = "px";

	};

	THREE.SVGLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.SVGLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text ) );

			}, onProgress, onError );

		},

		parse: function ( text ) {

			var scope = this;

			function parseNode( node, style ) {

				if ( node.nodeType !== 1 ) return;

				var transform = getNodeTransform( node );

				var path = null;

				switch ( node.nodeName ) {

					case 'svg':
						break;

					case 'g':
						style = parseStyle( node, style );
						break;

					case 'path':
						style = parseStyle( node, style );
						if ( node.hasAttribute( 'd' ) ) path = parsePathNode( node );
						break;

					case 'rect':
						style = parseStyle( node, style );
						path = parseRectNode( node );
						break;

					case 'polygon':
						style = parseStyle( node, style );
						path = parsePolygonNode( node );
						break;

					case 'polyline':
						style = parseStyle( node, style );
						path = parsePolylineNode( node );
						break;

					case 'circle':
						style = parseStyle( node, style );
						path = parseCircleNode( node );
						break;

					case 'ellipse':
						style = parseStyle( node, style );
						path = parseEllipseNode( node );
						break;

					case 'line':
						style = parseStyle( node, style );
						path = parseLineNode( node );
						break;

					default:
						console.log( node );

				}

				if ( path ) {

					if ( style.fill !== undefined && style.fill !== 'none' ) {

						path.color.setStyle( style.fill );

					}

					transformPath( path, currentTransform );

					paths.push( path );

					path.userData = { node: node, style: style };

				}

				var nodes = node.childNodes;

				for ( var i = 0; i < nodes.length; i ++ ) {

					parseNode( nodes[ i ], style );

				}

				if ( transform ) {

					transformStack.pop();

					if ( transformStack.length > 0 ) {

						currentTransform.copy( transformStack[ transformStack.length - 1 ] );

					} else {

						currentTransform.identity();

					}

				}

			}

			function parsePathNode( node ) {

				var path = new THREE.ShapePath();

				var point = new THREE.Vector2();
				var control = new THREE.Vector2();

				var firstPoint = new THREE.Vector2();
				var isFirstPoint = true;
				var doSetFirstPoint = false;

				var d = node.getAttribute( 'd' );

				// console.log( d );

				var commands = d.match( /[a-df-z][^a-df-z]*/ig );

				for ( var i = 0, l = commands.length; i < l; i ++ ) {

					var command = commands[ i ];

					var type = command.charAt( 0 );
					var data = command.substr( 1 ).trim();

					if ( isFirstPoint === true ) {

						doSetFirstPoint = true;
						isFirstPoint = false;

					}

					switch ( type ) {

						case 'M':
							var numbers = parseFloats( data );
							for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {

								point.x = numbers[ j + 0 ];
								point.y = numbers[ j + 1 ];
								control.x = point.x;
								control.y = point.y;

								if ( j === 0 ) {

									path.moveTo( point.x, point.y );

								} else {

									path.lineTo( point.x, point.y );

								}

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'H':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {

								point.x = numbers[ j ];
								control.x = point.x;
								control.y = point.y;
								path.lineTo( point.x, point.y );

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'V':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {

								point.y = numbers[ j ];
								control.x = point.x;
								control.y = point.y;
								path.lineTo( point.x, point.y );

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'L':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {

								point.x = numbers[ j + 0 ];
								point.y = numbers[ j + 1 ];
								control.x = point.x;
								control.y = point.y;
								path.lineTo( point.x, point.y );

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'C':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 6 ) {

								path.bezierCurveTo(
									numbers[ j + 0 ],
									numbers[ j + 1 ],
									numbers[ j + 2 ],
									numbers[ j + 3 ],
									numbers[ j + 4 ],
									numbers[ j + 5 ]
								);
								control.x = numbers[ j + 2 ];
								control.y = numbers[ j + 3 ];
								point.x = numbers[ j + 4 ];
								point.y = numbers[ j + 5 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'S':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {

								path.bezierCurveTo(
									getReflection( point.x, control.x ),
									getReflection( point.y, control.y ),
									numbers[ j + 0 ],
									numbers[ j + 1 ],
									numbers[ j + 2 ],
									numbers[ j + 3 ]
								);
								control.x = numbers[ j + 0 ];
								control.y = numbers[ j + 1 ];
								point.x = numbers[ j + 2 ];
								point.y = numbers[ j + 3 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'Q':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {

								path.quadraticCurveTo(
									numbers[ j + 0 ],
									numbers[ j + 1 ],
									numbers[ j + 2 ],
									numbers[ j + 3 ]
								);
								control.x = numbers[ j + 0 ];
								control.y = numbers[ j + 1 ];
								point.x = numbers[ j + 2 ];
								point.y = numbers[ j + 3 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'T':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {

								var rx = getReflection( point.x, control.x );
								var ry = getReflection( point.y, control.y );
								path.quadraticCurveTo(
									rx,
									ry,
									numbers[ j + 0 ],
									numbers[ j + 1 ]
								);
								control.x = rx;
								control.y = ry;
								point.x = numbers[ j + 0 ];
								point.y = numbers[ j + 1 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'A':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {

								var start = point.clone();
								point.x = numbers[ j + 5 ];
								point.y = numbers[ j + 6 ];
								control.x = point.x;
								control.y = point.y;
								parseArcCommand(
									path, numbers[ j ], numbers[ j + 1 ], numbers[ j + 2 ], numbers[ j + 3 ], numbers[ j + 4 ], start, point
								);

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'm':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {

								point.x += numbers[ j + 0 ];
								point.y += numbers[ j + 1 ];
								control.x = point.x;
								control.y = point.y;

								if ( j === 0 ) {

									path.moveTo( point.x, point.y );

								} else {

									path.lineTo( point.x, point.y );

								}

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'h':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {

								point.x += numbers[ j ];
								control.x = point.x;
								control.y = point.y;
								path.lineTo( point.x, point.y );

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'v':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {

								point.y += numbers[ j ];
								control.x = point.x;
								control.y = point.y;
								path.lineTo( point.x, point.y );

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'l':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {

								point.x += numbers[ j + 0 ];
								point.y += numbers[ j + 1 ];
								control.x = point.x;
								control.y = point.y;
								path.lineTo( point.x, point.y );

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'c':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 6 ) {

								path.bezierCurveTo(
									point.x + numbers[ j + 0 ],
									point.y + numbers[ j + 1 ],
									point.x + numbers[ j + 2 ],
									point.y + numbers[ j + 3 ],
									point.x + numbers[ j + 4 ],
									point.y + numbers[ j + 5 ]
								);
								control.x = point.x + numbers[ j + 2 ];
								control.y = point.y + numbers[ j + 3 ];
								point.x += numbers[ j + 4 ];
								point.y += numbers[ j + 5 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 's':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {

								path.bezierCurveTo(
									getReflection( point.x, control.x ),
									getReflection( point.y, control.y ),
									point.x + numbers[ j + 0 ],
									point.y + numbers[ j + 1 ],
									point.x + numbers[ j + 2 ],
									point.y + numbers[ j + 3 ]
								);
								control.x = point.x + numbers[ j + 0 ];
								control.y = point.y + numbers[ j + 1 ];
								point.x += numbers[ j + 2 ];
								point.y += numbers[ j + 3 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'q':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {

								path.quadraticCurveTo(
									point.x + numbers[ j + 0 ],
									point.y + numbers[ j + 1 ],
									point.x + numbers[ j + 2 ],
									point.y + numbers[ j + 3 ]
								);
								control.x = point.x + numbers[ j + 0 ];
								control.y = point.y + numbers[ j + 1 ];
								point.x += numbers[ j + 2 ];
								point.y += numbers[ j + 3 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 't':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {

								var rx = getReflection( point.x, control.x );
								var ry = getReflection( point.y, control.y );
								path.quadraticCurveTo(
									rx,
									ry,
									point.x + numbers[ j + 0 ],
									point.y + numbers[ j + 1 ]
								);
								control.x = rx;
								control.y = ry;
								point.x = point.x + numbers[ j + 0 ];
								point.y = point.y + numbers[ j + 1 ];

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'a':
							var numbers = parseFloats( data );

							for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {

								var start = point.clone();
								point.x += numbers[ j + 5 ];
								point.y += numbers[ j + 6 ];
								control.x = point.x;
								control.y = point.y;
								parseArcCommand(
									path, numbers[ j ], numbers[ j + 1 ], numbers[ j + 2 ], numbers[ j + 3 ], numbers[ j + 4 ], start, point
								);

								if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );

							}
							break;

						case 'Z':
						case 'z':
							path.currentPath.autoClose = true;

							if ( path.currentPath.curves.length > 0 ) {

								// Reset point to beginning of Path
								point.copy( firstPoint );
								path.currentPath.currentPoint.copy( point );
								isFirstPoint = true;

							}
							break;

						default:
							console.warn( command );

					}

					// console.log( type, parseFloats( data ), parseFloats( data ).length  )

					doSetFirstPoint = false;

				}

				return path;

			}

			/**
			 * https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
			 * https://mortoray.com/2017/02/16/rendering-an-svg-elliptical-arc-as-bezier-curves/ Appendix: Endpoint to center arc conversion
			 * From
			 * rx ry x-axis-rotation large-arc-flag sweep-flag x y
			 * To
			 * aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation
			 */

			function parseArcCommand( path, rx, ry, x_axis_rotation, large_arc_flag, sweep_flag, start, end ) {

				x_axis_rotation = x_axis_rotation * Math.PI / 180;

				// Ensure radii are positive
				rx = Math.abs( rx );
				ry = Math.abs( ry );

				// Compute (x1′, y1′)
				var dx2 = ( start.x - end.x ) / 2.0;
				var dy2 = ( start.y - end.y ) / 2.0;
				var x1p = Math.cos( x_axis_rotation ) * dx2 + Math.sin( x_axis_rotation ) * dy2;
				var y1p = - Math.sin( x_axis_rotation ) * dx2 + Math.cos( x_axis_rotation ) * dy2;

				// Compute (cx′, cy′)
				var rxs = rx * rx;
				var rys = ry * ry;
				var x1ps = x1p * x1p;
				var y1ps = y1p * y1p;

				// Ensure radii are large enough
				var cr = x1ps / rxs + y1ps / rys;

				if ( cr > 1 ) {

					// scale up rx,ry equally so cr == 1
					var s = Math.sqrt( cr );
					rx = s * rx;
					ry = s * ry;
					rxs = rx * rx;
					rys = ry * ry;

				}

				var dq = ( rxs * y1ps + rys * x1ps );
				var pq = ( rxs * rys - dq ) / dq;
				var q = Math.sqrt( Math.max( 0, pq ) );
				if ( large_arc_flag === sweep_flag ) q = - q;
				var cxp = q * rx * y1p / ry;
				var cyp = - q * ry * x1p / rx;

				// Step 3: Compute (cx, cy) from (cx′, cy′)
				var cx = Math.cos( x_axis_rotation ) * cxp - Math.sin( x_axis_rotation ) * cyp + ( start.x + end.x ) / 2;
				var cy = Math.sin( x_axis_rotation ) * cxp + Math.cos( x_axis_rotation ) * cyp + ( start.y + end.y ) / 2;

				// Step 4: Compute θ1 and Δθ
				var theta = svgAngle( 1, 0, ( x1p - cxp ) / rx, ( y1p - cyp ) / ry );
				var delta = svgAngle( ( x1p - cxp ) / rx, ( y1p - cyp ) / ry, ( - x1p - cxp ) / rx, ( - y1p - cyp ) / ry ) % ( Math.PI * 2 );

				path.currentPath.absellipse( cx, cy, rx, ry, theta, theta + delta, sweep_flag === 0, x_axis_rotation );

			}

			function svgAngle( ux, uy, vx, vy ) {

				var dot = ux * vx + uy * vy;
				var len = Math.sqrt( ux * ux + uy * uy ) * Math.sqrt( vx * vx + vy * vy );
				var ang = Math.acos( Math.max( - 1, Math.min( 1, dot / len ) ) ); // floating point precision, slightly over values appear
				if ( ( ux * vy - uy * vx ) < 0 ) ang = - ang;
				return ang;

			}

			/*
			* According to https://www.w3.org/TR/SVG/shapes.html#RectElementRXAttribute
			* rounded corner should be rendered to elliptical arc, but bezier curve does the job well enough
			*/
			function parseRectNode( node ) {

				var x = parseFloatWithUnits( node.getAttribute( 'x' ) || 0 );
				var y = parseFloatWithUnits( node.getAttribute( 'y' ) || 0 );
				var rx = parseFloatWithUnits( node.getAttribute( 'rx' ) || 0 );
				var ry = parseFloatWithUnits( node.getAttribute( 'ry' ) || 0 );
				var w = parseFloatWithUnits( node.getAttribute( 'width' ) );
				var h = parseFloatWithUnits( node.getAttribute( 'height' ) );

				var path = new THREE.ShapePath();
				path.moveTo( x + 2 * rx, y );
				path.lineTo( x + w - 2 * rx, y );
				if ( rx !== 0 || ry !== 0 ) path.bezierCurveTo( x + w, y, x + w, y, x + w, y + 2 * ry );
				path.lineTo( x + w, y + h - 2 * ry );
				if ( rx !== 0 || ry !== 0 ) path.bezierCurveTo( x + w, y + h, x + w, y + h, x + w - 2 * rx, y + h );
				path.lineTo( x + 2 * rx, y + h );

				if ( rx !== 0 || ry !== 0 ) {

					path.bezierCurveTo( x, y + h, x, y + h, x, y + h - 2 * ry );

				}

				path.lineTo( x, y + 2 * ry );

				if ( rx !== 0 || ry !== 0 ) {

					path.bezierCurveTo( x, y, x, y, x + 2 * rx, y );

				}

				return path;

			}

			function parsePolygonNode( node ) {

				function iterator( match, a, b ) {

					var x = parseFloatWithUnits( a );
					var y = parseFloatWithUnits( b );

					if ( index === 0 ) {

						path.moveTo( x, y );

					} else {

						path.lineTo( x, y );

					}

					index ++;

				}

				var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;

				var path = new THREE.ShapePath();

				var index = 0;

				node.getAttribute( 'points' ).replace( regex, iterator );

				path.currentPath.autoClose = true;

				return path;

			}

			function parsePolylineNode( node ) {

				function iterator( match, a, b ) {

					var x = parseFloatWithUnits( a );
					var y = parseFloatWithUnits( b );

					if ( index === 0 ) {

						path.moveTo( x, y );

					} else {

						path.lineTo( x, y );

					}

					index ++;

				}

				var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;

				var path = new THREE.ShapePath();

				var index = 0;

				node.getAttribute( 'points' ).replace( regex, iterator );

				path.currentPath.autoClose = false;

				return path;

			}

			function parseCircleNode( node ) {

				var x = parseFloatWithUnits( node.getAttribute( 'cx' ) );
				var y = parseFloatWithUnits( node.getAttribute( 'cy' ) );
				var r = parseFloatWithUnits( node.getAttribute( 'r' ) );

				var subpath = new THREE.Path();
				subpath.absarc( x, y, r, 0, Math.PI * 2 );

				var path = new THREE.ShapePath();
				path.subPaths.push( subpath );

				return path;

			}

			function parseEllipseNode( node ) {

				var x = parseFloatWithUnits( node.getAttribute( 'cx' ) );
				var y = parseFloatWithUnits( node.getAttribute( 'cy' ) );
				var rx = parseFloatWithUnits( node.getAttribute( 'rx' ) );
				var ry = parseFloatWithUnits( node.getAttribute( 'ry' ) );

				var subpath = new THREE.Path();
				subpath.absellipse( x, y, rx, ry, 0, Math.PI * 2 );

				var path = new THREE.ShapePath();
				path.subPaths.push( subpath );

				return path;

			}

			function parseLineNode( node ) {

				var x1 = parseFloatWithUnits( node.getAttribute( 'x1' ) );
				var y1 = parseFloatWithUnits( node.getAttribute( 'y1' ) );
				var x2 = parseFloatWithUnits( node.getAttribute( 'x2' ) );
				var y2 = parseFloatWithUnits( node.getAttribute( 'y2' ) );

				var path = new THREE.ShapePath();
				path.moveTo( x1, y1 );
				path.lineTo( x2, y2 );
				path.currentPath.autoClose = false;

				return path;

			}

			//

			function parseStyle( node, style ) {

				style = Object.assign( {}, style ); // clone style

				function addStyle( svgName, jsName, adjustFunction ) {

					if ( adjustFunction === undefined ) adjustFunction = function copy( v ) {

						return v;

					};

					if ( node.hasAttribute( svgName ) ) style[ jsName ] = adjustFunction( node.getAttribute( svgName ) );
					if ( node.style && node.style[ svgName ] !== '' ) style[ jsName ] = adjustFunction( node.style[ svgName ] );

				}

				function clamp( v ) {

					return Math.max( 0, Math.min( 1, parseFloatWithUnits( v ) ) );

				}

				function positive( v ) {

					return Math.max( 0, parseFloatWithUnits( v ) );

				}

				addStyle( 'fill', 'fill' );
				addStyle( 'fill-opacity', 'fillOpacity', clamp );
				addStyle( 'stroke', 'stroke' );
				addStyle( 'stroke-opacity', 'strokeOpacity', clamp );
				addStyle( 'stroke-width', 'strokeWidth', positive );
				addStyle( 'stroke-linejoin', 'strokeLineJoin' );
				addStyle( 'stroke-linecap', 'strokeLineCap' );
				addStyle( 'stroke-miterlimit', 'strokeMiterLimit', positive );

				return style;

			}

			// http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes

			function getReflection( a, b ) {

				return a - ( b - a );

			}

			function parseFloats( string ) {

				var array = string.split( /[\s,]+|(?=\s?[+\-])/ );

				for ( var i = 0; i < array.length; i ++ ) {

					var number = array[ i ];

					// Handle values like 48.6037.7.8
					// TODO Find a regex for this

					if ( number.indexOf( '.' ) !== number.lastIndexOf( '.' ) ) {

						var split = number.split( '.' );

						for ( var s = 2; s < split.length; s ++ ) {

							array.splice( i + s - 1, 0, '0.' + split[ s ] );

						}

					}

					array[ i ] = parseFloatWithUnits( number );

				}

				return array;


			}

			// Units

			var units = [ 'mm', 'cm', 'in', 'pt', 'pc', 'px' ];

			// Conversion: [ fromUnit ][ toUnit ] (-1 means dpi dependent)
			var unitConversion = {

				"mm": {
					"mm": 1,
					"cm": 0.1,
					"in": 1 / 25.4,
					"pt": 72 / 25.4,
					"pc": 6 / 25.4,
					"px": - 1
				},
				"cm": {
					"mm": 10,
					"cm": 1,
					"in": 1 / 2.54,
					"pt": 72 / 2.54,
					"pc": 6 / 2.54,
					"px": - 1
				},
				"in": {
					"mm": 25.4,
					"cm": 2.54,
					"in": 1,
					"pt": 72,
					"pc": 6,
					"px": - 1
				},
				"pt": {
					"mm": 25.4 / 72,
					"cm": 2.54 / 72,
					"in": 1 / 72,
					"pt": 1,
					"pc": 6 / 72,
					"px": - 1
				},
				"pc": {
					"mm": 25.4 / 6,
					"cm": 2.54 / 6,
					"in": 1 / 6,
					"pt": 72 / 6,
					"pc": 1,
					"px": - 1
				},
				"px": {
					"px": 1
				}

			};

			function parseFloatWithUnits( string ) {

				var theUnit = "px";

				if ( typeof string === 'string' || string instanceof String ) {

					for ( var i = 0, n = units.length; i < n; i ++ ) {

						var u = units[ i ];

						if ( string.endsWith( u ) ) {

							theUnit = u;
							string = string.substring( 0, string.length - u.length );
							break;

						}

					}

				}

				var scale = undefined;

				if ( theUnit === "px" && scope.defaultUnit !== "px" ) {

					// Conversion scale from  pixels to inches, then to default units

					scale = unitConversion[ "in" ][ scope.defaultUnit ] / scope.defaultDPI;

				} else {

					scale = unitConversion[ theUnit ][ scope.defaultUnit ];

					if ( scale < 0 ) {

						// Conversion scale to pixels

						scale = unitConversion[ theUnit ][ "in" ] * scope.defaultDPI;

					}

				}

				return scale * parseFloat( string );

			}

			// Transforms

			function getNodeTransform( node ) {

				if ( ! node.hasAttribute( 'transform' ) ) {

					return null;

				}

				var transform = parseNodeTransform( node );

				if ( transformStack.length > 0 ) {

					transform.premultiply( transformStack[ transformStack.length - 1 ] );

				}

				currentTransform.copy( transform );
				transformStack.push( transform );

				return transform;

			}

			function parseNodeTransform( node ) {

				var transform = new THREE.Matrix3();
				var currentTransform = tempTransform0;
				var transformsTexts = node.getAttribute( 'transform' ).split( ')' );

				for ( var tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex -- ) {

					var transformText = transformsTexts[ tIndex ].trim();

					if ( transformText === '' ) continue;

					var openParPos = transformText.indexOf( '(' );
					var closeParPos = transformText.length;

					if ( openParPos > 0 && openParPos < closeParPos ) {

						var transformType = transformText.substr( 0, openParPos );

						var array = parseFloats( transformText.substr( openParPos + 1, closeParPos - openParPos - 1 ) );

						currentTransform.identity();

						switch ( transformType ) {

							case "translate":

								if ( array.length >= 1 ) {

									var tx = array[ 0 ];
									var ty = tx;

									if ( array.length >= 2 ) {

										ty = array[ 1 ];

									}

									currentTransform.translate( tx, ty );

								}

								break;

							case "rotate":

								if ( array.length >= 1 ) {

									var angle = 0;
									var cx = 0;
									var cy = 0;

									// Angle
									angle = - array[ 0 ] * Math.PI / 180;

									if ( array.length >= 3 ) {

										// Center x, y
										cx = array[ 1 ];
										cy = array[ 2 ];

									}

									// Rotate around center (cx, cy)
									tempTransform1.identity().translate( - cx, - cy );
									tempTransform2.identity().rotate( angle );
									tempTransform3.multiplyMatrices( tempTransform2, tempTransform1 );
									tempTransform1.identity().translate( cx, cy );
									currentTransform.multiplyMatrices( tempTransform1, tempTransform3 );

								}

								break;

							case "scale":

								if ( array.length >= 1 ) {

									var scaleX = array[ 0 ];
									var scaleY = scaleX;

									if ( array.length >= 2 ) {

										scaleY = array[ 1 ];

									}

									currentTransform.scale( scaleX, scaleY );

								}

								break;

							case "skewX":

								if ( array.length === 1 ) {

									currentTransform.set(
										1, Math.tan( array[ 0 ] * Math.PI / 180 ), 0,
										0, 1, 0,
										0, 0, 1
									);

								}

								break;

							case "skewY":

								if ( array.length === 1 ) {

									currentTransform.set(
										1, 0, 0,
										Math.tan( array[ 0 ] * Math.PI / 180 ), 1, 0,
										0, 0, 1
									);

								}

								break;

							case "matrix":

								if ( array.length === 6 ) {

									currentTransform.set(
										array[ 0 ], array[ 2 ], array[ 4 ],
										array[ 1 ], array[ 3 ], array[ 5 ],
										0, 0, 1
									);

								}

								break;

						}

					}

					transform.premultiply( currentTransform );

				}

				return transform;

			}

			function transformPath( path, m ) {

				function transfVec2( v2 ) {

					tempV3.set( v2.x, v2.y, 1 ).applyMatrix3( m );

					v2.set( tempV3.x, tempV3.y );

				}

				var isRotated = isTransformRotated( m );

				var subPaths = path.subPaths;

				for ( var i = 0, n = subPaths.length; i < n; i ++ ) {

					var subPath = subPaths[ i ];
					var curves = subPath.curves;

					for ( var j = 0; j < curves.length; j ++ ) {

						var curve = curves[ j ];

						if ( curve.isLineCurve ) {

							transfVec2( curve.v1 );
							transfVec2( curve.v2 );

						} else if ( curve.isCubicBezierCurve ) {

							transfVec2( curve.v0 );
							transfVec2( curve.v1 );
							transfVec2( curve.v2 );
							transfVec2( curve.v3 );

						} else if ( curve.isQuadraticBezierCurve ) {

							transfVec2( curve.v0 );
							transfVec2( curve.v1 );
							transfVec2( curve.v2 );

						} else if ( curve.isEllipseCurve ) {

							if ( isRotated ) {

								console.warn( "SVGLoader: Elliptic arc or ellipse rotation or skewing is not implemented." );

							}

							tempV2.set( curve.aX, curve.aY );
							transfVec2( tempV2 );
							curve.aX = tempV2.x;
							curve.aY = tempV2.y;

							curve.xRadius *= getTransformScaleX( m );
							curve.yRadius *= getTransformScaleY( m );

						}

					}

				}

			}

			function isTransformRotated( m ) {

				return m.elements[ 1 ] !== 0 || m.elements[ 3 ] !== 0;

			}

			function getTransformScaleX( m ) {

				var te = m.elements;
				return Math.sqrt( te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] );

			}

			function getTransformScaleY( m ) {

				var te = m.elements;
				return Math.sqrt( te[ 3 ] * te[ 3 ] + te[ 4 ] * te[ 4 ] );

			}

			//

			var paths = [];

			var transformStack = [];

			var tempTransform0 = new THREE.Matrix3();
			var tempTransform1 = new THREE.Matrix3();
			var tempTransform2 = new THREE.Matrix3();
			var tempTransform3 = new THREE.Matrix3();
			var tempV2 = new THREE.Vector2();
			var tempV3 = new THREE.Vector3();

			var currentTransform = new THREE.Matrix3();

			var xml = new DOMParser().parseFromString( text, 'image/svg+xml' ); // application/xml

			parseNode( xml.documentElement, {
				fill: '#000',
				fillOpacity: 1,
				strokeOpacity: 1,
				strokeWidth: 1,
				strokeLineJoin: 'miter',
				strokeLineCap: 'butt',
				strokeMiterLimit: 4
			} );

			var data = { paths: paths, xml: xml.documentElement };

			// console.log( paths );
			return data;

		}

	} );

	THREE.SVGLoader.getStrokeStyle = function ( width, color, lineJoin, lineCap, miterLimit ) {

		// Param width: Stroke width
		// Param color: As returned by THREE.Color.getStyle()
		// Param lineJoin: One of "round", "bevel", "miter" or "miter-limit"
		// Param lineCap: One of "round", "square" or "butt"
		// Param miterLimit: Maximum join length, in multiples of the "width" parameter (join is truncated if it exceeds that distance)
		// Returns style object

		width = width !== undefined ? width : 1;
		color = color !== undefined ? color : '#000';
		lineJoin = lineJoin !== undefined ? lineJoin : 'miter';
		lineCap = lineCap !== undefined ? lineCap : 'butt';
		miterLimit = miterLimit !== undefined ? miterLimit : 4;

		return {
			strokeColor: color,
			strokeWidth: width,
			strokeLineJoin: lineJoin,
			strokeLineCap: lineCap,
			strokeMiterLimit: miterLimit
		};

	};

	THREE.SVGLoader.pointsToStroke = function ( points, style, arcDivisions, minDistance ) {

		// Generates a stroke with some witdh around the given path.
		// The path can be open or closed (last point equals to first point)
		// Param points: Array of Vector2D (the path). Minimum 2 points.
		// Param style: Object with SVG properties as returned by SVGLoader.getStrokeStyle(), or SVGLoader.parse() in the path.userData.style object
		// Params arcDivisions: Arc divisions for round joins and endcaps. (Optional)
		// Param minDistance: Points closer to this distance will be merged. (Optional)
		// Returns BufferGeometry with stroke triangles (In plane z = 0). UV coordinates are generated ('u' along path. 'v' across it, from left to right)

		var vertices = [];
		var normals = [];
		var uvs = [];

		if ( THREE.SVGLoader.pointsToStrokeWithBuffers( points, style, arcDivisions, minDistance, vertices, normals, uvs ) === 0 ) {

			return null;

		}

		var geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

		return geometry;

	};

	THREE.SVGLoader.pointsToStrokeWithBuffers = function () {

		var tempV2_1 = new THREE.Vector2();
		var tempV2_2 = new THREE.Vector2();
		var tempV2_3 = new THREE.Vector2();
		var tempV2_4 = new THREE.Vector2();
		var tempV2_5 = new THREE.Vector2();
		var tempV2_6 = new THREE.Vector2();
		var tempV2_7 = new THREE.Vector2();
		var lastPointL = new THREE.Vector2();
		var lastPointR = new THREE.Vector2();
		var point0L = new THREE.Vector2();
		var point0R = new THREE.Vector2();
		var currentPointL = new THREE.Vector2();
		var currentPointR = new THREE.Vector2();
		var nextPointL = new THREE.Vector2();
		var nextPointR = new THREE.Vector2();
		var innerPoint = new THREE.Vector2();
		var outerPoint = new THREE.Vector2();

		return function ( points, style, arcDivisions, minDistance, vertices, normals, uvs, vertexOffset ) {

			// This function can be called to update existing arrays or buffers.
			// Accepts same parameters as pointsToStroke, plus the buffers and optional offset.
			// Param vertexOffset: Offset vertices to start writing in the buffers (3 elements/vertex for vertices and normals, and 2 elements/vertex for uvs)
			// Returns number of written vertices / normals / uvs pairs
			// if 'vertices' parameter is undefined no triangles will be generated, but the returned vertices count will still be valid (useful to preallocate the buffers)
			// 'normals' and 'uvs' buffers are optional

			arcDivisions = arcDivisions !== undefined ? arcDivisions : 12;
			minDistance = minDistance !== undefined ? minDistance : 0.001;
			vertexOffset = vertexOffset !== undefined ? vertexOffset : 0;

			// First ensure there are no duplicated points
			points = removeDuplicatedPoints( points );

			var numPoints = points.length;

			if ( numPoints < 2 ) return 0;

			var isClosed = points[ 0 ].equals( points[ numPoints - 1 ] );

			var currentPoint;
			var previousPoint = points[ 0 ];
			var nextPoint;

			var strokeWidth2 = style.strokeWidth / 2;

			var deltaU = 1 / ( numPoints - 1 );
			var u0 = 0;

			var innerSideModified;
			var joinIsOnLeftSide;
			var isMiter;
			var initialJoinIsOnLeftSide = false;

			var numVertices = 0;
			var currentCoordinate = vertexOffset * 3;
			var currentCoordinateUV = vertexOffset * 2;

			// Get initial left and right stroke points
			getNormal( points[ 0 ], points[ 1 ], tempV2_1 ).multiplyScalar( strokeWidth2 );
			lastPointL.copy( points[ 0 ] ).sub( tempV2_1 );
			lastPointR.copy( points[ 0 ] ).add( tempV2_1 );
			point0L.copy( lastPointL );
			point0R.copy( lastPointR );

			for ( var iPoint = 1; iPoint < numPoints; iPoint ++ ) {

				currentPoint = points[ iPoint ];

				// Get next point
				if ( iPoint === numPoints - 1 ) {

					if ( isClosed ) {

						// Skip duplicated initial point
						nextPoint = points[ 1 ];

					} else nextPoint = undefined;

				} else {

					nextPoint = points[ iPoint + 1 ];

				}

				// Normal of previous segment in tempV2_1
				var normal1 = tempV2_1;
				getNormal( previousPoint, currentPoint, normal1 );

				tempV2_3.copy( normal1 ).multiplyScalar( strokeWidth2 );
				currentPointL.copy( currentPoint ).sub( tempV2_3 );
				currentPointR.copy( currentPoint ).add( tempV2_3 );

				var u1 = u0 + deltaU;

				innerSideModified = false;

				if ( nextPoint !== undefined ) {

					// Normal of next segment in tempV2_2
					getNormal( currentPoint, nextPoint, tempV2_2 );

					tempV2_3.copy( tempV2_2 ).multiplyScalar( strokeWidth2 );
					nextPointL.copy( currentPoint ).sub( tempV2_3 );
					nextPointR.copy( currentPoint ).add( tempV2_3 );

					joinIsOnLeftSide = true;
					tempV2_3.subVectors( nextPoint, previousPoint );
					if ( normal1.dot( tempV2_3 ) < 0 ) {

						joinIsOnLeftSide = false;

					}
					if ( iPoint === 1 ) initialJoinIsOnLeftSide = joinIsOnLeftSide;

					tempV2_3.subVectors( nextPoint, currentPoint );
					tempV2_3.normalize();
					var dot = Math.abs( normal1.dot( tempV2_3 ) );

					// If path is straight, don't create join
					if ( dot !== 0 ) {

						// Compute inner and outer segment intersections
						var miterSide = strokeWidth2 / dot;
						tempV2_3.multiplyScalar( - miterSide );
						tempV2_4.subVectors( currentPoint, previousPoint );
						tempV2_5.copy( tempV2_4 ).setLength( miterSide ).add( tempV2_3 );
						innerPoint.copy( tempV2_5 ).negate();
						var miterLength2 = tempV2_5.length();
						var segmentLengthPrev = tempV2_4.length();
						tempV2_4.divideScalar( segmentLengthPrev );
						tempV2_6.subVectors( nextPoint, currentPoint );
						var segmentLengthNext = tempV2_6.length();
						tempV2_6.divideScalar( segmentLengthNext );
						// Check that previous and next segments doesn't overlap with the innerPoint of intersection
						if ( tempV2_4.dot( innerPoint ) < segmentLengthPrev && tempV2_6.dot( innerPoint ) < segmentLengthNext ) {

							innerSideModified = true;

						}
						outerPoint.copy( tempV2_5 ).add( currentPoint );
						innerPoint.add( currentPoint );

						isMiter = false;

						if ( innerSideModified ) {

							if ( joinIsOnLeftSide ) {

								nextPointR.copy( innerPoint );
								currentPointR.copy( innerPoint );

							} else {

								nextPointL.copy( innerPoint );
								currentPointL.copy( innerPoint );

							}

						} else {

							// The segment triangles are generated here if there was overlapping

							makeSegmentTriangles();

						}

						switch ( style.strokeLineJoin ) {

							case 'bevel':

								makeSegmentWithBevelJoin( joinIsOnLeftSide, innerSideModified, u1 );

								break;

							case 'round':

								// Segment triangles

								createSegmentTrianglesWithMiddleSection( joinIsOnLeftSide, innerSideModified );

								// Join triangles

								if ( joinIsOnLeftSide ) {

									makeCircularSector( currentPoint, currentPointL, nextPointL, u1, 0 );

								} else {

									makeCircularSector( currentPoint, nextPointR, currentPointR, u1, 1 );

								}

								break;

							case 'miter':
							case 'miter-clip':
							default:

								var miterFraction = ( strokeWidth2 * style.strokeMiterLimit ) / miterLength2;

								if ( miterFraction < 1 ) {

									// The join miter length exceeds the miter limit

									if ( style.strokeLineJoin !== 'miter-clip' ) {

										makeSegmentWithBevelJoin( joinIsOnLeftSide, innerSideModified, u1 );
										break;

									} else {

										// Segment triangles

										createSegmentTrianglesWithMiddleSection( joinIsOnLeftSide, innerSideModified );

										// Miter-clip join triangles

										if ( joinIsOnLeftSide ) {

											tempV2_6.subVectors( outerPoint, currentPointL ).multiplyScalar( miterFraction ).add( currentPointL );
											tempV2_7.subVectors( outerPoint, nextPointL ).multiplyScalar( miterFraction ).add( nextPointL );

											addVertex( currentPointL, u1, 0 );
											addVertex( tempV2_6, u1, 0 );
											addVertex( currentPoint, u1, 0.5 );

											addVertex( currentPoint, u1, 0.5 );
											addVertex( tempV2_6, u1, 0 );
											addVertex( tempV2_7, u1, 0 );

											addVertex( currentPoint, u1, 0.5 );
											addVertex( tempV2_7, u1, 0 );
											addVertex( nextPointL, u1, 0 );

										} else {

											tempV2_6.subVectors( outerPoint, currentPointR ).multiplyScalar( miterFraction ).add( currentPointR );
											tempV2_7.subVectors( outerPoint, nextPointR ).multiplyScalar( miterFraction ).add( nextPointR );

											addVertex( currentPointR, u1, 1 );
											addVertex( tempV2_6, u1, 1 );
											addVertex( currentPoint, u1, 0.5 );

											addVertex( currentPoint, u1, 0.5 );
											addVertex( tempV2_6, u1, 1 );
											addVertex( tempV2_7, u1, 1 );

											addVertex( currentPoint, u1, 0.5 );
											addVertex( tempV2_7, u1, 1 );
											addVertex( nextPointR, u1, 1 );

										}

									}

								} else {

									// Miter join segment triangles

									if ( innerSideModified ) {

										// Optimized segment + join triangles

										if ( joinIsOnLeftSide ) {

											addVertex( lastPointR, u0, 1 );
											addVertex( lastPointL, u0, 0 );
											addVertex( outerPoint, u1, 0 );

											addVertex( lastPointR, u0, 1 );
											addVertex( outerPoint, u1, 0 );
											addVertex( innerPoint, u1, 1 );

										} else {

											addVertex( lastPointR, u0, 1 );
											addVertex( lastPointL, u0, 0 );
											addVertex( outerPoint, u1, 1 );

											addVertex( lastPointL, u0, 0 );
											addVertex( innerPoint, u1, 0 );
											addVertex( outerPoint, u1, 1 );

										}


										if ( joinIsOnLeftSide ) {

											nextPointL.copy( outerPoint );

										} else {

											nextPointR.copy( outerPoint );

										}


									} else {

										// Add extra miter join triangles

										if ( joinIsOnLeftSide ) {

											addVertex( currentPointL, u1, 0 );
											addVertex( outerPoint, u1, 0 );
											addVertex( currentPoint, u1, 0.5 );

											addVertex( currentPoint, u1, 0.5 );
											addVertex( outerPoint, u1, 0 );
											addVertex( nextPointL, u1, 0 );

										} else {

											addVertex( currentPointR, u1, 1 );
											addVertex( outerPoint, u1, 1 );
											addVertex( currentPoint, u1, 0.5 );

											addVertex( currentPoint, u1, 0.5 );
											addVertex( outerPoint, u1, 1 );
											addVertex( nextPointR, u1, 1 );

										}

									}

									isMiter = true;

								}

								break;

						}

					} else {

						// The segment triangles are generated here when two consecutive points are collinear

						makeSegmentTriangles();

					}

				} else {

					// The segment triangles are generated here if it is the ending segment

					makeSegmentTriangles();

				}

				if ( ! isClosed && iPoint === numPoints - 1 ) {

					// Start line endcap
					addCapGeometry( points[ 0 ], point0L, point0R, joinIsOnLeftSide, true, u0 );

				}

				// Increment loop variables

				u0 = u1;

				previousPoint = currentPoint;

				lastPointL.copy( nextPointL );
				lastPointR.copy( nextPointR );

			}

			if ( ! isClosed ) {

				// Ending line endcap
				addCapGeometry( currentPoint, currentPointL, currentPointR, joinIsOnLeftSide, false, u1 );

			} else if ( innerSideModified && vertices ) {

				// Modify path first segment vertices to adjust to the segments inner and outer intersections

				var lastOuter = outerPoint;
				var lastInner = innerPoint;

				if ( initialJoinIsOnLeftSide !== joinIsOnLeftSide ) {

					lastOuter = innerPoint;
					lastInner = outerPoint;

				}

				if ( joinIsOnLeftSide ) {

					if ( isMiter || initialJoinIsOnLeftSide ) {

						lastInner.toArray( vertices, 0 * 3 );
						lastInner.toArray( vertices, 3 * 3 );

						if ( isMiter ) {

							lastOuter.toArray( vertices, 1 * 3 );

						}

					}

				} else {

					if ( isMiter || ! initialJoinIsOnLeftSide ) {

						lastInner.toArray( vertices, 1 * 3 );
						lastInner.toArray( vertices, 3 * 3 );

						if ( isMiter ) {

							lastOuter.toArray( vertices, 0 * 3 );

						}

					}

				}

			}

			return numVertices;

			// -- End of algorithm

			// -- Functions

			function getNormal( p1, p2, result ) {

				result.subVectors( p2, p1 );
				return result.set( - result.y, result.x ).normalize();

			}

			function addVertex( position, u, v ) {

				if ( vertices ) {

					vertices[ currentCoordinate ] = position.x;
					vertices[ currentCoordinate + 1 ] = position.y;
					vertices[ currentCoordinate + 2 ] = 0;

					if ( normals ) {

						normals[ currentCoordinate ] = 0;
						normals[ currentCoordinate + 1 ] = 0;
						normals[ currentCoordinate + 2 ] = 1;

					}

					currentCoordinate += 3;

					if ( uvs ) {

						uvs[ currentCoordinateUV ] = u;
						uvs[ currentCoordinateUV + 1 ] = v;

						currentCoordinateUV += 2;

					}

				}

				numVertices += 3;

			}

			function makeCircularSector( center, p1, p2, u, v ) {

				// param p1, p2: Points in the circle arc.
				// p1 and p2 are in clockwise direction.

				tempV2_1.copy( p1 ).sub( center ).normalize();
				tempV2_2.copy( p2 ).sub( center ).normalize();

				var angle = Math.PI;
				var dot = tempV2_1.dot( tempV2_2 );
				if ( Math.abs( dot ) < 1 ) angle = Math.abs( Math.acos( dot ) );

				angle /= arcDivisions;

				tempV2_3.copy( p1 );

				for ( var i = 0, il = arcDivisions - 1; i < il; i ++ ) {

					tempV2_4.copy( tempV2_3 ).rotateAround( center, angle );

					addVertex( tempV2_3, u, v );
					addVertex( tempV2_4, u, v );
					addVertex( center, u, 0.5 );

					tempV2_3.copy( tempV2_4 );

				}

				addVertex( tempV2_4, u, v );
				addVertex( p2, u, v );
				addVertex( center, u, 0.5 );

			}

			function makeSegmentTriangles() {

				addVertex( lastPointR, u0, 1 );
				addVertex( lastPointL, u0, 0 );
				addVertex( currentPointL, u1, 0 );

				addVertex( lastPointR, u0, 1 );
				addVertex( currentPointL, u1, 1 );
				addVertex( currentPointR, u1, 0 );

			}

			function makeSegmentWithBevelJoin( joinIsOnLeftSide, innerSideModified, u ) {

				if ( innerSideModified ) {

					// Optimized segment + bevel triangles

					if ( joinIsOnLeftSide ) {

						// Path segments triangles

						addVertex( lastPointR, u0, 1 );
						addVertex( lastPointL, u0, 0 );
						addVertex( currentPointL, u1, 0 );

						addVertex( lastPointR, u0, 1 );
						addVertex( currentPointL, u1, 0 );
						addVertex( innerPoint, u1, 1 );

						// Bevel join triangle

						addVertex( currentPointL, u, 0 );
						addVertex( nextPointL, u, 0 );
						addVertex( innerPoint, u, 0.5 );

					} else {

						// Path segments triangles

						addVertex( lastPointR, u0, 1 );
						addVertex( lastPointL, u0, 0 );
						addVertex( currentPointR, u1, 1 );

						addVertex( lastPointL, u0, 0 );
						addVertex( innerPoint, u1, 0 );
						addVertex( currentPointR, u1, 1 );

						// Bevel join triangle

						addVertex( currentPointR, u, 1 );
						addVertex( nextPointR, u, 0 );
						addVertex( innerPoint, u, 0.5 );

					}

				} else {

					// Bevel join triangle. The segment triangles are done in the main loop

					if ( joinIsOnLeftSide ) {

						addVertex( currentPointL, u, 0 );
						addVertex( nextPointL, u, 0 );
						addVertex( currentPoint, u, 0.5 );

					} else {

						addVertex( currentPointR, u, 1 );
						addVertex( nextPointR, u, 0 );
						addVertex( currentPoint, u, 0.5 );

					}

				}

			}

			function createSegmentTrianglesWithMiddleSection( joinIsOnLeftSide, innerSideModified ) {

				if ( innerSideModified ) {

					if ( joinIsOnLeftSide ) {

						addVertex( lastPointR, u0, 1 );
						addVertex( lastPointL, u0, 0 );
						addVertex( currentPointL, u1, 0 );

						addVertex( lastPointR, u0, 1 );
						addVertex( currentPointL, u1, 0 );
						addVertex( innerPoint, u1, 1 );

						addVertex( currentPointL, u0, 0 );
						addVertex( currentPoint, u1, 0.5 );
						addVertex( innerPoint, u1, 1 );

						addVertex( currentPoint, u1, 0.5 );
						addVertex( nextPointL, u0, 0 );
						addVertex( innerPoint, u1, 1 );

					} else {

						addVertex( lastPointR, u0, 1 );
						addVertex( lastPointL, u0, 0 );
						addVertex( currentPointR, u1, 1 );

						addVertex( lastPointL, u0, 0 );
						addVertex( innerPoint, u1, 0 );
						addVertex( currentPointR, u1, 1 );

						addVertex( currentPointR, u0, 1 );
						addVertex( innerPoint, u1, 0 );
						addVertex( currentPoint, u1, 0.5 );

						addVertex( currentPoint, u1, 0.5 );
						addVertex( innerPoint, u1, 0 );
						addVertex( nextPointR, u0, 1 );

					}

				}

			}

			function addCapGeometry( center, p1, p2, joinIsOnLeftSide, start, u ) {

				// param center: End point of the path
				// param p1, p2: Left and right cap points

				switch ( style.strokeLineCap ) {

					case 'round':

						if ( start ) {

							makeCircularSector( center, p2, p1, u, 0.5 );

						} else {

							makeCircularSector( center, p1, p2, u, 0.5 );

						}

						break;

					case 'square':

						if ( start ) {

							tempV2_1.subVectors( p1, center );
							tempV2_2.set( tempV2_1.y, - tempV2_1.x );

							tempV2_3.addVectors( tempV2_1, tempV2_2 ).add( center );
							tempV2_4.subVectors( tempV2_2, tempV2_1 ).add( center );

							// Modify already existing vertices
							if ( joinIsOnLeftSide ) {

								tempV2_3.toArray( vertices, 1 * 3 );
								tempV2_4.toArray( vertices, 0 * 3 );
								tempV2_4.toArray( vertices, 3 * 3 );

							} else {

								tempV2_3.toArray( vertices, 1 * 3 );
								tempV2_3.toArray( vertices, 3 * 3 );
								tempV2_4.toArray( vertices, 0 * 3 );

							}

						} else {

							tempV2_1.subVectors( p2, center );
							tempV2_2.set( tempV2_1.y, - tempV2_1.x );

							tempV2_3.addVectors( tempV2_1, tempV2_2 ).add( center );
							tempV2_4.subVectors( tempV2_2, tempV2_1 ).add( center );

							var vl = vertices.length;

							// Modify already existing vertices
							if ( joinIsOnLeftSide ) {

								tempV2_3.toArray( vertices, vl - 1 * 3 );
								tempV2_4.toArray( vertices, vl - 2 * 3 );
								tempV2_4.toArray( vertices, vl - 4 * 3 );

							} else {

								tempV2_3.toArray( vertices, vl - 2 * 3 );
								tempV2_4.toArray( vertices, vl - 1 * 3 );
								tempV2_4.toArray( vertices, vl - 4 * 3 );

							}

						}

						break;

					case 'butt':
					default:

						// Nothing to do here
						break;

				}

			}

			function removeDuplicatedPoints( points ) {

				// Creates a new array if necessary with duplicated points removed.
				// This does not remove duplicated initial and ending points of a closed path.

				var dupPoints = false;
				for ( var i = 1, n = points.length - 1; i < n; i ++ ) {

					if ( points[ i ].distanceTo( points[ i + 1 ] ) < minDistance ) {

						dupPoints = true;
						break;

					}

				}

				if ( ! dupPoints ) return points;

				var newPoints = [];
				newPoints.push( points[ 0 ] );

				for ( var i = 1, n = points.length - 1; i < n; i ++ ) {

					if ( points[ i ].distanceTo( points[ i + 1 ] ) >= minDistance ) {

						newPoints.push( points[ i ] );

					}

				}

				newPoints.push( points[ points.length - 1 ] );

				return newPoints;

			}

		};

	}();
	
	return THREE.SVGLoader;
});

define('skylark-threejs-ex/loaders/TDSLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * Autodesk 3DS three.js file loader, based on lib3ds.
	 *
	 * Loads geometry with uv and materials basic properties with texture support.
	 *
	 * @author @tentone
	 * @author @timknip
	 * @class TDSLoader
	 * @constructor
	 */

	THREE.TDSLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

		this.debug = false;

		this.group = null;
		this.position = 0;

		this.materials = [];
		this.meshes = [];

	};

	THREE.TDSLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.TDSLoader,

		/**
		 * Load 3ds file from url.
		 *
		 * @method load
		 * @param {[type]} url URL for the file.
		 * @param {Function} onLoad onLoad callback, receives group Object3D as argument.
		 * @param {Function} onProgress onProgress callback.
		 * @param {Function} onError onError callback.
		 */
		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = ( scope.path === '' ) ? THREE.LoaderUtils.extractUrlBase( url ) : scope.path;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );

			loader.load( url, function ( data ) {

				onLoad( scope.parse( data, path ) );

			}, onProgress, onError );

		},

		/**
		 * Parse arraybuffer data and load 3ds file.
		 *
		 * @method parse
		 * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
		 * @param {String} path Path for external resources.
		 * @return {Group} Group loaded from 3ds file.
		 */
		parse: function ( arraybuffer, path ) {

			this.group = new THREE.Group();
			this.position = 0;
			this.materials = [];
			this.meshes = [];

			this.readFile( arraybuffer, path );

			for ( var i = 0; i < this.meshes.length; i ++ ) {

				this.group.add( this.meshes[ i ] );

			}

			return this.group;

		},

		/**
		 * Decode file content to read 3ds data.
		 *
		 * @method readFile
		 * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
		 * @param {String} path Path for external resources.
		 */
		readFile: function ( arraybuffer, path ) {

			var data = new DataView( arraybuffer );
			var chunk = this.readChunk( data );

			if ( chunk.id === MLIBMAGIC || chunk.id === CMAGIC || chunk.id === M3DMAGIC ) {

				var next = this.nextChunk( data, chunk );

				while ( next !== 0 ) {

					if ( next === M3D_VERSION ) {

						var version = this.readDWord( data );
						this.debugMessage( '3DS file version: ' + version );

					} else if ( next === MDATA ) {

						this.resetPosition( data );
						this.readMeshData( data, path );

					} else {

						this.debugMessage( 'Unknown main chunk: ' + next.toString( 16 ) );

					}

					next = this.nextChunk( data, chunk );

				}

			}

			this.debugMessage( 'Parsed ' + this.meshes.length + ' meshes' );

		},

		/**
		 * Read mesh data chunk.
		 *
		 * @method readMeshData
		 * @param {Dataview} data Dataview in use.
		 * @param {String} path Path for external resources.
		 */
		readMeshData: function ( data, path ) {

			var chunk = this.readChunk( data );
			var next = this.nextChunk( data, chunk );

			while ( next !== 0 ) {

				if ( next === MESH_VERSION ) {

					var version = + this.readDWord( data );
					this.debugMessage( 'Mesh Version: ' + version );

				} else if ( next === MASTER_SCALE ) {

					var scale = this.readFloat( data );
					this.debugMessage( 'Master scale: ' + scale );
					this.group.scale.set( scale, scale, scale );

				} else if ( next === NAMED_OBJECT ) {

					this.debugMessage( 'Named Object' );
					this.resetPosition( data );
					this.readNamedObject( data );

				} else if ( next === MAT_ENTRY ) {

					this.debugMessage( 'Material' );
					this.resetPosition( data );
					this.readMaterialEntry( data, path );

				} else {

					this.debugMessage( 'Unknown MDATA chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

		},

		/**
		 * Read named object chunk.
		 *
		 * @method readNamedObject
		 * @param {Dataview} data Dataview in use.
		 */
		readNamedObject: function ( data ) {

			var chunk = this.readChunk( data );
			var name = this.readString( data, 64 );
			chunk.cur = this.position;

			var next = this.nextChunk( data, chunk );
			while ( next !== 0 ) {

				if ( next === N_TRI_OBJECT ) {

					this.resetPosition( data );
					var mesh = this.readMesh( data );
					mesh.name = name;
					this.meshes.push( mesh );

				} else {

					this.debugMessage( 'Unknown named object chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );

		},

		/**
		 * Read material data chunk and add it to the material list.
		 *
		 * @method readMaterialEntry
		 * @param {Dataview} data Dataview in use.
		 * @param {String} path Path for external resources.
		 */
		readMaterialEntry: function ( data, path ) {

			var chunk = this.readChunk( data );
			var next = this.nextChunk( data, chunk );
			var material = new THREE.MeshPhongMaterial();

			while ( next !== 0 ) {

				if ( next === MAT_NAME ) {

					material.name = this.readString( data, 64 );
					this.debugMessage( '   Name: ' + material.name );

				} else if ( next === MAT_WIRE ) {

					this.debugMessage( '   Wireframe' );
					material.wireframe = true;

				} else if ( next === MAT_WIRE_SIZE ) {

					var value = this.readByte( data );
					material.wireframeLinewidth = value;
					this.debugMessage( '   Wireframe Thickness: ' + value );

				} else if ( next === MAT_TWO_SIDE ) {

					material.side = THREE.DoubleSide;
					this.debugMessage( '   DoubleSided' );

				} else if ( next === MAT_ADDITIVE ) {

					this.debugMessage( '   Additive Blending' );
					material.blending = THREE.AdditiveBlending;

				} else if ( next === MAT_DIFFUSE ) {

					this.debugMessage( '   Diffuse Color' );
					material.color = this.readColor( data );

				} else if ( next === MAT_SPECULAR ) {

					this.debugMessage( '   Specular Color' );
					material.specular = this.readColor( data );

				} else if ( next === MAT_AMBIENT ) {

					this.debugMessage( '   Ambient color' );
					material.color = this.readColor( data );

				} else if ( next === MAT_SHININESS ) {

					var shininess = this.readWord( data );
					material.shininess = shininess;
					this.debugMessage( '   Shininess : ' + shininess );

				} else if ( next === MAT_TRANSPARENCY ) {

					var opacity = this.readWord( data );
					material.opacity = opacity * 0.01;
					this.debugMessage( '  Opacity : ' + opacity );
					material.transparent = opacity < 100 ? true : false;

				} else if ( next === MAT_TEXMAP ) {

					this.debugMessage( '   ColorMap' );
					this.resetPosition( data );
					material.map = this.readMap( data, path );

				} else if ( next === MAT_BUMPMAP ) {

					this.debugMessage( '   BumpMap' );
					this.resetPosition( data );
					material.bumpMap = this.readMap( data, path );

				} else if ( next === MAT_OPACMAP ) {

					this.debugMessage( '   OpacityMap' );
					this.resetPosition( data );
					material.alphaMap = this.readMap( data, path );

				} else if ( next === MAT_SPECMAP ) {

					this.debugMessage( '   SpecularMap' );
					this.resetPosition( data );
					material.specularMap = this.readMap( data, path );

				} else {

					this.debugMessage( '   Unknown material chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );

			this.materials[ material.name ] = material;

		},

		/**
		 * Read mesh data chunk.
		 *
		 * @method readMesh
		 * @param {Dataview} data Dataview in use.
		 * @return {Mesh} The parsed mesh.
		 */
		readMesh: function ( data ) {

			var chunk = this.readChunk( data );
			var next = this.nextChunk( data, chunk );

			var geometry = new THREE.BufferGeometry();
			var uvs = [];

			var material = new THREE.MeshPhongMaterial();
			var mesh = new THREE.Mesh( geometry, material );
			mesh.name = 'mesh';

			while ( next !== 0 ) {

				if ( next === POINT_ARRAY ) {

					var points = this.readWord( data );

					this.debugMessage( '   Vertex: ' + points );

					//BufferGeometry

					var vertices = [];

					for ( var i = 0; i < points; i ++ )		{

						vertices.push( this.readFloat( data ) );
						vertices.push( this.readFloat( data ) );
						vertices.push( this.readFloat( data ) );

					}

					geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

				} else if ( next === FACE_ARRAY ) {

					this.resetPosition( data );
					this.readFaceArray( data, mesh );

				} else if ( next === TEX_VERTS ) {

					var texels = this.readWord( data );

					this.debugMessage( '   UV: ' + texels );

					//BufferGeometry

					var uvs = [];

					for ( var i = 0; i < texels; i ++ )		{

						uvs.push( this.readFloat( data ) );
						uvs.push( this.readFloat( data ) );

					}

					geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );


				} else if ( next === MESH_MATRIX ) {

					this.debugMessage( '   Tranformation Matrix (TODO)' );

					var values = [];
					for ( var i = 0; i < 12; i ++ ) {

						values[ i ] = this.readFloat( data );

					}

					var matrix = new THREE.Matrix4();

					//X Line
					matrix.elements[ 0 ] = values[ 0 ];
					matrix.elements[ 1 ] = values[ 6 ];
					matrix.elements[ 2 ] = values[ 3 ];
					matrix.elements[ 3 ] = values[ 9 ];

					//Y Line
					matrix.elements[ 4 ] = values[ 2 ];
					matrix.elements[ 5 ] = values[ 8 ];
					matrix.elements[ 6 ] = values[ 5 ];
					matrix.elements[ 7 ] = values[ 11 ];

					//Z Line
					matrix.elements[ 8 ] = values[ 1 ];
					matrix.elements[ 9 ] = values[ 7 ];
					matrix.elements[ 10 ] = values[ 4 ];
					matrix.elements[ 11 ] = values[ 10 ];

					//W Line
					matrix.elements[ 12 ] = 0;
					matrix.elements[ 13 ] = 0;
					matrix.elements[ 14 ] = 0;
					matrix.elements[ 15 ] = 1;

					matrix.transpose();

					var inverse = new THREE.Matrix4();
					inverse.getInverse( matrix );
					geometry.applyMatrix4( inverse );

					matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

				} else {

					this.debugMessage( '   Unknown mesh chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );

			geometry.computeVertexNormals();

			return mesh;

		},

		/**
		 * Read face array data chunk.
		 *
		 * @method readFaceArray
		 * @param {Dataview} data Dataview in use.
		 * @param {Mesh} mesh Mesh to be filled with the data read.
		 */
		readFaceArray: function ( data, mesh ) {

			var chunk = this.readChunk( data );
			var faces = this.readWord( data );

			this.debugMessage( '   Faces: ' + faces );

			var index = [];

			for ( var i = 0; i < faces; ++ i ) {

				index.push( this.readWord( data ), this.readWord( data ), this.readWord( data ) );

				this.readWord( data ); // visibility

			}

			mesh.geometry.setIndex( index );

			//The rest of the FACE_ARRAY chunk is subchunks

			while ( this.position < chunk.end ) {

				var chunk = this.readChunk( data );

				if ( chunk.id === MSH_MAT_GROUP ) {

					this.debugMessage( '      Material Group' );

					this.resetPosition( data );

					var group = this.readMaterialGroup( data );

					var material = this.materials[ group.name ];

					if ( material !== undefined )	{

						mesh.material = material;

						if ( material.name === '' )		{

							material.name = mesh.name;

						}

					}

				} else {

					this.debugMessage( '      Unknown face array chunk: ' + chunk.toString( 16 ) );

				}

				this.endChunk( chunk );

			}

			this.endChunk( chunk );

		},

		/**
		 * Read texture map data chunk.
		 *
		 * @method readMap
		 * @param {Dataview} data Dataview in use.
		 * @param {String} path Path for external resources.
		 * @return {Texture} Texture read from this data chunk.
		 */
		readMap: function ( data, path ) {

			var chunk = this.readChunk( data );
			var next = this.nextChunk( data, chunk );
			var texture = {};

			var loader = new THREE.TextureLoader( this.manager );
			loader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

			while ( next !== 0 ) {

				if ( next === MAT_MAPNAME ) {

					var name = this.readString( data, 128 );
					texture = loader.load( name );

					this.debugMessage( '      File: ' + path + name );

				} else if ( next === MAT_MAP_UOFFSET ) {

					texture.offset.x = this.readFloat( data );
					this.debugMessage( '      OffsetX: ' + texture.offset.x );

				} else if ( next === MAT_MAP_VOFFSET ) {

					texture.offset.y = this.readFloat( data );
					this.debugMessage( '      OffsetY: ' + texture.offset.y );

				} else if ( next === MAT_MAP_USCALE ) {

					texture.repeat.x = this.readFloat( data );
					this.debugMessage( '      RepeatX: ' + texture.repeat.x );

				} else if ( next === MAT_MAP_VSCALE ) {

					texture.repeat.y = this.readFloat( data );
					this.debugMessage( '      RepeatY: ' + texture.repeat.y );

				} else {

					this.debugMessage( '      Unknown map chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );

			return texture;

		},

		/**
		 * Read material group data chunk.
		 *
		 * @method readMaterialGroup
		 * @param {Dataview} data Dataview in use.
		 * @return {Object} Object with name and index of the object.
		 */
		readMaterialGroup: function ( data ) {

			this.readChunk( data );
			var name = this.readString( data, 64 );
			var numFaces = this.readWord( data );

			this.debugMessage( '         Name: ' + name );
			this.debugMessage( '         Faces: ' + numFaces );

			var index = [];
			for ( var i = 0; i < numFaces; ++ i ) {

				index.push( this.readWord( data ) );

			}

			return { name: name, index: index };

		},

		/**
		 * Read a color value.
		 *
		 * @method readColor
		 * @param {DataView} data Dataview.
		 * @return {Color} Color value read..
		 */
		readColor: function ( data ) {

			var chunk = this.readChunk( data );
			var color = new THREE.Color();

			if ( chunk.id === COLOR_24 || chunk.id === LIN_COLOR_24 ) {

				var r = this.readByte( data );
				var g = this.readByte( data );
				var b = this.readByte( data );

				color.setRGB( r / 255, g / 255, b / 255 );

				this.debugMessage( '      Color: ' + color.r + ', ' + color.g + ', ' + color.b );

			}	else if ( chunk.id === COLOR_F || chunk.id === LIN_COLOR_F ) {

				var r = this.readFloat( data );
				var g = this.readFloat( data );
				var b = this.readFloat( data );

				color.setRGB( r, g, b );

				this.debugMessage( '      Color: ' + color.r + ', ' + color.g + ', ' + color.b );

			}	else {

				this.debugMessage( '      Unknown color chunk: ' + chunk.toString( 16 ) );

			}

			this.endChunk( chunk );
			return color;

		},

		/**
		 * Read next chunk of data.
		 *
		 * @method readChunk
		 * @param {DataView} data Dataview.
		 * @return {Object} Chunk of data read.
		 */
		readChunk: function ( data ) {

			var chunk = {};

			chunk.cur = this.position;
			chunk.id = this.readWord( data );
			chunk.size = this.readDWord( data );
			chunk.end = chunk.cur + chunk.size;
			chunk.cur += 6;

			return chunk;

		},

		/**
		 * Set position to the end of the current chunk of data.
		 *
		 * @method endChunk
		 * @param {Object} chunk Data chunk.
		 */
		endChunk: function ( chunk ) {

			this.position = chunk.end;

		},

		/**
		 * Move to the next data chunk.
		 *
		 * @method nextChunk
		 * @param {DataView} data Dataview.
		 * @param {Object} chunk Data chunk.
		 */
		nextChunk: function ( data, chunk ) {

			if ( chunk.cur >= chunk.end ) {

				return 0;

			}

			this.position = chunk.cur;

			try {

				var next = this.readChunk( data );
				chunk.cur += next.size;
				return next.id;

			}	catch ( e ) {

				this.debugMessage( 'Unable to read chunk at ' + this.position );
				return 0;

			}

		},

		/**
		 * Reset dataview position.
		 *
		 * @method resetPosition
		 */
		resetPosition: function () {

			this.position -= 6;

		},

		/**
		 * Read byte value.
		 *
		 * @method readByte
		 * @param {DataView} data Dataview to read data from.
		 * @return {Number} Data read from the dataview.
		 */
		readByte: function ( data ) {

			var v = data.getUint8( this.position, true );
			this.position += 1;
			return v;

		},

		/**
		 * Read 32 bit float value.
		 *
		 * @method readFloat
		 * @param {DataView} data Dataview to read data from.
		 * @return {Number} Data read from the dataview.
		 */
		readFloat: function ( data ) {

			try {

				var v = data.getFloat32( this.position, true );
				this.position += 4;
				return v;

			}	catch ( e ) {

				this.debugMessage( e + ' ' + this.position + ' ' + data.byteLength );

			}

		},

		/**
		 * Read 32 bit signed integer value.
		 *
		 * @method readInt
		 * @param {DataView} data Dataview to read data from.
		 * @return {Number} Data read from the dataview.
		 */
		readInt: function ( data ) {

			var v = data.getInt32( this.position, true );
			this.position += 4;
			return v;

		},

		/**
		 * Read 16 bit signed integer value.
		 *
		 * @method readShort
		 * @param {DataView} data Dataview to read data from.
		 * @return {Number} Data read from the dataview.
		 */
		readShort: function ( data ) {

			var v = data.getInt16( this.position, true );
			this.position += 2;
			return v;

		},

		/**
		 * Read 64 bit unsigned integer value.
		 *
		 * @method readDWord
		 * @param {DataView} data Dataview to read data from.
		 * @return {Number} Data read from the dataview.
		 */
		readDWord: function ( data ) {

			var v = data.getUint32( this.position, true );
			this.position += 4;
			return v;

		},

		/**
		 * Read 32 bit unsigned integer value.
		 *
		 * @method readWord
		 * @param {DataView} data Dataview to read data from.
		 * @return {Number} Data read from the dataview.
		 */
		readWord: function ( data ) {

			var v = data.getUint16( this.position, true );
			this.position += 2;
			return v;

		},

		/**
		 * Read string value.
		 *
		 * @method readString
		 * @param {DataView} data Dataview to read data from.
		 * @param {Number} maxLength Max size of the string to be read.
		 * @return {String} Data read from the dataview.
		 */
		readString: function ( data, maxLength ) {

			var s = '';

			for ( var i = 0; i < maxLength; i ++ ) {

				var c = this.readByte( data );
				if ( ! c ) {

					break;

				}

				s += String.fromCharCode( c );

			}

			return s;

		},

		/**
		 * Print debug message to the console.
		 *
		 * Is controlled by a flag to show or hide debug messages.
		 *
		 * @method debugMessage
		 * @param {Object} message Debug message to print to the console.
		 */
		debugMessage: function ( message ) {

			if ( this.debug ) {

				console.log( message );

			}

		}

	} );

	// var NULL_CHUNK = 0x0000;
	var M3DMAGIC = 0x4D4D;
	// var SMAGIC = 0x2D2D;
	// var LMAGIC = 0x2D3D;
	var MLIBMAGIC = 0x3DAA;
	// var MATMAGIC = 0x3DFF;
	var CMAGIC = 0xC23D;
	var M3D_VERSION = 0x0002;
	// var M3D_KFVERSION = 0x0005;
	var COLOR_F = 0x0010;
	var COLOR_24 = 0x0011;
	var LIN_COLOR_24 = 0x0012;
	var LIN_COLOR_F = 0x0013;
	// var INT_PERCENTAGE = 0x0030;
	// var FLOAT_PERCENTAGE = 0x0031;
	var MDATA = 0x3D3D;
	var MESH_VERSION = 0x3D3E;
	var MASTER_SCALE = 0x0100;
	// var LO_SHADOW_BIAS = 0x1400;
	// var HI_SHADOW_BIAS = 0x1410;
	// var SHADOW_MAP_SIZE = 0x1420;
	// var SHADOW_SAMPLES = 0x1430;
	// var SHADOW_RANGE = 0x1440;
	// var SHADOW_FILTER = 0x1450;
	// var RAY_BIAS = 0x1460;
	// var O_CONSTS = 0x1500;
	// var AMBIENT_LIGHT = 0x2100;
	// var BIT_MAP = 0x1100;
	// var SOLID_BGND = 0x1200;
	// var V_GRADIENT = 0x1300;
	// var USE_BIT_MAP = 0x1101;
	// var USE_SOLID_BGND = 0x1201;
	// var USE_V_GRADIENT = 0x1301;
	// var FOG = 0x2200;
	// var FOG_BGND = 0x2210;
	// var LAYER_FOG = 0x2302;
	// var DISTANCE_CUE = 0x2300;
	// var DCUE_BGND = 0x2310;
	// var USE_FOG = 0x2201;
	// var USE_LAYER_FOG = 0x2303;
	// var USE_DISTANCE_CUE = 0x2301;
	var MAT_ENTRY = 0xAFFF;
	var MAT_NAME = 0xA000;
	var MAT_AMBIENT = 0xA010;
	var MAT_DIFFUSE = 0xA020;
	var MAT_SPECULAR = 0xA030;
	var MAT_SHININESS = 0xA040;
	// var MAT_SHIN2PCT = 0xA041;
	var MAT_TRANSPARENCY = 0xA050;
	// var MAT_XPFALL = 0xA052;
	// var MAT_USE_XPFALL = 0xA240;
	// var MAT_REFBLUR = 0xA053;
	// var MAT_SHADING = 0xA100;
	// var MAT_USE_REFBLUR = 0xA250;
	// var MAT_SELF_ILLUM = 0xA084;
	var MAT_TWO_SIDE = 0xA081;
	// var MAT_DECAL = 0xA082;
	var MAT_ADDITIVE = 0xA083;
	var MAT_WIRE = 0xA085;
	// var MAT_FACEMAP = 0xA088;
	// var MAT_TRANSFALLOFF_IN = 0xA08A;
	// var MAT_PHONGSOFT = 0xA08C;
	// var MAT_WIREABS = 0xA08E;
	var MAT_WIRE_SIZE = 0xA087;
	var MAT_TEXMAP = 0xA200;
	// var MAT_SXP_TEXT_DATA = 0xA320;
	// var MAT_TEXMASK = 0xA33E;
	// var MAT_SXP_TEXTMASK_DATA = 0xA32A;
	// var MAT_TEX2MAP = 0xA33A;
	// var MAT_SXP_TEXT2_DATA = 0xA321;
	// var MAT_TEX2MASK = 0xA340;
	// var MAT_SXP_TEXT2MASK_DATA = 0xA32C;
	var MAT_OPACMAP = 0xA210;
	// var MAT_SXP_OPAC_DATA = 0xA322;
	// var MAT_OPACMASK = 0xA342;
	// var MAT_SXP_OPACMASK_DATA = 0xA32E;
	var MAT_BUMPMAP = 0xA230;
	// var MAT_SXP_BUMP_DATA = 0xA324;
	// var MAT_BUMPMASK = 0xA344;
	// var MAT_SXP_BUMPMASK_DATA = 0xA330;
	var MAT_SPECMAP = 0xA204;
	// var MAT_SXP_SPEC_DATA = 0xA325;
	// var MAT_SPECMASK = 0xA348;
	// var MAT_SXP_SPECMASK_DATA = 0xA332;
	// var MAT_SHINMAP = 0xA33C;
	// var MAT_SXP_SHIN_DATA = 0xA326;
	// var MAT_SHINMASK = 0xA346;
	// var MAT_SXP_SHINMASK_DATA = 0xA334;
	// var MAT_SELFIMAP = 0xA33D;
	// var MAT_SXP_SELFI_DATA = 0xA328;
	// var MAT_SELFIMASK = 0xA34A;
	// var MAT_SXP_SELFIMASK_DATA = 0xA336;
	// var MAT_REFLMAP = 0xA220;
	// var MAT_REFLMASK = 0xA34C;
	// var MAT_SXP_REFLMASK_DATA = 0xA338;
	// var MAT_ACUBIC = 0xA310;
	var MAT_MAPNAME = 0xA300;
	// var MAT_MAP_TILING = 0xA351;
	// var MAT_MAP_TEXBLUR = 0xA353;
	var MAT_MAP_USCALE = 0xA354;
	var MAT_MAP_VSCALE = 0xA356;
	var MAT_MAP_UOFFSET = 0xA358;
	var MAT_MAP_VOFFSET = 0xA35A;
	// var MAT_MAP_ANG = 0xA35C;
	// var MAT_MAP_COL1 = 0xA360;
	// var MAT_MAP_COL2 = 0xA362;
	// var MAT_MAP_RCOL = 0xA364;
	// var MAT_MAP_GCOL = 0xA366;
	// var MAT_MAP_BCOL = 0xA368;
	var NAMED_OBJECT = 0x4000;
	// var N_DIRECT_LIGHT = 0x4600;
	// var DL_OFF = 0x4620;
	// var DL_OUTER_RANGE = 0x465A;
	// var DL_INNER_RANGE = 0x4659;
	// var DL_MULTIPLIER = 0x465B;
	// var DL_EXCLUDE = 0x4654;
	// var DL_ATTENUATE = 0x4625;
	// var DL_SPOTLIGHT = 0x4610;
	// var DL_SPOT_ROLL = 0x4656;
	// var DL_SHADOWED = 0x4630;
	// var DL_LOCAL_SHADOW2 = 0x4641;
	// var DL_SEE_CONE = 0x4650;
	// var DL_SPOT_RECTANGULAR = 0x4651;
	// var DL_SPOT_ASPECT = 0x4657;
	// var DL_SPOT_PROJECTOR = 0x4653;
	// var DL_SPOT_OVERSHOOT = 0x4652;
	// var DL_RAY_BIAS = 0x4658;
	// var DL_RAYSHAD = 0x4627;
	// var N_CAMERA = 0x4700;
	// var CAM_SEE_CONE = 0x4710;
	// var CAM_RANGES = 0x4720;
	// var OBJ_HIDDEN = 0x4010;
	// var OBJ_VIS_LOFTER = 0x4011;
	// var OBJ_DOESNT_CAST = 0x4012;
	// var OBJ_DONT_RECVSHADOW = 0x4017;
	// var OBJ_MATTE = 0x4013;
	// var OBJ_FAST = 0x4014;
	// var OBJ_PROCEDURAL = 0x4015;
	// var OBJ_FROZEN = 0x4016;
	var N_TRI_OBJECT = 0x4100;
	var POINT_ARRAY = 0x4110;
	// var POINT_FLAG_ARRAY = 0x4111;
	var FACE_ARRAY = 0x4120;
	var MSH_MAT_GROUP = 0x4130;
	// var SMOOTH_GROUP = 0x4150;
	// var MSH_BOXMAP = 0x4190;
	var TEX_VERTS = 0x4140;
	var MESH_MATRIX = 0x4160;
	// var MESH_COLOR = 0x4165;
	// var MESH_TEXTURE_INFO = 0x4170;
	// var KFDATA = 0xB000;
	// var KFHDR = 0xB00A;
	// var KFSEG = 0xB008;
	// var KFCURTIME = 0xB009;
	// var AMBIENT_NODE_TAG = 0xB001;
	// var OBJECT_NODE_TAG = 0xB002;
	// var CAMERA_NODE_TAG = 0xB003;
	// var TARGET_NODE_TAG = 0xB004;
	// var LIGHT_NODE_TAG = 0xB005;
	// var L_TARGET_NODE_TAG = 0xB006;
	// var SPOTLIGHT_NODE_TAG = 0xB007;
	// var NODE_ID = 0xB030;
	// var NODE_HDR = 0xB010;
	// var PIVOT = 0xB013;
	// var INSTANCE_NAME = 0xB011;
	// var MORPH_SMOOTH = 0xB015;
	// var BOUNDBOX = 0xB014;
	// var POS_TRACK_TAG = 0xB020;
	// var COL_TRACK_TAG = 0xB025;
	// var ROT_TRACK_TAG = 0xB021;
	// var SCL_TRACK_TAG = 0xB022;
	// var MORPH_TRACK_TAG = 0xB026;
	// var FOV_TRACK_TAG = 0xB023;
	// var ROLL_TRACK_TAG = 0xB024;
	// var HOT_TRACK_TAG = 0xB027;
	// var FALL_TRACK_TAG = 0xB028;
	// var HIDE_TRACK_TAG = 0xB029;
	// var POLY_2D = 0x5000;
	// var SHAPE_OK = 0x5010;
	// var SHAPE_NOT_OK = 0x5011;
	// var SHAPE_HOOK = 0x5020;
	// var PATH_3D = 0x6000;
	// var PATH_MATRIX = 0x6005;
	// var SHAPE_2D = 0x6010;
	// var M_SCALE = 0x6020;
	// var M_TWIST = 0x6030;
	// var M_TEETER = 0x6040;
	// var M_FIT = 0x6050;
	// var M_BEVEL = 0x6060;
	// var XZ_CURVE = 0x6070;
	// var YZ_CURVE = 0x6080;
	// var INTERPCT = 0x6090;
	// var DEFORM_LIMIT = 0x60A0;
	// var USE_CONTOUR = 0x6100;
	// var USE_TWEEN = 0x6110;
	// var USE_SCALE = 0x6120;
	// var USE_TWIST = 0x6130;
	// var USE_TEETER = 0x6140;
	// var USE_FIT = 0x6150;
	// var USE_BEVEL = 0x6160;
	// var DEFAULT_VIEW = 0x3000;
	// var VIEW_TOP = 0x3010;
	// var VIEW_BOTTOM = 0x3020;
	// var VIEW_LEFT = 0x3030;
	// var VIEW_RIGHT = 0x3040;
	// var VIEW_FRONT = 0x3050;
	// var VIEW_BACK = 0x3060;
	// var VIEW_USER = 0x3070;
	// var VIEW_CAMERA = 0x3080;
	// var VIEW_WINDOW = 0x3090;
	// var VIEWPORT_LAYOUT_OLD = 0x7000;
	// var VIEWPORT_DATA_OLD = 0x7010;
	// var VIEWPORT_LAYOUT = 0x7001;
	// var VIEWPORT_DATA = 0x7011;
	// var VIEWPORT_DATA_3 = 0x7012;
	// var VIEWPORT_SIZE = 0x7020;
	// var NETWORK_VIEW = 0x7030;
	
	return THREE.TDSLoader;
});

define('skylark-threejs-ex/loaders/VTKLoader',[
	"skylark-threejs"
],function(THREE,Zlib){
	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author Alex Pletzer
	 *
	 * Updated on 22.03.2017
	 * VTK header is now parsed and used to extract all the compressed data
	 * @author Andrii Iudin https://github.com/andreyyudin
	 * @author Paul Kibet Korir https://github.com/polarise
	 * @author Sriram Somasundharam https://github.com/raamssundar
	 */

	THREE.VTKLoader = function ( manager ) {

		THREE.Loader.call( this, manager );

	};

	THREE.VTKLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: THREE.VTKLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text ) );

			}, onProgress, onError );

		},

		parse: function ( data ) {

			function parseASCII( data ) {

				// connectivity of the triangles
				var indices = [];

				// triangles vertices
				var positions = [];

				// red, green, blue colors in the range 0 to 1
				var colors = [];

				// normal vector, one per vertex
				var normals = [];

				var result;

				// pattern for detecting the end of a number sequence
				var patWord = /^[^\d.\s-]+/;

				// pattern for reading vertices, 3 floats or integers
				var pat3Floats = /(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)/g;

				// pattern for connectivity, an integer followed by any number of ints
				// the first integer is the number of polygon nodes
				var patConnectivity = /^(\d+)\s+([\s\d]*)/;

				// indicates start of vertex data section
				var patPOINTS = /^POINTS /;

				// indicates start of polygon connectivity section
				var patPOLYGONS = /^POLYGONS /;

				// indicates start of triangle strips section
				var patTRIANGLE_STRIPS = /^TRIANGLE_STRIPS /;

				// POINT_DATA number_of_values
				var patPOINT_DATA = /^POINT_DATA[ ]+(\d+)/;

				// CELL_DATA number_of_polys
				var patCELL_DATA = /^CELL_DATA[ ]+(\d+)/;

				// Start of color section
				var patCOLOR_SCALARS = /^COLOR_SCALARS[ ]+(\w+)[ ]+3/;

				// NORMALS Normals float
				var patNORMALS = /^NORMALS[ ]+(\w+)[ ]+(\w+)/;

				var inPointsSection = false;
				var inPolygonsSection = false;
				var inTriangleStripSection = false;
				var inPointDataSection = false;
				var inCellDataSection = false;
				var inColorSection = false;
				var inNormalsSection = false;

				var lines = data.split( '\n' );

				for ( var i in lines ) {

					var line = lines[ i ].trim();

					if ( line.indexOf( 'DATASET' ) === 0 ) {

						var dataset = line.split( ' ' )[ 1 ];

						if ( dataset !== 'POLYDATA' ) throw new Error( 'Unsupported DATASET type: ' + dataset );

					} else if ( inPointsSection ) {

						// get the vertices
						while ( ( result = pat3Floats.exec( line ) ) !== null ) {

							if ( patWord.exec( line ) !== null ) break;

							var x = parseFloat( result[ 1 ] );
							var y = parseFloat( result[ 2 ] );
							var z = parseFloat( result[ 3 ] );
							positions.push( x, y, z );

						}

					} else if ( inPolygonsSection ) {

						if ( ( result = patConnectivity.exec( line ) ) !== null ) {

							// numVertices i0 i1 i2 ...
							var numVertices = parseInt( result[ 1 ] );
							var inds = result[ 2 ].split( /\s+/ );

							if ( numVertices >= 3 ) {

								var i0 = parseInt( inds[ 0 ] );
								var i1, i2;
								var k = 1;
								// split the polygon in numVertices - 2 triangles
								for ( var j = 0; j < numVertices - 2; ++ j ) {

									i1 = parseInt( inds[ k ] );
									i2 = parseInt( inds[ k + 1 ] );
									indices.push( i0, i1, i2 );
									k ++;

								}

							}

						}

					} else if ( inTriangleStripSection ) {

						if ( ( result = patConnectivity.exec( line ) ) !== null ) {

							// numVertices i0 i1 i2 ...
							var numVertices = parseInt( result[ 1 ] );
							var inds = result[ 2 ].split( /\s+/ );

							if ( numVertices >= 3 ) {

								var i0, i1, i2;
								// split the polygon in numVertices - 2 triangles
								for ( var j = 0; j < numVertices - 2; j ++ ) {

									if ( j % 2 === 1 ) {

										i0 = parseInt( inds[ j ] );
										i1 = parseInt( inds[ j + 2 ] );
										i2 = parseInt( inds[ j + 1 ] );
										indices.push( i0, i1, i2 );

									} else {

										i0 = parseInt( inds[ j ] );
										i1 = parseInt( inds[ j + 1 ] );
										i2 = parseInt( inds[ j + 2 ] );
										indices.push( i0, i1, i2 );

									}

								}

							}

						}

					} else if ( inPointDataSection || inCellDataSection ) {

						if ( inColorSection ) {

							// Get the colors

							while ( ( result = pat3Floats.exec( line ) ) !== null ) {

								if ( patWord.exec( line ) !== null ) break;

								var r = parseFloat( result[ 1 ] );
								var g = parseFloat( result[ 2 ] );
								var b = parseFloat( result[ 3 ] );
								colors.push( r, g, b );

							}

						} else if ( inNormalsSection ) {

							// Get the normal vectors

							while ( ( result = pat3Floats.exec( line ) ) !== null ) {

								if ( patWord.exec( line ) !== null ) break;

								var nx = parseFloat( result[ 1 ] );
								var ny = parseFloat( result[ 2 ] );
								var nz = parseFloat( result[ 3 ] );
								normals.push( nx, ny, nz );

							}

						}

					}

					if ( patPOLYGONS.exec( line ) !== null ) {

						inPolygonsSection = true;
						inPointsSection = false;
						inTriangleStripSection = false;

					} else if ( patPOINTS.exec( line ) !== null ) {

						inPolygonsSection = false;
						inPointsSection = true;
						inTriangleStripSection = false;

					} else if ( patTRIANGLE_STRIPS.exec( line ) !== null ) {

						inPolygonsSection = false;
						inPointsSection = false;
						inTriangleStripSection = true;

					} else if ( patPOINT_DATA.exec( line ) !== null ) {

						inPointDataSection = true;
						inPointsSection = false;
						inPolygonsSection = false;
						inTriangleStripSection = false;

					} else if ( patCELL_DATA.exec( line ) !== null ) {

						inCellDataSection = true;
						inPointsSection = false;
						inPolygonsSection = false;
						inTriangleStripSection = false;

					} else if ( patCOLOR_SCALARS.exec( line ) !== null ) {

						inColorSection = true;
						inNormalsSection = false;
						inPointsSection = false;
						inPolygonsSection = false;
						inTriangleStripSection = false;

					} else if ( patNORMALS.exec( line ) !== null ) {

						inNormalsSection = true;
						inColorSection = false;
						inPointsSection = false;
						inPolygonsSection = false;
						inTriangleStripSection = false;

					}

				}

				var geometry = new THREE.BufferGeometry();
				geometry.setIndex( indices );
				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

				if ( normals.length === positions.length ) {

					geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

				}

				if ( colors.length !== indices.length ) {

					// stagger

					if ( colors.length === positions.length ) {

						geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

					}

				} else {

					// cell

					geometry = geometry.toNonIndexed();
					var numTriangles = geometry.attributes.position.count / 3;

					if ( colors.length === ( numTriangles * 3 ) ) {

						var newColors = [];

						for ( var i = 0; i < numTriangles; i ++ ) {

							var r = colors[ 3 * i + 0 ];
							var g = colors[ 3 * i + 1 ];
							var b = colors[ 3 * i + 2 ];

							newColors.push( r, g, b );
							newColors.push( r, g, b );
							newColors.push( r, g, b );

						}

						geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( newColors, 3 ) );

					}

				}

				return geometry;

			}

			function parseBinary( data ) {

				var count, pointIndex, i, numberOfPoints, s;
				var buffer = new Uint8Array( data );
				var dataView = new DataView( data );

				// Points and normals, by default, are empty
				var points = [];
				var normals = [];
				var indices = [];

				// Going to make a big array of strings
				var vtk = [];
				var index = 0;

				function findString( buffer, start ) {

					var index = start;
					var c = buffer[ index ];
					var s = [];
					while ( c !== 10 ) {

						s.push( String.fromCharCode( c ) );
						index ++;
						c = buffer[ index ];

					}

					return { start: start,
						end: index,
						next: index + 1,
						parsedString: s.join( '' ) };

				}

				var state, line;

				while ( true ) {

					// Get a string
					state = findString( buffer, index );
					line = state.parsedString;

					if ( line.indexOf( 'DATASET' ) === 0 ) {

						var dataset = line.split( ' ' )[ 1 ];

						if ( dataset !== 'POLYDATA' ) throw new Error( 'Unsupported DATASET type: ' + dataset );

					} else if ( line.indexOf( 'POINTS' ) === 0 ) {

						vtk.push( line );
						// Add the points
						numberOfPoints = parseInt( line.split( ' ' )[ 1 ], 10 );

						// Each point is 3 4-byte floats
						count = numberOfPoints * 4 * 3;

						points = new Float32Array( numberOfPoints * 3 );

						pointIndex = state.next;
						for ( i = 0; i < numberOfPoints; i ++ ) {

							points[ 3 * i ] = dataView.getFloat32( pointIndex, false );
							points[ 3 * i + 1 ] = dataView.getFloat32( pointIndex + 4, false );
							points[ 3 * i + 2 ] = dataView.getFloat32( pointIndex + 8, false );
							pointIndex = pointIndex + 12;

						}
						// increment our next pointer
						state.next = state.next + count + 1;

					} else if ( line.indexOf( 'TRIANGLE_STRIPS' ) === 0 ) {

						var numberOfStrips = parseInt( line.split( ' ' )[ 1 ], 10 );
						var size = parseInt( line.split( ' ' )[ 2 ], 10 );
						// 4 byte integers
						count = size * 4;

						indices = new Uint32Array( 3 * size - 9 * numberOfStrips );
						var indicesIndex = 0;

						pointIndex = state.next;
						for ( i = 0; i < numberOfStrips; i ++ ) {

							// For each strip, read the first value, then record that many more points
							var indexCount = dataView.getInt32( pointIndex, false );
							var strip = [];
							pointIndex += 4;
							for ( s = 0; s < indexCount; s ++ ) {

								strip.push( dataView.getInt32( pointIndex, false ) );
								pointIndex += 4;

							}

							// retrieves the n-2 triangles from the triangle strip
							for ( var j = 0; j < indexCount - 2; j ++ ) {

								if ( j % 2 ) {

									indices[ indicesIndex ++ ] = strip[ j ];
									indices[ indicesIndex ++ ] = strip[ j + 2 ];
									indices[ indicesIndex ++ ] = strip[ j + 1 ];

								} else {


									indices[ indicesIndex ++ ] = strip[ j ];
									indices[ indicesIndex ++ ] = strip[ j + 1 ];
									indices[ indicesIndex ++ ] = strip[ j + 2 ];

								}

							}

						}
						// increment our next pointer
						state.next = state.next + count + 1;

					} else if ( line.indexOf( 'POLYGONS' ) === 0 ) {

						var numberOfStrips = parseInt( line.split( ' ' )[ 1 ], 10 );
						var size = parseInt( line.split( ' ' )[ 2 ], 10 );
						// 4 byte integers
						count = size * 4;

						indices = new Uint32Array( 3 * size - 9 * numberOfStrips );
						var indicesIndex = 0;

						pointIndex = state.next;
						for ( i = 0; i < numberOfStrips; i ++ ) {

							// For each strip, read the first value, then record that many more points
							var indexCount = dataView.getInt32( pointIndex, false );
							var strip = [];
							pointIndex += 4;
							for ( s = 0; s < indexCount; s ++ ) {

								strip.push( dataView.getInt32( pointIndex, false ) );
								pointIndex += 4;

							}

							// divide the polygon in n-2 triangle
							for ( var j = 1; j < indexCount - 1; j ++ ) {

								indices[ indicesIndex ++ ] = strip[ 0 ];
								indices[ indicesIndex ++ ] = strip[ j ];
								indices[ indicesIndex ++ ] = strip[ j + 1 ];

							}

						}
						// increment our next pointer
						state.next = state.next + count + 1;

					} else if ( line.indexOf( 'POINT_DATA' ) === 0 ) {

						numberOfPoints = parseInt( line.split( ' ' )[ 1 ], 10 );

						// Grab the next line
						state = findString( buffer, state.next );

						// Now grab the binary data
						count = numberOfPoints * 4 * 3;

						normals = new Float32Array( numberOfPoints * 3 );
						pointIndex = state.next;
						for ( i = 0; i < numberOfPoints; i ++ ) {

							normals[ 3 * i ] = dataView.getFloat32( pointIndex, false );
							normals[ 3 * i + 1 ] = dataView.getFloat32( pointIndex + 4, false );
							normals[ 3 * i + 2 ] = dataView.getFloat32( pointIndex + 8, false );
							pointIndex += 12;

						}

						// Increment past our data
						state.next = state.next + count;

					}

					// Increment index
					index = state.next;

					if ( index >= buffer.byteLength ) {

						break;

					}

				}

				var geometry = new THREE.BufferGeometry();
				geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
				geometry.setAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );

				if ( normals.length === points.length ) {

					geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

				}

				return geometry;

			}

			function Float32Concat( first, second ) {

			    var firstLength = first.length, result = new Float32Array( firstLength + second.length );

			    result.set( first );
			    result.set( second, firstLength );

			    return result;

			}

			function Int32Concat( first, second ) {

			    var firstLength = first.length, result = new Int32Array( firstLength + second.length );

			    result.set( first );
			    result.set( second, firstLength );

			    return result;

			}

			function parseXML( stringFile ) {

				// Changes XML to JSON, based on https://davidwalsh.name/convert-xml-json

				function xmlToJson( xml ) {

					// Create the return object
					var obj = {};

					if ( xml.nodeType === 1 ) { // element

						// do attributes

						if ( xml.attributes ) {

							if ( xml.attributes.length > 0 ) {

								obj[ 'attributes' ] = {};

								for ( var j = 0; j < xml.attributes.length; j ++ ) {

									var attribute = xml.attributes.item( j );
									obj[ 'attributes' ][ attribute.nodeName ] = attribute.nodeValue.trim();

								}

							}

						}

					} else if ( xml.nodeType === 3 ) { // text

						obj = xml.nodeValue.trim();

					}

					// do children
					if ( xml.hasChildNodes() ) {

						for ( var i = 0; i < xml.childNodes.length; i ++ ) {

							var item = xml.childNodes.item( i );
							var nodeName = item.nodeName;

							if ( typeof obj[ nodeName ] === 'undefined' ) {

								var tmp = xmlToJson( item );

								if ( tmp !== '' ) obj[ nodeName ] = tmp;

							} else {

								if ( typeof obj[ nodeName ].push === 'undefined' ) {

									var old = obj[ nodeName ];
									obj[ nodeName ] = [ old ];

								}

								var tmp = xmlToJson( item );

								if ( tmp !== '' ) obj[ nodeName ].push( tmp );

							}

						}

					}

					return obj;

				}

				// Taken from Base64-js
				function Base64toByteArray( b64 ) {

					var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
					var i;
					var lookup = [];
					var revLookup = [];
					var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
					var len = code.length;

					for ( i = 0; i < len; i ++ ) {

						lookup[ i ] = code[ i ];

					}

					for ( i = 0; i < len; ++ i ) {

						revLookup[ code.charCodeAt( i ) ] = i;

					}

					revLookup[ '-'.charCodeAt( 0 ) ] = 62;
					revLookup[ '_'.charCodeAt( 0 ) ] = 63;

					var j, l, tmp, placeHolders, arr;
					var len = b64.length;

					if ( len % 4 > 0 ) {

						throw new Error( 'Invalid string. Length must be a multiple of 4' );

					}

					placeHolders = b64[ len - 2 ] === '=' ? 2 : b64[ len - 1 ] === '=' ? 1 : 0;
					arr = new Arr( len * 3 / 4 - placeHolders );
					l = placeHolders > 0 ? len - 4 : len;

					var L = 0;

					for ( i = 0, j = 0; i < l; i += 4, j += 3 ) {

						tmp = ( revLookup[ b64.charCodeAt( i ) ] << 18 ) | ( revLookup[ b64.charCodeAt( i + 1 ) ] << 12 ) | ( revLookup[ b64.charCodeAt( i + 2 ) ] << 6 ) | revLookup[ b64.charCodeAt( i + 3 ) ];
						arr[ L ++ ] = ( tmp & 0xFF0000 ) >> 16;
						arr[ L ++ ] = ( tmp & 0xFF00 ) >> 8;
						arr[ L ++ ] = tmp & 0xFF;

					}

					if ( placeHolders === 2 ) {

						tmp = ( revLookup[ b64.charCodeAt( i ) ] << 2 ) | ( revLookup[ b64.charCodeAt( i + 1 ) ] >> 4 );
						arr[ L ++ ] = tmp & 0xFF;

					} else if ( placeHolders === 1 ) {

						tmp = ( revLookup[ b64.charCodeAt( i ) ] << 10 ) | ( revLookup[ b64.charCodeAt( i + 1 ) ] << 4 ) | ( revLookup[ b64.charCodeAt( i + 2 ) ] >> 2 );
						arr[ L ++ ] = ( tmp >> 8 ) & 0xFF;
						arr[ L ++ ] = tmp & 0xFF;

					}

					return arr;

				}

				function parseDataArray( ele, compressed ) {

					var numBytes = 0;

					if ( json.attributes.header_type === 'UInt64' ) {

						numBytes = 8;

					}	else if ( json.attributes.header_type === 'UInt32' ) {

						numBytes = 4;

					}


					// Check the format
					if ( ele.attributes.format === 'binary' && compressed ) {

						var rawData, content, byteData, blocks, cSizeStart, headerSize, padding, dataOffsets, currentOffset;

						if ( ele.attributes.type === 'Float32' ) {

							var txt = new Float32Array( );

						} else if ( ele.attributes.type === 'Int64' ) {

							var txt = new Int32Array( );

						}

						// VTP data with the header has the following structure:
						// [#blocks][#u-size][#p-size][#c-size-1][#c-size-2]...[#c-size-#blocks][DATA]
						//
						// Each token is an integer value whose type is specified by "header_type" at the top of the file (UInt32 if no type specified). The token meanings are:
						// [#blocks] = Number of blocks
						// [#u-size] = Block size before compression
						// [#p-size] = Size of last partial block (zero if it not needed)
						// [#c-size-i] = Size in bytes of block i after compression
						//
						// The [DATA] portion stores contiguously every block appended together. The offset from the beginning of the data section to the beginning of a block is
						// computed by summing the compressed block sizes from preceding blocks according to the header.

						rawData = ele[ '#text' ];

						byteData = Base64toByteArray( rawData );

						blocks = byteData[ 0 ];
						for ( var i = 1; i < numBytes - 1; i ++ ) {

							blocks = blocks | ( byteData[ i ] << ( i * numBytes ) );

						}

						headerSize = ( blocks + 3 ) * numBytes;
						padding = ( ( headerSize % 3 ) > 0 ) ? 3 - ( headerSize % 3 ) : 0;
						headerSize = headerSize + padding;

						dataOffsets = [];
						currentOffset = headerSize;
						dataOffsets.push( currentOffset );

						// Get the blocks sizes after the compression.
						// There are three blocks before c-size-i, so we skip 3*numBytes
						cSizeStart = 3 * numBytes;

						for ( var i = 0; i < blocks; i ++ ) {

							var currentBlockSize = byteData[ i * numBytes + cSizeStart ];

							for ( var j = 1; j < numBytes - 1; j ++ ) {

								// Each data point consists of 8 bytes regardless of the header type
								currentBlockSize = currentBlockSize | ( byteData[ i * numBytes + cSizeStart + j ] << ( j * 8 ) );

							}

							currentOffset = currentOffset + currentBlockSize;
							dataOffsets.push( currentOffset );

						}

						for ( var i = 0; i < dataOffsets.length - 1; i ++ ) {

							var inflate = new Zlib.Inflate( byteData.slice( dataOffsets[ i ], dataOffsets[ i + 1 ] ), { resize: true, verify: true } ); // eslint-disable-line no-undef
							content = inflate.decompress();
							content = content.buffer;

							if ( ele.attributes.type === 'Float32' ) {

								content = new Float32Array( content );
								txt = Float32Concat( txt, content );

							} else if ( ele.attributes.type === 'Int64' ) {

								content = new Int32Array( content );
								txt = Int32Concat( txt, content );

							}

						}

						delete ele[ '#text' ];

						if ( ele.attributes.type === 'Int64' ) {

							if ( ele.attributes.format === 'binary' ) {

								txt = txt.filter( function ( el, idx ) {

									if ( idx % 2 !== 1 ) return true;

								} );

							}

						}

					} else {

						if ( ele.attributes.format === 'binary' && ! compressed ) {

							var content = Base64toByteArray( ele[ '#text' ] );

							//  VTP data for the uncompressed case has the following structure:
							// [#bytes][DATA]
							// where "[#bytes]" is an integer value specifying the number of bytes in the block of data following it.
							content = content.slice( numBytes ).buffer;

						} else {

							if ( ele[ '#text' ] ) {

								var content = ele[ '#text' ].split( /\s+/ ).filter( function ( el ) {

									if ( el !== '' ) return el;

								} );

							} else {

								var content = new Int32Array( 0 ).buffer;

							}

						}

						delete ele[ '#text' ];

						// Get the content and optimize it
						if ( ele.attributes.type === 'Float32' ) {

							var txt = new Float32Array( content );

						} else if ( ele.attributes.type === 'Int32' ) {

							var txt = new Int32Array( content );

						} else if ( ele.attributes.type === 'Int64' ) {

							var txt = new Int32Array( content );

							if ( ele.attributes.format === 'binary' ) {

								txt = txt.filter( function ( el, idx ) {

									if ( idx % 2 !== 1 ) return true;

								} );

							}

						}

					} // endif ( ele.attributes.format === 'binary' && compressed )

					return txt;

				}

				// Main part
				// Get Dom
				var dom = null;

				if ( window.DOMParser ) {

					try {

						dom = ( new DOMParser() ).parseFromString( stringFile, 'text/xml' );

					} catch ( e ) {

						dom = null;

					}

				} else if ( window.ActiveXObject ) {

					try {

						dom = new ActiveXObject( 'Microsoft.XMLDOM' ); // eslint-disable-line no-undef
						dom.async = false;

						if ( ! dom.loadXML( /* xml */ ) ) {

							throw new Error( dom.parseError.reason + dom.parseError.srcText );

						}

					} catch ( e ) {

						dom = null;

					}

				} else {

					throw new Error( 'Cannot parse xml string!' );

				}

				// Get the doc
				var doc = dom.documentElement;
				// Convert to json
				var json = xmlToJson( doc );
				var points = [];
				var normals = [];
				var indices = [];

				if ( json.PolyData ) {

					var piece = json.PolyData.Piece;
					var compressed = json.attributes.hasOwnProperty( 'compressor' );

					// Can be optimized
					// Loop through the sections
					var sections = [ 'PointData', 'Points', 'Strips', 'Polys' ];// +['CellData', 'Verts', 'Lines'];
					var sectionIndex = 0, numberOfSections = sections.length;

					while ( sectionIndex < numberOfSections ) {

						var section = piece[ sections[ sectionIndex ] ];

						// If it has a DataArray in it

						if ( section && section.DataArray ) {

							// Depending on the number of DataArrays

							if ( Object.prototype.toString.call( section.DataArray ) === '[object Array]' ) {

								var arr = section.DataArray;

							} else {

								var arr = [ section.DataArray ];

							}

							var dataArrayIndex = 0, numberOfDataArrays = arr.length;

							while ( dataArrayIndex < numberOfDataArrays ) {

								// Parse the DataArray
								if ( ( '#text' in arr[ dataArrayIndex ] ) && ( arr[ dataArrayIndex ][ '#text' ].length > 0 ) ) {

									arr[ dataArrayIndex ].text = parseDataArray( arr[ dataArrayIndex ], compressed );

								}

								dataArrayIndex ++;

							}

							switch ( sections[ sectionIndex ] ) {

								// if iti is point data
								case 'PointData':

									var numberOfPoints = parseInt( piece.attributes.NumberOfPoints );
									var normalsName = section.attributes.Normals;

									if ( numberOfPoints > 0 ) {

										for ( var i = 0, len = arr.length; i < len; i ++ ) {

											if ( normalsName === arr[ i ].attributes.Name ) {

												var components = arr[ i ].attributes.NumberOfComponents;
												normals = new Float32Array( numberOfPoints * components );
												normals.set( arr[ i ].text, 0 );

											}

										}

									}

									break;

								// if it is points
								case 'Points':

									var numberOfPoints = parseInt( piece.attributes.NumberOfPoints );

									if ( numberOfPoints > 0 ) {

										var components = section.DataArray.attributes.NumberOfComponents;
										points = new Float32Array( numberOfPoints * components );
										points.set( section.DataArray.text, 0 );

									}

									break;

								// if it is strips
								case 'Strips':

									var numberOfStrips = parseInt( piece.attributes.NumberOfStrips );

									if ( numberOfStrips > 0 ) {

										var connectivity = new Int32Array( section.DataArray[ 0 ].text.length );
										var offset = new Int32Array( section.DataArray[ 1 ].text.length );
										connectivity.set( section.DataArray[ 0 ].text, 0 );
										offset.set( section.DataArray[ 1 ].text, 0 );

										var size = numberOfStrips + connectivity.length;
										indices = new Uint32Array( 3 * size - 9 * numberOfStrips );

										var indicesIndex = 0;

										for ( var i = 0, len = numberOfStrips; i < len; i ++ ) {

											var strip = [];

											for ( var s = 0, len1 = offset[ i ], len0 = 0; s < len1 - len0; s ++ ) {

												strip.push( connectivity[ s ] );

												if ( i > 0 ) len0 = offset[ i - 1 ];

											}

											for ( var j = 0, len1 = offset[ i ], len0 = 0; j < len1 - len0 - 2; j ++ ) {

												if ( j % 2 ) {

													indices[ indicesIndex ++ ] = strip[ j ];
													indices[ indicesIndex ++ ] = strip[ j + 2 ];
													indices[ indicesIndex ++ ] = strip[ j + 1 ];

												} else {

													indices[ indicesIndex ++ ] = strip[ j ];
													indices[ indicesIndex ++ ] = strip[ j + 1 ];
													indices[ indicesIndex ++ ] = strip[ j + 2 ];

												}

												if ( i > 0 ) len0 = offset[ i - 1 ];

											}

										}

									}

									break;

								// if it is polys
								case 'Polys':

									var numberOfPolys = parseInt( piece.attributes.NumberOfPolys );

									if ( numberOfPolys > 0 ) {

										var connectivity = new Int32Array( section.DataArray[ 0 ].text.length );
										var offset = new Int32Array( section.DataArray[ 1 ].text.length );
										connectivity.set( section.DataArray[ 0 ].text, 0 );
										offset.set( section.DataArray[ 1 ].text, 0 );

										var size = numberOfPolys + connectivity.length;
										indices = new Uint32Array( 3 * size - 9 * numberOfPolys );
										var indicesIndex = 0, connectivityIndex = 0;
										var i = 0, len = numberOfPolys, len0 = 0;

										while ( i < len ) {

											var poly = [];
											var s = 0, len1 = offset[ i ];

											while ( s < len1 - len0 ) {

												poly.push( connectivity[ connectivityIndex ++ ] );
												s ++;

											}

											var j = 1;

											while ( j < len1 - len0 - 1 ) {

												indices[ indicesIndex ++ ] = poly[ 0 ];
												indices[ indicesIndex ++ ] = poly[ j ];
												indices[ indicesIndex ++ ] = poly[ j + 1 ];
												j ++;

											}

											i ++;
											len0 = offset[ i - 1 ];

										}

									}

									break;

								default:
									break;

							}

						}

						sectionIndex ++;

					}

					var geometry = new THREE.BufferGeometry();
					geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
					geometry.setAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );

					if ( normals.length === points.length ) {

						geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

					}

					return geometry;

				} else {

					throw new Error( 'Unsupported DATASET type' );

				}

			}

			function getStringFile( data ) {

				var stringFile = '';
				var charArray = new Uint8Array( data );
				var i = 0;
				var len = charArray.length;

				while ( len -- ) {

					stringFile += String.fromCharCode( charArray[ i ++ ] );

				}

				return stringFile;

			}

			// get the 5 first lines of the files to check if there is the key word binary
			var meta = THREE.LoaderUtils.decodeText( new Uint8Array( data, 0, 250 ) ).split( '\n' );

			if ( meta[ 0 ].indexOf( 'xml' ) !== - 1 ) {

				return parseXML( getStringFile( data ) );

			} else if ( meta[ 2 ].includes( 'ASCII' ) ) {

				return parseASCII( getStringFile( data ) );

			} else {

				return parseBinary( data );

			}

		}

	} );
	
	return THREE.VTKLoader;
});

define('skylark-threejs-ex/loaders/XLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author adrs2002 / https://github.com/adrs2002
	 */

	THREE.XLoader = ( function () {

		var classCallCheck = function ( instance, Constructor ) {

			if ( ! ( instance instanceof Constructor ) ) {

				throw new TypeError( "Cannot call a class as a function" );

			}

		};

		var createClass = function () {

			function defineProperties( target, props ) {

				for ( var i = 0; i < props.length; i ++ ) {

					var descriptor = props[ i ];
					descriptor.enumerable = descriptor.enumerable || false;
					descriptor.configurable = true;
					if ( "value" in descriptor ) descriptor.writable = true;
					Object.defineProperty( target, descriptor.key, descriptor );

				}

			}

			return function ( Constructor, protoProps, staticProps ) {

				if ( protoProps ) defineProperties( Constructor.prototype, protoProps );
				if ( staticProps ) defineProperties( Constructor, staticProps );
				return Constructor;

			};

		}();

		var XboneInf = function XboneInf() {

			classCallCheck( this, XboneInf );

			this.boneName = "";
			this.BoneIndex = 0;
			this.Indeces = [];
			this.Weights = [];
			this.initMatrix = null;
			this.OffsetMatrix = null;

		};

		var XAnimationInfo = function XAnimationInfo() {

			classCallCheck( this, XAnimationInfo );

			this.animeName = "";
			this.boneName = "";
			this.targetBone = null;
			this.keyType = 4;
			this.frameStartLv = 0;
			this.keyFrames = [];
			this.InverseMx = null;

		};

		var XAnimationObj = function () {

			function XAnimationObj( _flags ) {

				classCallCheck( this, XAnimationObj );

				this.fps = 30;
				this.name = 'xanimation';
				this.length = 0;
				this.hierarchy = [];
				this.putFlags = _flags;
				if ( this.putFlags.putPos === undefined ) {

					this.putFlags.putPos = true;

				}
				if ( this.putFlags.putRot === undefined ) {

					this.putFlags.putRot = true;

				}
				if ( this.putFlags.putScl === undefined ) {

					this.putFlags.putScl = true;

				}

			}

			createClass( XAnimationObj, [ {
				key: "make",
				value: function make( XAnimationInfoArray ) {

					for ( var i = 0; i < XAnimationInfoArray.length; i ++ ) {

						this.hierarchy.push( this.makeBonekeys( XAnimationInfoArray[ i ] ) );

					}
					this.length = this.hierarchy[ 0 ].keys[ this.hierarchy[ 0 ].keys.length - 1 ].time;

				}
			}, {
				key: "clone",
				value: function clone() {

					return Object.assign( {}, this );

				}
			}, {
				key: "makeBonekeys",
				value: function makeBonekeys( XAnimationInfo ) {

					var refObj = {};
					refObj.name = XAnimationInfo.boneName;
					refObj.parent = "";
					refObj.keys = this.keyFrameRefactor( XAnimationInfo );
					refObj.copy = function () {

						return Object.assign( {}, this );

					};
					return refObj;

				}
			}, {
				key: "keyFrameRefactor",
				value: function keyFrameRefactor( XAnimationInfo ) {

					var keys = [];
					for ( var i = 0; i < XAnimationInfo.keyFrames.length; i ++ ) {

						var keyframe = {};
						keyframe.time = XAnimationInfo.keyFrames[ i ].time * this.fps;
						if ( XAnimationInfo.keyFrames[ i ].pos && this.putFlags.putPos ) {

							keyframe.pos = XAnimationInfo.keyFrames[ i ].pos;

						}
						if ( XAnimationInfo.keyFrames[ i ].rot && this.putFlags.putRot ) {

							keyframe.rot = XAnimationInfo.keyFrames[ i ].rot;

						}
						if ( XAnimationInfo.keyFrames[ i ].scl && this.putFlags.putScl ) {

							keyframe.scl = XAnimationInfo.keyFrames[ i ].scl;

						}
						if ( XAnimationInfo.keyFrames[ i ].matrix ) {

							keyframe.matrix = XAnimationInfo.keyFrames[ i ].matrix;
							if ( this.putFlags.putPos ) {

								keyframe.pos = new THREE.Vector3().setFromMatrixPosition( keyframe.matrix );

							}
							if ( this.putFlags.putRot ) {

								keyframe.rot = new THREE.Quaternion().setFromRotationMatrix( keyframe.matrix );

							}
							if ( this.putFlags.putScl ) {

								keyframe.scl = new THREE.Vector3().setFromMatrixScale( keyframe.matrix );

							}

						}
						keys.push( keyframe );

					}
					return keys;

				}
			} ] );
			return XAnimationObj;

		}();

		var XKeyFrameInfo = function XKeyFrameInfo() {

			classCallCheck( this, XKeyFrameInfo );

			this.index = 0;
			this.Frame = 0;
			this.time = 0.0;
			this.matrix = null;

		};

		var XLoader = function () {

			function XLoader( manager ) {

				THREE.Loader.call( this, manager );

				classCallCheck( this, XLoader );

				this.debug = false;
				this.texloader = new THREE.TextureLoader( this.manager );
				this.url = "";
				this._putMatLength = 0;
				this._nowMat = null;
				this._nowFrameName = "";
				this.frameHierarchie = [];
				this.Hierarchies = {};
				this.HieStack = [];
				this._currentObject = {};
				this._currentFrame = {};
				this._data = null;
				this.onLoad = null;
				this.IsUvYReverse = true;
				this.Meshes = [];
				this.animations = [];
				this.animTicksPerSecond = 30;
				this._currentGeo = null;
				this._currentAnime = null;
				this._currentAnimeFrames = null;

			}

			createClass( XLoader, [ {
				key: '_setArgOption',
				value: function _setArgOption( _arg ) {

					var _start = arguments.length > 1 && arguments[ 1 ] !== undefined ? arguments[ 1 ] : 0;

					if ( ! _arg ) {

						return;

					}
					for ( var i = _start; i < _arg.length; i ++ ) {

						switch ( i ) {

							case 0:
								this.url = _arg[ i ];
								break;
							case 1:
								this.options = _arg[ i ];
								break;

						}

					}
					if ( this.options === undefined ) {

						this.options = {};

					}

				}
			}, {
				key: 'load',
				value: function load( _arg, onLoad, onProgress, onError ) {

					var _this = this;

					this._setArgOption( _arg );
					var loader = new THREE.FileLoader( this.manager );
					loader.setPath( this.path );
					loader.setResponseType( 'arraybuffer' );
					loader.load( this.url, function ( response ) {

						_this.parse( response, onLoad );

					}, onProgress, onError );

				}
			}, {
				key: '_readLine',
				value: function _readLine( line ) {

					var readed = 0;
					while ( true ) {

						var find = - 1;
						find = line.indexOf( '//', readed );
						if ( find === - 1 ) {

							find = line.indexOf( '#', readed );

						}
						if ( find > - 1 && find < 2 ) {

							var foundNewLine = - 1;
							foundNewLine = line.indexOf( "\r\n", readed );
							if ( foundNewLine > 0 ) {

								readed = foundNewLine + 2;

							} else {

								foundNewLine = line.indexOf( "\r", readed );
								if ( foundNewLine > 0 ) {

									readed = foundNewLine + 1;

								} else {

									readed = line.indexOf( "\n", readed ) + 1;

								}

							}

						} else {

							break;

						}

					}
					return line.substr( readed );

				}
			}, {
				key: '_readLine',
				value: function _readLine( line ) {

					var readed = 0;
					while ( true ) {

						var find = - 1;
						find = line.indexOf( '//', readed );
						if ( find === - 1 ) {

							find = line.indexOf( '#', readed );

						}
						if ( find > - 1 && find < 2 ) {

							var foundNewLine = - 1;
							foundNewLine = line.indexOf( "\r\n", readed );
							if ( foundNewLine > 0 ) {

								readed = foundNewLine + 2;

							} else {

								foundNewLine = line.indexOf( "\r", readed );
								if ( foundNewLine > 0 ) {

									readed = foundNewLine + 1;

								} else {

									readed = line.indexOf( "\n", readed ) + 1;

								}

							}

						} else {

							break;

						}

					}
					return line.substr( readed );

				}
			}, {
				key: '_isBinary',
				value: function _isBinary( binData ) {

					var reader = new DataView( binData );
					var face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;
					var n_faces = reader.getUint32( 80, true );
					var expect = 80 + 32 / 8 + n_faces * face_size;
					if ( expect === reader.byteLength ) {

						return true;

					}
					var fileLength = reader.byteLength;
					for ( var index = 0; index < fileLength; index ++ ) {

						if ( reader.getUint8( index, false ) > 127 ) {

							return true;

						}

					}
					return false;

				}
			}, {
				key: '_ensureBinary',
				value: function _ensureBinary( buf ) {

					if ( typeof buf === "string" ) {

						var array_buffer = new Uint8Array( buf.length );
						for ( var i = 0; i < buf.length; i ++ ) {

							array_buffer[ i ] = buf.charCodeAt( i ) & 0xff;

						}
						return array_buffer.buffer || array_buffer;

					} else {

						return buf;

					}

				}
			}, {
				key: '_ensureString',
				value: function _ensureString( buf ) {

					if ( typeof buf !== "string" ) {

						return THREE.LoaderUtils.decodeText( new Uint8Array( buf ) );

					} else {

						return buf;

					}

				}
			}, {
				key: 'parse',
				value: function _parse( data, onLoad ) {

					var binData = this._ensureBinary( data );
					this._data = this._ensureString( data );
					this.onLoad = onLoad;
					return this._isBinary( binData ) ? this._parseBinary( binData ) : this._parseASCII();

				}
			}, {
				key: '_parseBinary',
				value: function _parseBinary( data ) {

					return this._parseASCII( THREE.LoaderUtils.decodeText( new Uint8Array( data ) ) );

				}
			}, {
				key: '_parseASCII',
				value: function _parseASCII() {

					var path;

					if ( this.resourcePath !== '' ) {

						path = this.resourcePath;

					} else if ( this.path !== '' ) {

						path = this.path;

					} else {

						path = THREE.LoaderUtils.extractUrlBase( this.url );

					}

					this.texloader.setPath( path ).setCrossOrigin( this.crossOrigin );

					var endRead = 16;
					this.Hierarchies.children = [];
					this._hierarchieParse( this.Hierarchies, endRead );
					this._changeRoot();
					this._currentObject = this.Hierarchies.children.shift();
					this._mainloop();

				}
			}, {
				key: '_hierarchieParse',
				value: function _hierarchieParse( _parent, _end ) {

					var endRead = _end;
					while ( true ) {

						var find1 = this._data.indexOf( '{', endRead ) + 1;
						var findEnd = this._data.indexOf( '}', endRead );
						var findNext = this._data.indexOf( '{', find1 ) + 1;
						if ( find1 > 0 && findEnd > find1 ) {

							var _currentObject = {};
							_currentObject.children = [];
							var nameData = this._readLine( this._data.substr( endRead, find1 - endRead - 1 ) ).trim();
							var word = nameData.split( / /g );
							if ( word.length > 0 ) {

								_currentObject.type = word[ 0 ];
								if ( word.length >= 2 ) {

									_currentObject.name = word[ 1 ];

								} else {

									_currentObject.name = word[ 0 ] + this.Hierarchies.children.length;

								}

							} else {

								_currentObject.name = nameData;
								_currentObject.type = "";

							}
							if ( _currentObject.type === "Animation" ) {

								_currentObject.data = this._data.substr( findNext, findEnd - findNext ).trim();
								var refs = this._hierarchieParse( _currentObject, findEnd + 1 );
								endRead = refs.end;
								_currentObject.children = refs.parent.children;

							} else {

								var DataEnder = this._data.lastIndexOf( ';', findNext > 0 ? Math.min( findNext, findEnd ) : findEnd );
								_currentObject.data = this._data.substr( find1, DataEnder - find1 ).trim();
								if ( findNext <= 0 || findEnd < findNext ) {

									endRead = findEnd + 1;

								} else {

									var nextStart = Math.max( DataEnder + 1, find1 );
									var _refs = this._hierarchieParse( _currentObject, nextStart );
									endRead = _refs.end;
									_currentObject.children = _refs.parent.children;

								}

							}
							_currentObject.parent = _parent;
							if ( _currentObject.type != "template" ) {

								_parent.children.push( _currentObject );

							}

						} else {

							endRead = find1 === - 1 ? this._data.length : findEnd + 1;
							break;

						}

					}
					return {
						parent: _parent,
						end: endRead
					};

				}
			}, {
				key: '_mainloop',
				value: function _mainloop() {

					var _this2 = this;

					this._mainProc();
					if ( this._currentObject.parent || this._currentObject.children.length > 0 || ! this._currentObject.worked ) {

						setTimeout( function () {

							_this2._mainloop();

						}, 1 );

					} else {

						setTimeout( function () {

							_this2.onLoad( {
								models: _this2.Meshes,
								animations: _this2.animations
							} );

						}, 1 );

					}

				}
			}, {
				key: '_mainProc',
				value: function _mainProc() {

					var breakFlag = false;
					while ( true ) {

						if ( ! this._currentObject.worked ) {

							switch ( this._currentObject.type ) {

								case "template":
									break;
								case "AnimTicksPerSecond":
									this.animTicksPerSecond = parseInt( this._currentObject.data );
									break;
								case "Frame":
									this._setFrame();
									break;
								case "FrameTransformMatrix":
									this._setFrameTransformMatrix();
									break;
								case "Mesh":
									this._changeRoot();
									this._currentGeo = {};
									this._currentGeo.name = this._currentObject.name.trim();
									this._currentGeo.parentName = this._getParentName( this._currentObject ).trim();
									this._currentGeo.VertexSetedBoneCount = [];
									this._currentGeo.GeometryData = {
										vertices: [],
										normals: [],
										uvs: [],
										skinIndices: [],
										skinWeights: [],
										indices: [],
										materialIndices: []
									};
									this._currentGeo.Materials = [];
									this._currentGeo.normalVectors = [];
									this._currentGeo.BoneInfs = [];
									this._currentGeo.baseFrame = this._currentFrame;
									this._makeBoneFrom_CurrentFrame();
									this._readVertexDatas();
									breakFlag = true;
									break;
								case "MeshNormals":
									this._readVertexDatas();
									break;
								case "MeshTextureCoords":
									this._setMeshTextureCoords();
									break;
								case "VertexDuplicationIndices":
									break;
								case "MeshMaterialList":
									this._setMeshMaterialList();
									break;
								case "Material":
									this._setMaterial();
									break;
								case "SkinWeights":
									this._setSkinWeights();
									break;
								case "AnimationSet":
									this._changeRoot();
									this._currentAnime = {};
									this._currentAnime.name = this._currentObject.name.trim();
									this._currentAnime.AnimeFrames = [];
									break;
								case "Animation":
									if ( this._currentAnimeFrames ) {

										this._currentAnime.AnimeFrames.push( this._currentAnimeFrames );

									}
									this._currentAnimeFrames = new XAnimationInfo();
									this._currentAnimeFrames.boneName = this._currentObject.data.trim();
									break;
								case "AnimationKey":
									this._readAnimationKey();
									breakFlag = true;
									break;

							}
							this._currentObject.worked = true;

						}
						if ( this._currentObject.children.length > 0 ) {

							this._currentObject = this._currentObject.children.shift();
							if ( this.debug ) {

								console.log( 'processing ' + this._currentObject.name );

							}
							if ( breakFlag ) break;

						} else {

							if ( this._currentObject.worked ) {

								if ( this._currentObject.parent && ! this._currentObject.parent.parent ) {

									this._changeRoot();

								}

							}
							if ( this._currentObject.parent ) {

								this._currentObject = this._currentObject.parent;

							} else {

								breakFlag = true;

							}
							if ( breakFlag ) break;

						}

					}
					return;

				}
			}, {
				key: '_changeRoot',
				value: function _changeRoot() {

					if ( this._currentGeo != null && this._currentGeo.name ) {

						this._makeOutputGeometry();

					}
					this._currentGeo = {};
					if ( this._currentAnime != null && this._currentAnime.name ) {

						if ( this._currentAnimeFrames ) {

							this._currentAnime.AnimeFrames.push( this._currentAnimeFrames );
							this._currentAnimeFrames = null;

						}
						this._makeOutputAnimation();

					}
					this._currentAnime = {};

				}
			}, {
				key: '_getParentName',
				value: function _getParentName( _obj ) {

					if ( _obj.parent ) {

						if ( _obj.parent.name ) {

							return _obj.parent.name;

						} else {

							return this._getParentName( _obj.parent );

						}

					} else {

						return "";

					}

				}
			}, {
				key: '_setFrame',
				value: function _setFrame() {

					this._nowFrameName = this._currentObject.name.trim();
					this._currentFrame = {};
					this._currentFrame.name = this._nowFrameName;
					this._currentFrame.children = [];
					if ( this._currentObject.parent && this._currentObject.parent.name ) {

						this._currentFrame.parentName = this._currentObject.parent.name;

					}
					this.frameHierarchie.push( this._nowFrameName );
					this.HieStack[ this._nowFrameName ] = this._currentFrame;

				}
			}, {
				key: '_setFrameTransformMatrix',
				value: function _setFrameTransformMatrix() {

					this._currentFrame.FrameTransformMatrix = new THREE.Matrix4();
					var data = this._currentObject.data.split( "," );
					this._ParseMatrixData( this._currentFrame.FrameTransformMatrix, data );
					this._makeBoneFrom_CurrentFrame();

				}
			}, {
				key: '_makeBoneFrom_CurrentFrame',
				value: function _makeBoneFrom_CurrentFrame() {

					if ( ! this._currentFrame.FrameTransformMatrix ) {

						return;

					}
					var b = new THREE.Bone();
					b.name = this._currentFrame.name;
					b.applyMatrix4( this._currentFrame.FrameTransformMatrix );
					b.matrixWorld = b.matrix;
					b.FrameTransformMatrix = this._currentFrame.FrameTransformMatrix;
					this._currentFrame.putBone = b;
					if ( this._currentFrame.parentName ) {

						for ( var frame in this.HieStack ) {

							if ( this.HieStack[ frame ].name === this._currentFrame.parentName ) {

								this.HieStack[ frame ].putBone.add( this._currentFrame.putBone );

							}

						}

					}

				}
			}, {
				key: '_readVertexDatas',
				value: function _readVertexDatas() {

					var endRead = 0;
					var mode = 0;
					var mode_local = 0;
					var maxLength = 0;
					while ( true ) {

						var changeMode = false;
						if ( mode_local === 0 ) {

							var refO = this._readInt1( endRead );
							endRead = refO.endRead;
							mode_local = 1;
							maxLength = this._currentObject.data.indexOf( ';;', endRead ) + 1;
							if ( maxLength <= 0 ) {

								maxLength = this._currentObject.data.length;

							}

						} else {

							var find = 0;
							switch ( mode ) {

								case 0:
									find = this._currentObject.data.indexOf( ',', endRead ) + 1;
									break;
								case 1:
									find = this._currentObject.data.indexOf( ';,', endRead ) + 1;
									break;

							}
							if ( find === 0 || find > maxLength ) {

								find = maxLength;
								mode_local = 0;
								changeMode = true;

							}
							switch ( this._currentObject.type ) {

								case "Mesh":
									switch ( mode ) {

										case 0:
											this._readVertex1( this._currentObject.data.substr( endRead, find - endRead ) );
											break;
										case 1:
											this._readFace1( this._currentObject.data.substr( endRead, find - endRead ) );
											break;

									}
									break;
								case "MeshNormals":
									switch ( mode ) {

										case 0:
											this._readNormalVector1( this._currentObject.data.substr( endRead, find - endRead ) );
											break;

									}
									break;

							}
							endRead = find + 1;
							if ( changeMode ) {

								mode ++;

							}

						}
						if ( endRead >= this._currentObject.data.length ) {

							break;

						}

					}

				}
			}, {
				key: '_readInt1',
				value: function _readInt1( start ) {

					var find = this._currentObject.data.indexOf( ';', start );
					return {
						refI: parseInt( this._currentObject.data.substr( start, find - start ) ),
						endRead: find + 1
					};

				}
			}, {
				key: '_readVertex1',
				value: function _readVertex1( line ) {

					var data = this._readLine( line.trim() ).substr( 0, line.length - 2 ).split( ";" );
					this._currentGeo.GeometryData.vertices.push( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 2 ] ) );
					this._currentGeo.GeometryData.skinIndices.push( 0, 0, 0, 0 );
					this._currentGeo.GeometryData.skinWeights.push( 1, 0, 0, 0 );
					this._currentGeo.VertexSetedBoneCount.push( 0 );

				}
			}, {
				key: '_readFace1',
				value: function _readFace1( line ) {

					var data = this._readLine( line.trim() ).substr( 2, line.length - 4 ).split( "," );
					this._currentGeo.GeometryData.indices.push( parseInt( data[ 0 ], 10 ), parseInt( data[ 1 ], 10 ), parseInt( data[ 2 ], 10 ) );

				}
			}, {
				key: '_readNormalVector1',
				value: function _readNormalVector1( line ) {

					var data = this._readLine( line.trim() ).substr( 0, line.length - 2 ).split( ";" );
					this._currentGeo.GeometryData.normals.push( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 2 ] ) );

				}
			}, {
				key: '_buildGeometry',
				value: function _buildGeometry() {

					var bufferGeometry = new THREE.BufferGeometry();
					var position = [];
					var normals = [];
					var uvs = [];
					var skinIndices = [];
					var skinWeights = [];

					//

					var data = this._currentGeo.GeometryData;

					for ( var i = 0, l = data.indices.length; i < l; i ++ ) {

						var stride2 = data.indices[ i ] * 2;
						var stride3 = data.indices[ i ] * 3;
						var stride4 = data.indices[ i ] * 4;

						position.push( data.vertices[ stride3 ], data.vertices[ stride3 + 1 ], data.vertices[ stride3 + 2 ] );
						normals.push( data.normals[ stride3 ], data.normals[ stride3 + 1 ], data.normals[ stride3 + 2 ] );
						skinIndices.push( data.skinIndices[ stride4 ], data.skinIndices[ stride4 + 1 ], data.skinIndices[ stride4 + 2 ], data.skinIndices[ stride4 + 3 ] );
						skinWeights.push( data.skinWeights[ stride4 ], data.skinWeights[ stride4 + 1 ], data.skinWeights[ stride4 + 2 ], data.skinWeights[ stride4 + 3 ] );
						uvs.push( data.uvs[ stride2 ], data.uvs[ stride2 + 1 ] );

					}

					//

					bufferGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
					bufferGeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
					bufferGeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
					bufferGeometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
					bufferGeometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );

					this._computeGroups( bufferGeometry, data.materialIndices );

					return bufferGeometry;

				}
			}, {
				key: '_computeGroups',
				value: function _computeGroups( bufferGeometry, materialIndices ) {

					var group;
					var groups = [];
					var materialIndex = undefined;

					for ( var i = 0; i < materialIndices.length; i ++ ) {

						var currentMaterialIndex = materialIndices[ i ];

						if ( currentMaterialIndex !== materialIndex ) {

							materialIndex = currentMaterialIndex;

							if ( group !== undefined ) {

								group.count = ( i * 3 ) - group.start;
								groups.push( group );

							}

							group = {
								start: i * 3,
								materialIndex: materialIndex
							};

						}

					}

					if ( group !== undefined ) {

						group.count = ( i * 3 ) - group.start;
						groups.push( group );

					}

					bufferGeometry.groups = groups;

				}
			}, {
				key: '_setMeshTextureCoords',
				value: function _setMeshTextureCoords() {

					var endRead = 0;
					var mode = 0;
					var mode_local = 0;
					while ( true ) {

						switch ( mode ) {

							case 0:
								if ( mode_local === 0 ) {

									var refO = this._readInt1( 0 );
									endRead = refO.endRead;
									mode_local = 1;

								} else {

									var find = this._currentObject.data.indexOf( ',', endRead ) + 1;
									if ( find === 0 ) {

										find = this._currentObject.data.length;
										mode = 2;
										mode_local = 0;

									}
									var line = this._currentObject.data.substr( endRead, find - endRead );
									var data = this._readLine( line.trim() ).split( ";" );
									if ( this.IsUvYReverse ) {

										this._currentGeo.GeometryData.uvs.push( parseFloat( data[ 0 ] ), 1 - parseFloat( data[ 1 ] ) );

									} else {

										this._currentGeo.GeometryData.uvs.push( parseFloat( data[ 0 ] ), parseFloat( data[ 1 ] ) );

									}
									endRead = find + 1;

								}
								break;

						}
						if ( endRead >= this._currentObject.data.length ) {

							break;

						}

					}

				}
			}, {
				key: '_setMeshMaterialList',
				value: function _setMeshMaterialList() {

					var endRead = 0;
					var mode = 0;
					var mode_local = 0;
					while ( true ) {

						if ( mode_local < 2 ) {

							var refO = this._readInt1( endRead );
							endRead = refO.endRead;
							mode_local ++;

						} else {

							var find = this._currentObject.data.indexOf( ';', endRead );
							if ( find === - 1 ) {

								find = this._currentObject.data.length;
								mode = 3;
								mode_local = 0;

							}
							var line = this._currentObject.data.substr( endRead, find - endRead );
							var data = this._readLine( line.trim() ).split( "," );
							for ( var i = 0; i < data.length; i ++ ) {

								this._currentGeo.GeometryData.materialIndices[ i ] = parseInt( data[ i ] );

							}
							endRead = this._currentObject.data.length;

						}
						if ( endRead >= this._currentObject.data.length || mode >= 3 ) {

							break;

						}

					}

				}
			}, {
				key: '_setMaterial',
				value: function _setMaterial() {

					var _nowMat = new THREE.MeshPhongMaterial( {
						color: Math.random() * 0xffffff
					} );
					_nowMat.side = THREE.FrontSide;
					_nowMat.name = this._currentObject.name;
					var endRead = 0;
					var find = this._currentObject.data.indexOf( ';;', endRead );
					var line = this._currentObject.data.substr( endRead, find - endRead );
					var data = this._readLine( line.trim() ).split( ";" );
					_nowMat.color.r = parseFloat( data[ 0 ] );
					_nowMat.color.g = parseFloat( data[ 1 ] );
					_nowMat.color.b = parseFloat( data[ 2 ] );
					endRead = find + 2;
					find = this._currentObject.data.indexOf( ';', endRead );
					line = this._currentObject.data.substr( endRead, find - endRead );
					_nowMat.shininess = parseFloat( this._readLine( line ) );
					endRead = find + 1;
					find = this._currentObject.data.indexOf( ';;', endRead );
					line = this._currentObject.data.substr( endRead, find - endRead );
					var data2 = this._readLine( line.trim() ).split( ";" );
					_nowMat.specular.r = parseFloat( data2[ 0 ] );
					_nowMat.specular.g = parseFloat( data2[ 1 ] );
					_nowMat.specular.b = parseFloat( data2[ 2 ] );
					endRead = find + 2;
					find = this._currentObject.data.indexOf( ';;', endRead );
					if ( find === - 1 ) {

						find = this._currentObject.data.length;

					}
					line = this._currentObject.data.substr( endRead, find - endRead );
					var data3 = this._readLine( line.trim() ).split( ";" );
					_nowMat.emissive.r = parseFloat( data3[ 0 ] );
					_nowMat.emissive.g = parseFloat( data3[ 1 ] );
					_nowMat.emissive.b = parseFloat( data3[ 2 ] );
					var localObject = null;
					while ( true ) {

						if ( this._currentObject.children.length > 0 ) {

							localObject = this._currentObject.children.shift();
							if ( this.debug ) {

								console.log( 'processing ' + localObject.name );

							}
							var fileName = localObject.data.substr( 1, localObject.data.length - 2 );
							switch ( localObject.type ) {

								case "TextureFilename":
									_nowMat.map = this.texloader.load( fileName );
									break;
								case "BumpMapFilename":
									_nowMat.bumpMap = this.texloader.load( fileName );
									_nowMat.bumpScale = 0.05;
									break;
								case "NormalMapFilename":
									_nowMat.normalMap = this.texloader.load( fileName );
									_nowMat.normalScale = new THREE.Vector2( 2, 2 );
									break;
								case "EmissiveMapFilename":
									_nowMat.emissiveMap = this.texloader.load( fileName );
									break;
								case "LightMapFilename":
									_nowMat.lightMap = this.texloader.load( fileName );
									break;

							}

						} else {

							break;

						}

					}
					this._currentGeo.Materials.push( _nowMat );

				}
			}, {
				key: '_setSkinWeights',
				value: function _setSkinWeights() {

					var boneInf = new XboneInf();
					var endRead = 0;
					var find = this._currentObject.data.indexOf( ';', endRead );
					var line = this._currentObject.data.substr( endRead, find - endRead );
					endRead = find + 1;
					boneInf.boneName = line.substr( 1, line.length - 2 );
					boneInf.BoneIndex = this._currentGeo.BoneInfs.length;
					find = this._currentObject.data.indexOf( ';', endRead );
					endRead = find + 1;
					find = this._currentObject.data.indexOf( ';', endRead );
					line = this._currentObject.data.substr( endRead, find - endRead );
					var data = this._readLine( line.trim() ).split( "," );
					for ( var i = 0; i < data.length; i ++ ) {

						boneInf.Indeces.push( parseInt( data[ i ] ) );

					}
					endRead = find + 1;
					find = this._currentObject.data.indexOf( ';', endRead );
					line = this._currentObject.data.substr( endRead, find - endRead );
					var data2 = this._readLine( line.trim() ).split( "," );
					for ( var _i = 0; _i < data2.length; _i ++ ) {

						boneInf.Weights.push( parseFloat( data2[ _i ] ) );

					}
					endRead = find + 1;
					find = this._currentObject.data.indexOf( ';', endRead );
					if ( find <= 0 ) {

						find = this._currentObject.data.length;

					}
					line = this._currentObject.data.substr( endRead, find - endRead );
					var data3 = this._readLine( line.trim() ).split( "," );
					boneInf.OffsetMatrix = new THREE.Matrix4();
					this._ParseMatrixData( boneInf.OffsetMatrix, data3 );
					this._currentGeo.BoneInfs.push( boneInf );

				}
			}, {
				key: '_makePutBoneList',
				value: function _makePutBoneList( _RootName, _bones ) {

					var putting = false;
					for ( var frame in this.HieStack ) {

						if ( this.HieStack[ frame ].name === _RootName || putting ) {

							putting = true;
							var b = new THREE.Bone();
							b.name = this.HieStack[ frame ].name;
							b.applyMatrix4( this.HieStack[ frame ].FrameTransformMatrix );
							b.matrixWorld = b.matrix;
							b.FrameTransformMatrix = this.HieStack[ frame ].FrameTransformMatrix;
							b.pos = new THREE.Vector3().setFromMatrixPosition( b.FrameTransformMatrix ).toArray();
							b.rotq = new THREE.Quaternion().setFromRotationMatrix( b.FrameTransformMatrix ).toArray();
							b.scl = new THREE.Vector3().setFromMatrixScale( b.FrameTransformMatrix ).toArray();
							if ( this.HieStack[ frame ].parentName && this.HieStack[ frame ].parentName.length > 0 ) {

								for ( var i = 0; i < _bones.length; i ++ ) {

									if ( this.HieStack[ frame ].parentName === _bones[ i ].name ) {

										_bones[ i ].add( b );
										b.parent = i;
										break;

									}

								}

							}
							_bones.push( b );

						}

					}

				}
			}, {
				key: '_makeOutputGeometry',
				value: function _makeOutputGeometry() {

					var mesh = null;
					if ( this._currentGeo.BoneInfs.length > 0 ) {

						var putBones = [];
						this._makePutBoneList( this._currentGeo.baseFrame.parentName, putBones );
						for ( var bi = 0; bi < this._currentGeo.BoneInfs.length; bi ++ ) {

							var boneIndex = 0;
							for ( var bb = 0; bb < putBones.length; bb ++ ) {

								if ( putBones[ bb ].name === this._currentGeo.BoneInfs[ bi ].boneName ) {

									boneIndex = bb;
									putBones[ bb ].OffsetMatrix = new THREE.Matrix4();
									putBones[ bb ].OffsetMatrix.copy( this._currentGeo.BoneInfs[ bi ].OffsetMatrix );
									break;

								}

							}
							for ( var vi = 0; vi < this._currentGeo.BoneInfs[ bi ].Indeces.length; vi ++ ) {

								var nowVertexID = this._currentGeo.BoneInfs[ bi ].Indeces[ vi ];
								var nowVal = this._currentGeo.BoneInfs[ bi ].Weights[ vi ];

								var stride = nowVertexID * 4;

								switch ( this._currentGeo.VertexSetedBoneCount[ nowVertexID ] ) {

									case 0:
										this._currentGeo.GeometryData.skinIndices[ stride ] = boneIndex;
										this._currentGeo.GeometryData.skinWeights[ stride ] = nowVal;
										break;
									case 1:
										this._currentGeo.GeometryData.skinIndices[ stride + 1 ] = boneIndex;
										this._currentGeo.GeometryData.skinWeights[ stride + 1 ] = nowVal;
										break;
									case 2:
										this._currentGeo.GeometryData.skinIndices[ stride + 2 ] = boneIndex;
										this._currentGeo.GeometryData.skinWeights[ stride + 2 ] = nowVal;
										break;
									case 3:
										this._currentGeo.GeometryData.skinIndices[ stride + 3 ] = boneIndex;
										this._currentGeo.GeometryData.skinWeights[ stride + 3 ] = nowVal;
										break;

								}
								this._currentGeo.VertexSetedBoneCount[ nowVertexID ] ++;
								if ( this._currentGeo.VertexSetedBoneCount[ nowVertexID ] > 4 ) {

									console.log( 'warn! over 4 bone weight! :' + nowVertexID );

								}

							}

						}
						for ( var sk = 0; sk < this._currentGeo.Materials.length; sk ++ ) {

							this._currentGeo.Materials[ sk ].skinning = true;

						}
						var offsetList = [];
						for ( var _bi = 0; _bi < putBones.length; _bi ++ ) {

							if ( putBones[ _bi ].OffsetMatrix ) {

								offsetList.push( putBones[ _bi ].OffsetMatrix );

							} else {

								offsetList.push( new THREE.Matrix4() );

							}

						}

						var bufferGeometry = this._buildGeometry();
						mesh = new THREE.SkinnedMesh( bufferGeometry, this._currentGeo.Materials.length === 1 ? this._currentGeo.Materials[ 0 ] : this._currentGeo.Materials );

						this._initSkeleton( mesh, putBones, offsetList );

					} else {

						var _bufferGeometry = this._buildGeometry();
						mesh = new THREE.Mesh( _bufferGeometry, this._currentGeo.Materials.length === 1 ? this._currentGeo.Materials[ 0 ] : this._currentGeo.Materials );

					}
					mesh.name = this._currentGeo.name;
					var worldBaseMx = new THREE.Matrix4();
					var currentMxFrame = this._currentGeo.baseFrame.putBone;
					if ( currentMxFrame && currentMxFrame.parent ) {

						while ( true ) {

							currentMxFrame = currentMxFrame.parent;
							if ( currentMxFrame ) {

								worldBaseMx.multiply( currentMxFrame.FrameTransformMatrix );

							} else {

								break;

							}

						}
						mesh.applyMatrix4( worldBaseMx );

					}
					this.Meshes.push( mesh );

				}
			}, {
				key: '_initSkeleton',
				value: function _initSkeleton( mesh, boneList, boneInverses ) {

					var bones = [], bone, gbone;
					var i, il;

					for ( i = 0, il = boneList.length; i < il; i ++ ) {

						gbone = boneList[ i ];

						bone = new THREE.Bone();
						bones.push( bone );

						bone.name = gbone.name;
						bone.position.fromArray( gbone.pos );
						bone.quaternion.fromArray( gbone.rotq );
						if ( gbone.scl !== undefined ) bone.scale.fromArray( gbone.scl );

					}

					for ( i = 0, il = boneList.length; i < il; i ++ ) {

						gbone = boneList[ i ];

						if ( ( gbone.parent !== - 1 ) && ( gbone.parent !== null ) && ( bones[ gbone.parent ] !== undefined ) ) {

							bones[ gbone.parent ].add( bones[ i ] );

						} else {

							mesh.add( bones[ i ] );

						}

					}

					mesh.updateMatrixWorld( true );

					var skeleton = new THREE.Skeleton( bones, boneInverses );
					mesh.bind( skeleton, mesh.matrixWorld );

				}

			}, {
				key: '_readAnimationKey',
				value: function _readAnimationKey() {

					var endRead = 0;
					var find = this._currentObject.data.indexOf( ';', endRead );
					var line = this._currentObject.data.substr( endRead, find - endRead );
					endRead = find + 1;
					var nowKeyType = parseInt( this._readLine( line ) );
					find = this._currentObject.data.indexOf( ';', endRead );
					endRead = find + 1;
					line = this._currentObject.data.substr( endRead );
					var data = this._readLine( line.trim() ).split( ";;," );
					for ( var i = 0; i < data.length; i ++ ) {

						var data2 = data[ i ].split( ";" );
						var keyInfo = new XKeyFrameInfo();
						keyInfo.type = nowKeyType;
						keyInfo.Frame = parseInt( data2[ 0 ] );
						keyInfo.index = this._currentAnimeFrames.keyFrames.length;
						keyInfo.time = keyInfo.Frame;
						if ( nowKeyType != 4 ) {

							var frameFound = false;
							for ( var mm = 0; mm < this._currentAnimeFrames.keyFrames.length; mm ++ ) {

								if ( this._currentAnimeFrames.keyFrames[ mm ].Frame === keyInfo.Frame ) {

									keyInfo = this._currentAnimeFrames.keyFrames[ mm ];
									frameFound = true;
									break;

								}

							}
							var frameValue = data2[ 2 ].split( "," );
							switch ( nowKeyType ) {

								case 0:
									keyInfo.rot = new THREE.Quaternion( parseFloat( frameValue[ 1 ] ), parseFloat( frameValue[ 2 ] ), parseFloat( frameValue[ 3 ] ), parseFloat( frameValue[ 0 ] ) * - 1 );
									break;
								case 1:
									keyInfo.scl = new THREE.Vector3( parseFloat( frameValue[ 0 ] ), parseFloat( frameValue[ 1 ] ), parseFloat( frameValue[ 2 ] ) );
									break;
								case 2:
									keyInfo.pos = new THREE.Vector3( parseFloat( frameValue[ 0 ] ), parseFloat( frameValue[ 1 ] ), parseFloat( frameValue[ 2 ] ) );
									break;

							}
							if ( ! frameFound ) {

								this._currentAnimeFrames.keyFrames.push( keyInfo );

							}

						} else {

							keyInfo.matrix = new THREE.Matrix4();
							this._ParseMatrixData( keyInfo.matrix, data2[ 2 ].split( "," ) );
							this._currentAnimeFrames.keyFrames.push( keyInfo );

						}

					}

				}
			}, {
				key: '_makeOutputAnimation',
				value: function _makeOutputAnimation() {

					var animationObj = new XAnimationObj( this.options );
					animationObj.fps = this.animTicksPerSecond;
					animationObj.name = this._currentAnime.name;
					animationObj.make( this._currentAnime.AnimeFrames );
					this.animations.push( animationObj );

				}
			}, {
				key: 'assignAnimation',
				value: function assignAnimation( _model, _animation ) {

					var model = _model;
					var animation = _animation;
					if ( ! model ) {

						model = this.Meshes[ 0 ];

					}
					if ( ! animation ) {

						animation = this.animations[ 0 ];

					}
					if ( ! model || ! animation ) {

						return null;

					}
					var put = {};
					put.fps = animation.fps;
					put.name = animation.name;
					put.length = animation.length;
					put.hierarchy = [];
					for ( var b = 0; b < model.skeleton.bones.length; b ++ ) {

						var findAnimation = false;
						for ( var i = 0; i < animation.hierarchy.length; i ++ ) {

							if ( model.skeleton.bones[ b ].name === animation.hierarchy[ i ].name ) {

								findAnimation = true;
								var c_key = animation.hierarchy[ i ].copy();
								c_key.parent = - 1;
								if ( model.skeleton.bones[ b ].parent && model.skeleton.bones[ b ].parent.type === "Bone" ) {

									for ( var bb = 0; bb < put.hierarchy.length; bb ++ ) {

										if ( put.hierarchy[ bb ].name === model.skeleton.bones[ b ].parent.name ) {

											c_key.parent = bb;
											c_key.parentName = model.skeleton.bones[ b ].parent.name;

										}

									}

								}
								put.hierarchy.push( c_key );
								break;

							}

						}
						if ( ! findAnimation ) {

							var _c_key = animation.hierarchy[ 0 ].copy();
							_c_key.name = model.skeleton.bones[ b ].name;
							_c_key.parent = - 1;
							for ( var k = 0; k < _c_key.keys.length; k ++ ) {

								if ( _c_key.keys[ k ].pos ) {

									_c_key.keys[ k ].pos.set( 0, 0, 0 );

								}
								if ( _c_key.keys[ k ].scl ) {

									_c_key.keys[ k ].scl.set( 1, 1, 1 );

								}
								if ( _c_key.keys[ k ].rot ) {

									_c_key.keys[ k ].rot.set( 0, 0, 0, 1 );

								}

							}
							put.hierarchy.push( _c_key );

						}

					}
					if ( ! model.geometry.animations ) {

						model.geometry.animations = [];

					}

					model.geometry.animations.push( THREE.AnimationClip.parseAnimation( put, model.skeleton.bones ) );
					if ( ! model.animationMixer ) {

						model.animationMixer = new THREE.AnimationMixer( model );

					}

					return put;

				}
			}, {
				key: '_ParseMatrixData',
				value: function _ParseMatrixData( targetMatrix, data ) {

					targetMatrix.set( parseFloat( data[ 0 ] ), parseFloat( data[ 4 ] ), parseFloat( data[ 8 ] ), parseFloat( data[ 12 ] ), parseFloat( data[ 1 ] ), parseFloat( data[ 5 ] ), parseFloat( data[ 9 ] ), parseFloat( data[ 13 ] ), parseFloat( data[ 2 ] ), parseFloat( data[ 6 ] ), parseFloat( data[ 10 ] ), parseFloat( data[ 14 ] ), parseFloat( data[ 3 ] ), parseFloat( data[ 7 ] ), parseFloat( data[ 11 ] ), parseFloat( data[ 15 ] ) );

				}
			} ] );
			return XLoader;

		}();

		return XLoader;

	} )();
	
	return THREE.XLoader;
});

define('skylark-threejs-ex/loaders/DDSLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	THREE.DDSLoader = function ( manager ) {

		THREE.CompressedTextureLoader.call( this, manager );

	};

	THREE.DDSLoader.prototype = Object.assign( Object.create( THREE.CompressedTextureLoader.prototype ), {

		constructor: THREE.DDSLoader,

		parse: function ( buffer, loadMipmaps ) {

			var dds = { mipmaps: [], width: 0, height: 0, format: null, mipmapCount: 1 };

			// Adapted from @toji's DDS utils
			// https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

			// All values and structures referenced from:
			// http://msdn.microsoft.com/en-us/library/bb943991.aspx/

			var DDS_MAGIC = 0x20534444;

			var DDSD_CAPS = 0x1,
				DDSD_HEIGHT = 0x2,
				DDSD_WIDTH = 0x4,
				DDSD_PITCH = 0x8,
				DDSD_PIXELFORMAT = 0x1000,
				DDSD_MIPMAPCOUNT = 0x20000,
				DDSD_LINEARSIZE = 0x80000,
				DDSD_DEPTH = 0x800000;

			var DDSCAPS_COMPLEX = 0x8,
				DDSCAPS_MIPMAP = 0x400000,
				DDSCAPS_TEXTURE = 0x1000;

			var DDSCAPS2_CUBEMAP = 0x200,
				DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
				DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
				DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
				DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
				DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
				DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000,
				DDSCAPS2_VOLUME = 0x200000;

			var DDPF_ALPHAPIXELS = 0x1,
				DDPF_ALPHA = 0x2,
				DDPF_FOURCC = 0x4,
				DDPF_RGB = 0x40,
				DDPF_YUV = 0x200,
				DDPF_LUMINANCE = 0x20000;

			function fourCCToInt32( value ) {

				return value.charCodeAt( 0 ) +
					( value.charCodeAt( 1 ) << 8 ) +
					( value.charCodeAt( 2 ) << 16 ) +
					( value.charCodeAt( 3 ) << 24 );

			}

			function int32ToFourCC( value ) {

				return String.fromCharCode(
					value & 0xff,
					( value >> 8 ) & 0xff,
					( value >> 16 ) & 0xff,
					( value >> 24 ) & 0xff
				);

			}

			function loadARGBMip( buffer, dataOffset, width, height ) {

				var dataLength = width * height * 4;
				var srcBuffer = new Uint8Array( buffer, dataOffset, dataLength );
				var byteArray = new Uint8Array( dataLength );
				var dst = 0;
				var src = 0;
				for ( var y = 0; y < height; y ++ ) {

					for ( var x = 0; x < width; x ++ ) {

						var b = srcBuffer[ src ]; src ++;
						var g = srcBuffer[ src ]; src ++;
						var r = srcBuffer[ src ]; src ++;
						var a = srcBuffer[ src ]; src ++;
						byteArray[ dst ] = r; dst ++;	//r
						byteArray[ dst ] = g; dst ++;	//g
						byteArray[ dst ] = b; dst ++;	//b
						byteArray[ dst ] = a; dst ++;	//a

					}

				}
				return byteArray;

			}

			var FOURCC_DXT1 = fourCCToInt32( "DXT1" );
			var FOURCC_DXT3 = fourCCToInt32( "DXT3" );
			var FOURCC_DXT5 = fourCCToInt32( "DXT5" );
			var FOURCC_ETC1 = fourCCToInt32( "ETC1" );

			var headerLengthInt = 31; // The header length in 32 bit ints

			// Offsets into the header array

			var off_magic = 0;

			var off_size = 1;
			var off_flags = 2;
			var off_height = 3;
			var off_width = 4;

			var off_mipmapCount = 7;

			var off_pfFlags = 20;
			var off_pfFourCC = 21;
			var off_RGBBitCount = 22;
			var off_RBitMask = 23;
			var off_GBitMask = 24;
			var off_BBitMask = 25;
			var off_ABitMask = 26;

			var off_caps = 27;
			var off_caps2 = 28;
			var off_caps3 = 29;
			var off_caps4 = 30;

			// Parse header

			var header = new Int32Array( buffer, 0, headerLengthInt );

			if ( header[ off_magic ] !== DDS_MAGIC ) {

				console.error( 'THREE.DDSLoader.parse: Invalid magic number in DDS header.' );
				return dds;

			}

			if ( ! header[ off_pfFlags ] & DDPF_FOURCC ) {

				console.error( 'THREE.DDSLoader.parse: Unsupported format, must contain a FourCC code.' );
				return dds;

			}

			var blockBytes;

			var fourCC = header[ off_pfFourCC ];

			var isRGBAUncompressed = false;

			switch ( fourCC ) {

				case FOURCC_DXT1:

					blockBytes = 8;
					dds.format = THREE.RGB_S3TC_DXT1_Format;
					break;

				case FOURCC_DXT3:

					blockBytes = 16;
					dds.format = THREE.RGBA_S3TC_DXT3_Format;
					break;

				case FOURCC_DXT5:

					blockBytes = 16;
					dds.format = THREE.RGBA_S3TC_DXT5_Format;
					break;

				case FOURCC_ETC1:

					blockBytes = 8;
					dds.format = THREE.RGB_ETC1_Format;
					break;

				default:

					if ( header[ off_RGBBitCount ] === 32
						&& header[ off_RBitMask ] & 0xff0000
						&& header[ off_GBitMask ] & 0xff00
						&& header[ off_BBitMask ] & 0xff
						&& header[ off_ABitMask ] & 0xff000000 ) {

						isRGBAUncompressed = true;
						blockBytes = 64;
						dds.format = THREE.RGBAFormat;

					} else {

						console.error( 'THREE.DDSLoader.parse: Unsupported FourCC code ', int32ToFourCC( fourCC ) );
						return dds;

					}

			}

			dds.mipmapCount = 1;

			if ( header[ off_flags ] & DDSD_MIPMAPCOUNT && loadMipmaps !== false ) {

				dds.mipmapCount = Math.max( 1, header[ off_mipmapCount ] );

			}

			var caps2 = header[ off_caps2 ];
			dds.isCubemap = caps2 & DDSCAPS2_CUBEMAP ? true : false;
			if ( dds.isCubemap && (
				! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEX ) ||
				! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEX ) ||
				! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEY ) ||
				! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEY ) ||
				! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEZ ) ||
				! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEZ )
			) ) {

				console.error( 'THREE.DDSLoader.parse: Incomplete cubemap faces' );
				return dds;

			}

			dds.width = header[ off_width ];
			dds.height = header[ off_height ];

			var dataOffset = header[ off_size ] + 4;

			// Extract mipmaps buffers

			var faces = dds.isCubemap ? 6 : 1;

			for ( var face = 0; face < faces; face ++ ) {

				var width = dds.width;
				var height = dds.height;

				for ( var i = 0; i < dds.mipmapCount; i ++ ) {

					if ( isRGBAUncompressed ) {

						var byteArray = loadARGBMip( buffer, dataOffset, width, height );
						var dataLength = byteArray.length;

					} else {

						var dataLength = Math.max( 4, width ) / 4 * Math.max( 4, height ) / 4 * blockBytes;
						var byteArray = new Uint8Array( buffer, dataOffset, dataLength );

					}

					var mipmap = { "data": byteArray, "width": width, "height": height };
					dds.mipmaps.push( mipmap );

					dataOffset += dataLength;

					width = Math.max( width >> 1, 1 );
					height = Math.max( height >> 1, 1 );

				}

			}

			return dds;

		}

	} );
	
	return THREE.DDSLoader;
});

define('skylark-threejs-ex/loaders/PVRLoader',[
	"skylark-threejs"
],function(THREE){
	/*
	 *	 PVRLoader
	 *   Author: pierre lepers
	 *   Date: 17/09/2014 11:09
	 *
	 *	 PVR v2 (legacy) parser
	 *   TODO : Add Support for PVR v3 format
	 *   TODO : implement loadMipmaps option
	 */

	THREE.PVRLoader = function ( manager ) {

		THREE.CompressedTextureLoader.call( this, manager );

	};

	THREE.PVRLoader.prototype = Object.assign( Object.create( THREE.CompressedTextureLoader.prototype ), {

		constructor: THREE.PVRLoader,

		parse: function ( buffer, loadMipmaps ) {

			var headerLengthInt = 13;
			var header = new Uint32Array( buffer, 0, headerLengthInt );

			var pvrDatas = {
				buffer: buffer,
				header: header,
				loadMipmaps: loadMipmaps
			};

			if ( header[ 0 ] === 0x03525650 ) {

				// PVR v3

				return THREE.PVRLoader._parseV3( pvrDatas );

			} else if ( header[ 11 ] === 0x21525650 ) {

				// PVR v2

				return THREE.PVRLoader._parseV2( pvrDatas );

			} else {

				console.error( 'THREE.PVRLoader: Unknown PVR format.' );

			}

		}

	} );

	THREE.PVRLoader._parseV3 = function ( pvrDatas ) {

		var header = pvrDatas.header;
		var bpp, format;


		var metaLen = header[ 12 ],
			pixelFormat = header[ 2 ],
			height = header[ 6 ],
			width = header[ 7 ],
			// numSurfs = header[ 9 ],
			numFaces = header[ 10 ],
			numMipmaps = header[ 11 ];

		switch ( pixelFormat ) {

			case 0 : // PVRTC 2bpp RGB
				bpp = 2;
				format = THREE.RGB_PVRTC_2BPPV1_Format;
				break;

			case 1 : // PVRTC 2bpp RGBA
				bpp = 2;
				format = THREE.RGBA_PVRTC_2BPPV1_Format;
				break;

			case 2 : // PVRTC 4bpp RGB
				bpp = 4;
				format = THREE.RGB_PVRTC_4BPPV1_Format;
				break;

			case 3 : // PVRTC 4bpp RGBA
				bpp = 4;
				format = THREE.RGBA_PVRTC_4BPPV1_Format;
				break;

			default :
				console.error( 'THREE.PVRLoader: Unsupported PVR format:', pixelFormat );

		}

		pvrDatas.dataPtr = 52 + metaLen;
		pvrDatas.bpp = bpp;
		pvrDatas.format = format;
		pvrDatas.width = width;
		pvrDatas.height = height;
		pvrDatas.numSurfaces = numFaces;
		pvrDatas.numMipmaps = numMipmaps;
		pvrDatas.isCubemap 	= ( numFaces === 6 );

		return THREE.PVRLoader._extract( pvrDatas );

	};

	THREE.PVRLoader._parseV2 = function ( pvrDatas ) {

		var header = pvrDatas.header;

		var headerLength = header[ 0 ],
			height = header[ 1 ],
			width = header[ 2 ],
			numMipmaps = header[ 3 ],
			flags = header[ 4 ],
			// dataLength = header[ 5 ],
			// bpp =  header[ 6 ],
			// bitmaskRed = header[ 7 ],
			// bitmaskGreen = header[ 8 ],
			// bitmaskBlue = header[ 9 ],
			bitmaskAlpha = header[ 10 ],
			// pvrTag = header[ 11 ],
			numSurfs = header[ 12 ];


		var TYPE_MASK = 0xff;
		var PVRTC_2 = 24,
			PVRTC_4 = 25;

		var formatFlags = flags & TYPE_MASK;

		var bpp, format;
		var _hasAlpha = bitmaskAlpha > 0;

		if ( formatFlags === PVRTC_4 ) {

			format = _hasAlpha ? THREE.RGBA_PVRTC_4BPPV1_Format : THREE.RGB_PVRTC_4BPPV1_Format;
			bpp = 4;

		} else if ( formatFlags === PVRTC_2 ) {

			format = _hasAlpha ? THREE.RGBA_PVRTC_2BPPV1_Format : THREE.RGB_PVRTC_2BPPV1_Format;
			bpp = 2;

		} else {

			console.error( 'THREE.PVRLoader: Unknown PVR format:', formatFlags );

		}

		pvrDatas.dataPtr = headerLength;
		pvrDatas.bpp = bpp;
		pvrDatas.format = format;
		pvrDatas.width = width;
		pvrDatas.height = height;
		pvrDatas.numSurfaces = numSurfs;
		pvrDatas.numMipmaps = numMipmaps + 1;

		// guess cubemap type seems tricky in v2
		// it juste a pvr containing 6 surface (no explicit cubemap type)
		pvrDatas.isCubemap 	= ( numSurfs === 6 );

		return THREE.PVRLoader._extract( pvrDatas );

	};


	THREE.PVRLoader._extract = function ( pvrDatas ) {

		var pvr = {
			mipmaps: [],
			width: pvrDatas.width,
			height: pvrDatas.height,
			format: pvrDatas.format,
			mipmapCount: pvrDatas.numMipmaps,
			isCubemap: pvrDatas.isCubemap
		};

		var buffer = pvrDatas.buffer;

		var dataOffset = pvrDatas.dataPtr,
			bpp = pvrDatas.bpp,
			numSurfs = pvrDatas.numSurfaces,
			dataSize = 0,
			blockSize = 0,
			blockWidth = 0,
			blockHeight = 0,
			widthBlocks = 0,
			heightBlocks = 0;

		if ( bpp === 2 ) {

			blockWidth = 8;
			blockHeight = 4;

		} else {

			blockWidth = 4;
			blockHeight = 4;

		}

		blockSize = ( blockWidth * blockHeight ) * bpp / 8;

		pvr.mipmaps.length = pvrDatas.numMipmaps * numSurfs;

		var mipLevel = 0;

		while ( mipLevel < pvrDatas.numMipmaps ) {

			var sWidth = pvrDatas.width >> mipLevel,
				sHeight = pvrDatas.height >> mipLevel;

			widthBlocks = sWidth / blockWidth;
			heightBlocks = sHeight / blockHeight;

			// Clamp to minimum number of blocks
			if ( widthBlocks < 2 ) widthBlocks = 2;
			if ( heightBlocks < 2 ) heightBlocks = 2;

			dataSize = widthBlocks * heightBlocks * blockSize;

			for ( var surfIndex = 0; surfIndex < numSurfs; surfIndex ++ ) {

				var byteArray = new Uint8Array( buffer, dataOffset, dataSize );

				var mipmap = {
					data: byteArray,
					width: sWidth,
					height: sHeight
				};

				pvr.mipmaps[ surfIndex * pvrDatas.numMipmaps + mipLevel ] = mipmap;

				dataOffset += dataSize;

			}

			mipLevel ++;

		}

		return pvr;

	};
	
	return THREE.PVRLoader;
});

define('skylark-threejs-ex/loaders/KTXLoader',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author amakaseev / https://github.com/amakaseev
	 *
	 * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
	 * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
	 *
	 * ported from https://github.com/BabylonJS/Babylon.js/blob/master/src/Tools/babylon.khronosTextureContainer.ts
	 */


	THREE.KTXLoader = function ( manager ) {

		THREE.CompressedTextureLoader.call( this, manager );

	};

	THREE.KTXLoader.prototype = Object.assign( Object.create( THREE.CompressedTextureLoader.prototype ), {

		constructor: THREE.KTXLoader,

		parse: function ( buffer, loadMipmaps ) {

			var ktx = new KhronosTextureContainer( buffer, 1 );

			return {
				mipmaps: ktx.mipmaps( loadMipmaps ),
				width: ktx.pixelWidth,
				height: ktx.pixelHeight,
				format: ktx.glInternalFormat,
				isCubemap: ktx.numberOfFaces === 6,
				mipmapCount: ktx.numberOfMipmapLevels
			};

		}

	} );

	var KhronosTextureContainer = ( function () {

		/**
		 * @param {ArrayBuffer} arrayBuffer- contents of the KTX container file
		 * @param {number} facesExpected- should be either 1 or 6, based whether a cube texture or or
		 * @param {boolean} threeDExpected- provision for indicating that data should be a 3D texture, not implemented
		 * @param {boolean} textureArrayExpected- provision for indicating that data should be a texture array, not implemented
		 */
		function KhronosTextureContainer( arrayBuffer, facesExpected /*, threeDExpected, textureArrayExpected */ ) {

			this.arrayBuffer = arrayBuffer;

			// Test that it is a ktx formatted file, based on the first 12 bytes, character representation is:
			// '´', 'K', 'T', 'X', ' ', '1', '1', 'ª', '\r', '\n', '\x1A', '\n'
			// 0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
			var identifier = new Uint8Array( this.arrayBuffer, 0, 12 );
			if ( identifier[ 0 ] !== 0xAB ||
				identifier[ 1 ] !== 0x4B ||
				identifier[ 2 ] !== 0x54 ||
				identifier[ 3 ] !== 0x58 ||
				identifier[ 4 ] !== 0x20 ||
				identifier[ 5 ] !== 0x31 ||
				identifier[ 6 ] !== 0x31 ||
				identifier[ 7 ] !== 0xBB ||
				identifier[ 8 ] !== 0x0D ||
				identifier[ 9 ] !== 0x0A ||
				identifier[ 10 ] !== 0x1A ||
				identifier[ 11 ] !== 0x0A ) {

				console.error( 'texture missing KTX identifier' );
				return;

			}

			// load the reset of the header in native 32 bit uint
			var dataSize = Uint32Array.BYTES_PER_ELEMENT;
			var headerDataView = new DataView( this.arrayBuffer, 12, 13 * dataSize );
			var endianness = headerDataView.getUint32( 0, true );
			var littleEndian = endianness === 0x04030201;

			this.glType = headerDataView.getUint32( 1 * dataSize, littleEndian ); // must be 0 for compressed textures
			this.glTypeSize = headerDataView.getUint32( 2 * dataSize, littleEndian ); // must be 1 for compressed textures
			this.glFormat = headerDataView.getUint32( 3 * dataSize, littleEndian ); // must be 0 for compressed textures
			this.glInternalFormat = headerDataView.getUint32( 4 * dataSize, littleEndian ); // the value of arg passed to gl.compressedTexImage2D(,,x,,,,)
			this.glBaseInternalFormat = headerDataView.getUint32( 5 * dataSize, littleEndian ); // specify GL_RGB, GL_RGBA, GL_ALPHA, etc (un-compressed only)
			this.pixelWidth = headerDataView.getUint32( 6 * dataSize, littleEndian ); // level 0 value of arg passed to gl.compressedTexImage2D(,,,x,,,)
			this.pixelHeight = headerDataView.getUint32( 7 * dataSize, littleEndian ); // level 0 value of arg passed to gl.compressedTexImage2D(,,,,x,,)
			this.pixelDepth = headerDataView.getUint32( 8 * dataSize, littleEndian ); // level 0 value of arg passed to gl.compressedTexImage3D(,,,,,x,,)
			this.numberOfArrayElements = headerDataView.getUint32( 9 * dataSize, littleEndian ); // used for texture arrays
			this.numberOfFaces = headerDataView.getUint32( 10 * dataSize, littleEndian ); // used for cubemap textures, should either be 1 or 6
			this.numberOfMipmapLevels = headerDataView.getUint32( 11 * dataSize, littleEndian ); // number of levels; disregard possibility of 0 for compressed textures
			this.bytesOfKeyValueData = headerDataView.getUint32( 12 * dataSize, littleEndian ); // the amount of space after the header for meta-data

			// Make sure we have a compressed type.  Not only reduces work, but probably better to let dev know they are not compressing.
			if ( this.glType !== 0 ) {

				console.warn( 'only compressed formats currently supported' );
				return;

			} else {

				// value of zero is an indication to generate mipmaps @ runtime.  Not usually allowed for compressed, so disregard.
				this.numberOfMipmapLevels = Math.max( 1, this.numberOfMipmapLevels );

			}
			if ( this.pixelHeight === 0 || this.pixelDepth !== 0 ) {

				console.warn( 'only 2D textures currently supported' );
				return;

			}
			if ( this.numberOfArrayElements !== 0 ) {

				console.warn( 'texture arrays not currently supported' );
				return;

			}
			if ( this.numberOfFaces !== facesExpected ) {

				console.warn( 'number of faces expected' + facesExpected + ', but found ' + this.numberOfFaces );
				return;

			}
			// we now have a completely validated file, so could use existence of loadType as success
			// would need to make this more elaborate & adjust checks above to support more than one load type
			this.loadType = KhronosTextureContainer.COMPRESSED_2D;

		}

		// return mipmaps for THREE.js
		KhronosTextureContainer.prototype.mipmaps = function ( loadMipmaps ) {

			var mipmaps = [];

			// initialize width & height for level 1
			var dataOffset = KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData;
			var width = this.pixelWidth;
			var height = this.pixelHeight;
			var mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1;

			for ( var level = 0; level < mipmapCount; level ++ ) {

				var imageSize = new Int32Array( this.arrayBuffer, dataOffset, 1 )[ 0 ]; // size per face, since not supporting array cubemaps
				dataOffset += 4; // size of the image + 4 for the imageSize field

				for ( var face = 0; face < this.numberOfFaces; face ++ ) {

					var byteArray = new Uint8Array( this.arrayBuffer, dataOffset, imageSize );

					mipmaps.push( { "data": byteArray, "width": width, "height": height } );

					dataOffset += imageSize;
					dataOffset += 3 - ( ( imageSize + 3 ) % 4 ); // add padding for odd sized image

				}
				width = Math.max( 1.0, width * 0.5 );
				height = Math.max( 1.0, height * 0.5 );

			}

			return mipmaps;

		};

		KhronosTextureContainer.HEADER_LEN = 12 + ( 13 * 4 ); // identifier + header elements (not including key value meta-data pairs)
		// load types
		KhronosTextureContainer.COMPRESSED_2D = 0; // uses a gl.compressedTexImage2D()
		KhronosTextureContainer.COMPRESSED_3D = 1; // uses a gl.compressedTexImage3D()
		KhronosTextureContainer.TEX_2D = 2; // uses a gl.texImage2D()
		KhronosTextureContainer.TEX_3D = 3; // uses a gl.texImage3D()

		return KhronosTextureContainer;

	}() );

	
	return THREE.KTXLoader;
});

define('skylark-threejs-ex/modifiers/SimplifyModifier',[
	"skylark-threejs"
],function(THREE){
	/**
	 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
	 *
	 *	Simplification Geometry Modifier
	 *    - based on code and technique
	 *	  - by Stan Melax in 1998
	 *	  - Progressive Mesh type Polygon Reduction Algorithm
	 *    - http://www.melax.com/polychop/
	 */

	THREE.SimplifyModifier = function () {};

	( function () {

		var cb = new THREE.Vector3(), ab = new THREE.Vector3();

		function pushIfUnique( array, object ) {

			if ( array.indexOf( object ) === - 1 ) array.push( object );

		}

		function removeFromArray( array, object ) {

			var k = array.indexOf( object );
			if ( k > - 1 ) array.splice( k, 1 );

		}

		function computeEdgeCollapseCost( u, v ) {

			// if we collapse edge uv by moving u to v then how
			// much different will the model change, i.e. the "error".

			var edgelength = v.position.distanceTo( u.position );
			var curvature = 0;

			var sideFaces = [];
			var i, il = u.faces.length, face, sideFace;

			// find the "sides" triangles that are on the edge uv
			for ( i = 0; i < il; i ++ ) {

				face = u.faces[ i ];

				if ( face.hasVertex( v ) ) {

					sideFaces.push( face );

				}

			}

			// use the triangle facing most away from the sides
			// to determine our curvature term
			for ( i = 0; i < il; i ++ ) {

				var minCurvature = 1;
				face = u.faces[ i ];

				for ( var j = 0; j < sideFaces.length; j ++ ) {

					sideFace = sideFaces[ j ];
					// use dot product of face normals.
					var dotProd = face.normal.dot( sideFace.normal );
					minCurvature = Math.min( minCurvature, ( 1.001 - dotProd ) / 2 );

				}

				curvature = Math.max( curvature, minCurvature );

			}

			// crude approach in attempt to preserve borders
			// though it seems not to be totally correct
			var borders = 0;
			if ( sideFaces.length < 2 ) {

				// we add some arbitrary cost for borders,
				// borders += 10;
				curvature = 1;

			}

			var amt = edgelength * curvature + borders;

			return amt;

		}

		function computeEdgeCostAtVertex( v ) {

			// compute the edge collapse cost for all edges that start
			// from vertex v.  Since we are only interested in reducing
			// the object by selecting the min cost edge at each step, we
			// only cache the cost of the least cost edge at this vertex
			// (in member variable collapse) as well as the value of the
			// cost (in member variable collapseCost).

			if ( v.neighbors.length === 0 ) {

				// collapse if no neighbors.
				v.collapseNeighbor = null;
				v.collapseCost = - 0.01;

				return;

			}

			v.collapseCost = 100000;
			v.collapseNeighbor = null;

			// search all neighboring edges for "least cost" edge
			for ( var i = 0; i < v.neighbors.length; i ++ ) {

				var collapseCost = computeEdgeCollapseCost( v, v.neighbors[ i ] );

				if ( ! v.collapseNeighbor ) {

					v.collapseNeighbor = v.neighbors[ i ];
					v.collapseCost = collapseCost;
					v.minCost = collapseCost;
					v.totalCost = 0;
					v.costCount = 0;

				}

				v.costCount ++;
				v.totalCost += collapseCost;

				if ( collapseCost < v.minCost ) {

					v.collapseNeighbor = v.neighbors[ i ];
					v.minCost = collapseCost;

				}

			}

			// we average the cost of collapsing at this vertex
			v.collapseCost = v.totalCost / v.costCount;
			// v.collapseCost = v.minCost;

		}

		function removeVertex( v, vertices ) {

			console.assert( v.faces.length === 0 );

			while ( v.neighbors.length ) {

				var n = v.neighbors.pop();
				removeFromArray( n.neighbors, v );

			}

			removeFromArray( vertices, v );

		}

		function removeFace( f, faces ) {

			removeFromArray( faces, f );

			if ( f.v1 ) removeFromArray( f.v1.faces, f );
			if ( f.v2 ) removeFromArray( f.v2.faces, f );
			if ( f.v3 ) removeFromArray( f.v3.faces, f );

			// TODO optimize this!
			var vs = [ f.v1, f.v2, f.v3 ];
			var v1, v2;

			for ( var i = 0; i < 3; i ++ ) {

				v1 = vs[ i ];
				v2 = vs[ ( i + 1 ) % 3 ];

				if ( ! v1 || ! v2 ) continue;

				v1.removeIfNonNeighbor( v2 );
				v2.removeIfNonNeighbor( v1 );

			}

		}

		function collapse( vertices, faces, u, v ) { // u and v are pointers to vertices of an edge

			// Collapse the edge uv by moving vertex u onto v

			if ( ! v ) {

				// u is a vertex all by itself so just delete it..
				removeVertex( u, vertices );
				return;

			}

			var i;
			var tmpVertices = [];

			for ( i = 0; i < u.neighbors.length; i ++ ) {

				tmpVertices.push( u.neighbors[ i ] );

			}


			// delete triangles on edge uv:
			for ( i = u.faces.length - 1; i >= 0; i -- ) {

				if ( u.faces[ i ].hasVertex( v ) ) {

					removeFace( u.faces[ i ], faces );

				}

			}

			// update remaining triangles to have v instead of u
			for ( i = u.faces.length - 1; i >= 0; i -- ) {

				u.faces[ i ].replaceVertex( u, v );

			}


			removeVertex( u, vertices );

			// recompute the edge collapse costs in neighborhood
			for ( i = 0; i < tmpVertices.length; i ++ ) {

				computeEdgeCostAtVertex( tmpVertices[ i ] );

			}

		}



		function minimumCostEdge( vertices ) {

			// O(n * n) approach. TODO optimize this

			var least = vertices[ 0 ];

			for ( var i = 0; i < vertices.length; i ++ ) {

				if ( vertices[ i ].collapseCost < least.collapseCost ) {

					least = vertices[ i ];

				}

			}

			return least;

		}

		// we use a triangle class to represent structure of face slightly differently

		function Triangle( v1, v2, v3, a, b, c ) {

			this.a = a;
			this.b = b;
			this.c = c;

			this.v1 = v1;
			this.v2 = v2;
			this.v3 = v3;

			this.normal = new THREE.Vector3();

			this.computeNormal();

			v1.faces.push( this );
			v1.addUniqueNeighbor( v2 );
			v1.addUniqueNeighbor( v3 );

			v2.faces.push( this );
			v2.addUniqueNeighbor( v1 );
			v2.addUniqueNeighbor( v3 );


			v3.faces.push( this );
			v3.addUniqueNeighbor( v1 );
			v3.addUniqueNeighbor( v2 );

		}

		Triangle.prototype.computeNormal = function () {

			var vA = this.v1.position;
			var vB = this.v2.position;
			var vC = this.v3.position;

			cb.subVectors( vC, vB );
			ab.subVectors( vA, vB );
			cb.cross( ab ).normalize();

			this.normal.copy( cb );

		};

		Triangle.prototype.hasVertex = function ( v ) {

			return v === this.v1 || v === this.v2 || v === this.v3;

		};

		Triangle.prototype.replaceVertex = function ( oldv, newv ) {

			if ( oldv === this.v1 ) this.v1 = newv;
			else if ( oldv === this.v2 ) this.v2 = newv;
			else if ( oldv === this.v3 ) this.v3 = newv;

			removeFromArray( oldv.faces, this );
			newv.faces.push( this );


			oldv.removeIfNonNeighbor( this.v1 );
			this.v1.removeIfNonNeighbor( oldv );

			oldv.removeIfNonNeighbor( this.v2 );
			this.v2.removeIfNonNeighbor( oldv );

			oldv.removeIfNonNeighbor( this.v3 );
			this.v3.removeIfNonNeighbor( oldv );

			this.v1.addUniqueNeighbor( this.v2 );
			this.v1.addUniqueNeighbor( this.v3 );

			this.v2.addUniqueNeighbor( this.v1 );
			this.v2.addUniqueNeighbor( this.v3 );

			this.v3.addUniqueNeighbor( this.v1 );
			this.v3.addUniqueNeighbor( this.v2 );

			this.computeNormal();

		};

		function Vertex( v, id ) {

			this.position = v;

			this.id = id; // old index id

			this.faces = []; // faces vertex is connected
			this.neighbors = []; // neighbouring vertices aka "adjacentVertices"

			// these will be computed in computeEdgeCostAtVertex()
			this.collapseCost = 0; // cost of collapsing this vertex, the less the better. aka objdist
			this.collapseNeighbor = null; // best candinate for collapsing

		}

		Vertex.prototype.addUniqueNeighbor = function ( vertex ) {

			pushIfUnique( this.neighbors, vertex );

		};

		Vertex.prototype.removeIfNonNeighbor = function ( n ) {

			var neighbors = this.neighbors;
			var faces = this.faces;

			var offset = neighbors.indexOf( n );
			if ( offset === - 1 ) return;
			for ( var i = 0; i < faces.length; i ++ ) {

				if ( faces[ i ].hasVertex( n ) ) return;

			}

			neighbors.splice( offset, 1 );

		};

		THREE.SimplifyModifier.prototype.modify = function ( geometry, count ) {

			if ( geometry.isBufferGeometry ) {

				geometry = new THREE.Geometry().fromBufferGeometry( geometry );

			}

			geometry.mergeVertices();

			var oldVertices = geometry.vertices; // Three Position
			var oldFaces = geometry.faces; // Three Face

			// conversion
			var vertices = [];
			var faces = [];

			var i, il;

			//
			// put data of original geometry in different data structures
			//

			// add vertices

			for ( i = 0, il = oldVertices.length; i < il; i ++ ) {

				var vertex = new Vertex( oldVertices[ i ], i );
				vertices.push( vertex );

			}

			// add faces

			for ( i = 0, il = oldFaces.length; i < il; i ++ ) {

				var face = oldFaces[ i ];

				var a = face.a;
				var b = face.b;
				var c = face.c;

				var triangle = new Triangle( vertices[ a ], vertices[ b ], vertices[ c ], a, b, c );
				faces.push( triangle );

			}

			// compute all edge collapse costs

			for ( i = 0, il = vertices.length; i < il; i ++ ) {

				computeEdgeCostAtVertex( vertices[ i ] );

			}

			var nextVertex;

			var z = count;

			while ( z -- ) {

				nextVertex = minimumCostEdge( vertices );

				if ( ! nextVertex ) {

					console.log( 'THREE.SimplifyModifier: No next vertex' );
					break;

				}

				collapse( vertices, faces, nextVertex, nextVertex.collapseNeighbor );

			}

			//

			var simplifiedGeometry = new THREE.BufferGeometry();
			var position = [];
			var index = [];

			//

			for ( i = 0; i < vertices.length; i ++ ) {

				var vertex = vertices[ i ].position;
				position.push( vertex.x, vertex.y, vertex.z );

			}

			//

			for ( i = 0; i < faces.length; i ++ ) {

				var face = faces[ i ];

				var a = vertices.indexOf( face.v1 );
				var b = vertices.indexOf( face.v2 );
				var c = vertices.indexOf( face.v3 );

				index.push( a, b, c );

			}

			//

			simplifiedGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
			simplifiedGeometry.setIndex( index );

			return simplifiedGeometry;

		};

	} )();
	
	return THREE.SimplifyModifier;
});

define('skylark-threejs-ex/modifiers/SubdivisionModifier',[
	"skylark-threejs"
],function(THREE){
	/**
	 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
	 *	@author centerionware / http://www.centerionware.com
	 *
	 *	Subdivision Geometry Modifier
	 *		using Loop Subdivision Scheme
	 *
	 *	References:
	 *		http://graphics.stanford.edu/~mdfisher/subdivision.html
	 *		http://www.holmes3d.net/graphics/subdivision/
	 *		http://www.cs.rutgers.edu/~decarlo/readings/subdiv-sg00c.pdf
	 *
	 *	Known Issues:
	 *		- currently doesn't handle "Sharp Edges"
	 */

	THREE.SubdivisionModifier = function ( subdivisions ) {

		this.subdivisions = ( subdivisions === undefined ) ? 1 : subdivisions;

	};

	// Applies the "modify" pattern
	THREE.SubdivisionModifier.prototype.modify = function ( geometry ) {

		if ( geometry.isBufferGeometry ) {

			geometry = new THREE.Geometry().fromBufferGeometry( geometry );

		} else {

			geometry = geometry.clone();

		}

		geometry.mergeVertices();

		var repeats = this.subdivisions;

		while ( repeats -- > 0 ) {

			this.smooth( geometry );

		}

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		return geometry;

	};

	( function () {

		// Some constants
		var ABC = [ 'a', 'b', 'c' ];


		function getEdge( a, b, map ) {

			var vertexIndexA = Math.min( a, b );
			var vertexIndexB = Math.max( a, b );

			var key = vertexIndexA + "_" + vertexIndexB;

			return map[ key ];

		}


		function processEdge( a, b, vertices, map, face, metaVertices ) {

			var vertexIndexA = Math.min( a, b );
			var vertexIndexB = Math.max( a, b );

			var key = vertexIndexA + "_" + vertexIndexB;

			var edge;

			if ( key in map ) {

				edge = map[ key ];

			} else {

				var vertexA = vertices[ vertexIndexA ];
				var vertexB = vertices[ vertexIndexB ];

				edge = {

					a: vertexA, // pointer reference
					b: vertexB,
					newEdge: null,
					// aIndex: a, // numbered reference
					// bIndex: b,
					faces: [] // pointers to face

				};

				map[ key ] = edge;

			}

			edge.faces.push( face );

			metaVertices[ a ].edges.push( edge );
			metaVertices[ b ].edges.push( edge );


		}

		function generateLookups( vertices, faces, metaVertices, edges ) {

			var i, il, face;

			for ( i = 0, il = vertices.length; i < il; i ++ ) {

				metaVertices[ i ] = { edges: [] };

			}

			for ( i = 0, il = faces.length; i < il; i ++ ) {

				face = faces[ i ];

				processEdge( face.a, face.b, vertices, edges, face, metaVertices );
				processEdge( face.b, face.c, vertices, edges, face, metaVertices );
				processEdge( face.c, face.a, vertices, edges, face, metaVertices );

			}

		}

		function newFace( newFaces, a, b, c, materialIndex ) {

			newFaces.push( new THREE.Face3( a, b, c, undefined, undefined, materialIndex ) );

		}

		function midpoint( a, b ) {

			return ( Math.abs( b - a ) / 2 ) + Math.min( a, b );

		}

		function newUv( newUvs, a, b, c ) {

			newUvs.push( [ a.clone(), b.clone(), c.clone() ] );

		}

		/////////////////////////////

		// Performs one iteration of Subdivision
		THREE.SubdivisionModifier.prototype.smooth = function ( geometry ) {

			var tmp = new THREE.Vector3();

			var oldVertices, oldFaces, oldUvs;
			var newVertices, newFaces, newUVs = [];

			var n, i, il, j, k;
			var metaVertices, sourceEdges;

			// new stuff.
			var sourceEdges, newEdgeVertices, newSourceVertices;

			oldVertices = geometry.vertices; // { x, y, z}
			oldFaces = geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }
			oldUvs = geometry.faceVertexUvs;

			var hasUvs = oldUvs[ 0 ] !== undefined && oldUvs[ 0 ].length > 0;

			if ( hasUvs ) {

				for ( var j = 0; j < oldUvs.length; j ++ ) {

					newUVs.push( [] );

				}

			}

			/******************************************************
			 *
			 * Step 0: Preprocess Geometry to Generate edges Lookup
			 *
			 *******************************************************/

			metaVertices = new Array( oldVertices.length );
			sourceEdges = {}; // Edge => { oldVertex1, oldVertex2, faces[]  }

			generateLookups( oldVertices, oldFaces, metaVertices, sourceEdges );


			/******************************************************
			 *
			 *	Step 1.
			 *	For each edge, create a new Edge Vertex,
			 *	then position it.
			 *
			 *******************************************************/

			newEdgeVertices = [];
			var other, currentEdge, newEdge, face;
			var edgeVertexWeight, adjacentVertexWeight, connectedFaces;

			for ( i in sourceEdges ) {

				currentEdge = sourceEdges[ i ];
				newEdge = new THREE.Vector3();

				edgeVertexWeight = 3 / 8;
				adjacentVertexWeight = 1 / 8;

				connectedFaces = currentEdge.faces.length;

				// check how many linked faces. 2 should be correct.
				if ( connectedFaces != 2 ) {

					// if length is not 2, handle condition
					edgeVertexWeight = 0.5;
					adjacentVertexWeight = 0;

					if ( connectedFaces != 1 ) {

						// console.warn( 'Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge );

					}

				}

				newEdge.addVectors( currentEdge.a, currentEdge.b ).multiplyScalar( edgeVertexWeight );

				tmp.set( 0, 0, 0 );

				for ( j = 0; j < connectedFaces; j ++ ) {

					face = currentEdge.faces[ j ];

					for ( k = 0; k < 3; k ++ ) {

						other = oldVertices[ face[ ABC[ k ] ] ];
						if ( other !== currentEdge.a && other !== currentEdge.b ) break;

					}

					tmp.add( other );

				}

				tmp.multiplyScalar( adjacentVertexWeight );
				newEdge.add( tmp );

				currentEdge.newEdge = newEdgeVertices.length;
				newEdgeVertices.push( newEdge );

				// console.log(currentEdge, newEdge);

			}

			/******************************************************
			 *
			 *	Step 2.
			 *	Reposition each source vertices.
			 *
			 *******************************************************/

			var beta, sourceVertexWeight, connectingVertexWeight;
			var connectingEdge, connectingEdges, oldVertex, newSourceVertex;
			newSourceVertices = [];

			for ( i = 0, il = oldVertices.length; i < il; i ++ ) {

				oldVertex = oldVertices[ i ];

				// find all connecting edges (using lookupTable)
				connectingEdges = metaVertices[ i ].edges;
				n = connectingEdges.length;

				if ( n == 3 ) {

					beta = 3 / 16;

				} else if ( n > 3 ) {

					beta = 3 / ( 8 * n ); // Warren's modified formula

				}

				// Loop's original beta formula
				// beta = 1 / n * ( 5/8 - Math.pow( 3/8 + 1/4 * Math.cos( 2 * Math. PI / n ), 2) );

				sourceVertexWeight = 1 - n * beta;
				connectingVertexWeight = beta;

				if ( n <= 2 ) {

					// crease and boundary rules
					// console.warn('crease and boundary rules');

					if ( n == 2 ) {

						// console.warn( '2 connecting edges', connectingEdges );
						sourceVertexWeight = 3 / 4;
						connectingVertexWeight = 1 / 8;

						// sourceVertexWeight = 1;
						// connectingVertexWeight = 0;

					} else if ( n == 1 ) {

						// console.warn( 'only 1 connecting edge' );

					} else if ( n == 0 ) {

						// console.warn( '0 connecting edges' );

					}

				}

				newSourceVertex = oldVertex.clone().multiplyScalar( sourceVertexWeight );

				tmp.set( 0, 0, 0 );

				for ( j = 0; j < n; j ++ ) {

					connectingEdge = connectingEdges[ j ];
					other = connectingEdge.a !== oldVertex ? connectingEdge.a : connectingEdge.b;
					tmp.add( other );

				}

				tmp.multiplyScalar( connectingVertexWeight );
				newSourceVertex.add( tmp );

				newSourceVertices.push( newSourceVertex );

			}


			/******************************************************
			 *
			 *	Step 3.
			 *	Generate Faces between source vertices
			 *	and edge vertices.
			 *
			 *******************************************************/

			newVertices = newSourceVertices.concat( newEdgeVertices );
			var sl = newSourceVertices.length, edge1, edge2, edge3;
			newFaces = [];

			var uv, x0, x1, x2;
			var x3 = new THREE.Vector2();
			var x4 = new THREE.Vector2();
			var x5 = new THREE.Vector2();

			for ( i = 0, il = oldFaces.length; i < il; i ++ ) {

				face = oldFaces[ i ];

				// find the 3 new edges vertex of each old face

				edge1 = getEdge( face.a, face.b, sourceEdges ).newEdge + sl;
				edge2 = getEdge( face.b, face.c, sourceEdges ).newEdge + sl;
				edge3 = getEdge( face.c, face.a, sourceEdges ).newEdge + sl;

				// create 4 faces.

				newFace( newFaces, edge1, edge2, edge3, face.materialIndex );
				newFace( newFaces, face.a, edge1, edge3, face.materialIndex );
				newFace( newFaces, face.b, edge2, edge1, face.materialIndex );
				newFace( newFaces, face.c, edge3, edge2, face.materialIndex );

				// create 4 new uv's

				if ( hasUvs ) {

					for ( var j = 0; j < oldUvs.length; j ++ ) {

						uv = oldUvs[ j ][ i ];

						x0 = uv[ 0 ];
						x1 = uv[ 1 ];
						x2 = uv[ 2 ];

						x3.set( midpoint( x0.x, x1.x ), midpoint( x0.y, x1.y ) );
						x4.set( midpoint( x1.x, x2.x ), midpoint( x1.y, x2.y ) );
						x5.set( midpoint( x0.x, x2.x ), midpoint( x0.y, x2.y ) );

						newUv( newUVs[ j ], x3, x4, x5 );
						newUv( newUVs[ j ], x0, x3, x5 );

						newUv( newUVs[ j ], x1, x4, x3 );
						newUv( newUVs[ j ], x2, x5, x4 );

					}

				}

			}

			// Overwrite old arrays
			geometry.vertices = newVertices;
			geometry.faces = newFaces;
			if ( hasUvs ) geometry.faceVertexUvs = newUVs;

			// console.log('done');

		};

	} )();
	
	return THREE.SubdivisionModifier;
});

define('skylark-threejs-ex/exporters/DRACOExporter',[
	"skylark-threejs"
],function(THREE){
	/**
	 * Export draco compressed files from threejs geometry objects.
	 *
	 * Draco files are compressed and usually are smaller than conventional 3D file formats.
	 *
	 * The exporter receives a options object containing
	 *  - decodeSpeed, indicates how to tune the encoder regarding decode speed (0 gives better speed but worst quality)
	 *  - encodeSpeed, indicates how to tune the encoder parameters (0 gives better speed but worst quality)
	 *  - encoderMethod
	 *  - quantization, indicates the presision of each type of data stored in the draco file in the order (POSITION, NORMAL, COLOR, TEX_COORD, GENERIC)
	 *  - exportUvs
	 *  - exportNormals
	 *
	 * @class DRACOExporter
	 * @author tentone
	 */

	/* global DracoEncoderModule */

	THREE.DRACOExporter = function () {};

	THREE.DRACOExporter.prototype = {

		constructor: THREE.DRACOExporter,

		parse: function ( geometry, options ) {


			if ( DracoEncoderModule === undefined ) {

				throw new Error( 'THREE.DRACOExporter: required the draco_decoder to work.' );

			}

			if ( options === undefined ) {

				options = {

					decodeSpeed: 5,
					encodeSpeed: 5,
					encoderMethod: THREE.DRACOExporter.MESH_EDGEBREAKER_ENCODING,
					quantization: [ 16, 8, 8, 8, 8 ],
					exportUvs: true,
					exportNormals: true,
					exportColor: false,

				};

			}

			var dracoEncoder = DracoEncoderModule();
			var encoder = new dracoEncoder.Encoder();
			var builder = new dracoEncoder.MeshBuilder();
			var mesh = new dracoEncoder.Mesh();

			if ( geometry.isGeometry === true ) {

				var bufferGeometry = new THREE.BufferGeometry();
				bufferGeometry.fromGeometry( geometry );
				geometry = bufferGeometry;

			}

			if ( geometry.isBufferGeometry !== true ) {

				throw new Error( 'THREE.DRACOExporter.parse(geometry, options): geometry is not a THREE.Geometry or THREE.BufferGeometry instance.' );

			}

			var vertices = geometry.getAttribute( 'position' );
			builder.AddFloatAttributeToMesh( mesh, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array );

			var faces = geometry.getIndex();

			if ( faces !== null ) {

				builder.AddFacesToMesh( mesh, faces.count, faces.array );

			} else {

				var faces = new ( vertices.count > 65535 ? Uint32Array : Uint16Array )( vertices.count );

				for ( var i = 0; i < faces.length; i ++ ) {

					faces[ i ] = i;

				}

				builder.AddFacesToMesh( mesh, vertices.count, faces );

			}

			if ( options.exportNormals === true ) {

				var normals = geometry.getAttribute( 'normal' );

				if ( normals !== undefined ) {

					builder.AddFloatAttributeToMesh( mesh, dracoEncoder.NORMAL, normals.count, normals.itemSize, normals.array );

				}

			}

			if ( options.exportUvs === true ) {

				var uvs = geometry.getAttribute( 'uv' );

				if ( uvs !== undefined ) {

					builder.AddFloatAttributeToMesh( mesh, dracoEncoder.TEX_COORD, uvs.count, uvs.itemSize, uvs.array );

				}

			}

			if ( options.exportColor === true ) {

				var colors = geometry.getAttribute( 'color' );

				if ( colors !== undefined ) {

					builder.AddFloatAttributeToMesh( mesh, dracoEncoder.COLOR, colors.count, colors.itemSize, colors.array );

				}

			}

			//Compress using draco encoder

			var encodedData = new dracoEncoder.DracoInt8Array();

			//Sets the desired encoding and decoding speed for the given options from 0 (slowest speed, but the best compression) to 10 (fastest, but the worst compression).

			encoder.SetSpeedOptions( options.encodeSpeed || 5, options.decodeSpeed || 5 );

			// Sets the desired encoding method for a given geometry.

			if ( options.encoderMethod !== undefined ) {

				encoder.SetEncodingMethod( options.encoderMethod );

			}

			// Sets the quantization (number of bits used to represent) compression options for a named attribute.
			// The attribute values will be quantized in a box defined by the maximum extent of the attribute values.
			if ( options.quantization !== undefined ) {

				for ( var i = 0; i < 5; i ++ ) {

					if ( options.quantization[ i ] !== undefined ) {

						encoder.SetAttributeQuantization( i, options.quantization[ i ] );

					}

				}

			}

			var length = encoder.EncodeMeshToDracoBuffer( mesh, encodedData );
			dracoEncoder.destroy( mesh );

			if ( length === 0 ) {

				throw new Error( 'THREE.DRACOExporter: Draco encoding failed.' );

			}

			//Copy encoded data to buffer.
			var outputData = new Int8Array( new ArrayBuffer( length ) );

			for ( var i = 0; i < length; i ++ ) {

				outputData[ i ] = encodedData.GetValue( i );

			}

			dracoEncoder.destroy( encodedData );
			dracoEncoder.destroy( encoder );
			dracoEncoder.destroy( builder );

			return outputData;

		}

	};

	// Encoder methods

	THREE.DRACOExporter.MESH_EDGEBREAKER_ENCODING = 1;
	THREE.DRACOExporter.MESH_SEQUENTIAL_ENCODING = 0;

	// Geometry type

	THREE.DRACOExporter.POINT_CLOUD = 0;
	THREE.DRACOExporter.TRIANGULAR_MESH = 1;

	// Attribute type

	THREE.DRACOExporter.INVALID = - 1;
	THREE.DRACOExporter.POSITION = 0;
	THREE.DRACOExporter.NORMAL = 1;
	THREE.DRACOExporter.COLOR = 2;
	THREE.DRACOExporter.TEX_COORD = 3;
	THREE.DRACOExporter.GENERIC = 4;
	
	return THREE.DRACOExporter;
});

define('skylark-threejs-ex/exporters/OBJExporter',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	THREE.OBJExporter = function () {};

	THREE.OBJExporter.prototype = {

		constructor: THREE.OBJExporter,

		parse: function ( object ) {

			var output = '';

			var indexVertex = 0;
			var indexVertexUvs = 0;
			var indexNormals = 0;

			var vertex = new THREE.Vector3();
			var normal = new THREE.Vector3();
			var uv = new THREE.Vector2();

			var i, j, k, l, m, face = [];

			var parseMesh = function ( mesh ) {

				var nbVertex = 0;
				var nbNormals = 0;
				var nbVertexUvs = 0;

				var geometry = mesh.geometry;

				var normalMatrixWorld = new THREE.Matrix3();

				if ( geometry instanceof THREE.Geometry ) {

					geometry = new THREE.BufferGeometry().setFromObject( mesh );

				}

				if ( geometry instanceof THREE.BufferGeometry ) {

					// shortcuts
					var vertices = geometry.getAttribute( 'position' );
					var normals = geometry.getAttribute( 'normal' );
					var uvs = geometry.getAttribute( 'uv' );
					var indices = geometry.getIndex();

					// name of the mesh object
					output += 'o ' + mesh.name + '\n';

					// name of the mesh material
					if ( mesh.material && mesh.material.name ) {

						output += 'usemtl ' + mesh.material.name + '\n';

					}

					// vertices

					if ( vertices !== undefined ) {

						for ( i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

							vertex.x = vertices.getX( i );
							vertex.y = vertices.getY( i );
							vertex.z = vertices.getZ( i );

							// transfrom the vertex to world space
							vertex.applyMatrix4( mesh.matrixWorld );

							// transform the vertex to export format
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

						}

					}

					// uvs

					if ( uvs !== undefined ) {

						for ( i = 0, l = uvs.count; i < l; i ++, nbVertexUvs ++ ) {

							uv.x = uvs.getX( i );
							uv.y = uvs.getY( i );

							// transform the uv to export format
							output += 'vt ' + uv.x + ' ' + uv.y + '\n';

						}

					}

					// normals

					if ( normals !== undefined ) {

						normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

						for ( i = 0, l = normals.count; i < l; i ++, nbNormals ++ ) {

							normal.x = normals.getX( i );
							normal.y = normals.getY( i );
							normal.z = normals.getZ( i );

							// transfrom the normal to world space
							normal.applyMatrix3( normalMatrixWorld ).normalize();

							// transform the normal to export format
							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

						}

					}

					// faces

					if ( indices !== null ) {

						for ( i = 0, l = indices.count; i < l; i += 3 ) {

							for ( m = 0; m < 3; m ++ ) {

								j = indices.getX( i + m ) + 1;

								face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

							}

							// transform the face to export format
							output += 'f ' + face.join( ' ' ) + "\n";

						}

					} else {

						for ( i = 0, l = vertices.count; i < l; i += 3 ) {

							for ( m = 0; m < 3; m ++ ) {

								j = i + m + 1;

								face[ m ] = ( indexVertex + j ) + ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );

							}

							// transform the face to export format
							output += 'f ' + face.join( ' ' ) + "\n";

						}

					}

				} else {

					console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry );

				}

				// update index
				indexVertex += nbVertex;
				indexVertexUvs += nbVertexUvs;
				indexNormals += nbNormals;

			};

			var parseLine = function ( line ) {

				var nbVertex = 0;

				var geometry = line.geometry;
				var type = line.type;

				if ( geometry instanceof THREE.Geometry ) {

					geometry = new THREE.BufferGeometry().setFromObject( line );

				}

				if ( geometry instanceof THREE.BufferGeometry ) {

					// shortcuts
					var vertices = geometry.getAttribute( 'position' );

					// name of the line object
					output += 'o ' + line.name + '\n';

					if ( vertices !== undefined ) {

						for ( i = 0, l = vertices.count; i < l; i ++, nbVertex ++ ) {

							vertex.x = vertices.getX( i );
							vertex.y = vertices.getY( i );
							vertex.z = vertices.getZ( i );

							// transfrom the vertex to world space
							vertex.applyMatrix4( line.matrixWorld );

							// transform the vertex to export format
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

						}

					}

					if ( type === 'Line' ) {

						output += 'l ';

						for ( j = 1, l = vertices.count; j <= l; j ++ ) {

							output += ( indexVertex + j ) + ' ';

						}

						output += '\n';

					}

					if ( type === 'LineSegments' ) {

						for ( j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1 ) {

							output += 'l ' + ( indexVertex + j ) + ' ' + ( indexVertex + k ) + '\n';

						}

					}

				} else {

					console.warn( 'THREE.OBJExporter.parseLine(): geometry type unsupported', geometry );

				}

				// update index
				indexVertex += nbVertex;

			};

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					parseMesh( child );

				}

				if ( child instanceof THREE.Line ) {

					parseLine( child );

				}

			} );

			return output;

		}

	};
	
	return THREE.OBJExporter;
});

define('skylark-threejs-ex/exporters/STLExporter',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author kovacsv / http://kovacsv.hu/
	 * @author mrdoob / http://mrdoob.com/
	 * @author mudcube / http://mudcu.be/
	 * @author Mugen87 / https://github.com/Mugen87
	 *
	 * Usage:
	 *  var exporter = new THREE.STLExporter();
	 *
	 *  // second argument is a list of options
	 *  var data = exporter.parse( mesh, { binary: true } );
	 *
	 */

	THREE.STLExporter = function () {};

	THREE.STLExporter.prototype = {

		constructor: THREE.STLExporter,

		parse: ( function () {

			var vector = new THREE.Vector3();
			var normalMatrixWorld = new THREE.Matrix3();

			return function parse( scene, options ) {

				if ( options === undefined ) options = {};

				var binary = options.binary !== undefined ? options.binary : false;

				//

				var objects = [];
				var triangles = 0;	

				scene.traverse( function ( object ) {

					if ( object.isMesh ) {

						var geometry = object.geometry;

						if ( geometry.isBufferGeometry ) {

							geometry = new THREE.Geometry().fromBufferGeometry( geometry );

						}

						if ( geometry.isGeometry ) {

							triangles += geometry.faces.length;

							objects.push( {

								geometry: geometry,
								matrixWorld: object.matrixWorld

							} );

						}

					}

				} );

				if ( binary ) {

					var offset = 80; // skip header
					var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
					var arrayBuffer = new ArrayBuffer( bufferLength );
					var output = new DataView( arrayBuffer );
					output.setUint32( offset, triangles, true ); offset += 4;

					for ( var i = 0, il = objects.length; i < il; i ++ ) {

						var object = objects[ i ];

						var vertices = object.geometry.vertices;
						var faces = object.geometry.faces;
						var matrixWorld = object.matrixWorld;

						normalMatrixWorld.getNormalMatrix( matrixWorld );

						for ( var j = 0, jl = faces.length; j < jl; j ++ ) {

							var face = faces[ j ];

							vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

							output.setFloat32( offset, vector.x, true ); offset += 4; // normal
							output.setFloat32( offset, vector.y, true ); offset += 4;
							output.setFloat32( offset, vector.z, true ); offset += 4;

							var indices = [ face.a, face.b, face.c ];

							for ( var k = 0; k < 3; k ++ ) {

								vector.copy( vertices[ indices[ k ] ] ).applyMatrix4( matrixWorld );

								output.setFloat32( offset, vector.x, true ); offset += 4; // vertices
								output.setFloat32( offset, vector.y, true ); offset += 4;
								output.setFloat32( offset, vector.z, true ); offset += 4;

							}

							output.setUint16( offset, 0, true ); offset += 2; // attribute byte count

						}

					}

					return output;

				} else {

					var output = '';

					output += 'solid exported\n';

					for ( var i = 0, il = objects.length; i < il; i ++ ) {

						var object = objects[ i ];

						var vertices = object.geometry.vertices;
						var faces = object.geometry.faces;
						var matrixWorld = object.matrixWorld;

						normalMatrixWorld.getNormalMatrix( matrixWorld );

						for ( var j = 0, jl = faces.length; j < jl; j ++ ) {

							var face = faces[ j ];

							vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

							output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
							output += '\t\touter loop\n';

							var indices = [ face.a, face.b, face.c ];

							for ( var k = 0; k < 3; k ++ ) {

								vector.copy( vertices[ indices[ k ] ] ).applyMatrix4( matrixWorld );

								output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

							}

							output += '\t\tendloop\n';
							output += '\tendfacet\n';

						}

					}

					output += 'endsolid exported\n';

					return output;

				}

			};

		}() )

	};
	
	return THREE.STLExporter;
});

define('skylark-threejs-ex/exporters/GLTFExporter',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author fernandojsg / http://fernandojsg.com
	 * @author Don McCurdy / https://www.donmccurdy.com
	 * @author Takahiro / https://github.com/takahirox
	 */

	//------------------------------------------------------------------------------
	// Constants
	//------------------------------------------------------------------------------
	var WEBGL_CONSTANTS = {
		POINTS: 0x0000,
		LINES: 0x0001,
		LINE_LOOP: 0x0002,
		LINE_STRIP: 0x0003,
		TRIANGLES: 0x0004,
		TRIANGLE_STRIP: 0x0005,
		TRIANGLE_FAN: 0x0006,

		UNSIGNED_BYTE: 0x1401,
		UNSIGNED_SHORT: 0x1403,
		FLOAT: 0x1406,
		UNSIGNED_INT: 0x1405,
		ARRAY_BUFFER: 0x8892,
		ELEMENT_ARRAY_BUFFER: 0x8893,

		NEAREST: 0x2600,
		LINEAR: 0x2601,
		NEAREST_MIPMAP_NEAREST: 0x2700,
		LINEAR_MIPMAP_NEAREST: 0x2701,
		NEAREST_MIPMAP_LINEAR: 0x2702,
		LINEAR_MIPMAP_LINEAR: 0x2703,

		CLAMP_TO_EDGE: 33071,
		MIRRORED_REPEAT: 33648,
		REPEAT: 10497
	};

	var THREE_TO_WEBGL = {};

	THREE_TO_WEBGL[ THREE.NearestFilter ] = WEBGL_CONSTANTS.NEAREST;
	THREE_TO_WEBGL[ THREE.NearestMipmapNearestFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ THREE.NearestMipmapLinearFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR;
	THREE_TO_WEBGL[ THREE.LinearFilter ] = WEBGL_CONSTANTS.LINEAR;
	THREE_TO_WEBGL[ THREE.LinearMipmapNearestFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ THREE.LinearMipmapLinearFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR;

	THREE_TO_WEBGL[ THREE.ClampToEdgeWrapping ] = WEBGL_CONSTANTS.CLAMP_TO_EDGE;
	THREE_TO_WEBGL[ THREE.RepeatWrapping ] = WEBGL_CONSTANTS.REPEAT;
	THREE_TO_WEBGL[ THREE.MirroredRepeatWrapping ] = WEBGL_CONSTANTS.MIRRORED_REPEAT;

	var PATH_PROPERTIES = {
		scale: 'scale',
		position: 'translation',
		quaternion: 'rotation',
		morphTargetInfluences: 'weights'
	};

	//------------------------------------------------------------------------------
	// GLTF Exporter
	//------------------------------------------------------------------------------
	THREE.GLTFExporter = function () {};

	THREE.GLTFExporter.prototype = {

		constructor: THREE.GLTFExporter,

		/**
		 * Parse scenes and generate GLTF output
		 * @param  {THREE.Scene or [THREE.Scenes]} input   THREE.Scene or Array of THREE.Scenes
		 * @param  {Function} onDone  Callback on completed
		 * @param  {Object} options options
		 */
		parse: function ( input, onDone, options ) {

			var DEFAULT_OPTIONS = {
				binary: false,
				trs: false,
				onlyVisible: true,
				truncateDrawRange: true,
				embedImages: true,
				maxTextureSize: Infinity,
				animations: [],
				forceIndices: false,
				forcePowerOfTwoTextures: false,
				includeCustomExtensions: false
			};

			options = Object.assign( {}, DEFAULT_OPTIONS, options );

			if ( options.animations.length > 0 ) {

				// Only TRS properties, and not matrices, may be targeted by animation.
				options.trs = true;

			}

			var outputJSON = {

				asset: {

					version: "2.0",
					generator: "THREE.GLTFExporter"

				}

			};

			var byteOffset = 0;
			var buffers = [];
			var pending = [];
			var nodeMap = new Map();
			var skins = [];
			var extensionsUsed = {};
			var cachedData = {

				meshes: new Map(),
				attributes: new Map(),
				attributesNormalized: new Map(),
				materials: new Map(),
				textures: new Map(),
				images: new Map()

			};

			var cachedCanvas;

			var uids = new Map();
			var uid = 0;

			/**
			 * Assign and return a temporal unique id for an object
			 * especially which doesn't have .uuid
			 * @param  {Object} object
			 * @return {Integer}
			 */
			function getUID( object ) {

				if ( ! uids.has( object ) ) uids.set( object, uid ++ );

				return uids.get( object );

			}

			/**
			 * Compare two arrays
			 * @param  {Array} array1 Array 1 to compare
			 * @param  {Array} array2 Array 2 to compare
			 * @return {Boolean}        Returns true if both arrays are equal
			 */
			function equalArray( array1, array2 ) {

				return ( array1.length === array2.length ) && array1.every( function ( element, index ) {

					return element === array2[ index ];

				} );

			}

			/**
			 * Converts a string to an ArrayBuffer.
			 * @param  {string} text
			 * @return {ArrayBuffer}
			 */
			function stringToArrayBuffer( text ) {

				if ( window.TextEncoder !== undefined ) {

					return new TextEncoder().encode( text ).buffer;

				}

				var array = new Uint8Array( new ArrayBuffer( text.length ) );

				for ( var i = 0, il = text.length; i < il; i ++ ) {

					var value = text.charCodeAt( i );

					// Replacing multi-byte character with space(0x20).
					array[ i ] = value > 0xFF ? 0x20 : value;

				}

				return array.buffer;

			}

			/**
			 * Get the min and max vectors from the given attribute
			 * @param  {THREE.BufferAttribute} attribute Attribute to find the min/max in range from start to start + count
			 * @param  {Integer} start
			 * @param  {Integer} count
			 * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
			 */
			function getMinMax( attribute, start, count ) {

				var output = {

					min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
					max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )

				};

				for ( var i = start; i < start + count; i ++ ) {

					for ( var a = 0; a < attribute.itemSize; a ++ ) {

						var value = attribute.array[ i * attribute.itemSize + a ];
						output.min[ a ] = Math.min( output.min[ a ], value );
						output.max[ a ] = Math.max( output.max[ a ], value );

					}

				}

				return output;

			}

			/**
			 * Checks if image size is POT.
			 *
			 * @param {Image} image The image to be checked.
			 * @returns {Boolean} Returns true if image size is POT.
			 *
			 */
			function isPowerOfTwo( image ) {

				return THREE.MathUtils.isPowerOfTwo( image.width ) && THREE.MathUtils.isPowerOfTwo( image.height );

			}

			/**
			 * Checks if normal attribute values are normalized.
			 *
			 * @param {THREE.BufferAttribute} normal
			 * @returns {Boolean}
			 *
			 */
			function isNormalizedNormalAttribute( normal ) {

				if ( cachedData.attributesNormalized.has( normal ) ) {

					return false;

				}

				var v = new THREE.Vector3();

				for ( var i = 0, il = normal.count; i < il; i ++ ) {

					// 0.0005 is from glTF-validator
					if ( Math.abs( v.fromArray( normal.array, i * 3 ).length() - 1.0 ) > 0.0005 ) return false;

				}

				return true;

			}

			/**
			 * Creates normalized normal buffer attribute.
			 *
			 * @param {THREE.BufferAttribute} normal
			 * @returns {THREE.BufferAttribute}
			 *
			 */
			function createNormalizedNormalAttribute( normal ) {

				if ( cachedData.attributesNormalized.has( normal ) ) {

					return cachedData.attributesNormalized.get( normal );

				}

				var attribute = normal.clone();

				var v = new THREE.Vector3();

				for ( var i = 0, il = attribute.count; i < il; i ++ ) {

					v.fromArray( attribute.array, i * 3 );

					if ( v.x === 0 && v.y === 0 && v.z === 0 ) {

						// if values can't be normalized set (1, 0, 0)
						v.setX( 1.0 );

					} else {

						v.normalize();

					}

					v.toArray( attribute.array, i * 3 );

				}

				cachedData.attributesNormalized.set( normal, attribute );

				return attribute;

			}

			/**
			 * Get the required size + padding for a buffer, rounded to the next 4-byte boundary.
			 * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
			 *
			 * @param {Integer} bufferSize The size the original buffer.
			 * @returns {Integer} new buffer size with required padding.
			 *
			 */
			function getPaddedBufferSize( bufferSize ) {

				return Math.ceil( bufferSize / 4 ) * 4;

			}

			/**
			 * Returns a buffer aligned to 4-byte boundary.
			 *
			 * @param {ArrayBuffer} arrayBuffer Buffer to pad
			 * @param {Integer} paddingByte (Optional)
			 * @returns {ArrayBuffer} The same buffer if it's already aligned to 4-byte boundary or a new buffer
			 */
			function getPaddedArrayBuffer( arrayBuffer, paddingByte ) {

				paddingByte = paddingByte || 0;

				var paddedLength = getPaddedBufferSize( arrayBuffer.byteLength );

				if ( paddedLength !== arrayBuffer.byteLength ) {

					var array = new Uint8Array( paddedLength );
					array.set( new Uint8Array( arrayBuffer ) );

					if ( paddingByte !== 0 ) {

						for ( var i = arrayBuffer.byteLength; i < paddedLength; i ++ ) {

							array[ i ] = paddingByte;

						}

					}

					return array.buffer;

				}

				return arrayBuffer;

			}

			/**
			 * Serializes a userData.
			 *
			 * @param {THREE.Object3D|THREE.Material} object
			 * @param {Object} gltfProperty
			 */
			function serializeUserData( object, gltfProperty ) {

				if ( Object.keys( object.userData ).length === 0 ) {

					return;

				}

				try {

					var json = JSON.parse( JSON.stringify( object.userData ) );

					if ( options.includeCustomExtensions && json.gltfExtensions ) {

						if ( gltfProperty.extensions === undefined ) {

							gltfProperty.extensions = {};

						}

						for ( var extensionName in json.gltfExtensions ) {

							gltfProperty.extensions[ extensionName ] = json.gltfExtensions[ extensionName ];
							extensionsUsed[ extensionName ] = true;

						}

						delete json.gltfExtensions;

					}

					if ( Object.keys( json ).length > 0 ) {

						gltfProperty.extras = json;

					}

				} catch ( error ) {

					console.warn( 'THREE.GLTFExporter: userData of \'' + object.name + '\' ' +
						'won\'t be serialized because of JSON.stringify error - ' + error.message );

				}

			}

			/**
			 * Applies a texture transform, if present, to the map definition. Requires
			 * the KHR_texture_transform extension.
			 */
			function applyTextureTransform( mapDef, texture ) {

				var didTransform = false;
				var transformDef = {};

				if ( texture.offset.x !== 0 || texture.offset.y !== 0 ) {

					transformDef.offset = texture.offset.toArray();
					didTransform = true;

				}

				if ( texture.rotation !== 0 ) {

					transformDef.rotation = texture.rotation;
					didTransform = true;

				}

				if ( texture.repeat.x !== 1 || texture.repeat.y !== 1 ) {

					transformDef.scale = texture.repeat.toArray();
					didTransform = true;

				}

				if ( didTransform ) {

					mapDef.extensions = mapDef.extensions || {};
					mapDef.extensions[ 'KHR_texture_transform' ] = transformDef;
					extensionsUsed[ 'KHR_texture_transform' ] = true;

				}

			}

			/**
			 * Process a buffer to append to the default one.
			 * @param  {ArrayBuffer} buffer
			 * @return {Integer}
			 */
			function processBuffer( buffer ) {

				if ( ! outputJSON.buffers ) {

					outputJSON.buffers = [ { byteLength: 0 } ];

				}

				// All buffers are merged before export.
				buffers.push( buffer );

				return 0;

			}

			/**
			 * Process and generate a BufferView
			 * @param  {THREE.BufferAttribute} attribute
			 * @param  {number} componentType
			 * @param  {number} start
			 * @param  {number} count
			 * @param  {number} target (Optional) Target usage of the BufferView
			 * @return {Object}
			 */
			function processBufferView( attribute, componentType, start, count, target ) {

				if ( ! outputJSON.bufferViews ) {

					outputJSON.bufferViews = [];

				}

				// Create a new dataview and dump the attribute's array into it

				var componentSize;

				if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

					componentSize = 1;

				} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

					componentSize = 2;

				} else {

					componentSize = 4;

				}

				var byteLength = getPaddedBufferSize( count * attribute.itemSize * componentSize );
				var dataView = new DataView( new ArrayBuffer( byteLength ) );
				var offset = 0;

				for ( var i = start; i < start + count; i ++ ) {

					for ( var a = 0; a < attribute.itemSize; a ++ ) {

						// @TODO Fails on InterleavedBufferAttribute, and could probably be
						// optimized for normal BufferAttribute.
						var value = attribute.array[ i * attribute.itemSize + a ];

						if ( componentType === WEBGL_CONSTANTS.FLOAT ) {

							dataView.setFloat32( offset, value, true );

						} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_INT ) {

							dataView.setUint32( offset, value, true );

						} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

							dataView.setUint16( offset, value, true );

						} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

							dataView.setUint8( offset, value );

						}

						offset += componentSize;

					}

				}

				var gltfBufferView = {

					buffer: processBuffer( dataView.buffer ),
					byteOffset: byteOffset,
					byteLength: byteLength

				};

				if ( target !== undefined ) gltfBufferView.target = target;

				if ( target === WEBGL_CONSTANTS.ARRAY_BUFFER ) {

					// Only define byteStride for vertex attributes.
					gltfBufferView.byteStride = attribute.itemSize * componentSize;

				}

				byteOffset += byteLength;

				outputJSON.bufferViews.push( gltfBufferView );

				// @TODO Merge bufferViews where possible.
				var output = {

					id: outputJSON.bufferViews.length - 1,
					byteLength: 0

				};

				return output;

			}

			/**
			 * Process and generate a BufferView from an image Blob.
			 * @param {Blob} blob
			 * @return {Promise<Integer>}
			 */
			function processBufferViewImage( blob ) {

				if ( ! outputJSON.bufferViews ) {

					outputJSON.bufferViews = [];

				}

				return new Promise( function ( resolve ) {

					var reader = new window.FileReader();
					reader.readAsArrayBuffer( blob );
					reader.onloadend = function () {

						var buffer = getPaddedArrayBuffer( reader.result );

						var bufferView = {
							buffer: processBuffer( buffer ),
							byteOffset: byteOffset,
							byteLength: buffer.byteLength
						};

						byteOffset += buffer.byteLength;

						outputJSON.bufferViews.push( bufferView );

						resolve( outputJSON.bufferViews.length - 1 );

					};

				} );

			}

			/**
			 * Process attribute to generate an accessor
			 * @param  {THREE.BufferAttribute} attribute Attribute to process
			 * @param  {THREE.BufferGeometry} geometry (Optional) Geometry used for truncated draw range
			 * @param  {Integer} start (Optional)
			 * @param  {Integer} count (Optional)
			 * @return {Integer}           Index of the processed accessor on the "accessors" array
			 */
			function processAccessor( attribute, geometry, start, count ) {

				var types = {

					1: 'SCALAR',
					2: 'VEC2',
					3: 'VEC3',
					4: 'VEC4',
					16: 'MAT4'

				};

				var componentType;

				// Detect the component type of the attribute array (float, uint or ushort)
				if ( attribute.array.constructor === Float32Array ) {

					componentType = WEBGL_CONSTANTS.FLOAT;

				} else if ( attribute.array.constructor === Uint32Array ) {

					componentType = WEBGL_CONSTANTS.UNSIGNED_INT;

				} else if ( attribute.array.constructor === Uint16Array ) {

					componentType = WEBGL_CONSTANTS.UNSIGNED_SHORT;

				} else if ( attribute.array.constructor === Uint8Array ) {

					componentType = WEBGL_CONSTANTS.UNSIGNED_BYTE;

				} else {

					throw new Error( 'THREE.GLTFExporter: Unsupported bufferAttribute component type.' );

				}

				if ( start === undefined ) start = 0;
				if ( count === undefined ) count = attribute.count;

				// @TODO Indexed buffer geometry with drawRange not supported yet
				if ( options.truncateDrawRange && geometry !== undefined && geometry.index === null ) {

					var end = start + count;
					var end2 = geometry.drawRange.count === Infinity
						? attribute.count
						: geometry.drawRange.start + geometry.drawRange.count;

					start = Math.max( start, geometry.drawRange.start );
					count = Math.min( end, end2 ) - start;

					if ( count < 0 ) count = 0;

				}

				// Skip creating an accessor if the attribute doesn't have data to export
				if ( count === 0 ) {

					return null;

				}

				var minMax = getMinMax( attribute, start, count );

				var bufferViewTarget;

				// If geometry isn't provided, don't infer the target usage of the bufferView. For
				// animation samplers, target must not be set.
				if ( geometry !== undefined ) {

					bufferViewTarget = attribute === geometry.index ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER : WEBGL_CONSTANTS.ARRAY_BUFFER;

				}

				var bufferView = processBufferView( attribute, componentType, start, count, bufferViewTarget );

				var gltfAccessor = {

					bufferView: bufferView.id,
					byteOffset: bufferView.byteOffset,
					componentType: componentType,
					count: count,
					max: minMax.max,
					min: minMax.min,
					type: types[ attribute.itemSize ]

				};

				if ( ! outputJSON.accessors ) {

					outputJSON.accessors = [];

				}

				outputJSON.accessors.push( gltfAccessor );

				return outputJSON.accessors.length - 1;

			}

			/**
			 * Process image
			 * @param  {Image} image to process
			 * @param  {Integer} format of the image (e.g. THREE.RGBFormat, THREE.RGBAFormat etc)
			 * @param  {Boolean} flipY before writing out the image
			 * @return {Integer}     Index of the processed texture in the "images" array
			 */
			function processImage( image, format, flipY ) {

				if ( ! cachedData.images.has( image ) ) {

					cachedData.images.set( image, {} );

				}

				var cachedImages = cachedData.images.get( image );
				var mimeType = format === THREE.RGBAFormat ? 'image/png' : 'image/jpeg';
				var key = mimeType + ":flipY/" + flipY.toString();

				if ( cachedImages[ key ] !== undefined ) {

					return cachedImages[ key ];

				}

				if ( ! outputJSON.images ) {

					outputJSON.images = [];

				}

				var gltfImage = { mimeType: mimeType };

				if ( options.embedImages ) {

					var canvas = cachedCanvas = cachedCanvas || document.createElement( 'canvas' );

					canvas.width = Math.min( image.width, options.maxTextureSize );
					canvas.height = Math.min( image.height, options.maxTextureSize );

					if ( options.forcePowerOfTwoTextures && ! isPowerOfTwo( canvas ) ) {

						console.warn( 'GLTFExporter: Resized non-power-of-two image.', image );

						canvas.width = THREE.MathUtils.floorPowerOfTwo( canvas.width );
						canvas.height = THREE.MathUtils.floorPowerOfTwo( canvas.height );

					}

					var ctx = canvas.getContext( '2d' );

					if ( flipY === true ) {

						ctx.translate( 0, canvas.height );
						ctx.scale( 1, - 1 );

					}

					ctx.drawImage( image, 0, 0, canvas.width, canvas.height );

					if ( options.binary === true ) {

						pending.push( new Promise( function ( resolve ) {

							canvas.toBlob( function ( blob ) {

								processBufferViewImage( blob ).then( function ( bufferViewIndex ) {

									gltfImage.bufferView = bufferViewIndex;

									resolve();

								} );

							}, mimeType );

						} ) );

					} else {

						gltfImage.uri = canvas.toDataURL( mimeType );

					}

				} else {

					gltfImage.uri = image.src;

				}

				outputJSON.images.push( gltfImage );

				var index = outputJSON.images.length - 1;
				cachedImages[ key ] = index;

				return index;

			}

			/**
			 * Process sampler
			 * @param  {Texture} map Texture to process
			 * @return {Integer}     Index of the processed texture in the "samplers" array
			 */
			function processSampler( map ) {

				if ( ! outputJSON.samplers ) {

					outputJSON.samplers = [];

				}

				var gltfSampler = {

					magFilter: THREE_TO_WEBGL[ map.magFilter ],
					minFilter: THREE_TO_WEBGL[ map.minFilter ],
					wrapS: THREE_TO_WEBGL[ map.wrapS ],
					wrapT: THREE_TO_WEBGL[ map.wrapT ]

				};

				outputJSON.samplers.push( gltfSampler );

				return outputJSON.samplers.length - 1;

			}

			/**
			 * Process texture
			 * @param  {Texture} map Map to process
			 * @return {Integer}     Index of the processed texture in the "textures" array
			 */
			function processTexture( map ) {

				if ( cachedData.textures.has( map ) ) {

					return cachedData.textures.get( map );

				}

				if ( ! outputJSON.textures ) {

					outputJSON.textures = [];

				}

				var gltfTexture = {

					sampler: processSampler( map ),
					source: processImage( map.image, map.format, map.flipY )

				};

				if ( map.name ) {

					gltfTexture.name = map.name;

				}

				outputJSON.textures.push( gltfTexture );

				var index = outputJSON.textures.length - 1;
				cachedData.textures.set( map, index );

				return index;

			}

			/**
			 * Process material
			 * @param  {THREE.Material} material Material to process
			 * @return {Integer}      Index of the processed material in the "materials" array
			 */
			function processMaterial( material ) {

				if ( cachedData.materials.has( material ) ) {

					return cachedData.materials.get( material );

				}

				if ( material.isShaderMaterial ) {

					console.warn( 'GLTFExporter: THREE.ShaderMaterial not supported.' );
					return null;

				}

				if ( ! outputJSON.materials ) {

					outputJSON.materials = [];

				}

				// @QUESTION Should we avoid including any attribute that has the default value?
				var gltfMaterial = {

					pbrMetallicRoughness: {}

				};

				if ( material.isMeshBasicMaterial ) {

					gltfMaterial.extensions = { KHR_materials_unlit: {} };

					extensionsUsed[ 'KHR_materials_unlit' ] = true;

				} else if ( material.isGLTFSpecularGlossinessMaterial ) {

					gltfMaterial.extensions = { KHR_materials_pbrSpecularGlossiness: {} };

					extensionsUsed[ 'KHR_materials_pbrSpecularGlossiness' ] = true;

				} else if ( ! material.isMeshStandardMaterial ) {

					console.warn( 'GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.' );

				}

				// pbrMetallicRoughness.baseColorFactor
				var color = material.color.toArray().concat( [ material.opacity ] );

				if ( ! equalArray( color, [ 1, 1, 1, 1 ] ) ) {

					gltfMaterial.pbrMetallicRoughness.baseColorFactor = color;

				}

				if ( material.isMeshStandardMaterial ) {

					gltfMaterial.pbrMetallicRoughness.metallicFactor = material.metalness;
					gltfMaterial.pbrMetallicRoughness.roughnessFactor = material.roughness;

				} else if ( material.isMeshBasicMaterial ) {

					gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.0;
					gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.9;

				} else {

					gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.5;
					gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.5;

				}

				// pbrSpecularGlossiness diffuse, specular and glossiness factor
				if ( material.isGLTFSpecularGlossinessMaterial ) {

					if ( gltfMaterial.pbrMetallicRoughness.baseColorFactor ) {

						gltfMaterial.extensions.KHR_materials_pbrSpecularGlossiness.diffuseFactor = gltfMaterial.pbrMetallicRoughness.baseColorFactor;

					}

					var specularFactor = [ 1, 1, 1 ];
					material.specular.toArray( specularFactor, 0 );
					gltfMaterial.extensions.KHR_materials_pbrSpecularGlossiness.specularFactor = specularFactor;

					gltfMaterial.extensions.KHR_materials_pbrSpecularGlossiness.glossinessFactor = material.glossiness;

				}

				// pbrMetallicRoughness.metallicRoughnessTexture
				if ( material.metalnessMap || material.roughnessMap ) {

					if ( material.metalnessMap === material.roughnessMap ) {

						var metalRoughMapDef = { index: processTexture( material.metalnessMap ) };
						applyTextureTransform( metalRoughMapDef, material.metalnessMap );
						gltfMaterial.pbrMetallicRoughness.metallicRoughnessTexture = metalRoughMapDef;

					} else {

						console.warn( 'THREE.GLTFExporter: Ignoring metalnessMap and roughnessMap because they are not the same Texture.' );

					}

				}

				// pbrMetallicRoughness.baseColorTexture or pbrSpecularGlossiness diffuseTexture
				if ( material.map ) {

					var baseColorMapDef = { index: processTexture( material.map ) };
					applyTextureTransform( baseColorMapDef, material.map );

					if ( material.isGLTFSpecularGlossinessMaterial ) {

						gltfMaterial.extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture = baseColorMapDef;

					}

					gltfMaterial.pbrMetallicRoughness.baseColorTexture = baseColorMapDef;

				}

				// pbrSpecularGlossiness specular map
				if ( material.isGLTFSpecularGlossinessMaterial && material.specularMap ) {

					var specularMapDef = { index: processTexture( material.specularMap ) };
					applyTextureTransform( specularMapDef, material.specularMap );
					gltfMaterial.extensions.KHR_materials_pbrSpecularGlossiness.specularGlossinessTexture = specularMapDef;

				}

				if ( material.emissive ) {

					// emissiveFactor
					var emissive = material.emissive.clone().multiplyScalar( material.emissiveIntensity ).toArray();

					if ( ! equalArray( emissive, [ 0, 0, 0 ] ) ) {

						gltfMaterial.emissiveFactor = emissive;

					}

					// emissiveTexture
					if ( material.emissiveMap ) {

						var emissiveMapDef = { index: processTexture( material.emissiveMap ) };
						applyTextureTransform( emissiveMapDef, material.emissiveMap );
						gltfMaterial.emissiveTexture = emissiveMapDef;

					}

				}

				// normalTexture
				if ( material.normalMap ) {

					var normalMapDef = { index: processTexture( material.normalMap ) };

					if ( material.normalScale && material.normalScale.x !== - 1 ) {

						if ( material.normalScale.x !== material.normalScale.y ) {

							console.warn( 'THREE.GLTFExporter: Normal scale components are different, ignoring Y and exporting X.' );

						}

						normalMapDef.scale = material.normalScale.x;

					}

					applyTextureTransform( normalMapDef, material.normalMap );

					gltfMaterial.normalTexture = normalMapDef;

				}

				// occlusionTexture
				if ( material.aoMap ) {

					var occlusionMapDef = {
						index: processTexture( material.aoMap ),
						texCoord: 1
					};

					if ( material.aoMapIntensity !== 1.0 ) {

						occlusionMapDef.strength = material.aoMapIntensity;

					}

					applyTextureTransform( occlusionMapDef, material.aoMap );

					gltfMaterial.occlusionTexture = occlusionMapDef;

				}

				// alphaMode
				if ( material.transparent ) {

					gltfMaterial.alphaMode = 'BLEND';

				} else {

					if ( material.alphaTest > 0.0 ) {

						gltfMaterial.alphaMode = 'MASK';
						gltfMaterial.alphaCutoff = material.alphaTest;

					}

				}

				// doubleSided
				if ( material.side === THREE.DoubleSide ) {

					gltfMaterial.doubleSided = true;

				}

				if ( material.name !== '' ) {

					gltfMaterial.name = material.name;

				}

				serializeUserData( material, gltfMaterial );

				outputJSON.materials.push( gltfMaterial );

				var index = outputJSON.materials.length - 1;
				cachedData.materials.set( material, index );

				return index;

			}

			/**
			 * Process mesh
			 * @param  {THREE.Mesh} mesh Mesh to process
			 * @return {Integer}      Index of the processed mesh in the "meshes" array
			 */
			function processMesh( mesh ) {

				var meshCacheKeyParts = [ mesh.geometry.uuid ];
				if ( Array.isArray( mesh.material ) ) {

					for ( var i = 0, l = mesh.material.length; i < l; i ++ ) {

						meshCacheKeyParts.push( mesh.material[ i ].uuid	);

					}

				} else {

					meshCacheKeyParts.push( mesh.material.uuid );

				}

				var meshCacheKey = meshCacheKeyParts.join( ':' );
				if ( cachedData.meshes.has( meshCacheKey ) ) {

					return cachedData.meshes.get( meshCacheKey );

				}

				var geometry = mesh.geometry;

				var mode;

				// Use the correct mode
				if ( mesh.isLineSegments ) {

					mode = WEBGL_CONSTANTS.LINES;

				} else if ( mesh.isLineLoop ) {

					mode = WEBGL_CONSTANTS.LINE_LOOP;

				} else if ( mesh.isLine ) {

					mode = WEBGL_CONSTANTS.LINE_STRIP;

				} else if ( mesh.isPoints ) {

					mode = WEBGL_CONSTANTS.POINTS;

				} else {

					mode = mesh.material.wireframe ? WEBGL_CONSTANTS.LINES : WEBGL_CONSTANTS.TRIANGLES;

				}

				if ( ! geometry.isBufferGeometry ) {

					console.warn( 'GLTFExporter: Exporting THREE.Geometry will increase file size. Use THREE.BufferGeometry instead.' );
					geometry = new THREE.BufferGeometry().setFromObject( mesh );

				}

				var gltfMesh = {};

				var attributes = {};
				var primitives = [];
				var targets = [];

				// Conversion between attributes names in threejs and gltf spec
				var nameConversion = {

					uv: 'TEXCOORD_0',
					uv2: 'TEXCOORD_1',
					color: 'COLOR_0',
					skinWeight: 'WEIGHTS_0',
					skinIndex: 'JOINTS_0'

				};

				var originalNormal = geometry.getAttribute( 'normal' );

				if ( originalNormal !== undefined && ! isNormalizedNormalAttribute( originalNormal ) ) {

					console.warn( 'THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.' );

					geometry.setAttribute( 'normal', createNormalizedNormalAttribute( originalNormal ) );

				}

				// @QUESTION Detect if .vertexColors = true?
				// For every attribute create an accessor
				var modifiedAttribute = null;
				for ( var attributeName in geometry.attributes ) {

					// Ignore morph target attributes, which are exported later.
					if ( attributeName.substr( 0, 5 ) === 'morph' ) continue;

					var attribute = geometry.attributes[ attributeName ];
					attributeName = nameConversion[ attributeName ] || attributeName.toUpperCase();

					// Prefix all geometry attributes except the ones specifically
					// listed in the spec; non-spec attributes are considered custom.
					var validVertexAttributes =
							/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/;
					if ( ! validVertexAttributes.test( attributeName ) ) {

						attributeName = '_' + attributeName;

					}

					if ( cachedData.attributes.has( getUID( attribute ) ) ) {

						attributes[ attributeName ] = cachedData.attributes.get( getUID( attribute ) );
						continue;

					}

					// JOINTS_0 must be UNSIGNED_BYTE or UNSIGNED_SHORT.
					modifiedAttribute = null;
					var array = attribute.array;
					if ( attributeName === 'JOINTS_0' &&
						! ( array instanceof Uint16Array ) &&
						! ( array instanceof Uint8Array ) ) {

						console.warn( 'GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.' );
						modifiedAttribute = new THREE.BufferAttribute( new Uint16Array( array ), attribute.itemSize, attribute.normalized );

					}

					var accessor = processAccessor( modifiedAttribute || attribute, geometry );
					if ( accessor !== null ) {

						attributes[ attributeName ] = accessor;
						cachedData.attributes.set( getUID( attribute ), accessor );

					}

				}

				if ( originalNormal !== undefined ) geometry.setAttribute( 'normal', originalNormal );

				// Skip if no exportable attributes found
				if ( Object.keys( attributes ).length === 0 ) {

					return null;

				}

				// Morph targets
				if ( mesh.morphTargetInfluences !== undefined && mesh.morphTargetInfluences.length > 0 ) {

					var weights = [];
					var targetNames = [];
					var reverseDictionary = {};

					if ( mesh.morphTargetDictionary !== undefined ) {

						for ( var key in mesh.morphTargetDictionary ) {

							reverseDictionary[ mesh.morphTargetDictionary[ key ] ] = key;

						}

					}

					for ( var i = 0; i < mesh.morphTargetInfluences.length; ++ i ) {

						var target = {};

						var warned = false;

						for ( var attributeName in geometry.morphAttributes ) {

							// glTF 2.0 morph supports only POSITION/NORMAL/TANGENT.
							// Three.js doesn't support TANGENT yet.

							if ( attributeName !== 'position' && attributeName !== 'normal' ) {

								if ( ! warned ) {

									console.warn( 'GLTFExporter: Only POSITION and NORMAL morph are supported.' );
									warned = true;

								}

								continue;

							}

							var attribute = geometry.morphAttributes[ attributeName ][ i ];
							var gltfAttributeName = attributeName.toUpperCase();

							// Three.js morph attribute has absolute values while the one of glTF has relative values.
							//
							// glTF 2.0 Specification:
							// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

							var baseAttribute = geometry.attributes[ attributeName ];

							if ( cachedData.attributes.has( getUID( attribute ) ) ) {

								target[ gltfAttributeName ] = cachedData.attributes.get( getUID( attribute ) );
								continue;

							}

							// Clones attribute not to override
							var relativeAttribute = attribute.clone();

							if ( ! geometry.morphTargetsRelative ) {

								for ( var j = 0, jl = attribute.count; j < jl; j ++ ) {

									relativeAttribute.setXYZ(
										j,
										attribute.getX( j ) - baseAttribute.getX( j ),
										attribute.getY( j ) - baseAttribute.getY( j ),
										attribute.getZ( j ) - baseAttribute.getZ( j )
									);

								}

							}

							target[ gltfAttributeName ] = processAccessor( relativeAttribute, geometry );
							cachedData.attributes.set( getUID( baseAttribute ), target[ gltfAttributeName ] );

						}

						targets.push( target );

						weights.push( mesh.morphTargetInfluences[ i ] );
						if ( mesh.morphTargetDictionary !== undefined ) targetNames.push( reverseDictionary[ i ] );

					}

					gltfMesh.weights = weights;

					if ( targetNames.length > 0 ) {

						gltfMesh.extras = {};
						gltfMesh.extras.targetNames = targetNames;

					}

				}

				var forceIndices = options.forceIndices;
				var isMultiMaterial = Array.isArray( mesh.material );

				if ( isMultiMaterial && geometry.groups.length === 0 ) return null;

				if ( ! forceIndices && geometry.index === null && isMultiMaterial ) {

					// temporal workaround.
					console.warn( 'THREE.GLTFExporter: Creating index for non-indexed multi-material mesh.' );
					forceIndices = true;

				}

				var didForceIndices = false;

				if ( geometry.index === null && forceIndices ) {

					var indices = [];

					for ( var i = 0, il = geometry.attributes.position.count; i < il; i ++ ) {

						indices[ i ] = i;

					}

					geometry.setIndex( indices );

					didForceIndices = true;

				}

				var materials = isMultiMaterial ? mesh.material : [ mesh.material ];
				var groups = isMultiMaterial ? geometry.groups : [ { materialIndex: 0, start: undefined, count: undefined } ];

				for ( var i = 0, il = groups.length; i < il; i ++ ) {

					var primitive = {
						mode: mode,
						attributes: attributes,
					};

					serializeUserData( geometry, primitive );

					if ( targets.length > 0 ) primitive.targets = targets;

					if ( geometry.index !== null ) {

						var cacheKey = getUID( geometry.index );

						if ( groups[ i ].start !== undefined || groups[ i ].count !== undefined ) {

							cacheKey += ':' + groups[ i ].start + ':' + groups[ i ].count;

						}

						if ( cachedData.attributes.has( cacheKey ) ) {

							primitive.indices = cachedData.attributes.get( cacheKey );

						} else {

							primitive.indices = processAccessor( geometry.index, geometry, groups[ i ].start, groups[ i ].count );
							cachedData.attributes.set( cacheKey, primitive.indices );

						}

						if ( primitive.indices === null ) delete primitive.indices;

					}

					var material = processMaterial( materials[ groups[ i ].materialIndex ] );

					if ( material !== null ) {

						primitive.material = material;

					}

					primitives.push( primitive );

				}

				if ( didForceIndices ) {

					geometry.setIndex( null );

				}

				gltfMesh.primitives = primitives;

				if ( ! outputJSON.meshes ) {

					outputJSON.meshes = [];

				}

				outputJSON.meshes.push( gltfMesh );

				var index = outputJSON.meshes.length - 1;
				cachedData.meshes.set( meshCacheKey, index );

				return index;

			}

			/**
			 * Process camera
			 * @param  {THREE.Camera} camera Camera to process
			 * @return {Integer}      Index of the processed mesh in the "camera" array
			 */
			function processCamera( camera ) {

				if ( ! outputJSON.cameras ) {

					outputJSON.cameras = [];

				}

				var isOrtho = camera.isOrthographicCamera;

				var gltfCamera = {

					type: isOrtho ? 'orthographic' : 'perspective'

				};

				if ( isOrtho ) {

					gltfCamera.orthographic = {

						xmag: camera.right * 2,
						ymag: camera.top * 2,
						zfar: camera.far <= 0 ? 0.001 : camera.far,
						znear: camera.near < 0 ? 0 : camera.near

					};

				} else {

					gltfCamera.perspective = {

						aspectRatio: camera.aspect,
						yfov: THREE.MathUtils.degToRad( camera.fov ),
						zfar: camera.far <= 0 ? 0.001 : camera.far,
						znear: camera.near < 0 ? 0 : camera.near

					};

				}

				if ( camera.name !== '' ) {

					gltfCamera.name = camera.type;

				}

				outputJSON.cameras.push( gltfCamera );

				return outputJSON.cameras.length - 1;

			}

			/**
			 * Creates glTF animation entry from AnimationClip object.
			 *
			 * Status:
			 * - Only properties listed in PATH_PROPERTIES may be animated.
			 *
			 * @param {THREE.AnimationClip} clip
			 * @param {THREE.Object3D} root
			 * @return {number}
			 */
			function processAnimation( clip, root ) {

				if ( ! outputJSON.animations ) {

					outputJSON.animations = [];

				}

				clip = THREE.GLTFExporter.Utils.mergeMorphTargetTracks( clip.clone(), root );

				var tracks = clip.tracks;
				var channels = [];
				var samplers = [];

				for ( var i = 0; i < tracks.length; ++ i ) {

					var track = tracks[ i ];
					var trackBinding = THREE.PropertyBinding.parseTrackName( track.name );
					var trackNode = THREE.PropertyBinding.findNode( root, trackBinding.nodeName );
					var trackProperty = PATH_PROPERTIES[ trackBinding.propertyName ];

					if ( trackBinding.objectName === 'bones' ) {

						if ( trackNode.isSkinnedMesh === true ) {

							trackNode = trackNode.skeleton.getBoneByName( trackBinding.objectIndex );

						} else {

							trackNode = undefined;

						}

					}

					if ( ! trackNode || ! trackProperty ) {

						console.warn( 'THREE.GLTFExporter: Could not export animation track "%s".', track.name );
						return null;

					}

					var inputItemSize = 1;
					var outputItemSize = track.values.length / track.times.length;

					if ( trackProperty === PATH_PROPERTIES.morphTargetInfluences ) {

						outputItemSize /= trackNode.morphTargetInfluences.length;

					}

					var interpolation;

					// @TODO export CubicInterpolant(InterpolateSmooth) as CUBICSPLINE

					// Detecting glTF cubic spline interpolant by checking factory method's special property
					// GLTFCubicSplineInterpolant is a custom interpolant and track doesn't return
					// valid value from .getInterpolation().
					if ( track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline === true ) {

						interpolation = 'CUBICSPLINE';

						// itemSize of CUBICSPLINE keyframe is 9
						// (VEC3 * 3: inTangent, splineVertex, and outTangent)
						// but needs to be stored as VEC3 so dividing by 3 here.
						outputItemSize /= 3;

					} else if ( track.getInterpolation() === THREE.InterpolateDiscrete ) {

						interpolation = 'STEP';

					} else {

						interpolation = 'LINEAR';

					}

					samplers.push( {

						input: processAccessor( new THREE.BufferAttribute( track.times, inputItemSize ) ),
						output: processAccessor( new THREE.BufferAttribute( track.values, outputItemSize ) ),
						interpolation: interpolation

					} );

					channels.push( {

						sampler: samplers.length - 1,
						target: {
							node: nodeMap.get( trackNode ),
							path: trackProperty
						}

					} );

				}

				outputJSON.animations.push( {

					name: clip.name || 'clip_' + outputJSON.animations.length,
					samplers: samplers,
					channels: channels

				} );

				return outputJSON.animations.length - 1;

			}

			function processSkin( object ) {

				var node = outputJSON.nodes[ nodeMap.get( object ) ];

				var skeleton = object.skeleton;

				if ( skeleton === undefined ) return null;

				var rootJoint = object.skeleton.bones[ 0 ];

				if ( rootJoint === undefined ) return null;

				var joints = [];
				var inverseBindMatrices = new Float32Array( skeleton.bones.length * 16 );

				for ( var i = 0; i < skeleton.bones.length; ++ i ) {

					joints.push( nodeMap.get( skeleton.bones[ i ] ) );

					skeleton.boneInverses[ i ].toArray( inverseBindMatrices, i * 16 );

				}

				if ( outputJSON.skins === undefined ) {

					outputJSON.skins = [];

				}

				outputJSON.skins.push( {

					inverseBindMatrices: processAccessor( new THREE.BufferAttribute( inverseBindMatrices, 16 ) ),
					joints: joints,
					skeleton: nodeMap.get( rootJoint )

				} );

				var skinIndex = node.skin = outputJSON.skins.length - 1;

				return skinIndex;

			}

			function processLight( light ) {

				var lightDef = {};

				if ( light.name ) lightDef.name = light.name;

				lightDef.color = light.color.toArray();

				lightDef.intensity = light.intensity;

				if ( light.isDirectionalLight ) {

					lightDef.type = 'directional';

				} else if ( light.isPointLight ) {

					lightDef.type = 'point';
					if ( light.distance > 0 ) lightDef.range = light.distance;

				} else if ( light.isSpotLight ) {

					lightDef.type = 'spot';
					if ( light.distance > 0 ) lightDef.range = light.distance;
					lightDef.spot = {};
					lightDef.spot.innerConeAngle = ( light.penumbra - 1.0 ) * light.angle * - 1.0;
					lightDef.spot.outerConeAngle = light.angle;

				}

				if ( light.decay !== undefined && light.decay !== 2 ) {

					console.warn( 'THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, '
						+ 'and expects light.decay=2.' );

				}

				if ( light.target
						&& ( light.target.parent !== light
						 || light.target.position.x !== 0
						 || light.target.position.y !== 0
						 || light.target.position.z !== - 1 ) ) {

					console.warn( 'THREE.GLTFExporter: Light direction may be lost. For best results, '
						+ 'make light.target a child of the light with position 0,0,-1.' );

				}

				var lights = outputJSON.extensions[ 'KHR_lights_punctual' ].lights;
				lights.push( lightDef );
				return lights.length - 1;

			}

			/**
			 * Process Object3D node
			 * @param  {THREE.Object3D} node Object3D to processNode
			 * @return {Integer}      Index of the node in the nodes list
			 */
			function processNode( object ) {

				if ( ! outputJSON.nodes ) {

					outputJSON.nodes = [];

				}

				var gltfNode = {};

				if ( options.trs ) {

					var rotation = object.quaternion.toArray();
					var position = object.position.toArray();
					var scale = object.scale.toArray();

					if ( ! equalArray( rotation, [ 0, 0, 0, 1 ] ) ) {

						gltfNode.rotation = rotation;

					}

					if ( ! equalArray( position, [ 0, 0, 0 ] ) ) {

						gltfNode.translation = position;

					}

					if ( ! equalArray( scale, [ 1, 1, 1 ] ) ) {

						gltfNode.scale = scale;

					}

				} else {

					if ( object.matrixAutoUpdate ) {

						object.updateMatrix();

					}

					if ( ! equalArray( object.matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ) ) {

						gltfNode.matrix = object.matrix.elements;

					}

				}

				// We don't export empty strings name because it represents no-name in Three.js.
				if ( object.name !== '' ) {

					gltfNode.name = String( object.name );

				}

				serializeUserData( object, gltfNode );

				if ( object.isMesh || object.isLine || object.isPoints ) {

					var mesh = processMesh( object );

					if ( mesh !== null ) {

						gltfNode.mesh = mesh;

					}

				} else if ( object.isCamera ) {

					gltfNode.camera = processCamera( object );

				} else if ( object.isDirectionalLight || object.isPointLight || object.isSpotLight ) {

					if ( ! extensionsUsed[ 'KHR_lights_punctual' ] ) {

						outputJSON.extensions = outputJSON.extensions || {};
						outputJSON.extensions[ 'KHR_lights_punctual' ] = { lights: [] };
						extensionsUsed[ 'KHR_lights_punctual' ] = true;

					}

					gltfNode.extensions = gltfNode.extensions || {};
					gltfNode.extensions[ 'KHR_lights_punctual' ] = { light: processLight( object ) };

				} else if ( object.isLight ) {

					console.warn( 'THREE.GLTFExporter: Only directional, point, and spot lights are supported.', object );
					return null;

				}

				if ( object.isSkinnedMesh ) {

					skins.push( object );

				}

				if ( object.children.length > 0 ) {

					var children = [];

					for ( var i = 0, l = object.children.length; i < l; i ++ ) {

						var child = object.children[ i ];

						if ( child.visible || options.onlyVisible === false ) {

							var node = processNode( child );

							if ( node !== null ) {

								children.push( node );

							}

						}

					}

					if ( children.length > 0 ) {

						gltfNode.children = children;

					}


				}

				outputJSON.nodes.push( gltfNode );

				var nodeIndex = outputJSON.nodes.length - 1;
				nodeMap.set( object, nodeIndex );

				return nodeIndex;

			}

			/**
			 * Process Scene
			 * @param  {THREE.Scene} node Scene to process
			 */
			function processScene( scene ) {

				if ( ! outputJSON.scenes ) {

					outputJSON.scenes = [];
					outputJSON.scene = 0;

				}

				var gltfScene = {};

				if ( scene.name !== '' ) {

					gltfScene.name = scene.name;

				}

				outputJSON.scenes.push( gltfScene );

				var nodes = [];

				for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

					var child = scene.children[ i ];

					if ( child.visible || options.onlyVisible === false ) {

						var node = processNode( child );

						if ( node !== null ) {

							nodes.push( node );

						}

					}

				}

				if ( nodes.length > 0 ) {

					gltfScene.nodes = nodes;

				}

				serializeUserData( scene, gltfScene );

			}

			/**
			 * Creates a THREE.Scene to hold a list of objects and parse it
			 * @param  {Array} objects List of objects to process
			 */
			function processObjects( objects ) {

				var scene = new THREE.Scene();
				scene.name = 'AuxScene';

				for ( var i = 0; i < objects.length; i ++ ) {

					// We push directly to children instead of calling `add` to prevent
					// modify the .parent and break its original scene and hierarchy
					scene.children.push( objects[ i ] );

				}

				processScene( scene );

			}

			function processInput( input ) {

				input = input instanceof Array ? input : [ input ];

				var objectsWithoutScene = [];

				for ( var i = 0; i < input.length; i ++ ) {

					if ( input[ i ] instanceof THREE.Scene ) {

						processScene( input[ i ] );

					} else {

						objectsWithoutScene.push( input[ i ] );

					}

				}

				if ( objectsWithoutScene.length > 0 ) {

					processObjects( objectsWithoutScene );

				}

				for ( var i = 0; i < skins.length; ++ i ) {

					processSkin( skins[ i ] );

				}

				for ( var i = 0; i < options.animations.length; ++ i ) {

					processAnimation( options.animations[ i ], input[ 0 ] );

				}

			}

			processInput( input );

			Promise.all( pending ).then( function () {

				// Merge buffers.
				var blob = new Blob( buffers, { type: 'application/octet-stream' } );

				// Declare extensions.
				var extensionsUsedList = Object.keys( extensionsUsed );
				if ( extensionsUsedList.length > 0 ) outputJSON.extensionsUsed = extensionsUsedList;

				// Update bytelength of the single buffer.
				if ( outputJSON.buffers && outputJSON.buffers.length > 0 ) outputJSON.buffers[ 0 ].byteLength = blob.size;

				if ( options.binary === true ) {

					// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

					var GLB_HEADER_BYTES = 12;
					var GLB_HEADER_MAGIC = 0x46546C67;
					var GLB_VERSION = 2;

					var GLB_CHUNK_PREFIX_BYTES = 8;
					var GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
					var GLB_CHUNK_TYPE_BIN = 0x004E4942;

					var reader = new window.FileReader();
					reader.readAsArrayBuffer( blob );
					reader.onloadend = function () {

						// Binary chunk.
						var binaryChunk = getPaddedArrayBuffer( reader.result );
						var binaryChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
						binaryChunkPrefix.setUint32( 0, binaryChunk.byteLength, true );
						binaryChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_BIN, true );

						// JSON chunk.
						var jsonChunk = getPaddedArrayBuffer( stringToArrayBuffer( JSON.stringify( outputJSON ) ), 0x20 );
						var jsonChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
						jsonChunkPrefix.setUint32( 0, jsonChunk.byteLength, true );
						jsonChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_JSON, true );

						// GLB header.
						var header = new ArrayBuffer( GLB_HEADER_BYTES );
						var headerView = new DataView( header );
						headerView.setUint32( 0, GLB_HEADER_MAGIC, true );
						headerView.setUint32( 4, GLB_VERSION, true );
						var totalByteLength = GLB_HEADER_BYTES
							+ jsonChunkPrefix.byteLength + jsonChunk.byteLength
							+ binaryChunkPrefix.byteLength + binaryChunk.byteLength;
						headerView.setUint32( 8, totalByteLength, true );

						var glbBlob = new Blob( [
							header,
							jsonChunkPrefix,
							jsonChunk,
							binaryChunkPrefix,
							binaryChunk
						], { type: 'application/octet-stream' } );

						var glbReader = new window.FileReader();
						glbReader.readAsArrayBuffer( glbBlob );
						glbReader.onloadend = function () {

							onDone( glbReader.result );

						};

					};

				} else {

					if ( outputJSON.buffers && outputJSON.buffers.length > 0 ) {

						var reader = new window.FileReader();
						reader.readAsDataURL( blob );
						reader.onloadend = function () {

							var base64data = reader.result;
							outputJSON.buffers[ 0 ].uri = base64data;
							onDone( outputJSON );

						};

					} else {

						onDone( outputJSON );

					}

				}

			} );

		}

	};

	THREE.GLTFExporter.Utils = {

		insertKeyframe: function ( track, time ) {

			var tolerance = 0.001; // 1ms
			var valueSize = track.getValueSize();

			var times = new track.TimeBufferType( track.times.length + 1 );
			var values = new track.ValueBufferType( track.values.length + valueSize );
			var interpolant = track.createInterpolant( new track.ValueBufferType( valueSize ) );

			var index;

			if ( track.times.length === 0 ) {

				times[ 0 ] = time;

				for ( var i = 0; i < valueSize; i ++ ) {

					values[ i ] = 0;

				}

				index = 0;

			} else if ( time < track.times[ 0 ] ) {

				if ( Math.abs( track.times[ 0 ] - time ) < tolerance ) return 0;

				times[ 0 ] = time;
				times.set( track.times, 1 );

				values.set( interpolant.evaluate( time ), 0 );
				values.set( track.values, valueSize );

				index = 0;

			} else if ( time > track.times[ track.times.length - 1 ] ) {

				if ( Math.abs( track.times[ track.times.length - 1 ] - time ) < tolerance ) {

					return track.times.length - 1;

				}

				times[ times.length - 1 ] = time;
				times.set( track.times, 0 );

				values.set( track.values, 0 );
				values.set( interpolant.evaluate( time ), track.values.length );

				index = times.length - 1;

			} else {

				for ( var i = 0; i < track.times.length; i ++ ) {

					if ( Math.abs( track.times[ i ] - time ) < tolerance ) return i;

					if ( track.times[ i ] < time && track.times[ i + 1 ] > time ) {

						times.set( track.times.slice( 0, i + 1 ), 0 );
						times[ i + 1 ] = time;
						times.set( track.times.slice( i + 1 ), i + 2 );

						values.set( track.values.slice( 0, ( i + 1 ) * valueSize ), 0 );
						values.set( interpolant.evaluate( time ), ( i + 1 ) * valueSize );
						values.set( track.values.slice( ( i + 1 ) * valueSize ), ( i + 2 ) * valueSize );

						index = i + 1;

						break;

					}

				}

			}

			track.times = times;
			track.values = values;

			return index;

		},

		mergeMorphTargetTracks: function ( clip, root ) {

			var tracks = [];
			var mergedTracks = {};
			var sourceTracks = clip.tracks;

			for ( var i = 0; i < sourceTracks.length; ++ i ) {

				var sourceTrack = sourceTracks[ i ];
				var sourceTrackBinding = THREE.PropertyBinding.parseTrackName( sourceTrack.name );
				var sourceTrackNode = THREE.PropertyBinding.findNode( root, sourceTrackBinding.nodeName );

				if ( sourceTrackBinding.propertyName !== 'morphTargetInfluences' || sourceTrackBinding.propertyIndex === undefined ) {

					// Tracks that don't affect morph targets, or that affect all morph targets together, can be left as-is.
					tracks.push( sourceTrack );
					continue;

				}

				if ( sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodDiscrete
					&& sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodLinear ) {

					if ( sourceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

						// This should never happen, because glTF morph target animations
						// affect all targets already.
						throw new Error( 'THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.' );

					}

					console.warn( 'THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead.' );

					sourceTrack = sourceTrack.clone();
					sourceTrack.setInterpolation( THREE.InterpolateLinear );

				}

				var targetCount = sourceTrackNode.morphTargetInfluences.length;
				var targetIndex = sourceTrackNode.morphTargetDictionary[ sourceTrackBinding.propertyIndex ];

				if ( targetIndex === undefined ) {

					throw new Error( 'THREE.GLTFExporter: Morph target name not found: ' + sourceTrackBinding.propertyIndex );

				}

				var mergedTrack;

				// If this is the first time we've seen this object, create a new
				// track to store merged keyframe data for each morph target.
				if ( mergedTracks[ sourceTrackNode.uuid ] === undefined ) {

					mergedTrack = sourceTrack.clone();

					var values = new mergedTrack.ValueBufferType( targetCount * mergedTrack.times.length );

					for ( var j = 0; j < mergedTrack.times.length; j ++ ) {

						values[ j * targetCount + targetIndex ] = mergedTrack.values[ j ];

					}

					mergedTrack.name = '.morphTargetInfluences';
					mergedTrack.values = values;

					mergedTracks[ sourceTrackNode.uuid ] = mergedTrack;
					tracks.push( mergedTrack );

					continue;

				}

				var sourceInterpolant = sourceTrack.createInterpolant( new sourceTrack.ValueBufferType( 1 ) );

				mergedTrack = mergedTracks[ sourceTrackNode.uuid ];

				// For every existing keyframe of the merged track, write a (possibly
				// interpolated) value from the source track.
				for ( var j = 0; j < mergedTrack.times.length; j ++ ) {

					mergedTrack.values[ j * targetCount + targetIndex ] = sourceInterpolant.evaluate( mergedTrack.times[ j ] );

				}

				// For every existing keyframe of the source track, write a (possibly
				// new) keyframe to the merged track. Values from the previous loop may
				// be written again, but keyframes are de-duplicated.
				for ( var j = 0; j < sourceTrack.times.length; j ++ ) {

					var keyframeIndex = this.insertKeyframe( mergedTrack, sourceTrack.times[ j ] );
					mergedTrack.values[ keyframeIndex * targetCount + targetIndex ] = sourceTrack.values[ j ];

				}

			}

			clip.tracks = tracks;

			return clip;

		}

	};
	
	return THREE.GLTFExporter;
});

define('skylark-threejs-ex/exporters/ColladaExporter',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Garrett Johnson / http://gkjohnson.github.io/
	 * https://github.com/gkjohnson/collada-exporter-js
	 *
	 * Usage:
	 *  var exporter = new THREE.ColladaExporter();
	 *
	 *  var data = exporter.parse(mesh);
	 *
	 * Format Definition:
	 *  https://www.khronos.org/collada/
	 */

	THREE.ColladaExporter = function () {};

	THREE.ColladaExporter.prototype = {

		constructor: THREE.ColladaExporter,

		parse: function ( object, onDone, options ) {

			options = options || {};

			options = Object.assign( {
				version: '1.4.1',
				author: null,
				textureDirectory: '',
			}, options );

			if ( options.textureDirectory !== '' ) {

				options.textureDirectory = `${ options.textureDirectory }/`
					.replace( /\\/g, '/' )
					.replace( /\/+/g, '/' );

			}

			var version = options.version;
			if ( version !== '1.4.1' && version !== '1.5.0' ) {

				console.warn( `ColladaExporter : Version ${ version } not supported for export. Only 1.4.1 and 1.5.0.` );
				return null;

			}

			// Convert the urdf xml into a well-formatted, indented format
			function format( urdf ) {

				var IS_END_TAG = /^<\//;
				var IS_SELF_CLOSING = /(\?>$)|(\/>$)/;
				var HAS_TEXT = /<[^>]+>[^<]*<\/[^<]+>/;

				var pad = ( ch, num ) => ( num > 0 ? ch + pad( ch, num - 1 ) : '' );

				var tagnum = 0;
				return urdf
					.match( /(<[^>]+>[^<]+<\/[^<]+>)|(<[^>]+>)/g )
					.map( tag => {

						if ( ! HAS_TEXT.test( tag ) && ! IS_SELF_CLOSING.test( tag ) && IS_END_TAG.test( tag ) ) {

							tagnum --;

						}

						var res = `${ pad( '  ', tagnum ) }${ tag }`;

						if ( ! HAS_TEXT.test( tag ) && ! IS_SELF_CLOSING.test( tag ) && ! IS_END_TAG.test( tag ) ) {

							tagnum ++;

						}

						return res;

					} )
					.join( '\n' );

			}

			// Convert an image into a png format for saving
			function base64ToBuffer( str ) {

				var b = atob( str );
				var buf = new Uint8Array( b.length );

				for ( var i = 0, l = buf.length; i < l; i ++ ) {

					buf[ i ] = b.charCodeAt( i );

				}

				return buf;

			}

			var canvas, ctx;
			function imageToData( image, ext ) {

				canvas = canvas || document.createElement( 'canvas' );
				ctx = ctx || canvas.getContext( '2d' );

				canvas.width = image.naturalWidth;
				canvas.height = image.naturalHeight;

				ctx.drawImage( image, 0, 0 );

				// Get the base64 encoded data
				var base64data = canvas
					.toDataURL( `image/${ ext }`, 1 )
					.replace( /^data:image\/(png|jpg);base64,/, '' );

				// Convert to a uint8 array
				return base64ToBuffer( base64data );

			}

			// gets the attribute array. Generate a new array if the attribute is interleaved
			var getFuncs = [ 'getX', 'getY', 'getZ', 'getW' ];
			function attrBufferToArray( attr ) {

				if ( attr.isInterleavedBufferAttribute ) {

					// use the typed array constructor to save on memory
					var arr = new attr.array.constructor( attr.count * attr.itemSize );
					var size = attr.itemSize;
					for ( var i = 0, l = attr.count; i < l; i ++ ) {

						for ( var j = 0; j < size; j ++ ) {

							arr[ i * size + j ] = attr[ getFuncs[ j ] ]( i );

						}

					}

					return arr;

				} else {

					return attr.array;

				}

			}

			// Returns an array of the same type starting at the `st` index,
			// and `ct` length
			function subArray( arr, st, ct ) {

				if ( Array.isArray( arr ) ) return arr.slice( st, st + ct );
				else return new arr.constructor( arr.buffer, st * arr.BYTES_PER_ELEMENT, ct );

			}

			// Returns the string for a geometry's attribute
			function getAttribute( attr, name, params, type ) {

				var array = attrBufferToArray( attr );
				var res =
						`<source id="${ name }">` +

						`<float_array id="${ name }-array" count="${ array.length }">` +
						array.join( ' ' ) +
						'</float_array>' +

						'<technique_common>' +
						`<accessor source="#${ name }-array" count="${ Math.floor( array.length / attr.itemSize ) }" stride="${ attr.itemSize }">` +

						params.map( n => `<param name="${ n }" type="${ type }" />` ).join( '' ) +

						'</accessor>' +
						'</technique_common>' +
						'</source>';

				return res;

			}

			// Returns the string for a node's transform information
			var transMat;
			function getTransform( o ) {

				// ensure the object's matrix is up to date
				// before saving the transform
				o.updateMatrix();

				transMat = transMat || new THREE.Matrix4();
				transMat.copy( o.matrix );
				transMat.transpose();
				return `<matrix>${ transMat.toArray().join( ' ' ) }</matrix>`;

			}

			// Process the given piece of geometry into the geometry library
			// Returns the mesh id
			function processGeometry( g ) {

				var info = geometryInfo.get( g );

				if ( ! info ) {

					// convert the geometry to bufferGeometry if it isn't already
					var bufferGeometry = g;
					if ( bufferGeometry instanceof THREE.Geometry ) {

						bufferGeometry = ( new THREE.BufferGeometry() ).fromGeometry( bufferGeometry );

					}

					var meshid = `Mesh${ libraryGeometries.length + 1 }`;

					var indexCount =
						bufferGeometry.index ?
							bufferGeometry.index.count * bufferGeometry.index.itemSize :
							bufferGeometry.attributes.position.count;

					var groups =
						bufferGeometry.groups != null && bufferGeometry.groups.length !== 0 ?
							bufferGeometry.groups :
							[ { start: 0, count: indexCount, materialIndex: 0 } ];


					var gname = g.name ? ` name="${ g.name }"` : '';
					var gnode = `<geometry id="${ meshid }"${ gname }><mesh>`;

					// define the geometry node and the vertices for the geometry
					var posName = `${ meshid }-position`;
					var vertName = `${ meshid }-vertices`;
					gnode += getAttribute( bufferGeometry.attributes.position, posName, [ 'X', 'Y', 'Z' ], 'float' );
					gnode += `<vertices id="${ vertName }"><input semantic="POSITION" source="#${ posName }" /></vertices>`;

					// NOTE: We're not optimizing the attribute arrays here, so they're all the same length and
					// can therefore share the same triangle indices. However, MeshLab seems to have trouble opening
					// models with attributes that share an offset.
					// MeshLab Bug#424: https://sourceforge.net/p/meshlab/bugs/424/

					// serialize normals
					var triangleInputs = `<input semantic="VERTEX" source="#${ vertName }" offset="0" />`;
					if ( 'normal' in bufferGeometry.attributes ) {

						var normName = `${ meshid }-normal`;
						gnode += getAttribute( bufferGeometry.attributes.normal, normName, [ 'X', 'Y', 'Z' ], 'float' );
						triangleInputs += `<input semantic="NORMAL" source="#${ normName }" offset="0" />`;

					}

					// serialize uvs
					if ( 'uv' in bufferGeometry.attributes ) {

						var uvName = `${ meshid }-texcoord`;
						gnode += getAttribute( bufferGeometry.attributes.uv, uvName, [ 'S', 'T' ], 'float' );
						triangleInputs += `<input semantic="TEXCOORD" source="#${ uvName }" offset="0" set="0" />`;

					}

					// serialize colors
					if ( 'color' in bufferGeometry.attributes ) {

						var colName = `${ meshid }-color`;
						gnode += getAttribute( bufferGeometry.attributes.color, colName, [ 'X', 'Y', 'Z' ], 'uint8' );
						triangleInputs += `<input semantic="COLOR" source="#${ colName }" offset="0" />`;

					}

					var indexArray = null;
					if ( bufferGeometry.index ) {

						indexArray = attrBufferToArray( bufferGeometry.index );

					} else {

						indexArray = new Array( indexCount );
						for ( var i = 0, l = indexArray.length; i < l; i ++ ) indexArray[ i ] = i;

					}

					for ( var i = 0, l = groups.length; i < l; i ++ ) {

						var group = groups[ i ];
						var subarr = subArray( indexArray, group.start, group.count );
						var polycount = subarr.length / 3;
						gnode += `<triangles material="MESH_MATERIAL_${ group.materialIndex }" count="${ polycount }">`;
						gnode += triangleInputs;

						gnode += `<p>${ subarr.join( ' ' ) }</p>`;
						gnode += '</triangles>';

					}

					gnode += `</mesh></geometry>`;

					libraryGeometries.push( gnode );

					info = { meshid: meshid, bufferGeometry: bufferGeometry };
					geometryInfo.set( g, info );

				}

				return info;

			}

			// Process the given texture into the image library
			// Returns the image library
			function processTexture( tex ) {

				var texid = imageMap.get( tex );
				if ( texid == null ) {

					texid = `image-${ libraryImages.length + 1 }`;

					var ext = 'png';
					var name = tex.name || texid;
					var imageNode = `<image id="${ texid }" name="${ name }">`;

					if ( version === '1.5.0' ) {

						imageNode += `<init_from><ref>${ options.textureDirectory }${ name }.${ ext }</ref></init_from>`;

					} else {

						// version image node 1.4.1
						imageNode += `<init_from>${ options.textureDirectory }${ name }.${ ext }</init_from>`;

					}

					imageNode += '</image>';

					libraryImages.push( imageNode );
					imageMap.set( tex, texid );
					textures.push( {
						directory: options.textureDirectory,
						name,
						ext,
						data: imageToData( tex.image, ext ),
						original: tex
					} );

				}

				return texid;

			}

			// Process the given material into the material and effect libraries
			// Returns the material id
			function processMaterial( m ) {

				var matid = materialMap.get( m );

				if ( matid == null ) {

					matid = `Mat${ libraryEffects.length + 1 }`;

					var type = 'phong';

					if ( m instanceof THREE.MeshLambertMaterial ) {

						type = 'lambert';

					} else if ( m instanceof THREE.MeshBasicMaterial ) {

						type = 'constant';

						if ( m.map !== null ) {

							// The Collada spec does not support diffuse texture maps with the
							// constant shader type.
							// mrdoob/three.js#15469
							console.warn( 'ColladaExporter: Texture maps not supported with MeshBasicMaterial.' );

						}

					}

					var emissive = m.emissive ? m.emissive : new THREE.Color( 0, 0, 0 );
					var diffuse = m.color ? m.color : new THREE.Color( 0, 0, 0 );
					var specular = m.specular ? m.specular : new THREE.Color( 1, 1, 1 );
					var shininess = m.shininess || 0;
					var reflectivity = m.reflectivity || 0;

					// Do not export and alpha map for the reasons mentioned in issue (#13792)
					// in three.js alpha maps are black and white, but collada expects the alpha
					// channel to specify the transparency
					var transparencyNode = '';
					if ( m.transparent === true ) {

						transparencyNode +=
							`<transparent>` +
							(
								m.map ?
									`<texture texture="diffuse-sampler"></texture>` :
									'<float>1</float>'
							) +
							'</transparent>';

						if ( m.opacity < 1 ) {

							transparencyNode += `<transparency><float>${ m.opacity }</float></transparency>`;

						}

					}

					var techniqueNode = `<technique sid="common"><${ type }>` +

						'<emission>' +

						(
							m.emissiveMap ?
								'<texture texture="emissive-sampler" texcoord="TEXCOORD" />' :
								`<color sid="emission">${ emissive.r } ${ emissive.g } ${ emissive.b } 1</color>`
						) +

						'</emission>' +

						(
							type !== 'constant' ?
								'<diffuse>' +

							(
								m.map ?
									'<texture texture="diffuse-sampler" texcoord="TEXCOORD" />' :
									`<color sid="diffuse">${ diffuse.r } ${ diffuse.g } ${ diffuse.b } 1</color>`
							) +
							'</diffuse>'
								: ''
						) +

						(
							type !== 'constant' ?
								'<bump>' +

							(
								m.normalMap ? '<texture texture="bump-sampler" texcoord="TEXCOORD" />' : ''
							) +
							'</bump>'
								: ''
						) +

						(
							type === 'phong' ?
								`<specular><color sid="specular">${ specular.r } ${ specular.g } ${ specular.b } 1</color></specular>` +

							'<shininess>' +

							(
								m.specularMap ?
									'<texture texture="specular-sampler" texcoord="TEXCOORD" />' :
									`<float sid="shininess">${ shininess }</float>`
							) +

							'</shininess>'
								: ''
						) +

						`<reflective><color>${ diffuse.r } ${ diffuse.g } ${ diffuse.b } 1</color></reflective>` +

						`<reflectivity><float>${ reflectivity }</float></reflectivity>` +

						transparencyNode +

						`</${ type }></technique>`;

					var effectnode =
						`<effect id="${ matid }-effect">` +
						'<profile_COMMON>' +

						(
							m.map ?
								'<newparam sid="diffuse-surface"><surface type="2D">' +
								`<init_from>${ processTexture( m.map ) }</init_from>` +
								'</surface></newparam>' +
								'<newparam sid="diffuse-sampler"><sampler2D><source>diffuse-surface</source></sampler2D></newparam>' :
								''
						) +

						(
							m.specularMap ?
								'<newparam sid="specular-surface"><surface type="2D">' +
								`<init_from>${ processTexture( m.specularMap ) }</init_from>` +
								'</surface></newparam>' +
								'<newparam sid="specular-sampler"><sampler2D><source>specular-surface</source></sampler2D></newparam>' :
								''
						) +

						(
							m.emissiveMap ?
								'<newparam sid="emissive-surface"><surface type="2D">' +
								`<init_from>${ processTexture( m.emissiveMap ) }</init_from>` +
								'</surface></newparam>' +
								'<newparam sid="emissive-sampler"><sampler2D><source>emissive-surface</source></sampler2D></newparam>' :
								''
						) +

						(
							m.normalMap ?
								'<newparam sid="bump-surface"><surface type="2D">' +
								`<init_from>${ processTexture( m.normalMap ) }</init_from>` +
								'</surface></newparam>' +
								'<newparam sid="bump-sampler"><sampler2D><source>bump-surface</source></sampler2D></newparam>' :
								''
						) +

						techniqueNode +

						(
							m.side === THREE.DoubleSide ?
								`<extra><technique profile="THREEJS"><double_sided sid="double_sided" type="int">1</double_sided></technique></extra>` :
								''
						) +

						'</profile_COMMON>' +

						'</effect>';

					var materialName = m.name ? ` name="${ m.name }"` : '';
					var materialNode = `<material id="${ matid }"${ materialName }><instance_effect url="#${ matid }-effect" /></material>`;

					libraryMaterials.push( materialNode );
					libraryEffects.push( effectnode );
					materialMap.set( m, matid );

				}

				return matid;

			}

			// Recursively process the object into a scene
			function processObject( o ) {

				var node = `<node name="${ o.name }">`;

				node += getTransform( o );

				if ( o instanceof THREE.Mesh && o.geometry != null ) {

					// function returns the id associated with the mesh and a "BufferGeometry" version
					// of the geometry in case it's not a geometry.
					var geomInfo = processGeometry( o.geometry );
					var meshid = geomInfo.meshid;
					var geometry = geomInfo.bufferGeometry;

					// ids of the materials to bind to the geometry
					var matids = null;
					var matidsArray = [];

					// get a list of materials to bind to the sub groups of the geometry.
					// If the amount of subgroups is greater than the materials, than reuse
					// the materials.
					var mat = o.material || new THREE.MeshBasicMaterial();
					var materials = Array.isArray( mat ) ? mat : [ mat ];

					if ( geometry.groups.length > materials.length ) {

						matidsArray = new Array( geometry.groups.length );

					} else {

						matidsArray = new Array( materials.length );

					}
					matids = matidsArray.fill()
						.map( ( v, i ) => processMaterial( materials[ i % materials.length ] ) );

					node +=
						`<instance_geometry url="#${ meshid }">` +

						(
							matids != null ?
								'<bind_material><technique_common>' +
								matids.map( ( id, i ) =>

									`<instance_material symbol="MESH_MATERIAL_${ i }" target="#${ id }" >` +

									'<bind_vertex_input semantic="TEXCOORD" input_semantic="TEXCOORD" input_set="0" />' +

									'</instance_material>'
								).join( '' ) +
								'</technique_common></bind_material>' :
								''
						) +

						'</instance_geometry>';

				}

				o.children.forEach( c => node += processObject( c ) );

				node += '</node>';

				return node;

			}

			var geometryInfo = new WeakMap();
			var materialMap = new WeakMap();
			var imageMap = new WeakMap();
			var textures = [];

			var libraryImages = [];
			var libraryGeometries = [];
			var libraryEffects = [];
			var libraryMaterials = [];
			var libraryVisualScenes = processObject( object );

			var specLink = version === '1.4.1' ? 'http://www.collada.org/2005/11/COLLADASchema' : 'https://www.khronos.org/collada/';
			var dae =
				'<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' +
				`<COLLADA xmlns="${ specLink }" version="${ version }">` +
				'<asset>' +
				(
					'<contributor>' +
					'<authoring_tool>three.js Collada Exporter</authoring_tool>' +
					( options.author !== null ? `<author>${ options.author }</author>` : '' ) +
					'</contributor>' +
					`<created>${ ( new Date() ).toISOString() }</created>` +
					`<modified>${ ( new Date() ).toISOString() }</modified>` +
					'<up_axis>Y_UP</up_axis>'
				) +
				'</asset>';

			dae += `<library_images>${ libraryImages.join( '' ) }</library_images>`;

			dae += `<library_effects>${ libraryEffects.join( '' ) }</library_effects>`;

			dae += `<library_materials>${ libraryMaterials.join( '' ) }</library_materials>`;

			dae += `<library_geometries>${ libraryGeometries.join( '' ) }</library_geometries>`;

			dae += `<library_visual_scenes><visual_scene id="Scene" name="scene">${ libraryVisualScenes }</visual_scene></library_visual_scenes>`;

			dae += '<scene><instance_visual_scene url="#Scene"/></scene>';

			dae += '</COLLADA>';

			var res = {
				data: format( dae ),
				textures
			};

			if ( typeof onDone === 'function' ) {

				requestAnimationFrame( () => onDone( res ) );

			}

			return res;

		}

	};

	return THREE.ColladaExporter;
});

define('skylark-threejs-ex/exporters/PLYExporter',[
	"skylark-threejs"
],function(THREE){
	/**
	 * @author Garrett Johnson / http://gkjohnson.github.io/
	 * https://github.com/gkjohnson/ply-exporter-js
	 *
	 * Usage:
	 *  var exporter = new THREE.PLYExporter();
	 *
	 *  // second argument is a list of options
	 *  exporter.parse(mesh, data => console.log(data), { binary: true, excludeAttributes: [ 'color' ], littleEndian: true });
	 *
	 * Format Definition:
	 * http://paulbourke.net/dataformats/ply/
	 */

	THREE.PLYExporter = function () {};

	THREE.PLYExporter.prototype = {

		constructor: THREE.PLYExporter,

		parse: function ( object, onDone, options ) {

			if ( onDone && typeof onDone === 'object' ) {

				console.warn( 'THREE.PLYExporter: The options parameter is now the third argument to the "parse" function. See the documentation for the new API.' );
				options = onDone;
				onDone = undefined;

			}

			// Iterate over the valid meshes in the object
			function traverseMeshes( cb ) {

				object.traverse( function ( child ) {

					if ( child.isMesh === true ) {

						var mesh = child;
						var geometry = mesh.geometry;

						if ( geometry.isGeometry === true ) {

							geometry = geomToBufferGeom.get( geometry );

						}

						if ( geometry.isBufferGeometry === true ) {

							if ( geometry.getAttribute( 'position' ) !== undefined ) {

								cb( mesh, geometry );

							}

						}

					}

				} );

			}

			// Default options
			var defaultOptions = {
				binary: false,
				excludeAttributes: [], // normal, uv, color, index
				littleEndian: false
			};

			options = Object.assign( defaultOptions, options );

			var excludeAttributes = options.excludeAttributes;
			var geomToBufferGeom = new WeakMap();
			var includeNormals = false;
			var includeColors = false;
			var includeUVs = false;

			// count the vertices, check which properties are used,
			// and cache the BufferGeometry
			var vertexCount = 0;
			var faceCount = 0;
			object.traverse( function ( child ) {

				if ( child.isMesh === true ) {

					var mesh = child;
					var geometry = mesh.geometry;

					if ( geometry.isGeometry === true ) {

						var bufferGeometry = geomToBufferGeom.get( geometry ) || new THREE.BufferGeometry().setFromObject( mesh );
						geomToBufferGeom.set( geometry, bufferGeometry );
						geometry = bufferGeometry;

					}

					if ( geometry.isBufferGeometry === true ) {

						var vertices = geometry.getAttribute( 'position' );
						var normals = geometry.getAttribute( 'normal' );
						var uvs = geometry.getAttribute( 'uv' );
						var colors = geometry.getAttribute( 'color' );
						var indices = geometry.getIndex();

						if ( vertices === undefined ) {

							return;

						}

						vertexCount += vertices.count;
						faceCount += indices ? indices.count / 3 : vertices.count / 3;

						if ( normals !== undefined ) includeNormals = true;

						if ( uvs !== undefined ) includeUVs = true;

						if ( colors !== undefined ) includeColors = true;

					}

				}

			} );

			var includeIndices = excludeAttributes.indexOf( 'index' ) === - 1;
			includeNormals = includeNormals && excludeAttributes.indexOf( 'normal' ) === - 1;
			includeColors = includeColors && excludeAttributes.indexOf( 'color' ) === - 1;
			includeUVs = includeUVs && excludeAttributes.indexOf( 'uv' ) === - 1;


			if ( includeIndices && faceCount !== Math.floor( faceCount ) ) {

				// point cloud meshes will not have an index array and may not have a
				// number of vertices that is divisble by 3 (and therefore representable
				// as triangles)
				console.error(

					'PLYExporter: Failed to generate a valid PLY file with triangle indices because the ' +
					'number of indices is not divisible by 3.'

				);

				return null;

			}

			var indexByteCount = 4;

			var header =
				'ply\n' +
				`format ${ options.binary ? ( options.littleEndian ? 'binary_little_endian' : 'binary_big_endian' ) : 'ascii' } 1.0\n` +
				`element vertex ${vertexCount}\n` +

				// position
				'property float x\n' +
				'property float y\n' +
				'property float z\n';

			if ( includeNormals === true ) {

				// normal
				header +=
					'property float nx\n' +
					'property float ny\n' +
					'property float nz\n';

			}

			if ( includeUVs === true ) {

				// uvs
				header +=
					'property float s\n' +
					'property float t\n';

			}

			if ( includeColors === true ) {

				// colors
				header +=
					'property uchar red\n' +
					'property uchar green\n' +
					'property uchar blue\n';

			}

			if ( includeIndices === true ) {

				// faces
				header +=
					`element face ${faceCount}\n` +
					`property list uchar int vertex_index\n`;

			}

			header += 'end_header\n';


			// Generate attribute data
			var vertex = new THREE.Vector3();
			var normalMatrixWorld = new THREE.Matrix3();
			var result = null;

			if ( options.binary === true ) {

				// Binary File Generation
				var headerBin = new TextEncoder().encode( header );

				// 3 position values at 4 bytes
				// 3 normal values at 4 bytes
				// 3 color channels with 1 byte
				// 2 uv values at 4 bytes
				var vertexListLength = vertexCount * ( 4 * 3 + ( includeNormals ? 4 * 3 : 0 ) + ( includeColors ? 3 : 0 ) + ( includeUVs ? 4 * 2 : 0 ) );

				// 1 byte shape desciptor
				// 3 vertex indices at ${indexByteCount} bytes
				var faceListLength = includeIndices ? faceCount * ( indexByteCount * 3 + 1 ) : 0;
				var output = new DataView( new ArrayBuffer( headerBin.length + vertexListLength + faceListLength ) );
				new Uint8Array( output.buffer ).set( headerBin, 0 );


				var vOffset = headerBin.length;
				var fOffset = headerBin.length + vertexListLength;
				var writtenVertices = 0;
				traverseMeshes( function ( mesh, geometry ) {

					var vertices = geometry.getAttribute( 'position' );
					var normals = geometry.getAttribute( 'normal' );
					var uvs = geometry.getAttribute( 'uv' );
					var colors = geometry.getAttribute( 'color' );
					var indices = geometry.getIndex();

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					for ( var i = 0, l = vertices.count; i < l; i ++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						vertex.applyMatrix4( mesh.matrixWorld );


						// Position information
						output.setFloat32( vOffset, vertex.x, options.littleEndian );
						vOffset += 4;

						output.setFloat32( vOffset, vertex.y, options.littleEndian );
						vOffset += 4;

						output.setFloat32( vOffset, vertex.z, options.littleEndian );
						vOffset += 4;

						// Normal information
						if ( includeNormals === true ) {

							if ( normals != null ) {

								vertex.x = normals.getX( i );
								vertex.y = normals.getY( i );
								vertex.z = normals.getZ( i );

								vertex.applyMatrix3( normalMatrixWorld ).normalize();

								output.setFloat32( vOffset, vertex.x, options.littleEndian );
								vOffset += 4;

								output.setFloat32( vOffset, vertex.y, options.littleEndian );
								vOffset += 4;

								output.setFloat32( vOffset, vertex.z, options.littleEndian );
								vOffset += 4;

							} else {

								output.setFloat32( vOffset, 0, options.littleEndian );
								vOffset += 4;

								output.setFloat32( vOffset, 0, options.littleEndian );
								vOffset += 4;

								output.setFloat32( vOffset, 0, options.littleEndian );
								vOffset += 4;

							}

						}

						// UV information
						if ( includeUVs === true ) {

							if ( uvs != null ) {

								output.setFloat32( vOffset, uvs.getX( i ), options.littleEndian );
								vOffset += 4;

								output.setFloat32( vOffset, uvs.getY( i ), options.littleEndian );
								vOffset += 4;

							} else if ( includeUVs !== false ) {

								output.setFloat32( vOffset, 0, options.littleEndian );
								vOffset += 4;

								output.setFloat32( vOffset, 0, options.littleEndian );
								vOffset += 4;

							}

						}

						// Color information
						if ( includeColors === true ) {

							if ( colors != null ) {

								output.setUint8( vOffset, Math.floor( colors.getX( i ) * 255 ) );
								vOffset += 1;

								output.setUint8( vOffset, Math.floor( colors.getY( i ) * 255 ) );
								vOffset += 1;

								output.setUint8( vOffset, Math.floor( colors.getZ( i ) * 255 ) );
								vOffset += 1;

							} else {

								output.setUint8( vOffset, 255 );
								vOffset += 1;

								output.setUint8( vOffset, 255 );
								vOffset += 1;

								output.setUint8( vOffset, 255 );
								vOffset += 1;

							}

						}

					}

					if ( includeIndices === true ) {

						// Create the face list

						if ( indices !== null ) {

							for ( var i = 0, l = indices.count; i < l; i += 3 ) {

								output.setUint8( fOffset, 3 );
								fOffset += 1;

								output.setUint32( fOffset, indices.getX( i + 0 ) + writtenVertices, options.littleEndian );
								fOffset += indexByteCount;

								output.setUint32( fOffset, indices.getX( i + 1 ) + writtenVertices, options.littleEndian );
								fOffset += indexByteCount;

								output.setUint32( fOffset, indices.getX( i + 2 ) + writtenVertices, options.littleEndian );
								fOffset += indexByteCount;

							}

						} else {

							for ( var i = 0, l = vertices.count; i < l; i += 3 ) {

								output.setUint8( fOffset, 3 );
								fOffset += 1;

								output.setUint32( fOffset, writtenVertices + i, options.littleEndian );
								fOffset += indexByteCount;

								output.setUint32( fOffset, writtenVertices + i + 1, options.littleEndian );
								fOffset += indexByteCount;

								output.setUint32( fOffset, writtenVertices + i + 2, options.littleEndian );
								fOffset += indexByteCount;

							}

						}

					}


					// Save the amount of verts we've already written so we can offset
					// the face index on the next mesh
					writtenVertices += vertices.count;

				} );

				result = output.buffer;

			} else {

				// Ascii File Generation
				// count the number of vertices
				var writtenVertices = 0;
				var vertexList = '';
				var faceList = '';

				traverseMeshes( function ( mesh, geometry ) {

					var vertices = geometry.getAttribute( 'position' );
					var normals = geometry.getAttribute( 'normal' );
					var uvs = geometry.getAttribute( 'uv' );
					var colors = geometry.getAttribute( 'color' );
					var indices = geometry.getIndex();

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					// form each line
					for ( var i = 0, l = vertices.count; i < l; i ++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						vertex.applyMatrix4( mesh.matrixWorld );


						// Position information
						var line =
							vertex.x + ' ' +
							vertex.y + ' ' +
							vertex.z;

						// Normal information
						if ( includeNormals === true ) {

							if ( normals != null ) {

								vertex.x = normals.getX( i );
								vertex.y = normals.getY( i );
								vertex.z = normals.getZ( i );

								vertex.applyMatrix3( normalMatrixWorld ).normalize();

								line += ' ' +
									vertex.x + ' ' +
									vertex.y + ' ' +
									vertex.z;

							} else {

								line += ' 0 0 0';

							}

						}

						// UV information
						if ( includeUVs === true ) {

							if ( uvs != null ) {

								line += ' ' +
									uvs.getX( i ) + ' ' +
									uvs.getY( i );

							} else if ( includeUVs !== false ) {

								line += ' 0 0';

							}

						}

						// Color information
						if ( includeColors === true ) {

							if ( colors != null ) {

								line += ' ' +
									Math.floor( colors.getX( i ) * 255 ) + ' ' +
									Math.floor( colors.getY( i ) * 255 ) + ' ' +
									Math.floor( colors.getZ( i ) * 255 );

							} else {

								line += ' 255 255 255';

							}

						}

						vertexList += line + '\n';

					}

					// Create the face list
					if ( includeIndices === true ) {

						if ( indices !== null ) {

							for ( var i = 0, l = indices.count; i < l; i += 3 ) {

								faceList += `3 ${ indices.getX( i + 0 ) + writtenVertices }`;
								faceList += ` ${ indices.getX( i + 1 ) + writtenVertices }`;
								faceList += ` ${ indices.getX( i + 2 ) + writtenVertices }\n`;

							}

						} else {

							for ( var i = 0, l = vertices.count; i < l; i += 3 ) {

								faceList += `3 ${ writtenVertices + i } ${ writtenVertices + i + 1 } ${ writtenVertices + i + 2 }\n`;

							}

						}

						faceCount += indices ? indices.count / 3 : vertices.count / 3;

					}

					writtenVertices += vertices.count;

				} );

				result = `${ header }${vertexList}${ includeIndices ? `${faceList}\n` : '\n' }`;

			}

			if ( typeof onDone === 'function' ) requestAnimationFrame( () => onDone( result ) );
			return result;

		}

	};
	
	return THREE.PLYExporter;
});

define('skylark-threejs-ex/main',[
	"skylark-threejs",

	"./shaders/CopyShader",
	"./shaders/BokehShader",
	"./shaders/SAOShader",
	"./shaders/DepthLimitedBlurShader",
	"./shaders/UnpackDepthRGBAShader",
	"./shaders/ConvolutionShader",
	"./shaders/LuminosityHighPassShader",
	"./shaders/FXAAShader",
	"./shaders/SSAOShader",
	"./shaders/FilmShader",
	"./shaders/DotScreenShader",
	"./shaders/LuminosityShader",
	"./shaders/SobelOperatorShader",
	"./shaders/ColorifyShader",
	"./shaders/ToneMapShader",
	"./shaders/TechnicolorShader",
	"./shaders/HueSaturationShader",

	"./postprocessing/EffectComposer",
	"./postprocessing/RenderPass",
	"./postprocessing/ShaderPass",
	"./postprocessing/MaskPass",

	"./curves/NURBSCurve",
	"./curves/NURBSSurface",
	"./curves/NURBSUtils",

	"./objects/Lensflare",
	"./objects/Reflector",
	"./objects/Refractor",

	"./loaders/TTFLoader",
//	"./loaders/LoaderSupport",
	"./loaders/3MFLoader",
	"./loaders/AMFLoader",
//	"./loaders/AssimpJSONLoader",
	"./loaders/AssimpLoader",
//	"./loaders/AWDLoader",
//	"./loaders/BabylonLoader",
	"./loaders/ColladaLoader",
	"./loaders/DRACOLoader",
	"./loaders/FBXLoader",
	"./loaders/GCodeLoader",
	"./loaders/GLTFLoader",
	"./loaders/MTLLoader",
	"./loaders/OBJLoader",
//	"./loaders/OBJLoader2",
	"./loaders/PCDLoader",
	"./loaders/PLYLoader",
	"./loaders/PRWMLoader",
	"./loaders/STLLoader",
	"./loaders/SVGLoader",
	"./loaders/TDSLoader",
//	"./loaders/VRMLLoader",
	"./loaders/VTKLoader",
	"./loaders/XLoader",
	"./loaders/DDSLoader",
	"./loaders/PVRLoader",
	"./loaders/TGALoader",
	"./loaders/KTXLoader",

	"./modifiers/SimplifyModifier",
	"./modifiers/SubdivisionModifier",

	"./exporters/DRACOExporter",
	"./exporters/OBJExporter",
	"./exporters/STLExporter",
	"./exporters/GLTFExporter",
	"./exporters/ColladaExporter",
	"./exporters/PLYExporter"

],function(THREE){
	return THREE;
});
define('skylark-threejs-ex', ['skylark-threejs-ex/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-threejs-ex.js.map
