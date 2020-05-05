/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var r=function(r,e,o,u,s,h){t.BufferGeometry.call(this);for(var p=(r=r||1)/2,f=(e=e||1)/2,i=(o=o||1)/2,a=r/(u=Math.floor(u)||1),n=e/(s=Math.floor(s)||1),c=o/(h=Math.floor(h)||1),l=[],y=-p,b=-f,B=-i,M=0;M<=u;M++)l.push(y,-f,-i,y,f,-i),l.push(y,f,-i,y,f,i),l.push(y,f,i,y,-f,i),l.push(y,-f,i,y,-f,-i),y+=a;for(M=0;M<=s;M++)l.push(-p,b,-i,p,b,-i),l.push(p,b,-i,p,b,i),l.push(p,b,i,-p,b,i),l.push(-p,b,i,-p,b,-i),b+=n;for(M=0;M<=h;M++)l.push(-p,-f,B,-p,f,B),l.push(-p,f,B,p,f,B),l.push(p,f,B,p,-f,B),l.push(p,-f,B,-p,-f,B),B+=c;this.setAttribute("position",new t.Float32BufferAttribute(l,3))};return(r.prototype=Object.create(t.BufferGeometry.prototype)).constructor=r,r});
//# sourceMappingURL=../sourcemaps/geometries/BoxLineGeometry.js.map
