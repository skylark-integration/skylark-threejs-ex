/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.RGBELoader=function(r){e.DataTextureLoader.call(this,r),this.type=e.UnsignedByteType},e.RGBELoader.prototype=Object.assign(Object.create(e.DataTextureLoader.prototype),{constructor:e.RGBELoader,parse:function(r){var t=function(e,r){switch(e){case 1:console.error("THREE.RGBELoader Read Error: "+(r||""));break;case 2:console.error("THREE.RGBELoader Write Error: "+(r||""));break;case 3:console.error("THREE.RGBELoader Bad File Format: "+(r||""));break;default:case 4:console.error("THREE.RGBELoader: Error: "+(r||""))}return-1},a=function(e,r,t){r=r||1024;for(var a=e.pos,n=-1,i=0,o="",s=String.fromCharCode.apply(null,new Uint16Array(e.subarray(a,a+128)));0>(n=s.indexOf("\n"))&&i<r&&a<e.byteLength;)o+=s,i+=s.length,a+=128,s+=String.fromCharCode.apply(null,new Uint16Array(e.subarray(a,a+128)));return-1<n&&(!1!==t&&(e.pos+=i+n+1),o+s.slice(0,n))},n=function(){var e=new Float32Array(1),r=new Int32Array(e.buffer);function t(t){e[0]=t;var a=r[0],n=a>>16&32768,i=a>>12&2047,o=a>>23&255;return o<103?n:o>142?(n|=31744,n|=(255==o?0:1)&&8388607&a):o<113?n|=((i|=2048)>>114-o)+(i>>113-o&1):(n|=o-112<<10|i>>1,n+=1&i)}return function(e,r,a,n){var i=e[r+3],o=Math.pow(2,i-128)/255;a[n+0]=t(e[r+0]*o),a[n+1]=t(e[r+1]*o),a[n+2]=t(e[r+2]*o)}}(),i=new Uint8Array(r);i.pos=0;var o,s,l,d,p,c,f=function(e){var r,n,i=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,o=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,s=/^\s*FORMAT=(\S+)\s*$/,l=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,d={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};if(e.pos>=e.byteLength||!(r=a(e)))return t(1,"no header found");if(!(n=r.match(/^#\?(\S+)$/)))return t(3,"bad initial token");for(d.valid|=1,d.programtype=n[1],d.string+=r+"\n";!1!==(r=a(e));)if(d.string+=r+"\n","#"!==r.charAt(0)){if((n=r.match(i))&&(d.gamma=parseFloat(n[1],10)),(n=r.match(o))&&(d.exposure=parseFloat(n[1],10)),(n=r.match(s))&&(d.valid|=2,d.format=n[1]),(n=r.match(l))&&(d.valid|=4,d.height=parseInt(n[1],10),d.width=parseInt(n[2],10)),2&d.valid&&4&d.valid)break}else d.comments+=r+"\n";return 2&d.valid?4&d.valid?d:t(3,"missing image size specifier"):t(3,"missing format specifier")}(i);if(-1!==f){var u=f.width,y=f.height,h=function(e,r,a){var n,i,o,s,l,d,p,c,f,u,y,h,g,m=r,E=a;if(m<8||m>32767||2!==e[0]||2!==e[1]||128&e[2])return new Uint8Array(e);if(m!==(e[2]<<8|e[3]))return t(3,"wrong scanline width");if(!(n=new Uint8Array(4*r*a))||!n.length)return t(4,"unable to allocate buffer space");for(i=0,o=0,c=4*m,g=new Uint8Array(4),d=new Uint8Array(c);E>0&&o<e.byteLength;){if(o+4>e.byteLength)return t(1);if(g[0]=e[o++],g[1]=e[o++],g[2]=e[o++],g[3]=e[o++],2!=g[0]||2!=g[1]||(g[2]<<8|g[3])!=m)return t(3,"bad rgbe scanline format");for(p=0;p<c&&o<e.byteLength;){if((h=(s=e[o++])>128)&&(s-=128),0===s||p+s>c)return t(3,"bad scanline data");if(h)for(l=e[o++],f=0;f<s;f++)d[p++]=l;else d.set(e.subarray(o,o+s),p),p+=s,o+=s}for(u=m,f=0;f<u;f++)y=0,n[i]=d[f+y],y+=m,n[i+1]=d[f+y],y+=m,n[i+2]=d[f+y],y+=m,n[i+3]=d[f+y],i+=4;E--}return n}(i.subarray(i.pos),u,y);if(-1!==h){switch(this.type){case e.UnsignedByteType:var g=h,m=e.RGBEFormat,E=e.UnsignedByteType;break;case e.FloatType:for(var b=h.length/4*3,F=new Float32Array(b),v=0;v<b;v++)l=F,d=3*v,void 0,void 0,p=(o=h)[(s=4*v)+3],c=Math.pow(2,p-128)/255,l[d+0]=o[s+0]*c,l[d+1]=o[s+1]*c,l[d+2]=o[s+2]*c;g=F,m=e.RGBFormat,E=e.FloatType;break;case e.HalfFloatType:b=h.length/4*3;var w=new Uint16Array(b);for(v=0;v<b;v++)n(h,4*v,w,3*v);g=w,m=e.RGBFormat,E=e.HalfFloatType;break;default:console.error("THREE.RGBELoader: unsupported type: ",this.type)}return{width:u,height:y,data:g,header:f.string,gamma:f.gamma,exposure:f.exposure,format:m,type:E}}}return null},setDataType:function(e){return this.type=e,this},load:function(r,t,a,n){return e.DataTextureLoader.prototype.load.call(this,r,function(r,a){switch(r.type){case e.UnsignedByteType:r.encoding=e.RGBEEncoding,r.minFilter=e.NearestFilter,r.magFilter=e.NearestFilter,r.generateMipmaps=!1,r.flipY=!0;break;case e.FloatType:case e.HalfFloatType:r.encoding=e.LinearEncoding,r.minFilter=e.LinearFilter,r.magFilter=e.LinearFilter,r.generateMipmaps=!1,r.flipY=!0}t&&t(r,a)},a,n)}}),e.RGBELoader});
//# sourceMappingURL=../sourcemaps/loaders/RGBELoader.js.map
