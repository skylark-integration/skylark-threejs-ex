/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(r){return r.PRWMLoader=function(){var e=null;function t(){if(null===e){var r=new ArrayBuffer(2),t=new Uint8Array(r),n=new Uint16Array(r);t[0]=170,t[1]=187,e=43707===n[0]}return e}var n=[null,Float32Array,null,Int8Array,Int16Array,null,Int32Array,Uint8Array,Uint16Array,null,Uint32Array],a={Uint16Array:"getUint16",Uint32Array:"getUint32",Int16Array:"getInt16",Int32Array:"getInt32",Float32Array:"getFloat32",Float64Array:"getFloat64"};function i(r,e,n,i,o){var u,l=e.BYTES_PER_ELEMENT;if(o===t()||1===l)u=new e(r,n,i);else{var f=new DataView(r,n,i*l),s=a[e.name],d=!o,c=0;for(u=new e(i);c<i;c++)u[c]=f[s](c*l,d)}return u}function o(e){r.Loader.call(this,e)}return o.prototype=Object.assign(Object.create(r.Loader.prototype),{constructor:o,load:function(e,n,a,i){var o=this,u=new r.FileLoader(o.manager);u.setPath(o.path),u.setResponseType("arraybuffer"),e=e.replace(/\*/g,t()?"be":"le"),u.load(e,function(r){n(o.parse(r))},a,i)},parse:function(e){var t,a,o=function(r){var e=new Uint8Array(r),t=e[0],a=e[1],o=!!(a>>7&1),u=a>>6&1,l=1==(a>>5&1),f=31&a,s=0,d=0;if(l?(s=(e[2]<<16)+(e[3]<<8)+e[4],d=(e[5]<<16)+(e[6]<<8)+e[7]):(s=e[2]+(e[3]<<8)+(e[4]<<16),d=e[5]+(e[6]<<8)+(e[7]<<16)),0===t)throw new Error("PRWM decoder: Invalid format version: 0");if(1!==t)throw new Error("PRWM decoder: Unsupported format version: "+t);if(!o){if(0!==u)throw new Error("PRWM decoder: Indices type must be set to 0 for non-indexed geometries");if(0!==d)throw new Error("PRWM decoder: Number of indices must be set to 0 for non-indexed geometries")}var c,y,A,w,g,v,E,b,h=8,p={};for(b=0;b<f;b++){for(c="";h<e.length&&(y=e[h],h++,0!==y);)c+=String.fromCharCode(y);A=(a=e[h])>>7&1,w=1+(a>>4&3),h++,v=i(r,g=n[15&a],h=4*Math.ceil(h/4),w*s,l),h+=g.BYTES_PER_ELEMENT*w*s,p[c]={type:A,cardinality:w,values:v}}return h=4*Math.ceil(h/4),E=null,o&&(E=i(r,1===u?Uint32Array:Uint16Array,h,d,l)),{version:t,attributes:p,indices:E}}(e),u=Object.keys(o.attributes),l=new r.BufferGeometry;for(a=0;a<u.length;a++)t=o.attributes[u[a]],l.setAttribute(u[a],new r.BufferAttribute(t.values,t.cardinality,t.normalized));return null!==o.indices&&l.setIndex(new r.BufferAttribute(o.indices,1)),l}}),o.isBigEndianPlatform=function(){return t()},o}(),r.PRWMLoader});
//# sourceMappingURL=../sourcemaps/loaders/PRWMLoader.js.map