/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";const s=function(e,s){this.disregardMesh=!0===e,this.alteredMesh=!0===s,this.meshes=[]};return s.prototype={constructor:s,addMesh:function(e){this.meshes.push(e),this.alteredMesh=!0},isDisregardMesh:function(){return this.disregardMesh},providesAlteredMeshes:function(){return this.alteredMesh}},s});
//# sourceMappingURL=../../../sourcemaps/loaders/obj2/shared/LoadedMeshUserOverride.js.map
