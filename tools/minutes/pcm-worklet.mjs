class MeetingPcm extends AudioWorkletProcessor {
  constructor(){
    super();this.enabled=false;this.phase=0;this.packet=new Float32Array(8000);this.at=0;
    this.port.onmessage=({data})=>{
      if(data.type==='state'){if(!data.enabled)this.flush();this.enabled=data.enabled;}
      if(data.type==='flush'){this.flush();this.port.postMessage({type:'flushed',id:data.id});}
    };
  }
  flush(){if(this.at){const samples=this.packet.slice(0,this.at);this.port.postMessage({samples},[samples.buffer]);this.at=0;}}
  process(inputs){
    if(!this.enabled||!inputs[0]?.length)return true;
    const channels=inputs[0];
    for(let i=0;i<channels[0].length;i++){
      this.phase+=16000;
      if(this.phase>=sampleRate){
        this.phase-=sampleRate;let value=0;for(const channel of channels)value+=channel[i];
        this.packet[this.at++]=value/channels.length;
        if(this.at===this.packet.length)this.flush();
      }
    }
    return true;
  }
}
registerProcessor('meeting-pcm',MeetingPcm);
