define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var UVsDebug = function (geometry, size) {
        var abc = 'abc';
        var a = new THREE.Vector2();
        var b = new THREE.Vector2();
        var uvs = [
            new THREE.Vector2(),
            new THREE.Vector2(),
            new THREE.Vector2()
        ];
        var face = [];
        var canvas = document.createElement('canvas');
        var width = size || 1024;
        var height = size || 1024;
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba( 0, 0, 0, 1.0 )';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba( 255, 255, 255, 1.0 )';
        ctx.fillRect(0, 0, width, height);
        if (geometry.isGeometry) {
            var faces = geometry.faces;
            var uvSet = geometry.faceVertexUvs[0];
            for (var i = 0, il = uvSet.length; i < il; i++) {
                var face = faces[i];
                var uv = uvSet[i];
                face[0] = face.a;
                face[1] = face.b;
                face[2] = face.c;
                uvs[0].copy(uv[0]);
                uvs[1].copy(uv[1]);
                uvs[2].copy(uv[2]);
                processFace(face, uvs, i);
            }
        } else {
            var index = geometry.index;
            var uvAttribute = geometry.attributes.uv;
            if (index) {
                for (var i = 0, il = index.count; i < il; i += 3) {
                    face[0] = index.getX(i);
                    face[1] = index.getX(i + 1);
                    face[2] = index.getX(i + 2);
                    uvs[0].fromBufferAttribute(uvAttribute, face[0]);
                    uvs[1].fromBufferAttribute(uvAttribute, face[1]);
                    uvs[2].fromBufferAttribute(uvAttribute, face[2]);
                    processFace(face, uvs, i / 3);
                }
            } else {
                for (var i = 0, il = uvAttribute.count; i < il; i += 3) {
                    face[0] = i;
                    face[1] = i + 1;
                    face[2] = i + 2;
                    uvs[0].fromBufferAttribute(uvAttribute, face[0]);
                    uvs[1].fromBufferAttribute(uvAttribute, face[1]);
                    uvs[2].fromBufferAttribute(uvAttribute, face[2]);
                    processFace(face, uvs, i / 3);
                }
            }
        }
        return canvas;
        function processFace(face, uvs, index) {
            ctx.beginPath();
            a.set(0, 0);
            for (var j = 0, jl = uvs.length; j < jl; j++) {
                var uv = uvs[j];
                a.x += uv.x;
                a.y += uv.y;
                if (j === 0) {
                    ctx.moveTo(uv.x * width, (1 - uv.y) * height);
                } else {
                    ctx.lineTo(uv.x * width, (1 - uv.y) * height);
                }
            }
            ctx.closePath();
            ctx.stroke();
            a.divideScalar(uvs.length);
            ctx.font = '12pt Arial bold';
            ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';
            ctx.fillText(index, a.x * width, (1 - a.y) * height);
            if (a.x > 0.95) {
                ctx.fillText(index, a.x % 1 * width, (1 - a.y) * height);
            }
            ctx.font = '8pt Arial bold';
            ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';
            for (j = 0, jl = uvs.length; j < jl; j++) {
                var uv = uvs[j];
                b.addVectors(a, uv).divideScalar(2);
                var vnum = face[j];
                ctx.fillText(abc[j] + vnum, b.x * width, (1 - b.y) * height);
                if (b.x > 0.95) {
                    ctx.fillText(abc[j] + vnum, b.x % 1 * width, (1 - b.y) * height);
                }
            }
        }
    };
    return threex.utils.UVsDebug = UVsDebug;
});