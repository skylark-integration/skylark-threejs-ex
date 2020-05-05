define([
    "skylark-threejs",
    '../core/NodeBuilder.js',
    '../materials/NodeMaterial.js',
    './TextureNode.js'
], function (a, b, c, d) {
    'use strict';
    function RTTNode(width, height, input, options) {
        options = options || {};
        this.input = input;
        this.clear = options.clear !== undefined ? options.clear : true;
        this.renderTarget = new a.WebGLRenderTarget(width, height, options);
        this.material = new c.NodeMaterial();
        this.camera = new a.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new a.Scene();
        this.quad = new a.Mesh(new a.PlaneBufferGeometry(2, 2), this.material);
        this.quad.frustumCulled = false;
        this.scene.add(this.quad);
        this.render = true;
        d.TextureNode.call(this, this.renderTarget.texture);
    }
    RTTNode.prototype = Object.create(d.TextureNode.prototype);
    RTTNode.prototype.constructor = RTTNode;
    RTTNode.prototype.nodeType = 'RTT';
    RTTNode.prototype.build = function (builder, output, uuid) {
        var rttBuilder = new b.NodeBuilder();
        rttBuilder.nodes = builder.nodes;
        rttBuilder.updaters = builder.updaters;
        this.material.fragment.value = this.input;
        this.material.build({ builder: rttBuilder });
        return d.TextureNode.prototype.build.call(this, builder, output, uuid);
    };
    RTTNode.prototype.updateFramesaveTo = function (frame) {
        this.saveTo.render = false;
        if (this.saveTo !== this.saveToCurrent) {
            if (this.saveToMaterial)
                this.saveToMaterial.dispose();
            var material = new c.NodeMaterial();
            material.fragment.value = this;
            material.build();
            var scene = new a.Scene();
            var quad = new a.Mesh(new a.PlaneBufferGeometry(2, 2), material);
            quad.frustumCulled = false;
            scene.add(quad);
            this.saveToScene = scene;
            this.saveToMaterial = material;
        }
        this.saveToCurrent = this.saveTo;
        frame.renderer.setRenderTarget(this.saveTo.renderTarget);
        if (this.saveTo.clear)
            frame.renderer.clear();
        frame.renderer.render(this.saveToScene, this.camera);
    };
    RTTNode.prototype.updateFrame = function (frame) {
        if (frame.renderer) {
            if (this.saveTo && this.saveTo.render === false) {
                this.updateFramesaveTo(frame);
            }
            if (this.render) {
                if (this.material.uniforms.renderTexture) {
                    this.material.uniforms.renderTexture.value = frame.renderTexture;
                }
                frame.renderer.setRenderTarget(this.renderTarget);
                if (this.clear)
                    frame.renderer.clear();
                frame.renderer.render(this.scene, this.camera);
            }
            if (this.saveTo && this.saveTo.render === true) {
                this.updateFramesaveTo(frame);
            }
        } else {
            console.warn('RTTNode need a renderer in NodeFrame');
        }
    };
    RTTNode.prototype.copy = function (source) {
        d.TextureNode.prototype.copy.call(this, source);
        this.saveTo = source.saveTo;
        return this;
    };
    RTTNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = d.TextureNode.prototype.toJSON.call(this, meta);
            if (this.saveTo)
                data.saveTo = this.saveTo.toJSON(meta).uuid;
        }
        return data;
    };
    return RTTNode;
});