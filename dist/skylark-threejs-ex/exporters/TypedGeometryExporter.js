/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";var r=function(){};return r.prototype={constructor:r,parse:function(r){var e={metadata:{version:4,type:"TypedGeometry",generator:"TypedGeometryExporter"}},t=["vertices","normals","uvs"];for(var n in t){for(var o=t[n],a=r[o],u=[],i=0,s=a.length;i<s;i++)u[i]=a[i];e[o]=u}var c=r.boundingSphere;return null!==c&&(e.boundingSphere={center:c.center.toArray(),radius:c.radius}),e}},r});
//# sourceMappingURL=../sourcemaps/exporters/TypedGeometryExporter.js.map
