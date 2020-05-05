/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./nodes/MeshStandardNode","./NodeMaterial","../core/NodeUtils"],function(e,t,o){"use strict";function r(){var o=new e;t.call(this,o,o),this.type="MeshStandardNodeMaterial"}return r.prototype=Object.create(t.prototype),r.prototype.constructor=r,o.addShortcuts(r.prototype,"properties",["color","roughness","metalness","map","normalMap","normalScale","metalnessMap","roughnessMap","envMap"]),r});
//# sourceMappingURL=../../sourcemaps/nodes/materials/MeshStandardNodeMaterial.js.map
