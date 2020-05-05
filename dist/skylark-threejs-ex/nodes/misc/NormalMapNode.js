/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../core/TempNode","../inputs/Vector2Node","../core/FunctionNode","../accessors/UVNode","../accessors/NormalNode","../accessors/PositionNode"],function(t,e,o,n,s,r,a){"use strict";function i(t,n){e.call(this,"v3"),this.value=t,this.scale=n||new o(1,1)}return i.Nodes={perturbNormal2Arb:new n("vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 map, vec2 vUv, vec2 normalScale ) {\n\n\t\t// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988\n\n\t\tvec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n\t\tvec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\n\t\tfloat scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude\n\n\t\tvec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );\n\t\tvec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );\n\t\tvec3 N = normalize( surf_norm );\n\n\t\tvec3 mapN = map * 2.0 - 1.0;\n\n\t\tmapN.xy *= normalScale;\n\n\t\t#ifdef DOUBLE_SIDED\n\n\t\t\t// Workaround for Adreno GPUs gl_FrontFacing bug. See #15850 and #10331\n\n\t\t\tif ( dot( cross( S, T ), N ) < 0.0 ) mapN.xy *= - 1.0;\n\n\t\t#else\n\n\t\t\tmapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n\t\t#endif\n\n\t\tmat3 tsn = mat3( S, T, N );\n\t\treturn normalize( tsn * mapN );\n\n\t}",null,{derivatives:!0})},i.prototype=Object.create(e.prototype),i.prototype.constructor=i,i.prototype.nodeType="NormalMap",i.prototype.generate=function(e,o){if(e.isShader("fragment")){var n=e.include(i.Nodes.perturbNormal2Arb);this.normal=this.normal||new r,this.position=this.position||new a(a.VIEW),this.uv=this.uv||new s;var c=this.scale.build(e,"v2");return e.material.side===t.BackSide&&(c="-"+c),e.format(n+"( -"+this.position.build(e,"v3")+", "+this.normal.build(e,"v3")+", "+this.value.build(e,"v3")+", "+this.uv.build(e,"v2")+", "+c+" )",this.getType(e),o)}return console.warn("THREE.NormalMapNode is not compatible with "+e.shader+" shader."),e.format("vec3( 0.0 )",this.getType(e),o)},i.prototype.copy=function(t){return e.prototype.copy.call(this,t),this.value=t.value,this.scale=t.scale,this},i.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).value=this.value.toJSON(t).uuid,e.scale=this.scale.toJSON(t).uuid),e},i});
//# sourceMappingURL=../../sourcemaps/nodes/misc/NormalMapNode.js.map
