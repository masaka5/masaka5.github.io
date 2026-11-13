import {LOCAL_MODEL,LOCAL_LABEL,splitThinking,localError} from './local-ai-core.mjs';

export class LocalAiClient{
 constructor({onProgress=()=>{},onReady=()=>{},onToken=()=>{},onDone=()=>{},onError=()=>{}}={}){this.handlers={onProgress,onReady,onToken,onDone,onError};this.worker=null;this.pending=new Map();this.ready=false;this.loading=false;}
 ensureWorker(){
  if(this.worker)return;
  this.worker=new Worker('./assets/local-ai-worker.js?v=20261113-local1',{type:'module'});
  this.worker.onmessage=event=>this.message(event.data||{});
  this.worker.onerror=()=>this.handlers.onError('本地模型 Worker 启动失败，请刷新页面重试。');
 }
 message(message){
  if(message.type==='progress')this.handlers.onProgress(message);
  else if(message.type==='ready'){this.ready=true;this.loading=false;this.handlers.onReady({model:LOCAL_MODEL,label:LOCAL_LABEL,device:message.device});}
  else if(message.type==='token'){this.handlers.onToken(message.id,message.text);}
  else if(message.type==='done'){const item=this.pending.get(message.id);if(item){this.pending.delete(message.id);this.handlers.onDone(message.id,message.text,message.device);item.resolve(message.text);}}
  else if(message.type==='error'){this.loading=false;const item=message.id&&this.pending.get(message.id);if(item){this.pending.delete(message.id);item.reject(Error(localError(message.code)));}this.handlers.onError(localError(message.code));}
 }
 load(){this.ensureWorker();if(this.ready)return Promise.resolve();if(this.loading)return this.loading;this.loading=true;this.loading=new Promise((resolve,reject)=>{const old=this.handlers.onReady,fail=this.handlers.onError;this.handlers.onReady=value=>{old(value);resolve(value);};this.handlers.onError=value=>{fail(value);reject(Error(value));};this.worker.postMessage({type:'init'});});return this.loading;}
 ask(messages,{maxTokens=512}={}){this.ensureWorker();const id=crypto.randomUUID();return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.worker.postMessage({type:'generate',id,messages,maxTokens});});}
 stop(){this.worker?.postMessage({type:'stop'});}
 dispose(){this.worker?.terminate();this.worker=null;this.ready=false;this.loading=false;for(const item of this.pending.values())item.reject(Error('local-model-stopped'));this.pending.clear();}
}

export {LOCAL_LABEL,splitThinking};
