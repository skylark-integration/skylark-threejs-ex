/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex"],function(r){"use strict";var e=function(){};return e.prototype={constructor:e,parse:function(r){var e={metadata:{version:4,type:"TypedGeometry",generator:"TypedGeometryExporter"}},t=["vertices","normals","uvs"];for(var n in t){for(var o=t[n],a=r[o],u=[],i=0,p=a.length;i<p;i++)u[i]=a[i];e[o]=u}var s=r.boundingSphere;return null!==s&&(e.boundingSphere={center:s.center.toArray(),radius:s.radius}),e}},r.exporters.TypedGeometryExporter=e});
//# sourceMappingURL=../sourcemaps/exporters/TypedGeometryExporter.js.map
