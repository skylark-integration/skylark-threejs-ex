define([
    'skylark-threejs',
    '../../core/Node',
    '../../inputs/ColorNode',
    '../../inputs/FloatNode'
], function (
    THREE, 
    Node, 
    ColorNode, 
    FloatNode
) {
    'use strict';
    function PhongNode() {
        Node.call(this);
        this.color = new ColorNode(15658734);
        this.specular = new ColorNode(1118481);
        this.shininess = new FloatNode(30);
    }
    PhongNode.prototype = Object.create(Node.prototype);
    PhongNode.prototype.constructor = PhongNode;
    PhongNode.prototype.nodeType = 'Phong';
    PhongNode.prototype.build = function (builder) {
        var code;
        builder.define('PHONG');
        builder.requires.lights = true;
        if (builder.isShader('vertex')) {
            var position = this.position ? this.position.analyzeAndFlow(builder, 'v3', { cache: 'position' }) : undefined;
            builder.mergeUniform(THREE.UniformsUtils.merge([
                THREE.UniformsLib.fog,
                THREE.UniformsLib.lights
            ]));
            builder.addParsCode([
                'varying vec3 vViewPosition;',
                '#ifndef FLAT_SHADED',
                '\tvarying vec3 vNormal;',
                '#endif',
                '#include <fog_pars_vertex>',
                '#include <morphtarget_pars_vertex>',
                '#include <skinning_pars_vertex>',
                '#include <shadowmap_pars_vertex>',
                '#include <logdepthbuf_pars_vertex>',
                '#include <clipping_planes_pars_vertex>'
            ].join('\n'));
            var output = [
                '#include <beginnormal_vertex>',
                '#include <morphnormal_vertex>',
                '#include <skinbase_vertex>',
                '#include <skinnormal_vertex>',
                '#include <defaultnormal_vertex>',
                '#ifndef FLAT_SHADED',
                '\tvNormal = normalize( transformedNormal );',
                '#endif',
                '#include <begin_vertex>'
            ];
            if (position) {
                output.push(position.code, position.result ? 'transformed = ' + position.result + ';' : '');
            }
            output.push('\t#include <morphtarget_vertex>', '\t#include <skinning_vertex>', '\t#include <project_vertex>', '\t#include <fog_vertex>', '\t#include <logdepthbuf_vertex>', '\t#include <clipping_planes_vertex>', '\tvViewPosition = - mvPosition.xyz;', '\t#include <worldpos_vertex>', '\t#include <shadowmap_vertex>', '\t#include <fog_vertex>');
            code = output.join('\n');
        } else {
            if (this.mask)
                this.mask.analyze(builder);
            this.color.analyze(builder, { slot: 'color' });
            this.specular.analyze(builder);
            this.shininess.analyze(builder);
            if (this.alpha)
                this.alpha.analyze(builder);
            if (this.normal)
                this.normal.analyze(builder);
            if (this.light)
                this.light.analyze(builder, { cache: 'light' });
            if (this.ao)
                this.ao.analyze(builder);
            if (this.ambient)
                this.ambient.analyze(builder);
            if (this.shadow)
                this.shadow.analyze(builder);
            if (this.emissive)
                this.emissive.analyze(builder, { slot: 'emissive' });
            if (this.environment)
                this.environment.analyze(builder, { slot: 'environment' });
            if (this.environmentAlpha && this.environment)
                this.environmentAlpha.analyze(builder);
            var mask = this.mask ? this.mask.flow(builder, 'b') : undefined;
            var color = this.color.flow(builder, 'c', { slot: 'color' });
            var specular = this.specular.flow(builder, 'c');
            var shininess = this.shininess.flow(builder, 'f');
            var alpha = this.alpha ? this.alpha.flow(builder, 'f') : undefined;
            var normal = this.normal ? this.normal.flow(builder, 'v3') : undefined;
            var light = this.light ? this.light.flow(builder, 'v3', { cache: 'light' }) : undefined;
            var ao = this.ao ? this.ao.flow(builder, 'f') : undefined;
            var ambient = this.ambient ? this.ambient.flow(builder, 'c') : undefined;
            var shadow = this.shadow ? this.shadow.flow(builder, 'c') : undefined;
            var emissive = this.emissive ? this.emissive.flow(builder, 'c', { slot: 'emissive' }) : undefined;
            var environment = this.environment ? this.environment.flow(builder, 'c', { slot: 'environment' }) : undefined;
            var environmentAlpha = this.environmentAlpha && this.environment ? this.environmentAlpha.flow(builder, 'f') : undefined;
            builder.requires.transparent = alpha !== undefined;
            builder.addParsCode([
                '#include <fog_pars_fragment>',
                '#include <bsdfs>',
                '#include <lights_pars_begin>',
                '#include <lights_phong_pars_fragment>',
                '#include <shadowmap_pars_fragment>',
                '#include <logdepthbuf_pars_fragment>'
            ].join('\n'));
            var output = [
                '#include <normal_fragment_begin>',
                '\tBlinnPhongMaterial material;'
            ];
            if (mask) {
                output.push(mask.code, 'if ( ! ' + mask.result + ' ) discard;');
            }
            output.push(color.code, '\tvec3 diffuseColor = ' + color.result + ';', '\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );', '#include <logdepthbuf_fragment>', specular.code, '\tvec3 specular = ' + specular.result + ';', shininess.code, '\tfloat shininess = max( 0.0001, ' + shininess.result + ' );', '\tfloat specularStrength = 1.0;');
            if (alpha) {
                output.push(alpha.code, '#ifdef ALPHATEST', 'if ( ' + alpha.result + ' <= ALPHATEST ) discard;', '#endif');
            }
            if (normal) {
                output.push(normal.code, 'normal = ' + normal.result + ';');
            }
            output.push('material.diffuseColor = ' + (light ? 'vec3( 1.0 )' : 'diffuseColor') + ';');
            output.push('material.specularColor = specular;', 'material.specularShininess = shininess;', 'material.specularStrength = specularStrength;', '#include <lights_fragment_begin>', '#include <lights_fragment_end>');
            if (light) {
                output.push(light.code, 'reflectedLight.directDiffuse = ' + light.result + ';');
                output.push('reflectedLight.directDiffuse *= diffuseColor;', 'reflectedLight.indirectDiffuse *= diffuseColor;');
            }
            if (ao) {
                output.push(ao.code, 'reflectedLight.indirectDiffuse *= ' + ao.result + ';');
            }
            if (ambient) {
                output.push(ambient.code, 'reflectedLight.indirectDiffuse += ' + ambient.result + ';');
            }
            if (shadow) {
                output.push(shadow.code, 'reflectedLight.directDiffuse *= ' + shadow.result + ';', 'reflectedLight.directSpecular *= ' + shadow.result + ';');
            }
            if (emissive) {
                output.push(emissive.code, 'reflectedLight.directDiffuse += ' + emissive.result + ';');
            }
            output.push('vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular;');
            if (environment) {
                output.push(environment.code);
                if (environmentAlpha) {
                    output.push(environmentAlpha.code, 'outgoingLight = mix( outgoingLight, ' + environment.result + ', ' + environmentAlpha.result + ' );');
                } else {
                    output.push('outgoingLight = ' + environment.result + ';');
                }
            }
            if (alpha) {
                output.push('gl_FragColor = vec4( outgoingLight, ' + alpha.result + ' );');
            } else {
                output.push('gl_FragColor = vec4( outgoingLight, 1.0 );');
            }
            output.push('#include <tonemapping_fragment>', '#include <encodings_fragment>', '#include <fog_fragment>', '#include <premultiplied_alpha_fragment>');
            code = output.join('\n');
        }
        return code;
    };
    PhongNode.prototype.copy = function (source) {
        Node.prototype.copy.call(this, source);
        if (source.position)
            this.position = source.position;
        this.color = source.color;
        this.specular = source.specular;
        this.shininess = source.shininess;
        if (source.mask)
            this.mask = source.mask;
        if (source.alpha)
            this.alpha = source.alpha;
        if (source.normal)
            this.normal = source.normal;
        if (source.light)
            this.light = source.light;
        if (source.shadow)
            this.shadow = source.shadow;
        if (source.ao)
            this.ao = source.ao;
        if (source.emissive)
            this.emissive = source.emissive;
        if (source.ambient)
            this.ambient = source.ambient;
        if (source.environment)
            this.environment = source.environment;
        if (source.environmentAlpha)
            this.environmentAlpha = source.environmentAlpha;
        return this;
    };
    PhongNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            if (this.position)
                data.position = this.position.toJSON(meta).uuid;
            data.color = this.color.toJSON(meta).uuid;
            data.specular = this.specular.toJSON(meta).uuid;
            data.shininess = this.shininess.toJSON(meta).uuid;
            if (this.mask)
                data.mask = this.mask.toJSON(meta).uuid;
            if (this.alpha)
                data.alpha = this.alpha.toJSON(meta).uuid;
            if (this.normal)
                data.normal = this.normal.toJSON(meta).uuid;
            if (this.light)
                data.light = this.light.toJSON(meta).uuid;
            if (this.ao)
                data.ao = this.ao.toJSON(meta).uuid;
            if (this.ambient)
                data.ambient = this.ambient.toJSON(meta).uuid;
            if (this.shadow)
                data.shadow = this.shadow.toJSON(meta).uuid;
            if (this.emissive)
                data.emissive = this.emissive.toJSON(meta).uuid;
            if (this.environment)
                data.environment = this.environment.toJSON(meta).uuid;
            if (this.environmentAlpha)
                data.environmentAlpha = this.environmentAlpha.toJSON(meta).uuid;
        }
        return data;
    };
    return PhongNode;
});