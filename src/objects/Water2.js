define([
    "skylark-threejs",
    '../objects/Reflector',
    '../objects/Refractor'
], function (
    THREE, 
    Reflector, 
    Refractor
) {
    'use strict';
    var Water = function (geometry, options) {
        THREE.Mesh.call(this, geometry);
        this.type = 'Water';
        var scope = this;
        options = options || {};
        var color = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(16777215);
        var textureWidth = options.textureWidth || 512;
        var textureHeight = options.textureHeight || 512;
        var clipBias = options.clipBias || 0;
        var flowDirection = options.flowDirection || new THREE.Vector2(1, 0);
        var flowSpeed = options.flowSpeed || 0.03;
        var reflectivity = options.reflectivity || 0.02;
        var scale = options.scale || 1;
        var shader = options.shader || Water.WaterShader;
        var encoding = options.encoding !== undefined ? options.encoding : THREE.LinearEncoding;
        var textureLoader = new THREE.TextureLoader();
        var flowMap = options.flowMap || undefined;
        var normalMap0 = options.normalMap0 || textureLoader.load('textures/water/Water_1_M_Normal.jpg');
        var normalMap1 = options.normalMap1 || textureLoader.load('textures/water/Water_2_M_Normal.jpg');
        var cycle = 0.15;
        var halfCycle = cycle * 0.5;
        var textureMatrix = new THREE.Matrix4();
        var clock = new THREE.Clock();
        if (Reflector === undefined) {
            console.error('THREE.Water: Required component Reflector not found.');
            return;
        }
        if (Refractor === undefined) {
            console.error('THREE.Water: Required component Refractor not found.');
            return;
        }
        var reflector = new Reflector(geometry, {
            textureWidth: textureWidth,
            textureHeight: textureHeight,
            clipBias: clipBias,
            encoding: encoding
        });
        var refractor = new Refractor(geometry, {
            textureWidth: textureWidth,
            textureHeight: textureHeight,
            clipBias: clipBias,
            encoding: encoding
        });
        reflector.matrixAutoUpdate = false;
        refractor.matrixAutoUpdate = false;
        this.material = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib['fog'],
                shader.uniforms
            ]),
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            transparent: true,
            fog: true
        });
        if (flowMap !== undefined) {
            this.material.defines.USE_FLOWMAP = '';
            this.material.uniforms['tFlowMap'] = {
                type: 't',
                value: flowMap
            };
        } else {
            this.material.uniforms['flowDirection'] = {
                type: 'v2',
                value: flowDirection
            };
        }
        normalMap0.wrapS = normalMap0.wrapT = THREE.RepeatWrapping;
        normalMap1.wrapS = normalMap1.wrapT = THREE.RepeatWrapping;
        this.material.uniforms['tReflectionMap'].value = reflector.getRenderTarget().texture;
        this.material.uniforms['tRefractionMap'].value = refractor.getRenderTarget().texture;
        this.material.uniforms['tNormalMap0'].value = normalMap0;
        this.material.uniforms['tNormalMap1'].value = normalMap1;
        this.material.uniforms['color'].value = color;
        this.material.uniforms['reflectivity'].value = reflectivity;
        this.material.uniforms['textureMatrix'].value = textureMatrix;
        this.material.uniforms['config'].value.x = 0;
        this.material.uniforms['config'].value.y = halfCycle;
        this.material.uniforms['config'].value.z = halfCycle;
        this.material.uniforms['config'].value.w = scale;
        function updateTextureMatrix(camera) {
            textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
            textureMatrix.multiply(camera.projectionMatrix);
            textureMatrix.multiply(camera.matrixWorldInverse);
            textureMatrix.multiply(scope.matrixWorld);
        }
        function updateFlow() {
            var delta = clock.getDelta();
            var config = scope.material.uniforms['config'];
            config.value.x += flowSpeed * delta;
            config.value.y = config.value.x + halfCycle;
            if (config.value.x >= cycle) {
                config.value.x = 0;
                config.value.y = halfCycle;
            } else if (config.value.y >= cycle) {
                config.value.y = config.value.y - cycle;
            }
        }
        this.onBeforeRender = function (renderer, scene, camera) {
            updateTextureMatrix(camera);
            updateFlow();
            scope.visible = false;
            reflector.matrixWorld.copy(scope.matrixWorld);
            refractor.matrixWorld.copy(scope.matrixWorld);
            reflector.onBeforeRender(renderer, scene, camera);
            refractor.onBeforeRender(renderer, scene, camera);
            scope.visible = true;
        };
    };
    Water.prototype = Object.create(THREE.Mesh.prototype);
    Water.prototype.constructor = Water;
    Water.WaterShader = {
        uniforms: {
            'color': {
                type: 'c',
                value: null
            },
            'reflectivity': {
                type: 'f',
                value: 0
            },
            'tReflectionMap': {
                type: 't',
                value: null
            },
            'tRefractionMap': {
                type: 't',
                value: null
            },
            'tNormalMap0': {
                type: 't',
                value: null
            },
            'tNormalMap1': {
                type: 't',
                value: null
            },
            'textureMatrix': {
                type: 'm4',
                value: null
            },
            'config': {
                type: 'v4',
                value: new THREE.Vector4()
            }
        },
        vertexShader: [
            '#include <common>',
            '#include <fog_pars_vertex>',
            '#include <logdepthbuf_pars_vertex>',
            'uniform mat4 textureMatrix;',
            'varying vec4 vCoord;',
            'varying vec2 vUv;',
            'varying vec3 vToEye;',
            'void main() {',
            '\tvUv = uv;',
            '\tvCoord = textureMatrix * vec4( position, 1.0 );',
            '\tvec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
            '\tvToEye = cameraPosition - worldPosition.xyz;',
            '\tvec4 mvPosition =  viewMatrix * worldPosition;',
            '\tgl_Position = projectionMatrix * mvPosition;',
            '\t#include <logdepthbuf_vertex>',
            '\t#include <fog_vertex>',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#include <common>',
            '#include <fog_pars_fragment>',
            '#include <logdepthbuf_pars_fragment>',
            'uniform sampler2D tReflectionMap;',
            'uniform sampler2D tRefractionMap;',
            'uniform sampler2D tNormalMap0;',
            'uniform sampler2D tNormalMap1;',
            '#ifdef USE_FLOWMAP',
            '\tuniform sampler2D tFlowMap;',
            '#else',
            '\tuniform vec2 flowDirection;',
            '#endif',
            'uniform vec3 color;',
            'uniform float reflectivity;',
            'uniform vec4 config;',
            'varying vec4 vCoord;',
            'varying vec2 vUv;',
            'varying vec3 vToEye;',
            'void main() {',
            '\t#include <logdepthbuf_fragment>',
            '\tfloat flowMapOffset0 = config.x;',
            '\tfloat flowMapOffset1 = config.y;',
            '\tfloat halfCycle = config.z;',
            '\tfloat scale = config.w;',
            '\tvec3 toEye = normalize( vToEye );',
            '\tvec2 flow;',
            '\t#ifdef USE_FLOWMAP',
            '\t\tflow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;',
            '\t#else',
            '\t\tflow = flowDirection;',
            '\t#endif',
            '\tflow.x *= - 1.0;',
            '\tvec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );',
            '\tvec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );',
            '\tfloat flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;',
            '\tvec4 normalColor = mix( normalColor0, normalColor1, flowLerp );',
            '\tvec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );',
            '\tfloat theta = max( dot( toEye, normal ), 0.0 );',
            '\tfloat reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );',
            '\tvec3 coord = vCoord.xyz / vCoord.w;',
            '\tvec2 uv = coord.xy + coord.z * normal.xz * 0.05;',
            '\tvec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );',
            '\tvec4 refractColor = texture2D( tRefractionMap, uv );',
            '\tgl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );',
            '\t#include <tonemapping_fragment>',
            '\t#include <encodings_fragment>',
            '\t#include <fog_fragment>',
            '}'
        ].join('\n')
    };
    return Water;
});