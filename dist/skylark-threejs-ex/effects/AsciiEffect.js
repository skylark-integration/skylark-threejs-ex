/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return function(e,t,a){t=void 0===t?" .:-=+*#%@":t,a||(a={});var r,n,o=a.resolution?a.resolution:.15,l=a.scale?a.scale:1,i=!!a.color&&a.color,c=!!a.alpha&&a.alpha,s=!!a.block&&a.block,d=!!a.invert&&a.invert,g=document.createElement("div");g.style.cursor="default";var p,u,h,m=document.createElement("table");g.appendChild(m),this.setSize=function(t,a){r=t,n=a,e.setSize(t,a),function(){p=Math.round(r*C),u=Math.round(n*C),y.width=p,y.height=u,(h=e.domElement).style.backgroundColor&&(m.rows[0].cells[0].style.backgroundColor=h.style.backgroundColor,m.rows[0].cells[0].style.color=h.style.color),m.cellSpacing=0,m.cellPadding=0;var t=m.style;t.display="inline",t.width=Math.round(p/C*l)+"px",t.height=Math.round(u/C*l)+"px",t.whiteSpace="pre",t.margin="0px",t.padding="0px",t.letterSpacing=S+"px",t.fontFamily=b,t.fontSize=E+"px",t.lineHeight=M+"px",t.textAlign="left",t.textDecoration="none"}()},this.render=function(t,a){e.render(t,a),function(e,t){k.clearRect(0,0,p,u),k.drawImage(x,0,0,p,u);for(var a=k.getImageData(0,0,p,u).data,r="",n=0;n<u;n+=2){for(var o=0;o<p;o++){var l,g,h=4*(n*p+o),m=a[h],v=a[h+1],f=a[h+2],b=a[h+3];g=(.3*m+.59*v+.11*f)/255,0==b&&(g=1),l=Math.floor((1-g)*(w.length-1)),d&&(l=w.length-l-1);var y=w[l];void 0!==y&&" "!=y||(y="&nbsp;"),r+=i?"<span style='color:rgb("+m+","+v+","+f+");"+(s?"background-color:rgb("+m+","+v+","+f+");":"")+(c?"opacity:"+b/255+";":"")+"'>"+y+"</span>":y}r+="<br/>"}t.innerHTML="<tr><td>"+r+"</td></tr>"}(0,m)},this.domElement=g;var v=" .,:;i1tfLCG08@".split(""),f=" CGO08@".split(""),b="courier new, monospace",x=e.domElement,y=document.createElement("canvas");if(y.getContext){var k=y.getContext("2d");if(k.getImageData){var w=i?f:v;t&&(w=t);var C=.5;C=.25,o&&(C=o);var E=2/C*l,M=2/C*l,S=0;switch(l){case 1:S=-1;break;case 2:case 3:S=-2.1;break;case 4:S=-3.1;break;case 5:S=-4.15}}}}});
//# sourceMappingURL=../sourcemaps/effects/AsciiEffect.js.map
