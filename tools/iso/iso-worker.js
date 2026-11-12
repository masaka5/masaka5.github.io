import {planImage,imageChunks} from './iso-core.js';
let active=null;
self.onmessage=async({data})=>{
 if(data.type==='cancel'){active?.abort();return;}
 if(data.type!=='start'||active)return;
 const controller=new AbortController();active=controller;let writable=null;
 try{
  const plan=planImage(data.entries,{volumeId:data.volumeId});
  if(!data.handle&&plan.totalBytes>512*1024*1024)throw Error('下载方式最多 512 MiB，请使用直接保存');
  if(data.handle)writable=await data.handle.createWritable();
  const chunks=[];let written=0;
  for await(const chunk of imageChunks(plan,{signal:controller.signal})){
   if(writable)await writable.write(chunk);else chunks.push(chunk);
   written+=chunk.length;self.postMessage({type:'progress',written,total:plan.totalBytes});
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(controller.signal.aborted)throw new DOMException('已取消制作','AbortError');
  self.postMessage({type:'committing'});
  if(writable){await writable.close();writable=null;}
  self.postMessage({type:'done',size:plan.totalBytes,blob:data.handle?null:new Blob(chunks,{type:'application/x-iso9660-image'})});
 }catch(error){
  if(writable)try{await writable.abort();}catch{}
  self.postMessage({type:error.name==='AbortError'?'cancelled':'error',message:error.name==='AbortError'?'已取消':error.message||'制作失败'});
 }finally{active=null;}
};
self.postMessage({type:'ready'});
