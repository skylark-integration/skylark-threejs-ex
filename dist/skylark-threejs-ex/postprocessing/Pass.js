/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";function n(){this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}var r,s,i;return Object.assign(n.prototype,{setSize:function(){},render:function(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}}),n.FullScreenQuad=(r=new e.OrthographicCamera(-1,1,1,-1,0,1),s=new e.PlaneBufferGeometry(2,2),i=function(t){this._mesh=new e.Mesh(s,t)},Object.defineProperty(i.prototype,"material",{get:function(){return this._mesh.material},set:function(e){this._mesh.material=e}}),Object.assign(i.prototype,{dispose:function(){this._mesh.geometry.dispose()},render:function(e){e.render(this._mesh,r)}}),i),t.postprocessing.Pass=n});
//# sourceMappingURL=../sourcemaps/postprocessing/Pass.js.map
