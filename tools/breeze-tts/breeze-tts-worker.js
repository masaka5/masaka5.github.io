import init from '../../vendor/breeze/breeze-browser.mjs?v=20261114-stream2';
const MODEL_FILE='breeze-tts-2-q4_k.gguf';
let runtime=null,ctx=null,loading=false,active=null;
const post=(message,transfer=[])=>self.postMessage(message,transfer);
async function ensureModel(url,size){
 const root=await navigator.storage.getDirectory(),handle=await root.getFileHandle(MODEL_FILE,{create:true});
 const existing=await handle.getFile();if(existing.size===size)return existing;
 let start=existing.size<size?existing.size:0;
 let response=await fetch(url,{headers:start?{Range:`bytes=${start}-`}:{}});
 if(start&&response.status!==206){await response.body?.cancel();start=0;response=await fetch(url);}
 if(!response.ok)throw Error(`模型下载失败（${response.status}）`);
 if(start&&response.headers.get('Content-Range')?.split('/')[0]!==`bytes ${start}-${size-1}`)throw Error('模型分段响应不匹配，请重新加载。');
 const writer=await handle.createWritable({keepExistingData:start>0});
 const reader=response.body.getReader();let written=start;
 try{
  if(start)await writer.seek(start);
  for(;;){const {done,value}=await reader.read();if(done)break;
   if(written+value.byteLength>size)throw Error('模型文件大小不匹配。');
   await writer.write(value);written+=value.byteLength;
   post({type:'progress',value:written/size,detail:`${(written/1e9).toFixed(2)} / ${(size/1e9).toFixed(2)} GB`});
  }
  await writer.close();
 }catch(error){try{await writer.close();}catch{}await reader.cancel().catch(()=>{});throw error;}
 finally{reader.releaseLock();}
 if(written!==size)throw Error('模型下载中断，可再次加载继续下载。');
 return handle.getFile();
}
async function load(data){
 if(ctx){post({type:'model-ready'});return;}if(loading||active)return;loading=true;
 try{
  const file=data.file||await ensureModel(data.url,data.size);
  runtime=await init({
   locateFile:path=>new URL('../../vendor/breeze/'+path+'?v=20261114-stream2',import.meta.url).href,
   print:message=>post({type:'log',message}),printErr:message=>post({type:'log',message}),
   onAudio:samples=>{if(active&&!active.cancelled)post({type:'audio',id:active.id,rate:24000,samples},[samples.buffer]);},
   onSegment:(part,total)=>{if(active&&!active.cancelled)post({type:'segment',id:active.id,part,total});}
  });
  runtime.FS.mkdir('/model');runtime.FS.mount(runtime.WORKERFS,{blobs:[{name:MODEL_FILE,data:file}]},'/model');
  ctx=await runtime.ccall('breeze_init','number',['string','number'],['/model/'+MODEL_FILE,1],{async:true});
  if(!ctx)throw Error(runtime.UTF8ToString(runtime._breeze_last_error())||'模型初始化失败');
  post({type:'model-ready',rate:runtime._breeze_sample_rate(ctx)});
 }finally{loading=false;}
}
async function generate(data){
 if(active){post({type:'error',id:data.id,error:'请等待上一段生成结束。',fatal:false});return;}
 if(!ctx)throw Error('模型尚未加载');
 const job={id:data.id,cancelled:false};active=job;globalThis.breezeCancelled=false;let refPtr=0;
 try{
  if(data.ref){const ref=new Float32Array(data.ref);refPtr=runtime._malloc(ref.byteLength);if(!refPtr)throw Error('参考音频内存不足');runtime.HEAPF32.set(ref,refPtr>>>2);}
  const result=await runtime.ccall('browser_generate','number',
   ['number','string','string','string','number','number','number','number'],
   [ctx,data.text,data.instruction||'Speak clearly and naturally.',data.refText||'',refPtr,data.ref?data.ref.byteLength/4:0,0,data.seed||42],{async:true});
  if(result)throw Error(runtime.UTF8ToString(runtime._breeze_last_error())||'语音生成失败');
  post({type:job.cancelled?'cancelled':'done',id:job.id,rate:runtime._breeze_sample_rate(ctx)});
 }finally{if(refPtr)runtime._free(refPtr);active=null;}
}
self.onmessage=async({data})=>{
 if(data.type==='stop'){if(active&&active.id===data.id){active.cancelled=true;globalThis.breezeCancelled=true;}return;}
 try{if(data.type==='load')await load(data);else if(data.type==='generate')await generate(data);}
 catch(error){post({type:'error',id:data.id,error:error.message||String(error),fatal:true});}
};
