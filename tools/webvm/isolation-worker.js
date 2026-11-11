/* The registration scope is this directory only, including on GitHub Pages. */
'use strict';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    // Worker entry URLs must stay in this registration's scope. A worker loaded
    // from /vendor/ is not controlled, so its descendants lose synthetic COEP.
    const assetBase = new URL('qemu-assets/', self.registration.scope);
    let request = event.request;
    if (url.pathname.startsWith(assetBase.pathname)) {
      const name = url.pathname.slice(assetBase.pathname.length);
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)) return new Response('Invalid QEMU asset', {status: 400});
      const target = new URL('../../vendor/qemu/' + name, self.registration.scope);
      target.search = url.search;
      request = new Request(target, event.request);
    }
    const response = await fetch(request);
    // Opaque and redirect responses cannot be reconstructed as normal Responses.
    if (response.type === 'opaque' || response.type === 'opaqueredirect' || response.status === 0) return response;
    const headers = new Headers(response.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    return new Response(response.body, {
      status: response.status, statusText: response.statusText, headers
    });
  })());
});
