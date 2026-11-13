import {loadSpark} from './spark-runtime.mjs';
import {LOCAL_MODEL,splitThinking} from './local-ai-core.mjs';
import {ContextHarness,summaryPrompt} from './local-ai-harness.mjs';
import {runLocalTurn} from './local-ai-generation.mjs';
import {taskContext} from './conversation-journal.mjs';

let generator=null,loading=null,active=null;
const device='webgpu',post=message=>self.postMessage(message);
async function load(){
 if(generator)return generator;if(loading)return loading;
 loading=(async()=>{
  post({type:'progress',value:0,status:'准备 Spark Q4'});
  generator=await loadSpark({
   onProgress:info=>post({type:'progress',value:info.loaded/info.total,status:info.downloadedBytes?'下载模型':'读取模型缓存',cacheStored:info.cacheStored}),
   onDeviceLost:()=>{generator=null;active?.controller.abort(Error('WebGPU device lost'));post({type:'error',code:'WebGPU device lost'});}
  });
  post({type:'ready',device,model:LOCAL_MODEL,cacheStored:generator.cacheStored,variant:generator.variant,contextWindow:generator.contextWindow});return generator;
 })();try{return await loading;}finally{loading=null;}
}
function runtime(model){
 const textTokens=text=>model.chat.tokenizer.encode(String(text),{add_special_tokens:false}).ids.length;
 const chatPrompt=(messages,thinking=true)=>model.chat.render(messages,{thinking});
 return {window:model.contextWindow,textTokens,chatPrompt,count:messages=>textTokens(chatPrompt(messages))};
}
async function infer(model,prompt,id,{onToken=()=>{},chunkTokens=768,temperature=.6,signal}={}){
 signal?.throwIfAborted();
 const ids=model.chat.tokenizer.encode(prompt,{add_special_tokens:false}).ids;
 const budget=Math.min(chunkTokens,model.contextWindow-ids.length-8);if(budget<8)throw Error('local-context-overflow');
 const tokens=[],stats={};let visible='';
 for await(const token of model.generateIds(ids,{maxNewTokens:budget,temperature,signal,stats,onActivity:()=>post({type:'activity',id})})){
  signal?.throwIfAborted();tokens.push(token);
  const decoded=model.chat.decode(tokens);
  if(!decoded.endsWith('�')){const delta=decoded.slice(visible.length);visible=decoded;if(delta)onToken(delta);}
 }
 signal?.throwIfAborted();
 const text=model.chat.decode(tokens).replace(/<｜end▁of▁sentence｜>/g,'');
 return {text,stopReason:tokens.length>=budget?'length':'stop',usage:{input:ids.length,output:stats.newTokens,cacheRead:stats.reusedTokens||0,cacheWrite:0,totalTokens:ids.length+stats.newTokens,cost:{input:0,output:0,cacheRead:0,cacheWrite:0,total:0}}};
}
async function generate(message){
 const id=message.id;if(active){post({type:'error',id,code:'local-generation-busy'});return;}
 const task=active={id,controller:new AbortController()};const signal=task.controller.signal;
 try{
  const model=await load(),rt=runtime(model);signal.throwIfAborted();
  const taskNote=taskContext(message.task,{maxTokens:Math.min(1024,Math.floor(rt.window*.2)),textTokens:rt.textTokens});
  const withTask=messages=>taskNote?[taskNote,...messages]:messages;
  const harness=new ContextHarness({window:rt.window,reserve:1024,count:messages=>rt.count(withTask(messages)),textTokens:rt.textTokens,
   summarize:async({previous,messages,targetTokens})=>{
    post({type:'phase',id,phase:'compacting'});
    const result=await infer(model,rt.chatPrompt([{role:'user',content:summaryPrompt(previous,messages,targetTokens)}],false),id,{chunkTokens:targetTokens*2,temperature:.2,signal});
    return {...result,text:splitThinking(result.text).answer.trim()};
   },onEvent:event=>{post({type:'context',id,event});post({type:'activity',id});if(event.type==='compaction_start')post({type:'phase',id,phase:'compacting'});}
  });
  const history=message.messages.map(item=>({role:item.role==='assistant'?'assistant':'user',content:String(item.content??'')}));
  const prepared=await harness.prepare(history,{checkpoint:message.checkpoint,sessionId:message.sessionId,signal});
  if(prepared.checkpoint)post({type:'checkpoint',id,checkpoint:prepared.checkpoint});
  const result=await runLocalTurn({messages:prepared.messages,initialPrefix:'<think>',signal,
   prepare:async(messages,prefix)=>{
    const combined=[...messages,...(prefix?[{role:'assistant',content:prefix}]:[])];
    if(rt.count(withTask(combined))<=rt.window-1024)return {messages,prefix};
    const reduced=await harness.prepare(combined,{sessionId:message.sessionId+':active',signal});
    const next=[...reduced.messages];let tail='';if(next.at(-1)?.role==='assistant')tail=next.pop().content;
    if(prefix.includes('<think>')&&!tail.includes('<think>'))tail=splitThinking(prefix).thinkingDone?'<think>\n</think>\n'+tail:'<think>\n'+tail;
    return {messages:next,prefix:tail};
   },
   generate:({messages,prefix,onToken})=>{
    post({type:'phase',id,phase:'generating'});
    // Spark's template already supplies <think>; append only the generated suffix.
    const prompt=rt.chatPrompt(withTask(messages))+(prefix.startsWith('<think>')?prefix.slice(7):prefix);
    return infer(model,prompt,id,{onToken,signal});
   },onText:text=>post({type:'snapshot',id,text}),onEvent:()=>post({type:'activity',id})
  });
  signal.throwIfAborted();post({type:'done',id,text:result.text,device});
 }catch(error){
  if(signal.aborted)post({type:'cancelled',id});
  else post({type:'error',id,code:String(error?.message||'local-model-error')});
 }finally{if(active===task)active=null;}
}
self.onmessage=event=>{
 const message=event.data||{};
 if(message.type==='init')load().catch(error=>post({type:'error',code:String(error?.message||'local-model-error')}));
 else if(message.type==='generate')void generate(message);
 else if(message.type==='cancel'&&active?.id===message.id)active.controller.abort(Error('已停止'));
 else if(message.type==='reset'&&!active)generator?.resetContext();
};
