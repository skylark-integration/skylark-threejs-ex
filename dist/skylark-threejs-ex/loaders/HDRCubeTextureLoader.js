/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../loaders/RGBELoader"],function(e){return e.HDRCubeTextureLoader=function(t){e.Loader.call(this,t),this.hdrLoader=new e.RGBELoader,this.type=e.UnsignedByteType},e.HDRCubeTextureLoader.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:e.HDRCubeTextureLoader,load:function(t,a,r,i){Array.isArray(t)||(console.warn("THREE.HDRCubeTextureLoader signature has changed. Use .setDataType() instead."),this.setDataType(t),t=a,a=r,r=i,i=arguments[4]);var n=new e.CubeTexture;switch(n.type=this.type,n.type){case e.UnsignedByteType:n.encoding=e.RGBEEncoding,n.format=e.RGBAFormat,n.minFilter=e.NearestFilter,n.magFilter=e.NearestFilter,n.generateMipmaps=!1;break;case e.FloatType:case e.HalfFloatType:n.encoding=e.LinearEncoding,n.format=e.RGBFormat,n.minFilter=e.LinearFilter,n.magFilter=e.LinearFilter,n.generateMipmaps=!1}var o=this,s=0;function d(a,r,i,d){new e.FileLoader(o.manager).setPath(o.path).setResponseType("arraybuffer").load(t[a],function(t){s++;var i=o.hdrLoader.parse(t);if(i){if(void 0!==i.data){var d=new e.DataTexture(i.data,i.width,i.height);d.type=n.type,d.encoding=n.encoding,d.format=n.format,d.minFilter=n.minFilter,d.magFilter=n.magFilter,d.generateMipmaps=n.generateMipmaps,n.images[a]=d}6===s&&(n.needsUpdate=!0,r&&r(n))}},i,d)}for(var p=0;p<t.length;p++)d(p,a,r,i);return n},setDataType:function(e){return this.type=e,this.hdrLoader.setDataType(e),this}}),e.HDRCubeTextureLoader});
//# sourceMappingURL=../sourcemaps/loaders/HDRCubeTextureLoader.js.map
