export class ArchiveEngine {
  constructor(onProgress=()=>{}) {this.onProgress=onProgress;this.active=null;}
  run(operation,options={}) {
    if(this.active) return Promise.reject(Error('请先完成或取消当前操作'));
    return new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('./archive-worker.mjs',import.meta.url),{type:'module'});
      const finish=(error,result)=>{if(this.active?.worker!==worker)return;this.active=null;worker.terminate();error?reject(error):resolve(result);};
      this.active={worker,finish};
      worker.onmessage=({data})=>{if(data.type==='progress'){this.onProgress(data.message);return;}if(data.type==='error')finish(Error(data.message));else finish(null,data.result);};
      worker.onerror=e=>{e.preventDefault();finish(Error(e.message||'压缩引擎加载失败，请刷新后重试'));};
      worker.onmessageerror=()=>finish(Error('压缩线程数据传输失败'));
      try{worker.postMessage({operation,...options});}catch(e){finish(e);}
    });
  }
  cancel(){this.active?.finish(new DOMException('已取消，内存已释放，可重新操作','AbortError'));}
}
