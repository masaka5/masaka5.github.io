import {Wiregasm,vectorToArray} from './wiregasm-api.js';
import loader from './wiregasm.js';
import {EtlReader,looksLikeEtl} from './etl.js?v=20261114-etl1';
let wg=null,initializing=null,filename='',etl=null,sourceName='';
const MAX_SIZE=256*1024*1024;
function plain(value){
 if(value==null||typeof value!=='object')return value;
 if(typeof value.size==='function'&&typeof value.get==='function'){
  try{return Array.from({length:value.size()},(_,i)=>plain(value.get(i)));}finally{value.delete();}
 }
 if(Array.isArray(value))return value.map(plain);
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,plain(item)]));
}
async function inflate(name){
 const url=new URL(name,import.meta.url).href;
 const response=await fetch(url,{cache:'force-cache'});if(!response.ok)throw Error('解析组件下载失败，请重试');
 return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}
async function ready(){
 if(wg)return wg;if(initializing)return initializing;
 initializing=(async()=>{
  self.postMessage({type:'status',text:'正在加载 Wireshark'});
  const [wasmBinary,data]=await Promise.all([inflate('wiregasm.wasm.gz'),inflate('wiregasm.data.gz')]);
  const next=new Wiregasm();await next.init(loader,{wasmBinary,getPreloadedPackage:()=>data,locateFile:path=>new URL(path,import.meta.url).href,print:()=>{},printErr:()=>{}});
  wg=next;return wg;
 })();try{return await initializing;}finally{initializing=null;}
}
function valid(filter=''){const result=wg.testFilter(filter);if(!result.ok)throw Error('过滤表达式无效：'+result.error);return filter;}
function listing({filter='',page=1,size=100}){valid(filter);return plain(wg.frames(filter,Math.max(0,page-1)*Math.min(size,500),Math.min(size,500)));}
function clearCapture(){
 if(wg.session){wg.session.delete();wg.session=null;}
 if(filename)try{wg.lib.FS.unlink(`${wg.uploadDir}/${filename}`);}catch{}
}
function loadCapture(bytes,name){
 clearCapture();filename=name;
 const response=wg.load(filename,bytes);if(response.code!==0)throw Error(response.error||'不支持此抓包文件，或文件已损坏');
 return{summary:response.summary,version:wg.lib.wiresharkVersion(),columns:wg.columns(),list:listing({}),etl:etl?{...etl.stats,mode:etl.mode}:null};
}
async function handle(m){
 if(m.method==='init'){await ready();return{version:wg.lib.wiresharkVersion(),columns:wg.columns()};}
 if(m.method==='load'){
  await ready();if(m.bytes.byteLength>MAX_SIZE)throw Error('单个抓包文件不能超过 256 MB');
  clearCapture();etl=null;sourceName=String(m.name||'capture');
  if(looksLikeEtl(m.bytes,sourceName)){
   self.postMessage({type:'status',text:'正在通过 WASM 解析 ETL'});
   const reader=await EtlReader.open(m.bytes);etl=reader;
   return loadCapture(reader.convert(),'capture-etl.pcapng');
  }
  return loadCapture(new Uint8Array(m.bytes),'capture'+(sourceName.match(/(\.[a-z0-9]+){1,2}$/i)?.[0]||'.pcap'));
 }
 if(!wg)throw Error('请先打开抓包文件');
 if(m.method==='etl-view'){
  if(!etl)throw Error('请先打开 ETL 文件');
  self.postMessage({type:'status',text:'正在切换 ETL 视图'});
  return loadCapture(etl.convert(m.mode==='events'?'events':'packets'),'capture-etl.pcapng');
 }
 if(m.method==='capture'){
  if(!etl||!wg.session)throw Error('请先打开 ETL 文件');
  const data=wg.lib.FS.readFile(`${wg.uploadDir}/${filename}`);
  return{bytes:data.buffer,name:sourceName.replace(/\.etl$/i,'')+'-'+etl.mode+'.pcapng'};
 }
 if(m.method==='frames')return listing(m);
 if(m.method==='frame')return plain(wg.frame(m.number));
 if(m.method==='filter')return wg.testFilter(m.filter);
 if(m.method==='complete')return wg.completeFilter(m.filter);
 if(m.method==='follow')return plain(wg.follow(m.protocol,m.filter));
 if(m.method==='tap')return plain(wg.tap({tap0:m.tap,filter0:valid(m.filter||'')}));
 if(m.method==='graph')return wg.iograph({graph0:'packets',filter:valid(m.filter||''),interval:String(m.interval||1000)});
 if(m.method==='download')return wg.download(m.token);
 if(m.method==='export'){
  valid(m.filter);const rows=[];
  for(let offset=0;offset<200000;offset+=1000){const result=plain(wg.frames(m.filter,offset,1000));rows.push(...result.frames);if(offset+1000>=result.matched)return{columns:wg.columns(),rows};}
  throw Error('导出最多支持 20 万条报文，请缩小过滤范围');
 }
 if(m.method==='protocols')return wg.listProtocols();
 if(m.method==='protocol'){wg.setProtocolEnabled(m.protocol,m.enabled);return true;}
 if(m.method==='heuristics')return wg.listHeuristicDissectors();
 if(m.method==='heuristic'){wg.setHeuristicEnabled(m.name,m.enabled);return true;}
 if(m.method==='modules')return plain(wg.listModules());
 if(m.method==='prefs')return plain(wg.listPrefs(m.module));
 if(m.method==='pref'){wg.setPref(m.module,m.key,String(m.value));wg.applyPrefs();return true;}
 if(m.method==='plugin'){if(m.source.length>1024*1024)throw Error('Lua 文件不能超过 1 MB');wg.addPlugin('custom.lua',m.source);wg.reloadLuaPlugins();return true;}
 throw Error('未知操作');
}
// Serialize calls: the Wireshark session is not reentrant.
let chain=Promise.resolve();
self.onmessage=({data:m})=>{chain=chain.then(async()=>{try{const result=await handle(m);self.postMessage({id:m.id,result},m.method==='capture'?[result.bytes]:[]);}catch(error){self.postMessage({id:m.id,error:String(error?.message||error)});}});};
