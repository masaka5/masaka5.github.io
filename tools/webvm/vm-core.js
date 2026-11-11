(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WebVMCore=api;})(globalThis,()=>{
 const config=Object.freeze({store:'toolbox-v86-v1',sharedMount:'/mnt/共享',runtimeVersion:'c3945744',guestVersion:'c44bacb5e746e723',profileKey:'toolbox-v86-profiles-v1'});
 const builtin={schema:'v86-machine/1',id:'toolbox-linux-x64-v1',name:'工具箱 Linux',description:'Alpine x64 · PowerShell 7 · 中文终端',os:{family:'Linux',arch:'x86_64',ui:'text'},machine:{memory_mb:2048,vram_mb:32,acpi:false,net_device_type:'virtio',relay_url:'fetch',disable_audio:true,boot_order:0x123},media:{bzimage:{url:'images/vmlinuz.bin'},initrd_parts:[1,2,3].map(i=>({url:`images/toolbox-x64-pwsh.part${i}.bin`}))},cmdline:'console=ttyS0,115200 earlyprintk=serial,ttyS0,115200 rdinit=/init loglevel=3 random.trust_cpu=on acpi=off net.ifnames=0'};
 const ubuntu={schema:'v86-machine/1',engine:'qemu',id:'ubuntu-server-2404-v1',name:'Ubuntu Server',description:'24.04 LTS · 多核 · 中文终端',os:{family:'Ubuntu',arch:'x86_64',ui:'text'},machine:{memory_mb:1984,vram_mb:32,cpu_count:4,acpi:true,net_device_type:'virtio',relay_url:'fetch',disable_audio:true,boot_order:0x123},media:{bzimage:{url:'images/vmlinuz.bin'},initrd_parts:[1,2,3,4].map(i=>({url:`images/ubuntu-server.part${i}.bin`}))},cmdline:'console=tty0 console=ttyS0,115200 rdinit=/init loglevel=3 random.trust_cpu=on net.ifnames=0'};
 function recommendedCPUs(logical){if(!Number.isInteger(logical)||logical<1)return 2;return logical>=4?4:logical>=2?2:1;}
 function relay(raw){const value=String(raw||'').trim();if(['','fetch','inbrowser'].includes(value))return value;const url=new URL(value);if(!['wss:','wisps:'].includes(url.protocol)||url.username||url.password||url.hash)throw Error('代理地址需使用 wss:// 或 wisps://');return url.href;}
 function mediaSource(raw,base){if(typeof raw==='string')raw={url:raw};if(!raw||typeof raw.url!=='string')throw Error('镜像缺少 URL');const url=new URL(raw.url,base);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('镜像需使用 HTTP 或 HTTPS 地址');if(url.protocol==='http:'&&new URL(base).protocol==='https:')throw Error('HTTPS 页面不能加载 HTTP 镜像');const result={url:url.href};if(raw.async)result.async=true;if(raw.size!==undefined){if(!Number.isSafeInteger(raw.size)||raw.size<=0)throw Error('镜像大小无效');result.size=raw.size;}return result;}
 function profile(raw,base='https://toolbox.invalid/tools/webvm/'){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.schema&&raw.schema!=='v86-machine/1')throw Error('不是有效的 v86 配置');
  const name=String(raw.name||'自定义虚拟机').trim().slice(0,80),m=raw.machine||{},engine=raw.engine||'v86';
  if(!['v86','qemu'].includes(engine))throw Error('不支持的虚拟机引擎');
  if(engine==='v86'&&m.cpu_count!==undefined&&m.cpu_count!==1)throw Error('v86 仅支持单核，请使用 QEMU 多核模式');
  if(engine==='qemu'){
   if(m.vram_mb!==undefined&&![1,2,4,8,16,32,64,128].includes(m.vram_mb))throw Error('QEMU 显存需为 1、2、4、8、16、32、64 或 128 MB');
   if(m.net_device_type!==undefined&&m.net_device_type!=='virtio')throw Error('当前 QEMU 仅支持 VirtIO 网卡');
   if(m.disable_audio===false)throw Error('当前 QEMU 不支持声音设备');
   if(m.boot_order!==undefined&&m.boot_order!==0x123)throw Error('当前 QEMU 仅支持 Linux 内核直接启动，不能设置启动顺序');
   if(!['','fetch'].includes(relay(m.relay_url)))throw Error('当前 QEMU 仅支持离线或浏览器 HTTP 网络');
   if(Object.keys(raw.media||{}).some(key=>!['bzimage','initrd','initrd_parts'].includes(key)))throw Error('当前 QEMU 仅支持远程 Linux 内核和 Initramfs，不支持磁盘、光盘或软盘镜像');
   if(raw.media?.initrd&&raw.media?.initrd_parts)throw Error('QEMU 不能同时使用 Initramfs 文件和分片');
   if(raw.localMedia?.length)throw Error('当前 QEMU 不支持本地启动镜像');
   if(raw.id===ubuntu.id&&m.memory_mb!==undefined&&m.memory_mb<1536)throw Error('Ubuntu Server 至少需要 1536 MB 内存');
  }
  const integer=(v,d,min,max)=>{v=v??d;if(!Number.isInteger(v)||v<min||v>max)throw Error(`数值需在 ${min}–${max} 之间`);return v;};
  const p={schema:'v86-machine/1',engine,id:String(raw.id||'vm-'+Date.now().toString(36)).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,100),name,description:String(raw.description||'').slice(0,200),os:{family:String(raw.os?.family||'自定义').slice(0,40),arch:String(raw.os?.arch||'x86_64').slice(0,20),ui:raw.os?.ui==='graphical'?'graphical':'text'},machine:{memory_mb:integer(m.memory_mb,engine==='qemu'?1984:2048,64,engine==='qemu'?1984:3072),vram_mb:integer(m.vram_mb,32,1,128),acpi:m.acpi!==false,disable_audio:m.disable_audio!==false,net_device_type:engine==='qemu'||m.net_device_type==='virtio'?'virtio':'ne2k',relay_url:relay(m.relay_url),boot_order:integer(m.boot_order,0x123,0,0xfff)},media:{},cmdline:String(raw.cmdline||'').slice(0,8192)};
  if(engine==='qemu'){const cpus=m.cpu_count??4;if(![1,2,4,8].includes(cpus))throw Error('CPU 核数需为 1、2、4 或 8');p.machine.cpu_count=cpus;}
  for(const key of ['cdrom','hda','hdb','fda','fdb','bzimage','initrd'])if(raw.media?.[key])p.media[key]=mediaSource(raw.media[key],base);
  if(raw.media?.initrd_parts){if(!Array.isArray(raw.media.initrd_parts)||raw.media.initrd_parts.length>10)throw Error('镜像分片无效');p.media.initrd_parts=raw.media.initrd_parts.map(x=>mediaSource(x,base));}
  return p;
 }
 function fingerprint(p){const normalized=JSON.stringify({machine:p.machine,media:p.media,localMedia:p.localMedia,cmdline:p.cmdline,guest:p.id===builtin.id?config.guestVersion:p.id===ubuntu.id?'4b4f872edb3fecf3':undefined,engine:p.engine==='qemu'?'qemu':undefined});let hash=2166136261;for(let i=0;i<normalized.length;i++)hash=Math.imul(hash^normalized.charCodeAt(i),16777619);return (hash>>>0).toString(16);}
 function sendInput(text,read){for(const byte of new TextEncoder().encode(text))read(byte);}
 function shellQuote(text){return "'"+String(text).replaceAll("'","'\\''")+"'";}
 function fileName(raw){const name=String(raw);if(!name||name==='.'||name==='..'||/[\/\\\x00-\x1f\x7f]/.test(name)||new TextEncoder().encode(name).length>240)throw Error('文件名不能包含路径、控制字符或超过 240 字节');return name;}
 function sharedPath(raw){let path=String(raw).trim();if(path.startsWith(config.sharedMount+'/'))path=path.slice(config.sharedMount.length+1);if(!path||path.startsWith('/')||path.includes('\\'))throw Error('请输入共享目录中的相对文件路径');for(const part of path.split('/'))fileName(part);return path;}
 function readableBytes(bytes){if(!Number.isFinite(bytes))return '—';const units=['B','KB','MB','GB'];let i=0;while(bytes>=1024&&i<3){bytes/=1024;i++;}return bytes.toFixed(i?1:0)+' '+units[i];}
 function safeLoginUrl(raw){const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password)throw Error('联网服务返回了无效的登录地址');return url.href;}
 function endpoint(raw){const url=new URL(raw);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw Error('接口需使用 HTTPS，或本机调试地址');if(url.username||url.password||url.hash)throw Error('接口地址不能包含账户信息或片段');if(/(^|\.)(chatgpt\.com|doubao\.com)$/.test(url.hostname))throw Error('请填写模型 API 地址，网页版不能用作接口');return url.href;}
 return {config,builtin,ubuntu,recommendedCPUs,profile,relay,fingerprint,sendInput,shellQuote,fileName,sharedPath,readableBytes,endpoint};
});
