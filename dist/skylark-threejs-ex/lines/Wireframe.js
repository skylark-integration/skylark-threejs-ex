/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./LineSegmentsGeometry","./LineMaterial"],function(e,t,r,n){"use strict";var i,a,s=function(t,i){e.Mesh.call(this),this.type="Wireframe",this.geometry=void 0!==t?t:new r,this.material=void 0!==i?i:new n({color:16777215*Math.random()})};return s.prototype=Object.assign(Object.create(e.Mesh.prototype),{constructor:s,isWireframe:!0,computeLineDistances:(i=new e.Vector3,a=new e.Vector3,function(){for(var t=this.geometry,r=t.attributes.instanceStart,n=t.attributes.instanceEnd,s=new Float32Array(2*r.data.count),o=0,c=0,u=r.data.count;o<u;o++,c+=2)i.fromBufferAttribute(r,o),a.fromBufferAttribute(n,o),s[c]=0===c?0:s[c-1],s[c+1]=s[c]+i.distanceTo(a);var f=new e.InstancedInterleavedBuffer(s,2,1);return t.setAttribute("instanceDistanceStart",new e.InterleavedBufferAttribute(f,1,0)),t.setAttribute("instanceDistanceEnd",new e.InterleavedBufferAttribute(f,1,1)),this})}),t.lines.Wireframe=s});
//# sourceMappingURL=../sourcemaps/lines/Wireframe.js.map
