import {env,pipeline,TextStreamer} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js';
import {LOCAL_MODEL,localPrompt} from '../local-ai-core.mjs';

env.allowRemoteModels=true;
env.allowLocalModels=false;
env.useBrowserCache=true;

let generator=null,device='webgpu',loading=null,active=null;
const post=(message,transfer)=>self.postMessage(message,transfer||[]);
function progress(data){post({type:'progress',value:Math.max(0,Math.min(1,Number(data?.progress)||0)),status:String(data?.status||'正在准备模型')});}
async function load(){
 if(generator)return generator;
 if(loading)return loading;
 loading=(async()=>{
  progress({status:'正在加载 WebGPU 模型',progress:0});
  try{generator=await pipeline('text-generation',LOCAL_MODEL,{device:'webgpu',dtype:'q4f16',progress_callback:progress});device='webgpu';}
  catch(webgpuError){
   generator=null;device='wasm';progress({status:'WebGPU 不可用，切换兼容模式',progress:0});
   try{generator=await pipeline('text-generation',LOCAL_MODEL,{device:'wasm',dtype:'q4',progress_callback:progress});}
   catch(error){const safe=Error('local-model-load-failed');safe.cause=webgpuError;throw safe;}
  }
  post({type:'ready',device,model:LOCAL_MODEL});return generator;
 })();
 try{return await loading;}finally{loading=null;}
}
async function generate(message){
 const id=message.id;if(active)throw Error('local-generation-busy');active=id;
 try{
  const model=await load();let raw='';
  const streamer=new TextStreamer(model.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:text=>{raw+=text;post({type:'token',id,text});}});
  await model(localPrompt(message.messages),{max_new_tokens:Math.max(64,Math.min(1024,Number(message.maxTokens)||512)),do_sample:true,temperature:.6,top_p:.9,repetition_penalty:1.05,streamer});
  post({type:'done',id,text:raw,device});
 }catch(error){post({type:'error',id,code:String(error?.message||'local-model-error')});}
 finally{active=null;}
}
self.onmessage=event=>{
 const message=event.data||{};
 if(message.type==='init')load().catch(error=>post({type:'error',code:String(error?.message||'local-model-error')}));
 else if(message.type==='generate')generate(message);
 else if(message.type==='stop'){/* generation is isolated in this worker and can be terminated by the client */}
};
