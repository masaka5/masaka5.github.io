import { sizeBuckets, renameFileName, parseCsv, csvFromRows } from "./folder-core.js";
import { createSHA256 } from "../../vendor/hash-wasm/hash-wasm.js";
const CHUNK = 4 * 1024 * 1024,
  LIMIT = 200000;
let files = [],
  directories = [],
  rootHandle = null,
  editable = false,
  cancelled = false,
  busy = false,
  lastProgress = 0,
  stats = {},
  scanPartial = false;
function progress(phase, extra = {}) {
  const now = Date.now();
  if (now - lastProgress > 100) {
    postMessage({ type: "progress", phase, ...stats, ...extra });
    lastProgress = now;
  }
}
const publicFile = (f) => ({
  path: f.path,
  size: f.size,
  lastModified: f.lastModified,
  kind: "file",
  name: f.path.split("/").pop(),
  parent: f.path.split("/").slice(0, -1).join("/"),
});
async function current(record) {
  try {
    const f = record.handle ? await record.handle.getFile() : record.file;
    if (f.size !== record.size || f.lastModified !== record.lastModified) {
      stats.changed++;
      return null;
    }
    return f;
  } catch {
    stats.unreadable++;
    return null;
  }
}
async function scan(message) {
  files = [];
  directories = [];
  rootHandle = message.handle || null;
  editable = !!message.handle && message.editable === true;
  stats = {
    unreadable: 0,
    changed: 0,
    entries: 0,
    limited: false,
    fallback: !message.handle,
  };
  let stop = false;
  function accept() {
    if (cancelled || stop) return false;
    if (stats.entries >= LIMIT) {
      stats.limited = true;
      stop = true;
      return false;
    }
    stats.entries++;
    return true;
  }
  async function walk(handle, path = "") {
    try {
      for await (const [name, h] of handle.entries()) {
        if (!accept()) break;
        const p = path ? path + "/" + name : name;
        if (h.kind === "directory") {
          directories.push(p);
          await walk(h, p);
        } else {
          try {
            const f = await h.getFile();
            files.push({
              path: p,
              size: f.size,
              lastModified: f.lastModified,
              handle: h,
            });
          } catch {
            stats.unreadable++;
          }
        }
        progress("scan", { files: files.length });
      }
    } catch {
      stats.unreadable++;
    }
  }
  if (message.handle) await walk(message.handle);
  else {
    const knownDirectories = new Set();
    for (const entry of message.files) {
      const file = entry.file || entry;
      const path =
        entry.path ||
        file.webkitRelativePath?.split("/").slice(1).join("/") ||
        file.name;
      const segments = path.split("/");
      segments.pop();
      let parent = "";
      for (const segment of segments) {
        parent = parent ? parent + "/" + segment : segment;
        if (!knownDirectories.has(parent)) {
          if (!accept()) break;
          knownDirectories.add(parent);
          directories.push(parent);
        }
      }
      if (!accept()) break;
      files.push({
        path,
        size: file.size,
        lastModified: file.lastModified,
        file,
      });
      progress("scan", { files: files.length });
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  scanPartial = cancelled || stats.limited;
  postMessage({
    type: "scan",
    files: files.map(publicFile),
    directories,
    editable,
    stats,
    partial: scanPartial,
  });
}
async function duplicates() {
  const { candidates, empty, skipped } = sizeBuckets(files),
    hashes = new Map(),
    groups = [];
  stats = {
    ...stats,
    changed: 0,
    unreadable: 0,
    hashed: 0,
    readBytes: 0,
    compared: 0,
    uniqueSkipped: skipped,
  };
  const hasher = await createSHA256();
  async function exact(a, b) {
    const fa = await current(a),
      fb = await current(b);
    if (!fa || !fb) return false;
    for (let offset = 0; offset < a.size; offset += CHUNK) {
      if (cancelled) return false;
      const [aa, bb] = await Promise.all([
        fa.slice(offset, offset + CHUNK).arrayBuffer(),
        fb.slice(offset, offset + CHUNK).arrayBuffer(),
      ]);
      stats.readBytes += aa.byteLength + bb.byteLength;
      const x = new Uint8Array(aa),
        y = new Uint8Array(bb);
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
      progress("duplicate", { total: candidates.length });
    }
    if (!(await current(a)) || !(await current(b))) return false;
    stats.compared++;
    return true;
  }
  for (const record of candidates) {
    if (cancelled) break;
    const f = await current(record);
    if (!f) continue;
    try {
      hasher.init();
      for (let offset = 0; offset < f.size; offset += CHUNK) {
        if (cancelled) break;
        const buffer = await f.slice(offset, offset + CHUNK).arrayBuffer();
        hasher.update(new Uint8Array(buffer));
        stats.readBytes += buffer.byteLength;
        progress("duplicate", { total: candidates.length });
      }
      if (cancelled) break;
      if (!(await current(record))) continue;
      const key = record.size + ":" + hasher.digest();
      if (!hashes.has(key)) hashes.set(key, []);
      hashes.get(key).push(record);
      stats.hashed++;
    } catch {
      stats.unreadable++;
    }
  }
  for (const bucket of hashes.values()) {
    if (cancelled) break;
    const partitions = [];
    for (const record of bucket) {
      if (cancelled) break;
      let found = false;
      for (const p of partitions) {
        try {
          if (await exact(p[0], record)) {
            p.push(record);
            found = true;
            break;
          }
        } catch {
          stats.unreadable++;
        }
      }
      if (!found) partitions.push([record]);
    }
    groups.push(
      ...partitions.filter((p) => p.length > 1).map((p) => p.map(publicFile)),
    );
  }
  if (!cancelled && empty.length > 1) {
    const valid = [];
    for (const e of empty) {
      if (cancelled) break;
      if (await current(e)) valid.push(publicFile(e));
    }
    if (valid.length > 1) groups.push(valid);
  }
  postMessage({
    type: "duplicates",
    groups,
    stats,
    partial: cancelled || scanPartial,
    scanPartial,
    cancelled,
    redundant: groups.reduce((n, g) => n + g[0].size * (g.length - 1), 0),
  });
}
onmessage = async ({ data }) => {
  if (data.type === "cancel") {
    cancelled = true;
    return;
  }
  if (busy) return;
  busy = true;
  cancelled = false;
  try {
    if (data.type === "scan") await scan(data);
    if (data.type === "duplicates") await duplicates();
    if (data.type === "batch") await runBatch(data);
  } catch (error) {
    postMessage({ type: "error", message: error.message });
  } finally {
    busy = false;
  }
};

async function directoryAt(path) {
  let handle = rootHandle;
  for (const segment of path.split('/').filter(Boolean)) handle = await handle.getDirectoryHandle(segment);
  return handle;
}
async function blobFor(record) {
  const file = record.handle ? await record.handle.getFile() : record.file;
  if (file.size !== record.size || file.lastModified !== record.lastModified) throw Error('文件已变化：' + record.path);
  return file;
}
async function writeOutput(record, targetName, blob, overwrite) {
  const parent = record.path.split('/').slice(0, -1).join('/');
  const targetPath = parent ? parent + '/' + targetName : targetName;
  if (!rootHandle) return { path: targetPath, blob };
  const directory = await directoryAt(parent);
  if (!overwrite) {
    for (const method of ['getFileHandle', 'getDirectoryHandle']) {
      try { await directory[method](targetName); throw Error('目标已存在：' + targetName); }
      catch (error) { if (!/not found|NotFound|TypeError/i.test(error?.name + ' ' + error?.message)) throw error; }
    }
  }
  const output = await directory.getFileHandle(targetName, { create: true });
  const stream = await output.createWritable();
  try { await stream.write(blob); await stream.close(); }
  catch (error) { await stream.abort(); throw error; }
  const oldName = record.path.split('/').at(-1);
  if (oldName !== targetName) await directory.removeEntry(oldName);
  const file = await output.getFile();
  record.path = targetPath; record.size = file.size; record.lastModified = file.lastModified; record.handle = output;
  return { path: targetPath, written: true };
}
async function convertBlob(file, target, options) {
  const extension = file.name.split('.').at(-1)?.toLowerCase() || '';
  if (['webp','jpeg','png'].includes(target)) {
    if (!file.type.startsWith('image/')) return null;
    const bitmap = await createImageBitmap(file);
    let width = bitmap.width, height = bitmap.height;
    const maxEdge = Math.max(0, Number(options.maxEdge) || 0);
    if (maxEdge && Math.max(width, height) > maxEdge) {
      const scale = maxEdge / Math.max(width, height);
      width = Math.max(1, Math.round(width * scale)); height = Math.max(1, Math.round(height * scale));
    }
    const output = new OffscreenCanvas(width, height), context = output.getContext('2d');
    if (target === 'jpeg') { context.fillStyle = '#fff'; context.fillRect(0, 0, width, height); }
    context.drawImage(bitmap, 0, 0, width, height); bitmap.close?.();
    const mime = target === 'jpeg' ? 'image/jpeg' : 'image/' + target;
    return { blob: await output.convertToBlob({ type: mime, quality: Math.max(.45, Math.min(1, Number(options.quality) || .88)) }), extension: target === 'jpeg' ? 'jpg' : target };
  }
  if (target === 'json' && extension === 'csv') {
    const rows = parseCsv(await file.text());
    if (!rows.length) throw Error('CSV 没有数据');
    const headers = rows.shift().map((value, index) => value || 'column' + (index + 1));
    const values = rows.filter(row => row.some(Boolean)).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
    return { blob: new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' }), extension: 'json' };
  }
  if (target === 'csv' && extension === 'json') {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data) || !data.length || typeof data[0] !== 'object' || Array.isArray(data[0])) throw Error('JSON 需为对象数组');
    const headers = [...new Set(data.flatMap(Object.keys))];
    const rows = [headers, ...data.map(item => headers.map(key => typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key] ?? ''))];
    return { blob: new Blob(['\ufeff' + csvFromRows(rows)], { type: 'text/csv;charset=utf-8' }), extension: 'csv' };
  }
  return null;
}

