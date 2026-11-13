const MAX_INPUT=256*1024*1024,MAX_OUTPUT=512*1024*1024,SCRATCH=16*1024*1024;
const messages={
 '-1':'不是有效的 ETL 文件，或缺少跟踪头。',
 '-2':'ETL 缓冲区不完整，文件可能尚未写入完成或已损坏。',
 '-3':'ETL 事件长度无效，文件可能已损坏。',
 '-4':'当前 ETL 使用暂不支持的记录头，请转换为 PCAPNG 后打开。',
 '-5':'ETL 压缩缓冲区无法解码，或解压后超过 16 MB。',
 '-6':'ETL 转换结果过大，请缩小抓取范围。',
 '-7':'ETL 时钟信息无效，无法还原事件时间。'
};
export function looksLikeEtl(bytes,name=''){
 if(/\.etl$/i.test(name))return true;
 const p=new Uint8Array(bytes);if(p.length<104)return false;
 const v=new DataView(p.buffer,p.byteOffset,p.byteLength),size=v.getUint32(0,true);
 return size>=104&&size<=16*1024*1024&&p[75]===0xc0&&(p[74]===1||p[74]===2)&&v.getUint16(78,true)===0;
}
export class EtlReader{
 static async open(bytes){
  if(bytes.byteLength>MAX_INPUT)throw Error('单个抓包文件不能超过 256 MB');
  const response=await fetch(new URL('./etl-core.wasm?v=20261114-etl1',import.meta.url));
  if(!response.ok)throw Error('ETL WASM 组件下载失败，请重试。');
  const {instance}=await WebAssembly.instantiate(await response.arrayBuffer());
  const reader=new EtlReader(instance.exports,bytes);return reader;
 }
 constructor(api,bytes){
  this.api=api;this.length=bytes.byteLength;this.base=Number(api.__heap_base.value);
  this.scratch=Math.ceil((this.base+this.length)/8)*8;this.out=this.scratch+SCRATCH;
  this.grow(this.out);new Uint8Array(api.memory.buffer).set(new Uint8Array(bytes),this.base);
  this.measure(0);this.mode=this.stats.packets?'packets':'events';
 }
 grow(end){try{const count=Math.ceil(end/65536)-this.api.memory.buffer.byteLength/65536;if(count>0)this.api.memory.grow(count);}catch{throw Error('浏览器内存不足，请使用更小的 ETL 文件。');}}
 measure(mode){
  const n=this.api.etl_convert(this.base,this.length,0,0,this.scratch,SCRATCH,mode);this.check(n);
  this.stats={events:this.api.etl_events(),packets:this.api.etl_packets(),buffers:this.api.etl_buffers(),warnings:this.api.etl_warnings(),lost:this.api.etl_lost(),sourceSize:this.length};
  return n;
 }
 check(n){if(n<0)throw Error(messages[n]||'ETL 解析失败。');if(n>MAX_OUTPUT)throw Error(messages[-6]);}
 convert(mode=this.mode){
  const m=mode==='events'?1:0,n=this.measure(m);this.grow(this.out+n);
  const length=this.api.etl_convert(this.base,this.length,this.out,n,this.scratch,SCRATCH,m);this.check(length);this.mode=mode;
  return new Uint8Array(this.api.memory.buffer,this.out,length);
 }
}
