/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./RGBELoader"],function(e,t){"use strict";var a=function(a){e.Loader.call(this,a),this.hdrLoader=new t,this.type=e.UnsignedByteType};return a.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:a,load:function(t,a,r,i){Array.isArray(t)||(console.warn("THREE.HDRCubeTextureLoader signature has changed. Use .setDataType() instead."),this.setDataType(t),t=a,a=r,r=i,i=arguments[4]);var n=new e.CubeTexture;switch(n.type=this.type,n.type){case e.UnsignedByteType:n.encoding=e.RGBEEncoding,n.format=e.RGBAFormat,n.minFilter=e.NearestFilter,n.magFilter=e.NearestFilter,n.generateMipmaps=!1;break;case e.FloatType:case e.HalfFloatType:n.encoding=e.LinearEncoding,n.format=e.RGBFormat,n.minFilter=e.LinearFilter,n.magFilter=e.LinearFilter,n.generateMipmaps=!1}var s=this,o=0;function p(a,r,i,p){new e.FileLoader(s.manager).setPath(s.path).setResponseType("arraybuffer").load(t[a],function(t){o++;var i=s.hdrLoader.parse(t);if(i){if(void 0!==i.data){var p=new e.DataTexture(i.data,i.width,i.height);p.type=n.type,p.encoding=n.encoding,p.format=n.format,p.minFilter=n.minFilter,p.magFilter=n.magFilter,p.generateMipmaps=n.generateMipmaps,n.images[a]=p}6===o&&(n.needsUpdate=!0,r&&r(n))}},i,p)}for(var d=0;d<t.length;d++)p(d,a,r,i);return n},setDataType:function(e){return this.type=e,this.hdrLoader.setDataType(e),this}}),a});
//# sourceMappingURL=../sourcemaps/loaders/HDRCubeTextureLoader.js.map
