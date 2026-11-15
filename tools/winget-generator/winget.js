const API='https://api.winget.run/v2/packages?Query=';
const popular=[
  ['Google.Chrome','Google Chrome','Google LLC','browser web'],
  ['Microsoft.Edge','Microsoft Edge','Microsoft','browser web'],
  ['Microsoft.PowerToys','PowerToys','Microsoft','utility productivity'],
  ['Microsoft.VisualStudioCode','Visual Studio Code','Microsoft','development editor'],
  ['Git.Git','Git','Git Project','development version-control'],
  ['OpenJS.NodeJS.LTS','Node.js LTS','OpenJS Foundation','development runtime'],
  ['Python.Python.3.12','Python 3.12','Python Software Foundation','development language'],
  ['7zip.7zip','7-Zip','Igor Pavlov','archive utility'],
  ['Notepad++.Notepad++','Notepad++','Don Ho','editor'],
  ['Mozilla.Firefox','Mozilla Firefox','Mozilla','browser web'],
  ['VideoLAN.VLC','VLC media player','VideoLAN','video audio'],
  ['Valve.Steam','Steam','Valve','game gaming'],
  ['Discord.Discord','Discord','Discord Inc.','chat communication'],
  ['OBSProject.OBSStudio','OBS Studio','OBS Project','record stream video'],
  ['PuTTY.PuTTY','PuTTY','Simon Tatham','ssh terminal network'],
  ['WiresharkFoundation.Wireshark','Wireshark','Wireshark Foundation','network packet'],
].map(([id,name,publisher,tags])=>({id,name,publisher,tags:tags.split(' '),version:'',description:''}));
const $=s=>document.querySelector(s);
const selected=new Set(JSON.parse(localStorage.getItem('winget-selected')||'[]'));
let packages=structuredClone(popular),visible=[],filter='all',controller=null;
const save=()=>{localStorage.setItem('winget-selected',JSON.stringify([...selected]));renderSelected();generate()};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function unpack(value){if(typeof value!=='string')return value;try{return JSON.parse(value)}catch{return value}}
function normalizePackage(item){
  const latest=item.Latest||item.latest||{};
  return {id:item.Id||item.id,name:latest.Name||item.Name||item.Id,publisher:latest.Publisher||'',version:item.Versions?.[0]||'',tags:latest.Tags||[],description:latest.Description||'',homepage:latest.Homepage||''};
}
function localMatches(query){const q=query.trim().toLowerCase();return (q?popular.filter(item=>`${item.id} ${item.name} ${item.publisher} ${item.tags.join(' ')}`.toLowerCase().includes(q)):popular)}
async function search(){
  const query=$('#query').value.trim();controller?.abort();controller=new AbortController();$('#repoStatus').textContent=query?'正在搜索公开仓库':'正在读取热门软件';
  let source=packages;
  if(query){try{const response=await fetch(API+encodeURIComponent(query),{signal:controller.signal});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=unpack(await response.json());const items=Array.isArray(data?.Packages)?data.Packages:[];source=items.map(normalizePackage).filter(item=>{const hay=`${item.id} ${item.name} ${item.publisher} ${item.tags.join(' ')} ${item.description}`.toLowerCase();return hay.includes(query.toLowerCase())}).slice(0,120);if(!source.length)source=items.slice(0,120).map(normalizePackage);$('#repoStatus').textContent=`公开仓库 · ${data?.Total??source.length} 个匹配`;packages=source}catch(error){if(error.name==='AbortError')return;source=localMatches(query);$('#repoStatus').textContent='仓库不可用 · 使用内置索引'}}
  else{source=localMatches('');$('#repoStatus').textContent='热门软件 · 可输入名称搜索'}
  visible=source;render();
}
function render(){
  const query=$('#query').value.trim().toLowerCase();
  let list=visible.filter(item=>filter==='selected'?selected.has(item.id):true);
  if(filter==='popular'&&query)list=list.slice(0,40);
  $('#resultCount').textContent=`${list.length} 个结果`;
  $('#results').innerHTML=list.length?list.map(item=>`<div class="result ${selected.has(item.id)?'checked':''}" data-package="${esc(item.id)}"><input type="checkbox" ${selected.has(item.id)?'checked':''} aria-label="选择 ${esc(item.name)}"><div class="result-main"><div class="result-title"><strong>${esc(item.name)}</strong>${item.version?`<em>${esc(item.version)}</em>`:''}</div><span class="result-id">${esc(item.id)}</span><span class="result-meta">${esc(item.publisher||'未知发布者')}${item.tags?.length?` · ${esc(item.tags.slice(0,3).join(' / '))}`:''}</span></div><span class="tag">选择</span></div>`).join(''):'<div class="empty">没有匹配软件</div>';
}
function renderSelected(){$('#selectedCount').textContent=`${selected.size} 个已选择`;$('#clearSelection').disabled=!selected.size;generate()}
function generate(){
  const lines=[...selected].map(id=>{
    const parts=['winget','install','--id',`"${id.replaceAll('"','`"')}"`];
    if($('#exact').checked)parts.push('--exact');parts.push('--source','winget');if($('#scope').value)parts.push('--scope',$('#scope').value);if($('#silent').checked)parts.push('--silent');if($('#agreements').checked)parts.push('--accept-package-agreements','--accept-source-agreements');return parts.join(' ')+' --disable-interactivity';
  });
  $('#output').textContent=lines.length?`$ErrorActionPreference = "Stop"\n\n${lines.join('\n')}`:'请选择需要安装的软件';
  $('#copy').disabled=$('#download').disabled=!lines.length;
}
function add(id){const value=String(id||'').trim();if(!value)return;selected.add(value);save();render()}
$('#query').addEventListener('input',()=>{clearTimeout(search.timer);search.timer=setTimeout(search,350)});
$('#searchButton').addEventListener('click',search);
$('#results').addEventListener('click',event=>{const row=event.target.closest('[data-package]');if(!row)return;const id=row.dataset.package;selected.has(id)?selected.delete(id):selected.add(id);save();render()});
$('#selectVisible').addEventListener('click',()=>{visible.forEach(item=>selected.add(item.id));save();render()});
$('#clearSelection').addEventListener('click',()=>{selected.clear();save();render()});
document.querySelector('.wg-filters').addEventListener('click',event=>{const button=event.target.closest('[data-kind]');if(!button)return;filter=button.dataset.kind;document.querySelectorAll('.wg-filters button').forEach(item=>item.classList.toggle('active',item===button));render()});
$('#addManual').addEventListener('click',()=>{add($('#manualId').value);$('#manualId').value=''});
$('#manualId').addEventListener('keydown',event=>{if(event.key==='Enter'){$('#addManual').click()}});
['scope','silent','agreements','exact'].forEach(id=>$('#'+id).addEventListener('change',generate));
$('#regenerate').addEventListener('click',generate);
$('#copy').addEventListener('click',async()=>{await navigator.clipboard.writeText($('#output').textContent);$('#copy').textContent='已复制';setTimeout(()=>$('#copy').textContent='复制命令',1400)});
$('#download').addEventListener('click',()=>{const blob=new Blob([$('#output').textContent],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='winget-install.ps1';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)});
renderSelected();search();
