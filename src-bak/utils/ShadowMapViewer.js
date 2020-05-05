define([
    "skylark-threejs",
    '../shaders/UnpackDepthRGBAShader.js'
], function (a, b) {
    'use strict';
    var ShadowMapViewer = function (light) {
        var scope = this;
        var doRenderLabel = light.name !== undefined && light.name !== '';
        var userAutoClearSetting;
        var frame = {
            x: 10,
            y: 10,
            width: 256,
            height: 256
        };
        var camera = new a.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 10);
        camera.position.set(0, 0, 2);
        var scene = new a.Scene();
        var shader = b.UnpackDepthRGBAShader;
        var uniforms = a.UniformsUtils.clone(shader.uniforms);
        var material = new a.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        var plane = new a.PlaneBufferGeometry(frame.width, frame.height);
        var mesh = new a.Mesh(plane, material);
        scene.add(mesh);
        var labelCanvas, labelMesh;
        if (doRenderLabel) {
            labelCanvas = document.createElement('canvas');
            var context = labelCanvas.getContext('2d');
            context.font = 'Bold 20px Arial';
            var labelWidth = context.measureText(light.name).width;
            labelCanvas.width = labelWidth;
            labelCanvas.height = 25;
            context.font = 'Bold 20px Arial';
            context.fillStyle = 'rgba( 255, 0, 0, 1 )';
            context.fillText(light.name, 0, 20);
            var labelTexture = new a.Texture(labelCanvas);
            labelTexture.magFilter = a.LinearFilter;
            labelTexture.minFilter = a.LinearFilter;
            labelTexture.needsUpdate = true;
            var labelMaterial = new a.MeshBasicMaterial({
                map: labelTexture,
                side: a.DoubleSide
            });
            labelMaterial.transparent = true;
            var labelPlane = new a.PlaneBufferGeometry(labelCanvas.width, labelCanvas.height);
            labelMesh = new a.Mesh(labelPlane, labelMaterial);
            scene.add(labelMesh);
        }
        function resetPosition() {
            scope.position.set(scope.position.x, scope.position.y);
        }
        this.enabled = true;
        this.size = {
            width: frame.width,
            height: frame.height,
            set: function (width, height) {
                this.width = width;
                this.height = height;
                mesh.scale.set(this.width / frame.width, this.height / frame.height, 1);
                resetPosition();
            }
        };
        this.position = {
            x: frame.x,
            y: frame.y,
            set: function (x, y) {
                this.x = x;
                this.y = y;
                var width = scope.size.width;
                var height = scope.size.height;
                mesh.position.set(-window.innerWidth / 2 + width / 2 + this.x, window.innerHeight / 2 - height / 2 - this.y, 0);
                if (doRenderLabel)
                    labelMesh.position.set(mesh.position.x, mesh.position.y - scope.size.height / 2 + labelCanvas.height / 2, 0);
            }
        };
        this.render = function (renderer) {
            if (this.enabled) {
                uniforms.tDiffuse.value = light.shadow.map.texture;
                userAutoClearSetting = renderer.autoClear;
                renderer.autoClear = false;
                renderer.clearDepth();
                renderer.render(scene, camera);
                renderer.autoClear = userAutoClearSetting;
            }
        };
        this.updateForWindowResize = function () {
            if (this.enabled) {
                camera.left = window.innerWidth / -2;
                camera.right = window.innerWidth / 2;
                camera.top = window.innerHeight / 2;
                camera.bottom = window.innerHeight / -2;
                camera.updateProjectionMatrix();
                this.update();
            }
        };
        this.update = function () {
            this.position.set(this.position.x, this.position.y);
            this.size.set(this.size.width, this.size.height);
        };
        this.update();
    };
    ShadowMapViewer.prototype.constructor = ShadowMapViewer;

    return ShadowMapViewer;
});