import {ModelCache} from '../ai/spark-cache.mjs';
// Safari and some CDN paths answer a Range request with the complete body.
// Consume that body once, bounded by the known model size, instead of treating
// it as a partial chunk or buffering a second full-size array.
export class PortableModelCache extends ModelCache {
 async bytes(url,total,onBytes=()=>{}){
  if(!Number.isSafeInteger(total)||total<1)throw Error('invalid model size');
  const buffer=new Uint8Array(total);
  for(let start=0;start<total;start+=this.chunkSize){
   const end=Math.min(start+this.chunkSize,total),key=`${url}?pocket-part=${start}-${end}`;
   let response=await this.cache?.match(key),data;
   if(response){data=new Uint8Array(await response.arrayBuffer());if(data.length!==end-start){await this.cache.delete(key);response=null;}}
   if(response){buffer.set(data,start);this.hits+=data.length;onBytes(data.length);continue;}
   response=await this.fetcher(url,{headers:{Range:`bytes=${start}-${end-1}`}});
   if(!response.ok)throw Error(`模型下载失败（${response.status}）`);
   if(response.status===200&&total>this.chunkSize){
    if(!response.body)throw Error('模型下载中断，可重试');
    const reader=response.body.getReader();let received=0,cached=0;
    try{
     while(true){
      const {done,value}=await reader.read();if(done)break;
      if(received+value.length>total)throw Error('模型文件大小不匹配');
      const before=received;buffer.set(value,received);received+=value.length;
      const fresh=Math.max(0,received-Math.max(before,start));if(fresh)onBytes(fresh);
      while(cached+this.chunkSize<=received){
       const stop=cached+this.chunkSize;
       await this.put(`${url}?pocket-part=${cached}-${stop}`,new Response(buffer.slice(cached,stop)));cached=stop;
      }
     }
     if(received!==total)throw Error('模型下载中断，可重试');
     if(cached<total)await this.put(`${url}?pocket-part=${cached}-${total}`,new Response(buffer.slice(cached)));
     this.downloaded+=total;return buffer;
    }catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
   }
   data=new Uint8Array(await response.arrayBuffer());
   if(data.length!==end-start)throw Error('model chunk length mismatch');
   const range=response.headers.get('content-range');
   if(range&&!range.startsWith(`bytes ${start}-${end-1}/`))throw Error('模型分段响应异常');
   buffer.set(data,start);await this.put(key,new Response(data));this.downloaded+=data.length;onBytes(data.length);
  }
  return buffer;
 }
}
