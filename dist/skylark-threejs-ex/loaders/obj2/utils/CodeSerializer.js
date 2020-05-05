/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(function(){"use strict";return{serializeClass:function(e,t,o,n){let i,r,s,a,l,c=t.constructor.name,g=[],p=[],u=[],d=null!==o&&void 0!==o;Array.isArray(n)||(n=[]);for(let t in e.prototype)i=e.prototype[t],(a=new CodeSerializationInstruction(t,c+".prototype."+t)).setCode(i.toString()),"constructor"===t?a.isRemoveCode()||(r=c+" = "+a.getCode()+";\n\n"):"function"==typeof i&&((l=n[t])instanceof CodeSerializationInstruction&&l.getName()===a.getName()&&(a=l),a.isRemoveCode()||(d?g.push(a.getFullName()+" = "+a.getCode()+";\n\n"):g.push("\t"+a.getName()+": "+a.getCode()+",\n\n")));for(let t in e)i=e[t],a=new CodeSerializationInstruction(t,c+"."+t),"function"==typeof i?((l=n[t])instanceof CodeSerializationInstruction&&l.getName()===a.getName()?a=l:a.setCode(i.toString()),a.isRemoveCode()||u.push(a.getFullName()+" = "+a.getCode()+";\n\n")):("string"==typeof i||i instanceof String?a.setCode('"'+i.toString()+'"'):"object"==typeof i?(console.log('Omitting object "'+a.getName()+'" and replace it with empty object.'),a.setCode("{}")):a.setCode(i),a.isRemoveCode()||p.push(a.getFullName()+" = "+a.getCode()+";\n"));let f=r+"\n\n";for(d&&(f+=c+".prototype = Object.create( "+o+".prototype );\n"),f+=c+".prototype.constructor = "+c+";\n",f+="\n\n",s=0;s<p.length;s++)f+=p[s];for(f+="\n\n",s=0;s<u.length;s++)f+=u[s];if(f+="\n\n",d)for(s=0;s<g.length;s++)f+=g[s];else{for(f+=c+".prototype = {\n\n",s=0;s<g.length;s++)f+=g[s];f+="\n};"}return f+="\n\n"}}});
//# sourceMappingURL=../../../sourcemaps/loaders/obj2/utils/CodeSerializer.js.map
