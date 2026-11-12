/* Scoped to tools/code/. Required by browser TypeScript language services. */
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{const r=await fetch(e.request);if(!r.status||r.type==='opaque'||r.type==='opaqueredirect')return r;const h=new Headers(r.headers);h.set('Cross-Origin-Opener-Policy','same-origin');h.set('Cross-Origin-Embedder-Policy','credentialless');return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});})());
});
