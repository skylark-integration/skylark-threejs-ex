define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var camera, scene, renderer, group;
    function init(canvas, width, height, pixelRatio, path) {
        camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
        camera.position.z = 200;
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(4473958, 100, 400);
        scene.background = new THREE.Color(4473958);
        group = new THREE.Group();
        scene.add(group);
        var loader = new THREE.ImageBitmapLoader().setPath(path);
        loader.setOptions({ imageOrientation: 'flipY' });
        loader.load('textures/matcaps/matcap-porcelain-white.jpg', function (imageBitmap) {
            var texture = new THREE.CanvasTexture(imageBitmap);
            var geometry = new THREE.IcosahedronBufferGeometry(5, 3);
            var materials = [
                new THREE.MeshMatcapMaterial({
                    color: 11150559,
                    matcap: texture
                }),
                new THREE.MeshMatcapMaterial({
                    color: 6315408,
                    matcap: texture
                }),
                new THREE.MeshMatcapMaterial({
                    color: 14699071,
                    matcap: texture
                }),
                new THREE.MeshMatcapMaterial({
                    color: 14877782,
                    matcap: texture
                })
            ];
            for (var i = 0; i < 100; i++) {
                var material = materials[i % materials.length];
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.x = random() * 200 - 100;
                mesh.position.y = random() * 200 - 100;
                mesh.position.z = random() * 200 - 100;
                mesh.scale.setScalar(random() + 1);
                group.add(mesh);
            }
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                canvas: canvas
            });
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(width, height, false);
            animate();
        });
    }
    function animate() {
        group.rotation.y = -Date.now() / 4000;
        renderer.render(scene, camera);
        if (self.requestAnimationFrame) {
            self.requestAnimationFrame(animate);
        } else {
        }
    }
    var seed = 1;
    function random() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    return threex.offscreen.scene = init;
});