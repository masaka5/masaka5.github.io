const queueKey='pocket-usage-pending-v1',countKey='pocket-usage-cache-v1',markerKey='pocket-tool-use-marker-v1';
const DEDUPE_MS=60_000;
let sending=false,config;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
const write=(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));}catch{}};
const writeSession=(key,data)=>{try{sessionStorage.setItem(key,JSON.stringify(data));}catch{}};
const readSession=key=>{try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}};
function pending(){return read(queueKey,[]).filter(e=>e&&typeof e.id==='string'&&typeof e.tool==='string'&&Date.now()-e.time<86400000).slice(-300);}
async function flush(){
 if(sending||!navigator.onLine)return;sending=true;
 try{
  if(!config){const r=await fetch(new URL('./usage-config.json',import.meta.url),{cache:'force-cache',credentials:'omit',signal:AbortSignal.timeout(7000)});if(!r.ok)return;config=await r.json();}
  for(const event of pending().slice(0,30)){
   const r=await fetch(config.endpoint+'/events',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({id:event.id,tool:event.tool}),credentials:'omit',keepalive:true,signal:AbortSignal.timeout(7000)});
   if(!r.ok)break;const data=await r.json();if(!data.accepted||!Number.isSafeInteger(data.count))break;
   const saved=read(countKey,{schema:1,counts:{}});saved.updatedAt=new Date().toISOString();saved.counts[event.tool]=Math.max(saved.counts[event.tool]||0,data.count);write(countKey,saved);
   write(queueKey,pending().filter(e=>e.id!==event.id));
  }
 }catch{}finally{sending=false;}
}
export function recordToolUse(id){
 if(!/^[a-z0-9][a-z0-9-]{0,150}$/.test(String(id||'')))return false;
 const now=Date.now(),marker=readSession(markerKey);
 if(marker?.tool===id&&Number.isFinite(marker.time)&&now>=marker.time&&now-marker.time<DEDUPE_MS)return false;
 const event={id:crypto.randomUUID(),tool:id,time:now};
 writeSession(markerKey,event);
 const data=read('pocket-tool-use-v1',{});data[id]=(Number(data[id])||0)+1;write('pocket-tool-use-v1',data);
 write(queueKey,[...pending(),event].slice(-300));
 void flush();
 return true;
}
if(typeof addEventListener==='function'){addEventListener('online',flush);addEventListener('pageshow',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')flush();});}
