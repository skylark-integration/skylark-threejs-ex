/**
 * skylark-threejs-ex - A version of threejs extentions library that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-threejs-ex/
 * @license MIT
 */
define(["skylark-threejs","../threex"],function(e,n){"use strict";var o=function(n){e.Loader.call(this,n),this.reversed=!1};return o.prototype=Object.assign(Object.create(e.Loader.prototype),{constructor:o,load:function(n,o,t,a){var r=this,i=new e.FileLoader(this.manager);i.setPath(this.path),i.setResponseType("arraybuffer"),i.load(n,function(e){o(r.parse(e))},t,a)},parse:function(e){function n(e){var n,o=[];e.forEach(function(e){"m"===e.type.toLowerCase()?(n=[e],o.push(n)):"z"!==e.type.toLowerCase()&&n.push(e)});var t=[];return o.forEach(function(e){var n={type:"m",x:e[e.length-1].x,y:e[e.length-1].y};t.push(n);for(var o=e.length-1;o>0;o--){var a=e[o];n={type:a.type};void 0!==a.x2&&void 0!==a.y2?(n.x1=a.x2,n.y1=a.y2,n.x2=a.x1,n.y2=a.y1):void 0!==a.x1&&void 0!==a.y1&&(n.x1=a.x1,n.y1=a.y1),n.x=e[o-1].x,n.y=e[o-1].y,t.push(n)}}),t}return"undefined"==typeof opentype?(console.warn("THREE.TTFLoader: The loader requires opentype.js. Make sure it's included before using the loader."),null):function(e,o){for(var t=Math.round,a={},r=1e5/(72*(e.unitsPerEm||2048)),i=e.encoding.cmap.glyphIndexMap,s=Object.keys(i),d=0;d<s.length;d++){var y=s[d],h=e.glyphs.glyphs[i[y]];if(void 0!==y){var p={ha:t(h.advanceWidth*r),x_min:t(h.xMin*r),x_max:t(h.xMax*r),o:""};o&&(h.path.commands=n(h.path.commands)),h.path.commands.forEach(function(e){"c"===e.type.toLowerCase()&&(e.type="b"),p.o+=e.type.toLowerCase()+" ",void 0!==e.x&&void 0!==e.y&&(p.o+=t(e.x*r)+" "+t(e.y*r)+" "),void 0!==e.x1&&void 0!==e.y1&&(p.o+=t(e.x1*r)+" "+t(e.y1*r)+" "),void 0!==e.x2&&void 0!==e.y2&&(p.o+=t(e.x2*r)+" "+t(e.y2*r)+" ")}),a[String.fromCodePoint(h.unicode)]=p}}return{glyphs:a,familyName:e.getEnglishName("fullName"),ascender:t(e.ascender*r),descender:t(e.descender*r),underlinePosition:e.tables.post.underlinePosition,underlineThickness:e.tables.post.underlineThickness,boundingBox:{xMin:e.tables.head.xMin,xMax:e.tables.head.xMax,yMin:e.tables.head.yMin,yMax:e.tables.head.yMax},resolution:1e3,original_font_information:e.tables.name}}(opentype.parse(e),this.reversed)}}),n.loaders.TTFLoader=o});
//# sourceMappingURL=../sourcemaps/loaders/TTFLoader.js.map
