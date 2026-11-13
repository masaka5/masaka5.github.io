import {LOCAL_MODEL,LOCAL_LABEL,splitThinking,localError} from './local-ai-core.mjs?v=20261114-local4';

export class LocalAiClient{
 constructor({onProgress=()=>{},onReady=()=>{},onToken=()=>{},onDone=()=>{},onError=()=>{}}={}){this.handlers={onProgress,onReady,onToken,onDone,onError};this.worker=null;this.pending=new Map();this.ready=false;this.loading=null;this.loadDeferred=null;}
 ensureWorker(){
  if(this.worker)return;
  const worker=this.worker=new Worker(new URL('./assets/local-ai-worker.js?v=20261114-local4',import.meta.url),{type:'module'});
  worker.onmessage=event=>{if(this.worker===worker)this.message(event.data||{});};
  worker.onerror=event=>{event.preventDefault?.();if(this.worker===worker)this.fail('本地模型 Worker 运行失败，请重新加载模型。');};
  worker.onmessageerror=()=>{if(this.worker===worker)this.fail('本地模型通信失败，请重新加载模型。');};
 }
 message(message){
  if(message.type==='progress')this.handlers.onProgress(message);
  else if(message.type==='ready'){this.ready=true;this.device=message.device;this.loadDeferred?.resolve();this.loadDeferred=null;this.loading=null;this.handlers.onReady({model:LOCAL_MODEL,label:LOCAL_LABEL,device:message.device});}
  else if(message.type==='token'){const item=this.pending.get(message.id);if(item){item.touch(true);this.handlers.onToken(message.id,message.text);}}
  else if(message.type==='activity'){this.pending.get(message.id)?.activity();}
  else if(message.type==='done'){const item=this.pending.get(message.id);if(item){this.pending.delete(message.id);item.clear();this.handlers.onDone(message.id,message.text,message.device);item.resolve(message.text);}}
  else if(message.type==='error'){this.fail(localError(message.code));}
 }
 load(){this.ensureWorker();if(this.ready)return Promise.resolve();if(this.loading)return this.loading;this.loading=new Promise((resolve,reject)=>{this.loadDeferred={resolve,reject};});this.worker.postMessage({type:'init'});return this.loading;}
 ask(messages,{maxTokens=384,id=crypto.randomUUID(),idleMs=90000,firstTokenMs=120000,maxMs=300000}={}){
  this.ensureWorker();
  if(this.pending.size)return Promise.reject(Error('本地模型正在生成，请等待或停止。'));
  return new Promise((resolve,reject)=>{
   const item={resolve,reject,idleTimer:null,firstTimer:null,maxTimer:null,hasToken:false,
    clear(){clearTimeout(item.idleTimer);clearTimeout(item.firstTimer);clearTimeout(item.maxTimer);},
    touch:(visible=false)=>{
     if(visible&&!item.hasToken){item.hasToken=true;clearTimeout(item.firstTimer);}
     clearTimeout(item.idleTimer);
     item.idleTimer=setTimeout(()=>this.fail('模型长时间无响应，已停止。请减少输入或重新加载后重试。'),idleMs);
    },
    activity:()=>item.touch()
   };
   this.pending.set(id,item);
   item.firstTimer=setTimeout(()=>this.fail('模型未返回文本，已停止。请重试。'),firstTokenMs);
   item.maxTimer=setTimeout(()=>this.fail('本次生成超时，已停止。请缩短问题后重试。'),maxMs);
   item.touch();this.worker.postMessage({type:'generate',id,messages,maxTokens});
  });
 }
 stop(){this.dispose();}
 fail(message){this.dispose(message);this.handlers.onError(message);}
 dispose(message='已停止本地生成。'){this.worker?.terminate();this.worker=null;this.ready=false;this.loading=null;this.loadDeferred?.reject(Error(message));this.loadDeferred=null;for(const item of this.pending.values()){item.clear();item.reject(Error(message));}this.pending.clear();}
}

export {LOCAL_LABEL,splitThinking};
