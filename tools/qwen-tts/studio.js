import {StreamingPlayer} from './stream.mjs';
import {pcm16,wavBlob} from './audio.mjs';
import {audioHistory} from './history.mjs';
import {MODES,CODEC,SPEAKERS,LANGUAGES,DEFAULTS,validateRequest,modelEntries} from './config.mjs?v=20261114-qwen1';
import {recordToolUse} from '../../assets/tool-use.mjs';
const $=id=>document.getElementById(id),stream=new StreamingPlayer(),records=new Map();
const resize=()=>document.documentElement.style.setProperty('--app-height',`${window.visualViewport?.height||innerHeight}px`);resize();window.visualViewport?.addEventListener('resize',resize);
let worker=null,ready=false,loading=false,active=null,restoring=true,disposed=false,loadTimer;
const status=(text,error=false)=>{$('pageStatus').textContent=text;$('pageStatus').dataset.error=String(error);};
function selectPane(pane){document.querySelector('.studio-main').dataset.pane=pane;document.querySelectorAll('.mobile-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.pane===pane)));}
document.querySelectorAll('.mobile-tabs button').forEach(b=>b.onclick=()=>selectPane(b.dataset.pane));
function options(){return Object.fromEntries(Object.keys(DEFAULTS).map(key=>[key,Number($(key).value)]));}
function controls(){
 $('generate').disabled=!ready||!!active||restoring;$('loadModel').disabled=loading||ready||!!active;
 $('loadModel').textContent=ready?'已就绪':'加载模型';$('cancelLoad').hidden=!loading;
 $('clearModel').disabled=loading||!!active;$('clearHistory').disabled=!records.size||restoring;
 $('stop').hidden=!active;$('stop').disabled=!!active?.cancelled;
 document.querySelectorAll('.config-panel input,.config-panel select,.config-panel textarea,#resetConfig').forEach(e=>e.disabled=!!active||loading);
 $('quality').disabled=!!active||loading||$('mode').value==='voicedesign';
}
function modeFields(){
 const mode=$('mode').value;$('speakerField').hidden=mode!=='customvoice';$('instructionField').hidden=mode==='base';$('referenceFields').hidden=mode!=='base';
 $('instructionLabel').textContent=mode==='voicedesign'?'声音描述':'风格指令（可选）';
 $('instruction').placeholder=mode==='voicedesign'?'例如：清晰温柔的年轻女声，音调适中':'例如：温柔自然，语速稍慢';
 if(mode==='voicedesign')$('quality').value='standard';
 $('quality').disabled=mode==='voicedesign';
 const entries=modelEntries(mode,$('quality').value);
 document.querySelector('.model-badge').textContent=`Qwen3-TTS · ${$('quality').value==='lite'?'0.6B':'1.7B'} Q4`;
 $('modelDetail').textContent=`${(entries.reduce((n,e)=>n+e.size,0)/1e9).toFixed(2)} GB · 本地缓存`;
}
function terminate(){clearTimeout(loadTimer);worker?.terminate();worker=null;ready=false;loading=false;}
function recordState(r){
 const duration=r.samples?(r.samples/r.rate).toFixed(1)+' 秒':'';
 const label=r.state==='generating'?(r.cancelled?'正在停止':r.part?`生成中 ${r.part}/${r.total} 段`:'准备生成'):({complete:'已完成',cancelled:'已停止',error:'未完成'})[r.state]||'未完成';
 return [label,duration].filter(Boolean).join(' · ');
}
function updateRecord(r){
 const e=$('generationList').querySelector(`[data-id="${r.id}"]`);if(!e)return;
 e.dataset.state=r.state;e.querySelector('.record-state').textContent=recordState(r);
 const progress=e.querySelector('progress');progress.hidden=r.state!=='generating';if(r.total){progress.max=r.total;progress.value=Math.max(0,r.part-1);}else progress.removeAttribute('value');
 if(r.blob&&!r.url)r.url=URL.createObjectURL(r.blob);const audio=e.querySelector('audio');
 if(r.url&&audio.getAttribute('src')!==r.url)audio.src=r.url;audio.hidden=!r.blob;e.querySelector('.record-download').disabled=!r.blob;e.querySelector('.record-error').textContent=r.error||'';
}
function countRecords(){
 $('recordCount').textContent=records.size;$('mobileCount').textContent=records.size||'';$('historyEmpty').hidden=!!records.size;controls();
}
function pauseOthers(except){document.querySelectorAll('.generation-item audio').forEach(e=>{if(e!==except)e.pause();});}
function mountRecord(r,prepend=true){
 const e=document.createElement('article');e.className='generation-item';e.dataset.id=r.id;
 e.innerHTML='<div class="record-heading"><span class="record-voice"></span><span class="record-time"></span><button class="text-button record-delete" aria-label="删除记录">删除</button></div><p class="record-text"></p><div class="record-status"><span class="record-state" role="status"></span><button class="text-button record-download" disabled>下载 WAV</button></div><progress hidden></progress><audio controls preload="none" hidden></audio><p class="record-error"></p>';
 e.querySelector('.record-voice').textContent=r.voiceName;e.querySelector('.record-text').textContent=r.text;
 e.querySelector('.record-time').textContent=new Date(r.createdAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
 e.querySelector('.record-delete').onclick=()=>void removeRecord(r);e.querySelector('.record-download').onclick=()=>{if(!r.blob)return;const a=document.createElement('a');a.href=r.url;a.download=`${r.voiceName}-${r.id.slice(0,8)}.wav`;a.click();};
 e.querySelector('audio').onplay=()=>{stream.stop();pauseOthers(e.querySelector('audio'));};
 if(prepend)$('generationList').prepend(e);else $('generationList').append(e);updateRecord(r);countRecords();
}
const stored=r=>Object.fromEntries(['id','text','voiceName','createdAt','state','samples','rate','blob','error'].map(k=>[k,r[k]]));
async function save(r){if(r.deleted||disposed)return;try{await audioHistory.save(stored(r));if(r.deleted)await audioHistory.remove(r.id);}catch{status('记录未能保存，请先下载音频。',true);}}
async function removeRecord(r){r.deleted=true;records.delete(r.id);const e=$('generationList').querySelector(`[data-id="${r.id}"]`);e?.querySelector('audio')?.pause();e?.remove();if(r.url)URL.revokeObjectURL(r.url);countRecords();try{await audioHistory.remove(r.id);}catch{status('删除失败，请重试。',true);}}
async function finish(job,state,error=''){
 if(active!==job)return;job.state=state;job.error=error;if(job.samples)job.blob=wavBlob(job.chunks,job.samples,job.rate);job.chunks=[];active=null;updateRecord(job);$('generateStatus').textContent=recordState(job);controls();await save(job);
}
function makeWorker(){
 const instance=new Worker('./worker.js?v=20261114-qwen1',{type:'module'});worker=instance;
 instance.onmessage=({data})=>{
  if(worker!==instance)return;
  if(data.type==='progress'){$('modelProgress').value=data.value;$('modelDetail').textContent=data.detail;return;}
  if(data.type==='loading-runtime'){$('modelState').textContent='正在初始化…';return;}
  if(data.type==='model-ready'){clearTimeout(loadTimer);ready=true;loading=false;$('modelState').textContent=`${MODES[$('mode').value].label} · 本地运行`;$('modelDetail').textContent='模型已缓存';$('modelProgress').hidden=true;controls();return;}
  const job=active;
  if(data.type==='error'){
   if(data.id&&data.id!==job?.id)return;
   if(data.fatal){terminate();$('modelState').textContent='加载后可重试';stream.stop();}else if(loading){loading=false;}
   const message=data.error||'生成失败';status(message,true);$('modelProgress').hidden=true;if(job)void finish(job,'error',message);controls();return;
  }
  if(!job||data.id!==job.id)return;
  if(data.type==='segment'){job.part=data.part;job.total=data.total;updateRecord(job);$('generateStatus').textContent=recordState(job);}
  if(data.type==='audio'&&!job.cancelled){const samples=new Float32Array(data.samples);job.chunks.push(pcm16(samples));job.samples+=samples.length;try{stream.append(job.id,samples,job.rate);}catch{status('试听不可用，完成后可播放和下载。',true);}updateRecord(job);$('generateStatus').textContent=recordState(job);}
  if(data.type==='done'||data.type==='cancelled')void finish(job,job.cancelled||data.type==='cancelled'?'cancelled':job.samples?'complete':'error',!job.samples&&!job.cancelled?'模型没有返回音频，请重试。':'');
 };
 instance.onerror=e=>{if(worker!==instance)return;terminate();stream.stop();$('modelState').textContent='运行中断';const message=/memory|allocation/i.test(e.message)?'设备可用内存不足，请关闭其他标签后重试。':e.message||'语音运行时异常';status(message,true);if(active)void finish(active,'error',message);controls();};
 return instance;
}
async function purgeOldModel(){try{const root=await navigator.storage.getDirectory();await root.removeEntry('breeze-tts-2-q4_k.gguf');}catch(error){if(error.name!=='NotFoundError')console.debug('旧缓存清理：',error.name);}}
async function loadModel(){
 if(loading||ready||active)return;loading=true;status('');$('modelState').textContent='准备模型…';$('modelProgress').hidden=false;$('modelProgress').value=0;controls();
 try{
  if(!navigator.storage?.getDirectory&&!globalThis.caches)throw Error('当前浏览器不支持模型缓存。');
  await purgeOldModel();await navigator.storage.persist?.();
  const entries=modelEntries($('mode').value,$('quality').value),estimate=await navigator.storage.estimate?.(),needed=entries.reduce((n,e)=>n+e.size,0);
  if(estimate&&estimate.quota-estimate.usage<needed&&navigator.storage?.getDirectory){const root=await navigator.storage.getDirectory();let missing=0;for(const entry of entries){try{const d=await root.getDirectoryHandle('qwen3-tts-1.7b'),size=(await(await d.getFileHandle(entry.file)).getFile()).size;missing+=Math.max(0,entry.size-size);}catch{missing+=entry.size;}}if(estimate.quota-estimate.usage<missing)throw Error('浏览器存储空间不足，请清理空间后重试。');}
  makeWorker().postMessage({type:'load',mode:$('mode').value,quality:$('quality').value});
 }catch(error){terminate();$('modelState').textContent='模型未加载';$('modelProgress').hidden=true;status(error.message,true);controls();}
}
async function referenceAudio(file){
 if(!file)return null;const context=new AudioContext();
 try{const decoded=await context.decodeAudioData(await file.arrayBuffer());if(decoded.duration<3||decoded.duration>20.05)throw Error('参考音频请使用 3–20 秒的片段。');
  const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*24000),24000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();return (await offline.startRendering()).getChannelData(0);
 }finally{await context.close();}
}
async function generate(){
 if(!ready||active||restoring)return;
 const request={mode:$('mode').value,text:$('text').value.trim(),language:$('language').value,speaker:$('speaker').value,instruction:$('instruction').value.trim(),refText:$('refText').value.trim(),xVectorOnly:$('xVectorOnly').checked,options:options(),hasReference:!!$('reference').files[0]};
 try{validateRequest(request);}catch(error){status(error.message,true);if(!request.text)selectPane('compose');else selectPane('config');return;}
 const voiceName=request.mode==='customvoice'?SPEAKERS.find(([id])=>id===request.speaker)?.[1].split(' · ')[0]:MODES[request.mode].label;
 const job={id:crypto.randomUUID(),text:request.text,voiceName,createdAt:Date.now(),state:'generating',samples:0,rate:24000,chunks:[],cancelled:false,posted:false,deleted:false};
 active=job;records.set(job.id,job);mountRecord(job);pauseOthers();recordToolUse('qwen-tts');status('');$('generateStatus').textContent='准备生成';if(matchMedia('(max-width:760px)').matches)selectPane('history');controls();
 try{
  stream.setEnabled($('livePreview').checked);try{await stream.begin(job.id);}catch{status('生成完成后可播放和下载。');}
  await save(job);const ref=request.mode==='base'?await referenceAudio($('reference').files[0]):null;
  if(job.cancelled){await finish(job,'cancelled');return;}
  job.posted=true;worker.postMessage({type:'generate',id:job.id,...request,ref:ref?.buffer||null},ref?[ref.buffer]:[]);
 }catch(error){stream.stop();status(error.message,true);await finish(job,'error',error.message);}
}
$('loadModel').onclick=loadModel;$('generate').onclick=generate;
$('cancelLoad').onclick=()=>{worker?.postMessage({type:'cancel-load'});$('modelState').textContent='正在取消…';clearTimeout(loadTimer);loadTimer=setTimeout(()=>{terminate();$('modelState').textContent='已取消加载';$('modelProgress').hidden=true;controls();},1500);};
$('stop').onclick=()=>{if(!active||active.cancelled)return;active.cancelled=true;stream.stop();if(active.posted)worker.postMessage({type:'stop',id:active.id});updateRecord(active);$('generateStatus').textContent='正在停止…';controls();};
$('mode').onchange=()=>{terminate();$('modelState').textContent='模型未加载';$('modelProgress').hidden=true;modeFields();status('');controls();};
$('quality').onchange=$('mode').onchange;
$('xVectorOnly').onchange=()=>{$('refTextField').hidden=$('xVectorOnly').checked;};
let referenceUrl;
$('reference').onchange=()=>{if(referenceUrl)URL.revokeObjectURL(referenceUrl);const file=$('reference').files[0];$('referenceName').textContent=file?.name||'选择音频';$('referencePreview').hidden=!file;if(file){referenceUrl=URL.createObjectURL(file);$('referencePreview').src=referenceUrl;}else $('referencePreview').removeAttribute('src');};
$('livePreview').onchange=()=>stream.setEnabled($('livePreview').checked);
$('text').oninput=()=>{$('charCount').textContent=Array.from($('text').value).length.toLocaleString()+' 字';};
$('resetConfig').onclick=()=>{Object.entries(DEFAULTS).forEach(([k,v])=>$(k).value=v);$('language').value='chinese';$('speaker').value='serena';$('instruction').value='';};
$('clearHistory').onclick=async()=>{if(!records.size||!confirm('清空全部生成记录？'))return;for(const r of [...records.values()])await removeRecord(r);};
$('clearModel').onclick=async()=>{if(active||loading||!confirm('清除全部模型缓存？生成记录会保留。'))return;terminate();try{const root=await navigator.storage.getDirectory();try{await root.removeEntry('qwen3-tts-1.7b',{recursive:true});}catch(e){if(e.name!=='NotFoundError')throw e;}await purgeOldModel();$('modelState').textContent='缓存已清除';modeFields();status('');}catch(error){status('清除失败：'+error.message,true);}controls();};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&!e.isComposing){e.preventDefault();void generate();}});
const fill=(id,items)=>$(id).replaceChildren(...items.map(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;return option;}));
fill('language',LANGUAGES);fill('speaker',SPEAKERS);$('language').value='chinese';$('speaker').value='serena';if(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent))$('quality').value='lite';modeFields();
async function restore(){try{const saved=await audioHistory.read();for(const r of saved.sort((a,b)=>b.createdAt-a.createdAt)){if(r.state==='generating'){r.state='error';r.error='上次生成已中断，可重新生成。';}records.set(r.id,r);mountRecord(r,false);}}catch{status('无法读取本地生成记录。',true);}finally{restoring=false;controls();}}
window.addEventListener('pagehide',()=>{disposed=true;stream.stop();terminate();for(const r of records.values())if(r.url)URL.revokeObjectURL(r.url);});
window.addEventListener('pageshow',event=>{if(event.persisted){disposed=false;if(active)void finish(active,'error','生成已中断，可重新生成。');$('modelState').textContent='模型未加载';for(const r of records.values()){r.url=null;updateRecord(r);}controls();}});
void restore();
