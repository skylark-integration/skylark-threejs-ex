/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../geometries/ConvexGeometry"],function(e,t){var r;return e.ConvexObjectBreaker=function(t,r){this.minSizeForBreak=t||1.4,this.smallDelta=r||1e-4,this.tempLine1=new e.Line3,this.tempPlane1=new e.Plane,this.tempPlane2=new e.Plane,this.tempPlane_Cut=new e.Plane,this.tempCM1=new e.Vector3,this.tempCM2=new e.Vector3,this.tempVector3=new e.Vector3,this.tempVector3_2=new e.Vector3,this.tempVector3_3=new e.Vector3,this.tempVector3_P0=new e.Vector3,this.tempVector3_P1=new e.Vector3,this.tempVector3_P2=new e.Vector3,this.tempVector3_N0=new e.Vector3,this.tempVector3_N1=new e.Vector3,this.tempVector3_AB=new e.Vector3,this.tempVector3_CB=new e.Vector3,this.tempResultObjects={object1:null,object2:null},this.segments=[];for(var o=0;o<900;o++)this.segments[o]=!1},e.ConvexObjectBreaker.prototype={constructor:e.ConvexObjectBreaker,prepareBreakableObject:function(e,t,r,o,n){e.geometry.isBufferGeometry||console.error("THREE.ConvexObjectBreaker.prepareBreakableObject(): Parameter object must have a BufferGeometry.");var s=e.userData;s.mass=t,s.velocity=r.clone(),s.angularVelocity=o.clone(),s.breakable=n},subdivideByImpact:function(e,t,r,o,n){var s=[],a=this.tempPlane1,i=this.tempPlane2;this.tempVector3.addVectors(t,r),a.setFromCoplanarPoints(t,e.position,this.tempVector3);var c=n+o,m=this;return function n(p,l,h,u){if(Math.random()<.05*u||u>c)s.push(p);else{var v=Math.PI;0===u?(i.normal.copy(a.normal),i.constant=a.constant):u<=o?(v=(h-l)*(.2+.6*Math.random())+l,m.tempVector3_2.copy(e.position).sub(t).applyAxisAngle(r,v).add(t),i.setFromCoplanarPoints(t,m.tempVector3,m.tempVector3_2)):(v=(.5*(1&u)+.2*(2-Math.random()))*Math.PI,m.tempVector3_2.copy(t).sub(p.position).applyAxisAngle(r,v).add(p.position),m.tempVector3_3.copy(r).add(p.position),i.setFromCoplanarPoints(p.position,m.tempVector3_3,m.tempVector3_2)),m.cutByPlane(p,i,m.tempResultObjects);var V=m.tempResultObjects.object1,f=m.tempResultObjects.object2;V&&n(V,l,v,u+1),f&&n(f,v,h,u+1)}}(e,0,2*Math.PI,0),s},cutByPlane:function(t,r,o){var n=t.geometry,s=n.attributes.position.array,a=n.attributes.normal.array,i=s.length/3,c=i/3,m=n.getIndex();function p(e,t){var r=3*e+t;return m?m[r]:r}m&&(c=(m=m.array).length/3);for(var l=[],h=[],u=this.smallDelta,v=i*i,V=0;V<v;V++)this.segments[V]=!1;var f=this.tempVector3_P0,b=this.tempVector3_P1,y=this.tempVector3_N0,d=this.tempVector3_N1;for(V=0;V<c-1;V++){var C=p(V,0),j=p(V,1),x=p(V,2);y.set(a[C],a[C]+1,a[C]+2);for(var g=V+1;g<c;g++){var B=p(g,0),P=p(g,1),M=p(g,2);d.set(a[B],a[B]+1,a[B]+2),1-y.dot(d)<u&&(C===B||C===P||C===M?j===B||j===P||j===M?(this.segments[C*i+j]=!0,this.segments[j*i+C]=!0):(this.segments[x*i+C]=!0,this.segments[C*i+x]=!0):j!==B&&j!==P&&j!==M||(this.segments[x*i+j]=!0,this.segments[j*i+x]=!0))}}var k=this.tempPlane_Cut;t.updateMatrix(),e.ConvexObjectBreaker.transformPlaneToLocalSpace(r,t.matrix,k);for(V=0;V<c;V++)for(var w=p(V,0),O=p(V,1),_=p(V,2),z=0;z<3;z++){var I=0===z?w:1===z?O:_,F=0===z?O:1===z?_:w;if(!this.segments[I*i+F]){this.segments[I*i+F]=!0,this.segments[F*i+I]=!0,f.set(s[3*I],s[3*I+1],s[3*I+2]),b.set(s[3*F],s[3*F+1],s[3*F+2]);var D=0;(L=k.distanceToPoint(f))>u?(D=2,h.push(f.clone())):L<-u?(D=1,l.push(f.clone())):(D=3,l.push(f.clone()),h.push(f.clone()));var L,S=0;if((L=k.distanceToPoint(b))>u?(S=2,h.push(b.clone())):L<-u?(S=1,l.push(b.clone())):(S=3,l.push(b.clone()),h.push(b.clone())),1===D&&2===S||2===D&&1===S){this.tempLine1.start.copy(f),this.tempLine1.end.copy(b);var T=new e.Vector3;if(void 0===(T=k.intersectLine(this.tempLine1,T)))return console.error("Internal error: segment does not intersect plane."),o.segmentedObject1=null,o.segmentedObject2=null,0;l.push(T),h.push(T.clone())}}}var A=.5*t.userData.mass;this.tempCM1.set(0,0,0);var G=0,R=l.length;if(R>0){for(V=0;V<R;V++)this.tempCM1.add(l[V]);this.tempCM1.divideScalar(R);for(V=0;V<R;V++){(E=l[V]).sub(this.tempCM1),G=Math.max(G,E.x,E.y,E.z)}this.tempCM1.add(t.position)}this.tempCM2.set(0,0,0);var q=0,N=h.length;if(N>0){for(V=0;V<N;V++)this.tempCM2.add(h[V]);this.tempCM2.divideScalar(N);for(V=0;V<N;V++){var E;(E=h[V]).sub(this.tempCM2),q=Math.max(q,E.x,E.y,E.z)}this.tempCM2.add(t.position)}var H=null,J=null,K=0;return R>4&&((H=new e.Mesh(new e.ConvexBufferGeometry(l),t.material)).position.copy(this.tempCM1),H.quaternion.copy(t.quaternion),this.prepareBreakableObject(H,A,t.userData.velocity,t.userData.angularVelocity,2*G>this.minSizeForBreak),K++),N>4&&((J=new e.Mesh(new e.ConvexBufferGeometry(h),t.material)).position.copy(this.tempCM2),J.quaternion.copy(t.quaternion),this.prepareBreakableObject(J,A,t.userData.velocity,t.userData.angularVelocity,2*q>this.minSizeForBreak),K++),o.object1=H,o.object2=J,K}},e.ConvexObjectBreaker.transformFreeVector=function(e,t){var r=e.x,o=e.y,n=e.z,s=t.elements;return e.x=s[0]*r+s[4]*o+s[8]*n,e.y=s[1]*r+s[5]*o+s[9]*n,e.z=s[2]*r+s[6]*o+s[10]*n,e},e.ConvexObjectBreaker.transformFreeVectorInverse=function(e,t){var r=e.x,o=e.y,n=e.z,s=t.elements;return e.x=s[0]*r+s[1]*o+s[2]*n,e.y=s[4]*r+s[5]*o+s[6]*n,e.z=s[8]*r+s[9]*o+s[10]*n,e},e.ConvexObjectBreaker.transformTiedVectorInverse=function(e,t){var r=e.x,o=e.y,n=e.z,s=t.elements;return e.x=s[0]*r+s[1]*o+s[2]*n-s[12],e.y=s[4]*r+s[5]*o+s[6]*n-s[13],e.z=s[8]*r+s[9]*o+s[10]*n-s[14],e},e.ConvexObjectBreaker.transformPlaneToLocalSpace=(r=new e.Vector3,function(t,o,n){n.normal.copy(t.normal),n.constant=t.constant;var s=e.ConvexObjectBreaker.transformTiedVectorInverse(t.coplanarPoint(r),o);e.ConvexObjectBreaker.transformFreeVectorInverse(n.normal,o),n.constant=-s.dot(n.normal)}),e.ConvexObjectBreaker});
//# sourceMappingURL=../sourcemaps/misc/ConvexObjectBreaker.js.map