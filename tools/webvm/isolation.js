/* Loaded inertly; only QEMU's explicit start action calls ensure(). */
(function () {
  'use strict';
  const scriptURL = new URL(document.currentScript.src);
  const scopeURL = new URL('./', scriptURL);
  const intentKey = 'toolbox-qemu-start';
  const attemptKey = 'toolbox-qemu-isolation-reload';
  let pending;

  async function enable(profileId) {
    if (window.crossOriginIsolated) return;
    if (!window.isSecureContext || !('serviceWorker' in navigator)) {
      throw new Error('此浏览器无法启用 QEMU 所需的跨源隔离。请使用支持 Service Worker 的浏览器并通过 HTTPS 打开。');
    }
    let storage;
    try {
      storage = window.sessionStorage;
      storage.setItem(intentKey, profileId || '');
      if (storage.getItem(attemptKey)) {
        storage.removeItem(intentKey);
        throw new Error('跨源隔离在重新加载后仍未生效。请关闭此标签页后重试，或检查浏览器的 Service Worker 设置。');
      }
    } catch (error) {
      if (error.message.startsWith('跨源隔离')) throw error;
      throw new Error('浏览器禁止了会话存储，无法安全地重新加载并继续启动 QEMU。请允许此站点存储后重试。');
    }
    try {
      const registration = await navigator.serviceWorker.register(new URL('isolation-worker.js', scopeURL).href, {
        scope: scopeURL.pathname, updateViaCache: 'none'
      });
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => finish(new Error('跨源隔离服务启动超时，请重试。')), 20000);
        const workers = new Set();
        function finish(error) {
          clearTimeout(timeout);
          registration.removeEventListener('updatefound', check);
          workers.forEach(worker => worker.removeEventListener('statechange', check));
          error ? reject(error) : resolve();
        }
        function check() {
          if (registration.active?.state === 'activated') return finish();
          for (const worker of [registration.installing, registration.waiting, registration.active]) {
            if (worker && !workers.has(worker)) {
              workers.add(worker);
              worker.addEventListener('statechange', check);
            }
          }
        }
        registration.addEventListener('updatefound', check);
        check();
      });
      storage.setItem(attemptKey, '1');
      location.reload();
      // The caller must not start QEMU in the document that is being replaced.
      return await new Promise(() => {});
    } catch (error) {
      storage.removeItem(intentKey);
      throw new Error('无法启用 QEMU 跨源隔离：' + error.message);
    }
  }

  window.WebVMIsolation = Object.freeze({
    ensure(profileId) {
      if (window.crossOriginIsolated) return Promise.resolve();
      if (!pending) pending = enable(profileId).catch(error => { pending = null; throw error; });
      return pending;
    }
  });
})();
