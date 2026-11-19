(function(root){'use strict';
 const CACHE='pocket-visitor-count-v1',SESSION='pocket-visitor-session-v1';
 const valid=value=>value&&value.schema===1&&Number.isSafeInteger(value.count)&&value.count>=0;
 function read(){try{const value=JSON.parse(localStorage.getItem(CACHE));if(valid(value))return{count:value.count,updated:Number(value.updated)||0};}catch{}return null;}
 function write(data){try{localStorage.setItem(CACHE,JSON.stringify({schema:1,count:data.count,updated:Date.now()}));}catch{}}
 async function config(){if(root.ToolboxUsage?.getConfig)return root.ToolboxUsage.getConfig();const response=await fetch('assets/usage-config.json',{credentials:'omit',cache:'force-cache',signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error();return response.json();}
 function start(onChange){
  let disposed=false,controller=new AbortController(),timer=null,idleHandle=null;const cached=read();if(cached)queueMicrotask(()=>{if(!disposed)onChange(cached.count);});
  async function run(){
   if(disposed)return;if(document.visibilityState==='hidden'){timer=setTimeout(run,60000);return;}controller.abort();controller=new AbortController();const signal=controller.signal;
   try{
    const settings=await config();if(disposed)return;const base=new URL(settings.endpoint);if(base.protocol!=='https:'&&base.hostname!=='127.0.0.1')return;
    const once=sessionStorage.getItem(SESSION)==='1',request=await fetch(base.origin+(once?'/visitors':'/visits'),{method:once?'GET':'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:once?undefined:'',credentials:'omit',cache:'no-store',signal,keepalive:true});
    if(!request.ok)return;const data=await request.json();if(!valid(data))return;sessionStorage.setItem(SESSION,'1');write(data);if(!disposed)onChange(data.count);timer=setTimeout(run,300000);
   }catch{}
  }
  if(root.requestIdleCallback)idleHandle=root.requestIdleCallback(run,{timeout:1400});else idleHandle=setTimeout(run,180);
  const onOnline=()=>{clearTimeout(timer);run();};const onVisibility=()=>{if(document.visibilityState==='visible'){clearTimeout(timer);run();}};addEventListener('online',onOnline);document.addEventListener('visibilitychange',onVisibility);
  return()=>{disposed=true;controller.abort();clearTimeout(timer);if(root.cancelIdleCallback&&typeof idleHandle==='number')root.cancelIdleCallback(idleHandle);else clearTimeout(idleHandle);removeEventListener('online',onOnline);document.removeEventListener('visibilitychange',onVisibility);};
 }
 root.ToolboxVisitors={read,start};
})(typeof globalThis!=='undefined'?globalThis:this);
