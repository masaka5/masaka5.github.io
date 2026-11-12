export function encodePayload(text,mode='text',ending='none'){
 if(mode==='hex'){const hex=text.replace(/\s/g,'');if(!hex||hex.length%2||!/^[\da-f]+$/i.test(hex))throw Error('HEX 需填写完整字节，例如 01 FF 0A');return Uint8Array.from(hex.match(/../g),x=>parseInt(x,16));}
 if(mode!=='text')throw Error('无效发送格式');
 const suffix={none:'',lf:'\n',cr:'\r',crlf:'\r\n'}[ending];if(suffix===undefined)throw Error('无效行尾');
 return new TextEncoder().encode(text+suffix);
}
export function validateOptions(options={}){
 const o={baudRate:115200,dataBits:8,stopBits:1,parity:'none',flowControl:'none',...options};
 if(!Number.isInteger(o.baudRate)||o.baudRate<50||o.baudRate>4000000||![7,8].includes(o.dataBits)||![1,2].includes(o.stopBits)||!['none','even','odd'].includes(o.parity)||!['none','hardware'].includes(o.flowControl))throw Error('串口参数无效');return o;
}
export class SerialSession{
 constructor(port,onData,onState=()=>{}){this.port=port;this.onData=onData;this.onState=onState;this.connected=false;this.queue=Promise.resolve();this.closing=null;this.shutdownStarted=false;}
 async open(options){if(this.connected||this.opening||this.closing)throw Error('串口正在使用');this.opening=true;try{await this.port.open(validateOptions(options));this.connected=true;this.writer=this.port.writable.getWriter();this.onState('connected');this.readTask=this.read();}catch(e){this.connected=false;throw e;}finally{this.opening=false;}}
 async read(){let failure;try{while(this.connected&&this.port.readable){this.reader=this.port.readable.getReader();try{while(this.connected){const {value,done}=await this.reader.read();if(done)break;if(value?.length)this.onData(value);}}finally{this.reader.releaseLock();this.reader=null;}break;}}catch(e){failure=e;}finally{if(this.connected){this.connected=false;this.onState('error',failure||Error('设备已断开'));queueMicrotask(()=>this.close().catch(()=>{}));}}}
 send(bytes){if(!this.connected)return Promise.reject(Error('请先连接串口'));const job=this.queue.then(()=>{if(!this.connected)throw Error('串口已断开');return this.writer.write(bytes);});this.queue=job.catch(()=>{});return job;}
 close(){if(this.closing)return this.closing;this.shutdownStarted=true;this.closing=(async()=>{this.connected=false;this.onState('closing');
  let timeout;const work=(async()=>{try{await this.reader?.cancel();}catch{}await this.readTask;
   const writer=this.writer;this.writer=null;if(writer){writer.abort().catch(()=>{});writer.releaseLock();}
   await this.port.close();this.released=true;this.onState('disconnected');})();
  try{await Promise.race([work,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('串口关闭超时，请拔出设备后重试')),4000);})]);}catch(e){this.onState('error',e);throw e;}finally{clearTimeout(timeout);}
 })();return this.closing;}
}
