(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else {
    root.WorkspaceUI = factory();
    root.WorkspaceUI.initialize();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function getLogPage(total, height, requestedPage) {
    const size = Math.max(1, Math.floor(height / 58));
    const pages = Math.max(1, Math.ceil(total / size));
    const page = Math.max(0, Math.min(pages - 1, requestedPage));
    return { page, pages, size, start: page * size, end: Math.min(total, (page + 1) * size) };
  }

  function initialize() {
    const shell = document.querySelector('.app-shell');
    const log = document.getElementById('eventLog');
    const previous = document.getElementById('logPrev');
    const next = document.getElementById('logNext');
    const pageLabel = document.getElementById('logPage');
    const quickPause = document.getElementById('quickPause');
    const quickStop = document.getElementById('quickStop');
    const pause = document.getElementById('pauseBtn');
    const stop = document.getElementById('stopBtn');
    let currentPage = 0;
    let redrawPending = false;

    function renderLog() {
      if (!log.clientHeight) return;
      const entries = Array.from(log.querySelectorAll('.log-entry'));
      const pagination = getLogPage(entries.length, log.clientHeight, currentPage);
      currentPage = pagination.page;
      entries.forEach((entry, index) => {
        entry.hidden = index < pagination.start || index >= pagination.end;
        entry.title = entry.textContent;
      });
      pageLabel.textContent = (pagination.page + 1) + ' / ' + pagination.pages;
      previous.disabled = pagination.page === 0;
      next.disabled = pagination.page >= pagination.pages - 1;
    }

    function refreshLayout() {
      if (redrawPending) return;
      redrawPending = true;
      requestAnimationFrame(() => {
        redrawPending = false;
        renderLog();
        if (typeof drawChart === 'function') drawChart();
      });
    }

    document.querySelectorAll('[data-view-target]').forEach((button) => {
      button.addEventListener('click', () => {
        shell.dataset.view = button.dataset.viewTarget;
        document.querySelectorAll('.view-nav [data-view-target]').forEach((navButton) => {
          navButton.setAttribute('aria-pressed', String(navButton.dataset.viewTarget === shell.dataset.view));
        });
        refreshLayout();
      });
    });
    previous.addEventListener('click', () => { currentPage -= 1; renderLog(); });
    next.addEventListener('click', () => { currentPage += 1; renderLog(); });
    quickPause.addEventListener('click', () => pause.click());
    quickStop.addEventListener('click', () => stop.click());
    function syncActions() {
      quickPause.disabled = pause.disabled;
      quickPause.textContent = pause.textContent;
      quickStop.disabled = stop.disabled;
    }
    new MutationObserver(syncActions).observe(pause, { attributes: true, childList: true, subtree: true, characterData: true });
    new MutationObserver(syncActions).observe(stop, { attributes: true });
    new MutationObserver(renderLog).observe(log, { childList: true });
    const resize = new ResizeObserver(refreshLayout);
    resize.observe(log);
    resize.observe(document.querySelector('.chart-wrap'));
    syncActions();
    refreshLayout();
  }

  return { getLogPage, initialize };
});
