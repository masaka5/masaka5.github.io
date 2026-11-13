export class AnkiClient{
 constructor(onProgress=()=>{}){this.worker=new Worker(new URL('./worker.js?v=20261114-1',import.meta.url),{type:'module'});this.pending=new Map();this.counter=0;this.onProgress=onProgress;
  this.worker.onmessage=({data:m})=>{if(m.event==='progress'){this.onProgress(m);return;}const pending=this.pending.get(m.id);if(!pending)return;this.pending.delete(m.id);m.error?pending.reject(Error(m.error)):pending.resolve(m.result);};
  this.worker.onerror=()=>{for(const item of this.pending.values())item.reject(Error('学习引擎已中断，已保存的记录不会丢失，请刷新页面。'));this.pending.clear();};
 }
 call(action,args={}){const id=++this.counter;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});const transfer=args.bytes instanceof ArrayBuffer?[args.bytes]:[];this.worker.postMessage({id,action,args},transfer);});}
 dispose(){this.worker.terminate();for(const item of this.pending.values())item.reject(Error('页面已关闭。'));this.pending.clear();}
}
