/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../loaders/ColladaLoader"],function(e){return e.KMZLoader=function(r){e.Loader.call(this,r)},e.KMZLoader.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:e.KMZLoader,load:function(r,a,o,n){var t=this,i=new e.FileLoader(t.manager);i.setPath(t.path),i.setResponseType("arraybuffer"),i.load(r,function(e){a(t.parse(e))},o,n)},parse:function(r){var a=new e.LoadingManager;a.setURLModifier(function(e){var r=function(e){for(var r in o.files)if(r.substr(-e.length)===e)return o.files[r]}(e);if(r){console.log("Loading",e);var a=new Blob([r.asArrayBuffer()],{type:"application/octet-stream"});return URL.createObjectURL(a)}return e});var o=new JSZip(r);if(o.files["doc.kml"]){var n=(new DOMParser).parseFromString(o.files["doc.kml"].asText(),"application/xml").querySelector("Placemark Model Link href");if(n)return new e.ColladaLoader(a).parse(o.files[n.textContent].asText())}else for(var t in console.warn("KMZLoader: Missing doc.kml file."),o.files){if("dae"===t.split(".").pop().toLowerCase())return new e.ColladaLoader(a).parse(o.files[t].asText())}return console.error("KMZLoader: Couldn't find .dae file."),{scene:new e.Group}}}),e.KMZLoader});
//# sourceMappingURL=../sourcemaps/loaders/KMZLoader.js.map
