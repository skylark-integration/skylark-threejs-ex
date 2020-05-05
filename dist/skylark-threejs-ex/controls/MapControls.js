/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var s=function(s,e){OrbitControls.call(this,s,e),this.mouseButtons.LEFT=t.MOUSE.PAN,this.mouseButtons.RIGHT=t.MOUSE.ROTATE,this.touches.ONE=t.TOUCH.PAN,this.touches.TWO=t.TOUCH.DOLLY_ROTATE};return(s.prototype=Object.create(t.EventDispatcher.prototype)).constructor=s,s});
//# sourceMappingURL=../sourcemaps/controls/MapControls.js.map
