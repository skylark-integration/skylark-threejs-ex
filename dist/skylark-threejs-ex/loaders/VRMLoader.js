/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./GLTFLoader"],function(r){return r.VRMLoader=function(){function e(e){if(void 0===r.GLTFLoader)throw new Error("THREE.VRMLoader: Import THREE.GLTFLoader.");r.Loader.call(this,e),this.gltfLoader=new r.GLTFLoader(this.manager)}return e.prototype=Object.assign(Object.create(r.Loader.prototype),{constructor:e,load:function(r,e,o,t){var a=this;this.gltfLoader.load(r,function(r){a.parse(r,e)},o,t)},setDRACOLoader:function(r){return this.glTFLoader.setDRACOLoader(r),this},parse:function(r,e){e(r)}}),e}(),r.VRMLoader});
//# sourceMappingURL=../sourcemaps/loaders/VRMLoader.js.map
