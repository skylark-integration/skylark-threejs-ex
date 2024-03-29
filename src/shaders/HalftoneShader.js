define([
    "../threex"
],function (threex) {
    'use strict';
    var HalftoneShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'shape': { value: 1 },
            'radius': { value: 4 },
            'rotateR': { value: Math.PI / 12 * 1 },
            'rotateG': { value: Math.PI / 12 * 2 },
            'rotateB': { value: Math.PI / 12 * 3 },
            'scatter': { value: 0 },
            'width': { value: 1 },
            'height': { value: 1 },
            'blending': { value: 1 },
            'blendingMode': { value: 1 },
            'greyscale': { value: false },
            'disable': { value: false }
        },
        vertexShader: [
            'varying vec2 vUV;',
            'void main() {',
            '\tvUV = uv;',
            '\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}'
        ].join('\n'),
        fragmentShader: [
            '#define SQRT2_MINUS_ONE 0.41421356',
            '#define SQRT2_HALF_MINUS_ONE 0.20710678',
            '#define PI2 6.28318531',
            '#define SHAPE_DOT 1',
            '#define SHAPE_ELLIPSE 2',
            '#define SHAPE_LINE 3',
            '#define SHAPE_SQUARE 4',
            '#define BLENDING_LINEAR 1',
            '#define BLENDING_MULTIPLY 2',
            '#define BLENDING_ADD 3',
            '#define BLENDING_LIGHTER 4',
            '#define BLENDING_DARKER 5',
            'uniform sampler2D tDiffuse;',
            'uniform float radius;',
            'uniform float rotateR;',
            'uniform float rotateG;',
            'uniform float rotateB;',
            'uniform float scatter;',
            'uniform float width;',
            'uniform float height;',
            'uniform int shape;',
            'uniform bool disable;',
            'uniform float blending;',
            'uniform int blendingMode;',
            'varying vec2 vUV;',
            'uniform bool greyscale;',
            'const int samples = 8;',
            'float blend( float a, float b, float t ) {',
            '\treturn a * ( 1.0 - t ) + b * t;',
            '}',
            'float hypot( float x, float y ) {',
            '\treturn sqrt( x * x + y * y );',
            '}',
            'float rand( vec2 seed ){',
            'return fract( sin( dot( seed.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );',
            '}',
            'float distanceToDotRadius( float channel, vec2 coord, vec2 normal, vec2 p, float angle, float rad_max ) {',
            '\tfloat dist = hypot( coord.x - p.x, coord.y - p.y );',
            '\tfloat rad = channel;',
            '\tif ( shape == SHAPE_DOT ) {',
            '\t\trad = pow( abs( rad ), 1.125 ) * rad_max;',
            '\t} else if ( shape == SHAPE_ELLIPSE ) {',
            '\t\trad = pow( abs( rad ), 1.125 ) * rad_max;',
            '\t\tif ( dist != 0.0 ) {',
            '\t\t\tfloat dot_p = abs( ( p.x - coord.x ) / dist * normal.x + ( p.y - coord.y ) / dist * normal.y );',
            '\t\t\tdist = ( dist * ( 1.0 - SQRT2_HALF_MINUS_ONE ) ) + dot_p * dist * SQRT2_MINUS_ONE;',
            '\t\t}',
            '\t} else if ( shape == SHAPE_LINE ) {',
            '\t\trad = pow( abs( rad ), 1.5) * rad_max;',
            '\t\tfloat dot_p = ( p.x - coord.x ) * normal.x + ( p.y - coord.y ) * normal.y;',
            '\t\tdist = hypot( normal.x * dot_p, normal.y * dot_p );',
            '\t} else if ( shape == SHAPE_SQUARE ) {',
            '\t\tfloat theta = atan( p.y - coord.y, p.x - coord.x ) - angle;',
            '\t\tfloat sin_t = abs( sin( theta ) );',
            '\t\tfloat cos_t = abs( cos( theta ) );',
            '\t\trad = pow( abs( rad ), 1.4 );',
            '\t\trad = rad_max * ( rad + ( ( sin_t > cos_t ) ? rad - sin_t * rad : rad - cos_t * rad ) );',
            '\t}',
            '\treturn rad - dist;',
            '}',
            'struct Cell {',
            '\tvec2 normal;',
            '\tvec2 p1;',
            '\tvec2 p2;',
            '\tvec2 p3;',
            '\tvec2 p4;',
            '\tfloat samp2;',
            '\tfloat samp1;',
            '\tfloat samp3;',
            '\tfloat samp4;',
            '};',
            'vec4 getSample( vec2 point ) {',
            '\tvec4 tex = texture2D( tDiffuse, vec2( point.x / width, point.y / height ) );',
            '\tfloat base = rand( vec2( floor( point.x ), floor( point.y ) ) ) * PI2;',
            '\tfloat step = PI2 / float( samples );',
            '\tfloat dist = radius * 0.66;',
            '\tfor ( int i = 0; i < samples; ++i ) {',
            '\t\tfloat r = base + step * float( i );',
            '\t\tvec2 coord = point + vec2( cos( r ) * dist, sin( r ) * dist );',
            '\t\ttex += texture2D( tDiffuse, vec2( coord.x / width, coord.y / height ) );',
            '\t}',
            '\ttex /= float( samples ) + 1.0;',
            '\treturn tex;',
            '}',
            'float getDotColour( Cell c, vec2 p, int channel, float angle, float aa ) {',
            '\tfloat dist_c_1, dist_c_2, dist_c_3, dist_c_4, res;',
            '\tif ( channel == 0 ) {',
            '\t\tc.samp1 = getSample( c.p1 ).r;',
            '\t\tc.samp2 = getSample( c.p2 ).r;',
            '\t\tc.samp3 = getSample( c.p3 ).r;',
            '\t\tc.samp4 = getSample( c.p4 ).r;',
            '\t} else if (channel == 1) {',
            '\t\tc.samp1 = getSample( c.p1 ).g;',
            '\t\tc.samp2 = getSample( c.p2 ).g;',
            '\t\tc.samp3 = getSample( c.p3 ).g;',
            '\t\tc.samp4 = getSample( c.p4 ).g;',
            '\t} else {',
            '\t\tc.samp1 = getSample( c.p1 ).b;',
            '\t\tc.samp3 = getSample( c.p3 ).b;',
            '\t\tc.samp2 = getSample( c.p2 ).b;',
            '\t\tc.samp4 = getSample( c.p4 ).b;',
            '\t}',
            '\tdist_c_1 = distanceToDotRadius( c.samp1, c.p1, c.normal, p, angle, radius );',
            '\tdist_c_2 = distanceToDotRadius( c.samp2, c.p2, c.normal, p, angle, radius );',
            '\tdist_c_3 = distanceToDotRadius( c.samp3, c.p3, c.normal, p, angle, radius );',
            '\tdist_c_4 = distanceToDotRadius( c.samp4, c.p4, c.normal, p, angle, radius );',
            '\tres = ( dist_c_1 > 0.0 ) ? clamp( dist_c_1 / aa, 0.0, 1.0 ) : 0.0;',
            '\tres += ( dist_c_2 > 0.0 ) ? clamp( dist_c_2 / aa, 0.0, 1.0 ) : 0.0;',
            '\tres += ( dist_c_3 > 0.0 ) ? clamp( dist_c_3 / aa, 0.0, 1.0 ) : 0.0;',
            '\tres += ( dist_c_4 > 0.0 ) ? clamp( dist_c_4 / aa, 0.0, 1.0 ) : 0.0;',
            '\tres = clamp( res, 0.0, 1.0 );',
            '\treturn res;',
            '}',
            'Cell getReferenceCell( vec2 p, vec2 origin, float grid_angle, float step ) {',
            '\tCell c;',
            '\tvec2 n = vec2( cos( grid_angle ), sin( grid_angle ) );',
            '\tfloat threshold = step * 0.5;',
            '\tfloat dot_normal = n.x * ( p.x - origin.x ) + n.y * ( p.y - origin.y );',
            '\tfloat dot_line = -n.y * ( p.x - origin.x ) + n.x * ( p.y - origin.y );',
            '\tvec2 offset = vec2( n.x * dot_normal, n.y * dot_normal );',
            '\tfloat offset_normal = mod( hypot( offset.x, offset.y ), step );',
            '\tfloat normal_dir = ( dot_normal < 0.0 ) ? 1.0 : -1.0;',
            '\tfloat normal_scale = ( ( offset_normal < threshold ) ? -offset_normal : step - offset_normal ) * normal_dir;',
            '\tfloat offset_line = mod( hypot( ( p.x - offset.x ) - origin.x, ( p.y - offset.y ) - origin.y ), step );',
            '\tfloat line_dir = ( dot_line < 0.0 ) ? 1.0 : -1.0;',
            '\tfloat line_scale = ( ( offset_line < threshold ) ? -offset_line : step - offset_line ) * line_dir;',
            '\tc.normal = n;',
            '\tc.p1.x = p.x - n.x * normal_scale + n.y * line_scale;',
            '\tc.p1.y = p.y - n.y * normal_scale - n.x * line_scale;',
            '\tif ( scatter != 0.0 ) {',
            '\t\tfloat off_mag = scatter * threshold * 0.5;',
            '\t\tfloat off_angle = rand( vec2( floor( c.p1.x ), floor( c.p1.y ) ) ) * PI2;',
            '\t\tc.p1.x += cos( off_angle ) * off_mag;',
            '\t\tc.p1.y += sin( off_angle ) * off_mag;',
            '\t}',
            '\tfloat normal_step = normal_dir * ( ( offset_normal < threshold ) ? step : -step );',
            '\tfloat line_step = line_dir * ( ( offset_line < threshold ) ? step : -step );',
            '\tc.p2.x = c.p1.x - n.x * normal_step;',
            '\tc.p2.y = c.p1.y - n.y * normal_step;',
            '\tc.p3.x = c.p1.x + n.y * line_step;',
            '\tc.p3.y = c.p1.y - n.x * line_step;',
            '\tc.p4.x = c.p1.x - n.x * normal_step + n.y * line_step;',
            '\tc.p4.y = c.p1.y - n.y * normal_step - n.x * line_step;',
            '\treturn c;',
            '}',
            'float blendColour( float a, float b, float t ) {',
            '\tif ( blendingMode == BLENDING_LINEAR ) {',
            '\t\treturn blend( a, b, 1.0 - t );',
            '\t} else if ( blendingMode == BLENDING_ADD ) {',
            '\t\treturn blend( a, min( 1.0, a + b ), t );',
            '\t} else if ( blendingMode == BLENDING_MULTIPLY ) {',
            '\t\treturn blend( a, max( 0.0, a * b ), t );',
            '\t} else if ( blendingMode == BLENDING_LIGHTER ) {',
            '\t\treturn blend( a, max( a, b ), t );',
            '\t} else if ( blendingMode == BLENDING_DARKER ) {',
            '\t\treturn blend( a, min( a, b ), t );',
            '\t} else {',
            '\t\treturn blend( a, b, 1.0 - t );',
            '\t}',
            '}',
            'void main() {',
            '\tif ( ! disable ) {',
            '\t\tvec2 p = vec2( vUV.x * width, vUV.y * height );',
            '\t\tvec2 origin = vec2( 0, 0 );',
            '\t\tfloat aa = ( radius < 2.5 ) ? radius * 0.5 : 1.25;',
            '\t\tCell cell_r = getReferenceCell( p, origin, rotateR, radius );',
            '\t\tCell cell_g = getReferenceCell( p, origin, rotateG, radius );',
            '\t\tCell cell_b = getReferenceCell( p, origin, rotateB, radius );',
            '\t\tfloat r = getDotColour( cell_r, p, 0, rotateR, aa );',
            '\t\tfloat g = getDotColour( cell_g, p, 1, rotateG, aa );',
            '\t\tfloat b = getDotColour( cell_b, p, 2, rotateB, aa );',
            '\t\tvec4 colour = texture2D( tDiffuse, vUV );',
            '\t\tr = blendColour( r, colour.r, blending );',
            '\t\tg = blendColour( g, colour.g, blending );',
            '\t\tb = blendColour( b, colour.b, blending );',
            '\t\tif ( greyscale ) {',
            '\t\t\tr = g = b = (r + b + g) / 3.0;',
            '\t\t}',
            '\t\tgl_FragColor = vec4( r, g, b, 1.0 );',
            '\t} else {',
            '\t\tgl_FragColor = texture2D( tDiffuse, vUV );',
            '\t}',
            '}'
        ].join('\n')
    };
    return threex.shaders.HalftoneShader = HalftoneShader;
});