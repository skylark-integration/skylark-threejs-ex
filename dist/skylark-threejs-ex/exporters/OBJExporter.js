/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,t){"use strict";var r=function(){};return r.prototype={constructor:r,parse:function(t){var r,n,o,i,a,f="",u=0,s=0,c=0,m=new e.Vector3,y=new e.Vector3,p=new e.Vector2,g=[];return t.traverse(function(t){t instanceof e.Mesh&&function(t){var o=0,l=0,x=0,v=t.geometry,d=new e.Matrix3;if(v instanceof e.Geometry&&(v=(new e.BufferGeometry).setFromObject(t)),v instanceof e.BufferGeometry){var w=v.getAttribute("position"),z=v.getAttribute("normal"),B=v.getAttribute("uv"),E=v.getIndex();if(f+="o "+t.name+"\n",t.material&&t.material.name&&(f+="usemtl "+t.material.name+"\n"),void 0!==w)for(r=0,i=w.count;r<i;r++,o++)m.x=w.getX(r),m.y=w.getY(r),m.z=w.getZ(r),m.applyMatrix4(t.matrixWorld),f+="v "+m.x+" "+m.y+" "+m.z+"\n";if(void 0!==B)for(r=0,i=B.count;r<i;r++,x++)p.x=B.getX(r),p.y=B.getY(r),f+="vt "+p.x+" "+p.y+"\n";if(void 0!==z)for(d.getNormalMatrix(t.matrixWorld),r=0,i=z.count;r<i;r++,l++)y.x=z.getX(r),y.y=z.getY(r),y.z=z.getZ(r),y.applyMatrix3(d).normalize(),f+="vn "+y.x+" "+y.y+" "+y.z+"\n";if(null!==E)for(r=0,i=E.count;r<i;r+=3){for(a=0;a<3;a++)n=E.getX(r+a)+1,g[a]=u+n+(z||B?"/"+(B?s+n:"")+(z?"/"+(c+n):""):"");f+="f "+g.join(" ")+"\n"}else for(r=0,i=w.count;r<i;r+=3){for(a=0;a<3;a++)n=r+a+1,g[a]=u+n+(z||B?"/"+(B?s+n:"")+(z?"/"+(c+n):""):"");f+="f "+g.join(" ")+"\n"}}else console.warn("THREE.OBJExporter.parseMesh(): geometry type unsupported",v);u+=o,s+=x,c+=l}(t),t instanceof e.Line&&function(t){var a=0,s=t.geometry,c=t.type;if(s instanceof e.Geometry&&(s=(new e.BufferGeometry).setFromObject(t)),s instanceof e.BufferGeometry){var y=s.getAttribute("position");if(f+="o "+t.name+"\n",void 0!==y)for(r=0,i=y.count;r<i;r++,a++)m.x=y.getX(r),m.y=y.getY(r),m.z=y.getZ(r),m.applyMatrix4(t.matrixWorld),f+="v "+m.x+" "+m.y+" "+m.z+"\n";if("Line"===c){for(f+="l ",n=1,i=y.count;n<=i;n++)f+=u+n+" ";f+="\n"}if("LineSegments"===c)for(o=1+(n=1),i=y.count;n<i;o=(n+=2)+1)f+="l "+(u+n)+" "+(u+o)+"\n"}else console.warn("THREE.OBJExporter.parseLine(): geometry type unsupported",s);u+=a}(t)}),f}},t.exporters.OBJExporter=r});
//# sourceMappingURL=../sourcemaps/exporters/OBJExporter.js.map
