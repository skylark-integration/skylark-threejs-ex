/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./ColladaLoader"],function(e,r){"use strict";var a=function(r){e.Loader.call(this,r)};return a.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:a,load:function(r,a,t,n){var o=this,i=new e.FileLoader(o.manager);i.setPath(o.path),i.setResponseType("arraybuffer"),i.load(r,function(e){a(o.parse(e))},t,n)},parse:function(a){var t=new e.LoadingManager;t.setURLModifier(function(e){var r=function(e){for(var r in n.files)if(r.substr(-e.length)===e)return n.files[r]}(e);if(r){console.log("Loading",e);var a=new Blob([r.asArrayBuffer()],{type:"application/octet-stream"});return URL.createObjectURL(a)}return e});var n=new JSZip(a);if(n.files["doc.kml"]){var o=(new DOMParser).parseFromString(n.files["doc.kml"].asText(),"application/xml").querySelector("Placemark Model Link href");if(o)return new r(t).parse(n.files[o.textContent].asText())}else for(var i in console.warn("KMZLoader: Missing doc.kml file."),n.files){if("dae"===i.split(".").pop().toLowerCase())return new r(t).parse(n.files[i].asText())}return console.error("KMZLoader: Couldn't find .dae file."),{scene:new e.Group}}}),a});
//# sourceMappingURL=../sourcemaps/loaders/KMZLoader.js.map
