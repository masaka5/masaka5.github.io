const finite=(n,fallback)=>Number.isFinite(Number(n))?Number(n):fallback;
const bound=(n,min,max,fallback)=>Math.max(min,Math.min(max,finite(n,fallback)));
export function streamPolicy(conf={}){
 const width=bound(conf.width,64,8192,1920),height=bound(conf.height,64,8192,1080),mode=conf.latencyMode==='quality'?'quality':'realtime';
 const maxFramerate=bound(conf.fps,1,mode==='realtime'?60:120,30),scaleResolutionDownBy=mode==='realtime'?Math.max(1,width/1920,height/1080):1;
 return{mode,width,height,maxFramerate,maxBitrate:bound(conf.videoBitsPerSecond,300000,40000000,12000000),scaleResolutionDownBy,maxScale:Math.max(scaleResolutionDownBy,Math.min(width/320,height/180))};
}
export function readStreamStats(report,previous){
 const snapshot={bytes:0,frames:0,encode:0,sendDelay:0,packets:0,time:0,videoFrames:null,videoBytes:null};
 const metrics={bitrateKbps:0,videoBitrateKbps:0,encoderTargetKbps:null,fps:0,width:0,height:0,encodeMs:null,sendQueueMs:null,rttMs:null,availableKbps:null,codec:'',transport:'',qualityLimitationReason:'none'};
 let pair,video;
 report.forEach(s=>{
  if(s.type!=='outbound-rtp'||s.isRemote)return;
  snapshot.bytes+=s.bytesSent||0;snapshot.sendDelay+=s.totalPacketSendDelay||0;snapshot.packets+=s.packetsSent||0;snapshot.time=Math.max(snapshot.time,s.timestamp||0);
  if((s.kind||s.mediaType)==='video'){video=s;snapshot.frames+=s.framesEncoded||0;snapshot.encode+=s.totalEncodeTime||0;metrics.fps=s.framesPerSecond||0;metrics.width=s.frameWidth||0;metrics.height=s.frameHeight||0;metrics.qualityLimitationReason=s.qualityLimitationReason||'none';metrics.codec=(report.get(s.codecId)?.mimeType||'').replace(/^video\//i,'');const transport=report.get(s.transportId);if(transport?.selectedCandidatePairId)pair=report.get(transport.selectedCandidatePairId);}
 });
 if(video){snapshot.videoFrames=Number.isFinite(video.framesEncoded)?video.framesEncoded:null;snapshot.videoBytes=Number.isFinite(video.bytesSent)?video.bytesSent:null;if(Number.isFinite(video.targetBitrate))metrics.encoderTargetKbps=Math.round(video.targetBitrate/1000);}
 if(!pair)report.forEach(s=>{if(s.type==='candidate-pair'&&s.state==='succeeded'&&(s.selected||s.nominated))pair=s;});
 const usable=previous&&snapshot.time>previous.time&&snapshot.bytes>=previous.bytes&&snapshot.frames>=previous.frames,base=usable?previous:{bytes:0,frames:0,encode:0,sendDelay:0,packets:0,time:0};
 if(usable)metrics.bitrateKbps=Math.round((snapshot.bytes-base.bytes)*8/(snapshot.time-base.time));
 if(usable&&Number.isFinite(snapshot.videoBytes)&&Number.isFinite(previous.videoBytes)&&snapshot.videoBytes>=previous.videoBytes)metrics.videoBitrateKbps=Math.round((snapshot.videoBytes-previous.videoBytes)*8/(snapshot.time-base.time));
 if(video&&Number.isFinite(video.totalEncodeTime)&&snapshot.frames>base.frames)metrics.encodeMs=Math.round(Math.max(0,(snapshot.encode-base.encode)*1000/(snapshot.frames-base.frames))*100)/100;
 if(video&&Number.isFinite(video.totalPacketSendDelay)&&snapshot.packets>base.packets)metrics.sendQueueMs=Math.round(Math.max(0,(snapshot.sendDelay-base.sendDelay)*1000/(snapshot.packets-base.packets))*100)/100;
 if(Number.isFinite(pair?.currentRoundTripTime))metrics.rttMs=pair.currentRoundTripTime*1000;
 if(Number.isFinite(pair?.availableOutgoingBitrate))metrics.availableKbps=pair.availableOutgoingBitrate/1000;
 if(pair)metrics.transport=report.get(pair.localCandidateId)?.protocol||'';
 return{snapshot,metrics};
}
export function nextStreamBudget(policy,state,metrics){
 const next={maxBitrate:policy.maxBitrate,maxFramerate:policy.maxFramerate,scaleResolutionDownBy:policy.scaleResolutionDownBy,pressure:0,healthy:0,...state};
 if(policy.mode==='quality')return next;
 const cpu=metrics.qualityLimitationReason==='cpu'||metrics.encodeMs>1000/policy.maxFramerate*.7,queue=metrics.sendQueueMs>40;
 next.pressure=cpu||queue?next.pressure+1:0;
 const floor=Math.min(600000,policy.maxBitrate);
 if(queue&&Number.isFinite(metrics.availableKbps)&&metrics.availableKbps>0){const ceiling=Math.max(floor,Math.min(policy.maxBitrate,Math.floor(metrics.availableKbps*1000*.8)));if(ceiling<next.maxBitrate)next.maxBitrate=ceiling;}
 if(next.pressure>=3){next.scaleResolutionDownBy=Math.min(policy.maxScale,next.scaleResolutionDownBy*1.25);next.maxBitrate=Math.max(floor,Math.min(next.maxBitrate,Math.round(policy.maxBitrate/next.scaleResolutionDownBy)));next.pressure=0;}
 // Chromium may keep reporting 'bandwidth' because our own cap is below its estimate.
 // Recover from measured headroom; this label alone must not lock in a past backoff.
 const bandwidthHeadroom=Number.isFinite(metrics.availableKbps)&&metrics.availableKbps*1000>next.maxBitrate*1.4;
 const headroom=!cpu&&!queue&&Number.isFinite(metrics.encodeMs)&&metrics.encodeMs<1000/policy.maxFramerate*.55&&(bandwidthHeadroom||(!Number.isFinite(metrics.availableKbps)&&metrics.qualityLimitationReason!=='bandwidth'));
 next.healthy=headroom?next.healthy+1:0;
 if(next.healthy>=10){next.scaleResolutionDownBy=Math.max(policy.scaleResolutionDownBy,next.scaleResolutionDownBy/1.25);next.maxBitrate=Math.min(policy.maxBitrate,Math.round(next.maxBitrate*1.15));next.healthy=0;}
 return next;
}
export function realtimeCodecs(codecs=[]){
 const rank=c=>{const name=c.mimeType?.toLowerCase();if(name==='video/h264')return /packetization-mode=1/.test(c.sdpFmtpLine||'')?0:1;if(name==='video/vp8')return 2;if(name==='video/rtx')return 4;return 3;};
 return[...codecs].sort((a,b)=>rank(a)-rank(b));
}
export function videoProgress(previous,snapshot,now){
 const state={frameAt:now,byteAt:now,...previous,status:'healthy',reconnect:false,reason:''};
 for(const[key,at]of [['videoFrames','frameAt'],['videoBytes','byteAt']]){
  const value=snapshot[key];if(!Number.isFinite(value)){state[at]=now;state[key]=null;continue;}
  if(!Number.isFinite(state[key])||value!==state[key])state[at]=now;state[key]=value;
 }
 const frameAge=now-state.frameAt,byteAge=now-state.byteAt,age=Math.max(frameAge,byteAge);
 if(age>=5000){state.status='stalled';state.reason=frameAge>=byteAge?'encoder':'transport';state.reconnect=age>=10000;}
 return state;
}
