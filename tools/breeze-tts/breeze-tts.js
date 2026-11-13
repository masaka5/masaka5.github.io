import {StreamingPlayer} from './breeze-stream.mjs?v=20261114-stream2';
import {pcm16,wavBlob} from './breeze-audio.mjs?v=20261114-stream2';
import {VOICES,voiceSettings} from './breeze-voices.mjs?v=20261114-stream2';
import {audioHistory} from './breeze-history.mjs?v=20261114-stream2';

const $=id=>document.getElementById(id),MODEL_FILE='breeze-tts-2-q4_k.gguf',MODEL_SIZE=2538909376;
const MODEL_URL='https://huggingface.co/HoppouAI/Breeze-TTS-2.cpp/resolve/main/'+MODEL_FILE+'?download=true';
const stream=new StreamingPlayer(),records=new Map();
let worker=null,ready=false,loading=false,active=null,restoring=true,disposed=false,selectedTab='edit';
const status=(text,error=false)=>{$('pageStatus').textContent=text;$('pageStatus').dataset.error=String(error);};
function controls(){
 $('generate').disabled=!ready||!!active||restoring;
 $('loadModel').disabled=loading||ready||!!active;
 $('clearModel').disabled=loading||!!active;
 $('stop').hidden=!active;$('stop').disabled=!!active?.cancelled;
 $('reference').disabled=!!active;$('refText').disabled=!!active;
 $('clearHistory').disabled=!records.size||restoring;
}
function modelState(state,text){$('modelStatus').dataset.state=state;$('modelState').textContent=text;}
function recordState(record){
 const elapsed=record.samples?(record.samples/record.rate).toFixed(1)+' 秒':'';
 if(record.state==='generating')return [record.cancelled?'正在停止':record.part?`生成中 · ${record.part}/${record.total} 段`:'准备生成',elapsed].filter(Boolean).join(' · ');
 return [({complete:'已完成',cancelled:'已停止',error:'未完成'})[record.state]||'未完成',elapsed].filter(Boolean).join(' · ');
}
function updateRecord(record){
 const element=$('generationList').querySelector(`[data-id="${record.id}"]`);if(!element)return;
 element.dataset.state=record.state;element.querySelector('.record-state').textContent=recordState(record);
 const progress=element.querySelector('progress');progress.hidden=record.state!=='generating';
 if(record.total){progress.max=record.total;progress.value=Math.max(0,record.part-1);}else progress.removeAttribute('value');
 const audio=element.querySelector('audio');
 if(record.blob&&!record.url)record.url=URL.createObjectURL(record.blob);
 if(record.url&&audio.getAttribute('src')!==record.url)audio.src=record.url;
 audio.hidden=!record.blob;element.querySelector('.record-download').disabled=!record.blob;
 element.querySelector('.record-error').textContent=record.error||'';
}
function mountRecord(record,prepend=true){
 const element=document.createElement('article');element.className='generation-item';element.dataset.id=record.id;
 element.innerHTML='<div class="record-heading"><span class="record-voice"></span><span class="record-time"></span><button class="text-button record-delete" type="button" aria-label="删除记录">删除</button></div><p class="record-text"></p><div class="record-status"><span class="record-state" role="status"></span><button class="text-button record-download" type="button" disabled>下载 WAV</button></div><progress hidden></progress><audio controls preload="none" hidden></audio><p class="record-error"></p>';
 element.querySelector('.record-text').textContent=record.text;
 element.querySelector('.record-voice').textContent=record.voiceName;
 element.querySelector('.record-time').textContent=new Date(record.createdAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
 element.querySelector('.record-download').onclick=()=>downloadRecord(record);
 element.querySelector('.record-delete').onclick=()=>void removeRecord(record);
 element.querySelector('audio').onplay=()=>{stream.stop();pauseRecordAudio(element.querySelector('audio'));};
 if(prepend)$('generationList').prepend(element);else $('generationList').append(element);
 updateRecord(record);updateCount();
}
function updateCount(){
 $('recordCount').textContent=String(records.size);$('mobileRecordCount').textContent=records.size?` ${records.size}`:'';
 $('historyEmpty').hidden=records.size>0;controls();
}
function pauseRecordAudio(except=null){document.querySelectorAll('.generation-item audio').forEach(audio=>{if(audio!==except)audio.pause();});}
function downloadRecord(record){
 if(!record.blob)return;const a=document.createElement('a'),url=URL.createObjectURL(record.blob);
 a.href=url;a.download=`${record.voiceName}-${new Date(record.createdAt).toISOString().replace(/[:.]/g,'-')}.wav`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function stored(record){return Object.fromEntries(['id','text','voiceName','createdAt','state','samples','rate','blob','error'].map(key=>[key,record[key]]));}
async function saveRecord(record){
 if(record.deleted||disposed)return;
 try{await audioHistory.save(stored(record));if(record.deleted)await audioHistory.remove(record.id);}
 catch{status('记录暂未保存，请先下载音频。',true);}
}
async function removeRecord(record){
 record.deleted=true;records.delete(record.id);
 const element=$('generationList').querySelector(`[data-id="${record.id}"]`);element?.querySelector('audio')?.pause();element?.remove();
 if(record.url)URL.revokeObjectURL(record.url);updateCount();
 try{await audioHistory.remove(record.id);}catch{status('未能删除浏览器记录，请重试。',true);}
}
async function finishJob(job,state,error=''){
 if(active!==job)return;
 job.state=state;job.error=error;
 if(job.samples)job.blob=wavBlob(job.chunks,job.samples,job.rate);job.chunks=[];
 active=null;$('generateStatus').textContent=recordState(job);updateRecord(job);controls();
 await saveRecord(job);
}
function terminateWorker(){worker?.terminate();worker=null;ready=false;loading=false;}
function makeWorker(){
 const instance=new Worker('./breeze-tts-worker.js?v=20261114-stream2',{type:'module'});worker=instance;
 instance.onmessage=({data})=>{
  if(worker!==instance)return;
  if(data.type==='progress'){$('modelProgress').style.width=`${Math.round(data.value*100)}%`;$('modelDetail').textContent=data.detail;return;}
  if(data.type==='model-ready'){loading=false;ready=true;modelState('ready','已就绪');$('modelProgress').style.width='100%';$('readyState').textContent='WebGPU · 本地生成';status('');controls();return;}
  const job=active;
  if(data.type==='error'){
   if(data.id&&job?.id!==data.id)return;
   if(data.fatal!==false){terminateWorker();modelState('error','加载模型后可重试');$('readyState').textContent='模型未就绪';stream.stop();}
   const message=data.error||'模型运行失败';status(message,true);if(job)void finishJob(job,'error',message);controls();return;
  }
  if(!job||data.id!==job.id)return;
  if(data.type==='segment'){job.part=data.part;job.total=data.total;updateRecord(job);$('generateStatus').textContent=recordState(job);}
  if(data.type==='audio'&&!job.cancelled){
   const chunk=new Float32Array(data.samples);job.rate=data.rate||24000;job.chunks.push(pcm16(chunk));job.samples+=chunk.length;
   try{stream.append(job.id,chunk,job.rate);}catch{status('试听暂不可用，生成完成后仍可播放和下载。',true);}
   updateRecord(job);$('generateStatus').textContent=recordState(job);
  }
  if(data.type==='done'||data.type==='cancelled'){
   if(!job.samples&&!job.cancelled){void finishJob(job,'error','模型未生成音频，请重试。');return;}
   void finishJob(job,job.cancelled||data.type==='cancelled'?'cancelled':'complete');
  }
 };
 instance.onerror=event=>{if(worker!==instance)return;terminateWorker();stream.stop();modelState('error','运行时异常，可重新加载');const message=event.message||'WASM 运行时加载失败';status(message,true);if(active)void finishJob(active,'error',message);controls();};
 return instance;
}
async function loadModel(){
 if(loading||ready||active)return;loading=true;modelState('loading','准备模型…');status('');controls();
 try{if(!navigator.gpu)throw Error('当前浏览器不支持 WebGPU，请使用新版 Chrome 或 Edge。');await navigator.storage?.persist?.();makeWorker().postMessage({type:'load',url:MODEL_URL,size:MODEL_SIZE});}
 catch(error){terminateWorker();modelState('error','模型未加载');status(error.message,true);controls();}
}
async function decodeReference(file){
 if(!file)return null;
 const context=new AudioContext({sampleRate:24000});
 try{const decoded=await context.decodeAudioData(await file.arrayBuffer());
  const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*24000),24000),source=offline.createBufferSource();
  source.buffer=decoded;source.connect(offline.destination);source.start();return (await offline.startRendering()).getChannelData(0);
 }finally{await context.close();}
}
async function generate(){
 if(!ready||active||restoring)return;
 const text=$('text').value.trim(),refFile=$('reference').files[0],refText=$('refText').value.trim();
 if(!text){status('请输入要朗读的文字。',true);return;}
 if(refFile&&!refText){status('请填写参考音频中的文字。',true);return;}
 const voiceId=$('voicePreset').value,settings=voiceSettings(voiceId,$('language').value,$('instruction').value);
 const job={id:crypto.randomUUID(),text,voiceName:refFile?'参考音色':VOICES.find(v=>v.id===voiceId)?.name||'自定义',createdAt:Date.now(),state:'generating',samples:0,rate:24000,chunks:[],blob:null,error:'',cancelled:false,posted:false,deleted:false};
 active=job;records.set(job.id,job);mountRecord(job);status('');$('generateStatus').textContent='准备生成';pauseRecordAudio();controls();
 try{
  // Unlock playback in the original click gesture, before decoding or storage.
  stream.setEnabled($('livePreview').checked);
  try{await stream.begin(job.id);}catch{status('浏览器暂停了试听，可在完成后播放。',true);}
  await saveRecord(job);const ref=await decodeReference(refFile);
  if(job.cancelled){await finishJob(job,'cancelled');return;}
  job.posted=true;worker.postMessage({type:'generate',id:job.id,text,instruction:settings.instruction,seed:settings.seed,refText,ref:ref?.buffer||null},ref?[ref.buffer]:[]);
 }catch(error){stream.stop();await finishJob(job,'error',error.message);status(error.message,true);}
}
$('loadModel').onclick=loadModel;$('generate').onclick=generate;
$('stop').onclick=()=>{
 if(!active||active.cancelled)return;active.cancelled=true;stream.stop();
 if(active.posted)worker.postMessage({type:'stop',id:active.id});
 updateRecord(active);$('generateStatus').textContent='正在停止…';controls();
};
$('livePreview').onchange=()=>stream.setEnabled($('livePreview').checked);
$('clearModel').onclick=async()=>{
 if(active||loading||!confirm('清除模型缓存？生成记录会保留。'))return;
 terminateWorker();stream.stop();controls();
 try{const root=await navigator.storage.getDirectory();try{await root.removeEntry(MODEL_FILE);}catch(error){if(error.name!=='NotFoundError')throw error;}
  modelState('idle','缓存已清除');$('modelProgress').style.width='0';$('modelDetail').textContent='';$('readyState').textContent='加载模型后可开始';status('');
 }catch(error){status('缓存清除失败：'+error.message,true);}controls();
};
$('clearHistory').onclick=async()=>{if(!records.size||!confirm('删除全部生成记录？'))return;for(const record of [...records.values()])await removeRecord(record);};
function selectTab(tab){selectedTab=tab;document.querySelector('.breeze-main').dataset.tab=tab;$('editTab').setAttribute('aria-selected',String(tab==='edit'));$('historyTab').setAttribute('aria-selected',String(tab==='history'));}
$('editTab').onclick=()=>selectTab('edit');$('historyTab').onclick=()=>selectTab('history');
$('voicePreset').replaceChildren(...[...VOICES.map(v=>({id:v.id,name:v.name+' · '+v.label})),{id:'custom',name:'自定义'}].map(v=>{const option=document.createElement('option');option.value=v.id;option.textContent=v.name;return option;}));
async function restore(){
 try{const saved=await audioHistory.read();
  for(const record of saved.sort((a,b)=>b.createdAt-a.createdAt)){
   if(record.state==='generating'){record.state='error';record.error='上次生成已中断，可重新生成。';}
   records.set(record.id,record);mountRecord(record,false);
  }
 }catch{status('无法读取本地生成记录。',true);}finally{restoring=false;controls();}
}
window.addEventListener('pagehide',()=>{disposed=true;stream.stop();terminateWorker();for(const record of records.values())if(record.url)URL.revokeObjectURL(record.url);});
window.addEventListener('pageshow',event=>{if(event.persisted){disposed=false;modelState('idle','模型未加载');for(const record of records.values()){record.url=null;updateRecord(record);}controls();}});
selectTab(selectedTab);void restore();
