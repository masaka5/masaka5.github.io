export const MODEL_PROFILES={
 desktop:{
  id:'spark-x2.6-4b',label:'Spark-X2.6 · 4B Q4',model:'mohdmahmodi/Spark-X2.6-4B-ONNX-WebGPU',
  revision:'02ffadffdd28aa89347e6ab22ea6cf066241a5bf',
  sizes:{
   'onnx/model_q4f16.onnx':187605,'onnx/model_q4f16.onnx_data':1892716800,'onnx/model_q4f16.onnx_data_1':874233600,
   'onnx/model_q4.onnx':185623,'onnx/model_q4.onnx_data':1893029120,'onnx/model_q4.onnx_data_1':1152259840,
  },
 },
 mobile:{
  id:'spark-x2.6-1.7b',label:'Spark-X2.6 · 1.7B Q4（移动端）',model:'mohdmahmodi/Spark-X2.6-1.7B-ONNX-WebGPU',
  revision:'fda6533f2fd90264a0b9df86167be1a230130d90',
  sizes:{
   'onnx/model_q4f16.onnx':157915,'onnx/model_q4f16.onnx_data':1207566336,
   'onnx/model_q4.onnx':156366,'onnx/model_q4.onnx_data':1335492608,
  },
 },
};
export const MODEL_REVISION=MODEL_PROFILES.desktop.revision;
export const MODEL_BASE=`https://huggingface.co/${MODEL_PROFILES.desktop.model}/resolve/${MODEL_REVISION}`;
export const MODEL_CACHE=`pocket-spark-q4-${MODEL_REVISION}`;
export const MODEL_SIZES=MODEL_PROFILES.desktop.sizes;

export function isMobileBrowser(nav=globalThis.navigator){
 if(!nav)return false;
 if(nav.userAgentData?.mobile===true)return true;
 return /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(nav.userAgent||'');
}

export function selectModelProfile(nav=globalThis.navigator){
 return isMobileBrowser(nav)?MODEL_PROFILES.mobile:MODEL_PROFILES.desktop;
}

// Delete only the retired model, including entries in a shared Transformers cache.
export async function removeLegacyModelCache(storage=globalThis.caches){
 if(!storage)return;
 for(const name of await storage.keys()){
  const cache=await storage.open(name);
  for(const req of await cache.keys())if(/onnx-community\/DeepSeek-R1-Distill-Qwen-1\.5B-ONNX\//i.test(decodeURIComponent(req.url)))await cache.delete(req);
 }
}
export class ModelCache{
 constructor({cache=null,fetcher=globalThis.fetch.bind(globalThis),chunkSize=64*1024*1024,onState=()=>{}}={}){
  Object.assign(this,{cache,fetcher,chunkSize,onState});this.stored=!!cache;this.hits=0;this.downloaded=0;
 }
 async put(key,response){
  if(!this.cache||!this.stored)return;
  try{await this.cache.put(key,response);}catch{this.stored=false;this.onState({stored:false});}
 }
 async json(url){
  let res=await this.cache?.match(url);
  if(!res){res=await this.fetcher(url);if(!res.ok)throw Error(`download HTTP ${res.status}`);const value=await res.json();await this.put(url,new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}}));return value;}
  return res.json();
 }
 async bytes(url,total,onBytes=()=>{}){
  if(!Number.isSafeInteger(total)||total<1)throw Error('invalid model size');
  const buffer=new Uint8Array(total);
  for(let start=0;start<total;start+=this.chunkSize){
   const end=Math.min(start+this.chunkSize,total),key=`${url}?pocket-part=${start}-${end}`;
   let response=await this.cache?.match(key),data,streamed=false;
   if(response){data=new Uint8Array(await response.arrayBuffer());if(data.length!==end-start){await this.cache.delete(key);response=null;}}
   if(response)this.hits+=data.length;
   else{
    let lastError;
    for(let attempt=0;attempt<3;attempt++){
     try{
      response=await this.fetcher(url,{headers:{Range:`bytes=${start}-${end-1}`},cache:'no-store'});
      if(!response.ok)throw Error(`download HTTP ${response.status}`);
      // Silently accepting an ignored Range would store a multi-GB corrupt chunk.
      if(response.status!==206&&total>this.chunkSize)throw Error('download server does not support ranges');
     if(response.body?.getReader){
       streamed=true;
       const reader=response.body.getReader(),parts=[],expected=end-start;let received=0;
       while(true){const item=await reader.read();if(item.done)break;if(item.value?.length){parts.push(item.value);received+=item.value.length;onBytes(item.value.length,{partial:true});}}
       if(received!==expected)throw Error('model chunk length mismatch');
       data=new Uint8Array(received);let offset=0;for(const part of parts){data.set(part,offset);offset+=part.length;}
      }else data=new Uint8Array(await response.arrayBuffer());
      if(data.length!==end-start)throw Error('model chunk length mismatch');
      lastError=null;break;
     }catch(error){lastError=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));}
    }
    if(lastError)throw lastError;
    await this.put(key,new Response(data,{headers:{'Content-Type':'application/octet-stream'}}));this.downloaded+=data.length;
   }
   buffer.set(data,start);if(!streamed)onBytes(data.length,{cached:!!response&&this.hits>0,stored:this.stored});
  }
  return buffer;
 }
}
export async function openModelCache({profile=MODEL_PROFILES.desktop,onState=()=>{},chunkSize}={}){
 let cache=null;
 // Cleanup is a migration only; cache/storage failures must not prevent inference.
 try{await removeLegacyModelCache();}catch{}
 const key=`pocket-spark-${profile.id}-${profile.revision}`;
 try{cache=await globalThis.caches?.open(key);}catch{cache=null;}
 return new ModelCache({cache,onState,chunkSize:chunkSize??(profile.id.endsWith('1.7b')?16*1024*1024:64*1024*1024)});
}
