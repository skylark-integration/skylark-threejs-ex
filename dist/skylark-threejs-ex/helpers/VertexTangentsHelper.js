/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var r=new t.Vector3,o=new t.Vector3;function i(e,r,o,i){this.object=e,this.size=void 0!==r?r:1;var s=void 0!==o?o:65535,n=void 0!==i?i:1,a=this.object.geometry;if(a&&a.isBufferGeometry){var c=a.attributes.tangent.count,u=new t.BufferGeometry,p=new t.Float32BufferAttribute(2*c*3,3);u.setAttribute("position",p),t.LineSegments.call(this,u,new t.LineBasicMaterial({color:s,linewidth:n})),this.matrixAutoUpdate=!1,this.update()}else console.error("THREE.VertexTangentsHelper: geometry not an instance of THREE.BufferGeometry.",a)}return i.prototype=Object.create(t.LineSegments.prototype),i.prototype.constructor=i,i.prototype.update=function(){this.object.updateMatrixWorld(!0);for(var t=this.object.matrixWorld,e=this.geometry.attributes.position,i=this.object.geometry,s=i.attributes.position,n=i.attributes.tangent,a=0,c=0,u=s.count;c<u;c++)r.set(s.getX(c),s.getY(c),s.getZ(c)).applyMatrix4(t),o.set(n.getX(c),n.getY(c),n.getZ(c)),o.transformDirection(t).multiplyScalar(this.size).add(r),e.setXYZ(a,r.x,r.y,r.z),a+=1,e.setXYZ(a,o.x,o.y,o.z),a+=1;e.needsUpdate=!0},e.helpers.VertexTangentsHelper=i});
//# sourceMappingURL=../sourcemaps/helpers/VertexTangentsHelper.js.map
