let file=null,engine=null;const chunkSize=1024*1024;
async function ready(){if(!engine){const r=await WebAssembly.instantiateStreaming(fetch(new URL('./hex-core.wasm',import.meta.url)),{});engine=r.instance.exports;}return engine;}
const input=()=>new Uint8Array(engine.memory.buffer,65536,chunkSize+65536);
self.onmessage=async({data:m})=>{try{
 await ready();let result;
 if(m.type==='load'){
  file=m.file;let crc=0xffffffff;const histogram=new Uint32Array(256);
  for(let offset=0;offset<file.size;offset+=chunkSize){const bytes=new Uint8Array(await file.slice(offset,offset+chunkSize).arrayBuffer());input().set(bytes);crc=engine.crc32_update(65536,bytes.length,crc);for(const byte of bytes)histogram[byte]++;if(offset%(16*chunkSize)===0)self.postMessage({type:'progress',value:offset/file.size});}
  const entropy=[...histogram].reduce((sum,n)=>n?sum-(n/file.size)*Math.log2(n/file.size):sum,0);
  result={crc:((crc^0xffffffff)>>>0).toString(16).padStart(8,'0').toUpperCase(),entropy,head:new Uint8Array(await file.slice(0,32).arrayBuffer()),size:file.size};
 }
 else if(m.type==='page')result={bytes:new Uint8Array(await file.slice(m.offset,m.offset+m.length).arrayBuffer()),offset:m.offset};
 else if(m.type==='search'){
  const needle=m.needle;if(!needle.length||needle.length>65536)throw Error('搜索长度需在 1–65536 字节');const start=Math.max(0,m.start||0);let found=-1;
  for(let offset=start;offset<file.size;offset+=chunkSize){const bytes=new Uint8Array(await file.slice(offset,offset+chunkSize+needle.length-1).arrayBuffer());input().set(bytes);new Uint8Array(engine.memory.buffer,1200000,needle.length).set(needle);const match=engine.find_bytes(65536,bytes.length,1200000,needle.length,0);if(match>=0){found=offset+match;break;}}
  result={found};
 }else if(m.type==='strings'){
  const rows=[];let start=0,text='';for(let offset=0;offset<file.size;offset+=chunkSize){const bytes=new Uint8Array(await file.slice(offset,offset+chunkSize).arrayBuffer());for(let i=0;i<bytes.length;i++){const b=bytes[i];if(b>=32&&b<=126){if(!text)start=offset+i;text+=String.fromCharCode(b);if(text.length>=1000){rows.push({start,text});text='';}}else{if(text.length>=m.min)rows.push({start,text});text='';}if(rows.length>=5000)break;}if(rows.length>=5000)break;}if(text.length>=m.min&&rows.length<5000)rows.push({start,text});result=rows;
 }else throw Error('未知操作');
 self.postMessage({id:m.id,result});
 }catch(e){self.postMessage({id:m.id,error:e.message});}};
