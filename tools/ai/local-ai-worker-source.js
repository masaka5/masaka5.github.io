import {env,pipeline,TextStreamer,DynamicCache,Tensor} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js';
import {LOCAL_MODEL,splitThinking} from './local-ai-core.mjs';
import {ContextHarness,summaryPrompt} from './local-ai-harness.mjs';
import {runLocalTurn} from './local-ai-generation.mjs';

env.allowRemoteModels=true;env.allowLocalModels=false;env.useBrowserCache=true;
let generator=null,loading=null,active=null;
const device='webgpu',post=message=>self.postMessage(message);
const clean=text=>String(text||'').replace(/<\|(?:endoftext|im_end)\|>|<｜end▁of▁sentence｜>/g,'');
function outputText(value){
 if(typeof value==='string')return value;
 if(Array.isArray(value))return outputText(value.at(-1));
 if(value&&typeof value==='object')return outputText(value.generated_text??value.text??value.content);
 return '';
}
function progress(data){const labels={initiate:'检查模型',download:'下载模型',progress:'下载模型',done:'文件已缓存',ready:'模型已就绪'};post({type:'progress',value:Math.max(0,Math.min(1,(Number(data?.progress)||0)/100)),status:labels[data?.status]||String(data?.status||'准备模型')});}
async function canUseGpu(){
 let timer;try{const adapter=await Promise.race([navigator.gpu?.requestAdapter({powerPreference:'high-performance'}),new Promise(resolve=>{timer=setTimeout(()=>resolve(null),8000);})]);return !!adapter?.features.has('shader-f16');}catch{return false;}finally{clearTimeout(timer);}
}
async function load(){
 if(generator)return generator;if(loading)return loading;
 loading=(async()=>{
  if(!await canUseGpu())throw Error('local-webgpu-required');
  progress({status:'加载 WebGPU 模型',progress:0});
  generator=await pipeline('text-generation',LOCAL_MODEL,{device,dtype:'q4f16',progress_callback:progress});
  post({type:'ready',device,model:LOCAL_MODEL});return generator;
 })();try{return await loading;}finally{loading=null;}
}
function runtime(model){
 const tokenizer=model.tokenizer;
 const window=Math.min(Number(tokenizer.model_max_length)||16384,Number(model.model?.config?.max_position_embeddings)||16384);
 const textTokens=text=>tokenizer.encode(String(text),{add_special_tokens:false}).length;
 const chatPrompt=messages=>tokenizer.apply_chat_template(messages,{tokenize:false,add_generation_prompt:true});
 const count=messages=>textTokens(chatPrompt(messages));
 return {window,textTokens,chatPrompt,count};
}
async function infer(model,prompt,id,{onToken=()=>{},chunkTokens=1024,temperature=.6,cacheState=null}={}){
 const rt=runtime(model),input=rt.textTokens(prompt),available=rt.window-input-16;
 if(available<16)throw Error('local-context-overflow');
 const budget=Math.min(chunkTokens,available),tokens=[];let streamed='';
 const streamer=new TextStreamer(model.tokenizer,{skip_prompt:true,skip_special_tokens:false,
  token_callback_function:ids=>{tokens.push(...ids);post({type:'activity',id});},
  callback_function:text=>{streamed+=text;onToken(clean(text));}
 });
 let output;
 if(typeof model.model?.generate==='function'){
  // The exported model computes prompt logits for every position. Prefilling a
  // long prompt at once allocates [promptLength, vocabulary] and can exhaust
  // WASM memory. Bound each prefill allocation while retaining every token.
  const encoded=model.tokenizer.encode(prompt,{add_special_tokens:false});
  const reusable=cacheState?.cache&&cacheState.ids?.every((token,index)=>token===encoded[index])&&cacheState.ids.length<encoded.length;
  if(cacheState?.cache&&!reusable){await cacheState.cache.dispose();cacheState.cache=null;}
  const cache=reusable?cacheState.cache:new DynamicCache();
  // Publish ownership before any forward call so failures are released by the
  // turn's finally block too. Invalidate the reusable prefix while mutating KV.
  if(cacheState){cacheState.cache=cache;cacheState.ids=null;}
  let inputTensor,maskTensor,result;
  try{
   // This ONNX export supports cached decoding with a query length of one.
   // Subsequent prefill steps must use that shape, even for a long prompt.
   for(let start=cache.get_seq_length();start<encoded.length-1;){
    const end=Math.min(start+(start?1:128),encoded.length-1);
    const ids=new Tensor('int64',BigInt64Array.from(encoded.slice(start,end),BigInt),[1,end-start]);
    const mask=new Tensor('int64',new BigInt64Array(end).fill(1n),[1,end]);
    let outputs;
    try{
     outputs=await model.model.forward({input_ids:ids,attention_mask:mask,past_key_values:cache});
     const entries={};for(const [name,tensor]of Object.entries(outputs))if(name.startsWith('present'))entries[name.replace('present','past_key_values')]=tensor;
     cache.update(entries);
    }finally{
     for(const [name,tensor]of Object.entries(outputs||{}))if(!name.startsWith('present'))await tensor.dispose?.();
     await ids.dispose?.();await mask.dispose?.();
    }
    post({type:'activity',id});
    start=end;
   }
   inputTensor=new Tensor('int64',BigInt64Array.from(encoded,BigInt),[1,encoded.length]);
   maskTensor=new Tensor('int64',new BigInt64Array(encoded.length).fill(1n),[1,encoded.length]);
   result=await model.model.generate({input_ids:inputTensor,attention_mask:maskTensor,past_key_values:cache,max_new_tokens:budget,do_sample:true,temperature,top_p:.9,repetition_penalty:1.05,streamer});
   const sequence=result.tolist()[0].slice(encoded.length);
   output=model.tokenizer.decode(sequence,{skip_special_tokens:false});
   if(cacheState){cacheState.cache=cache;cacheState.ids=encoded.concat(Array.from(sequence.slice(0,-1),Number));}
  }finally{if(!cacheState)await cache.dispose();await inputTensor?.dispose?.();await maskTensor?.dispose?.();await result?.dispose?.();}
 }else{
  output=await model(prompt,{max_new_tokens:budget,return_full_text:false,add_special_tokens:false,tokenizer_encode_kwargs:{truncation:false},do_sample:true,temperature,top_p:.9,repetition_penalty:1.05,streamer});
 }
 let text=tokens.length?model.tokenizer.decode(tokens,{skip_special_tokens:false}):streamed||outputText(output);
 if(text.startsWith(prompt))text=text.slice(prompt.length);
 text=clean(text);
 const eos=model.model?.generation_config?.eos_token_id??[151645,151643];
 const ended=(Array.isArray(eos)?eos:[eos]).some(value=>tokens.at(-1)==value);
 const stopReason=!ended&&tokens.length>=budget?'length':'stop';
 return {text,stopReason,usage:{input,output:tokens.length,cacheRead:0,cacheWrite:0,totalTokens:input+tokens.length,cost:{input:0,output:0,cacheRead:0,cacheWrite:0,total:0}}};
}
async function summarize(model,rt,{previous,messages,targetTokens},id){
 post({type:'phase',id,phase:'compacting'});
 // Enter the final channel explicitly. Checkpoints exclude private scratch work.
 const prompt=rt.chatPrompt([{role:'user',content:summaryPrompt(previous,messages,targetTokens)}])+'<think>\n</think>\n';
 const result=await infer(model,prompt,id,{chunkTokens:Math.min(targetTokens*2,rt.window-rt.textTokens(prompt)-32),temperature:.2});
 const text=splitThinking(result.text).answer.trim();
 return {...result,text};
}
async function generate(message){
 const id=message.id;if(active){post({type:'error',id,code:'local-generation-busy'});return;}active=id;
 const cacheState={};
 try{
  const model=await load(),rt=runtime(model);
  const harness=new ContextHarness({window:rt.window,count:rt.count,textTokens:rt.textTokens,
   summarize:request=>summarize(model,rt,request,id),
   onEvent:event=>{post({type:'activity',id});if(event.type==='compaction_start')post({type:'phase',id,phase:'compacting'});}
  });
  const history=message.messages.map(item=>({role:item.role==='assistant'?'assistant':'user',content:String(item.content??'')}));
  const prepared=await harness.prepare(history,{checkpoint:message.checkpoint,sessionId:message.sessionId});
  if(prepared.checkpoint)post({type:'checkpoint',id,checkpoint:prepared.checkpoint});
  let visible='';
  const result=await runLocalTurn({messages:prepared.messages,
   prepare:async(messages,prefix)=>{
    const combined=[...messages,...(prefix?[{role:'assistant',content:prefix}]:[])];
    if(rt.count(combined)<=rt.window-Math.ceil(rt.window*.18))return {messages,prefix};
    const reduced=await harness.prepare(combined,{sessionId:message.sessionId+':active'});
    const next=[...reduced.messages];let tail='';
    if(next.at(-1)?.role==='assistant')tail=next.pop().content;
    // A partial retained turn keeps its original reasoning/answer phase.
    if(prefix.includes('<think>')&&!tail.includes('<think>'))tail=splitThinking(prefix).thinkingDone?'<think>\n</think>\n'+tail:'<think>\n'+tail;
    return {messages:next,prefix:tail};
   },
   generate:async({messages,prefix,onToken})=>{
    post({type:'phase',id,phase:'generating'});
    return infer(model,rt.chatPrompt(messages)+prefix,id,{onToken,cacheState});
   },
   onText:text=>{visible=text;post({type:'snapshot',id,text});},
   onEvent:event=>{if(event.type==='turn_start')post({type:'activity',id});}
  });
  post({type:'done',id,text:result.text,device});
 }catch(error){post({type:'error',id,code:String(error?.message||'local-model-error')});}
 finally{await cacheState.cache?.dispose();active=null;}
}
self.onmessage=event=>{
 const message=event.data||{};
 if(message.type==='init')load().catch(error=>post({type:'error',code:String(error?.message||'local-model-error')}));
 else if(message.type==='generate')generate(message);
};
