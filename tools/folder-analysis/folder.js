import { aggregate, bytes, csvCell, renameFileName } from "./folder-core.js";
const $ = (id) => document.getElementById(id);
const app = document.querySelector('.folder-app');
const worker = new Worker('./folder-worker.js', { type: 'module' });
document.querySelectorAll('[data-icon]').forEach((element) => { const icon = globalThis.ToolboxIcons?.svg?.(element.dataset.icon); if (icon) element.replaceWith(icon); });
let snapshot = { files: [], directories: [] };
let tree = aggregate([]);
let groups = [];
let currentHandle = null;
let view = 'tree';
let path = '';
let page = 0;
let busy = false;
let partial = false;
let editable = false;
let panel = 'analysis';
let batchOperation = 'rename';
let selectedFiles = new Set();
let batchObjectURL = '';
let refreshAfterBatch = false;
let lastBatchMessage = '';
let lastBatchTone = 'success';
const PAGE = 60;

function status(text, tone = '') {
  $('status').textContent = text;
  $('status').dataset.tone = tone;
  $('status').title = text;
}
function setPanel(next) {
  panel = next;
  app.dataset.panel = next;
  document.querySelectorAll('[data-panel-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.panelTab === next);
    button.setAttribute('aria-selected', String(button.dataset.panelTab === next));
  });
}
function setBatchTab(next) {
  batchOperation = next;
  document.querySelectorAll('[data-batch-tab]').forEach((button) => {
    const active = button.dataset.batchTab === next;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-batch-panel]').forEach((section) => section.hidden = section.dataset.batchPanel !== next);
  renderBatchPreview();
}
function setBusy(value) {
  busy = value;
  for (const id of ['choose', 'batchChoose', 'batchChoosePanel']) $(id).disabled = value;
  for (const id of ['duplicate', 'applyRename', 'applyConvert', 'selectCurrent']) $(id).disabled = value || !snapshot.files.length;
  $('cancel').disabled = !value;
}
function statistics(stats = {}) {
  return `无法读取 ${stats.unreadable || 0} · 已变化 ${stats.changed || 0}${stats.fallback ? ' · 兼容模式' : ''}`;
}
function currentDirectoryFiles() {
  return snapshot.files.filter((file) => file.parent === path);
}
function selectedRecords() {
  return snapshot.files.filter((file) => selectedFiles.has(file.path));
}
function trimSelection() {
  const valid = new Set(snapshot.files.map((file) => file.path));
  selectedFiles = new Set([...selectedFiles].filter((value) => valid.has(value)));
}

worker.onerror = (event) => {
  setBusy(false);
  status('处理失败：' + event.message, 'error');
};
worker.onmessage = async ({ data }) => {
  if (data.type === 'progress') {
    if (data.phase === 'batch') {
      status(`${data.operation === 'rename' ? '重命名' : '转换'}中 · ${data.completed || 0}/${data.total || 0}`, '');
    } else if (data.phase === 'scan') {
      status(`扫描中 · ${data.files || 0} 个文件`);
    } else {
      status(`检测中 · 已哈希 ${data.hashed || 0}/${data.total || 0} · ${statistics(data)}`);
    }
    return;
  }
  if (data.type === 'error') {
    setBusy(false);
    status('处理失败：' + data.message, 'error');
    return;
  }
  setBusy(false);
  if (data.type === 'scan') {
    snapshot = data;
    tree = aggregate(data.files, data.directories);
    groups = [];
    path = '';
    page = 0;
    partial = data.partial;
    editable = !!data.editable;
    trimSelection();
    $('total').textContent = bytes(tree.root.size);
    $('counts').textContent = tree.root.count + ' 个';
    $('saved').textContent = '0 B';
    $('export').disabled = false;
    $('batchCapability').textContent = editable ? '可编辑' : '输出 ZIP';
    $('batchCapability').dataset.write = String(editable);
    $('batchHint').textContent = editable ? '任务会直接写入所选文件夹，执行前可预览。' : '当前为兼容模式，处理结果会打包为 ZIP 下载。';
    status(refreshAfterBatch ? `${lastBatchMessage} · 已刷新` : `${data.partial ? '部分扫描' : '扫描完成'} · ${statistics(data.stats)}${data.stats.limited ? ' · 已达条目上限' : ''}`, refreshAfterBatch ? lastBatchTone : 'success');
    refreshAfterBatch = false;
  } else if (data.type === 'duplicates') {
    groups = data.groups;
    $('saved').textContent = bytes(data.redundant);
    status(`${data.cancelled ? '检测已取消' : '检测完成'} · ${groups.length} 组 · 跳过 ${data.stats.uniqueSkipped} 个唯一大小`, 'success');
    view = 'duplicate';
    page = 0;
  } else if (data.type === 'batch') {
    const ok = data.results.filter((item) => item.status === 'ok').length;
    const errors = data.results.filter((item) => item.status === 'error').length;
    const skipped = data.results.filter((item) => item.status === 'skipped').length;
    lastBatchTone = errors ? 'error' : 'success';
    lastBatchMessage = `处理完成 · 成功 ${ok} · 跳过 ${skipped} · 失败 ${errors}`;
    status(lastBatchMessage, lastBatchTone);
    if (data.files?.length) await prepareBatchDownload(data.files);
    if (editable && currentHandle) { refreshAfterBatch = true; setBusy(true); worker.postMessage({ type: 'scan', handle: currentHandle, editable: true }); }
  }
  render();
  renderBatchPreview();
};
async function openFolder(write = false) {
  try {
    if (!window.showDirectoryPicker) {
      $('fallback').click();
      return;
    }
    const handle = await window.showDirectoryPicker({ mode: write ? 'readwrite' : 'read' });
    currentHandle = handle;
    editable = write;
    setBusy(true);
    status(write ? '正在以可编辑模式扫描…' : '扫描中…');
    worker.postMessage({ type: 'scan', handle, editable: write });
  } catch (error) {
    if (error.name !== 'AbortError') status('无法选择文件夹：' + error.message, 'error');
  }
}
$('choose').onclick = () => openFolder(false);
$('batchChoose').onclick = () => openFolder(true);
$('batchChoosePanel').onclick = () => openFolder(true);
$('fallback').onchange = () => {
  if (!$('fallback').files.length) return;
  currentHandle = null;
  editable = false;
  setBusy(true);
  status('兼容模式：正在读取文件…');
  worker.postMessage({ type: 'scan', editable: false, files: [...$('fallback').files].map((file) => ({
    file,
    path: file.webkitRelativePath?.split('/').slice(1).join('/') || file.name
  })) });
};
$('duplicate').onclick = () => {
  setBusy(true);
  status('正在检测重复文件…');
  worker.postMessage({ type: 'duplicates' });
};
$('cancel').onclick = () => {
  worker.postMessage({ type: 'cancel' });
  status('正在取消，保留已处理结果…');
};

document.querySelectorAll('[data-panel-tab]').forEach((button) => button.onclick = () => setPanel(button.dataset.panelTab));
document.querySelectorAll('[data-batch-tab]').forEach((button) => button.onclick = () => setBatchTab(button.dataset.batchTab));
document.querySelectorAll('[data-view]').forEach((button) => button.onclick = () => {
  view = button.dataset.view;
  page = 0;
  render();
});
for (const id of ['renamePrefix', 'renameSuffix', 'renameFind', 'renameReplace', 'renameStart', 'renameNumber', 'convertFormat', 'convertMaxEdge', 'convertSuffix']) {
  $(id).addEventListener('input', renderBatchPreview);
  $(id).addEventListener('change', renderBatchPreview);
}
$('search').oninput = () => { page = 0; render(); };
$('sort').onchange = () => { page = 0; render(); };
$('up').onclick = () => navigate(path.split('/').slice(0, -1).join('/'));
$('prev').onclick = () => { page--; render(); };
$('next').onclick = () => { page++; render(); };
$('selectCurrent').onclick = () => {
  const files = currentDirectoryFiles();
  const allSelected = files.length && files.every((file) => selectedFiles.has(file.path));
  files.forEach((file) => allSelected ? selectedFiles.delete(file.path) : selectedFiles.add(file.path));
  render();
  renderBatchPreview();
};
function navigate(nextPath) {
  path = nextPath;
  page = 0;
  render();
}
function dataRows() {
  let list;
  if (view === 'extension') list = tree.extensions;
  else if (view === 'duplicate') list = groups.flatMap((group, index) => group.map((file) => ({ ...file, group: index + 1, count: group.length })));
  else list = [...tree.nodes.filter((node) => node.path && node.parent === path), ...snapshot.files.filter((file) => file.parent === path)];
  const query = $('search').value.toLocaleLowerCase();
  if (query) list = (view === 'tree' ? [...tree.nodes.filter((node) => node.path), ...snapshot.files] : list).filter((item) => (item.path || item.name).toLocaleLowerCase().includes(query));
  const sort = $('sort').value;
  return [...list].sort((left, right) => sort === 'name'
    ? (left.path || left.name).localeCompare(right.path || right.name, 'zh')
    : (right[sort] || 0) - (left[sort] || 0) || (left.path || left.name).localeCompare(right.path || right.name, 'zh'));
}
function render() {
  $('duplicate').disabled = busy || !snapshot.files.length;
  document.querySelectorAll('[data-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  $('up').disabled = !path;
  $('crumbs').replaceChildren();
  const root = document.createElement('button'); root.textContent = '全部'; root.onclick = () => navigate(''); $('crumbs').append(root);
  let currentPath = '';
  for (const segment of path.split('/').filter(Boolean)) {
    currentPath = currentPath ? currentPath + '/' + segment : segment;
    const target = currentPath, button = document.createElement('button');
    button.textContent = '/ ' + segment; button.onclick = () => navigate(target); $('crumbs').append(button);
  }
  const rows = dataRows(), pages = Math.ceil(rows.length / PAGE);
  page = Math.max(0, Math.min(page, pages - 1));
  $('rows').replaceChildren();
  for (const item of rows.slice(page * PAGE, (page + 1) * PAGE)) {
    const tr = document.createElement('tr'), checkCell = document.createElement('td'), nameCell = document.createElement('td'), sizeCell = document.createElement('td'), metaCell = document.createElement('td');
    checkCell.className = 'check-col';
    if (item.kind === 'file') {
      const check = document.createElement('input'); check.type = 'checkbox'; check.className = 'row-check'; check.checked = selectedFiles.has(item.path);
      check.setAttribute('aria-label', '选择 ' + item.path);
      check.onchange = () => { check.checked ? selectedFiles.add(item.path) : selectedFiles.delete(item.path); render(); renderBatchPreview(); };
      checkCell.append(check);
    }
    const label = (item.kind === 'directory' ? '▸ ' : '') + (item.path || item.name);
    if (item.kind === 'directory') {
      const button = document.createElement('button'); button.textContent = label; button.onclick = () => navigate(item.path); nameCell.append(button);
    } else nameCell.textContent = label;
    if (item.group) { const small = document.createElement('small'); small.textContent = `第 ${item.group} 组 · ${item.count} 份`; nameCell.append(small); }
    sizeCell.textContent = bytes(item.size);
    metaCell.textContent = view === 'duplicate' ? `${item.count} 份` : (tree.root.size ? (item.size / tree.root.size * 100).toFixed(1) + '%' : '0%') + (item.count !== undefined ? ' · ' + item.count : '');
    tr.append(checkCell, nameCell, sizeCell, metaCell); $('rows').append(tr);
  }
  $('empty').hidden = rows.length > 0;
  $('empty').querySelector('strong').textContent = snapshot.files.length ? '没有匹配项' : '选择文件夹开始分析';
  $('page').textContent = `${pages ? page + 1 : 0} / ${pages}`;
  $('prev').disabled = page === 0; $('next').disabled = page + 1 >= pages;
  $('selectionHint').textContent = selectedFiles.size ? `已选择 ${selectedFiles.size} 个文件` : '未选择文件';
  $('batchSelection').textContent = selectedFiles.size ? `已选择 ${selectedFiles.size} 个文件` : '未选择文件';
  $('selectCurrent').disabled = busy || !currentDirectoryFiles().length;
  $('applyRename').disabled = busy || !selectedFiles.size;
  $('applyConvert').disabled = busy || !selectedFiles.size;
  draw(rows);
}

function renameOptions() {
  return {
    prefix: $('renamePrefix').value,
    suffix: $('renameSuffix').value,
    find: $('renameFind').value,
    replace: $('renameReplace').value,
    number: $('renameNumber').value,
    start: Number($('renameStart').value) || 0,
    pad: 4,
    overwrite: $('renameOverwrite').checked
  };
}
function renderBatchPreview() {
  const records = selectedRecords();
  $('applyRename').disabled = busy || !records.length;
  $('applyConvert').disabled = busy || !records.length;
  $('previewCount').textContent = records.length + ' 项';
  const list = $('batchPreview'); list.replaceChildren();
  if (!records.length) { const item = document.createElement('li'); item.textContent = '勾选文件后显示处理结果'; list.append(item); return; }
  const max = 8;
  for (let index = 0; index < Math.min(max, records.length); index++) {
    const record = records[index], item = document.createElement('li');
    const oldName = record.path.split('/').at(-1);
    const target = batchOperation === 'rename' ? renameFileName(oldName, renameOptions(), index) : (() => {
      const format = $('convertFormat').value, ext = format === 'jpeg' ? 'jpg' : format;
      return oldName.replace(/\.[^.]+$/, '') + ($('convertOverwrite').checked ? '' : $('convertSuffix').value) + '.' + ext;
    })();
    item.innerHTML = '';
    const arrow = document.createElement('span'); arrow.textContent = '→'; item.append(oldName + '  ', arrow, '  ' + target); list.append(item);
  }
  if (records.length > max) { const more = document.createElement('li'); more.textContent = `另有 ${records.length - max} 项`; list.append(more); }
}
function executeBatch(operation) {
  if (busy || !selectedFiles.size) { status('请先勾选要处理的文件', 'error'); return; }
  if (batchObjectURL) URL.revokeObjectURL(batchObjectURL);
  batchObjectURL = ''; $('batchDownload').hidden = true;
  setBusy(true);
  const options = operation === 'rename' ? renameOptions() : {
    format: $('convertFormat').value,
    maxEdge: Number($('convertMaxEdge').value) || 0,
    quality: Number($('convertQuality').value) / 100,
    suffix: $('convertSuffix').value,
    overwrite: $('convertOverwrite').checked
  };
  status(operation === 'rename' ? '正在批量重命名…' : '正在批量转换…');
  worker.postMessage({ type: 'batch', operation, paths: [...selectedFiles], options });
}
$('applyRename').onclick = () => executeBatch('rename');
$('applyConvert').onclick = () => executeBatch('convert');
async function prepareBatchDownload(files) {
  status('正在打包处理结果…');
  const { ArchiveEngine } = await import('../archives/archive-engine.mjs');
  const archive = new ArchiveEngine((message) => status(message));
  const blob = await archive.run('create', { format: 'zip', level: '5', password: '', entries: files });
  if (batchObjectURL) URL.revokeObjectURL(batchObjectURL);
  batchObjectURL = URL.createObjectURL(blob);
  $('batchDownload').href = batchObjectURL;
  $('batchDownload').download = '批量处理结果.zip';
  $('batchDownload').hidden = false;
}
$('export').onclick = () => {
  const chunks = ['\ufeff路径,类型,字节,重复组,扫描状态\r\n'];
  const membership = new Map(groups.flatMap((group, index) => group.map((file) => [file.path, index + 1])));
  for (const file of snapshot.files) chunks.push([file.path, '文件', file.size, membership.get(file.path) || '', partial ? '部分' : '完整'].map(csvCell).join(',') + '\r\n');
  const url = URL.createObjectURL(new Blob(chunks, { type: 'text/csv;charset=utf-8' })), anchor = document.createElement('a');
  anchor.href = url; anchor.download = '文件夹分析.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1200);
};
function draw(rows) {
  const map = $('map'), rect = map.getBoundingClientRect();
  map.width = Math.max(1, rect.width * devicePixelRatio); map.height = Math.max(1, rect.height * devicePixelRatio);
  const context = map.getContext('2d'); context.scale(devicePixelRatio, devicePixelRatio); context.clearRect(0, 0, rect.width, rect.height);
  const items = rows.filter((item) => item.size > 0).slice(0, 30), total = items.reduce((sum, item) => sum + item.size, 0);
  if (!total) { context.fillStyle = '#eef1f7'; context.fillRect(0, 0, rect.width, rect.height); return; }
  let x = 0;
  items.forEach((item, index) => {
    const width = item.size / total * rect.width;
    context.fillStyle = ['#4f46e5','#6d67ef','#8f8af1','#b2aff5','#d7d5fa'][index % 5];
    context.fillRect(x, 0, Math.max(0, width - 1.5), rect.height);
    if (width > 70) { context.fillStyle = '#fff'; context.font = '10px system-ui'; context.save(); context.beginPath(); context.rect(x + 5, 0, width - 10, rect.height); context.clip(); context.fillText(item.name || item.path, x + 7, 22); context.fillText(bytes(item.size), x + 7, 38); context.restore(); }
    x += width;
  });
}
new ResizeObserver(() => draw(dataRows())).observe($('map'));
window.addEventListener('beforeunload', () => { worker.postMessage({ type: 'cancel' }); if (batchObjectURL) URL.revokeObjectURL(batchObjectURL); });
setPanel('analysis');
setBatchTab('rename');
setBusy(false);
render();
renderBatchPreview();
