/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){var t,n,r,o,i,s,a,l,p,m,u,c;return e.SkeletonUtils={retarget:(a=new e.Vector3,l=new e.Quaternion,p=new e.Vector3,m=new e.Matrix4,u=new e.Matrix4,c=new e.Matrix4,function(e,t,n){(n=n||{}).preserveMatrix=void 0===n.preserveMatrix||n.preserveMatrix,n.preservePosition=void 0===n.preservePosition||n.preservePosition,n.preserveHipPosition=void 0!==n.preserveHipPosition&&n.preserveHipPosition,n.useTargetMatrix=void 0!==n.useTargetMatrix&&n.useTargetMatrix,n.hip=void 0!==n.hip?n.hip:"hip",n.names=n.names||{};var r,o,i,s,f,x,d=t.isObject3D?t.skeleton.bones:this.getBones(t),h=e.isObject3D?e.skeleton.bones:this.getBones(e);if(e.isObject3D?e.skeleton.pose():(n.useTargetMatrix=!0,n.preserveMatrix=!1),n.preservePosition)for(f=[],x=0;x<h.length;x++)f.push(h[x].position.clone());if(n.preserveMatrix)for(e.updateMatrixWorld(),e.matrixWorld.identity(),x=0;x<e.children.length;++x)e.children[x].updateMatrixWorld(!0);if(n.offsets)for(r=[],x=0;x<h.length;++x)o=h[x],i=n.names[o.name]||o.name,n.offsets&&n.offsets[i]&&(o.matrix.multiply(n.offsets[i]),o.matrix.decompose(o.position,o.quaternion,o.scale),o.updateMatrixWorld()),r.push(o.matrixWorld.clone());for(x=0;x<h.length;++x){if(o=h[x],i=n.names[o.name]||o.name,s=this.getBoneByName(i,d),c.copy(o.matrixWorld),s){if(s.updateMatrixWorld(),n.useTargetMatrix?u.copy(s.matrixWorld):(u.getInverse(e.matrixWorld),u.multiply(s.matrixWorld)),p.setFromMatrixScale(u),u.scale(p.set(1/p.x,1/p.y,1/p.z)),c.makeRotationFromQuaternion(l.setFromRotationMatrix(u)),e.isObject3D){var v=h.indexOf(o),g=r?r[v]:m.getInverse(e.skeleton.boneInverses[v]);c.multiply(g)}c.copyPosition(u)}o.parent&&o.parent.isBone?(o.matrix.getInverse(o.parent.matrixWorld),o.matrix.multiply(c)):o.matrix.copy(c),n.preserveHipPosition&&i===n.hip&&o.matrix.setPosition(a.set(0,o.position.y,0)),o.matrix.decompose(o.position,o.quaternion,o.scale),o.updateMatrixWorld()}if(n.preservePosition)for(x=0;x<h.length;++x)o=h[x],(i=n.names[o.name]||o.name)!==n.hip&&o.position.copy(f[x]);n.preserveMatrix&&e.updateMatrixWorld(!0)}),retargetClip:function(t,n,r,o){(o=o||{}).useFirstFramePosition=void 0!==o.useFirstFramePosition&&o.useFirstFramePosition,o.fps=void 0!==o.fps?o.fps:30,o.names=o.names||[],n.isObject3D||(n=this.getHelperFromSkeleton(n));var i,s,a,l,p,m,u=Math.round(r.duration*(o.fps/1e3)*1e3),c=1/o.fps,f=[],x=new e.AnimationMixer(n),d=this.getBones(t.skeleton),h=[];for(x.clipAction(r).play(),x.update(0),n.updateMatrixWorld(),p=0;p<u;++p){var v=p*c;for(this.retarget(t,n,o),m=0;m<d.length;++m)l=o.names[d[m].name]||d[m].name,this.getBoneByName(l,n.skeleton)&&(s=d[m],a=h[m]=h[m]||{bone:s},o.hip===l&&(a.pos||(a.pos={times:new Float32Array(u),values:new Float32Array(3*u)}),o.useFirstFramePosition&&(0===p&&(i=s.position.clone()),s.position.sub(i)),a.pos.times[p]=v,s.position.toArray(a.pos.values,3*p)),a.quat||(a.quat={times:new Float32Array(u),values:new Float32Array(4*u)}),a.quat.times[p]=v,s.quaternion.toArray(a.quat.values,4*p));x.update(c),n.updateMatrixWorld()}for(p=0;p<h.length;++p)(a=h[p])&&(a.pos&&f.push(new e.VectorKeyframeTrack(".bones["+a.bone.name+"].position",a.pos.times,a.pos.values)),f.push(new e.QuaternionKeyframeTrack(".bones["+a.bone.name+"].quaternion",a.quat.times,a.quat.values)));return x.uncacheAction(r),new e.AnimationClip(r.name,-1,f)},getHelperFromSkeleton:function(t){var n=new e.SkeletonHelper(t.bones[0]);return n.skeleton=t,n},getSkeletonOffsets:(t=new e.Vector3,n=new e.Vector3,r=new e.Vector3,o=new e.Vector3,i=new e.Vector2,s=new e.Vector2,function(a,l,p){(p=p||{}).hip=void 0!==p.hip?p.hip:"hip",p.names=p.names||{},l.isObject3D||(l=this.getHelperFromSkeleton(l));var m,u,c,f,x=Object.keys(p.names),d=Object.values(p.names),h=l.isObject3D?l.skeleton.bones:this.getBones(l),v=a.isObject3D?a.skeleton.bones:this.getBones(a),g=[];for(a.skeleton.pose(),f=0;f<v.length;++f)if(m=v[f],c=p.names[m.name]||m.name,(u=this.getBoneByName(c,h))&&c!==p.hip){var M=this.getNearestBone(m.parent,x),y=this.getNearestBone(u.parent,d);M.updateMatrixWorld(),y.updateMatrixWorld(),t.setFromMatrixPosition(M.matrixWorld),n.setFromMatrixPosition(m.matrixWorld),r.setFromMatrixPosition(y.matrixWorld),o.setFromMatrixPosition(u.matrixWorld),i.subVectors(new e.Vector2(n.x,n.y),new e.Vector2(t.x,t.y)).normalize(),s.subVectors(new e.Vector2(o.x,o.y),new e.Vector2(r.x,r.y)).normalize();var b=i.angle()-s.angle(),k=(new e.Matrix4).makeRotationFromEuler(new e.Euler(0,0,b));m.matrix.multiply(k),m.matrix.decompose(m.position,m.quaternion,m.scale),m.updateMatrixWorld(),g[c]=k}return g}),renameBones:function(e,t){for(var n=this.getBones(e),r=0;r<n.length;++r){var o=n[r];t[o.name]&&(o.name=t[o.name])}return this},getBones:function(e){return Array.isArray(e)?e:e.bones},getBoneByName:function(e,t){for(var n=0,r=this.getBones(t);n<r.length;n++)if(e===r[n].name)return r[n]},getNearestBone:function(e,t){for(;e.isBone;){if(-1!==t.indexOf(e.name))return e;e=e.parent}},findBoneTrackData:function(e,t){for(var n=/\[(.*)\]\.(.*)/,r={name:e},o=0;o<t.length;++o){var i=n.exec(t[o].name);i&&e===i[1]&&(r[i[2]]=o)}return r},getEqualsBonesNames:function(e,t){var n=this.getBones(e),r=this.getBones(t),o=[];e:for(var i=0;i<n.length;i++)for(var s=n[i].name,a=0;a<r.length;a++)if(s===r[a].name){o.push(s);continue e}return o},clone:function(e){var t=new Map,n=new Map,r=e.clone();return function e(t,n,r){r(t,n);for(var o=0;o<t.children.length;o++)e(t.children[o],n.children[o],r)}(e,r,function(e,r){t.set(r,e),n.set(e,r)}),r.traverse(function(e){if(e.isSkinnedMesh){var r=e,o=t.get(e),i=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=i.map(function(e){return n.get(e)}),r.bind(r.skeleton,r.bindMatrix)}}),r}},e.SkeletonUtils});
//# sourceMappingURL=../sourcemaps/utils/SkeletonUtils.js.map