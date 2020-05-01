/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){var r;return e.ColorConverter={setHSV:function(r,t,n,o){return t=e.MathUtils.euclideanModulo(t,1),n=e.MathUtils.clamp(n,0,1),o=e.MathUtils.clamp(o,0,1),r.setHSL(t,n*o/((t=(2-n)*o)<1?t:2-t),.5*t)},getHSV:(r={},function(e,t){return void 0===t&&(console.warn("THREE.ColorConverter: .getHSV() target is now required"),t={h:0,s:0,l:0}),e.getHSL(r),r.s*=r.l<.5?r.l:1-r.l,t.h=r.h,t.s=2*r.s/(r.l+r.s),t.v=r.l+r.s,t}),setCMYK:function(e,r,t,n,o){var l=(1-r)*(1-o),s=(1-t)*(1-o),a=(1-n)*(1-o);return e.setRGB(l,s,a)},getCMYK:function(e,r){void 0===r&&(console.warn("THREE.ColorConverter: .getCMYK() target is now required"),r={c:0,m:0,y:0,k:0});var t=e.r,n=e.g,o=e.b,l=1-Math.max(t,n,o),s=(1-t-l)/(1-l),a=(1-n-l)/(1-l),i=(1-o-l)/(1-l);return r.c=s,r.m=a,r.y=i,r.k=l,r}},e.ColorConverter});
//# sourceMappingURL=../sourcemaps/math/ColorConverter.js.map
