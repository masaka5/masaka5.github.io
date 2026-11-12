import {encodePVD,encodeSVD,encodeTerminator,encodeDirRecord,encodeDotRecord,encodeDotDotRecord,encodePathTable} from './iso-codec.js';

const SECTOR=2048,CHUNK=4*1024*1024,MAX_ENTRIES=10000;
const ascii=new TextEncoder(),round=n=>Math.ceil(n/SECTOR)*SECTOR;
const compare=(a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return a[i]-b[i];return a.length-b.length;};
const recordSize=identifier=>{const size=33+identifier.length;return size+(size%2);};
function encodeJolietIdentifier(name,isDir){const text=name+(isDir?'':';1'),bytes=new Uint8Array(text.length*2);for(let i=0;i<text.length;i++){bytes[i*2]=text.charCodeAt(i)>>8;bytes[i*2+1]=text.charCodeAt(i)&255;}return bytes;}
function checkName(name,isDirectory){
 if(!name||name==='.'||name==='..'||/[\x00-\x1f\x7f-\x9f\\/:*?"<>|;\ud800-\udfff]/.test(name)||/[. ]$/.test(name))throw Error('名称包含 ISO 不支持的字符：'+name);
 if(name.length>(isDirectory?64:62))throw Error('名称过长：'+name+'（文件最多 62 字，目录最多 64 字）');
}
function identifier(node,joliet){return joliet?encodeJolietIdentifier(node.name,node.kind==='directory'):ascii.encode(node.alias+(node.kind==='file'?';1':''));}
function sorted(node,joliet){return [...node.children.values()].sort((a,b)=>compare(identifier(a,joliet),identifier(b,joliet)));}
function aliasNames(node){
 const used=new Set();
 for(const child of [...node.children.values()].sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){
  let base=child.name.toUpperCase().replace(/[^A-Z0-9_.]/g,'_'),extension='';
  if(child.kind==='file'){const dot=base.lastIndexOf('.');if(dot>0){extension=base.slice(dot+1).slice(0,8);base=base.slice(0,dot);}}
  base=base.replace(/\./g,'_');
  const max=child.kind==='directory'?31:29,suffix=extension?'.'+extension:'';let candidate=base.slice(0,max-suffix.length)+suffix,index=0;
  while(used.has(candidate)){const serial='_'+(++index);candidate=base.slice(0,max-suffix.length-serial.length)+serial+suffix;}
  child.alias=candidate;used.add(candidate);if(child.kind==='directory')aliasNames(child);
 }
}
function directoryBytes(node,joliet){let pos=68;for(const child of sorted(node,joliet)){const len=recordSize(identifier(child,joliet)),within=pos%SECTOR;if(within+len>SECTOR)pos+=SECTOR-within;pos+=len;}return round(pos);}
function tree(root,joliet){
 const dirs=[root];for(let i=0;i<dirs.length;i++)for(const child of sorted(dirs[i],joliet))if(child.kind==='directory')dirs.push(child);
 const indices=new Map(dirs.map((node,i)=>[node,i+1]));
 const names=dirs.map(node=>node===root?new Uint8Array([0]):identifier(node,joliet));
 const pathBytes=names.reduce((n,name)=>n+8+name.length+(name.length%2),0);
 return {joliet,dirs,indices,names,pathBytes,extents:new Map()};
}
export function planImage(entries,{volumeId='DATA',allowEmpty=false}={}){
 if(!/^[A-Z0-9_]{1,16}$/.test(volumeId))throw Error('卷标为 1–16 位大写字母、数字或下划线');
 if(!Array.isArray(entries)||(!entries.length&&!allowEmpty))throw Error('请先添加文件或文件夹');
 if(entries.length>MAX_ENTRIES)throw Error('最多添加 10000 个文件和目录');
 const root={name:'',kind:'directory',children:new Map(),parent:null},explicit=new Set();let count=0;
 for(const entry of entries){
  if(!entry||typeof entry.path!=='string'||!['file','directory'].includes(entry.kind))throw Error('文件条目无效');
  const parts=entry.path.split('/'),isDir=entry.kind==='directory';
  if(parts.length>(isDir?7:8))throw Error('最多支持 7 层子目录：'+entry.path);
  let parent=root;
  for(let i=0;i<parts.length;i++){
   const last=i===parts.length-1,kind=last?entry.kind:'directory',name=parts[i];checkName(name,kind==='directory');
   const key=name.normalize('NFC').toUpperCase();let node=parent.children.get(key);
   if(node&&(node.name!==name||node.kind!==kind||last&&kind==='file'))throw Error('路径重复或文件与目录冲突：'+entry.path);
   if(!node){node={name,kind,parent,children:kind==='directory'?new Map():null};parent.children.set(key,node);if(++count>MAX_ENTRIES)throw Error('文件和目录总计不超过 10000 个');}
   if(last){if(explicit.has(node))throw Error('路径重复：'+entry.path);explicit.add(node);if(kind==='file'){
    const blob=entry.blob;if(!blob||!Number.isSafeInteger(blob.size)||blob.size<0||typeof blob.slice!=='function')throw Error('文件不可读取：'+entry.path);
    if(blob.size>=4294967296)throw Error('单个文件必须小于 4 GiB：'+entry.path);node.blob=blob;node.size=blob.size;
   }}
   parent=node;
  }
 }
 aliasNames(root);const base=tree(root,false),joliet=tree(root,true),trees=[base,joliet];let offset=19*SECTOR;
 for(const t of trees){t.le=offset/SECTOR;offset+=round(t.pathBytes);t.be=offset/SECTOR;offset+=round(t.pathBytes);}
 for(const t of trees)for(const node of t.dirs){const size=directoryBytes(node,t.joliet);t.extents.set(node,{offset,size});offset+=size;}
 const metadataSize=offset,files=[];
 for(const dir of joliet.dirs)for(const node of sorted(dir,true))if(node.kind==='file'){
  node.offset=offset;files.push({blob:node.blob,size:node.size,offset});offset+=round(node.size);
 }
 if(offset/SECTOR>0xffffffff)throw Error('ISO 大小超出格式限制');
 const metadata=new Uint8Array(metadataSize),date=new Date();
 for(const t of trees){
  const rootExtent=t.extents.get(root),rootRecord=new Uint8Array(34);encodeDotRecord(rootRecord,0,rootExtent.offset/SECTOR,rootExtent.size,date);
  const opts={volumeId,application:'TOOLBOX',volumeSpaceSize:offset/SECTOR,pathTableSize:t.pathBytes,pathTableLBA_LE:t.le,pathTableLBA_BE:t.be,rootRecord,date};
  metadata.set(t.joliet?encodeSVD(opts):encodePVD(opts),(t.joliet?17:16)*SECTOR);
  const table=t.dirs.map((node,i)=>({nameBytes:t.names[i],extentLBA:t.extents.get(node).offset/SECTOR,parentIndex:node===root?1:t.indices.get(node.parent)}));
  metadata.set(encodePathTable(table,'le'),t.le*SECTOR);metadata.set(encodePathTable(table,'be'),t.be*SECTOR);
  for(const node of t.dirs){
   const extent=t.extents.get(node),parentExtent=t.extents.get(node.parent||root);let pos=extent.offset;
   pos+=encodeDotRecord(metadata,pos,extent.offset/SECTOR,extent.size,date);pos+=encodeDotDotRecord(metadata,pos,parentExtent.offset/SECTOR,parentExtent.size,date);
   for(const child of sorted(node,t.joliet)){
    const id=identifier(child,t.joliet),len=recordSize(id);if(pos%SECTOR+len>SECTOR)pos=round(pos);
    const directory=child.kind==='directory',location=directory?t.extents.get(child):child;
    pos+=encodeDirRecord(metadata,pos,{extentLBA:location.offset/SECTOR,dataLen:location.size,date,isDir:directory,identifier:id});
   }
  }
 }
 metadata.set(encodeTerminator(),18*SECTOR);
 return {metadata,files,totalBytes:offset,fileCount:files.length,directoryCount:count-files.length};
}
export async function* imageChunks(plan,{signal,onProgress=()=>{}}={}){
 const check=()=>{if(signal?.aborted)throw new DOMException('已取消制作','AbortError');};let written=0;
 const emit=chunk=>{written+=chunk.length;onProgress(written);return chunk;};
 for(let offset=0;offset<plan.metadata.length;offset+=CHUNK){check();yield emit(plan.metadata.subarray(offset,offset+CHUNK));}
 for(const file of plan.files){
  for(let start=0;start<file.size;start+=CHUNK){
   check();const end=Math.min(file.size,start+CHUNK),chunk=new Uint8Array(await file.blob.slice(start,end).arrayBuffer());check();
   if(chunk.length!==end-start)throw Error('源文件读取不完整，请重新添加文件');yield emit(chunk);
  }
  check();const padding=round(file.size)-file.size;if(padding)yield emit(new Uint8Array(padding));
 }
 check();if(written!==plan.totalBytes)throw Error('ISO 写入长度不一致');
}
