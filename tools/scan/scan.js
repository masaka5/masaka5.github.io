(() => {
 const $=id=>document.getElementById(id),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),decoder=window.ZXingWASM;
 let stream=null,running=false,epoch=0,count=0,seen=new Set(),lastSeen=new Map(),sound=null;
 let decoderReady=null;
 const saved=Ops.readState(),ids=['scanMode','scanSeparator','scanSound','deduplicate'];Ops.restoreFields(saved,ids);
 if(typeof saved.output==='string'&&saved.output.length<=800000)$('scanOutput').value=saved.output;
 count=Number.isSafeInteger(saved.count)&&saved.count>=0?saved.count:0;$('scanCount').textContent=count+' 条';
 function remember(){Ops.saveState({...Ops.readState(),...Ops.fieldValues(ids),output:$('scanOutput').value,count});}
 for(const id of ids){$(id).addEventListener('change',remember);}
 const status=(text,error=false)=>Ops.status($('scanStatus'),text,error);
 const decoderFailure=error=>/abort|wasm|webassembly|fetch/i.test(error?.message||'')?'识别组件加载失败，请重新部署完整工具包。':'识别失败，请调整码面后重试。';
 if(!decoder)status('扫码组件未加载，请重新部署完整工具包。',true);
 async function ensureDecoder(){
  if(!decoder){status('扫码组件未加载，请重新部署完整工具包。',true);return false;}
  const overrides={locateFile:path=>new URL('../../vendor/zxing/'+path,location.href).href};
  try{
   if(!decoderReady){
    decoder.prepareZXingModule({overrides});
    const wasmUrl=new URL('../../vendor/zxing/zxing_reader.wasm',location.href);
    decoderReady=fetch(wasmUrl,{method:'HEAD',cache:'no-cache'}).then(response=>response.ok,()=>false);
   }
   if(await decoderReady)return true;
  }catch(_){}
  decoderReady=null;status('扫码组件未加载，请重新部署完整工具包。',true);return false;
 }
 function stop(){running=false;epoch++;stream?.getTracks().forEach(t=>t.stop());stream=null;$('scanVideo').srcObject=null;$('startScan').disabled=false;$('stopScan').disabled=true;$('scanMode').disabled=false;$('cameraSelect').disabled=false;$('scanPlaceholder').hidden=false;}
 function beep(){if(!$('scanSound').checked)return;try{sound??=new AudioContext();sound.resume();const o=sound.createOscillator(),g=sound.createGain();o.frequency.value=1400;g.gain.value=.04;o.connect(g).connect(sound.destination);o.start();o.stop(sound.currentTime+.07);}catch(_){} }
 function append(text,format='扫码枪'){
  const separators={space:' ',newline:'\n',tab:'\t',none:''};if($('scanOutput').value.length+text.length>1000000){status('结果已满，请先下载或清空。',true);return;}
  $('scanOutput').value+=text+separators[$('scanSeparator').value];$('scanOutput').scrollTop=$('scanOutput').scrollHeight;
  count++;$('scanCount').textContent=count+' 条';const item=Ops.node('p','',`${new Date().toLocaleTimeString('zh-CN')} · ${format} · ${text}`);$('scanHistory').prepend(item);while($('scanHistory').children.length>20)$('scanHistory').lastChild.remove();remember();beep();status('已识别 '+format);
 }
 function accept(results,camera=false){const now=Date.now();const present=new Set();for(const item of results){if(item.error||!item.text)continue;const key=item.format+'\0'+item.text;present.add(key);if(camera&&$('deduplicate').checked&&seen.has(key))continue;if(camera&&!$('deduplicate').checked&&now-(lastSeen.get(key)||0)<1500)continue;append(item.text,item.format);lastSeen.set(key,now);}if(camera){for(const key of seen)if(now-(lastSeen.get(key)||0)>2500&&!present.has(key))seen.delete(key);for(const key of present){seen.add(key);lastSeen.set(key,now);}}}
 async function loop(token){if(!running||token!==epoch)return;const video=$('scanVideo');try{if(video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0){const ratio=Math.min(1,1280/video.videoWidth);canvas.width=Math.round(video.videoWidth*ratio);canvas.height=Math.round(video.videoHeight*ratio);ctx.drawImage(video,0,0,canvas.width,canvas.height);const results=await decoder.readBarcodes(ctx.getImageData(0,0,canvas.width,canvas.height),{formats:[],tryHarder:true,maxNumberOfSymbols:32});if(token===epoch)accept(results,true);}}catch(error){if(token===epoch){stop();status(decoderFailure(error),true);return;}}if(running&&token===epoch)setTimeout(()=>loop(token),180);}
 async function cameras(){const selected=$('cameraSelect').value;let devices=[];try{devices=await navigator.mediaDevices.enumerateDevices();}catch(_){}$('cameraSelect').replaceChildren(Ops.node('option','','后置／默认摄像头'));$('cameraSelect').firstChild.value='';devices.filter(d=>d.kind==='videoinput').forEach((d,i)=>{const o=Ops.node('option','',d.label||'摄像头 '+(i+1));o.value=d.deviceId;$('cameraSelect').append(o);});$('cameraSelect').value=selected;}
 $('startScan').onclick=async()=>{
  if($('scanMode').value==='keyboard'){$('wedgeInput').focus();status('等待扫码枪输入，回车或 Tab 收录。');return;}
  if($('scanMode').value==='image'){$('imageFile').click();return;}
  if(!window.isSecureContext){status('摄像头需要 HTTPS 安全连接。',true);return;}
  if(!(await ensureDecoder()))return;
  if(!navigator.mediaDevices?.getUserMedia){status('当前浏览器不支持摄像头，请在 HTTPS 页面使用 Chrome 或 Edge。',true);return;}
  $('startScan').disabled=true;const token=++epoch;try{
   status('正在启动摄像头…');const device=$('cameraSelect').value;const next=await navigator.mediaDevices.getUserMedia({video:device?{deviceId:{exact:device},width:{ideal:1280}}:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
   if(token!==epoch){next.getTracks().forEach(t=>t.stop());return;}stream=next;$('scanVideo').srcObject=stream;await $('scanVideo').play();await cameras();running=true;seen.clear();lastSeen.clear();$('scanPlaceholder').hidden=true;$('stopScan').disabled=false;$('scanMode').disabled=$('cameraSelect').disabled=true;status('扫描中…');loop(token);
  }catch(error){stop();status(error.name==='NotAllowedError'?'摄像头权限未开启。':error.name==='NotFoundError'?'未找到摄像头。':error.name==='NotReadableError'?'摄像头正被其他应用占用。':error.name==='OverconstrainedError'?'所选摄像头不支持当前参数。':'摄像头无法启动，请检查 HTTPS、权限或设备占用。',true);}
 };
 $('stopScan').onclick=()=>{stop();status('已停止');};$('selectImage').onclick=()=>$('imageFile').click();
 $('imageFile').onchange=async()=>{const files=[...$('imageFile').files];stop();$('selectImage').disabled=true;try{if(!(await ensureDecoder()))return;status('正在识别图片…');let found=0;for(const file of files){if(file.size>30*1024*1024)throw Error('单张图片不能超过 30 MB');const results=await decoder.readBarcodes(file,{formats:[],tryHarder:true,tryRotate:true,tryInvert:true,maxNumberOfSymbols:255});accept(results);found+=results.filter(r=>r.text&&!r.error).length;}status(found?'识别完成，共 '+found+' 个条码。':'未识别到条码，请使用更清晰的原图。');}catch(error){status(error.message==='单张图片不能超过 30 MB'?error.message:decoderFailure(error),true);}finally{$('selectImage').disabled=false;$('imageFile').value='';}};
 $('scanMode').onchange=()=>{stop();const mode=$('scanMode').value;$('wedgeField').hidden=mode!=='keyboard';$('cameraField').hidden=mode!=='camera';$('startScan').textContent=mode==='camera'?'开始扫描':mode==='image'?'选择图片':'准备接收';$('scanFrame').hidden=mode==='keyboard';if(mode==='keyboard')$('wedgeInput').focus();};
 $('wedgeInput').onkeydown=event=>{if(['Enter','Tab'].includes(event.key)&&!event.isComposing){event.preventDefault();const text=$('wedgeInput').value;if(text){append(text);$('wedgeInput').value='';}}};
 $('copyScans').onclick=()=>Ops.copy($('scanOutput').value,$('scanStatus'));$('saveScans').onclick=()=>Ops.save($('scanOutput').value,'扫码结果.txt');$('clearScans').onclick=()=>{$('scanOutput').value='';$('scanHistory').replaceChildren();count=0;seen.clear();lastSeen.clear();$('scanCount').textContent='0 条';status('已清空');};window.addEventListener('pagehide',()=>{stop();sound?.close();});
 $('clearScans').addEventListener('click',remember);$('scanOutput').addEventListener('input',remember);
 if(saved.scanMode)$('scanMode').onchange();
})();
