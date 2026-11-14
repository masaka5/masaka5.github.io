import {LOCAL_MODEL,LOCAL_LABEL,splitThinking,localError} from './local-ai-core.mjs?v=20261114-mobile4';
export class LocalAiClient{
 constructor({onProgress=()=>{},onReady=()=>{},onToken=()=>{},onSnapshot=()=>{},onPhase=()=>{},onContext=()=>{},onCheckpoint=()=>{},onDone=()=>{},onError=()=>{}}={}){
  this.handlers={onProgress,onReady,onToken,onSnapshot,onPhase,onContext,onCheckpoint,onDone,onError};this.worker=null;this.pending=new Map();this.ready=false;this.loading=null;this.loadDeferred=null;this.sessionId=crypto.randomUUID();this.checkpoint=null;
 }
 ensureWorker(){
  if(this.worker)return;
  const worker=this.worker=new Worker(new URL('./assets/local-ai-worker.js?v=20261114-mobile4',import.meta.url),{type:'module'});
  worker.onmessage=event=>{if(this.worker===worker)this.message(event.data||{});};
  worker.onerror=event=>{event.preventDefault?.();if(this.worker===worker)this.fail('本地模型运行中断，请重试。');};
  worker.onmessageerror=()=>{if(this.worker===worker)this.fail('本地模型通信中断，请重试。');};
 }
 message(message){
  const item=this.pending.get(message.id);
  if(message.type==='progress')this.handlers.onProgress(message);
  else if(message.type==='ready'){this.ready=true;this.device=message.device;this.cacheStored=message.cacheStored;this.profile=message.profile;this.loadDeferred?.resolve();this.loadDeferred=null;this.loading=null;this.handlers.onReady({...message,model:message.model||LOCAL_MODEL,label:message.label||LOCAL_LABEL});}
  else if(message.type==='token'&&item){if(message.text)item.touch(true);this.handlers.onToken(message.id,message.text);}
  else if(message.type==='snapshot'&&item){if(message.text)item.touch(true);this.handlers.onSnapshot(message.id,message.text);}
  else if(message.type==='activity'&&item)item.touch();
  else if(message.type==='phase'&&item){item.touch();this.handlers.onPhase(message.id,message.phase);}
  else if(message.type==='context'&&item){item.touch();this.handlers.onContext(message.event);}
  else if(message.type==='checkpoint'&&item){this.checkpoint=message.checkpoint;this.handlers.onCheckpoint(this.checkpoint);}
  else if(message.type==='done'&&item){this.pending.delete(message.id);item.clear();this.handlers.onDone(message.id,message.text,message.device);item.resolve(message.text);}
  else if(message.type==='cancelled'&&item){this.pending.delete(message.id);item.clear();item.reject(Error('已停止本地生成。'));}
 else if(message.type==='error'&&(!message.id||item)){console.error('[Spark local error]',message.code);this.fail(localError(message.code));}
 }
 load(){this.ensureWorker();if(this.ready)return Promise.resolve();if(this.loading)return this.loading;this.loading=new Promise((resolve,reject)=>{this.loadDeferred={resolve,reject};});this.worker.postMessage({type:'init'});return this.loading;}
 ask(messages,{id=crypto.randomUUID(),idleMs=120000,firstTokenMs=0,maxMs=0,task=null}={}){
  this.ensureWorker();if(this.pending.size)return Promise.reject(Error('本地模型正在生成，请等待或停止。'));
  return new Promise((resolve,reject)=>{
   const item={resolve,reject,idleTimer:null,firstTimer:null,maxTimer:null,hasToken:false,
    clear(){clearTimeout(item.idleTimer);clearTimeout(item.firstTimer);clearTimeout(item.maxTimer);},
    touch:(visible=false)=>{if(visible&&!item.hasToken){item.hasToken=true;clearTimeout(item.firstTimer);}clearTimeout(item.idleTimer);if(idleMs>0)item.idleTimer=setTimeout(()=>this.fail('模型长时间无响应，已停止。请重新加载后重试。'),idleMs);}
   };
   this.pending.set(id,item);
   // Optional diagnostic watchdogs. Normal generation has no total time/token cap.
   if(firstTokenMs>0)item.firstTimer=setTimeout(()=>this.fail('模型未返回文本，已停止。请重试。'),firstTokenMs);
   if(maxMs>0)item.maxTimer=setTimeout(()=>this.fail('本次生成超时，已停止。请重试。'),maxMs);
   item.touch();this.worker.postMessage({type:'generate',id,messages,task,checkpoint:this.checkpoint,sessionId:this.sessionId});
  });
 }
 resetContext(){this.checkpoint=null;this.sessionId=crypto.randomUUID();this.worker?.postMessage({type:'reset'});}
 stop(){for(const [id,item]of this.pending){item.stopping=true;this.worker?.postMessage({type:'cancel',id});item.touch();}}
 fail(message){this.dispose(message);this.handlers.onError(message);}
 dispose(message='已停止本地生成。'){this.worker?.terminate();this.worker=null;this.ready=false;this.loading=null;this.loadDeferred?.reject(Error(message));this.loadDeferred=null;for(const item of this.pending.values()){item.clear();item.reject(Error(message));}this.pending.clear();}
}
export {LOCAL_LABEL,splitThinking};
