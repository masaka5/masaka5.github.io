const DATA_URL = 'data/policies.json';
const PAGE_SIZE = 40;
const STORAGE_KEY = 'windows-policy-edits-v2';

const CATEGORY_LABELS = {
  WindowsComponents: 'Windows 组件',
  WindowsDefender: 'Windows Defender',
  WindowsUpdate: 'Windows 更新',
  Network: '网络',
  NetworkConnections: '网络连接',
  System: '系统',
  Desktop: '桌面',
  StartMenu: '开始菜单',
  ControlPanel: '控制面板',
  Printers: '打印机',
  SharedFolders: '共享文件夹',
  TerminalServer: '远程桌面服务',
  RemoteDesktop: '远程桌面',
  PowerShellExecutionPolicy: 'PowerShell 执行策略',
  AppxPackageManager: '应用包管理',
  BitLockerManagement: 'BitLocker 管理',
  BitLockerUserManagement: 'BitLocker 用户设置',
  W32Time: '时间同步',
  AddFeaturesWindows10: 'Windows 10 功能',
  'Add features to Windows 10': 'Windows 10 功能',
  MicrosoftEdge: 'Microsoft Edge',
  MicrosoftEdgeDefaultSettings: 'Microsoft Edge 默认设置',
  'Microsoft Edge - Default Settings (users can override)': 'Microsoft Edge 默认设置',
  'Microsoft Office 2016': 'Microsoft Office 2016',
  'Microsoft Office 2016 (Machine)': 'Microsoft Office 2016（计算机）',
  'Adobe DC': 'Adobe Acrobat',
  'Adobe Acrobat DC': 'Adobe Acrobat DC',
  'Adobe Acrobat Reader DC': 'Adobe Acrobat Reader DC',
  'Brave Software': 'Brave',
  Cat_Google: 'Google',
  Cat_Mozilla: 'Mozilla',
  Cat_Dell: 'Dell',
  Cat_MSFT: 'Microsoft',
  Cat_AddHard: '硬件',
  Cat_Legacy: '兼容性',
  Cat_Debug: '调试',
  'Microsoft Copilot Update': 'Microsoft Copilot 更新',
  'Windows Subsystem for Linux': '适用于 Linux 的 Windows 子系统',
  OneDrive: 'OneDrive',
  Surface: 'Surface',
  LAPS: 'Windows LAPS',
  BitLocker: 'BitLocker'
};

const CATEGORY_ALIASES = {
  WindowsComponents: 'windows components windows组件 系统组件 操作系统组件 功能',
  WindowsDefender: 'defender defender antivirus 安全 防病毒 防护',
  WindowsUpdate: 'update windows update 更新 补丁',
  Network: 'network networking 网络 网卡 tcp ip dns',
  NetworkConnections: 'network connections 网络 连接 网络连接',
  System: 'system 系统 windows 系统设置 计算机',
  Desktop: 'desktop 桌面 工作区',
  StartMenu: 'start menu 开始 开始菜单 任务栏',
  ControlPanel: 'control panel 控制面板',
  Printers: 'printers printing 打印 打印机',
  SharedFolders: 'shared folders 共享 文件夹',
  TerminalServer: 'terminal server rds 远程桌面 终端服务',
  RemoteDesktop: 'remote desktop rdp 远程桌面',
  PowerShellExecutionPolicy: 'powershell execution policy 脚本 执行策略',
  AppxPackageManager: 'appx package manager 应用 包 程序 商店',
  BitLockerManagement: 'bitlocker 磁盘 加密',
  BitLockerUserManagement: 'bitlocker 用户 磁盘 加密',
  W32Time: 'time w32time ntp 时间 同步',
  Cat_AddHard: 'hardware 硬件 设备 驱动',
  Cat_Legacy: 'legacy 兼容 旧版',
  Cat_Debug: 'debug 调试 诊断'
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

let policies = [];
let filtered = [];
let visibleCategories = [];
let current = null;
let currentState = { mode: 'unconfigured', values: {}, hive: 'HKLM' };
let edits = new Map();
let page = 1;
let category = 'all';
let importedFiles = new Map();
let searchTimer = 0;

try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  for (const item of stored) if (item?.id) edits.set(item.id, item);
} catch {}

