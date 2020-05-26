/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var r=function(e,r,o,u,s,h){t.BufferGeometry.call(this);for(var f=(e=e||1)/2,p=(r=r||1)/2,i=(o=o||1)/2,n=e/(u=Math.floor(u)||1),a=r/(s=Math.floor(s)||1),c=o/(h=Math.floor(h)||1),l=[],y=-f,m=-p,B=-i,G=0;G<=u;G++)l.push(y,-p,-i,y,p,-i),l.push(y,p,-i,y,p,i),l.push(y,p,i,y,-p,i),l.push(y,-p,i,y,-p,-i),y+=n;for(G=0;G<=s;G++)l.push(-f,m,-i,f,m,-i),l.push(f,m,-i,f,m,i),l.push(f,m,i,-f,m,i),l.push(-f,m,i,-f,m,-i),m+=a;for(G=0;G<=h;G++)l.push(-f,-p,B,-f,p,B),l.push(-f,p,B,f,p,B),l.push(f,p,B,f,-p,B),l.push(f,-p,B,-f,-p,B),B+=c;this.setAttribute("position",new t.Float32BufferAttribute(l,3))};return(r.prototype=Object.create(t.BufferGeometry.prototype)).constructor=r,e.geometries.BoxLineGeometry=BufferGeometry});
//# sourceMappingURL=../sourcemaps/geometries/BoxLineGeometry.js.map
