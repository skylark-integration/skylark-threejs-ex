/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,r){"use strict";var h=function(t){void 0==t&&(t=Math),this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(var r=0;r<256;r++)this.p[r]=Math.floor(256*t.random());this.perm=[];for(r=0;r<512;r++)this.perm[r]=this.p[255&r];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]};return h.prototype.dot=function(t,r,h){return t[0]*r+t[1]*h},h.prototype.dot3=function(t,r,h,i){return t[0]*r+t[1]*h+t[2]*i},h.prototype.dot4=function(t,r,h,i,o){return t[0]*r+t[1]*h+t[2]*i+t[3]*o},h.prototype.noise=function(t,r){var h,i,o=(t+r)*(.5*(Math.sqrt(3)-1)),s=Math.floor(t+o),e=Math.floor(r+o),p=(3-Math.sqrt(3))/6,a=(s+e)*p,d=t-(s-a),n=r-(e-a);d>n?(h=1,i=0):(h=0,i=1);var m=d-h+p,f=n-i+p,u=d-1+2*p,M=n-1+2*p,l=255&s,g=255&e,c=this.perm[l+this.perm[g]]%12,v=this.perm[l+h+this.perm[g+i]]%12,y=this.perm[l+1+this.perm[g+1]]%12,q=.5-d*d-n*n,x=.5-m*m-f*f,k=.5-u*u-M*M;return 70*((q<0?0:(q*=q)*q*this.dot(this.grad3[c],d,n))+(x<0?0:(x*=x)*x*this.dot(this.grad3[v],m,f))+(k<0?0:(k*=k)*k*this.dot(this.grad3[y],u,M)))},h.prototype.noise3d=function(t,r,h){var i,o,s,e,p,a,d=(t+r+h)*(1/3),n=Math.floor(t+d),m=Math.floor(r+d),f=Math.floor(h+d),u=1/6,M=(n+m+f)*u,l=t-(n-M),g=r-(m-M),c=h-(f-M);l>=g?g>=c?(i=1,o=0,s=0,e=1,p=1,a=0):l>=c?(i=1,o=0,s=0,e=1,p=0,a=1):(i=0,o=0,s=1,e=1,p=0,a=1):g<c?(i=0,o=0,s=1,e=0,p=1,a=1):l<c?(i=0,o=1,s=0,e=0,p=1,a=1):(i=0,o=1,s=0,e=1,p=1,a=0);var v=l-i+u,y=g-o+u,q=c-s+u,x=l-e+2*u,k=g-p+2*u,j=c-a+2*u,N=l-1+.5,S=g-1+.5,b=c-1+.5,w=255&n,z=255&m,A=255&f,B=this.perm[w+this.perm[z+this.perm[A]]]%12,C=this.perm[w+i+this.perm[z+o+this.perm[A+s]]]%12,D=this.perm[w+e+this.perm[z+p+this.perm[A+a]]]%12,E=this.perm[w+1+this.perm[z+1+this.perm[A+1]]]%12,F=.6-l*l-g*g-c*c,G=.6-v*v-y*y-q*q,H=.6-x*x-k*k-j*j,I=.6-N*N-S*S-b*b;return 32*((F<0?0:(F*=F)*F*this.dot3(this.grad3[B],l,g,c))+(G<0?0:(G*=G)*G*this.dot3(this.grad3[C],v,y,q))+(H<0?0:(H*=H)*H*this.dot3(this.grad3[D],x,k,j))+(I<0?0:(I*=I)*I*this.dot3(this.grad3[E],N,S,b)))},h.prototype.noise4d=function(t,r,h,i){var o,s,e,p,a,d,n,m,f,u,M,l,g=this.grad4,c=this.simplex,v=this.perm,y=(Math.sqrt(5)-1)/4,q=(5-Math.sqrt(5))/20,x=(t+r+h+i)*y,k=Math.floor(t+x),j=Math.floor(r+x),N=Math.floor(h+x),S=Math.floor(i+x),b=(k+j+N+S)*q,w=t-(k-b),z=r-(j-b),A=h-(N-b),B=i-(S-b),C=(w>z?32:0)+(w>A?16:0)+(z>A?8:0)+(w>B?4:0)+(z>B?2:0)+(A>B?1:0),D=w-(o=c[C][0]>=3?1:0)+q,E=z-(s=c[C][1]>=3?1:0)+q,F=A-(e=c[C][2]>=3?1:0)+q,G=B-(p=c[C][3]>=3?1:0)+q,H=w-(a=c[C][0]>=2?1:0)+2*q,I=z-(d=c[C][1]>=2?1:0)+2*q,J=A-(n=c[C][2]>=2?1:0)+2*q,K=B-(m=c[C][3]>=2?1:0)+2*q,L=w-(f=c[C][0]>=1?1:0)+3*q,O=z-(u=c[C][1]>=1?1:0)+3*q,P=A-(M=c[C][2]>=1?1:0)+3*q,Q=B-(l=c[C][3]>=1?1:0)+3*q,R=w-1+4*q,T=z-1+4*q,U=A-1+4*q,V=B-1+4*q,W=255&k,X=255&j,Y=255&N,Z=255&S,$=v[W+v[X+v[Y+v[Z]]]]%32,_=v[W+o+v[X+s+v[Y+e+v[Z+p]]]]%32,tt=v[W+a+v[X+d+v[Y+n+v[Z+m]]]]%32,rt=v[W+f+v[X+u+v[Y+M+v[Z+l]]]]%32,ht=v[W+1+v[X+1+v[Y+1+v[Z+1]]]]%32,it=.6-w*w-z*z-A*A-B*B,ot=.6-D*D-E*E-F*F-G*G,st=.6-H*H-I*I-J*J-K*K,et=.6-L*L-O*O-P*P-Q*Q,pt=.6-R*R-T*T-U*U-V*V;return 27*((it<0?0:(it*=it)*it*this.dot4(g[$],w,z,A,B))+(ot<0?0:(ot*=ot)*ot*this.dot4(g[_],D,E,F,G))+(st<0?0:(st*=st)*st*this.dot4(g[tt],H,I,J,K))+(et<0?0:(et*=et)*et*this.dot4(g[rt],L,O,P,Q))+(pt<0?0:(pt*=pt)*pt*this.dot4(g[ht],R,T,U,V)))},r.math.SimplexNoise=h});
//# sourceMappingURL=../sourcemaps/math/SimplexNoise.js.map
