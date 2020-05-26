define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var Lensflare = function () {
        THREE.Mesh.call(this, Lensflare.Geometry, new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true
        }));
        this.type = 'Lensflare';
        this.frustumCulled = false;
        this.renderOrder = Infinity;
        var positionScreen = new THREE.Vector3();
        var positionView = new THREE.Vector3();
        var tempMap = new THREE.DataTexture(new Uint8Array(16 * 16 * 3), 16, 16, THREE.RGBFormat);
        tempMap.minFilter = THREE.NearestFilter;
        tempMap.magFilter = THREE.NearestFilter;
        tempMap.wrapS = THREE.ClampToEdgeWrapping;
        tempMap.wrapT = THREE.ClampToEdgeWrapping;
        var occlusionMap = new THREE.DataTexture(new Uint8Array(16 * 16 * 3), 16, 16, THREE.RGBFormat);
        occlusionMap.minFilter = THREE.NearestFilter;
        occlusionMap.magFilter = THREE.NearestFilter;
        occlusionMap.wrapS = THREE.ClampToEdgeWrapping;
        occlusionMap.wrapT = THREE.ClampToEdgeWrapping;
        var geometry = Lensflare.Geometry;
        var material1a = new THREE.RawShaderMaterial({
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
                '\tgl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'precision highp float;',
                'void main() {',
                '\tgl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );',
                '}'
            ].join('\n'),
            depthTest: true,
            depthWrite: false,
            transparent: false
        });
        var material1b = new THREE.RawShaderMaterial({
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
                '\tvUV = uv;',
                '\tgl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'precision highp float;',
                'uniform sampler2D map;',
                'varying vec2 vUV;',
                'void main() {',
                '\tgl_FragColor = texture2D( map, vUV );',
                '}'
            ].join('\n'),
            depthTest: false,
            depthWrite: false,
            transparent: false
        });
        var mesh1 = new THREE.Mesh(geometry, material1a);
        var elements = [];
        var shader = LensflareElement.Shader;
        var material2 = new THREE.RawShaderMaterial({
            uniforms: {
                'map': { value: null },
                'occlusionMap': { value: occlusionMap },
                'color': { value: new THREE.Color(16777215) },
                'scale': { value: new THREE.Vector2() },
                'screenPosition': { value: new THREE.Vector3() }
            },
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        var mesh2 = new THREE.Mesh(geometry, material2);
        this.addElement = function (element) {
            elements.push(element);
        };
        var scale = new THREE.Vector2();
        var screenPositionPixels = new THREE.Vector2();
        var validArea = new THREE.Box2();
        var viewport = new THREE.Vector4();
        this.onBeforeRender = function (renderer, scene, camera) {
            renderer.getCurrentViewport(viewport);
            var invAspect = viewport.w / viewport.z;
            var halfViewportWidth = viewport.z / 2;
            var halfViewportHeight = viewport.w / 2;
            var size = 16 / viewport.w;
            scale.set(size * invAspect, size);
            validArea.min.set(viewport.x, viewport.y);
            validArea.max.set(viewport.x + (viewport.z - 16), viewport.y + (viewport.w - 16));
            positionView.setFromMatrixPosition(this.matrixWorld);
            positionView.applyMatrix4(camera.matrixWorldInverse);
            if (positionView.z > 0)
                return;
            positionScreen.copy(positionView).applyMatrix4(camera.projectionMatrix);
            screenPositionPixels.x = viewport.x + positionScreen.x * halfViewportWidth + halfViewportWidth - 8;
            screenPositionPixels.y = viewport.y + positionScreen.y * halfViewportHeight + halfViewportHeight - 8;
            if (validArea.containsPoint(screenPositionPixels)) {
                renderer.copyFramebufferToTexture(screenPositionPixels, tempMap);
                var uniforms = material1a.uniforms;
                uniforms['scale'].value = scale;
                uniforms['screenPosition'].value = positionScreen;
                renderer.renderBufferDirect(camera, null, geometry, material1a, mesh1, null);
                renderer.copyFramebufferToTexture(screenPositionPixels, occlusionMap);
                var uniforms = material1b.uniforms;
                uniforms['scale'].value = scale;
                uniforms['screenPosition'].value = positionScreen;
                renderer.renderBufferDirect(camera, null, geometry, material1b, mesh1, null);
                var vecX = -positionScreen.x * 2;
                var vecY = -positionScreen.y * 2;
                for (var i = 0, l = elements.length; i < l; i++) {
                    var element = elements[i];
                    var uniforms = material2.uniforms;
                    uniforms['color'].value.copy(element.color);
                    uniforms['map'].value = element.texture;
                    uniforms['screenPosition'].value.x = positionScreen.x + vecX * element.distance;
                    uniforms['screenPosition'].value.y = positionScreen.y + vecY * element.distance;
                    var size = element.size / viewport.w;
                    var invAspect = viewport.w / viewport.z;
                    uniforms['scale'].value.set(size * invAspect, size);
                    material2.uniformsNeedUpdate = true;
                    renderer.renderBufferDirect(camera, null, geometry, material2, mesh2, null);
                }
            }
        };
        this.dispose = function () {
            material1a.dispose();
            material1b.dispose();
            material2.dispose();
            tempMap.dispose();
            occlusionMap.dispose();
            for (var i = 0, l = elements.length; i < l; i++) {
                elements[i].texture.dispose();
            }
        };
    };
    Lensflare.prototype = Object.create(THREE.Mesh.prototype);
    Lensflare.prototype.constructor = Lensflare;
    Lensflare.prototype.isLensflare = true;

    return threex.objects.Lensflare = Lensflare;
});