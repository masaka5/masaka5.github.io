// All binary metadata fields are serialized by the freestanding C/WASM codec.
const url=new URL('./iso-codec.wasm',import.meta.url);
const bytes=url.protocol==='file:'&&typeof process!=='undefined'&&process.versions?.node
 ?await (await import('node:fs/promises')).readFile(url)
 :await (async()=>{const response=await fetch(url);if(!response.ok)throw Error('ISO WASM 加载失败');return response.arrayBuffer();})();
const {instance}=await WebAssembly.instantiate(bytes,{}),wasm=instance.exports;
const memory=new Uint8Array(wasm.memory.buffer),input=wasm.iso_input(),output=wasm.iso_output();
export const codecBackend='webassembly';
function dateInput(date){
 const parts=[date.getFullYear()-1900,date.getMonth()+1,date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds(),-date.getTimezoneOffset()/15];
 memory.set(parts,input+256);
 const decimal=String(date.getFullYear()).padStart(4,'0')+parts.slice(1,6).map(n=>String(n).padStart(2,'0')).join('')+'00';
 for(let i=0;i<16;i++)memory[input+272+i]=decimal.charCodeAt(i);memory[input+288]=parts[6];
}
export function encodeDirRecord(target,offset,{extentLBA,dataLen,date,isDir,identifier}){
 memory.set(identifier,input);dateInput(date);const n=wasm.iso_record(extentLBA,dataLen,isDir?1:0,identifier.length);
 if(!n)throw Error('ISO 目录记录无效');target.set(memory.subarray(output,output+n),offset);return n;
}
export const encodeDotRecord=(target,offset,extentLBA,dataLen,date)=>encodeDirRecord(target,offset,{extentLBA,dataLen,date,isDir:true,identifier:new Uint8Array([0])});
export const encodeDotDotRecord=(target,offset,extentLBA,dataLen,date)=>encodeDirRecord(target,offset,{extentLBA,dataLen,date,isDir:true,identifier:new Uint8Array([1])});
export function encodePathTable(dirs,endianness){
 const result=new Uint8Array(dirs.reduce((n,d)=>n+8+d.nameBytes.length+(d.nameBytes.length%2),0));let pos=0;
 for(const dir of dirs){memory.set(dir.nameBytes,input);const n=wasm.iso_path(dir.extentLBA,dir.parentIndex,dir.nameBytes.length,endianness==='le'?1:0);if(!n)throw Error('ISO 路径表无效');result.set(memory.subarray(output,output+n),pos);pos+=n;}
 return result;
}
function descriptor(type,opts={}){
 const {volumeId='',volumeSpaceSize=0,pathTableSize=0,pathTableLBA_LE=0,pathTableLBA_BE=0,rootRecord,date=new Date()}=opts;
 for(let i=0;i<volumeId.length;i++)memory[input+i]=volumeId.charCodeAt(i);
 memory.set(new TextEncoder().encode('TOOLBOX'),input+64);dateInput(date);
 const root=rootRecord?new DataView(rootRecord.buffer,rootRecord.byteOffset,rootRecord.byteLength):null;
 const n=wasm.iso_descriptor(type,volumeSpaceSize,pathTableSize,pathTableLBA_LE,pathTableLBA_BE,root?.getUint32(2,true)||0,root?.getUint32(10,true)||0,volumeId.length);
 return memory.slice(output,output+n);
}
export const encodePVD=opts=>descriptor(1,opts),encodeSVD=opts=>descriptor(2,opts),encodeTerminator=()=>descriptor(255);
