/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.SceneUtils={createMeshesFromInstancedMesh:function(t){for(var a=new e.Group,n=t.count,c=t.geometry,r=t.material,i=0;i<n;i++){var s=new e.Mesh(c,r);t.getMatrixAt(i,s.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),a.add(s)}return a.copy(t),a.updateMatrixWorld(),a},createMultiMaterialObject:function(t,a){for(var n=new e.Group,c=0,r=a.length;c<r;c++)n.add(new e.Mesh(t,a[c]));return n},detach:function(e,t,a){console.warn("THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead."),a.attach(e)},attach:function(e,t,a){console.warn("THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead."),a.attach(e)}},e.SceneUtils});
//# sourceMappingURL=../sourcemaps/utils/SceneUtils.js.map
