/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
ddefine(["skylark-threejs","./LineSegmentsGeometry","./LineMaterial"],function(e){var t,r;return e.Wireframe=function(t,r){e.Mesh.call(this),this.type="Wireframe",this.geometry=void 0!==t?t:new e.LineSegmentsGeometry,this.material=void 0!==r?r:new e.LineMaterial({color:16777215*Math.random()})},e.Wireframe.prototype=Object.assign(Object.create(e.Mesh.prototype),{constructor:e.Wireframe,isWireframe:!0,computeLineDistances:(t=new e.Vector3,r=new e.Vector3,function(){for(var n=this.geometry,i=n.attributes.instanceStart,a=n.attributes.instanceEnd,s=new Float32Array(2*i.data.count),o=0,c=0,f=i.data.count;o<f;o++,c+=2)t.fromBufferAttribute(i,o),r.fromBufferAttribute(a,o),s[c]=0===c?0:s[c-1],s[c+1]=s[c]+t.distanceTo(r);var u=new e.InstancedInterleavedBuffer(s,2,1);return n.setAttribute("instanceDistanceStart",new e.InterleavedBufferAttribute(u,1,0)),n.setAttribute("instanceDistanceEnd",new e.InterleavedBufferAttribute(u,1,1)),this})}),e.Wireframe});
//# sourceMappingURL=../sourcemaps/lines/Wireframe.js.map