function categoryName(name) {
  if (!name) return '其他';
  if (CATEGORY_LABELS[name]) return CATEGORY_LABELS[name];
  if (name.startsWith('Cat_')) return name.slice(4).replaceAll('_', ' ');
  return name.replaceAll('_', ' ');
}

function rootCategory(item) {
  return item.categoryPath?.[0] || item.fileSlug || '其他';
}

function scopeLabel(value) {
  return value === 'Machine' ? '计算机' : value === 'User' ? '用户' : value === 'Both' ? '计算机和用户' : value || '未指定';
}

function categorySearchText(name) {
  return `${name} ${categoryName(name)} ${CATEGORY_ALIASES[name] || ''}`.toLowerCase();
}

function policySearch(item) {
  const path = (item.categoryPath || []).map(categoryName).join(' ');
  return `${item.displayName || ''} ${item.name || ''} ${item.namespace || ''} ${item.key || ''} ${item.valueName || ''} ${(item.categoryPath || []).join(' ')} ${path} ${item.explainText || ''} ${item.supportedOn || ''} ${scopeLabel(item.class)}`.toLowerCase();
}

function normalizeQuery(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function matchesQuery(item, terms) {
  return !terms.length || terms.every(term => item._search.includes(term));
}

function activeFilterCount() {
  return Number(Boolean(normalizeQuery($('#keyword').value))) +
    Number($('#classFilter').value !== 'all') +
    Number(category !== 'all') +
    Number(Boolean(normalizeQuery($('#categoryFilter').value)));
}

function persistEdits() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...edits.values()]));
  } catch {}
}

async function load() {
  try {
    $('#datasetStatus').textContent = '正在读取内置模板';
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`模板请求失败：${response.status}`);
    const data = await response.json();
    policies = Array.isArray(data) ? data : data.policies || [];
    policies.forEach(item => { item._search = policySearch(item); });
    const templateCount = new Set(policies.map(item => item.fileSlug).filter(Boolean)).size;
    $('#datasetStatus').textContent = `${templateCount} 份模板 · ${policies.length.toLocaleString()} 条策略`;
    refresh();
  } catch (error) {
    $('#datasetStatus').textContent = '模板加载失败';
    $('#resultSummary').textContent = '加载失败';
    $('#policyResults').innerHTML = `<div class="editor-empty"><strong>模板加载失败</strong><span>${esc(error.message)}</span><button class="empty-action" type="button" data-reload>重试</button></div>`;
  }
}

function refresh() {
  renderCategories();
  applyFilters();
}

function renderCategories() {
  const terms = normalizeQuery($('#keyword').value).split(' ').filter(Boolean);
  const scope = $('#classFilter').value;
  const counts = new Map();
  let allCount = 0;
  for (const item of policies) {
    if (scope !== 'all' && item.class !== scope && item.class !== 'Both') continue;
    if (!matchesQuery(item, terms)) continue;
    allCount += 1;
    const root = rootCategory(item);
    counts.set(root, (counts.get(root) || 0) + 1);
  }

  const categoryTerms = normalizeQuery($('#categoryFilter').value).split(' ').filter(Boolean);
  visibleCategories = [...counts.keys()]
    .filter(name => categoryTerms.every(term => categorySearchText(name).includes(term)))
    .sort((a, b) => categoryName(a).localeCompare(categoryName(b), 'zh-CN'));

  const allButton = `<button class="category-item ${category === 'all' ? 'active' : ''}" type="button" data-category="all" aria-pressed="${category === 'all'}"><span>全部策略</span><small>${allCount.toLocaleString()}</small></button>`;
  const items = visibleCategories.map(name => {
    const active = category === name;
    return `<button class="category-item ${active ? 'active' : ''}" type="button" data-category="${esc(name)}" aria-pressed="${active}"><span>${esc(categoryName(name))}</span><small>${(counts.get(name) || 0).toLocaleString()}</small></button>`;
  });
  $('#categories').innerHTML = [allButton, ...items].join('') || `${allButton}<div class="category-empty">没有匹配分类</div>`;
  $('#categoryTotal').textContent = `${visibleCategories.length} 类`;
}

