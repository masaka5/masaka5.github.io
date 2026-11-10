let running = false;
let paused = false;
let stopping = false;
let timer = 0;
let root = null;
let handle = null;
let access = null;
let filename = '';
let chunkSize = 0;
let workingSetBytes = 0;
let intervalMs = 100;
let offset = 0;
let fileBytes = 0;
let totalWrittenBytes = 0;
let totalReadBytes = 0;
let cycles = 0;
let startup = null;
let inFlight = null;
let shutdown = null;
let writeData = null;
let readData = null;
let seed = 1;
let failure = '';

function describeError(error) {
  if (error.name === 'QuotaExceededError') return '临时存储空间不足';
  if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return '浏览器未允许文件读写';
  if (error.message === '读回数据校验失败' || error.message === '当前浏览器不支持文件读写') return error.message;
  return '文件读写失败，请检查浏览器存储权限与可用空间';
}

async function openStorage(message) {
  if (!navigator.storage?.getDirectory) throw new Error('当前浏览器不支持文件读写');
  chunkSize = Math.max(4, Math.min(64, Number(message.chunkMb) || 32)) * 1024 ** 2;
  intervalMs = Math.max(0, Number.isFinite(message.intervalMs) ? message.intervalMs : 100);
  workingSetBytes = Math.max(chunkSize, Math.min(1024 ** 3, (Number(message.datasetMb) || 512) * 1024 ** 2));
  if (navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    if (Number.isFinite(estimate.quota) && Number.isFinite(estimate.usage)) {
      const available = Math.floor(Math.max(0, estimate.quota - estimate.usage) * .5 / chunkSize) * chunkSize;
      if (available < chunkSize) { const error = new Error('临时存储空间不足'); error.name = 'QuotaExceededError'; throw error; }
      workingSetBytes = Math.min(workingSetBytes, available);
    }
  }
  workingSetBytes = Math.floor(workingSetBytes / chunkSize) * chunkSize;
  root = await navigator.storage.getDirectory();
  filename = 'hardware-stress-' + crypto.randomUUID() + '.bin';
  handle = await root.getFileHandle(filename, { create: true });
  if (typeof handle.createSyncAccessHandle === 'function') {
    try { access = await handle.createSyncAccessHandle(); }
    catch (error) { if (error.name !== 'NotSupportedError') throw error; }
  }
  writeData = new Uint8Array(chunkSize);
  readData = new Uint8Array(chunkSize);
  seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
}

function fillData() {
  const words = new Uint32Array(writeData.buffer);
  for (let i = 0; i < words.length; i++) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    words[i] = seed >>> 0;
  }
}

function verifyData() {
  const expected = new Uint32Array(writeData.buffer);
  const actual = new Uint32Array(readData.buffer, readData.byteOffset, expected.length);
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== actual[i]) throw new Error('读回数据校验失败');
  }
}

async function diskCycle() {
  fillData();
  let written = 0;
  let read = 0;
  const writeStart = performance.now();
  if (access) {
    while (written < chunkSize) {
      const count = access.write(writeData.subarray(written), { at: offset + written });
      if (!count) throw new Error('文件写入中断');
      written += count;
    }
    access.flush();
  } else {
    const writable = await handle.createWritable({ keepExistingData: true });
    try {
      await writable.write({ type: 'write', position: offset, data: writeData });
      await writable.close();
      written = chunkSize;
    } catch (error) {
      await writable.abort().catch(() => {});
      throw error;
    }
  }
  totalWrittenBytes += written;
  fileBytes = Math.max(fileBytes, offset + written);
  const writeMs = Math.max(.1, performance.now() - writeStart);
  const readStart = performance.now();
  if (access) {
    while (read < chunkSize) {
      const count = access.read(readData.subarray(read), { at: offset + read });
      if (!count) throw new Error('文件读取中断');
      read += count;
    }
  } else {
    const file = await handle.getFile();
    const bytes = await file.slice(offset, offset + chunkSize).arrayBuffer();
    read = bytes.byteLength;
    if (read !== chunkSize) throw new Error('文件读取中断');
    readData.set(new Uint8Array(bytes));
  }
  const readMs = Math.max(.1, performance.now() - readStart);
  totalReadBytes += read;
  verifyData();
  cycles += 1;
  offset = (offset + chunkSize) % workingSetBytes;
  self.postMessage({
    type: 'sample', mode: access ? 'sync' : 'async', verified: true,
    writeMbPerSecond: written / 1024 ** 2 / (writeMs / 1000),
    readMbPerSecond: read / 1024 ** 2 / (readMs / 1000),
    bytes: written, totalWrittenBytes, totalReadBytes, cycles, fileBytes, workingSetBytes
  });
}

function runDiskPulse() {
  if (!running || paused || stopping || !handle || inFlight) return inFlight;
  clearTimeout(timer);
  inFlight = diskCycle().catch(error => {
    running = false;
    failure = describeError(error);
    self.postMessage({ type: 'error', message: failure });
  }).finally(() => {
    inFlight = null;
    if (running && !paused && !stopping) timer = setTimeout(runDiskPulse, intervalMs);
  });
  return inFlight;
}

async function cleanStorage() {
  let cleaned = true;
  if (access) {
    try { access.close(); } catch (error) { cleaned = false; }
    access = null;
  }
  if (root && filename) {
    try { await root.removeEntry(filename); }
    catch (error) { if (error.name !== 'NotFoundError') cleaned = false; }
  }
  handle = null;
  writeData = null;
  readData = null;
  return cleaned;
}

async function stop() {
  running = false;
  stopping = true;
  clearTimeout(timer);
  await startup;
  await inFlight;
  const cleaned = await cleanStorage();
  self.postMessage({ type: 'stopped', cleaned, totalWrittenBytes, totalReadBytes, cycles, error: failure || null });
  self.close();
}

self.onmessage = async event => {
  const message = event.data || {};
  if (message.type === 'start') {
    if (startup || stopping) return;
    running = true;
    startup = openStorage(message).catch(error => {
      running = false;
      failure = describeError(error);
      self.postMessage({ type: 'error', message: failure });
    });
    await startup;
    if (!running || stopping) return;
    self.postMessage({ type: 'ready', supported: true, mode: access ? 'sync' : 'async', workingSetBytes });
    runDiskPulse();
  } else if (message.type === 'pause') {
    paused = true;
    clearTimeout(timer);
  } else if (message.type === 'resume') {
    if (!running || !paused || stopping) return;
    paused = false;
    runDiskPulse();
  } else if (message.type === 'stop') {
    if (!shutdown) shutdown = stop();
    await shutdown;
  }
};
