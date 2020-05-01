/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","./VolumeSlice"],function(THREE,VolumeSlice){return THREE.Volume=function(t,e,i,n,s){if(arguments.length>0){switch(this.xLength=Number(t)||1,this.yLength=Number(e)||1,this.zLength=Number(i)||1,n){case"Uint8":case"uint8":case"uchar":case"unsigned char":case"uint8_t":this.data=new Uint8Array(s);break;case"Int8":case"int8":case"signed char":case"int8_t":this.data=new Int8Array(s);break;case"Int16":case"int16":case"short":case"short int":case"signed short":case"signed short int":case"int16_t":this.data=new Int16Array(s);break;case"Uint16":case"uint16":case"ushort":case"unsigned short":case"unsigned short int":case"uint16_t":this.data=new Uint16Array(s);break;case"Int32":case"int32":case"int":case"signed int":case"int32_t":this.data=new Int32Array(s);break;case"Uint32":case"uint32":case"uint":case"unsigned int":case"uint32_t":this.data=new Uint32Array(s);break;case"longlong":case"long long":case"long long int":case"signed long long":case"signed long long int":case"int64":case"int64_t":case"ulonglong":case"unsigned long long":case"unsigned long long int":case"uint64":case"uint64_t":throw"Error in THREE.Volume constructor : this type is not supported in JavaScript";case"Float32":case"float32":case"float":this.data=new Float32Array(s);break;case"Float64":case"float64":case"double":this.data=new Float64Array(s);break;default:this.data=new Uint8Array(s)}if(this.data.length!==this.xLength*this.yLength*this.zLength)throw"Error in THREE.Volume constructor, lengths are not matching arrayBuffer size"}this.spacing=[1,1,1],this.offset=[0,0,0],this.matrix=new THREE.Matrix3,this.matrix.identity();var a=-1/0;Object.defineProperty(this,"lowerThreshold",{get:function(){return a},set:function(t){a=t,this.sliceList.forEach(function(t){t.geometryNeedsUpdate=!0})}});var r=1/0;Object.defineProperty(this,"upperThreshold",{get:function(){return r},set:function(t){r=t,this.sliceList.forEach(function(t){t.geometryNeedsUpdate=!0})}}),this.sliceList=[]},THREE.Volume.prototype={constructor:THREE.Volume,getData:function(t,e,i){return this.data[i*this.xLength*this.yLength+e*this.xLength+t]},access:function(t,e,i){return i*this.xLength*this.yLength+e*this.xLength+t},reverseAccess:function(t){var e=Math.floor(t/(this.yLength*this.xLength)),i=Math.floor((t-e*this.yLength*this.xLength)/this.xLength);return[t-e*this.yLength*this.xLength-i*this.xLength,i,e]},map:function(t,e){var i=this.data.length;e=e||this;for(var n=0;n<i;n++)this.data[n]=t.call(e,this.data[n],n,this.data);return this},extractPerpendicularPlane:function(axis,RASIndex){var iLength,jLength,sliceAccess,planeMatrix=(new THREE.Matrix4).identity(),volume=this,planeWidth,planeHeight,firstSpacing,secondSpacing,positionOffset,IJKIndex,axisInIJK=new THREE.Vector3,firstDirection=new THREE.Vector3,secondDirection=new THREE.Vector3,dimensions=new THREE.Vector3(this.xLength,this.yLength,this.zLength);switch(axis){case"x":axisInIJK.set(1,0,0),firstDirection.set(0,0,-1),secondDirection.set(0,-1,0),firstSpacing=this.spacing[2],secondSpacing=this.spacing[1],IJKIndex=new THREE.Vector3(RASIndex,0,0),planeMatrix.multiply((new THREE.Matrix4).makeRotationY(Math.PI/2)),positionOffset=(volume.RASDimensions[0]-1)/2,planeMatrix.setPosition(new THREE.Vector3(RASIndex-positionOffset,0,0));break;case"y":axisInIJK.set(0,1,0),firstDirection.set(1,0,0),secondDirection.set(0,0,1),firstSpacing=this.spacing[0],secondSpacing=this.spacing[2],IJKIndex=new THREE.Vector3(0,RASIndex,0),planeMatrix.multiply((new THREE.Matrix4).makeRotationX(-Math.PI/2)),positionOffset=(volume.RASDimensions[1]-1)/2,planeMatrix.setPosition(new THREE.Vector3(0,RASIndex-positionOffset,0));break;case"z":default:axisInIJK.set(0,0,1),firstDirection.set(1,0,0),secondDirection.set(0,-1,0),firstSpacing=this.spacing[0],secondSpacing=this.spacing[1],IJKIndex=new THREE.Vector3(0,0,RASIndex),positionOffset=(volume.RASDimensions[2]-1)/2,planeMatrix.setPosition(new THREE.Vector3(0,0,RASIndex-positionOffset))}firstDirection.applyMatrix4(volume.inverseMatrix).normalize(),firstDirection.argVar="i",secondDirection.applyMatrix4(volume.inverseMatrix).normalize(),secondDirection.argVar="j",axisInIJK.applyMatrix4(volume.inverseMatrix).normalize(),iLength=Math.floor(Math.abs(firstDirection.dot(dimensions))),jLength=Math.floor(Math.abs(secondDirection.dot(dimensions))),planeWidth=Math.abs(iLength*firstSpacing),planeHeight=Math.abs(jLength*secondSpacing),IJKIndex=Math.abs(Math.round(IJKIndex.applyMatrix4(volume.inverseMatrix).dot(axisInIJK)));var base=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)],iDirection=[firstDirection,secondDirection,axisInIJK].find(function(t){return Math.abs(t.dot(base[0]))>.9}),jDirection=[firstDirection,secondDirection,axisInIJK].find(function(t){return Math.abs(t.dot(base[1]))>.9}),kDirection=[firstDirection,secondDirection,axisInIJK].find(function(t){return Math.abs(t.dot(base[2]))>.9}),argumentsWithInversion=["volume.xLength-1-","volume.yLength-1-","volume.zLength-1-"],argArray=[iDirection,jDirection,kDirection].map(function(t,e){return(t.dot(base[e])>0?"":argumentsWithInversion[e])+(t===axisInIJK?"IJKIndex":t.argVar)}),argString=argArray.join(",");return sliceAccess=eval("(function sliceAccess (i,j) {return volume.access( "+argString+");})"),{iLength:iLength,jLength:jLength,sliceAccess:sliceAccess,matrix:planeMatrix,planeWidth:planeWidth,planeHeight:planeHeight}},extractSlice:function(t,e){var i=new THREE.VolumeSlice(this,e,t);return this.sliceList.push(i),i},repaintAllSlices:function(){return this.sliceList.forEach(function(t){t.repaint()}),this},computeMinMax:function(){var t=1/0,e=-1/0,i=this.data.length,n=0;for(n=0;n<i;n++)if(!isNaN(this.data[n])){var s=this.data[n];t=Math.min(t,s),e=Math.max(e,s)}return this.min=t,this.max=e,[t,e]}},THREE.Volume});
//# sourceMappingURL=../sourcemaps/misc/Volume.js.map
