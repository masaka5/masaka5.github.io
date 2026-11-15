import {
  buildInstallScript,
  communitySearchUrl,
  createStoreSearchRequest,
  isValidPackageId,
  normalizeCommunityResults,
  normalizeStoreResults,
  normalizeRestResults,
  parseStoreSearchResponse,
  searchFontPackages,
  readSelections,
} from './winget-core.mjs';

const SELECTION_KEY = 'winget-selected-v2';
const LEGACY_SELECTION_KEY = 'winget-selected';
const SOURCE_KEY = 'winget-custom-source-v1';
const PAGE_SIZE = 50;
const STORE_SEARCH = 'https://apps.microsoft.com/search?query=';
const popular = [
  ['Google.Chrome', 'Google Chrome', 'Google LLC', 'browser web'],
  ['Microsoft.Edge', 'Microsoft Edge', 'Microsoft', 'browser web'],
  ['Microsoft.PowerToys', 'PowerToys', 'Microsoft', 'utility productivity'],
  ['Microsoft.VisualStudioCode', 'Visual Studio Code', 'Microsoft', 'development editor'],
  ['Git.Git', 'Git', 'Git Project', 'development version-control'],
  ['OpenJS.NodeJS.LTS', 'Node.js LTS', 'OpenJS Foundation', 'development runtime'],
  ['Python.Python.3.12', 'Python 3.12', 'Python Software Foundation', 'development language'],
  ['7zip.7zip', '7-Zip', 'Igor Pavlov', 'archive utility'],
  ['Notepad++.Notepad++', 'Notepad++', 'Don Ho', 'editor'],
  ['Mozilla.Firefox', 'Mozilla Firefox', 'Mozilla', 'browser web'],
  ['VideoLAN.VLC', 'VLC media player', 'VideoLAN', 'video audio'],
  ['Valve.Steam', 'Steam', 'Valve', 'game gaming'],
  ['Discord.Discord', 'Discord', 'Discord Inc.', 'chat communication'],
  ['OBSProject.OBSStudio', 'OBS Studio', 'OBS Project', 'record stream video'],
  ['PuTTY.PuTTY', 'PuTTY', 'Simon Tatham', 'ssh terminal network'],
  ['WiresharkFoundation.Wireshark', 'Wireshark', 'Wireshark Foundation', 'network packet'],
].map(([id, name, publisher, tags]) => ({
  id, name, publisher, tags: tags.split(' '), version: '', description: '',
  sourceType: 'community', sourceName: 'winget',
}));

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const packageKey = item => `${item.sourceType || 'community'}:${item.sourceName || 'winget'}:${item.id}`;
const selected = new Map();
const storedSelections = readSelections(localStorage.getItem(SELECTION_KEY) ?? localStorage.getItem(LEGACY_SELECTION_KEY));
for (const item of storedSelections) selected.set(packageKey(item), item);

function readSourceConfig() {
  try {
    const value = JSON.parse(localStorage.getItem(SOURCE_KEY) || '{}');
    return { name: String(value.name || '').trim(), url: String(value.url || '').trim() };
  } catch {
    return { name: '', url: '' };
  }
}

let customSource = readSourceConfig();
let packages = [...popular];
let visible = [];
let filter = 'all';
let page = 0;
let total = popular.length;
let controller = null;
let requestSerial = 0;
let storeCursor = '';
let storeHasMore = false;
const STORE_CACHE_TTL = 5 * 60 * 1000;
const STORE_SEARCH_TIMEOUT_MS = 10000;
const STORE_CACHE_LIMIT = 40;
const storeCache = new Map();

function getStoreCache(key) {
  const entry = storeCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > STORE_CACHE_TTL) {
    storeCache.delete(key);
    return null;
  }
  storeCache.delete(key);
  storeCache.set(key, entry);
  return entry.value;
}

function storeSearchSignal(signal) {
  if (typeof AbortSignal.any === 'function' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.any([signal, AbortSignal.timeout(STORE_SEARCH_TIMEOUT_MS)]);
  }
  return signal;
}

function setStoreCache(key, value) {
  storeCache.delete(key);
  storeCache.set(key, { savedAt: Date.now(), value });
  while (storeCache.size > STORE_CACHE_LIMIT) storeCache.delete(storeCache.keys().next().value);
}

function status(message, kind = '') {
  const el = $('#repoStatus');
  el.textContent = message;
  el.dataset.state = kind;
}

function sourceMode() {
  return $('#searchSource').value;
}

function selectedItems() {
  return [...selected.values()];
}

