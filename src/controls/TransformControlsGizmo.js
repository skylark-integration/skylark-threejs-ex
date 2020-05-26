define([
    "skylark-threejs",
    "../threex"
], function (
    THREE,
    threex
) {
    'use strict';
    var TransformControlsGizmo = function () {
        'use strict';
        THREE.Object3D.call(this);
        this.type = 'TransformControlsGizmo';
        var gizmoMaterial = new THREE.MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            side: THREE.DoubleSide,
            fog: false
        });
        var gizmoLineMaterial = new THREE.LineBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            linewidth: 1,
            fog: false
        });
        var matInvisible = gizmoMaterial.clone();
        matInvisible.opacity = 0.15;
        var matHelper = gizmoMaterial.clone();
        matHelper.opacity = 0.33;
        var matRed = gizmoMaterial.clone();
        matRed.color.set(16711680);
        var matGreen = gizmoMaterial.clone();
        matGreen.color.set(65280);
        var matBlue = gizmoMaterial.clone();
        matBlue.color.set(255);
        var matWhiteTransparent = gizmoMaterial.clone();
        matWhiteTransparent.opacity = 0.25;
        var matYellowTransparent = matWhiteTransparent.clone();
        matYellowTransparent.color.set(16776960);
        var matCyanTransparent = matWhiteTransparent.clone();
        matCyanTransparent.color.set(65535);
        var matMagentaTransparent = matWhiteTransparent.clone();
        matMagentaTransparent.color.set(16711935);
        var matYellow = gizmoMaterial.clone();
        matYellow.color.set(16776960);
        var matLineRed = gizmoLineMaterial.clone();
        matLineRed.color.set(16711680);
        var matLineGreen = gizmoLineMaterial.clone();
        matLineGreen.color.set(65280);
        var matLineBlue = gizmoLineMaterial.clone();
        matLineBlue.color.set(255);
        var matLineCyan = gizmoLineMaterial.clone();
        matLineCyan.color.set(65535);
        var matLineMagenta = gizmoLineMaterial.clone();
        matLineMagenta.color.set(16711935);
        var matLineYellow = gizmoLineMaterial.clone();
        matLineYellow.color.set(16776960);
        var matLineGray = gizmoLineMaterial.clone();
        matLineGray.color.set(7895160);
        var matLineYellowTransparent = matLineYellow.clone();
        matLineYellowTransparent.opacity = 0.25;
        var arrowGeometry = new THREE.CylinderBufferGeometry(0, 0.05, 0.2, 12, 1, false);
        var scaleHandleGeometry = new THREE.BoxBufferGeometry(0.125, 0.125, 0.125);
        var lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
            0,
            0,
            0,
            1,
            0,
            0
        ], 3));
        var CircleGeometry = function (radius, arc) {
            var geometry = new THREE.BufferGeometry();
            var vertices = [];
            for (var i = 0; i <= 64 * arc; ++i) {
                vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            return geometry;
        };
        var TranslateHelperGeometry = function () {
            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([
                0,
                0,
                0,
                1,
                1,
                1
            ], 3));
            return geometry;
        };
        var gizmoTranslate = {
            X: [
                [
                    new THREE.Mesh(arrowGeometry, matRed),
                    [
                        1,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        -Math.PI / 2
                    ],
                    null,
                    'fwd'
                ],
                [
                    new THREE.Mesh(arrowGeometry, matRed),
                    [
                        1,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    null,
                    'bwd'
                ],
                [new THREE.Line(lineGeometry, matLineRed)]
            ],
            Y: [
                [
                    new THREE.Mesh(arrowGeometry, matGreen),
                    [
                        0,
                        1,
                        0
                    ],
                    null,
                    null,
                    'fwd'
                ],
                [
                    new THREE.Mesh(arrowGeometry, matGreen),
                    [
                        0,
                        1,
                        0
                    ],
                    [
                        Math.PI,
                        0,
                        0
                    ],
                    null,
                    'bwd'
                ],
                [
                    new THREE.Line(lineGeometry, matLineGreen),
                    null,
                    [
                        0,
                        0,
                        Math.PI / 2
                    ]
                ]
            ],
            Z: [
                [
                    new THREE.Mesh(arrowGeometry, matBlue),
                    [
                        0,
                        0,
                        1
                    ],
                    [
                        Math.PI / 2,
                        0,
                        0
                    ],
                    null,
                    'fwd'
                ],
                [
                    new THREE.Mesh(arrowGeometry, matBlue),
                    [
                        0,
                        0,
                        1
                    ],
                    [
                        -Math.PI / 2,
                        0,
                        0
                    ],
                    null,
                    'bwd'
                ],
                [
                    new THREE.Line(lineGeometry, matLineBlue),
                    null,
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ]
                ]
            ],
            XYZ: [[
                    new THREE.Mesh(new THREE.OctahedronBufferGeometry(0.1, 0), matWhiteTransparent.clone()),
                    [
                        0,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        0
                    ]
                ]],
            XY: [
                [
                    new THREE.Mesh(new THREE.PlaneBufferGeometry(0.295, 0.295), matYellowTransparent.clone()),
                    [
                        0.15,
                        0.15,
                        0
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineYellow),
                    [
                        0.18,
                        0.3,
                        0
                    ],
                    null,
                    [
                        0.125,
                        1,
                        1
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineYellow),
                    [
                        0.3,
                        0.18,
                        0
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ]
            ],
            YZ: [
                [
                    new THREE.Mesh(new THREE.PlaneBufferGeometry(0.295, 0.295), matCyanTransparent.clone()),
                    [
                        0,
                        0.15,
                        0.15
                    ],
                    [
                        0,
                        Math.PI / 2,
                        0
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineCyan),
                    [
                        0,
                        0.18,
                        0.3
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineCyan),
                    [
                        0,
                        0.3,
                        0.18
                    ],
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ]
            ],
            XZ: [
                [
                    new THREE.Mesh(new THREE.PlaneBufferGeometry(0.295, 0.295), matMagentaTransparent.clone()),
                    [
                        0.15,
                        0,
                        0.15
                    ],
                    [
                        -Math.PI / 2,
                        0,
                        0
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineMagenta),
                    [
                        0.18,
                        0,
                        0.3
                    ],
                    null,
                    [
                        0.125,
                        1,
                        1
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineMagenta),
                    [
                        0.3,
                        0,
                        0.18
                    ],
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ]
            ]
        };
        var pickerTranslate = {
            X: [[
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible),
                    [
                        0.6,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        -Math.PI / 2
                    ]
                ]],
            Y: [[
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible),
                    [
                        0,
                        0.6,
                        0
                    ]
                ]],
            Z: [[
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible),
                    [
                        0,
                        0,
                        0.6
                    ],
                    [
                        Math.PI / 2,
                        0,
                        0
                    ]
                ]],
            XYZ: [[new THREE.Mesh(new THREE.OctahedronBufferGeometry(0.2, 0), matInvisible)]],
            XY: [[
                    new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), matInvisible),
                    [
                        0.2,
                        0.2,
                        0
                    ]
                ]],
            YZ: [[
                    new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), matInvisible),
                    [
                        0,
                        0.2,
                        0.2
                    ],
                    [
                        0,
                        Math.PI / 2,
                        0
                    ]
                ]],
            XZ: [[
                    new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), matInvisible),
                    [
                        0.2,
                        0,
                        0.2
                    ],
                    [
                        -Math.PI / 2,
                        0,
                        0
                    ]
                ]]
        };
        var helperTranslate = {
            START: [[
                    new THREE.Mesh(new THREE.OctahedronBufferGeometry(0.01, 2), matHelper),
                    null,
                    null,
                    null,
                    'helper'
                ]],
            END: [[
                    new THREE.Mesh(new THREE.OctahedronBufferGeometry(0.01, 2), matHelper),
                    null,
                    null,
                    null,
                    'helper'
                ]],
            DELTA: [[
                    new THREE.Line(TranslateHelperGeometry(), matHelper),
                    null,
                    null,
                    null,
                    'helper'
                ]],
            X: [[
                    new THREE.Line(lineGeometry, matHelper.clone()),
                    [
                        -1000,
                        0,
                        0
                    ],
                    null,
                    [
                        1000000,
                        1,
                        1
                    ],
                    'helper'
                ]],
            Y: [[
                    new THREE.Line(lineGeometry, matHelper.clone()),
                    [
                        0,
                        -1000,
                        0
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        1000000,
                        1,
                        1
                    ],
                    'helper'
                ]],
            Z: [[
                    new THREE.Line(lineGeometry, matHelper.clone()),
                    [
                        0,
                        0,
                        -1000
                    ],
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ],
                    [
                        1000000,
                        1,
                        1
                    ],
                    'helper'
                ]]
        };
        var gizmoRotate = {
            X: [
                [new THREE.Line(CircleGeometry(1, 0.5), matLineRed)],
                [
                    new THREE.Mesh(new THREE.OctahedronBufferGeometry(0.04, 0), matRed),
                    [
                        0,
                        0,
                        0.99
                    ],
                    null,
                    [
                        1,
                        3,
                        1
                    ]
                ]
            ],
            Y: [
                [
                    new THREE.Line(CircleGeometry(1, 0.5), matLineGreen),
                    null,
                    [
                        0,
                        0,
                        -Math.PI / 2
                    ]
                ],
                [
                    new THREE.Mesh(new THREE.OctahedronBufferGeometry(0.04, 0), matGreen),
                    [
                        0,
                        0,
                        0.99
                    ],
                    null,
                    [
                        3,
                        1,
                        1
                    ]
                ]
            ],
            Z: [
                [
                    new THREE.Line(CircleGeometry(1, 0.5), matLineBlue),
                    null,
                    [
                        0,
                        Math.PI / 2,
                        0
                    ]
                ],
                [
                    new THREE.Mesh(new THREE.OctahedronBufferGeometry(0.04, 0), matBlue),
                    [
                        0.99,
                        0,
                        0
                    ],
                    null,
                    [
                        1,
                        3,
                        1
                    ]
                ]
            ],
            E: [
                [
                    new THREE.Line(CircleGeometry(1.25, 1), matLineYellowTransparent),
                    null,
                    [
                        0,
                        Math.PI / 2,
                        0
                    ]
                ],
                [
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
                    [
                        1.17,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        -Math.PI / 2
                    ],
                    [
                        1,
                        1,
                        0.001
                    ]
                ],
                [
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
                    [
                        -1.17,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        1,
                        1,
                        0.001
                    ]
                ],
                [
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
                    [
                        0,
                        -1.17,
                        0
                    ],
                    [
                        Math.PI,
                        0,
                        0
                    ],
                    [
                        1,
                        1,
                        0.001
                    ]
                ],
                [
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
                    [
                        0,
                        1.17,
                        0
                    ],
                    [
                        0,
                        0,
                        0
                    ],
                    [
                        1,
                        1,
                        0.001
                    ]
                ]
            ],
            XYZE: [[
                    new THREE.Line(CircleGeometry(1, 1), matLineGray),
                    null,
                    [
                        0,
                        Math.PI / 2,
                        0
                    ]
                ]]
        };
        var helperRotate = {
            AXIS: [[
                    new THREE.Line(lineGeometry, matHelper.clone()),
                    [
                        -1000,
                        0,
                        0
                    ],
                    null,
                    [
                        1000000,
                        1,
                        1
                    ],
                    'helper'
                ]]
        };
        var pickerRotate = {
            X: [[
                    new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.1, 4, 24), matInvisible),
                    [
                        0,
                        0,
                        0
                    ],
                    [
                        0,
                        -Math.PI / 2,
                        -Math.PI / 2
                    ]
                ]],
            Y: [[
                    new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.1, 4, 24), matInvisible),
                    [
                        0,
                        0,
                        0
                    ],
                    [
                        Math.PI / 2,
                        0,
                        0
                    ]
                ]],
            Z: [[
                    new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.1, 4, 24), matInvisible),
                    [
                        0,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        -Math.PI / 2
                    ]
                ]],
            E: [[new THREE.Mesh(new THREE.TorusBufferGeometry(1.25, 0.1, 2, 24), matInvisible)]],
            XYZE: [[new THREE.Mesh(new THREE.SphereBufferGeometry(0.7, 10, 8), matInvisible)]]
        };
        var gizmoScale = {
            X: [
                [
                    new THREE.Mesh(scaleHandleGeometry, matRed),
                    [
                        0.8,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        -Math.PI / 2
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineRed),
                    null,
                    null,
                    [
                        0.8,
                        1,
                        1
                    ]
                ]
            ],
            Y: [
                [
                    new THREE.Mesh(scaleHandleGeometry, matGreen),
                    [
                        0,
                        0.8,
                        0
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineGreen),
                    null,
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        0.8,
                        1,
                        1
                    ]
                ]
            ],
            Z: [
                [
                    new THREE.Mesh(scaleHandleGeometry, matBlue),
                    [
                        0,
                        0,
                        0.8
                    ],
                    [
                        Math.PI / 2,
                        0,
                        0
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineBlue),
                    null,
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ],
                    [
                        0.8,
                        1,
                        1
                    ]
                ]
            ],
            XY: [
                [
                    new THREE.Mesh(scaleHandleGeometry, matYellowTransparent),
                    [
                        0.85,
                        0.85,
                        0
                    ],
                    null,
                    [
                        2,
                        2,
                        0.2
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineYellow),
                    [
                        0.855,
                        0.98,
                        0
                    ],
                    null,
                    [
                        0.125,
                        1,
                        1
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineYellow),
                    [
                        0.98,
                        0.855,
                        0
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ]
            ],
            YZ: [
                [
                    new THREE.Mesh(scaleHandleGeometry, matCyanTransparent),
                    [
                        0,
                        0.85,
                        0.85
                    ],
                    null,
                    [
                        0.2,
                        2,
                        2
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineCyan),
                    [
                        0,
                        0.855,
                        0.98
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineCyan),
                    [
                        0,
                        0.98,
                        0.855
                    ],
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ]
            ],
            XZ: [
                [
                    new THREE.Mesh(scaleHandleGeometry, matMagentaTransparent),
                    [
                        0.85,
                        0,
                        0.85
                    ],
                    null,
                    [
                        2,
                        0.2,
                        2
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineMagenta),
                    [
                        0.855,
                        0,
                        0.98
                    ],
                    null,
                    [
                        0.125,
                        1,
                        1
                    ]
                ],
                [
                    new THREE.Line(lineGeometry, matLineMagenta),
                    [
                        0.98,
                        0,
                        0.855
                    ],
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ],
                    [
                        0.125,
                        1,
                        1
                    ]
                ]
            ],
            XYZX: [[
                    new THREE.Mesh(new THREE.BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransparent.clone()),
                    [
                        1.1,
                        0,
                        0
                    ]
                ]],
            XYZY: [[
                    new THREE.Mesh(new THREE.BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransparent.clone()),
                    [
                        0,
                        1.1,
                        0
                    ]
                ]],
            XYZZ: [[
                    new THREE.Mesh(new THREE.BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransparent.clone()),
                    [
                        0,
                        0,
                        1.1
                    ]
                ]]
        };
        var pickerScale = {
            X: [[
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible),
                    [
                        0.5,
                        0,
                        0
                    ],
                    [
                        0,
                        0,
                        -Math.PI / 2
                    ]
                ]],
            Y: [[
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible),
                    [
                        0,
                        0.5,
                        0
                    ]
                ]],
            Z: [[
                    new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible),
                    [
                        0,
                        0,
                        0.5
                    ],
                    [
                        Math.PI / 2,
                        0,
                        0
                    ]
                ]],
            XY: [[
                    new THREE.Mesh(scaleHandleGeometry, matInvisible),
                    [
                        0.85,
                        0.85,
                        0
                    ],
                    null,
                    [
                        3,
                        3,
                        0.2
                    ]
                ]],
            YZ: [[
                    new THREE.Mesh(scaleHandleGeometry, matInvisible),
                    [
                        0,
                        0.85,
                        0.85
                    ],
                    null,
                    [
                        0.2,
                        3,
                        3
                    ]
                ]],
            XZ: [[
                    new THREE.Mesh(scaleHandleGeometry, matInvisible),
                    [
                        0.85,
                        0,
                        0.85
                    ],
                    null,
                    [
                        3,
                        0.2,
                        3
                    ]
                ]],
            XYZX: [[
                    new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible),
                    [
                        1.1,
                        0,
                        0
                    ]
                ]],
            XYZY: [[
                    new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible),
                    [
                        0,
                        1.1,
                        0
                    ]
                ]],
            XYZZ: [[
                    new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible),
                    [
                        0,
                        0,
                        1.1
                    ]
                ]]
        };
        var helperScale = {
            X: [[
                    new THREE.Line(lineGeometry, matHelper.clone()),
                    [
                        -1000,
                        0,
                        0
                    ],
                    null,
                    [
                        1000000,
                        1,
                        1
                    ],
                    'helper'
                ]],
            Y: [[
                    new THREE.Line(lineGeometry, matHelper.clone()),
                    [
                        0,
                        -1000,
                        0
                    ],
                    [
                        0,
                        0,
                        Math.PI / 2
                    ],
                    [
                        1000000,
                        1,
                        1
                    ],
                    'helper'
                ]],
            Z: [[
                    new THREE.Line(lineGeometry, matHelper.clone()),
                    [
                        0,
                        0,
                        -1000
                    ],
                    [
                        0,
                        -Math.PI / 2,
                        0
                    ],
                    [
                        1000000,
                        1,
                        1
                    ],
                    'helper'
                ]]
        };
        var setupGizmo = function (gizmoMap) {
            var gizmo = new THREE.Object3D();
            for (var name in gizmoMap) {
                for (var i = gizmoMap[name].length; i--;) {
                    var object = gizmoMap[name][i][0].clone();
                    var position = gizmoMap[name][i][1];
                    var rotation = gizmoMap[name][i][2];
                    var scale = gizmoMap[name][i][3];
                    var tag = gizmoMap[name][i][4];
                    object.name = name;
                    object.tag = tag;
                    if (position) {
                        object.position.set(position[0], position[1], position[2]);
                    }
                    if (rotation) {
                        object.rotation.set(rotation[0], rotation[1], rotation[2]);
                    }
                    if (scale) {
                        object.scale.set(scale[0], scale[1], scale[2]);
                    }
                    object.updateMatrix();
                    var tempGeometry = object.geometry.clone();
                    tempGeometry.applyMatrix4(object.matrix);
                    object.geometry = tempGeometry;
                    object.renderOrder = Infinity;
                    object.position.set(0, 0, 0);
                    object.rotation.set(0, 0, 0);
                    object.scale.set(1, 1, 1);
                    gizmo.add(object);
                }
            }
            return gizmo;
        };
        var tempVector = new THREE.Vector3(0, 0, 0);
        var tempEuler = new THREE.Euler();
        var alignVector = new THREE.Vector3(0, 1, 0);
        var zeroVector = new THREE.Vector3(0, 0, 0);
        var lookAtMatrix = new THREE.Matrix4();
        var tempQuaternion = new THREE.Quaternion();
        var tempQuaternion2 = new THREE.Quaternion();
        var identityQuaternion = new THREE.Quaternion();
        var unitX = new THREE.Vector3(1, 0, 0);
        var unitY = new THREE.Vector3(0, 1, 0);
        var unitZ = new THREE.Vector3(0, 0, 1);
        this.gizmo = {};
        this.picker = {};
        this.helper = {};
        this.add(this.gizmo['translate'] = setupGizmo(gizmoTranslate));
        this.add(this.gizmo['rotate'] = setupGizmo(gizmoRotate));
        this.add(this.gizmo['scale'] = setupGizmo(gizmoScale));
        this.add(this.picker['translate'] = setupGizmo(pickerTranslate));
        this.add(this.picker['rotate'] = setupGizmo(pickerRotate));
        this.add(this.picker['scale'] = setupGizmo(pickerScale));
        this.add(this.helper['translate'] = setupGizmo(helperTranslate));
        this.add(this.helper['rotate'] = setupGizmo(helperRotate));
        this.add(this.helper['scale'] = setupGizmo(helperScale));
        this.picker['translate'].visible = false;
        this.picker['rotate'].visible = false;
        this.picker['scale'].visible = false;
        this.updateMatrixWorld = function () {
            var space = this.space;
            if (this.mode === 'scale')
                space = 'local';
            var quaternion = space === 'local' ? this.worldQuaternion : identityQuaternion;
            this.gizmo['translate'].visible = this.mode === 'translate';
            this.gizmo['rotate'].visible = this.mode === 'rotate';
            this.gizmo['scale'].visible = this.mode === 'scale';
            this.helper['translate'].visible = this.mode === 'translate';
            this.helper['rotate'].visible = this.mode === 'rotate';
            this.helper['scale'].visible = this.mode === 'scale';
            var handles = [];
            handles = handles.concat(this.picker[this.mode].children);
            handles = handles.concat(this.gizmo[this.mode].children);
            handles = handles.concat(this.helper[this.mode].children);
            for (var i = 0; i < handles.length; i++) {
                var handle = handles[i];
                handle.visible = true;
                handle.rotation.set(0, 0, 0);
                handle.position.copy(this.worldPosition);
                var eyeDistance = this.worldPosition.distanceTo(this.cameraPosition);
                handle.scale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size / 7);
                if (handle.tag === 'helper') {
                    handle.visible = false;
                    if (handle.name === 'AXIS') {
                        handle.position.copy(this.worldPositionStart);
                        handle.visible = !!this.axis;
                        if (this.axis === 'X') {
                            tempQuaternion.setFromEuler(tempEuler.set(0, 0, 0));
                            handle.quaternion.copy(quaternion).multiply(tempQuaternion);
                            if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
                                handle.visible = false;
                            }
                        }
                        if (this.axis === 'Y') {
                            tempQuaternion.setFromEuler(tempEuler.set(0, 0, Math.PI / 2));
                            handle.quaternion.copy(quaternion).multiply(tempQuaternion);
                            if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
                                handle.visible = false;
                            }
                        }
                        if (this.axis === 'Z') {
                            tempQuaternion.setFromEuler(tempEuler.set(0, Math.PI / 2, 0));
                            handle.quaternion.copy(quaternion).multiply(tempQuaternion);
                            if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
                                handle.visible = false;
                            }
                        }
                        if (this.axis === 'XYZE') {
                            tempQuaternion.setFromEuler(tempEuler.set(0, Math.PI / 2, 0));
                            alignVector.copy(this.rotationAxis);
                            handle.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(zeroVector, alignVector, unitY));
                            handle.quaternion.multiply(tempQuaternion);
                            handle.visible = this.dragging;
                        }
                        if (this.axis === 'E') {
                            handle.visible = false;
                        }
                    } else if (handle.name === 'START') {
                        handle.position.copy(this.worldPositionStart);
                        handle.visible = this.dragging;
                    } else if (handle.name === 'END') {
                        handle.position.copy(this.worldPosition);
                        handle.visible = this.dragging;
                    } else if (handle.name === 'DELTA') {
                        handle.position.copy(this.worldPositionStart);
                        handle.quaternion.copy(this.worldQuaternionStart);
                        tempVector.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1);
                        tempVector.applyQuaternion(this.worldQuaternionStart.clone().inverse());
                        handle.scale.copy(tempVector);
                        handle.visible = this.dragging;
                    } else {
                        handle.quaternion.copy(quaternion);
                        if (this.dragging) {
                            handle.position.copy(this.worldPositionStart);
                        } else {
                            handle.position.copy(this.worldPosition);
                        }
                        if (this.axis) {
                            handle.visible = this.axis.search(handle.name) !== -1;
                        }
                    }
                    continue;
                }
                handle.quaternion.copy(quaternion);
                if (this.mode === 'translate' || this.mode === 'scale') {
                    var AXIS_HIDE_TRESHOLD = 0.99;
                    var PLANE_HIDE_TRESHOLD = 0.2;
                    var AXIS_FLIP_TRESHOLD = 0;
                    if (handle.name === 'X' || handle.name === 'XYZX') {
                        if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
                            handle.scale.set(1e-10, 1e-10, 1e-10);
                            handle.visible = false;
                        }
                    }
                    if (handle.name === 'Y' || handle.name === 'XYZY') {
                        if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
                            handle.scale.set(1e-10, 1e-10, 1e-10);
                            handle.visible = false;
                        }
                    }
                    if (handle.name === 'Z' || handle.name === 'XYZZ') {
                        if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
                            handle.scale.set(1e-10, 1e-10, 1e-10);
                            handle.visible = false;
                        }
                    }
                    if (handle.name === 'XY') {
                        if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
                            handle.scale.set(1e-10, 1e-10, 1e-10);
                            handle.visible = false;
                        }
                    }
                    if (handle.name === 'YZ') {
                        if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
                            handle.scale.set(1e-10, 1e-10, 1e-10);
                            handle.visible = false;
                        }
                    }
                    if (handle.name === 'XZ') {
                        if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
                            handle.scale.set(1e-10, 1e-10, 1e-10);
                            handle.visible = false;
                        }
                    }
                    if (handle.name.search('X') !== -1) {
                        if (alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
                            if (handle.tag === 'fwd') {
                                handle.visible = false;
                            } else {
                                handle.scale.x *= -1;
                            }
                        } else if (handle.tag === 'bwd') {
                            handle.visible = false;
                        }
                    }
                    if (handle.name.search('Y') !== -1) {
                        if (alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
                            if (handle.tag === 'fwd') {
                                handle.visible = false;
                            } else {
                                handle.scale.y *= -1;
                            }
                        } else if (handle.tag === 'bwd') {
                            handle.visible = false;
                        }
                    }
                    if (handle.name.search('Z') !== -1) {
                        if (alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
                            if (handle.tag === 'fwd') {
                                handle.visible = false;
                            } else {
                                handle.scale.z *= -1;
                            }
                        } else if (handle.tag === 'bwd') {
                            handle.visible = false;
                        }
                    }
                } else if (this.mode === 'rotate') {
                    tempQuaternion2.copy(quaternion);
                    alignVector.copy(this.eye).applyQuaternion(tempQuaternion.copy(quaternion).inverse());
                    if (handle.name.search('E') !== -1) {
                        handle.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(this.eye, zeroVector, unitY));
                    }
                    if (handle.name === 'X') {
                        tempQuaternion.setFromAxisAngle(unitX, Math.atan2(-alignVector.y, alignVector.z));
                        tempQuaternion.multiplyQuaternions(tempQuaternion2, tempQuaternion);
                        handle.quaternion.copy(tempQuaternion);
                    }
                    if (handle.name === 'Y') {
                        tempQuaternion.setFromAxisAngle(unitY, Math.atan2(alignVector.x, alignVector.z));
                        tempQuaternion.multiplyQuaternions(tempQuaternion2, tempQuaternion);
                        handle.quaternion.copy(tempQuaternion);
                    }
                    if (handle.name === 'Z') {
                        tempQuaternion.setFromAxisAngle(unitZ, Math.atan2(alignVector.y, alignVector.x));
                        tempQuaternion.multiplyQuaternions(tempQuaternion2, tempQuaternion);
                        handle.quaternion.copy(tempQuaternion);
                    }
                }
                handle.visible = handle.visible && (handle.name.indexOf('X') === -1 || this.showX);
                handle.visible = handle.visible && (handle.name.indexOf('Y') === -1 || this.showY);
                handle.visible = handle.visible && (handle.name.indexOf('Z') === -1 || this.showZ);
                handle.visible = handle.visible && (handle.name.indexOf('E') === -1 || this.showX && this.showY && this.showZ);
                handle.material._opacity = handle.material._opacity || handle.material.opacity;
                handle.material._color = handle.material._color || handle.material.color.clone();
                handle.material.color.copy(handle.material._color);
                handle.material.opacity = handle.material._opacity;
                if (!this.enabled) {
                    handle.material.opacity *= 0.5;
                    handle.material.color.lerp(new THREE.Color(1, 1, 1), 0.5);
                } else if (this.axis) {
                    if (handle.name === this.axis) {
                        handle.material.opacity = 1;
                        handle.material.color.lerp(new THREE.Color(1, 1, 1), 0.5);
                    } else if (this.axis.split('').some(function (THREE) {
                            return handle.name === THREE;
                        })) {
                        handle.material.opacity = 1;
                        handle.material.color.lerp(new THREE.Color(1, 1, 1), 0.5);
                    } else {
                        handle.material.opacity *= 0.25;
                        handle.material.color.lerp(new THREE.Color(1, 1, 1), 0.5);
                    }
                }
            }
            THREE.Object3D.prototype.updateMatrixWorld.call(this);
        };
    };
    TransformControlsGizmo.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: TransformControlsGizmo,
        isTransformControlsGizmo: true
    });
 
    return  threex.controls.TransformControlsGizmo = TransformControlsGizmo;
});