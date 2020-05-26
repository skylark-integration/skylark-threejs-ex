define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    function Pass() {
        this.enabled = true;
        this.needsSwap = true;
        this.clear = false;
        this.renderToScreen = false;
    }
    Object.assign(Pass.prototype, {
        setSize: function () {
        },
        render: function () {
            console.error('THREE.Pass: .render() must be implemented in derived pass.');
        }
    });
    Pass.FullScreenQuad = function () {
        var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        var geometry = new THREE.PlaneBufferGeometry(2, 2);
        var FullScreenQuad = function (material) {
            this._mesh = new THREE.Mesh(geometry, material);
        };
        Object.defineProperty(FullScreenQuad.prototype, 'material', {
            get: function () {
                return this._mesh.material;
            },
            set: function (value) {
                this._mesh.material = value;
            }
        });
        Object.assign(FullScreenQuad.prototype, {
            dispose: function () {
                this._mesh.geometry.dispose();
            },
            render: function (renderer) {
                renderer.render(this._mesh, camera);
            }
        });
        return FullScreenQuad;
    }();

    return threex.postprocessing.Pass = Pass;
});