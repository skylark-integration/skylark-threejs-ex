define([
    "skylark-threejs",
    "../threex",
    './CCDIKSolver',
    './MMDPhysics'
], function (
    THREE, 
    threex,
    CCDIKSolver, 
    MMDPhysics
) {
    'use strict';
    var MMDAnimationHelper = function () {
        function MMDAnimationHelper(params) {
            params = params || {};
            this.meshes = [];
            this.camera = null;
            this.cameraTarget = new THREE.Object3D();
            this.cameraTarget.name = 'target';
            this.audio = null;
            this.audioManager = null;
            this.objects = new WeakMap();
            this.configuration = {
                sync: params.sync !== undefined ? params.sync : true,
                afterglow: params.afterglow !== undefined ? params.afterglow : 0,
                resetPhysicsOnLoop: params.resetPhysicsOnLoop !== undefined ? params.resetPhysicsOnLoop : true
            };
            this.enabled = {
                animation: true,
                ik: true,
                grant: true,
                physics: true,
                cameraAnimation: true
            };
            this.onBeforePhysics = function () {
            };
            this.sharedPhysics = false;
            this.masterPhysics = null;
        }
        MMDAnimationHelper.prototype = {
            constructor: MMDAnimationHelper,
            add: function (object, params) {
                params = params || {};
                if (object.isSkinnedMesh) {
                    this._addMesh(object, params);
                } else if (object.isCamera) {
                    this._setupCamera(object, params);
                } else if (object.type === 'Audio') {
                    this._setupAudio(object, params);
                } else {
                    throw new Error('THREE.MMDAnimationHelper.add: ' + 'accepts only ' + 'THREE.SkinnedMesh or ' + 'THREE.Camera or ' + 'THREE.Audio instance.');
                }
                if (this.configuration.sync)
                    this._syncDuration();
                return this;
            },
            remove: function (object) {
                if (object.isSkinnedMesh) {
                    this._removeMesh(object);
                } else if (object.isCamera) {
                    this._clearCamera(object);
                } else if (object.type === 'Audio') {
                    this._clearAudio(object);
                } else {
                    throw new Error('THREE.MMDAnimationHelper.remove: ' + 'accepts only ' + 'THREE.SkinnedMesh or ' + 'THREE.Camera or ' + 'THREE.Audio instance.');
                }
                if (this.configuration.sync)
                    this._syncDuration();
                return this;
            },
            update: function (delta) {
                if (this.audioManager !== null)
                    this.audioManager.control(delta);
                for (var i = 0; i < this.meshes.length; i++) {
                    this._animateMesh(this.meshes[i], delta);
                }
                if (this.sharedPhysics)
                    this._updateSharedPhysics(delta);
                if (this.camera !== null)
                    this._animateCamera(this.camera, delta);
                return this;
            },
            pose: function (mesh, vpd, params) {
                params = params || {};
                if (params.resetPose !== false)
                    mesh.pose();
                var bones = mesh.skeleton.bones;
                var boneParams = vpd.bones;
                var boneNameDictionary = {};
                for (var i = 0, il = bones.length; i < il; i++) {
                    boneNameDictionary[bones[i].name] = i;
                }
                var vector = new THREE.Vector3();
                var quaternion = new THREE.Quaternion();
                for (var i = 0, il = boneParams.length; i < il; i++) {
                    var boneParam = boneParams[i];
                    var boneIndex = boneNameDictionary[boneParam.name];
                    if (boneIndex === undefined)
                        continue;
                    var bone = bones[boneIndex];
                    bone.position.add(vector.fromArray(boneParam.translation));
                    bone.quaternion.multiply(quaternion.fromArray(boneParam.quaternion));
                }
                mesh.updateMatrixWorld(true);
                if (params.ik !== false) {
                    this._createCCDIKSolver(mesh).update(params.saveOriginalBonesBeforeIK);
                }
                if (params.grant !== false) {
                    this.createGrantSolver(mesh).update();
                }
                return this;
            },
            enable: function (key, enabled) {
                if (this.enabled[key] === undefined) {
                    throw new Error('THREE.MMDAnimationHelper.enable: ' + 'unknown key ' + key);
                }
                this.enabled[key] = enabled;
                if (key === 'physics') {
                    for (var i = 0, il = this.meshes.length; i < il; i++) {
                        this._optimizeIK(this.meshes[i], enabled);
                    }
                }
                return this;
            },
            createGrantSolver: function (mesh) {
                return new GrantSolver(mesh, mesh.geometry.userData.MMD.grants);
            },
            _addMesh: function (mesh, params) {
                if (this.meshes.indexOf(mesh) >= 0) {
                    throw new Error('THREE.MMDAnimationHelper._addMesh: ' + "SkinnedMesh '" + mesh.name + "' has already been added.");
                }
                this.meshes.push(mesh);
                this.objects.set(mesh, { looped: false });
                this._setupMeshAnimation(mesh, params.animation);
                if (params.physics !== false) {
                    this._setupMeshPhysics(mesh, params);
                }
                return this;
            },
            _setupCamera: function (camera, params) {
                if (this.camera === camera) {
                    throw new Error('THREE.MMDAnimationHelper._setupCamera: ' + "Camera '" + camera.name + "' has already been set.");
                }
                if (this.camera)
                    this.clearCamera(this.camera);
                this.camera = camera;
                camera.add(this.cameraTarget);
                this.objects.set(camera, {});
                if (params.animation !== undefined) {
                    this._setupCameraAnimation(camera, params.animation);
                }
                return this;
            },
            _setupAudio: function (audio, params) {
                if (this.audio === audio) {
                    throw new Error('THREE.MMDAnimationHelper._setupAudio: ' + "Audio '" + audio.name + "' has already been set.");
                }
                if (this.audio)
                    this.clearAudio(this.audio);
                this.audio = audio;
                this.audioManager = new AudioManager(audio, params);
                this.objects.set(this.audioManager, { duration: this.audioManager.duration });
                return this;
            },
            _removeMesh: function (mesh) {
                var found = false;
                var writeIndex = 0;
                for (var i = 0, il = this.meshes.length; i < il; i++) {
                    if (this.meshes[i] === mesh) {
                        this.objects.delete(mesh);
                        found = true;
                        continue;
                    }
                    this.meshes[writeIndex++] = this.meshes[i];
                }
                if (!found) {
                    throw new Error('THREE.MMDAnimationHelper._removeMesh: ' + "SkinnedMesh '" + mesh.name + "' has not been added yet.");
                }
                this.meshes.length = writeIndex;
                return this;
            },
            _clearCamera: function (camera) {
                if (camera !== this.camera) {
                    throw new Error('THREE.MMDAnimationHelper._clearCamera: ' + "Camera '" + camera.name + "' has not been set yet.");
                }
                this.camera.remove(this.cameraTarget);
                this.objects.delete(this.camera);
                this.camera = null;
                return this;
            },
            _clearAudio: function (audio) {
                if (audio !== this.audio) {
                    throw new Error('THREE.MMDAnimationHelper._clearAudio: ' + "Audio '" + audio.name + "' has not been set yet.");
                }
                this.objects.delete(this.audioManager);
                this.audio = null;
                this.audioManager = null;
                return this;
            },
            _setupMeshAnimation: function (mesh, animation) {
                var objects = this.objects.get(mesh);
                if (animation !== undefined) {
                    var animations = Array.isArray(animation) ? animation : [animation];
                    objects.mixer = new THREE.AnimationMixer(mesh);
                    for (var i = 0, il = animations.length; i < il; i++) {
                        objects.mixer.clipAction(animations[i]).play();
                    }
                    objects.mixer.addEventListener('loop', function (event) {
                        var tracks = event.action._clip.tracks;
                        if (tracks.length > 0 && tracks[0].name.slice(0, 6) !== '.bones')
                            return;
                        objects.looped = true;
                    });
                }
                objects.ikSolver = this._createCCDIKSolver(mesh);
                objects.grantSolver = this.createGrantSolver(mesh);
                return this;
            },
            _setupCameraAnimation: function (camera, animation) {
                var animations = Array.isArray(animation) ? animation : [animation];
                var objects = this.objects.get(camera);
                objects.mixer = new THREE.AnimationMixer(camera);
                for (var i = 0, il = animations.length; i < il; i++) {
                    objects.mixer.clipAction(animations[i]).play();
                }
            },
            _setupMeshPhysics: function (mesh, params) {
                var objects = this.objects.get(mesh);
                if (params.world === undefined && this.sharedPhysics) {
                    var masterPhysics = this._getMasterPhysics();
                    if (masterPhysics !== null)
                        world = masterPhysics.world;
                }
                objects.physics = this._createMMDPhysics(mesh, params);
                if (objects.mixer && params.animationWarmup !== false) {
                    this._animateMesh(mesh, 0);
                    objects.physics.reset();
                }
                objects.physics.warmup(params.warmup !== undefined ? params.warmup : 60);
                this._optimizeIK(mesh, true);
            },
            _animateMesh: function (mesh, delta) {
                var objects = this.objects.get(mesh);
                var mixer = objects.mixer;
                var ikSolver = objects.ikSolver;
                var grantSolver = objects.grantSolver;
                var physics = objects.physics;
                var looped = objects.looped;
                if (mixer && this.enabled.animation) {
                    this._restoreBones(mesh);
                    mixer.update(delta);
                    this._saveBones(mesh);
                    if (ikSolver && this.enabled.ik) {
                        mesh.updateMatrixWorld(true);
                        ikSolver.update();
                    }
                    if (grantSolver && this.enabled.grant) {
                        grantSolver.update();
                    }
                }
                if (looped === true && this.enabled.physics) {
                    if (physics && this.configuration.resetPhysicsOnLoop)
                        physics.reset();
                    objects.looped = false;
                }
                if (physics && this.enabled.physics && !this.sharedPhysics) {
                    this.onBeforePhysics(mesh);
                    physics.update(delta);
                }
            },
            _animateCamera: function (camera, delta) {
                var mixer = this.objects.get(camera).mixer;
                if (mixer && this.enabled.cameraAnimation) {
                    mixer.update(delta);
                    camera.updateProjectionMatrix();
                    camera.up.set(0, 1, 0);
                    camera.up.applyQuaternion(camera.quaternion);
                    camera.lookAt(this.cameraTarget.position);
                }
            },
            _optimizeIK: function (mesh, physicsEnabled) {
                var iks = mesh.geometry.userData.MMD.iks;
                var bones = mesh.geometry.userData.MMD.bones;
                for (var i = 0, il = iks.length; i < il; i++) {
                    var ik = iks[i];
                    var links = ik.links;
                    for (var j = 0, jl = links.length; j < jl; j++) {
                        var link = links[j];
                        if (physicsEnabled === true) {
                            link.enabled = bones[link.index].rigidBodyType > 0 ? false : true;
                        } else {
                            link.enabled = true;
                        }
                    }
                }
            },
            _createCCDIKSolver: function (mesh) {
                if (CCDIKSolver === undefined) {
                    throw new Error('THREE.MMDAnimationHelper: Import CCDIKSolver.');
                }
                return new CCDIKSolver(mesh, mesh.geometry.userData.MMD.iks);
            },
            _createMMDPhysics: function (mesh, params) {
                if (MMDPhysics === undefined) {
                    throw new Error('THREE.MMDPhysics: Import MMDPhysics.');
                }
                return new MMDPhysics(mesh, mesh.geometry.userData.MMD.rigidBodies, mesh.geometry.userData.MMD.constraints, params);
            },
            _syncDuration: function () {
                var max = 0;
                var objects = this.objects;
                var meshes = this.meshes;
                var camera = this.camera;
                var audioManager = this.audioManager;
                for (var i = 0, il = meshes.length; i < il; i++) {
                    var mixer = this.objects.get(meshes[i]).mixer;
                    if (mixer === undefined)
                        continue;
                    for (var j = 0; j < mixer._actions.length; j++) {
                        var clip = mixer._actions[j]._clip;
                        if (!objects.has(clip)) {
                            objects.set(clip, { duration: clip.duration });
                        }
                        max = Math.max(max, objects.get(clip).duration);
                    }
                }
                if (camera !== null) {
                    var mixer = this.objects.get(camera).mixer;
                    if (mixer !== undefined) {
                        for (var i = 0, il = mixer._actions.length; i < il; i++) {
                            var clip = mixer._actions[i]._clip;
                            if (!objects.has(clip)) {
                                objects.set(clip, { duration: clip.duration });
                            }
                            max = Math.max(max, objects.get(clip).duration);
                        }
                    }
                }
                if (audioManager !== null) {
                    max = Math.max(max, objects.get(audioManager).duration);
                }
                max += this.configuration.afterglow;
                for (var i = 0, il = this.meshes.length; i < il; i++) {
                    var mixer = this.objects.get(this.meshes[i]).mixer;
                    if (mixer === undefined)
                        continue;
                    for (var j = 0, jl = mixer._actions.length; j < jl; j++) {
                        mixer._actions[j]._clip.duration = max;
                    }
                }
                if (camera !== null) {
                    var mixer = this.objects.get(camera).mixer;
                    if (mixer !== undefined) {
                        for (var i = 0, il = mixer._actions.length; i < il; i++) {
                            mixer._actions[i]._clip.duration = max;
                        }
                    }
                }
                if (audioManager !== null) {
                    audioManager.duration = max;
                }
            },
            _updatePropertyMixersBuffer: function (mesh) {
                var mixer = this.objects.get(mesh).mixer;
                var propertyMixers = mixer._bindings;
                var accuIndex = mixer._accuIndex;
                for (var i = 0, il = propertyMixers.length; i < il; i++) {
                    var propertyMixer = propertyMixers[i];
                    var buffer = propertyMixer.buffer;
                    var stride = propertyMixer.valueSize;
                    var offset = (accuIndex + 1) * stride;
                    propertyMixer.binding.getValue(buffer, offset);
                }
            },
            _saveBones: function (mesh) {
                var objects = this.objects.get(mesh);
                var bones = mesh.skeleton.bones;
                var backupBones = objects.backupBones;
                if (backupBones === undefined) {
                    backupBones = new Float32Array(bones.length * 7);
                    objects.backupBones = backupBones;
                }
                for (var i = 0, il = bones.length; i < il; i++) {
                    var bone = bones[i];
                    bone.position.toArray(backupBones, i * 7);
                    bone.quaternion.toArray(backupBones, i * 7 + 3);
                }
            },
            _restoreBones: function (mesh) {
                var objects = this.objects.get(mesh);
                var backupBones = objects.backupBones;
                if (backupBones === undefined)
                    return;
                var bones = mesh.skeleton.bones;
                for (var i = 0, il = bones.length; i < il; i++) {
                    var bone = bones[i];
                    bone.position.fromArray(backupBones, i * 7);
                    bone.quaternion.fromArray(backupBones, i * 7 + 3);
                }
            },
            _getMasterPhysics: function () {
                if (this.masterPhysics !== null)
                    return this.masterPhysics;
                for (var i = 0, il = this.meshes.length; i < il; i++) {
                    var physics = this.meshes[i].physics;
                    if (physics !== undefined && physics !== null) {
                        this.masterPhysics = physics;
                        return this.masterPhysics;
                    }
                }
                return null;
            },
            _updateSharedPhysics: function (delta) {
                if (this.meshes.length === 0 || !this.enabled.physics || !this.sharedPhysics)
                    return;
                var physics = this._getMasterPhysics();
                if (physics === null)
                    return;
                for (var i = 0, il = this.meshes.length; i < il; i++) {
                    var p = this.meshes[i].physics;
                    if (p !== null && p !== undefined) {
                        p.updateRigidBodies();
                    }
                }
                physics.stepSimulation(delta);
                for (var i = 0, il = this.meshes.length; i < il; i++) {
                    var p = this.meshes[i].physics;
                    if (p !== null && p !== undefined) {
                        p.updateBones();
                    }
                }
            }
        };
        function AudioManager(audio, params) {
            params = params || {};
            this.audio = audio;
            this.elapsedTime = 0;
            this.currentTime = 0;
            this.delayTime = params.delayTime !== undefined ? params.delayTime : 0;
            this.audioDuration = this.audio.buffer.duration;
            this.duration = this.audioDuration + this.delayTime;
        }
        AudioManager.prototype = {
            constructor: AudioManager,
            control: function (delta) {
                this.elapsed += delta;
                this.currentTime += delta;
                if (this._shouldStopAudio())
                    this.audio.stop();
                if (this._shouldStartAudio())
                    this.audio.play();
                return this;
            },
            _shouldStartAudio: function () {
                if (this.audio.isPlaying)
                    return false;
                while (this.currentTime >= this.duration) {
                    this.currentTime -= this.duration;
                }
                if (this.currentTime < this.delayTime)
                    return false;
                if (this.currentTime - this.delayTime > this.audioDuration)
                    return false;
                this.audio.startTime = this.currentTime - this.delayTime;
                return true;
            },
            _shouldStopAudio: function () {
                return this.audio.isPlaying && this.currentTime >= this.duration;
            }
        };
        function GrantSolver(mesh, grants) {
            this.mesh = mesh;
            this.grants = grants || [];
        }
        GrantSolver.prototype = {
            constructor: GrantSolver,
            update: function () {
                var quaternion = new THREE.Quaternion();
                return function () {
                    var bones = this.mesh.skeleton.bones;
                    var grants = this.grants;
                    for (var i = 0, il = grants.length; i < il; i++) {
                        var grant = grants[i];
                        var bone = bones[grant.index];
                        var parentBone = bones[grant.parentIndex];
                        if (grant.isLocal) {
                            if (grant.affectPosition) {
                            }
                            if (grant.affectRotation) {
                            }
                        } else {
                            if (grant.affectPosition) {
                            }
                            if (grant.affectRotation) {
                                quaternion.set(0, 0, 0, 1);
                                quaternion.slerp(parentBone.quaternion, grant.ratio);
                                bone.quaternion.multiply(quaternion);
                            }
                        }
                    }
                    return this;
                };
            }()
        };
        return MMDAnimationHelper;
    }();

    return threex.animation.MMDAnimationHelper = MMDAnimationHelper;
});