function applyFilters() {
  const terms = normalizeQuery($('#keyword').value).split(' ').filter(Boolean);
  const scope = $('#classFilter').value;
  filtered = policies.filter(item => {
    if (category !== 'all' && rootCategory(item) !== category) return false;
    if (scope !== 'all' && item.class !== scope && item.class !== 'Both') return false;
    return matchesQuery(item, terms);
  });

  if (terms.length) {
    const query = terms.join(' ');
    const rank = item => {
      const title = String(item.displayName || item.name || '').toLowerCase();
      if (title === query) return 4;
      if (title.startsWith(query)) return 3;
      if (title.includes(query)) return 2;
      return 1;
    };
    filtered.sort((a, b) => rank(b) - rank(a));
  }

  page = 1;
  renderResults();
}

function renderResults() {
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(Math.max(1, page), pages);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  $('#resultSummary').textContent = `${filtered.length.toLocaleString()} 条`;
  $('#editedCount').textContent = `${edits.size} 项修改`;
  $('#pageInfo').textContent = `第 ${page} / ${pages} 页`;
  $('#prevPage').disabled = page <= 1;
  $('#nextPage').disabled = page >= pages;
  $('#clearFilters').hidden = activeFilterCount() === 0;

  $('#policyResults').innerHTML = pageItems.length ? pageItems.map(item => {
    const modified = edits.has(item.id);
    const active = current?.id === item.id;
    return `<button class="policy-item ${active ? 'active' : ''}" type="button" data-id="${esc(item.id)}" aria-current="${active ? 'true' : 'false'}"><strong>${esc(item.displayName || item.name)}${modified ? '<span class="modified">已修改</span>' : ''}</strong><small>${esc(categoryName(rootCategory(item)))} · ${esc(scopeLabel(item.class))}</small><em>${esc(item.namespace || '')} / ${esc(item.name || '')}</em></button>`;
  }).join('') : `<div class="editor-empty"><strong>没有匹配策略</strong><span>调整分类或关键字</span><button class="empty-action" type="button" data-clear-filters>清除筛选</button></div>`;
}

function clearFilters() {
  $('#keyword').value = '';
  $('#categoryFilter').value = '';
  $('#classFilter').value = 'all';
  category = 'all';
  refresh();
  $('#keyword').focus();
}

function selectPolicy(id) {
  current = policies.find(item => item.id === id);
  if (!current) return;
  currentState = structuredClone(edits.get(id) || { mode: 'unconfigured', values: {}, hive: current.class === 'User' ? 'HKCU' : 'HKLM' });
  currentState.values ||= {};
  currentState.hive ||= current.class === 'User' ? 'HKCU' : 'HKLM';

  $('#editorEmpty').hidden = true;
  $('#policyEditor').hidden = false;
  $('#policyName').textContent = current.displayName || current.name;
  const path = (current.categoryPath || []).map(categoryName).join(' / ');
  $('#policyPath').textContent = path ? `${path} · ${current.namespace || ''} / ${current.name || ''}` : `${current.namespace || ''} / ${current.name || ''}`;
  $('#policyClass').textContent = scopeLabel(current.class);
  $('#policyDescription').textContent = current.explainText || '暂无说明';
  $('#policyTemplate').textContent = current.fileSlug || '—';
  $('#policyNamespace').textContent = current.namespace || '—';
  $('#policyKey').textContent = current.key || '—';
  $('#policyValueName').textContent = current.valueName || '—';
  $('#policySupported').textContent = current.supportedOn || '—';
  $('#targetHive').value = currentState.hive;
  $('#sourceHint').textContent = current.lang === 'custom' ? '自定义模板' : '内置模板';
  $('#policySource').textContent = JSON.stringify({
    elements: current.elements || [],
    presentationElements: current.presentationElements || [],
    enabledValue: current.enabledValue,
    disabledValue: current.disabledValue,
    enabledList: current.enabledList,
    disabledList: current.disabledList
  }, null, 2);
  renderState();
  renderParameters();
  renderResults();
}

