import {runAgentLoop,createAssistantMessageEventStream} from './assets/pi-runtime.js';
import {splitThinking} from './local-ai-core.mjs';
const modelInfo={id:'browser-local',name:'本地模型',api:'browser-webgpu',provider:'browser',baseUrl:'',reasoning:true,input:['text'],cost:{input:0,output:0,cacheRead:0,cacheWrite:0},contextWindow:16384,maxTokens:16384};
const zeroUsage=()=>({input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,cost:{input:0,output:0,cacheRead:0,cacheWrite:0,total:0}});

/** Pi owns the turn lifecycle; the browser provides the model stream adapter. */
export async function runLocalTurn({messages,generate,prepare=async(messages,prefix)=>({messages,prefix}),onText=()=>{},onEvent=()=>{},signal}){
 let raw='',prefix='',inferenceMessages=messages,lastReason='stop',failure=null;
 const context={messages:[],tools:[]};
 const config={model:modelInfo,convertToLlm:items=>items,
  prepareRequest:async()=>{
   const prepared=await prepare(inferenceMessages,prefix);
   inferenceMessages=prepared.messages;prefix=prepared.prefix??prefix;
  },
  finishTurn:({message})=>{
   if(message.stopReason==='error'||message.stopReason==='aborted')return {action:'end'};
   if(message.stopReason==='length')return {action:'continue'};
   const parsed=splitThinking(raw);
   if(!parsed.answer.trim()&&parsed.thinking.trim()){
    // The model emitted EOS inside reasoning: explicitly enter the answer phase.
    const closing=parsed.thinkingDone?'\n':'</think>\n';raw+=closing;prefix+=closing;onText(raw);
    return {action:'continue'};
   }
   return {action:'end'};
  }
 };
 const streamFn=()=>{
  const stream=createAssistantMessageEventStream();
  const partial={role:'assistant',content:[],api:modelInfo.api,provider:modelInfo.provider,model:modelInfo.id,usage:zeroUsage(),stopReason:'stop',timestamp:Date.now()};
  const update=text=>{const parsed=splitThinking(text);partial.content=[...(parsed.thinking?[{type:'thinking',thinking:parsed.thinking}]:[]),...(parsed.answer?[{type:'text',text:parsed.answer}]:[])];};
  void (async()=>{
   stream.push({type:'start',partial});let segment='';
   try{
    if(signal?.aborted)throw signal.reason||Error('已停止');
    const result=await generate({messages:inferenceMessages,prefix,signal,onToken:text=>{segment+=text;update(segment);onText(raw+segment);stream.push({type:'text_delta',contentIndex:0,delta:text,partial});}});
    // Final decoded token IDs are authoritative, including callbacks that never fired.
    const text=String(result.text??segment);
    if(!text.trim())throw Error('local-empty-output');
    raw+=text;prefix+=text;onText(raw);update(text);
    lastReason=result.stopReason||'stop';partial.stopReason=lastReason;partial.usage=result.usage||zeroUsage();
    stream.push({type:'done',reason:partial.stopReason,message:partial});stream.end(partial);
   }catch(error){failure=error;partial.stopReason=signal?.aborted?'aborted':'error';partial.errorMessage=String(error?.message||error);stream.push({type:'error',reason:partial.stopReason,error:partial});stream.end(partial);}
  })();
  return stream;
 };
 await runAgentLoop([{role:'user',content:'继续当前请求',timestamp:Date.now()}],context,config,onEvent,signal,streamFn);
 if(failure)throw failure;
 if(!splitThinking(raw).answer.trim())throw Error('local-empty-answer');
 return {text:raw,stopReason:lastReason};
}
