export class ImageEngine {
  constructor({onProgress} = {}) { this.onProgress=onProgress;this.active=null;this.destroyed=false; }
  list(blob) { return this.run('list',{blob}); }
  extract(blob,paths) { return this.run('extract',{blob,paths}); }
  create(options) { return this.run('create',options); }
  update(options) { return this.run('update',options); }
  run(operation,options) {
    if(this.destroyed)return Promise.reject(Error('镜像引擎已关闭'));
    if(this.active)return Promise.reject(Error('已有镜像操作正在运行'));
    return new Promise((resolve,reject)=>{
      let worker;
      try { worker=new Worker(new URL('./image-engine-worker.js',import.meta.url),{type:'module'}); } catch(error){reject(error);return;}
      const finish=(error,result)=>{if(this.active?.worker!==worker)return;this.active=null;worker.terminate();error?reject(error):resolve(result);};
      this.active={worker,finish};
      worker.onmessage=({data})=>{if(data.type==='progress'){try{this.onProgress?.(data);}catch{}return;}if(data.type==='error'){const error=Error(data.message);error.name=data.name||'Error';finish(error);}else finish(null,data.result);};
      worker.onerror=event=>{event.preventDefault();finish(Error(event.message||'镜像引擎加载失败'));};
      worker.onmessageerror=()=>finish(Error('镜像工作线程数据传输失败'));
      try {worker.postMessage({operation,...options});}catch(error){finish(error);}
    });
  }
  cancel() {this.active?.finish(new DOMException('已取消','AbortError'));}
  destroy() {this.cancel();this.destroyed=true;}
}
export default ImageEngine;
