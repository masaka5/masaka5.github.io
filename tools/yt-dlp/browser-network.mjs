const forbidden=/^(cookie|referer|user-agent|host|origin|accept-encoding|connection|content-length|sec-.*|proxy-.*)$/i;

export async function open(url,method,headersJSON,body,timeout){
 const headers=Object.fromEntries(Object.entries(JSON.parse(headersJSON)).filter(([key])=>!forbidden.test(key)));
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),Math.max(1000,timeout*1000));
 try{
  const response=await fetch(url,{method,headers,body:body??undefined,signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
  const reader=response.body?.getReader();
  return {status:response.status,url:response.url,headers:JSON.stringify(Object.fromEntries(response.headers)),
   async read(){if(!reader)return new Uint8Array();const result=await reader.read();if(result.done)clearTimeout(timer);return result.value||new Uint8Array();},
   close(){clearTimeout(timer);controller.abort();reader?.cancel().catch(()=>{});}};
 }catch(error){clearTimeout(timer);throw error;}
}