function renderState() {
  $$('[data-policy-state]').forEach(button => {
    const active = button.dataset.policyState === currentState.mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-checked', String(active));
  });
  const label = currentState.mode === 'enabled' ? '已启用' : currentState.mode === 'disabled' ? '已禁用' : '未配置';
  $('#policyStateBadge').textContent = label;
  $('#policyStateBadge').classList.toggle('modified', currentState.mode !== 'unconfigured');
}

function visibleValue(value) {
  const text = String(value ?? '');
  return text.startsWith('"') && text.endsWith('"') ? text.slice(1, -1) : text;
}

function renderParameters() {
  if (!current || currentState.mode !== 'enabled') {
    $('#parameterFields').innerHTML = '';
    return;
  }
  const presentations = new Map((current.presentationElements || []).map(item => [item.refId, item]));
  $('#parameterFields').innerHTML = (current.elements || []).map((element, index) => {
    const id = element.id || `element-${index}`;
    const presentation = presentations.get(id) || {};
    const label = presentation.label || id;
    const stored = currentState.values?.[id];
    const defaultValue = presentation.defaultValue ?? '';

    if (element.type === 'enum') {
      const options = (element.items || []).map(item => {
        const optionValue = visibleValue(item.value?.value);
        const selected = stored !== undefined ? String(stored) === optionValue : false;
        return `<option value="${esc(optionValue)}" ${selected ? 'selected' : ''}>${esc(item.displayName || optionValue)}</option>`;
      }).join('');
      return `<label class="parameter wide"><span>${esc(label)}</span><select data-param="${esc(id)}">${options}</select></label>`;
    }
    if (element.type === 'boolean') {
      const checked = stored !== undefined ? Boolean(stored) : Boolean(defaultValue);
      return `<label class="parameter"><span>${esc(label)}</span><input data-param="${esc(id)}" type="checkbox" ${checked ? 'checked' : ''}></label>`;
    }
    if (element.type === 'multiText' || element.type === 'list') {
      const value = stored ?? defaultValue;
      const text = typeof value === 'string' ? value : JSON.stringify(value ?? []);
      return `<label class="parameter wide"><span>${esc(label)}</span><textarea data-param="${esc(id)}" spellcheck="false">${esc(text)}</textarea></label>`;
    }
    const value = stored ?? defaultValue;
    const type = element.type === 'decimal' || element.type === 'longDecimal' ? 'number' : 'text';
    return `<label class="parameter ${element.type === 'text' ? 'wide' : ''}"><span>${esc(label)}</span><input data-param="${esc(id)}" type="${type}" value="${esc(visibleValue(value))}" spellcheck="false"></label>`;
  }).join('');
}

function collectValues() {
  const values = {};
  $$('#parameterFields [data-param]').forEach(input => {
    values[input.dataset.param] = input.type === 'checkbox' ? input.checked : input.value;
  });
  return values;
}

function registryValues(policy, values) {
  const result = [];
  for (const element of policy.elements || []) {
    const valueName = element.valueName || policy.valueName;
    if (!valueName) continue;
    const raw = values[element.id];
    if (raw === undefined || raw === '') continue;
    let value;
    if (element.type === 'boolean') value = { type: 'decimal', value: raw ? 1 : 0 };
    else if (element.type === 'enum') value = element.items?.find(item => visibleValue(item.value?.value) === String(raw))?.value || null;
    else if (element.type === 'decimal' || element.type === 'longDecimal') value = { type: 'decimal', value: Number(raw) };
    else value = { type: 'string', value: raw };
    if (value) result.push({ key: element.key || policy.key, valueName, value });
  }
  return result;
}

