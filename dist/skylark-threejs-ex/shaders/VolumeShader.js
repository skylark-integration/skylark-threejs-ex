/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";return{uniforms:{u_size:{value:new t.Vector3(1,1,1)},u_renderstyle:{value:0},u_renderthreshold:{value:.5},u_clim:{value:new t.Vector2(1,1)},u_data:{value:null},u_cmdata:{value:null}},vertexShader:["\t\tvarying vec4 v_nearpos;","\t\tvarying vec4 v_farpos;","\t\tvarying vec3 v_position;","\t\tmat4 inversemat(mat4 m) {","\t\t\t\tfloat","\t\t\t\ta00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],","\t\t\t\ta10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],","\t\t\t\ta20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],","\t\t\t\ta30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],","\t\t\t\tb00 = a00 * a11 - a01 * a10,","\t\t\t\tb01 = a00 * a12 - a02 * a10,","\t\t\t\tb02 = a00 * a13 - a03 * a10,","\t\t\t\tb03 = a01 * a12 - a02 * a11,","\t\t\t\tb04 = a01 * a13 - a03 * a11,","\t\t\t\tb05 = a02 * a13 - a03 * a12,","\t\t\t\tb06 = a20 * a31 - a21 * a30,","\t\t\t\tb07 = a20 * a32 - a22 * a30,","\t\t\t\tb08 = a20 * a33 - a23 * a30,","\t\t\t\tb09 = a21 * a32 - a22 * a31,","\t\t\t\tb10 = a21 * a33 - a23 * a31,","\t\t\t\tb11 = a22 * a33 - a23 * a32,","\t\t\t\tdet = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;","\t\treturn mat4(","\t\t\t\ta11 * b11 - a12 * b10 + a13 * b09,","\t\t\t\ta02 * b10 - a01 * b11 - a03 * b09,","\t\t\t\ta31 * b05 - a32 * b04 + a33 * b03,","\t\t\t\ta22 * b04 - a21 * b05 - a23 * b03,","\t\t\t\ta12 * b08 - a10 * b11 - a13 * b07,","\t\t\t\ta00 * b11 - a02 * b08 + a03 * b07,","\t\t\t\ta32 * b02 - a30 * b05 - a33 * b01,","\t\t\t\ta20 * b05 - a22 * b02 + a23 * b01,","\t\t\t\ta10 * b10 - a11 * b08 + a13 * b06,","\t\t\t\ta01 * b08 - a00 * b10 - a03 * b06,","\t\t\t\ta30 * b04 - a31 * b02 + a33 * b00,","\t\t\t\ta21 * b02 - a20 * b04 - a23 * b00,","\t\t\t\ta11 * b07 - a10 * b09 - a12 * b06,","\t\t\t\ta00 * b09 - a01 * b07 + a02 * b06,","\t\t\t\ta31 * b01 - a30 * b03 - a32 * b00,","\t\t\t\ta20 * b03 - a21 * b01 + a22 * b00) / det;","\t\t}","\t\tvoid main() {","\t\t\t\tmat4 viewtransformf = modelViewMatrix;","\t\t\t\tmat4 viewtransformi = inversemat(modelViewMatrix);","\t\t\t\tvec4 position4 = vec4(position, 1.0);","\t\t\t\tvec4 pos_in_cam = viewtransformf * position4;","\t\t\t\tpos_in_cam.z = -pos_in_cam.w;","\t\t\t\tv_nearpos = viewtransformi * pos_in_cam;","\t\t\t\tpos_in_cam.z = pos_in_cam.w;","\t\t\t\tv_farpos = viewtransformi * pos_in_cam;","\t\t\t\tv_position = position;","\t\t\t\tgl_Position = projectionMatrix * viewMatrix * modelMatrix * position4;","\t\t}"].join("\n"),fragmentShader:["\t\tprecision highp float;","\t\tprecision mediump sampler3D;","\t\tuniform vec3 u_size;","\t\tuniform int u_renderstyle;","\t\tuniform float u_renderthreshold;","\t\tuniform vec2 u_clim;","\t\tuniform sampler3D u_data;","\t\tuniform sampler2D u_cmdata;","\t\tvarying vec3 v_position;","\t\tvarying vec4 v_nearpos;","\t\tvarying vec4 v_farpos;","\t\tconst int MAX_STEPS = 887;\t// 887 for 512^3, 1774 for 1024^3","\t\tconst int REFINEMENT_STEPS = 4;","\t\tconst float relative_step_size = 1.0;","\t\tconst vec4 ambient_color = vec4(0.2, 0.4, 0.2, 1.0);","\t\tconst vec4 diffuse_color = vec4(0.8, 0.2, 0.2, 1.0);","\t\tconst vec4 specular_color = vec4(1.0, 1.0, 1.0, 1.0);","\t\tconst float shininess = 40.0;","\t\tvoid cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray);","\t\tvoid cast_iso(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray);","\t\tfloat sample1(vec3 texcoords);","\t\tvec4 apply_colormap(float val);","\t\tvec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray);","\t\tvoid main() {","\t\t\t\tvec3 farpos = v_farpos.xyz / v_farpos.w;","\t\t\t\tvec3 nearpos = v_nearpos.xyz / v_nearpos.w;","\t\t\t\tvec3 view_ray = normalize(nearpos.xyz - farpos.xyz);","\t\t\t\tfloat distance = dot(nearpos - v_position, view_ray);","\t\t\t\tdistance = max(distance, min((-0.5 - v_position.x) / view_ray.x,","\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t(u_size.x - 0.5 - v_position.x) / view_ray.x));","\t\t\t\tdistance = max(distance, min((-0.5 - v_position.y) / view_ray.y,","\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t(u_size.y - 0.5 - v_position.y) / view_ray.y));","\t\t\t\tdistance = max(distance, min((-0.5 - v_position.z) / view_ray.z,","\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t(u_size.z - 0.5 - v_position.z) / view_ray.z));","\t\t\t\tvec3 front = v_position + view_ray * distance;","\t\t\t\tint nsteps = int(-distance / relative_step_size + 0.5);","\t\t\t\tif ( nsteps < 1 )","\t\t\t\t\t\tdiscard;","\t\t\t\tvec3 step = ((v_position - front) / u_size) / float(nsteps);","\t\t\t\tvec3 start_loc = front / u_size;","\t\t\t\tif (u_renderstyle == 0)","\t\t\t\t\t\tcast_mip(start_loc, step, nsteps, view_ray);","\t\t\t\telse if (u_renderstyle == 1)","\t\t\t\t\t\tcast_iso(start_loc, step, nsteps, view_ray);","\t\t\t\tif (gl_FragColor.a < 0.05)","\t\t\t\t\t\tdiscard;","\t\t}","\t\tfloat sample1(vec3 texcoords) {","\t\t\t\t/* Sample float value from a 3D texture. Assumes intensity data. */","\t\t\t\treturn texture(u_data, texcoords.xyz).r;","\t\t}","\t\tvec4 apply_colormap(float val) {","\t\t\t\tval = (val - u_clim[0]) / (u_clim[1] - u_clim[0]);","\t\t\t\treturn texture2D(u_cmdata, vec2(val, 0.5));","\t\t}","\t\tvoid cast_mip(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray) {","\t\t\t\tfloat max_val = -1e6;","\t\t\t\tint max_i = 100;","\t\t\t\tvec3 loc = start_loc;","\t\t\t\tfor (int iter=0; iter<MAX_STEPS; iter++) {","\t\t\t\t\t\tif (iter >= nsteps)","\t\t\t\t\t\t\t\tbreak;","\t\t\t\t\t\tfloat val = sample1(loc);","\t\t\t\t\t\tif (val > max_val) {","\t\t\t\t\t\t\t\tmax_val = val;","\t\t\t\t\t\t\t\tmax_i = iter;","\t\t\t\t\t\t}","\t\t\t\t\t\tloc += step;","\t\t\t\t}","\t\t\t\tvec3 iloc = start_loc + step * (float(max_i) - 0.5);","\t\t\t\tvec3 istep = step / float(REFINEMENT_STEPS);","\t\t\t\tfor (int i=0; i<REFINEMENT_STEPS; i++) {","\t\t\t\t\t\tmax_val = max(max_val, sample1(iloc));","\t\t\t\t\t\tiloc += istep;","\t\t\t\t}","\t\t\t\tgl_FragColor = apply_colormap(max_val);","\t\t}","\t\tvoid cast_iso(vec3 start_loc, vec3 step, int nsteps, vec3 view_ray) {","\t\t\t\tgl_FragColor = vec4(0.0);\t// init transparent","\t\t\t\tvec4 color3 = vec4(0.0);\t// final color","\t\t\t\tvec3 dstep = 1.5 / u_size;\t// step to sample derivative","\t\t\t\tvec3 loc = start_loc;","\t\t\t\tfloat low_threshold = u_renderthreshold - 0.02 * (u_clim[1] - u_clim[0]);","\t\t\t\tfor (int iter=0; iter<MAX_STEPS; iter++) {","\t\t\t\t\t\tif (iter >= nsteps)","\t\t\t\t\t\t\t\tbreak;","\t\t\t\t\t\tfloat val = sample1(loc);","\t\t\t\t\t\tif (val > low_threshold) {","\t\t\t\t\t\t\t\tvec3 iloc = loc - 0.5 * step;","\t\t\t\t\t\t\t\tvec3 istep = step / float(REFINEMENT_STEPS);","\t\t\t\t\t\t\t\tfor (int i=0; i<REFINEMENT_STEPS; i++) {","\t\t\t\t\t\t\t\t\t\tval = sample1(iloc);","\t\t\t\t\t\t\t\t\t\tif (val > u_renderthreshold) {","\t\t\t\t\t\t\t\t\t\t\t\tgl_FragColor = add_lighting(val, iloc, dstep, view_ray);","\t\t\t\t\t\t\t\t\t\t\t\treturn;","\t\t\t\t\t\t\t\t\t\t}","\t\t\t\t\t\t\t\t\t\tiloc += istep;","\t\t\t\t\t\t\t\t}","\t\t\t\t\t\t}","\t\t\t\t\t\tloc += step;","\t\t\t\t}","\t\t}","\t\tvec4 add_lighting(float val, vec3 loc, vec3 step, vec3 view_ray)","\t\t{","\t\t\t\tvec3 V = normalize(view_ray);","\t\t\t\tvec3 N;","\t\t\t\tfloat val1, val2;","\t\t\t\tval1 = sample1(loc + vec3(-step[0], 0.0, 0.0));","\t\t\t\tval2 = sample1(loc + vec3(+step[0], 0.0, 0.0));","\t\t\t\tN[0] = val1 - val2;","\t\t\t\tval = max(max(val1, val2), val);","\t\t\t\tval1 = sample1(loc + vec3(0.0, -step[1], 0.0));","\t\t\t\tval2 = sample1(loc + vec3(0.0, +step[1], 0.0));","\t\t\t\tN[1] = val1 - val2;","\t\t\t\tval = max(max(val1, val2), val);","\t\t\t\tval1 = sample1(loc + vec3(0.0, 0.0, -step[2]));","\t\t\t\tval2 = sample1(loc + vec3(0.0, 0.0, +step[2]));","\t\t\t\tN[2] = val1 - val2;","\t\t\t\tval = max(max(val1, val2), val);","\t\t\t\tfloat gm = length(N); // gradient magnitude","\t\t\t\tN = normalize(N);","\t\t\t\tfloat Nselect = float(dot(N, V) > 0.0);","\t\t\t\tN = (2.0 * Nselect - 1.0) * N;\t// ==\tNselect * N - (1.0-Nselect)*N;","\t\t\t\tvec4 ambient_color = vec4(0.0, 0.0, 0.0, 0.0);","\t\t\t\tvec4 diffuse_color = vec4(0.0, 0.0, 0.0, 0.0);","\t\t\t\tvec4 specular_color = vec4(0.0, 0.0, 0.0, 0.0);","\t\t\t\tfor (int i=0; i<1; i++)","\t\t\t\t{","\t\t\t\t\t\tvec3 L = normalize(view_ray);\t//lightDirs[i];","\t\t\t\t\t\tfloat lightEnabled = float( length(L) > 0.0 );","\t\t\t\t\t\tL = normalize(L + (1.0 - lightEnabled));","\t\t\t\t\t\tfloat lambertTerm = clamp(dot(N, L), 0.0, 1.0);","\t\t\t\t\t\tvec3 H = normalize(L+V); // Halfway vector","\t\t\t\t\t\tfloat specularTerm = pow(max(dot(H, N), 0.0), shininess);","\t\t\t\t\t\tfloat mask1 = lightEnabled;","\t\t\t\t\t\tambient_color +=\tmask1 * ambient_color;\t// * gl_LightSource[i].ambient;","\t\t\t\t\t\tdiffuse_color +=\tmask1 * lambertTerm;","\t\t\t\t\t\tspecular_color += mask1 * specularTerm * specular_color;","\t\t\t\t}","\t\t\t\tvec4 final_color;","\t\t\t\tvec4 color = apply_colormap(val);","\t\t\t\tfinal_color = color * (ambient_color + diffuse_color) + specular_color;","\t\t\t\tfinal_color.a = color.a;","\t\t\t\treturn final_color;","\t\t}"].join("\n")}});
//# sourceMappingURL=../sourcemaps/shaders/VolumeShader.js.map
