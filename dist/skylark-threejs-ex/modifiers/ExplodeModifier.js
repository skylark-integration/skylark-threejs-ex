/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";var e=function(){};return e.prototype.modify=function(e){for(var c=[],t=0,n=e.faces.length;t<n;t++){var r=c.length,s=e.faces[t],i=s.a,o=s.b,f=s.c,u=e.vertices[i],a=e.vertices[o],v=e.vertices[f];c.push(u.clone()),c.push(a.clone()),c.push(v.clone()),s.a=r,s.b=r+1,s.c=r+2}e.vertices=c},e});
//# sourceMappingURL=../sourcemaps/modifiers/ExplodeModifier.js.map
