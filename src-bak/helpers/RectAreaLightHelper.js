define(["skylark-threejs"], function (a) {
    'use strict';
    function RectAreaLightHelper(light, color) {
        this.type = 'RectAreaLightHelper';
        this.light = light;
        this.color = color;
        var positions = [
            1,
            1,
            0,
            -1,
            1,
            0,
            -1,
            -1,
            0,
            1,
            -1,
            0,
            1,
            1,
            0
        ];
        var geometry = new a.BufferGeometry();
        geometry.setAttribute('position', new a.Float32BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();
        var material = new a.LineBasicMaterial({ fog: false });
        a.Line.call(this, geometry, material);
        var positions2 = [
            1,
            1,
            0,
            -1,
            1,
            0,
            -1,
            -1,
            0,
            1,
            1,
            0,
            -1,
            -1,
            0,
            1,
            -1,
            0
        ];
        var geometry2 = new a.BufferGeometry();
        geometry2.setAttribute('position', new a.Float32BufferAttribute(positions2, 3));
        geometry2.computeBoundingSphere();
        this.add(new a.Mesh(geometry2, new a.MeshBasicMaterial({
            side: a.BackSide,
            fog: false
        })));
        this.update();
    }
    RectAreaLightHelper.prototype = Object.create(a.Line.prototype);
    RectAreaLightHelper.prototype.constructor = RectAreaLightHelper;
    RectAreaLightHelper.prototype.update = function () {
        this.scale.set(0.5 * this.light.width, 0.5 * this.light.height, 1);
        if (this.color !== undefined) {
            this.material.color.set(this.color);
            this.children[0].material.color.set(this.color);
        } else {
            this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
            var c = this.material.color;
            var max = Math.max(c.r, c.g, c.b);
            if (max > 1)
                c.multiplyScalar(1 / max);
            this.children[0].material.color.copy(this.material.color);
        }
    };
    RectAreaLightHelper.prototype.dispose = function () {
        this.geometry.dispose();
        this.material.dispose();
        this.children[0].geometry.dispose();
        this.children[0].material.dispose();
    };
    return { RectAreaLightHelper };
});