/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(r){return r.GeometryUtils={hilbert2D:function(e,t,o,y,p,i,l){e=void 0!==e?e:new r.Vector3(0,0,0);var a=(t=void 0!==t?t:10)/2,s=(o=void 0!==o?o:1,y=void 0!==y?y:0,p=void 0!==p?p:1,i=void 0!==i?i:2,l=void 0!==l?l:3,[new r.Vector3(e.x-a,e.y,e.z-a),new r.Vector3(e.x-a,e.y,e.z+a),new r.Vector3(e.x+a,e.y,e.z+a),new r.Vector3(e.x+a,e.y,e.z-a)]),h=[s[y],s[p],s[i],s[l]];if(0<=--o){var n=[];return Array.prototype.push.apply(n,r.GeometryUtils.hilbert2D(h[0],a,o,y,l,i,p)),Array.prototype.push.apply(n,r.GeometryUtils.hilbert2D(h[1],a,o,y,p,i,l)),Array.prototype.push.apply(n,r.GeometryUtils.hilbert2D(h[2],a,o,y,p,i,l)),Array.prototype.push.apply(n,r.GeometryUtils.hilbert2D(h[3],a,o,i,p,y,l)),n}return h},hilbert3D:function(e,t,o,y,p,i,l,a,s,h,n){e=void 0!==e?e:new r.Vector3(0,0,0);var v=(t=void 0!==t?t:10)/2,u=(o=void 0!==o?o:1,y=void 0!==y?y:0,p=void 0!==p?p:1,i=void 0!==i?i:2,l=void 0!==l?l:3,a=void 0!==a?a:4,s=void 0!==s?s:5,h=void 0!==h?h:6,n=void 0!==n?n:7,[new r.Vector3(e.x-v,e.y+v,e.z-v),new r.Vector3(e.x-v,e.y+v,e.z+v),new r.Vector3(e.x-v,e.y-v,e.z+v),new r.Vector3(e.x-v,e.y-v,e.z-v),new r.Vector3(e.x+v,e.y-v,e.z-v),new r.Vector3(e.x+v,e.y-v,e.z+v),new r.Vector3(e.x+v,e.y+v,e.z+v),new r.Vector3(e.x+v,e.y+v,e.z-v)]),d=[u[y],u[p],u[i],u[l],u[a],u[s],u[h],u[n]];if(--o>=0){var c=[];return Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[0],v,o,y,l,a,n,h,s,i,p)),Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[1],v,o,y,n,h,p,i,s,a,l)),Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[2],v,o,y,n,h,p,i,s,a,l)),Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[3],v,o,i,l,y,p,h,n,a,s)),Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[4],v,o,i,l,y,p,h,n,a,s)),Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[5],v,o,a,l,i,s,h,p,y,n)),Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[6],v,o,a,l,i,s,h,p,y,n)),Array.prototype.push.apply(c,r.GeometryUtils.hilbert3D(d[7],v,o,h,s,i,p,y,l,a,n)),c}return d}},r.GeometryUtils});
//# sourceMappingURL=../sourcemaps/utils/GeometryUtils.js.map
