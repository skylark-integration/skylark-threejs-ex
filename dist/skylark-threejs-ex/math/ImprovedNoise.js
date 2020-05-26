/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return threex.math.ImprovedNoise=function(){for(var r=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],n=0;n<256;n++)r[256+n]=r[n];function t(r){return r*r*r*(r*(6*r-15)+10)}function o(r,n,t){return n+r*(t-n)}function e(r,n,t,o){var e=15&r,u=e<8?n:t,f=e<4?t:12==e||14==e?n:o;return(0==(1&e)?u:-u)+(0==(2&e)?f:-f)}return{noise:function(n,u,f){var i=Math.floor(n),a=Math.floor(u),c=Math.floor(f),h=255&i,s=255&a,v=255&c,l=(n-=i)-1,M=(u-=a)-1,d=(f-=c)-1,m=t(n),p=t(u),x=t(f),I=r[h]+s,N=r[I]+v,b=r[I+1]+v,g=r[h+1]+s,j=r[g]+v,k=r[g+1]+v;return o(x,o(p,o(m,e(r[N],n,u,f),e(r[j],l,u,f)),o(m,e(r[b],n,M,f),e(r[k],l,M,f))),o(p,o(m,e(r[N+1],n,u,d),e(r[j+1],l,u,f-1)),o(m,e(r[b+1],n,M,d),e(r[k+1],l,M,d))))}}}});
//# sourceMappingURL=../sourcemaps/math/ImprovedNoise.js.map
