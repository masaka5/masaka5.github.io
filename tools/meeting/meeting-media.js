import {randomID} from './meeting-core.js';
export function mediaError(error){return ({NotAllowedError:'未获得授权，可继续文字参会',NotFoundError:'未找到可用设备',NotReadableError:'设备被占用，请关闭其他使用它的应用',AbortError:'已取消共享',NotSupportedError:'当前浏览器不支持此功能'})[error?.name]||'无法启用设备，请检查浏览器权限';}
export class MeetingMedia{
 constructor(onChange=()=>{}){this.entries=new Map();this.pending=new Set();this.generation=0;this.onChange=onChange;}
 async start(kind,deviceId){
  if(this.pending.has(kind))return;
  if(this.entries.has(kind))return this.entries.get(kind);
  if(!navigator.mediaDevices)throw Error('请通过 HTTPS 使用音视频');
  this.pending.add(kind);const generation=this.generation;
  let stream;
  try{
   if(kind==='screen'){
    if(!navigator.mediaDevices.getDisplayMedia)throw new DOMException('unsupported','NotSupportedError');
    stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:15,max:30},width:{ideal:1920}},audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},systemAudio:'include',selfBrowserSurface:'exclude',surfaceSwitching:'include'});
   }else{
    const chosen=deviceId?{deviceId:{exact:deviceId}}:{};
    stream=await navigator.mediaDevices.getUserMedia(kind==='mic'?{audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,...chosen},video:false}:{video:{width:{ideal:1280},height:{ideal:720},frameRate:{ideal:24,max:30},...chosen},audio:false});
   }
   if(generation!==this.generation){stream.getTracks().forEach(t=>t.stop());return;}
   const entry={kind,token:randomID(),stream,audio:stream.getAudioTracks().length>0};this.entries.set(kind,entry);
   const primary=kind==='mic'?stream.getAudioTracks()[0]:stream.getVideoTracks()[0];
   if(!primary){this.stop(kind);throw new DOMException('No track','NotFoundError');}
   primary.addEventListener('ended',()=>{if(this.entries.get(kind)===entry)this.stop(kind);},{once:true});
   this.onChange(entry,true);return entry;
  }finally{this.pending.delete(kind);}
 }
 stop(kind){const entry=this.entries.get(kind);if(!entry)return;this.entries.delete(kind);entry.stream.getTracks().forEach(t=>t.stop());this.onChange(entry,false);}
 stopAll(){this.generation++;for(const kind of [...this.entries.keys()])this.stop(kind);}
 async devices(){if(!navigator.mediaDevices?.enumerateDevices)return [];return navigator.mediaDevices.enumerateDevices();}
}
