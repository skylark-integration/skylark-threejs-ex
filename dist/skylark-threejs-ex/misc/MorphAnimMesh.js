/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,i){"use strict";var e=function(i,e){t.Mesh.call(this,i,e),this.type="MorphAnimMesh",this.mixer=new t.AnimationMixer(this),this.activeAction=null};return(e.prototype=Object.create(t.Mesh.prototype)).constructor=e,e.prototype.setDirectionForward=function(){this.mixer.timeScale=1},e.prototype.setDirectionBackward=function(){this.mixer.timeScale=-1},e.prototype.playAnimation=function(i,e){this.activeAction&&(this.activeAction.stop(),this.activeAction=null);var n=t.AnimationClip.findByName(this,i);if(!n)throw new Error("THREE.MorphAnimMesh: animations["+i+"] undefined in .playAnimation()");var o=this.mixer.clipAction(n);o.timeScale=n.tracks.length*e/n.duration,this.activeAction=o.play()},e.prototype.updateAnimation=function(t){this.mixer.update(t)},e.prototype.copy=function(i){return t.Mesh.prototype.copy.call(this,i),this.mixer=new t.AnimationMixer(this),this},i.misc.MorphAnimMesh=e});
//# sourceMappingURL=../sourcemaps/misc/MorphAnimMesh.js.map
