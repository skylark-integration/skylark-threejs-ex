/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var a={createMeshesFromInstancedMesh:function(t){for(var a=new e.Group,n=t.count,r=t.geometry,c=t.material,s=0;s<n;s++){var i=new e.Mesh(r,c);t.getMatrixAt(s,i.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),a.add(i)}return a.copy(t),a.updateMatrixWorld(),a},createMultiMaterialObject:function(t,a){for(var n=new e.Group,r=0,c=a.length;r<c;r++)n.add(new e.Mesh(t,a[r]));return n},detach:function(e,t,a){console.warn("THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead."),a.attach(e)},attach:function(e,t,a){console.warn("THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead."),a.attach(e)}};return t.utils.SceneUtils=a});
//# sourceMappingURL=../sourcemaps/utils/SceneUtils.js.map
