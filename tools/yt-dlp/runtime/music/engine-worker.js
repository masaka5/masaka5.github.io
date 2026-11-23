/* Runs the upstream Go music library away from the UI thread. */
importScripts('./wasm_exec.js');
const RELAY='https://pocket-toolbox-media.pages.dev/music/fetch';
const encode=bytes=>{let out='';for(let i=0;i<bytes.length;i+=24576)out+=String.fromCharCode(...bytes.subarray(i,i+24576));return btoa(out);};
const decode=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
globalThis.pocketMusicHTTP=async raw=>{
 const input=JSON.parse(raw),headers={};
 for(const [key,values]of Object.entries(input.headers||{}))headers[key]=values.join(key.toLowerCase()==='cookie'?'; ':', ');
 const response=await fetch(RELAY,{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{'X-Media-URL':input.url,'X-Media-Method':input.method,'X-Media-Headers':JSON.stringify(headers)},body:input.method==='POST'?decode(input.body||''):undefined,signal:AbortSignal.timeout(23000)});
 if(!response.ok)throw Error(decodeURIComponent(response.headers.get('X-Media-Error')||`音乐接口 HTTP ${response.status}`));
 const metadata=JSON.parse(decodeURIComponent(response.headers.get('X-Music-Headers')||'%7B%7D'));
 const bytes=new Uint8Array(await response.arrayBuffer());
 for(const name of Object.keys(metadata))if(/^(content-encoding|content-length)$/i.test(name))delete metadata[name];
 metadata['Content-Length']=[String(bytes.length)];
 return JSON.stringify({status:Number(response.headers.get('X-Music-Status'))||200,headers:metadata,body:encode(bytes)});
};
let boot;
function start(){return boot||=(async()=>{
 const response=await fetch('./music-engine.wasm');if(!response.ok)throw Error('音乐引擎加载失败');
 const total=Number(response.headers.get('content-length'))||0,reader=response.body.getReader(),chunks=[];let loaded=0;
 while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.length;postMessage({type:'progress',loaded,total});}
 const bytes=new Uint8Array(loaded);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const go=new Go();let ready;const initialized=new Promise(resolve=>{ready=resolve;});globalThis.pocketMusicReady=ready;
 const {instance}=await WebAssembly.instantiate(bytes,go.importObject);
 go.run(instance).catch(error=>{postMessage({type:'fatal',error:error.message||'音乐引擎已停止'});});await initialized;postMessage({type:'ready'});
})().catch(error=>{boot=null;throw error;});}
onmessage=async({data})=>{
 const {id,request}=data;
 try{await start();const result=await globalThis.pocketMusicInvoke(JSON.stringify(request));postMessage({id,result:JSON.parse(result)});}
 catch(error){postMessage({id,error:error.message||String(error)});}
};