function savePolicy(mode = currentState.mode) {
  if (!current) return;
  const values = collectValues();
  currentState = {
    id: current.id,
    mode,
    values,
    hive: $('#targetHive').value,
    updatedAt: new Date().toISOString(),
    policy: {
      id: current.id,
      displayName: current.displayName,
      name: current.name,
      namespace: current.namespace,
      key: current.key,
      valueName: current.valueName,
      class: current.class,
      fileSlug: current.fileSlug,
      enabledValue: current.enabledValue,
      disabledValue: current.disabledValue,
      enabledList: current.enabledList,
      disabledList: current.disabledList,
      registryValues: registryValues(current, values)
    }
  };
  if (mode === 'unconfigured') edits.delete(current.id);
  else edits.set(current.id, currentState);
  persistEdits();
  renderState();
  renderResults();
  const button = $('#savePolicy');
  button.textContent = '已保存';
  setTimeout(() => { button.textContent = '保存策略'; }, 900);
}

function download(name, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function exportState() {
  download('windows-policy-state.json', JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), policies: [...edits.values()] }, null, 2));
}

function regValue(value) {
  if (!value) return null;
  if (value.type === 'delete') return '-';
  if (value.type === 'decimal' || value.type === 'longDecimal') return `dword:${(Number(value.value) >>> 0).toString(16).padStart(8, '0')}`;
  const text = String(value.value ?? '');
  const quoted = text.startsWith('"') && text.endsWith('"') ? text : JSON.stringify(text);
  return quoted;
}

function exportRegistry() {
  const groups = new Map();
  for (const item of edits.values()) {
    if (item.mode === 'unconfigured') continue;
    const policy = item.policy || {};
    if (!policy.key) continue;
    const hive = item.hive || (policy.class === 'User' ? 'HKCU' : 'HKLM');
    const key = `${hive}\\${policy.key.replace(/^\\+/, '')}`;
    const list = item.mode === 'enabled' ? policy.enabledList : policy.disabledList;
    const value = item.mode === 'enabled' ? policy.enabledValue : policy.disabledValue;

    if (!groups.has(key)) groups.set(key, []);
    if (value && policy.valueName) {
      const formatted = regValue(value);
      if (formatted) groups.get(key).push(`"${policy.valueName}"=${formatted}`);
    }
    for (const row of policy.registryValues || []) {
      if (item.mode !== 'enabled' || !row.valueName) continue;
      const formatted = regValue(row.value);
      if (!formatted) continue;
      const rowKey = row.key ? `${hive}\\${row.key.replace(/^\\+/, '')}` : key;
      if (!groups.has(rowKey)) groups.set(rowKey, []);
      groups.get(rowKey).push(`"${row.valueName}"=${formatted}`);
    }
    for (const row of list || []) {
      const formatted = regValue(row.value);
      if (!formatted) continue;
      const rowKey = row.key ? `${hive}\\${row.key.replace(/^\\+/, '')}` : key;
      if (!groups.has(rowKey)) groups.set(rowKey, []);
      groups.get(rowKey).push(`"${row.valueName || policy.valueName}"=${formatted}`);
    }
  }

  const lines = ['Windows Registry Editor Version 5.00', ''];
  for (const [key, values] of groups) lines.push(`[${key}]`, ...values, '');
  download('windows-policy-settings.reg', lines.join('\r\n'), 'application/octet-stream');
}

function decodeFile(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.slice(2));
  return new TextDecoder().decode(bytes);
}

function firstText(node, name) {
  const element = node?.querySelector(name);
  return element?.textContent?.trim() || '';
}

function parseXml(text, label) {
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error(`${label} 格式无效`);
  return xml;
}

function resolveString(value, strings) {
  return String(value || '').replace(/\$\(string\.([^)]+)\)/g, (_, id) => strings[id] || id);
}

