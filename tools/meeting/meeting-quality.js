const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const REGISTRY=Symbol.for('pocket-toolbox.meeting.peer-registry.v1');

function mediaKind(stat){return stat.kind||stat.mediaType||'';}

export function installPeerRegistry(){
 const current=globalThis[REGISTRY];
 if(current)return current;
 const Native=globalThis.RTCPeerConnection;
 if(typeof Native!=='function')return null;
 const peers=new Set();
 function RegisteredPeerConnection(config){
  const peer=new Native(config);
  peers.add(peer);
  const prune=()=>{if(peer.connectionState==='closed'||peer.signalingState==='closed')peers.delete(peer);};
  peer.addEventListener('connectionstatechange',prune);
  return peer;
 }
 RegisteredPeerConnection.prototype=Native.prototype;
 Object.setPrototypeOf(RegisteredPeerConnection,Native);
 try{Object.defineProperty(RegisteredPeerConnection,'name',{value:Native.name||'RTCPeerConnection'});}catch{}
 const registry={peers,native:Native,restore(){if(globalThis.RTCPeerConnection===RegisteredPeerConnection){try{globalThis.RTCPeerConnection=Native;}catch{}}if(globalThis[REGISTRY]===registry)delete globalThis[REGISTRY];}};
 try{globalThis.RTCPeerConnection=RegisteredPeerConnection;}catch{return null;}
 globalThis[REGISTRY]=registry;
 return registry;
}

export function meetingProfile(kind,peerCount=1,track){
 const peers=Math.max(1,finite(peerCount,1));
 const settings=track?.getSettings?.()||{};
 const audio=track?.kind==='audio'||kind==='audio';
 if(audio)return{kind:'audio',key:'audio',maxBitrate:96000,minBitrate:32000,maxFramerate:null,scale:1,baseScale:1,maxScale:1};
 const screen=kind==='screen';
 const targetWidth=screen?1920:1920,targetHeight=screen?1080:1080;
 const resolutionScale=Math.max(1,finite(settings.width)/targetWidth,finite(settings.height)/targetHeight);
 const peerScale=peers>=5?1.5:peers>=3?1.2:1;
 const scale=Math.round(Math.max(1,resolutionScale*peerScale)*100)/100;
 const sharedMaximum=screen?4200000:2200000;
 const maxBitrate=Math.max(screen?600000:360000,Math.round(sharedMaximum/Math.sqrt(peers)));
 return{kind:screen?'screen':'camera',key:(screen?'screen:':'camera:')+settings.width+'x'+settings.height,baseScale:Math.max(1,resolutionScale),maxScale:Math.max(scale,resolutionScale*2.5),maxBitrate,minBitrate:Math.min(maxBitrate,screen?450000:280000),maxFramerate:30,scale};
}

export function nextMeetingBudget(profile,state,metrics={}){
 const previous=state||{};
 const next={...profile,pressure:0,healthy:0,bandwidthPressure:0,bandwidthHealthy:0,availableKbps:null,bitrateKbps:0,fps:0,limited:false};
 next.maxBitrate=clamp(finite(previous.maxBitrate,profile.maxBitrate),profile.minBitrate,profile.maxBitrate);
 next.minBitrate=Math.min(profile.minBitrate,next.maxBitrate);
 next.scale=clamp(finite(previous.scale,profile.scale),profile.baseScale,profile.maxScale);
 next.pressure=finite(previous.pressure);
 next.healthy=finite(previous.healthy);
 next.bandwidthPressure=finite(previous.bandwidthPressure);
 next.bandwidthHealthy=finite(previous.bandwidthHealthy);
 if(profile.kind==='audio')return next;
 const frameBudget=1000/profile.maxFramerate;
 const encodeMs=finite(metrics.encodeMs);
 const sendQueueMs=finite(metrics.sendQueueMs);
 const ratio=metrics.reason==='bandwidth';
 if(Number.isFinite(metrics.availableKbps)&&metrics.availableKbps>0)next.availableKbps=Number.isFinite(previous.availableKbps)?previous.availableKbps*.65+metrics.availableKbps*.35:metrics.availableKbps;
 const available=Number.isFinite(next.availableKbps)?next.availableKbps*1000:NaN;
 const cpu=metrics.reason==='cpu'||encodeMs>frameBudget*.82;
 const queue=sendQueueMs>45;
 next.limited=cpu||queue||ratio;
 next.pressure=cpu||queue?next.pressure+1:0;
 const bandwidthLimited=ratio&&Number.isFinite(available)&&available<next.maxBitrate*.94;
 next.bandwidthPressure=bandwidthLimited?next.bandwidthPressure+1:0;
 next.bandwidthHealthy=!bandwidthLimited&&Number.isFinite(available)&&available>next.maxBitrate*1.18?next.bandwidthHealthy+1:0;
 const cap=value=>{next.maxBitrate=clamp(Math.floor(value),profile.minBitrate,profile.maxBitrate);next.minBitrate=Math.min(profile.minBitrate,next.maxBitrate);};
 if(queue&&available>0&&available*.84<next.maxBitrate)cap(available*.84);
 const bandwidthLevel=next.bandwidthPressure;
 if(bandwidthLevel>=2&&Number.isFinite(available)&&available*.9<next.maxBitrate){cap(available*.9);next.bandwidthPressure=0;}
 if(next.pressure>=3||bandwidthLevel>=5){next.scale=Math.min(profile.maxScale,next.scale*1.18);cap(Math.min(next.maxBitrate,profile.maxBitrate/next.scale));next.pressure=0;next.bandwidthPressure=0;}
 const bandwidthHeadroom=Number.isFinite(available)&&available>next.maxBitrate*1.18;
 const headroom=!cpu&&!queue&&encodeMs<frameBudget*.7&&(bandwidthHeadroom||next.bandwidthHealthy>=2||(!Number.isFinite(metrics.availableKbps)&&!ratio));
 next.healthy=headroom?next.healthy+1:0;
 if(next.healthy>=4){next.scale=Math.max(profile.baseScale,next.scale/1.12);cap(next.maxBitrate*1.2);next.healthy=0;next.bandwidthHealthy=0;}
 next.bitrateKbps=finite(metrics.bitrateKbps);
 next.fps=finite(metrics.fps);
 return next;
}

