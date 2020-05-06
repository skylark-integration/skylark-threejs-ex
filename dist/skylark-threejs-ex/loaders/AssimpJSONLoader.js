/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.AssimpJSONLoader=function(r){this.manager=void 0!==r?r:e.DefaultLoadingManager},e.AssimpJSONLoader.prototype={constructor:e.AssimpJSONLoader,crossOrigin:"anonymous",load:function(r,a,t,s){var n=this,i=void 0===n.path?e.LoaderUtils.extractUrlBase(r):n.path,o=new e.FileLoader(this.manager);o.setPath(n.path),o.load(r,function(e){var r=JSON.parse(e),t=r.__metadata__;if(void 0!==t){if("assimp2json"!==t.format)return void s("THREE.AssimpJSONLoader: Not an assimp2json scene.");if(t.version<100&&t.version>=200)return void s("THREE.AssimpJSONLoader: Unsupported assimp2json file format version.")}a(n.parse(r,i))},t,s)},setPath:function(e){return this.path=e,this},setResourcePath:function(e){return this.resourcePath=e,this},setCrossOrigin:function(e){return this.crossOrigin=e,this},parse:function(r,a){function t(e,r){for(var a=new Array(e.length),t=0;t<e.length;++t)a[t]=r.call(this,e[t]);return a}var s=new e.TextureLoader(this.manager);s.setPath(this.resourcePath||a).setCrossOrigin(this.crossOrigin);var n=t(r.meshes,function(r){var a,t,s,n=new e.BufferGeometry,i=[],o=r.vertices||[],c=r.normals||[],u=r.texturecoords||[],h=r.colors||[];for(u=u[0]||[],a=0,t=r.faces.length;a<t;a++)s=r.faces[a],i.push(s[0],s[1],s[2]);return n.setIndex(i),n.addAttribute("position",new e.Float32BufferAttribute(o,3)),c.length>0&&n.addAttribute("normal",new e.Float32BufferAttribute(c,3)),u.length>0&&n.addAttribute("uv",new e.Float32BufferAttribute(u,2)),h.length>0&&n.addAttribute("color",new e.Float32BufferAttribute(h,3)),n.computeBoundingSphere(),n}),i=t(r.materials,function(r){var a=new e.MeshPhongMaterial;for(var t in r.properties){var n=r.properties[t],i=n.key,o=n.value;switch(i){case"$tex.file":var c=n.semantic;if(1===c||2===c||4===c||5===c||6===c){var u;switch(c){case 1:u="map";break;case 2:u="specularMap";break;case 4:u="emissiveMap";break;case 5:u="bumpMap";break;case 6:u="normalMap"}var h=s.load(o);h.wrapS=h.wrapT=e.RepeatWrapping,a[u]=h}break;case"?mat.name":a.name=o;break;case"$clr.diffuse":a.color.fromArray(o);break;case"$clr.specular":a.specular.fromArray(o);break;case"$clr.emissive":a.emissive.fromArray(o);break;case"$mat.shininess":a.shininess=o;break;case"$mat.shadingm":a.flatShading=1===o;break;case"$mat.opacity":o<1&&(a.opacity=o,a.transparent=!0)}}return a});return function r(a,t,s,n){var i,o,c=new e.Object3D;for(c.name=t.name||"",c.matrix=(new e.Matrix4).fromArray(t.transformation).transpose(),c.matrix.decompose(c.position,c.quaternion,c.scale),i=0;t.meshes&&i<t.meshes.length;i++)o=t.meshes[i],c.add(new e.Mesh(s[o],n[a.meshes[o].materialindex]));for(i=0;t.children&&i<t.children.length;i++)c.add(r(a,t.children[i],s,n));return c}(r,r.rootnode,n,i)}},e.AssimpJSONLoader});
//# sourceMappingURL=../sourcemaps/loaders/AssimpJSONLoader.js.map