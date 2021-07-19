define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var Refractor = function (geometry, options) {
        THREE.Mesh.call(this, geometry);
        this.type = 'Refractor';
        var scope = this;
        options = options || {};
        var color = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(8355711);
        var textureWidth = options.textureWidth || 512;
        var textureHeight = options.textureHeight || 512;
        var clipBias = options.clipBias || 0;
        var shader = options.shader || Refractor.RefractorShader;
        var encoding = options.encoding !== undefined ? options.encoding : THREE.LinearEncoding;
        var virtualCamera = new THREE.PerspectiveCamera();
        virtualCamera.matrixAutoUpdate = false;
        virtualCamera.userData.refractor = true;
        var refractorPlane = new THREE.Plane();
        var textureMatrix = new THREE.Matrix4();
        var parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false,
            encoding: encoding
        };
        var renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight, parameters);
        if (!THREE.MathUtils.isPowerOfTwo(textureWidth) || !THREE.MathUtils.isPowerOfTwo(textureHeight)) {
            renderTarget.texture.generateMipmaps = false;
        }
        this.material = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(shader.uniforms),
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            transparent: true
        });
        this.material.uniforms['color'].value = color;
        this.material.uniforms['tDiffuse'].value = renderTarget.texture;
        this.material.uniforms['textureMatrix'].value = textureMatrix;
        var visible = function () {
            var refractorWorldPosition = new THREE.Vector3();
            var cameraWorldPosition = new THREE.Vector3();
            var rotationMatrix = new THREE.Matrix4();
            var view = new THREE.Vector3();
            var normal = new THREE.Vector3();
            return function visible(camera) {
                refractorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
                cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
                view.subVectors(refractorWorldPosition, cameraWorldPosition);
                rotationMatrix.extractRotation(scope.matrixWorld);
                normal.set(0, 0, 1);
                normal.applyMatrix4(rotationMatrix);
                return view.dot(normal) < 0;
            };
        }();
        var updateRefractorPlane = function () {
            var normal = new THREE.Vector3();
            var position = new THREE.Vector3();
            var quaternion = new THREE.Quaternion();
            var scale = new THREE.Vector3();
            return function updateRefractorPlane() {
                scope.matrixWorld.decompose(position, quaternion, scale);
                normal.set(0, 0, 1).applyQuaternion(quaternion).normalize();
                normal.negate();
                refractorPlane.setFromNormalAndCoplanarPoint(normal, position);
            };
        }();
        var updateVirtualCamera = function () {
            var clipPlane = new THREE.Plane();
            var clipVector = new THREE.Vector4();
            var q = new THREE.Vector4();
            return function updateVirtualCamera(camera) {
                virtualCamera.matrixWorld.copy(camera.matrixWorld);
                virtualCamera.matrixWorldInverse.getInverse(virtualCamera.matrixWorld);
                virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
                virtualCamera.far = camera.far;
                clipPlane.copy(refractorPlane);
                clipPlane.applyMatrix4(virtualCamera.matrixWorldInverse);
                clipVector.set(clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant);
                var projectionMatrix = virtualCamera.projectionMatrix;
                q.x = (Math.sign(clipVector.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
                q.y = (Math.sign(clipVector.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
                q.z = -1;
                q.w = (1 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];
                clipVector.multiplyScalar(2 / clipVector.dot(q));
                projectionMatrix.elements[2] = clipVector.x;
                projectionMatrix.elements[6] = clipVector.y;
                projectionMatrix.elements[10] = clipVector.z + 1 - clipBias;
                projectionMatrix.elements[14] = clipVector.w;
            };
        }();
        function updateTextureMatrix(camera) {
            textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
            textureMatrix.multiply(camera.projectionMatrix);
            textureMatrix.multiply(camera.matrixWorldInverse);
            textureMatrix.multiply(scope.matrixWorld);
        }
        function render(renderer, scene, camera) {
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
        }
        this.onBeforeRender = function (renderer, scene, camera) {
            if (camera.userData.refractor === true)
                return;
            if (!visible(camera) === true)
                return;
            updateRefractorPlane();
            updateTextureMatrix(camera);
            updateVirtualCamera(camera);
            render(renderer, scene, camera);
        };
        this.getRenderTarget = function () {
            return renderTarget;
        };
    };
    Refractor.prototype = Object.create(THREE.Mesh.prototype);
    Refractor.prototype.constructor = Refractor;
    Refractor.RefractorShader = {
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
    return threex.objects.Refractor = Refractor;
});