/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(t){"use strict";var e={modes:{none:"NO_PARALLAX",basic:"USE_BASIC_PARALLAX",steep:"USE_STEEP_PARALLAX",occlusion:"USE_OCLUSION_PARALLAX",relief:"USE_RELIEF_PARALLAX"},uniforms:{bumpMap:{value:null},map:{value:null},parallaxScale:{value:null},parallaxMinLayers:{value:null},parallaxMaxLayers:{value:null}},vertexShader:["varying vec2 vUv;","varying vec3 vViewPosition;","varying vec3 vNormal;","void main() {","\tvUv = uv;","\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );","\tvViewPosition = -mvPosition.xyz;","\tvNormal = normalize( normalMatrix * normal );","\tgl_Position = projectionMatrix * mvPosition;","}"].join("\n"),fragmentShader:["uniform sampler2D bumpMap;","uniform sampler2D map;","uniform float parallaxScale;","uniform float parallaxMinLayers;","uniform float parallaxMaxLayers;","varying vec2 vUv;","varying vec3 vViewPosition;","varying vec3 vNormal;","#ifdef USE_BASIC_PARALLAX","\tvec2 parallaxMap( in vec3 V ) {","\t\tfloat initialHeight = texture2D( bumpMap, vUv ).r;","\t\tvec2 texCoordOffset = parallaxScale * V.xy * initialHeight;","\t\treturn vUv - texCoordOffset;","\t}","#else","\tvec2 parallaxMap( in vec3 V ) {","\t\tfloat numLayers = mix( parallaxMaxLayers, parallaxMinLayers, abs( dot( vec3( 0.0, 0.0, 1.0 ), V ) ) );","\t\tfloat layerHeight = 1.0 / numLayers;","\t\tfloat currentLayerHeight = 0.0;","\t\tvec2 dtex = parallaxScale * V.xy / V.z / numLayers;","\t\tvec2 currentTextureCoords = vUv;","\t\tfloat heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;","\t\tfor ( int i = 0; i < 30; i += 1 ) {","\t\t\tif ( heightFromTexture <= currentLayerHeight ) {","\t\t\t\tbreak;","\t\t\t}","\t\t\tcurrentLayerHeight += layerHeight;","\t\t\tcurrentTextureCoords -= dtex;","\t\t\theightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;","\t\t}","\t\t#ifdef USE_STEEP_PARALLAX","\t\t\treturn currentTextureCoords;","\t\t#elif defined( USE_RELIEF_PARALLAX )","\t\t\tvec2 deltaTexCoord = dtex / 2.0;","\t\t\tfloat deltaHeight = layerHeight / 2.0;","\t\t\tcurrentTextureCoords += deltaTexCoord;","\t\t\tcurrentLayerHeight -= deltaHeight;","\t\t\tconst int numSearches = 5;","\t\t\tfor ( int i = 0; i < numSearches; i += 1 ) {","\t\t\t\tdeltaTexCoord /= 2.0;","\t\t\t\tdeltaHeight /= 2.0;","\t\t\t\theightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;","\t\t\t\tif( heightFromTexture > currentLayerHeight ) {","\t\t\t\t\tcurrentTextureCoords -= deltaTexCoord;","\t\t\t\t\tcurrentLayerHeight += deltaHeight;","\t\t\t\t} else {","\t\t\t\t\tcurrentTextureCoords += deltaTexCoord;","\t\t\t\t\tcurrentLayerHeight -= deltaHeight;","\t\t\t\t}","\t\t\t}","\t\t\treturn currentTextureCoords;","\t\t#elif defined( USE_OCLUSION_PARALLAX )","\t\t\tvec2 prevTCoords = currentTextureCoords + dtex;","\t\t\tfloat nextH = heightFromTexture - currentLayerHeight;","\t\t\tfloat prevH = texture2D( bumpMap, prevTCoords ).r - currentLayerHeight + layerHeight;","\t\t\tfloat weight = nextH / ( nextH - prevH );","\t\t\treturn prevTCoords * weight + currentTextureCoords * ( 1.0 - weight );","\t\t#else","\t\t\treturn vUv;","\t\t#endif","\t}","#endif","vec2 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {","\tvec2 texDx = dFdx( vUv );","\tvec2 texDy = dFdy( vUv );","\tvec3 vSigmaX = dFdx( surfPosition );","\tvec3 vSigmaY = dFdy( surfPosition );","\tvec3 vR1 = cross( vSigmaY, surfNormal );","\tvec3 vR2 = cross( surfNormal, vSigmaX );","\tfloat fDet = dot( vSigmaX, vR1 );","\tvec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );","\tvec3 vProjVtex;","\tvProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;","\tvProjVtex.z = dot( surfNormal, viewPosition );","\treturn parallaxMap( vProjVtex );","}","void main() {","\tvec2 mapUv = perturbUv( -vViewPosition, normalize( vNormal ), normalize( vViewPosition ) );","\tgl_FragColor = texture2D( map, mapUv );","}"].join("\n")};return t.shaders.ParallaxShader=e});
//# sourceMappingURL=../sourcemaps/shaders/ParallaxShader.js.map
