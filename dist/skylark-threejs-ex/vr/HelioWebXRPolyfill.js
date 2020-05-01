/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(n){if(/(Helio)/g.test(navigator.userAgent)&&"xr"in navigator){if(console.log("Helio WebXR Polyfill (Lumin 0.98.0)"),"isSessionSupported"in navigator.xr){const n=navigator.xr.isSessionSupported.bind(navigator.xr);navigator.xr.isSessionSupported=function(){return n("immersive-ar")}}if("isSessionSupported"in navigator.xr&&"requestSession"in navigator.xr){const n=navigator.xr.requestSession.bind(navigator.xr);navigator.xr.requestSession=function(){return new Promise(function(i,r){n("immersive-ar",{optionalFeatures:["local-floor","bounded-floor"]}).then(function(n){i(n)}).catch(function(n){return r(n)})})}}}return n});
//# sourceMappingURL=../sourcemaps/vr/HelioWebXRPolyfill.js.map
