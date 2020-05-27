/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var r=function(e,r,o,s,u,h){t.BufferGeometry.call(this);for(var p=(e=e||1)/2,f=(r=r||1)/2,i=(o=o||1)/2,n=e/(s=Math.floor(s)||1),a=r/(u=Math.floor(u)||1),c=o/(h=Math.floor(h)||1),l=[],y=-p,m=-f,B=-i,b=0;b<=s;b++)l.push(y,-f,-i,y,f,-i),l.push(y,f,-i,y,f,i),l.push(y,f,i,y,-f,i),l.push(y,-f,i,y,-f,-i),y+=n;for(b=0;b<=u;b++)l.push(-p,m,-i,p,m,-i),l.push(p,m,-i,p,m,i),l.push(p,m,i,-p,m,i),l.push(-p,m,i,-p,m,-i),m+=a;for(b=0;b<=h;b++)l.push(-p,-f,B,-p,f,B),l.push(-p,f,B,p,f,B),l.push(p,f,B,p,-f,B),l.push(p,-f,B,-p,-f,B),B+=c;this.setAttribute("position",new t.Float32BufferAttribute(l,3))};return(r.prototype=Object.create(t.BufferGeometry.prototype)).constructor=r,e.geometries.BoxLineGeometry=r});
//# sourceMappingURL=../sourcemaps/geometries/BoxLineGeometry.js.map
