(function(root){'use strict';
 const configURL=typeof document!=='undefined'&&document.currentScript?.src?new URL('usage-config.json',document.currentScript.src).href:'assets/usage-config.json';const markerKey='pocket-tool-use-marker-v1';
 let configPromise=null;
 function getConfig(){if(!configPromise)configPromise=fetch(configURL,{credentials:'omit',cache:'force-cache',signal:AbortSignal.timeout(7000)}).then(response=>{if(!response.ok)throw Error();return response.json();}).catch(error=>{configPromise=null;throw error;});return configPromise;}
 function validateSnapshot(data,ids){if(!data||data.schema!==1||typeof data.updatedAt!=='string'||!Number.isFinite(Date.parse(data.updatedAt))||!data.counts||typeof data.counts!=='object'||Array.isArray(data.counts))return null;const result=Object.create(null);for(const[id,count]of Object.entries(data.counts)){if(!ids.has(id)||!Number.isSafeInteger(count)||count<0)return null;result[id]=count;}return result;}
 function rank(ids,counts){return ids.map((id,index)=>({id,index,count:counts[id]||0})).sort((a,b)=>b.count-a.count||a.index-b.index).map(x=>x.id);}
 function start(ids,onChange){const allowed=new Set(ids),cacheKey='pocket-usage-cache-v1',queueKey='pocket-usage-pending-v1';let counts=Object.create(null),config=null,flushing=false,disposed=false,idleHandle=null;
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  function queued(){const now=Date.now(),saved=read(queueKey,[]);return (Array.isArray(saved)?saved:[]).filter(entry=>entry&&allowed.has(entry.tool)&&/^[0-9a-f-]{36}$/.test(entry.id)&&Number.isFinite(entry.time)&&now>=entry.time&&now-entry.time<86400000).slice(-300);}
  function accept(data){const fresh=validateSnapshot(data,allowed);if(!fresh)return;for(const[id,count]of Object.entries(fresh))counts[id]=Math.max(counts[id]||0,count);write(cacheKey,{...data,counts});onChange(counts);}
  const saved=read(cacheKey,null),validSaved=validateSnapshot(saved,allowed);if(validSaved){counts=validSaved;queueMicrotask(()=>{if(!disposed)onChange(counts);});}
  async function get(url){const response=await fetch(url,{credentials:'omit',cache:'default',signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error();return response.json();}
  async function refresh(){if(disposed||!config||document.visibilityState==='hidden')return;try{accept(await get(config.endpoint+'/counts'));}catch{if(config.snapshotURL)try{accept(await get(config.snapshotURL));}catch{}}}
  async function flush(){if(disposed||flushing||!config?.endpoint||!navigator.onLine)return;flushing=true;try{for(const event of queued().slice(0,30)){let response;try{response=await fetch(config.endpoint+'/events',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({id:event.id,tool:event.tool}),credentials:'omit',keepalive:true,signal:AbortSignal.timeout(7000)});}catch{break;}if(response.status===429)break;if(response.ok){const data=await response.json();if(data.accepted&&Number.isSafeInteger(data.count)&&data.count>=0){counts[event.tool]=Math.max(counts[event.tool]||0,data.count);write(cacheKey,{schema:1,updatedAt:new Date().toISOString(),counts});onChange(counts);}else break;}else if(response.status>=500)break;write(queueKey,queued().filter(entry=>entry.id!==event.id));}}finally{flushing=false;}}
  const bootstrap=()=>{getConfig().then(value=>{if(disposed)return;config=value;refresh();flush();}).catch(()=>{});};
  if(root.requestIdleCallback)idleHandle=root.requestIdleCallback(bootstrap,{timeout:1200});else idleHandle=setTimeout(bootstrap,120);
  const onOnline=()=>{if(config){refresh();flush();}else bootstrap();};
  const onPageShow=()=>{if(config){refresh();flush();}else bootstrap();};
  const onVisibility=()=>{if(document.visibilityState==='visible'){if(config){refresh();flush();}else bootstrap();}};
  const onStorage=event=>{if(event.key!==cacheKey)return;const snapshot=read(cacheKey,null),data=validateSnapshot(snapshot,allowed);if(data){counts=data;onChange(counts);}};
  addEventListener('online',onOnline);addEventListener('pageshow',onPageShow);addEventListener('storage',onStorage);document.addEventListener('visibilitychange',onVisibility);
  const interval=setInterval(()=>{if(document.visibilityState==='visible'){if(config){refresh();flush();}else bootstrap();}},300000);
  return{track(tool){if(disposed||!allowed.has(tool)||['minutes','qwen-tts'].includes(tool))return false;const event={id:crypto.randomUUID(),tool,time:Date.now()};try{sessionStorage.setItem(markerKey,JSON.stringify(event));}catch{}write(queueKey,[...queued(),event].slice(-300));flush();return true;},dispose(){disposed=true;if(root.cancelIdleCallback&&typeof idleHandle==='number')root.cancelIdleCallback(idleHandle);else clearTimeout(idleHandle);clearInterval(interval);removeEventListener('online',onOnline);removeEventListener('pageshow',onPageShow);removeEventListener('storage',onStorage);document.removeEventListener('visibilitychange',onVisibility);}};
 }
 root.ToolboxUsage={validateSnapshot,rank,start,getConfig};if(typeof module!=='undefined')module.exports={validateSnapshot,rank,start,getConfig};
})(typeof globalThis!=='undefined'?globalThis:this);
