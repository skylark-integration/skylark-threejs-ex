/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,a){"use strict";var t,n,r,o;function i(){o.rotation.y=-Date.now()/4e3,r.render(n,t),self.requestAnimationFrame&&self.requestAnimationFrame(i)}var s=1;function c(){var e=1e4*Math.sin(s++);return e-Math.floor(e)}return a.offscreen.scene=function(a,s,l,p,f){(t=new e.PerspectiveCamera(40,s/l,1,1e3)).position.z=200,(n=new e.Scene).fog=new e.Fog(4473958,100,400),n.background=new e.Color(4473958),o=new e.Group,n.add(o);var w=(new e.ImageBitmapLoader).setPath(f);w.setOptions({imageOrientation:"flipY"}),w.load("textures/matcaps/matcap-porcelain-white.jpg",function(t){for(var n=new e.CanvasTexture(t),f=new e.IcosahedronBufferGeometry(5,3),w=[new e.MeshMatcapMaterial({color:11150559,matcap:n}),new e.MeshMatcapMaterial({color:6315408,matcap:n}),new e.MeshMatcapMaterial({color:14699071,matcap:n}),new e.MeshMatcapMaterial({color:14877782,matcap:n})],m=0;m<100;m++){var u=w[m%w.length],M=new e.Mesh(f,u);M.position.x=200*c()-100,M.position.y=200*c()-100,M.position.z=200*c()-100,M.scale.setScalar(c()+1),o.add(M)}(r=new e.WebGLRenderer({antialias:!0,canvas:a})).setPixelRatio(p),r.setSize(s,l,!1),i()})}});
//# sourceMappingURL=../sourcemaps/offscreen/scene.js.map
