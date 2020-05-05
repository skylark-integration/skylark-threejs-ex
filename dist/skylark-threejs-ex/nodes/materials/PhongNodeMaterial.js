/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./nodes/PhongNode","./NodeMaterial","../core/NodeUtils"],function(e,t,o){"use strict";function n(){var o=new e;t.call(this,o,o),this.type="PhongNodeMaterial"}return n.prototype=Object.create(t.prototype),n.prototype.constructor=n,o.addShortcuts(n.prototype,"fragment",["color","alpha","specular","shininess","normal","emissive","ambient","light","shadow","ao","environment","environmentAlpha","mask","position"]),n});
//# sourceMappingURL=../../sourcemaps/nodes/materials/PhongNodeMaterial.js.map
