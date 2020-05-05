/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./nodes/SpriteNode","./NodeMaterial","../core/NodeUtils"],function(t,e,o){"use strict";function r(){var o=new t;e.call(this,o,o),this.type="SpriteNodeMaterial"}return r.prototype=Object.create(e.prototype),r.prototype.constructor=r,o.addShortcuts(r.prototype,"fragment",["color","alpha","mask","position","spherical"]),r});
//# sourceMappingURL=../../sourcemaps/nodes/materials/SpriteNodeMaterial.js.map
