define([
    '../core/TempNode.js',
    '../core/FunctionNode.js',
    './LuminanceNode.js'
], function (a, b, c) {
    'use strict';
    function ColorAdjustmentNode(rgb, adjustment, method) {
        a.TempNode.call(this, 'v3');
        this.rgb = rgb;
        this.adjustment = adjustment;
        this.method = method || ColorAdjustmentNode.SATURATION;
    }
    ColorAdjustmentNode.Nodes = function () {
        var hue = new b.FunctionNode([
            'vec3 hue(vec3 rgb, float adjustment) {',
            '\tconst mat3 RGBtoYIQ = mat3(0.299, 0.587, 0.114, 0.595716, -0.274453, -0.321263, 0.211456, -0.522591, 0.311135);',
            '\tconst mat3 YIQtoRGB = mat3(1.0, 0.9563, 0.6210, 1.0, -0.2721, -0.6474, 1.0, -1.107, 1.7046);',
            '\tvec3 yiq = RGBtoYIQ * rgb;',
            '\tfloat hue = atan(yiq.z, yiq.y) + adjustment;',
            '\tfloat chroma = sqrt(yiq.z * yiq.z + yiq.y * yiq.y);',
            '\treturn YIQtoRGB * vec3(yiq.x, chroma * cos(hue), chroma * sin(hue));',
            '}'
        ].join('\n'));
        var saturation = new b.FunctionNode([
            'vec3 saturation(vec3 rgb, float adjustment) {',
            '\tvec3 intensity = vec3( luminance( rgb ) );',
            '\treturn mix( intensity, rgb, adjustment );',
            '}'
        ].join('\n'), [c.LuminanceNode.Nodes.luminance]);
        var vibrance = new b.FunctionNode([
            'vec3 vibrance(vec3 rgb, float adjustment) {',
            '\tfloat average = (rgb.r + rgb.g + rgb.b) / 3.0;',
            '\tfloat mx = max(rgb.r, max(rgb.g, rgb.b));',
            '\tfloat amt = (mx - average) * (-3.0 * adjustment);',
            '\treturn mix(rgb.rgb, vec3(mx), amt);',
            '}'
        ].join('\n'));
        return {
            hue: hue,
            saturation: saturation,
            vibrance: vibrance
        };
    }();
    ColorAdjustmentNode.SATURATION = 'saturation';
    ColorAdjustmentNode.HUE = 'hue';
    ColorAdjustmentNode.VIBRANCE = 'vibrance';
    ColorAdjustmentNode.BRIGHTNESS = 'brightness';
    ColorAdjustmentNode.CONTRAST = 'contrast';
    ColorAdjustmentNode.prototype = Object.create(a.TempNode.prototype);
    ColorAdjustmentNode.prototype.constructor = ColorAdjustmentNode;
    ColorAdjustmentNode.prototype.nodeType = 'ColorAdjustment';
    ColorAdjustmentNode.prototype.generate = function (builder, output) {
        var rgb = this.rgb.build(builder, 'v3'), adjustment = this.adjustment.build(builder, 'f');
        switch (this.method) {
        case ColorAdjustmentNode.BRIGHTNESS:
            return builder.format('( ' + rgb + ' + ' + adjustment + ' )', this.getType(builder), output);
            break;
        case ColorAdjustmentNode.CONTRAST:
            return builder.format('( ' + rgb + ' * ' + adjustment + ' )', this.getType(builder), output);
            break;
        }
        var method = builder.include(ColorAdjustmentNode.Nodes[this.method]);
        return builder.format(method + '( ' + rgb + ', ' + adjustment + ' )', this.getType(builder), output);
    };
    ColorAdjustmentNode.prototype.copy = function (source) {
        a.TempNode.prototype.copy.call(this, source);
        this.rgb = source.rgb;
        this.adjustment = source.adjustment;
        this.method = source.method;
        return this;
    };
    ColorAdjustmentNode.prototype.toJSON = function (meta) {
        var data = this.getJSONNode(meta);
        if (!data) {
            data = this.createJSONNode(meta);
            data.rgb = this.rgb.toJSON(meta).uuid;
            data.adjustment = this.adjustment.toJSON(meta).uuid;
            data.method = this.method;
        }
        return data;
    };
    return ColorAdjustmentNode;
});