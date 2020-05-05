/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";return function(){function t(e,t){this.mesh=e,this.iks=t||[],this._valid()}var r,i,o,n,a,s,l,h,c,p;function d(t,r){e.Object3D.call(this),this.root=t,this.iks=r||[],this.matrix.copy(t.matrixWorld),this.matrixAutoUpdate=!1,this.sphereGeometry=new e.SphereBufferGeometry(.25,16,8),this.targetSphereMaterial=new e.MeshBasicMaterial({color:new e.Color(16746632),depthTest:!1,depthWrite:!1,transparent:!0}),this.effectorSphereMaterial=new e.MeshBasicMaterial({color:new e.Color(8978312),depthTest:!1,depthWrite:!1,transparent:!0}),this.linkSphereMaterial=new e.MeshBasicMaterial({color:new e.Color(8947967),depthTest:!1,depthWrite:!1,transparent:!0}),this.lineMaterial=new e.LineBasicMaterial({color:new e.Color(16711680),depthTest:!1,depthWrite:!1,transparent:!0}),this._init()}return t.prototype={constructor:t,update:(r=new e.Quaternion,i=new e.Vector3,o=new e.Vector3,n=new e.Vector3,a=new e.Vector3,s=new e.Vector3,l=new e.Quaternion,h=new e.Vector3,c=new e.Vector3,p=new e.Vector3,function(){for(var e=this.mesh.skeleton.bones,t=this.iks,d=Math,u=0,f=t.length;u<f;u++){var m=t[u],v=e[m.effector],w=e[m.target];i.setFromMatrixPosition(w.matrixWorld);for(var M=m.links,x=void 0!==m.iteration?m.iteration:1,y=0;y<x;y++){for(var g=!1,k=0,b=M.length;k<b;k++){var V=e[M[k].index];if(!1===M[k].enabled)break;var W=M[k].limitation,A=M[k].rotationMin,S=M[k].rotationMax;V.matrixWorld.decompose(s,l,h),l.inverse(),n.setFromMatrixPosition(v.matrixWorld),a.subVectors(n,s),a.applyQuaternion(l),a.normalize(),o.subVectors(i,s),o.applyQuaternion(l),o.normalize();var B=o.dot(a);if(B>1?B=1:B<-1&&(B=-1),!((B=d.acos(B))<1e-5)){if(void 0!==m.minAngle&&B<m.minAngle&&(B=m.minAngle),void 0!==m.maxAngle&&B>m.maxAngle&&(B=m.maxAngle),c.crossVectors(a,o),c.normalize(),r.setFromAxisAngle(c,B),V.quaternion.multiply(r),void 0!==W){var F=V.quaternion.w;F>1&&(F=1);var j=d.sqrt(1-F*F);V.quaternion.set(W.x*j,W.y*j,W.z*j,F)}void 0!==A&&V.rotation.setFromVector3(V.rotation.toVector3(p).max(A)),void 0!==S&&V.rotation.setFromVector3(V.rotation.toVector3(p).min(S)),V.updateMatrixWorld(!0),g=!0}}if(!g)break}}return this}),createHelper:function(){return new d(this.mesh,this.mesh.geometry.userData.MMD.iks)},_valid:function(){for(var e=this.iks,t=this.mesh.skeleton.bones,r=0,i=e.length;r<i;r++){var o,n,a=e[r],s=t[a.effector],l=a.links;o=s;for(var h=0,c=l.length;h<c;h++)n=t[l[h].index],o.parent!==n&&console.warn("THREE.CCDIKSolver: bone "+o.name+" is not the child of bone "+n.name),o=n}}},d.prototype=Object.assign(Object.create(e.Object3D.prototype),{constructor:d,updateMatrixWorld:function(){var t=new e.Matrix4,r=new e.Vector3;function i(e,t){return r.setFromMatrixPosition(e.matrixWorld).applyMatrix4(t)}function o(e,t,r,o){var n=i(r,o);e[3*t+0]=n.x,e[3*t+1]=n.y,e[3*t+2]=n.z}return function(r){var n=this.root;if(this.visible){var a=0,s=this.iks,l=n.skeleton.bones;t.getInverse(n.matrixWorld);for(var h=0,c=s.length;h<c;h++){var p=s[h],d=l[p.target],u=l[p.effector],f=this.children[a++],m=this.children[a++];f.position.copy(i(d,t)),m.position.copy(i(u,t));for(var v=0,w=p.links.length;v<w;v++){var M=l[p.links[v].index];this.children[a++].position.copy(i(M,t))}var x=this.children[a++],y=x.geometry.attributes.position.array;o(y,0,d,t),o(y,1,u,t);for(v=0,w=p.links.length;v<w;v++){o(y,v+2,M=l[p.links[v].index],t)}x.geometry.attributes.position.needsUpdate=!0}}this.matrix.copy(n.matrixWorld),e.Object3D.prototype.updateMatrixWorld.call(this,r)}}(),_init:function(){var t=this,r=this.iks;function i(r){return new e.Line(function(t){var r=new e.BufferGeometry,i=new Float32Array(3*(2+t.links.length));return r.setAttribute("position",new e.BufferAttribute(i,3)),r}(r),t.lineMaterial)}for(var o=0,n=r.length;o<n;o++){var a=r[o];this.add(new e.Mesh(t.sphereGeometry,t.targetSphereMaterial)),this.add(new e.Mesh(t.sphereGeometry,t.effectorSphereMaterial));for(var s=0,l=a.links.length;s<l;s++)this.add(new e.Mesh(t.sphereGeometry,t.linkSphereMaterial));this.add(i(a))}}}),t}()});
//# sourceMappingURL=../sourcemaps/animation/CCDIKSolver.js.map
