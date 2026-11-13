const $=id=>document.getElementById(id);
const MODEL_URL='https://huggingface.co/HoppouAI/Breeze-TTS-2.cpp/resolve/main/breeze-tts-2-q4_k.gguf?download=true';
const MODEL_SIZE=2538909376,MODEL_FILE='breeze-tts-2-q4_k.gguf';
let worker=null,loaded=false,loading=false,stopped=false,lastAudio=null;
const status=(text,error=false)=>{ $('pageStatus').textContent=text; $('pageStatus').dataset.error=error?'true':''; };
const setState=(state,text)=>{$('modelStatus').dataset.state=state;$('modelState').textContent=text;};
function makeWorker(){
 worker=new Worker('./breeze-tts-worker.js',{type:'module'});
 worker.onmessage=({data})=>{
  if(data.type==='progress'){$('modelProgress').style.width=`${Math.round(data.value*100)}%`;$('modelDetail').textContent=data.detail||'';return;}
  if(data.type==='model-ready'){loaded=true;loading=false;setState('ready','模型已缓存，可离线使用');$('readyState').textContent='WebGPU 已就绪';$('generate').disabled=false;$('loadModel').disabled=true;$('clearModel').disabled=false;status('');return;}
  if(data.type==='audio'){(window.__breezeChunks??=[]).push(new Float32Array(data.samples));return;}
  if(data.type==='done'){const chunks=window.__breezeChunks||[];const samples=new Float32Array(chunks.reduce((n,a)=>n+a.length,0));let p=0;for(const chunk of chunks){samples.set(chunk,p);p+=chunk.length;}window.__breezeChunks=[];lastAudio={samples,rate:data.rate||24000};$('player').src=URL.createObjectURL(wavBlob(samples,lastAudio.rate));$('download').disabled=false;$('generate').disabled=false;$('stop').hidden=true;$('generateStatus').textContent=`${(samples.length/lastAudio.rate).toFixed(1)} 秒`;status('');return;}
  if(data.type==='error'){loading=false;setState('error','加载失败');$('generate').disabled=true;$('loadModel').disabled=false;$('stop').hidden=true;status(data.error||'模型运行失败',true);}
 };
 worker.onerror=event=>{loading=false;setState('error','运行时加载失败');status(event.message||'WASM 运行时加载失败',true);};
 return worker;
}
async function loadModel(){if(loading||loaded)return;loading=true;setState('loading','准备模型缓存…');$('loadModel').disabled=true;status('首次加载需要下载模型，期间可切换页面；完成后无需重复下载。');makeWorker();worker.postMessage({type:'load',url:MODEL_URL,size:MODEL_SIZE,name:MODEL_FILE});}
function wavBlob(samples,rate){const buffer=new ArrayBuffer(44+samples.length*2),view=new DataView(buffer);const put=(o,s)=>[...s].forEach((c,i)=>view.setUint8(o+i,c.charCodeAt(0)));put(0,'RIFF');view.setUint32(4,36+samples.length*2,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++)view.setInt16(44+i*2,Math.max(-1,Math.min(1,samples[i]))*(samples[i]<0?32768:32767),true);return new Blob([buffer],{type:'audio/wav'});}
async function decodeReference(file){if(!file)return null;const ctx=new AudioContext({sampleRate:24000}),decoded=await ctx.decodeAudioData(await file.arrayBuffer());const input=decoded.getChannelData(0),out=new Float32Array(Math.round(input.length*24000/decoded.sampleRate));for(let i=0;i<out.length;i++){const p=i*decoded.sampleRate/24000,a=Math.floor(p),f=p-a;out[i]=(input[a]||0)*(1-f)+(input[a+1]||input[a]||0)*f;}await ctx.close();return out;}
$('loadModel').onclick=loadModel;
$('clearModel').onclick=async()=>{if(!confirm('清除已缓存的 Breeze 模型？'))return;await worker?.terminate();worker=null;loaded=false;await navigator.storage?.getDirectory?.().then(async root=>{try{await root.removeEntry(MODEL_FILE);}catch(_){}});setState('idle','模型缓存已清除');$('modelProgress').style.width='0';$('modelDetail').textContent='';$('loadModel').disabled=false;$('clearModel').disabled=true;$('readyState').textContent='加载模型后可开始';$('generate').disabled=true;status('');};
$('generate').onclick=async()=>{if(!loaded||loading)return;const text=$('text').value.trim();if(!text){status('请输入要朗读的文字。',true);return;}loading=true;stopped=false;$('generate').disabled=true;$('stop').hidden=false;$('generateStatus').textContent='生成中…';window.__breezeChunks=[];try{const ref=await decodeReference($('reference').files[0]);worker.postMessage({type:'generate',text,instruction:$('instruction').value.trim(),refText:$('refText').value.trim(),ref:ref?.buffer||null},ref?[ref.buffer]:[]);}catch(error){loading=false;$('generate').disabled=false;$('stop').hidden=true;status(`参考音频无法读取：${error.message}`,true);}};
$('stop').onclick=()=>{stopped=true;worker?.postMessage({type:'stop'});loading=false;$('generate').disabled=false;$('stop').hidden=true;$('generateStatus').textContent='已停止';};
$('download').onclick=()=>{if(!lastAudio)return;const a=document.createElement('a');a.href=URL.createObjectURL(wavBlob(lastAudio.samples,lastAudio.rate));a.download='breeze-tts.wav';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
