/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return function(){for(var n=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],r=0;r<256;r++)n[256+r]=n[r];function t(n){return n*n*n*(n*(6*n-15)+10)}function o(n,r,t){return r+n*(t-r)}function u(n,r,t,o){var u=15&n,f=u<8?r:t,e=u<4?t:12==u||14==u?r:o;return(0==(1&u)?f:-f)+(0==(2&u)?e:-e)}return{noise:function(r,f,e){var i=Math.floor(r),c=Math.floor(f),a=Math.floor(e),h=255&i,l=255&c,s=255&a,v=(r-=i)-1,M=(f-=c)-1,d=(e-=a)-1,b=t(r),g=t(f),j=t(e),k=n[h]+l,m=n[k]+s,p=n[k+1]+s,q=n[h+1]+l,w=n[q]+s,x=n[q+1]+s;return o(j,o(g,o(b,u(n[m],r,f,e),u(n[w],v,f,e)),o(b,u(n[p],r,M,e),u(n[x],v,M,e))),o(g,o(b,u(n[m+1],r,f,d),u(n[w+1],v,f,e-1)),o(b,u(n[p+1],r,M,d),u(n[x+1],v,M,d))))}}}});
//# sourceMappingURL=../sourcemaps/math/ImprovedNoise.js.map
