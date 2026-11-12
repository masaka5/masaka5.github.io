(() => {
  const { categories, tools } = ToolboxCatalog;
  const search = document.getElementById('toolSearch');
  const grid = document.getElementById('toolGrid');
  const viewport = document.getElementById('toolsViewport');
  const nav = document.getElementById('categoryNav');
  const mobileNav = document.getElementById('mobileCategoryNav');
  const select = document.getElementById('categorySelect');
  const favoritesKey = 'toolbox-favorites-v1';
  const toolIds = new Set(tools.map(tool => tool.id));
  const categoryList = [{ id:'all', name:'全部工具', icon:'layout-grid' }, { id:'favorites', name:'常用', icon:'star' }, ...categories];
  let category = 'all';
  let page = 0;
  let capacity = 1;
  let usageCounts = Object.create(null), tracker;
  function readFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
      return new Set(Array.isArray(saved) ? saved.filter(id => typeof id === 'string' && toolIds.has(id)) : []);
    } catch (_) { return new Set(); }
  }
  let favorites = readFavorites();
  let statusTimer;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function icon(name) {
    return ToolboxIcons.svg(name);
  }

  for (const item of categoryList) {
    const button = element('button');
    button.type = 'button';
    button.dataset.category = item.id;
    button.setAttribute('aria-pressed', String(item.id === category));
    const count = item.id === 'favorites' ? favorites.size : tools.filter(tool => item.id === 'all' || tool.category === item.id).length;
    button.append(icon(item.icon), element('span', '', item.name), element('small', '', String(count)));
    button.addEventListener('click', () => chooseCategory(item.id));
    nav.append(button);
    const mobileButton=element('button','');
    mobileButton.type='button';mobileButton.dataset.category=item.id;
    mobileButton.setAttribute('aria-pressed',String(item.id===category));
    mobileButton.append(icon(item.icon),element('span','',item.name));
    mobileButton.addEventListener('click',()=>chooseCategory(item.id));
    mobileNav.append(mobileButton);
    const option = element('option', '', item.name);
    option.value = item.id;
    select.append(option);
  }

  const cards = [];
  // 分类顺序由配置决定，工具在各自分类内保持配置顺序。
  for (const group of categories) {
    for (const tool of tools.filter(item => item.category === group.id)) {
      const card = element('article', 'tool-card');
      const link = element('a', 'tool-link');
      link.href = tool.href;
      link.addEventListener('click', event => { if (event.isTrusted && event.button === 0) tracker?.track(tool.id); });
      link.addEventListener('auxclick', event => { if (event.isTrusted && event.button === 1) tracker?.track(tool.id); });
      card.dataset.tool = tool.id;
      card.dataset.group = tool.category;
      card.dataset.icon = tool.icon;
      card.dataset.search = [tool.name, tool.description, group.name, ...(tool.tags || []), tool.keywords || ''].join(' ').toLocaleLowerCase();
      const top = element('div', 'card-top');
      const badge = ToolboxIcons.tile(tool);
      top.append(badge, element('span', 'card-category', group.name));
      const copy = element('div', 'card-copy');
      copy.append(element('h3', '', tool.name));
      link.append(top, copy);
      const favorite = element('button', 'favorite-toggle');
      favorite.type = 'button';
      favorite.dataset.favorite = tool.id;
      favorite.append(icon('star'));
      favorite.addEventListener('click', () => {
        const hadFocus = document.activeElement === favorite;
        if (favorites.has(tool.id)) favorites.delete(tool.id); else favorites.add(tool.id);
        try { localStorage.setItem(favoritesKey, JSON.stringify([...favorites])); }
        catch (_) {
          const notice = document.getElementById('homeStatus');
          notice.textContent = '收藏仅在本次访问有效';notice.hidden = false;
          clearTimeout(statusTimer);statusTimer = setTimeout(() => { notice.hidden = true; }, 5000);
        }
        render();
        if (hadFocus && card.hidden) {
          const next = cards.find(c => !c.hidden)?.querySelector('.favorite-toggle');
          (next || search).focus();
        }
      });
      const usage = element('span', 'tool-usage', '打开 — 次');
      usage.title = '累计打开次数';
      card.append(link, favorite, usage);
      cards.push(card);
      grid.append(card);
    }
  }

  function render() {
    const focused = grid.contains(document.activeElement) ? document.activeElement : null;
    const sortedIds = ToolboxUsage.rank(cards.map(card => card.dataset.tool), usageCounts);
    const order = new Map(sortedIds.map((id, index) => [id,index]));
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = cards.filter(card => (category === 'all' || category === 'favorites' && favorites.has(card.dataset.tool) || card.dataset.group === category) && card.dataset.search.includes(query)).sort((a,b)=>order.get(a.dataset.tool)-order.get(b.dataset.tool));
    for (const card of filtered) grid.append(card);
    const pages = Math.max(1, Math.ceil(filtered.length / capacity));
    page = Math.max(0, Math.min(page, pages - 1));
    const visible = new Set(filtered.slice(page * capacity, (page + 1) * capacity));
    for (const card of cards) {
      card.hidden = !visible.has(card);
      const count = usageCounts[card.dataset.tool];
      card.querySelector('.tool-usage').textContent = '打开 ' + (count === undefined ? '—' : count.toLocaleString('zh-CN')) + ' 次';
      const button = card.querySelector('.favorite-toggle'), saved = favorites.has(card.dataset.tool);
      const name = card.querySelector('h3').textContent;
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', (saved ? '取消收藏 ' : '收藏 ') + name);
      button.title = saved ? '取消收藏' : '收藏';
    }
    nav.querySelector('[data-category="favorites"] small').textContent = String(favorites.size);
    grid.hidden = filtered.length === 0;
    document.getElementById('emptyState').hidden = filtered.length !== 0;
    document.getElementById('resultCount').textContent = String(filtered.length);
    document.querySelector('#emptyState h3').textContent = category === 'favorites' && !query ? '暂无收藏' : '未找到工具';
    document.getElementById('toolsHeading').textContent = categoryList.find(item => item.id === category).name;
    document.getElementById('resetFilters').hidden = category === 'all' && !query;
    document.getElementById('pagination').dataset.single = String(pages === 1);
    document.getElementById('pageStatus').textContent = `${page + 1} / ${pages}`;
    document.getElementById('prevPage').disabled = page === 0;
    document.getElementById('nextPage').disabled = page === pages - 1;
    if (focused && !focused.closest('.tool-card').hidden) focused.focus({preventScroll:true});
  }
  function chooseCategory(value) {
    category = value;
    select.value = value;
    for (const button of nav.children) button.setAttribute('aria-pressed', String(button.dataset.category === value));
    for (const button of mobileNav.children) button.setAttribute('aria-pressed',String(button.dataset.category===value));
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
  window.addEventListener('storage', event => {
    if (event.key === favoritesKey || event.key === null) { favorites = readFavorites(); render(); }
  });
  tracker = ToolboxUsage.start(tools.map(tool => tool.id), counts => { usageCounts = counts; render(); });
  measure();
})();
