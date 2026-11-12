const base=new URL('../../../vendor/pyodide/',import.meta.url).href;
let python,outputLength=0,outputQueue=[],flushTimer;
const MAX_OUTPUT=100000,MAX_FILES=128,MAX_BYTES=8*1024*1024;
function flush(){clearTimeout(flushTimer);flushTimer=undefined;if(outputQueue.length)postMessage({type:'output',chunks:outputQueue.splice(0)});}
function output(text,kind='stdout'){
 if(outputLength>=MAX_OUTPUT)return;
 text=String(text);const left=MAX_OUTPUT-outputLength;
 if(text.length>left)text=text.slice(0,left)+'\n[输出超过 100,000 字符，已截断]\n';
 outputLength+=text.length;outputQueue.push({text,kind});
 if(outputQueue.length>=100)flush();else if(!flushTimer)flushTimer=setTimeout(flush,30);
}
async function initialize(){
 if(python)return python;
 postMessage({type:'status',text:'正在载入本地 Python 引擎，首次约需下载 15 MB…'});
 const {loadPyodide}=await import(base+'pyodide.mjs');
 python=await loadPyodide({indexURL:base,stdout:s=>output(s+'\n'),stderr:s=>output(s+'\n','stderr')});
 const stdoutDecoder=new TextDecoder(),stderrDecoder=new TextDecoder();
 python.setStdout({write:buffer=>{output(stdoutDecoder.decode(buffer,{stream:true}));return buffer.length;}});
 python.setStderr({write:buffer=>{output(stderrDecoder.decode(buffer,{stream:true}),'stderr');return buffer.length;}});
 python.FS.mkdirTree('/home/pyodide/project');python.FS.chdir('/home/pyodide/project');
 python.runPython("import sys\nif '/home/pyodide/project' not in sys.path: sys.path.insert(0, '/home/pyodide/project')");
 return python;
}
function safePath(name){return typeof name==='string'&&name.length<=240&&!name.startsWith('/')&&!name.includes('\\')&&name.split('/').length<=8&&!name.split('/').some(s=>!s||s==='.'||s==='..'||/[\u0000-\u001f]/.test(s));}
function clearDirectory(directory){for(const name of python.FS.readdir(directory)){if(name==='.'||name==='..')continue;const path=directory+'/'+name,stat=python.FS.lstat(path);if(python.FS.isDir(stat.mode)){clearDirectory(path);python.FS.rmdir(path);}else python.FS.unlink(path);}}
function listFiles(){
 let total=0;const files=[];let skipped=0;
 const scan=(directory,prefix='')=>{
  for(const name of python.FS.readdir(directory)){
   if(name==='.'||name==='..'||name==='__pycache__')continue;
   const full=directory+'/'+name,relative=prefix+name,stat=python.FS.lstat(full);
   if(python.FS.isDir(stat.mode)){if(relative.split('/').length<8)scan(full,relative+'/');else skipped++;}
   else if(python.FS.isFile(stat.mode)&&safePath(relative)){
    if(files.length>=MAX_FILES||stat.size>4*1024*1024||total+stat.size>MAX_BYTES){skipped++;continue;}
    const data=python.FS.readFile(full);total+=data.byteLength;files.push({name:relative,data});
   }else skipped++;
  }
 };scan('/home/pyodide/project');return{files,skipped};
}
self.onmessage=async({data})=>{
 if(data.type!=='run')return;
 outputLength=0;outputQueue=[];
 let prepared=false;
 try{
  await initialize();
  const names=new Set(data.files.map(file=>file.name));
  if(names.size!==data.files.length||data.files.some(file=>!safePath(file.name)||file.name.split('/').slice(0,-1).some((_,index,parts)=>names.has(parts.slice(0,index+1).join('/')))))throw new Error('项目文件与目录路径冲突');
  python.FS.chdir('/home/pyodide');clearDirectory('/home/pyodide/project');
  for(const file of data.files){
   if(!safePath(file.name))throw new Error('无效文件路径');
   const path='/home/pyodide/project/'+file.name;
   python.FS.mkdirTree(path.slice(0,path.lastIndexOf('/')));
   python.FS.writeFile(path,file.data);
  }
  python.FS.chdir('/home/pyodide/project');
  python.runPython("import sys, importlib\nfor _module_name, _module in list(sys.modules.items()):\n    if str(getattr(_module, '__file__', '')).startswith('/home/pyodide/project/'):\n        del sys.modules[_module_name]\nimportlib.invalidate_caches()\nsys.dont_write_bytecode = True");
  let inputIndex=0;const inputs=data.stdin.split('\n');if(inputs.at(-1)==='')inputs.pop();
  python.setStdin({stdin:()=>inputIndex<inputs.length?inputs[inputIndex++]:null,isatty:false});
  python.globals.set('__toolbox_source',data.code);python.globals.set('__toolbox_name',data.name);
  prepared=true;
  if(data.compile){python.runPython('compile(__toolbox_source, __toolbox_name, "exec")');output('编译通过；未执行代码。\n','system');}
  else{
   postMessage({type:'status',text:'Python 正在运行…'});
   await python.runPythonAsync('try:\n    exec(compile(__toolbox_source, __toolbox_name, "exec"), {"__name__": "__main__", "__file__": __toolbox_name})\nfinally:\n    import sys\n    sys.stdout.flush()\n    sys.stderr.flush()');
  }
  flush();postMessage({type:'done',prepared,...listFiles()});
 }catch(error){output(String(error)+'\n','stderr');flush();postMessage({type:'done',failed:true,prepared,...(python&&prepared?listFiles():{})});}
};
