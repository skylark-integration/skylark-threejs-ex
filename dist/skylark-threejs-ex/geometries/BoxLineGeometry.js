/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.BoxLineGeometry=function(t,o,r,u,p,s){e.BufferGeometry.call(this);for(var h=(t=t||1)/2,f=(o=o||1)/2,i=(r=r||1)/2,n=t/(u=Math.floor(u)||1),y=o/(p=Math.floor(p)||1),a=r/(s=Math.floor(s)||1),B=[],c=-h,l=-f,m=-i,G=0;G<=u;G++)B.push(c,-f,-i,c,f,-i),B.push(c,f,-i,c,f,i),B.push(c,f,i,c,-f,i),B.push(c,-f,i,c,-f,-i),c+=n;for(G=0;G<=p;G++)B.push(-h,l,-i,h,l,-i),B.push(h,l,-i,h,l,i),B.push(h,l,i,-h,l,i),B.push(-h,l,i,-h,l,-i),l+=y;for(G=0;G<=s;G++)B.push(-h,-f,m,-h,f,m),B.push(-h,f,m,h,f,m),B.push(h,f,m,h,-f,m),B.push(h,-f,m,-h,-f,m),m+=a;this.setAttribute("position",new e.Float32BufferAttribute(B,3))},e.BoxLineGeometry.prototype=Object.create(e.BufferGeometry.prototype),e.BoxLineGeometry.prototype.constructor=e.BoxLineGeometry,e.BoxLineGeometry});
//# sourceMappingURL=../sourcemaps/geometries/BoxLineGeometry.js.map
