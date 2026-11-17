(function(root){'use strict';
 const CACHE='pocket-visitor-count-v1',SESSION='pocket-visitor-session-v1';
 const valid=value=>value&&value.schema===1&&Number.isSafeInteger(value.count)&&value.count>=0;
 function read(){try{const value=JSON.parse(localStorage.getItem(CACHE));if(valid(value))return{count:value.count,updated:Number(value.updated)||0};}catch{}return null;}
 function write(data){try{localStorage.setItem(CACHE,JSON.stringify({schema:1,count:data.count,updated:Date.now()}));}catch{}}
 function start(onChange){
  let disposed=false,controller=new AbortController(),timer=null;const cached=read();if(cached)queueMicrotask(()=>{if(!disposed)onChange(cached.count);});
  async function run(){
   controller.abort();controller=new AbortController();const signal=controller.signal;
   try{
    const config=await fetch('assets/usage-config.json',{credentials:'omit',cache:'no-store',signal});if(!config.ok)return;const {endpoint}=await config.json();const base=new URL(endpoint);if(base.protocol!=='https:'&&base.hostname!=='127.0.0.1')return;
    const once=sessionStorage.getItem(SESSION)==='1',request=await fetch(base.origin+(once?'/visitors':'/visits'),{method:once?'GET':'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:once?undefined:'',credentials:'omit',cache:'no-store',signal,keepalive:true});
    if(!request.ok)return;const data=await request.json();if(!valid(data))return;sessionStorage.setItem(SESSION,'1');write(data);if(!disposed)onChange(data.count);timer=setTimeout(run,300000);
   }catch{}
  }
  run();addEventListener('online',run);return()=>{disposed=true;controller.abort();clearTimeout(timer);removeEventListener('online',run);};
 }
 root.ToolboxVisitors={read,start};
})(typeof globalThis!=='undefined'?globalThis:this);