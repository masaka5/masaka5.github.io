import{LocalAiClient}from'../ai/local-ai-client.js';
// Same cached Spark Q4 model and Pi lifecycle; direct-answer mode for document extraction.
export class SummaryClient extends LocalAiClient{
 ensureWorker(){
  if(this.worker)return;
  const worker=this.worker=new Worker(new URL('./assets/summary-worker.js',import.meta.url),{type:'module'});
  worker.onmessage=event=>{if(this.worker===worker)this.message(event.data||{});};
  worker.onerror=event=>{event.preventDefault?.();if(this.worker===worker)this.fail('纪要模型运行中断，请重试');};
  worker.onmessageerror=()=>{if(this.worker===worker)this.fail('纪要模型通信中断，请重试');};
 }
}
