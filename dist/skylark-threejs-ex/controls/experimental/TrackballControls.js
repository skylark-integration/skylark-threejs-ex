/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../../threex"],function(t,e){"use strict";var s=function(e,s){CameraControls.call(this,e,s),this.trackball=!0,this.screenSpacePanning=!0,this.autoRotate=!1,this.mouseButtons.LEFT=t.MOUSE.ROTATE,this.mouseButtons.RIGHT=t.MOUSE.PAN,this.touches.ONE=t.TOUCH.ROTATE,this.touches.TWO=t.TOUCH.DOLLY_PAN};return(s.prototype=Object.create(t.EventDispatcher.prototype)).constructor=s,e.controls.experimental.TrackballControls=s});
//# sourceMappingURL=../../sourcemaps/controls/experimental/TrackballControls.js.map
