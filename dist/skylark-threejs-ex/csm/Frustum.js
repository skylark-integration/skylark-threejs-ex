/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";const r=new e.Matrix4;class s{constructor(t){t=t||{},this.vertices={near:[new e.Vector3,new e.Vector3,new e.Vector3,new e.Vector3],far:[new e.Vector3,new e.Vector3,new e.Vector3,new e.Vector3]},void 0!==t.projectionMatrix&&this.setFromProjectionMatrix(t.projectionMatrix,t.maxFar||1e4)}setFromProjectionMatrix(e,t){const s=0===e.elements[11];return r.getInverse(e),this.vertices.near[0].set(1,1,-1),this.vertices.near[1].set(1,-1,-1),this.vertices.near[2].set(-1,-1,-1),this.vertices.near[3].set(-1,1,-1),this.vertices.near.forEach(function(e){e.applyMatrix4(r)}),this.vertices.far[0].set(1,1,1),this.vertices.far[1].set(1,-1,1),this.vertices.far[2].set(-1,-1,1),this.vertices.far[3].set(-1,1,1),this.vertices.far.forEach(function(e){e.applyMatrix4(r);const i=Math.abs(e.z);s?e.z*=Math.min(t/i,1):e.multiplyScalar(Math.min(t/i,1))}),this.vertices}split(e,t){for(;e.length>t.length;)t.push(new s);t.length=e.length;for(let r=0;r<e.length;r++){const s=t[r];if(0===r)for(let e=0;e<4;e++)s.vertices.near[e].copy(this.vertices.near[e]);else for(let t=0;t<4;t++)s.vertices.near[t].lerpVectors(this.vertices.near[t],this.vertices.far[t],e[r-1]);if(r===e-1)for(let e=0;e<4;e++)s.vertices.far[e].copy(this.vertices.far[e]);else for(let t=0;t<4;t++)s.vertices.far[t].lerpVectors(this.vertices.near[t],this.vertices.far[t],e[r])}}toSpace(e,t){for(var r=0;r<4;r++)t.vertices.near[r].copy(this.vertices.near[r]).applyMatrix4(e),t.vertices.far[r].copy(this.vertices.far[r]).applyMatrix4(e)}}return t.csm.Frustum=s});
//# sourceMappingURL=../sourcemaps/csm/Frustum.js.map
