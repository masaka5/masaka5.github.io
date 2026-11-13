export class StreamingPlayer {
 constructor({contextFactory=()=>new AudioContext({latencyHint:'interactive'})}={}){
  this.contextFactory=contextFactory;this.context=null;this.id=null;this.cursor=0;this.sources=new Set();this.enabled=true;
 }
 async begin(id){this.stop();this.id=id;this.context??=this.contextFactory();await this.context.resume();this.cursor=this.context.currentTime+.08;}
 append(id,samples,rate=24000){
  if(id!==this.id||!this.enabled||!this.context||!samples.length)return;
  const buffer=this.context.createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);
  const source=this.context.createBufferSource();source.buffer=buffer;source.connect(this.context.destination);
  source.onended=()=>{this.sources.delete(source);source.disconnect?.();};
  const start=Math.max(this.context.currentTime+.025,this.cursor);
  source.start(start);this.cursor=start+buffer.duration;this.sources.add(source);
 }
 setEnabled(enabled){this.enabled=enabled;if(!enabled)this.clear();}
 clear(){for(const source of this.sources){source.onended=null;try{source.stop();source.disconnect?.();}catch{}}this.sources.clear();this.cursor=this.context?.currentTime||0;}
 stop(){this.clear();this.id=null;}
}