async function runBatch(data) {
  const paths = new Set(data.paths || []), targets = files.filter(file => paths.has(file.path));
  if (!targets.length) throw Error('请选择要处理的文件');
  const operation = data.operation, options = data.options || {}, results = [], outputs = [];
  let changed = 0;
  for (let index = 0; index < targets.length; index++) {
    if (cancelled) break;
    const record = targets[index];
    try {
      progress('batch', { total: targets.length, completed: index, operation });
      const source = await blobFor(record);
      if (operation === 'rename') {
        const targetName = renameFileName(record.path.split('/').at(-1), options, index);
        if (targetName === record.path.split('/').at(-1)) throw Error('名称未变化');
        const output = await writeOutput(record, targetName, source, !!options.overwrite);
        results.push({ status: 'ok', path: output.path }); if (output.blob) outputs.push({ path: output.path, blob: output.blob }); changed++;
      } else {
        const converted = await convertBlob(source, options.format, options);
        if (!converted) { results.push({ status: 'skipped', path: record.path, message: '格式不匹配' }); continue; }
        const oldName = record.path.split('/').at(-1), stem = oldName.replace(/\.[^.]+$/, '');
        const extension = '.' + converted.extension;
        const targetName = options.overwrite ? stem + extension : stem + String(options.suffix || '-转换') + extension;
        const output = await writeOutput(record, targetName, converted.blob, !!options.overwrite);
        results.push({ status: 'ok', path: output.path }); if (output.blob) outputs.push({ path: output.path, blob: output.blob }); changed++;
      }
    } catch (error) {
      results.push({ status: 'error', path: record.path, message: error.message });
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  progress('batch', { total: targets.length, completed: targets.length, operation });
  postMessage({ type: 'batch', operation, editable, total: targets.length, changed, results, files: outputs, cancelled });
}
