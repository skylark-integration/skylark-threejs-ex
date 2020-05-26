/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["../threex","./LineSegmentsGeometry"],function(t,e){"use strict";var o=function(){e.call(this),this.type="LineGeometry"};return o.prototype=Object.assign(Object.create(e.prototype),{constructor:o,isLineGeometry:!0,setPositions:function(t){for(var o=t.length-3,r=new Float32Array(2*o),i=0;i<o;i+=3)r[2*i]=t[i],r[2*i+1]=t[i+1],r[2*i+2]=t[i+2],r[2*i+3]=t[i+3],r[2*i+4]=t[i+4],r[2*i+5]=t[i+5];return e.prototype.setPositions.call(this,r),this},setColors:function(t){for(var o=t.length-3,r=new Float32Array(2*o),i=0;i<o;i+=3)r[2*i]=t[i],r[2*i+1]=t[i+1],r[2*i+2]=t[i+2],r[2*i+3]=t[i+3],r[2*i+4]=t[i+4],r[2*i+5]=t[i+5];return e.prototype.setColors.call(this,r),this},fromLine:function(t){var e=t.geometry;return e.isGeometry?this.setPositions(e.vertices):e.isBufferGeometry&&this.setPositions(e.position.array),this},copy:function(){return this}}),t.lins.LineGeometry=o});
//# sourceMappingURL=../sourcemaps/lines/LineGeometry.js.map
