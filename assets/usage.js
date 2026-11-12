(function(root){'use strict';
 function validateSnapshot(data,ids){if(!data||data.schema!==1||typeof data.updatedAt!=='string'||!Number.isFinite(Date.parse(data.updatedAt))||!data.counts||typeof data.counts!=='object'||Array.isArray(data.counts))return null;const result=Object.create(null);for(const[id,count]of Object.entries(data.counts)){if(!ids.has(id)||!Number.isSafeInteger(count)||count<0)return null;result[id]=count;}return result;}
 function rank(ids,counts){return ids.map((id,index)=>({id,index,count:counts[id]||0})).sort((a,b)=>b.count-a.count||a.index-b.index).map(x=>x.id);}
 function start(ids,onChange){const allowed=new Set(ids),cacheKey='pocket-usage-cache-v1',queueKey='pocket-usage-pending-v1';let counts=Object.create(null),config=null,flushing=false;
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  function queued(){const now=Date.now(),saved=read(queueKey,[]);return (Array.isArray(saved)?saved:[]).filter(e=>e&&allowed.has(e.tool)&&/^[0-9a-f-]{36}$/.test(e.id)&&Number.isFinite(e.time)&&now>=e.time&&now-e.time<86400000).slice(-300);}
  function accept(data){const fresh=validateSnapshot(data,allowed);if(!fresh)return;for(const[id,count]of Object.entries(fresh))counts[id]=Math.max(counts[id]||0,count);write(cacheKey,{...data,counts});onChange(counts);}
  const saved=read(cacheKey,null);if(validateSnapshot(saved,allowed)){counts=validateSnapshot(saved,allowed);queueMicrotask(()=>onChange(counts));}
  async function get(url){const response=await fetch(url,{credentials:'omit',signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error();return response.json();}
  async function refresh(){if(!config)return;try{accept(await get(config.endpoint+'/counts'));}catch{if(config.snapshotURL)try{accept(await get(config.snapshotURL));}catch{}}}
  async function flush(){if(flushing||!config?.endpoint||!navigator.onLine)return;flushing=true;try{for(const event of queued().slice(0,30)){let response;try{response=await fetch(config.endpoint+'/events',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({id:event.id,tool:event.tool}),credentials:'omit',keepalive:true,signal:AbortSignal.timeout(7000)});}catch{break;}if(response.status===429)break;if(response.ok){const data=await response.json();if(data.accepted&&Number.isSafeInteger(data.count)&&data.count>=0){counts[event.tool]=Math.max(counts[event.tool]||0,data.count);write(cacheKey,{schema:1,updatedAt:new Date().toISOString(),counts});onChange(counts);}else break;}else if(response.status>=500)break;write(queueKey,queued().filter(e=>e.id!==event.id));}}finally{flushing=false;}}
  fetch('assets/usage-config.json',{credentials:'omit'}).then(r=>r.ok?r.json():Promise.reject()).then(value=>{config=value;refresh();flush();}).catch(()=>{});
  addEventListener('online',()=>{refresh();flush();});addEventListener('pageshow',()=>{refresh();flush();});addEventListener('storage',e=>{if(e.key===cacheKey){const snapshot=read(cacheKey,null);const data=validateSnapshot(snapshot,allowed);if(data){counts=data;onChange(counts);}}});
  setInterval(()=>{refresh();flush();},60000);
  return{track(tool){if(!allowed.has(tool))return;const event={id:crypto.randomUUID(),tool,time:Date.now()};write(queueKey,[...queued(),event].slice(-300));flush();}};
 }
 root.ToolboxUsage={validateSnapshot,rank,start};if(typeof module!=='undefined')module.exports={validateSnapshot,rank,start};
})(typeof globalThis!=='undefined'?globalThis:this);
