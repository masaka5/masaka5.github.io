import { normalizeProject, normalizeSource, SOURCE_TYPES, DEFAULT_OUTPUT, OUTPUT_LIMITS, uid, clamp } from './broadcast-core.js?v=20261113-effects1';
import { Compositor } from './compositor.js?v=20261113-effects1';
import {makeFade,fadeValue} from './effects.js?v=20261113-effects1';

const LABELS={camera:'摄像头',screen:'屏幕共享',window:'窗口共享',microphone:'麦克风',image:'图片',video:'视频',text:'文字',countdown:'倒计时'};
const COPY=value=>JSON.parse(JSON.stringify(value));

/** One canvas video track and one mixed audio track remain stable across scene changes. */
export class BroadcastEngine {
  constructor({canvas,onState=()=>{},onError=()=>{},onRecordingReady=()=>{}}={}) {
    if(!canvas)throw new Error('需要提供合成画布');
    this.canvas=canvas;this.onState=onState;this.onError=onError;this.onRecordingReady=onRecordingReady;
    this.project=normalizeProject();this.runtimes=new Map();this.assets=new Map();this.stats={frames:0,fps:0,renderMs:0,recording:false,recordingDuration:0,audioLevels:{}};
    this._dirty=true;this._lastFrame=0;this._sampleStart=performance.now();this._sampleFrames=0;this._lastState=0;this.disposed=false;this.fades=new Map();
  }
  async initialize(project) {
    if(this.disposed)throw new Error('合成器已经关闭');
    if(!this.compositor){
      this.compositor=new Compositor(this.canvas,{onError:error=>this._error(error)});
      const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(AudioContext){
        this.audioContext=new AudioContext({latencyHint:'interactive'});this.audioDestination=this.audioContext.createMediaStreamDestination();this.masterGain=this.audioContext.createGain();this.masterGain.connect(this.audioDestination);
        // Keep timestamped silence flowing even when a scene has no audio sources. Some encoders
        // otherwise wait forever for their first audio sample and emit an empty recording.
        this.silenceSource=this.audioContext.createConstantSource();this.silenceSource.offset.value=0;this.silenceSource.connect(this.masterGain);this.silenceSource.start();
      }
      this.canvas.width=this.project.width;this.canvas.height=this.project.height;
      this._loop=timestamp=>{if(this.disposed)return;this._tick(timestamp);this._raf=requestAnimationFrame(this._loop);};this._raf=requestAnimationFrame(this._loop);
    }
    if(project)await this.loadProject(project);else this._emit();
    return this;
  }
  async resumeAudio() {
    if(!this.compositor)await this.initialize();
    if(this.audioContext?.state==='suspended')await this.audioContext.resume();
    for(const [id,runtime] of this.runtimes)if(runtime.element instanceof HTMLVideoElement && runtime.active && !this.getSource(id)?.paused){runtime.element.play().catch(()=>{});}
  }
  snapshot(){return COPY(this.project);}
  get activeScene(){return this.project.scenes.find(scene=>scene.id===this.project.activeSceneId);}
  get recording(){return !!this.recorder && this.recorder.state!=='inactive';}
  getSource(id){for(const scene of this.project.scenes){const source=scene.sources.find(s=>s.id===id);if(source)return source;}return null;}
  getSourceStatus(id){const runtime=this.runtimes.get(id);return runtime?{status:runtime.status,error:runtime.error || '',hasAudio:!!runtime.audioNode,trackLabel:runtime.stream?.getVideoTracks()[0]?.label || runtime.stream?.getAudioTracks()[0]?.label || ''}:{status:['text','countdown'].includes(this.getSource(id)?.type)?'ready':'idle',hasAudio:false};}
  setAsset(id,blob){if(!(blob instanceof Blob))throw new TypeError('素材必须是 Blob');this.assets.set(String(id),blob);return String(id);}
  getAssets(){return new Map(this.assets);}
  exportAssets(){return [...this.assets].map(([id,blob])=>({id,blob}));}
  async loadProject(snapshot) {
    const project=normalizeProject(snapshot);
    if(this.recording)throw new Error('录制时不能替换整个项目');
    if(!this.compositor)await this.initialize();
    this._validateOutput(project);
    const staged=new Map();
    try {
      for(const scene of project.scenes)for(const source of scene.sources){
        if(['image','video'].includes(source.type)){
          if(!source.assetId || !this.assets.has(source.assetId))throw new Error(`素材文件未找到：${source.name}`);
          await this._prepare(source,{},staged);
        }
        // Device permissions are requested only by explicit user actions.
      }
      if(this.disposed)throw new Error('合成器已经关闭');
    } catch(error) {
      for(const id of staged.keys())this._release(id,staged,false);
      throw error;
    }
    for(const id of this.runtimes.keys())this._release(id);
    this.runtimes=staged;this.project=project;this.fades.clear();this.setOutput(project);
    this._syncAudio();this._pruneAssets();this._dirty=true;this._emit();return this.snapshot();
  }
  createScene(name='新场景') {
    if(this.project.scenes.length>=16)throw new Error('最多创建 16 个场景');
    const scene={id:uid(),name:String(name).slice(0,100),sources:[]};this.project.scenes.push(scene);this.switchScene(scene.id);return scene;
  }
  deleteScene(id) {
    if(this.project.scenes.length<=1)throw new Error('至少保留一个场景');
    const index=this.project.scenes.findIndex(scene=>scene.id===id);if(index<0)return;
    const [scene]=this.project.scenes.splice(index,1);for(const source of scene.sources)this._release(source.id);
    if(this.project.activeSceneId===id)this.project.activeSceneId=this.project.scenes[Math.max(0,index-1)].id;
    this._syncAudio();this._dirty=true;this._pruneAssets();this._emit();
  }
  switchScene(id) {
    if(!this.project.scenes.some(scene=>scene.id===id))throw new Error('场景不存在');
    this.project.activeSceneId=id;this._syncAudio();this._dirty=true;this._emit();
  }
  renameScene(id,name){const scene=this.project.scenes.find(s=>s.id===id);if(scene){scene.name=String(name).slice(0,100);this._emit();}}
  async duplicateSource(id){const s=this.getSource(id);if(!s)throw Error('素材不存在');if(this.activeScene.sources.length>=32)throw Error('每个场景最多 32 个来源');const stream=this.runtimes.get(id)?.stream?.clone();try{return await this.addSource(s.type,{...COPY(s),name:s.name+' 副本',x:s.x+20,y:s.y+20,locked:false,...(stream?{stream}:{})});}catch(error){stream?.getTracks().forEach(t=>t.stop());throw error;}}
  async duplicateScene(id=this.activeScene.id){
    const original=this.project.scenes.find(s=>s.id===id);if(!original)throw Error('场景不存在');if(this.project.scenes.length>=16)throw Error('最多创建 16 个场景');
    const scene={id:uid(),name:original.name+' 副本',sources:[]},staged=new Map();
    try{for(const s of original.sources){const copy=normalizeSource({...COPY(s),id:uid()}),runtime=this.runtimes.get(s.id);if(['image','video'].includes(s.type)||runtime?.stream)await this._prepare(copy,runtime?.stream?{stream:runtime.stream.clone()}:{},staged);scene.sources.push(copy);}if(this.disposed||this.project.scenes.length>=16||!this.project.scenes.includes(original))throw Error('场景复制已取消');}
    catch(error){for(const key of staged.keys())this._release(key,staged);throw error;}
    for(const[key,value]of staged)this.runtimes.set(key,value);this.project.scenes.push(scene);this.switchScene(scene.id);return scene;
  }
  async addSource(type,options={}) {
    if(!SOURCE_TYPES.includes(type))throw new Error('不支持的来源类型');
    if(this.activeScene.sources.length>=32)throw new Error('每个场景最多 32 个来源');
    if(!this.compositor)await this.initialize();
    // Start permission pickers immediately while the browser still has user activation.
    const source=normalizeSource({name:LABELS[type],width:this.project.width,height:this.project.height,
      ...(type==='text'?{width:700,height:110,x:40,y:40,text:'欢迎来到直播间'}:{}),
      ...(type==='countdown'?{width:480,height:160,x:(this.project.width-480)/2,y:(this.project.height-160)/2,fontSize:96}:{}),...options,type,id:uid()});
    if(options.file){source.assetId=uid();source.fileName=options.file.name || '';this.setAsset(source.assetId,options.file);}
    const scene=this.activeScene;
    try {
      await this._prepare(source,options);if(this.disposed)throw new Error('合成器已经关闭');
      if(!this.project.scenes.includes(scene))throw new Error('添加期间场景已被移除，请重新添加');
      if(scene.sources.length>=32)throw new Error('每个场景最多 32 个来源');
      scene.sources.push(source);this._syncAudio();this._dirty=true;this._emit();return source;
    }catch(error){this._release(source.id);if(options.file&&source.assetId)this.assets.delete(source.assetId);this._error(error);throw error;}
  }
  async reconnectSource(id,options={}) {
    const source=this.getSource(id);if(!source)throw new Error('来源不存在');
    this._release(id);
    try{await this._prepare(source,options);if(this.getSource(id)!==source)throw new Error('来源已被移除');this._syncAudio();this._dirty=true;this._emit();return source;}catch(error){this._release(id);this._error(error);this._emit();throw error;}
  }
  updateSource(id,patch) {
    const source=this.getSource(id);if(!source)return;
    const now=performance.now(),oldVisible=source.visible,oldFade=this.fades.get(id),current=oldFade?fadeValue(oldFade,now):(oldVisible?1:0);
    const normalized=normalizeSource({...source,...patch,id:source.id,type:source.type});
    if(normalized.animation.type==='fade'&&oldVisible!==normalized.visible)this.fades.set(id,makeFade(current,normalized.visible?1:0,now,normalized.animation.duration));
    else if(normalized.animation.type==='none')this.fades.delete(id);
    Object.assign(source,normalized);this._dirty=true;this._syncAudio();
    const runtime=this.runtimes.get(id);if(runtime?.element instanceof HTMLVideoElement)runtime.element.loop=source.loop;
    this._emit();return source;
  }
  deleteSource(id) {
    for(const scene of this.project.scenes){const index=scene.sources.findIndex(s=>s.id===id);if(index>=0){scene.sources.splice(index,1);this._release(id);this._dirty=true;this._pruneAssets();this._emit();return;}}
  }
  setSourcePaused(id,paused){return this.updateSource(id,{paused:!!paused});}
  previewFade(id,direction='in'){const source=this.getSource(id);if(!source||source.type==='microphone')return;const now=performance.now(),duration=source.animation.duration;source.visible=direction!=='out';this.fades.set(id,makeFade(direction==='out'?1:0,direction==='out'?0:1,now,duration));this._syncAudio();this._dirty=true;this._emit();}
  moveSource(id,delta) {
    for(const scene of this.project.scenes){const index=scene.sources.findIndex(s=>s.id===id);if(index<0)continue;
      const next=Math.max(0,Math.min(scene.sources.length-1,index+Math.sign(delta)));const [source]=scene.sources.splice(index,1);scene.sources.splice(next,0,source);this._dirty=true;this._emit();return;}
  }
  getOutputLimits() {
    const gl=this.compositor?.gl;
    if(!gl)return {maxWidth:OUTPUT_LIMITS.maxDimension,maxHeight:OUTPUT_LIMITS.maxDimension};
    const viewport=gl.getParameter(gl.MAX_VIEWPORT_DIMS),buffer=gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    return {maxWidth:Math.min(OUTPUT_LIMITS.maxDimension,buffer,viewport[0]),maxHeight:Math.min(OUTPUT_LIMITS.maxDimension,buffer,viewport[1])};
  }
  _validateOutput({width,height}) {
    const limits=this.getOutputLimits();
    if(width>limits.maxWidth||height>limits.maxHeight)throw new Error(`当前设备最大画布为 ${limits.maxWidth} × ${limits.maxHeight}`);
  }
  setOutput({width=this.project.width,height=this.project.height,fps=this.project.fps}={}) {
    const output=normalizeProject({width,height,fps});
    this._validateOutput(output);
    if(this.recording && (output.width!==this.project.width || output.height!==this.project.height))throw new Error('录制期间请保持画布分辨率不变');
    this.project.width=output.width;this.project.height=output.height;
    if(this.project.fps!==output.fps)this._nextFrame=undefined;
    this.project.fps=output.fps;
    if(this.canvas.width!==output.width)this.canvas.width=output.width;if(this.canvas.height!==output.height)this.canvas.height=output.height;
    this._dirty=true;this._emit();return {width:output.width,height:output.height,fps:output.fps};
  }
  setMasterGain(gain){if(this.masterGain)this.masterGain.gain.setTargetAtTime(clamp(gain,0,2,1),this.audioContext.currentTime,.015);}
  getOutputStream() {
    if(!this.compositor)throw new Error('请先初始化合成器');
    if(!this.outputStream){
      if(!this.canvas.captureStream)throw new Error('当前浏览器不支持画布捕获');
      this._canvasStream=this.canvas.captureStream(0);const track=this._canvasStream.getVideoTracks()[0];
      if(typeof track.requestFrame!=='function'){track.stop();this._canvasStream=this.canvas.captureStream(this.project.fps);}
      this.outputStream=new MediaStream([...this._canvasStream.getVideoTracks(),...(this.audioDestination?.stream.getAudioTracks()||[])]);
      this._dirty=true;
    }
    return this.outputStream;
  }
  async startRecording({mimeType,videoBitsPerSecond=DEFAULT_OUTPUT.videoBitsPerSecond}={}) {
    if(this.recording)throw new Error('正在录制');
    if(!globalThis.MediaRecorder)throw new Error('当前浏览器不支持本地录制');
    await this.resumeAudio();
    const selected=mimeType || ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
    if(selected && !MediaRecorder.isTypeSupported(selected))throw new Error('不支持所选录制格式');
    const recorder=new MediaRecorder(this.getOutputStream(),{...(selected?{mimeType:selected}:{}),videoBitsPerSecond:clamp(videoBitsPerSecond,500000,40000000,DEFAULT_OUTPUT.videoBitsPerSecond)});
    this._recordChunks=[];this._recordBytes=0;this.recordingBlob=null;this.recorder=recorder;this._recordError=null;this._recordStopReason='manual';
    this._recordingResult=new Promise((resolve,reject)=>{this._resolveRecording=resolve;this._rejectRecording=reject;});
    // Attach a handler immediately: encoder errors must not become unhandled promise rejections.
    this._recordingResult.catch(()=>{});
    recorder.ondataavailable=event=>{if(event.data.size){this._recordChunks.push(event.data);this._recordBytes+=event.data.size;if(this._recordBytes>2_000_000_000 && recorder.state!=='inactive'){this._recordStopReason='size-limit';recorder.stop();this._error(new Error('录制已达到 2 GB 内存保护上限，请下载后继续。'));}}};
    recorder.onerror=event=>{this._recordError=event.error || new Error('录制失败');this._recordStopReason='encoder-error';this._error(this._recordError);if(recorder.state!=='inactive')recorder.stop();};
    let completed=false;
    recorder.onstop=()=>{
      if(completed)return;completed=true;
      this.recordingBlob=new Blob(this._recordChunks,{type:recorder.mimeType || selected || 'video/webm'});this._recordChunks=[];
      this.stats.recording=false;this.stats.recordingDuration=(performance.now()-this._recordStarted)/1000;
      const meta={mimeType:this.recordingBlob.type,bytes:this.recordingBlob.size,duration:this.stats.recordingDuration,startedAt:this._recordStartedAt,reason:this._recordStopReason,...(this._recordError?{error:this._recordError.message}:{})};
      if(this._recordError && !this.recordingBlob.size)this._rejectRecording(this._recordError);else this._resolveRecording(this.recordingBlob);
      if(this.recordingBlob.size){try{Promise.resolve(this.onRecordingReady(this.recordingBlob,meta)).catch(error=>this._error(error));}catch(error){this._error(error);}}
      this._emit();
    };
    recorder.start(1000);this._recordStarted=performance.now();this._recordStartedAt=Date.now();this.stats.recording=true;this.stats.recordingDuration=0;this._emit();return {mimeType:recorder.mimeType};
  }
  async stopRecording() {
    if(!this.recorder)return this.recordingBlob || null;
    if(this.recorder.state!=='inactive')this.recorder.stop();return this._recordingResult;
  }
  async _prepare(source,options={},runtimes=this.runtimes) {
    if(['text','countdown'].includes(source.type))return;
    const runtime={status:'loading',dirty:true,active:false};runtimes.set(source.id,runtime);
    if(['camera','microphone','screen','window'].includes(source.type)) {
      if(!navigator.mediaDevices)throw new Error('媒体捕获需要 HTTPS 或 localhost 安全环境');
      if(options.stream)runtime.stream=options.stream;
      else if(source.type==='camera')runtime.stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:this.project.fps},...(source.deviceId?{deviceId:{exact:source.deviceId}}:{})},audio:false});
      else if(source.type==='microphone')runtime.stream=await navigator.mediaDevices.getUserMedia({video:false,audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false,...(source.deviceId?{deviceId:{exact:source.deviceId}}:{})}});
      else runtime.stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:this.project.fps},displaySurface:source.type==='window'?'window':'monitor'},audio:true,preferCurrentTab:false,selfBrowserSurface:'exclude'});
      if(this.disposed || runtime.released || runtimes.get(source.id)!==runtime){for(const track of runtime.stream.getTracks())track.stop();throw new Error('捕获请求已取消');}
      for(const track of runtime.stream.getTracks())track.addEventListener('ended',()=>{runtime.status='ended';runtime.error='捕获已结束，请重新连接';this._syncAudio();this._dirty=true;this._emit();});
      if(runtime.stream.getVideoTracks().length){runtime.element=this._video();runtime.element.srcObject=runtime.stream;await this._play(runtime.element);this._watchFrames(runtime);}
      if(runtime.stream.getAudioTracks().length && this.audioContext){runtime.audioNode=this.audioContext.createMediaStreamSource(runtime.stream);this._connectAudio(runtime);}
    } else {
      const blob=source.assetId && this.assets.get(source.assetId);
      if(!blob)throw new Error('素材文件未找到，请重新选择');
      runtime.url=URL.createObjectURL(blob);
      if(source.type==='image'){
        const image=new Image();runtime.element=image;
        await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('图片无法解码'));image.src=runtime.url;});
      }else{
        runtime.element=this._video();runtime.element.loop=source.loop;runtime.element.src=runtime.url;
        await this._play(runtime.element);this._watchFrames(runtime);
        if(this.audioContext){runtime.audioNode=this.audioContext.createMediaElementSource(runtime.element);this._connectAudio(runtime);runtime.element.muted=false;}
      }
    }
    if(this.disposed || runtime.released || runtimes.get(source.id)!==runtime)throw new Error('来源加载已取消');
    runtime.status='ready';runtime.active=true;
  }
  _video(){const video=document.createElement('video');video.playsInline=true;video.muted=true;video.autoplay=true;video.preload='auto';return video;}
  _play(video) {
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>finish(new Error('媒体加载超时，请重新选择来源')),15000);
      const finish=error=>{clearTimeout(timer);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',failed);error?reject(error):resolve();};
      const ready=()=>finish();const failed=()=>finish(new Error('视频无法解码或捕获设备不可用'));
      if(video.readyState>=2){finish();return;}
      video.addEventListener('loadeddata',ready,{once:true});video.addEventListener('error',failed,{once:true});
      video.play().catch(error=>{if(error.name!=='NotAllowedError')finish(error);});
    });
  }
  _watchFrames(runtime){
    if(runtime.element.requestVideoFrameCallback){runtime.frameCallback=true;const frame=()=>{if(runtime.released)return;runtime.dirty=true;runtime.frameId=runtime.element.requestVideoFrameCallback(frame);};runtime.frameId=runtime.element.requestVideoFrameCallback(frame);}
  }
  _connectAudio(runtime) {
    runtime.gainNode=this.audioContext.createGain();runtime.gainNode.gain.value=0;runtime.analyser=this.audioContext.createAnalyser();runtime.analyser.fftSize=256;runtime.samples=new Float32Array(runtime.analyser.fftSize);
    runtime.audioNode.connect(runtime.gainNode);runtime.gainNode.connect(runtime.analyser);runtime.analyser.connect(this.masterGain);
    // Deliberately no connection to audioContext.destination: monitoring a microphone would feed back.
  }
  _syncAudio() {
    const activeIds=new Set(this.activeScene?.sources.map(source=>source.id));
    for(const [id,runtime] of this.runtimes){
      const source=this.getSource(id),fade=this.fades.get(id);const active=!!source && activeIds.has(id) && (source.visible||!!fade)&& runtime.status==='ready';runtime.active=active;
      if(runtime.gainNode){const now=this.audioContext.currentTime,gain=runtime.gainNode.gain,audible=active&&!source.muted&&!(source.type==='video'&&source.paused);gain.cancelScheduledValues(now);if(fade&&audible){gain.setValueAtTime(source.gain*fadeValue(fade,performance.now()),now);gain.linearRampToValueAtTime(source.gain*fade.to,now+Math.max(0,(fade.start+fade.duration-performance.now())/1000));}else gain.setTargetAtTime(audible?source.gain:0,now,.015);}
      if(source?.type==='video' && runtime.element){if(active && !source.paused)runtime.element.play().catch(()=>{});else runtime.element.pause();}
    }
  }
  _tick(timestamp) {
    const period=1000/this.project.fps;
    if(!Number.isFinite(this._nextFrame))this._nextFrame=this._lastFrame+period;
    if(timestamp<this._nextFrame-1)return;
    // An early rAF consumes this deadline exactly once. Modulo correction would leave
    // the prior deadline unchanged when elapsed is just below period and double count it.
    // Catch up only deadlines that have actually passed; the early-rAF tolerance
    // must not consume a second, still-future deadline at fractional frame rates.
    this._nextFrame+=Math.max(1,Math.floor((timestamp-this._nextFrame)/period)+1)*period;
    this._lastFrame=timestamp;
    const sources=this.activeScene?.sources || [];
    const animated=this.fades.size>0||sources.some(source=>source.visible && (['camera','screen','window','countdown'].includes(source.type)||(source.type==='video' && !source.paused)||source.scrollSpeed));
    if(this._dirty || animated){
      const start=performance.now();if(this.compositor.render(this.activeScene,this.runtimes,timestamp,this.fades)){this.stats.frames++;this._sampleFrames++;}
      let finished=false;for(const[id,fade]of this.fades)if(timestamp>=fade.start+fade.duration){this.fades.delete(id);finished=true;}if(finished)this._syncAudio();
      this.stats.renderMs=performance.now()-start;this._dirty=false;
    }
    // A retained output can sample the already composed image without redrawing every layer.
    this._canvasStream?.getVideoTracks()[0]?.requestFrame?.();
    if(timestamp-this._sampleStart>=1000){this.stats.fps=Math.round(this._sampleFrames*1000/(timestamp-this._sampleStart));this._sampleFrames=0;this._sampleStart=timestamp;}
    if(this.recording)this.stats.recordingDuration=(timestamp-this._recordStarted)/1000;
    if(timestamp-this._lastState>500){
      this._lastState=timestamp;const levels={};for(const [id,runtime] of this.runtimes)if(runtime.analyser){runtime.analyser.getFloatTimeDomainData(runtime.samples);let squares=0;for(const sample of runtime.samples)squares+=sample*sample;levels[id]=Math.min(1,Math.sqrt(squares/runtime.samples.length)*3);}
      this.stats.audioLevels=levels;this._emit(false);
    }
  }
  renderNow(){this._dirty=true;if(this.compositor)this.compositor.render(this.activeScene,this.runtimes,performance.now(),this.fades);}
  _release(id,runtimes=this.runtimes,removeTexture=true) {
    this.fades.delete(id);
    const runtime=runtimes.get(id);if(runtime){runtime.released=true;if(runtime.frameId!=null)runtime.element.cancelVideoFrameCallback?.(runtime.frameId);runtime.stream?.getTracks().forEach(track=>track.stop());
      if(runtime.element instanceof HTMLVideoElement){runtime.element.pause();runtime.element.srcObject=null;runtime.element.removeAttribute('src');runtime.element.load();}
      runtime.audioNode?.disconnect();runtime.gainNode?.disconnect();runtime.analyser?.disconnect();if(runtime.url)URL.revokeObjectURL(runtime.url);runtimes.delete(id);}
    if(removeTexture)this.compositor?.remove(id);
  }
  _pruneAssets(){const used=new Set(this.project.scenes.flatMap(scene=>scene.sources.map(source=>source.assetId)));for(const id of this.assets.keys())if(!used.has(id))this.assets.delete(id);}
  _error(error){try{this.onError(error instanceof Error?error:new Error(String(error)));}catch{}}
  _emit(changed=true){try{this.onState({project:this.project,stats:{...this.stats,recording:this.recording},sources:Object.fromEntries(this.project.scenes.flatMap(scene=>scene.sources.map(source=>[source.id,this.getSourceStatus(source.id)]))),changed});}catch(error){console.error('Broadcast UI state callback:',error);}}
  async dispose(){
    if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this._raf);await this.stopRecording();
    for(const id of this.runtimes.keys())this._release(id);for(const track of this.outputStream?.getTracks() || [])track.stop();this.silenceSource?.stop();this.silenceSource?.disconnect();this.compositor?.dispose();await this.audioContext?.close();this.assets.clear();
  }
}
export default BroadcastEngine;
