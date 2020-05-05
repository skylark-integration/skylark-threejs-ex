/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";return function(){var e=new t.Triangle;function r(t){var e=t.geometry;if(!e.isBufferGeometry||3!==e.attributes.position.itemSize)throw new Error("THREE.MeshSurfaceSampler: Requires BufferGeometry triangle mesh.");e.index&&(console.warn("THREE.MeshSurfaceSampler: Converting geometry to non-indexed BufferGeometry."),e=e.toNonIndexed()),this.geometry=e,this.positionAttribute=this.geometry.getAttribute("position"),this.weightAttribute=null,this.distribution=null}return r.prototype={constructor:r,setWeightAttribute:function(t){return this.weightAttribute=t?this.geometry.getAttribute(t):null,this},build:function(){for(var t=this.positionAttribute,r=this.weightAttribute,i=new Float32Array(t.count/3),o=0;o<t.count;o+=3){var n=1;r&&(n=r.getX(o)+r.getX(o+1)+r.getX(o+2)),e.a.fromBufferAttribute(t,o),e.b.fromBufferAttribute(t,o+1),e.c.fromBufferAttribute(t,o+2),n*=e.getArea(),i[o/3]=n}this.distribution=new Float32Array(t.count/3);var u=0;for(o=0;o<i.length;o++)u+=i[o],this.distribution[o]=u;return this},sample:function(t,e){var r=this.distribution[this.distribution.length-1],i=this.binarySearch(Math.random()*r);return this.sampleFace(i,t,e)},binarySearch:function(t){for(var e=this.distribution,r=0,i=e.length-1,o=-1;r<=i;){var n=Math.floor((r+i)/2);if(0===n||e[n-1]<=t&&e[n]>t){o=n;break}t<e[n]?i=n-1:r=n+1}return o},sampleFace:function(t,r,i){var o=Math.random(),n=Math.random();return o+n>1&&(o=1-o,n=1-n),e.a.fromBufferAttribute(this.positionAttribute,3*t),e.b.fromBufferAttribute(this.positionAttribute,3*t+1),e.c.fromBufferAttribute(this.positionAttribute,3*t+2),r.set(0,0,0).addScaledVector(e.a,o).addScaledVector(e.b,n).addScaledVector(e.c,1-(o+n)),e.getNormal(i),this}},r}()});
//# sourceMappingURL=../sourcemaps/math/MeshSurfaceSampler.js.map