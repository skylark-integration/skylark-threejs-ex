/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var n=function(){var e,n,i,r,s=0,o=new t.Vector3;function a(){this.tolerance=-1,this.faces=[],this.newFaces=[],this.assigned=new c,this.unassigned=new c,this.vertices=[]}function h(){this.normal=new t.Vector3,this.midpoint=new t.Vector3,this.area=0,this.constant=0,this.outside=null,this.mark=s,this.edge=null}function u(t,e){this.vertex=t,this.prev=null,this.next=null,this.twin=null,this.face=e}function l(t){this.point=t,this.prev=null,this.next=null,this.face=null}function c(){this.head=null,this.tail=null}return Object.assign(a.prototype,{setFromPoints:function(t){!0!==Array.isArray(t)&&console.error("THREE.ConvexHull: Points parameter is not an array."),t.length<4&&console.error("THREE.ConvexHull: The algorithm needs at least four points."),this.makeEmpty();for(var e=0,n=t.length;e<n;e++)this.vertices.push(new l(t[e]));return this.compute(),this},setFromObject:function(e){var n=[];return e.updateMatrixWorld(!0),e.traverse(function(e){var i,r,s,o=e.geometry;if(void 0!==o)if(o.isGeometry){var a=o.vertices;for(i=0,r=a.length;i<r;i++)(s=a[i].clone()).applyMatrix4(e.matrixWorld),n.push(s)}else if(o.isBufferGeometry){var h=o.attributes.position;if(void 0!==h)for(i=0,r=h.count;i<r;i++)(s=new t.Vector3).fromBufferAttribute(h,i).applyMatrix4(e.matrixWorld),n.push(s)}}),this.setFromPoints(n)},containsPoint:function(t){for(var e=this.faces,n=0,i=e.length;n<i;n++){if(e[n].distanceToPoint(t)>this.tolerance)return!1}return!0},intersectRay:function(t,e){for(var n=this.faces,i=-1/0,r=1/0,s=0,o=n.length;s<o;s++){var a=n[s],h=a.distanceToPoint(t.origin),u=a.normal.dot(t.direction);if(h>0&&u>=0)return null;var l=0!==u?-h/u:0;if(!(l<=0)&&(u>0?r=Math.min(l,r):i=Math.max(l,i),i>r))return null}return i!==-1/0?t.at(i,e):t.at(r,e),e},intersectsRay:function(t){return null!==this.intersectRay(t,o)},makeEmpty:function(){return this.faces=[],this.vertices=[],this},addVertexToFace:function(t,e){return t.face=e,null===e.outside?this.assigned.append(t):this.assigned.insertBefore(e.outside,t),e.outside=t,this},removeVertexFromFace:function(t,e){return t===e.outside&&(null!==t.next&&t.next.face===e?e.outside=t.next:e.outside=null),this.assigned.remove(t),this},removeAllVerticesFromFace:function(t){if(null!==t.outside){for(var e=t.outside,n=t.outside;null!==n.next&&n.next.face===t;)n=n.next;return this.assigned.removeSubList(e,n),e.prev=n.next=null,t.outside=null,e}},deleteFaceVertices:function(t,e){var n=this.removeAllVerticesFromFace(t);if(void 0!==n)if(void 0===e)this.unassigned.appendChain(n);else{var i=n;do{var r=i.next;e.distanceToPoint(i.point)>this.tolerance?this.addVertexToFace(i,e):this.unassigned.append(i),i=r}while(null!==i)}return this},resolveUnassignedPoints:function(t){if(!1===this.unassigned.isEmpty()){var e=this.unassigned.first();do{for(var n=e.next,i=this.tolerance,r=null,o=0;o<t.length;o++){var a=t[o];if(a.mark===s){var h=a.distanceToPoint(e.point);if(h>i&&(i=h,r=a),i>1e3*this.tolerance)break}}null!==r&&this.addVertexToFace(e,r),e=n}while(null!==e)}return this},computeExtremes:function(){var e,n,i,r=new t.Vector3,s=new t.Vector3,o=[],a=[];for(e=0;e<3;e++)o[e]=a[e]=this.vertices[0];for(r.copy(this.vertices[0].point),s.copy(this.vertices[0].point),e=0,n=this.vertices.length;e<n;e++){var h=this.vertices[e],u=h.point;for(i=0;i<3;i++)u.getComponent(i)<r.getComponent(i)&&(r.setComponent(i,u.getComponent(i)),o[i]=h);for(i=0;i<3;i++)u.getComponent(i)>s.getComponent(i)&&(s.setComponent(i,u.getComponent(i)),a[i]=h)}return this.tolerance=3*Number.EPSILON*(Math.max(Math.abs(r.x),Math.abs(s.x))+Math.max(Math.abs(r.y),Math.abs(s.y))+Math.max(Math.abs(r.z),Math.abs(s.z))),{min:o,max:a}},computeInitialHull:function(){void 0===e&&(e=new t.Line3,n=new t.Plane,i=new t.Vector3);var r,s,o,a,u,l,c,d,p,f=this.vertices,v=this.computeExtremes(),g=v.min,m=v.max,x=0,w=0;for(l=0;l<3;l++)(p=m[l].point.getComponent(l)-g[l].point.getComponent(l))>x&&(x=p,w=l);for(s=g[w],o=m[w],x=0,e.set(s.point,o.point),l=0,c=this.vertices.length;l<c;l++)(r=f[l])!==s&&r!==o&&(e.closestPointToPoint(r.point,!0,i),(p=i.distanceToSquared(r.point))>x&&(x=p,a=r));for(x=-1,n.setFromCoplanarPoints(s.point,o.point,a.point),l=0,c=this.vertices.length;l<c;l++)(r=f[l])!==s&&r!==o&&r!==a&&(p=Math.abs(n.distanceToPoint(r.point)))>x&&(x=p,u=r);var T=[];if(n.distanceToPoint(u.point)<0)for(T.push(h.create(s,o,a),h.create(u,o,s),h.create(u,a,o),h.create(u,s,a)),l=0;l<3;l++)d=(l+1)%3,T[l+1].getEdge(2).setTwin(T[0].getEdge(d)),T[l+1].getEdge(1).setTwin(T[d+1].getEdge(0));else for(T.push(h.create(s,a,o),h.create(u,s,o),h.create(u,o,a),h.create(u,a,s)),l=0;l<3;l++)d=(l+1)%3,T[l+1].getEdge(2).setTwin(T[0].getEdge((3-l)%3)),T[l+1].getEdge(0).setTwin(T[d+1].getEdge(1));for(l=0;l<4;l++)this.faces.push(T[l]);for(l=0,c=f.length;l<c;l++)if((r=f[l])!==s&&r!==o&&r!==a&&r!==u){x=this.tolerance;var F=null;for(d=0;d<4;d++)(p=this.faces[d].distanceToPoint(r.point))>x&&(x=p,F=this.faces[d]);null!==F&&this.addVertexToFace(r,F)}return this},reindexFaces:function(){for(var t=[],e=0;e<this.faces.length;e++){var n=this.faces[e];n.mark===s&&t.push(n)}return this.faces=t,this},nextVertexToAdd:function(){if(!1===this.assigned.isEmpty()){var t,e=0,n=this.assigned.first().face,i=n.outside;do{var r=n.distanceToPoint(i.point);r>e&&(e=r,t=i),i=i.next}while(null!==i&&i.face===n);return t}},computeHorizon:function(t,e,n,i){var r;this.deleteFaceVertices(n),n.mark=1,r=null===e?e=n.getEdge(0):e.next;do{var o=r.twin,a=o.face;a.mark===s&&(a.distanceToPoint(t)>this.tolerance?this.computeHorizon(t,o,a,i):i.push(r)),r=r.next}while(r!==e);return this},addAdjoiningFace:function(t,e){var n=h.create(t,e.tail(),e.head());return this.faces.push(n),n.getEdge(-1).setTwin(e.twin),n.getEdge(0)},addNewFaces:function(t,e){this.newFaces=[];for(var n=null,i=null,r=0;r<e.length;r++){var s=e[r],o=this.addAdjoiningFace(t,s);null===n?n=o:o.next.setTwin(i),this.newFaces.push(o.face),i=o}return n.next.setTwin(i),this},addVertexToHull:function(t){var e=[];return this.unassigned.clear(),this.removeVertexFromFace(t,t.face),this.computeHorizon(t.point,null,t.face,e),this.addNewFaces(t,e),this.resolveUnassignedPoints(this.newFaces),this},cleanup:function(){return this.assigned.clear(),this.unassigned.clear(),this.newFaces=[],this},compute:function(){var t;for(this.computeInitialHull();void 0!==(t=this.nextVertexToAdd());)this.addVertexToHull(t);return this.reindexFaces(),this.cleanup(),this}}),Object.assign(h,{create:function(t,e,n){var i=new h,r=new u(t,i),s=new u(e,i),o=new u(n,i);return r.next=o.prev=s,s.next=r.prev=o,o.next=s.prev=r,i.edge=r,i.compute()}}),Object.assign(h.prototype,{getEdge:function(t){for(var e=this.edge;t>0;)e=e.next,t--;for(;t<0;)e=e.prev,t++;return e},compute:function(){void 0===r&&(r=new t.Triangle);var e=this.edge.tail(),n=this.edge.head(),i=this.edge.next.head();return r.set(e.point,n.point,i.point),r.getNormal(this.normal),r.getMidpoint(this.midpoint),this.area=r.getArea(),this.constant=this.normal.dot(this.midpoint),this},distanceToPoint:function(t){return this.normal.dot(t)-this.constant}}),Object.assign(u.prototype,{head:function(){return this.vertex},tail:function(){return this.prev?this.prev.vertex:null},length:function(){var t=this.head(),e=this.tail();return null!==e?e.point.distanceTo(t.point):-1},lengthSquared:function(){var t=this.head(),e=this.tail();return null!==e?e.point.distanceToSquared(t.point):-1},setTwin:function(t){return this.twin=t,t.twin=this,this}}),Object.assign(c.prototype,{first:function(){return this.head},last:function(){return this.tail},clear:function(){return this.head=this.tail=null,this},insertBefore:function(t,e){return e.prev=t.prev,e.next=t,null===e.prev?this.head=e:e.prev.next=e,t.prev=e,this},insertAfter:function(t,e){return e.prev=t,e.next=t.next,null===e.next?this.tail=e:e.next.prev=e,t.next=e,this},append:function(t){return null===this.head?this.head=t:this.tail.next=t,t.prev=this.tail,t.next=null,this.tail=t,this},appendChain:function(t){for(null===this.head?this.head=t:this.tail.next=t,t.prev=this.tail;null!==t.next;)t=t.next;return this.tail=t,this},remove:function(t){return null===t.prev?this.head=t.next:t.prev.next=t.next,null===t.next?this.tail=t.prev:t.next.prev=t.prev,this},removeSubList:function(t,e){return null===t.prev?this.head=e.next:t.prev.next=e.next,null===e.next?this.tail=t.prev:e.next.prev=t.prev,this},isEmpty:function(){return null===this.head}}),a}();return e.math.ConvexHull=n});
//# sourceMappingURL=../sourcemaps/math/ConvexHull.js.map
