/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","skylark-zlib/Gunzip","../misc/Volume"],function(r,e,t){"use strict";var n=function(e){r.Loader.call(this,e)};return n.prototype=Object.assign(Object.create(r.Loader.prototype),{constructor:n,load:function(e,t,n,a){var s=this,i=new r.FileLoader(s.manager);i.setPath(s.path),i.setResponseType("arraybuffer"),i.load(e,function(r){t(s.parse(r))},n,a)},parse:function(t){var a=t,s=0,i=new Int8Array(new Int16Array([1]).buffer)[0]>0,o=!0,c={};var u=function(r,e){void 0!==e&&null!==e||(e=1);var t=1,n=Uint8Array;switch(r){case"uchar":break;case"schar":n=Int8Array;break;case"ushort":n=Uint16Array,t=2;break;case"sshort":n=Int16Array,t=2;break;case"uint":n=Uint32Array,t=4;break;case"sint":n=Int32Array,t=4;break;case"float":n=Float32Array,t=4;break;case"complex":case"double":n=Float64Array,t=8}var c=new n(a.slice(s,s+=e*t));return i!=o&&(c=function(r,e){for(var t=new Uint8Array(r.buffer,r.byteOffset,r.byteLength),n=0;n<r.byteLength;n+=e)for(var a=n+e-1,s=n;a>s;a--,s++){var i=t[s];t[s]=t[a],t[a]=i}return r}(c,t)),1==e?c[0]:c}("uchar",t.byteLength),h=u.length,l=null,p=0;for(g=1;g<h;g++)if(10==u[g-1]&&10==u[g]){l=this.parseChars(u,0,g-2),p=g+1;break}!function(e){var t,a,s,i,o,u,h,l,p;for(l=0,p=(u=e.split(/\r?\n/)).length;l<p;l++)(o=u[l]).match(/NRRD\d+/)?c.isNrrd=!0:o.match(/^#/)||(h=o.match(/(.*):(.*)/))&&(a=h[1].trim(),t=h[2].trim(),(s=n.prototype.fieldFunctions[a])?s.call(c,t):c[a]=t);if(!c.isNrrd)throw new Error("Not an NRRD file");if("bz2"===c.encoding||"bzip2"===c.encoding)throw new Error("Bzip is not supported");if(!c.vectors&&(c.vectors=[new r.Vector3(1,0,0),new r.Vector3(0,1,0),new r.Vector3(0,0,1)],c.spacings))for(i=0;i<=2;i++)isNaN(c.spacings[i])||c.vectors[i].multiplyScalar(c.spacings[i])}(l);a=u.subarray(p);if("gzip"===c.encoding||"gz"===c.encoding){var f=new e(new Uint8Array(a));a=f.decompress()}else if("ascii"===c.encoding||"text"===c.encoding||"txt"===c.encoding||"hex"===c.encoding)a=function(r,e,t){var n,a="";e=e||0,t=t||r.length;var s=c.sizes.reduce(function(r,e){return r*e},1),i=10;"hex"===c.encoding&&(i=16);var o=new c.__array(s),u=0,h=parseInt;c.__array!==Float32Array&&c.__array!==Float64Array||(h=parseFloat);for(var l=e;l<t;l++)((n=r[l])<9||n>13)&&32!==n?a+=String.fromCharCode(n):(""!==a&&(o[u]=h(a,i),u++),a="");return""!==a&&(o[u]=h(a,i),u++),o}(a);else if("raw"===c.encoding){for(var d=new Uint8Array(a.length),g=0;g<a.length;g++)d[g]=a[g];a=d}a=a.buffer;var y=new Volume;y.header=c,y.data=new c.__array(a);var v=y.computeMinMax(),w=v[0],b=v[1];y.windowLow=w,y.windowHigh=b,y.dimensions=[c.sizes[0],c.sizes[1],c.sizes[2]],y.xLength=y.dimensions[0],y.yLength=y.dimensions[1],y.zLength=y.dimensions[2];var _=new r.Vector3(c.vectors[0][0],c.vectors[0][1],c.vectors[0][2]).length(),m=new r.Vector3(c.vectors[1][0],c.vectors[1][1],c.vectors[1][2]).length(),A=new r.Vector3(c.vectors[2][0],c.vectors[2][1],c.vectors[2][2]).length();y.spacing=[_,m,A],y.matrix=new r.Matrix4;var k=1,x=1;if("left-posterior-superior"==c.space?(k=-1,x=-1):"left-anterior-superior"===c.space&&(k=-1),c.vectors){var z=c.vectors;y.matrix.set(k*z[0][0],k*z[1][0],k*z[2][0],0,x*z[0][1],x*z[1][1],x*z[2][1],0,1*z[0][2],1*z[1][2],1*z[2][2],0,0,0,0,1)}else y.matrix.set(k,0,0,0,0,x,0,0,0,0,1,0,0,0,0,1);return y.inverseMatrix=new r.Matrix4,y.inverseMatrix.getInverse(y.matrix),y.RASDimensions=new r.Vector3(y.xLength,y.yLength,y.zLength).applyMatrix4(y.matrix).round().toArray().map(Math.abs),y.lowerThreshold===-1/0&&(y.lowerThreshold=w),y.upperThreshold===1/0&&(y.upperThreshold=b),y},parseChars:function(r,e,t){void 0===e&&(e=0),void 0===t&&(t=r.length);var n="",a=0;for(a=e;a<t;++a)n+=String.fromCharCode(r[a]);return n},fieldFunctions:{type:function(r){switch(r){case"uchar":case"unsigned char":case"uint8":case"uint8_t":this.__array=Uint8Array;break;case"signed char":case"int8":case"int8_t":this.__array=Int8Array;break;case"short":case"short int":case"signed short":case"signed short int":case"int16":case"int16_t":this.__array=Int16Array;break;case"ushort":case"unsigned short":case"unsigned short int":case"uint16":case"uint16_t":this.__array=Uint16Array;break;case"int":case"signed int":case"int32":case"int32_t":this.__array=Int32Array;break;case"uint":case"unsigned int":case"uint32":case"uint32_t":this.__array=Uint32Array;break;case"float":this.__array=Float32Array;break;case"double":this.__array=Float64Array;break;default:throw new Error("Unsupported NRRD data type: "+r)}return this.type=r},endian:function(r){return this.endian=r},encoding:function(r){return this.encoding=r},dimension:function(r){return this.dim=parseInt(r,10)},sizes:function(r){var e;return this.sizes=function(){var t,n,a,s;for(s=[],t=0,n=(a=r.split(/\s+/)).length;t<n;t++)e=a[t],s.push(parseInt(e,10));return s}()},space:function(r){return this.space=r},"space origin":function(r){return this.space_origin=r.split("(")[1].split(")")[0].split(",")},"space directions":function(r){var e,t,n;return t=r.match(/\(.*?\)/g),this.vectors=function(){var r,a,s;for(s=[],r=0,a=t.length;r<a;r++)n=t[r],s.push(function(){var r,t,a,s;for(s=[],r=0,t=(a=n.slice(1,-1).split(/,/)).length;r<t;r++)e=a[r],s.push(parseFloat(e));return s}());return s}()},spacings:function(r){var e,t;return t=r.split(/\s+/),this.spacings=function(){var r,n,a=[];for(r=0,n=t.length;r<n;r++)e=t[r],a.push(parseFloat(e));return a}()}}}),n});
//# sourceMappingURL=../sourcemaps/loaders/NRRDLoader.js.map
