import {mediaFetch,requestPlan} from './transport.mjs';
let network={};
export function configure(value){network={mode:['auto','direct','relay'].includes(value?.mode)?value.mode:'auto'};}
export function plan(url,method,headersJSON){const result=requestPlan(url,{method,headers:JSON.parse(headersJSON)},network);return JSON.stringify({url:result.url,method:result.init.method||method,headers:result.init.headers});}

export async function open(url,method,headersJSON,body,timeout){
 const headers=JSON.parse(headersJSON);
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),Math.max(1000,timeout*1000));
 try{
  const response=await mediaFetch(url,{method,headers,body:body??undefined,signal:controller.signal},network);
  const reader=response.body?.getReader();
  return {status:response.status,url:response.url,headers:JSON.stringify(Object.fromEntries(response.headers)),
   async read(){if(!reader)return new Uint8Array();const result=await reader.read();if(result.done)clearTimeout(timer);return result.value||new Uint8Array();},
   close(){clearTimeout(timer);controller.abort();reader?.cancel().catch(()=>{});}};
 }catch(error){clearTimeout(timer);throw error;}
}
