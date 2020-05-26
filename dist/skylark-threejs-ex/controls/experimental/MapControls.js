/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../../threex"],function(t,e){"use strict";var o=function(e,o){CameraControls.call(this,e,o),this.mouseButtons.LEFT=t.MOUSE.PAN,this.mouseButtons.RIGHT=t.MOUSE.ROTATE,this.touches.ONE=t.TOUCH.PAN,this.touches.TWO=t.TOUCH.DOLLY_ROTATE};return(o.prototype=Object.create(t.EventDispatcher.prototype)).constructor=o,e.controls.experimental.MapControl=MapControl});
//# sourceMappingURL=../../sourcemaps/controls/experimental/MapControls.js.map
