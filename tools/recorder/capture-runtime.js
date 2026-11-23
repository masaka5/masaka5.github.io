/* Keep the recorder's audio track stable when input devices change. */
globalThis.RecorderAudioMixer = class RecorderAudioMixer {
 constructor(onLevel) {
  const AudioCtor=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!AudioCtor)throw Error('当前浏览器不支持音频混合');
  this.context=new AudioCtor({latencyHint:'interactive'});
  this.destination=this.context.createMediaStreamDestination();
  this.slots=new Map();this.closed=false;
  // A silent source keeps the same live track even with all inputs turned off.
  this.silence=this.context.createConstantSource();this.silence.offset.value=0;
  this.silence.connect(this.destination);this.silence.start();
  this.analyser=this.context.createAnalyser();this.analyser.fftSize=256;
  const samples=new Float32Array(this.analyser.fftSize);
  this.meter=setInterval(()=>{
   this.analyser.getFloatTimeDomainData(samples);let total=0;
   for(const sample of samples)total+=sample*sample;
   onLevel(Math.min(1,Math.sqrt(total/samples.length)*5));
  },100);
  this.onLevel=onLevel;
 }
 async resume(){await this.context.resume();}
 connect(name,stream){
  const tracks=stream?.getAudioTracks().filter(track=>track.readyState==='live')||[];
  const source=tracks.length?this.context.createMediaStreamSource(new MediaStream(tracks)):null;
  const previous=this.slots.get(name);previous?.source?.disconnect();
  const slot=previous||{gain:this.context.createGain(),source:null};
  if(!previous){slot.gain.connect(this.destination);if(name==='microphone')slot.gain.connect(this.analyser);this.slots.set(name,slot);}
  slot.source=source;if(source)source.connect(slot.gain);
 }
 mute(name,muted){const gain=this.slots.get(name)?.gain.gain;if(!gain||this.closed)return;gain.setTargetAtTime(muted?0:1,this.context.currentTime,.008);}
 close(){
  if(this.closed)return;this.closed=true;clearInterval(this.meter);
  for(const slot of this.slots.values()){slot.source?.disconnect();slot.gain.disconnect();}this.slots.clear();
  this.silence.stop();this.silence.disconnect();this.destination.stream.getTracks().forEach(track=>track.stop());
  this.onLevel(0);this.context.close().catch(()=>{});
 }
};
