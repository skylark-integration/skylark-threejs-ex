/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";var i=function(i,e){t.Mesh.call(this,i,e),this.type="MorphAnimMesh",this.mixer=new t.AnimationMixer(this),this.activeAction=null};return(i.prototype=Object.create(t.Mesh.prototype)).constructor=i,i.prototype.setDirectionForward=function(){this.mixer.timeScale=1},i.prototype.setDirectionBackward=function(){this.mixer.timeScale=-1},i.prototype.playAnimation=function(i,e){this.activeAction&&(this.activeAction.stop(),this.activeAction=null);var n=t.AnimationClip.findByName(this,i);if(!n)throw new Error("THREE.MorphAnimMesh: animations["+i+"] undefined in .playAnimation()");var o=this.mixer.clipAction(n);o.timeScale=n.tracks.length*e/n.duration,this.activeAction=o.play()},i.prototype.updateAnimation=function(t){this.mixer.update(t)},i.prototype.copy=function(i){return t.Mesh.prototype.copy.call(this,i),this.mixer=new t.AnimationMixer(this),this},i});
//# sourceMappingURL=../sourcemaps/misc/MorphAnimMesh.js.map
