import {MODES,CODEC,MODEL_ROOT,splitText,validateRequest,modelEntries} from './config.mjs?v=20261114-qwen1';
import {cachedModel} from './model-cache.mjs?v=20261114-qwen1';
let runtime,ctx=0,loading=false,active=null,mode='',download=null,lastProgress=0;
const post=(data,transfer=[])=>self.postMessage(data,transfer);
async function cachedFiles(entries,progress,signal){
 const cache=await caches.open('pocket-qwen-tts-'+entries[0].file);
 const files=[];let complete=0,total=entries.reduce((n,e)=>n+e.size,0);
 for(const entry of entries){
  const url=MODEL_ROOT+entry.file;let response=await cache.match(url);
  if(!response){response=await fetch(url,{signal});if(!response.ok)throw Error(`模型下载失败（${response.status}）`);const blob=await response.blob();if(blob.size!==entry.size)throw Error('模型文件大小不匹配');await cache.put(url,new Response(blob));response=new Response(blob);}
  const blob=await response.blob();files.push(new File([blob],entry.file,{type:'application/octet-stream'}));complete+=entry.size;progress(complete/total,`${(complete/1e9).toFixed(2)} / ${(total/1e9).toFixed(2)} GB`);
 }
 return files;
}
const errorText=()=>runtime?.UTF8ToString(runtime._qt_last_error())||'语音运行失败';
async function load(data){
 if(loading||active)return;
 if(ctx){if(mode!==data.mode)throw Error('请重新加载所选模式。');post({type:'model-ready',mode});return;}
 if(!MODES[data.mode])throw Error('生成模式无效。');loading=true;download=new AbortController();
 try{
  const entries=modelEntries(data.mode,data.quality),total=entries.reduce((n,e)=>n+e.size,0);let completed=0;
  const files=[];
  if(data.files)files.push(...data.files);
  else if(navigator.storage?.getDirectory){
   const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle('qwen3-tts-1.7b',{create:true});
   for(const entry of entries){
    const file=await cachedModel(dir,entry,MODEL_ROOT+entry.file,written=>{const now=performance.now();if(now-lastProgress<100&&written!==entry.size)return;lastProgress=now;post({type:'progress',value:(completed+written)/total,detail:`${((completed+written)/1e9).toFixed(2)} / ${(total/1e9).toFixed(2)} GB`});},download.signal);
    files.push(file);completed+=entry.size;
   }
  }else files.push(...await cachedFiles(entries,(value,detail)=>post({type:'progress',value,detail}),download.signal));
  if(download.signal.aborted)throw new DOMException('已取消','AbortError');
  post({type:'loading-runtime'});
  const portable=typeof WebAssembly.Suspending!=='function'||data.portable;
  const folder=portable?'qwen-tts/portable/':'qwen-tts/';
  const {default:init}=await import('../../vendor/'+folder+'qwen-browser.mjs?v=20261114-qwen1');
  runtime=await init({locateFile:path=>new URL('../../vendor/'+folder+path+'?v=20261114-qwen1',import.meta.url).href,
   print:message=>post({type:'log',message}),printErr:message=>post({type:'log',message}),
   onAudio:samples=>{if(active&&!active.cancelled)post({type:'audio',id:active.id,rate:24000,samples},[samples.buffer]);}
  });
  runtime.FS.mkdir('/model');runtime.FS.mount(runtime.WORKERFS,{blobs:files.map(file=>({name:file.name,data:file}))},'/model');
  ctx=await runtime.ccall('browser_init','number',['string','string'],['/model/'+entries[0].file,'/model/'+CODEC.file],{async:true});
  if(!ctx)throw Error(errorText());mode=data.mode;
  const names=(count,name)=>Array.from({length:runtime[count](ctx)},(_,i)=>runtime.UTF8ToString(runtime[name](ctx,i)));
  post({type:'model-ready',mode,speakers:names('_qt_n_speakers','_qt_speaker_name'),languages:names('_qt_n_languages','_qt_language_name')});
 }finally{loading=false;download=null;}
}
async function generate(data){
 if(active){post({type:'error',id:data.id,error:'请等待上次生成结束。',fatal:false});return;}
 if(!ctx||data.mode!==mode)throw Error('请加载当前模式的模型。');
 validateRequest({...data,hasReference:!!data.ref});
 const job={id:data.id,cancelled:false};active=job;globalThis.qwenCancelled=false;let refPtr=0;
 try{
  if(data.ref){const ref=new Float32Array(data.ref);refPtr=runtime._malloc(ref.byteLength);if(!refPtr)throw Error('参考音频内存不足');runtime.HEAPF32.set(ref,refPtr>>>2);}
  const segments=splitText(data.text),o=data.options;
  for(let i=0;i<segments.length;i++){
   if(job.cancelled)break;
   post({type:'segment',id:job.id,part:i+1,total:segments.length});
   const code=await runtime.ccall('browser_generate','number',
    ['number','string','string','string','string','string','number','number','number','number','number','number','number','number','number','number','number'],
    [ctx,segments[i],data.language,data.mode==='customvoice'?data.speaker:'',data.mode==='base'?'':data.instruction||'',data.mode==='base'&&!data.xVectorOnly?data.refText||'':'',refPtr,data.ref?data.ref.byteLength/4:0,o.seed+i,o.tokens,o.temperature,o.topK,o.topP,o.repetition,o.subTemperature,o.subTopK,o.subTopP],{async:true});
   if(code&&!(code===-5&&job.cancelled))throw Error(errorText());
   if(i<segments.length-1&&!job.cancelled){const silence=new Float32Array(3600);post({type:'audio',id:job.id,rate:24000,samples:silence},[silence.buffer]);}
  }
  post({type:job.cancelled?'cancelled':'done',id:job.id,rate:24000});
 }finally{if(refPtr)runtime._free(refPtr);active=null;}
}
self.onmessage=async({data})=>{
 if(data.type==='cancel-load'){download?.abort();return;}
 if(data.type==='stop'){if(active?.id===data.id){active.cancelled=true;globalThis.qwenCancelled=true;}return;}
 try{if(data.type==='load')await load(data);else if(data.type==='generate')await generate(data);}
 catch(error){post({type:'error',id:data.id,error:error.name==='AbortError'?'已取消加载':error.message||String(error),fatal:data.type==='load'||error instanceof WebAssembly.RuntimeError});}
};
