define([
    "skylark-threejs"
], function (THREE) {
    'use strict';
    var Lut = function (colormap, numberofcolors) {
        this.lut = [];
        this.setColorMap(colormap, numberofcolors);
        return this;
    };
    Lut.prototype = {
        constructor: Lut,
        lut: [],
        map: [],
        n: 256,
        minV: 0,
        maxV: 1,
        set: function (value) {
            if (value instanceof Lut) {
                this.copy(value);
            }
            return this;
        },
        setMin: function (min) {
            this.minV = min;
            return this;
        },
        setMax: function (max) {
            this.maxV = max;
            return this;
        },
        setColorMap: function (colormap, numberofcolors) {
            this.map = ColorMapKeywords[colormap] || ColorMapKeywords.rainbow;
            this.n = numberofcolors || 32;
            var step = 1 / this.n;
            this.lut.length = 0;
            for (var i = 0; i <= 1; i += step) {
                for (var j = 0; j < this.map.length - 1; j++) {
                    if (i >= this.map[j][0] && i < this.map[j + 1][0]) {
                        var min = this.map[j][0];
                        var max = this.map[j + 1][0];
                        var minColor = new THREE.Color(this.map[j][1]);
                        var maxColor = new THREE.Color(this.map[j + 1][1]);
                        var color = minColor.lerp(maxColor, (i - min) / (max - min));
                        this.lut.push(color);
                    }
                }
            }
            return this;
        },
        copy: function (lut) {
            this.lut = lut.lut;
            this.map = lut.map;
            this.n = lut.n;
            this.minV = lut.minV;
            this.maxV = lut.maxV;
            return this;
        },
        getColor: function (alpha) {
            if (alpha <= this.minV) {
                alpha = this.minV;
            } else if (alpha >= this.maxV) {
                alpha = this.maxV;
            }
            alpha = (alpha - this.minV) / (this.maxV - this.minV);
            var colorPosition = Math.round(alpha * this.n);
            colorPosition == this.n ? colorPosition -= 1 : colorPosition;
            return this.lut[colorPosition];
        },
        addColorMap: function (colormapName, arrayOfColors) {
            ColorMapKeywords[colormapName] = arrayOfColors;
        },
        createCanvas: function () {
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = this.n;
            this.updateCanvas(canvas);
            return canvas;
        },
        updateCanvas: function (canvas) {
            var ctx = canvas.getContext('2d', { alpha: false });
            var imageData = ctx.getImageData(0, 0, 1, this.n);
            var data = imageData.data;
            var k = 0;
            var step = 1 / this.n;
            for (var i = 1; i >= 0; i -= step) {
                for (var j = this.map.length - 1; j >= 0; j--) {
                    if (i < this.map[j][0] && i >= this.map[j - 1][0]) {
                        var min = this.map[j - 1][0];
                        var max = this.map[j][0];
                        var minColor = new THREE.Color(this.map[j - 1][1]);
                        var maxColor = new THREE.Color(this.map[j][1]);
                        var color = minColor.lerp(maxColor, (i - min) / (max - min));
                        data[k * 4] = Math.round(color.r * 255);
                        data[k * 4 + 1] = Math.round(color.g * 255);
                        data[k * 4 + 2] = Math.round(color.b * 255);
                        data[k * 4 + 3] = 255;
                        k += 1;
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            return canvas;
        }
    };
    var ColorMapKeywords = {
        'rainbow': [
            [
                0,
                255
            ],
            [
                0.2,
                65535
            ],
            [
                0.5,
                65280
            ],
            [
                0.8,
                16776960
            ],
            [
                1,
                16711680
            ]
        ],
        'cooltowarm': [
            [
                0,
                3952322
            ],
            [
                0.2,
                10206463
            ],
            [
                0.5,
                14474460
            ],
            [
                0.8,
                16163717
            ],
            [
                1,
                11797542
            ]
        ],
        'blackbody': [
            [
                0,
                0
            ],
            [
                0.2,
                7864320
            ],
            [
                0.5,
                15086080
            ],
            [
                0.8,
                16776960
            ],
            [
                1,
                16777215
            ]
        ],
        'grayscale': [
            [
                0,
                0
            ],
            [
                0.2,
                4210752
            ],
            [
                0.5,
                8355712
            ],
            [
                0.8,
                12566463
            ],
            [
                1,
                16777215
            ]
        ]
    };
    
    return Lut;
});