import init from '../../vendor/breeze/breeze-browser.mjs';
const MODEL_FILE='breeze-tts-2-q4_k.gguf';let runtime=null,ctx=null,cancelled=false;
const post=(message,transfer=[])=>self.postMessage(message,transfer);
async function ensureModel(url,size){
 const root=await navigator.storage.getDirectory(),handle=await root.getFileHandle(MODEL_FILE,{create:true}),existing=await handle.getFile();
 if(existing.size!==size){
  const start=existing.size,headers=start?{Range:`bytes=${start}-`}:{};let response=await fetch(url,{headers});
  if(!response.ok||start&&response.status!==206){if(start){await (await handle.createWritable()).truncate(0);response=await fetch(url);}if(!response.ok)throw Error(`模型下载失败（${response.status}）`);}
  const writer=await handle.createWritable({keepExistingData:start>0});if(start)await writer.seek(start);const reader=response.body.getReader();let written=start;
  while(true){const {done,value}=await reader.read();if(done)break;await writer.write(value);written+=value.byteLength;post({type:'progress',value:written/size,detail:`${(written/1e9).toFixed(2)} / ${(size/1e9).toFixed(2)} GB`});}await writer.close();
 }
 return await handle.getFile();
}
async function load(data){if(runtime)return;runtime=await init({print:msg=>post({type:'log',message:msg}),printErr:msg=>post({type:'log',message:msg})});const file=await ensureModel(data.url,data.size);runtime.FS.mkdir('/model');runtime.FS.mount(runtime.WORKERFS,{blobs:[{name:MODEL_FILE,data:file}]},'/model');ctx=await runtime.ccall('breeze_init','number',['string','number'],['/model/'+MODEL_FILE,1],{async:true});if(!ctx)throw Error(runtime.UTF8ToString(runtime._breeze_last_error()));post({type:'model-ready'});}
async function generate(data){if(!ctx)throw Error('模型尚未加载');cancelled=false;let refPtr=0;try{if(data.ref){const ref=new Float32Array(data.ref);refPtr=runtime._malloc(ref.byteLength);runtime.HEAPF32.set(ref,refPtr>>2);}const result=await runtime.ccall('browser_generate','number',['number','string','string','string','number','number','number'],[ctx,data.text,data.instruction||'',data.refText||'',refPtr,data.ref?data.ref.byteLength/4:0,240],{async:true});if(result)throw Error(runtime.UTF8ToString(runtime._breeze_last_error()));post({type:'done',rate:runtime._breeze_sample_rate(ctx)});}finally{if(refPtr)runtime._free(refPtr);}}
self.onmessage=async({data})=>{try{if(data.type==='load')await load(data);else if(data.type==='generate'){globalThis.breezeCancelled=false;await generate(data);}else if(data.type==='stop'){cancelled=true;globalThis.breezeCancelled=true;}}catch(error){post({type:'error',error:error.message||String(error)});}};
