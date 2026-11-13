const VERSION='pocket-qr-3e75b88b30fab901';
const REVISION='8bc8ece846d231a5';
const FILES=['./','./index.html',...['app.js','app.css','worker.js','decode-worker.js'].map(name=>'./assets/'+name+'?v='+REVISION),'./assets/zstd.wasm','./assets/decimen.wasm.gz','../../vendor/zxing/reader.js','../../vendor/zxing/zxing_reader.wasm','../../assets/favicon.svg'].map(p=>new URL(p,self.location.href).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(VERSION);await cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})));await self.skipWaiting();}catch(error){await caches.delete(VERSION);for(const client of await self.clients.matchAll({includeUncontrolled:true}))client.postMessage({type:'OFFLINE_ERROR'});throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('pocket-qr-')&&name!==VERSION)await caches.delete(name);await self.clients.claim();for(const client of await self.clients.matchAll())client.postMessage({type:'OFFLINE_READY',revision:REVISION});})()));
self.addEventListener('message',event=>{if(event.data?.type==='OFFLINE_STATUS')event.waitUntil((async()=>{const cache=await caches.open(VERSION);const cached=await Promise.all(FILES.map(url=>cache.match(url)));if(cached.every(Boolean))event.source?.postMessage({type:'OFFLINE_READY',revision:REVISION});})());});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;const url=new URL(event.request.url),page=new URL('./',self.location.href);
 if(!FILES.some(file=>{const known=new URL(file);return known.origin===url.origin&&known.pathname===url.pathname;}))return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION),documentRequest=event.request.mode==='navigate'&&(url.pathname===page.pathname||url.pathname===page.pathname+'index.html');
  if(documentRequest){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);try{const response=await fetch(event.request,{cache:'no-cache',signal:controller.signal});if(response.ok)return response;}catch{}finally{clearTimeout(timer);}const offline=await cache.match(page.href);if(offline)return offline;return fetch(event.request);}
  const cached=await cache.match(event.request);return cached||fetch(event.request,{cache:'no-cache'});
 })());
});