function localMatches(query) {
  const terms = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  return popular.filter(item => {
    const haystack = `${item.id} ${item.name} ${item.publisher} ${item.tags.join(' ')}`.toLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}

function render() {
  const mode = sourceMode();
  const query = $('#query').value.trim();
  let list = filter === 'selected'
    ? selectedItems()
    : filter === 'popular' && ['community', 'font'].includes(mode)
      ? localMatches(query)
      : packages;

  visible = list;
  const shown = filter === 'selected' ? list.length : packages.length;
  $('#resultCount').textContent = total > packages.length && mode === 'community' && filter === 'all'
    ? `显示 ${packages.length} / ${total.toLocaleString()}`
    : `${shown.toLocaleString()} 个结果`;
  $('#selectVisible').disabled = !list.length;

  const rows = list.map(item => {
    const key = packageKey(item);
    const checked = selected.has(key);
    const sourceLabel = item.sourceType === 'store' ? 'msstore'
      : item.sourceType === 'font' ? 'winget-font'
        : item.sourceType === 'custom' ? item.sourceName
          : 'winget';
    const meta = [item.publisher || '未知发布者', ...(item.tags || []).slice(0, 3)].filter(Boolean).join(' · ');
    return `<div class="result ${checked ? 'checked' : ''}" data-package="${esc(item.id)}" data-package-key="${esc(key)}"><input type="checkbox" ${checked ? 'checked' : ''} aria-label="选择 ${esc(item.name)}"><div class="result-main"><div class="result-title"><strong>${esc(item.name)}</strong>${item.version ? `<em>${esc(item.version)}</em>` : ''}</div><span class="result-id">${esc(item.id)}</span><span class="result-meta">${esc(meta)} · ${esc(sourceLabel)}</span></div><span class="tag">${checked ? '已选' : '选择'}</span></div>`;
  }).join('');
  const canLoadMore = (mode === 'community' && filter === 'all' && packages.length < total)
    || (mode === 'store' && filter === 'all' && storeHasMore);
  const more = canLoadMore ? `<button type="button" class="load-more" id="loadMore">${mode === 'store' ? '加载更多' : `加载更多（${packages.length} / ${total.toLocaleString()}）`}</button>` : '';
  const emptyMessage = filter === 'selected'
    ? '当前来源还没有已选软件'
    : mode === 'store' && query
      ? `Microsoft Store 暂无匹配结果 · <a href="${esc(STORE_SEARCH + encodeURIComponent(query))}" target="_blank" rel="noopener noreferrer">在商店网页搜索</a>`
      : '没有匹配的软件';
  const sourceNotice = mode === 'font'
    ? '<div class="source-note">已确认清单：Microsoft.FluentFonts · 该源未开放网页搜索 API</div>'
    : mode === 'store'
      ? '<div class="source-note">Microsoft Store 官方目录 · 搜索经 Jina Reader 转发</div>'
      : '';
  $('#results').innerHTML = sourceNotice + (rows || `<div class="empty">${emptyMessage}</div>`);
  $('#results').insertAdjacentHTML('beforeend', more);
}

function saveSelections() {
  try {
    localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedItems()));
    localStorage.removeItem(LEGACY_SELECTION_KEY);
  } catch {
    $('#actionStatus').textContent = '浏览器存储空间不足，选择未能保存';
  }
  renderSelected();
  render();
}

function renderSelected() {
  $('#selectedCount').textContent = `${selected.size} 个已选择`;
  $('#clearSelection').disabled = !selected.size;
  generate();
}

function generate() {
  const script = buildInstallScript(selectedItems(), {
    scope: $('#scope').value,
    silent: $('#silent').checked,
    agreements: $('#agreements').checked,
    exact: $('#exact').checked,
    customSource,
  });
  $('#output').textContent = script || '请选择需要安装的软件';
  $('#copy').disabled = $('#download').disabled = !script;
  $('#optionState').textContent = selected.size ? '已生成' : '安装';
}

function updateSourceUi() {
  const mode = sourceMode();
  $('#sourceConfig').hidden = mode !== 'custom';
  $('#manualLabel').textContent = mode === 'store' ? 'Microsoft Store 产品 ID'
    : mode === 'font' ? 'winget-font 包 ID'
      : mode === 'custom' ? '第三方包标识'
        : '包标识';
  $('#manualId').placeholder = mode === 'store' ? '例如 9NBLGGH4NNS1'
    : mode === 'font' ? 'Microsoft.FluentFonts'
      : 'Publisher.Package';
  $('#customSourceName').value = customSource.name;
  $('#customSourceUrl').value = customSource.url;
  $('#optionState').textContent = mode === 'store' ? 'msstore' : mode === 'font' ? 'winget-font' : '安装';
}

function errorText(error) {
  if (error?.name === 'AbortError') return '';
  if (error?.name === 'TimeoutError') return 'Microsoft Store 搜索超时，请重试或使用商店网页搜索';
  if (error instanceof TypeError) return '网络或跨域请求失败，请确认仓库允许网页跨域访问';
  return String(error?.message || '搜索失败');
}

