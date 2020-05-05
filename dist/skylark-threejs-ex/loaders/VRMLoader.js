/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./GLTFLoader"],function(t,r){"use strict";return function(){function e(e){if(void 0===r)throw new Error("THREE.VRMLoader: Import GLTFLoader.");t.Loader.call(this,e),this.gltfLoader=new r(this.manager)}return e.prototype=Object.assign(Object.create(t.Loader.prototype),{constructor:e,load:function(t,r,e,o){var n=this;this.gltfLoader.load(t,function(t){n.parse(t,r)},e,o)},setDRACOLoader:function(t){return this.glTFLoader.setDRACOLoader(t),this},parse:function(t,r){r(t)}}),e}()});
//# sourceMappingURL=../sourcemaps/loaders/VRMLoader.js.map
