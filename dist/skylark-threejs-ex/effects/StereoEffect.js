/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";return t.effects.StereoEffect=function(t){var r=new e.StereoCamera;r.aspect=.5;var i=new e.Vector2;this.setEyeSeparation=function(e){r.eyeSep=e},this.setSize=function(e,r){t.setSize(e,r)},this.render=function(e,s){e.updateMatrixWorld(),null===s.parent&&s.updateMatrixWorld(),r.update(s),t.getSize(i),t.autoClear&&t.clear(),t.setScissorTest(!0),t.setScissor(0,0,i.width/2,i.height),t.setViewport(0,0,i.width/2,i.height),t.render(e,r.cameraL),t.setScissor(i.width/2,0,i.width/2,i.height),t.setViewport(i.width/2,0,i.width/2,i.height),t.render(e,r.cameraR),t.setScissorTest(!1)}}});
//# sourceMappingURL=../sourcemaps/effects/StereoEffect.js.map
