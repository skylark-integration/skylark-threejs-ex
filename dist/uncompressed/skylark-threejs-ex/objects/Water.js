define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var Water = function (geometry, options) {
        THREE.Mesh.call(this, geometry);
        var scope = this;
        options = options || {};
        var textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
        var textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;
        var clipBias = options.clipBias !== undefined ? options.clipBias : 0;
        var alpha = options.alpha !== undefined ? options.alpha : 1;
        var time = options.time !== undefined ? options.time : 0;
        var normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
        var sunDirection = options.sunDirection !== undefined ? options.sunDirection : new THREE.Vector3(0.70707, 0.70707, 0);
        var sunColor = new THREE.Color(options.sunColor !== undefined ? options.sunColor : 16777215);
        var waterColor = new THREE.Color(options.waterColor !== undefined ? options.waterColor : 8355711);
        var eye = options.eye !== undefined ? options.eye : new THREE.Vector3(0, 0, 0);
        var distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20;
        var side = options.side !== undefined ? options.side : THREE.FrontSide;
        var fog = options.fog !== undefined ? options.fog : false;
        var mirrorPlane = new THREE.Plane();
        var normal = new THREE.Vector3();
        var mirrorWorldPosition = new THREE.Vector3();
        var cameraWorldPosition = new THREE.Vector3();
        var rotationMatrix = new THREE.Matrix4();
        var lookAtPosition = new THREE.Vector3(0, 0, -1);
        var clipPlane = new THREE.Vector4();
        var view = new THREE.Vector3();
        var target = new THREE.Vector3();
        var q = new THREE.Vector4();
        var textureMatrix = new THREE.Matrix4();
        var mirrorCamera = new THREE.PerspectiveCamera();
        var parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };
        var renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight, parameters);
        if (!THREE.MathUtils.isPowerOfTwo(textureWidth) || !THREE.MathUtils.isPowerOfTwo(textureHeight)) {
            renderTarget.texture.generateMipmaps = false;
        }
        var mirrorShader = {
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib['fog'],
                THREE.UniformsLib['lights'],
                {
                    'normalSampler': { value: null },
                    'mirrorSampler': { value: null },
                    'alpha': { value: 1 },
                    'time': { value: 0 },
                    'size': { value: 1 },
                    'distortionScale': { value: 20 },
                    'textureMatrix': { value: new THREE.Matrix4() },
                    'sunColor': { value: new THREE.Color(8355711) },
                    'sunDirection': { value: new THREE.Vector3(0.70707, 0.70707, 0) },
                    'eye': { value: new THREE.Vector3() },
                    'waterColor': { value: new THREE.Color(5592405) }
                }
            ]),
            vertexShader: [
                'uniform mat4 textureMatrix;',
                'uniform float time;',
                'varying vec4 mirrorCoord;',
                'varying vec4 worldPosition;',
                '#include <common>',
                '#include <fog_pars_vertex>',
                '#include <shadowmap_pars_vertex>',
                '#include <logdepthbuf_pars_vertex>',
                'void main() {',
                '\tmirrorCoord = modelMatrix * vec4( position, 1.0 );',
                '\tworldPosition = mirrorCoord.xyzw;',
                '\tmirrorCoord = textureMatrix * mirrorCoord;',
                '\tvec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );',
                '\tgl_Position = projectionMatrix * mvPosition;',
                '#include <logdepthbuf_vertex>',
                '#include <fog_vertex>',
                '#include <shadowmap_vertex>',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D mirrorSampler;',
                'uniform float alpha;',
                'uniform float time;',
                'uniform float size;',
                'uniform float distortionScale;',
                'uniform sampler2D normalSampler;',
                'uniform vec3 sunColor;',
                'uniform vec3 sunDirection;',
                'uniform vec3 eye;',
                'uniform vec3 waterColor;',
                'varying vec4 mirrorCoord;',
                'varying vec4 worldPosition;',
                'vec4 getNoise( vec2 uv ) {',
                '\tvec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);',
                '\tvec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );',
                '\tvec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );',
                '\tvec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );',
                '\tvec4 noise = texture2D( normalSampler, uv0 ) +',
                '\t\ttexture2D( normalSampler, uv1 ) +',
                '\t\ttexture2D( normalSampler, uv2 ) +',
                '\t\ttexture2D( normalSampler, uv3 );',
                '\treturn noise * 0.5 - 1.0;',
                '}',
                'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {',
                '\tvec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
                '\tfloat direction = max( 0.0, dot( eyeDirection, reflection ) );',
                '\tspecularColor += pow( direction, shiny ) * sunColor * spec;',
                '\tdiffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
                '}',
                '#include <common>',
                '#include <packing>',
                '#include <bsdfs>',
                '#include <fog_pars_fragment>',
                '#include <logdepthbuf_pars_fragment>',
                '#include <lights_pars_begin>',
                '#include <shadowmap_pars_fragment>',
                '#include <shadowmask_pars_fragment>',
                'void main() {',
                '#include <logdepthbuf_fragment>',
                '\tvec4 noise = getNoise( worldPosition.xz * size );',
                '\tvec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',
                '\tvec3 diffuseLight = vec3(0.0);',
                '\tvec3 specularLight = vec3(0.0);',
                '\tvec3 worldToEye = eye-worldPosition.xyz;',
                '\tvec3 eyeDirection = normalize( worldToEye );',
                '\tsunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',
                '\tfloat distance = length(worldToEye);',
                '\tvec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
                '\tvec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );',
                '\tfloat theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
                '\tfloat rf0 = 0.3;',
                '\tfloat reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
                '\tvec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
                '\tvec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);',
                '\tvec3 outgoingLight = albedo;',
                '\tgl_FragColor = vec4( outgoingLight, alpha );',
                '#include <tonemapping_fragment>',
                '#include <fog_fragment>',
                '}'
            ].join('\n')
        };
        var material = new THREE.ShaderMaterial({
            fragmentShader: mirrorShader.fragmentShader,
            vertexShader: mirrorShader.vertexShader,
            uniforms: THREE.UniformsUtils.clone(mirrorShader.uniforms),
            lights: true,
            side: side,
            fog: fog
        });
        material.uniforms['mirrorSampler'].value = renderTarget.texture;
        material.uniforms['textureMatrix'].value = textureMatrix;
        material.uniforms['alpha'].value = alpha;
        material.uniforms['time'].value = time;
        material.uniforms['normalSampler'].value = normalSampler;
        material.uniforms['sunColor'].value = sunColor;
        material.uniforms['waterColor'].value = waterColor;
        material.uniforms['sunDirection'].value = sunDirection;
        material.uniforms['distortionScale'].value = distortionScale;
        material.uniforms['eye'].value = eye;
        scope.material = material;
        scope.onBeforeRender = function (renderer, scene, camera) {
            mirrorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
            cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
            rotationMatrix.extractRotation(scope.matrixWorld);
            normal.set(0, 0, 1);
            normal.applyMatrix4(rotationMatrix);
            view.subVectors(mirrorWorldPosition, cameraWorldPosition);
            if (view.dot(normal) > 0)
                return;
            view.reflect(normal).negate();
            view.add(mirrorWorldPosition);
            rotationMatrix.extractRotation(camera.matrixWorld);
            lookAtPosition.set(0, 0, -1);
            lookAtPosition.applyMatrix4(rotationMatrix);
            lookAtPosition.add(cameraWorldPosition);
            target.subVectors(mirrorWorldPosition, lookAtPosition);
            target.reflect(normal).negate();
            target.add(mirrorWorldPosition);
            mirrorCamera.position.copy(view);
            mirrorCamera.up.set(0, 1, 0);
            mirrorCamera.up.applyMatrix4(rotationMatrix);
            mirrorCamera.up.reflect(normal);
            mirrorCamera.lookAt(target);
            mirrorCamera.far = camera.far;
            mirrorCamera.updateMatrixWorld();
            mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);
            textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
            textureMatrix.multiply(mirrorCamera.projectionMatrix);
            textureMatrix.multiply(mirrorCamera.matrixWorldInverse);
            mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorldPosition);
            mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse);
            clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant);
            var projectionMatrix = mirrorCamera.projectionMatrix;
            q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
            q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
            q.z = -1;
            q.w = (1 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];
            clipPlane.multiplyScalar(2 / clipPlane.dot(q));
            projectionMatrix.elements[2] = clipPlane.x;
            projectionMatrix.elements[6] = clipPlane.y;
            projectionMatrix.elements[10] = clipPlane.z + 1 - clipBias;
            projectionMatrix.elements[14] = clipPlane.w;
            eye.setFromMatrixPosition(camera.matrixWorld);
            var currentRenderTarget = renderer.getRenderTarget();
            var currentXrEnabled = renderer.xr.enabled;
            var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
            scope.visible = false;
            renderer.xr.enabled = false;
            renderer.shadowMap.autoUpdate = false;
            renderer.setRenderTarget(renderTarget);
            if (renderer.autoClear === false)
                renderer.clear();
            renderer.render(scene, mirrorCamera);
            scope.visible = true;
            renderer.xr.enabled = currentXrEnabled;
            renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
            renderer.setRenderTarget(currentRenderTarget);
            var viewport = camera.viewport;
            if (viewport !== undefined) {
                renderer.state.viewport(viewport);
            }
        };
    };
    Water.prototype = Object.create(THREE.Mesh.prototype);
    Water.prototype.constructor = Water;

    return threex.objects.Water = Water;
});