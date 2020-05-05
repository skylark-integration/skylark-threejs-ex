define(["skylark-threejs"], function (a) {
    'use strict';
    var MorphAnimMesh = function (geometry, material) {
        a.Mesh.call(this, geometry, material);
        this.type = 'MorphAnimMesh';
        this.mixer = new a.AnimationMixer(this);
        this.activeAction = null;
    };
    MorphAnimMesh.prototype = Object.create(a.Mesh.prototype);
    MorphAnimMesh.prototype.constructor = MorphAnimMesh;
    MorphAnimMesh.prototype.setDirectionForward = function () {
        this.mixer.timeScale = 1;
    };
    MorphAnimMesh.prototype.setDirectionBackward = function () {
        this.mixer.timeScale = -1;
    };
    MorphAnimMesh.prototype.playAnimation = function (label, fps) {
        if (this.activeAction) {
            this.activeAction.stop();
            this.activeAction = null;
        }
        var clip = a.AnimationClip.findByName(this, label);
        if (clip) {
            var action = this.mixer.clipAction(clip);
            action.timeScale = clip.tracks.length * fps / clip.duration;
            this.activeAction = action.play();
        } else {
            throw new Error('THREE.MorphAnimMesh: animations[' + label + '] undefined in .playAnimation()');
        }
    };
    MorphAnimMesh.prototype.updateAnimation = function (delta) {
        this.mixer.update(delta);
    };
    MorphAnimMesh.prototype.copy = function (source) {
        a.Mesh.prototype.copy.call(this, source);
        this.mixer = new a.AnimationMixer(this);
        return this;
    };
    return MorphAnimMesh;
});