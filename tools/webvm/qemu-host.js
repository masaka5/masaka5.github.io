import init from '../../vendor/qemu/qemu.js';
import {startNetwork} from '../../vendor/qemu/network.js';
const assets=new URL('../../vendor/qemu/',import.meta.url);
const workerAssets=navigator.serviceWorker?.controller?.scriptURL.endsWith('/tools/webvm/isolation-worker.js')
 ?new URL('qemu-assets/',navigator.serviceWorker.controller.scriptURL):assets;
let vm,network,slave,master,rawInput,monitor=false,rawOutput='',notify=()=>{},internalIO=false,monitorOverflow=false;
let snapshotNonce=null,snapshotQuiesced=false,restoringSnapshot=false,snapshotSerial='',snapshotSequence=0;
let diagnosticLog='';
function logDiagnostic(kind,text){diagnosticLog=(diagnosticLog+'['+kind+'] '+String(text)+'\n').slice(-32768);notify('log',text);}
function cleanDiagnostic(text){return text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g,'').replace(/\r+/g,'').slice(-6000);}
const snapshotEvents=[];
function observeSnapshotSerial(text){
 snapshotSerial=(snapshotSerial+text).slice(-2048);
 const expression=/\x1b\]777;toolbox-snapshot-(ready|resumed|error):([a-zA-Z0-9_-]+)\x07/g;let match;
 while((match=expression.exec(snapshotSerial))){snapshotEvents.push({kind:match[1],nonce:match[2],sequence:++snapshotSequence});snapshotSerial=snapshotSerial.slice(match.index+match[0].length);expression.lastIndex=0;}
 if(snapshotEvents.length>32)snapshotEvents.splice(0,snapshotEvents.length-32);
}
async function waitSnapshotEvent(kind,nonce,after,timeout=60000){
 const deadline=performance.now()+timeout;
 while(performance.now()<deadline){const event=snapshotEvents.find(e=>e.sequence>after&&(!nonce||e.nonce===nonce)&&(e.kind===kind||e.kind==='error'));if(event){if(event.kind==='error')throw Error('共享目录忙或重新挂载失败，请退出共享目录并关闭正在使用的文件后重试');return event;}await pause(20);}
 throw Error(kind==='ready'?'快照协调超时，请确认 Ubuntu 已启动且共享目录未被占用':'快照恢复后共享目录重新挂载超时');
}
async function resumeGuest(){await control(async()=>{const cont=await command('cont'),result=await command('info status');if(!result.includes('VM status: running')){const migration=await command('info migrate');throw Error('虚拟机未能继续运行\n继续响应：'+cleanDiagnostic(cont)+'\n运行状态：'+cleanDiagnostic(result)+'\n迁移状态：'+cleanDiagnostic(migration)+'\n引擎日志：'+cleanDiagnostic(diagnosticLog));}});}
async function waitResume(){
 if(!snapshotQuiesced&&!restoringSnapshot)return;
 await waitSnapshotEvent('resumed',snapshotNonce,0,90000);snapshotNonce=null;snapshotQuiesced=false;restoringSnapshot=false;
}
const decoder=new TextDecoder();
const encoder=new TextEncoder();
// QEMU's Emscripten port incorrectly treats WASI errno numbers as Linux ones
// in 9p RLERROR replies. Translate only the outgoing protocol field, preserving
// libc's original errno values for QEMU's own retry/cleanup logic.
export function patchNinePErrnos(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 const unsigned=n=>{const out=[];do{let v=n&127;n=Math.floor(n/128);out.push(v|(n?128:0));}while(n);return out;};
 const signed=n=>{const out=[];while(true){const v=n&127;n>>=7;const done=n===0&&v<64||n===-1&&v>=64;out.push(v|(done?0:128));if(done)return out;}};
 const read=state=>{let n=0,shift=0,v;do{v=bytes[state.p++];n+=(v&127)*2**shift;shift+=7;}while(v&128);return n;};
 const concat=parts=>{const result=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){result.set(p,offset);offset+=p.length;}return result;};
 const linux=[0,7,13,98,99,97,11,114,9,74,16,125,10,103,111,104,35,89,33,122,17,14,27,113,43,84,115,4,22,5,106,21,40,24,31,90,72,36,100,102,101,23,105,19,2,8,37,67,12,42,92,28,38,107,20,39,131,88,95,25,6,75,130,1,32,71,93,91,34,30,29,3,116,110,26,18,1];
 const extra=[60,59,57,56,55,15,44,46,47,48,49,50,51,52,53,54,61,62,63,64,65,66,68,69,70,73,76,77,78,79,80,81,82,83,85,86,87,94,95,96,108,109,112,117,118,119,120,121,123,124,126,127,128,129,132,133,45];
 let expression=[0x20,3];for(const [source,target]of [...linux.map((target,source)=>[source,target]),...extra.map((target,i)=>[100+i,target])])if(source!==target)expression=[0x41,...signed(target),...expression,0x20,3,0x41,...signed(source),0x46,0x1b];
 const signature=[0x20,2,0x20,3,0x36,2,0x70,0x20,2,0x41,0xf0,0,0x6a,0x21,6];
 const sections=[bytes.subarray(0,8)];const state={p:8};let patched=0;
 while(state.p<bytes.length){const id=bytes[state.p++],size=read(state),start=state.p,end=start+size;if(id!==10){sections.push(Uint8Array.from([id,...unsigned(size)]),bytes.subarray(start,end));state.p=end;continue;}
  const count=read(state),bodies=[Uint8Array.from(unsigned(count))];for(let i=0;i<count;i++){const length=read(state),begin=state.p,body=bytes.subarray(begin,begin+length);state.p+=length;let replacement=body;
   if(length===1422){for(let j=0;j<=body.length-signature.length;j++)if(signature.every((v,k)=>body[j+k]===v)){replacement=concat([body.subarray(0,j+2),Uint8Array.from(expression),body.subarray(j+4)]);patched++;break;}}
   bodies.push(Uint8Array.from(unsigned(replacement.length)),replacement);
  }const code=concat(bodies);sections.push(Uint8Array.from([id,...unsigned(code.length)]),code);state.p=end;
 }
 if(patched!==1)throw Error('QEMU 9p 错误码适配与当前引擎版本不匹配');return concat(sections);
}
const ROMS=[['bios-256k.bin',0,262144],['efi-virtio.rom',262144,422912],['kvmvapic.bin',422912,432128],['linuxboot_dma.bin',432128,433664],['vgabios-stdvga.bin',433664,473088]];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function bytes(url,signal){const response=await fetch(url,{signal,credentials:'omit'});if(!response.ok)throw Error('加载失败：HTTP '+response.status);return new Uint8Array(await response.arrayBuffer());}
let queue=Promise.resolve();
async function waitPrompt(start,timeout=20000){
 const deadline=performance.now()+timeout;
 while(performance.now()<deadline){if(monitorOverflow)throw Error('虚拟机控制输出过大');if(rawOutput.slice(start).includes('(qemu) '))return rawOutput.slice(start);await pause(15);}
 throw Error('虚拟机控制响应超时');
}
async function command(text,timeout){const start=rawOutput.length;rawInput(text+'\r');return waitPrompt(start,timeout);}
function control(callback){
 const result=queue.then(async()=>{
  monitor=true;monitorOverflow=false;const start=rawOutput.length;rawInput('\x01c');
  try{await waitPrompt(start);return await callback();}
  finally{rawInput('\x01c');await pause(20);monitor=false;rawOutput=rawOutput.slice(-65536);}
 });
 queue=result.catch(()=>{});return result;
}
function ensureDir(path,fs=vm.FS){let current='';for(const name of path.split('/').filter(Boolean)){current+='/'+name;try{fs.mkdir(current);}catch(e){if(!fs.analyzePath(current).exists)throw e;}}}
function filePath(path){if(typeof path!=='string'||!path||path.startsWith('/')||path.includes('\\')||path.split('/').some(p=>!p||p==='.'||p==='..'||/[\0-\x1f\x7f]/.test(p)))throw Error('共享路径无效');return '/shared/'+path;}
function files({metadataOnly=false,includeInternal=false}={}){
 internalIO=true;
 try{
 const result=[];
 function walk(path,prefix,depth){if(depth>32)throw Error('共享目录层级过深');for(const name of vm.FS.readdir(path)){if(name==='.'||name==='..'||!includeInternal&&name.startsWith('.toolbox-'))continue;const full=path+'/'+name,st=vm.FS.lstat(full),relative=prefix+name;if(vm.FS.isDir(st.mode)){result.push({path:relative,directory:true});walk(full,relative+'/',depth+1);}else if(vm.FS.isFile(st.mode))result.push(metadataOnly?{path:relative,directory:false,size:st.size}:{path:relative,directory:false,data:vm.FS.readFile(full)});}}
 walk('/shared','',0);return result;
 }finally{internalIO=false;}
}
function restoreFiles(entries,fs=vm.FS){
 for(const entry of entries||[]){const path=filePath(entry.path);ensureDir(entry.directory?path:path.slice(0,path.lastIndexOf('/')),fs);if(!entry.directory)fs.writeFile(path,entry.data instanceof Uint8Array?entry.data:new Uint8Array(entry.data));}
}
async function start({profile,kernel,image,rom,wasm,snapshot,shared,onEvent}){
 notify=onEvent;
 ({master,slave}=openpty());
 // The PTY is connected to a small terminal facade. HMP output never reaches
 // xterm, whose DSR responses would otherwise corrupt monitor commands.
 const noop=()=>({dispose(){}});
 master.activate({write(data,done){const text=decoder.decode(data,{stream:true});observeSnapshotSerial(text);if(monitor){if(rawOutput.length+text.length<=4*1024*1024)rawOutput+=text;else monitorOverflow=true;}else{rawOutput=(rawOutput+text).slice(-65536);notify('serial',data);}done();},onData(callback){rawInput=callback;return noop();},onBinary:noop,onResize:noop});
 const m=profile.machine,args=['-nographic','-S','-M','pc','-m',m.memory_mb+'M','-smp',String(m.cpu_count),'-object','rng-random,filename=/dev/urandom,id=rng0','-device','virtio-rng-pci,rng=rng0','-accel','tcg,thread=multi,tb-size=128','-L','/pack-rom','-kernel','/vmlinuz','-initrd','/initrd','-append',profile.cmdline,'-virtfs','local,path=/shared,mount_tag=host9p,security_model=passthrough,id=shared'];
 args.push('-vga','none','-device','VGA,vgamem_mb='+m.vram_mb);
 if(m.acpi===false)args.push('-no-acpi');
 if(m.relay_url==='fetch'){
  network=await startNetwork({baseURL:assets.href,onPacket:event=>notify('network',event)});
  args.push('-netdev','socket,id=vmnic,connect=localhost:8888','-device','virtio-net-pci,netdev=vmnic');
 }else args.push('-nic','none');
 if(snapshot)args.push('-incoming','file:/toolbox-migration.bin');
 const options={
  INITIAL_MEMORY:4032*1024*1024,wasmBinary:patchNinePErrnos(wasm),pty:slave,arguments:args,toolboxThreads:m.cpu_count+3,
  mainScriptUrlOrBlob:new URL('qemu.js',workerAssets).href,
  locateFile:name=>new URL(name==='qemu-system-x86_64.wasm'?'qemu.wasm':name,name.endsWith('.worker.js')?workerAssets:assets).href,
  print:text=>logDiagnostic('stdout',text),printErr:text=>logDiagnostic('stderr',text),
  onAbort:text=>{logDiagnostic('abort',text);notify('error','虚拟机引擎异常：'+text);},
  preRun:[mod=>{
   const chmod=mod.FS.chmod;mod.FS.chmod=function(path,...args){const match=typeof path==='string'&&path.match(/^\/proc\/self\/fd\/(\d+)$/);if(match){const stream=mod.FS.getStream(Number(match[1]));if(stream?.path.startsWith('/shared/'))path=stream.node;}return chmod.call(this,path,...args);};
   mod.FS.mkdir('/pack-rom');for(const [name,begin,end]of ROMS)mod.FS.writeFile('/pack-rom/'+name,rom.subarray(begin,end));
   mod.FS.writeFile('/vmlinuz',kernel);mod.FS.writeFile('/initrd',image);mod.FS.mkdir('/shared');
   if(snapshot)mod.FS.writeFile('/toolbox-migration.bin',snapshot);
   restoreFiles(shared,mod.FS);
   if(network)mod.FS.writeFile('/shared/.toolbox-proxy.crt',network.certificate);
  }]
 };
 if(network)options.websocket=network.websocket;
 vm=await init(options);
 const poll=vm.TTY.stream_ops.poll;
 vm.TTY.stream_ops.poll=function(stream,timeout){if(!slave.readable)return(slave.readable?1:0)|(slave.writable?4:0);return poll.call(stream,timeout);};
 const readyDeadline=performance.now()+30000;
 while(slave.ioctl('TCGETS').ICANON_P){
  if(performance.now()>readyDeadline)throw Error('虚拟机串口初始化超时');
  await pause(20);
 }
 if(network)vm.FS.writeFile('/shared/.toolbox-proxy.crt',network.certificate);
 if(snapshot){restoringSnapshot=true;await control(async()=>{
  const deadline=performance.now()+180000;let migration='';
  do{migration=await command('info migrate');if(migration.includes('Migration status: completed'))break;if(/Migration status: (failed|cancelled)|error:/i.test(migration))throw Error('虚拟机快照加载失败：'+cleanDiagnostic(migration)+'\n'+cleanDiagnostic(diagnosticLog));await pause(100);}while(performance.now()<deadline);
  if(!migration.includes('Migration status: completed'))throw Error('虚拟机快照加载超时：'+cleanDiagnostic(migration)+'\n'+cleanDiagnostic(diagnosticLog));
  const stopped=await command('stop'),status=await command('info status');logDiagnostic('incoming-state',cleanDiagnostic(stopped+'\n'+status+'\n'+migration));if(!status.includes('VM status: paused'))throw Error('虚拟机快照尚未恢复完成：'+cleanDiagnostic(status)+'\n'+cleanDiagnostic(diagnosticLog));
 });try{vm.FS.unlink('/toolbox-migration.bin');}catch{}}
 // Observe actual host9p I/O, excluding internal control files.
 for(const method of ['read','write']){
  const original=vm.FS[method];vm.FS[method]=function(stream,...args){const result=original.call(this,stream,...args);const path=stream?.path||'';if(!internalIO&&path.startsWith('/shared/')&&!path.split('/').pop().startsWith('.toolbox-'))notify('file',{method,path:path.slice(8),bytes:result});return result;};
 }
 notify('ready');
}
window.QemuHost={
 start,
 send(data){if(!monitor&&rawInput)rawInput(Array.from(data).flatMap(b=>b===1?[1,1]:[b]));},
 async run(){await resumeGuest();await waitResume();for(const path of ['/initrd','/vmlinuz'])try{vm.FS.unlink(path);}catch{}},
 async quiesce(){
  const nonce=crypto.randomUUID().replaceAll('-','_'),after=snapshotSequence;snapshotNonce=nonce;
  try{
   await resumeGuest();internalIO=true;try{vm.FS.writeFile('/shared/.toolbox-snapshot-request',encoder.encode(nonce+'\n'));}finally{internalIO=false;}
   await waitSnapshotEvent('ready',nonce,after);snapshotQuiesced=true;
   await control(async()=>{await command('stop');const status=await command('info status');if(!status.includes('VM status: paused'))throw Error('快照协调后虚拟机未暂停');});
  }catch(error){if(!snapshotQuiesced)snapshotNonce=null;throw error;}
  finally{internalIO=true;try{vm.FS.unlink('/shared/.toolbox-snapshot-request');}catch{}finally{internalIO=false;}}
 },
 waitResume,
 async stop(){await control(()=>command('stop'));},
 async save(){return control(async()=>{const response=await command('migrate file:/toolbox-migration.bin',180000);if(/error:|migration is disabled|migration blocked/i.test(response))throw Error('快照生成失败：'+response);let result='';const deadline=performance.now()+180000;do{result=await command('info migrate');if(result.includes('Migration status: completed'))break;if(/failed|error:/i.test(result))throw Error('快照生成失败：'+result);await pause(100);}while(performance.now()<deadline);if(!result.includes('Migration status: completed'))throw Error('快照生成超时');try{return vm.FS.readFile('/toolbox-migration.bin').slice().buffer;}finally{vm.FS.unlink('/toolbox-migration.bin');}});},
 async screen(){return control(async()=>{const response=await command('xp /4000bx 0xb8000'),values=[];for(const line of response.split(/\r?\n/))if(/^[0-9a-f]{16}:/.test(line))for(const match of line.matchAll(/0x([0-9a-f]{2})/g))values.push(parseInt(match[1],16));if(values.length!==4000)throw Error('屏幕数据不完整');return Uint8Array.from(values);});},
 async keys(keys){if(!/^[a-zA-Z0-9_-]+(?:-[a-zA-Z0-9_-]+)*$/.test(keys))throw Error('按键无效');return control(()=>command('sendkey '+keys+' 50'));},
 async mouse({dx,dy,buttons}){dx=Math.max(-127,Math.min(127,Math.round(dx||0)));dy=Math.max(-127,Math.min(127,Math.round(dy||0)));buttons=Number(buttons)&7;return control(async()=>{if(dx||dy)await command('mouse_move '+dx+' '+dy);await command('mouse_button '+buttons);});},
 read(path){internalIO=true;try{return vm.FS.readFile(filePath(path)).slice();}finally{internalIO=false;}},
 write(path,data){internalIO=true;try{const full=filePath(path);ensureDir(full.slice(0,full.lastIndexOf('/')));vm.FS.writeFile(full,new Uint8Array(data));}finally{internalIO=false;}},
 files,restoreFiles,
 memory(){throw Error('请使用完整快照保存 Ubuntu 内存和设备状态');},
 destroy(){network?.dispose();vm?.toolboxDestroy?.();master?.dispose();notify=()=>{};vm=null;},
 get rawOutput(){return rawOutput;},
 get diagnostics(){return diagnosticLog;},
 get module(){return vm;}
};
window.dispatchEvent(new Event('qemu-host-ready'));
