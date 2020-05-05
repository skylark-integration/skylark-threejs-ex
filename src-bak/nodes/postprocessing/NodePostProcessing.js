define([
    "skylark-threejs",
    '../materials/NodeMaterial.js',
    '../inputs/ScreenNode.js'
], function (a, b, c) {
    'use strict';
    function NodePostProcessing(renderer, renderTarget) {
        if (renderTarget === undefined) {
            var parameters = {
                minFilter: a.LinearFilter,
                magFilter: a.LinearFilter,
                format: a.RGBAFormat,
                stencilBuffer: false
            };
            var size = renderer.getDrawingBufferSize(new a.Vector2());
            renderTarget = new a.WebGLRenderTarget(size.width, size.height, parameters);
        }
        this.renderer = renderer;
        this.renderTarget = renderTarget;
        this.output = new c.ScreenNode();
        this.material = new b.NodeMaterial();
        this.camera = new a.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new a.Scene();
        this.quad = new a.Mesh(new a.PlaneBufferGeometry(2, 2), this.material);
        this.quad.frustumCulled = false;
        this.scene.add(this.quad);
        this.needsUpdate = true;
    }
    NodePostProcessing.prototype = {
        constructor: NodePostProcessing,
        render: function (scene, camera, frame) {
            if (this.needsUpdate) {
                this.material.dispose();
                this.material.fragment.value = this.output;
                this.material.build();
                if (this.material.uniforms.renderTexture) {
                    this.material.uniforms.renderTexture.value = this.renderTarget.texture;
                }
                this.needsUpdate = false;
            }
            frame.setRenderer(this.renderer).setRenderTexture(this.renderTarget.texture);
            this.renderer.setRenderTarget(this.renderTarget);
            this.renderer.render(scene, camera);
            frame.updateNode(this.material);
            this.renderer.setRenderTarget(null);
            this.renderer.render(this.scene, this.camera);
        },
        setPixelRatio: function (value) {
            this.renderer.setPixelRatio(value);
            var size = this.renderer.getSize(new a.Vector2());
            this.setSize(size.width, size.height);
        },
        setSize: function (width, height) {
            var pixelRatio = this.renderer.getPixelRatio();
            this.renderTarget.setSize(width * pixelRatio, height * pixelRatio);
            this.renderer.setSize(width, height);
        },
        copy: function (source) {
            this.output = source.output;
            return this;
        },
        toJSON: function (meta) {
            var isRootObject = meta === undefined || typeof meta === 'string';
            if (isRootObject) {
                meta = { nodes: {} };
            }
            if (meta && !meta.post)
                meta.post = {};
            if (!meta.post[this.uuid]) {
                var data = {};
                data.uuid = this.uuid;
                data.type = 'NodePostProcessing';
                meta.post[this.uuid] = data;
                if (this.name !== '')
                    data.name = this.name;
                if (JSON.stringify(this.userData) !== '{}')
                    data.userData = this.userData;
                data.output = this.output.toJSON(meta).uuid;
            }
            meta.post = this.uuid;
            return meta;
        }
    };
    return NodePostProcessing;
});