/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,r){"use strict";var t=function(){};return t.prototype.modify=function(e){for(var r=[],t=0,c=e.faces.length;t<c;t++){var i=r.length,s=e.faces[t],n=s.a,o=s.b,f=s.c,a=e.vertices[n],u=e.vertices[o],h=e.vertices[f];r.push(a.clone()),r.push(u.clone()),r.push(h.clone()),s.a=i,s.b=i+1,s.c=i+2}e.vertices=r},r.modifiers.ExplodeModifier=t});
//# sourceMappingURL=../sourcemaps/modifiers/ExplodeModifier.js.map
