/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.TypedGeometryExporter=function(){},e.TypedGeometryExporter.prototype={constructor:e.TypedGeometryExporter,parse:function(e){var r={metadata:{version:4,type:"TypedGeometry",generator:"TypedGeometryExporter"}},t=["vertices","normals","uvs"];for(var o in t){for(var n=t[o],p=e[n],y=[],a=0,d=p.length;a<d;a++)y[a]=p[a];r[n]=y}var u=e.boundingSphere;return null!==u&&(r.boundingSphere={center:u.center.toArray(),radius:u.radius}),r}},e.TypedGeometryExporter});
//# sourceMappingURL=../sourcemaps/exporters/TypedGeometryExporter.js.map
