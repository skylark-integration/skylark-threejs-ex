/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../../MTLLoader"],function(a){"use strict";return{link:function(a,t){"function"==typeof t.addMaterials&&t.addMaterials(this.addMaterialsFromMtlLoader(a),!0)},addMaterialsFromMtlLoader:function(t){let e={};return t instanceof a.MaterialCreator&&(t.preload(),e=t.materials),e}}});
//# sourceMappingURL=../../../sourcemaps/loaders/obj2/bridge/MtlObjBridge.js.map
