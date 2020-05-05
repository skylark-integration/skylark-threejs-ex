/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";var t=function(t){e.Loader.call(this,t)};return t.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:t,load:function(t,i,r,s){var n=this,m=""===n.path?e.LoaderUtils.extractUrlBase(t):n.path,a=new e.FileLoader(this.manager);a.setPath(n.path),a.setResponseType("arraybuffer"),a.load(t,function(e){i(n.parse(e,m))},r,s)},parse:function(t,i){var r=new e.TextureLoader(this.manager);r.setPath(this.resourcePath||i).setCrossOrigin(this.crossOrigin);var s={KeyFrame:function(t,i){this.time=t,this.matrix=i.clone(),this.position=new e.Vector3,this.quaternion=new e.Quaternion,this.scale=new e.Vector3(1,1,1),this.matrix.decompose(this.position,this.quaternion,this.scale),this.clone=function(){return new s.KeyFrame(this.time,this.matrix)},this.lerp=function(e,t){var i=(t-=this.time)/(e.time-this.time),r=1-i,n=this.position,m=this.quaternion,a=e.position,o=e.quaternion;return s.KeyFrame.tempAniPos.x=n.x*r+a.x*i,s.KeyFrame.tempAniPos.y=n.y*r+a.y*i,s.KeyFrame.tempAniPos.z=n.z*r+a.z*i,s.KeyFrame.tempAniQuat.set(m.x,m.y,m.z,m.w),s.KeyFrame.tempAniQuat.slerp(o,i),s.KeyFrame.tempAniMatrix.compose(s.KeyFrame.tempAniPos,s.KeyFrame.tempAniQuat,s.KeyFrame.tempAniScale)}}};s.KeyFrame.tempAniPos=new e.Vector3,s.KeyFrame.tempAniQuat=new e.Quaternion,s.KeyFrame.tempAniScale=new e.Vector3(1,1,1),s.KeyFrame.tempAniMatrix=new e.Matrix4,s.KeyFrameTrack=function(){this.keys=[],this.target=null,this.time=0,this.length=0,this._accelTable={},this.fps=20,this.addKey=function(e){this.keys.push(e)},this.init=function(){if(this.sortKeys(),this.keys.length>0?this.length=this.keys[this.keys.length-1].time:this.length=0,this.fps)for(var e=0;e<this.length*this.fps;e++)for(var t=0;t<this.keys.length;t++){if(this.keys[t].time==e){this._accelTable[e]=t;break}if(this.keys[t].time<e/this.fps&&this.keys[t+1]&&this.keys[t+1].time>=e/this.fps){this._accelTable[e]=t;break}}},this.parseFromThree=function(e){var t=e.fps;this.target=e.node;for(var i=e.hierarchy[0].keys,r=0;r<i.length;r++)this.addKey(new s.KeyFrame(r/t||i[r].time,i[r].targets[0].data));this.init()},this.parseFromCollada=function(e){for(var t=e.keys,i=this.fps,r=0;r<t.length;r++)this.addKey(new s.KeyFrame(r/i||t[r].time,t[r].matrix));this.init()},this.sortKeys=function(){this.keys.sort(this.keySortFunc)},this.keySortFunc=function(e,t){return e.time-t.time},this.clone=function(){var e=new s.KeyFrameTrack;e.target=this.target,e.time=this.time,e.length=this.length;for(var t=0;t<this.keys.length;t++)e.addKey(this.keys[t].clone());return e.init(),e},this.reTarget=function(e,t){t||(t=s.TrackTargetNodeNameCompare),this.target=t(e,this.target)},this.keySearchAccel=function(e){return e*=this.fps,e=Math.floor(e),this._accelTable[e]||0},this.setTime=function(e){e=Math.abs(e),this.length&&(e=e%this.length+.05);for(var t=null,i=null,r=this.keySearchAccel(e);r<this.keys.length;r++){if(this.keys[r].time==e){t=this.keys[r],i=this.keys[r];break}if(this.keys[r].time<e&&this.keys[r+1]&&this.keys[r+1].time>e){t=this.keys[r],i=this.keys[r+1];break}if(this.keys[r].time<e&&r==this.keys.length-1){t=this.keys[r],(i=this.keys[0].clone()).time+=this.length+.05;break}}return t&&i&&t!==i?(this.target.matrixAutoUpdate=!1,this.target.matrix.copy(t.lerp(i,e)),void(this.target.matrixWorldNeedsUpdate=!0)):t&&i&&t==i?(this.target.matrixAutoUpdate=!1,this.target.matrix.copy(t.matrix),void(this.target.matrixWorldNeedsUpdate=!0)):void 0}},s.TrackTargetNodeNameCompare=function(e,t){return function e(t,i){if(t.name==i)return t;for(var r=0;r<t.children.length;r++){var s=e(t.children[r],i);if(s)return s}return null}(e,t.name)},s.Animation=function(){this.tracks=[],this.length=0,this.addTrack=function(e){this.tracks.push(e),this.length=Math.max(e.length,this.length)},this.setTime=function(e){this.time=e;for(var t=0;t<this.tracks.length;t++)this.tracks[t].setTime(e)},this.clone=function(e,t){t||(t=s.TrackTargetNodeNameCompare);var i=new s.Animation;i.target=e;for(var r=0;r<this.tracks.length;r++){var n=this.tracks[r].clone();n.reTarget(e,t),i.addTrack(n)}return i}};var n=4660,m=4661,a=4662,o=4663,h=4664,u=4665,f=4666,l=4667,c=4668,d=4669,p=4670,y=1,g=2,N=4,v=256,T=65536,A=1,w=4,x=1,B=3,C=1,k=6,M=8,K=10,b=4;function P(e){return v<<e}function E(e){return T<<e}function S(t,i){var r=new e.Bone;for(var s in r.matrix.copy(t.matrix),r.matrixWorld.copy(t.matrixWorld),r.position.copy(t.position),r.quaternion.copy(t.quaternion),r.scale.copy(t.scale),i.nodeCount++,r.name="bone_"+t.name+i.nodeCount.toString(),i.nodeToBoneMap[t.name]||(i.nodeToBoneMap[t.name]=[]),i.nodeToBoneMap[t.name].push(r),t.children){var n=S(t.children[s],i);r.add(n)}return r}function F(e,t){for(var i=[],r=0;r<e.length;r++)i.push({i:e[r],w:t[r]});for(i.sort(function(e,t){return t.w-e.w});i.length<4;)i.push({i:0,w:0});i.length>4&&(i.length=4);var s=0;for(r=0;r<4;r++)s+=i[r].w*i[r].w;s=Math.sqrt(s);for(r=0;r<4;r++)i[r].w=i[r].w/s,e[r]=i[r].i,t[r]=i[r].w}function R(e,t){if(0==e.name.indexOf("bone_"+t))return e;for(var i in e.children){var r=R(e.children[i],t);if(r)return r}}function V(){this.mPrimitiveTypes=0,this.mNumVertices=0,this.mNumFaces=0,this.mNumBones=0,this.mMaterialIndex=0,this.mVertices=[],this.mNormals=[],this.mTangents=[],this.mBitangents=[],this.mColors=[[]],this.mTextureCoords=[[]],this.mFaces=[],this.mBones=[],this.hookupSkeletons=function(t){if(0!=this.mBones.length){for(var i=[],r=[],s=t.findNode(this.mBones[0].mName);s.mParent&&s.mParent.isBone;)s=s.mParent;var n=S(s.toTHREE(t),t);this.threeNode.add(n);for(var m=0;m<this.mBones.length;m++){if(o=R(n,this.mBones[m].mName)){var a=o;i.push(a),r.push(this.mBones[m].mOffsetMatrix.toTHREE())}else{if(!(s=t.findNode(this.mBones[m].mName)))return;n=S(s.toTHREE(t),t);this.threeNode.add(n);var o;a=o=R(n,this.mBones[m].mName);i.push(a),r.push(this.mBones[m].mOffsetMatrix.toTHREE())}}var h=new e.Skeleton(i,r);this.threeNode.bind(h,new e.Matrix4),this.threeNode.material.skinning=!0}},this.toTHREE=function(t){if(this.threeNode)return this.threeNode;var i,r,s=new e.BufferGeometry;if(i=t.mMaterials[this.mMaterialIndex]?t.mMaterials[this.mMaterialIndex].toTHREE(t):new e.MeshLambertMaterial,s.setIndex(new e.BufferAttribute(new Uint32Array(this.mIndexArray),1)),s.setAttribute("position",new e.BufferAttribute(this.mVertexBuffer,3)),this.mNormalBuffer&&this.mNormalBuffer.length>0&&s.setAttribute("normal",new e.BufferAttribute(this.mNormalBuffer,3)),this.mColorBuffer&&this.mColorBuffer.length>0&&s.setAttribute("color",new e.BufferAttribute(this.mColorBuffer,4)),this.mTexCoordsBuffers[0]&&this.mTexCoordsBuffers[0].length>0&&s.setAttribute("uv",new e.BufferAttribute(new Float32Array(this.mTexCoordsBuffers[0]),2)),this.mTexCoordsBuffers[1]&&this.mTexCoordsBuffers[1].length>0&&s.setAttribute("uv1",new e.BufferAttribute(new Float32Array(this.mTexCoordsBuffers[1]),2)),this.mTangentBuffer&&this.mTangentBuffer.length>0&&s.setAttribute("tangents",new e.BufferAttribute(this.mTangentBuffer,3)),this.mBitangentBuffer&&this.mBitangentBuffer.length>0&&s.setAttribute("bitangents",new e.BufferAttribute(this.mBitangentBuffer,3)),this.mBones.length>0){for(var n=[],m=[],a=0;a<this.mBones.length;a++)for(var o=0;o<this.mBones[a].mWeights.length;o++){var h=this.mBones[a].mWeights[o];h&&(n[h.mVertexId]||(n[h.mVertexId]=[]),m[h.mVertexId]||(m[h.mVertexId]=[]),n[h.mVertexId].push(h.mWeight),m[h.mVertexId].push(parseInt(a)))}for(var a in m)F(m[a],n[a]);var u=[],f=[];for(a=0;a<n.length;a++)for(o=0;o<4;o++)n[a]&&m[a]?(u.push(n[a][o]),f.push(m[a][o])):(u.push(0),f.push(0));s.setAttribute("skinWeight",new e.BufferAttribute(new Float32Array(u),b)),s.setAttribute("skinIndex",new e.BufferAttribute(new Float32Array(f),b))}return 0==this.mBones.length&&(r=new e.Mesh(s,i)),this.mBones.length>0&&(r=new e.SkinnedMesh(s,i)).normalizeSkinWeights(),this.threeNode=r,r}}function I(){this.mNumIndices=0,this.mIndices=[]}function O(){this.data=[],this.toString=function(){var e="";return this.data.forEach(function(t){e+=String.fromCharCode(t)}),e.replace(/[^\x20-\x7E]+/g,"")}}function H(){this.mName="",this.mTransformation=[],this.mNumChildren=0,this.mNumMeshes=0,this.mMeshes=[],this.mChildren=[],this.toTHREE=function(t){if(this.threeNode)return this.threeNode;var i=new e.Object3D;i.name=this.mName,i.matrix=this.mTransformation.toTHREE();for(var r=0;r<this.mChildren.length;r++)i.add(this.mChildren[r].toTHREE(t));for(r=0;r<this.mMeshes.length;r++)i.add(t.mMeshes[this.mMeshes[r]].toTHREE(t));return this.threeNode=i,i.matrix.decompose(i.position,i.quaternion,i.scale),i}}function D(){this.mName="",this.mNumWeights=0,this.mOffsetMatrix=0}function $(){this.mKey="",this.mSemantic=0,this.mIndex=0,this.mData=[],this.mDataLength=0,this.mType=0,this.dataAsColor=function(){var t=new Uint8Array(this.mData).buffer,i=new DataView(t),r=i.getFloat32(0,!0),s=i.getFloat32(4,!0),n=i.getFloat32(8,!0);return new e.Color(r,s,n)},this.dataAsFloat=function(){var e=new Uint8Array(this.mData).buffer;return new DataView(e).getFloat32(0,!0)},this.dataAsBool=function(){var e=new Uint8Array(this.mData).buffer;return!!new DataView(e).getFloat32(0,!0)},this.dataAsString=function(){var e=new O;return e.data=this.mData,e.toString()},this.dataAsMap=function(){var e=new O;e.data=this.mData;var t=e.toString();return-1!=(t=t.replace(/\\/g,"/")).indexOf("/")&&(t=t.substr(t.lastIndexOf("/")+1)),r.load(t)}}var U={"?mat.name":"name","$mat.shadingm":"shading","$mat.twosided":"twoSided","$mat.wireframe":"wireframe","$clr.ambient":"ambient","$clr.diffuse":"color","$clr.specular":"specular","$clr.emissive":"emissive","$clr.transparent":"transparent","$clr.reflective":"reflect","$mat.shininess":"shininess","$mat.reflectivity":"reflectivity","$mat.refracti":"refraction","$tex.file":"map"},L={"?mat.name":"string","$mat.shadingm":"bool","$mat.twosided":"bool","$mat.wireframe":"bool","$clr.ambient":"color","$clr.diffuse":"color","$clr.specular":"color","$clr.emissive":"color","$clr.transparent":"color","$clr.reflective":"color","$mat.shininess":"float","$mat.reflectivity":"float","$mat.refracti":"float","$tex.file":"map"};function W(){this.mNumAllocated=0,this.mNumProperties=0,this.mProperties=[],this.toTHREE=function(){for(var t=new e.MeshPhongMaterial,i=0;i<this.mProperties.length;i++)if("float"==L[this.mProperties[i].mKey]&&(t[U[this.mProperties[i].mKey]]=this.mProperties[i].dataAsFloat()),"color"==L[this.mProperties[i].mKey]&&(t[U[this.mProperties[i].mKey]]=this.mProperties[i].dataAsColor()),"bool"==L[this.mProperties[i].mKey]&&(t[U[this.mProperties[i].mKey]]=this.mProperties[i].dataAsBool()),"string"==L[this.mProperties[i].mKey]&&(t[U[this.mProperties[i].mKey]]=this.mProperties[i].dataAsString()),"map"==L[this.mProperties[i].mKey]){var r=this.mProperties[i];r.mSemantic==C&&(t.map=this.mProperties[i].dataAsMap()),r.mSemantic==k&&(t.normalMap=this.mProperties[i].dataAsMap()),r.mSemantic==K&&(t.lightMap=this.mProperties[i].dataAsMap()),r.mSemantic==M&&(t.alphaMap=this.mProperties[i].dataAsMap())}return t.ambient.r=.53,t.ambient.g=.53,t.ambient.b=.53,t.color.r=1,t.color.g=1,t.color.b=1,t}}function z(t,i,r){var s=new e.Vector3,n=1-r;return s.x=t.x*r+i.x*n,s.y=t.y*r+i.y*n,s.z=t.z*r+i.z*n,s}function Q(e,t,i){return e.clone().slerp(t,1-i)}function q(e,t,i,r){if(1==e.length)return e[0].mValue.toTHREE();for(var s=1/0,n=null,m=null,a=0;a<e.length;a++){var o=Math.abs(e[a].mTime-t);o<s&&e[a].mTime<=t&&(s=o,n=e[a],m=e[a+1])}if(n){if(m){var h=m.mTime-n.mTime,u=(n.mTime-t)/h;return r(n.mValue.toTHREE(),m.mValue.toTHREE(),u)}(m=e[0].clone()).mTime+=i;h=m.mTime-n.mTime,u=(n.mTime-t)/h;return r(n.mValue.toTHREE(),m.mValue.toTHREE(),u)}return null}function j(){this.mNodeName="",this.mNumPositionKeys=0,this.mNumRotationKeys=0,this.mNumScalingKeys=0,this.mPositionKeys=[],this.mRotationKeys=[],this.mScalingKeys=[],this.mPreState="",this.mPostState="",this.init=function(e){function t(t){t.mTime/=e}e||(e=1),this.mPositionKeys.forEach(t),this.mRotationKeys.forEach(t),this.mScalingKeys.forEach(t)},this.sortKeys=function(){function e(e,t){return e.mTime-t.mTime}this.mPositionKeys.sort(e),this.mRotationKeys.sort(e),this.mScalingKeys.sort(e)},this.getLength=function(){return Math.max(Math.max.apply(null,this.mPositionKeys.map(function(e){return e.mTime})),Math.max.apply(null,this.mRotationKeys.map(function(e){return e.mTime})),Math.max.apply(null,this.mScalingKeys.map(function(e){return e.mTime})))},this.toTHREE=function(t){this.sortKeys();for(var i=this.getLength(),r=new s.KeyFrameTrack,n=0;n<i;n+=.05){var m=new e.Matrix4,a=n,o=q(this.mPositionKeys,a,i,z),h=q(this.mScalingKeys,a,i,z),u=q(this.mRotationKeys,a,i,Q);m.compose(o,u,h);var f=new s.KeyFrame(a,m);r.addKey(f)}r.target=t.findNode(this.mNodeName).toTHREE();var l=[r];if(t.nodeToBoneMap[this.mNodeName])for(n=0;n<t.nodeToBoneMap[this.mNodeName].length;n++){var c=r.clone();c.target=t.nodeToBoneMap[this.mNodeName][n],l.push(c)}return l}}function _(){this.mName="",this.mDuration=0,this.mTicksPerSecond=0,this.mNumChannels=0,this.mChannels=[],this.toTHREE=function(e){var t=new s.Animation;for(var i in this.mChannels){this.mChannels[i].init(this.mTicksPerSecond);var r=this.mChannels[i].toTHREE(e);for(var n in r)r[n].init(),t.addTrack(r[n])}return t.length=Math.max.apply(null,t.tracks.map(function(e){return e.length})),t}}function G(){this.mWidth=0,this.mHeight=0,this.texAchFormatHint=[],this.pcData=[]}function J(){this.mName="",this.mType=0,this.mAttenuationConstant=0,this.mAttenuationLinear=0,this.mAttenuationQuadratic=0,this.mAngleInnerCone=0,this.mAngleOuterCone=0,this.mColorDiffuse=null,this.mColorSpecular=null,this.mColorAmbient=null}function X(){this.mName="",this.mPosition=null,this.mLookAt=null,this.mUp=null,this.mHorizontalFOV=0,this.mClipPlaneNear=0,this.mClipPlaneFar=0,this.mAspect=0}var Y=!0;function Z(e){var t=e.getFloat32(e.readOffset,Y);return e.readOffset+=4,t}function ee(e){var t=e.getFloat64(e.readOffset,Y);return e.readOffset+=8,t}function te(e){var t=e.getUint16(e.readOffset,Y);return e.readOffset+=2,t}function ie(e){var t=e.getUint32(e.readOffset,Y);return e.readOffset+=4,t}function re(e){var t=e.getUint32(e.readOffset,Y);return e.readOffset+=4,t}function se(t){var i=new function(){this.x=0,this.y=0,this.z=0,this.toTHREE=function(){return new e.Vector3(this.x,this.y,this.z)}};return i.x=Z(t),i.y=Z(t),i.z=Z(t),i}function ne(t){var i=new function(){this.r=0,this.g=0,this.b=0,this.a=0,this.toTHREE=function(){return new e.Color(this.r,this.g,this.b)}};return i.r=Z(t),i.g=Z(t),i.b=Z(t),i}function me(t){var i=new function(){this.x=0,this.y=0,this.z=0,this.w=0,this.toTHREE=function(){return new e.Quaternion(this.x,this.y,this.z,this.w)}};return i.w=Z(t),i.x=Z(t),i.y=Z(t),i.z=Z(t),i}function ae(e){var t=new O,i=ie(e);return e.ReadBytes(t.data,1,i),t.toString()}function oe(e){var t=new function(){this.mVertexId=0,this.mWeight=0};return t.mVertexId=ie(e),t.mWeight=Z(e),t}function he(t){for(var i=new function(){this.elements=[[],[],[],[]],this.toTHREE=function(){for(var t=new e.Matrix4,i=0;i<4;++i)for(var r=0;r<4;++r)t.elements[4*i+r]=this.elements[r][i];return t}},r=0;r<4;++r)for(var s=0;s<4;++s)i.elements[r][s]=Z(t);return i}function ue(e){var t=new function(){this.mTime=0,this.mValue=null};return t.mTime=ee(e),t.mValue=se(e),t}function fe(e){var t=new function(){this.mTime=0,this.mValue=null};return t.mTime=ee(e),t.mValue=me(e),t}function le(e,t,i){for(var r=0;r<i;r++)t[r]=ue(e)}function ce(e,t,i){return e.Seek(sizeof(t)*i,Me)}function de(e){if(!e)throw"asset failed"}function pe(e,t){return de(re(e)==f),re(e),t.mName=ae(e),t.mNumWeights=ie(e),t.mOffsetMatrix=he(e),Ce?ce(e,t.mWeights,t.mNumWeights):(t.mWeights=[],function(e,t,i){for(var r=0;r<i;r++)t[r]=oe(e)}(e,t.mWeights,t.mNumWeights)),t}function ye(e,t){de(re(e)==o),re(e),t.mPrimitiveTypes=ie(e),t.mNumVertices=ie(e),t.mNumFaces=ie(e),t.mNumBones=ie(e),t.mMaterialIndex=ie(e),t.mNumUVComponents=[];var i=ie(e);i&y&&(Ce?ce(e,t.mVertices,t.mNumVertices):(t.mVertices=[],t.mVertexBuffer=e.subArray32(e.readOffset,e.readOffset+3*t.mNumVertices*4),e.Seek(3*t.mNumVertices*4,Me))),i&g&&(Ce?ce(e,t.mNormals,t.mNumVertices):(t.mNormals=[],t.mNormalBuffer=e.subArray32(e.readOffset,e.readOffset+3*t.mNumVertices*4),e.Seek(3*t.mNumVertices*4,Me))),i&N&&(Ce?(ce(e,t.mTangents,t.mNumVertices),ce(e,t.mBitangents,t.mNumVertices)):(t.mTangents=[],t.mTangentBuffer=e.subArray32(e.readOffset,e.readOffset+3*t.mNumVertices*4),e.Seek(3*t.mNumVertices*4,Me),t.mBitangents=[],t.mBitangentBuffer=e.subArray32(e.readOffset,e.readOffset+3*t.mNumVertices*4),e.Seek(3*t.mNumVertices*4,Me)));for(var r=0;r<A&&i&E(r);++r)Ce?ce(e,t.mColors[r],t.mNumVertices):(t.mColors[r]=[],t.mColorBuffer=e.subArray32(e.readOffset,e.readOffset+4*t.mNumVertices*4),e.Seek(4*t.mNumVertices*4,Me));t.mTexCoordsBuffers=[];for(r=0;r<w&&i&P(r);++r)if(t.mNumUVComponents[r]=ie(e),Ce)ce(e,t.mTextureCoords[r],t.mNumVertices);else{t.mTextureCoords[r]=[],t.mTexCoordsBuffers[r]=[];for(var s=0;s<t.mNumVertices;s++)t.mTexCoordsBuffers[r].push(Z(e)),t.mTexCoordsBuffers[r].push(Z(e)),Z(e)}if(Ce)ie(e);else{t.mFaces=[],t.mIndexArray=[];for(var n=0;n<t.mNumFaces;++n){var m=t.mFaces[n]=new I;m.mNumIndices=te(e),m.mIndices=[];for(var a=0;a<m.mNumIndices;++a)t.mNumVertices<65536?m.mIndices[a]=te(e):m.mIndices[a]=ie(e);if(3===m.mNumIndices)t.mIndexArray.push(m.mIndices[0]),t.mIndexArray.push(m.mIndices[1]),t.mIndexArray.push(m.mIndices[2]);else{if(4!==m.mNumIndices)throw new Error("Sorry, can't currently triangulate polys. Use the triangulate preprocessor in Assimp.");t.mIndexArray.push(m.mIndices[0]),t.mIndexArray.push(m.mIndices[1]),t.mIndexArray.push(m.mIndices[2]),t.mIndexArray.push(m.mIndices[2]),t.mIndexArray.push(m.mIndices[3]),t.mIndexArray.push(m.mIndices[0])}}}if(t.mNumBones){t.mBones=[];for(a=0;a<t.mNumBones;++a)t.mBones[a]=new D,pe(e,t.mBones[a])}}function ge(e,t){de(re(e)==p),re(e),t.mKey=ae(e),t.mSemantic=ie(e),t.mIndex=ie(e),t.mDataLength=ie(e),t.mType=ie(e),t.mData=[],e.ReadBytes(t.mData,1,t.mDataLength)}function Ne(e,t){if(de(re(e)==d),re(e),t.mNumAllocated=t.mNumProperties=ie(e),t.mNumProperties){t.mProperties&&delete t.mProperties,t.mProperties=[];for(var i=0;i<t.mNumProperties;++i)t.mProperties[i]=new $,ge(e,t.mProperties[i])}}function ve(e,t){de(re(e)==h),re(e),t.mNodeName=ae(e),t.mNumPositionKeys=ie(e),t.mNumRotationKeys=ie(e),t.mNumScalingKeys=ie(e),t.mPreState=ie(e),t.mPostState=ie(e),t.mNumPositionKeys&&(Ce?ce(e,t.mPositionKeys,t.mNumPositionKeys):(t.mPositionKeys=[],le(e,t.mPositionKeys,t.mNumPositionKeys))),t.mNumRotationKeys&&(Ce?ce(e,t.mRotationKeys,t.mNumRotationKeys):(t.mRotationKeys=[],function(e,t,i){for(var r=0;r<i;r++)t[r]=fe(e)}(e,t.mRotationKeys,t.mNumRotationKeys))),t.mNumScalingKeys&&(Ce?ce(e,t.mScalingKeys,t.mNumScalingKeys):(t.mScalingKeys=[],le(e,t.mScalingKeys,t.mNumScalingKeys)))}function Te(e,t){if(de(re(e)==l),re(e),t.mName=ae(e),t.mDuration=ee(e),t.mTicksPerSecond=ee(e),t.mNumChannels=ie(e),t.mNumChannels){t.mChannels=[];for(var i=0;i<t.mNumChannels;++i)t.mChannels[i]=new j,ve(e,t.mChannels[i])}}function Ae(e,t){de(re(e)==a),re(e),t.mWidth=ie(e),t.mHeight=ie(e),e.ReadBytes(t.achFormatHint,1,4),Ce||(t.mHeight?(t.pcData=[],e.ReadBytes(t.pcData,1,t.mWidth*t.mHeight*4)):(t.pcData=[],e.ReadBytes(t.pcData,1,t.mWidth)))}function we(e,t){de(re(e)==m),re(e),t.mName=ae(e),t.mType=ie(e),t.mType!=x&&(t.mAttenuationConstant=Z(e),t.mAttenuationLinear=Z(e),t.mAttenuationQuadratic=Z(e)),t.mColorDiffuse=ne(e),t.mColorSpecular=ne(e),t.mColorAmbient=ne(e),t.mType==B&&(t.mAngleInnerCone=Z(e),t.mAngleOuterCone=Z(e))}function xe(e,t){de(re(e)==n),re(e),t.mName=ae(e),t.mPosition=se(e),t.mLookAt=se(e),t.mUp=se(e),t.mHorizontalFOV=Z(e),t.mClipPlaneNear=Z(e),t.mClipPlaneFar=Z(e),t.mAspect=Z(e)}function Be(e,t){if(de(re(e)==u),re(e),t.mFlags=ie(e),t.mNumMeshes=ie(e),t.mNumMaterials=ie(e),t.mNumAnimations=ie(e),t.mNumTextures=ie(e),t.mNumLights=ie(e),t.mNumCameras=ie(e),t.mRootNode=new H,t.mRootNode=function e(t,i,r){de(re(t)==c),re(t);var s=new H;if(s.mParent=i,s.mDepth=r,s.mName=ae(t),s.mTransformation=he(t),s.mNumChildren=ie(t),s.mNumMeshes=ie(t),s.mNumMeshes){s.mMeshes=[];for(var n=0;n<s.mNumMeshes;++n)s.mMeshes[n]=ie(t)}if(s.mNumChildren)for(s.mChildren=[],n=0;n<s.mNumChildren;++n){var m=e(t,s,r++);s.mChildren[n]=m}return s}(e,null,0),t.mNumMeshes){t.mMeshes=[];for(var i=0;i<t.mNumMeshes;++i)t.mMeshes[i]=new V,ye(e,t.mMeshes[i])}if(t.mNumMaterials){t.mMaterials=[];for(i=0;i<t.mNumMaterials;++i)t.mMaterials[i]=new W,Ne(e,t.mMaterials[i])}if(t.mNumAnimations){t.mAnimations=[];for(i=0;i<t.mNumAnimations;++i)t.mAnimations[i]=new _,Te(e,t.mAnimations[i])}if(t.mNumTextures){t.mTextures=[];for(i=0;i<t.mNumTextures;++i)t.mTextures[i]=new G,Ae(e,t.mTextures[i])}if(t.mNumLights){t.mLights=[];for(i=0;i<t.mNumLights;++i)t.mLights[i]=new J,we(e,t.mLights[i])}if(t.mNumCameras){t.mCameras=[];for(i=0;i<t.mNumCameras;++i)t.mCameras[i]=new X,xe(e,t.mCameras[i])}}var Ce,ke,Me=0,Ke=1;return function(e){var t=new function(){this.versionMajor=0,this.versionMinor=0,this.versionRevision=0,this.compileFlags=0,this.mFlags=0,this.mNumMeshes=0,this.mNumMaterials=0,this.mNumAnimations=0,this.mNumTextures=0,this.mNumLights=0,this.mNumCameras=0,this.mRootNode=null,this.mMeshes=[],this.mMaterials=[],this.mAnimations=[],this.mLights=[],this.mCameras=[],this.nodeToBoneMap={},this.findNode=function(e,t){if(t||(t=this.mRootNode),t.mName==e)return t;for(var i=0;i<t.mChildren.length;i++){var r=this.findNode(e,t.mChildren[i]);if(r)return r}return null},this.toTHREE=function(){this.nodeCount=0,function(e){for(var t in e.mMeshes){var i=e.mMeshes[t];for(var r in i.mBones){var s=e.findNode(i.mBones[r].mName);s&&(s.isBone=!0)}}}(this);var e=this.mRootNode.toTHREE(this);for(var t in this.mMeshes)this.mMeshes[t].hookupSkeletons(this);if(this.mAnimations.length>0)var i=this.mAnimations[0].toTHREE(this);return{object:e,animation:i}}},i=new DataView(e);if(function(e){e.readOffset=0,e.Seek=function(t,i){i==Me&&(e.readOffset+=t),i==Ke&&(e.readOffset=t)},e.ReadBytes=function(e,t,i){for(var r,s,n=t*i,m=0;m<n;m++)e[m]=(s=(r=this).getUint8(r.readOffset),r.readOffset+=1,s)},e.subArray32=function(e,t){var i=this.buffer.slice(e,t);return new Float32Array(i)},e.subArrayUint16=function(e,t){var i=this.buffer.slice(e,t);return new Uint16Array(i)},e.subArrayUint8=function(e,t){var i=this.buffer.slice(e,t);return new Uint8Array(i)},e.subArrayUint32=function(e,t){var i=this.buffer.slice(e,t);return new Uint32Array(i)}}(i),i.Seek(44,Me),t.versionMajor=ie(i),t.versionMinor=ie(i),t.versionRevision=ie(i),t.compileFlags=ie(i),Ce=te(i)>0,ke=te(i)>0,Ce)throw"Shortened binaries are not supported!";if(i.Seek(256,Me),i.Seek(128,Me),i.Seek(64,Me),ke){var r=re(i),s=i.FileSize()-i.Tell(),n=[];i.Read(n,1,s);var m=[];uncompress(m,r,n,s),Be(new ArrayBuffer(m),t)}else Be(i,t);return t.toTHREE()}(t)}}),t});
//# sourceMappingURL=../sourcemaps/loaders/AssimpLoader.js.map
