(() => {
 const $=id=>document.getElementById(id);let recorder=null,display=null,microphone=null,mix=null,current=null,selected=null,previewUrl=null,previewBlob=null,queue=Promise.resolve(),sequence=0,started=0,timer=null,failed=false,starting=false,releaseLock=null,elapsed=0,lastStart=0,selectionEpoch=0;
 const status=(message,error=false)=>Ops.status($('recordStatus'),message,error),size=bytes=>(bytes/1024/1024).toFixed(1)+' MB';
 const active=()=>recorder&&recorder.state!=='inactive';
 function controls(){const busy=active()||starting;for(const id of ['recordQuality','systemAudio','microphoneAudio','startRecord'])$(id).disabled=busy;$('pauseRecord').disabled=!active();$('stopRecord').disabled=!active();$('deleteRecord').disabled=busy||!selected;$('downloadRecord').disabled=busy||!previewBlob;}
 function cleanup(){display?.getTracks().forEach(t=>t.stop());microphone?.getTracks().forEach(t=>t.stop());display=microphone=null;mix?.close().catch(()=>{});mix=null;clearInterval(timer);releaseLock?.();releaseLock=null;}
 async function storage(){try{const e=await navigator.storage?.estimate();$('storageInfo').textContent=e?`本站已用 ${size(e.usage||0)} · 可用约 ${size(Math.max(0,(e.quota||0)-(e.usage||0)))}`:'浏览器未提供容量信息';}catch(_){$('storageInfo').textContent='无法读取存储容量';}}
 function formatTime(ms){const s=Math.floor(ms/1000);return Math.floor(s/60).toString().padStart(2,'0')+':'+(s%60).toString().padStart(2,'0');}
 function tick(){const ms=elapsed+(recorder?.state==='recording'?Date.now()-lastStart:0);$('recordClock').textContent=formatTime(ms);}
 function revoke(){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;previewBlob=null;}
 async function refresh(){try{const list=await RecordStore.list();$('recordList').replaceChildren();for(const item of list){const b=Ops.node('button','record-entry');b.setAttribute('aria-pressed',String(selected===item.id));b.append(Ops.node('strong','',new Date(item.started).toLocaleString('zh-CN')),Ops.node('span','',`${size(item.bytes)} · ${item.status==='complete'?'已完成':item.status==='error'?'存储中断':'未结束／已暂存'} · ${item.chunks} 段`));b.onclick=()=>select(item.id);$('recordList').append(b);}if(!list.length)$('recordList').append(Ops.node('p','inline-note','暂无录制'));await storage();}catch(error){status(error.message,true);}}
 async function select(id){if(active()||starting){status('请先结束当前录制，再查看历史。');return;}const token=++selectionEpoch;try{const blob=await RecordStore.blob(id);if(token!==selectionEpoch)return;revoke();selected=id;previewBlob=blob;previewUrl=URL.createObjectURL(blob);$('recordVideo').srcObject=null;$('recordVideo').muted=false;$('recordVideo').src=previewUrl;$('recordVideo').controls=true;$('recordPlaceholder').hidden=!!blob.size;$('previewTitle').textContent='录制回放';$('recordDetails').textContent=`已暂存 ${size(blob.size)} · 可预览及下载${blob.size?'':' · 录制尚无数据'}`;controls();$('downloadRecord').disabled=!blob.size;await refresh();}catch(error){status('无法恢复录制：'+error.message,true);}}
 async function acquireLock(){if(!navigator.locks)return true;let signal;const result=new Promise(resolve=>signal=resolve);navigator.locks.request('toolbox-screen-recorder',{ifAvailable:true},async lock=>{if(!lock){signal(false);return;}await new Promise(resolve=>{releaseLock=resolve;signal(true);});}).catch(()=>signal(false));return result;}
 $('startRecord').onclick=async()=>{
  if(starting||active())return;
  if(!navigator.mediaDevices?.getDisplayMedia||!window.MediaRecorder){status('当前浏览器不支持录屏，请在桌面版 Chrome、Edge 或 Firefox 的 HTTPS 页面使用。',true);return;}
  starting=true;controls();let displayPromise;
  // Call in the click event before any awaited storage work, preserving user activation.
  try{displayPromise=navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:30,max:60}},audio:$('systemAudio').checked});}catch(error){starting=false;controls();status('无法打开屏幕选择器。',true);return;}
  try{
   status('选择需要录制的屏幕、窗口或标签页…');display=await displayPromise;
   await RecordStore.db();if(!await acquireLock())throw Error('另一个标签页正在录屏，请先结束那边的录制。');
   const estimate=await navigator.storage?.estimate();if(estimate?.quota&&estimate.quota-estimate.usage<30*1024*1024)throw Error('可用存储不足 30 MB，请下载并删除旧录制后重试。');
   if($('microphoneAudio').checked)microphone=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
   const tracks=[...display.getVideoTracks()],audioTracks=[...display.getAudioTracks(),...(microphone?.getAudioTracks()||[])];
   if(audioTracks.length){mix=new AudioContext();await mix.resume();const dest=mix.createMediaStreamDestination();for(const track of audioTracks)mix.createMediaStreamSource(new MediaStream([track])).connect(dest);tracks.push(...dest.stream.getAudioTracks());}
   const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));if(!mime)throw Error('浏览器未提供兼容的视频格式，无法录屏。');
   recorder=new MediaRecorder(new MediaStream(tracks),{mimeType:mime,videoBitsPerSecond:+$('recordQuality').value});
   current=crypto.randomUUID();selected=current;sequence=0;queue=Promise.resolve();failed=false;elapsed=0;started=lastStart=Date.now();
   await RecordStore.create({id:current,started,mime:recorder.mimeType||mime||'video/webm'});
   const id=current;recorder.ondataavailable=event=>{if(!event.data.size)return;const index=sequence++;queue=queue.then(()=>RecordStore.append(id,index,event.data)).catch(error=>{failed=true;status(error.name==='QuotaExceededError'?'浏览器存储已满，正在停止；此前片段已保留。':'写入暂存失败，已停止；此前片段保留。',true);if(recorder?.state!=='inactive')recorder.stop();});};
   recorder.onstop=async()=>{elapsed+=lastStart?Date.now()-lastStart:0;lastStart=0;starting=true;cleanup();controls();status(failed?'正在整理已保存片段…':'正在保存录制…',failed);try{await queue;await RecordStore.finish(id,failed?'error':'complete',elapsed);}catch(error){failed=true;status('结束信息保存失败，已写入的片段仍可恢复。',true);}finally{recorder=null;current=null;starting=false;controls();await refresh();await select(id);status(failed?'部分片段未保存，请下载已恢复内容。':'录制已保存，可预览或下载。',failed);}};
   recorder.onerror=()=>{failed=true;if(recorder?.state!=='inactive')recorder.stop();};
   display.getVideoTracks()[0].addEventListener('ended',()=>{if(active())recorder.stop();});
   revoke();$('recordVideo').removeAttribute('src');$('recordVideo').srcObject=display;$('recordVideo').muted=true;$('recordVideo').controls=false;$('recordVideo').play().catch(()=>{});$('recordPlaceholder').hidden=true;$('previewTitle').textContent='正在录制';$('recordDetails').textContent='每秒写入浏览器暂存 · 刷新将结束录制';
   recorder.start(1000);starting=false;$('pauseRecord').textContent='暂停';timer=setInterval(()=>{tick();storage();},1000);controls();status('录制中'+($('systemAudio').checked&&!display.getAudioTracks().length?' · 本次共享未提供系统音频':'')+'，可随时暂停。');refresh();
  }catch(error){starting=false;cleanup();recorder=null;controls();status(error.name==='NotAllowedError'?'已取消共享或未获得录制权限。':error.message||'无法开始录屏。',true);}
 };
 $('stopRecord').onclick=()=>{if(active())recorder.stop();};$('pauseRecord').onclick=()=>{if(!active())return;if(recorder.state==='recording'){elapsed+=Date.now()-lastStart;lastStart=0;recorder.pause();$('pauseRecord').textContent='继续';status('已暂停');}else{lastStart=Date.now();recorder.resume();$('pauseRecord').textContent='暂停';status('录制中');}tick();};
 $('downloadRecord').onclick=()=>{if(!previewBlob)return;const a=document.createElement('a');a.href=previewUrl;a.download='录屏-'+new Date().toISOString().replace(/[:.]/g,'-')+(previewBlob.type.includes('mp4')?'.mp4':'.webm');a.click();};
 $('deleteRecord').onclick=()=>{if(selected&&!active())$('deleteDialog').showModal();};$('deleteDialog').onclose=async()=>{if($('deleteDialog').returnValue!=='delete'||!selected||active())return;try{await RecordStore.remove(selected);selected=null;selectionEpoch++;revoke();$('recordVideo').removeAttribute('src');$('recordVideo').load();$('recordPlaceholder').hidden=false;$('recordDetails').textContent='录制已删除';controls();await refresh();status('已删除所选录制，无法恢复。');}catch(error){status('删除失败：'+error.message,true);}};
 $('refreshRecords').onclick=refresh;$('persistStorage').onclick=async()=>{try{const ok=await navigator.storage?.persist?.();status(ok?'浏览器已授予持久存储。':'浏览器未授予持久存储，请及时下载录制。');}catch(_){status('无法申请持久存储，请及时下载。',true);}};
 window.addEventListener('beforeunload',event=>{if(active()){try{recorder.requestData();}catch(_){}event.preventDefault();event.returnValue='';}});
 window.addEventListener('pagehide',()=>{try{if(active()){if(recorder.state==='recording')recorder.requestData();recorder.stop();}}catch(_){} });
 refresh();
})();
