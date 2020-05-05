/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var e=function(e,o){CameraControls.call(this,e,o),this.mouseButtons.LEFT=t.MOUSE.PAN,this.mouseButtons.RIGHT=t.MOUSE.ROTATE,this.touches.ONE=t.TOUCH.PAN,this.touches.TWO=t.TOUCH.DOLLY_ROTATE};return(e.prototype=Object.create(t.EventDispatcher.prototype)).constructor=e,MapControl});
//# sourceMappingURL=../../sourcemaps/controls/experimental/MapControls.js.map