function outboundFor(report,track){
 const sources=new Map(),outbound=[];
 report.forEach(stat=>{
  if(stat.type==='media-source'&&stat.id)sources.set(stat.id,stat.trackIdentifier||stat.id);
  if(stat.type!=='outbound-rtp'||mediaKind(stat)!==track.kind)return;
  outbound.push(stat);
 });
 return outbound.find(stat=>stat.trackIdentifier===track.id)||outbound.find(stat=>sources.get(stat.mediaSourceId)===track.id)||(outbound.length===1?outbound[0]:null);
}

export function senderMetrics(report,sender,previous,now=performance.now()){
 let pair;
 report.forEach(stat=>{if(stat.type==='candidate-pair'&&stat.state==='succeeded'&&(stat.selected||stat.nominated)&&(!pair||stat.selected))pair=stat;});
 const outbound=sender?.track?outboundFor(report,sender.track):null;
 const snapshot={time:now,bytes:finite(outbound?.bytesSent),frames:finite(outbound?.framesEncoded),encode:finite(outbound?.totalEncodeTime),delay:finite(outbound?.totalPacketSendDelay),packets:finite(outbound?.packetsSent),rttMs:Number.isFinite(pair?.currentRoundTripTime)?pair.currentRoundTripTime*1000:null,availableKbps:Number.isFinite(pair?.availableOutgoingBitrate)?pair.availableOutgoingBitrate/1000:null,reason:outbound?.qualityLimitationReason||'',fps:finite(outbound?.framesPerSecond)};
 const base=previous&&snapshot.time>previous.time?previous:{time:0,bytes:0,frames:0,encode:0,delay:0,packets:0};
 const seconds=(snapshot.time-base.time)/1000;
 return{snapshot,metrics:{bitrateKbps:seconds>0&&snapshot.bytes>=base.bytes?Math.round((snapshot.bytes-base.bytes)*8/seconds/1000):0,encodeMs:snapshot.frames>base.frames?Math.round((snapshot.encode-base.encode)*1000/(snapshot.frames-base.frames)*100)/100:0,sendQueueMs:snapshot.packets>base.packets?Math.round((snapshot.delay-base.delay)*1000/(snapshot.packets-base.packets)*100)/100:0,availableKbps:snapshot.availableKbps,rttMs:snapshot.rttMs,reason:snapshot.reason,fps:snapshot.fps}};
}

function preferCodecs(transceiver,profile,track){
 const capabilities=globalThis.RTCRtpSender?.getCapabilities?.(track.kind);
 if(!transceiver?.setCodecPreferences||!capabilities?.codecs?.length)return;
 const rank=codec=>{const mime=String(codec.mimeType||'').toLowerCase(),fmtp=String(codec.sdpFmtpLine||'');if(track.kind==='audio')return mime==='audio/opus'?0:mime.includes('red')?1:2;if(mime==='video/h264')return /packetization-mode=1/.test(fmtp)?0:1;if(mime==='video/vp8')return 2;if(mime==='video/vp9')return 3;return mime==='video/rtx'?4:5;};
 try{transceiver.setCodecPreferences([...capabilities.codecs].sort((a,b)=>rank(a)-rank(b)));}catch{}
}

