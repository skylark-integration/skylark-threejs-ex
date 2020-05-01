/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){var s,t,n;return e.Pass=function(){this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1},Object.assign(e.Pass.prototype,{setSize:function(){},render:function(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}}),e.Pass.FullScreenQuad=(s=new e.OrthographicCamera(-1,1,1,-1,0,1),t=new e.PlaneBufferGeometry(2,2),n=function(s){this._mesh=new e.Mesh(t,s)},Object.defineProperty(n.prototype,"material",{get:function(){return this._mesh.material},set:function(e){this._mesh.material=e}}),Object.assign(n.prototype,{dispose:function(){this._mesh.geometry.dispose()},render:function(e){e.render(this._mesh,s)}}),n),e.Pass});
//# sourceMappingURL=../sourcemaps/postprocessing/Pass.js.map
