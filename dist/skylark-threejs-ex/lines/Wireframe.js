/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./LineSegmentsGeometry","./LineMaterial"],function(t,e,r){"use strict";var n,i,a=function(n,i){t.Mesh.call(this),this.type="Wireframe",this.geometry=void 0!==n?n:new e,this.material=void 0!==i?i:new r({color:16777215*Math.random()})};return a.prototype=Object.assign(Object.create(t.Mesh.prototype),{constructor:a,isWireframe:!0,computeLineDistances:(n=new t.Vector3,i=new t.Vector3,function(){for(var e=this.geometry,r=e.attributes.instanceStart,a=e.attributes.instanceEnd,s=new Float32Array(2*r.data.count),o=0,c=0,u=r.data.count;o<u;o++,c+=2)n.fromBufferAttribute(r,o),i.fromBufferAttribute(a,o),s[c]=0===c?0:s[c-1],s[c+1]=s[c]+n.distanceTo(i);var f=new t.InstancedInterleavedBuffer(s,2,1);return e.setAttribute("instanceDistanceStart",new t.InterleavedBufferAttribute(f,1,0)),e.setAttribute("instanceDistanceEnd",new t.InterleavedBufferAttribute(f,1,1)),this})}),a});
//# sourceMappingURL=../sourcemaps/lines/Wireframe.js.map
