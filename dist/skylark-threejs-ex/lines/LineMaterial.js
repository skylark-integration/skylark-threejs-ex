/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){return t.UniformsLib.line={linewidth:{value:1},resolution:{value:new t.Vector2(1,1)},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},t.ShaderLib.line={uniforms:t.UniformsUtils.merge([t.UniformsLib.common,t.UniformsLib.fog,t.UniformsLib.line]),vertexShader:"\n\t\t\t#include <common>\n\t\t\t#include <color_pars_vertex>\n\t\t\t#include <fog_pars_vertex>\n\t\t\t#include <logdepthbuf_pars_vertex>\n\t\t\t#include <clipping_planes_pars_vertex>\n\n\t\t\tuniform float linewidth;\n\t\t\tuniform vec2 resolution;\n\n\t\t\tattribute vec3 instanceStart;\n\t\t\tattribute vec3 instanceEnd;\n\n\t\t\tattribute vec3 instanceColorStart;\n\t\t\tattribute vec3 instanceColorEnd;\n\n\t\t\tvarying vec2 vUv;\n\n\t\t\t#ifdef USE_DASH\n\n\t\t\t\tuniform float dashScale;\n\t\t\t\tattribute float instanceDistanceStart;\n\t\t\t\tattribute float instanceDistanceEnd;\n\t\t\t\tvarying float vLineDistance;\n\n\t\t\t#endif\n\n\t\t\tvoid trimSegment( const in vec4 start, inout vec4 end ) {\n\n\t\t\t\t// trim end segment so it terminates between the camera plane and the near plane\n\n\t\t\t\t// conservative estimate of the near plane\n\t\t\t\tfloat a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column\n\t\t\t\tfloat b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column\n\t\t\t\tfloat nearEstimate = - 0.5 * b / a;\n\n\t\t\t\tfloat alpha = ( nearEstimate - start.z ) / ( end.z - start.z );\n\n\t\t\t\tend.xyz = mix( start.xyz, end.xyz, alpha );\n\n\t\t\t}\n\n\t\t\tvoid main() {\n\n\t\t\t\t#ifdef USE_COLOR\n\n\t\t\t\t\tvColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;\n\n\t\t\t\t#endif\n\n\t\t\t\t#ifdef USE_DASH\n\n\t\t\t\t\tvLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;\n\n\t\t\t\t#endif\n\n\t\t\t\tfloat aspect = resolution.x / resolution.y;\n\n\t\t\t\tvUv = uv;\n\n\t\t\t\t// camera space\n\t\t\t\tvec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );\n\t\t\t\tvec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );\n\n\t\t\t\t// special case for perspective projection, and segments that terminate either in, or behind, the camera plane\n\t\t\t\t// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space\n\t\t\t\t// but we need to perform ndc-space calculations in the shader, so we must address this issue directly\n\t\t\t\t// perhaps there is a more elegant solution -- WestLangley\n\n\t\t\t\tbool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column\n\n\t\t\t\tif ( perspective ) {\n\n\t\t\t\t\tif ( start.z < 0.0 && end.z >= 0.0 ) {\n\n\t\t\t\t\t\ttrimSegment( start, end );\n\n\t\t\t\t\t} else if ( end.z < 0.0 && start.z >= 0.0 ) {\n\n\t\t\t\t\t\ttrimSegment( end, start );\n\n\t\t\t\t\t}\n\n\t\t\t\t}\n\n\t\t\t\t// clip space\n\t\t\t\tvec4 clipStart = projectionMatrix * start;\n\t\t\t\tvec4 clipEnd = projectionMatrix * end;\n\n\t\t\t\t// ndc space\n\t\t\t\tvec2 ndcStart = clipStart.xy / clipStart.w;\n\t\t\t\tvec2 ndcEnd = clipEnd.xy / clipEnd.w;\n\n\t\t\t\t// direction\n\t\t\t\tvec2 dir = ndcEnd - ndcStart;\n\n\t\t\t\t// account for clip-space aspect ratio\n\t\t\t\tdir.x *= aspect;\n\t\t\t\tdir = normalize( dir );\n\n\t\t\t\t// perpendicular to dir\n\t\t\t\tvec2 offset = vec2( dir.y, - dir.x );\n\n\t\t\t\t// undo aspect ratio adjustment\n\t\t\t\tdir.x /= aspect;\n\t\t\t\toffset.x /= aspect;\n\n\t\t\t\t// sign flip\n\t\t\t\tif ( position.x < 0.0 ) offset *= - 1.0;\n\n\t\t\t\t// endcaps\n\t\t\t\tif ( position.y < 0.0 ) {\n\n\t\t\t\t\toffset += - dir;\n\n\t\t\t\t} else if ( position.y > 1.0 ) {\n\n\t\t\t\t\toffset += dir;\n\n\t\t\t\t}\n\n\t\t\t\t// adjust for linewidth\n\t\t\t\toffset *= linewidth;\n\n\t\t\t\t// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...\n\t\t\t\toffset /= resolution.y;\n\n\t\t\t\t// select end\n\t\t\t\tvec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;\n\n\t\t\t\t// back to clip space\n\t\t\t\toffset *= clip.w;\n\n\t\t\t\tclip.xy += offset;\n\n\t\t\t\tgl_Position = clip;\n\n\t\t\t\tvec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation\n\n\t\t\t\t#include <logdepthbuf_vertex>\n\t\t\t\t#include <clipping_planes_vertex>\n\t\t\t\t#include <fog_vertex>\n\n\t\t\t}\n\t\t\t",fragmentShader:"\n\t\t\tuniform vec3 diffuse;\n\t\t\tuniform float opacity;\n\n\t\t\t#ifdef USE_DASH\n\n\t\t\t\tuniform float dashSize;\n\t\t\t\tuniform float gapSize;\n\n\t\t\t#endif\n\n\t\t\tvarying float vLineDistance;\n\n\t\t\t#include <common>\n\t\t\t#include <color_pars_fragment>\n\t\t\t#include <fog_pars_fragment>\n\t\t\t#include <logdepthbuf_pars_fragment>\n\t\t\t#include <clipping_planes_pars_fragment>\n\n\t\t\tvarying vec2 vUv;\n\n\t\t\tvoid main() {\n\n\t\t\t\t#include <clipping_planes_fragment>\n\n\t\t\t\t#ifdef USE_DASH\n\n\t\t\t\t\tif ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps\n\n\t\t\t\t\tif ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX\n\n\t\t\t\t#endif\n\n\t\t\t\tif ( abs( vUv.y ) > 1.0 ) {\n\n\t\t\t\t\tfloat a = vUv.x;\n\t\t\t\t\tfloat b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;\n\t\t\t\t\tfloat len2 = a * a + b * b;\n\n\t\t\t\t\tif ( len2 > 1.0 ) discard;\n\n\t\t\t\t}\n\n\t\t\t\tvec4 diffuseColor = vec4( diffuse, opacity );\n\n\t\t\t\t#include <logdepthbuf_fragment>\n\t\t\t\t#include <color_fragment>\n\n\t\t\t\tgl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );\n\n\t\t\t\t#include <tonemapping_fragment>\n\t\t\t\t#include <encodings_fragment>\n\t\t\t\t#include <fog_fragment>\n\t\t\t\t#include <premultiplied_alpha_fragment>\n\n\t\t\t}\n\t\t\t"},t.LineMaterial=function(n){t.ShaderMaterial.call(this,{type:"LineMaterial",uniforms:t.UniformsUtils.clone(t.ShaderLib.line.uniforms),vertexShader:t.ShaderLib.line.vertexShader,fragmentShader:t.ShaderLib.line.fragmentShader,clipping:!0}),this.dashed=!1,Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(t){this.uniforms.diffuse.value=t}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(t){this.uniforms.linewidth.value=t}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(t){this.uniforms.dashScale.value=t}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(t){this.uniforms.dashSize.value=t}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(t){this.uniforms.gapSize.value=t}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(t){this.uniforms.resolution.value.copy(t)}}}),this.setValues(n)},t.LineMaterial.prototype=Object.create(t.ShaderMaterial.prototype),t.LineMaterial.prototype.constructor=t.LineMaterial,t.LineMaterial.prototype.isLineMaterial=!0,t.LineMaterial});
//# sourceMappingURL=../sourcemaps/lines/LineMaterial.js.map