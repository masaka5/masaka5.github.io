import {MAX_BYTES, MAX_ENTRIES,checkBudget,safePath,parseListing,inspectVhd,fixedVhd} from './image-engine-core.js';

const progress=message=>postMessage({type:'progress',message});
const bytes=async value=>value instanceof Blob?new Uint8Array(await value.arrayBuffer()):value instanceof Uint8Array?value:new Uint8Array(value || 0);
async function normalized(entries=[]) {
  if(!Array.isArray(entries)||entries.length>MAX_ENTRIES)throw Error('镜像最多支持 10000 个条目');
  let total=0;const seen=new Set();
  const metadata=entries.map(entry=>{
    const path=safePath(entry.path),directory=entry.directory || entry.kind==='directory';
    if(seen.has(path))throw Error('存在重复文件路径');seen.add(path);
    const value=entry.blob??entry.data??new Uint8Array();
    if(!(value instanceof Blob || value instanceof Uint8Array || value instanceof ArrayBuffer))throw Error('文件数据类型无效');
    total+=directory?0:(value.size??value.byteLength??0);checkBudget(total);
    return {path,directory,value};
  });
  const result=[];for(const e of metadata)result.push({path:e.path,directory:e.directory,data:e.directory?null:await bytes(e.value)});return result;
}
async function seven(blob) {
  const {default:factory}=await import('../../vendor/7z-wasm/7zz.mjs');
  let logs=[],logBytes=0;
  const log=s=>{logBytes+=s.length;if(logBytes>16*1024*1024)throw Error('镜像目录超过可处理范围');logs.push(s);};
  const z=await factory({print:log,printErr:log});
  const fsWrite=z.FS.write.bind(z.FS);
  z.FS.write=(stream,buffer,offset,length,position,...rest)=>{
    if(stream.path.startsWith('/extract/')||stream.path==='/output.wim')checkBudget((position??stream.position)+length);
    return fsWrite(stream,buffer,offset,length,position,...rest);
  };
  const warnings=[];
  function run(args) {
    logs=[];logBytes=0;const code=z.callMain([...args]);const output=logs.join('\n');
    if(code!==0 && code!==1)throw Error(output.slice(-2500)||`7-Zip 错误 ${code}`);
    if(code===1 || /^WARNINGS:/m.test(output))warnings.push(output.slice(-2000));return output;
  }
  let input;
  if(blob){z.FS.mkdir('/input');z.FS.mount(z.WORKERFS,{blobs:[{name:'image',data:blob}]},'/input');input='/input/image';}
  return {z,run,input,warnings};
}
async function fatModule(){return import('../../vendor/fatfs-wasm/fatfs.mjs');}
async function probe(blob) {
  if(!(blob instanceof Blob))throw Error('请选择镜像文件');
  const tail=new Uint8Array(await blob.slice(-512).arrayBuffer());
  const vhd=inspectVhd(tail,blob.size);
  if(vhd && vhd.diskType!==2)return {format:'vhd',writable:null};
  const diskBlob=vhd?blob.slice(0,-512):blob;
  // Raw FAT volumes only; partition tables, NTFS and Ext stay read-only.
  const boot=new Uint8Array(await diskBlob.slice(0,512).arrayBuffer());
  const marker=new TextDecoder().decode(boot);
  let writable=null;
  if((marker.slice(54,62).startsWith('FAT')||marker.slice(82,90).startsWith('FAT')) && diskBlob.size<=MAX_BYTES){
    try {
      const {FatFsDisk}=await fatModule(),reader=new FileReaderSync();
      // FatFs sector I/O accepts this read-only disk view, keeping listing lazy.
      const lazy={byteLength:diskBlob.size,subarray:(a,b)=>new Uint8Array(reader.readAsArrayBuffer(diskBlob.slice(a,b))),set:()=>{throw Error('只读探测');}};
      const fs=await FatFsDisk.create(lazy);fs.mount('',1);fs.unmount();writable=vhd?'vhd':'img';
    }catch{/* Unsupported FAT variants are still readable via 7-Zip. */}
  }
  return {format:vhd?'vhd':writable?'img':null,writable,diskBlob};
}
async function listing(blob) {
  const p=await probe(blob),s=await seven(p.format==='vhd'&&p.diskBlob?p.diskBlob:blob),output=s.run(['l','-slt','-sccUTF-8','-bd','-p-',s.input]);
  const entries=parseListing(output),detected=/^Type = (.+)$/m.exec(output)?.[1]?.toLowerCase() || 'unknown';
  const format=p.format||detected;
  return {s,entries,format,writable:detected==='wim'&&blob.size<=MAX_BYTES?'wim':p.writable,warnings:s.warnings};
}
function mkdirs(FS,path){let cur='';for(const part of path.split('/')){cur+='/'+part;try{FS.mkdir(cur);}catch{if(!FS.isDir(FS.lstat(cur).mode))throw Error('文件与目录路径冲突');}}}
async function archiveCreate(options,entries) {
  const s=await seven(),{z,run}=s;
  z.FS.mkdir('/source');z.FS.chdir('/source');
  for(const e of entries){mkdirs(z.FS,'source/'+(e.directory?e.path:e.path.split('/').slice(0,-1).join('/')).replace(/\/$/,''));if(!e.directory)z.FS.writeFile('/source/'+e.path,e.data);}
  if(options.blob){checkBudget(options.blob.size);const before=await listing(options.blob);if(before.writable!=='wim')throw Error('此镜像不支持 WIM 写入');z.FS.writeFile('/output.wim',await bytes(options.blob));}
  const names=z.FS.readdir('/source').filter(p=>p!=='.'&&p!=='..');
  if(!names.length && !options.blob)throw Error('WIM 至少需要一个文件或目录');
  if(names.length)run(['a','-twim','-mx=1','-bd','-y','/output.wim','--',...names]);
  const stat=z.FS.stat('/output.wim');checkBudget(stat.size);return new Blob([z.FS.readFile('/output.wim')],{type:'application/octet-stream'});
}
async function fatCreate(options,entries) {
  const {FatFsDisk,FatFsFormat,FatFsMode}=await fatModule();let data;
  const aliases=new Map();
  function registerPath(path){let p='';for(const part of path.split('/')){p+=(p?'/':'')+part;const key=p.toUpperCase();if(aliases.has(key)&&aliases.get(key)!==p)throw Error('FAT 文件路径大小写冲突');aliases.set(key,p);}}
  if(options.blob){const p=await probe(options.blob);if(p.writable!==options.format)throw Error('只支持未分区 FAT IMG 或固定 FAT VHD 编辑');const existing=await listing(options.blob);for(const e of existing.entries)registerPath(e.path);data=await bytes(p.diskBlob);}
  else {const capacity=options.capacityMiB??16;if(!Number.isFinite(capacity)||capacity<1)throw Error('磁盘容量无效');data=new Uint8Array(checkBudget(Math.ceil(capacity*1024*1024/512)*512));}
  for(const e of entries)registerPath(e.path);
  const fs=await FatFsDisk.create(data);if(!options.blob)fs.mkfs({fmt:FatFsFormat.FAT|FatFsFormat.SFD});fs.mount('',1);
  const directories=new Set();
  function mkdir(path){if(!path||directories.has(path))return;const parent=path.split('/').slice(0,-1).join('/');mkdir(parent);try{fs.mkdir(path);}catch(error){if(error.result!==8)throw error;const info=fs.stat(path);if(!info.isDirectory)throw error;}directories.add(path);}
  for(const e of entries){
    // FAT normalizes these names; reject aliases instead of silently overwriting.
    if(e.path.split('/').some(p=>/[<>"|?*]/.test(p)||/[ .]$/.test(p)))throw Error('FAT 文件名包含不支持的字符');
    if(e.directory){mkdir(e.path);continue;}mkdir(e.path.split('/').slice(0,-1).join('/'));
    const file=fs.open(e.path,FatFsMode.WRITE|FatFsMode.CREATE_ALWAYS);
    try{for(let offset=0;offset<e.data.length;offset+=65536){const chunk=e.data.subarray(offset,offset+65536);if(file.write(chunk)!==chunk.length)throw Error('磁盘空间不足');}}finally{file.close();}
  }
  fs.unmount();return new Blob([options.format==='vhd'?fixedVhd(data):data],{type:'application/octet-stream'});
}
async function execute(options) {
  progress('正在加载镜像引擎');
  if(options.operation==='list') {
    const {s,...result}=await listing(options.blob);return {...result,warning:result.warnings.join('\n')};
  }
  if(options.operation==='extract') {
    const {s,entries}=await listing(options.blob),selected=[];let total=0;
    if(!Array.isArray(options.paths)||options.paths.length>MAX_ENTRIES)throw Error('请选择要提取的文件');
    for(const path of new Set(options.paths)){
      safePath(path);const e=entries.find(e=>e.path===path);if(!e)throw Error('镜像中不存在所选文件');if(e.directory)continue;if(e.symlink||entries.some(link=>link.symlink&&path.startsWith(link.path+'/')))throw Error('不支持提取符号链接');total+=e.size;checkBudget(total);selected.push(e);
    }
    s.z.FS.mkdir('/extract');const result=[];
    // Exact path matching, no wildcard expansion or recursive folder extraction.
    for(const e of selected){s.run(['x','-bd','-y','-p-','-spd','-o/extract',s.input,'--',e.path]);const path='/extract/'+e.path,st=s.z.FS.lstat(path);if(!s.z.FS.isFile(st.mode)||st.size!==e.size)throw Error('提取后的文件类型或大小无效');result.push({path:e.path,blob:new Blob([s.z.FS.readFile(path)])});s.z.FS.unlink(path);}
    return result;
  }
  if(options.operation==='create'||options.operation==='update'){
    if(options.operation==='update' && !(options.blob instanceof Blob))throw Error('请选择要编辑的镜像');
    const entries=await normalized(options.entries);
    if(options.format==='wim')return archiveCreate(options,entries);
    if(options.format==='img'||options.format==='vhd')return fatCreate(options,entries);
    throw Error('此镜像格式仅支持读取');
  }
  throw Error('未知镜像操作');
}
self.onmessage=async({data})=>{try{postMessage({type:'result',result:await execute(data)});}catch(error){postMessage({type:'error',name:error.name,message:error.message||String(error)});}};