async function applySender(peer,sender,budget,configured){
 const track=sender.track;
 if(!track||track.readyState==='ended'||!sender.getParameters||!sender.setParameters)return false;
 const parameters=sender.getParameters();
 parameters.encodings=parameters.encodings?.length?parameters.encodings:[{}];
 const encoding=parameters.encodings[0],previousTarget=encoding.maxBitrate||0,raised=previousTarget>0&&budget.maxBitrate>previousTarget*1.08;
 encoding.active=true;encoding.maxBitrate=budget.maxBitrate;encoding.priority='high';encoding.networkPriority='high';
 if(track.kind==='video'){encoding.minBitrate=budget.minBitrate;encoding.maxFramerate=budget.maxFramerate;encoding.scaleResolutionDownBy=budget.scale;parameters.degradationPreference='maintain-framerate';}
 else encoding.maxBitrate=budget.maxBitrate;
 try{await sender.setParameters(parameters);}catch{
  delete encoding.minBitrate;delete encoding.networkPriority;delete encoding.scaleResolutionDownBy;delete parameters.degradationPreference;
  try{await sender.setParameters(parameters);}catch{const fallback=sender.getParameters();fallback.encodings=fallback.encodings?.length?fallback.encodings:[{}];fallback.encodings.forEach(item=>{item.active=true;item.maxBitrate=budget.maxBitrate;});try{await sender.setParameters(fallback);}catch{return false;}}
 }
 const transceiver=peer.getTransceivers?.().find(item=>item.sender===sender);
 if(transceiver&&!configured.has(transceiver)){preferCodecs(transceiver,budget,track);configured.add(transceiver);}
 if(raised)try{sender.requestKeyFrame?.();}catch{}
 return true;
}

export class MeetingQualityController{
 constructor({local,onUpdate=()=>{}}={}){
  this.local=local||new Map();this.onUpdate=onUpdate;this.registry=installPeerRegistry();this.budgets=new WeakMap();this.snapshots=new WeakMap();this.configured=new WeakSet();this.timer=null;this.sampling=null;this.stats={state:'idle',peers:0,connections:0,senders:0,bitrateKbps:0,videoKbps:0,fps:0,rttMs:null,limited:false};
 }
 start(){if(this.timer)return;this.sample();this.timer=setInterval(()=>this.sample(),750);}
 refresh(){return this.sample(true);}
 kindFor(track){
  if(track?.kind==='audio')return 'audio';
  for(const entry of this.local.values())if(entry.stream?.getTracks?.().includes(track))return entry.kind;
  return 'camera';
 }
 peerCount(){const peers=this.registry?.peers?.size||0;return Math.max(1,Math.min(peers,this.stats.peers||peers||1));}
 setPeerCount(count){this.stats.peers=Math.max(0,finite(count));}
 async sample(force=false){
  if(this.sampling)return this.sampling;
  const run=this._sample(force).finally(()=>{this.sampling=null;});this.sampling=run;return run;
 }
 async _sample(force){
  const peers=this.registry?.peers?[...this.registry.peers].filter(peer=>peer.connectionState!=='closed'):[];
  let senders=0,videoKbps=0,bitrateKbps=0,fpsTotal=0,fpsCount=0,rtt=[];let limited=false,adapting=false;
  await Promise.allSettled(peers.map(async peer=>{
   if(typeof peer.getStats!=='function'||typeof peer.getSenders!=='function')return;
   let report;try{report=await peer.getStats();}catch{return;}
   for(const sender of peer.getSenders()){
    if(!sender.track||sender.track.readyState==='ended')continue;
    const kind=this.kindFor(sender.track),profile=meetingProfile(kind,this.peerCount(),sender.track),now=performance.now(),snapshot=senderMetrics(report,sender,this.snapshots.get(sender),now),next=nextMeetingBudget(profile,this.budgets.get(sender),snapshot.metrics);
    this.snapshots.set(sender,snapshot.snapshot);this.budgets.set(sender,next);await applySender(peer,sender,next,this.configured);senders++;bitrateKbps+=snapshot.metrics.bitrateKbps;
    if(sender.track.kind==='video'){videoKbps+=snapshot.metrics.bitrateKbps;if(snapshot.metrics.fps>0){fpsTotal+=snapshot.metrics.fps;fpsCount++;}}
    if(Number.isFinite(snapshot.metrics.rttMs))rtt.push(snapshot.metrics.rttMs);
    limited=limited||next.limited;adapting=adapting||next.pressure>0||next.bandwidthPressure>0;
   }
  }));
  if(force&&this.registry?.peers?.size===0)await new Promise(resolve=>setTimeout(resolve,0));
  this.stats={state:!senders?'idle':limited?'limited':adapting?'adapting':'stable',peers:this.stats.peers,connections:peers.length,senders,bitrateKbps,videoKbps,fps:fpsCount?Math.round(fpsTotal/fpsCount):0,rttMs:rtt.length?Math.round(rtt.reduce((a,b)=>a+b,0)/rtt.length):null,limited};
  try{this.onUpdate(this.stats);}catch{}
  return this.stats;
 }
 statsSnapshot(){return{...this.stats};}
 stop(){clearInterval(this.timer);this.timer=null;this.sampling=null;this.registry?.restore();this.registry=null;this.stats={...this.stats,state:'idle'};}
}