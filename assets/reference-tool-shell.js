(() => {
  'use strict';
  const script = document.currentScript;
  const marker = '/assets/reference-tool-shell.js';
  const scriptUrl = script ? script.src : '';
  const markerIndex = scriptUrl.indexOf(marker);
  const root = markerIndex >= 0 ? scriptUrl.slice(0, scriptUrl.lastIndexOf('/', markerIndex) + 1) : '/';
  const path = location.pathname;
  const isEmbedded = window.self !== window.top;
  const isInternal = /\/(?:assets|vendor)\//.test(path) || /(?:qemu-host|update)\.html$/.test(path);
  if (isEmbedded || isInternal) return;

  const isBackLink = (link) => {
    const href = link.getAttribute('href') || '';
    const text = (link.textContent || '').replace(/\s+/g, '').trim();
    return /工具箱|返回首页|返回工具站/.test(text) && (href === '/' || href === './' || href === '../../' || href === '../../../' || href.startsWith(root));
  };

  const install = () => {
    if (document.getElementById('referenceToolBack')) return true;
    const links = [...document.querySelectorAll('a')].filter(isBackLink);
    links.forEach((link) => { link.hidden = true; });
    const header = document.querySelector('header');
    header?.classList.add('reference-tool-header-with-back');
    const back = document.createElement('a');
    back.id = 'referenceToolBack';
    back.className = 'reference-tool-back';
    back.href = root;
    back.setAttribute('aria-label', '返回工具箱');
    back.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/><path d="M9 12h10"/></svg><span>工具箱</span>';
    document.body.append(back);
    return true;
  };

  const schedule = () => {
    if (install()) return;
    let tries = 0;
    const timer = setInterval(() => {
      if (install() || ++tries > 20) clearInterval(timer);
    }, 150);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
})();