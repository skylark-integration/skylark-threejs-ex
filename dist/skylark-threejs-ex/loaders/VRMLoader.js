/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","./GLTFLoader"],function(r,t,e){"use strict";var o=function(){function t(t){if(void 0===e)throw new Error("THREE.VRMLoader: Import GLTFLoader.");r.Loader.call(this,t),this.gltfLoader=new e(this.manager)}return t.prototype=Object.assign(Object.create(r.Loader.prototype),{constructor:t,load:function(r,t,e,o){var a=this;this.gltfLoader.load(r,function(r){a.parse(r,t)},e,o)},setDRACOLoader:function(r){return this.glTFLoader.setDRACOLoader(r),this},parse:function(r,t){t(r)}}),t}();return t.loaders.VRMLoader=o});
//# sourceMappingURL=../sourcemaps/loaders/VRMLoader.js.map
