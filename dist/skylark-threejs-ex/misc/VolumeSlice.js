/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs"],function(e){return e.VolumeSlice=function(t,i,s){var a=this;this.volume=t,i=i||0,Object.defineProperty(this,"index",{get:function(){return i},set:function(e){return i=e,a.geometryNeedsUpdate=!0,i}}),this.axis=s||"z",this.canvas=document.createElement("canvas"),this.canvasBuffer=document.createElement("canvas"),this.updateGeometry();var h=new e.Texture(this.canvas);h.minFilter=e.LinearFilter,h.wrapS=h.wrapT=e.ClampToEdgeWrapping;var r=new e.MeshBasicMaterial({map:h,side:e.DoubleSide,transparent:!0});this.mesh=new e.Mesh(this.geometry,r),this.mesh.matrixAutoUpdate=!1,this.geometryNeedsUpdate=!0,this.repaint()},e.VolumeSlice.prototype={constructor:e.VolumeSlice,repaint:function(){this.geometryNeedsUpdate&&this.updateGeometry();var e=this.iLength,t=this.jLength,i=this.sliceAccess,s=this.volume,a=this.canvasBuffer,h=this.ctxBuffer,r=h.getImageData(0,0,e,t),n=r.data,o=s.data,c=s.upperThreshold,m=s.lowerThreshold,l=s.windowLow,d=s.windowHigh,p=0;if("label"===s.dataType)for(var u=0;u<t;u++)for(var g=0;g<e;g++){var f=o[i(g,u)];f=f>=this.colorMap.length?f%this.colorMap.length+1:f;var v=this.colorMap[f];n[4*p]=v>>24&255,n[4*p+1]=v>>16&255,n[4*p+2]=v>>8&255,n[4*p+3]=255&v,p++}else for(u=0;u<t;u++)for(g=0;g<e;g++){var y=o[i(g,u)],x=255;x=c>=y&&m<=y?x:0,y=(y=Math.floor(255*(y-l)/(d-l)))>255?255:y<0?0:0|y,n[4*p]=y,n[4*p+1]=y,n[4*p+2]=y,n[4*p+3]=x,p++}h.putImageData(r,0,0),this.ctx.drawImage(a,0,0,e,t,0,0,this.canvas.width,this.canvas.height),this.mesh.material.map.needsUpdate=!0},updateGeometry:function(){var t=this.volume.extractPerpendicularPlane(this.axis,this.index);this.sliceAccess=t.sliceAccess,this.jLength=t.jLength,this.iLength=t.iLength,this.matrix=t.matrix,this.canvas.width=t.planeWidth,this.canvas.height=t.planeHeight,this.canvasBuffer.width=this.iLength,this.canvasBuffer.height=this.jLength,this.ctx=this.canvas.getContext("2d"),this.ctxBuffer=this.canvasBuffer.getContext("2d"),this.geometry&&this.geometry.dispose(),this.geometry=new e.PlaneBufferGeometry(t.planeWidth,t.planeHeight),this.mesh&&(this.mesh.geometry=this.geometry,this.mesh.matrix.identity(),this.mesh.applyMatrix4(this.matrix)),this.geometryNeedsUpdate=!1}},e.VolumeSlice});
//# sourceMappingURL=../sourcemaps/misc/VolumeSlice.js.map
