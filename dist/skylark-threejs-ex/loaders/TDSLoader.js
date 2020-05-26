/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var s=function(t){e.Loader.call(this,t),this.debug=!1,this.group=null,this.position=0,this.materials=[],this.meshes=[]};s.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:s,load:function(t,s,i,r){var a=this,n=""===a.path?e.LoaderUtils.extractUrlBase(t):a.path,h=new e.FileLoader(this.manager);h.setPath(this.path),h.setResponseType("arraybuffer"),h.load(t,function(e){s(a.parse(e,n))},i,r)},parse:function(t,s){this.group=new e.Group,this.position=0,this.materials=[],this.meshes=[],this.readFile(t,s);for(var i=0;i<this.meshes.length;i++)this.group.add(this.meshes[i]);return this.group},readFile:function(e,t){var s=new DataView(e),h=this.readChunk(s);if(h.id===r||h.id===a||h.id===i)for(var o=this.nextChunk(s,h);0!==o;){if(o===n){var d=this.readDWord(s);this.debugMessage("3DS file version: "+d)}else o===g?(this.resetPosition(s),this.readMeshData(s,t)):this.debugMessage("Unknown main chunk: "+o.toString(16));o=this.nextChunk(s,h)}this.debugMessage("Parsed "+this.meshes.length+" meshes")},readMeshData:function(e,t){for(var s=this.readChunk(e),i=this.nextChunk(e,s);0!==i;){if(i===l){var r=+this.readDWord(e);this.debugMessage("Mesh Version: "+r)}else if(i===f){var a=this.readFloat(e);this.debugMessage("Master scale: "+a),this.group.scale.set(a,a,a)}else i===L?(this.debugMessage("Named Object"),this.resetPosition(e),this.readNamedObject(e)):i===p?(this.debugMessage("Material"),this.resetPosition(e),this.readMaterialEntry(e,t)):this.debugMessage("Unknown MDATA chunk: "+i.toString(16));i=this.nextChunk(e,s)}},readNamedObject:function(e){var t=this.readChunk(e),s=this.readString(e,64);t.cur=this.position;for(var i=this.nextChunk(e,t);0!==i;){if(i===j){this.resetPosition(e);var r=this.readMesh(e);r.name=s,this.meshes.push(r)}else this.debugMessage("Unknown named object chunk: "+i.toString(16));i=this.nextChunk(e,t)}this.endChunk(t)},readMaterialEntry:function(t,s){for(var i=this.readChunk(t),r=this.nextChunk(t,i),a=new e.MeshPhongMaterial;0!==r;){if(r===c)a.name=this.readString(t,64),this.debugMessage("   Name: "+a.name);else if(r===x)this.debugMessage("   Wireframe"),a.wireframe=!0;else if(r===F){var n=this.readByte(t);a.wireframeLinewidth=n,this.debugMessage("   Wireframe Thickness: "+n)}else if(r===C)a.side=e.DoubleSide,this.debugMessage("   DoubleSided");else if(r===y)this.debugMessage("   Additive Blending"),a.blending=e.AdditiveBlending;else if(r===b)this.debugMessage("   Diffuse Color"),a.color=this.readColor(t);else if(r===m)this.debugMessage("   Specular Color"),a.specular=this.readColor(t);else if(r===M)this.debugMessage("   Ambient color"),a.color=this.readColor(t);else if(r===k){var h=this.readWord(t);a.shininess=h,this.debugMessage("   Shininess : "+h)}else if(r===v){var o=this.readWord(t);a.opacity=.01*o,this.debugMessage("  Opacity : "+o),a.transparent=o<100}else r===w?(this.debugMessage("   ColorMap"),this.resetPosition(t),a.map=this.readMap(t,s)):r===W?(this.debugMessage("   BumpMap"),this.resetPosition(t),a.bumpMap=this.readMap(t,s)):r===S?(this.debugMessage("   OpacityMap"),this.resetPosition(t),a.alphaMap=this.readMap(t,s)):r===P?(this.debugMessage("   SpecularMap"),this.resetPosition(t),a.specularMap=this.readMap(t,s)):this.debugMessage("   Unknown material chunk: "+r.toString(16));r=this.nextChunk(t,i)}this.endChunk(i),this.materials[a.name]=a},readMesh:function(t){var s=this.readChunk(t),i=this.nextChunk(t,s),r=new e.BufferGeometry,a=[],n=new e.MeshPhongMaterial,h=new e.Mesh(r,n);for(h.name="mesh";0!==i;){if(i===G){var o=this.readWord(t);this.debugMessage("   Vertex: "+o);for(var d=[],u=0;u<o;u++)d.push(this.readFloat(t)),d.push(this.readFloat(t)),d.push(this.readFloat(t));r.setAttribute("position",new e.Float32BufferAttribute(d,3))}else if(i===T)this.resetPosition(t),this.readFaceArray(t,h);else if(i===I){var g=this.readWord(t);this.debugMessage("   UV: "+g);for(a=[],u=0;u<g;u++)a.push(this.readFloat(t)),a.push(this.readFloat(t));r.setAttribute("uv",new e.Float32BufferAttribute(a,2))}else if(i===R){this.debugMessage("   Tranformation Matrix (TODO)");var l=[];for(u=0;u<12;u++)l[u]=this.readFloat(t);var f=new e.Matrix4;f.elements[0]=l[0],f.elements[1]=l[6],f.elements[2]=l[3],f.elements[3]=l[9],f.elements[4]=l[2],f.elements[5]=l[8],f.elements[6]=l[5],f.elements[7]=l[11],f.elements[8]=l[1],f.elements[9]=l[7],f.elements[10]=l[4],f.elements[11]=l[10],f.elements[12]=0,f.elements[13]=0,f.elements[14]=0,f.elements[15]=1,f.transpose();var p=new e.Matrix4;p.getInverse(f),r.applyMatrix4(p),f.decompose(h.position,h.quaternion,h.scale)}else this.debugMessage("   Unknown mesh chunk: "+i.toString(16));i=this.nextChunk(t,s)}return this.endChunk(s),r.computeVertexNormals(),h},readFaceArray:function(e,t){var s=this.readChunk(e),i=this.readWord(e);this.debugMessage("   Faces: "+i);for(var r=[],a=0;a<i;++a)r.push(this.readWord(e),this.readWord(e),this.readWord(e)),this.readWord(e);for(t.geometry.setIndex(r);this.position<s.end;){if((s=this.readChunk(e)).id===N){this.debugMessage("      Material Group"),this.resetPosition(e);var n=this.readMaterialGroup(e),h=this.materials[n.name];void 0!==h&&(t.material=h,""===h.name&&(h.name=t.name))}else this.debugMessage("      Unknown face array chunk: "+s.toString(16));this.endChunk(s)}this.endChunk(s)},readMap:function(t,s){var i=this.readChunk(t),r=this.nextChunk(t,i),a={},n=new e.TextureLoader(this.manager);for(n.setPath(this.resourcePath||s).setCrossOrigin(this.crossOrigin);0!==r;){if(r===B){var h=this.readString(t,128);a=n.load(h),this.debugMessage("      File: "+s+h)}else r===O?(a.offset.x=this.readFloat(t),this.debugMessage("      OffsetX: "+a.offset.x)):r===A?(a.offset.y=this.readFloat(t),this.debugMessage("      OffsetY: "+a.offset.y)):r===U?(a.repeat.x=this.readFloat(t),this.debugMessage("      RepeatX: "+a.repeat.x)):r===D?(a.repeat.y=this.readFloat(t),this.debugMessage("      RepeatY: "+a.repeat.y)):this.debugMessage("      Unknown map chunk: "+r.toString(16));r=this.nextChunk(t,i)}return this.endChunk(i),a},readMaterialGroup:function(e){this.readChunk(e);var t=this.readString(e,64),s=this.readWord(e);this.debugMessage("         Name: "+t),this.debugMessage("         Faces: "+s);for(var i=[],r=0;r<s;++r)i.push(this.readWord(e));return{name:t,index:i}},readColor:function(t){var s=this.readChunk(t),i=new e.Color;if(s.id===o||s.id===d){var r=this.readByte(t),a=this.readByte(t),n=this.readByte(t);i.setRGB(r/255,a/255,n/255),this.debugMessage("      Color: "+i.r+", "+i.g+", "+i.b)}else if(s.id===h||s.id===u){r=this.readFloat(t),a=this.readFloat(t),n=this.readFloat(t);i.setRGB(r,a,n),this.debugMessage("      Color: "+i.r+", "+i.g+", "+i.b)}else this.debugMessage("      Unknown color chunk: "+s.toString(16));return this.endChunk(s),i},readChunk:function(e){var t={};return t.cur=this.position,t.id=this.readWord(e),t.size=this.readDWord(e),t.end=t.cur+t.size,t.cur+=6,t},endChunk:function(e){this.position=e.end},nextChunk:function(e,t){if(t.cur>=t.end)return 0;this.position=t.cur;try{var s=this.readChunk(e);return t.cur+=s.size,s.id}catch(e){return this.debugMessage("Unable to read chunk at "+this.position),0}},resetPosition:function(){this.position-=6},readByte:function(e){var t=e.getUint8(this.position,!0);return this.position+=1,t},readFloat:function(e){try{var t=e.getFloat32(this.position,!0);return this.position+=4,t}catch(t){this.debugMessage(t+" "+this.position+" "+e.byteLength)}},readInt:function(e){var t=e.getInt32(this.position,!0);return this.position+=4,t},readShort:function(e){var t=e.getInt16(this.position,!0);return this.position+=2,t},readDWord:function(e){var t=e.getUint32(this.position,!0);return this.position+=4,t},readWord:function(e){var t=e.getUint16(this.position,!0);return this.position+=2,t},readString:function(e,t){for(var s="",i=0;i<t;i++){var r=this.readByte(e);if(!r)break;s+=String.fromCharCode(r)}return s},debugMessage:function(e){this.debug&&console.log(e)}});var i=19789,r=15786,a=49725,n=2,h=16,o=17,d=18,u=19,g=15677,l=15678,f=256,p=45055,c=40960,M=40976,b=40992,m=41008,k=41024,v=41040,C=41089,y=41091,x=41093,F=41095,w=41472,S=41488,W=41520,P=41476,B=41728,U=41812,D=41814,O=41816,A=41818,L=16384,j=16640,G=16656,T=16672,N=16688,I=16704,R=16736;return t.loaders.TDSLoader=s});
//# sourceMappingURL=../sourcemaps/loaders/TDSLoader.js.map