function parseAdml(xml) {
  const strings = {};
  xml.querySelectorAll('stringTable string').forEach(node => { strings[node.getAttribute('id')] = node.textContent.trim(); });
  return strings;
}

function parseValue(node) {
  if (!node) return null;
  const holder = node.matches?.('value') ? node : node.querySelector('value') || node;
  const read = type => {
    const element = holder.querySelector(type) || node.querySelector(type);
    if (!element) return null;
    if (element.hasAttribute('value')) return { type, value: element.getAttribute('value') };
    return { type, value: element.textContent.trim() };
  };
  return read('delete') || read('decimal') || read('longDecimal') || read('string');
}

function parseList(node) {
  if (!node) return null;
  return [...node.querySelectorAll('item')].map(item => ({
    key: item.getAttribute('key') || '',
    valueName: item.getAttribute('valueName') || '',
    value: parseValue(item)
  })).filter(item => item.value);
}

function parseElements(policyNode, strings) {
  const result = [];
  policyNode.querySelectorAll('elements > *').forEach(node => {
    const element = {
      type: node.localName,
      id: node.getAttribute('id') || '',
      valueName: node.getAttribute('valueName') || '',
      key: node.getAttribute('key') || '',
      required: node.getAttribute('required') === 'true'
    };
    if (element.type === 'enum') {
      element.items = [...node.querySelectorAll('item')].map(item => ({
        displayName: resolveString(item.getAttribute('displayName'), strings),
        value: parseValue(item)
      })).filter(item => item.value);
    }
    result.push(element);
  });
  return result;
}

function parsePresentations(xml, strings) {
  return [...xml.querySelectorAll('presentations presentation')].map(policyPresentation => {
    const ref = policyPresentation.getAttribute('id') || '';
    const items = [...policyPresentation.children].map(node => ({
      type: node.localName,
      refId: node.getAttribute('refId') || '',
      label: resolveString(node.getAttribute('label'), strings),
      defaultValue: resolveString(node.getAttribute('defaultValue'), strings),
      noSort: node.getAttribute('noSort') === 'true'
    }));
    return { ref, items };
  });
}

async function importTemplates(files) {
  const xmlFiles = [];
  const admlStrings = new Map();
  for (const file of files) {
    const xml = parseXml(decodeFile(await file.arrayBuffer()), file.name);
    const base = file.name.replace(/\.(admx|adml|xml)$/i, '').toLowerCase();
    if (/\.adml$/i.test(file.name)) admlStrings.set(base, parseAdml(xml));
    else xmlFiles.push({ name: file.name, base, xml });
  }
  if (!xmlFiles.length) throw new Error('请选择 ADMX 文件');

  const imported = [];
  for (const file of xmlFiles) {
    const strings = admlStrings.get(file.base) || {};
    const categoryNodes = new Map();
    file.xml.querySelectorAll('categories category').forEach(node => {
      categoryNodes.set(node.getAttribute('name'), {
        name: node.getAttribute('name'),
        parent: node.getAttribute('parentCategory') || node.querySelector(':scope > parentCategory')?.getAttribute('ref') || '',
        label: resolveString(node.getAttribute('displayName'), strings) || node.getAttribute('name')
      });
    });
    const presentations = new Map(parsePresentations(file.xml, strings).map(item => [item.ref, item.items]));
    const namespace = file.xml.querySelector('target')?.getAttribute('namespace') || file.base;

    file.xml.querySelectorAll('policies policy').forEach(node => {
      const name = node.getAttribute('name') || '';
      const parent = node.getAttribute('parentCategory') || node.querySelector(':scope > parentCategory')?.getAttribute('ref') || node.getAttribute('category') || '';
      const path = [];
      const seen = new Set();
      let categoryNode = categoryNodes.get(parent);
      while (categoryNode && !seen.has(categoryNode.name)) {
        seen.add(categoryNode.name);
        path.unshift(resolveString(categoryNode.label, strings));
        categoryNode = categoryNodes.get(categoryNode.parent);
      }
      const presentationRef = (node.getAttribute('presentation') || '').replace(/^\$\(presentation\.(.*)\)$/, '$1');
      imported.push({
        id: `import/${file.base}/${name}`,
        name,
        displayName: resolveString(node.getAttribute('displayName'), strings) || name,
        explainText: resolveString(node.getAttribute('explainText'), strings),
        class: node.getAttribute('class') || 'Both',
        key: node.getAttribute('key') || '',
        valueName: node.getAttribute('valueName') || '',
        supportedOn: resolveString(node.getAttribute('supportedOn'), strings),
        parentCategory: parent,
        categoryPath: path.length ? path : [file.base],
        namespace,
        fileSlug: file.base,
        lang: strings && Object.keys(strings).length ? 'custom' : 'admx',
        elements: parseElements(node, strings),
        presentationElements: presentations.get(presentationRef) || [],
        enabledValue: parseValue(node.querySelector('enabledValue')),
        disabledValue: parseValue(node.querySelector('disabledValue')),
        enabledList: parseList(node.querySelector('enabledList')),
        disabledList: parseList(node.querySelector('disabledList'))
      });
    });
    importedFiles.set(file.base, file);
  }

  policies = [...imported, ...policies.filter(item => !item.id.startsWith('import/'))];
  policies.forEach(item => { item._search = policySearch(item); });
  category = 'all';
  refresh();
  $('#datasetStatus').textContent = `已导入 ${imported.length.toLocaleString()} 条自定义策略`;
}

