define([
    "skylark-threejs",
    '../core/NodeBuilder.js',
    '../inputs/ColorNode.js',
    '../accessors/PositionNode.js',
    './nodes/RawNode.js'
], function (a, b, c, d, e) {
    'use strict';
    function NodeMaterial(vertex, fragment) {
        a.ShaderMaterial.call(this);
        var self = this;
        this.vertex = vertex || new e.RawNode(new d.PositionNode(d.PositionNode.PROJECTION));
        this.fragment = fragment || new e.RawNode(new c.ColorNode(16711680));
        this.updaters = [];
        this.onBeforeCompile = function (shader, renderer) {
            var materialProperties = renderer.properties.get(this);
            if (this.version !== materialProperties.__version) {
                this.build({ renderer: renderer });
                shader.uniforms = this.uniforms;
                shader.vertexShader = this.vertexShader;
                shader.fragmentShader = this.fragmentShader;
            }
        };
        this.onBeforeCompile.toString = function () {
            return self.needsCompile;
        };
    }
    NodeMaterial.prototype = Object.create(a.ShaderMaterial.prototype);
    NodeMaterial.prototype.constructor = NodeMaterial;
    NodeMaterial.prototype.type = 'NodeMaterial';
    NodeMaterial.prototype.isNodeMaterial = true;
    Object.defineProperties(NodeMaterial.prototype, {
        properties: {
            get: function () {
                return this.fragment.properties;
            }
        },
        needsUpdate: {
            set: function (value) {
                if (value === true)
                    this.version++;
                this.needsCompile = value;
            },
            get: function () {
                return this.needsCompile;
            }
        }
    });
    NodeMaterial.prototype.updateFrame = function (frame) {
        for (var i = 0; i < this.updaters.length; ++i) {
            frame.updateNode(this.updaters[i]);
        }
    };
    NodeMaterial.prototype.build = function (params) {
        params = params || {};
        var builder = params.builder || new b.NodeBuilder();
        builder.setMaterial(this, params.renderer);
        builder.build(this.vertex, this.fragment);
        this.vertexShader = builder.getCode('vertex');
        this.fragmentShader = builder.getCode('fragment');
        this.defines = builder.defines;
        this.uniforms = builder.uniforms;
        this.extensions = builder.extensions;
        this.updaters = builder.updaters;
        this.fog = builder.requires.fog;
        this.lights = builder.requires.lights;
        this.transparent = builder.requires.transparent || this.blending > a.NormalBlending;
        return this;
    };
    NodeMaterial.prototype.copy = function (source) {
        var uuid = this.uuid;
        for (var name in source) {
            this[name] = source[name];
        }
        this.uuid = uuid;
        if (source.userData !== undefined) {
            this.userData = JSON.parse(JSON.stringify(source.userData));
        }
        return this;
    };
    NodeMaterial.prototype.toJSON = function (meta) {
        var isRootObject = meta === undefined || typeof meta === 'string';
        if (isRootObject) {
            meta = { nodes: {} };
        }
        if (meta && !meta.materials)
            meta.materials = {};
        if (!meta.materials[this.uuid]) {
            var data = {};
            data.uuid = this.uuid;
            data.type = this.type;
            meta.materials[data.uuid] = data;
            if (this.name !== '')
                data.name = this.name;
            if (this.size !== undefined)
                data.size = this.size;
            if (this.sizeAttenuation !== undefined)
                data.sizeAttenuation = this.sizeAttenuation;
            if (this.blending !== a.NormalBlending)
                data.blending = this.blending;
            if (this.flatShading === true)
                data.flatShading = this.flatShading;
            if (this.side !== a.FrontSide)
                data.side = this.side;
            if (this.vertexColors !== a.NoColors)
                data.vertexColors = this.vertexColors;
            if (this.depthFunc !== a.LessEqualDepth)
                data.depthFunc = this.depthFunc;
            if (this.depthTest === false)
                data.depthTest = this.depthTest;
            if (this.depthWrite === false)
                data.depthWrite = this.depthWrite;
            if (this.linewidth !== 1)
                data.linewidth = this.linewidth;
            if (this.dashSize !== undefined)
                data.dashSize = this.dashSize;
            if (this.gapSize !== undefined)
                data.gapSize = this.gapSize;
            if (this.scale !== undefined)
                data.scale = this.scale;
            if (this.dithering === true)
                data.dithering = true;
            if (this.wireframe === true)
                data.wireframe = this.wireframe;
            if (this.wireframeLinewidth > 1)
                data.wireframeLinewidth = this.wireframeLinewidth;
            if (this.wireframeLinecap !== 'round')
                data.wireframeLinecap = this.wireframeLinecap;
            if (this.wireframeLinejoin !== 'round')
                data.wireframeLinejoin = this.wireframeLinejoin;
            if (this.alphaTest > 0)
                data.alphaTest = this.alphaTest;
            if (this.premultipliedAlpha === true)
                data.premultipliedAlpha = this.premultipliedAlpha;
            if (this.morphTargets === true)
                data.morphTargets = true;
            if (this.skinning === true)
                data.skinning = true;
            if (this.visible === false)
                data.visible = false;
            if (JSON.stringify(this.userData) !== '{}')
                data.userData = this.userData;
            data.fog = this.fog;
            data.lights = this.lights;
            data.vertex = this.vertex.toJSON(meta).uuid;
            data.fragment = this.fragment.toJSON(meta).uuid;
        }
        meta.material = this.uuid;
        return meta;
    };
    return NodeMaterial;
});