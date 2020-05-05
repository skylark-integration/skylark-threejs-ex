define(["skylark-threejs"], function (a) {
    'use strict';
    var Reflector = function (geometry, options) {
        a.Mesh.call(this, geometry);
        this.type = 'Reflector';
        var scope = this;
        options = options || {};
        var color = options.color !== undefined ? new a.Color(options.color) : new a.Color(8355711);
        var textureWidth = options.textureWidth || 512;
        var textureHeight = options.textureHeight || 512;
        var clipBias = options.clipBias || 0;
        var shader = options.shader || Reflector.ReflectorShader;
        var recursion = options.recursion !== undefined ? options.recursion : 0;
        var encoding = options.encoding !== undefined ? options.encoding : a.LinearEncoding;
        var reflectorPlane = new a.Plane();
        var normal = new a.Vector3();
        var reflectorWorldPosition = new a.Vector3();
        var cameraWorldPosition = new a.Vector3();
        var rotationMatrix = new a.Matrix4();
        var lookAtPosition = new a.Vector3(0, 0, -1);
        var clipPlane = new a.Vector4();
        var view = new a.Vector3();
        var target = new a.Vector3();
        var q = new a.Vector4();
        var textureMatrix = new a.Matrix4();
        var virtualCamera = new a.PerspectiveCamera();
        var parameters = {
            minFilter: a.LinearFilter,
            magFilter: a.LinearFilter,
            format: a.RGBFormat,
            stencilBuffer: false,
            encoding: encoding
        };
        var renderTarget = new a.WebGLRenderTarget(textureWidth, textureHeight, parameters);
        if (!a.MathUtils.isPowerOfTwo(textureWidth) || !a.MathUtils.isPowerOfTwo(textureHeight)) {
            renderTarget.texture.generateMipmaps = false;
        }
        var material = new a.ShaderMaterial({
            uniforms: a.UniformsUtils.clone(shader.uniforms),
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader
        });
        material.uniforms['tDiffuse'].value = renderTarget.texture;
        material.uniforms['color'].value = color;
        material.uniforms['textureMatrix'].value = textureMatrix;
        this.material = material;
        this.onBeforeRender = function (renderer, scene, camera) {
            if ('recursion' in camera.userData) {
                if (camera.userData.recursion === recursion)
                    return;
                camera.userData.recursion++;
            }
            reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
            cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
            rotationMatrix.extractRotation(scope.matrixWorld);
            normal.set(0, 0, 1);
            normal.applyMatrix4(rotationMatrix);
            view.subVectors(reflectorWorldPosition, cameraWorldPosition);
            if (view.dot(normal) > 0)
                return;
            view.reflect(normal).negate();
            view.add(reflectorWorldPosition);
            rotationMatrix.extractRotation(camera.matrixWorld);
            lookAtPosition.set(0, 0, -1);
            lookAtPosition.applyMatrix4(rotationMatrix);
            lookAtPosition.add(cameraWorldPosition);
            target.subVectors(reflectorWorldPosition, lookAtPosition);
            target.reflect(normal).negate();
            target.add(reflectorWorldPosition);
            virtualCamera.position.copy(view);
            virtualCamera.up.set(0, 1, 0);
            virtualCamera.up.applyMatrix4(rotationMatrix);
            virtualCamera.up.reflect(normal);
            virtualCamera.lookAt(target);
            virtualCamera.far = camera.far;
            virtualCamera.updateMatrixWorld();
            virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
            virtualCamera.userData.recursion = 0;
            textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
            textureMatrix.multiply(virtualCamera.projectionMatrix);
            textureMatrix.multiply(virtualCamera.matrixWorldInverse);
            textureMatrix.multiply(scope.matrixWorld);
            reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
            reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);
            clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);
            var projectionMatrix = virtualCamera.projectionMatrix;
            q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
            q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
            q.z = -1;
            q.w = (1 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];
            clipPlane.multiplyScalar(2 / clipPlane.dot(q));
            projectionMatrix.elements[2] = clipPlane.x;
            projectionMatrix.elements[6] = clipPlane.y;
            projectionMatrix.elements[10] = clipPlane.z + 1 - clipBias;
            projectionMatrix.elements[14] = clipPlane.w;
            scope.visible = false;
            var currentRenderTarget = renderer.getRenderTarget();
            var currentXrEnabled = renderer.xr.enabled;
            var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
            renderer.xr.enabled = false;
            renderer.shadowMap.autoUpdate = false;
            renderer.setRenderTarget(renderTarget);
            if (renderer.autoClear === false)
                renderer.clear();
            renderer.render(scene, virtualCamera);
            renderer.xr.enabled = currentXrEnabled;
            renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
            renderer.setRenderTarget(currentRenderTarget);
            var viewport = camera.viewport;
            if (viewport !== undefined) {
                renderer.state.viewport(viewport);
            }
            scope.visible = true;
        };
        this.getRenderTarget = function () {
            return renderTarget;
        };
    };
    Reflector.prototype = Object.create(a.Mesh.prototype);
    Reflector.prototype.constructor = Reflector;
    Reflector.ReflectorShader = {
        uniforms: {
            'color': { value: null },
            'tDiffuse': { value: null },
            'textureMatrix': { value: null }
        },
        vertexShader: [
            'uniform mat4 textureMatrix;',
            'varying vec4 vUv;',
            'void main() {',
            '\tvUv = textureMatrix * vec4( position, 1.0 );',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 color;',
            'uniform sampler2D tDiffuse;',
            'varying vec4 vUv;',
            'float blendOverlay( float base, float blend ) {',
            '\treturn( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );',
            '}',
            'vec3 blendOverlay( vec3 base, vec3 blend ) {',
            '\treturn vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );',
            '}',
            'void main() {',
            '\tvec4 base = texture2DProj( tDiffuse, vUv );',
            '\tgl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',
            '}'
        ].join('\n')
    };

    return Reflector;
});