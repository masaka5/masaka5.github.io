export async function cachedModel(root,entry,url,progress,signal){
 const handle=await root.getFileHandle(entry.file,{create:true});
 let file=await handle.getFile();
 if(file.size===entry.size){progress(entry.size);return file;}
 let start=file.size<entry.size?file.size:0;
 let response=await fetch(url,{headers:start?{Range:`bytes=${start}-`}:{},signal});
 if(start&&response.status!==206){await response.body?.cancel();start=0;response=await fetch(url,{signal});}
 if(!response.ok||!response.body)throw Error(`模型下载失败（${response.status}），可重试。`);
 if(start&&!new RegExp(`^bytes ${start}-\\d+/${entry.size}$`).test(response.headers.get('Content-Range')||''))throw Error('模型分段响应异常，请清除缓存后重试。');
 const sync=typeof handle.createWritable!=='function'?await handle.createSyncAccessHandle():null;
 let cursor=0;
 const writer=sync?{
  seek:async position=>{cursor=position;},
  write:async bytes=>{let at=0;while(at<bytes.length){const n=sync.write(bytes.subarray(at),{at:cursor});if(!n)throw Error('模型缓存写入失败');cursor+=n;at+=n;}},
  truncate:async length=>sync.truncate(length),
  close:async()=>{sync.flush();sync.close();},
 }:await handle.createWritable({keepExistingData:start>0});
 const reader=response.body.getReader();let written=start;
 try{
  await writer.seek(start);progress(written);
  for(;;){const {done,value}=await reader.read();if(done)break;
   if(written+value.byteLength>entry.size)throw Error('模型文件大小不匹配。');
   await writer.write(value);written+=value.byteLength;progress(written);
  }
  await writer.truncate(written);await writer.close();
 }catch(error){try{await writer.truncate(written);await writer.close();}catch{}await reader.cancel().catch(()=>{});throw error;}
 finally{reader.releaseLock();}
 if(written!==entry.size)throw Error('模型下载中断，可再次加载继续。');
 file=await handle.getFile();
 if(new TextDecoder().decode(await file.slice(0,4).arrayBuffer())!=='GGUF'){await root.removeEntry(entry.file);throw Error('模型文件格式异常，请重试。');}
 return file;
}
