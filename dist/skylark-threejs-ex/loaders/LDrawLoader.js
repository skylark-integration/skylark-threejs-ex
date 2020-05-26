/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var r=function(){var t=new e.Vector3,r=new e.Vector3;function a(e){return/primitive/i.test(e)||"Subpart"===e}function n(e,t){this.line=e,this.lineLength=e.length,this.currentCharIndex=0,this.currentChar=" ",this.lineNumber=t}function i(e,t){return e.colourCode===t.colourCode?0:e.colourCode<t.colourCode?-1:1}function o(t,r,a){t.sort(i);for(var n=[],o=[],s=[],l=new e.BufferGeometry,c=null,u=0,p=0,d=0,h=t.length;d<h;d++){var g=t[d],m=g.v0,v=g.v1;if(n.push(m.x,m.y,m.z,v.x,v.y,v.z),3===r){n.push(g.v2.x,g.v2.y,g.v2.z);var f=g.n0||g.faceNormal,b=g.n1||g.faceNormal,C=g.n2||g.faceNormal;o.push(f.x,f.y,f.z),o.push(b.x,b.y,b.z),o.push(C.x,C.y,C.z)}c!==g.material?(null!==c&&l.addGroup(u,p,s.length-1),s.push(g.material),c=g.material,u=d*r,p=r):p+=r}p>0&&l.addGroup(u,1/0,s.length-1),l.setAttribute("position",new e.Float32BufferAttribute(n,3)),3===r&&l.setAttribute("normal",new e.Float32BufferAttribute(o,3));var S=null;if(2===r?S=new e.LineSegments(l,s):3===r&&(S=new e.Mesh(l,s)),a){S.isConditionalLine=!0;for(var L=new Float32Array(3*t.length*2),_=new Float32Array(3*t.length*2),E=new Float32Array(3*t.length*2),T=0,I=t.length;T<I;T++){var N=t[T],x=N.c0,M=N.c1,w=(m=N.v0,v=N.v1,3*T*2);L[w+0]=x.x,L[w+1]=x.y,L[w+2]=x.z,L[w+3]=x.x,L[w+4]=x.y,L[w+5]=x.z,_[w+0]=M.x,_[w+1]=M.y,_[w+2]=M.z,_[w+3]=M.x,_[w+4]=M.y,_[w+5]=M.z,E[w+0]=v.x-m.x,E[w+1]=v.y-m.y,E[w+2]=v.z-m.z,E[w+3]=v.x-m.x,E[w+4]=v.y-m.y,E[w+5]=v.z-m.z}l.setAttribute("control0",new e.BufferAttribute(L,3,!1)),l.setAttribute("control1",new e.BufferAttribute(_,3,!1)),l.setAttribute("direction",new e.BufferAttribute(E,3,!1))}return S}function s(t){e.Loader.call(this,t),this.parseScopesStack=null,this.materials=[],this.subobjectCache={},this.fileMap=null,this.setMaterials([this.parseColourMetaDirective(new n("Main_Colour CODE 16 VALUE #FF8080 EDGE #333333")),this.parseColourMetaDirective(new n("Edge_Colour CODE 24 VALUE #A0A0A0 EDGE #333333"))]),this.separateObjects=!1,this.smoothNormals=!0}return n.prototype={constructor:n,seekNonSpace:function(){for(;this.currentCharIndex<this.lineLength;){if(this.currentChar=this.line.charAt(this.currentCharIndex)," "!==this.currentChar&&"\t"!==this.currentChar)return;this.currentCharIndex++}},getToken:function(){for(var e=this.currentCharIndex++;this.currentCharIndex<this.lineLength&&(this.currentChar=this.line.charAt(this.currentCharIndex)," "!==this.currentChar&&"\t"!==this.currentChar);)this.currentCharIndex++;var t=this.currentCharIndex;return this.seekNonSpace(),this.line.substring(e,t)},getRemainingString:function(){return this.line.substring(this.currentCharIndex,this.lineLength)},isAtTheEnd:function(){return this.currentCharIndex>=this.lineLength},setToEnd:function(){this.currentCharIndex=this.lineLength},getLineNumberString:function(){return this.lineNumber>=0?" at line "+this.lineNumber:""}},s.FINISH_TYPE_DEFAULT=0,s.FINISH_TYPE_CHROME=1,s.FINISH_TYPE_PEARLESCENT=2,s.FINISH_TYPE_RUBBER=3,s.FINISH_TYPE_MATTE_METALLIC=4,s.FINISH_TYPE_METAL=5,s.FILE_LOCATION_AS_IS=0,s.FILE_LOCATION_TRY_PARTS=1,s.FILE_LOCATION_TRY_P=2,s.FILE_LOCATION_TRY_MODELS=3,s.FILE_LOCATION_TRY_RELATIVE=4,s.FILE_LOCATION_TRY_ABSOLUTE=5,s.FILE_LOCATION_NOT_FOUND=6,s.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:s,load:function(t,r,a,n){this.fileMap||(this.fileMap={});var i=this,o=new e.FileLoader(this.manager);o.setPath(this.path),o.load(t,function(e){i.processObject(e,r,null,t)},a,n)},parse:function(e,t,r){this.processObject(e,r,null,t)},setMaterials:function(e){return this.parseScopesStack=[],this.newParseScopeLevel(e),this.getCurrentParseScope().isFromParse=!1,this.materials=e,this},setFileMap:function(e){return this.fileMap=e,this},newParseScopeLevel:function(t){var r={};if(t)for(var a=0,n=t.length;a<n;a++){var i=t[a];r[i.userData.code]=i}var o=this.getCurrentParseScope(),s={lib:r,url:null,subobjects:null,numSubobjects:0,subobjectIndex:0,inverted:!1,category:null,keywords:null,currentFileName:null,mainColourCode:o?o.mainColourCode:"16",mainEdgeColourCode:o?o.mainEdgeColourCode:"24",currentMatrix:new e.Matrix4,matrix:new e.Matrix4,isFromParse:!0,triangles:null,lineSegments:null,conditionalSegments:null,startingConstructionStep:!1};return this.parseScopesStack.push(s),s},removeScopeLevel:function(){return this.parseScopesStack.pop(),this},addMaterial:function(e){var t=this.getCurrentParseScope().lib;return t[e.userData.code]||this.materials.push(e),t[e.userData.code]=e,this},getMaterial:function(e){if(e.startsWith("0x2")){var t=e.substring(3);return this.parseColourMetaDirective(new n("Direct_Color_"+t+" CODE -1 VALUE #"+t+" EDGE #"+t))}for(var r=this.parseScopesStack.length-1;r>=0;r--){var a=this.parseScopesStack[r].lib[e];if(a)return a}return null},getParentParseScope:function(){return this.parseScopesStack.length>1?this.parseScopesStack[this.parseScopesStack.length-2]:null},getCurrentParseScope:function(){return this.parseScopesStack.length>0?this.parseScopesStack[this.parseScopesStack.length-1]:null},parseColourMetaDirective:function(t){var r=null,a=16711935,i=16711935,o=1,l=!1,c=0,u=s.FINISH_TYPE_DEFAULT,p=!0,d=null,h=t.getToken();if(!h)throw'LDrawLoader: Material name was expected after "!COLOUR tag'+t.getLineNumberString()+".";for(var g=null;g=t.getToken();)switch(g.toUpperCase()){case"CODE":r=t.getToken();break;case"VALUE":if((a=t.getToken()).startsWith("0x"))a="#"+a.substring(2);else if(!a.startsWith("#"))throw"LDrawLoader: Invalid colour while parsing material"+t.getLineNumberString()+".";break;case"EDGE":if((i=t.getToken()).startsWith("0x"))i="#"+i.substring(2);else if(!i.startsWith("#")){if(!(d=this.getMaterial(i)))throw"LDrawLoader: Invalid edge colour while parsing material"+t.getLineNumberString()+".";d=d.userData.edgeMaterial}break;case"ALPHA":if(o=parseInt(t.getToken()),isNaN(o))throw"LDrawLoader: Invalid alpha value in material definition"+t.getLineNumberString()+".";(o=Math.max(0,Math.min(1,o/255)))<1&&(l=!0);break;case"LUMINANCE":if(c=parseInt(t.getToken()),isNaN(c))throw"LDrawLoader: Invalid luminance value in material definition"+n.getLineNumberString()+".";c=Math.max(0,Math.min(1,c/255));break;case"CHROME":u=s.FINISH_TYPE_CHROME;break;case"PEARLESCENT":u=s.FINISH_TYPE_PEARLESCENT;break;case"RUBBER":u=s.FINISH_TYPE_RUBBER;break;case"MATTE_METALLIC":u=s.FINISH_TYPE_MATTE_METALLIC;break;case"METAL":u=s.FINISH_TYPE_METAL;break;case"MATERIAL":t.setToEnd();break;default:throw'LDrawLoader: Unknown token "'+g+'" while parsing material'+t.getLineNumberString()+"."}var m=null;switch(u){case s.FINISH_TYPE_DEFAULT:m=new e.MeshStandardMaterial({color:a,roughness:.3,envMapIntensity:.3,metalness:0});break;case s.FINISH_TYPE_PEARLESCENT:var v=new e.Color(a),f=v.getHSL({h:0,s:0,l:0});f.h=(f.h+.5)%1,f.l=Math.min(1,f.l+.7*(1-f.l)),v.setHSL(f.h,f.s,f.l),m=new e.MeshPhongMaterial({color:a,specular:v,shininess:10,reflectivity:.3});break;case s.FINISH_TYPE_CHROME:m=new e.MeshStandardMaterial({color:a,roughness:0,metalness:1});break;case s.FINISH_TYPE_RUBBER:m=new e.MeshStandardMaterial({color:a,roughness:.9,metalness:0}),p=!1;break;case s.FINISH_TYPE_MATTE_METALLIC:m=new e.MeshStandardMaterial({color:a,roughness:.8,metalness:.4});break;case s.FINISH_TYPE_METAL:m=new e.MeshStandardMaterial({color:a,roughness:.2,metalness:.85})}return m.transparent=l,m.premultipliedAlpha=!0,m.opacity=o,m.depthWrite=!l,m.polygonOffset=!0,m.polygonOffsetFactor=1,m.userData.canHaveEnvMap=p,0!==c&&m.emissive.set(m.color).multiplyScalar(c),d||((d=new e.LineBasicMaterial({color:i,transparent:l,opacity:o,depthWrite:!l})).userData.code=r,d.name=h+" - Edge",d.userData.canHaveEnvMap=!1,d.userData.conditionalEdgeMaterial=new e.ShaderMaterial({vertexShader:"\n\tattribute vec3 control0;\n\tattribute vec3 control1;\n\tattribute vec3 direction;\n\tvarying float discardFlag;\n\n\t#include <common>\n\t#include <color_pars_vertex>\n\t#include <fog_pars_vertex>\n\t#include <logdepthbuf_pars_vertex>\n\t#include <clipping_planes_pars_vertex>\n\tvoid main() {\n\t\t#include <color_vertex>\n\n\t\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\t\tgl_Position = projectionMatrix * mvPosition;\n\n\t\t// Transform the line segment ends and control points into camera clip space\n\t\tvec4 c0 = projectionMatrix * modelViewMatrix * vec4( control0, 1.0 );\n\t\tvec4 c1 = projectionMatrix * modelViewMatrix * vec4( control1, 1.0 );\n\t\tvec4 p0 = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\tvec4 p1 = projectionMatrix * modelViewMatrix * vec4( position + direction, 1.0 );\n\n\t\tc0.xy /= c0.w;\n\t\tc1.xy /= c1.w;\n\t\tp0.xy /= p0.w;\n\t\tp1.xy /= p1.w;\n\n\t\t// Get the direction of the segment and an orthogonal vector\n\t\tvec2 dir = p1.xy - p0.xy;\n\t\tvec2 norm = vec2( -dir.y, dir.x );\n\n\t\t// Get control point directions from the line\n\t\tvec2 c0dir = c0.xy - p1.xy;\n\t\tvec2 c1dir = c1.xy - p1.xy;\n\n\t\t// If the vectors to the controls points are pointed in different directions away\n\t\t// from the line segment then the line should not be drawn.\n\t\tfloat d0 = dot( normalize( norm ), normalize( c0dir ) );\n\t\tfloat d1 = dot( normalize( norm ), normalize( c1dir ) );\n\t\tdiscardFlag = float( sign( d0 ) != sign( d1 ) );\n\n\t\t#include <logdepthbuf_vertex>\n\t\t#include <clipping_planes_vertex>\n\t\t#include <fog_vertex>\n\t}\n\t",fragmentShader:"\n\tuniform vec3 diffuse;\n\tuniform float opacity;\n\tvarying float discardFlag;\n\n\t#include <common>\n\t#include <color_pars_fragment>\n\t#include <fog_pars_fragment>\n\t#include <logdepthbuf_pars_fragment>\n\t#include <clipping_planes_pars_fragment>\n\tvoid main() {\n\n\t\tif ( discardFlag > 0.5 ) discard;\n\n\t\t#include <clipping_planes_fragment>\n\t\tvec3 outgoingLight = vec3( 0.0 );\n\t\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t\t#include <logdepthbuf_fragment>\n\t\t#include <color_fragment>\n\t\toutgoingLight = diffuseColor.rgb; // simple shader\n\t\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t\t#include <tonemapping_fragment>\n\t\t#include <encodings_fragment>\n\t\t#include <fog_fragment>\n\t\t#include <premultiplied_alpha_fragment>\n\t}\n\t",uniforms:{diffuse:{value:new e.Color(i)},opacity:{value:o}},transparent:l,depthWrite:!l}),d.userData.conditionalEdgeMaterial.userData.canHaveEnvMap=!1),m.userData.code=r,m.name=h,m.userData.edgeMaterial=d,m},objectParse:function(i){var o,l,c,u=this.getParentParseScope(),p=u.mainColourCode,d=u.mainEdgeColourCode,h=this.getCurrentParseScope(),g=[],m=null,v=null;-1!==i.indexOf("\r\n")&&(i=i.replace(/\r\n/g,"\n"));var f=i.split("\n"),b=f.length,C=0,S=!1,L=null,_=null,E=!1,T=!0,I=!1,N=!0,x="",M=!1,w=this;function k(e,t){var r=e.getToken();t||"16"!==r||(r=p),t&&"24"===r&&(r=d);var a=w.getMaterial(r);if(!a)throw'LDrawLoader: Unknown colour code "'+r+'" is used'+e.getLineNumberString()+" but it was not defined previously.";return a}function F(t){var r=new e.Vector3(parseFloat(t.getToken()),parseFloat(t.getToken()),parseFloat(t.getToken()));return w.separateObjects||r.applyMatrix4(h.currentMatrix),r}for(C=0;C<b;C++){var O=f[C];if(0!==O.length)if(S)O.startsWith("0 FILE ")?(this.subobjectCache[L.toLowerCase()]=_,L=O.substring(7),_=""):_+=O+"\n";else{var A=new n(O,C+1);if(A.seekNonSpace(),!A.isAtTheEnd()){var y=A.getToken();switch(y){case"0":var D=A.getToken();if(D)switch(D){case"!LDRAW_ORG":x=A.getToken(),h.triangles=[],h.lineSegments=[],h.conditionalSegments=[],h.type=x,(!u.isFromParse||w.separateObjects&&!a(x))&&(h.groupObject=new e.Group,h.groupObject.userData.startingConstructionStep=h.startingConstructionStep),(J=h.matrix).determinant()<0&&(w.separateObjects&&a(x)||!w.separateObjects)&&(h.inverted=!h.inverted),o=h.triangles,l=h.lineSegments,c=h.conditionalSegments;break;case"!COLOUR":(R=this.parseColourMetaDirective(A))?this.addMaterial(R):console.warn("LDrawLoader: Error parsing material"+A.getLineNumberString());break;case"!CATEGORY":m=A.getToken();break;case"!KEYWORDS":var P=A.getRemainingString().split(",");P.length>0&&(v||(v=[]),P.forEach(function(e){v.push(e.trim())}));break;case"FILE":C>0&&(S=!0,L=A.getRemainingString(),_="",E=!1,T=!0);break;case"BFC":for(;!A.isAtTheEnd();){var j=A.getToken();switch(j){case"CERTIFY":case"NOCERTIFY":E="CERTIFY"===j,T=!0;break;case"CW":case"CCW":T="CCW"===j;break;case"INVERTNEXT":I=!0;break;case"CLIP":case"NOCLIP":N="CLIP"===j;break;default:console.warn('THREE.LDrawLoader: BFC directive "'+j+'" is unknown.')}}break;case"STEP":M=!0}break;case"1":var R=k(A),Y=parseFloat(A.getToken()),H=parseFloat(A.getToken()),V=parseFloat(A.getToken()),U=parseFloat(A.getToken()),z=parseFloat(A.getToken()),B=parseFloat(A.getToken()),$=parseFloat(A.getToken()),W=parseFloat(A.getToken()),G=parseFloat(A.getToken()),q=parseFloat(A.getToken()),K=parseFloat(A.getToken()),X=parseFloat(A.getToken()),J=(new e.Matrix4).set(U,z,B,Y,$,W,G,H,q,K,X,V,0,0,0,1),Q=A.getRemainingString().trim().replace(/\\/g,"/");w.fileMap[Q]?Q=w.fileMap[Q]:Q.startsWith("s/")?Q="parts/"+Q:Q.startsWith("48/")&&(Q="p/"+Q),g.push({material:R,matrix:J,fileName:Q,originalFileName:Q,locationState:s.FILE_LOCATION_AS_IS,url:null,triedLowerCase:!1,inverted:I!==h.inverted,startingConstructionStep:M}),I=!1;break;case"2":var Z={material:(R=k(A,!0)).userData.edgeMaterial,colourCode:R.userData.code,v0:F(A),v1:F(A)};l.push(Z);break;case"5":Z={material:(R=k(A,!0)).userData.edgeMaterial.userData.conditionalEdgeMaterial,colourCode:R.userData.code,v0:F(A),v1:F(A),c0:F(A),c1:F(A)};c.push(Z);break;case"3":R=k(A);var ee=T!==h.inverted,te=!E||!N;!0===ee?(re=F(A),ae=F(A),ne=F(A)):(ne=F(A),ae=F(A),re=F(A)),t.subVectors(ae,re),r.subVectors(ne,ae),oe=(new e.Vector3).crossVectors(t,r).normalize(),o.push({material:R,colourCode:R.userData.code,v0:re,v1:ae,v2:ne,faceNormal:oe,n0:null,n1:null,n2:null}),!0===te&&o.push({material:R,colourCode:R.userData.code,v0:re,v1:ne,v2:ae,faceNormal:oe,n0:null,n1:null,n2:null});break;case"4":var re,ae,ne,ie,oe;R=k(A),ee=T!==h.inverted,te=!E||!N;!0===ee?(re=F(A),ae=F(A),ne=F(A),ie=F(A)):(ie=F(A),ne=F(A),ae=F(A),re=F(A)),t.subVectors(ae,re),r.subVectors(ne,ae),oe=(new e.Vector3).crossVectors(t,r).normalize(),o.push({material:R,colourCode:R.userData.code,v0:re,v1:ae,v2:ne,faceNormal:oe,n0:null,n1:null,n2:null}),o.push({material:R,colourCode:R.userData.code,v0:re,v1:ne,v2:ie,faceNormal:oe,n0:null,n1:null,n2:null}),!0===te&&(o.push({material:R,colourCode:R.userData.code,v0:re,v1:ne,v2:ae,faceNormal:oe,n0:null,n1:null,n2:null}),o.push({material:R,colourCode:R.userData.code,v0:re,v1:ie,v2:ne,faceNormal:oe,n0:null,n1:null,n2:null}));break;default:throw'LDrawLoader: Unknown line type "'+y+'"'+A.getLineNumberString()+"."}}}}S&&(this.subobjectCache[L.toLowerCase()]=_),h.category=m,h.keywords=v,h.subobjects=g,h.numSubobjects=g.length,h.subobjectIndex=0},computeConstructionSteps:function(e){var t=0;e.traverse(e=>{e.isGroup&&(e.userData.startingConstructionStep&&t++,e.userData.constructionStep=t)}),e.userData.numConstructionSteps=t+1},processObject:function(n,i,l,c){var u=this,p=u.newParseScopeLevel();p.url=c;var d=u.getParentParseScope();l&&(p.currentMatrix.multiplyMatrices(d.currentMatrix,l.matrix),p.matrix.copy(l.matrix),p.inverted=l.inverted,p.startingConstructionStep=l.startingConstructionStep);var h=d.currentFileName;null!==h&&(h=d.currentFileName.toLowerCase()),void 0===u.subobjectCache[h]&&(u.subobjectCache[h]=n),u.objectParse(n);var g=0;function m(){if(++g===p.subobjects.length+1)!function(){u.smoothNormals&&"Part"===p.type&&function(e,t){function r(e){return`${~~(100*e.x)},${~~(100*e.y)},${~~(100*e.z)}`}function a(e,t){return`${r(e)}_${r(t)}`}for(var n=new Set,i={},o={},s=[],l=0,c=t.length;l<c;l++){var u=t[l],p=u.v0,d=u.v1;n.add(a(p,d)),n.add(a(d,p))}for(l=0,c=e.length;l<c;l++)for(var h=e[l],g=0,m=3;g<m;g++){var v=(g+1)%3,f=a(p=h[`v${L=g}`],d=h[`v${v}`]);n.has(f)||(i[f]=h,o[f]=h)}for(;;){var b=Object.keys(i);if(0===b.length)break;l=0;for(var C=[o[b[0]]];l<C.length;){h=C[l],l++;var S=h.faceNormal;for(null===h.n0&&(h.n0=S.clone(),s.push(h.n0)),null===h.n1&&(h.n1=S.clone(),s.push(h.n1)),null===h.n2&&(h.n2=S.clone(),s.push(h.n2)),g=0,m=3;g<m;g++){var L;v=(g+1)%3,delete i[f=a(p=h[`v${L=g}`],d=h[`v${v}`])];var _=a(d,p),E=o[_];if(E){if(Math.abs(E.faceNormal.dot(h.faceNormal))<.25)continue;_ in i&&(C.push(E),delete i[_]);for(var T=0;T<3;T++){var I=T,N=(T+1)%3;if(a(E[`v${I}`],E[`v${N}`])===_){if(null===E[`n${I}`]){var x=h[`n${v}`];E[`n${I}`]=x,x.add(E.faceNormal)}null===E[`n${N}`]&&(x=h[`n${L}`],E[`n${N}`]=x,x.add(E.faceNormal));break}}}}}}for(l=0,c=s.length;l<c;l++)s[l].normalize()}(p.triangles,p.lineSegments);var e=!d.isFromParse;if(u.separateObjects&&!a(p.type)||e){const e=p.groupObject;p.triangles.length>0&&e.add(o(p.triangles,3)),p.lineSegments.length>0&&e.add(o(p.lineSegments,2)),p.conditionalSegments.length>0&&e.add(o(p.conditionalSegments,2,!0)),d.groupObject&&(e.name=p.fileName,e.userData.category=p.category,e.userData.keywords=p.keywords,p.matrix.decompose(e.position,e.quaternion,e.scale),d.groupObject.add(e))}else{for(var n=u.separateObjects,s=d.lineSegments,l=d.conditionalSegments,c=d.triangles,h=p.lineSegments,g=p.conditionalSegments,m=p.triangles,v=0,f=h.length;v<f;v++){var b=h[v];n&&(b.v0.applyMatrix4(p.matrix),b.v1.applyMatrix4(p.matrix)),s.push(b)}for(var v=0,f=g.length;v<f;v++){var C=g[v];n&&(C.v0.applyMatrix4(p.matrix),C.v1.applyMatrix4(p.matrix),C.c0.applyMatrix4(p.matrix),C.c1.applyMatrix4(p.matrix)),l.push(C)}for(var v=0,f=m.length;v<f;v++){var S=m[v];n&&(S.v0=S.v0.clone().applyMatrix4(p.matrix),S.v1=S.v1.clone().applyMatrix4(p.matrix),S.v2=S.v2.clone().applyMatrix4(p.matrix),t.subVectors(S.v1,S.v0),r.subVectors(S.v2,S.v1),S.faceNormal.crossVectors(t,r).normalize()),c.push(S)}}u.removeScopeLevel(),d.isFromParse||u.computeConstructionSteps(p.groupObject);i&&i(p.groupObject)}();else{var e=p.subobjects[p.subobjectIndex];Promise.resolve().then(function(){v(e)}),p.subobjectIndex++}}function v(t){p.mainColourCode=t.material.userData.code,p.mainEdgeColourCode=t.material.userData.edgeMaterial.userData.code,p.currentFileName=t.originalFileName;var r=u.subobjectCache[t.originalFileName.toLowerCase()];if(r)u.processObject(r,function(e){f(e,t),m()},t,c);else{var a=t.fileName,n=s.FILE_LOCATION_NOT_FOUND;switch(t.locationState){case s.FILE_LOCATION_AS_IS:n=t.locationState+1;break;case s.FILE_LOCATION_TRY_PARTS:a="parts/"+a,n=t.locationState+1;break;case s.FILE_LOCATION_TRY_P:a="p/"+a,n=t.locationState+1;break;case s.FILE_LOCATION_TRY_MODELS:a="models/"+a,n=t.locationState+1;break;case s.FILE_LOCATION_TRY_RELATIVE:a=c.substring(0,c.lastIndexOf("/")+1)+a,n=t.locationState+1;break;case s.FILE_LOCATION_TRY_ABSOLUTE:t.triedLowerCase?n=s.FILE_LOCATION_NOT_FOUND:(t.fileName=t.fileName.toLowerCase(),a=t.fileName,t.triedLowerCase=!0,n=s.FILE_LOCATION_AS_IS);break;case s.FILE_LOCATION_NOT_FOUND:return void console.warn('LDrawLoader: Subobject "'+t.originalFileName+'" could not be found.')}t.locationState=n,t.url=a;var i=new e.FileLoader(u.manager);i.setPath(u.path),i.load(a,function(e){u.processObject(e,function(e){f(e,t),m()},t,c)},void 0,function(e){!function(e,t){v(t)}(0,t)},t)}}function f(e,t){null!==e?u.fileMap[t.originalFileName]=t.url:v(t)}m()}}),s}();return t.loaders.LDrawLoader=r});
//# sourceMappingURL=../sourcemaps/loaders/LDrawLoader.js.map
