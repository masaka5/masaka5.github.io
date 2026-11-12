import {MAX_ENTRIES,FORMATS,checkBudget,safePath,parseListing,selectEntries} from './archive-core.mjs';
const progress=message=>postMessage({type:'progress',message});
async function moduleEngine(blob) {
  const {default:factory}=await import('../../vendor/7z-wasm/7zz.mjs');
  let lines=[],length=0;
  const print=line=>{length+=line.length;if(length>12*1024*1024)throw Error('压缩包目录过大');lines.push(line);};
  const z=await factory({print,printErr:print});
  const writes=new Map(),original=z.FS.write.bind(z.FS);
  const budget=(path,end)=>{
    if(!path.startsWith('/source/')&&!path.startsWith('/result.'))return;
    checkBudget(end);writes.set(path,Math.max(end,writes.get(path)||0));
    if([...writes.values()].reduce((a,b)=>a+b,0)>512*1024*1024)throw Error('压缩引擎内存预算已用尽');
  };
  z.FS.write=(stream,buffer,offset,n,position,...rest)=>{
    const path=stream.path;
    if(path.startsWith('/source/')||path.startsWith('/result.')) {
      const end=(position??stream.position)+n;
      budget(path,end);
    }
    return original(stream,buffer,offset,n,position,...rest);
  };
  // Guard MEMFS itself as well as FS.write: truncate and direct stream writes
  // must pass the same limits before their backing array can grow.
  z.FS.writeFile('/budget-probe',new Uint8Array());
  const node=z.FS.lookupPath('/budget-probe').node,ops=node.stream_ops,nodeOps=node.node_ops;
  const streamWrite=ops.write,setattr=nodeOps.setattr;
  ops.write=(stream,buffer,offset,n,position,...rest)=>{budget(stream.path,position+n);return streamWrite(stream,buffer,offset,n,position,...rest);};
  nodeOps.setattr=(entry,attr)=>{if(attr.size!==undefined)budget(z.FS.getPath(entry),attr.size);return setattr(entry,attr);};
  z.FS.unlink('/budget-probe');
  function run(args) {
    lines=[];length=0;
    const code=z.callMain([args[0],'-bd','-y','-sccUTF-8',...args.slice(1)]);
    const output=lines.join('\n');
    if(code!==0) {
      if(/password|encrypted|Wrong password/i.test(output))throw Error('密码不正确或加密文件已损坏，请修改密码后重试');
      throw Error('无法处理此压缩包：'+(output.slice(-1200)||`7-Zip 返回 ${code}`));
    }
    return output;
  }
  if(blob) {
    checkBudget(blob.size);
    z.FS.mkdir('/input');
    z.FS.mount(z.WORKERFS,{blobs:[{name:'archive',data:blob}]},'/input');
  }
  z.FS.mkdir('/source');
  return {z,run,input:'/input/archive'};
}
function mkdirs(FS,path) {
  let current='';
  for(const part of path.split('/').filter(Boolean)) {current+='/'+part;try{FS.mkdir(current);}catch{if(!FS.isDir(FS.lstat(current).mode))throw Error('文件与目录路径冲突');}}
}
function listing(s,password) {
  let output=s.run(['l','-slt',`-p${password||'-'}`,s.input]);
  const format=/^Type = (.+)$/m.exec(output)?.[1]?.toLowerCase()||'未知';
  const raw=['gzip','bzip2','xz'].includes(format);
  let unnamed=false,unknownSize=false;
  if(raw){
    const index=output.indexOf('----------'),body=output.slice(index+10);
    if(!/^Path = /m.test(body)){unnamed=true;unknownSize=/^Size =\s*$/m.test(body);output=output.slice(0,index+10)+'\nPath = 解压文件\n'+body.trim().replace(/^Size =\s*$/m,'Size = 0');}
  }
  const entries=parseListing(output);
  if(unnamed)entries.forEach(e=>Object.assign(e,{raw:true,unknownSize}));
  return {entries,format};
}
async function writeEntries(s,entries=[]) {
  if(!Array.isArray(entries)||entries.length>MAX_ENTRIES)throw Error('最多添加 10000 个条目');
  let size=0;const paths=new Set();
  for(const e of entries){safePath(e.path);if(paths.has(e.path))throw Error('添加的文件路径重复');paths.add(e.path);size+=e.directory?0:(e.blob?.size??0);checkBudget(size);}
  for(const e of entries) {
    mkdirs(s.z.FS,'source/'+(e.directory?e.path:e.path.split('/').slice(0,-1).join('/')));
    if(!e.directory){if(!(e.blob instanceof Blob))throw Error('文件数据无效');s.z.FS.writeFile('/source/'+e.path,new Uint8Array(await e.blob.arrayBuffer()));}
  }
}
function extract(s,entries,password) {
  const result=[];
  for(let i=0;i<entries.length;i++) {
    const e=entries[i];progress(`正在提取 ${i+1}/${entries.length} · ${e.path}`);
    if(e.directory){mkdirs(s.z.FS,'source/'+e.path);result.push({path:e.path,directory:true});continue;}
    s.run(['x','-spd',`-p${password||'-'}`,'-o/source',s.input,...e.raw?[]:['--',e.path]]);
    let path='/source/'+e.path;
    if(e.raw){const files=s.z.FS.readdir('/source').filter(n=>n!=='.'&&n!=='..');if(files.length!==1)throw Error('单文件压缩流输出无效');path='/source/'+safePath(files[0]);}
    const st=s.z.FS.lstat(path);
    if(!s.z.FS.isFile(st.mode)||!e.unknownSize&&st.size!==e.size)throw Error('提取后的文件类型或大小不一致');
    checkBudget(st.size);
    if(e.raw&&path!=='/source/'+e.path){s.z.FS.rename(path,'/source/'+e.path);path='/source/'+e.path;}
    result.push({path:e.path,directory:false,blob:new Blob([s.z.FS.readFile(path)])});
  }
  return result;
}
function create(s,options,entries) {
  const format=options.format||'7z';
  if(!FORMATS.includes(format))throw Error('不支持创建此格式');
  const singles=['gzip','bzip2','xz'].includes(format);
  if(singles&&(entries.filter(e=>!e.directory).length!==1||entries.some(e=>e.directory)))throw Error('GZIP、BZIP2 和 XZ 仅支持一个文件；多个文件请先打包 TAR');
  const password=options.newPassword??options.password??'';
  if(password && !['7z','zip'].includes(format))throw Error('此格式不支持密码，请选择 7z 或 ZIP');
  if(format==='zip'&&/[^\x20-\x7e]/.test(password))throw Error('此引擎创建 ZIP 密码仅支持英文、数字和半角符号，中文密码请选择 7z');
  if(password.length>256||/[\x00-\x1f]/.test(password))throw Error('密码过长或包含不支持的控制字符');
  const output='/result.'+format,args=['a','-t'+format,output,'-mx='+(['0','1','5','9'].includes(String(options.level))?options.level:'5'),'-mmt=1','-spd'];
  if(password){args.push('-p'+password);if(format==='7z')args.push('-mhe=on');if(format==='zip')args.push('-mem=AES256');}
  s.z.FS.chdir('/source');
  const names=singles?entries.filter(e=>!e.directory).map(e=>e.path):s.z.FS.readdir('/source').filter(p=>p!=='.'&&p!=='..');
  if(!names.length)throw Error('请至少添加一个文件或目录');
  progress('正在压缩，完成前可随时取消');s.run([...args,'--',...names]);
  const bytes=s.z.FS.readFile(output);checkBudget(bytes.length);
  return new Blob([bytes],{type:format==='zip'?'application/zip':'application/octet-stream'});
}
export async function execute(options) {
  progress('正在加载本地压缩引擎');
  if(options.blob && !(options.blob instanceof Blob))throw Error('请选择本地压缩包');
  const s=await moduleEngine(options.blob);
  if(options.operation==='create'){await writeEntries(s,options.entries);return create(s,options,options.entries);}
  const info=listing(s,options.password);
  if(options.operation==='list')return info;
  if(options.operation==='test'){checkBudget(info.entries.reduce((n,e)=>n+e.size,0));s.run(['t',`-p${options.password||'-'}`,s.input]);return {ok:true,count:info.entries.length};}
  if(options.operation==='extract') {
    const excluded=options.exclude||[];
    if(excluded.length)selectEntries(info.entries,excluded);
    const chosen=selectEntries(info.entries,options.paths).filter(e=>!excluded.some(p=>e.path===p||e.path.startsWith(p+'/')));
    if(!chosen.length)throw Error('所选条目已标记删除');
    const result=extract(s,chosen,options.password);
    return options.bundle?create(s,{format:'zip',level:'1',newPassword:''},result):result;
  }
  if(options.operation==='repack') {
    const removed=options.remove||[];
    if(removed.length)selectEntries(info.entries,removed);
    const kept=info.entries.filter(e=>!removed.some(p=>e.path===p||e.path.startsWith(p+'/'))&&!options.entries?.some(p=>p.path===e.path));
    const selected=kept.length?selectEntries(kept,kept.map(e=>e.path)):[];
    checkBudget(selected.reduce((n,e)=>n+e.size,0)+(options.entries||[]).reduce((n,e)=>n+(e.blob?.size||0),0));
    extract(s,selected,options.password);await writeEntries(s,options.entries);
    return create(s,options,[...kept,...(options.entries||[])]);
  }
  throw Error('未知压缩操作');
}
self.onmessage=async({data})=>{try{postMessage({type:'result',result:await execute(data)});}catch(e){postMessage({type:'error',message:e.message||String(e)});}};
