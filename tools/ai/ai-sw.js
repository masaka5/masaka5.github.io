const CACHE='pocket-ai-shell-20261114-mobile4';
const FILES=['./','./index.html','./ai.js?v=20261114-mobile4','./ai.css?v=20261114-mobile4','./local-ai-client.js?v=20261114-mobile4','./local-ai-core.mjs?v=20261114-mobile4','./local-ai-harness.mjs?v=20261114-mobile4','./conversation-journal.mjs?v=20261114-mobile4','./chat-shortcuts.mjs?v=20261114-mobile4','./assets/local-ai-worker.js?v=20261114-mobile4','./assets/pi-runtime.js?v=20261114-mobile4','./assets/ort/ort.webgpu.bundle.min.mjs','./assets/ort/ort-wasm-simd-threaded.asyncify.mjs','./assets/ort/ort-wasm-simd-threaded.asyncify.wasm','./assets/ort/ort-wasm-simd-threaded.jsep.mjs','./assets/ort/ort-wasm-simd-threaded.jsep.wasm','../../assets/ops.css','../../assets/ops-ui.js','../../assets/favicon.svg'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('pocket-ai-shell-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const scope=new URL('./',self.location.href);
 if(!url.pathname.startsWith(scope.pathname)&&!url.pathname.startsWith(new URL('../../assets/',scope).pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),hit=await cache.match(request);
  // Runtime binaries are immutable within this release. Navigation checks for updates.
  if(hit&&request.mode!=='navigate')return hit;
  try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}catch(error){if(hit)return hit;throw error;}
 })());
});
