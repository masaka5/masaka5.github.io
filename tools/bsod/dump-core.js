const MAX_READ=4*1024*1024, BUDGET=64*1024*1024, MAX_MODULES=10000, MAX_ADDRESSES=8192;
const hex=(v,w=16)=>`0x${BigInt(v).toString(16).padStart(w,'0')}`;
const malformed=m=>new Error(`转储文件损坏：${m}`);
let wasmModule;
async function codec(){
  if(!wasmModule){const url=new URL('./dump-codec.wasm',import.meta.url);let bytes;if(url.protocol==='file:'){const {readFile}=await import('node:fs/promises');bytes=await readFile(url);}else{const r=await fetch(url);if(!r.ok)throw new Error('无法加载 WASM 解码器');bytes=await r.arrayBuffer();}wasmModule=await WebAssembly.compile(bytes);}
  const {exports:e}=await WebAssembly.instantiate(wasmModule,{});
  return (op,b)=>{if(b.length>MAX_READ)throw malformed('解码数据块超出限制');new Uint8Array(e.memory.buffer,e.buffer(),b.length).set(b);const status=e.decode(op,b.length);if(status)throw status===2?new Error('不支持的转储格式或解码布局'):malformed('二进制记录被截断或无效');return Array.from(new BigUint64Array(e.memory.buffer,e.output(),op===9?Math.floor(b.length/8):40));};
}
function time(v,filetime=false){if(!v)return null;const ms=filetime?(v-116444736000000000n)/10000n:v*1000n;if(ms < -8640000000000000n || ms > 8640000000000000n)return null;return new Date(Number(ms)).toISOString();}
export async function parseDump(blob,{signal,onProgress}={}){
  const check=()=>{if(signal?.aborted)throw new DOMException('分析已取消','AbortError');};check();
  if(!blob||!Number.isSafeInteger(blob.size)||blob.size<0||typeof blob.slice!=='function')throw malformed('文件无效');
  let used=0;const read=async(o,n)=>{check();if(!Number.isSafeInteger(o)||!Number.isSafeInteger(n)||o<0||n<0||n>MAX_READ||o>blob.size||n>blob.size-o)throw malformed('记录超出文件范围');if(used+n>BUDGET)throw malformed('读取总量超出限制');used+=n;const b=new Uint8Array(await blob.slice(o,o+n).arrayBuffer());check();if(b.length!==n)throw malformed('文件读取不完整');onProgress?.({phase:'read',bytesRead:used,totalBytes:blob.size});return b;};
  const decode=await codec();check();const first=await read(0,Math.min(blob.size,8192));const h=decode(1,first);
  const r={kind:h[0]===3n?'user':'kernel',format:'',architecture:null,system:null,crashTime:null,bugcheck:null,exception:null,modules:[],addresses:[],warnings:[],complete:false};
  const number=v=>Number(v);const u32=async o=>number(decode(8,await read(o,4))[0]);
  const text=async(o,n)=>{if(n>32768||n%2)throw malformed('Unicode 字符串长度无效');return new TextDecoder('utf-16le').decode(await read(o,n)).replace(/\0+$/g,'');};
  const module=(p,base,size,timestamp,evidence,version=null)=>{if(r.modules.length>=MAX_MODULES)throw malformed('模块总数量超出限制');if(base+size>=0x10000000000000000n)throw malformed('模块地址溢出');const path=p||null;const m={name:p?.split(/[\\/]/).pop()||'（未命名）',path,base:hex(base),size:number(size),end:hex(base+size),timestamp:time(timestamp),version,evidence};r.modules.push(m);return m;};
  // Build disjoint, unambiguous half-open intervals once; each lookup is O(log modules).
  let intervals;
  const buildRanges=()=>{
    const events=[];for(const m of r.modules){const lo=BigInt(m.base),hi=BigInt(m.end);if(hi>lo){events.push({at:lo,m,add:true},{at:hi,m,add:false});}}
    events.sort((a,b)=>a.at<b.at?-1:a.at>b.at?1:0);const active=new Set();intervals=[];let overlaps=false;
    for(let i=0;i<events.length;){const at=events[i].at;while(i<events.length&&events[i].at===at){const e=events[i++];if(e.add)active.add(e.m);else active.delete(e.m);}if(i<events.length){if(active.size===1)intervals.push({lo:at,hi:events[i].at,m:active.values().next().value});else if(active.size>1)overlaps=true;}}
    if(overlaps)r.warnings.push('模块地址范围存在重叠；为避免错误归属，重叠区间内的地址不关联到任何模块。');
  };
  const address=(v,source)=>{if(!v||r.addresses.length>=MAX_ADDRESSES)return;if(!intervals)buildRanges();let lo=0,hi=intervals.length;while(lo<hi){const mid=(lo+hi)>>>1;if(intervals[mid].lo<=v)lo=mid+1;else hi=mid;}const hit=intervals[lo-1];if(hit&&v<hit.hi){const m=hit.m;r.addresses.push({address:hex(v),module:m.name,offset:hex(v-BigInt(m.base)),source});}};
  if(r.kind==='kernel'){
    const x64=h[0]===2n;const width=x64?16:8;const machine=number(h[1]);r.architecture=machine===0x8664?'x64':machine===0x14c?'x86':machine===0xaa64?'arm64':`未知机器类型 ${hex(h[1],4)}`;
    r.format=`Windows PAGE/${x64?'DU64':'DUMP'} （类型 ${h[9]}）`;r.system=`Windows NT ${h[2]} build ${h[3]}`;r.crashTime=time(h[10],true);r.bugcheck={code:hex(h[4],8),parameters:h.slice(5,9).map(v=>hex(v,width))};
    r.warnings.push('仅进行本地基础分析，未加载符号或展开调用栈。地址命中模块不能证明该模块导致崩溃。');
    if(h[9]!==4n||!x64||machine!==0x8664){r.warnings.push('此转储布局仅支持读取文件头信息，尚未遍历内存与模块列表。');return r;}
    if(blob.size===8192){r.warnings.push('缺少小型转储数据区，仅能读取内核文件头。');return r;}
    const t=decode(2,await read(8192,136));const [dumpSize,stackOff,stackSize,driverOff,count,poolOff,poolSize]=t.map(number);
    if(count>MAX_MODULES)throw malformed('模块数量超出限制');if(dumpSize&&dumpSize>blob.size)throw malformed('小型转储数据区被截断');
    if(count&&(driverOff<8328||driverOff+count*144>blob.size))throw malformed('小型转储模块列表无效');
    if(poolOff>blob.size||poolSize>blob.size-poolOff)throw malformed('字符串池无效');
    for(let i=0;i<count;i++){const d=decode(3,await read(driverOff+i*144,144));const no=number(d[0]);if(no<poolOff||no+4>poolOff+poolSize)throw malformed('驱动名称超出字符串池范围');const chars=await u32(no);if(chars>16384||chars*2>poolOff+poolSize-no-4)throw malformed('驱动名称长度超出字符串池范围');module(await text(no+4,chars*2),d[1],d[2],d[3],'triage-driver-list');}
    for(const p of h.slice(5,9))address(p,'bugcheck-parameter');
    if(stackSize){if(stackOff<8328||stackSize>MAX_READ)throw malformed('小型转储栈数据范围无效');const b=await read(stackOff,stackSize);for(let i=0;i+8<=b.length&&r.addresses.length<MAX_ADDRESSES;i+=4096){check();for(const pointer of decode(9,b.subarray(i,Math.min(i+4096,b.length)))){address(pointer,'stack-scan');if(r.addresses.length>=MAX_ADDRESSES)break;}}r.warnings.push('栈扫描结果仅为保存的栈字节中对齐的地址值，并非已展开的调用栈。');}
    r.warnings.push('仅解码已验证的 x64 小型转储驱动列表布局，尚未分析已卸载驱动、内存页与调试器扩展。');return r;
  }
  r.format='Microsoft MDMP 用户态小型转储';r.crashTime=time(h[3]);r.warnings.push('MDMP 为用户态崩溃格式，其异常码不是 Windows 蓝屏停止代码。本地分析未使用符号或展开调用栈。');
  if((h[4]&65535n)!==0xa793n)throw new Error('不支持的 MDMP 版本');const count=number(h[1]),dir=number(h[2]);if(count>4096)throw malformed('数据流数量超出限制');if(count*12>blob.size-dir)throw malformed('数据流目录无效');
  const streams=[];for(let i=0;i<count;i++){const d=decode(4,await read(dir+i*12,12));const [type,size,off]=d.map(number);if(off>blob.size||size>blob.size-off)throw malformed('数据流超出文件范围');streams.push({type,size,off});}
  for(const s of streams){if(s.type===7){if(s.size<56)throw malformed('系统信息数据流过短');const d=decode(7,await read(s.off,56));r.architecture=({0:'x86',9:'x64',12:'arm64'})[number(d[0])]||`未知架构 ${d[0]}`;r.system=`Windows ${d[1]}.${d[2]} build ${d[3]}`;}
    if(s.type===6){if(s.size<168)throw malformed('异常数据流过短');const d=decode(6,await read(s.off,168));r.exception={code:hex(d[0],8),address:hex(d[1]),parameters:d.slice(3,3+number(d[2])).map(v=>hex(v))};}
    if(s.type===4){if(s.size<4)throw malformed('模块数据流过短');const n=await u32(s.off);if(n>MAX_MODULES||n*108>s.size-4)throw malformed('模块数量无效');for(let i=0;i<n;i++){const d=decode(5,await read(s.off+4+i*108,108));const no=number(d[3]);const length=await u32(no);const version=d[4]===0xfeef04bdn?`${d[5]>>16n}.${d[5]&65535n}.${d[6]>>16n}.${d[6]&65535n}`:null;module(await text(no+4,length),d[0],d[1],d[2],'minidump-module-list',version);}}
  }
  if(r.exception)address(BigInt(r.exception.address),'exception-address');r.warnings.push('仅解码系统信息、模块列表与异常数据流，其他数据流尚未分析。');return r;
}

