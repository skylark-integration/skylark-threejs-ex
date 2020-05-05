/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(s){"use strict";return class extends s.Group{constructor(e){super(),this.csm=e,this.displayFrustum=!0,this.displayPlanes=!0,this.displayShadowBounds=!0;const t=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=new Float32Array(24),a=new s.BufferGeometry;a.setIndex(new s.BufferAttribute(t,1)),a.setAttribute("position",new s.BufferAttribute(i,3,!1));const o=new s.LineSegments(a,new s.LineBasicMaterial);this.add(o),this.frustumLines=o,this.cascadeLines=[],this.cascadePlanes=[],this.shadowLines=[]}updateVisibility(){const s=this.displayFrustum,e=this.displayPlanes,t=this.displayShadowBounds,i=this.frustumLines,a=this.cascadeLines,o=this.cascadePlanes,n=this.shadowLines;for(let i=0,r=a.length;i<r;i++){const r=a[i],c=o[i],h=n[i];r.visible=s,c.visible=s&&e,h.visible=t}i.visible=s}update(){const e=this.csm,t=e.camera,i=e.cascades,a=e.mainFrustum,o=e.frustums,n=e.lights,r=this.frustumLines.geometry.getAttribute("position"),c=this.cascadeLines,h=this.cascadePlanes,d=this.shadowLines;for(this.position.copy(t.position),this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.updateMatrixWorld(!0);c.length>i;)this.remove(c.pop()),this.remove(h.pop()),this.remove(d.pop());for(;c.length<i;){const e=new s.Box3Helper(new s.Box3,16777215),t=new s.MeshBasicMaterial({transparent:!0,opacity:.1,depthWrite:!1,side:s.DoubleSide}),i=new s.Mesh(new s.PlaneBufferGeometry,t),a=new s.Group,o=new s.Box3Helper(new s.Box3,16776960);a.add(o),this.add(e),this.add(i),this.add(a),c.push(e),h.push(i),d.push(a)}for(let s=0;s<i;s++){const e=o[s],t=n[s].shadow.camera,i=e.vertices.far,a=c[s],r=h[s],p=d[s],u=p.children[0];a.box.min.copy(i[2]),a.box.max.copy(i[0]),a.box.max.z+=1e-4,r.position.addVectors(i[0],i[2]),r.position.multiplyScalar(.5),r.scale.subVectors(i[0],i[2]),r.scale.z=1e-4,this.remove(p),p.position.copy(t.position),p.quaternion.copy(t.quaternion),p.scale.copy(t.scale),p.updateMatrixWorld(!0),this.attach(p),u.box.min.set(t.bottom,t.left,-t.far),u.box.max.set(t.top,t.right,-t.near)}const p=a.vertices.near,u=a.vertices.far;r.setXYZ(0,u[0].x,u[0].y,u[0].z),r.setXYZ(1,u[3].x,u[3].y,u[3].z),r.setXYZ(2,u[2].x,u[2].y,u[2].z),r.setXYZ(3,u[1].x,u[1].y,u[1].z),r.setXYZ(4,p[0].x,p[0].y,p[0].z),r.setXYZ(5,p[3].x,p[3].y,p[3].z),r.setXYZ(6,p[2].x,p[2].y,p[2].z),r.setXYZ(7,p[1].x,p[1].y,p[1].z),r.needsUpdate=!0}}});
//# sourceMappingURL=../sourcemaps/csm/CSMHelper.js.map
