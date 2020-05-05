/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var r=function(e){this.maxEdgeLength=e};return r.prototype.modify=function(r){for(var o,l=[],t=[],c=this.maxEdgeLength*this.maxEdgeLength,s=0,n=r.faceVertexUvs.length;s<n;s++)t[s]=[];for(s=0,n=r.faces.length;s<n;s++){var v=r.faces[s];if(v instanceof e.Face3){var a=v.a,x=v.b,p=v.c,f=r.vertices[a],i=r.vertices[x],h=r.vertices[p],m=f.distanceToSquared(i),y=i.distanceToSquared(h),C=f.distanceToSquared(h);if(m>c||y>c||C>c){var N=r.vertices.length,g=v.clone(),u=v.clone();if(m>=y&&m>=C){if((d=f.clone()).lerp(i,.5),g.a=a,g.b=N,g.c=p,u.a=N,u.b=x,u.c=p,3===v.vertexNormals.length)(b=v.vertexNormals[0].clone()).lerp(v.vertexNormals[1],.5),g.vertexNormals[1].copy(b),u.vertexNormals[0].copy(b);if(3===v.vertexColors.length)(U=v.vertexColors[0].clone()).lerp(v.vertexColors[1],.5),g.vertexColors[1].copy(U),u.vertexColors[0].copy(U);o=0}else if(y>=m&&y>=C){if((d=i.clone()).lerp(h,.5),g.a=a,g.b=x,g.c=N,u.a=N,u.b=p,u.c=a,3===v.vertexNormals.length)(b=v.vertexNormals[1].clone()).lerp(v.vertexNormals[2],.5),g.vertexNormals[2].copy(b),u.vertexNormals[0].copy(b),u.vertexNormals[1].copy(v.vertexNormals[2]),u.vertexNormals[2].copy(v.vertexNormals[0]);if(3===v.vertexColors.length)(U=v.vertexColors[1].clone()).lerp(v.vertexColors[2],.5),g.vertexColors[2].copy(U),u.vertexColors[0].copy(U),u.vertexColors[1].copy(v.vertexColors[2]),u.vertexColors[2].copy(v.vertexColors[0]);o=1}else{var d,b,U;if((d=f.clone()).lerp(h,.5),g.a=a,g.b=x,g.c=N,u.a=N,u.b=x,u.c=p,3===v.vertexNormals.length)(b=v.vertexNormals[0].clone()).lerp(v.vertexNormals[2],.5),g.vertexNormals[2].copy(b),u.vertexNormals[0].copy(b);if(3===v.vertexColors.length)(U=v.vertexColors[0].clone()).lerp(v.vertexColors[2],.5),g.vertexColors[2].copy(U),u.vertexColors[0].copy(U);o=2}l.push(g,u),r.vertices.push(d);for(var V=0,q=r.faceVertexUvs.length;V<q;V++)if(r.faceVertexUvs[V].length){var E=r.faceVertexUvs[V][s],L=E[0],S=E[1],T=E[2];if(0===o){(F=L.clone()).lerp(S,.5);var k=[L.clone(),F.clone(),T.clone()],j=[F.clone(),S.clone(),T.clone()]}else if(1===o){(F=S.clone()).lerp(T,.5);k=[L.clone(),S.clone(),F.clone()],j=[F.clone(),T.clone(),L.clone()]}else{var F;(F=L.clone()).lerp(T,.5);k=[L.clone(),S.clone(),F.clone()],j=[F.clone(),S.clone(),T.clone()]}t[V].push(k,j)}}else{l.push(v);for(V=0,q=r.faceVertexUvs.length;V<q;V++)t[V].push(r.faceVertexUvs[V][s])}}}r.faces=l,r.faceVertexUvs=t},r});
//# sourceMappingURL=../sourcemaps/modifiers/TessellateModifier.js.map
