/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.ExplodeModifier=function(){},e.ExplodeModifier.prototype.modify=function(e){for(var o=[],i=0,r=e.faces.length;i<r;i++){var c=o.length,n=e.faces[i],t=n.a,f=n.b,s=n.c,l=e.vertices[t],d=e.vertices[f],p=e.vertices[s];o.push(l.clone()),o.push(d.clone()),o.push(p.clone()),n.a=c,n.b=c+1,n.c=c+2}e.vertices=o},e.ExplodeModifier});
//# sourceMappingURL=../sourcemaps/modifiers/ExplodeModifier.js.map
