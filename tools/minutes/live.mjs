/**
 * Serialises short PCM packets while a meeting is being recorded.
 * A packet is kept in the supplied store until recognition resolves, so a
 * model that loads slowly or a page that is briefly backgrounded does not
 * silently lose speech.
 */
export class LiveSpeechQueue {
  constructor({call,store,onError=()=>{}}={}){
    this.call=call;this.store=store;this.onError=onError;this.pending=[];
    this.running=false;this.started=false;this.closed=false;this.chain=Promise.resolve();this.writes=Promise.resolve();this.error=null;
  }
  async start(options={}){
    if(this.started)return this.chain;
    this.started=true;this.closed=false;
    this.chain=this.chain.then(()=>this.call('live-start',{options}));
    this.chain.catch(error=>{this.error=error;this.onError(error);});
    return this.chain;
  }
  async push(samples){
    if(this.closed||!samples?.length)return;
    const packet=Float32Array.from(samples),id=crypto.randomUUID();
    const write=this.writes.then(async()=>{
      if(this.store)await this.store.put(id,packet);
      this.pending.push(this.store?{id}:{id,samples:packet});
      this.drain().catch(()=>{});
    });
    this.writes=write;
    return write;
  }
  drain(){
    if(this.running)return this.chain;
    this.running=true;
    this.chain=this.chain.then(async()=>{
      while(this.pending.length){
        const item=this.pending[0];
        try{
          const samples=this.store?await this.store.get(item.id):item.samples;
          await this.call('live-audio',{samples});
          this.pending.shift();
          if(this.store)await this.store.remove(item.id);
        }catch(error){this.error=error;this.onError(error);throw error;}
      }
    }).finally(()=>{this.running=false;});
    return this.chain;
  }
  async finish(){
    this.closed=true;
    await this.writes;
    await this.drain();
    await this.chain;
    if(this.started)await this.call('live-finish');
    this.started=false;
  }
  async cancel(){this.closed=true;try{await this.chain;}catch{}this.started=false;}
}
