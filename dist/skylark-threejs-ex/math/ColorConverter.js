/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(t,e){"use strict";var r,n={setHSV:function(e,r,n,o){return r=t.MathUtils.euclideanModulo(r,1),n=t.MathUtils.clamp(n,0,1),o=t.MathUtils.clamp(o,0,1),e.setHSL(r,n*o/((r=(2-n)*o)<1?r:2-r),.5*r)},getHSV:(r={},function(t,e){return void 0===e&&(console.warn("THREE.ColorConverter: .getHSV() target is now required"),e={h:0,s:0,l:0}),t.getHSL(r),r.s*=r.l<.5?r.l:1-r.l,e.h=r.h,e.s=2*r.s/(r.l+r.s),e.v=r.l+r.s,e}),setCMYK:function(t,e,r,n,o){var s=(1-e)*(1-o),l=(1-r)*(1-o),a=(1-n)*(1-o);return t.setRGB(s,l,a)},getCMYK:function(t,e){void 0===e&&(console.warn("THREE.ColorConverter: .getCMYK() target is now required"),e={c:0,m:0,y:0,k:0});var r=t.r,n=t.g,o=t.b,s=1-Math.max(r,n,o),l=(1-r-s)/(1-s),a=(1-n-s)/(1-s),i=(1-o-s)/(1-s);return e.c=l,e.m=a,e.y=i,e.k=s,e}};return e.math.ColorConverter=n});
//# sourceMappingURL=../sourcemaps/math/ColorConverter.js.map
