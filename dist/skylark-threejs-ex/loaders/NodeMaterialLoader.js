/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex","../nodes/Nodes"],function(e,s,t){"use strict";var a=function(s,t){this.manager=void 0!==s?s:e.DefaultLoadingManager,this.nodes={},this.materials={},this.passes={},this.names={},this.library=t||{}};return Object.assign(a.prototype,{load:function(s,t,a,i){var n=this,r=new e.FileLoader(n.manager);return r.setPath(n.path),r.load(s,function(e){t(n.parse(JSON.parse(e)))},a,i),this},setPath:function(e){return this.path=e,this},getObjectByName:function(e){return this.names[e]},getObjectById:function(e){return this.library[e]||this.nodes[e]||this.materials[e]||this.passes[e]||this.names[e]},getNode:function(e){var s=this.getObjectById(e);return s||console.warn('Node "'+e+'" not found.'),s},resolve:function(e){switch(typeof e){case"boolean":case"number":return e;case"string":return/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/i.test(e)||this.library[e]?this.getNode(e):e;default:if(Array.isArray(e))for(var s=0;s<e.length;s++)e[s]=this.resolve(e[s]);else for(var t in e)"uuid"!==t&&(e[t]=this.resolve(e[t]))}return e},declare:function(e){var s,a,i;for(s in e.nodes)a=e.nodes[s],i=new t[a.nodeType+"Node"],a.name&&(i.name=a.name,this.names[i.name]=i),this.nodes[s]=i;for(s in e.materials)a=e.materials[s],i=new t[a.type],a.name&&(i.name=a.name,this.names[i.name]=i),this.materials[s]=i;for(s in e.passes)a=e.passes[s],i=new t[a.type],a.name&&(i.name=a.name,this.names[i.name]=i),this.passes[s]=i;return e.material&&(this.material=this.materials[e.material]),e.pass&&(this.pass=this.passes[e.pass]),e},parse:function(e){var s;for(s in(e=this.resolve(this.declare(e))).nodes)this.nodes[s].copy(e.nodes[s]);for(s in e.materials)this.materials[s].copy(e.materials[s]);for(s in e.passes)this.passes[s].copy(e.passes[s]);return this.material||this.pass||this}}),s.loaders.NodeMaterialLoader=a});
//# sourceMappingURL=../sourcemaps/loaders/NodeMaterialLoader.js.map
