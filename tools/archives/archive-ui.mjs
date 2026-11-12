import {ArchiveEngine} from './archive-engine.mjs';
import {safePath,checkBudget,MAX_ENTRIES} from './archive-core.mjs';
const $=id=>document.getElementById(id),workspace=document.querySelector('.workspace');
let archive=null,info=null,draft=[],directory='',selected=new Set(),removed=new Set(),busy=false,downloadURL=null,descending=false;
const ext={gzip:'gz',bzip2:'bz2'};
const bytes=n=>n==null?'—':n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KiB':(n/1048576).toFixed(1)+' MiB';
function status(message,tone=''){ $('status').textContent=message;$('status').title=message;$('status').dataset.tone=tone;}
const engine=new ArchiveEngine(message=>status(message));
function outputName(){const name=$('filename').value.trim();safePath(name);if(name.includes('/'))throw Error('输出文件名不能包含目录');const format=$('format').value,suffix='.'+(ext[format]||format);if(!name.toLowerCase().endsWith(suffix))throw Error('输出文件名必须以 '+suffix+' 结尾');return name;}
const isRemoved=path=>[...removed].some(p=>path===p||path.startsWith(p+'/'));
function clearResult(){if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=null;$('download').hidden=true;$('download').removeAttribute('href');}
function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function result(blob){if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(blob);$('download').href=downloadURL;$('download').download=outputName();$('download').hidden=false;status('已完成 · '+bytes(blob.size)+'，点击“下载结果”保存','success');}
function updateControls(){
 $('cancel').hidden=!busy;$('progress').hidden=!busy;
 for(const id of ['open','new','add','addFolder','clearDraft','format','level','filename','newPassword','readPassword','create'])$(id).disabled=busy;
 for(const id of ['retry','integrity','repack'])$(id).disabled=busy||!archive;
 $('browse').disabled=busy||!info;
 $('delete').disabled=busy||!selected.size;$('undo').disabled=busy||!removed.size;
 $('newPassword').disabled=busy||!['7z','zip'].includes($('format').value);
 const available=[...selected].filter(p=>!isRemoved(p));
 $('extract').disabled=busy||available.length!==1||!!visibleEntries().find(e=>e.path===available[0])?.directory;
 $('extractZip').disabled=busy||!available.length;
 $('saveFolder').disabled=busy||!available.length||!window.showDirectoryPicker;
 $('saveFolder').title=window.showDirectoryPicker?'保存到所选目录，已有同名文件将被覆盖':'当前浏览器不支持目录保存，请提取为 ZIP';
 $('selection').textContent=`已选择 ${selected.size} 项${removed.size?' · 标记删除 '+removed.size+' 项':''}`;
 $('up').disabled=busy||!directory;
}
async function task(fn){if(busy)return;busy=true;updateControls();try{await fn();}catch(e){status(e.message,e.name==='AbortError'?'':'error');}finally{busy=false;updateControls();}}
function draftRender(){
 $('draft').replaceChildren();$('draftCount').textContent='待添加 '+draft.length+' 项';
 if(!draft.length){const li=document.createElement('li');li.className='draft-empty';li.textContent='添加文件后创建新压缩包，或重打包已打开的压缩包。';$('draft').append(li);}
 draft.forEach((e,i)=>{const li=document.createElement('li'),name=document.createElement('span'),button=document.createElement('button');name.textContent=e.path;name.title=e.path;button.textContent='×';button.setAttribute('aria-label','移除 '+e.path);button.onclick=()=>{if(busy)return;draft.splice(i,1);draftRender();};li.append(name,button);$('draft').append(li);});
}
function addFiles(files){
 try{const all=new Map(draft.map(e=>[e.path,e]));for(const file of files){const path=safePath(file.webkitRelativePath||file.name);all.set(path,{path,blob:file});}if(all.size>MAX_ENTRIES)throw Error('最多添加 10000 个文件');checkBudget([...all.values()].reduce((n,e)=>n+e.blob.size,0));draft=[...all.values()];draftRender();workspace.dataset.mode='create';status('已添加文件，创建新包或重打包现有压缩包');}catch(e){status(e.message,'error');}
}
function visibleEntries(){
 const list=info?.entries||[],map=new Map(),prefix=directory?directory+'/':'';
 for(const entry of list){if(!entry.path.startsWith(prefix)||entry.path===directory)continue;const rest=entry.path.slice(prefix.length),first=rest.split('/')[0],path=prefix+first;if(rest.includes('/')){if(!map.has(path))map.set(path,{path,directory:true,size:null,packed:null,attributes:'D',modified:''});}else map.set(path,entry);}
 const search=$('search').value.toLocaleLowerCase(),sort=$('sort').value;
 return [...map.values()].filter(e=>e.path.slice(prefix.length).toLocaleLowerCase().includes(search)).sort((a,b)=>{if(a.directory!==b.directory)return a.directory?-1:1;const v=typeof a[sort]==='number'?(a[sort]??0)-(b[sort]??0):String(a[sort]??'').localeCompare(String(b[sort]??''),'zh-CN',{numeric:true});return descending?-v:v;});
}
function render(){
 $('rows').replaceChildren();const entries=visibleEntries();
 for(const e of entries){
  const tr=document.createElement('tr');tr.dataset.deleted=removed.has(e.path)||[...removed].some(p=>e.path.startsWith(p+'/'));
  const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.disabled=isRemoved(e.path);checkbox.checked=selected.has(e.path);checkbox.setAttribute('aria-label','选择 '+e.path);checkbox.onchange=()=>{if(checkbox.disabled)return;checkbox.checked?selected.add(e.path):selected.delete(e.path);updateControls();};
  const check=document.createElement('td');check.append(checkbox);const name=document.createElement('td'),button=document.createElement('button');button.className='entry-name';button.dataset.directory=e.directory;button.textContent=(e.directory?'▸  ':'')+e.path.split('/').at(-1);button.title=e.path;button.onclick=()=>{if(busy)return;if(e.directory){directory=e.path;selected.clear();render();}else{checkbox.checked=!checkbox.checked;checkbox.onchange();}};name.append(button);tr.append(check,name);
  for(const value of [e.unknownSize?'未知':bytes(e.size),bytes(e.packed),(e.encrypted?'加密 · ':'')+(e.attributes||'—'),e.modified||'—']){const td=document.createElement('td');td.textContent=value;tr.append(td);}
  $('rows').append(tr);
 }
 $('empty').hidden=!!entries.length;$('empty').textContent=info?'当前目录没有匹配的条目':'打开压缩包查看内容，文件不会上传。';
 $('breadcrumb').textContent=directory||'根目录';$('breadcrumb').title=directory;$('selectAll').checked=entries.length>0&&entries.every(e=>selected.has(e.path));updateControls();
}
async function read(){
 if(!archive)return;
 await task(async()=>{const next=await engine.run('list',{blob:archive,password:$('readPassword').value});info=next;directory='';selected.clear();removed.clear();$('archiveName').textContent=archive.name||'压缩包';$('summary').textContent=next.format.toUpperCase()+' · '+next.entries.length+' 项';workspace.dataset.mode='browse';render();status(`已打开 ${next.entries.length} 项 · ${bytes(archive.size)}`,'success');});
}
$('open').onclick=()=>$('archiveFile').click();$('archiveFile').onchange=()=>{if($('archiveFile').files[0]){archive=$('archiveFile').files[0];info=null;render();read();}$('archiveFile').value='';};
$('retry').onclick=read;$('readPassword').onkeydown=e=>{if(e.key==='Enter')read();};
$('new').onclick=()=>{workspace.dataset.mode='create';status('添加文件后创建；已有压缩包仍可重打包。');};
$('browse').onclick=()=>{workspace.dataset.mode='browse';render();};
$('add').onclick=()=>$('addFiles').click();$('addFolder').onclick=()=>$('addDirectory').click();
for(const id of ['addFiles','addDirectory'])$(id).onchange=()=>{addFiles($(id).files);$(id).value='';};
$('clearDraft').onclick=()=>{draft=[];draftRender();};
$('format').onchange=()=>{clearResult();const format=$('format').value;$('filename').value=$('filename').value.replace(/\.[^.]+$/,'')+'.'+(ext[format]||format);$('newPassword').disabled=!['7z','zip'].includes(format);if($('newPassword').disabled)$('newPassword').value='';};
$('filename').oninput=clearResult;
$('create').onclick=()=>task(async()=>{outputName();const blob=await engine.run('create',{format:$('format').value,level:$('level').value,password:$('newPassword').value,entries:draft});result(blob);});
$('repack').onclick=()=>task(async()=>{outputName();const blob=await engine.run('repack',{blob:archive,password:$('readPassword').value,newPassword:$('newPassword').value,format:$('format').value,level:$('level').value,entries:draft,remove:[...removed]});result(blob);});
$('integrity').onclick=()=>task(async()=>{const r=await engine.run('test',{blob:archive,password:$('readPassword').value});status('校验通过 · '+r.count+' 项','success');});
$('cancel').onclick=()=>engine.cancel();
$('up').onclick=()=>{directory=directory.split('/').slice(0,-1).join('/');selected.clear();render();};
$('search').oninput=render;$('sort').onchange=render;$('direction').onclick=()=>{descending=!descending;$('direction').textContent=descending?'↓':'↑';render();};
$('selectAll').onchange=()=>{for(const e of visibleEntries())if(!isRemoved(e.path))$('selectAll').checked?selected.add(e.path):selected.delete(e.path);render();};
$('delete').onclick=()=>{for(const path of selected)removed.add(path);selected.clear();render();status('已标记删除，点击“重打包”生成新文件。原文件不会被修改。');workspace.dataset.mode='create';};
$('undo').onclick=()=>{removed.clear();render();};
function extractOptions(){return {blob:archive,password:$('readPassword').value,paths:[...selected].filter(p=>!isRemoved(p)),exclude:[...removed]};}
$('extract').onclick=()=>task(async()=>{const files=await engine.run('extract',extractOptions());const file=files.find(e=>e.blob);save(file.blob,file.path.split('/').at(-1));status('单文件已准备下载','success');});
$('extractZip').onclick=()=>task(async()=>{const blob=await engine.run('extract',{...extractOptions(),bundle:true});save(blob,'提取文件.zip');status('所选内容已提取为 ZIP','success');});
$('saveFolder').onclick=async()=>{
 let handle;try{handle=await window.showDirectoryPicker({mode:'readwrite'});}catch(e){status(e.name==='AbortError'?'已取消目录选择':e.message);return;}
 await task(async()=>{const files=await engine.run('extract',extractOptions());for(const file of files){safePath(file.path);const parts=file.path.split('/');let current=handle;for(const part of parts.slice(0,file.directory?parts.length:-1))current=await current.getDirectoryHandle(part,{create:true});if(!file.directory){const out=await current.getFileHandle(parts.at(-1),{create:true}),stream=await out.createWritable();try{await stream.write(file.blob);await stream.close();}catch(e){await stream.abort();throw e;}}}status('已保存到所选目录','success');});
};
document.body.ondragover=e=>{e.preventDefault();};document.body.ondrop=e=>{e.preventDefault();if(busy)return;const files=[...e.dataTransfer.files];if(files.length===1){archive=files[0];info=null;render();read();}else addFiles(files);};
window.addEventListener('beforeunload',()=>{engine.cancel();if(downloadURL)URL.revokeObjectURL(downloadURL);});
workspace.dataset.mode='browse';draftRender();render();
