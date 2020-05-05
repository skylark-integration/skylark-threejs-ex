/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./nodes/StandardNode","./NodeMaterial","../core/NodeUtils"],function(e,t,o){"use strict";function a(){var o=new e;t.call(this,o,o),this.type="StandardNodeMaterial"}return a.prototype=Object.create(t.prototype),a.prototype.constructor=a,o.addShortcuts(a.prototype,"fragment",["color","alpha","roughness","metalness","reflectivity","clearcoat","clearcoatRoughness","clearcoatNormal","normal","emissive","ambient","light","shadow","ao","environment","mask","position","sheen"]),a});
//# sourceMappingURL=../../sourcemaps/nodes/materials/StandardNodeMaterial.js.map
