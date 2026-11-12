import {QemuTextScreen} from './qemu-screen.js';
const C=globalThis.WebVMCore,assets=new URL('../../vendor/qemu/',import.meta.url);
const encoder=new TextEncoder();
const MAX_HEADER=4*1024*1024,MAX_FILE=256*1024*1024,MAX_SHARED=512*1024*1024;
const internalPath=path=>path.split('/').some(name=>name.startsWith('.toolbox-'));
function validateShared(entries){
 if(!Array.isArray(entries)||entries.length>10000)throw Error('共享文件格式无效');
 const paths=new Map();let total=0;
 for(const entry of entries){if(!entry||typeof entry.path!=='string'||C.sharedPath(entry.path)!==entry.path||internalPath(entry.path)||paths.has(entry.path)||typeof entry.directory!=='boolean'&&entry.directory!==undefined)throw Error('共享文件路径无效');paths.set(entry.path,!!entry.directory);if(!entry.directory){if(!ArrayBuffer.isView(entry.data)||entry.data.BYTES_PER_ELEMENT!==1||entry.data.byteLength>MAX_FILE)throw Error('共享文件超过 256 MB 上限');total+=entry.data.byteLength;if(total>MAX_SHARED)throw Error('共享文件总量超过 512 MB 上限');}}
 for(const path of paths.keys()){const parts=path.split('/');parts.pop();while(parts.length){if(paths.get(parts.join('/'))===false)throw Error('共享文件与目录路径冲突');parts.pop();}}
 return entries;
}
export async function packQemuSnapshot(migration,entries){
 validateShared(entries);const payload=[],metadata=[];let offset=0;
 for(const entry of entries){if(entry.directory)metadata.push({path:entry.path,directory:true});else{metadata.push({path:entry.path,directory:false,offset,length:entry.data.byteLength});payload.push(entry.data);offset+=entry.data.byteLength;}}
 const stream=new Uint8Array(migration);if(stream.length<8||stream[0]!==81||stream[1]!==69||stream[2]!==86||stream[3]!==77)throw Error('QEMU 快照数据无效');
 const header=encoder.encode(JSON.stringify({migrationLength:stream.byteLength,sharedLength:offset,shared:metadata}));if(header.length>MAX_HEADER)throw Error('快照文件清单过大');
 const prefix=new Uint8Array(8);prefix.set(encoder.encode('TBQ2'));new DataView(prefix.buffer).setUint32(4,header.length,true);
 return new Blob([prefix,header,stream,...payload]).arrayBuffer();
}
export function unpackQemuSnapshot(buffer){
 const data=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);if(data.length<8||new TextDecoder().decode(data.subarray(0,4))!=='TBQ2')throw Error('不是有效的 Ubuntu 快照');
 const length=new DataView(data.buffer,data.byteOffset,data.byteLength).getUint32(4,true);if(length>MAX_HEADER||length+8>=data.length)throw Error('快照文件无效');
 const header=JSON.parse(new TextDecoder().decode(data.subarray(8,8+length))),start=8+length;
 if(!Number.isSafeInteger(header.migrationLength)||header.migrationLength<8||!Number.isSafeInteger(header.sharedLength)||header.sharedLength<0||header.sharedLength>MAX_SHARED||start+header.migrationLength+header.sharedLength!==data.length||!Array.isArray(header.shared))throw Error('快照文件长度无效');
 const migration=data.subarray(start,start+header.migrationLength);if(migration[0]!==81||migration[1]!==69||migration[2]!==86||migration[3]!==77)throw Error('QEMU 快照数据无效');
 let offset=0;const shared=header.shared.map(entry=>{if(entry.directory===true)return{path:entry.path,directory:true};if(entry.directory!==false||entry.offset!==offset||!Number.isSafeInteger(entry.length)||entry.length<0||entry.length>MAX_FILE||offset+entry.length>header.sharedLength)throw Error('快照共享文件长度无效');const file={path:entry.path,directory:false,data:data.subarray(start+header.migrationLength+offset,start+header.migrationLength+offset+entry.length)};offset+=entry.length;return file;});
 if(offset!==header.sharedLength)throw Error('快照共享文件长度无效');validateShared(shared);return{migration,shared};
}
function abort(signal){if(signal?.aborted)throw new DOMException('已取消','AbortError');}
async function read(url,signal){abort(signal);const response=await fetch(url,{signal,credentials:'omit'});if(!response.ok)throw Error('加载失败：HTTP '+response.status+' · '+new URL(url,location.href).pathname.split('/').pop());return new Uint8Array(await response.arrayBuffer());}
class SharedFiles{
 constructor(engine){this.engine=engine;this.entries=[];this.inodes=[{mode:0x4000,direntries:new Map()}];}
 rebuild(){
  this.inodes=[{mode:0x4000,direntries:new Map()}];this.paths=new Map([['',0]]);
  for(const entry of this.entries){
   const parts=entry.path.split('/');let prefix='',parent=0;
   for(let i=0;i<parts.length;i++){prefix+=(prefix?'/':'')+parts[i];let id=this.paths.get(prefix);
    if(id===undefined){id=this.inodes.length;const directory=i<parts.length-1||entry.directory;this.inodes.push({mode:directory?0x4000:0x8000,size:directory?0:entry.size??entry.data?.byteLength??0,direntries:directory?new Map():undefined,path:prefix});this.inodes[parent].direntries.set(parts[i],id);this.paths.set(prefix,id);}
    parent=id;
   }
  }
 }
 get_state(){return {schema:'toolbox-qemu-shared/1',entries:this.engine.host.files()};}
 async set_state(state){if(state?.schema!=='toolbox-qemu-shared/1')throw Error('共享文件格式无效');validateShared(state.entries);this.engine.host.restoreFiles(state.entries);await this.engine.sync_shared();}
 SearchPath(path){return {id:this.paths?.get(path)??-1};}
 async Write(id,offset,length,data){const path=this.inodes[id]?.path;if(!path)throw Error('共享文件不存在');let previous=this.engine.host.read(path);const bytes=new Uint8Array(Math.max(previous.length,offset+length));bytes.set(previous);bytes.set(data.subarray(0,length),offset);this.engine.host.write(path,bytes);await this.engine.sync_shared();}
 async ChangeSize(id,length){const path=this.inodes[id]?.path;if(!path)throw Error('共享文件不存在');const old=this.engine.host.read(path),bytes=new Uint8Array(length);bytes.set(old.subarray(0,length));this.engine.host.write(path,bytes);await this.engine.sync_shared();}
}
export class QemuEngine{
 static async create(options){
  if(!crossOriginIsolated||typeof SharedArrayBuffer==='undefined')throw Error('浏览器未启用多核虚拟机所需的跨源隔离');
  const p=options.profile;
  if(p.id===C.ubuntu.id&&p.machine.memory_mb<1536)throw Error('Ubuntu Server 至少需要 1536 MB 内存，建议使用推荐配置');
  if(!['','fetch'].includes(p.machine.relay_url))throw Error('Ubuntu 当前支持浏览器 HTTP 或离线模式');
  if(!p.media.bzimage||!p.media.initrd_parts&&!p.media.initrd)throw Error('多核模式需要 Linux 内核与启动镜像');
  const engine=new QemuEngine(options);
  try{await engine.prepare();await engine.spawn();return engine;}catch(error){await engine.destroy();throw error;}
 }
 constructor({profile,screen,signal,onProgress=()=>{}}){
  Object.assign(this,{profile,container:screen,signal,onProgress});this.engineType='qemu';this.listeners=new Map();this.running=false;this.destroyed=false;this.fs9p=new SharedFiles(this);this.emulator_bus={register:(name,callback)=>this.add_listener(name,callback)};this.network_adapter={};this.transport={tx:[],rx:[]};
 }
 add_listener(name,callback){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(callback);}
 emit(name,value){for(const callback of this.listeners.get(name)||[])callback(value);}
 async prepare(){
  this.onProgress('正在加载多核引擎…');
  const urls=this.profile.media.initrd_parts||[this.profile.media.initrd];let length=0,completed=0;
  const [wasm,rom,kernel,parts]=await Promise.all([
   read(new URL('qemu.wasm',assets),this.signal),read(new URL('rom.bin',assets),this.signal),read(this.profile.media.bzimage.url,this.signal),
   Promise.all(urls.map(async source=>{const part=await read(source.url,this.signal);length+=part.length;this.onProgress('加载 Ubuntu '+(++completed)+'/'+urls.length+' · '+C.readableBytes(length));return part;}))
  ]);
  Object.assign(this,{wasm,rom,kernel});
  let compressed=new Uint8Array(length);let offset=0;for(const part of parts){compressed.set(part,offset);offset+=part.length;}parts.length=0;
  this.onProgress('正在展开启动镜像…');
  this.image=compressed[0]===31&&compressed[1]===139?new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()):compressed;
  abort(this.signal);
 }
 async spawn(snapshot,shared){
  abort(this.signal);this.onProgress(snapshot?'正在恢复运行环境…':'正在初始化多核虚拟机…');
  const iframe=document.createElement('iframe');iframe.setAttribute('aria-hidden','true');iframe.tabIndex=-1;iframe.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;pointer-events:none';iframe.title='虚拟机运行环境';iframe.src=new URL('qemu-host.html',import.meta.url).href;this.iframe=iframe;
  const loaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('虚拟机运行环境加载超时')),30000);iframe.onload=()=>{const w=iframe.contentWindow;if(w.QemuHost){clearTimeout(timer);resolve(w.QemuHost);}else{w.addEventListener('qemu-host-ready',()=>{clearTimeout(timer);resolve(w.QemuHost);},{once:true});}};this.signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('已取消','AbortError'));},{once:true});});
  document.body.append(iframe);this.host=await loaded;
  await this.host.start({profile:this.profile,kernel:this.kernel,image:this.image,rom:this.rom,wasm:this.wasm,snapshot:snapshot?new Uint8Array(snapshot):null,shared,onEvent:(name,event)=>this.event(name,event)});
  abort(this.signal);await this.sync_shared();
  if(!this.screen){
   const canvas=this.container.querySelector('canvas')||document.createElement('canvas');this.container.replaceChildren(canvas);canvas.hidden=false;canvas.style.display='block';
   this.screen=new QemuTextScreen({canvas,viewport:this.container.parentElement,readScreen:async()=>{try{return this.host.read('.toolbox-screen');}catch{return null;}},sendKeys:keys=>this.host.keys(keys),sendMouse:event=>this.host.mouse?.(event),onSize:(width,height)=>this.emit('screen-set-size',[width,height,0]),onError:error=>this.emit('screen-error',error)});
  }
 }
 event(name,event){
  if(this.destroyed)return;
  if(name==='serial')for(const byte of event)this.emit('serial0-output-byte',byte);
  else if(name==='error')this.emit('runtime-error',Error(event));
  else if(name==='file'){this.emit(event.method==='write'?'9p-write-end':'9p-read-end',[event.path,event.bytes]);if(event.method==='write'&&!this.sharedRefreshTimer)this.sharedRefreshTimer=setTimeout(()=>{this.sharedRefreshTimer=null;this.sync_shared().catch(()=>{});},500);}
  else if(name==='network'){
   this.emit(event.direction==='rx'?'eth-receive-end':'eth-transmit-end',[event.bytes]);
   // Socket networking uses a big-endian length prefix; capture only complete
   // Ethernet packets, preserving partial chunks between callbacks.
   const key=event.direction,old=this.transport[key],chunk=new Uint8Array(old.length+event.data.length);chunk.set(old);chunk.set(event.data,old.length);let offset=0;
   while(chunk.length-offset>=4){const length=new DataView(chunk.buffer).getUint32(offset);if(length>65535){offset=chunk.length;break;}if(chunk.length-offset<4+length)break;this.emit(key==='rx'?'net0-receive':'net0-send',chunk.slice(offset+4,offset+4+length));offset+=4+length;}
   this.transport[key]=chunk.slice(offset);
  }
 }
 async sync_shared(){if(!this.host)return;this.fs9p.entries=this.host.files({metadataOnly:true,includeInternal:true});this.fs9p.rebuild();}
 async create_file(path,data){this.host.write(C.sharedPath(path),data);await this.sync_shared();this.emit('9p-write-end',[path,data.length]);}
 async read_file(path){return this.host.read(C.sharedPath(path));}
 is_running(){return this.running;}
 get_instruction_counter(){return null;}
 async run(){if(this.destroyed)return;await this.host.run();this.running=true;this.emit('emulator-started');}
 async stop(){if(this.destroyed)return;await this.host.stop();this.running=false;this.emit('emulator-stopped');}
 serial_send_bytes(_port,bytes){if(this.running)this.host.send(bytes);}
 keyboard_set_enabled(value){this.screen?.setKeyboardEnabled(value);this.screen?.setEnabled(this.container.parentElement.hidden===false);}
 mouse_set_enabled(value){this.screen?.setMouseEnabled?.(value);}
 keyboard_send_scancodes(bytes){return this.screen?.sendScancodes(bytes);}
 keyboard_send_text(text){return this.screen?.sendText(text);}
 screen_set_scale(x,y){const canvas=this.container.querySelector('canvas');if(canvas){canvas.style.width=canvas.width*x+'px';canvas.style.height=canvas.height*y+'px';}}
 screen_make_screenshot(){const image=new Image();image.src=this.container.querySelector('canvas').toDataURL('image/png');return image;}
 lock_mouse(){return this.container.parentElement.requestPointerLock();}
 async save_state(){
  const wasRunning=this.running;
  try{await this.host.quiesce();this.running=false;const migration=await this.host.save();return await packQemuSnapshot(migration,this.host.files());}
  finally{await this.host.run();if(wasRunning){this.running=true;this.emit('emulator-started');}else{await this.host.stop();this.running=false;}}
 }
 async restore_state(buffer){
  const {migration,shared}=unpackQemuSnapshot(buffer);
  await this.stop();this.host.destroy();this.iframe.remove();this.host=null;this.running=false;await this.spawn(migration,shared);
 }
 memory_dump(){return this.host.memory();}
 async destroy(){this.destroyed=true;this.running=false;clearTimeout(this.sharedRefreshTimer);this.screen?.dispose?.();try{this.host?.destroy();}finally{this.iframe?.remove();this.host=null;this.wasm=this.image=this.kernel=this.rom=null;}}
}
globalThis.QemuEngine=QemuEngine;
