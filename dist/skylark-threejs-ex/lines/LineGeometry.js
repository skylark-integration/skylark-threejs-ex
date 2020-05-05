/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["./LineSegmentsGeometry"],function(t){"use strict";var e=function(){t.call(this),this.type="LineGeometry"};return e.prototype=Object.assign(Object.create(t.prototype),{constructor:e,isLineGeometry:!0,setPositions:function(e){for(var o=e.length-3,r=new Float32Array(2*o),i=0;i<o;i+=3)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5];return t.prototype.setPositions.call(this,r),this},setColors:function(e){for(var o=e.length-3,r=new Float32Array(2*o),i=0;i<o;i+=3)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5];return t.prototype.setColors.call(this,r),this},fromLine:function(t){var e=t.geometry;return e.isGeometry?this.setPositions(e.vertices):e.isBufferGeometry&&this.setPositions(e.position.array),this},copy:function(){return this}}),e});
//# sourceMappingURL=../sourcemaps/lines/LineGeometry.js.map
