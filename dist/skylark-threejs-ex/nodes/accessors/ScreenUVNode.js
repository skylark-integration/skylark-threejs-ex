/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../core/TempNode","./ResolutionNode"],function(t,o){"use strict";function e(e){t.call(this,"v2"),this.resolution=e||new o}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype.nodeType="ScreenUV",e.prototype.generate=function(t,o){var e;return t.isShader("fragment")?e="( gl_FragCoord.xy / "+this.resolution.build(t,"v2")+")":(console.warn("THREE.ScreenUVNode is not compatible with "+t.shader+" shader."),e="vec2( 0.0 )"),t.format(e,this.getType(t),o)},e.prototype.copy=function(o){return t.prototype.copy.call(this,o),this.resolution=o.resolution,this},e.prototype.toJSON=function(t){var o=this.getJSONNode(t);return o||((o=this.createJSONNode(t)).resolution=this.resolution.toJSON(t).uuid),o},e});
//# sourceMappingURL=../../sourcemaps/nodes/accessors/ScreenUVNode.js.map
