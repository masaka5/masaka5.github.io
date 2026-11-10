(() => {
  const { categories, tools } = ToolboxCatalog;
  const search = document.getElementById('toolSearch');
  const grid = document.getElementById('toolGrid');
  const viewport = document.getElementById('toolsViewport');
  const nav = document.getElementById('categoryNav');
  const select = document.getElementById('categorySelect');
  const recentKey = 'toolbox-recent-v1';
  const icons = {
    chat:'<path d="M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0Z"/><path d="M7 10h9M7 14h6"/>',
    network:'<rect x="8" y="2" width="8" height="6" rx="1"/><path d="M12 8v5M4 13h16M4 13v3m8-3v3m8-3v3"/><rect x="1" y="16" width="6" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><rect x="17" y="16" width="6" height="5" rx="1"/>',
    windows:'<path d="M3 5 11 4v7H3zm10-1 8-1v8h-8zM3 13h8v7l-8-1zm10 0h8v8l-8-1z"/>',
    monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4M6 7h5m-5 3h8"/>',
    all:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4" rx=".5"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
    nfc:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M9 7c4 0 7 3 7 7M9 10c2.2 0 4 1.8 4 4M9 13v1m1 4h4"/>',
    convert:'<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>'
  };
  const categoryList = [{ id:'all', name:'全部工具', icon:'all' }, ...categories];
  let category = 'all';
  let page = 0;
  let capacity = 1;
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(recentKey) || '[]'); } catch (_) {}
  if (!Array.isArray(recent)) recent = [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function icon(name) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    node.setAttribute('viewBox', '0 0 24 24');
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = icons[name] || icons.all;
    return node;
  }

  for (const item of categoryList) {
    const button = element('button');
    button.type = 'button';
    button.dataset.category = item.id;
    button.setAttribute('aria-pressed', String(item.id === category));
    button.append(icon(item.icon), element('span', '', item.name), element('small', '', String(tools.filter(tool => item.id === 'all' || tool.category === item.id).length)));
    button.addEventListener('click', () => chooseCategory(item.id));
    nav.append(button);
    const option = element('option', '', item.name);
    option.value = item.id;
    select.append(option);
  }

  const cards = [];
  // 分类顺序由配置决定，工具在各自分类内保持配置顺序。
  for (const group of categories) {
    for (const tool of tools.filter(item => item.category === group.id)) {
      const card = element('a', 'tool-card');
      card.href = tool.href;
      card.dataset.tool = tool.id;
      card.dataset.group = tool.category;
      card.dataset.icon = tool.icon;
      card.dataset.search = [tool.name, tool.description, group.name, ...(tool.tags || []), tool.keywords || ''].join(' ').toLocaleLowerCase();
      const top = element('div', 'card-top');
      const badge = element('span', 'tool-icon');
      badge.append(icon(tool.icon));
      top.append(badge, element('span', 'card-category', group.name));
      const copy = element('div', 'card-copy');
      copy.append(element('h3', '', tool.name), element('p', '', tool.description));
      card.append(top, copy);
      card.addEventListener('click', () => {
        recent = [tool.id, ...recent.filter(id => id !== tool.id)].slice(0, 3);
        try { localStorage.setItem(recentKey, JSON.stringify(recent)); } catch (_) {}
      });
      cards.push(card);
      grid.append(card);
    }
  }

  function renderRecent() {
    const container = document.getElementById('recentTools');
    container.replaceChildren();
    for (const id of [...new Set(recent)].slice(0, 3)) {
      const tool = tools.find(item => item.id === id);
      if (!tool) continue;
      const link = element('a', '', tool.name);
      link.href = tool.href;
      container.append(link);
    }
    document.querySelector('.home-footer').hidden = !container.childElementCount;
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = cards.filter(card => (category === 'all' || card.dataset.group === category) && card.dataset.search.includes(query));
    const pages = Math.max(1, Math.ceil(filtered.length / capacity));
    page = Math.max(0, Math.min(page, pages - 1));
    const visible = new Set(filtered.slice(page * capacity, (page + 1) * capacity));
    for (const card of cards) card.hidden = !visible.has(card);
    grid.hidden = filtered.length === 0;
    document.getElementById('emptyState').hidden = filtered.length !== 0;
    document.getElementById('resultCount').textContent = filtered.length + ' 项工具';
    document.getElementById('toolsHeading').textContent = categoryList.find(item => item.id === category).name;
    document.getElementById('resetFilters').hidden = category === 'all' && !query;
    document.getElementById('pagination').dataset.single = String(pages === 1);
    document.getElementById('pageStatus').textContent = `${page + 1} / ${pages}`;
    document.getElementById('prevPage').disabled = page === 0;
    document.getElementById('nextPage').disabled = page === pages - 1;
  }
  function chooseCategory(value) {
    category = value;
    select.value = value;
    for (const button of nav.children) button.setAttribute('aria-pressed', String(button.dataset.category === value));
    page = 0;
    render();
  }
  function reset() {
    search.value = '';
    chooseCategory('all');
  }
  function measure() {
    const style = getComputedStyle(grid);
    const columns = Number(style.getPropertyValue('--columns')) || 1;
    const height = parseFloat(style.getPropertyValue('--card-height')) || 208;
    const gap = parseFloat(style.rowGap) || 16;
    const nextCapacity = columns * Math.max(1, Math.floor((viewport.clientHeight + gap) / (height + gap)));
    const firstIndex = page * capacity;
    capacity = nextCapacity;
    page = Math.floor(firstIndex / capacity);
    render();
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('compact-nav');
    const region = document.querySelector('.nav-region');
    if (region.clientHeight > 0 && nav.offsetHeight > region.clientHeight) sidebar.classList.add('compact-nav');
  }

  select.addEventListener('change', () => chooseCategory(select.value));
  search.addEventListener('input', () => { page = 0; render(); });
  document.getElementById('resetSearch').addEventListener('click', () => { reset(); search.focus(); });
  document.getElementById('resetFilters').addEventListener('click', reset);
  document.getElementById('prevPage').addEventListener('click', () => { page--; render(); });
  document.getElementById('nextPage').addEventListener('click', () => { page++; render(); });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
      event.preventDefault(); search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; page = 0; render(); search.blur(); }
  });
  let pending = 0;
  const resize = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(measure); };
  new ResizeObserver(resize).observe(viewport);
  window.addEventListener('resize', resize);
  renderRecent();
  measure();
})();
