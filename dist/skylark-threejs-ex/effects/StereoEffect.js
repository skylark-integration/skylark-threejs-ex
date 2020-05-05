/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";return function(t){var i=new e.StereoCamera;i.aspect=.5;var r=new e.Vector2;this.setEyeSeparation=function(e){i.eyeSep=e},this.setSize=function(e,i){t.setSize(e,i)},this.render=function(e,s){e.updateMatrixWorld(),null===s.parent&&s.updateMatrixWorld(),i.update(s),t.getSize(r),t.autoClear&&t.clear(),t.setScissorTest(!0),t.setScissor(0,0,r.width/2,r.height),t.setViewport(0,0,r.width/2,r.height),t.render(e,i.cameraL),t.setScissor(r.width/2,0,r.width/2,r.height),t.setViewport(r.width/2,0,r.width/2,r.height),t.render(e,i.cameraR),t.setScissorTest(!1)}}});
//# sourceMappingURL=../sourcemaps/effects/StereoEffect.js.map
