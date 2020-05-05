/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode"],function(t){"use strict";function e(o){t.call(this,"v3",{shared:!1}),this.scope=o||e.TOTAL}return e.TOTAL="total",e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="Light",e.prototype.generate=function(t,e){return t.isCache("light")?t.format("reflectedLight.directDiffuse",this.type,e):(console.warn('THREE.LightNode is only compatible in "light" channel.'),t.format("vec3( 0.0 )",this.type,e))},e.prototype.copy=function(e){return t.prototype.copy.call(this,e),this.scope=e.scope,this},e.prototype.toJSON=function(t){var e=this.getJSONNode(t);return e||((e=this.createJSONNode(t)).scope=this.scope),e},e});
//# sourceMappingURL=../../sourcemaps/nodes/accessors/LightNode.js.map
