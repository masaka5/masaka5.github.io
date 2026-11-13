import {env,pipeline,TextStreamer} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js';
import {LOCAL_MODEL} from '../local-ai-core.mjs?v=20261114-local4';

env.allowRemoteModels=true;
env.allowLocalModels=false;
env.useBrowserCache=true;

let generator=null,device='webgpu',loading=null,active=null;
const post=(message,transfer)=>self.postMessage(message,transfer||[]);
function cleanOutput(value,prompt=''){
 let text=value;
 if(Array.isArray(text))text=text.at(-1)?.generated_text??text.at(-1)?.content??'';
 else if(text&&typeof text==='object')text=text.generated_text??text.text??text.content??'';
 if(typeof text!=='string')return '';
 if(prompt&&text.startsWith(prompt))text=text.slice(prompt.length);
 return text.replace(/<\|(?:endoftext|im_end)\|>|<｜end▁of▁sentence｜>/g,'');
}
function progress(data){const labels={initiate:'正在检查模型',download:'正在下载模型',progress:'正在下载模型',done:'文件已缓存',ready:'模型已就绪'};post({type:'progress',value:Math.max(0,Math.min(1,(Number(data?.progress)||0)/100)),status:labels[data?.status]||String(data?.status||'正在准备模型')});}
async function canUseGpu(){
 let timer;
 try{const adapter=await Promise.race([navigator.gpu?.requestAdapter({powerPreference:'high-performance'}),new Promise(resolve=>{timer=setTimeout(()=>resolve(null),8000);})]);return !!adapter?.features.has('shader-f16');}
 catch{return false;}finally{clearTimeout(timer);}
}
async function load(){
 if(generator)return generator;
 if(loading)return loading;
 loading=(async()=>{
  if(!await canUseGpu())throw Error('local-webgpu-required');
  progress({status:'正在加载 WebGPU 模型',progress:0});
  generator=await pipeline('text-generation',LOCAL_MODEL,{device:'webgpu',dtype:'q4f16',progress_callback:progress});
  post({type:'ready',device,model:LOCAL_MODEL});return generator;
 })();
 try{return await loading;}finally{loading=null;}
}
async function generate(message){
 const id=message.id;if(active){post({type:'error',id,code:'local-generation-busy'});return;}active=id;
 try{
  const model=await load();let raw='';
  const streamer=new TextStreamer(model.tokenizer,{skip_prompt:true,skip_special_tokens:false,token_callback_function:()=>post({type:'activity',id}),callback_function:text=>{raw+=text;post({type:'token',id,text});}});
  const messages=message.messages.slice(-10).map(item=>({role:item.role==='assistant'?'assistant':'user',content:String(item.content||'').slice(-4000)}));
  const prompt=model.tokenizer.apply_chat_template(messages,{tokenize:false,add_generation_prompt:true});
  const output=await model(prompt,{max_new_tokens:Math.max(16,Math.min(1024,Number(message.maxTokens)||384)),do_sample:true,temperature:.6,top_p:.9,repetition_penalty:1.05,streamer});
  // Some Transformers.js/WebGPU combinations resolve the generation without
  // invoking TextStreamer callbacks. Deliver the pipeline result as a fallback.
  if(!raw.trim())raw=cleanOutput(output,prompt);
  else raw=cleanOutput(raw);
  post({type:'done',id,text:raw,device});
 }catch(error){post({type:'error',id,code:String(error?.message||'local-model-error')});}
 finally{active=null;}
}
self.onmessage=event=>{
 const message=event.data||{};
 if(message.type==='init')load().catch(error=>post({type:'error',code:String(error?.message||'local-model-error')}));
 else if(message.type==='generate')generate(message);
 else if(message.type==='stop'){/* Transformers.js checks stopping only between tokens; reload keeps the worker responsive. */}
};
