(() => {
 'use strict';
 const $ = id => document.getElementById(id);if(window.self!==window.top)document.querySelector('.back-link')?.remove();
 const canvas = $('previewCanvas');
 const ctx = canvas.getContext('2d', {alpha:false, desynchronized:true});
 const playback = $('playbackVideo');
 const root = document.querySelector('.recorder-app');
 const settingsKey = 'pocket-recorder-settings-v2';
  const states = ['systemAudio','microphone','pushToTalk','cameraEnabled','cameraMirror','cameraBlur','showCursor','clickHighlight','cursorOverlay','cursorBounce','frameBlur','frameShadow'];
  const fields = ['sourceMode','micDevice','cameraDevice','cameraShape','cameraSize','resolution','frameRate','videoFormat','countdown','autoStop','annotationColor','annotationSize','cursorSize','cursorStyle','cursorSmoothing','frameBackground','videoQuality','frameColor','frameColor2','framePadding','frameRadius','playbackSpeed','playbackVolume'];
  const state = {sourceMode:'screen',active:false,starting:false,paused:false,playback:false,exporting:false,selected:null,previewUrl:null,previewBlob:null,sourceStream:null,sourceVideo:null,cameraStream:null,microphoneStream:null,audioContext:null,recorder:null,session:null,queue:Promise.resolve(),sequence:0,recordedBytes:0,startedAt:0,elapsed:0,lastStart:0,timer:null,autoTimer:null,failed:false,releaseLock:null,frameRequest:0,renderScheduled:false,annotations:[],tool:'none',drawing:null,camera:{x:.83,y:.78},draggingCamera:false,spotlight:false,spotlightPoint:{x:.5,y:.5},pointerPoint:{x:.5,y:.5},pointerTarget:{x:.5,y:.5},ripples:[],textPoint:null,playbackEpoch:0,editorAudio:null,editorSource:null};
 Object.assign(state,{mixer:null,composition:null,captureTrack:null,renderTimer:0,drawHandle:0,nextFrameAt:0,captureEpoch:0,deviceRevisions:{microphone:0,camera:0},pttActive:false,stopAtMs:0,recordingSettings:null});
 const deferredSettings=['resolution','videoFormat','videoQuality','countdown'];
 const sourceVideo = document.createElement('video');
 const cameraVideo = document.createElement('video');
 for (const video of [sourceVideo,cameraVideo]) { video.muted=true; video.playsInline=true; video.autoplay=true; video.style.display='none'; document.body.append(video); }
 const formatTime = value => { const total=Math.max(0,Math.floor((Number(value)||0)/1000)); const h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60; return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); };
 const fileSize = value => value>=1073741824 ? (value/1073741824).toFixed(2)+' GB' : value>=1048576 ? (value/1048576).toFixed(1)+' MB' : Math.max(1,Math.round(value/1024))+' KB';
   function status(message, tone='') { $('recordStatus').textContent=message; $('recordingState').textContent=tone==='error'?'需要处理':state.active?(state.paused?'已暂停':'录制中'):'准备就绪'; $('recordStatus').dataset.tone=tone; }
  function updateRecordMetrics(){const elapsed=state.elapsed+(state.active&&!state.paused?Date.now()-state.lastStart:0),seconds=Math.max(.1,elapsed/1000),rate=state.recordedBytes/seconds;$('recordDetails').textContent=state.active?fileSize(state.recordedBytes)+' · '+fileSize(rate)+'/s · '+$('frameRate').value+' fps':'本地处理，不上传文件';}
 function readSettings(){try{return JSON.parse(localStorage.getItem(settingsKey))||{};}catch{return {};}}
 function saveSettings(){const data={sourceMode:state.sourceMode};for(const id of states)data[id]=$(id)?.checked;for(const id of fields)if(!['sourceMode'].includes(id))data[id]=$(id)?.value;try{localStorage.setItem(settingsKey,JSON.stringify(data));}catch{}updatePresentation();}
 function restoreSettings(){const data=readSettings();if(data.sourceMode==='camera'||data.sourceMode==='screen')state.sourceMode=data.sourceMode;for(const id of states)if(typeof data[id]==='boolean'&&$(id))$(id).checked=data[id];for(const id of fields){const el=$(id);if(!el||id==='sourceMode'||typeof data[id]!=='string')continue;if(el.tagName!=='SELECT'||[...el.options].some(o=>o.value===data[id]))el.value=data[id];}updatePresentation();}
 function setSourceMode(mode, announce=true){if(state.active||state.starting||state.playback)return;state.sourceMode=mode;document.querySelectorAll('#sourceMode button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===mode)));$('cameraEnabled').disabled=mode==='camera';if(mode==='camera'){state.tool='none';if(announce)status('摄像头模式');}else if(announce)status('屏幕模式');updatePresentation();saveSettings();setInactiveControls();}
 function updatePresentation(){
  const cameraMode=state.sourceMode==='camera';
  $('cameraSettings').hidden=!$('cameraEnabled').checked&&!cameraMode;
  $('micDeviceField').hidden=!$('microphone').checked;
  const current=state.active?`${canvas.width} × ${canvas.height}`:($('resolution').selectedOptions[0]?.textContent||'原始');
  $('canvasInfo').textContent=current+' · '+$('frameRate').value+' fps';
  $('sourceLabel').textContent=state.playback?'录制回放':state.sourceStream?(cameraMode?'摄像头':'屏幕共享'):'等待共享';
  $('annotationSizeLabel').textContent=$('annotationSize').value+' px';
  $('settingsLive').hidden=!state.active;
  for(const id of deferredSettings){const el=$(id),field=el.closest('label');let badge=field.querySelector('.setting-deferred');
   if(!badge){badge=document.createElement('small');badge.className='setting-deferred';badge.textContent='下次生效';field.querySelector('span')?.append(badge);}
   badge.hidden=!state.active;el.title=state.active?'下次录制生效':'';
  }
 }
 function setInactiveControls(){
  const busy=state.active||state.starting||state.exporting;
  const screenAvailable=Boolean(navigator.mediaDevices?.getDisplayMedia),cameraAvailable=Boolean(navigator.mediaDevices?.getUserMedia);
  for(const el of document.querySelectorAll('.controls-panel input,.controls-panel select'))el.disabled=state.exporting||state.playback||state.starting;
  for(const el of document.querySelectorAll('#sourceMode button')){el.disabled=busy||state.playback||(el.dataset.value==='screen'&&!screenAvailable)||(el.dataset.value==='camera'&&!cameraAvailable);el.setAttribute('aria-pressed',String(el.dataset.value===state.sourceMode));}
  $('cameraEnabled').disabled=state.starting||state.exporting||state.playback||state.sourceMode==='camera';
  $('systemAudio').disabled=state.starting||state.exporting||state.playback||state.sourceMode==='camera';
  $('showCursor').disabled=state.starting||state.exporting||state.playback||state.sourceMode==='camera';
  $('startRecord').disabled=busy||state.playback;$('pauseRecord').disabled=!state.active;$('stopRecord').disabled=!state.active;
  $('pauseRecord').querySelector('span').textContent=state.paused?'继续':'暂停';$('pauseRecord').setAttribute('aria-label',state.paused?'继续录制':'暂停录制');
  $('stopRecord').setAttribute('aria-label','结束录制');$('pauseRecord').querySelector('use').setAttribute('href',state.paused?'#i-play':'#i-pause');
  for(const b of document.querySelectorAll('.tool-button'))b.disabled=!state.sourceStream||state.playback||state.starting;
  $('importProject').disabled=busy;$('projectFile').disabled=busy;
  $('downloadRecord').disabled=!state.previewBlob||state.active;$('exportTrim').disabled=!state.previewBlob||state.exporting;
  $('exportGif').disabled=!state.previewBlob||state.exporting;$('deleteRecord').disabled=!state.selected||busy;
  $('recordName').disabled=!state.selected||state.exporting;root.dataset.recording=String(state.active);updatePresentation();
 }
 function enableMobilePanel(panel){document.querySelectorAll('.side-panel').forEach(item=>item.classList.toggle('mobile-open',item===panel));$('mobileBackdrop').classList.toggle('open',Boolean(panel));}
 function closeMobilePanels(){enableMobilePanel(null);}
 $('openSettings').onclick=()=>enableMobilePanel($('controlsPanel'));$('openLibrary').onclick=()=>enableMobilePanel($('libraryPanel'));$('mobileBackdrop').onclick=closeMobilePanels;document.querySelectorAll('[data-close-panel]').forEach(button=>button.onclick=closeMobilePanels);
 document.querySelectorAll('#sourceMode button').forEach(button=>button.onclick=()=>setSourceMode(button.dataset.value));
 function chooseMime(preferred='auto') { const groups={mp4:['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=h264,aac','video/mp4'],webm:['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm;codecs=h264,opus','video/webm']};const candidates=preferred==='auto'?[...groups.mp4,...groups.webm]:[...(groups[preferred]||[]),...groups.webm,...groups.mp4];return candidates.find(type=>globalThis.MediaRecorder&&MediaRecorder.isTypeSupported(type))||''; }
 function outputSize(media) { const selected=$('resolution').value; if(state.sourceMode==='camera'&&selected==='source'){const width=Math.max(1,media.videoWidth||720),height=Math.max(1,media.videoHeight||1280),scale=Math.min(1,1920/Math.max(width,height));return [Math.round(width*scale/2)*2,Math.round(height*scale/2)*2];} const height=selected==='source'?Math.min(2160,media.videoHeight||1080):Number(selected)||1080;const width=state.sourceMode==='camera'?Math.round(height*(media.videoWidth||9)/(media.videoHeight||16)):Math.round(height*16/9);return [Math.max(2,Math.round(width/2)*2),Math.max(2,Math.round(height/2)*2)]; }
 function drawCover(context,media,width,height){const mw=media.videoWidth||width,mh=media.videoHeight||height,scale=Math.max(width/mw,height/mh),sw=width/scale,sh=height/scale,sx=(mw-sw)/2,sy=(mh-sh)/2;context.drawImage(media,sx,sy,sw,sh,0,0,width,height);}
 function drawContain(context,media,width,height) { const mw=media.videoWidth||width,mh=media.videoHeight||height,scale=Math.min(width/mw,height/mh),dw=Math.round(mw*scale),dh=Math.round(mh*scale);const x=Math.round((width-dw)/2),y=Math.round((height-dh)/2);context.drawImage(media,x,y,dw,dh);return {x,y,w:dw,h:dh}; }
 function line(ctx2,a,b,width,color){ctx2.strokeStyle=color;ctx2.lineWidth=width;ctx2.lineCap='round';ctx2.lineJoin='round';ctx2.beginPath();ctx2.moveTo(a.x,a.y);ctx2.lineTo(b.x,b.y);ctx2.stroke();}
 function drawArrow(ctx2,x1,y1,x2,y2,width,color){const angle=Math.atan2(y2-y1,x2-x1),head=Math.max(width*3,12);ctx2.strokeStyle=color;ctx2.fillStyle=color;ctx2.lineWidth=width;ctx2.lineCap='round';ctx2.beginPath();ctx2.moveTo(x1,y1);ctx2.lineTo(x2,y2);ctx2.stroke();ctx2.beginPath();ctx2.moveTo(x2,y2);ctx2.lineTo(x2-head*Math.cos(angle-Math.PI/6),y2-head*Math.sin(angle-Math.PI/6));ctx2.lineTo(x2-head*Math.cos(angle+Math.PI/6),y2-head*Math.sin(angle+Math.PI/6));ctx2.closePath();ctx2.fill();}
 function drawAnnotation(context,item,width,height){const unit=Math.min(width,height),color=item.color||'#ef4444',size=Math.max(2,(item.size||6)*unit/720);context.save();context.strokeStyle=color;context.fillStyle=color;context.lineWidth=size;context.lineCap='round';context.lineJoin='round';if(item.tool==='pen'&&item.points?.length){context.beginPath();item.points.forEach((p,index)=>{const x=p.x*width,y=p.y*height;index?context.lineTo(x,y):context.moveTo(x,y);});context.stroke();}else if(item.tool==='arrow'&&item.start&&item.end){drawArrow(context,item.start.x*width,item.start.y*height,item.end.x*width,item.end.y*height,size,color);}else if(item.tool==='rect'&&item.start&&item.end){const x=Math.min(item.start.x,item.end.x)*width,y=Math.min(item.start.y,item.end.y)*height,w=Math.abs(item.end.x-item.start.x)*width,h=Math.abs(item.end.y-item.start.y)*height;context.strokeRect(x,y,w,h);}else if(item.tool==='text'&&item.start&&item.text){const fontSize=Math.max(14,size*4);context.font='650 '+fontSize+'px "Microsoft YaHei",sans-serif';context.textBaseline='top';context.fillText(item.text,item.start.x*width,item.start.y*height,width*.72);}else if(item.tool==='blur'&&item.start&&item.end){const x=Math.min(item.start.x,item.end.x)*width,y=Math.min(item.start.y,item.end.y)*height,w=Math.abs(item.end.x-item.start.x)*width,h=Math.abs(item.end.y-item.start.y)*height;context.beginPath();context.rect(x,y,w,h);context.clip();context.filter='blur(14px)';if(state.sourceVideo)drawContain(context,state.sourceVideo,width,height);context.filter='none';context.fillStyle='rgba(15,23,42,.28)';context.fillRect(x,y,w,h);}context.restore();}
 function drawSpotlight(context,width,height){if(!state.spotlight)return;const x=state.spotlightPoint.x*width,y=state.spotlightPoint.y*height,r=Math.max(70,Math.min(width,height)*.16);context.save();context.fillStyle='rgba(5,8,18,.55)';context.beginPath();context.rect(0,0,width,height);context.arc(x,y,r,0,Math.PI*2,true);context.fill('evenodd');context.strokeStyle='rgba(255,255,255,.55)';context.lineWidth=2;context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.stroke();context.restore();}
 function drawRipple(context,width,height){const now=performance.now();state.ripples=state.ripples.filter(item=>now-item.start<560);for(const item of state.ripples){const age=(now-item.start)/560,radius=9+age*42;context.save();context.globalAlpha=1-age;context.strokeStyle='#ef4444';context.lineWidth=3;context.beginPath();context.arc(item.x*width,item.y*height,radius,0,Math.PI*2);context.stroke();context.restore();}}
 function drawCamera(context,width,height){if(!state.cameraStream||!cameraVideo.videoWidth)return;const diameter=Math.max(64,Math.min(width*.5,Math.min(width,height)*(Number($('cameraSize').value)/100))),x=state.camera.x*width,y=state.camera.y*height,r=diameter/2;const shape=$('cameraShape').value;context.save();context.shadowColor='rgba(0,0,0,.28)';context.shadowBlur=Math.min(24,diameter*.12);context.beginPath();if(shape==='circle')context.arc(x,y,r,0,Math.PI*2);else if(shape==='rounded')context.roundRect(x-r,y-r,diameter,diameter,diameter*.18);else context.rect(x-r,y-r,diameter,diameter);context.clip();context.fillStyle='#111827';context.fillRect(x-r,y-r,diameter,diameter);if($('cameraBlur').checked)context.filter='blur(2px)';if($('cameraMirror').checked){context.translate(x+r,y-r);context.scale(-1,1);context.drawImage(cameraVideo,0,0,diameter,diameter);}else context.drawImage(cameraVideo,x-r,y-r,diameter,diameter);context.filter='none';context.restore();}
  function drawBackdrop(context,width,height){const mode=$('frameBackground').value||'plain',color=$('frameColor').value||'#0b1020',color2=$('frameColor2').value||'#312e81';context.save();if(mode==='gradient'){const gradient=context.createLinearGradient(0,0,width,height);gradient.addColorStop(0,color);gradient.addColorStop(1,color2);context.fillStyle=gradient;}else context.fillStyle=mode==='solid'?color:'#0b1020';context.fillRect(0,0,width,height);context.restore();}
  function sceneRect(width,height){const padding=Math.round(Math.min(width,height)*Number($('framePadding').value||0)/100);return {x:padding,y:padding,w:Math.max(2,width-padding*2),h:Math.max(2,height-padding*2)};}
  function drawCursor(context,width,height){if(!$('cursorOverlay').checked)return;const point=state.pointerPoint,x=point.x*width,y=point.y*height,size=Math.max(10,Math.min(width,height)*Number($('cursorSize').value||100)/1000),style=$('cursorStyle').value||'arrow',bounce=$('cursorBounce').checked&&state.ripples.some(item=>performance.now()-item.start<420);context.save();context.translate(x,y);context.scale(bounce?1.12:1,bounce?1.12:1);context.fillStyle='#fff';context.strokeStyle='#111827';context.lineWidth=Math.max(1,size*.12);if(style==='dot'){context.beginPath();context.arc(0,0,size*.55,0,Math.PI*2);context.fill();context.stroke();}else if(style==='ring'){context.beginPath();context.arc(0,0,size*.65,0,Math.PI*2);context.stroke();context.beginPath();context.arc(0,0,size*.13,0,Math.PI*2);context.fill();}else{context.beginPath();context.moveTo(-size*.38,-size*.62);context.lineTo(size*.55,size*.2);context.lineTo(size*.08,size*.24);context.lineTo(size*.38,size*.75);context.lineTo(size*.15,size*.86);context.lineTo(-size*.1,size*.31);context.lineTo(-size*.38,size*.52);context.closePath();context.fill();context.stroke();}context.restore();}
  function drawFrame(){if(state.playback||!state.sourceStream||!sourceVideo.videoWidth)return;const now=performance.now(),interval=1000/(Number($('frameRate').value)||30);if(now+.5<state.nextFrameAt){requestDraw();return;}state.nextFrameAt=Math.max(state.nextFrameAt+interval,now);const smoothing=$('cursorSmoothing').value;if(smoothing!=='none'){const factor=smoothing==='strong'?.28:.5;state.pointerPoint.x+=(state.pointerTarget.x-state.pointerPoint.x)*factor;state.pointerPoint.y+=(state.pointerTarget.y-state.pointerPoint.y)*factor;}else state.pointerPoint={...state.pointerTarget};const width=canvas.width,height=canvas.height;drawBackdrop(ctx,width,height);const rect=sceneRect(width,height);ctx.save();if(Number($('frameRadius').value)>0){ctx.beginPath();ctx.roundRect(rect.x,rect.y,rect.w,rect.h,Number($('frameRadius').value));ctx.clip();}ctx.translate(rect.x,rect.y);if($('frameBlur').checked)ctx.filter='blur(10px)';drawContain(ctx,sourceVideo,rect.w,rect.h);ctx.filter='none';ctx.restore();if($('frameShadow').checked){ctx.save();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=Math.max(4,Math.min(width,height)*.012);ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);ctx.restore();}drawSpotlight(ctx,width,height);for(const item of state.annotations)drawAnnotation(ctx,item,width,height);if(state.drawing)drawAnnotation(ctx,state.drawing,width,height);drawCamera(ctx,width,height);drawRipple(ctx,width,height);drawCursor(ctx,width,height);if(state.captureTrack?.requestFrame)state.captureTrack.requestFrame();if(state.ripples.length||Math.abs(state.pointerTarget.x-state.pointerPoint.x)+Math.abs(state.pointerTarget.y-state.pointerPoint.y)>.001)requestDraw();}
 function requestDraw(){
  if(state.renderScheduled||state.playback||!state.sourceStream)return;
  state.renderScheduled=true;
  const render=()=>{state.renderScheduled=false;state.renderTimer=state.drawHandle=0;drawFrame();};
  const delay=Math.max(0,state.nextFrameAt-performance.now());
  if(document.hidden)state.renderTimer=setTimeout(render,delay);
  else if(delay>1)state.renderTimer=setTimeout(()=>{state.renderTimer=0;state.drawHandle=requestAnimationFrame(render);},delay);
  else state.drawHandle=requestAnimationFrame(render);
 }
 function watchFrames(){
  if(!state.sourceStream)return;
  if(sourceVideo.requestVideoFrameCallback)state.frameRequest=sourceVideo.requestVideoFrameCallback(()=>{drawFrame();watchFrames();});
  else state.frameRequest=setTimeout(()=>{drawFrame();watchFrames();},1000/(Number($('frameRate').value)||30));
 }
 function fitCanvas(){const shell=$('canvasShell').getBoundingClientRect(),ratio=canvas.width/canvas.height;if(!shell.width||!shell.height)return;const shellRatio=shell.width/shell.height;if(shellRatio>ratio){canvas.style.width=Math.round(shell.height*ratio)+'px';canvas.style.height='100%';}else{canvas.style.width='100%';canvas.style.height=Math.round(shell.width/ratio)+'px';}}
 new ResizeObserver(fitCanvas).observe($('canvasShell'));
 function pointerPoint(event){const rect=canvas.getBoundingClientRect(),boxWidth=rect.width,boxHeight=rect.height,scale=Math.min(boxWidth/canvas.width,boxHeight/canvas.height),drawWidth=canvas.width*scale,drawHeight=canvas.height*scale,offsetX=(boxWidth-drawWidth)/2,offsetY=(boxHeight-drawHeight)/2;return {x:Math.max(0,Math.min(1,(event.clientX-rect.left-offsetX)/drawWidth)),y:Math.max(0,Math.min(1,(event.clientY-rect.top-offsetY)/drawHeight))};}
 function cameraHit(point){if(!state.cameraStream||state.sourceMode==='camera')return false;const width=canvas.width,height=canvas.height,diameter=Math.min(width,height)*(Number($('cameraSize').value)/100),r=diameter/2,dx=point.x*width-state.camera.x*width,dy=point.y*height-state.camera.y*height;return dx*dx+dy*dy<=r*r;}
 canvas.addEventListener('pointerdown',event=>{if(!state.sourceStream||state.playback)return;canvas.setPointerCapture(event.pointerId);const point=pointerPoint(event);if(cameraHit(point)&&!state.spotlight){state.draggingCamera=true;return;}state.spotlightPoint=point;if(state.tool==='none'){if($('clickHighlight').checked){state.ripples.push({...point,start:performance.now()});requestDraw();}requestDraw();return;}if(state.tool==='text'){openTextEditor(point,event);return;}const item={tool:state.tool,start:point,end:point,points:[point],color:$('annotationColor').value,size:Number($('annotationSize').value),text:$('annotationText').value.trim()};state.drawing=item;requestDraw();});
  canvas.addEventListener('pointermove',event=>{if(!state.sourceStream)return;const point=pointerPoint(event);state.pointerTarget=point;if($('cursorSmoothing').value==='none')state.pointerPoint=point;if(state.draggingCamera){state.camera.x=point.x;state.camera.y=point.y;requestDraw();return;}if(state.spotlight){state.spotlightPoint=point;requestDraw();return;}if(!state.drawing){requestDraw();return;}if(state.drawing.tool==='pen')state.drawing.points.push(point);else state.drawing.end=point;requestDraw();});
 function finishDrawing(){if(!state.drawing)return;const item=state.drawing;state.drawing=null;if(item.tool==='pen'&&item.points.length<2)item.points.push({x:item.points[0].x+.001,y:item.points[0].y+.001});state.annotations.push(item);if(state.annotations.length>80)state.annotations.shift();requestDraw();}
 canvas.addEventListener('pointerup',()=>{if(state.draggingCamera){state.draggingCamera=false;return;}finishDrawing();});canvas.addEventListener('pointercancel',()=>{state.draggingCamera=false;finishDrawing();});
 function setTool(tool){state.tool=tool;document.querySelectorAll('[data-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tool===tool)));if(tool!=='text')closeTextEditor();}
 document.querySelectorAll('[data-tool]').forEach(button=>button.onclick=()=>setTool(button.dataset.tool));
 $('spotlightToggle').onclick=()=>{state.spotlight=!state.spotlight;$('spotlightToggle').setAttribute('aria-pressed',String(state.spotlight));if(!state.spotlight)requestDraw();};
 $('undoAnnotation').onclick=()=>{state.annotations.pop();requestDraw();};
 function openTextEditor(point,event){event?.preventDefault();state.textPoint=point;const shell=$('canvasShell').getBoundingClientRect(),canvasRect=canvas.getBoundingClientRect(),scale=Math.min(canvasRect.width/canvas.width,canvasRect.height/canvas.height),drawWidth=canvas.width*scale,drawHeight=canvas.height*scale,offsetX=(canvasRect.width-drawWidth)/2,offsetY=(canvasRect.height-drawHeight)/2,left=Math.max(10,Math.min(shell.width-290,point.x*drawWidth+offsetX+canvasRect.left-shell.left-8)),top=Math.max(10,Math.min(shell.height-50,point.y*drawHeight+offsetY+canvasRect.top-shell.top-8)),editor=$('textEditor');editor.style.left=left+'px';editor.style.top=top+'px';editor.hidden=false;$('annotationText').value='';requestAnimationFrame(()=>$('annotationText').focus());}
 function closeTextEditor(){state.textPoint=null;$('textEditor').hidden=true;$('annotationText').value='';}
 $('textEditor').onsubmit=event=>{event.preventDefault();const text=$('annotationText').value.trim();if(!text||!state.textPoint){status('请输入文字','error');$('annotationText').focus();return;}state.annotations.push({tool:'text',start:state.textPoint,end:state.textPoint,points:[state.textPoint],color:$('annotationColor').value,size:Number($('annotationSize').value),text});closeTextEditor();requestDraw();};
 $('cancelText').onclick=closeTextEditor;$('annotationText').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeTextEditor();}});

 function setStarting(value){state.starting=value;$('startRecord').querySelector('span').textContent=value?'准备中':'开始录制';setInactiveControls();}
 async function playStream(video,stream){video.srcObject=stream;await video.play().catch(()=>{});if(video.readyState<1)await new Promise(resolve=>{const done=()=>{cleanup();resolve();},cleanup=()=>{video.removeEventListener('loadedmetadata',done);clearTimeout(timeout);},timeout=setTimeout(done,3500);video.addEventListener('loadedmetadata',done,{once:true});});}
 async function acquireLock(){if(!navigator.locks)return true;let signal;const result=new Promise(resolve=>signal=resolve);navigator.locks.request('toolbox-screen-recorder',{ifAvailable:true},async lock=>{if(!lock){signal(false);return;}await new Promise(resolve=>{state.releaseLock=resolve;signal(true);});}).catch(()=>signal(false));return result;}
 async function requestSource(){
  const fps=Number($('frameRate').value);
  if(state.sourceMode==='camera'){
   if(!navigator.mediaDevices?.getUserMedia)throw Error('当前浏览器不支持摄像头录制');
   const device=$('cameraDevice').value;
   return navigator.mediaDevices.getUserMedia({video:{deviceId:device?{exact:device}:undefined,width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:fps,max:60},facingMode:device?undefined:'user'},audio:false});
  }
  if(!navigator.mediaDevices?.getDisplayMedia)throw Error('当前设备不支持屏幕共享，请切换到摄像头模式');
  return navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:fps,max:60},cursor:$('showCursor').checked?'always':'never'},audio:$('systemAudio').checked,systemAudio:'include',monitorTypeSurfaces:'include',selfBrowserSurface:'include',surfaceSwitching:'include'});
 }
 async function requestCamera(){
  if(!$('cameraEnabled').checked||state.sourceMode==='camera')return null;
  const selected=$('cameraDevice').value;
  return navigator.mediaDevices.getUserMedia({video:{deviceId:selected?{exact:selected}:undefined,width:{ideal:1280},height:{ideal:720},frameRate:{ideal:Math.min(30,Number($('frameRate').value)),max:30},facingMode:selected?undefined:'user'},audio:false});
 }
 async function requestMicrophone(){
  if(!$('microphone').checked)return null;
  const selected=$('micDevice').value;
  return navigator.mediaDevices.getUserMedia({audio:{deviceId:selected?{exact:selected}:undefined,echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
 }
 async function setupAudio(displayStream,micStream){
  const mixer=new RecorderAudioMixer(level=>{
   $('micMeter').firstElementChild.style.transform='scaleX('+level.toFixed(3)+')';
   $('micMeter').setAttribute('aria-valuenow',String(Math.round(level*100)));
  });
  state.mixer=mixer;state.audioContext=mixer.context;await mixer.resume();
  mixer.connect('system',state.sourceMode==='screen'?displayStream:null);mixer.connect('microphone',micStream);updateAudioState();
  return {context:mixer.context,destination:mixer.destination,tracks:mixer.destination.stream.getAudioTracks()};
 }
 function updateAudioState(){
  state.mixer?.mute('system',!$('systemAudio').checked);
  const enabled=$('microphone').checked&&(!$('pushToTalk').checked||state.pttActive);
  state.microphoneStream?.getAudioTracks().forEach(track=>{track.enabled=enabled;});state.mixer?.mute('microphone',!enabled);
 }
 async function waitCountdown(seconds){const overlay=$('countdownOverlay'),strong=overlay.querySelector('strong');if(!seconds)return;overlay.hidden=false;for(let value=seconds;value>0;value--){strong.textContent=String(value);await new Promise(resolve=>setTimeout(resolve,1000));}overlay.hidden=true;}
 async function beginRecording(){
  if(state.active||state.starting||state.playback)return;
  if(!window.MediaRecorder){status('当前浏览器不支持录制','error');return;}
  let sourcePromise;try{sourcePromise=requestSource();}catch(error){status(error.message,'error');return;}
  setStarting(true);closeMobilePanels();status('选择要录制的画面…');
  try{
   state.captureEpoch++;state.nextFrameAt=0;state.sourceStream=await sourcePromise;state.sourceVideo=sourceVideo;await playStream(sourceVideo,state.sourceStream);
   await RecordStore.db();if(!await acquireLock())throw Error('另一个标签页正在录制');
   const estimate=await navigator.storage?.estimate();if(estimate?.quota&&estimate.quota-estimate.usage<20*1024*1024)throw Error('可用存储不足 20 MB');
   try{state.cameraStream=state.sourceMode==='screen'?await requestCamera():null;if(state.cameraStream)await playStream(cameraVideo,state.cameraStream);}catch{$('cameraEnabled').checked=false;status('摄像头未授权，继续录制','error');}
   try{state.microphoneStream=await requestMicrophone();}catch{$('microphone').checked=false;status('麦克风未授权，继续录制','error');}
   const audio=await setupAudio(state.sourceStream,state.microphoneStream);
   const [width,height]=outputSize(sourceVideo);canvas.width=width;canvas.height=height;fitCanvas();
   state.annotations=[];state.ripples=[];state.spotlightPoint={x:.5,y:.5};$('stageEmpty').hidden=true;canvas.hidden=false;playback.hidden=true
   watchSourceEnd(state.sourceStream);
   drawFrame();watchFrames();
   const capture=canvas.captureStream(0);state.captureTrack=capture.getVideoTracks()[0];if(!state.captureTrack?.requestFrame){capture.getTracks().forEach(track=>track.stop());state.captureTrack=canvas.captureStream(Number($('frameRate').value)).getVideoTracks()[0];}const composition=state.composition=new MediaStream([state.captureTrack,...audio.tracks]);state.recordingSettings=Object.fromEntries(deferredSettings.map(id=>[id,$(id).value]));
   const mime=chooseMime($('videoFormat').value);if(!mime)throw Error('浏览器没有可用的视频编码格式');
   const qualityFactor={size:.055,balanced:.11,quality:.18}[$('videoQuality').value]||.11;
   const videoBitsPerSecond=Math.max(2500000,Math.min(40000000,Math.round(width*height*Number($('frameRate').value)*qualityFactor)));
   const recorder=state.recorder=new MediaRecorder(composition,{mimeType:mime,videoBitsPerSecond,audioBitsPerSecond:128000});
   state.session=crypto.randomUUID();state.sequence=0;state.queue=Promise.resolve();state.failed=false;state.recordedBytes=0;state.elapsed=0;state.paused=false
   await RecordStore.create({id:state.session,started:Date.now(),mime,width,height,name:'教程录制 '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}),source:state.sourceMode});
   const id=state.session;recorder.ondataavailable=event=>{if(!event.data.size)return;state.recordedBytes+=event.data.size;updateRecordMetrics();const index=state.sequence++;state.queue=state.queue.then(()=>RecordStore.append(id,index,event.data)).catch(error=>{state.failed=true;status(error.name==='QuotaExceededError'?'浏览器存储已满':'暂存写入失败','error');if(state.recorder?.state!=='inactive')state.recorder.stop();});};
   recorder.onstop=finalizeRecording;recorder.onerror=()=>{state.failed=true;if(state.recorder?.state!=='inactive')state.recorder.stop();};
   await waitCountdown(Number($('countdown').value));if(!state.sourceStream.active)throw Error('共享已结束');
   state.active=true;state.startedAt=state.lastStart=Date.now();state.recorder.start(1000);rememberSettings();watchCameraFrames();setStarting(false);setInactiveControls();tickClock();state.timer=setInterval(tickClock,250);updateAutoStop();state.captureTrack?.requestFrame?.();populateDevices();status($('showCursor').checked?'录制中 · 含系统光标':'录制中');refreshLibrary();requestDraw();globalThis.recordToolUse?.('recorder');
  }catch(error){state.active=false;cleanupCapture();if(state.session)await RecordStore.remove(state.session).catch(()=>{});state.session=null;state.recorder=null;setStarting(false);restoreStageEmpty();status(error.name==='NotAllowedError'?'已取消共享或权限未授予':error.message||'无法开始录制','error');}
 }
 function elapsedTime(){return state.elapsed+(state.active&&!state.paused&&state.lastStart?Date.now()-state.lastStart:0);}
 function updateAutoStop(){state.stopAtMs=Math.max(0,Number($('autoStop').value)||0)*60000;checkAutoStop();}
 function checkAutoStop(){if(state.active&&!state.paused&&state.stopAtMs&&elapsedTime()>=state.stopAtMs)stopRecording();}
 function tickClock(){$('clock').querySelector('span').textContent=formatTime(elapsedTime());updateRecordMetrics();checkAutoStop();}
 function stopRecording(){
  if(!state.active)return;
  if(!state.paused&&state.lastStart)state.elapsed+=Date.now()-state.lastStart;
  state.lastStart=0;state.active=false;state.pttActive=false;updateAudioState();
  try{if(state.recorder?.state==='recording')state.recorder.requestData();state.recorder.stop();}catch{}
  tickClock();controlsAfterStop();
 }
 function controlsAfterStop(){setStarting(true);status('正在保存…');}
 async function finalizeRecording(){if(state.active&&!state.paused&&state.lastStart)state.elapsed+=Date.now()-state.lastStart;state.active=false;state.lastStart=0;setStarting(true);status(state.failed?'正在整理已保存片段…':'正在保存…',state.failed?'error':'');try{await state.queue;await RecordStore.finish(state.session,state.failed?'error':'complete',state.elapsed);}catch{state.failed=true;}const saved=state.session;cleanupCapture();state.recorder=null;state.session=null;setStarting(false);restoreStageEmpty();await refreshLibrary();if(saved){try{await selectRecording(saved);}catch{}}status(state.failed?'部分片段已保存':'录制已保存',state.failed?'error':'');}
 function pauseRecording(){if(!state.active)return;if(!state.paused){state.elapsed+=Date.now()-state.lastStart;state.lastStart=0;state.recorder.pause();state.paused=true;status('已暂停');}else{state.lastStart=Date.now();state.recorder.resume();state.paused=false;status('录制中');}setInactiveControls();tickClock();}
 function stopTracks(stream){stream?.getTracks().forEach(track=>track.stop());}
 function cleanupCapture(){
  state.captureEpoch++;state.deviceRevisions.microphone++;state.deviceRevisions.camera++;state.deviceRevisions.system=(state.deviceRevisions.system||0)+1;
  clearInterval(state.timer);clearTimeout(state.autoTimer);state.timer=state.autoTimer=null;
  if(state.frameRequest){if(sourceVideo.cancelVideoFrameCallback)sourceVideo.cancelVideoFrameCallback(state.frameRequest);else clearTimeout(state.frameRequest);}
  cancelCameraFrames();
  clearTimeout(state.renderTimer);cancelAnimationFrame(state.drawHandle);state.renderTimer=state.drawHandle=state.frameRequest=0;state.renderScheduled=false;
  stopTracks(state.sourceStream);stopTracks(state.microphoneStream);stopTracks(state.cameraStream);stopTracks(state.composition);
  state.mixer?.close();state.mixer=null;state.audioContext=null;state.composition=state.captureTrack=null;
  state.sourceStream=state.microphoneStream=state.cameraStream=null;sourceVideo.srcObject=cameraVideo.srcObject=null;
  state.pttActive=false;state.stopAtMs=0;state.recordingSettings=null;state.releaseLock?.();state.releaseLock=null;
  document.querySelectorAll('.setting-pending[aria-busy="true"]').forEach(el=>{el.classList.remove('setting-pending');el.removeAttribute('aria-busy');});
  $('micMeter').firstElementChild.style.transform='scaleX(0)';$('micMeter').setAttribute('aria-valuenow','0');
 }
 function restoreStageEmpty(){canvas.hidden=false;playback.hidden=true;$('closePlayback').hidden=true;if(!state.sourceStream&&!state.previewBlob){$('stageEmpty').hidden=false;$('sourceLabel').textContent='等待共享';}setInactiveControls();}
 $('startRecord').onclick=beginRecording;$('pauseRecord').onclick=pauseRecording;$('stopRecord').onclick=stopRecording;
 function togglePtt(active){state.pttActive=active;updateAudioState();}
 function watchSourceEnd(stream){stream.getVideoTracks()[0]?.addEventListener('ended',()=>{if(state.sourceStream===stream&&state.active)stopRecording();},{once:true});}
 function cancelCameraFrames(){if(state.cameraFrameRequest){if(cameraVideo.cancelVideoFrameCallback)cameraVideo.cancelVideoFrameCallback(state.cameraFrameRequest);else clearTimeout(state.cameraFrameRequest);}state.cameraFrameRequest=0;}
 function watchCameraFrames(){cancelCameraFrames();if(!state.cameraStream||!state.active)return;const draw=()=>{state.cameraFrameRequest=0;requestDraw();watchCameraFrames();};state.cameraFrameRequest=cameraVideo.requestVideoFrameCallback?cameraVideo.requestVideoFrameCallback(draw):setTimeout(draw,1000/Math.min(30,Number($('frameRate').value)||30));}
 const appliedSettings={};
 function rememberSettings(){for(const id of [...states,...fields]){const el=$(id);if(el)appliedSettings[id]=el.type==='checkbox'?el.checked:el.value;}}
 function rememberSetting(id){const el=$(id);if(el)appliedSettings[id]=el.type==='checkbox'?el.checked:el.value;}
 function restoreSetting(id){const el=$(id);if(el?.type==='checkbox')el.checked=Boolean(appliedSettings[id]);else if(el)el.value=appliedSettings[id]??'';}
 async function warmStream(stream){const video=document.createElement('video');video.muted=true;video.playsInline=true;try{await playStream(video,stream);if(!video.videoWidth)throw Error('设备未返回画面');}finally{video.pause();video.srcObject=null;}}
 async function changeLiveDevice(kind,changedId){
  const revision=++state.deviceRevisions[kind],epoch=state.captureEpoch;
  const current=()=>state.active&&state.captureEpoch===epoch&&state.deviceRevisions[kind]===revision;
  const settingIds=kind==='microphone'?['microphone','micDevice']:['cameraEnabled','cameraDevice'];
  for(const id of settingIds){$(id).classList.remove('setting-pending');$(id).removeAttribute('aria-busy');}
  const el=$(changedId);el.classList.add('setting-pending');el.setAttribute('aria-busy','true');
  const microphone=kind==='microphone',cameraSource=!microphone&&state.sourceMode==='camera';
   const previous=microphone?state.microphoneStream:cameraSource?state.sourceStream:state.cameraStream;
   let next,assigned=false;
  try{
   if(microphone&&!$('microphone').checked){state.mixer.connect('microphone',null);state.microphoneStream=null;stopTracks(previous);updateAudioState();}
   else if(!microphone&&!cameraSource&&!$('cameraEnabled').checked){cancelCameraFrames();state.cameraStream=null;cameraVideo.srcObject=null;stopTracks(previous);requestDraw();}
   else{
    next=await(microphone?requestMicrophone():cameraSource?requestSource():requestCamera());
    if(!current()){stopTracks(next);return;}
    if(!microphone){await warmStream(next);if(!current()){stopTracks(next);return;}}
    if(microphone){state.mixer.connect('microphone',next);state.microphoneStream=next;assigned=true;updateAudioState();}
    else if(cameraSource){state.sourceStream=next;sourceVideo.srcObject=next;assigned=true;sourceVideo.play().catch(()=>{});watchSourceEnd(next);}
    else{state.cameraStream=next;cameraVideo.srcObject=next;assigned=true;cameraVideo.play().catch(()=>{});watchCameraFrames();}
    stopTracks(previous);populateDevices();requestDraw();
   }
   for(const id of microphone?['microphone','micDevice']:['cameraEnabled','cameraDevice']){const node=$(id);appliedSettings[id]=node.type==='checkbox'?node.checked:node.value;}
  }catch(error){
   if(assigned){
    if(microphone){state.microphoneStream=previous;state.mixer?.connect('microphone',previous);}
    else if(cameraSource){state.sourceStream=previous;sourceVideo.srcObject=previous||null;await sourceVideo.play().catch(()=>{});}
    else{state.cameraStream=previous;cameraVideo.srcObject=previous||null;await cameraVideo.play().catch(()=>{});}
   }
   if(next&&next!==previous)stopTracks(next);
   if(current()){restoreSetting(changedId);if(microphone)$('microphone').checked=Boolean(previous?.active);else if(!cameraSource)$('cameraEnabled').checked=Boolean(previous?.active);status(microphone?'麦克风切换失败，已保留原设置':'摄像头切换失败，已保留原设置','error');}
  }finally{
   if(state.deviceRevisions[kind]===revision){el.classList.remove('setting-pending');el.removeAttribute('aria-busy');saveSettings();requestDraw();}
  }
 }
 async function changeSystemAudio(){
  updateAudioState();
  if(!$('systemAudio').checked||state.sourceStream?.getAudioTracks().some(track=>track.readyState==='live'))return;
  // A display source without an audio track needs a new explicit browser grant.
  const epoch=state.captureEpoch,revision=state.deviceRevisions.system=(state.deviceRevisions.system||0)+1;
  let next;
  status('请重新选择画面并勾选共享音频');
  try{
   next=await requestSource();
   if(!state.active||epoch!==state.captureEpoch||revision!==state.deviceRevisions.system||!$('systemAudio').checked){stopTracks(next);return;}
   if(!next.getAudioTracks().length)throw Error('未选择共享音频');
   await warmStream(next);
   if(!state.active||epoch!==state.captureEpoch||revision!==state.deviceRevisions.system||!$('systemAudio').checked){stopTracks(next);return;}
   const previous=state.sourceStream;state.mixer.connect('system',next);state.sourceStream=next;sourceVideo.srcObject=next;
   sourceVideo.play().catch(()=>{});
   watchSourceEnd(next);stopTracks(previous);updateAudioState();requestDraw();status('共享音频已开启');
  }catch(error){stopTracks(next);if(state.active&&epoch===state.captureEpoch&&revision===state.deviceRevisions.system){$('systemAudio').checked=false;updateAudioState();rememberSetting('systemAudio');status('未开启共享音频，录制继续','error');}}
  saveSettings();
 }
 let constraintRevision=0,constraintQueue=Promise.resolve();
 function applyCaptureConstraints(){
  const revision=++constraintRevision,stream=state.sourceStream,epoch=state.captureEpoch;
  constraintQueue=constraintQueue.catch(()=>{}).then(async()=>{
   if(revision!==constraintRevision||epoch!==state.captureEpoch||!state.active)return;
   const track=stream?.getVideoTracks()[0];if(!track?.applyConstraints)return;
   const constraints={frameRate:{ideal:Number($('frameRate').value),max:60}};
   if(state.sourceMode==='screen')constraints.cursor=$('showCursor').checked?'always':'never';
   try{await track.applyConstraints(constraints);}catch{if(state.active&&epoch===state.captureEpoch)status('采集设备不支持此参数，保留画面帧率控制','error');}
   if(state.captureTrack&&!state.captureTrack.requestFrame)await state.captureTrack.applyConstraints({frameRate:Number($('frameRate').value)}).catch(()=>{});
  });
 }
 async function handleSettingChange(id){
  saveSettings();requestDraw();
  if(!state.active){rememberSettings();return;}
  if(id==='microphone'||id==='micDevice'){await changeLiveDevice('microphone',id);return;}
  if(id==='cameraEnabled'||id==='cameraDevice'){await changeLiveDevice('camera',id);return;}
  if(id==='systemAudio'){await changeSystemAudio();return;}
  if(id==='pushToTalk'){state.pttActive=false;updateAudioState();}
  if(id==='frameRate'||id==='showCursor'){state.nextFrameAt=0;applyCaptureConstraints();}
   if(id==='autoStop')updateAutoStop();
  if(deferredSettings.includes(id))status('已保存，下次录制生效');
   rememberSetting(id);
 }
 document.addEventListener('keydown',event=>{const editing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;if(event.code==='Space'&&!editing&&$('pushToTalk').checked&&state.active){event.preventDefault();togglePtt(true);return;}if(event.altKey){const key=event.key.toLowerCase();if(key==='p'){event.preventDefault();pauseRecording();}else if(key==='s'){event.preventDefault();stopRecording();}else if(key==='z'){event.preventDefault();state.annotations.pop();requestDraw();}}if(event.key==='Escape')closeMobilePanels();});
 document.addEventListener('keyup',event=>{if(event.code==='Space'&&$('pushToTalk').checked)togglePtt(false);});
 async function populateDevices(){if(!navigator.mediaDevices?.enumerateDevices)return;try{const devices=await navigator.mediaDevices.enumerateDevices(),set=(element,kind,label)=>{const selected=element.value;const first=element.querySelector('option');element.replaceChildren(first);for(const device of devices.filter(item=>item.kind===kind)){const option=document.createElement('option');option.value=device.deviceId;option.textContent=device.label||label+' '+(element.options.length);element.append(option);}if([...element.options].some(option=>option.value===selected))element.value=selected;};set($('micDevice'),'audioinput','麦克风');set($('cameraDevice'),'videoinput','摄像头');}catch{}}
 async function updateStorage(){try{const estimate=await navigator.storage?.estimate();$('storageText').textContent=estimate?fileSize(estimate.usage||0):'不可用';}catch{$('storageText').textContent='不可用';}}
 async function refreshLibrary(){try{const list=await RecordStore.list();$('libraryCount').textContent=String(list.length);$('openLibrary').setAttribute('aria-label','本机作品，'+list.length);$('recordList').replaceChildren();if(!list.length){const empty=document.createElement('p');empty.className='empty-records';empty.textContent='暂无录制';$('recordList').append(empty);}for(const item of list){const button=document.createElement('button');button.type='button';button.className='record-entry';button.setAttribute('aria-pressed',String(item.id===state.selected));button.innerHTML='<span class="record-thumb"><svg><use href="#i-screen"></use></svg></span><span class="record-copy"><strong></strong><small></small></span><time></time>';button.querySelector('strong').textContent=item.name||('录制 '+new Date(item.started).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}));button.querySelector('small').textContent=fileSize(item.bytes||0)+' · '+formatTime(item.duration||0)+(item.status==='error'?' · 部分':'') ;button.querySelector('time').textContent=new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(item.started));button.onclick=()=>selectRecording(item.id).catch(error=>status(error.message,'error'));$('recordList').append(button);}await updateStorage();}catch(error){status(error.message,'error');}}
 async function selectRecording(id){if(state.active||state.starting||state.exporting)return;const epoch=++state.playbackEpoch;try{const blob=await RecordStore.blob(id);if(epoch!==state.playbackEpoch)return;closePlayback(false);state.selected=id;state.previewBlob=blob;state.previewUrl=URL.createObjectURL(blob);state.playback=true;playback.src=state.previewUrl;playback.hidden=false;canvas.hidden=true;$('stageEmpty').hidden=true;$('closePlayback').hidden=false;state.sourceVideo=playback;$('sourceLabel').textContent='录制回放';const metadata=(await RecordStore.list()).find(item=>item.id===id);$('recordName').value=metadata?.name||'教程录制';$('editorCard').hidden=false;playback.playbackRate=Number($('playbackSpeed').value)||1;playback.volume=Number($('playbackVolume').value)||1;setInactiveControls();await new Promise(resolve=>{if(playback.readyState>=1)resolve();else playback.addEventListener('loadedmetadata',resolve,{once:true});});const duration=Number.isFinite(playback.duration)?playback.duration:Math.max(0,Number(metadata?.duration)||0)/1000;$('trimStart').max=String(duration);$('trimEnd').max=String(duration);$('trimStart').value='0';$('trimEnd').value=String(duration);updateTrimLabels();$('downloadRecord').disabled=!blob.size;await refreshLibrary();}catch(error){status('无法打开录制：'+error.message,'error');}}
 function closePlayback(refresh=true){state.playbackEpoch++;playback.pause();playback.removeAttribute('src');playback.load();if(state.previewUrl)URL.revokeObjectURL(state.previewUrl);state.previewUrl=null;state.previewBlob=null;state.selected=null;state.playback=false;state.sourceVideo=null;playback.hidden=true;canvas.hidden=false;$('editorCard').hidden=true;$('closePlayback').hidden=true;$('stageEmpty').hidden=false;setInactiveControls();if(refresh)refreshLibrary();}
 $('closePlayback').onclick=()=>closePlayback();
 function updateTrimLabels(){const start=Number($('trimStart').value),end=Math.max(start+.1,Number($('trimEnd').value));$('trimStartLabel').textContent=formatTime(start*1000);$('trimEndLabel').textContent=formatTime(end*1000);if(state.playback&&Math.abs(playback.currentTime-start)>.3)playback.currentTime=start;}
 $('trimStart').oninput=()=>{if(Number($('trimStart').value)>=Number($('trimEnd').value))$('trimStart').value=String(Math.max(0,Number($('trimEnd').value)-.1));updateTrimLabels();};$('trimEnd').oninput=()=>{if(Number($('trimEnd').value)<=Number($('trimStart').value))$('trimEnd').value=String(Math.min(Number($('trimEnd').max),Number($('trimStart').value)+.1));updateTrimLabels();};
 async function seekPlayback(time){playback.currentTime=time;await new Promise(resolve=>{const done=()=>{cleanup();resolve();},cleanup=()=>{playback.removeEventListener('seeked',done);clearTimeout(timeout);},timeout=setTimeout(done,2500);playback.addEventListener('seeked',done,{once:true});});}
 function downloadBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
 function exportFileName(extension){const name=($('recordName').value||'屏幕录制').replace(/[\/:*?"<>|]+/g,'-').trim();return (name||'屏幕录制')+'-'+new Date().toISOString().slice(0,16).replaceAll(':','-')+'.'+extension;}
 $('downloadRecord').onclick=()=>{if(!state.previewBlob)return;downloadBlob(state.previewBlob,exportFileName(state.previewBlob.type.includes('mp4')?'mp4':'webm'));};
 $('recordName').onchange=async()=>{if(!state.selected)return;try{await RecordStore.rename(state.selected,$('recordName').value.trim().slice(0,80));await refreshLibrary();}catch(error){status(error.message,'error');}};
 $('playbackSpeed').onchange=()=>{if(state.playback)playback.playbackRate=Number($('playbackSpeed').value)||1;saveSettings();};$('playbackVolume').oninput=()=>{playback.volume=Number($('playbackVolume').value)||0;saveSettings();};$('pictureInPicture').onclick=async()=>{try{if(document.pictureInPictureElement)await document.exitPictureInPicture();else if(playback.requestPictureInPicture)await playback.requestPictureInPicture();else status('当前浏览器不支持画中画','error');}catch(error){status('无法打开画中画：'+error.message,'error');}};
 function currentProject(){const settings={};for(const id of states)settings[id]=$(id)?.checked;for(const id of fields)settings[id]=id==='sourceMode'?state.sourceMode:$(id)?.value;return {schema:1,app:'pocket-recorder',version:2,created:new Date().toISOString(),settings,recording:state.selected?{id:state.selected,name:$('recordName').value}:null,annotations:state.annotations.slice(-80)};}
 $('exportProject').onclick=()=>{downloadBlob(new Blob([JSON.stringify(currentProject(),null,2)],{type:'application/json'}),exportFileName('recordly'));status('项目已保存');};$('importProject').onclick=()=>$('projectFile').click();$('projectFile').onchange=async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;try{const data=JSON.parse(await file.text());if(data?.app!=='pocket-recorder'||data.schema!==1)throw Error('项目文件格式不支持');const settings=data.settings||{};for(const id of states)if(typeof settings[id]==='boolean'&&$(id))$(id).checked=settings[id];for(const id of fields){const el=$(id);if(!el||settings[id]===undefined)continue;if(el.tagName==='SELECT'&&[...el.options].some(option=>option.value===settings[id]))el.value=settings[id];else if(el.type==='range'||el.type==='color'||el.type==='text')el.value=settings[id];}state.sourceMode=settings.sourceMode==='camera'?'camera':'screen';updatePresentation();saveSettings();rememberSettings();setInactiveControls();if(Array.isArray(data.annotations))state.annotations=data.annotations.filter(item=>item&&typeof item.tool==='string').slice(-80);requestDraw();status('项目已打开');}catch(error){status('项目打开失败：'+error.message,'error');}};
 function editorAudio(){if(!state.editorAudio){const AudioCtor=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AudioCtor)throw Error('当前浏览器不支持音频导出');const context=new AudioCtor();const source=context.createMediaElementSource(playback);source.connect(context.destination);state.editorAudio=context;state.editorSource=source;}return {context:state.editorAudio,source:state.editorSource};}
 async function exportTrim(){if(!state.previewBlob||state.exporting)return;const start=Number($('trimStart').value),end=Number($('trimEnd').value);if(end<=start+.1)return;state.exporting=true;setInactiveControls();status('正在裁剪导出…');let recorder,audioTrack,audioDestination;try{const sourceWidth=playback.videoWidth||1920,sourceHeight=playback.videoHeight||1080,requestedHeight=Math.min(sourceHeight,Number($('resolution').value)||sourceHeight),ratio=$('cropPreset').value,targetHeight=ratio==='original'?requestedHeight:ratio==='9:16'?Math.round(requestedHeight*16/9):requestedHeight,targetWidth=ratio==='original'?Math.round(sourceWidth*(targetHeight/sourceHeight)/2)*2:ratio==='16:9'?Math.round(targetHeight*16/9/2)*2:ratio==='9:16'?Math.round(targetHeight*9/16/2)*2:Math.round(targetHeight/2)*2;const work=document.createElement('canvas');work.width=targetWidth;work.height=targetHeight;const workCtx=work.getContext('2d',{alpha:false});const mixed=editorAudio();await mixed.context.resume();const destination=audioDestination=mixed.context.createMediaStreamDestination();if($('trimAudio').checked){mixed.source.connect(destination);audioTrack=destination.stream.getAudioTracks()[0];}const stream=new MediaStream([...work.captureStream(Number($('frameRate').value)).getVideoTracks(),...(audioTrack?[audioTrack]:[])]);const mime=chooseMime($('videoFormat').value);const chunks=[];const qualityFactor={size:.055,balanced:.11,quality:.18}[$('videoQuality').value]||.11;recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.max(2500000,Math.min(40000000,Math.round(targetWidth*targetHeight*Number($('frameRate').value)*qualityFactor)))});recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};await seekPlayback(start);let stopped=false;const finished=new Promise((resolve,reject)=>{recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));recorder.onerror=()=>reject(recorder.error);});recorder.start(1000);await playback.play();const draw=()=>{workCtx.fillStyle='#0b1020';workCtx.fillRect(0,0,targetWidth,targetHeight);if($('cropPreset').value==='original')drawContain(workCtx,playback,targetWidth,targetHeight);else drawCover(workCtx,playback,targetWidth,targetHeight);status('正在裁剪 '+formatTime(playback.currentTime*1000)+' / '+formatTime(end*1000));if(playback.currentTime>=end&&!stopped){stopped=true;playback.pause();recorder.stop();return;}if(playback.requestVideoFrameCallback)playback.requestVideoFrameCallback(draw);else requestAnimationFrame(draw);};draw();const blob=await finished;downloadBlob(blob,exportFileName(blob.type.includes('mp4')?'mp4':'webm'));status('裁剪导出完成');}catch(error){status('裁剪导出失败：'+error.message,'error');}finally{try{if(recorder?.state!=='inactive')recorder.stop();}catch{}try{if(audioDestination)state.editorSource.disconnect(audioDestination);}catch{}audioTrack?.stop();state.exporting=false;setInactiveControls();playback.currentTime=Number($('trimStart').value);}}
 $('exportTrim').onclick=exportTrim;
 async function loadGifLibrary(){if(globalThis.GIF)return;await new Promise((resolve,reject)=>{const existing=document.getElementById('gifLibrary');if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(Error('GIF 编码器加载失败')),{once:true});return;}const script=document.createElement('script');script.id='gifLibrary';script.src='vendor/gif.js?v=20261119a';script.onload=resolve;script.onerror=()=>reject(Error('GIF 编码器加载失败'));document.head.append(script);});if(!globalThis.GIF)throw Error('GIF 编码器不可用');}
 async function exportGif(){if(!state.previewBlob||state.exporting)return;const start=Number($('trimStart').value),end=Number($('trimEnd').value),duration=end-start;if(duration<=.1)return;state.exporting=true;setInactiveControls();status('准备 GIF…');try{await loadGifLibrary();const crop=$('cropPreset').value,baseWidth=playback.videoWidth||640,baseHeight=playback.videoHeight||360,maxHeight=Number($('gifSize').value)||640,scale=Math.min(1,maxHeight/baseHeight),width=Math.max(2,Math.round((crop==='original'?baseWidth:baseHeight*(crop==='16:9'?16/9:crop==='9:16'?9/16:1))*scale/2)*2),height=Math.max(2,Math.round(baseHeight*scale/2)*2),work=document.createElement('canvas'),workCtx=work.getContext('2d',{alpha:false});work.width=width;work.height=height;const fps=Number($('gifFrameRate').value)||6,maxFrames=Math.min(900,Math.ceil(duration*fps)),interval=duration/maxFrames;const gif=new GIF({workers:2,workerScript:new URL('vendor/gif.worker.js?v=20261119a',location.href).href,quality:10,width,height,repeat:$('gifLoop').checked?0:-1});for(let frame=0;frame<maxFrames;frame++){await seekPlayback(start+frame*interval);workCtx.fillStyle='#0b1020';workCtx.fillRect(0,0,width,height);if(crop==='original')drawContain(workCtx,playback,width,height);else drawCover(workCtx,playback,width,height);gif.addFrame(workCtx,{copy:true,delay:1000/fps});status('生成 GIF '+Math.round((frame+1)/maxFrames*50)+'%');}const finished=new Promise((resolve,reject)=>{gif.on('finished',resolve);gif.on('abort',()=>reject(Error('已取消')));gif.on('progress',value=>status('编码 GIF '+Math.round(50+value*50)+'%'));});gif.render();const blob=await finished;downloadBlob(blob,exportFileName('gif'));status('GIF 导出完成');}catch(error){status('GIF 导出失败：'+error.message,'error');}finally{state.exporting=false;setInactiveControls();playback.currentTime=Number($('trimStart').value);}}
 $('exportGif').onclick=exportGif;
 $('deleteRecord').onclick=()=>{if(state.selected&&!state.exporting)$('deleteDialog').showModal();};$('deleteDialog').onclose=async()=>{if($('deleteDialog').returnValue!=='delete'||!state.selected)return;try{const id=state.selected;closePlayback(false);await RecordStore.remove(id);await refreshLibrary();status('已删除');}catch(error){status(error.message,'error');}};
 $('persistStorage').onclick=async()=>{try{const ok=await navigator.storage?.persist?.();$('persistStorage').textContent=ok?'已持久化':'暂不可用';}catch{$('persistStorage').textContent='暂不可用';}};
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('canvasShell').requestFullscreen();}catch{status('当前设备不支持全屏','error');}};
 for(const id of [...states,...fields].filter(id=>id!=='sourceMode'&&id!=='playbackSpeed'&&id!=='playbackVolume')){
  const el=$(id);if(!el)continue;
  el.addEventListener('change',()=>handleSettingChange(id));
  if(['cameraSize','annotationSize','cursorSize','framePadding','frameRadius','annotationColor','frameColor','frameColor2'].includes(id))el.addEventListener('input',()=>{updatePresentation();requestDraw();});
 }
 window.addEventListener('blur',()=>togglePtt(false));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)togglePtt(false);});
 window.addEventListener('beforeunload',event=>{if(state.active){try{state.recorder.requestData();}catch{}event.preventDefault();event.returnValue='';}});window.addEventListener('pagehide',()=>{try{if(state.active){if(state.recorder?.state==='recording')state.recorder.requestData();state.recorder?.stop();}}catch{}cleanupCapture();if(state.editorAudio)state.editorAudio.close().catch(()=>{});});
 restoreSettings();rememberSettings();if(!navigator.mediaDevices?.getDisplayMedia&&innerWidth<820)state.sourceMode='camera';setSourceMode(state.sourceMode,false);setInactiveControls();populateDevices();refreshLibrary();status('就绪');
})();
