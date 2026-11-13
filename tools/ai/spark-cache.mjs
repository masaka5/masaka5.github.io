export const MODEL_REVISION='02ffadffdd28aa89347e6ab22ea6cf066241a5bf';
export const MODEL_BASE=`https://huggingface.co/mohdmahmodi/Spark-X2.6-4B-ONNX-WebGPU/resolve/${MODEL_REVISION}`;
export const MODEL_CACHE=`pocket-spark-q4-${MODEL_REVISION}`;
export const MODEL_SIZES={
 'onnx/model_q4f16.onnx':187605,'onnx/model_q4f16.onnx_data':1892716800,'onnx/model_q4f16.onnx_data_1':874233600,
 'onnx/model_q4.onnx':185623,'onnx/model_q4.onnx_data':1893029120,'onnx/model_q4.onnx_data_1':1152259840,
};

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
  if(!this.cache){this.stored=false;return;}
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
   let response=await this.cache?.match(key),data;
   if(response){data=new Uint8Array(await response.arrayBuffer());if(data.length!==end-start){await this.cache.delete(key);response=null;}}
   if(response)this.hits+=data.length;
   else{
    response=await this.fetcher(url,{headers:{Range:`bytes=${start}-${end-1}`}});
    if(!response.ok)throw Error(`download HTTP ${response.status}`);
    // Silently accepting an ignored Range would store a multi-GB corrupt chunk.
    if(response.status!==206&&total>this.chunkSize)throw Error('download server does not support ranges');
    data=new Uint8Array(await response.arrayBuffer());
    if(data.length!==end-start)throw Error('model chunk length mismatch');
    await this.put(key,new Response(data,{headers:{'Content-Type':'application/octet-stream'}}));this.downloaded+=data.length;
   }
   buffer.set(data,start);onBytes(data.length,{cached:response&&this.hits>0,stored:this.stored});
  }
  return buffer;
 }
}
export async function openModelCache(onState){
 let cache=null;try{cache=await caches.open(MODEL_CACHE);}catch{}
 // Cleanup is a migration only; cache/storage failures must not prevent inference.
 try{await removeLegacyModelCache();}catch{}
 return new ModelCache({cache,onState});
}
