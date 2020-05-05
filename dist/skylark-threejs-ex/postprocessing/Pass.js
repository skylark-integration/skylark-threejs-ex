/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";function t(){this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}var n,r,s;return Object.assign(t.prototype,{setSize:function(){},render:function(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}}),t.FullScreenQuad=(n=new e.OrthographicCamera(-1,1,1,-1,0,1),r=new e.PlaneBufferGeometry(2,2),s=function(t){this._mesh=new e.Mesh(r,t)},Object.defineProperty(s.prototype,"material",{get:function(){return this._mesh.material},set:function(e){this._mesh.material=e}}),Object.assign(s.prototype,{dispose:function(){this._mesh.geometry.dispose()},render:function(e){e.render(this._mesh,n)}}),s),t});
//# sourceMappingURL=../sourcemaps/postprocessing/Pass.js.map
