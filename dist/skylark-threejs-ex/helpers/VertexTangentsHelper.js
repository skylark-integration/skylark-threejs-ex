/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var e=new t.Vector3,r=new t.Vector3;function o(e,r,o,i){this.object=e,this.size=void 0!==r?r:1;var s=void 0!==o?o:65535,n=void 0!==i?i:1,a=this.object.geometry;if(a&&a.isBufferGeometry){var c=a.attributes.tangent.count,u=new t.BufferGeometry,p=new t.Float32BufferAttribute(2*c*3,3);u.setAttribute("position",p),t.LineSegments.call(this,u,new t.LineBasicMaterial({color:s,linewidth:n})),this.matrixAutoUpdate=!1,this.update()}else console.error("THREE.VertexTangentsHelper: geometry not an instance of THREE.BufferGeometry.",a)}return o.prototype=Object.create(t.LineSegments.prototype),o.prototype.constructor=o,o.prototype.update=function(){this.object.updateMatrixWorld(!0);for(var t=this.object.matrixWorld,o=this.geometry.attributes.position,i=this.object.geometry,s=i.attributes.position,n=i.attributes.tangent,a=0,c=0,u=s.count;c<u;c++)e.set(s.getX(c),s.getY(c),s.getZ(c)).applyMatrix4(t),r.set(n.getX(c),n.getY(c),n.getZ(c)),r.transformDirection(t).multiplyScalar(this.size).add(e),o.setXYZ(a,e.x,e.y,e.z),a+=1,o.setXYZ(a,r.x,r.y,r.z),a+=1;o.needsUpdate=!0},o});
//# sourceMappingURL=../sourcemaps/helpers/VertexTangentsHelper.js.map