function customEndpoint() {
  if (!customSource.name || !customSource.url) throw new Error('先填写并保存第三方仓库名称和地址');
  const url = new URL(customSource.url);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('仓库地址必须是有效的 HTTP 或 HTTPS 地址');
  }
  const base = url.toString().replace(/\/+$/, '');
  return /\/manifestSearch$/i.test(base) ? base : `${base}/manifestSearch`;
}

async function search({ append = false } = {}) {
  clearTimeout(search.timer);
  const query = $('#query').value.trim();
  const mode = sourceMode();
  const serial = ++requestSerial;
  controller?.abort();
  controller = new AbortController();
  if (!append) {
    page = 0;
    if (mode === 'store') {
      storeCursor = '';
      storeHasMore = false;
    }
  }

  if (!query && mode !== 'custom') {
    packages = mode === 'community' ? [...popular] : mode === 'font' ? searchFontPackages('') : [];
    total = packages.length;
    if (mode === 'store') storeHasMore = false;
    status(mode === 'store' ? '输入名称搜索 Microsoft Store' : mode === 'font' ? 'winget-font · 已确认清单' : '热门软件 · 可输入名称搜索');
    render();
    return;
  }

  if (mode === 'font') {
    packages = searchFontPackages(query);
    total = packages.length;
    status('winget-font · 已确认清单');
    render();
    return;
  }

  status(mode === 'custom' ? '正在搜索第三方仓库' : mode === 'store' ? '正在搜索 Microsoft Store' : '正在搜索 Winget 社区仓库');
  try {
    let nextItems;
    let nextTotal;
    let nextStoreCursor = '';
    let nextStoreHasMore = false;
    if (mode === 'custom') {
      const response = await fetch(customEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Version: '1.0.0' },
        body: JSON.stringify({ Query: { KeyWord: query, MatchType: 'Fuzzy' }, MaximumResults: PAGE_SIZE }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('第三方仓库返回 HTTP ' + response.status);
      const data = await response.json();
      nextItems = normalizeRestResults(data, customSource.name);
      nextTotal = Number(data?.Data?.length || nextItems.length);
    } else if (mode === 'store') {
      const cursor = append ? storeCursor : '';
      const cacheKey = query.toLocaleLowerCase() + '::' + cursor;
      const cached = getStoreCache(cacheKey);
      if (cached) {
        ({ items: nextItems, total: nextTotal, cursor: nextStoreCursor, hasMore: nextStoreHasMore } = cached);
      } else {
        const request = createStoreSearchRequest(query, PAGE_SIZE, cursor);
        const response = await fetch(request.url, { ...request.init, signal: storeSearchSignal(controller.signal) });
        if (!response.ok) throw new Error('Microsoft Store 搜索服务返回 HTTP ' + response.status);
        const payload = parseStoreSearchResponse(await response.text());
        nextItems = normalizeStoreResults(payload);
        nextTotal = Math.max(Number(payload?.totalCount || 0), nextItems.length);
        nextStoreCursor = String(payload?.cursor || '');
        nextStoreHasMore = Boolean(payload?.hasMorePages && nextStoreCursor);
        setStoreCache(cacheKey, { items: nextItems, total: nextTotal, cursor: nextStoreCursor, hasMore: nextStoreHasMore });
      }
    } else {
      const response = await fetch(communitySearchUrl(query, page, PAGE_SIZE), { signal: controller.signal });
      if (!response.ok) throw new Error('Winget 社区仓库返回 HTTP ' + response.status);
      const data = await response.json();
      nextItems = normalizeCommunityResults(data);
      nextTotal = Number(data?.Total ?? nextItems.length);
    }
    if (serial !== requestSerial) return;
    if (mode === 'store') {
      storeCursor = nextStoreCursor;
      storeHasMore = nextStoreHasMore;
    }
    const previous = append ? packages : [];
    const merged = new Map(previous.map(item => [packageKey(item), item]));
    nextItems.forEach(item => merged.set(packageKey(item), item));
    packages = [...merged.values()];
    total = nextTotal;
    status(mode === 'custom'
      ? customSource.name + ' · ' + total.toLocaleString() + ' 个结果'
      : mode === 'store'
        ? 'Microsoft Store · 已加载 ' + packages.length.toLocaleString() + ' 个'
        : 'Winget 社区仓库 · ' + total.toLocaleString() + ' 个结果');
    render();
  } catch (error) {
    if (serial !== requestSerial || error?.name === 'AbortError') return;
    const message = errorText(error);
    if (mode === 'community') {
      packages = localMatches(query);
      total = packages.length;
      status(message ? '在线仓库不可用 · 已筛选本地索引' : '搜索已取消', message ? 'error' : '');
      $('#actionStatus').textContent = message;
    } else {
      packages = [];
      total = 0;
      if (mode === 'store') storeHasMore = false;
      status(message || '搜索失败', 'error');
      $('#actionStatus').textContent = mode === 'store' ? '可在 Microsoft Store 搜索后输入产品 ID 添加' : message;
    }
    render();
  }
}
function add(id) {
  const value = String(id || '').trim();
  if (!isValidPackageId(value)) {
    $('#actionStatus').textContent = '包标识格式无效，请检查空格和特殊字符';
    $('#manualId').focus();
    return false;
  }
  const mode = sourceMode();
  const item = {
    id: value,
    name: value,
    publisher: mode === 'store' ? 'Microsoft Store' : '',
    tags: [],
    sourceType: mode === 'store' ? 'store' : mode === 'font' ? 'font' : mode === 'custom' ? 'custom' : 'community',
    sourceName: mode === 'store' ? 'msstore' : mode === 'font' ? 'winget-font' : mode === 'custom' ? customSource.name : 'winget',
  };
  if (mode === 'custom' && (!customSource.name || !customSource.url)) {
    $('#actionStatus').textContent = '先保存第三方仓库名称和地址';
    return false;
  }
  selected.set(packageKey(item), item);
  $('#actionStatus').textContent = '已添加到安装命令';
  saveSelections();
  return true;
}

function validSourceConfig(name, address) {
  const cleanName = String(name || '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(cleanName)) throw new Error('仓库名称请使用英文字母、数字、点、下划线或短横线');
  const url = new URL(String(address || '').trim());
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('请输入有效的 HTTP 或 HTTPS 仓库地址');
  if (url.search || url.hash) throw new Error('仓库地址不应包含查询参数或片段');
  return { name: cleanName, url: url.toString().replace(/\/+$/, '') };
}

$('#query').addEventListener('input', () => {
  clearTimeout(search.timer);
  search.timer = setTimeout(() => search(), 280);
});
$('#query').addEventListener('keydown', event => {
  if (event.key === 'Enter') search();
  if (event.key === 'Escape') { $('#query').value = ''; search(); }
});
$('#searchButton').addEventListener('click', () => search());
$('#searchSource').addEventListener('change', () => { updateSourceUi(); search(); });
$('#results').addEventListener('click', event => {
  if (event.target.closest('#loadMore')) {
    page += 1;
    search({ append: true });
    return;
  }
  const row = event.target.closest('[data-package-key]');
  if (!row) return;
  const key = row.dataset.packageKey;
  selected.has(key) ? selected.delete(key) : selected.set(key, packages.find(item => packageKey(item) === key) || visible.find(item => packageKey(item) === key));
  saveSelections();
});
$('#selectVisible').addEventListener('click', () => {
  visible.forEach(item => selected.set(packageKey(item), item));
  saveSelections();
});
$('#clearSelection').addEventListener('click', () => { selected.clear(); saveSelections(); });
$('.wg-filters').addEventListener('click', event => {
  const button = event.target.closest('[data-kind]');
  if (!button) return;
  filter = button.dataset.kind;
  document.querySelectorAll('.wg-filters [data-kind]').forEach(item => item.classList.toggle('active', item === button));
  render();
});
$('#addManual').addEventListener('click', () => {
  if (add($('#manualId').value)) $('#manualId').value = '';
});
$('#manualId').addEventListener('keydown', event => { if (event.key === 'Enter') $('#addManual').click(); });
$('#saveSource').addEventListener('click', () => {
  try {
    customSource = validSourceConfig($('#customSourceName').value, $('#customSourceUrl').value);
    localStorage.setItem(SOURCE_KEY, JSON.stringify(customSource));
    const migrated = selectedItems().map(item => item.sourceType === 'custom' ? { ...item, sourceName: customSource.name } : item);
    selected.clear();
    migrated.forEach(item => selected.set(packageKey(item), item));
    $('#sourceMessage').textContent = '已保存';
    $('#sourceMessage').dataset.state = 'ok';
    saveSelections();
  } catch (error) {
    $('#sourceMessage').textContent = error.message || '仓库配置无效';
    $('#sourceMessage').dataset.state = 'error';
  }
});
['scope', 'silent', 'agreements', 'exact'].forEach(id => $('#'+id).addEventListener('change', generate));
$('#regenerate').addEventListener('click', generate);
$('#copy').addEventListener('click', async () => {
  const text = $('#output').textContent;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      if (!copied) throw new Error('浏览器不支持复制');
    }
    $('#actionStatus').textContent = '命令已复制';
  } catch {
    $('#actionStatus').textContent = '复制失败，请选中命令手动复制';
  }
});
$('#download').addEventListener('click', () => {
  const blob = new Blob([$('#output').textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'winget-install.ps1';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});

updateSourceUi();
renderSelected();
search();
