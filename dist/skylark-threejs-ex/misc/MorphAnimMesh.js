/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(i){return i.MorphAnimMesh=function(t,e){i.Mesh.call(this,t,e),this.type="MorphAnimMesh",this.mixer=new i.AnimationMixer(this),this.activeAction=null},i.MorphAnimMesh.prototype=Object.create(i.Mesh.prototype),i.MorphAnimMesh.prototype.constructor=i.MorphAnimMesh,i.MorphAnimMesh.prototype.setDirectionForward=function(){this.mixer.timeScale=1},i.MorphAnimMesh.prototype.setDirectionBackward=function(){this.mixer.timeScale=-1},i.MorphAnimMesh.prototype.playAnimation=function(t,e){this.activeAction&&(this.activeAction.stop(),this.activeAction=null);var n=i.AnimationClip.findByName(this,t);if(!n)throw new Error("THREE.MorphAnimMesh: animations["+t+"] undefined in .playAnimation()");var o=this.mixer.clipAction(n);o.timeScale=n.tracks.length*e/n.duration,this.activeAction=o.play()},i.MorphAnimMesh.prototype.updateAnimation=function(i){this.mixer.update(i)},i.MorphAnimMesh.prototype.copy=function(t){return i.Mesh.prototype.copy.call(this,t),this.mixer=new i.AnimationMixer(this),this},i.MorphAnimMesh});
//# sourceMappingURL=../sourcemaps/misc/MorphAnimMesh.js.map