async function importStateFile(file) {
  const data = JSON.parse(await file.text());
  const list = Array.isArray(data) ? data : data.policies || [];
  if (!Array.isArray(list)) throw new Error('状态文件格式无效');
  for (const item of list) if (item?.id) edits.set(item.id, item);
  persistEdits();
  renderResults();
}

$('#keyword').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(refresh, 120);
});
$('#keyword').addEventListener('keydown', event => {
  if (event.key === 'Escape') clearFilters();
  if (event.key === 'Enter' && filtered[0]) selectPolicy(filtered[0].id);
});
$('#classFilter').addEventListener('change', refresh);
$('#categoryFilter').addEventListener('input', renderCategories);
$('#categoryFilter').addEventListener('keydown', event => {
  if (event.key === 'Escape') { $('#categoryFilter').value = ''; renderCategories(); }
});
$('#categories').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category;
  refresh();
});
$('#policyResults').addEventListener('click', event => {
  if (event.target.closest('[data-clear-filters]')) { clearFilters(); return; }
  if (event.target.closest('[data-reload]')) { load(); return; }
  const button = event.target.closest('[data-id]');
  if (button) selectPolicy(button.dataset.id);
});
$('#clearFilters').addEventListener('click', clearFilters);
$('#prevPage').addEventListener('click', () => { page -= 1; renderResults(); });
$('#nextPage').addEventListener('click', () => { page += 1; renderResults(); });
$$('[data-policy-state]').forEach(button => button.addEventListener('click', () => {
  currentState.mode = button.dataset.policyState;
  renderState();
  renderParameters();
}));
$('#targetHive').addEventListener('change', () => { currentState.hive = $('#targetHive').value; });
$('#savePolicy').addEventListener('click', () => savePolicy());
$('#resetPolicy').addEventListener('click', () => savePolicy('unconfigured'));
$('#importTemplate').addEventListener('click', () => $('#templateFiles').click());
$('#templateFiles').addEventListener('change', event => {
  importTemplates([...event.target.files]).catch(error => { $('#datasetStatus').textContent = error.message; }).finally(() => { event.target.value = ''; });
});
$('#importState').addEventListener('click', () => $('#stateFile').click());
$('#stateFile').addEventListener('change', event => {
  if (event.target.files[0]) importStateFile(event.target.files[0]).catch(error => { $('#datasetStatus').textContent = error.message; }).finally(() => { event.target.value = ''; });
});
$('#exportState').addEventListener('click', exportState);
$('#exportRegistry').addEventListener('click', exportRegistry);

load();