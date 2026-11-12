import {planImage} from './iso-core.js';
import {ImageEngine} from './image-engine.js';
const $=id=>document.getElementById(id),direct='showSaveFilePicker'in window;
let entries=[],plan=null,busy=false,collecting=false,worker=null,page=0,downloadUrl='',downloadName='';
let engine=null,protectedHandles=[],reconstructed=false;
const size=n=>{if(!n)return '0 B';const i=Math.min(3,Math.floor(Math.log(n)/Math.log(1024)));return (n/1024**i).toLocaleString(undefined,{maximumFractionDigits:i?1:0})+' '+['B','KiB','MiB','GiB'][i];};
function status(text,error=false){$('status').textContent=text;$('status').dataset.tone=error?'error':'';}
function invalidate(){if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl='';$('download').hidden=true;}
function lock(value){busy=value;for(const id of ['addFiles','addFolder','clear','emptyAdd','filename','volumeId','outputMode','imageFormat','capacityMiB','browseTab'])$(id).disabled=value||collecting;$('generate').disabled=value||collecting||!plan;for(const b of $('fileList').querySelectorAll('button'))b.disabled=value||collecting;$('cancel').hidden=!value;$('cancel').disabled=false;}
function update(changed=true){
 if(changed){invalidate();status('');}plan=null;
 if(entries.length)try{plan=$('imageFormat').value==='iso'?planImage(entries,{volumeId:$('volumeId').value}):{totalBytes:null};}catch(e){status(e.message,true);}
 $('fileCount').textContent=String(entries.filter(e=>e.kind==='file').length);$('sourceSize').textContent=size(entries.reduce((n,e)=>n+(e.blob?.size||0),0));$('imageSize').textContent=plan?.totalBytes?size(plan.totalBytes):'—';
 $('empty').hidden=!!entries.length;$('tableWrap').hidden=!entries.length;$('clear').disabled=!entries.length||busy||collecting;
 page=Math.min(page,Math.max(0,Math.ceil(entries.length/50)-1));const fragment=document.createDocumentFragment();
 for(const[index,entry]of entries.slice(page*50,page*50+50).entries()){
  const tr=document.createElement('tr'),name=document.createElement('td'),bytes=document.createElement('td'),action=document.createElement('td'),remove=document.createElement('button');
  name.textContent=entry.path+(entry.kind==='directory'?'/':'');if(entry.kind==='directory')name.className='folder-name';bytes.textContent=entry.kind==='directory'?'文件夹':size(entry.blob.size);
  remove.textContent='×';remove.type='button';remove.dataset.remove=String(index+page*50);remove.setAttribute('aria-label','移除 '+entry.path);remove.disabled=busy||collecting;remove.onclick=()=>{entries.splice(index+page*50,1);update();};
  action.append(remove);tr.append(name,bytes,action);fragment.append(tr);
 }
 $('fileList').replaceChildren(fragment);const pages=Math.ceil(entries.length/50);$('pager').hidden=pages<=1;$('pageNumber').textContent=`${page+1} / ${pages}`;$('previous').disabled=page===0;$('next').disabled=page>=pages-1;$('generate').disabled=busy||collecting||!plan;
}
function add(items){
 if(busy)return;const merged=[...entries],paths=new Map(merged.map((e,i)=>[e.path,i]));let duplicate=0;
 for(const entry of items){if(paths.has(entry.path)){duplicate++;continue;}paths.set(entry.path,merged.length);merged.push(entry);if(merged.length>10000)throw Error('最多添加 10000 个文件和目录');}
 // Validate once before accepting any of the new batch; no partially imported directories.
 if(merged.length&&$('imageFormat').value==='iso')planImage(merged,{volumeId:'DATA'});entries=merged;update();if(duplicate)status(`已跳过 ${duplicate} 个重复路径`);
}
function fromFiles(files){return [...files].map(blob=>({path:blob.webkitRelativePath||blob.name,kind:'file',blob}));}
async function collect(read){
 if(busy||collecting)return;collecting=true;lock(false);status('正在读取文件夹…');
 try{const items=[];await read(items);add(items);}catch(e){if(e.name!=='AbortError')status(e.message||'无法读取文件夹',true);else status('');}finally{collecting=false;lock(false);$('clear').disabled=!entries.length;}
}
function push(items,entry){if(items.length+entries.length>=10000)throw Error('最多添加 10000 个文件和目录');items.push(entry);}
async function fromHandle(handle,path,items){
 if(handle.kind==='file'){push(items,{path,kind:'file',blob:await handle.getFile()});return;}
 push(items,{path,kind:'directory'});if(path.split('/').length>7)throw Error('最多支持 7 层子目录');
 for await(const[name,child]of handle.entries())await fromHandle(child,path+'/'+name,items);
}
async function fromEntry(entry,path,items){
 if(entry.isFile){const blob=await new Promise((resolve,reject)=>entry.file(resolve,reject));push(items,{path,kind:'file',blob});return;}
 push(items,{path,kind:'directory'});if(path.split('/').length>7)throw Error('最多支持 7 层子目录');
 const reader=entry.createReader();for(;;){const children=await new Promise((resolve,reject)=>reader.readEntries(resolve,reject));if(!children.length)break;for(const child of children)await fromEntry(child,path+'/'+child.name,items);}
}
$('addFiles').onclick=$('emptyAdd').onclick=()=>$('files').click();
$('files').onchange=()=>{try{add(fromFiles($('files').files));}catch(e){status(e.message,true);}$('files').value='';};
$('folder').onchange=()=>{try{add(fromFiles($('folder').files));status('当前选择方式不包含空文件夹');}catch(e){status(e.message,true);}$('folder').value='';};
$('addFolder').onclick=()=>{'showDirectoryPicker'in window?collect(async items=>{const handle=await showDirectoryPicker({mode:'read'});await fromHandle(handle,handle.name,items);}):$('folder').click();};
$('dropZone').ondragover=event=>{event.preventDefault();if(!busy&&!collecting)$('dropZone').classList.add('dragging');};
$('dropZone').ondragleave=event=>{if(!$('dropZone').contains(event.relatedTarget))$('dropZone').classList.remove('dragging');};
$('dropZone').ondrop=event=>{
 event.preventDefault();$('dropZone').classList.remove('dragging');if(busy||collecting)return;
 const items=[...event.dataTransfer.items].filter(i=>i.kind==='file'),roots=items.map(i=>i.webkitGetAsEntry?.()),files=[...event.dataTransfer.files];
 collect(async result=>{if(roots.length&&roots.every(Boolean))for(const entry of roots)await fromEntry(entry,entry.name,result);else result.push(...fromFiles(files));});
};
$('clear').onclick=()=>{entries=[];page=0;update();};$('volumeId').oninput=update;$('filename').oninput=()=>{invalidate();status('');};$('outputMode').onchange=()=>{invalidate();status('');};
$('previous').onclick=()=>{page--;update(false);};$('next').onclick=()=>{page++;update(false);};
$('download').onclick=()=>{if(downloadUrl){const a=document.createElement('a');a.href=downloadUrl;a.download=downloadName;a.click();}};
$('cancel').onclick=()=>{if(engine)engine.cancel();else if(worker){$('cancel').disabled=true;status('正在取消…');worker.postMessage({type:'cancel'});}};
$('imageFormat').onchange=()=>{const format=$('imageFormat').value;$('filename').value=$('filename').value.replace(/\.(iso|wim|img|vhd)$/i,'')+'.'+format;$('volumeField').hidden=format!=='iso';$('capacityField').hidden=!['img','vhd'].includes(format);$('formatScope').textContent=format==='iso'?'资料光盘，不含系统引导。':format==='wim'?'WIM 写入上限 256 MiB。':'FAT 磁盘，容量上限 256 MiB。';update();};
window.addEventListener('image-rebuild',event=>{if(busy||collecting)return;$('imageFormat').value='iso';$('imageFormat').onchange();entries=event.detail.entries;protectedHandles=event.detail.protectedHandles;reconstructed=true;if(!protectedHandles.length){$('outputMode').value='download';$('outputMode').querySelector('[value=direct]').disabled=true;}page=0;update();});
$('generate').onclick=async()=>{
 if(busy||!plan)return;let filename=$('filename').value.trim();
 if(!filename||/[\\/:*?"<>|\x00-\x1f]/.test(filename)||filename==='.'||filename==='..')return status('请输入有效的镜像文件名',true);
 const format=$('imageFormat').value;if(!filename.toLowerCase().endsWith('.'+format))filename+='.'+format;const useDirect=$('outputMode').value==='direct';
 if(useDirect&&reconstructed&&!protectedHandles.length)return status('重建镜像请使用下载方式保存',true);
 if(!useDirect&&plan.totalBytes>512*1024*1024)return status('下载方式最多 512 MiB，请使用直接保存',true);
 invalidate();lock(true);let handle=null;
 try{
  if(useDirect)handle=await showSaveFilePicker({suggestedName:filename,types:[{description:'镜像文件',accept:{'application/octet-stream':['.'+format]}}]});
  if(handle)for(const original of protectedHandles)if(await original.isSameEntry(handle))throw Error('请选择新文件，源镜像不能覆盖');
  if(format!=='iso'){
   engine=new ImageEngine({onProgress:data=>status(data.message||'正在制作…')});$('progress').hidden=false;$('progress').removeAttribute('value');status('正在制作…');
   try{const blob=await engine.create({format,entries:entries.map(e=>({...e,directory:e.kind==='directory'})),capacityMiB:Number($('capacityMiB').value)});
    if(handle){const stream=await handle.createWritable();try{await blob.stream().pipeTo(stream);}catch(e){try{await stream.abort();}catch{}throw e;}status('已保存 · '+size(blob.size));}
    else{downloadUrl=URL.createObjectURL(blob);downloadName=filename;$('download').hidden=false;status('已生成 · '+size(blob.size));}
   }finally{engine.destroy();engine=null;lock(false);$('progress').hidden=true;}return;
  }
  worker=new Worker(new URL('./iso-worker.js',import.meta.url),{type:'module'});$('progress').hidden=false;$('progress').value=0;status('正在制作…');
  const finish=()=>{worker?.terminate();worker=null;lock(false);$('clear').disabled=!entries.length;$('progress').hidden=true;};
  worker.onmessage=({data})=>{
   if(data.type==='ready'){worker.postMessage({type:'start',entries,volumeId:$('volumeId').value,handle});}
   else if(data.type==='progress'){$('progress').value=data.written/data.total;status('正在制作 '+Math.floor(data.written/data.total*100)+'%');}
   else if(data.type==='committing'){$('cancel').disabled=true;status('正在保存…');}
   else if(data.type==='done'){
    if(data.blob){downloadUrl=URL.createObjectURL(data.blob);downloadName=filename;$('download').hidden=false;status('已生成 · '+size(data.size));}else status('已保存 · '+size(data.size));finish();
   }else{status(data.message,data.type==='error');finish();}
  };
  worker.onerror=event=>{event.preventDefault();status('制作进程异常，请重新添加文件后重试',true);finish();};
 }catch(e){worker?.terminate();worker=null;lock(false);$('progress').hidden=true;status(e.name==='AbortError'?'已取消':e.message||'无法开始制作',e.name!=='AbortError');}
};
if(!direct){$('outputMode').querySelector('[value=direct]').disabled=true;$('outputMode').value='download';}
window.addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
update();
