export function createGeneration({id,text,instruction='',language='zh',createdAt=Date.now()}){
 return {id,text,instruction,language,createdAt,status:'generating',chunks:[],samples:0,samplesData:null,rate:24000,error:''};
}
export function appendChunk(record,samples){
 const chunk=samples instanceof Float32Array?samples:new Float32Array(samples);
 return {...record,chunks:[...record.chunks,chunk],samples:record.samples+chunk.length};
}
export function finishGeneration(record,samplesData){
 const tail=samplesData instanceof Float32Array?samplesData:new Float32Array(samplesData||0);
 const audio=new Float32Array(record.samples+tail.length);let offset=0;
 for(const chunk of record.chunks){audio.set(chunk,offset);offset+=chunk.length;}audio.set(tail,offset);
 return {...record,status:'complete',samplesData:audio,samples:audio.length,chunks:[]};
}
export function failGeneration(record,error){return {...record,status:'error',error:String(error||'生成失败')};}
export function removeGeneration(records,id){return records.filter(record=>record.id!==id);}
