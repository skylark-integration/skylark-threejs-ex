/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../misc/Volume"],function(r,e,t){return r.NRRDLoader=function(e){r.Loader.call(this,e)},r.NRRDLoader.prototype=Object.assign(Object.create(r.Loader.prototype),{constructor:r.NRRDLoader,load:function(e,t,n,a){var s=this,i=new r.FileLoader(s.manager);i.setPath(s.path),i.setResponseType("arraybuffer"),i.load(e,function(r){t(s.parse(r))},n,a)},parse:function(e){var n=e,a=0,s=new Int8Array(new Int16Array([1]).buffer)[0]>0,i=!0,o={};var c=function(r,e){void 0!==e&&null!==e||(e=1);var t=1,o=Uint8Array;switch(r){case"uchar":break;case"schar":o=Int8Array;break;case"ushort":o=Uint16Array,t=2;break;case"sshort":o=Int16Array,t=2;break;case"uint":o=Uint32Array,t=4;break;case"sint":o=Int32Array,t=4;break;case"float":o=Float32Array,t=4;break;case"complex":case"double":o=Float64Array,t=8}var c=new o(n.slice(a,a+=e*t));return s!=i&&(c=function(r,e){for(var t=new Uint8Array(r.buffer,r.byteOffset,r.byteLength),n=0;n<r.byteLength;n+=e)for(var a=n+e-1,s=n;a>s;a--,s++){var i=t[s];t[s]=t[a],t[a]=i}return r}(c,t)),1==e?c[0]:c}("uchar",e.byteLength),u=c.length,h=null,l=0;for(f=1;f<u;f++)if(10==c[f-1]&&10==c[f]){h=this.parseChars(c,0,f-2),l=f+1;break}!function(e){var t,n,a,s,i,c,u,h,l;for(h=0,l=(c=e.split(/\r?\n/)).length;h<l;h++)(i=c[h]).match(/NRRD\d+/)?o.isNrrd=!0:i.match(/^#/)||(u=i.match(/(.*):(.*)/))&&(n=u[1].trim(),t=u[2].trim(),(a=r.NRRDLoader.prototype.fieldFunctions[n])?a.call(o,t):o[n]=t);if(!o.isNrrd)throw new Error("Not an NRRD file");if("bz2"===o.encoding||"bzip2"===o.encoding)throw new Error("Bzip is not supported");if(!o.vectors&&(o.vectors=[new r.Vector3(1,0,0),new r.Vector3(0,1,0),new r.Vector3(0,0,1)],o.spacings))for(s=0;s<=2;s++)isNaN(o.spacings[s])||o.vectors[s].multiplyScalar(o.spacings[s])}(h);n=c.subarray(l);if("gzip"===o.encoding||"gz"===o.encoding){var p=new t.Gunzip(new Uint8Array(n));n=p.decompress()}else if("ascii"===o.encoding||"text"===o.encoding||"txt"===o.encoding||"hex"===o.encoding)n=function(r,e,t){var n,a="";e=e||0,t=t||r.length;var s=o.sizes.reduce(function(r,e){return r*e},1),i=10;"hex"===o.encoding&&(i=16);var c=new o.__array(s),u=0,h=parseInt;o.__array!==Float32Array&&o.__array!==Float64Array||(h=parseFloat);for(var l=e;l<t;l++)((n=r[l])<9||n>13)&&32!==n?a+=String.fromCharCode(n):(""!==a&&(c[u]=h(a,i),u++),a="");return""!==a&&(c[u]=h(a,i),u++),c}(n);else if("raw"===o.encoding){for(var d=new Uint8Array(n.length),f=0;f<n.length;f++)d[f]=n[f];n=d}n=n.buffer;var g=new r.Volume;g.header=o,g.data=new o.__array(n);var y=g.computeMinMax(),v=y[0],w=y[1];g.windowLow=v,g.windowHigh=w,g.dimensions=[o.sizes[0],o.sizes[1],o.sizes[2]],g.xLength=g.dimensions[0],g.yLength=g.dimensions[1],g.zLength=g.dimensions[2];var b=new r.Vector3(o.vectors[0][0],o.vectors[0][1],o.vectors[0][2]).length(),_=new r.Vector3(o.vectors[1][0],o.vectors[1][1],o.vectors[1][2]).length(),m=new r.Vector3(o.vectors[2][0],o.vectors[2][1],o.vectors[2][2]).length();g.spacing=[b,_,m],g.matrix=new r.Matrix4;var A=1,k=1;if("left-posterior-superior"==o.space?(A=-1,k=-1):"left-anterior-superior"===o.space&&(A=-1),o.vectors){var x=o.vectors;g.matrix.set(A*x[0][0],A*x[1][0],A*x[2][0],0,k*x[0][1],k*x[1][1],k*x[2][1],0,1*x[0][2],1*x[1][2],1*x[2][2],0,0,0,0,1)}else g.matrix.set(A,0,0,0,0,k,0,0,0,0,1,0,0,0,0,1);return g.inverseMatrix=new r.Matrix4,g.inverseMatrix.getInverse(g.matrix),g.RASDimensions=new r.Vector3(g.xLength,g.yLength,g.zLength).applyMatrix4(g.matrix).round().toArray().map(Math.abs),g.lowerThreshold===-1/0&&(g.lowerThreshold=v),g.upperThreshold===1/0&&(g.upperThreshold=w),g},parseChars:function(r,e,t){void 0===e&&(e=0),void 0===t&&(t=r.length);var n="",a=0;for(a=e;a<t;++a)n+=String.fromCharCode(r[a]);return n},fieldFunctions:{type:function(r){switch(r){case"uchar":case"unsigned char":case"uint8":case"uint8_t":this.__array=Uint8Array;break;case"signed char":case"int8":case"int8_t":this.__array=Int8Array;break;case"short":case"short int":case"signed short":case"signed short int":case"int16":case"int16_t":this.__array=Int16Array;break;case"ushort":case"unsigned short":case"unsigned short int":case"uint16":case"uint16_t":this.__array=Uint16Array;break;case"int":case"signed int":case"int32":case"int32_t":this.__array=Int32Array;break;case"uint":case"unsigned int":case"uint32":case"uint32_t":this.__array=Uint32Array;break;case"float":this.__array=Float32Array;break;case"double":this.__array=Float64Array;break;default:throw new Error("Unsupported NRRD data type: "+r)}return this.type=r},endian:function(r){return this.endian=r},encoding:function(r){return this.encoding=r},dimension:function(r){return this.dim=parseInt(r,10)},sizes:function(r){var e;return this.sizes=function(){var t,n,a,s;for(s=[],t=0,n=(a=r.split(/\s+/)).length;t<n;t++)e=a[t],s.push(parseInt(e,10));return s}()},space:function(r){return this.space=r},"space origin":function(r){return this.space_origin=r.split("(")[1].split(")")[0].split(",")},"space directions":function(r){var e,t,n;return t=r.match(/\(.*?\)/g),this.vectors=function(){var r,a,s;for(s=[],r=0,a=t.length;r<a;r++)n=t[r],s.push(function(){var r,t,a,s;for(s=[],r=0,t=(a=n.slice(1,-1).split(/,/)).length;r<t;r++)e=a[r],s.push(parseFloat(e));return s}());return s}()},spacings:function(r){var e,t;return t=r.split(/\s+/),this.spacings=function(){var r,n,a=[];for(r=0,n=t.length;r<n;r++)e=t[r],a.push(parseFloat(e));return a}()}}}),r.NRRDLoader});
//# sourceMappingURL=../sourcemaps/loaders/NRRDLoader.js.map
