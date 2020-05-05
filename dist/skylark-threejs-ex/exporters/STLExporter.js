/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var r,t,o=function(){};return o.prototype={constructor:o,parse:(r=new e.Vector3,t=new e.Matrix3,function(o,a){void 0===a&&(a={});var n=void 0!==a.binary&&a.binary,i=[],l=0;if(o.traverse(function(r){if(r.isMesh){var t=r.geometry;t.isBufferGeometry&&(t=(new e.Geometry).fromBufferGeometry(t)),t.isGeometry&&(l+=t.faces.length,i.push({geometry:t,matrixWorld:r.matrixWorld}))}}),n){var s=80,y=new ArrayBuffer(2*l+3*l*4*4+80+4);(M=new DataView(y)).setUint32(s,l,!0),s+=4;for(var f=0,m=i.length;f<m;f++){var c=(w=i[f]).geometry.vertices,p=w.geometry.faces,x=w.matrixWorld;t.getNormalMatrix(x);for(var v=0,d=p.length;v<d;v++){var u=p[v];r.copy(u.normal).applyMatrix3(t).normalize(),M.setFloat32(s,r.x,!0),s+=4,M.setFloat32(s,r.y,!0),s+=4,M.setFloat32(s,r.z,!0),s+=4;for(var g=[u.a,u.b,u.c],h=0;h<3;h++)r.copy(c[g[h]]).applyMatrix4(x),M.setFloat32(s,r.x,!0),s+=4,M.setFloat32(s,r.y,!0),s+=4,M.setFloat32(s,r.z,!0),s+=4;M.setUint16(s,0,!0),s+=2}}return M}var M="";for(M+="solid exported\n",f=0,m=i.length;f<m;f++){var w;for(c=(w=i[f]).geometry.vertices,p=w.geometry.faces,x=w.matrixWorld,t.getNormalMatrix(x),v=0,d=p.length;v<d;v++){for(u=p[v],r.copy(u.normal).applyMatrix3(t).normalize(),M+="\tfacet normal "+r.x+" "+r.y+" "+r.z+"\n",M+="\t\touter loop\n",g=[u.a,u.b,u.c],h=0;h<3;h++)r.copy(c[g[h]]).applyMatrix4(x),M+="\t\t\tvertex "+r.x+" "+r.y+" "+r.z+"\n";M+="\t\tendloop\n",M+="\tendfacet\n"}}return M+="endsolid exported\n"})},o});
//# sourceMappingURL=../sourcemaps/exporters/STLExporter.js.map
