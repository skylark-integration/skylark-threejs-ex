/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var a,t,n,r;function o(){r.rotation.y=-Date.now()/4e3,n.render(t,a),self.requestAnimationFrame&&self.requestAnimationFrame(o)}var i=1;function s(){var e=1e4*Math.sin(i++);return e-Math.floor(e)}return function(i,c,l,p,w){(a=new e.PerspectiveCamera(40,c/l,1,1e3)).position.z=200,(t=new e.Scene).fog=new e.Fog(4473958,100,400),t.background=new e.Color(4473958),r=new e.Group,t.add(r);var m=(new e.ImageBitmapLoader).setPath(w);m.setOptions({imageOrientation:"flipY"}),m.load("textures/matcaps/matcap-porcelain-white.jpg",function(a){for(var t=new e.CanvasTexture(a),w=new e.IcosahedronBufferGeometry(5,3),m=[new e.MeshMatcapMaterial({color:11150559,matcap:t}),new e.MeshMatcapMaterial({color:6315408,matcap:t}),new e.MeshMatcapMaterial({color:14699071,matcap:t}),new e.MeshMatcapMaterial({color:14877782,matcap:t})],u=0;u<100;u++){var M=m[u%m.length],f=new e.Mesh(w,M);f.position.x=200*s()-100,f.position.y=200*s()-100,f.position.z=200*s()-100,f.scale.setScalar(s()+1),r.add(f)}(n=new e.WebGLRenderer({antialias:!0,canvas:i})).setPixelRatio(p),n.setSize(c,l,!1),o()})}});
//# sourceMappingURL=../sourcemaps/offscreen/scene.js.map
