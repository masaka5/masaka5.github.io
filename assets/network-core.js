(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NetworkCore=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  function urlOf(raw){const url=new URL(raw);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('请输入不含账户信息的 HTTP(S) 地址');if(typeof location!=='undefined'&&location.protocol==='https:'&&url.protocol!=='https:')throw new Error('HTTPS 页面只能检测 HTTPS 地址');url.hash='';return url;}
  function guard(signal){if(signal?.aborted)throw new DOMException('操作已停止','AbortError');}
  function control(signal,timeout){
    guard(signal);const controller=new AbortController();let timedOut=false;
    const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeout);
    return {signal:controller.signal,timedOut:()=>timedOut,close(){clearTimeout(timer);signal?.removeEventListener('abort',abort);}};
  }
  async function probe(raw,{signal,timeout=4000}={}){
    const url=urlOf(raw);url.searchParams.set('_toolbox',Date.now()+'-'+Math.random().toString(36).slice(2));
    const request=control(signal,timeout),start=performance.now();
    try{
      const response=await fetch(url.href,{mode:'no-cors',credentials:'omit',cache:'no-store',redirect:'follow',referrerPolicy:'no-referrer',signal:request.signal});
      guard(signal);const ms=performance.now()-start;
      if(response.body)response.body.cancel().catch(()=>{});
      return {ok:true,ms,httpStatus:response.type==='opaque'?null:response.status};
    }catch(error){guard(signal);return {ok:false,ms:null,httpStatus:null,reason:request.timedOut()?'超时':'连接失败或浏览器受限'};}finally{request.close();}
  }
  async function latency(url,{signal,count=3,timeout=4000,onSample}={}){
    guard(signal);const samples=[];
    for(let i=0;i<count;i++){guard(signal);samples.push(await probe(url,{signal,timeout}));if(onSample)onSample(samples.slice());}
    const times=samples.filter(s=>s.ok).map(s=>s.ms).sort((a,b)=>a-b),middle=Math.floor(times.length/2);
    return {samples,success:times.length,median:times.length?(times.length%2?times[middle]:(times[middle-1]+times[middle])/2):null,min:times.length?times[0]:null,max:times.length?times[times.length-1]:null};
  }
  async function download(raw,{signal,maxBytes=32*1024*1024,duration=10000,onProgress}={}){
    guard(signal);const url=urlOf(raw),request=control(signal,duration),start=performance.now();let bytes=0,reader;
    url.searchParams.set('_toolbox',Date.now()+'-'+Math.random().toString(36).slice(2));
    try{
      const response=await fetch(url.href,{mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:request.signal});
      if(!response.ok||response.type==='opaque'||!response.body)throw new Error('节点未提供可读取的测速数据');
      if(/text\/html|application\/json/i.test(response.headers.get('content-type')||''))throw new Error('节点返回了网页或错误信息，请更换下载地址');
      reader=response.body.getReader();
      while(bytes<maxBytes){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(onProgress)onProgress({bytes,ms:performance.now()-start});guard(signal);}
    }catch(error){guard(signal);if(!request.timedOut()||!bytes)throw new Error(request.timedOut()?'下载超时':error instanceof TypeError?'无法读取节点数据（连接失败或跨域受限）':error.message||'下载失败，节点可能限制跨域访问');}
    finally{if(reader)await reader.cancel().catch(()=>{});request.close();}
    if(bytes<32768)throw new Error('数据不足 32 KB，无法给出有意义的速率');
    const ms=Math.max(.01,performance.now()-start);guard(signal);return {bytes,ms,mbps:bytes*8/ms/1000};
  }
  async function upload(raw,{signal,bytes=1024*1024,timeout=15000}={}){
    guard(signal);const url=urlOf(raw),request=control(signal,timeout),data=new Uint8Array(bytes);
    for(let offset=0;offset<bytes;offset+=65536)crypto.getRandomValues(data.subarray(offset,Math.min(offset+65536,bytes)));
    const start=performance.now();
    try{
      const response=await fetch(url.href,{method:'POST',body:data,mode:'cors',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/octet-stream'},referrerPolicy:'no-referrer',signal:request.signal});
      if(!response.ok||response.type==='opaque')throw new Error('上传节点未确认接收成功');await response.arrayBuffer();guard(signal);
      const ms=Math.max(.01,performance.now()-start);return {bytes,ms,mbps:bytes*8/ms/1000};
    }catch(error){guard(signal);throw new Error(request.timedOut()?'上传超时':error instanceof TypeError?'无法连接上传节点（连接失败或跨域受限）':error.message||'上传失败，节点可能限制跨域访问');}finally{request.close();}
  }
  return {urlOf,probe,latency,download,upload};
});
