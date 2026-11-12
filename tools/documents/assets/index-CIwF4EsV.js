var dy=Object.defineProperty;var py=(e,t,r)=>t in e?dy(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var ve=(e,t,r)=>py(e,typeof t!="symbol"?t+"":t,r);import{_ as go}from"./index-BdhpjHKc.js";import"./pdflib-Dm5V93QD.js";import"./pdfjs-CcZYcL52.js";let Wa={verbose:!1,debug:!1,debugFolder:"out"},ap={mean:[.485,.456,.406],stdDeviation:[.229,.224,.225],maxSideLength:640,minimumAreaThreshold:50,paddingVertical:.4,paddingHorizontal:.6},np={imageHeight:48,strategy:"per-line",crossLineWidthFactor:1,charactersDictionary:[]},cy={executionProviders:["cpu"],graphOptimizationLevel:"all",enableCpuMemArena:!0,enableMemPattern:!0,executionMode:"sequential",interOpNumThreads:0,intraOpNumThreads:0},hy="opencv",fy={engine:hy},Si={model:{},detection:ap,recognition:np,debugging:Wa,session:cy,processing:fy};function $a(e,...t){if(!t.length)return e;let r=t.shift();if(Ar(e)&&Ar(r)){for(let i in r)if(Object.prototype.hasOwnProperty.call(r,i)){if(i==="__proto__"||i==="constructor"||i==="prototype")continue;let a=r[i],n=e[i];Ar(a)?((!n||!Ar(n))&&(e[i]={}),$a(e[i],a)):a!==void 0&&(e[i]=a)}}return $a(e,...t)}async function my(e,t={}){const{timeoutMs:r=3e4,retries:i=2}=t;let a;for(let n=0;n<=i;n++)try{let s=await fetch(e,{signal:AbortSignal.timeout(r)});if(!s.ok)throw new Error(`HTTP ${s.status} ${s.statusText}`);return await s.arrayBuffer()}catch(s){a=s,n<i&&await new Promise(o=>setTimeout(o,500*(n+1)))}throw new Error(`Failed to fetch ${e} after ${i+1} attempt(s): ${String(a)}`)}function va(e){return(typeof e=="string"?e:new TextDecoder("utf-8").decode(e)).split(/\r?\n/)}function Ar(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)&&!(e instanceof Date)&&!(e instanceof RegExp)&&!(e instanceof ArrayBuffer)&&!ArrayBuffer.isView(e)}function yo(e){return e.reason instanceof Error?e.reason:new DOMException("The batch operation was aborted.","AbortError")}function gy(e){if(Symbol.asyncIterator in e)return e[Symbol.asyncIterator]();let t=e[Symbol.iterator]();return{next:()=>Promise.resolve(t.next()),return:r=>{var i;return Promise.resolve(((i=t.return)==null?void 0:i.call(t,r))??{done:!0,value:void 0})}}}async function _o(e,t,r,i){var $;const{settle:a,signal:n}=t;let s=Math.max(1,Math.floor(t.concurrency));if(n!=null&&n.aborted)throw yo(n);let o=0,l=0,d=!1,h=!1,c,m=Array.isArray(e)?e:null,_=m?null:gy(e),y=Promise.resolve(),b=async()=>{let I=y,T;y=new Promise(E=>{T=E}),await I;try{return await _.next()}finally{T()}},S=()=>{d=!0};n==null||n.addEventListener("abort",S,{once:!0});let v=async()=>{var I;for(;!d;){let T,E;if(m){if(o>=m.length)return;E=o++,T=m[E]}else{let C=await b();if(C.done||d)return;E=o++,T=C.value}try{let C=await r(T,E);if(d)return;i({index:E,status:"fulfilled",value:C})}catch(C){if(a)i({index:E,status:"rejected",reason:C});else{d=!0,h=!0,c=C;return}}finally{l++,(I=t.onProgress)==null||I.call(t,l,t.total)}}};try{await Promise.all(Array.from({length:s},()=>v()))}finally{n==null||n.removeEventListener("abort",S),await(($=_==null?void 0:_.return)==null?void 0:$.call(_))}if(n!=null&&n.aborted)throw yo(n);if(h)throw c}function yy(){let e=[],t=null,r=!1,i=null,a=()=>{let n=t;t=null,n==null||n()};return{push(n){e.push(n),a()},close(){r=!0,a()},fail(n){i={error:n},r=!0,a()},async*drain(){for(;;){for(;e.length>0;)yield e.shift();if(i)throw i.error;if(r)return;await new Promise(n=>{t=n})}}}}class sp{constructor(t=10){ve(this,"cache",new Map);ve(this,"maxSize");this.maxSize=t}get(t){let r=this.cache.get(t);if(r!==void 0)return this.cache.delete(t),this.cache.set(t,r),r}set(t,r){if(this.cache.has(t))this.cache.delete(t);else if(this.cache.size>=this.maxSize){let i=this.cache.keys().next().value;i!==void 0&&this.cache.delete(i)}this.cache.set(t,r)}clear(){this.cache.clear()}static generateKey(t){let r=new Uint8Array(t),i=Math.min(r.length,1024),a=0;for(let n=0;n<i;n++)a=(a<<5)-a+r[n],a=a&a;return`${a}_${r.length}`}}let bo=new sp;class _y{constructor(t,r){ve(this,"options",Si);ve(this,"detectionSession",null);ve(this,"recognitionSession",null);ve(this,"detector",null);ve(this,"recognitor",null);ve(this,"platform");this.platform=t,this.options=$a({},Si,r),this.options.session=this.options.session||Si.session}log(t){var r;(r=this.options.debugging)!=null&&r.verbose&&console.log(`[PaddleOcrService:Base] ${t}`)}async recognize(t,r){var i,a;(!this.detector||!this.recognitor)&&await this.initSessions();try{let n;if(typeof t=="string"){if(!t.startsWith("http")&&!t.startsWith("/"))throw new Error("Invalid image string format. Must be an HTTP URL, an absolute path, ArrayBuffer, or Canvas");n=await this.platform.loadResource(t,t)}else if(t instanceof ArrayBuffer)n=t;else if(typeof t.toBuffer=="function"){let b=t.toBuffer("image/png");n=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}else{let y=t,v=y.getContext("2d",{willReadFrequently:!0}).getImageData(0,0,y.width,y.height).data;n=v.buffer.slice(v.byteOffset,v.byteOffset+v.byteLength)}let s=sp.generateKey(n);if(!(r!=null&&r.noCache)&&!(r!=null&&r.dictionary)){let y=bo.get(s);if(y)return this.log("Using cached OCR result"),r!=null&&r.flatten?{text:y.text,results:y.lines?y.lines.flat():y.results??[],confidence:y.confidence}:y}let o=[],l=typeof t=="string"||t instanceof ArrayBuffer?await this.platform.canvas.prepareCanvas(n):t;if(o=await this.detector.run(l),o.length===0)return r!=null&&r.flatten?{text:"",results:[],confidence:0}:{text:"",lines:[],confidence:0};let d=(i=this.options.recognition)==null?void 0:i.charactersDictionary;if(r!=null&&r.dictionary){let y="";if(typeof r.dictionary=="string"){let b=await this.platform.loadResource(r.dictionary,r.dictionary);y=new TextDecoder("utf-8").decode(b)}else y=new TextDecoder("utf-8").decode(r.dictionary);d=va(y)}let h=(r==null?void 0:r.strategy)??((a=this.options.recognition)==null?void 0:a.strategy)??"per-line",c=await this.recognitor.run(l,o,d,h),m=this.groupResultsByLine(c),_=r!=null&&r.flatten?this.flattenResults(c):m;return!(r!=null&&r.noCache)&&!(r!=null&&r.dictionary)&&bo.set(s,_),_}catch(n){let s=n instanceof Error?n:new Error(String(n));throw console.error("recognize: error",s.message,s.stack),n}}async batchRecognize(t,r){let i=(r==null?void 0:r.settle)??!1,a=[];return await _o(t,{concurrency:this.resolveConcurrency(r==null?void 0:r.concurrency),settle:i,signal:r==null?void 0:r.signal,onProgress:r==null?void 0:r.onProgress,total:Array.isArray(t)?t.length:void 0},n=>this.recognize(n,r),n=>{a[n.index]=n}),i?a:a.map(n=>n.status==="fulfilled"?n.value:void 0)}async*batchRecognizeStream(t,r){let i=yy(),a=(async()=>{try{await _o(t,{concurrency:this.resolveConcurrency(r==null?void 0:r.concurrency),settle:(r==null?void 0:r.settle)??!1,signal:r==null?void 0:r.signal,onProgress:r==null?void 0:r.onProgress,total:Array.isArray(t)?t.length:void 0},n=>this.recognize(n,r),n=>i.push(n)),i.close()}catch(n){i.fail(n)}})();yield*i.drain(),await a}resolveConcurrency(t){var a;return typeof t=="number"&&t>0?Math.floor(t):(((a=this.options.session)==null?void 0:a.executionProviders)??[]).some(n=>{let s=(typeof n=="string"?n:n.name).toLowerCase();return s!=="cpu"&&s!=="wasm"})?1:4}flattenResults(t){if(t.length===0)return{text:"",results:[],confidence:0};let r=t.map(a=>a.text).join(" "),i=t.reduce((a,n)=>a+n.confidence,0)/t.length;return{text:r,results:t,confidence:i}}groupResultsByLine(t){if(t.length===0)return{text:"",lines:[],confidence:0};let r=[],i=[],a=t[0];if(!a)return{text:"",lines:[],confidence:0};let n=a.box.y,s=a.box.height;for(let h of t){const{box:c}=h;Math.abs(c.y-n)<s/2?(i.push(h),s=(s*(i.length-1)+c.height)/i.length):(i.sort((m,_)=>m.box.x-_.box.x),r.push(i),i=[h],n=c.y,s=c.height)}i.length>0&&(i.sort((h,c)=>h.box.x-c.box.x),r.push(i));let o=r.map(h=>h.map(c=>c.text).join(" ")).join(`
`),l=r.reduce((h,c)=>h+c.reduce((m,_)=>m+_.confidence,0),0),d=r.reduce((h,c)=>h+c.length,0);return{text:o,lines:r,confidence:d>0?l/d:0}}}let wo="https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main",by="https://raw.githubusercontent.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main",Vt={detection:`${wo}/detection/PP-OCRv5_mobile_det_infer.ort`,recognition:`${wo}/recognition/multi/en/v5/en_PP-OCRv5_mobile_rec_infer.ort`,charactersDictionary:`${by}/recognition/multi/en/v5/ppocrv5_en_dict.txt`};/*!
 * ONNX Runtime Web v1.26.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var Va=Object.defineProperty,wy=Object.getOwnPropertyDescriptor,$y=Object.getOwnPropertyNames,vy=Object.prototype.hasOwnProperty,xy=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),P=(e,t)=>()=>(e&&(t=e(e=0)),t),Kt=(e,t)=>{for(var r in t)Va(e,r,{get:t[r],enumerable:!0})},Sy=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of $y(t))!vy.call(e,a)&&a!==r&&Va(e,a,{get:()=>t[a],enumerable:!(i=wy(t,a))||i.enumerable});return e},mr=e=>Sy(Va({},"__esModule",{value:!0}),e),er,gt,Mt,$o,op,up=P(()=>{er=new Map,gt=[],Mt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=er.get(e);if(i===void 0)er.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=gt.indexOf(e);a!==-1&&gt.splice(a,1);for(let n=0;n<gt.length;n++)if(er.get(gt[n]).priority<=r){gt.splice(n,0,e);return}gt.push(e)}return}throw new TypeError("not a valid backend")},$o=async e=>{let t=er.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},op=async e=>{let t=e.executionProviders||[],r=t.map(l=>typeof l=="string"?l:l.name),i=r.length===0?gt:r,a,n=[],s=new Set;for(let l of i){let d=await $o(l);typeof d=="string"?n.push({name:l,err:d}):(a||(a=d),a===d&&s.add(l))}if(!a)throw new Error(`no available backend found. ERR: ${n.map(l=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:d}of n)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${d}`);let o=t.filter(l=>s.has(typeof l=="string"?l:l.name));return[a,new Proxy(e,{get:(l,d)=>d==="executionProviders"?o:Reflect.get(l,d)})]}}),Ty=P(()=>{up()}),lp,Iy=P(()=>{lp="1.26.0"}),Ti,Ee,dp=P(()=>{Iy(),Ti="warning",Ee={wasm:{},webgl:{},webgpu:{},versions:{common:lp},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);Ti=e}},get logLevel(){return Ti}},Object.defineProperty(Ee,"logLevel",{enumerable:!0})}),_e,ky=P(()=>{dp(),_e=Ee}),pp,cp,Ey=P(()=>{pp=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,n;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[3]):(a=e.dims[3],n=e.dims[2]);let s=(t==null?void 0:t.format)!==void 0?t.format:"RGB",o=t==null?void 0:t.norm,l,d;o===void 0||o.mean===void 0?l=[255,255,255,255]:typeof o.mean=="number"?l=[o.mean,o.mean,o.mean,o.mean]:(l=[o.mean[0],o.mean[1],o.mean[2],0],o.mean[3]!==void 0&&(l[3]=o.mean[3])),o===void 0||o.bias===void 0?d=[0,0,0,0]:typeof o.bias=="number"?d=[o.bias,o.bias,o.bias,o.bias]:(d=[o.bias[0],o.bias[1],o.bias[2],0],o.bias[3]!==void 0&&(d[3]=o.bias[3]));let h=n*a,c=0,m=h,_=h*2,y=-1;s==="RGBA"?(c=0,m=h,_=h*2,y=h*3):s==="RGB"?(c=0,m=h,_=h*2):s==="RBG"&&(c=0,_=h,m=h*2);for(let b=0;b<n;b++)for(let S=0;S<a;S++){let v=(e.data[c++]-d[0])*l[0],$=(e.data[m++]-d[1])*l[1],I=(e.data[_++]-d[2])*l[2],T=y===-1?255:(e.data[y++]-d[3])*l[3];i.fillStyle="rgba("+v+","+$+","+I+","+T+")",i.fillRect(S,b,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},cp=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,n,s;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[1],s=e.dims[3]):(a=e.dims[3],n=e.dims[2],s=e.dims[1]);let o=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t==null?void 0:t.norm,d,h;l===void 0||l.mean===void 0?d=[255,255,255,255]:typeof l.mean=="number"?d=[l.mean,l.mean,l.mean,l.mean]:(d=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(d[3]=l.mean[3])),l===void 0||l.bias===void 0?h=[0,0,0,0]:typeof l.bias=="number"?h=[l.bias,l.bias,l.bias,l.bias]:(h=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(h[3]=l.bias[3]));let c=n*a;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let m=4,_=0,y=1,b=2,S=3,v=0,$=c,I=c*2,T=-1;o==="RGBA"?(v=0,$=c,I=c*2,T=c*3):o==="RGB"?(v=0,$=c,I=c*2):o==="RBG"&&(v=0,I=c,$=c*2),i=r.createImageData(a,n);for(let E=0;E<n*a;_+=m,y+=m,b+=m,S+=m,E++)i.data[_]=(e.data[v++]-h[0])*d[0],i.data[y]=(e.data[$++]-h[1])*d[1],i.data[b]=(e.data[I++]-h[2])*d[2],i.data[S]=T===-1?255:(e.data[T++]-h[3])*d[3]}else throw new Error("Can not access image data");return i}}),Or,hp,fp,mp,gp,yp,Cy=P(()=>{Ga(),Or=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},n,s;typeof a.mean=="number"?n=[a.mean,a.mean,a.mean,a.mean]:n=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?s=[a.bias,a.bias,a.bias,a.bias]:s=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let o=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",d=r*i,h=l==="RGBA"?new Float32Array(d*4):new Float32Array(d*3),c=4,m=0,_=1,y=2,b=3,S=0,v=d,$=d*2,I=-1;o==="RGB"&&(c=3,m=0,_=1,y=2,b=-1),l==="RGBA"?I=d*3:l==="RBG"?(S=0,$=d,v=d*2):l==="BGR"&&($=0,v=d,S=d*2);for(let T=0;T<d;T++,m+=c,y+=c,_+=c,b+=c)h[S++]=(e[m]+s[0])/n[0],h[v++]=(e[_]+s[1])/n[1],h[$++]=(e[y]+s[2])/n[2],I!==-1&&b!==-1&&(h[I++]=(e[b]+s[3])/n[3]);return l==="RGBA"?new Ue("float32",h,[1,4,r,i]):new Ue("float32",h,[1,3,r,i])},hp=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,n=typeof e=="string",s,o=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},d=h=>typeof HTMLCanvasElement<"u"&&h instanceof HTMLCanvasElement||h instanceof OffscreenCanvas?h.getContext("2d"):null;if(r){let h=l();h.width=e.width,h.height=e.height;let c=d(h);if(c!=null){let m=e.height,_=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(m=t.resizedHeight,_=t.resizedWidth),t!==void 0){if(o=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");o.tensorFormat="RGBA",o.height=m,o.width=_}else o.tensorFormat="RGBA",o.height=m,o.width=_;c.drawImage(e,0,0),s=c.getImageData(0,0,_,m).data}else throw new Error("Can not access image data")}else if(i){let h,c;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(h=t.resizedHeight,c=t.resizedWidth):(h=e.height,c=e.width),t!==void 0&&(o=t),o.format="RGBA",o.height=h,o.width=c,t!==void 0){let m=l();m.width=c,m.height=h;let _=d(m);if(_!=null)_.putImageData(e,0,0),s=_.getImageData(0,0,c,h).data;else throw new Error("Can not access image data")}else s=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let h=l();h.width=e.width,h.height=e.height;let c=d(h);if(c!=null){let m=e.height,_=e.width;return c.drawImage(e,0,0,_,m),s=c.getImageData(0,0,_,m).data,o.height=m,o.width=_,Or(s,o)}else throw new Error("Can not access image data")}else{if(n)return new Promise((h,c)=>{let m=l(),_=d(m);if(!e||!_)return c();let y=new Image;y.crossOrigin="Anonymous",y.src=e,y.onload=()=>{m.width=y.width,m.height=y.height,_.drawImage(y,0,0,m.width,m.height);let b=_.getImageData(0,0,m.width,m.height);o.height=m.height,o.width=m.width,h(Or(b.data,o))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return Or(s,o);throw new Error("Input data provided is not supported - aborted tensor creation")},fp=(e,t)=>{let{width:r,height:i,download:a,dispose:n}=t,s=[1,i,r,4];return new Ue({location:"texture",type:"float32",texture:e,dims:s,download:a,dispose:n})},mp=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Ue({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:n})},gp=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Ue({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:n})},yp=(e,t,r)=>new Ue({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),At,dr,Ii,_p,zy=P(()=>{At=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),dr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),Ii=!1,_p=()=>{if(!Ii){Ii=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(At.set("int64",BigInt64Array),dr.set(BigInt64Array,"int64")),t&&(At.set("uint64",BigUint64Array),dr.set(BigUint64Array,"uint64")),i?(At.set("float16",r),dr.set(r,"float16")):At.set("float16",Uint16Array)}}}),bp,wp,Ay=P(()=>{Ga(),bp=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},wp=(e,t)=>{switch(e.location){case"cpu":return new Ue(e.type,e.data,t);case"cpu-pinned":return new Ue({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Ue({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Ue({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Ue({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Ue,Ga=P(()=>{Ey(),Cy(),zy(),Ay(),Ue=class{constructor(e,t,r){_p();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let s=At.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,o;if(typeof e=="string")if(i=e,o=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let l=At.get(e);if(l===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?s=l.from(t,BigInt):s=l.from(t)}else if(t instanceof l)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${l}`)}else if(o=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")i="string",s=e;else if(l==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let l=dr.get(e.constructor);if(l===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=l,s=e}if(o===void 0)o=[s.length];else if(!Array.isArray(o))throw new TypeError("A tensor's dims must be a number array");a=o,this.cpuData=s,this.dataLocation="cpu"}let n=bp(a);if(this.cpuData&&n!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(n/2)===this.cpuData.length))throw new Error(`Tensor's size(${n}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=n}static async fromImage(e,t){return hp(e,t)}static fromTexture(e,t){return fp(e,t)}static fromGpuBuffer(e,t){return mp(e,t)}static fromMLTensor(e,t){return gp(e,t)}static fromPinnedBuffer(e,t,r){return yp(e,t,r)}toDataURL(e){return pp(this,e)}toImageData(e){return cp(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return wp(this,e)}}}),Ye,$p=P(()=>{Ga(),Ye=Ue}),gr,ki,Je,Ve,bt,wt,vp=P(()=>{dp(),gr=(e,t)=>{(typeof Ee.trace>"u"?!Ee.wasm.trace:!Ee.trace)||console.timeStamp(`${e}::ORT::${t}`)},ki=(e,t)=>{var a;let r=((a=new Error().stack)==null?void 0:a.split(/\r\n|\r|\n/g))||[],i=!1;for(let n=0;n<r.length;n++){if(i&&!r[n].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[n].trim().split(" ")[1]}`;t&&(s+=`::${t}`),gr("CPU",s);return}r[n].includes("TRACE_FUNC")&&(i=!0)}},Je=e=>{(typeof Ee.trace>"u"?!Ee.wasm.trace:!Ee.trace)||ki("BEGIN",e)},Ve=e=>{(typeof Ee.trace>"u"?!Ee.wasm.trace:!Ee.trace)||ki("END",e)},bt=e=>{(typeof Ee.trace>"u"?!Ee.wasm.trace:!Ee.trace)||console.time(`ORT::${e}`)},wt=e=>{(typeof Ee.trace>"u"?!Ee.wasm.trace:!Ee.trace)||console.timeEnd(`ORT::${e}`)}}),xp,Oy=P(()=>{up(),$p(),vp(),xp=class Sp{constructor(t){this.handler=t}async run(t,r,i){Je(),bt("InferenceSession.run");let a={},n={};if(typeof t!="object"||t===null||t instanceof Ye||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Ye)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let d of r){if(typeof d!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(d)===-1)throw new RangeError(`'fetches' contains invalid output name: ${d}.`);a[d]=null}if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let d=!1,h=Object.getOwnPropertyNames(r);for(let c of this.outputNames)if(h.indexOf(c)!==-1){let m=r[c];(m===null||m instanceof Ye)&&(d=!0,s=!1,a[c]=m)}if(d){if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else n=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let d of this.inputNames)if(typeof t[d]>"u")throw new Error(`input '${d}' is missing in 'feeds'.`);if(s)for(let d of this.outputNames)a[d]=null;let o=await this.handler.run(t,a,n),l={};for(let d in o)if(Object.hasOwnProperty.call(o,d)){let h=o[d];h instanceof Ye?l[d]=h:l[d]=new Ye(h.type,h.data,h.dims)}return wt("InferenceSession.run"),Ve(),l}async release(){return this.handler.dispose()}static async create(t,r,i,a){Je(),bt("InferenceSession.create");let n,s={};if(typeof t=="string"){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let h=t,c=0,m=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(c=r,!Number.isSafeInteger(c))throw new RangeError("'byteOffset' must be an integer.");if(c<0||c>=h.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);if(m=t.byteLength-c,typeof i=="number"){if(m=i,!Number.isSafeInteger(m))throw new RangeError("'byteLength' must be an integer.");if(m<=0||c+m>h.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${h.byteLength-c}].`);if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");n=new Uint8Array(h,c,m)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[o,l]=await op(s),d=await o.createInferenceSessionHandler(n,l);return wt("InferenceSession.create"),Ve(),new Sp(d)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),Ha,Ry=P(()=>{Oy(),Ha=xp}),By=P(()=>{}),My=P(()=>{}),Dy=P(()=>{}),Ny=P(()=>{}),Tp={};Kt(Tp,{InferenceSession:()=>Ha,TRACE:()=>gr,TRACE_EVENT_BEGIN:()=>bt,TRACE_EVENT_END:()=>wt,TRACE_FUNC_BEGIN:()=>Je,TRACE_FUNC_END:()=>Ve,Tensor:()=>Ye,env:()=>_e,registerBackend:()=>Mt});var Ge=P(()=>{Ty(),ky(),Ry(),$p(),By(),My(),vp(),Dy(),Ny()}),Fa=P(()=>{}),Ip={};Kt(Ip,{default:()=>kp});var Ei,Ci,kp,Py=P(()=>{var e;Rf(),Ut(),ja(),Ei="ort-wasm-proxy-worker",Ci=((e=globalThis.self)==null?void 0:e.name)===Ei,Ci&&(self.onmessage=t=>{let{type:r,in:i}=t.data;try{switch(r){case"init-wasm":Ka(i.wasm).then(()=>{cn(i).then(()=>{postMessage({type:r})},a=>{postMessage({type:r,err:a})})},a=>{postMessage({type:r,err:a})});break;case"init-ep":{let{epName:a,env:n}=i;hn(n,a).then(()=>{postMessage({type:r})},s=>{postMessage({type:r,err:s})});break}case"copy-from":{let{buffer:a}=i,n=Jr(a);postMessage({type:r,out:n});break}case"create":{let{model:a,options:n}=i;fn(a,n).then(s=>{postMessage({type:r,out:s})},s=>{postMessage({type:r,err:s})});break}case"release":mn(i),postMessage({type:r});break;case"run":{let{sessionId:a,inputIndices:n,inputs:s,outputIndices:o,options:l}=i;gn(a,n,s,o,new Array(o.length).fill(null),l).then(d=>{d.some(h=>h[3]!=="cpu")?postMessage({type:r,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:r,out:d},_n([...s,...d]))},d=>{postMessage({type:r,err:d})});break}case"end-profiling":yn(i),postMessage({type:r});break;default:}}catch(a){postMessage({type:r,err:a})}}),kp=Ci?null:t=>new Worker(t??Pe,{type:"module",name:Ei})}),Ep={};Kt(Ep,{default:()=>Cp});async function vo(e={}){var fo,mo;var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,a=i&&((fo=self.name)==null?void 0:fo.startsWith("em-pthread"));t.mountExternalData=(u,p)=>{u.startsWith("./")&&(u=u.substring(2)),(t.Xc||(t.Xc=new Map)).set(u,p)},t.unmountExternalData=()=>{delete t.Xc},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let n=u=>async(...p)=>{var g;try{if(t.Yc)throw Error("Session already started");let f=t.Yc={Kd:p[0],errors:[]},x=await u(...p);if(t.Yc!==f)throw Error("Session mismatch");(g=t.dd)==null||g.flush();let k=f.errors;if(0<k.length){let z=await Promise.all(k);if(z=z.filter(D=>D),0<z.length)throw Error(z.join(`
`))}return x}finally{t.Yc=null}};t.jsepInit=(u,p)=>{if(u==="webgpu"){[t.dd,t.Ad,t.Ed,t.ed,t.Dd,t.$b,t.Fd,t.Hd,t.Bd,t.Cd,t.Gd]=p;let g=t.dd;t.jsepRegisterBuffer=(f,x,k,z)=>g.registerBuffer(f,x,k,z),t.jsepGetBuffer=f=>g.getBuffer(f),t.jsepCreateDownloader=(f,x,k)=>g.createDownloader(f,x,k),t.jsepOnCreateSession=f=>{g.onCreateSession(f)},t.jsepOnReleaseSession=f=>{g.onReleaseSession(f)},t.jsepOnRunStart=f=>g.onRunStart(f),t.Id=(f,x)=>{g.upload(f,x)}}else if(u==="webnn"){let g=p[0];[t.Wd,t.sd,t.webnnEnsureTensor,t.td,t.webnnDownloadTensor,t.Rd,t.webnnEnableTraceEvent]=p.slice(1),t.webnnReleaseTensorId=t.sd,t.webnnUploadTensor=t.td,t.webnnRegisterMLContext=t.Rd,t.webnnOnRunStart=f=>g.onRunStart(f),t.webnnOnRunEnd=g.onRunEnd.bind(g),t.webnnOnReleaseSession=f=>{g.onReleaseSession(f)},t.webnnCreateMLTensorDownloader=(f,x)=>g.createMLTensorDownloader(f,x),t.webnnRegisterMLTensor=(f,x,k,z)=>g.registerMLTensor(f,x,k,z),t.webnnCreateMLContext=f=>g.createMLContext(f),t.webnnRegisterMLConstant=(f,x,k,z,D,W)=>g.registerMLConstant(f,x,k,z,D,t.Xc,W),t.webnnRegisterGraphInput=g.registerGraphInput.bind(g),t.webnnIsGraphInput=g.isGraphInput.bind(g),t.webnnRegisterGraphOutput=g.registerGraphOutput.bind(g),t.webnnIsGraphOutput=g.isGraphOutput.bind(g),t.webnnCreateTemporaryTensor=g.createTemporaryTensor.bind(g),t.webnnIsGraphInputOutputTypeSupported=g.isGraphInputOutputTypeSupported.bind(g)}};let s=()=>{let u=p=>(...g)=>{let f=tt;return g=p(...g),tt!=f?new Promise((x,k)=>{pi={resolve:x,reject:k}}):g};(()=>{for(let p of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[p]=u(t[p])})(),n!==void 0&&(t._OrtRun=n(t._OrtRun),t._OrtRunWithBinding=n(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s==null||s()};var o,l,d=(u,p)=>{throw p},h=import.meta.url,c="";if(r||i){try{c=new URL(".",h).href}catch{}i&&(l=u=>{var p=new XMLHttpRequest;return p.open("GET",u,!1),p.responseType="arraybuffer",p.send(null),new Uint8Array(p.response)}),o=async u=>{if(A(u))return new Promise((g,f)=>{var x=new XMLHttpRequest;x.open("GET",u,!0),x.responseType="arraybuffer",x.onload=()=>{x.status==200||x.status==0&&x.response?g(x.response):f(x.status)},x.onerror=f,x.send(null)});var p=await fetch(u,{credentials:"same-origin"});if(p.ok)return p.arrayBuffer();throw Error(p.status+" : "+p.url)}}var m,_,y,b,S,v,$=console.log.bind(console),I=console.error.bind(console),T=$,E=I,C=!1,A=u=>u.startsWith("file://");function w(){ct.buffer!=M.buffer&&H()}if(a){let u=function(p){try{var g=p.data,f=g.Sc;if(f==="load"){let x=[];self.onmessage=k=>x.push(k),v=()=>{postMessage({Sc:"loaded"});for(let k of x)u(k);self.onmessage=u};for(let k of g.xd)t[k]&&!t[k].proxy||(t[k]=(...z)=>{postMessage({Sc:"callHandler",wd:k,args:z})},k=="print"&&(T=t[k]),k=="printErr"&&(E=t[k]));ct=g.Od,H(),_=g.Pd,qe(),zr()}else if(f==="run"){(function(x){var k=(w(),K)[x+52>>>2>>>0];x=(w(),K)[x+56>>>2>>>0],xs(k,k-x),se(k)})(g.Rc),gi(g.Rc,0,0,1,0,0),Sn(),ui(g.Rc),R||(ys(),R=!0);try{rm(g.Md,g.bd)}catch(x){if(x!="unwind")throw x}}else g.target!=="setimmediate"&&(f==="checkMailbox"?R&&xr():f&&(E(`worker: received unknown command ${f}`),E(g)))}catch(x){throw _s(),x}};var R=!1;self.onunhandledrejection=p=>{throw p.reason||p},self.onmessage=u}var M,U,G,F,O,K,X,ee,he,V,ue,L=!1;function H(){var u=ct.buffer;t.HEAP8=M=new Int8Array(u),G=new Int16Array(u),t.HEAPU8=U=new Uint8Array(u),F=new Uint16Array(u),t.HEAP32=O=new Int32Array(u),t.HEAPU32=K=new Uint32Array(u),X=new Float32Array(u),ee=new Float64Array(u),he=new BigInt64Array(u),V=new BigUint64Array(u)}function Z(){L=!0,a?v():nt.sb()}function q(u){throw E(u="Aborted("+u+")"),C=!0,u=new WebAssembly.RuntimeError(u+". Build with -sASSERTIONS for more info."),S==null||S(u),u}function me(){return{a:{ma:Tg,gb:Sg,g:im,J:am,f:nm,o:sm,h:om,ha:um,b:lm,T:dm,Ha:zn,n:pm,$:Bn,Xa:Mn,Da:Dn,Fa:Nn,Ya:Pn,Va:Un,Oa:Ln,Ua:qn,ka:Wn,Ea:Vn,Ba:Gn,Wa:Hn,Ca:Fn,bb:cm,ea:hm,wa:fm,ua:gm,da:_m,O:bm,H:wm,va:$m,_:Em,xa:Cm,Ra:zm,za:Om,Ia:Rm,sa:Bm,fa:Mm,Qa:ui,_a:Dm,R:Lm,r:Hm,c:si,hb:Fm,y:jm,M:Km,D:Xm,l:Zm,s:es,ib:Qm,I:Ym,S:Jm,j:eg,u:tg,q:rg,k:ig,La:ag,Ma:ng,Na:sg,Ja:as,Ka:ns,ta:ss,db:ug,ab:dg,v:pg,aa:cg,ga:hg,$a:lg,W:fg,Za:mg,Aa:gg,F:og,U:yg,la:Er,ya:bg,fb:_g,eb:wg,Sa:ds,Ta:ps,Ga:Xt,V:cs,ja:hs,Pa:fs,ia:ms,kb:oy,na:ry,lb:sy,oa:ty,G:Fg,d:Cg,t:kg,w:Ig,A:Ug,mb:Yg,K:Vg,x:Og,pa:Jg,Y:iy,ba:Qg,nb:Zg,ob:Xg,P:Lg,qa:Kg,pb:jg,N:Gg,Z:ey,e:Eg,B:Ag,m:zg,jb:uy,p:Bg,z:Mg,C:Rg,E:Dg,L:qg,qb:Hg,Q:ay,ca:Wg,X:ny,rb:Pg,ra:Ng,i:vg,a:ct,cb:Ne}}}async function qe(){function u(f,x){var k=nt=f.exports;f={};for(let[z,D]of Object.entries(k))typeof D=="function"?(k=Nm(D),f[z]=k):f[z]=D;return nt=f,nt=(function(){var z=nt,D=j=>ne=>j(ne)>>>0,W=j=>()=>j()>>>0;return(z=Object.assign({},z)).tb=D(z.tb),z.Xb=W(z.Xb),z.Zb=D(z.Zb),z.lc=D(z.lc),z.mc=W(z.mc),z.qc=D(z.qc),z})(),vn.push(nt._b),gs=(f=nt).tb,ys=f.ub,t._OrtInit=f.vb,t._OrtGetLastError=f.wb,t._OrtCreateSessionOptions=f.xb,t._OrtAppendExecutionProvider=f.yb,t._OrtAddFreeDimensionOverride=f.zb,t._OrtAddSessionConfigEntry=f.Ab,t._OrtReleaseSessionOptions=f.Bb,t._OrtCreateSession=f.Cb,t._OrtReleaseSession=f.Db,t._OrtGetInputOutputCount=f.Eb,t._OrtGetInputOutputMetadata=f.Fb,t._OrtFree=f.Gb,t._OrtCreateTensor=f.Hb,t._OrtGetTensorData=f.Ib,t._OrtReleaseTensor=f.Jb,t._OrtCreateRunOptions=f.Kb,t._OrtAddRunConfigEntry=f.Lb,t._OrtReleaseRunOptions=f.Mb,t._OrtCreateBinding=f.Nb,t._OrtBindInput=f.Ob,t._OrtBindOutput=f.Pb,t._OrtClearBoundOutputs=f.Qb,t._OrtReleaseBinding=f.Rb,t._OrtRunWithBinding=f.Sb,t._OrtRun=f.Tb,t._OrtEndProfiling=f.Ub,t._JsepOutput=f.Vb,t._JsepGetNodeName=f.Wb,Cr=f.Xb,rt=t._free=f.Yb,Yt=t._malloc=f.Zb,gi=f.ac,_s=f.bc,bs=f.cc,ws=f.dc,yi=f.ec,$s=f.fc,vs=f.gc,le=f.hc,Jt=f.ic,xs=f.jc,se=f.kc,_i=f.lc,oe=f.mc,Ss=f.nc,bi=f.oc,Ts=f.pc,Is=f.qc,ks=f.rc,wi=f.sc,Es=f.tc,Cs=f.uc,zs=f.vc,As=f.wc,Os=f.xc,Rs=f.yc,Bs=f.zc,Ms=f.Ac,Ds=f.Bc,Ns=f.Cc,Ps=f.Dc,Us=f.Ec,Ls=f.Fc,qs=f.Gc,Ws=f.Hc,Vs=f.Ic,Gs=f.Jc,Hs=f.Kc,Fs=f.Lc,js=f.Mc,Ks=f.Nc,Xs=f.Pc,Zs=f.Qc,Qs=f.$c,Ys=f.ad,Js=f.fd,eo=f.jd,to=f.kd,ro=f.ld,io=f.md,ao=f.nd,no=f.od,so=f.pd,oo=f.qd,uo=f.vd,lo=f.Sd,po=f.Td,co=f.Ud,ho=f.Vd,_=x,nt}var p,g=me();return t.instantiateWasm?new Promise(f=>{t.instantiateWasm(g,(x,k)=>{f(u(x,k))})}):a?u(new WebAssembly.Instance(_,me()),_):(ue??(ue=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",c):c+"ort-wasm-simd-threaded.jsep.wasm":new URL(""+new URL("ort-wasm-simd-threaded.jsep-CyqnNavA.wasm",import.meta.url).href,import.meta.url).href),p=await(async function(f){var x=ue;if(!m&&!A(x))try{var k=fetch(x,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(k,f)}catch(z){E(`wasm streaming compile failed: ${z}`),E("falling back to ArrayBuffer instantiation")}return(async function(z,D){try{var W=await(async function(j){if(!m)try{var ne=await o(j);return new Uint8Array(ne)}catch{}if(j==ue&&m)j=new Uint8Array(m);else{if(!l)throw"both async and sync fetching of the wasm failed";j=l(j)}return j})(z);return await WebAssembly.instantiate(W,D)}catch(j){E(`failed to asynchronously prepare wasm: ${j}`),q(j)}})(x,f)})(g),u(p.instance,p.module))}class Te{constructor(p){ve(this,"name","ExitStatus");this.message=`Program terminated with exit(${p})`,this.status=p}}var Oe=u=>{u.terminate(),u.onmessage=()=>{}},Re=[],De=0,Be=null,dt=u=>{pt.length==0&&(In(),Tn(pt[0]));var p=pt.pop();if(!p)return 6;Zt.push(p),xt[u.Rc]=p,p.Rc=u.Rc;var g={Sc:"run",Md:u.Ld,bd:u.bd,Rc:u.Rc};return p.postMessage(g,u.rd),0},we=0,re=(u,p,...g)=>{var f,x=16*g.length,k=oe(),z=_i(x),D=z>>>3;for(f of g)typeof f=="bigint"?((w(),he)[D++>>>0]=1n,(w(),he)[D++>>>0]=f):((w(),he)[D++>>>0]=0n,(w(),ee)[D++>>>0]=f);return u=bs(u,0,x,z,p),se(k),u};function Ne(u){if(a)return re(0,1,u);if(y=u,!(0<we)){for(var p of Zt)Oe(p);for(p of pt)Oe(p);pt=[],Zt=[],xt={},C=!0}d(0,new Te(u))}function _r(u){if(a)return re(1,0,u);Xt(u)}var Xt=u=>{if(y=u,a)throw _r(u),"unwind";Ne(u)},pt=[],Zt=[],vn=[],xt={},xn=u=>{var p=u.Rc;delete xt[p],pt.push(u),Zt.splice(Zt.indexOf(u),1),u.Rc=0,ws(p)};function Sn(){vn.forEach(u=>u())}var Tn=u=>new Promise(p=>{u.onmessage=x=>{var k=x.data;if(x=k.Sc,k.Zc&&k.Zc!=Cr()){var z=xt[k.Zc];z?z.postMessage(k,k.rd):E(`Internal error! Worker sent a message "${x}" to target pthread ${k.Zc}, but that thread no longer exists!`)}else x==="checkMailbox"?xr():x==="spawnThread"?dt(k):x==="cleanupThread"?vr(()=>{xn(xt[k.Nd])}):x==="loaded"?(u.loaded=!0,p(u)):k.target==="setimmediate"?u.postMessage(k):x==="uncaughtException"?u.onerror(k.error):x==="callHandler"?t[k.wd](...k.args):x&&E(`worker sent an unknown command ${x}`)},u.onerror=x=>{throw E(`worker sent an error! ${x.filename}:${x.lineno}: ${x.message}`),x};var g,f=[];for(g of[])t.propertyIsEnumerable(g)&&f.push(g);u.postMessage({Sc:"load",xd:f,Od:ct,Pd:_})});function In(){var u=new Worker((()=>{let p=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new p("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});pt.push(u)}var ct,rm=(u,p)=>{we=0,u=wi(u,p),0<we?y=u:yi(u)},br=[],wr=0;function im(u){var p=new ri(u>>>=0);return(w(),M)[p.Tc+12>>>0]==0&&(kn(p,!0),wr--),En(p,!1),br.push(p),Is(u)}var qt=0,am=()=>{le(0,0);var u=br.pop();Ss(u.cd),qt=0};function kn(u,p){p=p?1:0,(w(),M)[u.Tc+12>>>0]=p}function En(u,p){p=p?1:0,(w(),M)[u.Tc+13>>>0]=p}class ri{constructor(p){this.cd=p,this.Tc=p-24}}var ii=u=>{var p=qt;if(!p)return Jt(0),0;var g=new ri(p);(w(),K)[g.Tc+16>>>2>>>0]=p;var f=(w(),K)[g.Tc+4>>>2>>>0];if(!f)return Jt(0),p;for(var x of u){if(x===0||x===f)break;if(Ts(x,f,g.Tc+16))return Jt(x),p}return Jt(f),p};function nm(){return ii([])}function sm(u){return ii([u>>>0])}function om(u,p,g,f){return ii([u>>>0,p>>>0,g>>>0,f>>>0])}var um=()=>{var u=br.pop();u||q("no exception to throw");var p=u.cd;throw(w(),M)[u.Tc+13>>>0]==0&&(br.push(u),En(u,!0),kn(u,!1),wr++),bi(p),qt=p};function lm(u,p,g){var f=new ri(u>>>=0);throw p>>>=0,g>>>=0,(w(),K)[f.Tc+16>>>2>>>0]=0,(w(),K)[f.Tc+4>>>2>>>0]=p,(w(),K)[f.Tc+8>>>2>>>0]=g,bi(u),wr++,qt=u}var dm=()=>wr;function Cn(u,p,g,f){return a?re(2,1,u,p,g,f):zn(u,p,g,f)}function zn(u,p,g,f){if(u>>>=0,p>>>=0,g>>>=0,f>>>=0,!globalThis.SharedArrayBuffer)return 6;var x=[];return a&&x.length===0?Cn(u,p,g,f):(u={Ld:g,Rc:u,bd:f,rd:x},a?(u.Sc="spawnThread",postMessage(u,x),0):dt(u))}function pm(u){throw qt||(qt=u>>>0),qt}var An=globalThis.TextDecoder&&new TextDecoder,On=(u,p,g,f)=>{if(g=p+g,f)return g;for(;u[p]&&!(p>=g);)++p;return p},Rn=(u,p=0,g,f)=>{if(16<(g=On(u,p>>>=0,g,f))-p&&u.buffer&&An)return An.decode(u.buffer instanceof ArrayBuffer?u.subarray(p,g):u.slice(p,g));for(f="";p<g;){var x=u[p++];if(128&x){var k=63&u[p++];if((224&x)==192)f+=String.fromCharCode((31&x)<<6|k);else{var z=63&u[p++];65536>(x=(240&x)==224?(15&x)<<12|k<<6|z:(7&x)<<18|k<<12|z<<6|63&u[p++])?f+=String.fromCharCode(x):(x-=65536,f+=String.fromCharCode(55296|x>>10,56320|1023&x))}}else f+=String.fromCharCode(x)}return f},Ie=(u,p,g)=>(u>>>=0)?Rn((w(),U),u,p,g):"";function Bn(u,p,g){return a?re(3,1,u,p,g):0}function Mn(u,p){if(a)return re(4,1,u,p)}function Dn(u,p){if(a)return re(5,1,u,p)}function Nn(u,p,g){if(a)return re(6,1,u,p,g)}function Pn(u,p,g){return a?re(7,1,u,p,g):0}function Un(u,p){if(a)return re(8,1,u,p)}function Ln(u,p,g){if(a)return re(9,1,u,p,g)}function qn(u,p,g,f){if(a)return re(10,1,u,p,g,f)}function Wn(u,p,g,f){if(a)return re(11,1,u,p,g,f)}function Vn(u,p,g,f){if(a)return re(12,1,u,p,g,f)}function Gn(u){if(a)return re(13,1,u)}function Hn(u,p){if(a)return re(14,1,u,p)}function Fn(u,p,g){if(a)return re(15,1,u,p,g)}var cm=()=>q(""),et=u=>{u>>>=0;for(var p="";;){var g=(w(),U)[u++>>>0];if(!g)return p;p+=String.fromCharCode(g)}},ai={},ni={},Wt=class extends Error{constructor(u){super(u),this.name="BindingError"}};function at(u,p,g={}){return(function(f,x,k={}){var z=x.name;if(!f)throw new Wt(`type "${z}" must have a positive integer typeid pointer`);if(ni.hasOwnProperty(f)){if(k.yd)return;throw new Wt(`Cannot register type '${z}' twice`)}ni[f]=x,ai.hasOwnProperty(f)&&(x=ai[f],delete ai[f],x.forEach(D=>D()))})(u,p,g)}var jn=(u,p,g)=>{switch(p){case 1:return g?f=>(w(),M)[f>>>0]:f=>(w(),U)[f>>>0];case 2:return g?f=>(w(),G)[f>>>1>>>0]:f=>(w(),F)[f>>>1>>>0];case 4:return g?f=>(w(),O)[f>>>2>>>0]:f=>(w(),K)[f>>>2>>>0];case 8:return g?f=>(w(),he)[f>>>3>>>0]:f=>(w(),V)[f>>>3>>>0];default:throw new TypeError(`invalid integer width (${p}): ${u}`)}};function hm(u,p,g,f,x){u>>>=0,g>>>=0,p=et(p>>>0);let k=z=>z;if(f=f===0n){let z=8*g;k=D=>BigInt.asUintN(z,D),x=k(x)}at(u,{name:p,Oc:k,Vc:(z,D)=>(typeof D=="number"&&(D=BigInt(D)),D),Uc:jn(p,g,!f),Wc:null})}function fm(u,p,g,f){at(u>>>=0,{name:p=et(p>>>0),Oc:function(x){return!!x},Vc:function(x,k){return k?g:f},Uc:function(x){return this.Oc((w(),U)[x>>>0])},Wc:null})}var Kn=[],St=[0,1,,1,null,1,!0,1,!1,1];function si(u){9<(u>>>=0)&&--St[u+1]==0&&(St[u]=void 0,Kn.push(u))}var We=u=>{if(!u)throw new Wt(`Cannot use deleted val. handle = ${u}`);return St[u]},He=u=>{switch(u){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let p=Kn.pop()||St.length;return St[p]=u,St[p+1]=1,p}};function oi(u){return this.Oc((w(),K)[u>>>2>>>0])}var mm={name:"emscripten::val",Oc:u=>{var p=We(u);return si(u),p},Vc:(u,p)=>He(p),Uc:oi,Wc:null};function gm(u){return at(u>>>0,mm)}var ym=(u,p)=>{switch(p){case 4:return function(g){return this.Oc((w(),X)[g>>>2>>>0])};case 8:return function(g){return this.Oc((w(),ee)[g>>>3>>>0])};default:throw new TypeError(`invalid float width (${p}): ${u}`)}};function _m(u,p,g){g>>>=0,at(u>>>=0,{name:p=et(p>>>0),Oc:f=>f,Vc:(f,x)=>x,Uc:ym(p,g),Wc:null})}function bm(u,p,g,f,x){u>>>=0,g>>>=0,p=et(p>>>0);let k=D=>D;if(f===0){var z=32-8*g;k=D=>D<<z>>>z,x=k(x)}at(u,{name:p,Oc:k,Vc:(D,W)=>W,Uc:jn(p,g,f!==0),Wc:null})}function wm(u,p,g){function f(k){var z=(w(),K)[k>>>2>>>0];return k=(w(),K)[k+4>>>2>>>0],new x((w(),M).buffer,k,z)}var x=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][p];at(u>>>=0,{name:g=et(g>>>0),Oc:f,Uc:f},{yd:!0})}var ht=(u,p,g)=>{var f=(w(),U);if(p>>>=0,0<g){var x=p;g=p+g-1;for(var k=0;k<u.length;++k){var z=u.codePointAt(k);if(127>=z){if(p>=g)break;f[p++>>>0]=z}else if(2047>=z){if(p+1>=g)break;f[p++>>>0]=192|z>>6,f[p++>>>0]=128|63&z}else if(65535>=z){if(p+2>=g)break;f[p++>>>0]=224|z>>12,f[p++>>>0]=128|z>>6&63,f[p++>>>0]=128|63&z}else{if(p+3>=g)break;f[p++>>>0]=240|z>>18,f[p++>>>0]=128|z>>12&63,f[p++>>>0]=128|z>>6&63,f[p++>>>0]=128|63&z,k++}}f[p>>>0]=0,u=p-x}else u=0;return u},$r=u=>{for(var p=0,g=0;g<u.length;++g){var f=u.charCodeAt(g);127>=f?p++:2047>=f?p+=2:55296<=f&&57343>=f?(p+=4,++g):p+=3}return p};function $m(u,p){at(u>>>=0,{name:p=et(p>>>0),Oc(g){var f=(w(),K)[g>>>2>>>0];return f=Ie(g+4,f,!0),rt(g),f},Vc(g,f){f instanceof ArrayBuffer&&(f=new Uint8Array(f));var x=typeof f=="string";if(!(x||ArrayBuffer.isView(f)&&f.BYTES_PER_ELEMENT==1))throw new Wt("Cannot pass non-string to std::string");var k=x?$r(f):f.length,z=Yt(4+k+1),D=z+4;return(w(),K)[z>>>2>>>0]=k,x?ht(f,D,k+1):(w(),U).set(f,D>>>0),g!==null&&g.push(rt,z),z},Uc:oi,Wc(g){rt(g)}})}var Xn=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,vm=(u,p,g)=>{if(u>>>=1,16<(p=On((w(),F),u,p/2,g))-u&&Xn)return Xn.decode((w(),F).slice(u,p));for(g="";u<p;++u){var f=(w(),F)[u>>>0];g+=String.fromCharCode(f)}return g},xm=(u,p,g)=>{if(g??(g=2147483647),2>g)return 0;var f=p;g=(g-=2)<2*u.length?g/2:u.length;for(var x=0;x<g;++x){var k=u.charCodeAt(x);(w(),G)[p>>>1>>>0]=k,p+=2}return(w(),G)[p>>>1>>>0]=0,p-f},Sm=u=>2*u.length,Tm=(u,p,g)=>{var f="";u>>>=2;for(var x=0;!(x>=p/4);x++){var k=(w(),K)[u+x>>>0];if(!k&&!g)break;f+=String.fromCodePoint(k)}return f},Im=(u,p,g)=>{if(p>>>=0,g??(g=2147483647),4>g)return 0;var f=p;g=f+g-4;for(var x=0;x<u.length;++x){var k=u.codePointAt(x);if(65535<k&&x++,(w(),O)[p>>>2>>>0]=k,(p+=4)+4>g)break}return(w(),O)[p>>>2>>>0]=0,p-f},km=u=>{for(var p=0,g=0;g<u.length;++g)65535<u.codePointAt(g)&&g++,p+=4;return p};function Em(u,p,g){if(u>>>=0,p>>>=0,g=et(g>>>=0),p===2)var f=vm,x=xm,k=Sm;else f=Tm,x=Im,k=km;at(u,{name:g,Oc:z=>{var D=(w(),K)[z>>>2>>>0];return D=f(z+4,D*p,!0),rt(z),D},Vc:(z,D)=>{if(typeof D!="string")throw new Wt(`Cannot pass non-string to C++ string type ${g}`);var W=k(D),j=Yt(4+W+p);return(w(),K)[j>>>2>>>0]=W/p,x(D,j+4,W+p),z!==null&&z.push(rt,j),j},Uc:oi,Wc(z){rt(z)}})}function Cm(u,p){at(u>>>=0,{zd:!0,name:p=et(p>>>0),Oc:()=>{},Vc:()=>{}})}function zm(u){gi(u>>>0,!i,1,!r,131072,!1),Sn()}var vr=u=>{if(!C)try{if(u(),!(0<we))try{a?Cr()&&yi(y):Xt(y)}catch(p){p instanceof Te||p=="unwind"||d(0,p)}}catch(p){p instanceof Te||p=="unwind"||d(0,p)}},Am=!Atomics.waitAsync||((mo=globalThis.navigator)==null?void 0:mo.userAgent)&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function ui(u){u>>>=0,Am||(Atomics.waitAsync((w(),O),u>>>2,u).value.then(xr),u+=128,Atomics.store((w(),O),u>>>2,1))}var xr=()=>vr(()=>{var u=Cr();u&&(ui(u),vs())});function Om(u,p){(u>>>=0)==p>>>0?setTimeout(xr):a?postMessage({Zc:u,Sc:"checkMailbox"}):(u=xt[u])&&u.postMessage({Sc:"checkMailbox"})}var li=[];function Rm(u,p,g,f,x){for(p>>>=0,x>>>=0,li.length=0,g=x>>>3,f=x+f>>>3;g<f;){var k;k=(w(),he)[g++>>>0]?(w(),he)[g++>>>0]:(w(),ee)[g++>>>0],li.push(k)}return(p?$i[p]:xg[u])(...li)}var Bm=()=>{we=0};function Mm(u){u>>>=0,a?postMessage({Sc:"cleanupThread",Nd:u}):xn(xt[u])}function Dm(u){}var Sr=u=>{try{u()}catch(p){q(p)}};function Nm(u){var p=(...g)=>{Tr.push(u);try{return u(...g)}finally{C||(Tr.pop(),tt&&ft===1&&Tr.length===0&&(ft=0,we+=1,Sr(po),typeof Fibers<"u"&&Fibers.Zd()))}};return Yn.set(u,p),p}var ft=0,tt=null,Zn=0,Tr=[],di=new Map,Qn=new Map,Yn=new Map,Pm=0,pi=null,Um=[],Jn=u=>(function(p){if(!C){if(ft===0){var g=!1,f=!1;p((x=0)=>{if(!C&&(Zn=x,g=!0,f)){ft=2,Sr(()=>co(tt)),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.resume(),x=!1;try{var k=(function(){var W=(w(),O)[tt+8>>>2>>>0];return W=Qn.get(W),W=Yn.get(W),--we,W()})()}catch(W){k=W,x=!0}var z=!1;if(!tt){var D=pi;D&&(pi=null,(x?D.reject:D.resolve)(k),z=!0)}if(x&&!z)throw k}}),f=!0,g||(ft=1,tt=(function(){var x=Yt(65548),k=x+12;if((w(),K)[x>>>2>>>0]=k,(w(),K)[x+4>>>2>>>0]=k+65536,k=Tr[0],!di.has(k)){var z=Pm++;di.set(k,z),Qn.set(z,k)}return k=di.get(k),(w(),O)[x+8>>>2>>>0]=k,x})(),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.pause(),Sr(()=>lo(tt)))}else ft===2?(ft=0,Sr(ho),rt(tt),tt=null,Um.forEach(vr)):q(`invalid state: ${ft}`);return Zn}})(p=>{u().then(p)});function Lm(u){return u>>>=0,Jn(async()=>{var p=await We(u);return He(p)})}var ci=[],qm=u=>{var p=ci.length;return ci.push(u),p},Wm=(u,p)=>{for(var g=Array(u),f=0;f<u;++f){var x=f,k=(w(),K)[p+4*f>>>2>>>0],z=ni[k];if(z===void 0)throw u=`parameter ${f}`,k=gs(k),p=et(k),rt(k),new Wt(`${u} has unknown type ${p}`);g[x]=z}return g},Vm=(u,p,g)=>{var f=[];return u=u(f,g),f.length&&((w(),K)[p>>>2>>>0]=He(f)),u},Gm={},Ir=u=>{var p=Gm[u];return p===void 0?et(u):p};function Hm(u,p,g){var[f,...x]=Wm(u,p>>>0);p=f.Vc.bind(f);var k=x.map(W=>W.Uc.bind(W));u--;var z={toValue:We};switch(u=k.map((W,j)=>{var ne=`argFromPtr${j}`;return z[ne]=W,`${ne}(args${j?"+"+8*j:""})`}),g){case 0:var D="toValue(handle)";break;case 2:D="new (toValue(handle))";break;case 3:D="";break;case 1:z.getStringOrSymbol=Ir,D="toValue(handle)[getStringOrSymbol(methodName)]"}return D+=`(${u})`,f.zd||(z.toReturnWire=p,z.emval_returnValue=Vm,D=`return emval_returnValue(toReturnWire, destructorsRef, ${D})`),D=`return function (handle, methodName, destructorsRef, args) {
  ${D}
  }`,g=new Function(Object.keys(z),D)(...Object.values(z)),D=`methodCaller<(${x.map(W=>W.name)}) => ${f.name}>`,qm(Object.defineProperty(g,"name",{value:D}))}function Fm(u,p){return p>>>=0,(u=We(u>>>0))==We(p)}function jm(u){return(u>>>=0)?(u=Ir(u),He(globalThis[u])):He(globalThis)}function Km(u){return u=Ir(u>>>0),He(t[u])}function Xm(u,p){return p>>>=0,u=We(u>>>0),p=We(p),He(u[p])}function Zm(u){9<(u>>>=0)&&(St[u+1]+=1)}function es(u,p,g,f,x){return ci[u>>>0](p>>>0,g>>>0,f>>>0,x>>>0)}function Qm(u,p,g,f,x){return es(u>>>0,p>>>0,g>>>0,f>>>0,x>>>0)}function Ym(){return He([])}function Jm(u){u=We(u>>>0);for(var p=Array(u.length),g=0;g<u.length;g++)p[g]=u[g];return He(p)}function eg(u){return He(Ir(u>>>0))}function tg(){return He({})}function rg(u){for(var p=We(u>>>=0);p.length;){var g=p.pop();p.pop()(g)}si(u)}function ig(u,p,g){p>>>=0,g>>>=0,u=We(u>>>0),p=We(p),g=We(g),u[p]=g}function ag(u,p){u=-9007199254740992>u||9007199254740992<u?NaN:Number(u),p>>>=0,u=new Date(1e3*u),(w(),O)[p>>>2>>>0]=u.getUTCSeconds(),(w(),O)[p+4>>>2>>>0]=u.getUTCMinutes(),(w(),O)[p+8>>>2>>>0]=u.getUTCHours(),(w(),O)[p+12>>>2>>>0]=u.getUTCDate(),(w(),O)[p+16>>>2>>>0]=u.getUTCMonth(),(w(),O)[p+20>>>2>>>0]=u.getUTCFullYear()-1900,(w(),O)[p+24>>>2>>>0]=u.getUTCDay(),u=(u.getTime()-Date.UTC(u.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(w(),O)[p+28>>>2>>>0]=u}var ts=u=>u%4==0&&(u%100!=0||u%400==0),rs=[0,31,60,91,121,152,182,213,244,274,305,335],is=[0,31,59,90,120,151,181,212,243,273,304,334];function ng(u,p){u=-9007199254740992>u||9007199254740992<u?NaN:Number(u),p>>>=0,u=new Date(1e3*u),(w(),O)[p>>>2>>>0]=u.getSeconds(),(w(),O)[p+4>>>2>>>0]=u.getMinutes(),(w(),O)[p+8>>>2>>>0]=u.getHours(),(w(),O)[p+12>>>2>>>0]=u.getDate(),(w(),O)[p+16>>>2>>>0]=u.getMonth(),(w(),O)[p+20>>>2>>>0]=u.getFullYear()-1900,(w(),O)[p+24>>>2>>>0]=u.getDay();var g=(ts(u.getFullYear())?rs:is)[u.getMonth()]+u.getDate()-1|0;(w(),O)[p+28>>>2>>>0]=g,(w(),O)[p+36>>>2>>>0]=-60*u.getTimezoneOffset(),g=new Date(u.getFullYear(),6,1).getTimezoneOffset();var f=new Date(u.getFullYear(),0,1).getTimezoneOffset();u=0|(g!=f&&u.getTimezoneOffset()==Math.min(f,g)),(w(),O)[p+32>>>2>>>0]=u}function sg(u){u>>>=0;var p=new Date((w(),O)[u+20>>>2>>>0]+1900,(w(),O)[u+16>>>2>>>0],(w(),O)[u+12>>>2>>>0],(w(),O)[u+8>>>2>>>0],(w(),O)[u+4>>>2>>>0],(w(),O)[u>>>2>>>0],0),g=(w(),O)[u+32>>>2>>>0],f=p.getTimezoneOffset(),x=new Date(p.getFullYear(),6,1).getTimezoneOffset(),k=new Date(p.getFullYear(),0,1).getTimezoneOffset(),z=Math.min(k,x);return 0>g?(w(),O)[u+32>>>2>>>0]=+(x!=k&&z==f):0<g!=(z==f)&&(x=Math.max(k,x),p.setTime(p.getTime()+6e4*((0<g?z:x)-f))),(w(),O)[u+24>>>2>>>0]=p.getDay(),g=(ts(p.getFullYear())?rs:is)[p.getMonth()]+p.getDate()-1|0,(w(),O)[u+28>>>2>>>0]=g,(w(),O)[u>>>2>>>0]=p.getSeconds(),(w(),O)[u+4>>>2>>>0]=p.getMinutes(),(w(),O)[u+8>>>2>>>0]=p.getHours(),(w(),O)[u+12>>>2>>>0]=p.getDate(),(w(),O)[u+16>>>2>>>0]=p.getMonth(),(w(),O)[u+20>>>2>>>0]=p.getYear(),u=p.getTime(),BigInt(isNaN(u)?-1:u/1e3)}function as(u,p,g,f,x,k,z){return a?re(16,1,u,p,g,f,x,k,z):-52}function ns(u,p,g,f,x,k){if(a)return re(17,1,u,p,g,f,x,k)}var Qt={},og=()=>performance.timeOrigin+performance.now();function ss(u,p){if(a)return re(18,1,u,p);if(Qt[u]&&(clearTimeout(Qt[u].id),delete Qt[u]),!p)return 0;var g=setTimeout(()=>{delete Qt[u],vr(()=>$s(u,performance.timeOrigin+performance.now()))},p);return Qt[u]={id:g,Yd:p},0}function ug(u,p,g,f){u>>>=0,p>>>=0,g>>>=0,f>>>=0;var x=new Date().getFullYear(),k=new Date(x,0,1).getTimezoneOffset();x=new Date(x,6,1).getTimezoneOffset();var z=Math.max(k,x);(w(),K)[u>>>2>>>0]=60*z,(w(),O)[p>>>2>>>0]=+(k!=x),u=(p=D=>{var W=Math.abs(D);return`UTC${0<=D?"-":"+"}${String(Math.floor(W/60)).padStart(2,"0")}${String(W%60).padStart(2,"0")}`})(k),p=p(x),x<k?(ht(u,g,17),ht(p,f,17)):(ht(u,f,17),ht(p,g,17))}var lg=()=>Date.now();function dg(u,p,g){return g>>>=0,0<=u&&3>=u?(u===0?u=Date.now():u=performance.timeOrigin+performance.now(),u=Math.round(1e6*u),(w(),he)[g>>>3>>>0]=BigInt(u),0):28}var hi=[],os=(u,p)=>{hi.length=0;for(var g;g=(w(),U)[u++>>>0];){var f=g!=105;p+=(f&=g!=112)&&p%8?4:0,hi.push(g==112?(w(),K)[p>>>2>>>0]:g==106?(w(),he)[p>>>3>>>0]:g==105?(w(),O)[p>>>2>>>0]:(w(),ee)[p>>>3>>>0]),p+=f?8:4}return hi};function pg(u,p,g){return u>>>=0,p=os(p>>>0,g>>>0),$i[u](...p)}function cg(u,p,g){return u>>>=0,p=os(p>>>0,g>>>0),$i[u](...p)}var hg=()=>{};function fg(u,p){return E(Ie(u>>>0,p>>>0))}var mg=()=>{throw we+=1,"unwind"};function gg(){return 4294901760}var yg=()=>navigator.hardwareConcurrency,Tt={},kr=u=>{var p;return(p=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(u))?+p[1]:(p=/:(\d+):\d+(?:\)|$)/.exec(u))?2147483648|+p[1]:0},us=u=>{for(var p of u)(u=kr(p))&&(Tt[u]=p)};function _g(){var u=Error().stack.toString().split(`
`);return u[0]=="Error"&&u.shift(),us(u),Tt.gd=kr(u[3]),Tt.Jd=u,Tt.gd}function Er(u){if(!(u=Tt[u>>>0]))return 0;var p;if(p=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(u))u=p[1];else if(p=/^\s+at (.*) \(.*\)$/.exec(u))u=p[1];else{if(!(p=/^(.+?)@/.exec(u)))return 0;u=p[1]}rt(Er.hd??0),p=$r(u)+1;var g=Yt(p);return g&&ht(u,g,p),Er.hd=g,Er.hd}function bg(u){u>>>=0;var p=(w(),U).length;if(u<=p||4294901760<u)return!1;for(var g=1;4>=g;g*=2){var f=p*(1+.2/g);f=Math.min(f,u+100663296);e:{f=(Math.min(4294901760,65536*Math.ceil(Math.max(u,f)/65536))-ct.buffer.byteLength+65535)/65536|0;try{ct.grow(f),H();var x=1;break e}catch{}x=void 0}if(x)return!0}return!1}function wg(u,p,g){if(u>>>=0,p>>>=0,Tt.gd==u)var f=Tt.Jd;else(f=Error().stack.toString().split(`
`))[0]=="Error"&&f.shift(),us(f);for(var x=3;f[x]&&kr(f[x])!=u;)++x;for(u=0;u<g&&f[u+x];++u)(w(),O)[p+4*u>>>2>>>0]=kr(f[u+x]);return u}var fi,mi={},ls=()=>{var f;if(!fi){var u,p={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(((f=globalThis.navigator)==null?void 0:f.language)??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(u in mi)mi[u]===void 0?delete p[u]:p[u]=mi[u];var g=[];for(u in p)g.push(`${u}=${p[u]}`);fi=g}return fi};function ds(u,p){if(a)return re(19,1,u,p);u>>>=0,p>>>=0;var g,f=0,x=0;for(g of ls()){var k=p+f;(w(),K)[u+x>>>2>>>0]=k,f+=ht(g,k,1/0)+1,x+=4}return 0}function ps(u,p){if(a)return re(20,1,u,p);u>>>=0,p>>>=0;var g=ls();for(var f of((w(),K)[u>>>2>>>0]=g.length,u=0,g))u+=$r(f)+1;return(w(),K)[p>>>2>>>0]=u,0}function cs(u){return a?re(21,1,u):52}function hs(u,p,g,f){return a?re(22,1,u,p,g,f):52}function fs(u,p,g,f){return a?re(23,1,u,p,g,f):70}var $g=[null,[],[]];function ms(u,p,g,f){if(a)return re(24,1,u,p,g,f);p>>>=0,g>>>=0,f>>>=0;for(var x=0,k=0;k<g;k++){var z=(w(),K)[p>>>2>>>0],D=(w(),K)[p+4>>>2>>>0];p+=8;for(var W=0;W<D;W++){var j=u,ne=(w(),U)[z+W>>>0],pe=$g[j];ne===0||ne===10?((j===1?T:E)(Rn(pe)),pe.length=0):pe.push(ne)}x+=D}return(w(),K)[f>>>2>>>0]=x,0}function vg(u){return u>>>0}a||(function(){for(var u=t.numThreads-1;u--;)In();Re.push(async()=>{var p=(async function(){if(!a)return Promise.all(pt.map(Tn))})();De++,await p,--De==0&&Be&&(p=Be,Be=null,p())})})(),a||(ct=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),H()),t.wasmBinary&&(m=t.wasmBinary),t.stackSave=()=>oe(),t.stackRestore=u=>se(u),t.stackAlloc=u=>_i(u),t.setValue=function(u,p,g="i8"){switch(g.endsWith("*")&&(g="*"),g){case"i1":case"i8":(w(),M)[u>>>0]=p;break;case"i16":(w(),G)[u>>>1>>>0]=p;break;case"i32":(w(),O)[u>>>2>>>0]=p;break;case"i64":(w(),he)[u>>>3>>>0]=BigInt(p);break;case"float":(w(),X)[u>>>2>>>0]=p;break;case"double":(w(),ee)[u>>>3>>>0]=p;break;case"*":(w(),K)[u>>>2>>>0]=p;break;default:q(`invalid type for setValue: ${g}`)}},t.getValue=function(u,p="i8"){switch(p.endsWith("*")&&(p="*"),p){case"i1":case"i8":return(w(),M)[u>>>0];case"i16":return(w(),G)[u>>>1>>>0];case"i32":return(w(),O)[u>>>2>>>0];case"i64":return(w(),he)[u>>>3>>>0];case"float":return(w(),X)[u>>>2>>>0];case"double":return(w(),ee)[u>>>3>>>0];case"*":return(w(),K)[u>>>2>>>0];default:q(`invalid type for getValue: ${p}`)}},t.UTF8ToString=Ie,t.stringToUTF8=ht,t.lengthBytesUTF8=$r;var gs,ys,Cr,rt,Yt,gi,_s,bs,ws,yi,$s,vs,le,Jt,xs,se,_i,oe,Ss,bi,Ts,Is,ks,wi,Es,Cs,zs,As,Os,Rs,Bs,Ms,Ds,Ns,Ps,Us,Ls,qs,Ws,Vs,Gs,Hs,Fs,js,Ks,Xs,Zs,Qs,Ys,Js,eo,to,ro,io,ao,no,so,oo,uo,lo,po,co,ho,nt,xg=[Ne,_r,Cn,Bn,Mn,Dn,Nn,Pn,Un,Ln,qn,Wn,Vn,Gn,Hn,Fn,as,ns,ss,ds,ps,cs,hs,fs,ms],$i={973212:(u,p,g,f,x)=>{if(t===void 0||!t.Xc)return 1;if((u=Ie(Number(u>>>0))).startsWith("./")&&(u=u.substring(2)),!(u=t.Xc.get(u)))return 2;if(p=Number(p>>>0),g=Number(g>>>0),f=Number(f>>>0),p+g>u.byteLength)return 3;try{let k=u.subarray(p,p+g);switch(x){case 0:(w(),U).set(k,f>>>0);break;case 1:t.Qd?t.Qd(f,k):t.Id(f,k);break;default:return 4}return 0}catch{return 4}},974036:(u,p,g)=>{t.td(u,(w(),U).subarray(p>>>0,p+g>>>0))},974100:()=>t.Wd(),974142:u=>{t.sd(u)},974179:()=>{t.Bd()},974210:()=>{t.Cd()},974239:()=>{t.Gd()},974264:u=>t.Ad(u),974297:u=>t.Ed(u),974329:(u,p,g)=>{t.ed(Number(u),Number(p),Number(g),!0)},974392:(u,p,g)=>{t.ed(Number(u),Number(p),Number(g))},974449:()=>typeof wasmOffsetConverter<"u",974506:u=>{t.$b("Abs",u,void 0)},974557:u=>{t.$b("Neg",u,void 0)},974608:u=>{t.$b("Floor",u,void 0)},974661:u=>{t.$b("Ceil",u,void 0)},974713:u=>{t.$b("Reciprocal",u,void 0)},974771:u=>{t.$b("Sqrt",u,void 0)},974823:u=>{t.$b("Exp",u,void 0)},974874:u=>{t.$b("Erf",u,void 0)},974925:u=>{t.$b("Sigmoid",u,void 0)},974980:(u,p,g)=>{t.$b("HardSigmoid",u,{alpha:p,beta:g})},975059:u=>{t.$b("Log",u,void 0)},975110:u=>{t.$b("Sin",u,void 0)},975161:u=>{t.$b("Cos",u,void 0)},975212:u=>{t.$b("Tan",u,void 0)},975263:u=>{t.$b("Asin",u,void 0)},975315:u=>{t.$b("Acos",u,void 0)},975367:u=>{t.$b("Atan",u,void 0)},975419:u=>{t.$b("Sinh",u,void 0)},975471:u=>{t.$b("Cosh",u,void 0)},975523:u=>{t.$b("Asinh",u,void 0)},975576:u=>{t.$b("Acosh",u,void 0)},975629:u=>{t.$b("Atanh",u,void 0)},975682:u=>{t.$b("Tanh",u,void 0)},975734:u=>{t.$b("Not",u,void 0)},975785:(u,p,g)=>{t.$b("Clip",u,{min:p,max:g})},975854:u=>{t.$b("Clip",u,void 0)},975906:(u,p)=>{t.$b("Elu",u,{alpha:p})},975964:u=>{t.$b("Gelu",u,void 0)},976016:u=>{t.$b("Relu",u,void 0)},976068:(u,p)=>{t.$b("LeakyRelu",u,{alpha:p})},976132:(u,p)=>{t.$b("ThresholdedRelu",u,{alpha:p})},976202:(u,p)=>{t.$b("Cast",u,{to:p})},976260:u=>{t.$b("Add",u,void 0)},976311:u=>{t.$b("Sub",u,void 0)},976362:u=>{t.$b("Mul",u,void 0)},976413:u=>{t.$b("Div",u,void 0)},976464:u=>{t.$b("Pow",u,void 0)},976515:u=>{t.$b("Equal",u,void 0)},976568:u=>{t.$b("Greater",u,void 0)},976623:u=>{t.$b("GreaterOrEqual",u,void 0)},976685:u=>{t.$b("Less",u,void 0)},976737:u=>{t.$b("LessOrEqual",u,void 0)},976796:(u,p,g,f,x)=>{t.$b("ReduceMean",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},976971:(u,p,g,f,x)=>{t.$b("ReduceMax",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},977145:(u,p,g,f,x)=>{t.$b("ReduceMin",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},977319:(u,p,g,f,x)=>{t.$b("ReduceProd",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},977494:(u,p,g,f,x)=>{t.$b("ReduceSum",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},977668:(u,p,g,f,x)=>{t.$b("ReduceL1",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},977841:(u,p,g,f,x)=>{t.$b("ReduceL2",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},978014:(u,p,g,f,x)=>{t.$b("ReduceLogSum",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},978191:(u,p,g,f,x)=>{t.$b("ReduceSumSquare",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},978371:(u,p,g,f,x)=>{t.$b("ReduceLogSumExp",u,{keepDims:!!p,noopWithEmptyAxes:!!g,axes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},978551:u=>{t.$b("Where",u,void 0)},978604:(u,p,g)=>{t.$b("Transpose",u,{perm:p?Array.from((w(),O).subarray(Number(p)>>>0,Number(g)>>>0)):[]})},978728:(u,p,g,f)=>{t.$b("DepthToSpace",u,{blocksize:p,mode:Ie(g),format:f?"NHWC":"NCHW"})},978861:(u,p,g,f)=>{t.$b("DepthToSpace",u,{blocksize:p,mode:Ie(g),format:f?"NHWC":"NCHW"})},978994:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e,mt)=>{t.$b("ConvTranspose",u,{format:W?"NHWC":"NCHW",autoPad:p,dilations:[g],group:f,kernelShape:[x],pads:[k,z],strides:[D],wIsConst:()=>!!(w(),M)[j>>>0],outputPadding:ne?Array.from((w(),O).subarray(Number(ne)>>>0,Number(pe)>>>0)):[],outputShape:ye?Array.from((w(),O).subarray(Number(ye)>>>0,Number($e)>>>0)):[],activation:Ie(mt)})},979427:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e)=>{t.$b("ConvTranspose",u,{format:D?"NHWC":"NCHW",autoPad:p,dilations:Array.from((w(),O).subarray(Number(g)>>>0,2+(Number(g)>>>0)>>>0)),group:f,kernelShape:Array.from((w(),O).subarray(Number(x)>>>0,2+(Number(x)>>>0)>>>0)),pads:Array.from((w(),O).subarray(Number(k)>>>0,4+(Number(k)>>>0)>>>0)),strides:Array.from((w(),O).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(w(),M)[W>>>0],outputPadding:j?Array.from((w(),O).subarray(Number(j)>>>0,Number(ne)>>>0)):[],outputShape:pe?Array.from((w(),O).subarray(Number(pe)>>>0,Number(ye)>>>0)):[],activation:Ie($e)})},980088:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e,mt)=>{t.$b("ConvTranspose",u,{format:W?"NHWC":"NCHW",autoPad:p,dilations:[g],group:f,kernelShape:[x],pads:[k,z],strides:[D],wIsConst:()=>!!(w(),M)[j>>>0],outputPadding:ne?Array.from((w(),O).subarray(Number(ne)>>>0,Number(pe)>>>0)):[],outputShape:ye?Array.from((w(),O).subarray(Number(ye)>>>0,Number($e)>>>0)):[],activation:Ie(mt)})},980521:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e)=>{t.$b("ConvTranspose",u,{format:D?"NHWC":"NCHW",autoPad:p,dilations:Array.from((w(),O).subarray(Number(g)>>>0,2+(Number(g)>>>0)>>>0)),group:f,kernelShape:Array.from((w(),O).subarray(Number(x)>>>0,2+(Number(x)>>>0)>>>0)),pads:Array.from((w(),O).subarray(Number(k)>>>0,4+(Number(k)>>>0)>>>0)),strides:Array.from((w(),O).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(w(),M)[W>>>0],outputPadding:j?Array.from((w(),O).subarray(Number(j)>>>0,Number(ne)>>>0)):[],outputShape:pe?Array.from((w(),O).subarray(Number(pe)>>>0,Number(ye)>>>0)):[],activation:Ie($e)})},981182:(u,p)=>{t.$b("GlobalAveragePool",u,{format:p?"NHWC":"NCHW"})},981273:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e)=>{t.$b("AveragePool",u,{format:$e?"NHWC":"NCHW",auto_pad:p,ceil_mode:g,count_include_pad:f,storage_order:x,dilations:k?Array.from((w(),O).subarray(Number(k)>>>0,Number(z)>>>0)):[],kernel_shape:D?Array.from((w(),O).subarray(Number(D)>>>0,Number(W)>>>0)):[],pads:j?Array.from((w(),O).subarray(Number(j)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((w(),O).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},981752:(u,p)=>{t.$b("GlobalAveragePool",u,{format:p?"NHWC":"NCHW"})},981843:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e)=>{t.$b("AveragePool",u,{format:$e?"NHWC":"NCHW",auto_pad:p,ceil_mode:g,count_include_pad:f,storage_order:x,dilations:k?Array.from((w(),O).subarray(Number(k)>>>0,Number(z)>>>0)):[],kernel_shape:D?Array.from((w(),O).subarray(Number(D)>>>0,Number(W)>>>0)):[],pads:j?Array.from((w(),O).subarray(Number(j)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((w(),O).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},982322:(u,p)=>{t.$b("GlobalMaxPool",u,{format:p?"NHWC":"NCHW"})},982409:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e)=>{t.$b("MaxPool",u,{format:$e?"NHWC":"NCHW",auto_pad:p,ceil_mode:g,count_include_pad:f,storage_order:x,dilations:k?Array.from((w(),O).subarray(Number(k)>>>0,Number(z)>>>0)):[],kernel_shape:D?Array.from((w(),O).subarray(Number(D)>>>0,Number(W)>>>0)):[],pads:j?Array.from((w(),O).subarray(Number(j)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((w(),O).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},982884:(u,p)=>{t.$b("GlobalMaxPool",u,{format:p?"NHWC":"NCHW"})},982971:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e)=>{t.$b("MaxPool",u,{format:$e?"NHWC":"NCHW",auto_pad:p,ceil_mode:g,count_include_pad:f,storage_order:x,dilations:k?Array.from((w(),O).subarray(Number(k)>>>0,Number(z)>>>0)):[],kernel_shape:D?Array.from((w(),O).subarray(Number(D)>>>0,Number(W)>>>0)):[],pads:j?Array.from((w(),O).subarray(Number(j)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((w(),O).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},983446:(u,p,g,f,x)=>{t.$b("Gemm",u,{alpha:p,beta:g,transA:f,transB:x})},983550:u=>{t.$b("MatMul",u,void 0)},983604:(u,p,g,f)=>{t.$b("ArgMax",u,{keepDims:!!p,selectLastIndex:!!g,axis:f})},983712:(u,p,g,f)=>{t.$b("ArgMin",u,{keepDims:!!p,selectLastIndex:!!g,axis:f})},983820:(u,p)=>{t.$b("Softmax",u,{axis:p})},983883:(u,p)=>{t.$b("Concat",u,{axis:p})},983943:(u,p,g,f,x)=>{t.$b("Split",u,{axis:p,numOutputs:g,splitSizes:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},984099:u=>{t.$b("Expand",u,void 0)},984153:(u,p)=>{t.$b("Gather",u,{axis:Number(p)})},984224:(u,p)=>{t.$b("GatherElements",u,{axis:Number(p)})},984303:(u,p)=>{t.$b("GatherND",u,{batch_dims:Number(p)})},984382:(u,p,g,f,x,k,z,D,W,j,ne)=>{t.$b("Resize",u,{antialias:p,axes:g?Array.from((w(),O).subarray(Number(g)>>>0,Number(f)>>>0)):[],coordinateTransformMode:Ie(x),cubicCoeffA:k,excludeOutside:z,extrapolationValue:D,keepAspectRatioPolicy:Ie(W),mode:Ie(j),nearestMode:Ie(ne)})},984744:(u,p,g,f,x,k,z)=>{t.$b("Slice",u,{starts:p?Array.from((w(),O).subarray(Number(p)>>>0,Number(g)>>>0)):[],ends:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[],axes:k?Array.from((w(),O).subarray(Number(k)>>>0,Number(z)>>>0)):[]})},985008:u=>{t.$b("Tile",u,void 0)},985060:(u,p,g)=>{t.$b("InstanceNormalization",u,{epsilon:p,format:g?"NHWC":"NCHW"})},985174:(u,p,g)=>{t.$b("InstanceNormalization",u,{epsilon:p,format:g?"NHWC":"NCHW"})},985288:u=>{t.$b("Range",u,void 0)},985341:(u,p)=>{t.$b("Einsum",u,{equation:Ie(p)})},985422:(u,p,g,f,x)=>{t.$b("Pad",u,{mode:p,value:g,pads:f?Array.from((w(),O).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},985565:(u,p,g,f,x,k)=>{t.$b("BatchNormalization",u,{epsilon:p,momentum:g,spatial:!!x,trainingMode:!!f,format:k?"NHWC":"NCHW"})},985734:(u,p,g,f,x,k)=>{t.$b("BatchNormalization",u,{epsilon:p,momentum:g,spatial:!!x,trainingMode:!!f,format:k?"NHWC":"NCHW"})},985903:(u,p,g)=>{t.$b("CumSum",u,{exclusive:Number(p),reverse:Number(g)})},986e3:(u,p,g)=>{t.$b("DequantizeLinear",u,{axis:p,blockSize:g})},986090:(u,p,g,f,x)=>{t.$b("GridSample",u,{align_corners:p,mode:Ie(g),padding_mode:Ie(f),format:x?"NHWC":"NCHW"})},986260:(u,p,g,f,x)=>{t.$b("GridSample",u,{align_corners:p,mode:Ie(g),padding_mode:Ie(f),format:x?"NHWC":"NCHW"})},986430:(u,p)=>{t.$b("ScatterND",u,{reduction:Ie(p)})},986515:(u,p,g,f,x,k,z,D,W)=>{t.$b("Attention",u,{numHeads:p,isUnidirectional:g,maskFilterValue:f,scale:x,doRotary:k,qkvHiddenSizes:z?Array.from((w(),O).subarray(Number(D)>>>0,Number(D)+z>>>0)):[],pastPresentShareBuffer:!!W})},986787:u=>{t.$b("BiasAdd",u,void 0)},986842:u=>{t.$b("BiasSplitGelu",u,void 0)},986903:u=>{t.$b("FastGelu",u,void 0)},986959:(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e,mt,vi)=>{t.$b("Conv",u,{format:pe?"NHWC":"NCHW",auto_pad:p,dilations:g?Array.from((w(),O).subarray(Number(g)>>>0,Number(f)>>>0)):[],group:x,kernel_shape:k?Array.from((w(),O).subarray(Number(k)>>>0,Number(z)>>>0)):[],pads:D?Array.from((w(),O).subarray(Number(D)>>>0,Number(W)>>>0)):[],strides:j?Array.from((w(),O).subarray(Number(j)>>>0,Number(ne)>>>0)):[],w_is_const:()=>!!(w(),M)[Number(ye)>>>0],activation:Ie($e),activation_params:mt?Array.from((w(),X).subarray(Number(mt)>>>0,Number(vi)>>>0)):[]})},987543:u=>{t.$b("Gelu",u,void 0)},987595:(u,p,g,f,x,k,z,D,W)=>{t.$b("GroupQueryAttention",u,{numHeads:p,kvNumHeads:g,scale:f,softcap:x,doRotary:k,rotaryInterleaved:z,smoothSoftmax:D,localWindowSize:W})},987812:(u,p,g,f)=>{t.$b("LayerNormalization",u,{axis:p,epsilon:g,simplified:!!f})},987923:(u,p,g,f)=>{t.$b("LayerNormalization",u,{axis:p,epsilon:g,simplified:!!f})},988034:(u,p,g,f,x,k)=>{t.$b("MatMulNBits",u,{k:p,n:g,accuracyLevel:f,bits:x,blockSize:k})},988161:(u,p,g,f,x,k)=>{t.$b("MultiHeadAttention",u,{numHeads:p,isUnidirectional:g,maskFilterValue:f,scale:x,doRotary:k})},988320:(u,p)=>{t.$b("QuickGelu",u,{alpha:p})},988384:(u,p,g,f,x)=>{t.$b("RotaryEmbedding",u,{interleaved:!!p,numHeads:g,rotaryEmbeddingDim:f,scale:x})},988523:(u,p,g)=>{t.$b("SkipLayerNormalization",u,{epsilon:p,simplified:!!g})},988625:(u,p,g)=>{t.$b("SkipLayerNormalization",u,{epsilon:p,simplified:!!g})},988727:(u,p,g,f)=>{t.$b("GatherBlockQuantized",u,{gatherAxis:p,quantizeAxis:g,blockSize:f})},988848:u=>{t.Fd(u)},988882:(u,p)=>t.Hd(Number(u),Number(p),t.Yc.Kd,t.Yc.errors)};function Sg(u,p,g){return Jn(async()=>{await t.Dd(Number(u),Number(p),Number(g))})}function Tg(){return typeof wasmOffsetConverter<"u"}function Ig(u,p,g,f){var x=oe();try{return Ms(u,p,g,f)}catch(k){if(se(x),k!==k+0)throw k;le(1,0)}}function kg(u,p,g){var f=oe();try{return As(u,p,g)}catch(x){if(se(f),x!==x+0)throw x;le(1,0)}}function Eg(u){var p=oe();try{Es(u)}catch(g){if(se(p),g!==g+0)throw g;le(1,0)}}function Cg(u,p){var g=oe();try{return wi(u,p)}catch(f){if(se(g),f!==f+0)throw f;le(1,0)}}function zg(u,p,g){var f=oe();try{ks(u,p,g)}catch(x){if(se(f),x!==x+0)throw x;le(1,0)}}function Ag(u,p){var g=oe();try{Ds(u,p)}catch(f){if(se(g),f!==f+0)throw f;le(1,0)}}function Og(u,p,g,f,x,k,z){var D=oe();try{return Rs(u,p,g,f,x,k,z)}catch(W){if(se(D),W!==W+0)throw W;le(1,0)}}function Rg(u,p,g,f,x,k){var z=oe();try{Cs(u,p,g,f,x,k)}catch(D){if(se(z),D!==D+0)throw D;le(1,0)}}function Bg(u,p,g,f){var x=oe();try{Bs(u,p,g,f)}catch(k){if(se(x),k!==k+0)throw k;le(1,0)}}function Mg(u,p,g,f,x){var k=oe();try{zs(u,p,g,f,x)}catch(z){if(se(k),z!==z+0)throw z;le(1,0)}}function Dg(u,p,g,f,x,k,z){var D=oe();try{Ps(u,p,g,f,x,k,z)}catch(W){if(se(D),W!==W+0)throw W;le(1,0)}}function Ng(u,p,g,f,x,k,z){var D=oe();try{Us(u,p,g,f,x,k,z)}catch(W){if(se(D),W!==W+0)throw W;le(1,0)}}function Pg(u,p,g,f,x,k,z,D){var W=oe();try{Vs(u,p,g,f,x,k,z,D)}catch(j){if(se(W),j!==j+0)throw j;le(1,0)}}function Ug(u,p,g,f,x){var k=oe();try{return Ns(u,p,g,f,x)}catch(z){if(se(k),z!==z+0)throw z;le(1,0)}}function Lg(u,p,g){var f=oe();try{return Gs(u,p,g)}catch(x){if(se(f),x!==x+0)throw x;le(1,0)}}function qg(u,p,g,f,x,k,z,D){var W=oe();try{Hs(u,p,g,f,x,k,z,D)}catch(j){if(se(W),j!==j+0)throw j;le(1,0)}}function Wg(u,p,g,f,x,k,z,D,W,j,ne,pe){var ye=oe();try{Ls(u,p,g,f,x,k,z,D,W,j,ne,pe)}catch($e){if(se(ye),$e!==$e+0)throw $e;le(1,0)}}function Vg(u,p,g,f,x,k){var z=oe();try{return qs(u,p,g,f,x,k)}catch(D){if(se(z),D!==D+0)throw D;le(1,0)}}function Gg(u,p,g){var f=oe();try{return Fs(u,p,g)}catch(x){if(se(f),x!==x+0)throw x;return le(1,0),0n}}function Hg(u,p,g,f,x,k,z,D,W){var j=oe();try{Os(u,p,g,f,x,k,z,D,W)}catch(ne){if(se(j),ne!==ne+0)throw ne;le(1,0)}}function Fg(u){var p=oe();try{return js(u)}catch(g){if(se(p),g!==g+0)throw g;le(1,0)}}function jg(u,p){var g=oe();try{return uo(u,p)}catch(f){if(se(g),f!==f+0)throw f;return le(1,0),0n}}function Kg(u){var p=oe();try{return Ks(u)}catch(g){if(se(p),g!==g+0)throw g;return le(1,0),0n}}function Xg(u,p,g,f){var x=oe();try{return eo(u,p,g,f)}catch(k){if(se(x),k!==k+0)throw k;le(1,0)}}function Zg(u,p,g,f,x){var k=oe();try{return to(u,p,g,f,x)}catch(z){if(se(k),z!==z+0)throw z;le(1,0)}}function Qg(u,p,g,f,x,k){var z=oe();try{return ro(u,p,g,f,x,k)}catch(D){if(se(z),D!==D+0)throw D;le(1,0)}}function Yg(u,p,g,f,x,k){var z=oe();try{return io(u,p,g,f,x,k)}catch(D){if(se(z),D!==D+0)throw D;le(1,0)}}function Jg(u,p,g,f,x,k,z,D){var W=oe();try{return Ws(u,p,g,f,x,k,z,D)}catch(j){if(se(W),j!==j+0)throw j;le(1,0)}}function ey(u,p,g,f,x){var k=oe();try{return ao(u,p,g,f,x)}catch(z){if(se(k),z!==z+0)throw z;return le(1,0),0n}}function ty(u,p,g,f){var x=oe();try{return no(u,p,g,f)}catch(k){if(se(x),k!==k+0)throw k;le(1,0)}}function ry(u,p,g,f){var x=oe();try{return so(u,p,g,f)}catch(k){if(se(x),k!==k+0)throw k;le(1,0)}}function iy(u,p,g,f,x,k,z,D,W,j,ne,pe){var ye=oe();try{return oo(u,p,g,f,x,k,z,D,W,j,ne,pe)}catch($e){if(se(ye),$e!==$e+0)throw $e;le(1,0)}}function ay(u,p,g,f,x,k,z,D,W,j,ne){var pe=oe();try{Ys(u,p,g,f,x,k,z,D,W,j,ne)}catch(ye){if(se(pe),ye!==ye+0)throw ye;le(1,0)}}function ny(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e,mt,vi){var ly=oe();try{Js(u,p,g,f,x,k,z,D,W,j,ne,pe,ye,$e,mt,vi)}catch(xi){if(se(ly),xi!==xi+0)throw xi;le(1,0)}}function sy(u,p,g){var f=oe();try{return Xs(u,p,g)}catch(x){if(se(f),x!==x+0)throw x;le(1,0)}}function oy(u,p,g){var f=oe();try{return Zs(u,p,g)}catch(x){if(se(f),x!==x+0)throw x;le(1,0)}}function uy(u,p,g,f){var x=oe();try{Qs(u,p,g,f)}catch(k){if(se(x),k!==k+0)throw k;le(1,0)}}function zr(){if(0<De)Be=zr;else if(a)b==null||b(t),Z();else{for(var u=Re;0<u.length;)u.shift()(t);0<De?Be=zr:(t.calledRun=!0,C||(Z(),b==null||b(t)))}}return a||(nt=await qe(),zr()),t.PTR_SIZE=4,L?t:new Promise((u,p)=>{b=u,S=p})}var Cp,xo,Uy=P(()=>{var e,t;Cp=vo,xo=(t=(e=globalThis.self)==null?void 0:e.name)==null?void 0:t.startsWith("em-pthread"),xo&&vo()}),zi,xa,So,Pe,zp,Rr,To,Io,Ai,ko,Oi,Ap,Ri,Op,ja=P(()=>{Fa(),zi=typeof location>"u"?void 0:location.origin,xa=import.meta.url>"file:"&&import.meta.url<"file;",So=()=>{{if(xa){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,zi).href}return import.meta.url}},Pe=So(),zp=()=>{if(Pe&&!Pe.startsWith("blob:"))return Pe.substring(0,Pe.lastIndexOf("/")+1)},Rr=(e,t)=>{try{let r=t??Pe;return(r?new URL(e,r):new URL(e)).origin===zi}catch{return!1}},To=(e,t)=>{let r=t??Pe;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Io=(e,t)=>`${t??"./"}${e}`,Ai=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},ko=async e=>(await import(e)).default,Oi=(Py(),mr(Ip)).default,Ap=async()=>{if(!Pe)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(Rr(Pe))return[void 0,Oi()];let e=await Ai(Pe);return[e,Oi(e)]},Ri=(Uy(),mr(Ep)).default,Op=async(e,t,r,i)=>{let a=Ri&&!(e||t);if(a)if(Pe)a=Rr(Pe)||i&&!r;else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,Ri];{let n="ort-wasm-simd-threaded.jsep.mjs",s=e??To(n,t),o=r&&s&&!Rr(s,t),l=o?await Ai(s):s??Io(n,t);return[o?l:void 0,await ko(l)]}}}),Bi,Br,tr,Mi,Eo,Co,zo,Ka,be,Ut=P(()=>{ja(),Br=!1,tr=!1,Mi=!1,Eo=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Co=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},zo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Ka=async e=>{if(Br)return Promise.resolve();if(tr)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Mi)throw new Error("previous call to 'initializeWebAssembly()' failed.");tr=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!zo())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Co())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=Eo();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,n=typeof a=="string"?a:void 0,s=a==null?void 0:a.mjs,o=(s==null?void 0:s.href)??s,l=a==null?void 0:a.wasm,d=(l==null?void 0:l.href)??l,h=e.wasmBinary,[c,m]=await Op(o,n,r>1,!!h||!!d),_=!1,y=[];if(t>0&&y.push(new Promise(b=>{setTimeout(()=>{_=!0,b()},t)})),y.push(new Promise((b,S)=>{let v={numThreads:r};if(h)v.wasmBinary=h,v.locateFile=$=>$;else if(d||n)v.locateFile=$=>d??n+$;else if(o&&o.indexOf("blob:")!==0)v.locateFile=$=>new URL($,o).href;else if(c){let $=zp();$&&(v.locateFile=I=>$+I)}m(v).then($=>{tr=!1,Br=!0,Bi=$,b(),c&&URL.revokeObjectURL(c)},$=>{tr=!1,Mi=!0,S($)})})),await Promise.race(y),_)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},be=()=>{if(Br&&Bi)return Bi;throw new Error("WebAssembly is not initialized yet.")}}),Qe,jr,ge,Xa=P(()=>{Ut(),Qe=(e,t)=>{let r=be(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},jr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,n])=>{let s=t?t+a:a;if(typeof n=="object")jr(n,s+".",r,i);else if(typeof n=="string"||typeof n=="number")i(s,n.toString());else if(typeof n=="boolean")i(s,n?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof n}`)})},ge=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let n=Number(t.getValue(a,i===4?"i32":"i64")),s=t.getValue(a+i,"*"),o=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${n}, ERROR_MESSAGE: ${o}`)}finally{t.stackRestore(r)}}}),Rp,Ly=P(()=>{Ut(),Xa(),Rp=e=>{let t=be(),r=0,i=[],a=e||{};try{if((e==null?void 0:e.logSeverityLevel)===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if((e==null?void 0:e.logVerbosityLevel)===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);(e==null?void 0:e.terminate)===void 0&&(a.terminate=!1);let n=0;return(e==null?void 0:e.tag)!==void 0&&(n=Qe(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,n),r===0&&ge("Can't create run options."),(e==null?void 0:e.extra)!==void 0&&jr(e.extra,"",new WeakSet,(s,o)=>{let l=Qe(s,i),d=Qe(o,i);t._OrtAddRunConfigEntry(r,l,d)!==0&&ge(`Can't set a run config entry: ${s} - ${o}.`)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(s=>t._free(s)),n}}}),Ao,Oo,Ro,It,Bo,Bp,qy=P(()=>{Ut(),Xa(),Ao=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},Oo=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},Ro=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},It=(e,t,r,i)=>{let a=Qe(t,i),n=Qe(r,i);be()._OrtAddSessionConfigEntry(e,a,n)!==0&&ge(`Can't set a session config entry: ${t} - ${r}.`)},Bo=async(e,t,r)=>{let i=t.executionProviders;for(let a of i){let n=typeof a=="string"?a:a.name,s=[];switch(n){case"webnn":if(n="WEBNN",It(e,"session.disable_quant_qdq","1",r),It(e,"session.disable_qdq_constant_folding","1",r),typeof a!="string"){let c=a==null?void 0:a.deviceType;c&&It(e,"deviceType",c,r)}break;case"webgpu":if(n="JS",typeof a!="string"){let c=a;if(c!=null&&c.preferredLayout){if(c.preferredLayout!=="NCHW"&&c.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${c.preferredLayout}`);It(e,"preferredLayout",c.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${n}`)}let o=Qe(n,r),l=s.length,d=0,h=0;if(l>0){d=be()._malloc(l*be().PTR_SIZE),r.push(d),h=be()._malloc(l*be().PTR_SIZE),r.push(h);for(let c=0;c<l;c++)be().setValue(d+c*be().PTR_SIZE,s[c][0],"*"),be().setValue(h+c*be().PTR_SIZE,s[c][1],"*")}await be()._OrtAppendExecutionProvider(e,o,d,h,l)!==0&&ge(`Can't append execution provider: ${n}.`)}},Bp=async e=>{let t=be(),r=0,i=[],a=e||{};Ro(a);try{let n=Ao(a.graphOptimizationLevel??"all"),s=Oo(a.executionMode??"sequential"),o=typeof a.logId=="string"?Qe(a.logId,i):0,l=a.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log severity level is not valid: ${l}`);let d=a.logVerbosityLevel??0;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log verbosity level is not valid: ${d}`);let h=typeof a.optimizedModelFilePath=="string"?Qe(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(n,!!a.enableCpuMemArena,!!a.enableMemPattern,s,!!a.enableProfiling,0,o,l,d,h),r===0&&ge("Can't create session options."),a.executionProviders&&await Bo(r,a,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);It(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[c,m]of Object.entries(a.freeDimensionOverrides)){if(typeof c!="string")throw new Error(`free dimension override name must be a string: ${c}`);if(typeof m!="number"||!Number.isInteger(m)||m<0)throw new Error(`free dimension override value must be a non-negative integer: ${m}`);let _=Qe(c,i);t._OrtAddFreeDimensionOverride(r,_,m)!==0&&ge(`Can't set a free dimension override: ${c} - ${m}.`)}return a.extra!==void 0&&jr(a.extra,"",new WeakSet,(c,m)=>{It(r,c,m,i)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&ge("Can't release session options."),i.forEach(s=>t._free(s)),n}}}),Ot,ut,Rt,ti,Kr,Za,Qa,Sa,te=P(()=>{Ot=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},ut=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},Rt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,n)=>a*n,1);return r>0?Math.ceil(i*r):void 0},ti=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Kr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Za=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Qa=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Sa=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Ya,Mp=P(()=>{Fa(),Ya=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),n;try{n=new ArrayBuffer(i)}catch(o){if(o instanceof RangeError){let l=Math.ceil(i/65536);n=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw o}let s=0;for(;;){let{done:o,value:l}=await a.read();if(o)break;let d=l.byteLength;new Uint8Array(n,s,d).set(l),s+=d}return new Uint8Array(n,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),Mo,Do,No,Po,Ja,Uo,de,lt=P(()=>{te(),Mo=["V","I","W","E","F"],Do=(e,t)=>{console.log(`[${Mo[e]},${new Date().toISOString()}]${t}`)},Ja=(e,t)=>{No=e,Po=t},Uo=(e,t)=>{let r=Kr(e),i=Kr(No);r>=i&&Do(r,typeof t=="function"?t():t)},de=(...e)=>{Po&&Uo(...e)}}),Lo,Ft,B,Xr,Dp,Np,Pp,ie=P(()=>{Lo=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Ft=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let n=Math.max(e.length,t.length),s=new Array(n);if(r){if(i<2||a<2)return;let o=Lo.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(o===void 0)return;[s[n-2],s[n-1]]=o}for(let o=r?3:1;o<=n;o++){let l=i-o<0?1:e[i-o],d=a-o<0?1:t[a-o];if(l!==d&&l>1&&d>1)return;let h=Math.max(l,d);if(l&&d)s[n-o]=Math.max(l,d);else{if(h>1)return;s[n-o]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},B=class Hr{static size(t){return Hr.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),n=i-1;for(;n>=0;){if(t[n]%r===0){a[n]=t[n]/r;break}if(r%t[n]!==0)throw new Error("cannot convert shape");a[n]=1,r/=t[n],n--}for(n--;n>=0;n--)a[n]=t[n];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Hr.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Hr.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let n=r;n<i;n++){if(t[n]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[n])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,n)=>a+r[n]+r[n+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Xr=class pr{static adjustPoolAttributes(t,r,i,a,n,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let o=0;o<r.length-2;o++)o>=i.length?i.push(r[o+2]):i[o]=r[o+2];for(let o=0;o<i.length;o++)if(o<a.length){if(a[o]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let o=0;o<i.length;o++)if(o<n.length){if(n[o]<0)throw new Error("dilations should be greater than or equal to 1")}else n.push(1);for(let o=0;o<i.length*2;o++)if(o<s.length){if(s[o]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let o=0;o<i.length;o++){if(i[o]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[o]>=i[o]||s[o+i.length]>=i[o])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,n,s,o){if(o){if(n.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)pr.adjustPadAndReturnShape(t[l+(s?1:2)],r[l],i[l],a[l],n,l,l+t.length-2,o)}}static computePoolOutputShape(t,r,i,a,n,s,o){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let l=[r[0],r[1]];return pr.computeShapeHelper(t,r,l,i,a,n,s,o),l}static computeConvOutputShape(t,r,i,a,n,s,o){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return pr.computeShapeHelper(!1,t,l,i,a,n,s,o),l}static computeShapeHelper(t,r,i,a,n,s,o,l){if(t)for(let d=0;d<r.length-2;d++)i.push(1);else for(let d=0;d<r.length-2;d++)i.push(pr.adjustPadAndReturnShape(r[d+2],a[d],n[d],s[d],o,d,d+r.length-2,l))}static adjustPadAndReturnShape(t,r,i,a,n,s,o,l){let d=i*(a-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return n[s]=0,n[o]=0,Math.floor((t-d)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let h=((t+r-1)/r-1)*r+a-t;return n[s]=Math.floor(l==="SAME_LOWER"?(h+1)/2:h/2),n[o]=h-n[s],Math.floor((t+h-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+n[s]+n[o]-d)/r+1)}},Dp=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let n,s,o;t?(n=e[1],s=e[0]):(n=e[0],s=e[1]);let l=-1;if(i?(o=r[0],l=1):(o=r[1],l=0),r[l]!==s)throw new Error("dimension mismatch");if(n<=0||o<=0||s<=0)throw new Error("invalid shape specified");if(a&&!Ft.isValidBroadcast(a,[n,o]))throw new Error("gemm: invalid bias shape for broadcast");return[n,o,s]}},Np=-34028234663852886e22,Pp=34028234663852886e22}),en,Up=P(()=>{te(),en=(e,t)=>new(ti(t))(e)}),Di,Ta,Ni,qo,Pi,Wo,Ui,Li,qi,Vo,Lp,Wy=P(()=>{te(),lt(),Di=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),Ta=(e,t)=>{if(t==="int32")return e;let r=Di.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,n=new(ti(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let s=new Int32Array(a);for(let o=0;o<a;o++){let l=n[o];if(l>2147483647n||l<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[o]=Number(l)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&n.some(o=>o>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(n,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Ni=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(n=>n<-128||n>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},qo=1,Pi=()=>qo++,Wo=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Ui=(e,t)=>{let r=Di.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},Li=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:n,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=n,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Ui(this.dataType,this.tensorShape)}destroy(){de("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Ni(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},qi=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),n=this.tensorManager.getMLOpSupportLimits(e),s;if(!(n!=null&&n.input.dataTypes.includes(t))){if(s=Wo.get(t),!s||(n==null?void 0:n.input.dataTypes.includes(s)))throw new Error(`WebNN backend does not support data type: ${t}`);de("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Ui(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let o=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,o,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=Ta(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else de("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){var t,r;if(this.activeUpload){let i=(t=this.wrapper)!=null&&t.isDataConverted?Ni(this.activeUpload,(r=this.wrapper)==null?void 0:r.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(i):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(i);return}else return i.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},Vo=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Pi();return this.tensorTrackersById.set(e,new qi(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){de("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let n=this.tensorTrackersById.get(t);if(!n)throw new Error("Tensor not found.");return n.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){de("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t==null?void 0:t.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),n=Pi(),s=new Li({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(n,new qi(this,s)),this.externalTensors.add(s),n}async getCachedTensor(e,t,r,i,a,n,s){let o=this.getMLContext(e);for(let[d,h]of this.freeTensors.entries())if(h.canReuseTensor(o,t,r)){de("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let c=this.freeTensors.splice(d,1)[0];return c.sessionId=e,c}de("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let l=await o.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:a,readable:n});return new Li({sessionId:e,context:o,tensor:l,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},Lp=(...e)=>new Vo(...e)}),rr,Go,qp,Vy=P(()=>{te(),Ut(),Up(),Wy(),lt(),rr=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Go=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,n)=>a===i[n]&&e[a]===t[a])},qp=class{constructor(e){this.tensorManager=Lp(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,Ja(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){de("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){de("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)de("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>Go(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){de("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let n=rr.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,n,i,a)}async createTemporaryTensor(e,t,r){de("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=rr.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let n=this.temporarySessionTensorIds.get(e);return n?n.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!be().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");de("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return en(r,t)}}registerMLTensor(e,t,r,i){let a=rr.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let n=this.tensorManager.registerTensor(e,t,a,i);return de("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${n}}`),n}registerMLConstant(e,t,r,i,a,n,s=!1){if(!n)throw new Error("External mounted files are not available.");let o=e;e.startsWith("./")&&(o=e.substring(2));let l=n.get(o);if(!l)throw new Error(`File with name ${o} not found in preloaded files.`);if(t+r>l.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let d=l.slice(t,t+r).buffer,h;switch(a.dataType){case"float32":h=new Float32Array(d);break;case"float16":h=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(d):new Uint16Array(d);break;case"int32":h=new Int32Array(d);break;case"uint32":h=new Uint32Array(d);break;case"int64":if(s){let c=Ta(new Uint8Array(d),"int64");h=new Int32Array(c.buffer),a.dataType="int32"}else h=new BigInt64Array(d);break;case"uint64":h=new BigUint64Array(d);break;case"int8":h=new Int8Array(d);break;case"int4":case"uint4":case"uint8":h=new Uint8Array(d);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return de("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${s?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,h)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=rr.get(Ot(t)),a=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!(a!=null&&a.input.dataTypes.includes(i)):!!(a!=null&&a.output.dataTypes.includes(i))}flush(){}}}),tn=P(()=>{}),Wi,Mr,Dr,Ho,Fo,Vi,Ia,jo,Wp,Gy=P(()=>{lt(),tn(),Wi=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Mr=[],Dr=e=>Math.ceil(Number(e)/16)*16,Ho=e=>{for(let t=0;t<Mr.length;t++){let r=Mr[t];if(e<=r)return r}return Math.ceil(e/16)*16},Fo=1,Vi=()=>Fo++,Ia=async(e,t,r,i)=>{let a=Dr(r),n=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,n,0,a),e.flush(),await n.mapAsync(GPUMapMode.READ);let o=n.getMappedRange();if(i){let l=i();return l.set(new Uint8Array(o,0,r)),l}else return new Uint8Array(o.slice(0,r))}finally{n.destroy()}},jo=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Wi)Mr.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,n=Dr(a),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${a}`);let o=this.backend.device.createBuffer({mappedAtCreation:!0,size:n,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),l=o.getMappedRange();new Uint8Array(l).set(new Uint8Array(r,i,a)),o.unmap();let d=this.backend.device.createCommandEncoder();d.copyBufferToBuffer(o,0,s.gpuData.buffer,0,n),this.backend.device.queue.submit([d.finish()]),o.destroy(),de("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Dr(r.originalSize),n=this.backend.getCommandEncoder();this.backend.endComputePass(),n.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return de("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Vi();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),de("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),de("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=Ho(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,n=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||n){let o=(a?this.freeBuffers:this.freeUniformBuffers).get(r);o?o.length>0?i=o.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Vi(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),de("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){var t;return(t=this.storageCache.get(e))==null?void 0:t.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return de("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await Ia(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Wi.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(de("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},Wp=(...e)=>new jo(...e)}),Ko,fe,Se=P(()=>{Ko=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},fe=e=>new Ko(e)}),jt,Nr,ke,ze,J,xe,ka,Ht,$t,Y,ir,N,Q,Vp,rn,Xo,Gp,ae=P(()=>{te(),ie(),jt=64,Nr=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},ke=(e,t=1)=>{let r=Nr(e,t);return typeof r=="string"?r:r[0]},ze=(e,t=1)=>{let r=Nr(e,t);return typeof r=="string"?r:r[1]},J=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:B.computeStrides(r)})}),t},xe=e=>e%4===0?4:e%2===0?2:1,ka=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,Ht=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,$t=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Y=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,ir=(e,t,r,i,a)=>{let n=typeof r=="number",s=n?r:r.length,o=[...new Array(s).keys()],l=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,d=Nr(t,a),h=typeof d=="string"?d:d[1],c=typeof d=="string"?d:d[0],m={indices:l,value:h,storage:c,tensor:t},_=L=>typeof L=="string"?L:`${L}u`,y={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},b=n?"uniforms.":"",S=`${b}${e}_shape`,v=`${b}${e}_strides`,$="";for(let L=0;L<s-1;L++)$+=`
    let dim${L} = current / ${Y(v,L,s)};
    let rest${L} = current % ${Y(v,L,s)};
    indices[${L}] = dim${L};
    current = rest${L};
    `;$+=`indices[${s-1}] = current;`;let I=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${m.indices} {
    var indices: ${m.indices};
    var current = offset;
    ${$}
    return indices;
  }`,T=L=>(y.offsetToIndices=!0,s<2?L:`o2i_${e}(${L})`),E=[];if(s>=2)for(let L=s-1;L>=0;L--)E.push(`${Y(v,L,s)} * (indices[${L}])`);let C=s<2?"":`
  fn i2o_${e}(indices: ${m.indices}) -> u32 {
    return ${E.join("+")};
  }`,A=L=>(y.indicesToOffset=!0,s<2?L:`i2o_${e}(${L})`),w=(...L)=>s===0?"0u":`${m.indices}(${L.map(_).join(",")})`,R=(L,H)=>s<2?`${L}`:`${Y(L,H,s)}`,M=(L,H,Z)=>s<2?`${L}=${Z};`:`${Y(L,H,s)}=${Z};`,U={},G=(L,H)=>{y.broadcastedIndicesToOffset=!0;let Z=`${H.name}broadcastedIndicesTo${e}Offset`;if(Z in U)return`${Z}(${L})`;let q=[];for(let me=s-1;me>=0;me--){let qe=H.indicesGet("outputIndices",me+H.rank-s);q.push(`${R(v,me)} * (${qe} % ${R(S,me)})`)}return U[Z]=`fn ${Z}(outputIndices: ${H.type.indices}) -> u32 {
             return ${q.length>0?q.join("+"):"0u"};
           }`,`${Z}(${L})`},F=(L,H)=>(()=>{if(m.storage===m.value)return`${e}[${L}]=${H};`;if(m.storage==="vec2<u32>"&&m.value==="i32")return`${e}[${L}]=vec2<u32>(u32(${H}), select(0u, 0xFFFFFFFFu, ${H} < 0));`;if(m.storage==="vec2<u32>"&&m.value==="u32")return`${e}[${L}]=vec2<u32>(u32(${H}), 0u);`;if(m.storage==="u32"&&m.value==="vec4<bool>")return`${e}[${L}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${H}));`;throw new Error(`not supported combination of storage type ${m.storage} and value type ${m.value} yet`)})(),O=L=>(()=>{if(m.storage===m.value)return`${e}[${L}]`;if(m.storage==="vec2<u32>"&&m.value==="i32")return`i32(${e}[${L}].x)`;if(m.storage==="vec2<u32>"&&m.value==="u32")return`u32(${e}[${L}].x)`;if(m.storage==="u32"&&m.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${L}] & 0xFFu), bool(${e}[${L}] & 0xFF00u), bool(${e}[${L}] & 0xFF0000u), bool(${e}[${L}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${m.storage} and value type ${m.value} yet`)})(),K=s<2?"":`
  fn get_${e}ByIndices(indices: ${m.indices}) -> ${h} {
    return ${O(`i2o_${e}(indices)`)};
  }`,X=s<2?"":(()=>{let L=o.map(Z=>`d${Z}: u32`).join(", "),H=o.map(Z=>`d${Z}`).join(", ");return`
  fn get_${e}(${L}) -> ${h} {
    return get_${e}ByIndices(${w(H)});
  }`})(),ee=(...L)=>{if(L.length!==s)throw new Error(`indices length must be ${s}`);let H=L.map(_).join(",");return s===0?O("0u"):s===1?O(H[0]):(y.get=!0,y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}(${H})`)},he=L=>s<2?O(L):(y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}ByIndices(${L})`),V=s<2?"":`
  fn set_${e}ByIndices(indices: ${m.indices}, value: ${h}) {
    ${F(`i2o_${e}(indices)`,"value")}
  }`,ue=s<2?"":(()=>{let L=o.map(Z=>`d${Z}: u32`).join(", "),H=o.map(Z=>`d${Z}`).join(", ");return`
  fn set_${e}(${L}, value: ${h}) {
    set_${e}ByIndices(${w(H)}, value);
  }`})();return{impl:()=>{let L=[],H=!1;return y.offsetToIndices&&(L.push(I),H=!0),y.indicesToOffset&&(L.push(C),H=!0),y.broadcastedIndicesToOffset&&(Object.values(U).forEach(Z=>L.push(Z)),H=!0),y.set&&(L.push(ue),H=!0),y.setByIndices&&(L.push(V),H=!0),y.get&&(L.push(X),H=!0),y.getByIndices&&(L.push(K),H=!0),!n&&H&&L.unshift(`const ${S} = ${m.indices}(${r.join(",")});`,`const ${v} = ${m.indices}(${B.computeStrides(r).join(",")});`),L.join(`
`)},type:m,offsetToIndices:T,indicesToOffset:A,broadcastedIndicesToOffset:G,indices:w,indicesGet:R,indicesSet:M,set:(...L)=>{if(L.length!==s+1)throw new Error(`indices length must be ${s}`);let H=L[s];if(typeof H!="string")throw new Error("value must be string");let Z=L.slice(0,s).map(_).join(",");return s===0?F("0u",H):s===1?F(Z[0],H):(y.set=!0,y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}(${Z}, ${H})`)},setByOffset:F,setByIndices:(L,H)=>s<2?F(L,H):(y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}ByIndices(${L}, ${H});`),get:ee,getByOffset:O,getByIndices:he,usage:i,name:e,strides:v,shape:S,rank:s}},N=(e,t,r,i=1)=>ir(e,t,r,"input",i),Q=(e,t,r,i=1)=>ir(e,t,r,"output",i),Vp=(e,t,r)=>ir(e,t,r,"atomicOutput",1),rn=(e,t,r,i=1)=>ir(e,t,r,"internal",i),Xo=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=jt){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,n=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${n}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},Gp=(e,t)=>new Xo(e,t)}),Zo,Gi,Qo,Yo,Jo,eu,Le,Hp,Fp,vt=P(()=>{te(),ie(),Se(),ae(),Zo=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Gi=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),Qo=(e,t)=>B.sortBasedOnPerm(e,Gi(e.length,t)),Yo=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let n=0;n<t;++n)a+=`a[${e[n]}]=i[${n}];`;return a+="return a;}"},Jo=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},eu=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Le=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Gi(i,t),n=Qo(e.dims,a),s=e.dims,o=n,l=i<2||eu(a,e.dims),d;if(l)return d=y=>{let b=N("input",r,s,4),S=Q("output",r,o,4);return`
  ${y.registerUniform("output_size","u32").declareVariables(b,S)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let y=B.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64/4)},programUniforms:[{type:12,data:Math.ceil(y/4)}]}},getShaderSource:d};let{newShape:h,newPerm:c}=Jo(e.dims,a),m=B.areEqual(c,[2,3,1]),_=B.areEqual(c,[3,1,2]);if(h.length===2||m||_){s=m?[h[0],h[1]*h[2]]:_?[h[0]*h[1],h[2]]:h,o=[s[1],s[0]];let y=16;return d=b=>{let S=N("a",r,s.length),v=Q("output",r,o.length);return`
  ${b.registerUniform("output_size","u32").declareVariables(S,v)}
  var<workgroup> tile : array<array<${v.type.value}, ${y+1}>, ${y}>;
  ${b.mainStart([y,y,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${y} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${y}u + local_id.x;
    let input_row = workgroup_id_x * ${y}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${S.getByIndices(`${S.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${y}u + local_id.x;
    let output_row = workgroup_id_y * ${y}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${v.setByIndices(`${v.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let b=B.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(o[1]/y),y:Math.ceil(o[0]/y)},programUniforms:[{type:12,data:b},...J(s,o)]}},getShaderSource:d}}return d=y=>{let b=N("a",r,s.length),S=Q("output",r,o.length);return`
  ${y.registerUniform("output_size","u32").declareVariables(b,S)}

  ${Yo(a,i,b,S)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${S.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${S.setByOffset("global_idx",b.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let y=B.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...J(s,o)]}},getShaderSource:d}},Hp=(e,t)=>{Zo(e.inputs,t.perm),e.compute(Le(e.inputs[0],t.perm))},Fp=e=>fe({perm:e.perm})}),tu,ru,iu,au,nu,su,ou,uu,lu,du,Fe,jp,Kp,Xp,Zp,Qp,Yp,Jp,ec,tc,rc,Hy=P(()=>{te(),ie(),ae(),an(),vt(),tu={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},ru={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},iu={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},au={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},nu=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},su=(e,t)=>{let r=[],i=e.length;for(let n=0;n<i;n++)t.indexOf(n)===-1&&r.push(e[n]);let a=t.map(n=>e[n]);return[r,a]},ou=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let n=0;n<r;n++)t.indexOf(n)===-1?i.push(e[a++]):i.push(1);return i},uu=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},lu=(e,t)=>{let r=[];if(!uu(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},du=(e,t,r,i,a,n,s)=>{let o=r[0].dims,l=B.size(n),d=B.size(s),h=N("_A",r[0].dataType,o),c=Q("output",a,n),m=64;l===1&&(m=256);let _=`
          var<workgroup> aBestValues : array<f32, ${m}>;
       `,y=b=>`
        ${b.registerUniform("reduceSize","u32").declareVariables(h,c)}
        ${_}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${b.mainStart(m)}

          let outputIndex = global_idx / ${m};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${iu[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${m}) {
           let candidate = f32(${h.getByOffset("offset + k")});
           bestValue = ${tu[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${m}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${ru[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${c.setByOffset("outputIndex",`${i==="mean"?`${c.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${c.type.storage}(${au[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${m}`,inputDependencies:["type"]},getShaderSource:y,getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:l},programUniforms:[{type:12,data:d}]})}},Fe=(e,t,r,i)=>{let a=e.inputs.length===1?r:Ea(e.inputs,r),n=a.axes;n.length===0&&!a.noopWithEmptyAxes&&(n=e.inputs[0].dims.map((_,y)=>y));let s=B.normalizeAxes(n,e.inputs[0].dims.length),o=s,l=e.inputs[0],d=lu(o,e.inputs[0].dims.length);d.length>0&&(l=e.compute(Le(e.inputs[0],d),{inputs:[0],outputs:[-1]})[0],o=nu(o.length,l.dims.length));let[h,c]=su(l.dims,o),m=h;a.keepDims&&(m=ou(h,s)),e.compute(du(t,a.cacheKey,[l],i,e.inputs[0].dataType,m,c),{inputs:[l]})},jp=(e,t)=>{Fe(e,"ReduceMeanShared",t,"mean")},Kp=(e,t)=>{Fe(e,"ReduceL1Shared",t,"l1")},Xp=(e,t)=>{Fe(e,"ReduceL2Shared",t,"l2")},Zp=(e,t)=>{Fe(e,"ReduceLogSumExpShared",t,"logSumExp")},Qp=(e,t)=>{Fe(e,"ReduceMaxShared",t,"max")},Yp=(e,t)=>{Fe(e,"ReduceMinShared",t,"min")},Jp=(e,t)=>{Fe(e,"ReduceProdShared",t,"prod")},ec=(e,t)=>{Fe(e,"ReduceSumShared",t,"sum")},tc=(e,t)=>{Fe(e,"ReduceSumSquareShared",t,"sumSquare")},rc=(e,t)=>{Fe(e,"ReduceLogSumShared",t,"logSum")}}),je,pu,Zr,Ea,Ke,cu,hu,fu,mu,gu,yu,_u,bu,wu,$u,Xe,ic,ac,nc,sc,oc,uc,lc,dc,pc,cc,an=P(()=>{te(),ie(),Se(),ae(),Hy(),je=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},pu=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Zr=(e,t,r,i,a,n,s=!1,o=!1)=>{let l=[],d=r[0].dims,h=d.length,c=B.normalizeAxes(a,h),m=!o&&c.length===0;d.forEach((b,S)=>{m||c.indexOf(S)>=0?s&&l.push(1):l.push(b)});let _=l.length,y=B.size(l);return{name:e,shaderCache:t,getShaderSource:b=>{let S=[],v=N("_A",r[0].dataType,h),$=Q("output",n,_),I=i(v,$,c),T=I[2];for(let E=0,C=0;E<h;E++)m||c.indexOf(E)>=0?(s&&C++,T=`for(var j${E}: u32 = 0; j${E} < ${d[E]}; j${E}++) {
                  ${I[2].includes("last_index")?`let last_index = j${E};`:""}
                  ${v.indicesSet("input_indices",E,`j${E}`)}
                  ${T}
                }`):(S.push(`${v.indicesSet("input_indices",E,$.indicesGet("output_indices",C))};`),C++);return`

        ${b.registerUniform("output_size","u32").declareVariables(v,$)}

        ${b.mainStart()}
          ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${v.type.indices};
          let output_indices = ${$.offsetToIndices("global_idx")};

          ${S.join(`
`)}
          ${I[0]}       // init ops for reduce max/min
          ${I[1]}
          ${T}
          ${I[3]}
          ${I.length===4?$.setByOffset("global_idx","value"):I.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:n}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...J(d,l)]})}},Ea=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),fe({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Ke=(e,t,r,i)=>{let a=e.inputs,n=a.length===1?r:Ea(a,r);e.compute(Zr(t,{hint:n.cacheKey,inputDependencies:["rank"]},[a[0]],n.noopWithEmptyAxes&&n.axes.length===0?pu:i,n.axes,a[0].dataType,n.keepDims,n.noopWithEmptyAxes),{inputs:[0]})},cu=(e,t)=>{je(e.inputs),Ke(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},hu=(e,t)=>{je(e.inputs),Ke(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},fu=(e,t)=>{je(e.inputs),Ke(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},mu=(e,t)=>{je(e.inputs),Ke(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},gu=(e,t)=>{je(e.inputs),Ke(e,"ReduceMax",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(r.indicesSet("input_indices",s,0));return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},yu=(e,t)=>{je(e.inputs),Ke(e,"ReduceMean",t,(r,i,a)=>{let n=1;for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&(n*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${n});`]})},_u=(e,t)=>{je(e.inputs),Ke(e,"ReduceMin",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(`input_indices[${s}] = 0;`);return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},bu=(e,t)=>{je(e.inputs),Ke(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},wu=(e,t)=>{je(e.inputs),Ke(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},$u=(e,t)=>{je(e.inputs),Ke(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Xe=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let n=0;n<t.length;n++)t.indexOf(n)===-1?i*=e[n]:a*=e[n];return a<32&&i>1024},ic=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?yu(e,t):jp(e,t)},ac=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?hu(e,t):Kp(e,t)},nc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?fu(e,t):Xp(e,t)},sc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?mu(e,t):Zp(e,t)},oc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?gu(e,t):Qp(e,t)},uc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?_u(e,t):Yp(e,t)},lc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?bu(e,t):Jp(e,t)},dc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?wu(e,t):ec(e,t)},pc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?$u(e,t):tc(e,t)},cc=(e,t)=>{Xe(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?cu(e,t):rc(e,t)}}),Hi,hc,fc,Ca,Fy=P(()=>{te(),Se(),an(),Hi=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},hc=(e,t)=>{Hi(e.inputs);let r=(i,a,n)=>{let s=[];for(let o=0;o<i.rank;o++)(n.indexOf(o)>=0||n.length===0)&&s.push(`input_indices[${o}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Zr("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},fc=(e,t)=>{Hi(e.inputs);let r=(i,a,n)=>{let s=[];for(let o=0;o<i.rank;o++)(n.indexOf(o)>=0||n.length===0)&&s.push(`input_indices[${o}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Zr("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Ca=e=>fe(e)}),vu,Pr,xu,Su,Tu,yr,Iu,mc,nn=P(()=>{te(),ie(),tn(),ae(),vu=(e,t)=>{let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4],o=e[5];if(s&&o)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let l=r.dims[0],d=r.dims[1],h=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==h)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let c=a.dims[0]/3,m=c,_=m;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let I of t.qkvHiddenSizes)if(I%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");c=t.qkvHiddenSizes[0],m=t.qkvHiddenSizes[1],_=t.qkvHiddenSizes[2]}let y=d;if(c!==m)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==c+m+_)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let b=0;if(s){if(m!==_)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==l)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==m/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(b=s.dims[3])}let S=y+b,v=-1,$=0;if(n)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(o){if(o.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(o.dims[0]!==l||o.dims[1]!==t.numHeads||o.dims[2]!==d||o.dims[3]!==S)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:d,pastSequenceLength:b,kvSequenceLength:y,totalSequenceLength:S,maxSequenceLength:v,inputHiddenSize:h,hiddenSize:c,vHiddenSize:_,headSize:Math.floor(c/t.numHeads),vHeadSize:Math.floor(_/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:$,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Pr=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e==null?void 0:e.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,xu=(e,t,r,i,a,n,s,o)=>{let l=xe(s?1:n),d=64,h=n/l;h<d&&(d=32);let c=Math.ceil(n/l/d),m=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:h},{type:12,data:c}],_=ke(e.dataType,l),y=ze(1,l),b=["type"];s&&b.push("type"),o&&b.push("type");let S=v=>{let $=Q("x",e.dataType,e.dims,l),I=[$],T=s?N("seq_lens",s.dataType,s.dims):void 0;T&&I.push(T);let E=o?N("total_sequence_length_input",o.dataType,o.dims):void 0;E&&I.push(E);let C=ze(e.dataType),A=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${d}>;
  var<workgroup> thread_sum: array<f32, ${d}>;
  ${v.registerUniforms(A).declareVariables(...I)}
  ${v.mainStart([d,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Pr(T,E,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${d}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${y}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${y}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${d}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${y}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${y}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${d}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${$.type.value}(${C}(1.0) / ${C}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${y}(x[offset + i]);
        x[offset + i] = ${$.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${$.type.value}(${C}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${d};${_};${l}`,inputDependencies:b},getShaderSource:S,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:m})}},Su=(e,t,r,i,a,n,s,o,l)=>{let d=s+n.kvSequenceLength,h=[n.batchSize,n.numHeads,n.sequenceLength,d],c=e>1&&i,m=n.kvNumHeads?n.kvNumHeads:n.numHeads,_=c?[n.batchSize,m,d,n.headSize]:void 0,y=n.nReps?n.nReps:1,b=n.scale===0?1/Math.sqrt(n.headSize):n.scale,S=xe(n.headSize),v=n.headSize/S,$=12,I={x:Math.ceil(d/$),y:Math.ceil(n.sequenceLength/$),z:n.batchSize*n.numHeads},T=[{type:12,data:n.sequenceLength},{type:12,data:v},{type:12,data:d},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:1,data:b},{type:12,data:s},{type:12,data:n.kvSequenceLength},{type:12,data:y}],E=c&&i&&B.size(i.dims)>0,C=["type","type"];E&&C.push("type"),a&&C.push("type"),o&&C.push("type"),l&&C.push("type");let A=[{dims:h,dataType:t.dataType,gpuDataType:0}];c&&A.push({dims:_,dataType:t.dataType,gpuDataType:0});let w=R=>{let M=N("q",t.dataType,t.dims,S),U=N("key",r.dataType,r.dims,S),G=[M,U];if(E){let V=N("past_key",i.dataType,i.dims,S);G.push(V)}a&&G.push(N("attention_bias",a.dataType,a.dims));let F=o?N("seq_lens",o.dataType,o.dims):void 0;F&&G.push(F);let O=l?N("total_sequence_length_input",l.dataType,l.dims):void 0;O&&G.push(O);let K=Q("output",t.dataType,h),X=[K];c&&X.push(Q("present_key",t.dataType,_,S));let ee=ze(1,S),he=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${$}u;

  var<workgroup> tileQ: array<${M.type.storage}, ${$*$}>;
  var<workgroup> tileK: array<${M.type.storage}, ${$*$}>;
  ${R.registerUniforms(he).declareVariables(...G,...X)}
  ${R.mainStart([$,$,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${y===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${y===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Pr(F,O,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E&&c?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${c?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${ee}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E&&c?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${c?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${ee}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(S){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${S}`)}})()};
        output[outputIdx] = ${K.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${S};${a!==void 0};${i!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:A,dispatchGroup:I,programUniforms:T}),getShaderSource:w}},Tu=(e,t,r,i,a,n,s=void 0,o=void 0)=>{let l=n+a.kvSequenceLength,d=a.nReps?a.nReps:1,h=a.vHiddenSize*d,c=e>1&&i,m=a.kvNumHeads?a.kvNumHeads:a.numHeads,_=c?[a.batchSize,m,l,a.headSize]:void 0,y=[a.batchSize,a.sequenceLength,h],b=12,S={x:Math.ceil(a.vHeadSize/b),y:Math.ceil(a.sequenceLength/b),z:a.batchSize*a.numHeads},v=[{type:12,data:a.sequenceLength},{type:12,data:l},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:h},{type:12,data:n},{type:12,data:a.kvSequenceLength},{type:12,data:d}],$=c&&i&&B.size(i.dims)>0,I=["type","type"];$&&I.push("type"),s&&I.push("type"),o&&I.push("type");let T=[{dims:y,dataType:t.dataType,gpuDataType:0}];c&&T.push({dims:_,dataType:t.dataType,gpuDataType:0});let E=C=>{let A=N("probs",t.dataType,t.dims),w=N("v",r.dataType,r.dims),R=[A,w];$&&R.push(N("past_value",i.dataType,i.dims));let M=s?N("seq_lens",s.dataType,s.dims):void 0;s&&R.push(M);let U=o?N("total_sequence_length_input",o.dataType,o.dims):void 0;o&&R.push(U);let G=[Q("output",t.dataType,y)];c&&G.push(Q("present_value",t.dataType,_));let F=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${b}u;
  var<workgroup> tileQ: array<${A.type.value}, ${b*b}>;
  var<workgroup> tileV: array<${A.type.value}, ${b*b}>;
  ${C.registerUniforms(F).declareVariables(...R,...G)}
  ${C.mainStart([b,b,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${d===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${d===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Pr(M,U,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${$&&c?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${c?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${A.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${$&&c?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${c?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:I},getRunData:()=>({outputs:T,dispatchGroup:S,programUniforms:v}),getShaderSource:E}},yr=(e,t,r,i,a,n,s,o,l,d,h=void 0,c=void 0)=>{let m=Math.min(e.outputCount,1+(s?1:0)+(o?1:0)),_=m>1?s:void 0,y=m>1?o:void 0,b=m>1?d.pastSequenceLength:0,S=b+d.kvSequenceLength,v=l&&B.size(l.dims)>0?l:void 0,$=[t,r];_&&B.size(_.dims)>0&&$.push(_),v&&$.push(v),h&&$.push(h),c&&$.push(c);let I=e.compute(Su(m,t,r,_,v,d,b,h,c),{inputs:$,outputs:m>1?[-1,1]:[-1]})[0];e.compute(xu(I,d.batchSize,d.numHeads,b,d.sequenceLength,S,h,c),{inputs:h&&c?[I,h,c]:[I],outputs:[]});let T=[I,i];y&&B.size(y.dims)>0&&T.push(y),h&&T.push(h),c&&T.push(c),e.compute(Tu(m,I,i,y,d,b,h,c),{inputs:T,outputs:m>1?[0,2]:[0]})},Iu=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,n=t.headSize,s=12,o={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],d=[{type:12,data:i},{type:12,data:a},{type:12,data:n},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],h=c=>{let m=Q("output_q",l[0].dataType,r),_=Q("output_k",l[0].dataType,r),y=Q("output_v",l[0].dataType,r),b=N("input",l[0].dataType,l[0].dims),S=N("weight",l[1].dataType,l[1].dims),v=N("bias",l[2].dataType,l[2].dims),$=b.type.storage,I=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${$}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${$}, ${s*s}>;
  var<workgroup> tileWeightK: array<${$}, ${s*s}>;
  var<workgroup> tileWeightV: array<${$}, ${s*s}>;
  ${c.registerUniforms(I).declareVariables(b,S,v,m,_,y)}
  ${c.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${$}(0);
    var valueK = ${$}(0);
    var valueV = ${$}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:o,programUniforms:d}),getShaderSource:h},{inputs:l,outputs:[-1,-1,-1]})},mc=(e,t)=>{let r=vu(e.inputs,t),[i,a,n]=Iu(e,r);return yr(e,i,a,n,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),ku,Eu,Cu,gc,jy=P(()=>{Ge(),te(),ie(),Se(),ae(),ku=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,n)=>{let s=a.length;if(s!==i.length)throw new Error(`${n}: num dimensions != ${s}`);a.forEach((o,l)=>{if(o!==i[l])throw new Error(`${n}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},Eu=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,n=e[0].dims,s=i?xe(n[n.length-1]):1,o=a==="NHWC"&&n.length>1?s:1,l=B.size(n)/s,d=i,h=d?n.length:n,c=N("x",e[0].dataType,e[0].dims,s),m=N("scale",e[1].dataType,e[1].dims,o),_=N("bias",e[2].dataType,e[2].dims,o),y=N("inputMean",e[3].dataType,e[3].dims,o),b=N("inputVar",e[4].dataType,e[4].dims,o),S=Q("y",e[0].dataType,h,s),v=()=>{let I="";if(i)I=`let cOffset = ${n.length===1?"0u":a==="NHWC"?`outputIndices[${n.length-1}] / ${s}`:"outputIndices[1]"};`;else if(a==="NCHW")I=`
            ${S.indicesSet("outputIndices","0","0")}
            let cOffset = ${S.indicesToOffset("outputIndices")};`;else{I=`var cIndices = ${m.type.indices}(0);
                       cIndices[0] = outputIndices[${n.length-1}];`;for(let T=1;T<m.rank;T++)I+=`cIndices[${T}] = outputIndices[${T}];`;I+=`let cOffset = ${m.indicesToOffset("cIndices")};`}return I},$=I=>`
  const epsilon = ${r};
  ${I.registerUniform("outputSize","u32").declareVariables(c,m,_,y,b,S)}
  ${I.mainStart()}
  ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${S.offsetToIndices(`global_idx * ${s}`)};
    ${v()}
    let scale = ${m.getByOffset("cOffset")};
    let bias = ${_.getByOffset("cOffset")};
    let inputMean = ${y.getByOffset("cOffset")};
    let inputVar = ${b.getByOffset("cOffset")};
    let x = ${c.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${S.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:d?["rank","type","type","type","type"]:void 0},getShaderSource:$,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d?[{type:12,data:l},...J(n)]:[{type:12,data:l}]})}},Cu=e=>fe(e),gc=(e,t)=>{let{inputs:r,outputCount:i}=e,a=Cu({...t,outputCount:i});if(_e.webgpu.validateInputContent&&ku(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(Eu(r,a))}}),zu,Au,yc,Ky=P(()=>{ie(),ae(),zu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Au=e=>{let t=e[0].dims,r=e[0].dims[2],i=B.size(t)/4,a=e[0].dataType,n=N("input",a,t,4),s=N("bias",a,[r],4),o=N("residual",a,t,4),l=Q("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:d=>`
  const channels = ${r}u / 4;
  ${d.declareVariables(n,s,o,l)}

  ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${n.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${o.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},yc=e=>{zu(e.inputs),e.compute(Au(e.inputs))}}),Ou,ce,_c,bc,wc,$c,vc,xc,Sc,Tc,Ic,Ru,kc,Ec,Cc,zc,cr,Ac,Fr,Oc,Rc,Bc,Mc,Dc,Nc,Pc,Uc,Lc,qc,Wc,Vc,Gc,Hc,Fc,jc,Fi,Kc,za,Aa,Xc,Zc,Qc,Bu,Mu,Yc,sn=P(()=>{te(),ie(),Se(),ae(),Ou=(e,t,r,i,a,n,s)=>{let o=Math.ceil(t/4),l="";typeof a=="string"?l=`${a}(a)`:l=a("a");let d=N("inputData",r,[o],4),h=Q("outputData",i,[o],4),c=[{name:"vec_size",type:"u32"}];return s&&c.push(...s),`
      ${e.registerUniforms(c).declareVariables(d,h)}

  ${n??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${d.getByOffset("global_idx")};
    ${h.setByOffset("global_idx",l)}
  }`},ce=(e,t,r,i,a,n=e.dataType,s,o)=>{let l=[{type:12,data:Math.ceil(B.size(e.dims)/4)}];return s&&l.push(...s),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:d=>Ou(d,B.size(e.dims),e.dataType,n,r,i,o),getRunData:d=>({outputs:[{dims:e.dims,dataType:n}],dispatchGroup:{x:Math.ceil(B.size(d[0].dims)/64/4)},programUniforms:l})}},_c=e=>{e.compute(ce(e.inputs[0],"Abs","abs"))},bc=e=>{e.compute(ce(e.inputs[0],"Acos","acos"))},wc=e=>{e.compute(ce(e.inputs[0],"Acosh","acosh"))},$c=e=>{e.compute(ce(e.inputs[0],"Asin","asin"))},vc=e=>{e.compute(ce(e.inputs[0],"Asinh","asinh"))},xc=e=>{e.compute(ce(e.inputs[0],"Atan","atan"))},Sc=e=>{e.compute(ce(e.inputs[0],"Atanh","atanh"))},Tc=e=>fe(e),Ic=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(ce(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},Ru=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return fe({min:t,max:r})},kc=(e,t)=>{let r=t||Ru(e.inputs),i=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},Ec=e=>{e.compute(ce(e.inputs[0],"Ceil","ceil"))},Cc=e=>{e.compute(ce(e.inputs[0],"Cos","cos"))},zc=e=>{e.compute(ce(e.inputs[0],"Cosh","cosh"))},cr=e=>fe(e),Ac=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Fr=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,Oc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Fr(t)))},Rc=e=>{e.compute(ce(e.inputs[0],"Exp","exp"))},Bc=e=>{e.compute(ce(e.inputs[0],"Floor","floor"))},Mc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Fr(t)))},Dc=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},Nc=e=>{e.compute(ce(e.inputs[0],"Not",t=>`!${t}`))},Pc=e=>{e.compute(ce(e.inputs[0],"Neg",t=>`-${t}`))},Uc=e=>{e.compute(ce(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},Lc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},qc=e=>{e.compute(ce(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Wc=e=>fe(e),Vc=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Gc=e=>{e.compute(ce(e.inputs[0],"Sin","sin"))},Hc=e=>{e.compute(ce(e.inputs[0],"Sinh","sinh"))},Fc=e=>{e.compute(ce(e.inputs[0],"Sqrt","sqrt"))},jc=e=>{e.compute(ce(e.inputs[0],"Tan","tan"))},Fi=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Kc=e=>{e.compute(ce(e.inputs[0],"Tanh",Fi))},za=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Fi("v")};
}
`,Aa=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Xc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"FastGelu",Aa,za(t),void 0,e.inputs[0].dataType))},Zc=(e,t)=>{let r=ze(e.inputs[0].dataType);return e.compute(ce(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Qc=e=>{e.compute(ce(e.inputs[0],"Log","log"))},Bu=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,Mu=e=>`quick_gelu_impl(${e})`,Yc=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"QuickGelu",Mu,Bu(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),Du,Nu,Jc,Xy=P(()=>{ie(),ae(),sn(),Du=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Nu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=N("input",e[0].dataType,e[0].dims,4),i=N("bias",e[0].dataType,[e[0].dims[2]],4),a=Q("output",e[0].dataType,t,4),n=B.size(t)/4,s=ke(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)}}),getShaderSource:o=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${o.declareVariables(r,i,a)}

  ${Fr(s)}

  ${o.mainStart()}
    ${o.guardAgainstOutOfBoundsWorkgroupSizes(n)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Jc=e=>{Du(e.inputs),e.compute(Nu(e.inputs))}}),Pu,Uu,Ze,eh,th,rh,ih,ah,nh,sh,oh,uh,lh,Zy=P(()=>{te(),ie(),ae(),Pu=(e,t,r,i,a,n,s,o,l,d,h,c)=>{let m,_;typeof o=="string"?m=_=($,I)=>`${o}((${$}),(${I}))`:typeof o=="function"?m=_=o:(m=o.scalar,_=o.vector);let y=Q("outputData",h,i.length,4),b=N("aData",l,t.length,4),S=N("bData",d,r.length,4),v;if(a)if(n){let $=B.size(t)===1,I=B.size(r)===1,T=t.length>0&&t[t.length-1]%4===0,E=r.length>0&&r[r.length-1]%4===0;$||I?v=y.setByOffset("global_idx",_($?`${b.type.value}(${b.getByOffset("0")}.x)`:b.getByOffset("global_idx"),I?`${S.type.value}(${S.getByOffset("0")}.x)`:S.getByOffset("global_idx"))):v=`
            let outputIndices = ${y.offsetToIndices("global_idx * 4u")};
            let offsetA = ${b.broadcastedIndicesToOffset("outputIndices",y)};
            let offsetB = ${S.broadcastedIndicesToOffset("outputIndices",y)};
            ${y.setByOffset("global_idx",_(s||T?b.getByOffset("offsetA / 4u"):`${b.type.value}(${b.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||E?S.getByOffset("offsetB / 4u"):`${S.type.value}(${S.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else v=y.setByOffset("global_idx",_(b.getByOffset("global_idx"),S.getByOffset("global_idx")));else{if(!n)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let $=(I,T,E="")=>{let C=`aData[indexA${T}][componentA${T}]`,A=`bData[indexB${T}][componentB${T}]`;return`
            let outputIndices${T} = ${y.offsetToIndices(`global_idx * 4u + ${T}u`)};
            let offsetA${T} = ${b.broadcastedIndicesToOffset(`outputIndices${T}`,y)};
            let offsetB${T} = ${S.broadcastedIndicesToOffset(`outputIndices${T}`,y)};
            let indexA${T} = offsetA${T} / 4u;
            let indexB${T} = offsetB${T} / 4u;
            let componentA${T} = offsetA${T} % 4u;
            let componentB${T} = offsetB${T} % 4u;
            ${I}[${T}] = ${E}(${m(C,A)});
          `};h===9?v=`
            var data = vec4<u32>(0);
            ${$("data",0,"u32")}
            ${$("data",1,"u32")}
            ${$("data",2,"u32")}
            ${$("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:v=`
            ${$("outputData[global_idx]",0)}
            ${$("outputData[global_idx]",1)}
            ${$("outputData[global_idx]",2)}
            ${$("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(b,S,y)}

        ${c??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${v}
      }`},Uu=(e,t,r,i,a,n,s=r.dataType)=>{let o=r.dims.map(Number),l=i.dims.map(Number),d=!B.areEqual(o,l),h=o,c=B.size(o),m=!1,_=!1,y=[d];if(d){let b=Ft.calcShape(o,l,!1);if(!b)throw new Error("Can't perform binary op on the given tensors");h=b.slice(),c=B.size(h);let S=B.size(o)===1,v=B.size(l)===1,$=o.length>0&&o[o.length-1]%4===0,I=l.length>0&&l[l.length-1]%4===0;y.push(S),y.push(v),y.push($),y.push(I);let T=1;for(let E=1;E<h.length;E++){let C=o[o.length-E],A=l[l.length-E];if(C===A)T*=C;else break}T%4===0?(_=!0,m=!0):(S||v||$||I)&&(m=!0)}else m=!0;return y.push(m),{name:e,shaderCache:{hint:t+y.map(b=>b.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:b=>Pu(b,o,l,h,m,d,_,a,r.dataType,i.dataType,s,n),getRunData:()=>({outputs:[{dims:h,dataType:s}],dispatchGroup:{x:Math.ceil(c/64/4)},programUniforms:[{type:12,data:Math.ceil(B.size(h)/4)},...J(o,l,h)]})}},Ze=(e,t,r,i,a,n)=>{e.compute(Uu(t,a??"",e.inputs[0],e.inputs[1],r,i,n))},eh=e=>{Ze(e,"Add",(t,r)=>`${t}+${r}`)},th=e=>{Ze(e,"Div",(t,r)=>`${t}/${r}`)},rh=e=>{Ze(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},ih=e=>{Ze(e,"Mul",(t,r)=>`${t}*${r}`)},ah=e=>{let t=N("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Ze(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},nh=e=>{Ze(e,"Sub",(t,r)=>`${t}-${r}`)},sh=e=>{Ze(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},oh=e=>{Ze(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},uh=e=>{Ze(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},lh=e=>{Ze(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),Lu,qu,Wu,Vu,dh,ph,Qy=P(()=>{te(),ie(),Se(),ae(),Lu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,n=i.dims.length;e.forEach((s,o)=>{if(o!==r){if(s.dataType!==a)throw new Error("input tensors should be one type");if(s.dims.length!==n)throw new Error("input tensors should have the same shape");s.dims.forEach((l,d)=>{if(d!==t&&l!==i.dims[d])throw new Error("non concat dimensions must match")})}})},qu=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,Wu=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let n=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(n):a===0?i.push(`if (inputIndex == ${a}u) { ${n} }`):a===r-1?i.push(`else { ${n} }`):i.push(`else if (inputIndex == ${a}) { ${n} }`)}return i.join(`
`)},Vu=(e,t,r,i)=>{let a=B.size(r),n=new Array(e.length),s=new Array(e.length),o=0,l=[],d=[],h=[{type:12,data:a}];for(let b=0;b<e.length;++b)o+=e[b].dims[t],n[b]=o,d.push(e[b].dims.length),s[b]=N(`input${b}`,i,d[b]),l.push("rank"),h.push({type:12,data:n[b]});for(let b=0;b<e.length;++b)h.push(...J(e[b].dims));h.push(...J(r));let c=Q("output",i,r.length),m=c.indicesGet("indices",t),_=Array.from(Array(n.length).keys()).map(b=>`uniforms.sizeInConcatAxis${b}`).join(","),y=b=>`

  ${(()=>{b.registerUniform("outputSize","u32");for(let S=0;S<e.length;S++)b.registerUniform(`sizeInConcatAxis${S}`,"u32");return b.declareVariables(...s,c)})()}

  ${qu(n.length,_)}

  ${b.mainStart()}
    ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${c.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${m});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${n.length}u>(${_});
      ${m} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${Wu(s,c)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:h}),getShaderSource:y}},dh=(e,t)=>{let r=e.inputs,i=r[0].dims,a=B.normalizeAxis(t.axis,i.length);Lu(r,a);let n=i.slice();n[a]=r.reduce((o,l)=>o+(l.dims.length>a?l.dims[a]:0),0);let s=r.filter(o=>B.size(o.dims)>0);e.compute(Vu(s,a,n,r[0].dataType),{inputs:s})},ph=e=>fe({axis:e.axis})}),Dt,Nt,Pt,on,Lt=P(()=>{te(),ie(),Dt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Nt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Pt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},on=e=>{let t=(e==null?void 0:e.activation)||"";if(t==="HardSigmoid"){let[r,i]=(e==null?void 0:e.activation_params)||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=(e==null?void 0:e.activation_params)||[Np,Pp];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=(e==null?void 0:e.activation_params)||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ce,ch,un=P(()=>{Ce=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},ch=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),hh,Yy=P(()=>{hh=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),fr,ln,dn=P(()=>{te(),ie(),ae(),Lt(),fr=(e,t,r,i,a)=>{let n=i-r;return`
      ${Array.from({length:r}).map((s,o)=>`
      if (${Y(t.shape,o,t.rank)} != 1) {
        ${t.indicesSet(e,o,Y(a,o+n,i))}
      } else {
        ${t.indicesSet(e,o,0)}
      }`).join("")}
`},ln=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,o=e[1].dims,l=s[s.length-2],d=o[o.length-1],h=s[s.length-1],c=xe(d),m=xe(h),_=xe(l),y=B.size(r)/c/_,b=e.length>2,S=i?i.slice(0,-2):r.slice(0,-2),v=[B.size(S),l,d],$=[{type:12,data:y},{type:12,data:l},{type:12,data:d},{type:12,data:h}];Nt(t,$),$.push(...J(S,s,o)),b&&$.push(...J(e[2].dims)),$.push(...J(v));let I=T=>{let E=rn("batch_dims",e[0].dataType,S.length),C=N("a",e[0].dataType,s.length,m),A=N("b",e[1].dataType,o.length,c),w=Q("output",e[0].dataType,v.length,c),R=ke(w.type.tensor),M=Dt(t,w.type.value,R),U=[C,A],G="";if(b){let K=a?c:1;U.push(N("bias",e[2].dataType,e[2].dims.length,K)),G=`${a?`value += bias[col / ${K}];`:`value += ${w.type.value}(bias[row + i]);`}`}let F=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Pt(t,F);let O=()=>{let K=`var a_data: ${C.type.value};`;for(let X=0;X<m;X++)K+=`
              let b_data${X} = b[(b_offset + (k + ${X}) * uniforms.N + col) / ${c}];`;for(let X=0;X<_;X++){K+=`a_data = a[(a_offset + (row + ${X}) * uniforms.K + k) / ${m}];`;for(let ee=0;ee<m;ee++)K+=`
            values[${X}] = fma(${A.type.value}(a_data${m===1?"":`[${ee}]`}), b_data${ee}, values[${X}]);
`}return K};return`
  ${T.registerUniforms(F).registerInternalVariables(E).declareVariables(...U,w)}
  ${T.mainStart()}
    ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${c})) * ${c};
    var index1 = global_idx / (uniforms.N / ${c});
    let stride1 = uniforms.M / ${_};
    let row = (index1 % stride1) * ${_};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${E.offsetToIndices("batch")};`}

    var a_indices: ${C.type.indices};
    ${fr("a_indices",C,C.rank-2,E.rank,"batch_indices")}
    ${C.indicesSet("a_indices",C.rank-2,0)}
    ${C.indicesSet("a_indices",C.rank-1,0)}
    let a_offset = ${C.indicesToOffset("a_indices")};

    var b_indices: ${A.type.indices};
    ${fr("b_indices",A,A.rank-2,E.rank,"batch_indices")}
    ${A.indicesSet("b_indices",A.rank-2,0)}
    ${A.indicesSet("b_indices",A.rank-1,0)}
    let b_offset = ${A.indicesToOffset("b_indices")};
    var values: array<${w.type.value}, ${_}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${m}) {
      ${O()}
    }
    for (var i = 0u; i < ${_}u; i++) {
      var value = values[i];
      ${G}
      ${M}
      let cur_indices = ${w.type.indices}(batch, row + i, col);
      let offset = ${w.indicesToOffset("cur_indices")};
      ${w.setByOffset(`offset / ${c}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${c};${m};${_};${a}`,inputDependencies:b?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:$}),getShaderSource:I}}}),Gu,Hu,Oa,ji,Fu,Ra,ju,Qr,pn=P(()=>{te(),ie(),ae(),Lt(),dn(),un(),Gu=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Hu=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,Oa=(e,t,r="f32",i,a=!1,n=32,s=!1,o=32)=>{let l=t[1]*e[1],d=t[0]*e[0],h=a?l:n,c=a?n:l,m=h/t[0],_=n/t[1];if(!((a&&m===4&&e[1]===4||!a&&(m===3||m===4))&&h%t[0]===0&&n%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${m} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${m} must be 3 or 4.
  tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}. tileInner ${n} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${m}<${r}>, ${h/m}>, ${c}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${d/e[0]}>, ${n}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${m};
const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${s?`${Math.ceil(o/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${o}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${_};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Gu(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${m===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Hu(a,m)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},ji=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,Fu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Ra=(e,t,r="f32",i,a=!1,n=32,s=!1,o=32,l=!1)=>{let d=e[1]*t[1],h=e[0]*t[0],c=a?d:n,m=a?n:d;if(!(m%t[1]===0&&c%t[0]===0&&n%t[1]===0))throw new Error(`tileAHight ${m} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${c} must be divisible by workgroupSize[0]${t[0]}, tileInner ${n} must be divisible by workgroupSize[1]${t[1]}`);let _=m/t[1],y=c/t[0],b=n/t[1],S=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${d};
    let globalColStart = i32(workgroupId.x) * ${h};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${m}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${c}; inputCol = inputCol + ${t[0]}) {
          ${ji(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${n}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${d};

let tileRowA = i32(localId.y) * ${_};
let tileColA = i32(localId.x) * ${y};
let tileRowB = i32(localId.y) * ${b};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${y}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${ji(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Fu(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${c}>, ${m}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${h}>, ${n}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(o/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${o}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${S}
  }
`},ju=(e,t,r,i,a=!1)=>{let[n,s,o,l]=i,d=ke(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ce(e,d)} {
      var value = ${Ce(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${fr("aIndices",s,s.rank-2,n.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ce(e,d)} {
      var value = ${Ce(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${o.type.indices};
        ${fr("bIndices",o,o.rank-2,n.rank,"batchIndices")}
        ${o.indicesSet("bIndices",o.rank-2,"u32(row)")}
        ${o.indicesSet("bIndices",o.rank-1,"u32(colIn)")}
        value = ${o.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ce(e,d)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ce(e,d)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Qr=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,o=e[1].dims,l=s.slice(0,-2),d=o.slice(0,-2),h=i?i.slice(0,-2):r.slice(0,-2),c=B.size(h),m=s[s.length-2],_=s[s.length-1],y=o[o.length-1],b=_%4===0&&y%4===0,S=m<=8?[4,1,1]:[4,4,1],v=[8,8,1],$=[Math.ceil(y/v[0]/S[0]),Math.ceil(m/v[1]/S[1]),Math.ceil(c/v[2]/S[2])],I=b?4:1,T=[...l,m,_/I],E=T.length,C=[...d,_,y/I],A=C.length,w=[c,m,y/I],R=[{type:6,data:m},{type:6,data:y},{type:6,data:_}];Nt(t,R),R.push(...J(h,T,C));let M=["rank","rank"],U=e.length>2;U&&(R.push(...J(e[2].dims)),M.push("rank")),R.push(...J(w));let G=F=>{let O=h.length,K=rn("batchDims",e[0].dataType,O,1),X=ke(e[0].dataType),ee=N("a",e[0].dataType,E,I),he=N("b",e[1].dataType,A,I),V=Q("result",e[0].dataType,w.length,I),ue=[ee,he];if(U){let me=a?I:1;ue.push(N("bias",e[2].dataType,e[2].dims.length,me))}let L=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Pt(t,L);let H=ke(V.type.tensor),Z=Dt(t,V.type.value,H),q=ju(I,U,Z,[K,ee,he,V],a);return`
  ${F.registerUniforms(L).registerInternalVariables(K).declareVariables(...ue,V)}
  ${q}
  ${b?Oa(S,v,X,K):Ra(S,v,X,K)}
                   `};return{name:"MatMul",shaderCache:{hint:`${S};${t.activation};${b};${a}`,inputDependencies:M},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:$[0],y:$[1],z:$[2]},programUniforms:R}),getShaderSource:G}}}),Ku,fh,Jy=P(()=>{te(),lt(),ae(),Lt(),un(),Yy(),pn(),Ku=(e,t,r,i,a=!1,n,s=4,o=4,l=4,d="f32")=>{let h=R=>{switch(R){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${d}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${R} is not supported.`)}},c=R=>{switch(R){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${R} is not supported.`)}},m=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,_=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,y=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",b=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",S=e?"row":"col",v=e?"col":"row",$=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${S} / outWidth;
    let outCol = ${S} % outWidth;

    let WRow = ${v} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${v} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${v} % inChannels;
    var resData = ${Ce(s,d)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${y} && xCol >= 0 && xCol < ${b}) {
      ${m}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${h(s)}
    }
    return resData;`,I=e?t&&i?`
    let col = colIn * ${s};
    ${$}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${$}
    }
    return ${Ce(s,d)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${$}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${$}
    }
    return ${Ce(s,d)}(0.0);`,T=e?i&&r?c(o):`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${c(o)}
    }
    return ${Ce(o,d)}(0.0);`:`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${c(o)}
    }
    return ${Ce(o,d)}(0.0);`,E=Ce(l,d),C=Ce(e?s:o,d),A=Ce(e?o:s,d),w=Dt(n,E,d);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?I:T}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?T:I}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${_}
      ${ch(a)}
      ${w}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},fh=(e,t,r,i,a,n,s,o,l)=>{let d=t.format==="NHWC",h=d?e[0].dims[3]:e[0].dims[1],c=r[0],m=d?r[2]:r[3],_=d?r[1]:r[2],y=d?r[3]:r[1],b=d&&(h%4===0||h%3===0)&&y%4===0,S=d?y:m*_,v=d?m*_:y,$=[8,8,1],I=i<=8?[4,1,1]:[4,4,1],T=[Math.ceil(S/$[0]/I[0]),Math.ceil(v/$[1]/I[1]),Math.ceil(c/$[2]/I[2])];de("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${T}`);let E=b?d&&h%4!==0?3:4:1,C=$[1]*I[1],A=$[0]*I[0],w=Math.max($[0]*E,$[1]),R=i%C===0,M=a%A===0,U=n%w===0,G=b?[E,4,4]:[1,1,1],F=[{type:6,data:i},{type:6,data:a},{type:6,data:n},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Nt(t,F),F.push(...J(e[0].dims,e[1].dims));let O=["rank","rank"];s&&(F.push(...J(e[2].dims)),O.push("rank")),F.push(...J(r));let K=X=>{let ee=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Pt(t,ee);let he=b?4:1,V=ke(e[0].dataType),ue=`
      fn setOutputAtIndex(flatIndex : i32, value : ${b?`vec4<${V}>`:V}) {
        result[flatIndex] = ${b?`vec4<${V}>`:V}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${b?`vec4<${V}>`:V}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${b?"/ 4":""}, value);
      }`,L=N("x",e[0].dataType,e[0].dims.length,E===3?1:E),H=N("w",e[1].dataType,e[1].dims.length,he),Z=[L,H],q=Q("result",e[0].dataType,r.length,he);if(s){let me=N("bias",e[2].dataType,e[2].dims.length,he);Z.push(me),ue+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${b?`vec4<${V}>`:V} {
          return bias[coords.${d?"w":"y"}${b?"/ 4":""}];
        }`}return`
        ${hh("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${X.registerUniforms(ee).declareVariables(...Z,q)}
        ${ue}
        ${Ku(d,R,M,U,s,t,G[0],G[1],G[2],V)}
        ${b?Oa(I,$,V,void 0,!d,w):Ra(I,$,V,void 0,!d,w,!1,void 0,o)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${E};${b};${R};${M};${U};${C};${A};${w}`,inputDependencies:O},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:T[0],y:T[1],z:T[2]},programUniforms:F}),getShaderSource:K}}}),Xu,Ki,ar,Zu,Xi,Qu,mh,gh,e0=P(()=>{te(),lt(),ie(),ae(),Lt(),un(),Xu=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Ki=e=>typeof e=="number"?[e,e,e]:e,ar=(e,t)=>t<=1?e:e+(e-1)*(t-1),Zu=(e,t,r,i=1)=>{let a=ar(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},Xi=(e,t,r,i,a)=>{a==null&&(a=Zu(e,t[0],i[0]));let n=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*a>=t[s]&&(n[s]=Math.trunc((e[s]-t[s]+2*a)/i[s]+1));return n},Qu=(e,t,r,i,a,n,s,o,l,d)=>{let h,c,m,_;if(e==="VALID"&&(e=0),typeof e=="number"){h={top:e,bottom:e,left:e,right:e,front:e,back:e};let y=Xi([t,r,i,1],[o,l,d],1,[a,n,s],e);c=y[0],m=y[1],_=y[2]}else if(Array.isArray(e)){if(!e.every((b,S,v)=>b===v[0]))throw Error(`Unsupported padding parameter: ${e}`);h={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let y=Xi([t,r,i,1],[o,l,d],1,[a,n,s],e[0]);c=y[0],m=y[1],_=y[2]}else if(e==="SAME_UPPER"){c=Math.ceil(t/a),m=Math.ceil(r/n),_=Math.ceil(i/s);let y=(c-1)*a+o-t,b=(m-1)*n+l-r,S=(_-1)*s+d-i,v=Math.floor(y/2),$=y-v,I=Math.floor(b/2),T=b-I,E=Math.floor(S/2),C=S-E;h={top:I,bottom:T,left:E,right:C,front:v,back:$}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:h,outDepth:c,outHeight:m,outWidth:_}},mh=(e,t,r,i,a,n=!1,s="channelsLast")=>{let o,l,d,h,c;if(s==="channelsLast")[o,l,d,h,c]=e;else if(s==="channelsFirst")[o,c,l,d,h]=e;else throw new Error(`Unknown dataFormat ${s}`);let[m,,_,y,b]=t,[S,v,$]=Ki(r),[I,T,E]=Ki(i),C=ar(_,I),A=ar(y,T),w=ar(b,E),{padInfo:R,outDepth:M,outHeight:U,outWidth:G}=Qu(a,l,d,h,S,v,$,C,A,w),F=n?m*c:m,O=[0,0,0,0,0];return s==="channelsFirst"?O=[o,F,M,U,G]:s==="channelsLast"&&(O=[o,M,U,G,F]),{batchSize:o,dataFormat:s,inDepth:l,inHeight:d,inWidth:h,inChannels:c,outDepth:M,outHeight:U,outWidth:G,outChannels:F,padInfo:R,strideDepth:S,strideHeight:v,strideWidth:$,filterDepth:_,filterHeight:y,filterWidth:b,effectiveFilterDepth:C,effectiveFilterHeight:A,effectiveFilterWidth:w,dilationDepth:I,dilationHeight:T,dilationWidth:E,inShape:e,outShape:O,filterShape:t}},gh=(e,t,r,i,a,n)=>{let s=n==="channelsLast";s?e[0].dims[3]:e[0].dims[1];let o=[64,1,1],l={x:r.map((S,v)=>v)},d=[Math.ceil(Xu(l.x.map(S=>r[S]))/o[0]),1,1];de("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${d}`);let h=1,c=B.size(r),m=[{type:12,data:c},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Nt(t,m),m.push(...J(e[0].dims,e[1].dims));let _=["rank","rank"],y=e.length===3;y&&(m.push(...J(e[2].dims)),_.push("rank")),m.push(...J(r));let b=S=>{let v=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Pt(t,v);let $=1,I=ke(e[0].dataType),T=N("x",e[0].dataType,e[0].dims.length,h),E=N("W",e[1].dataType,e[1].dims.length,$),C=[T,E],A=Q("result",e[0].dataType,r.length,$),w="";if(y){let U=N("bias",e[2].dataType,e[2].dims.length,$);C.push(U),w+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${I} {
          return bias[${s?Y("coords",4,5):Y("coords",1,5)}];
        }`}let R=Ce(h,I),M=Dt(t,R,I);return`
            ${w}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${T.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${E.getByIndices("aIndices")};
            }
          ${S.registerUniforms(v).declareVariables(...C,A)}
          ${S.mainStart()}
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${A.offsetToIndices("global_idx")};
              let batch = ${Y("coords",0,T.rank)};
              let d2 = ${s?Y("coords",T.rank-1,T.rank):Y("coords",1,T.rank)};
              let xFRCCorner = vec3<u32>(${s?Y("coords",1,T.rank):Y("coords",2,T.rank)},
              ${s?Y("coords",2,T.rank):Y("coords",3,T.rank)},
              ${s?Y("coords",3,T.rank):Y("coords",4,T.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Y("uniforms.x_shape",1,T.rank):Y("uniforms.x_shape",2,T.rank)};
              let xShapeZ = ${s?Y("uniforms.x_shape",2,T.rank):Y("uniforms.x_shape",3,T.rank)};
              let xShapeW = ${s?Y("uniforms.x_shape",3,T.rank):Y("uniforms.x_shape",4,T.rank)};
              let xShapeU = ${s?Y("uniforms.x_shape",4,T.rank):Y("uniforms.x_shape",1,T.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${y?"value = value + getBiasByOutputCoords(coords)":""};
              ${M}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${h};${y}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:d[0],y:d[1],z:d[2]},programUniforms:m}),getShaderSource:b}}}),yh,_h,t0=P(()=>{te(),ie(),ae(),Lt(),yh=(e,t,r,i)=>{let a=e.length>2,n=a?"value += b[output_channel];":"",s=e[0].dims,o=e[1].dims,l=t.format==="NHWC",d=l?r[3]:r[1],h=d/t.group,c=l&&h>=4?xe(d):1,m=B.size(r)/c,_=[{type:12,data:m},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:h}];Nt(t,_),_.push(...J(s,[o[0],o[1],o[2],o[3]/c]));let y=a?["rank","rank","rank"]:["rank","rank"];_.push(...J([r[0],r[1],r[2],r[3]/c]));let b=S=>{let v=Q("output",e[0].dataType,r.length,c),$=ke(v.type.tensor),I=Dt(t,v.type.value,$),T=N("x",e[0].dataType,s.length),E=N("w",e[1].dataType,o.length,c),C=[T,E];a&&C.push(N("b",e[2].dataType,e[2].dims,c));let A=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Pt(t,A);let w=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${T.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${E.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${T.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${E.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${S.registerUniforms(A).declareVariables(...C,v)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${v.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${c} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${v.type.value} = ${v.type.value}(0);
    ${w}
    ${n}
    ${I}
    ${v.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${c}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:_}),getShaderSource:b}},_h=(e,t,r,i)=>{let a=e.length>2,n=xe(r[3]),s=xe(r[2]),o=B.size(r)/n/s,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/n],d=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/n],h=[r[0],r[1],r[2],r[3]/n],c=[{type:12,data:o},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Nt(t,c),c.push(...J(l,d,h));let m=(s-1)*t.strides[1]+d[1],_=y=>{let b=Q("output",e[0].dataType,h.length,n),S=ke(b.type.tensor),v=Dt(t,b.type.value,S),$=N("x",e[0].dataType,l.length,n),I=N("w",e[1].dataType,d.length,n),T=[$,I];a&&T.push(N("b",e[2].dataType,e[2].dims,n));let E=a?"value += b[output_channel];":"",C=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Pt(t,C),`
  ${y.registerUniforms(C).declareVariables(...T,b)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${$.type.value}, ${m}>;
    var values: array<${b.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${d[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${m}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${$.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${$.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${d[1]}; w_width++) {
          let w_val = ${I.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${E}
      ${v}
      ${b.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${n};${s};${m};${d[0]};${d[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:c}),getShaderSource:_}}}),Yu,Ur,Ju,Lr,Ba,Zi,el,tl,Ma,r0=P(()=>{ie(),Jy(),e0(),pn(),t0(),Lt(),dn(),vt(),Yu=(e,t,r,i,a,n)=>{let s=e[0],o=e.slice(n?1:2,n?3:4),l=o.length,d=t[0],h=t.slice(2).map((m,_)=>m+(m-1)*(r[_]-1)),c=o.map((m,_)=>m+i[_]+i[_+l]).map((m,_)=>Math.floor((m-h[_]+a[_])/a[_]));return c.splice(0,0,s),c.splice(n?3:1,0,d),c},Ur=[2,3,1,0],Ju=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Lr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let n=2;n<t[1].dims.length;++n)r[n-2]===0&&(r[n-2]=t[1].dims[n]);let i=e.pads.slice();Xr.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},Ba=e=>{let t=on(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,n=e.group,s=e.kernel_shape,o=e.pads,l=e.strides,d=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,pads:o,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},Zi=(e,t,r,i)=>{let a=r.format==="NHWC",n=Yu(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let C=[t[0]];if(a){let A=e.kernelCustomData.wT??e.compute(Le(t[1],Ur),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=A),C.push(A)}else C.push(t[1]);t.length===3&&C.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(_h(C,r,n,i),{inputs:C}):e.compute(yh(C,r,n,i),{inputs:C});return}let s=t.length===3,o=t[0].dims[a?1:2],l=t[0].dims[a?2:3],d=t[0].dims[a?3:1],h=t[1].dims[2],c=t[1].dims[3],m=n[a?1:2],_=n[a?2:3],y=n[a?3:1],b=a&&h===o&&c===l&&r.pads[0]===0&&r.pads[1]===0;if(b||h===1&&c===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let C=n[0],A,w,R,M=[];if(a){let F=e.kernelCustomData.wT??e.compute(Le(t[1],Ur),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=F),b){let O=o*l*d;A=t[0].reshape([1,C,O]),w=F.reshape([1,O,y]),R=[1,C,y]}else A=t[0].reshape([C,o*l,d]),w=F.reshape([1,d,y]),R=[C,m*_,y];M.push(A),M.push(w)}else A=t[0].reshape([C,d,o*l]),w=t[1].reshape([1,y,d]),R=[C,y,m*_],M.push(w),M.push(A);s&&M.push(t[2]);let U=R[2],G=M[0].dims[M[0].dims.length-1];U<8&&G<8?e.compute(ln(M,r,n,R,a,i),{inputs:M}):e.compute(Qr(M,r,n,R,a,i),{inputs:M});return}let S=!0,v=e.kernelCustomData.wT??e.compute(Le(t[1],Ur),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=v);let $=[t[0],v];s&&$.push(t[2]);let I=a?m*_:y,T=a?y:m*_,E=h*c*d;e.compute(fh($,r,n,I,T,E,s,S,i),{inputs:$})},el=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],n=[1].concat(t.strides),s=[1].concat(t.dilations),o=[1].concat(t.kernelShape),l=Lr({...t,pads:a,strides:n,dilations:s,kernelShape:o},i);Zi(e,i,l,d=>r?[d[0],d[2],d[3]]:[d[0],d[1],d[3]])},tl=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Lr(r,t),n=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=mh(t[0].dims,t[1].dims,r.strides,r.dilations,n,!1,i);e.compute(gh(t,a,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},Ma=(e,t)=>{if(Ju(e.inputs,t),e.inputs[0].dims.length===3)el(e,t);else if(e.inputs[0].dims.length===5)tl(e,e.inputs,t);else{let r=Lr(t,e.inputs);Zi(e,e.inputs,r)}}}),bh,i0=P(()=>{te(),lt(),ie(),ae(),bh=(e,t,r)=>{let i=e.length>2,a=t.outputShape,n=t.format==="NHWC",s=t.group,o=e[1].dims,l=o[2]/s,d=o[3],h=n?xe(l):1,c=n&&d===1&&l>=4,m=c?Math.floor(l/4)*4:Math.floor(l/h)*h,_=l-m,y=n?xe(d):1,b=n?d===1?h:y:1,S=B.size(a)/y,v=[Math.ceil(S/64),1,1];de("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${v}`);let $=["rank","rank"],I=[t.strides[0],t.strides[1]],T=[t.kernelShape[n?1:2],t.kernelShape[n?2:3]],E=[t.dilations[0],t.dilations[1]],C=[T[0]+(t.dilations[0]<=1?0:(t.kernelShape[n?1:2]-1)*(t.dilations[0]-1)),T[1]+(t.dilations[1]<=1?0:(t.kernelShape[n?2:3]-1)*(t.dilations[1]-1))],A=[C[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),C[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],w=[{type:12,data:S},{type:12,data:I},{type:12,data:T},{type:12,data:E},{type:12,data:C},{type:6,data:A},{type:12,data:m},{type:12,data:l},{type:12,data:d},...J(e[0].dims,e[1].dims)];i&&(w.push(...J(e[2].dims)),$.push("rank")),w.push(...J(a));let R=M=>{let U=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:I.length},{name:"filter_dims",type:"u32",length:T.length},{name:"dilations",type:"u32",length:T.length},{name:"effective_filter_dims",type:"u32",length:C.length},{name:"pads",type:"i32",length:A.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],G=ke(e[0].dataType),F=n?1:2,O=n?2:3,K=n?3:1,X=N("W",e[1].dataType,e[1].dims.length,b),ee=N("Dy",e[0].dataType,e[0].dims.length,h),he=[ee,X];i&&he.push(N("bias",e[2].dataType,[a[K]].length,y));let V=Q("result",e[0].dataType,a.length,y),ue=()=>{let Z="";if(c)h===4?Z+=`
        let xValue = ${ee.getByOffset("x_offset")};
        let wValue = ${X.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:h===2?Z+=`
          dotProd = dotProd + dot(vec4<${G}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}), vec4<${G}>(${X.getByOffset("w_offset")}, ${X.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:h===1&&(Z+=`
          dotProd = dotProd + dot(vec4<${G}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}, ${ee.getByOffset("x_offset + 2u")}, ${ee.getByOffset("x_offset + 3u")}), vec4<${G}>(${X.getByOffset("w_offset")}, ${X.getByOffset("w_offset + 1u")}, ${X.getByOffset("w_offset + 2u")}, ${X.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(Z+=`
                  let xValue = ${n?ee.getByOffset(`${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h}`):ee.get("batch","inputChannel","idyR","idyC")};
        `,h===1)Z+=`
          let w_offset = ${X.indicesToOffset(`${X.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${X.getByOffset(`w_offset / ${b}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let q=0;q<h;q++)Z+=`
            let wValue${q} = ${X.getByOffset(`${X.indicesToOffset(`${X.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${q}, wOutChannel)`)} / ${b}`)};
            dotProd = dotProd + xValue[${q}] * wValue${q};`;return Z},L=()=>{if(_===0)return"";if(!c)throw new Error(`packInputAs4 ${c} is not true.`);let Z="";if(h===1){Z+="dotProd = dotProd";for(let q=0;q<_;q++)Z+=`
            + ${ee.getByOffset(`x_offset + ${q}`)} * ${X.getByOffset(`w_offset + ${q}`)}`;Z+=";"}else if(h===2){if(_!==2)throw new Error(`Invalid inputChannelsRemainder ${_}.`);Z+=`
          let xValue = ${ee.getByOffset("x_offset")};
          let wValue = ${X.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return Z},H=`
            let outputIndices = ${V.offsetToIndices(`global_idx * ${y}`)};
            let batch = ${V.indicesGet("outputIndices",0)};
            let d1 = ${V.indicesGet("outputIndices",K)};
            let r = ${V.indicesGet("outputIndices",F)};
            let c = ${V.indicesGet("outputIndices",O)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${V.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${G}(dyRCorner) + ${G}(wR)) / ${G}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${G}(uniforms.Dy_shape[${F}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${G}(dyCCorner) + ${G}(wC)) / ${G}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${G}(uniforms.Dy_shape[${O}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${c?`
                var x_offset = ${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h};
                var w_offset = ${X.indicesToOffset(`${X.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${b};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${c?4:h}) {
                  ${ue()}
                  inputChannel = inputChannel + ${c?4:h};
                }
                ${L()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${y}]`:""};
            ${V.setByOffset("global_idx","value")};
          `;return`
    ${M.registerUniforms(U).declareVariables(...he,V)}
      ${M.mainStart()}
      ${M.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${H}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${h}${b}${y}${c}${_}`,inputDependencies:$},getRunData:()=>({dispatchGroup:{x:v[0],y:v[1],z:v[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:w}),getShaderSource:R}}}),rl,il,al,Qi,wh,nl,Yi,sl,$h,a0=P(()=>{i0(),Lt(),vt(),rl=(e,t,r,i,a,n)=>(e-1)*t+r+(i-1)*a+1-n,il=(e,t,r,i,a)=>{let n=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=n,r[a]=e-n):t==="SAME_LOWER"&&(r[i]=e-n,r[a]=n)},al=(e,t,r,i,a,n,s,o,l,d)=>{let h=e.length-2,c=d.length===0;l.length<h&&l.push(...Array(h-l.length).fill(0));let m=e[0],_=t[o?3:1]*a;for(let y=0,b=e.length-h-(o?1:0);y<h;++y,++b){let S=e[b],v=c?S*s[y]:d[y],$=rl(S,s[y],n[y],t[b],r[y],v);il($,i,n,y,y+h),c&&d.push(s[y]*(S-1)+l[y]+(t[b]-1)*r[y]+1-n[y]-n[y+h])}d.splice(0,0,m),d.splice(o?3:1,0,_)},Qi=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((c,m)=>c*m,1)===0){r.length=0;for(let c=2;c<t[1].dims.length;++c)r.push(t[1].dims[c])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),n=e.outputShape.slice(),s=e.outputPadding.slice(),o=t[0].dims,l=e.dilations.slice();if(l.reduce((c,m)=>c+m,0)===0){let c=t[0].dims.length-2;l=new Array(c).fill(1)}let d=e.strides.slice();if(d.reduce((c,m)=>c+m,0)===0){let c=t[0].dims.length-2;d=new Array(c).fill(1)}al(o,r,l,e.autoPad,e.group,a,d,i,s,n);let h=Object.assign({},e);return Object.assign(h,{kernelShape:r,pads:a,outputPadding:s,outputShape:n,dilations:l,strides:d}),h},wh=e=>{let t=on(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,n=e.group??1,s=e.kernelShape,o=e.pads,l=e.strides,d=e.wIsConst(),h=e.outputPadding,c=e.outputShape;return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,outputPadding:h,outputShape:c,pads:o,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},nl=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.reduce((s,o)=>s+o,0)>0&&t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.reduce((s,o)=>s+o,0)>0&&t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.reduce((s,o)=>s+o,0)>0&&t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.outputPadding.length!==n&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${n}D`);if(t.kernelShape.reduce((s,o)=>s+o,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},Yi=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(Le(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let n=[t[0],a];t.length===3&&n.push(t[2]),e.compute(bh(n,r,i),{inputs:n})},sl=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let n=t.dilations;(n.length===0||n[0]===0)&&(n=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let o=t.pads;o.length===0&&(o=[0,0]),o=[0,o[0],0,o[1]],s=[1].concat(s),n=[1].concat(n),a=[1].concat(a);let l=t.outputPadding;l=[0].concat(l);let d=Qi({...t,pads:o,strides:s,dilations:n,kernelShape:a,outputPadding:l},i);Yi(e,i,d,h=>r?[h[0],h[2],h[3]]:[h[0],h[1],h[3]])},$h=(e,t)=>{if(nl(e.inputs,t),e.inputs[0].dims.length===3)sl(e,t);else{let r=Qi(t,e.inputs);Yi(e,e.inputs,r)}}}),ol,vh,xh,n0=P(()=>{te(),ie(),Se(),ae(),ol=(e,t,r,i)=>{let a=B.size(t),n=t.length,s=N("input",e,n),o=Q("output",e,n),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),d=B.normalizeAxis(l,n),h=c=>{let m=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,_=Y("uniforms.input_shape","uniforms.axis",n),y=i.reverse?m+(i.exclusive?" + 1":""):"0",b=i.reverse?_:m+(i.exclusive?"":" + 1");return`
                ${c.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,o)}
                ${c.mainStart()}
                  ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${o.offsetToIndices("global_idx")};
                  var sum = ${o.type.value}(0);
                  let first : i32 = ${y};
                  let last : i32 = ${b};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${o.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:d},...J(t,t)]}),getShaderSource:h}},vh=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(ol(i,r,a,t),{inputs:[0]})},xh=e=>{let t=e.exclusive===1,r=e.reverse===1;return fe({exclusive:t,reverse:r})}}),ul,ll,dl,Sh,Th,s0=P(()=>{te(),ie(),Se(),ae(),ul=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},ll=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let n=0;n<t;++n)a.push(r.indicesSet("a",e[n],`i[${n}]`));return a.push("return a;}"),a.join(`
`)},dl=(e,t)=>{let r,i,a,n,s,o,l=t.format==="NHWC",d=t.blocksize,h=t.mode==="DCR";l?([r,i,a,n]=e.dims,s=h?[r,i,a,d,d,n/d**2]:[r,i,a,n/d**2,d,d],o=h?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,n]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=h?[r,d,d,n/d**2,i,a]:[r,n/d**2,d,d,i,a],o=h?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let c=e.reshape(s),m=c.dims.length,_=e.dataType,y=N("a",_,m),b=Q("output",_,m),S=v=>`
  ${v.registerUniform("output_size","u32").declareVariables(y,b)}

  ${ll(o,m,y,b)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${b.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${b.setByOffset("global_idx",y.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:v=>{let $=l?[r,i*d,a*d,n/d**2]:[r,n/d**2,i*d,a*d],I=B.size($),T=c.dims,E=B.sortBasedOnPerm(T,o);return{outputs:[{dims:$,dataType:v[0].dataType}],dispatchGroup:{x:Math.ceil(I/64)},programUniforms:[{type:12,data:I},...J(T,E)]}},getShaderSource:S}},Sh=(e,t)=>{ul(e.inputs),e.compute(dl(e.inputs[0],t))},Th=e=>fe({blocksize:e.blocksize,mode:e.mode,format:e.format})}),qr,nr,Ji,pl,cl,hl,fl,ea,ml,Ih,kh,o0=P(()=>{te(),ie(),Se(),ae(),qr="[a-zA-Z]|\\.\\.\\.",nr="("+qr+")+",Ji="^"+nr+"$",pl="("+nr+",)*"+nr,cl="^"+pl+"$",hl=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},fl=class{constructor(e,t){var a;this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(cl)))throw new Error("Invalid LHS term");if(r.split(",").forEach((n,s)=>{let o=e[s].dims.slice();if(!n.match(RegExp(Ji)))throw new Error("Invalid LHS term");let l=this.processTerm(n,!0,o,s);this.lhs.push(l)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([n,s])=>s.count===1||n==="...").map(([n])=>n).join("");else if(!i.match(RegExp(nr)))throw new Error("Invalid RHS");(a=i.match(RegExp(qr,"g")))==null||a.forEach(n=>{if(n==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(n);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,n=!1,s=[],o=0;if(!e.match(RegExp(Ji))&&!t&&e!=="")throw new Error("Invalid LHS term");let l=e.match(RegExp(qr,"g")),d=new hl(i);return l==null||l.forEach((h,c)=>{if(h==="..."){if(n)throw new Error("Only one ellipsis is allowed per input term");n=!0;let m=a-l.length+1;if(m<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(o,o+m),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let _=0;_<s.length;_++){let y=String.fromCharCode(48+_);d.addSymbol(y,c+_),this.addSymbol(y,r[o++],i)}}else d.addSymbol(h,c+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(h,r[o++],i)}),d}},ea=e=>e+"_max",ml=(e,t,r,i)=>{let a=e.map(d=>d.length).map((d,h)=>N(`input${h}`,t,d)),n=B.size(i),s=Q("output",t,i.length),o=[...r.symbolToInfo.keys()].filter(d=>!r.rhs.symbolToIndices.has(d)),l=d=>{let h=[],c="var prod = 1.0;",m="var sum = 0.0;",_="sum += prod;",y=[],b=[],S=[],v=[],$=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((T,E)=>{var C;if(r.rhs.symbolToIndices.has(E)){let A=(C=r.rhs.symbolToIndices.get(E))==null?void 0:C[0];A!==void 0&&r.lhs.forEach((w,R)=>{if(T.inputIndices.includes(R)){let M=w.symbolToIndices.get(E);if(M===void 0)throw new Error("Invalid symbol error");M.forEach(U=>{h.push(`${a[R].indicesSet(`input${R}Indices`,U,s.indicesGet("outputIndices",A))}`)})}})}else r.lhs.forEach((A,w)=>{if(T.inputIndices.includes(w)){let R=A.symbolToIndices.get(E);if(R===void 0)throw new Error("Invalid symbol error");R.forEach(M=>{y.push(`${a[w].indicesSet(`input${w}Indices`,M,`${E}`)}`)}),v.push(`prod *= ${a[w].getByIndices(`input${w}Indices`)};`)}}),b.push(`for(var ${E}: u32 = 0; ${E} < uniforms.${ea(E)}; ${E}++) {`),S.push("}")});let I=$?[...h,`let sum = ${a.map((T,E)=>T.getByIndices(`input${E}Indices`)).join(" * ")};`]:[...h,m,...b,...y,c,...v,_,...S];return`
            ${d.registerUniforms(o.map(T=>({name:`${ea(T)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,s)}

            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${a.map((T,E)=>`var input${E}Indices: ${a[E].type.indices};`).join(`
`)}
            ${I.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let d=o.filter(c=>r.symbolToInfo.has(c)).map(c=>{var m;return{type:12,data:((m=r.symbolToInfo.get(c))==null?void 0:m.dimValue)||0}});d.push({type:12,data:n});let h=e.map((c,m)=>[...J(c)]).reduce((c,m)=>c.concat(m),d);return h.push(...J(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:h}},getShaderSource:l}},Ih=(e,t)=>{let r=new fl(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((n,s)=>n.dims);e.compute(ml(a,e.inputs[0].dataType,r,i))},kh=e=>{let t=e.equation.replace(/\s+/g,"");return fe({equation:t})}}),gl,ta,yl,_l,Eh,u0=P(()=>{te(),ie(),ae(),gl=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},ta=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},yl=(e,t)=>e.length>t.length?ta(e,t):ta(t,e),_l=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=yl(t,r),a=e[0].dataType,n=a===9||B.size(t)===1,s=a===9||t.length>0&&t[t.length-1]%4===0?4:1,o=n||i.length>0&&i[i.length-1]%4===0?4:1,l=Math.ceil(B.size(i)/o),d=c=>{let m=N("input",a,t.length,s),_=Q("output",a,i.length,o),y;if(a===9){let b=(S,v,$="")=>`
          let outputIndices${v} = ${_.offsetToIndices(`outputOffset + ${v}u`)};
          let offset${v} = ${m.broadcastedIndicesToOffset(`outputIndices${v}`,_)};
          let index${v} = offset${v} / 4u;
          let component${v} = offset${v} % 4u;
          ${S}[${v}] = ${$}(${m.getByOffset(`index${v}`)}[component${v}]);
        `;y=`
        let outputOffset = global_idx * ${o};
        var data = vec4<u32>(0);
        ${b("data",0,"u32")}
        ${b("data",1,"u32")}
        ${b("data",2,"u32")}
        ${b("data",3,"u32")}
        ${_.setByOffset("global_idx","data")}
      }`}else y=`
        let outputIndices = ${_.offsetToIndices(`global_idx * ${o}`)};
        let inputOffset = ${m.broadcastedIndicesToOffset("outputIndices",_)};
        let data = ${_.type.value}(${m.getByOffset(`inputOffset / ${s}`)});
        ${_.setByOffset("global_idx","data")}
      }`;return`
    ${c.registerUniform("vec_size","u32").declareVariables(m,_)}
    ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${y}`},h=[{type:12,data:l},...J(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${o}`,inputDependencies:["rank"]},getShaderSource:d,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:h})}},Eh=e=>{gl(e.inputs),e.compute(_l(e.inputs),{inputs:[0]})}}),bl,Ch,l0=P(()=>{te(),ie(),ae(),sn(),bl=e=>{let t=e[0].dataType,r=B.size(e[0].dims),i=B.size(e[1].dims),a=i%4===0,n=s=>{let o=N("x",t,[1],4),l=N("bias",t,[1],4),d=Q("y",t,[1],4),h=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],c=_=>`
      let bias${_}_offset: u32 = (global_idx * 4 + ${_}) % uniforms.bias_size;
      let bias${_} = ${l.getByOffset(`bias${_}_offset / 4`)}[bias${_}_offset % 4];`,m=a?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${c(0)}${c(1)}${c(2)}${c(3)}
      let bias = ${o.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(h).declareVariables(o,l,d)}

    ${za(ze(t))}

    ${s.mainStart(jt)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${o.getByOffset("global_idx")};
      ${m}
      let x_in = x + bias;
      ${d.setByOffset("global_idx",Aa("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:n,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/jt/4)}})}},Ch=e=>{e.inputs.length<2||B.size(e.inputs[1].dims)===0?Xc(e):e.compute(bl(e.inputs))}}),wl,$l,zh,Ah,d0=P(()=>{te(),ie(),Se(),ae(),wl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},$l=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=B.normalizeAxis(t.axis,a),s=r.slice(0);s.splice(n,1,...i);let o=r[n],l=e[0].dataType===9?4:1,d=Math.ceil(B.size(s)/l),h=[{type:12,data:d},{type:6,data:o},{type:12,data:n},...J(e[0].dims,e[1].dims,s)],c=m=>{let _=N("data",e[0].dataType,e[0].dims.length,l),y=N("inputIndices",e[1].dataType,e[1].dims.length),b=Q("output",e[0].dataType,s.length,l),S=$=>{let I=i.length,T=`var indicesIndices${$}  = ${y.type.indices}(0);`;for(let E=0;E<I;E++)T+=`${I>1?`indicesIndices${$}[${E}]`:`indicesIndices${$}`} = ${s.length>1?`outputIndices${$}[uniforms.axis + ${E}]`:`outputIndices${$}`};`;T+=`
          var idx${$} = ${y.getByIndices(`indicesIndices${$}`)};
          if (idx${$} < 0) {
            idx${$} = idx${$} + uniforms.axisDimLimit;
          }
          var dataIndices${$} : ${_.type.indices};
        `;for(let E=0,C=0;E<a;E++)E===n?(T+=`${a>1?`dataIndices${$}[${E}]`:`dataIndices${$}`} = u32(idx${$});`,C+=I):(T+=`${a>1?`dataIndices${$}[${E}]`:`dataIndices${$}`} = ${s.length>1?`outputIndices${$}[${C}]`:`outputIndices${$}`};`,C++);return T},v;if(e[0].dataType===9){let $=(I,T,E="")=>`
          let outputIndices${T} = ${b.offsetToIndices(`outputOffset + ${T}u`)};
          ${S(T)};
          let offset${T} = ${_.indicesToOffset(`dataIndices${T}`)};
          let index${T} = offset${T} / 4u;
          let component${T} = offset${T} % 4u;
          ${I}[${T}] = ${E}(${_.getByOffset(`index${T}`)}[component${T}]);
        `;v=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${$("value",0,"u32")}
        ${$("value",1,"u32")}
        ${$("value",2,"u32")}
        ${$("value",3,"u32")}
        ${b.setByOffset("global_idx","value")}
      `}else v=`
      let outputIndices = ${b.offsetToIndices("global_idx")};
      ${S("")};
      let value = ${_.getByIndices("dataIndices")};
      ${b.setByOffset("global_idx","value")};
      `;return`
      ${m.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(_,y,b)}
      ${m.mainStart()}
        ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${v}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h}),getShaderSource:c}},zh=e=>fe({axis:e.axis}),Ah=(e,t)=>{let r=e.inputs;wl(r),e.compute($l(e.inputs,t))}}),vl,Oh,Rh,p0=P(()=>{te(),ie(),ae(),vl=(e,t,r,i,a,n,s,o,l)=>{let d=[{type:12,data:n},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:s},{type:12,data:o},{type:12,data:l}],h=[n];d.push(...J(t.dims,h));let c=m=>{let _=N("indices_data",t.dataType,t.dims.length),y=Q("input_slice_offsets_data",12,1,1),b=[_,y],S=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${m.registerUniforms(S).declareVariables(...b)}
  ${m.mainStart()}
    ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:h,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:d}),getShaderSource:c},{inputs:[t],outputs:[-1]})[0]},Oh=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,n=r[1].dims,s=n[n.length-1],o=B.sizeToDimension(n,n.length-1),l=B.sizeFromDimension(i,t.batchDims+s),d=B.sizeToDimension(i,t.batchDims),h=B.sizeFromDimension(i,t.batchDims),c=o/d,m=new Array(s),_=l;for(let T=0;T<s;++T)m[s-1-T]=_,_*=i[t.batchDims+s-1-T];let y=vl(e,r[1],m,t.batchDims,i,o,c,h,s),b=t.batchDims+s;if(b>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let S=n.slice(0,-1).concat(i.slice(b)),v=B.size(S),$=[{type:12,data:v},{type:12,data:l},...J(r[0].dims,y.dims,S)],I=T=>{let E=N("data",r[0].dataType,r[0].dims.length),C=N("slice_offsets",12,y.dims.length),A=Q("output",r[0].dataType,S.length);return`
          ${T.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(E,C,A)}
            ${T.mainStart()}
            ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:S,dataType:a}],dispatchGroup:{x:Math.ceil(v/64)},programUniforms:$}),getShaderSource:I},{inputs:[r[0],y]})},Rh=e=>({batchDims:e.batch_dims,cacheKey:""})}),xl,Sl,Bh,Mh,c0=P(()=>{te(),ie(),Se(),ae(),xl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=B.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],n=e[2],s=e.length===4?e[3]:void 0;if(n.dims.length!==a.dims.length||!a.dims.map((o,l)=>l===r?Math.ceil(o/i)===n.dims[l]:o===n.dims[l]).reduce((o,l)=>o&&l,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==n.dims.length||!s.dims.map((o,l)=>o===n.dims[l]).reduce((o,l)=>o&&l,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},Sl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=B.normalizeAxis(t.gatherAxis,a),s=B.normalizeAxis(t.quantizeAxis,a),o=r.slice(0);o.splice(n,1,...i);let l=B.size(o),d=e[2].dataType,h=e[0].dataType===22,c=[{type:12,data:l},{type:12,data:s},{type:12,data:n},{type:12,data:t.blockSize},...J(...e.map((_,y)=>_.dims),o)],m=_=>{let y=N("data",e[0].dataType,e[0].dims.length),b=N("inputIndices",e[1].dataType,e[1].dims.length),S=N("scales",e[2].dataType,e[2].dims.length),v=e.length>3?N("zeroPoint",e[3].dataType,e[3].dims.length):void 0,$=Q("output",d,o.length),I=[y,b,S];v&&I.push(v);let T=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${_.registerUniforms(T).declareVariables(...I,$)}
        ${_.mainStart()}
        let output_indices = ${$.offsetToIndices("global_idx")};
        var indices_indices = ${b.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${$.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${b.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${$.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${y.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${$.indicesGet("output_indices","i")};
          ${y.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${b.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[n]};
        }
        ${y.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${o.length}; i++) {
          let index = ${$.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${y.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${y.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${y.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${S.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${S.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${S.getByIndices("scale_indices")};
        ${v?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${v.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${v.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${ze(d)}(quantized_data - zero_point) * scale;
        ${$.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((_,y)=>y!==1).map(_=>_.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(_,y)=>"rank")},getRunData:()=>({outputs:[{dims:o,dataType:d}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:c}),getShaderSource:m}},Bh=(e,t)=>{let r=e.inputs;xl(r,t),e.compute(Sl(e.inputs,t))},Mh=e=>fe({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),Tl,Il,Dh,Nh,h0=P(()=>{te(),ie(),Se(),ae(),Tl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Il=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,n=e[1].dims,s=e[1].dataType,o=B.normalizeAxis(t.axis,a),l=r[o],d=n.slice(0),h=B.size(d),c=N("input",i,a),m=N("indicesInput",s,n.length),_=Q("output",i,d.length),y=[{type:12,data:h},{type:6,data:l},{type:12,data:o}];return y.push(...J(r,n,d)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:d,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:y}),getShaderSource:b=>`
      ${b.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(c,m,_)}
      ${b.mainStart()}
      ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${_.offsetToIndices("global_idx")};

      var idx = ${m.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${c.type.indices}(outputIndices);
      ${c.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${c.getByIndices("inputIndices")};

      ${_.setByOffset("global_idx","value")};
  }`}},Dh=e=>fe({axis:e.axis}),Nh=(e,t)=>{let r=e.inputs;Tl(r),e.compute(Il(e.inputs,t))}}),kl,El,Ph,Uh,f0=P(()=>{te(),ie(),ae(),kl=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},El=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,n,s]=Dp.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),o=[a,n];if(!o)throw new Error("Can't use gemm on the given tensors");let l=16,d=Math.ceil(n/l),h=Math.ceil(a/l),c=!0,m=B.size(o),_=[{type:12,data:c?d:m},{type:12,data:a},{type:12,data:n},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],y=["type","type"];e.length===3&&(_.push(...J(e[2].dims)),y.push("rank")),_.push(...J(o));let b=v=>{let $="";t.transA&&t.transB?$="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?$="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?$="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&($="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let I=t.alpha===1?"":"value *= uniforms.alpha;",T=N("a",e[0].dataType,e[0].dims),E=N("b",e[1].dataType,e[1].dims),C=T.type.value,A=null,w=[T,E];e.length===3&&(A=N("c",e[2].dataType,e[2].dims.length),w.push(A));let R=Q("output",e[0].dataType,o.length);w.push(R);let M=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${v.registerUniforms(M).declareVariables(...w)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${C}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${$}
    }

    ${I}
    ${A!=null?`let cOffset = ${A.broadcastedIndicesToOffset("vec2(m, n)",R)}; value += ${C}(uniforms.beta) * ${A.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},S=v=>{let $=N("a",e[0].dataType,e[0].dims),I=N("b",e[1].dataType,e[1].dims),T=null,E=[$,I];e.length===3&&(T=N("c",e[2].dataType,e[2].dims.length),E.push(T));let C=Q("output",e[0].dataType,o.length);E.push(C);let A=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],w="",R="";t.transA&&t.transB?(R=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,w="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(R=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,w="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(R=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,w="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(R=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,w="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let M=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${v.registerUniforms(A).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${$.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${I.type.storage}, ${l}>, ${l}>;
  ${v.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${C.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${R}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${w}
      }
      workgroupBarrier();
    }

    ${M}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${T!=null?`let cOffset = ${T.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${C.type.value}(uniforms.beta) * ${T.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return c?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:d*h},programUniforms:_}),getShaderSource:S}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:_}),getShaderSource:b}},Ph=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Uh=(e,t)=>{kl(e.inputs),e.compute(El(e.inputs,t))}}),it,st,kt,Et,Cl,zl,Al,Ol,Rl,Bl,Ml,Dl,Lh,qh,m0=P(()=>{te(),ie(),Se(),ae(),[it,st,kt,Et]=[0,1,2,3],Cl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},zl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,Al=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,Ol=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,Rl=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,Bl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${it}] = batch;
     indices[${st}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${kt}] = u32(r);
            indices[${Et}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${kt}] = u32(clamp(r, 0, H - 1));
          indices[${Et}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${kt}] = gs_reflect(r, border[1], border[3]);
          indices[${Et}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,Ml=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${it}], indices[${st}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${it}], indices[${st}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${it}], indices[${st}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${it}], indices[${st}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${it}], indices[${st}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${it}], indices[${st}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,Dl=(e,t)=>{let r=N("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=N("grid",e[1].dataType,i.length,2),n=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(n=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[it,st,kt,Et]=[0,3,1,2]);let s=Q("output",e[0].dataType,n.length),o=r.type.value,l=B.size(n),d=[{type:12,data:l},...J(e[0].dims,i,n)],h=c=>`
  ${c.registerUniform("output_size","u32").declareVariables(r,a,s)}
  ${zl}
  ${Al(o)}
  ${Ol(t)}
  ${Rl(t)}
  ${Bl(r,o,t)}

  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${kt}]);
      let W_in = i32(uniforms.x_shape[${Et}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${it}], indices[${kt}], indices[${Et}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${Ml(s,o,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:c=>{let m=B.size(n);return{outputs:[{dims:n,dataType:c[0].dataType}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:d}},getShaderSource:h}},Lh=(e,t)=>{Cl(e.inputs),e.compute(Dl(e.inputs,t))},qh=e=>fe({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),Ae,Nl,Wh,ra,Pl,hr,Vh,Gh=P(()=>{te(),ie(),Se(),tn(),nn(),ae(),vt(),Ae=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,Nl=(e,t)=>{let r=e[0],i=Ae(e,1),a=Ae(e,2),n=Ae(e,3),s=Ae(e,4),o=Ae(e,5),l=Ae(e,6),d=Ae(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let h=r.dims[0],c=r.dims[1],m=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],_=c,y=0,b=0,S=Math.floor(m/t.numHeads);if(l&&d&&B.size(l.dims)&&B.size(d.dims)){if(l.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==h||l.dims[1]!==t.numHeads||l.dims[3]!==S)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[0]!==h||d.dims[1]!==t.numHeads||d.dims[3]!==S)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==d.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(d.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');y=l.dims[2],b=l.dims[2]}else if(l&&B.size(l.dims)||d&&B.size(d.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v;if(i&&B.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');v=2,_=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==S)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');v=5,_=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==S)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');v=0,_=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}if(n&&B.size(n.dims)>0){if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let $=y+_,I=0;if(s&&B.size(s.dims)>0){I=8;let A=s.dims;throw A.length===1?A[0]===h?I=1:A[0]===3*h+2&&(I=3):A.length===2&&A[0]===h&&A[1]===$&&(I=5),I===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let T=!1,E=m;if(a&&B.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(_!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');E=a.dims[2]}else{if(_!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');E=a.dims[1]*a.dims[3],T=!0}}let C=!1;if(s&&B.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(o&&B.size(o.dims)>0){if(o.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(o.dims[0]!==h||o.dims[1]!==t.numHeads||o.dims[2]!==c||o.dims[3]!==$)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:h,sequenceLength:c,pastSequenceLength:y,kvSequenceLength:_,totalSequenceLength:$,maxSequenceLength:b,inputHiddenSize:0,hiddenSize:m,vHiddenSize:E,headSize:S,vHeadSize:Math.floor(E/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:I,scale:t.scale,broadcastResPosBias:C,passPastInKv:T,qkvFormat:v}},Wh=e=>fe({...e}),ra=fe({perm:[0,2,1,3]}),Pl=(e,t,r,i,a,n,s)=>{let o=[i,a,n],l=B.size(o),d=[{type:12,data:l},{type:12,data:s},{type:12,data:n}],h=c=>{let m=Q("qkv_with_bias",t.dataType,o),_=N("qkv",t.dataType,o),y=N("bias",r.dataType,o),b=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${c.registerUniforms(b).declareVariables(_,y,m)}
  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:o,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d}),getShaderSource:h},{inputs:[t,r],outputs:[-1]})[0]},hr=(e,t,r,i,a,n,s,o)=>{let l=n;if(s&&B.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=Pl(e,n,s,t,i,r*a,o),l=l.reshape([t,i,r,a]),r===1||i===1?l:e.compute(Le(l,ra.perm),{inputs:[l],outputs:[-1]})[0]}else return n.dims.length===3&&(l=n.reshape([t,i,r,a])),r===1||i===1?l:e.compute(Le(l,ra.perm),{inputs:[l],outputs:[-1]})[0]},Vh=(e,t)=>{let r=Nl(e.inputs,t),i=e.inputs[0],a=Ae(e.inputs,1),n=Ae(e.inputs,2),s=Ae(e.inputs,3),o=Ae(e.inputs,4),l=Ae(e.inputs,5),d=Ae(e.inputs,6),h=Ae(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if((a==null?void 0:a.dims.length)===5)throw new Error("Packed KV is not implemented");let c=a&&n&&a.dims.length===4&&n.dims.length===4,m=hr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(c)return yr(e,m,a,n,o,void 0,d,h,l,r);if(!a||!n)throw new Error("key and value must be provided");let _=hr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,s,r.hiddenSize),y=hr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,n,s,2*r.hiddenSize);yr(e,m,_,y,o,void 0,d,h,l,r)}}),Ul,Ll,ql,Wl,Da,Hh,Fh,jh=P(()=>{te(),ie(),Se(),ae(),Ul=e=>{if(!e||e.length<1)throw new Error("too few inputs")},Ll=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),fe({numOutputs:i,axis:t.axis,splitSizes:r})},ql=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Y("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,Wl=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Da=(e,t)=>{let r=e[0].dims,i=B.size(r),a=e[0].dataType,n=B.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),o=N("input",a,r.length),l=new Array(t.numOutputs),d=[],h=[],c=0,m=[{type:12,data:i}];for(let y=0;y<t.numOutputs;y++){c+=t.splitSizes[y],l[y]=c;let b=r.slice();b[n]=t.splitSizes[y],h.push(b),s[y]=Q(`output${y}`,a,b.length),d.push({dims:h[y],dataType:e[0].dataType})}m.push({type:12,data:l},...J(r,...h));let _=y=>`
  ${y.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(o,...s)}
  ${ql(l.length)}
  ${Wl(s)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${o.offsetToIndices("global_idx")};
    var index = ${o.indicesGet("indices",n)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Y("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${o.indicesSet("indices",n,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:_,getRunData:()=>({outputs:d,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:m})}},Hh=(e,t)=>{Ul(e.inputs);let r=e.inputs.length===1?t:Ll(e.inputs,t);e.compute(Da(e.inputs,r),{inputs:[0]})},Fh=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return fe({axis:t,numOutputs:i,splitSizes:r})}}),Vl,Yr,Kh,Xh=P(()=>{te(),ie(),Se(),ae(),Vl=(e,t)=>{let[r,i,a,n]=e,{numHeads:s,rotaryEmbeddingDim:o}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!B.areEqual(i.dims,[])&&!B.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(!B.areEqual(a.dims,n.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(o>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],d=r.dims[r.dims.length-2],h=a.dims[0],c=B.sizeFromDimension(r.dims,1)/d,m=o===0?a.dims[1]*2:c/s;if(o>m)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(l!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(d!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(d>h)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(m/2!==a.dims[1]&&o/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`)},Yr=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:n}=t,s=e[0].dims[0],o=B.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],d=o/l,h=e[2].dims[1],c=a===0?h*2:d/i,m=new Array(s,l,d/c,c-h),_=B.computeStrides(m),y=[{type:1,data:n},{type:12,data:m},{type:12,data:_},...e[0].dims.length===3?new Array({type:12,data:[o,d,c,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[o,c,l*c,1]}):[],...J(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],b=S=>{let v=N("input",e[0].dataType,e[0].dims.length),$=N("position_ids",e[1].dataType,e[1].dims.length),I=N("cos_cache",e[2].dataType,e[2].dims.length),T=N("sin_cache",e[3].dataType,e[3].dims.length),E=Q("output",e[0].dataType,e[0].dims.length);return S.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:m.length},{name:"global_strides",type:"u32",length:_.length},{name:"input_output_strides",type:"u32",length:_.length}]),`
        ${S.declareVariables(v,$,I,T,E)}

        ${S.mainStart(jt)}
          let half_rotary_emb_dim = uniforms.${I.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${$.broadcastedIndicesToOffset("bsnh.xy",Q("",$.type.tensor,2))};
            let position_id =
                u32(${$.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${v.getByOffset("i")} * ${I.get("position_id","bsnh[3]")} -
                ${v.getByOffset("j")} * ${T.get("position_id","bsnh[3]")};
            ${E.setByOffset("i","re")}
            let im = ${v.getByOffset("i")} * ${T.get("position_id","bsnh[3]")} +
                ${v.getByOffset("j")} * ${I.get("position_id","bsnh[3]")};
            ${E.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k",v.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:fe({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:b,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(B.size(m)/jt)},programUniforms:y})}},Kh=(e,t)=>{Vl(e.inputs,t),e.compute(Yr(e.inputs,t))}}),Gl,Hl,ia,Fl,Zh,g0=P(()=>{Se(),te(),nn(),Gh(),jh(),vt(),Xh(),ae(),Gl=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let o=!1,l=r.dims[0],d=r.dims[1],h=r.dims.length===3?o?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],c=d,m=0,_=!i||i.dims.length===0,y=Math.floor(_?h/(t.numHeads+2*t.kvNumHeads):h/t.numHeads);_&&(h=y*t.numHeads);let b=n&&n.dims.length!==0,S=s&&s.dims.length!==0;if(b&&n.dims.length===4&&n.dims[0]===l&&n.dims[1]!==t.kvNumHeads&&n.dims[2]===t.kvNumHeads&&n.dims[3]===y)throw new Error("BSNH pastKey/pastValue is not supported");if(b&&S){if(n.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');m=n.dims[2]}else if(b||S)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');c=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==y)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');c=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==y)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');c=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}let $=0,I=!1,T=t.kvNumHeads?y*t.kvNumHeads:h;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(c!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');T=a.dims[2]}else{if(c!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');T=a.dims[1]*a.dims[3],I=!0}}let E=e.length>4?e[5]:void 0;if(E){if(E.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let C=E.dims.reduce((A,w)=>A*w,1);if(C!==l)throw new Error(`seqlens_k must have batch_size (${l}) elements, got ${C}.`);for(let A=0;A<E.dims.length;A++)if(E.dims[A]!==1&&E.dims[A]!==l)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${A}] = ${E.dims[A]}.`)}return{batchSize:l,sequenceLength:d,pastSequenceLength:m,kvSequenceLength:c,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:h,vHiddenSize:T,headSize:y,vHeadSize:Math.floor(T/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:$,scale:t.scale,broadcastResPosBias:!1,passPastInKv:I,qkvFormat:v}},Hl=fe({perm:[0,2,1,3]}),ia=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(Le(i,Hl.perm),{inputs:[i],outputs:[-1]})[0]),i},Fl=(e,t,r,i)=>{let a=7,n=["type","type"],s=[e*t],o=e*t,l=[{type:12,data:o},{type:12,data:t},{type:12,data:e}],d=h=>{let c=N("seq_lens",r.dataType,r.dims),m=N("total_seq_lens",i.dataType,i.dims),_=Q("pos_ids",a,s),y=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${h.registerUniforms(y).declareVariables(c,m,_)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${m.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${c.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${_.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:n},getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:l}),getShaderSource:d}},Zh=(e,t)=>{var T;let r=Gl(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(((T=e.inputs[1])==null?void 0:T.dims.length)===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,n=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,o=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,d=e.inputs.length>5?e.inputs[6]:void 0,h=r.kvNumHeads?r.kvNumHeads:r.numHeads,c=fe({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,h*r.headSize,h*r.headSize]}),[m,_,y]=!a&&!n?e.compute(Da([i],c),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,n],b,S;if(t.doRotary){let E=e.compute(Fl(r.batchSize,r.sequenceLength,l,d),{inputs:[l,d],outputs:[-1]})[0],C=e.inputs[7],A=e.inputs[8],w=fe({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),R=[m,E,C,A],M=[-1];b=e.compute(Yr(R,w),{inputs:R,outputs:M})[0],R.splice(0,1,_);let U=fe({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});S=e.compute(Yr(R,U),{inputs:R,outputs:M})[0]}let v=hr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?b:m,void 0,0),$=ia(e,t.doRotary?S:_,r),I=ia(e,y,r);yr(e,v,$,I,void 0,void 0,s,o,void 0,r,l,d)}}),aa,jl,Kl,Qh,y0=P(()=>{te(),ie(),vt(),ae(),aa=(e,t,r,i,a,n,s,o)=>{let l=xe(n),d=l===1?"f32":`vec${l}f`,h=l===1?"vec2f":`mat2x${l}f`,c=a*s,m=64;c===1&&(m=256);let _=[a,s,n/l],y=[a,s,2],b=["rank","type","type"],S=[];S.push(...J(_,y));let v=$=>{let I=N("x",t.dataType,3,l),T=N("scale",r.dataType,r.dims),E=N("bias",i.dataType,i.dims),C=Q("output",1,3,2),A=[I,T,E,C];return`
  var<workgroup> workgroup_shared : array<${h}, ${m}>;
  const workgroup_size = ${m}u;
  ${$.declareVariables(...A)}
  ${$.mainStart(m)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${d}(0);
    var squared_sum = ${d}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${d}(${I.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${h}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${$t("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${$t("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${o}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${o};${m}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:y,dataType:1}],dispatchGroup:{x:c},programUniforms:S}),getShaderSource:v},{inputs:[t,r,i],outputs:[-1]})[0]},jl=(e,t,r)=>{let i=t[0].dims,a=i,n=2,s=i[0],o=i[1],l=B.sizeFromDimension(i,n),d=xe(l),h=B.size(a)/d,c=aa(e,t[0],t[1],t[2],s,l,o,r.epsilon),m=[s,o,l/d],_=[s,o],y=["type","none"],b=S=>{let v=N("x",t[0].dataType,m.length,d),$=N("scale_shift",1,_.length,2),I=Q("output",t[0].dataType,m.length,d),T=[v,$,I];return`
  ${S.registerUniform("output_size","u32").declareVariables(...T)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${I.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${$.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${v.getByOffset("global_idx")} * ${I.type.value}(scale_shift.x) + ${I.type.value}(scale_shift.y);
      ${I.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${d}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},...J(m,_,m)]}),getShaderSource:b},{inputs:[t[0],c]})},Kl=(e,t,r)=>{let i=t[0].dims,a=i,n=i[0],s=i[i.length-1],o=B.sizeFromDimension(i,1)/s,l=xe(s),d=B.size(a)/l,h=[{type:12,data:o},{type:12,data:Math.floor(s/l)}],c=["type","type"],m=!1,_=[0,i.length-1];for(let v=0;v<i.length-2;v++)m=m||i[v+1]!==1,_.push(v+1);m=m&&i[i.length-1]!==1;let y=m?e.compute(Le(e.inputs[0],_),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(v,$)=>i[_[$]])),b=aa(e,y,t[1],t[2],n,o,s,r.epsilon),S=v=>{let $=ke(t[0].dataType),I=l===1?"vec2f":`mat${l}x2f`,T=A=>{let w=A===0?"x":"y",R=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${$}(${R}(scale.${w}))`;case 2:return`vec2<${$}>(${R}(scale[0].${w}, scale[1].${w}))`;case 4:return`vec4<${$}>(${R}(scale[0].${w}, scale[1].${w}, scale[2].${w}, scale[3].${w}))`;default:throw new Error(`Not supported compoents ${l}`)}},E=N("input",t[0].dataType,t[0].dims,l),C=Q("output",t[0].dataType,a,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${I}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${C.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${v.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${T(0)}, ${T(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:c},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h}),getShaderSource:S},{inputs:[t[0],b]})},Qh=(e,t)=>{t.format==="NHWC"?Kl(e,e.inputs,t):jl(e,e.inputs,t)}}),Xl,Zl,Yh,_0=P(()=>{te(),ie(),ae(),Xl=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},Zl=(e,t,r)=>{let i=t.simplified,a=e[0].dims,n=e[1],s=!i&&e[2],o=a,l=B.normalizeAxis(t.axis,a.length),d=B.sizeToDimension(a,l),h=B.sizeFromDimension(a,l),c=B.size(n.dims),m=s?B.size(s.dims):0;if(c!==h||s&&m!==h)throw new Error(`Size of X.shape()[axis:] == ${h}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${c} and bias size of ${m}`);let _=[];for(let E=0;E<a.length;++E)E<l?_.push(a[E]):_.push(1);let y=xe(h),b=["type","type"],S=[{type:12,data:d},{type:1,data:h},{type:12,data:Math.floor(h/y)},{type:1,data:t.epsilon}];s&&b.push("type");let v=r>1,$=r>2,I=E=>{let C=ke(e[0].dataType),A=[N("x",e[0].dataType,e[0].dims,y),N("scale",n.dataType,n.dims,y)];s&&A.push(N("bias",s.dataType,s.dims,y)),A.push(Q("output",e[0].dataType,o,y)),v&&A.push(Q("mean_data_output",1,_)),$&&A.push(Q("inv_std_output",1,_));let w=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${E.registerUniforms(w).declareVariables(...A)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${ka("f32",y)};
    var mean_square_vector = ${ka("f32",y)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Ht(C,y,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${$t("mean_vector",y)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${$t("mean_square_vector",y)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Ht(C,y,"x[j + offset]")};
      let f32scale = ${Ht(C,y,"scale[j]")};
      output[j + offset] = ${A[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${Ht(C,y,"bias[j]")}`:""}
      );
    }

    ${v?"mean_data_output[global_idx] = mean":""};
    ${$?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},T=[{dims:o,dataType:e[0].dataType}];return v&&T.push({dims:_,dataType:1}),$&&T.push({dims:_,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${y};${r};${i}`,inputDependencies:b},getRunData:()=>({outputs:T,dispatchGroup:{x:Math.ceil(d/64)},programUniforms:S}),getShaderSource:I}},Yh=(e,t)=>{Xl(e.inputs),e.compute(Zl(e.inputs,t,e.outputCount))}}),Ql,Jh,b0=P(()=>{ie(),dn(),pn(),Ql=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},Jh=e=>{Ql(e.inputs);let t=Ft.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(ln(e.inputs,{activation:""},t));else{let a=t[t.length-2],n=B.size(e.inputs[0].dims.slice(0,-2)),s=B.size(e.inputs[1].dims.slice(0,-2));if(n!==1&&a===1&&s===1){let o=e.inputs[0].reshape([1,n,i]),l=e.inputs[1].reshape([1,i,r]),d=[1,n,r],h=[o,l];e.compute(Qr(h,{activation:""},t,d),{inputs:h})}else e.compute(Qr(e.inputs,{activation:""},t))}}}),Yl,Jl,ed,ef,tf,w0=P(()=>{te(),ie(),Se(),ae(),Yl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),n=t.blockSize/8*t.bits,s=e[1];if(!B.areEqual(s.dims,[t.n,a,n]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let o=e[2].dims;if(B.size(o)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,d=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(B.size(l)!==d)throw new Error("zeroPoints input size error.")}},Jl=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,o=r.slice(0,i-2),l=B.size(o),d=e[1].dims[2]/4,h=e[0].dataType,c=xe(t.k),m=xe(d),_=xe(s),y=o.concat([a,s]),b=a>1&&s/_%2===0?2:1,S=B.size(y)/_/b,v=64,$=[],I=[l,a,n/c],T=B.convertShape(e[1].dims).slice();T.splice(-1,1,d/m),$.push(...J(I)),$.push(...J(T)),$.push(...J(e[2].dims)),e.length===4&&$.push(...J(B.convertShape(e[3].dims)));let E=[l,a,s/_];$.push(...J(E));let C=A=>{let w=I.length,R=N("a",e[0].dataType,w,c),M=N("b",12,T.length,m),U=N("scales",e[2].dataType,e[2].dims.length),G=[R,M,U],F=e.length===4?N("zero_points",12,e[3].dims.length):void 0;F&&G.push(F);let O=E.length,K=Q("output",e[0].dataType,O,_),X=ke(e[0].dataType),ee=(()=>{switch(c){case 1:return`array<${X}, 8>`;case 2:return`mat4x2<${X}>`;case 4:return`mat2x4<${X}>`;default:throw new Error(`${c}-component is not supported.`)}})(),he=Math.floor(32/t.bits),V=Math.floor(he/8),ue=()=>{let Z="";for(let q=0;q<V;q++){let me=q*t.bits*4,qe=me+t.bits;Z+=`
          // reuse a data (pass ${q})
            var input_offset${q>0?q:""} = ${q===0?R.indicesToOffset(`${R.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${q>0?q:""}: ${ee};
            for (var j${q>0?q:""}: u32 = 0; j${q>0?q:""} < ${8/c}; j${q>0?q:""}++) {
              a_data${q>0?q:""}[j${q>0?q:""}] = ${R.getByOffset(`input_offset${q>0?q:""}`)};
              input_offset${q>0?q:""}++;
            }
          `;for(let Te=0;Te<_*b;Te++)Z+=`
            b_value = ${m===1?`b${Te}_data`:`b${Te}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${q*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${me}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${qe}u) & b_mask);`}
            b_quantized_values = ${ee}(${Array.from({length:4},(Oe,Re)=>`${X}(b_value_lower[${Re}]), ${X}(b_value_upper[${Re}])`).join(", ")});
            b_dequantized_values = ${c===1?`${ee}(${Array.from({length:8},(Oe,Re)=>`(b_quantized_values[${Re}] - ${F?`zero_point${Te}`:"zero_point"}) * scale${Te}`).join(", ")});`:`(b_quantized_values - ${ee}(${Array(8).fill(`${F?`zero_point${Te}`:"zero_point"}`).join(",")})) * scale${Te};`};
            workgroup_shared[local_id.x * ${b} + ${Math.floor(Te/_)}]${_>1?`[${Te%_}]`:""} += ${Array.from({length:8/c},(Oe,Re)=>`${c===1?`a_data${q>0?q:""}[${Re}] * b_dequantized_values[${Re}]`:`dot(a_data${q>0?q:""}[${Re}], b_dequantized_values[${Re}])`}`).join(" + ")};
          `}return Z},L=()=>{let Z=`
            var col_index = col * ${_};
            ${F?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${X}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let q=0;q<_*b;q++)Z+=`
            let scale${q} = ${U.getByOffset("col_index * nBlocksPerCol + block")};
            ${F?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${F.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${q} = ${X}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return Z},H=()=>{let Z=`col_index = col * ${_};`;for(let q=0;q<_*b;q++)Z+=`
            let b${q}_data = ${M.getByIndices(`${M.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return Z+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${ee};
            var b_dequantized_values: ${ee};`,Z};return`
        var<workgroup> workgroup_shared: array<${K.type.value}, ${b*v}>;
        ${A.declareVariables(...G,K)}
        ${A.mainStart([v,1,1])}
          let output_indices = ${K.offsetToIndices(`(global_idx / ${v}) * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${v}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/c};
            ${L()}
            for (var word: u32 = 0; word < ${d}; word += ${m}) {
              ${H()}
              for (var i: u32 = 0; i < ${m}; i++) {
                ${ue()}
                word_offset += ${he/c};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${b}) {
            var output_value: ${K.type.value} = ${K.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${v}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${b};
            }
            ${K.setByIndices(`${K.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${c};${m};${_};${b};${v}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:h}],dispatchGroup:{x:S},programUniforms:$}),getShaderSource:C}},ed=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,o=r.slice(0,i-2),l=B.size(o),d=e[1].dims[2]/4,h=e[0].dataType,c=xe(t.k),m=xe(d),_=o.concat([a,s]),y=128,b=s%8===0?8:s%4===0?4:1,S=y/b,v=Math.floor(32/t.bits),$=S*m*v,I=$/c,T=$/t.blockSize,E=B.size(_)/b,C=[],A=[l,a,n/c],w=B.convertShape(e[1].dims).slice();w.splice(-1,1,d/m),C.push(...J(A)),C.push(...J(w)),C.push(...J(e[2].dims)),e.length===4&&C.push(...J(B.convertShape(e[3].dims)));let R=[l,a,s];C.push(...J(R));let M=U=>{let G=A.length,F=N("a",e[0].dataType,G,c),O=N("b",12,w.length,m),K=N("scales",e[2].dataType,e[2].dims.length),X=[F,O,K],ee=e.length===4?N("zero_points",12,e[3].dims.length):void 0;ee&&X.push(ee);let he=R.length,V=Q("output",e[0].dataType,he),ue=ke(e[0].dataType),L=()=>{switch(c){case 1:return`
          let a_data0 = vec4<${ue}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${ue}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${ue}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${ue}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${c}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${F.type.value}, ${I}>;
        var<workgroup> inter_results: array<array<${V.type.value}, ${S}>, ${b}>;
        ${U.declareVariables(...X,V)}
        ${U.mainStart([S,b,1])}
          let output_indices = ${V.offsetToIndices(`workgroup_index * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${T} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${I};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${I}; a_offset += ${y})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${F.getByIndices(`${F.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${F.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${T} + local_id.x;
            ${ee?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${ee.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${ue}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${ue}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${K.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${O.getByIndices(`${O.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/c};
            for (var i: u32 = 0; i < ${m}; i++) {
              let b_value = ${m===1?"b_data":"b_data[i]"};
              ${(()=>{let H=Math.floor(v/8),Z="";for(let q=0;q<H;q++){let me=q*t.bits*4,qe=me+t.bits;Z+=`
              ${L()}
              {${t.bits===2?`
                let half_word = b_value >> ${q*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${me}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${qe}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${ue}>(${Array.from({length:4},(Te,Oe)=>`${ue}(b_value_lower[${Oe}]), ${ue}(b_value_upper[${Oe}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${ue}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(Te,Oe)=>`${`dot(a_data${Oe}, b_dequantized_values[${Oe}])`}`).join(" + ")};
              }
              word_offset += ${8/c};`}return Z})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${b}) {
            var output_value: ${V.type.value} = ${V.type.value}(0);
            for (var b = 0u; b < ${S}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${V.setByIndices(`${V.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${c};${m};${S};${b}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:h}],dispatchGroup:{x:E},programUniforms:C}),getShaderSource:M}},ef=(e,t)=>{Yl(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(ed(e.inputs,t)):e.compute(Jl(e.inputs,t))},tf=e=>fe(e)}),td,rd,id,ad,nd,sd,od,ud,rf,$0=P(()=>{te(),ie(),ae(),td=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},rd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Y("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${Y("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},id=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Y("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Y("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Y("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},ad=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Y("uniforms.x_shape",a,t)})) {
                  k = i32(${Y("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${Y("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},nd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${Y("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${Y("uniforms.x_shape",a,t)})) {
                  k -= i32(${Y("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${Y("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},sd=(e,t,r)=>{switch(r.mode){case 0:return rd(e,t,r.pads.length);case 1:return id(e,t,r.pads.length);case 2:return ad(e,t,r.pads.length);case 3:return nd(e,t,r.pads.length);default:throw new Error("Invalid mode")}},od=(e,t)=>{let r=B.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=B.size(r),n=[{type:12,data:a},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&n.push({type:s?e[2].dataType:1,data:t.value}),n.push(...J(e[0].dims,r));let o=["rank"],l=d=>{let h=Q("output",e[0].dataType,r.length),c=N("x",e[0].dataType,i.length),m=c.type.value,_=sd(h,i.length,t),y=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&y.push({name:"constant_value",type:s?m:"f32"}),`
            ${d.registerUniforms(y).declareVariables(c,h)}
            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${h.offsetToIndices("global_idx")};

            var value = ${m}(0);
            ${_}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:o},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(B.size(r)/64)},programUniforms:n}),getShaderSource:l}},ud=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,n=new Int32Array(2*a).fill(0);if(e.length>=4){let o=e[3].getBigInt64Array();for(let l=0;l<o.length;l++)n[Number(o[l])]=Number(r[l]),n[Number(o[l])+a]=Number(r[l+o.length])}else r.forEach((o,l)=>n[Number(l)]=Number(o));let s=[];return n.forEach(o=>s.push(o)),{mode:t.mode,value:i,pads:s}}else return t},rf=(e,t)=>{td(e.inputs);let r=ud(e.inputs,t);e.compute(od(e.inputs,r),{inputs:[0]})}}),sr,na,sa,oa,ua,ld,dd,la,da,af,nf,pa,sf,of,ca,uf,lf,df,pf,v0=P(()=>{Ge(),te(),ie(),ae(),sr=e=>{if(_e.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},na=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let n=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),o=t.strides.slice(),l=n?t.dilations.slice():[],d=t.pads.slice();Xr.adjustPoolAttributes(r,a,s,o,l,d);let h=Xr.computePoolOutputShape(r,a,o,l,s,d,t.autoPad),c=Object.assign({},t);n?Object.assign(c,{kernelShape:s,strides:o,pads:d,dilations:l,cacheKey:t.cacheKey}):Object.assign(c,{kernelShape:s,strides:o,pads:d,cacheKey:t.cacheKey});let m=h.slice();return m.push(m.splice(1,1)[0]),[c,i?m:h]},sa=(e,t)=>{let r=t.format==="NHWC",i=B.size(e),a=B.size(t.kernelShape),n=[{type:12,data:i},{type:12,data:a}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let o=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],d=t.pads[t.pads.length/2-1],h=t.pads[t.pads.length-1],c=!!(d+h);n.push({type:12,data:o},{type:12,data:l},{type:12,data:d},{type:12,data:h}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let m=!1;if(t.kernelShape.length===2){let _=t.kernelShape[t.kernelShape.length-2],y=t.strides[t.strides.length-2],b=t.pads[t.pads.length/2-2],S=t.pads[t.pads.length-2];m=!!(b+S),n.push({type:12,data:_},{type:12,data:y},{type:12,data:b},{type:12,data:S}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[n,s,!0,c,m]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let o=B.computeStrides(t.kernelShape);n.push({type:12,data:o},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:o.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((d,h)=>d+h);return[n,s,!!l,!1,!1]}},oa=(e,t,r,i,a,n,s,o,l,d,h,c)=>{let m=a.format==="NHWC",_=t.type.value,y=Q("output",t.type.tensor,i);if(a.kernelShape.length<=2){let b="",S="",v="",$=r-(m?2:1);if(h?b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${$}] = indices[${$}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${$}] < 0 || xIndices[${$}]
                      >= uniforms.x_shape[${$}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`:b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${$}] = indices[${$}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`,a.kernelShape.length===2){let I=r-(m?3:2);c?S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${I}] < 0 || xIndices[${I}] >= uniforms.x_shape[${I}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                `,v=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var value = ${_}(${o});
              var pad = 0;
              ${S}
              ${b}
              ${v}
              ${s}

              output[global_idx] = value;
            }`}else{if(m)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let b=a.kernelShape.length,S=a.pads.length,v="";return d?v=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${n}
              }`:v=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${n}
            `,`
            ${e.registerUniforms(l).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var offsets: array<u32, ${b}>;

              var value = ${_}(${o});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${b-1}u; j++) {
                  offsets[j] = offset / ${Y("uniforms.kernelStrides","j",b)};
                  offset -= offsets[j] * ${Y("uniforms.kernelStrides","j",b)};
                }
                offsets[${b-1}] = offset;

                isPad = false;
                for (var j = ${r-b}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Y("uniforms.strides",`j - ${r-b}u`,b)}
                    + offsets[j - ${r-b}u] - ${Y("uniforms.pads","j - 2u",S)};
                  ${v}
              }
              ${s}

              output[global_idx] = value;
            }`}},ua=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,ld=e=>`${ua(e)};${e.countIncludePad}`,dd=e=>`${ua(e)};${e.storageOrder};${e.dilations}`,la=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),da=(e,t,r,i)=>{let[a,n]=na(t,i,r),s=N("x",t.dataType,t.dims.length),o=s.type.value,l="value += x_val;",d="";a.countIncludePad?d+=`value /= ${o}(uniforms.kernelSize);`:d+=`value /= ${o}(i32(uniforms.kernelSize) - pad);`;let[h,c,m,_,y]=sa(n,a);h.push(...J(t.dims,n));let b=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${m};${_};${y}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(B.size(n)/64)},programUniforms:h}),getShaderSource:S=>oa(S,s,t.dims.length,n.length,a,l,d,0,c,m,_,y)}},af=e=>{let t=e.count_include_pad!==0,r=la(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:ld(i)}},nf=(e,t)=>{sr(e.inputs),e.compute(da("AveragePool",e.inputs[0],!1,t))},pa={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},sf=e=>{let t=e.format;return{format:t,...pa,cacheKey:t}},of=(e,t)=>{sr(e.inputs),e.compute(da("GlobalAveragePool",e.inputs[0],!0,t))},ca=(e,t,r,i)=>{let[a,n]=na(t,i,r),s=`
      value = max(x_val, value);
    `,o="",l=N("x",t.dataType,t.dims.length),d=["rank"],[h,c,m,_,y]=sa(n,a);return h.push(...J(t.dims,n)),{name:e,shaderCache:{hint:`${i.cacheKey};${m};${_};${y}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(B.size(n)/64)},programUniforms:h}),getShaderSource:b=>oa(b,l,t.dims.length,n.length,a,s,o,t.dataType===10?-65504:-1e5,c,m,_,y)}},uf=(e,t)=>{sr(e.inputs),e.compute(ca("MaxPool",e.inputs[0],!1,t))},lf=e=>{let t=e.storage_order,r=e.dilations,i=la(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:dd(a)}},df=e=>{let t=e.format;return{format:t,...pa,cacheKey:t}},pf=(e,t)=>{sr(e.inputs),e.compute(ca("GlobalMaxPool",e.inputs[0],!0,t))}}),pd,cd,cf,hf,x0=P(()=>{te(),ie(),Se(),ae(),pd=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,n)=>n===t.axis||a===e[0].dims[n]).reduce((a,n)=>a&&n,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},cd=(e,t)=>{let r=B.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,n=e[0].dims,s=e[1].dataType,o=B.size(n),l=i===3||i===2,d=l?[Math.ceil(B.size(e[0].dims)/4)]:e[0].dims,h=e[1].dims,c=e.length>2?e[2]:void 0,m=c?l?[Math.ceil(B.size(c.dims)/4)]:c.dims:void 0,_=h.length===0||h.length===1&&h[0]===1,y=_===!1&&h.length===1,b=xe(o),S=_&&(!l||b===4),v=S?b:1,$=S&&!l?b:1,I=N("input",l?12:i,d.length,$),T=N("scale",s,h.length),E=c?N("zero_point",l?12:i,m.length):void 0,C=Q("output",s,n.length,v),A=[I,T];E&&A.push(E);let w=[d,h];c&&w.push(m);let R=[{type:12,data:o/v},{type:12,data:r},{type:12,data:t.blockSize},...J(...w,n)],M=U=>{let G=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${U.registerUniforms(G).declareVariables(...A,C)}
      ${U.mainStart()}
          ${U.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${C.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${I.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${v===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${I.getByOffset("global_idx")};`};

          // Set scale input
          ${_?`let scale_value= ${T.getByOffset("0")}`:y?`
            let scale_index = ${C.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${T.getByOffset("scale_index")};`:`
            var scale_indices: ${T.type.indices} = output_indices;
            let index = ${T.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${T.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${T.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E?_?l?`
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${E.getByOffset("0")}`:y?l?`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${T.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${E.getByIndices("scale_indices")};`:`let zero_point_value = ${l?a?"i32":"u32":I.type.value}(0);`};
      // Compute and write output
      ${C.setByOffset("global_idx",`${C.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:E?["rank","rank","rank"]:["rank","rank"]},getShaderSource:M,getRunData:()=>({outputs:[{dims:n,dataType:s}],dispatchGroup:{x:Math.ceil(o/v/64),y:1,z:1},programUniforms:R})}},cf=(e,t)=>{pd(e.inputs,t),e.compute(cd(e.inputs,t))},hf=e=>fe({axis:e.axis,blockSize:e.blockSize})}),hd,fd,ff,S0=P(()=>{Ge(),te(),ae(),hd=(e,t,r)=>{let i=e===t,a=e<t&&r<0,n=e>t&&r>0;if(i||a||n)throw new Error("Range these inputs' contents are invalid.")},fd=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),n=[a],s=a,o=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...J(n)],l=d=>{let h=Q("output",i,n.length),c=h.type.value,m=[{name:"outputSize",type:"u32"},{name:"start",type:c},{name:"delta",type:c}];return`
        ${d.registerUniforms(m).declareVariables(h)}
        ${d.mainStart()}
        ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${c}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:n,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:o})}},ff=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),_e.webgpu.validateInputContent&&hd(t,r,i),e.compute(fd(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),md,gd,mf,gf,T0=P(()=>{te(),ie(),Se(),ae(),md=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,n=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${n}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${n}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${n}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${n}`;default:throw new Error(`Reduction ${e} is not supported.`)}},gd=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,n=1,s=Math.ceil(B.sizeToDimension(i,i.length-1)/n),o=i[i.length-1],l=B.sizeFromDimension(r,o),d=[{type:12,data:s},{type:12,data:o},{type:12,data:l},...J(e[1].dims,e[2].dims,a)],h=c=>{let m=N("indices",e[1].dataType,e[1].dims.length),_=N("updates",e[2].dataType,e[2].dims.length,n),y=t.reduction!=="none"&&t.reduction!==""?Vp("output",e[0].dataType,a.length):Q("output",e[0].dataType,a.length,n);return`
      ${c.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(m,_,y)}
      ${c.mainStart()}
        ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${md(t.reduction,"output[data_offset + i]","value",y.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:d}),getShaderSource:h}},mf=e=>fe({reduction:e.reduction}),gf=(e,t)=>{e.compute(gd(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),yd,_d,bd,ha,wd,$d,vd,xd,Sd,Td,Id,kd,fa,Ed,Cd,zd,Ad,Od,yf,_f,I0=P(()=>{te(),ie(),Se(),ae(),yd=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},_d=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,n)=>i[a]=e[n]),i},bd=(e,t,r,i,a,n)=>{let[s,o,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],d=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(h=>n.push(h));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(o>0&&e.length>o&&e[o].dims.length===1&&e[o].dims[0]>0){if(e[o].getFloat32Array().forEach(h=>i.push(h)),i.length!==0&&i.length!==d&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");yd(i,t),t.axes.length>0&&_d(i,t.axes,d).forEach((h,c)=>i[c]=h)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach(h=>a.push(Number(h))),a.length!==0&&a.length!==d&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>d)throw new Error("Resize requires only of scales or sizes to be specified")},ha=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,wd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${ha("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${ha("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",$d=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";case"simple":default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",vd=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((n,s)=>{i[n]=a[s],i[s+r]=a[t.length+s]}),i):a},xd=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(n=>a.push(n)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((n,s)=>a[n]=r[s])}else r.forEach(n=>a.push(n));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((n,s)=>Math.round(n*t[s]))}return a},Sd=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(n=>t[n]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(n=>t[n]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(n=>t[n]=i),r.axes.forEach(n=>a[n]=Math.round(e[n]*t[n]))):(t.fill(i,0,t.length),a.forEach((n,s)=>a[s]=Math.round(n*t[s]))),a},Td=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Y("uniforms.scales","i",i)};
        var roi_low = ${Y("uniforms.roi","i",a)};
        var roi_hi = ${Y("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Y("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Y("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Id=(e,t,r,i,a,n,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Y("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Y("uniforms.roi","i",n)};
          var roi_hi = ${Y("uniforms.roi",`i + ${r.length}`,n)};
          var input_shape_i = ${Y("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Y("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,kd=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Y("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,fa=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Ed=(e,t,r,i,a)=>{let[n,s,o,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],d=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${d} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(col, ${r[o]} - 1))`)};
      ${fa(e,l,n,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${d} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${d} = originalIndices[${s}];
      var col:${d} = originalIndices[${o}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[o]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[o]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${n}])`:"0"};
      var x11: ${d} = getInputValue(batch, channel, row1, col1);
      var x12: ${d} = getInputValue(batch, channel, row1, col2);
      var x21: ${d} = getInputValue(batch, channel, row2, col1);
      var x22: ${d} = getInputValue(batch, channel, row2, col2);
      var dx1: ${d} = abs(row - ${d}(row1));
      var dx2: ${d} = abs(${d}(row2) - row);
      var dy1: ${d} = abs(col - ${d}(col1));
      var dy2: ${d} = abs(${d}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},Cd=(e,t,r,i,a,n,s,o,l,d)=>{let h=r.length===2,[c,m]=h?[0,1]:[2,3],_=e.type.value,y=b=>{let S=b===c?"row":"col";return`
      fn ${S}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${_} {
        var output_index = ${t.indicesGet("output_indices",b)};
        var originalIdx: ${_} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[b]},
        ${i[b]}, ${r[b]}, ${n[b]}, ${n[b]} + ${r.length});
        var fractOriginalIdx: ${_} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${o} && (originalIdx < 0 || originalIdx > (${r[b]} - 1))) {
          return ${l};
        }
        var data: array<${_}, 4> = array<${_}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${S}: ${_} = originalIdx + ${_}(i);
          if (${S} < 0 || ${S} >= ${r[b]}) {
            ${d?`coefs[i + 1] = 0.0;
                        continue;`:o?`return ${l};`:`${S} = max(0, min(${S}, ${r[b]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",b,`u32(${S})`)};
          data[i + 1] = ${b===c?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${y(c)};
    ${y(m)};
  fn getCubicInterpolationCoefs(s: ${_}) -> array<${_}, 4> {
    var absS = abs(s);
    var coeffs: array<${_}, 4> = array<${_}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${_} = 1.0 - absS;
    var twoMinusAbsS: ${_} = 2.0 - absS;
    var onePlusAbsS: ${_} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${_}, 4>, coefs: array<${_}, 4>) -> ${_} {
    var coefsSum: ${_} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${_} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},zd=(e,t,r,i,a)=>{let[n,s,o,l,d]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],h=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${h} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(height, ${r[o]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${fa(e,d,n,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${h} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${h} = originalIndices[${s}];
      var height:${h} = originalIndices[${o}];
      var width:${h} = originalIndices[${l}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[o]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[o]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${n}])`:"0"};

      var x111: ${h} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${h} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${h} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${h} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${h} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${h} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${h} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${h} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${h} = abs(depth - ${h}(depth1));
      var dx2: ${h} = abs(${h}(depth2) - depth);
      var dy1: ${h} = abs(height - ${h}(height1));
      var dy2: ${h} = abs(${h}(height2) - height);
      var dz1: ${h} = abs(width - ${h}(width1));
      var dz2: ${h} = abs(${h}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},Ad=(e,t,r,i,a,n)=>{let s=e.dims,o=vd(n,t.axes,s.length),l=xd(s,i,a,t.axes),d=i.slice();i.length===0&&(d=s.map(($,I)=>$===0?1:l[I]/$),t.keepAspectRatioPolicy!=="stretch"&&(l=Sd(s,d,t)));let h=Q("output",e.dataType,l.length),c=N("input",e.dataType,s.length),m=B.size(l),_=s.length===l.length&&s.every(($,I)=>$===l[I]),y=t.coordinateTransformMode==="tf_crop_and_resize",b=t.extrapolationValue,S=c.type.value,v=$=>`
      ${_?"":`
      ${wd(t.coordinateTransformMode,S)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${kd(c,s)};
              ${$d(t.nearestMode,r,S)};
              ${Id(c,h,s,l,d.length,o.length,y)};
              `;case"linear":return`
              ${Td(h,s,l,d.length,o.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${Ed(c,h,s,y,b)}`;if(s.length===3||s.length===5)return`${zd(c,h,s,y,b)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${Cd(c,h,s,l,d,o,t.cubicCoeffA,y,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${$.registerUniform("output_size","u32").registerUniform("scales","f32",d.length).registerUniform("roi","f32",o.length).declareVariables(c,h)}
      ${$.mainStart()}
        ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${_?"output[global_idx] = input[global_idx];":`
        let output_indices = ${h.offsetToIndices("global_idx")};
        var input_indices: ${c.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${c.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${d.length>0?t.mode==="cubic"?d:d.length:""}|${a.length>0?a:""}|${o.length>0?o:""}|${_}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:v,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:[{type:12,data:m},{type:1,data:d},{type:1,data:o},...J(s,l)]})}},Od=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},yf=(e,t)=>{let r=[],i=[],a=[],n=Od(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");bd(e.inputs,t,n,r,i,a),e.compute(Ad(e.inputs[0],t,n,r,i,a),{inputs:[0]})},_f=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,n=e.excludeOutside!==0,s=e.extrapolationValue,o=e.keepAspectRatioPolicy,l=e.mode,d=e.nearestMode===""?"simple":e.nearestMode;return fe({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:n,extrapolationValue:s,keepAspectRatioPolicy:o,mode:l,nearestMode:d})}}),Rd,Bd,bf,k0=P(()=>{te(),ie(),ae(),Rd=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],n=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==n)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},Bd=(e,t,r,i)=>{let a=t.simplified,n=e[0].dims,s=B.size(n),o=n,l=s,d=n.slice(-1)[0],h=i?n.slice(0,-1).concat(1):[],c=!a&&e.length>3,m=e.length>4,_=i&&r>1,y=i&&r>2,b=r>3,S=64,v=xe(d),$=[{type:12,data:l},{type:12,data:v},{type:12,data:d},{type:1,data:t.epsilon}],I=E=>{let C=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],A=[N("x",e[0].dataType,e[0].dims,v),N("skip",e[1].dataType,e[1].dims,v),N("gamma",e[2].dataType,e[2].dims,v)];c&&A.push(N("beta",e[3].dataType,e[3].dims,v)),m&&A.push(N("bias",e[4].dataType,e[4].dims,v)),A.push(Q("output",e[0].dataType,o,v)),_&&A.push(Q("mean_output",1,h)),y&&A.push(Q("inv_std_output",1,h)),b&&A.push(Q("input_skip_bias_sum",e[0].dataType,o,v));let w=ke(e[0].dataType),R=ke(1,v);return`

      ${E.registerUniforms(C).declareVariables(...A)}
      var<workgroup> sum_shared : array<${R}, ${S}>;
      var<workgroup> sum_squared_shared : array<${R}, ${S}>;

      ${E.mainStart([S,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${S};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${S};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${S-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${m?"bias[offset1d + i]":w+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${b?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${Ht(w,v,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${S};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${$t("sum",v)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${$t("square_sum",v)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${_?"mean_output[global_idx] = mean;":""}
        ${y?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${w}(mean)`}) *
            ${w}(inv_std_dev) * gamma[offset1d + i]
            ${c?"+ beta[offset1d + i]":""};
        }
      }`},T=[{dims:o,dataType:e[0].dataType}];return r>1&&T.push({dims:h,dataType:1}),r>2&&T.push({dims:h,dataType:1}),r>3&&T.push({dims:n,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${v};${_};${y};${b}`,inputDependencies:e.map((E,C)=>"type")},getShaderSource:I,getRunData:()=>({outputs:T,dispatchGroup:{x:Math.ceil(l/d)},programUniforms:$})}},bf=(e,t)=>{Rd(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(Bd(e.inputs,t,e.outputCount,!1),{outputs:r})}}),Md,or,Dd,ma,Nd,Pd,wf,$f,E0=P(()=>{te(),ie(),Se(),ae(),Md=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},or=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},Dd=(e,t)=>{if(e.length>1){let r=or(e,1),i=or(e,2),a=or(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),fe({starts:r,ends:i,axes:a})}else return t},ma=(e,t,r,i,a)=>{let n=e;return e<0&&(n+=r[i[t]]),a[t]<0?Math.max(0,Math.min(n,r[i[t]]-1)):Math.max(0,Math.min(n,r[i[t]]))},Nd=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Y("uniforms.input_shape","i",r.length)};
            let steps_i = ${Y("uniforms.steps","i",r.length)};
            let signs_i = ${Y("uniforms.signs","i",r.length)};
            let starts_i = ${Y("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,Pd=(e,t)=>{let r=e[0].dims,i=B.size(r),a=t.axes.length>0?B.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],n=or(e,4);n.forEach(v=>v!==0||(()=>{throw new Error("step cannot be 0")})),n.length===0&&(n=Array(a.length).fill(1));let s=t.starts.map((v,$)=>ma(v,$,r,a,n)),o=t.ends.map((v,$)=>ma(v,$,r,a,n));if(a.length!==s.length||a.length!==o.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let v=0;v<r.length;++v)a.includes(v)||(s.splice(v,0,0),o.splice(v,0,r[v]),n.splice(v,0,1));let l=n.map(v=>Math.sign(v));n.forEach((v,$,I)=>{if(v<0){let T=(o[$]-s[$])/v,E=s[$],C=E+T*n[$];s[$]=C,o[$]=E,I[$]=-v}});let d=r.slice(0);a.forEach((v,$)=>{d[v]=Math.ceil((o[v]-s[v])/n[v])});let h={dims:d,dataType:e[0].dataType},c=Q("output",e[0].dataType,d.length),m=N("input",e[0].dataType,e[0].dims.length),_=B.size(d),y=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:n.length}],b=[{type:12,data:_},{type:12,data:s},{type:6,data:l},{type:12,data:n},...J(e[0].dims,d)],S=v=>`
      ${v.registerUniforms(y).declareVariables(m,c)}
        ${Nd(m,c,r)}
        ${v.mainStart()}
          ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${c.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${c.setByOffset("global_idx",m.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${s.length}_${n.length}`,inputDependencies:["rank"]},getShaderSource:S,getRunData:()=>({outputs:[h],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:b})}},wf=(e,t)=>{Md(e.inputs,t);let r=Dd(e.inputs,t);e.compute(Pd(e.inputs,r),{inputs:[0]})},$f=e=>{let t=e.starts,r=e.ends,i=e.axes;return fe({starts:t,ends:r,axes:i})}}),Ud,Ld,vf,xf,C0=P(()=>{te(),ie(),Se(),vt(),ae(),Ud=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},Ld=(e,t)=>{let r=e.inputs[0],i=r.dims,a=B.size(i),n=i.length,s=B.normalizeAxis(t.axis,n),o=s<i.length-1,l,d=[];o?(d=Array.from({length:n},(A,w)=>w),d[s]=n-1,d[n-1]=s,l=e.compute(Le(r,d),{inputs:[r],outputs:[-1]})[0]):l=r;let h=l.dims,c=h[n-1],m=a/c,_=xe(c),y=c/_,b=64;m===1&&(b=256);let S=(A,w)=>w===4?`max(max(${A}.x, ${A}.y), max(${A}.z, ${A}.w))`:w===2?`max(${A}.x, ${A}.y)`:w===3?`max(max(${A}.x, ${A}.y), ${A}.z)`:A,v=N("x",l.dataType,l.dims,_),$=Q("result",l.dataType,l.dims,_),I=v.type.value,T=ke(l.dataType)==="f32"?`var threadMax = ${I}(-3.4028234663852886e+38f);`:`var threadMax = ${I}(-65504.0h);`,E=A=>`
      var<workgroup> rowMaxShared : ${I};
      var<workgroup> rowSumShared : ${I};
      var<workgroup> threadShared : array<${I}, ${b}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${I} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${I}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${A.registerUniform("packedCols","i32").declareVariables(v,$)}
      ${A.mainStart(b)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${b};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${T}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${I}(${S("threadShared[0]",_)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${I}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${I}(${$t("threadShared[0]",_)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${I}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,C=e.compute({name:"Softmax",shaderCache:{hint:`${_};${b}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:h,dataType:l.dataType}],dispatchGroup:{x:m},programUniforms:[{type:6,data:y}]}),getShaderSource:E},{inputs:[l],outputs:[o?-1:0]})[0];o&&e.compute(Le(C,d),{inputs:[C]})},vf=(e,t)=>{Ud(e.inputs),Ld(e,t)},xf=e=>fe({axis:e.axis})}),ga,qd,Wd,Vd,Sf,z0=P(()=>{te(),ie(),ae(),ga=e=>Array.from(e.getBigInt64Array(),Number),qd=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(ga(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},Wd=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},Vd=(e,t)=>{let r=e[0].dims,i=t??ga(e[1]),a=Wd(r,i),n=B.size(a),s=e[0].dataType,o=N("input",s,r.length),l=Q("output",s,a.length),d=h=>`
      const inputShape = ${o.indices(...r)};
      ${h.registerUniform("output_size","u32").declareVariables(o,l)}
      ${h.mainStart()}
      ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${o.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${o.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${o.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",o.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},...J(e[0].dims,a)]}),getShaderSource:d}},Sf=e=>{qd(e.inputs),e.compute(Vd(e.inputs),{inputs:[0]})}}),Gd,Hd,Tf,A0=P(()=>{te(),ie(),ae(),Gd=(e,t,r,i,a)=>{let n=Q("output_data",a,r.length,4),s=N("a_data",t[1].dataType,t[1].dims.length,4),o=N("b_data",t[2].dataType,t[2].dims.length,4),l=N("c_data",t[0].dataType,t[0].dims.length,4),d,h=(c,m,_)=>`select(${m}, ${c}, ${_})`;if(!i)d=n.setByOffset("global_idx",h(s.getByOffset("global_idx"),o.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let c=(m,_,y="")=>{let b=`a_data[index_a${_}][component_a${_}]`,S=`b_data[index_b${_}][component_b${_}]`,v=`bool(c_data[index_c${_}] & (0xffu << (component_c${_} * 8)))`;return`
            let output_indices${_} = ${n.offsetToIndices(`global_idx * 4u + ${_}u`)};
            let offset_a${_} = ${s.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let offset_b${_} = ${o.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let offset_c${_} = ${l.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let index_a${_} = offset_a${_} / 4u;
            let index_b${_} = offset_b${_} / 4u;
            let index_c${_} = offset_c${_} / 4u;
            let component_a${_} = offset_a${_} % 4u;
            let component_b${_} = offset_b${_} % 4u;
            let component_c${_} = offset_c${_} % 4u;
            ${m}[${_}] = ${y}(${h(b,S,v)});
          `};a===9?d=`
            var data = vec4<u32>(0);
            ${c("data",0,"u32")}
            ${c("data",1,"u32")}
            ${c("data",2,"u32")}
            ${c("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:d=`
            ${c("output_data[global_idx]",0)}
            ${c("output_data[global_idx]",1)}
            ${c("output_data[global_idx]",2)}
            ${c("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,s,o,n)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${d}
      }`},Hd=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,n=!(B.areEqual(t,r)&&B.areEqual(r,i)),s=t,o=B.size(t);if(n){let d=Ft.calcShape(Ft.calcShape(t,r,!1),i,!1);if(!d)throw new Error("Can't perform where op on the given tensors");s=d,o=B.size(s)}let l=Math.ceil(o/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:d=>Gd(d,e,s,n,a),getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(o/64/4)},programUniforms:[{type:12,data:l},...J(i,t,r,s)]})}},Tf=e=>{e.compute(Hd(e.inputs))}}),If,O0=P(()=>{Fy(),nn(),jy(),Ky(),Xy(),Zy(),Qy(),r0(),a0(),n0(),s0(),o0(),u0(),l0(),d0(),p0(),c0(),h0(),f0(),m0(),g0(),y0(),_0(),b0(),w0(),Gh(),$0(),v0(),x0(),S0(),T0(),an(),I0(),Xh(),k0(),E0(),C0(),jh(),z0(),vt(),sn(),A0(),If=new Map([["Abs",[_c]],["Acos",[bc]],["Acosh",[wc]],["Add",[eh]],["ArgMax",[fc,Ca]],["ArgMin",[hc,Ca]],["Asin",[$c]],["Asinh",[vc]],["Atan",[xc]],["Atanh",[Sc]],["Attention",[mc]],["AveragePool",[nf,af]],["BatchNormalization",[gc]],["BiasAdd",[yc]],["BiasSplitGelu",[Jc]],["Cast",[Ic,Tc]],["Ceil",[Ec]],["Clip",[kc]],["Concat",[dh,ph]],["Conv",[Ma,Ba]],["ConvTranspose",[$h,wh]],["Cos",[Cc]],["Cosh",[zc]],["CumSum",[vh,xh]],["DepthToSpace",[Sh,Th]],["DequantizeLinear",[cf,hf]],["Div",[th]],["Einsum",[Ih,kh]],["Elu",[Ac,cr]],["Equal",[rh]],["Erf",[Oc]],["Exp",[Rc]],["Expand",[Eh]],["FastGelu",[Ch]],["Floor",[Bc]],["FusedConv",[Ma,Ba]],["Gather",[Ah,zh]],["GatherElements",[Nh,Dh]],["GatherBlockQuantized",[Bh,Mh]],["GatherND",[Oh,Rh]],["Gelu",[Mc]],["Gemm",[Uh,Ph]],["GlobalAveragePool",[of,sf]],["GlobalMaxPool",[pf,df]],["Greater",[sh]],["GreaterOrEqual",[uh]],["GridSample",[Lh,qh]],["GroupQueryAttention",[Zh]],["HardSigmoid",[Vc,Wc]],["InstanceNormalization",[Qh]],["LayerNormalization",[Yh]],["LeakyRelu",[Dc,cr]],["Less",[oh]],["LessOrEqual",[lh]],["Log",[Qc]],["MatMul",[Jh]],["MatMulNBits",[ef,tf]],["MaxPool",[uf,lf]],["Mul",[ih]],["MultiHeadAttention",[Vh,Wh]],["Neg",[Pc]],["Not",[Nc]],["Pad",[rf]],["Pow",[ah]],["QuickGelu",[Yc,cr]],["Range",[ff]],["Reciprocal",[Uc]],["ReduceMin",[uc]],["ReduceMean",[ic]],["ReduceMax",[oc]],["ReduceSum",[dc]],["ReduceProd",[lc]],["ReduceL1",[ac]],["ReduceL2",[nc]],["ReduceLogSum",[cc]],["ReduceLogSumExp",[sc]],["ReduceSumSquare",[pc]],["Relu",[Lc]],["Resize",[yf,_f]],["RotaryEmbedding",[Kh]],["ScatterND",[gf,mf]],["Sigmoid",[qc]],["Sin",[Gc]],["Sinh",[Hc]],["Slice",[wf,$f]],["SkipLayerNormalization",[bf]],["Split",[Hh,Fh]],["Sqrt",[Fc]],["Softmax",[vf,xf]],["Sub",[nh]],["Tan",[jc]],["Tanh",[Kc]],["ThresholdedRelu",[Zc,cr]],["Tile",[Sf]],["Transpose",[Hp,Fp]],["Where",[Tf]]])}),kf,R0=P(()=>{Ge(),lt(),ae(),kf=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){Je(e.programInfo.name);let n=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let o=[];for(let d of t)o.push({binding:o.length,resource:{buffer:d.buffer}});for(let d of r)o.push({binding:o.length,resource:{buffer:d.buffer}});a&&o.push({binding:o.length,resource:a});let l=n.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:o,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let d={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(d)}s.setPipeline(e.computePipeline),s.setBindGroup(0,l),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Ve(e.programInfo.name)}dispose(){}build(e,t){Je(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(d=>{r.features.has(d.feature)&&i.push(`enable ${d.extension};`)});let a=Gp(t,this.backend.device.limits),n=e.getShaderSource(a),s=`${i.join(`
`)}
${a.additionalImplementations}
${n}`,o=r.createShaderModule({code:s,label:e.name});de("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let l=r.createComputePipeline({compute:{module:o,entryPoint:"main"},layout:"auto",label:e.name});return Ve(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let n=t*r*i,s=Math.ceil(Math.sqrt(n));if(s>a){if(s=Math.ceil(Math.cbrt(n)),s>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),Ef={};Kt(Ef,{WebGpuBackend:()=>Cf});var Fd,jd,Kd,Cf,B0=P(()=>{Ge(),te(),lt(),Up(),Gy(),O0(),R0(),Fd=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let n=e[i].dims.length;r.push(`${a};${n}`);break}case"dims":{let n=e[i].dims.join(",");r.push(`${a};${n}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},jd=(e,t,r)=>{var a,n;let i=e.name;return(a=e.shaderCache)!=null&&a.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${Fd(t,((n=e.shaderCache)==null?void 0:n.inputDependencies)??new Array(t.length).fill("dims"))}`,i},Kd=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},Cf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=n=>t.features.has(n)&&r.push(n)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i),this.adapterInfo=new Kd(t.info||await t.requestAdapterInfo()),this.gpuDataManager=Wp(this),this.programManager=new kf(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Ja(e.logLevel,!!e.debug),this.device.onuncapturederror=n=>{n.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${n.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){var e;typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&((e=this.env)!=null&&e.webgpu)&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Je(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{var i;let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let a=0;a<t.length/2;a++){let n=r[a],s=n.kernelId,o=this.kernels.get(s),l=o.kernelType,d=o.kernelName,h=n.programName,c=n.inputTensorViews,m=n.outputTensorViews,_=t[a*2],y=t[a*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=_);let b=Number(_-this.queryTimeBase),S=Number(y-this.queryTimeBase);if(!Number.isSafeInteger(b)||!Number.isSafeInteger(S))throw new RangeError("incorrect timestamp range");if((i=this.env.webgpu.profiling)!=null&&i.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:c.map(v=>({dims:v.dims,dataType:ut(v.dataType)})),outputsMetadata:m.map(v=>({dims:v.dims,dataType:ut(v.dataType)})),kernelId:s,kernelType:l,kernelName:d,programName:h,startTime:b,endTime:S});else{let v="";c.forEach((I,T)=>{v+=`input[${T}]: [${I.dims}] | ${ut(I.dataType)}, `});let $="";m.forEach((I,T)=>{$+=`output[${T}]: [${I.dims}] | ${ut(I.dataType)}, `}),console.log(`[profiling] kernel "${s}|${l}|${d}|${h}" ${v}${$}start time: ${b} ns, execution time: ${S-b} ns`)}gr("GPU",`${h}::${_}::${y}`)}e.unmap(),this.pendingQueries.delete(e)}),Ve()}run(e,t,r,i,a,n){Je(e.name);let s=[];for(let $=0;$<t.length;++$){let I=t[$].data;if(I===0)continue;let T=this.gpuDataManager.get(I);if(!T)throw new Error(`no GPU data for input: ${I}`);s.push(T)}let{outputs:o,dispatchGroup:l,programUniforms:d}=e.getRunData(t),h=r.length===0?o.map(($,I)=>I):r;if(h.length!==o.length)throw new Error(`Output size ${h.length} must be equal to ${o.length}.`);let c=[],m=[];for(let $=0;$<o.length;++$){if(!Number.isInteger(h[$])||h[$]<-3||h[$]>=n)throw new Error(`Invalid output index: ${h[$]}`);if(h[$]===-3)continue;let I=h[$]===-1,T=h[$]===-2,E=I||T?a(o[$].dataType,o[$].dims):i(h[$],o[$].dataType,o[$].dims);if(c.push(E),E.data===0)continue;let C=this.gpuDataManager.get(E.data);if(!C)throw new Error(`no GPU data for output: ${E.data}`);if(I&&this.temporaryData.push(C),T){let A=this.kernelPersistentData.get(this.currentKernelId);A||(A=[],this.kernelPersistentData.set(this.currentKernelId,A)),A.push(C)}m.push(C)}if(s.length!==t.length||m.length!==c.length){if(m.length===0)return Ve(e.name),c;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let _;if(d){let $=0,I=[];d.forEach(A=>{let w=typeof A.data=="number"?[A.data]:A.data;if(w.length===0)return;let R=A.type===10?2:4,M,U;A.type===10?(U=w.length>4?16:w.length>2?8:w.length*R,M=w.length>4?16:R*w.length):(U=w.length<=2?w.length*R:16,M=16),$=Math.ceil($/U)*U,I.push($);let G=A.type===10?8:4;$+=w.length>4?Math.ceil(w.length/G)*M:w.length*R});let T=16;$=Math.ceil($/T)*T;let E=new ArrayBuffer($);d.forEach((A,w)=>{let R=I[w],M=typeof A.data=="number"?[A.data]:A.data;if(A.type===6)new Int32Array(E,R,M.length).set(M);else if(A.type===12)new Uint32Array(E,R,M.length).set(M);else if(A.type===10)new Uint16Array(E,R,M.length).set(M);else if(A.type===1)new Float32Array(E,R,M.length).set(M);else throw new Error(`Unsupported uniform type: ${ut(A.type)}`)});let C=this.gpuDataManager.create($,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(C.buffer,0,E,0,$),this.gpuDataManager.release(C.id),_={offset:0,size:$,buffer:C.buffer}}let y=this.programManager.normalizeDispatchGroupSize(l),b=y[1]===1&&y[2]===1,S=jd(e,t,b),v=this.programManager.getArtifact(S);if(v||(v=this.programManager.build(e,y),this.programManager.setArtifact(S,v),de("info",()=>`[artifact] key: ${S}, programName: ${e.name}`)),d&&v.uniformVariablesInfo){if(d.length!==v.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${v.uniformVariablesInfo.length}, got ${d.length} in program "${v.programInfo.name}".`);for(let $=0;$<d.length;$++){let I=d[$],T=I.type,E=typeof I.data=="number"?1:I.data.length,[C,A]=v.uniformVariablesInfo[$];if(T!==C||E!==A)throw new Error(`Uniform variable ${$} mismatch: expect type ${C} with size ${A}, got type ${T} with size ${E} in program "${v.programInfo.name}".`)}}if(de("info",()=>`[ProgramManager] run "${e.name}" (key=${S}) with ${y[0]}x${y[1]}x${y[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let $={kernelId:this.currentKernelId,programName:v.programInfo.name,inputTensorViews:t,outputTensorViews:c};this.pendingKernels.push($),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push($)}return this.programManager.run(v,s,m,y,_),Ve(e.name),c}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=If.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let n={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,n)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,n=i.kernelName,s=i.kernelEntry,o=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${n}" is not allowed to be called recursively`);this.currentKernelId=e,o[0]&&(o[1]=o[0](o[1]),o[0]=void 0),de("info",()=>`[WebGPU] Start to run kernel "[${a}] ${n}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),s(t,o[1]),0}catch(d){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${n}" failed. ${d}`)),1}finally{l&&r.push(this.device.popErrorScope().then(d=>d?`GPU validation error for kernel "[${a}] ${n}": ${d.message}`:null));for(let d of this.temporaryData)this.gpuDataManager.release(d.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let n=a.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,n);return a.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await Ia(this,e,t);return en(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){var e;this.queryType="none",(((e=this.env.webgpu.profiling)==null?void 0:e.mode)==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){de("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){de("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){de("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),n=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(n.computePipeline),a.setBindGroup(0,n.bindGroup),a.dispatchWorkgroups(...n.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),zf={};Kt(zf,{init:()=>Af});var Wr,Xd,Af,M0=P(()=>{te(),lt(),ie(),Vy(),Wr=class Of{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(B.size(t)!==B.size(this.dims))throw new Error("Invalid new shape");return new Of(this.module,this.dataType,this.data,t)}},Xd=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,n=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,n));let s=Number(e.getValue(i*a++,n));this.outputCount=Number(e.getValue(i*a++,n)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,n));let o=[];for(let l=0;l<s;l++){let d=Number(e.getValue(i*a++,n)),h=Number(e.getValue(i*a++,"*")),c=Number(e.getValue(i*a++,n)),m=[];for(let _=0;_<c;_++)m.push(Number(e.getValue(i*a++,n)));o.push(new Wr(e,d,h,m))}this.inputs=o}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){var s;let r=((s=t==null?void 0:t.inputs)==null?void 0:s.map(o=>typeof o=="number"?this.inputs[o]:o))??this.inputs,i=(t==null?void 0:t.outputs)??[],a=(o,l,d)=>new Wr(this.module,l,this.output(o,d),d),n=(o,l)=>{let d=Rt(o,l);if(!d)throw new Error(`Unsupported data type: ${o}`);let h=d>0?this.backend.gpuDataManager.create(d).id:0;return new Wr(this.module,o,h,l)};return this.backend.run(e,r,i,a,n,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",n=this.module.stackAlloc((1+t.length)*i);this.module.setValue(n,t.length,a);for(let s=0;s<t.length;s++)this.module.setValue(n+i*(s+1),t[s],a);return this.module._JsepOutput(this.opKernelContext,e,n)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},Af=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let n=(B0(),mr(Ef)).WebGpuBackend,s=new n;await s.initialize(r,i),a("webgpu",[s,o=>s.alloc(Number(o)),o=>s.free(o),(o,l,d,h=!1)=>{if(h)de("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(o)}, dst=${Number(l)}, size=${Number(d)}`),s.memcpy(Number(o),Number(l));else{de("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(o)}, gpuDataId=${Number(l)}, size=${Number(d)}`);let c=t.HEAPU8.subarray(Number(o>>>0),Number(o>>>0)+Number(d));s.upload(Number(l),c)}},async(o,l,d)=>{de("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${o}, dataOffset=${l}, size=${d}`),await s.download(Number(o),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+d)>>>0))},(o,l,d)=>s.createKernel(o,Number(l),d,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),o=>s.releaseKernel(o),(o,l,d,h)=>{de("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${d}, kernel=${o}, contextDataOffset=${l}`);let c=new Xd(t,s,Number(l));return s.computeKernel(Number(o),c,h)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let n=new qp(r);a("webnn",[n,()=>n.reserveTensorId(),s=>n.releaseTensorId(s),async(s,o,l,d,h)=>n.ensureTensor(s,o,l,d,h),(s,o)=>{n.uploadTensor(s,o)},async(s,o)=>n.downloadTensor(s,o),(s,o)=>n.registerMLContext(s,o),!!r.trace])}}}),Zd,cn,hn,yt,Qd,ya,Jr,fn,mn,_a,gn,yn,_n,Rf=P(()=>{Ge(),Ly(),qy(),te(),Ut(),Xa(),Mp(),Zd=(e,t)=>{be()._OrtInit(e,t)!==0&&ge("Can't initialize onnxruntime.")},cn=async e=>{Zd(e.wasm.numThreads,Kr(e.logLevel))},hn=async(e,t)=>{var i,a;(a=(i=be()).asyncInit)==null||a.call(i);let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let n=e.webgpu.powerPreference;if(n!==void 0&&n!=="low-power"&&n!=="high-performance")throw new Error(`Invalid powerPreference setting: "${n}"`);let s=e.webgpu.forceFallbackAdapter;if(s!==void 0&&typeof s!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:n,forceFallbackAdapter:s}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let n=(M0(),mr(zf)).init;t==="webgpu"&&await n("webgpu",be(),e,r),t==="webnn"&&await n("webnn",be(),e)}},yt=new Map,Qd=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&ge("Can't get session input/output count.");let n=i===4?"i32":"i64";return[Number(t.getValue(a,n)),Number(t.getValue(a+i,n))]}finally{t.stackRestore(r)}},ya=(e,t)=>{let r=be(),i=r.stackSave(),a=0;try{let n=r.PTR_SIZE,s=r.stackAlloc(2*n);r._OrtGetInputOutputMetadata(e,t,s,s+n)!==0&&ge("Can't get session input/output metadata.");let o=Number(r.getValue(s,"*"));a=Number(r.getValue(s+n,"*"));let l=r.HEAP32[a/4];if(l===0)return[o,0];let d=r.HEAPU32[a/4+1],h=[];for(let c=0;c<d;c++){let m=Number(r.getValue(a+8+c*n,"*"));h.push(m!==0?r.UTF8ToString(m):Number(r.getValue(a+8+(c+d)*n,"*")))}return[o,l,h]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},Jr=e=>{let t=be(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},fn=async(e,t)=>{var c,m,_,y;let r,i,a=be();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Jr(e);let n=0,s=0,o=0,l=[],d=[],h=[];try{if([s,l]=await Bp(t),(t==null?void 0:t.externalData)&&a.mountExternalData){let w=[];for(let R of t.externalData){let M=typeof R=="string"?R:R.path;w.push(Ya(typeof R=="string"?R:R.data).then(U=>{a.mountExternalData(M,U)}))}await Promise.all(w)}for(let w of(t==null?void 0:t.executionProviders)??[])if((typeof w=="string"?w:w.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof w!="string"){let R=w,M=R==null?void 0:R.context,U=R==null?void 0:R.gpuDevice,G=R==null?void 0:R.deviceType,F=R==null?void 0:R.powerPreference;M?a.currentContext=M:U?a.currentContext=await a.webnnCreateMLContext(U):a.currentContext=await a.webnnCreateMLContext({deviceType:G,powerPreference:F})}else a.currentContext=await a.webnnCreateMLContext();break}n=await a._OrtCreateSession(r,i,s),(c=a.webgpuOnCreateSession)==null||c.call(a,n),n===0&&ge("Can't create a session."),(m=a.jsepOnCreateSession)==null||m.call(a),a.currentContext&&(a.webnnRegisterMLContext(n,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[b,S]=Qd(n),v=!!(t!=null&&t.enableGraphCapture),$=[],I=[],T=[],E=[],C=[];for(let w=0;w<b;w++){let[R,M,U]=ya(n,w);R===0&&ge("Can't get an input name."),d.push(R);let G=a.UTF8ToString(R);$.push(G),T.push(M===0?{name:G,isTensor:!1}:{name:G,isTensor:!0,type:ut(M),shape:U})}for(let w=0;w<S;w++){let[R,M,U]=ya(n,w+b);R===0&&ge("Can't get an output name."),h.push(R);let G=a.UTF8ToString(R);I.push(G),E.push(M===0?{name:G,isTensor:!1}:{name:G,isTensor:!0,type:ut(M),shape:U});{if(v&&(t==null?void 0:t.preferredOutputLocation)===void 0){C.push("gpu-buffer");continue}let F=typeof(t==null?void 0:t.preferredOutputLocation)=="string"?t.preferredOutputLocation:((_=t==null?void 0:t.preferredOutputLocation)==null?void 0:_[G])??"cpu",O=a.webnnIsGraphOutput;if(F==="cpu"&&O&&O(n,G)){C.push("ml-tensor-cpu-output");continue}if(F!=="cpu"&&F!=="cpu-pinned"&&F!=="gpu-buffer"&&F!=="ml-tensor")throw new Error(`Not supported preferred output location: ${F}.`);if(v&&F!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${F}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);C.push(F)}}let A=null;return C.some(w=>w==="gpu-buffer"||w==="ml-tensor"||w==="ml-tensor-cpu-output")&&(o=a._OrtCreateBinding(n),o===0&&ge("Can't create IO binding."),A={handle:o,outputPreferredLocations:C,outputPreferredLocationsEncoded:C.map(w=>w==="ml-tensor-cpu-output"?"ml-tensor":w).map(w=>Sa(w))}),yt.set(n,[n,d,h,A,v,!1]),[n,$,I,T,E]}catch(b){throw d.forEach(S=>a._OrtFree(S)),h.forEach(S=>a._OrtFree(S)),o!==0&&a._OrtReleaseBinding(o)!==0&&ge("Can't release IO binding."),n!==0&&a._OrtReleaseSession(n)!==0&&ge("Can't release session."),b}finally{a._free(r),s!==0&&a._OrtReleaseSessionOptions(s)!==0&&ge("Can't release session options."),l.forEach(b=>a._free(b)),(y=a.unmountExternalData)==null||y.call(a)}},mn=e=>{var l,d,h;let t=be(),r=yt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,n,s,o]=r;s&&(o&&t._OrtClearBoundOutputs(s.handle)!==0&&ge("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&ge("Can't release IO binding.")),(l=t.jsepOnReleaseSession)==null||l.call(t,e),(d=t.webnnOnReleaseSession)==null||d.call(t,e),(h=t.webgpuOnReleaseSession)==null||h.call(t,e),a.forEach(c=>t._OrtFree(c)),n.forEach(c=>t._OrtFree(c)),t._OrtReleaseSession(i)!==0&&ge("Can't release session."),yt.delete(e)},_a=async(e,t,r,i,a,n,s=!1)=>{if(!e){t.push(0);return}let o=be(),l=o.PTR_SIZE,d=e[0],h=e[1],c=e[3],m=c,_,y;if(d==="string"&&(c==="gpu-buffer"||c==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&c!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${n} when enableGraphCapture is true.`);if(c==="gpu-buffer"){let v=e[2].gpuBuffer;y=Rt(Ot(d),h);{let $=o.jsepRegisterBuffer;if(!$)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');_=$(i,n,v,y)}}else if(c==="ml-tensor"){let v=e[2].mlTensor;y=Rt(Ot(d),h);let $=o.webnnRegisterMLTensor;if(!$)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');_=$(i,v,Ot(d),h)}else{let v=e[2];if(Array.isArray(v)){y=l*v.length,_=o._malloc(y),r.push(_);for(let $=0;$<v.length;$++){if(typeof v[$]!="string")throw new TypeError(`tensor data at index ${$} is not a string`);o.setValue(_+$*l,Qe(v[$],r),"*")}}else{let $=o.webnnIsGraphInput,I=o.webnnIsGraphOutput;if(d!=="string"&&$&&I){let T=o.UTF8ToString(a);if($(i,T)||I(i,T)){let E=Ot(d);y=Rt(E,h),m="ml-tensor";let C=o.webnnCreateTemporaryTensor,A=o.webnnUploadTensor;if(!C||!A)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let w=await C(i,E,h);A(w,new Uint8Array(v.buffer,v.byteOffset,v.byteLength)),_=w}else y=v.byteLength,_=o._malloc(y),r.push(_),o.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,y),_)}else y=v.byteLength,_=o._malloc(y),r.push(_),o.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,y),_)}}let b=o.stackSave(),S=o.stackAlloc(4*h.length);try{h.forEach(($,I)=>o.setValue(S+I*l,$,l===4?"i32":"i64"));let v=o._OrtCreateTensor(Ot(d),_,y,S,h.length,Sa(m));v===0&&ge(`Can't create tensor for input/output. session=${i}, index=${n}.`),t.push(v)}finally{o.stackRestore(b)}},gn=async(e,t,r,i,a,n)=>{var G,F,O,K;let s=be(),o=s.PTR_SIZE,l=yt.get(e);if(!l)throw new Error(`cannot run inference. invalid session id: ${e}`);let d=l[0],h=l[1],c=l[2],m=l[3],_=l[4],y=l[5],b=t.length,S=i.length,v=0,$=[],I=[],T=[],E=[],C=[],A=s.stackSave(),w=s.stackAlloc(b*o),R=s.stackAlloc(b*o),M=s.stackAlloc(S*o),U=s.stackAlloc(S*o);try{[v,$]=Rp(n),bt("wasm prepareInputOutputTensor");for(let V=0;V<b;V++)await _a(r[V],I,E,e,h[t[V]],t[V],_);for(let V=0;V<S;V++)await _a(a[V],T,E,e,c[i[V]],b+i[V],_);wt("wasm prepareInputOutputTensor");for(let V=0;V<b;V++)s.setValue(w+V*o,I[V],"*"),s.setValue(R+V*o,h[t[V]],"*");for(let V=0;V<S;V++)s.setValue(M+V*o,T[V],"*"),s.setValue(U+V*o,c[i[V]],"*");if(m&&!y){let{handle:V,outputPreferredLocations:ue,outputPreferredLocationsEncoded:L}=m;if(h.length!==b)throw new Error(`input count from feeds (${b}) is expected to be always equal to model's input count (${h.length}).`);bt("wasm bindInputsOutputs");for(let H=0;H<b;H++){let Z=t[H];await s._OrtBindInput(V,h[Z],I[H])!==0&&ge(`Can't bind input[${H}] for session=${e}.`)}for(let H=0;H<S;H++){let Z=i[H];(G=a[H])!=null&&G[3]?(C.push(T[H]),s._OrtBindOutput(V,c[Z],T[H],0)!==0&&ge(`Can't bind pre-allocated output[${H}] for session=${e}.`)):s._OrtBindOutput(V,c[Z],0,L[Z])!==0&&ge(`Can't bind output[${H}] to ${ue[H]} for session=${e}.`)}wt("wasm bindInputsOutputs"),yt.set(e,[d,h,c,m,_,!0])}(F=s.jsepOnRunStart)==null||F.call(s,d),(O=s.webnnOnRunStart)==null||O.call(s,d);let X;m?X=await s._OrtRunWithBinding(d,m.handle,S,M,v):X=await s._OrtRun(d,R,w,b,U,S,M,v),X!==0&&ge("failed to call OrtRun().");let ee=[],he=[];bt("wasm ProcessOutputTensor");for(let V=0;V<S;V++){let ue=Number(s.getValue(M+V*o,"*"));if(ue===T[V]||C.includes(T[V])){ee.push(a[V]),ue!==T[V]&&s._OrtReleaseTensor(ue)!==0&&ge("Can't release tensor.");continue}let L=s.stackSave(),H=s.stackAlloc(4*o),Z=!1,q,me=0;try{s._OrtGetTensorData(ue,H,H+o,H+2*o,H+3*o)!==0&&ge(`Can't access output tensor data on index ${V}.`);let qe=o===4?"i32":"i64",Te=Number(s.getValue(H,qe));me=s.getValue(H+o,"*");let Oe=s.getValue(H+o*2,"*"),Re=Number(s.getValue(H+o*3,qe)),De=[];for(let we=0;we<Re;we++)De.push(Number(s.getValue(Oe+we*o,qe)));s._OrtFree(Oe)!==0&&ge("Can't free memory for tensor dims.");let Be=De.reduce((we,re)=>we*re,1);q=ut(Te);let dt=m==null?void 0:m.outputPreferredLocations[i[V]];if(q==="string"){if(dt==="gpu-buffer"||dt==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let we=[];for(let re=0;re<Be;re++){let Ne=s.getValue(me+re*o,"*"),_r=s.getValue(me+(re+1)*o,"*"),Xt=re===Be-1?void 0:_r-Ne;we.push(s.UTF8ToString(Ne,Xt))}ee.push([q,De,we,"cpu"])}else if(dt==="gpu-buffer"&&Be>0){let we=s.jsepGetBuffer;if(!we)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let re=we(me),Ne=Rt(Te,Be);if(Ne===void 0||!Za(q))throw new Error(`Unsupported data type: ${q}`);Z=!0,ee.push([q,De,{gpuBuffer:re,download:s.jsepCreateDownloader(re,Ne,q),dispose:()=>{s._OrtReleaseTensor(ue)!==0&&ge("Can't release tensor.")}},"gpu-buffer"])}else if(dt==="ml-tensor"&&Be>0){let we=s.webnnEnsureTensor,re=s.webnnIsGraphInputOutputTypeSupported;if(!we||!re)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Rt(Te,Be)===void 0||!Qa(q))throw new Error(`Unsupported data type: ${q}`);if(!re(e,q,!1))throw new Error(`preferredLocation "ml-tensor" for ${q} output is not supported by current WebNN Context.`);let Ne=await we(e,me,Te,De,!1);Z=!0,ee.push([q,De,{mlTensor:Ne,download:s.webnnCreateMLTensorDownloader(me,q),dispose:()=>{s.webnnReleaseTensorId(me),s._OrtReleaseTensor(ue)}},"ml-tensor"])}else if(dt==="ml-tensor-cpu-output"&&Be>0){let we=s.webnnCreateMLTensorDownloader(me,q)(),re=ee.length;Z=!0,he.push((async()=>{let Ne=[re,await we];return s.webnnReleaseTensorId(me),s._OrtReleaseTensor(ue),Ne})()),ee.push([q,De,[],"cpu"])}else{let we=ti(q),re=new we(Be);new Uint8Array(re.buffer,re.byteOffset,re.byteLength).set(s.HEAPU8.subarray(me,me+re.byteLength)),ee.push([q,De,re,"cpu"])}}finally{s.stackRestore(L),q==="string"&&me&&s._free(me),Z||s._OrtReleaseTensor(ue)}}m&&!_&&(s._OrtClearBoundOutputs(m.handle)!==0&&ge("Can't clear bound outputs."),yt.set(e,[d,h,c,m,_,!1]));for(let[V,ue]of await Promise.all(he))ee[V][2]=ue;return wt("wasm ProcessOutputTensor"),ee}finally{(K=s.webnnOnRunEnd)==null||K.call(s,d),s.stackRestore(A),I.forEach(X=>s._OrtReleaseTensor(X)),T.forEach(X=>s._OrtReleaseTensor(X)),E.forEach(X=>s._free(X)),v!==0&&s._OrtReleaseRunOptions(v),$.forEach(X=>s._free(X))}},yn=e=>{let t=be(),r=yt.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&ge("Can't get an profile file name."),t._OrtFree(a)},_n=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),_t,Me,Gt,ur,lr,Vr,ba,Gr,Ct,zt,Yd,Bf,Mf,Df,Nf,Pf,Uf,Lf,qf=P(()=>{Ge(),Rf(),Ut(),ja(),_t=()=>!!_e.wasm.proxy&&typeof document<"u",Gt=!1,ur=!1,lr=!1,Gr=new Map,Ct=(e,t)=>{let r=Gr.get(e);r?r.push(t):Gr.set(e,[t])},zt=()=>{if(Gt||!ur||lr||!Me)throw new Error("worker not ready")},Yd=e=>{switch(e.data.type){case"init-wasm":Gt=!1,e.data.err?(lr=!0,ba[1](e.data.err)):(ur=!0,ba[0]()),Vr&&(URL.revokeObjectURL(Vr),Vr=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Gr.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}}},Bf=async()=>{if(!ur){if(Gt)throw new Error("multiple calls to 'initWasm()' detected.");if(lr)throw new Error("previous call to 'initWasm()' failed.");if(Gt=!0,_t())return new Promise((e,t)=>{Me==null||Me.terminate(),Ap().then(([r,i])=>{try{Me=i,Me.onerror=n=>t(n),Me.onmessage=Yd,ba=[e,t];let a={type:"init-wasm",in:_e};!a.in.wasm.wasmPaths&&(r||xa)&&(a.in.wasm.wasmPaths={wasm:new URL(""+new URL("ort-wasm-simd-threaded.jsep-CyqnNavA.wasm",import.meta.url).href,import.meta.url).href}),Me.postMessage(a),Vr=r}catch(a){t(a)}},t)});try{await Ka(_e.wasm),await cn(_e),ur=!0}catch(e){throw lr=!0,e}finally{Gt=!1}}},Mf=async e=>{if(_t())return zt(),new Promise((t,r)=>{Ct("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:_e}};Me.postMessage(i)});await hn(_e,e)},Df=async e=>_t()?(zt(),new Promise((t,r)=>{Ct("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};Me.postMessage(i,[e.buffer])})):Jr(e),Nf=async(e,t)=>{if(_t()){if(t!=null&&t.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return zt(),new Promise((r,i)=>{Ct("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},n=[];e instanceof Uint8Array&&n.push(e.buffer),Me.postMessage(a,n)})}else return fn(e,t)},Pf=async e=>{if(_t())return zt(),new Promise((t,r)=>{Ct("release",[t,r]);let i={type:"release",in:e};Me.postMessage(i)});mn(e)},Uf=async(e,t,r,i,a,n)=>{if(_t()){if(r.some(s=>s[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(s=>s))throw new Error("pre-allocated output tensor is not supported for proxy.");return zt(),new Promise((s,o)=>{Ct("run",[s,o]);let l=r,d={type:"run",in:{sessionId:e,inputIndices:t,inputs:l,outputIndices:i,options:n}};Me.postMessage(d,_n(l))})}else return gn(e,t,r,i,a,n)},Lf=async e=>{if(_t())return zt(),new Promise((t,r)=>{Ct("end-profiling",[t,r]);let i={type:"end-profiling",in:e};Me.postMessage(i)});yn(e)}}),wa,Jd,Wf,D0=P(()=>{Ge(),qf(),te(),Fa(),Mp(),wa=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Jd=e=>{switch(e[3]){case"cpu":return new Ye(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Za(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Ye.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!Qa(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Ye.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},Wf=class{async fetchModelAndCopyToWasmMemory(e){return Df(await Ya(e))}async loadModel(e,t){Je();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Nf(r,t),Ve()}async dispose(){return Pf(this.sessionId)}async run(e,t,r){Je();let i=[],a=[];Object.entries(e).forEach(c=>{let m=c[0],_=c[1],y=this.inputNames.indexOf(m);if(y===-1)throw new Error(`invalid input '${m}'`);i.push(_),a.push(y)});let n=[],s=[];Object.entries(t).forEach(c=>{let m=c[0],_=c[1],y=this.outputNames.indexOf(m);if(y===-1)throw new Error(`invalid output '${m}'`);n.push(_),s.push(y)});let o=i.map((c,m)=>wa(c,()=>`input "${this.inputNames[a[m]]}"`)),l=n.map((c,m)=>c?wa(c,()=>`output "${this.outputNames[s[m]]}"`):null),d=await Uf(this.sessionId,a,o,s,l,r),h={};for(let c=0;c<d.length;c++)h[this.outputNames[s[c]]]=n[c]??Jd(d[c]);return Ve(),h}startProfiling(){}endProfiling(){Lf(this.sessionId)}}}),Vf={};Kt(Vf,{OnnxruntimeWebAssemblyBackend:()=>Pa,initializeFlags:()=>Na,wasmBackend:()=>Gf});var Na,Pa,Gf,N0=P(()=>{Ge(),qf(),D0(),Na=()=>{(typeof _e.wasm.initTimeout!="number"||_e.wasm.initTimeout<0)&&(_e.wasm.initTimeout=0);let e=_e.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),_e.wasm.simd=!1),typeof _e.wasm.proxy!="boolean"&&(_e.wasm.proxy=!1),typeof _e.wasm.trace!="boolean"&&(_e.wasm.trace=!1),typeof _e.wasm.numThreads!="number"||!Number.isInteger(_e.wasm.numThreads)||_e.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)_e.wasm.numThreads=1;else{let t=typeof navigator>"u"?xy("node:os").cpus().length:navigator.hardwareConcurrency;_e.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},Pa=class{async init(e){Na(),await Bf(),await Mf(e)}async createInferenceSessionHandler(e,t){let r=new Wf;return await r.loadModel(e,t),r}},Gf=new Pa});Ge();Ge();Ge();var P0="1.26.0",U0=Tp;{let e=(N0(),mr(Vf)).wasmBackend;Mt("webgpu",e,5),Mt("webnn",e,5),Mt("cpu",e,10),Mt("wasm",e,10)}Object.defineProperty(_e.versions,"web",{value:P0,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Hf=Object.freeze(Object.defineProperty({__proto__:null,get InferenceSession(){return Ha},get TRACE(){return gr},get TRACE_EVENT_BEGIN(){return bt},get TRACE_EVENT_END(){return wt},get TRACE_FUNC_BEGIN(){return Je},get TRACE_FUNC_END(){return Ve},get Tensor(){return Ye},default:U0,get env(){return _e},get registerBackend(){return Mt}},Symbol.toStringTag,{value:"Module"}));let ep=new Set(["cpu","wasm"]);function L0(e){return typeof e=="string"?e:e.name}async function q0(e,t,r,i,a){let n=r??{};try{return await e.InferenceSession.create(t,n)}catch(s){let l=(n.executionProviders??[]).map(L0);if(l.every(y=>ep.has(y))||l.length===0)throw s;let c=l.find(y=>ep.has(y))??(l.includes("wasm")?"wasm":"cpu"),m=s instanceof Error?s.message:String(s);i(`executionProviders=${JSON.stringify(l)} failed (${m}); falling back to ["${c}"].`);let _={...n,executionProviders:[c]};return a==null||a(_),e.InferenceSession.create(t,_)}}function W0(e,t,r){let i=e,a=t,n=1;return Math.max(a,i)>r&&(n=r/(a>i?a:i),i=Math.round(i*n),a=Math.round(a*n)),{width:i,height:a,ratio:n}}function V0(e,t,r,i,a){let n=Math.round(e.height*i),s=Math.round(e.height*a),o=e.x-s,l=e.y-n;o=Math.max(0,o),l=Math.max(0,l);let d=Math.min(t,e.x+e.width+s),h=Math.min(r,e.y+e.height+n),c=d-o,m=h-l;return{x:o,y:l,width:c,height:m}}function G0(e,t,r,i){let a=e.x/t,n=e.y/t,s=e.width/t,o=e.height/t,l=Math.max(0,Math.round(a)),d=Math.max(0,Math.round(n)),h=Math.min(r-l,Math.round(s)),c=Math.min(i-d,Math.round(o));return{x:l,y:d,width:h,height:c}}function H0(e,t,r,i,a,n,s,o,l){let d=[];return e.iterate(h=>{let c=e.getRect(h);if(c.width*c.height<=s)return;let m=V0(c,t,r,o,l),_=G0(m,i,a,n);_.width>5&&_.height>5&&d.push(_)}),d}function F0(e,t,r){let i=[];for(let a of e){const{bbox:n}=a;let s={x:Math.max(0,n.x0),y:Math.max(0,n.y0),width:n.x1-n.x0,height:n.y1-n.y0};s.x+s.width>t&&(s.width=t-s.x),s.y+s.height>r&&(s.height=r-s.y),s.width>5&&s.height>5&&i.push(s)}return i}let j0=3;function K0(e,t,r,i,a){let o=e.getContext("2d").getImageData(0,0,t,r).data,l=r*t,d=new Float32Array(j0*l),h=i[0]??.485,c=i[1]??.456,m=i[2]??.406,_=a[0]??.229,y=a[1]??.224,b=a[2]??.225,S=1/(255*_),v=1/(255*y),$=1/(255*b),I=h/_,T=c/y,E=m/b,C=l,A=l*2;for(let w=0,R=0;w<l;w++,R+=4){let M=o[R],U=o[R+1],G=o[R+2];d[w]=M*S-I,d[C+w]=U*v-T,d[A+w]=G*$-E}return d}function X0(e,t,r,i){let a=i(t,r),n=a.getContext("2d"),s=n.createImageData(t,r),o=s.data,l=t*r;for(let d=0;d<l;d++){let h=e[d]||0,c=Math.round(h*255),m=d*4;o[m]=c,o[m+1]=c,o[m+2]=c,o[m+3]=255}return n.putImageData(s,0,0),a}class Z0{constructor(t,r,i={},a={},n="opencv"){ve(this,"options");ve(this,"debugging");ve(this,"session");ve(this,"platform");ve(this,"engine");ve(this,"lastDetectionCanvas",null);this.platform=t,this.session=r,this.options={...ap,...i},this.debugging={...Wa,...a},n==="opencv"&&!this.platform.imageProcessor?this.engine="canvas-native":this.engine=n}log(t){this.debugging.verbose&&console.log(`[DetectionService] ${t}`)}async run(t){this.log("Starting text detection process");try{let r;this.platform.isCanvas(t)?r=t:this.engine==="opencv"&&this.platform.imageProcessor?r=await this.platform.imageProcessor.prepareCanvas(t):r=await this.platform.canvas.prepareCanvas(t);let i=await this.preprocessDetection(r),a=await this.runInference(i.tensor,i.width,i.height);if(!a)return console.error("Text detection failed (output tensor is null)"),[];let n=this.postprocessDetection(a,i);return this.debugging.debug&&this.debugging.debugFolder&&this.lastDetectionCanvas&&(await this.debugDetectionCanvas(this.lastDetectionCanvas,i.width,i.height),await this.debugDetectedBoxes(r,n)),this.log(`Detected ${n.length} text boxes in image`),n}catch(r){return console.error("Error during text detection:",r instanceof Error?r.message:String(r)),[]}}async preprocessDetection(t){const{width:r,height:i}=t;let a=this.options.maxSideLength??640;const{width:n,height:s,ratio:o}=W0(r,i,a);let l=Math.ceil(n/32)*32,d=Math.ceil(s/32)*32,h=this.platform.createCanvas(l,d);h.getContext("2d").drawImage(t,0,0,r,i,0,0,n,s);let m=this.options.mean??[.485,.456,.406],_=this.options.stdDeviation??[.229,.224,.225],y=K0(h,l,d,m,_);return this.log(`Detection preprocessed: original(${r}x${i}), model_input(${l}x${d}), resize_ratio: ${o.toFixed(4)}, engine: ${this.engine}`),{tensor:y,width:l,height:d,resizeRatio:o,originalWidth:r,originalHeight:i}}async runInference(t,r,i){let a;try{this.log("Running detection inference..."),a=new this.platform.ort.Tensor("float32",t,[1,3,i,r]);let n={x:a},o=(await this.session.run(n))[this.session.outputNames[0]||"sigmoid_0.tmp_0"];return this.log("Detection inference complete!"),o?o.data:(console.error(`Output tensor ${this.session.outputNames[0]} not found in detection results`),null)}catch(n){throw console.error("Error during model inference:",n instanceof Error?n.message:String(n)),n}finally{a==null||a.dispose()}}postprocessDetection(t,r,i=this.options.minimumAreaThreshold??50,a=this.options.paddingVertical||.4,n=this.options.paddingHorizontal||.6){this.log("Post-processing detection results...");const{width:s,height:o,resizeRatio:l,originalWidth:d,originalHeight:h}=r;let c=X0(t,s,o,this.platform.createCanvas.bind(this.platform));return this.lastDetectionCanvas=c,this.engine==="opencv"&&this.platform.imageProcessor?this.postprocessWithOpenCV(c,s,o,l,d,h,i,a,n):this.postprocessWithCanvasNative(c,l,d,h,i,a,n)}postprocessWithOpenCV(t,r,i,a,n,s,o,l,d){let h=this.platform.imageProcessor,c=new h.ImageProcessor(t);try{c.grayscale().convert({rtype:h.cv.CV_8UC1});let m=new h.Contours(c.toMat(),{mode:h.cv.RETR_LIST,method:h.cv.CHAIN_APPROX_SIMPLE}),_=H0(m,r,i,a,n,s,o,l,d);return m.destroy(),this.log(`Found ${_.length} potential text boxes (opencv)`),_}finally{c.destroy()}}postprocessWithCanvasNative(t,r,i,a,n,s,o){let d=this.platform.canvas.createProcessor(t).grayscale().threshold({thresh:127}).findRegions({foreground:"light",minArea:n,thresh:0,padding:{vertical:s,horizontal:o},scale:1/r}),h=F0(d,i,a);return this.log(`Found ${h.length} potential text boxes (canvas-native)`),h}async debugDetectionCanvas(t,r,i){let a=this.debugging.debugFolder??"";await this.platform.saveDebugImage(t,"detection-debug",a),this.log(`Probability map visualized and saved to: ${a}`)}async debugDetectedBoxes(t,r){let i=this.platform.isCanvas(t)?t:await this.platform.canvas.prepareCanvas(t),a=i.getContext("2d");for(let s of r){const{x:o,y:l,width:d,height:h}=s;this.platform.canvas.getToolkit().drawLine({ctx:a,x:o,y:l,width:d,height:h})}let n=this.debugging.debugFolder??"";await this.platform.saveDebugImage(i,"boxes-debug",n),this.log(`Boxes visualized and saved to: ${n}`)}}let Ua=null;function Q0(e){Ua=e}function ot(){if(!Ua)throw new Error('No canvas platform registered. Import "ppu-ocv" (Node), "ppu-ocv/web" (browser), "ppu-ocv/canvas" (Node canvas-only), or "ppu-ocv/canvas-web" (browser canvas-only) to auto-register.');return Ua}function Y0(e){return typeof e=="object"&&e!==null&&typeof e.getContext=="function"&&typeof e.width=="number"&&typeof e.height=="number"}let Ff={createCanvas(e,t){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(e,t);if(typeof document<"u"){let r=document.createElement("canvas");return r.width=e,r.height=t,r}throw new Error("No canvas implementation available in this environment.")},async loadImage(e){let t;if(e instanceof ArrayBuffer)t=new Blob([e]);else if(typeof e=="string")t=await(await fetch(e)).blob();else throw new Error("loadImage: unsupported source type");let r=await createImageBitmap(t),i=Ff.createCanvas(r.width,r.height);return i.getContext("2d").drawImage(r,0,0),r.close(),i},isCanvas(e){return typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas}};const Bt=class Bt{constructor(){ve(this,"step",0)}static getInstance(){return Bt._baseInstance||(Bt._baseInstance=new Bt),Bt._baseInstance}crop(t){const{bbox:r,canvas:i}=t;let a=ot().createCanvas(r.x1-r.x0,r.y1-r.y0);return a.getContext("2d").drawImage(i,r.x0,r.y0,r.x1-r.x0,r.y1-r.y0,0,0,a.width,a.height),a}isDirty(t){const{canvas:r,threshold:i=127.5,majorColorThreshold:a=.97}=t;let n=0,s=0,o=this.crop({bbox:{x0:r.width*.1,y0:r.height*.1,x1:r.width*.9,y1:r.height*.9},canvas:r}),d=o.getContext("2d").getImageData(0,0,o.width,o.height).data;for(let c=0;c<d.length;c+=4){let m=d[c],_=d[c+1],y=d[c+2];m>=i&&_>=i&&y>=i?n++:s++}return Math.max(n,s)/(s+n)<a}drawLine(t){const{ctx:r,x:i,y:a,width:n,height:s,lineWidth:o=2,color:l="blue"}=t;r.beginPath(),r.strokeStyle=l,r.lineWidth=o,r.strokeRect(i,a,n,s),r.closePath()}drawContour(t){const{ctx:r,contour:i,strokeStyle:a="red",lineWidth:n=2}=t;let s=i.data32S;if(!(s.length<4)){r.strokeStyle=a,r.lineWidth=n,r.beginPath(),r.moveTo(s[0]??0,s[1]??0);for(let o=2;o<s.length;o+=2)r.lineTo(s[o]??0,s[o+1]??0);r.closePath(),r.stroke()}}};ve(Bt,"_baseInstance",null);let La=Bt;async function J0(e){return Y0(e)?e:ot().loadImage(e)}async function e_(e){if(e instanceof ArrayBuffer)return e;if(typeof e.toBuffer=="function"){let n=e.toBuffer("image/png"),s=new ArrayBuffer(n.byteLength);return new Uint8Array(s).set(new Uint8Array(n)),s}let t=e.toBlob;if(typeof t=="function")return(await new Promise((s,o)=>{t.call(e,l=>l?s(l):o(new Error("toBlob returned null")),"image/png")})).arrayBuffer();if(typeof e.convertToBlob=="function")return(await e.convertToBlob({type:"image/png"})).arrayBuffer();if(typeof e.toDataURL=="function"){let s=e.toDataURL("image/png").replace(/^data:image\/png;base64,/,""),o=atob(s),l=new ArrayBuffer(o.length),d=new Uint8Array(l);for(let h=0;h<o.length;h++)d[h]=o.charCodeAt(h);return l}let i=e.getContext("2d").getImageData(0,0,e.width,e.height),a=new ArrayBuffer(i.data.byteLength);return new Uint8Array(a).set(new Uint8Array(i.data.buffer,i.data.byteOffset,i.data.byteLength)),a}function t_(e,t,r,i={}){const{foreground:a="light",thresh:n=127,minArea:s=1,maxArea:o=1/0,padding:l,scale:d=1}=i;let h=new Uint8Array(t*r),c=[],m=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]],_=y=>{let b=e[y]??0;return a==="light"?b>n:b<=n};for(let y=0;y<r;y++)for(let b=0;b<t;b++){let S=y*t+b;if(h[S]||(h[S]=1,!_(S*4)))continue;let v=[S],$=b,I=b,T=y,E=y,C=0;for(;v.length>0;){let A=v.pop();if(A===void 0)break;C++;let w=A%t,R=(A-w)/t;w<$?$=w:w>I&&(I=w),R<T?T=R:R>E&&(E=R);for(const[M,U]of m){let G=w+M,F=R+U;if(G<0||G>=t||F<0||F>=r)continue;let O=F*t+G;h[O]||(h[O]=1,_(O*4)&&v.push(O))}}if(C>=s&&C<=o){let A=$,w=T,R=I+1,M=E+1;if(l){let U=M-w,G=Math.round(U*(l.vertical??0)),F=Math.round(U*(l.horizontal??0));A=Math.max(0,A-F),w=Math.max(0,w-G),R=Math.min(t,R+F),M=Math.min(r,M+G)}d!==1&&(A=Math.max(0,Math.round(A*d)),w=Math.max(0,Math.round(w*d)),R=Math.round(R*d),M=Math.round(M*d)),c.push({bbox:{x0:A,y0:w,x1:R,y1:M},area:C})}}return c}class tp{constructor(t){ve(this,"_canvas");this._canvas=t}get width(){return this._canvas.width}get height(){return this._canvas.height}resize(t){const{width:r,height:i}=t;let a=ot().createCanvas(r,i);return a.getContext("2d").drawImage(this._canvas,0,0,r,i),this._canvas=a,this}grayscale(){const{width:t,height:r}=this._canvas;let i=this._canvas.getContext("2d").getImageData(0,0,t,r),a=i.data;for(let s=0;s<a.length;s+=4){let o=Math.round(.299*(a[s]??0)+.587*(a[s+1]??0)+.114*(a[s+2]??0));a[s]=o,a[s+1]=o,a[s+2]=o}let n=ot().createCanvas(t,r);return n.getContext("2d").putImageData(i,0,0),this._canvas=n,this}convert(t={}){const{alpha:r=1,beta:i=0}=t;if(r===1&&i===0)return this;const{width:a,height:n}=this._canvas;let s=this._canvas.getContext("2d").getImageData(0,0,a,n),o=s.data;for(let d=0;d<o.length;d+=4)o[d]=Math.round((o[d]??0)*r+i),o[d+1]=Math.round((o[d+1]??0)*r+i),o[d+2]=Math.round((o[d+2]??0)*r+i);let l=ot().createCanvas(a,n);return l.getContext("2d").putImageData(s,0,0),this._canvas=l,this}invert(){const{width:t,height:r}=this._canvas;let i=this._canvas.getContext("2d").getImageData(0,0,t,r),a=i.data;for(let s=0;s<a.length;s+=4)a[s]=255-(a[s]??0),a[s+1]=255-(a[s+1]??0),a[s+2]=255-(a[s+2]??0);let n=ot().createCanvas(t,r);return n.getContext("2d").putImageData(i,0,0),this._canvas=n,this}threshold(t={}){const{thresh:r=127,maxValue:i=255}=t,{width:a,height:n}=this._canvas;let s=this._canvas.getContext("2d").getImageData(0,0,a,n),o=s.data;for(let d=0;d<o.length;d+=4){let c=(o[d]===o[d+1]&&o[d+1]===o[d+2]?o[d]??0:Math.round(.299*(o[d]??0)+.587*(o[d+1]??0)+.114*(o[d+2]??0)))>r?i:0;o[d]=c,o[d+1]=c,o[d+2]=c}let l=ot().createCanvas(a,n);return l.getContext("2d").putImageData(s,0,0),this._canvas=l,this}border(t={}){const{size:r=10,color:i="white"}=t,{width:a,height:n}=this._canvas;let s=ot().createCanvas(a+r*2,n+r*2),o=s.getContext("2d");return o.fillStyle=i,o.fillRect(0,0,s.width,s.height),o.drawImage(this._canvas,r,r),this._canvas=s,this}rotate(t){const{angle:r,cx:i=this._canvas.width/2,cy:a=this._canvas.height/2}=t;if(r===0)return this;const{width:n,height:s}=this._canvas;let o=ot().createCanvas(n,s),l=o.getContext("2d");return l.save(),l.translate(i,a),l.rotate(-r*Math.PI/180),l.drawImage(this._canvas,-i,-a),l.restore(),this._canvas=o,this}findRegions(t={}){const{width:r,height:i}=this._canvas;let a=this._canvas.getContext("2d").getImageData(0,0,r,i).data;return t_(a,r,i,t)}toCanvas(){return this._canvas}static async prepareCanvas(t){return J0(t)}static async prepareBuffer(t){return e_(t)}}Q0(Ff);class bn{constructor(){ve(this,"pathSeparator","/");ve(this,"ort",Hf);ve(this,"canvas",{prepareCanvas:t=>tp.prepareCanvas(t),createProcessor:t=>new tp(t),getToolkit:()=>La.getInstance()})}createCanvas(t,r){let i=document.createElement("canvas");return i.width=t,i.height=r,i.getContext("2d",{willReadFrequently:!0}),i}isCanvas(t){return!!(t instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas||t&&typeof t.getContext=="function")}async loadResource(t,r){if(t instanceof ArrayBuffer)return t;let i=typeof t=="string"?t:r,a=await fetch(i);if(!a.ok)throw new Error(`Failed to fetch resource from ${i}`);return a.arrayBuffer()}async saveDebugImage(t,r,i){return Promise.resolve()}}typeof window<"u"&&!_e.wasm.wasmPaths&&(_e.wasm.wasmPaths="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/");async function r_(){if(typeof navigator>"u")return!1;let e=navigator;if(!e.gpu||typeof e.gpu.requestAdapter!="function")return!1;try{let t=await e.gpu.requestAdapter();return t!=null}catch{return!1}}async function i_(){return await r_()?["webgpu","wasm"]:["wasm"]}class rp extends Z0{constructor(t,r={},i={}){super(new bn,t,r,i,"canvas-native")}}let jf=0,Kf="<unk>",ei=8;function Xf(e,t,r,i){let a=i.length,n=a-1,s="",o=-1,l=0,d=0;for(let c=0;c<t;c++){let m=c*r,_=e[m]??-1/0,y=0;for(let b=1;b<r;b++){let S=e[m+b]??-1/0;S>_&&(_=S,y=b)}if(y===jf||y===o){o=y;continue}if(y>=0&&y<a){let b=i[y]??"";y===n?b!==Kf&&(s+=" ",l+=_,d++):(s+=b,l+=_,d++)}else console.warn(`Decoded index ${y} out of bounds for charDict (length ${a}) at t=${c}`);o=y}let h=d>0?l/d:0;return{text:s,confidence:h}}function Zf(e,t,r){let i=e.data,a=e.dims,n=a[1],s=a[2]??r;if(!t)return{text:"",confidence:0};let o=t;return t.length===s-1?o=["",...t]:s!==t.length&&console.warn(`Warning: Model output classes (${s}) does not match dictionary length (${t.length}).
 Consider using our model & dictionary catalogue at https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models.`),Xf(i,n,s,o)}const a_=Object.freeze(Object.defineProperty({__proto__:null,BLANK_INDEX:jf,MIN_CROP_WIDTH:ei,UNK_TOKEN:Kf,ctcGreedyDecode:Xf,decodeResults:Zf},Symbol.toStringTag,{value:"Module"}));async function Qf(e,t,r,i){let a=e.width,n=e.height;if(n===0||a===0)throw new Error(`Crop dimensions are zero: ${a}x${n}`);let s=a/n,o=Math.max(ei,Math.round(t*s));if(r){let h=new r.ImageProcessor(e);try{return h.resize({width:o,height:t}),{imageTensor:wn(h.toCanvas(),o,t),tensorWidth:o,tensorHeight:t}}finally{h.destroy()}}let l=i(e).resize({width:o,height:t});return{imageTensor:Yf(l,o,t),tensorWidth:o,tensorHeight:t}}function Yf(e,t,r){let i=e.toCanvas();return wn(i,t,r)}function wn(e,t,r){let n=e.getContext("2d").getImageData(0,0,t,r).data,s=r*t,o=new Float32Array(3*s),l=1/127.5;for(let d=0,h=0;d<s;d++,h+=4)o[d]=(n[h]??0)*l-1;return o.copyWithin(s,0,s),o.copyWithin(s*2,0,s),o}const n_=Object.freeze(Object.defineProperty({__proto__:null,createImageTensor:Yf,createImageTensorFromCanvas:wn,preprocessImage:Qf},Symbol.toStringTag,{value:"Module"}));function Jf(e){if(e.length===0)return[];let t=[...e].sort((s,o)=>s.box.y-o.box.y||s.box.x-o.box.x),r=[],i=t[0];if(!i)return[];let a=[i],n=i.box.height;for(let s=1;s<t.length;s++){let o=t[s],l=t[s-1];if(!o||!l)continue;let d=Math.abs(o.box.y-l.box.y),h=n*.5;d<=h?(a.push(o),n=a.reduce((c,m)=>c+m.box.height,0)/a.length):(a.sort((c,m)=>c.box.x-m.box.x),r.push(a),a=[o],n=o.box.height)}return a.length>0&&(a.sort((s,o)=>s.box.x-o.box.x),r.push(a)),r}function em(e,t,r,i){let a=Math.min(...t.map(y=>y.box.x)),n=Math.min(...t.map(y=>y.box.y)),s=Math.max(...t.map(y=>y.box.x+y.box.width)),o=Math.max(...t.map(y=>y.box.y+y.box.height)),l={x:a,y:n,width:s-a,height:o-n},d=o-n,h=t.reduce((y,b)=>y+Math.round(b.box.width*(d/b.box.height)),0),c=r(h,d),m=c.getContext("2d"),_=0;for(const{box:y}of t){let b=i.getToolkit().crop({bbox:{x0:y.x,y0:y.y,x1:y.x+y.width,y1:y.y+y.height},canvas:e}),S=d/y.height,v=Math.round(y.width*S);m.drawImage(b,0,0,y.width,y.height,_,0,v,d),_+=v}return{mergedCanvas:c,mergedBox:l}}function s_(e,t){if(t.length===1)return[e];let r=t.reduce((o,l)=>o+l,0),i=[...e],a=i.length>0?r/i.length:0,n=[],s=0;for(let o=0;o<t.length;o++){let l=o<t.length-1?Math.round((t[o]??0)/a):i.length-s,d=Math.min(s+l,i.length);n.push(i.slice(s,d).join("")),s=d}return n}function o_(e,t,r,i){let a=[...e].sort((o,l)=>t(l)-t(o)),n=[],s=[];for(let o of a){let l=!1;for(let d=0;d<n.length;d++){let h=n[d],c=s[d];if(h===void 0||c===void 0)continue;let m=i*h.length;if(c+m+t(o)<=r){h.push(o),s[d]=c+t(o),l=!0;break}}l||(n.push([o]),s.push(t(o)))}return n}function u_(e,t,r){if(e.length===1){let o=e[0];return[{text:t.trim(),box:(o==null?void 0:o.box)??{x:0,y:0,width:0,height:0},confidence:r}]}let i=t.trim().split(/\s+/).filter(o=>o.length>0),a=e.reduce((o,l)=>o+l.box.width,0),n=[],s=0;for(const{box:o}of e){if(s>=i.length){n.push({text:"",box:o,confidence:r});continue}let l=o.width/a,d=Math.max(1,Math.round(i.length*l)),h=Math.min(s+d,i.length);n.push({text:i.slice(s,h).join(" "),box:o,confidence:r}),s=h}return n}function tm(e,t,r){return r.getToolkit().crop({bbox:{x0:t.x,y0:t.y,x1:t.x+t.width,y1:t.y+t.height},canvas:e})}async function qa(e,t,r){let i=t.options.imageHeight??48,a=t.engine==="opencv"?t.platform.imageProcessor:void 0;const{imageTensor:n,tensorWidth:s,tensorHeight:o}=await Qf(e,i,a,t.platform.canvas.createProcessor.bind(t.platform.canvas));let l;try{l=new t.platform.ort.Tensor("float32",n,[1,3,o,s]);let d=await t.runInference(l),h=r??t.options.charactersDictionary??[];return Zf(d,h,s)}finally{l==null||l.dispose()}}function $n(e){return[...e].sort((t,r)=>Math.abs(t.box.y-r.box.y)<(t.box.height+r.box.height)/4?t.box.x-r.box.x:t.box.y-r.box.y)}async function l_(e,t,r,i,a){let n=r.debugging.debugFolder?`${r.debugging.debugFolder}${r.platform.pathSeparator}crops`:"";if(r.debugging.debug&&n){let o=r.platform.canvas.getToolkit();"clearOutput"in o&&typeof o.clearOutput=="function"&&o.clearOutput(n)}let s=[];for(const{box:o,index:l}of t){let d=await i(e,o,l,t.length,n,a);d!==null&&s.push(d)}return $n(s)}async function d_(e,t,r,i){let a=Jf(t),n=[];for(let s of a)if(s.length===1){let o=s[0];if(!o)continue;const{box:l}=o;let d=tm(e,l,r.platform.canvas);const{text:h,confidence:c}=await qa(d,r,i);n.push({text:h,box:l,confidence:c})}else{const{mergedCanvas:o}=em(e,s,r.platform.createCanvas.bind(r.platform),r.platform.canvas),{text:l,confidence:d}=await qa(o,r,i);let h=s.reduce((m,_)=>m+_.box.width,0),c=l.trim().split(/\s+/).filter(m=>m.length>0);if(c.length===0||s.length===0)for(const{box:m}of s)n.push({text:l,box:m,confidence:d});else if(c.length>=s.length){let m=0;for(let _=0;_<s.length;_++){let y=s[_];if(!y)continue;let b=y.box.width/h,S=Math.max(1,Math.round(c.length*b)),v=Math.min(m+S,c.length);n.push({text:c.slice(m,v).join(" "),box:y.box,confidence:d}),m=v}if(m<c.length){let _=n[n.length-1];_&&(_.text+=` ${c.slice(m).join(" ")}`)}}else{for(const{box:m}of s.slice(0,c.length))n.push({text:c.shift()??"",box:m,confidence:d});for(const{box:m}of s.slice(c.length))n.push({text:"",box:m,confidence:d})}}return $n(n)}async function p_(e,t,r,i){let a=Jf(t),n=r.options.imageHeight??48,s=20,o=[];for(let y of a)if(y.length===1){let b=y[0];if(!b)continue;o.push({canvas:tm(e,b.box,r.platform.canvas),boxes:y})}else{const{mergedCanvas:b}=em(e,y,r.platform.createCanvas.bind(r.platform),r.platform.canvas);o.push({canvas:b,boxes:y})}let l=o.map(({canvas:y,boxes:b},S)=>{let v=y.width/y.height,$=Math.max(ei,Math.round(n*v));return{canvas:y,boxes:b,resizedWidth:$,originalHeight:y.height,index:S}}),d=Math.max(...l.map(y=>y.resizedWidth)),h=r.options.crossLineWidthFactor??1.5,c=Math.round(d*h),m=o_(l,y=>y.resizedWidth,c,s),_=[];for(let y of m){let b=[...y].sort((M,U)=>M.index-U.index),S=Math.max(...b.map(M=>M.originalHeight)),v=b.map(M=>{if(M.originalHeight>=S)return M.resizedWidth;let U=S/M.originalHeight;return Math.max(ei,Math.round(M.resizedWidth*U))}),I=v.reduce((M,U)=>M+U,0)+s*(b.length-1),T=r.platform.createCanvas(I,n),E=T.getContext("2d");E.fillStyle="white",E.fillRect(0,0,I,n);let C=0;for(let M=0;M<b.length;M++){let U=b[M],G=v[M];U===void 0||G===void 0||(E.drawImage(U.canvas,0,0,U.canvas.width,U.canvas.height,C,0,G,n),C+=G,M<b.length-1&&(C+=s))}const{text:A,confidence:w}=await qa(T,r,i);let R=s_(A,v);for(let M=0;M<b.length;M++){let U=b[M];U&&_.push(...u_(U.boxes,R[M]??"",w))}}return $n(_)}class c_{constructor(t,r,i={},a={},n="opencv"){ve(this,"options");ve(this,"debugging");ve(this,"session");ve(this,"platform");ve(this,"engine");this.platform=t,this.session=r,this.options={...np,...i},this.debugging={...Wa,...a},n==="opencv"&&!this.platform.imageProcessor?this.engine="canvas-native":this.engine=n}log(t){this.debugging.verbose&&console.log(`[RecognitionService] ${t}`)}async run(t,r,i,a="per-line"){this.log("Starting text recognition process");try{let n;this.platform.isCanvas(t)?n=t:this.engine==="opencv"&&this.platform.imageProcessor?n=await this.platform.imageProcessor.prepareCanvas(t):n=await this.platform.canvas.prepareCanvas(t);let s=this.filterValidBoxes(r);if(s.length===0)return[];let o=this.buildContext();switch(a){case"cross-line":return p_(n,s,o,i);case"per-line":return d_(n,s,o,i);case"per-box":default:return l_(n,s,o,(l,d,h,c,m,_)=>this.processBox(l,d,h,c,m,_),i)}}catch(n){return console.error("Error during text recognition:",n instanceof Error?n.message:String(n)),[]}}buildContext(){return{platform:this.platform,options:this.options,debugging:this.debugging,engine:this.engine,runInference:t=>this.runInference(t)}}filterValidBoxes(t){return t.map((r,i)=>({box:r,index:i})).filter(({box:r,index:i})=>this.isValidBox(r,i))}async processBox(t,r,i,a,n,s){let o=Date.now();try{let l=this.platform.canvas.getToolkit().crop({bbox:{x0:r.x,y0:r.y,x1:r.x+r.width,y1:r.y+r.height},canvas:t}),d=this.buildContext();const{text:h,confidence:c}=await this.recognizeTextViaContext(l,d,s);if(this.debugging.debug&&n){await this.platform.saveDebugImage(l,`crop_${String(i).padStart(3,"0")}.png`,n);let m=Date.now()-o;this.log(`Box ${i+1}/${a}: [x:${r.x}, y:${r.y}, w:${r.width}, h:${r.height}]
	 → "${h}" (processed in ${m}ms)
`)}return{text:h,box:r,confidence:c}}catch(l){let d=l instanceof Error?l:new Error(String(l));return console.error(`Error processing box ${i+1}: ${d.message}`,d.stack),null}}async recognizeTextViaContext(t,r,i){const{preprocessImage:a}=await go(()=>Promise.resolve().then(()=>n_),[],import.meta.url),{decodeResults:n}=await go(()=>Promise.resolve().then(()=>a_),void 0,import.meta.url);let s=r.options.imageHeight??48,o=r.engine==="opencv"?r.platform.imageProcessor:void 0;const{imageTensor:l,tensorWidth:d,tensorHeight:h}=await a(t,s,o,r.platform.canvas.createProcessor.bind(r.platform.canvas));let c;try{c=new r.platform.ort.Tensor("float32",l,[1,3,h,d]);let m=await r.runInference(c),_=i??r.options.charactersDictionary??[];return n(m,_,d)}finally{c==null||c.dispose()}}isValidBox(t,r){return t.width<=0||t.height<=0?(console.warn(`Skipping invalid box ${r+1}: w=${t.width}, h=${t.height}`),!1):!0}async runInference(t){let r={x:t},i=await this.session.run(r),a=Object.keys(i)[0],n=a?i[a]:void 0;if(!n)throw new Error(`Recognition output tensor '${a}' not found. Available keys: ${Object.keys(i)}`);return n}}class ip extends c_{constructor(t,r={},i={}){super(new bn,t,r,i,"canvas-native")}}let h_={graphOptimizationLevel:"all"};class __ extends _y{constructor(t){super(new bn,t),(this.options.session===void 0||Object.keys(this.options.session).length===0)&&(this.options.session=h_)}async initSessions(){throw new Error("Initialization is handled proactively in PaddleOcrService. Call initialize() instead.")}async _loadResource(t,r){if(t instanceof ArrayBuffer)return this.log("Loading resource from ArrayBuffer"),t;let i=typeof t=="string"?t:r;return this.log(`Fetching resource from URL: ${i}`),my(i)}async _resolveSessionExecutionProviders(){let t=this.options.session??{};if(t.executionProviders&&t.executionProviders.length>0){this.log(`Using user-provided executionProviders: ${JSON.stringify(t.executionProviders)}`);return}let r=await i_();this.options.session={...t,executionProviders:r},this.log(`Resolved executionProviders: ${JSON.stringify(r)}`)}async _createSession(t){return q0(Hf,t,this.options.session,r=>console.warn(`[PaddleOcrService] ${r}`),r=>this.options.session=r)}async initialize(){var t,r,i;try{this.log("Initializing PaddleOcrService (Web)..."),await this._resolveSessionExecutionProviders();const[a,n,s]=await Promise.all([this._loadResource((t=this.options.model)==null?void 0:t.detection,Vt.detection),this._loadResource((r=this.options.model)==null?void 0:r.recognition,Vt.recognition),this._loadResource((i=this.options.model)==null?void 0:i.charactersDictionary,Vt.charactersDictionary)]),[o,l]=await Promise.all([this._createSession(new Uint8Array(a)),this._createSession(new Uint8Array(n))]);this.detectionSession=o,this.recognitionSession=l,this.options.model&&(this.options.model.detection=a),this.options.model&&(this.options.model.recognition=n),this.log(`Detection ONNX model loaded successfully
	input: ${o.inputNames}
	output: ${o.outputNames}`),this.log(`Recognition ONNX model loaded successfully
	input: ${l.inputNames}
	output: ${l.outputNames}`);let d=va(s);if(d.length===0)throw new Error("Character dictionary is empty or could not be loaded.");this.options.model&&(this.options.model.charactersDictionary=s),this.options.recognition&&(this.options.recognition.charactersDictionary=d),this.log(`Character dictionary loaded with ${d.length} entries.`),this.detector=new rp(o,this.options.detection,this.options.debugging),this.recognitor=new ip(l,this.options.recognition,this.options.debugging),this.options.model&&(this.options.model.detection=void 0),this.options.model&&(this.options.model.recognition=void 0)}catch(a){throw console.error("Failed to initialize PaddleOcrService Web:",a),a}}isInitialized(){return this.detectionSession!==null&&this.recognitionSession!==null}async changeDetectionModel(t){var i;this.log("Changing detection model...");let r=await this._loadResource(t,Vt.detection);await((i=this.detectionSession)==null?void 0:i.release()),this.detectionSession=await this._createSession(new Uint8Array(r)),this.detector=new rp(this.detectionSession,this.options.detection,this.options.debugging),this.options.model&&(this.options.model.detection=r),this.log("Detection model changed successfully.")}async changeRecognitionModel(t){var i;this.log("Changing recognition model...");let r=await this._loadResource(t,Vt.recognition);await((i=this.recognitionSession)==null?void 0:i.release()),this.recognitionSession=await this._createSession(new Uint8Array(r)),this.recognitor=new ip(this.recognitionSession,this.options.recognition,this.options.debugging),this.options.model&&(this.options.model.recognition=r),this.log("Recognition model changed successfully.")}async changeTextDictionary(t){this.log("Changing text dictionary...");let r=await this._loadResource(t,Vt.charactersDictionary),i=va(r);if(i.length===0)throw new Error("Character dictionary is empty or could not be loaded.");this.options.model&&(this.options.model.charactersDictionary=r),this.options.recognition&&(this.options.recognition.charactersDictionary=i),this.log(`Character dictionary changed successfully with ${i.length} entries.`)}async recognize(t,r){return super.recognize(t,r)}async destroy(){var t,r;await((t=this.detectionSession)==null?void 0:t.release()),await((r=this.recognitionSession)==null?void 0:r.release()),this.detectionSession=null,this.recognitionSession=null,this.detector=null,this.recognitor=null}}export{Wa as DEFAULT_DEBUGGING_OPTIONS,ap as DEFAULT_DETECTION_OPTIONS,Vt as DEFAULT_MODEL_URLS,Si as DEFAULT_PADDLE_OPTIONS,hy as DEFAULT_PROCESSING_ENGINE,fy as DEFAULT_PROCESSING_OPTIONS,np as DEFAULT_RECOGNITION_OPTIONS,rp as DetectionService,__ as PaddleOcrService,ip as RecognitionService,i_ as getDefaultWebExecutionProviders,r_ as isWebGpuAvailable};
