define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var STLExporter = function () {
    };
    STLExporter.prototype = {
        constructor: STLExporter,
        parse: function () {
            var vector = new THREE.Vector3();
            var normalMatrixWorld = new THREE.Matrix3();
            return function parse(scene, options) {
                if (options === undefined)
                    options = {};
                var binary = options.binary !== undefined ? options.binary : false;
                var objects = [];
                var triangles = 0;
                scene.traverse(function (object) {
                    if (object.isMesh) {
                        var geometry = object.geometry;
                        if (geometry.isBufferGeometry) {
                            geometry = new THREE.Geometry().fromBufferGeometry(geometry);
                        }
                        if (geometry.isGeometry) {
                            triangles += geometry.faces.length;
                            objects.push({
                                geometry: geometry,
                                matrixWorld: object.matrixWorld
                            });
                        }
                    }
                });
                if (binary) {
                    var offset = 80;
                    var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
                    var arrayBuffer = new ArrayBuffer(bufferLength);
                    var output = new DataView(arrayBuffer);
                    output.setUint32(offset, triangles, true);
                    offset += 4;
                    for (var i = 0, il = objects.length; i < il; i++) {
                        var object = objects[i];
                        var vertices = object.geometry.vertices;
                        var faces = object.geometry.faces;
                        var matrixWorld = object.matrixWorld;
                        normalMatrixWorld.getNormalMatrix(matrixWorld);
                        for (var j = 0, jl = faces.length; j < jl; j++) {
                            var face = faces[j];
                            vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();
                            output.setFloat32(offset, vector.x, true);
                            offset += 4;
                            output.setFloat32(offset, vector.y, true);
                            offset += 4;
                            output.setFloat32(offset, vector.z, true);
                            offset += 4;
                            var indices = [
                                face.a,
                                face.b,
                                face.c
                            ];
                            for (var k = 0; k < 3; k++) {
                                vector.copy(vertices[indices[k]]).applyMatrix4(matrixWorld);
                                output.setFloat32(offset, vector.x, true);
                                offset += 4;
                                output.setFloat32(offset, vector.y, true);
                                offset += 4;
                                output.setFloat32(offset, vector.z, true);
                                offset += 4;
                            }
                            output.setUint16(offset, 0, true);
                            offset += 2;
                        }
                    }
                    return output;
                } else {
                    var output = '';
                    output += 'solid exported\n';
                    for (var i = 0, il = objects.length; i < il; i++) {
                        var object = objects[i];
                        var vertices = object.geometry.vertices;
                        var faces = object.geometry.faces;
                        var matrixWorld = object.matrixWorld;
                        normalMatrixWorld.getNormalMatrix(matrixWorld);
                        for (var j = 0, jl = faces.length; j < jl; j++) {
                            var face = faces[j];
                            vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();
                            output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                            output += '\t\touter loop\n';
                            var indices = [
                                face.a,
                                face.b,
                                face.c
                            ];
                            for (var k = 0; k < 3; k++) {
                                vector.copy(vertices[indices[k]]).applyMatrix4(matrixWorld);
                                output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                            }
                            output += '\t\tendloop\n';
                            output += '\tendfacet\n';
                        }
                    }
                    output += 'endsolid exported\n';
                    return output;
                }
            };
        }()
    };
    return threex.exporters.STLExporter = STLExporter;
});