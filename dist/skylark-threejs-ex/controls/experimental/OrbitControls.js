/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var e=function(e,s){CameraControls.call(this,e,s),this.mouseButtons.LEFT=t.MOUSE.ROTATE,this.mouseButtons.RIGHT=t.MOUSE.PAN,this.touches.ONE=t.TOUCH.ROTATE,this.touches.TWO=t.TOUCH.DOLLY_PAN};return(e.prototype=Object.create(t.EventDispatcher.prototype)).constructor=e,e});
//# sourceMappingURL=../../sourcemaps/controls/experimental/OrbitControls.js.map
