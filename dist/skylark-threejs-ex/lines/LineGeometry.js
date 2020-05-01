/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./LineSegmentsGeometry"],function(e){return e.LineGeometry=function(){e.LineSegmentsGeometry.call(this),this.type="LineGeometry"},e.LineGeometry.prototype=Object.assign(Object.create(e.LineSegmentsGeometry.prototype),{constructor:e.LineGeometry,isLineGeometry:!0,setPositions:function(t){for(var o=t.length-3,r=new Float32Array(2*o),n=0;n<o;n+=3)r[2*n]=t[n],r[2*n+1]=t[n+1],r[2*n+2]=t[n+2],r[2*n+3]=t[n+3],r[2*n+4]=t[n+4],r[2*n+5]=t[n+5];return e.LineSegmentsGeometry.prototype.setPositions.call(this,r),this},setColors:function(t){for(var o=t.length-3,r=new Float32Array(2*o),n=0;n<o;n+=3)r[2*n]=t[n],r[2*n+1]=t[n+1],r[2*n+2]=t[n+2],r[2*n+3]=t[n+3],r[2*n+4]=t[n+4],r[2*n+5]=t[n+5];return e.LineSegmentsGeometry.prototype.setColors.call(this,r),this},fromLine:function(e){var t=e.geometry;return t.isGeometry?this.setPositions(t.vertices):t.isBufferGeometry&&this.setPositions(t.position.array),this},copy:function(){return this}}),e.LineGeometry});
//# sourceMappingURL=../sourcemaps/lines/LineGeometry.js.map
