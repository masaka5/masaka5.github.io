const refs = {
  shell: document.querySelector('.app-shell'),
  start: document.getElementById('startBtn'),
  startLabel: document.getElementById('startLabel'),
  pause: document.getElementById('pauseBtn'),
  stop: document.getElementById('stopBtn'),
  runState: document.getElementById('runState'),
  elapsed: document.getElementById('elapsedLabel'),
  session: document.getElementById('sessionLabel'),
  clock: document.getElementById('clockLabel'),
  duration: document.getElementById('duration'),
  workers: document.getElementById('workers'),
  chart: document.getElementById('loadChart'),
  chartEmpty: document.getElementById('chartEmpty'),
  sample: document.getElementById('sampleLabel'),
  peak: document.getElementById('peakLabel'),
  log: document.getElementById('eventLog'),
  logCount: document.getElementById('logCount'),
  gpuCanvas: document.getElementById('gpuCanvas'),
  export: document.getElementById('exportBtn'),
  exportCsv: document.getElementById('exportCsvBtn'),
  pauseOnHidden: document.getElementById('pauseOnHidden'),
  chartLegend: document.getElementById('chartLegend'),
  remaining: document.getElementById('remainingLabel'),
  progress: document.getElementById('testProgress'),
  progressLabel: document.getElementById('progressLabel'),
  environment: document.getElementById('environmentSummary')
};

const SETTINGS_KEY = 'hardware-stress-settings-v1';

const state = {
  phase: 'idle',
  startedAt: 0,
  elapsedMs: 0,
  duration: 300,
  workerCount: 20,
  profile: null,
  enabled: { cpu: true, memory: true, gpu: true, disk: true },
  cpuWorkers: [],
  cpuRates: [],
  cpuRate: 0,
  memoryWorker: null,
  memoryBytes: 0,
  memoryRate: 0,
  memoryThroughput: 0,
  gpu: { gl: null, program: null, buffer: null, uniformTime: null, raf: 0, frames: 0, fps: 0, lastFrameAt: 0, supported: false },
  diskWorker: null,
  diskWriteRate: 0,
  diskReadRate: 0,
  diskChecked: false,
  diskSupported: false,
  diskError: '',
  diskStats: { mode: null, totalWrittenBytes: 0, totalReadBytes: 0, cycles: 0, workingSetBytes: 0 },
  timers: { sample: 0, clock: 0 },
  history: { cpu: [], memory: [], gpu: [], disk: [] },
  peak: 0,
  logEntries: 0,
  sessionStartedAt: null,
  sessionLog: [],
  sessionSamples: [],
  lastReport: null
};

const colors = { cpu: '#f59b45', memory: '#79c69a', gpu: '#b69adf', disk: '#73b8d9' };

function selectedProfile() {
  const levels = Object.fromEntries(Array.from(document.querySelectorAll('[data-level]'), (input) => [input.dataset.level, input.value]));
  const reportedMemoryMb = window.WorkloadProfiles.estimateSystemMemoryMb(navigator.deviceMemory);
  return window.WorkloadProfiles.createProfile(levels, reportedMemoryMb);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return mins + ':' + secs;
}

function formatClock(date) {
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatBytes(bytes) {
  return formatMemoryAmount(bytes / (1024 * 1024));
}

function formatMemoryAmount(mb) {
  const value = Number(mb) || 0;
  return value >= 1024 ? (value / 1024).toFixed(value % 1024 ? 1 : 0) + ' GB' : Math.round(value) + ' MB';
}

function readSavedSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return;
    if (typeof saved.pauseOnHidden === 'boolean') refs.pauseOnHidden.checked = saved.pauseOnHidden;
    for (const [key, input] of [['duration', refs.duration], ['workers', refs.workers]]) {
      const value = String(saved[key]);
      if (Array.from(input.options).some((option) => option.value === value)) input.value = value;
    }
    Object.entries(saved.levels || {}).forEach(([resource, level]) => {
      const input = document.querySelector('[data-level="' + resource + '"]');
      if (input && Array.from(input.options).some((option) => option.value === level)) input.value = level;
    });
    Object.entries(saved.enabled || {}).forEach(([resource, enabled]) => {
      const input = document.querySelector('[data-resource-toggle="' + resource + '"]');
      if (input && typeof enabled === 'boolean') input.checked = enabled;
    });
  } catch (error) {
    // 浏览器隐私模式可能禁用本地存储，使用页面默认设置即可。
  }
}

function saveSettings() {
  try {
    const levels = Object.fromEntries(Array.from(document.querySelectorAll('[data-level]'), (input) => [input.dataset.level, input.value]));
    const enabled = Object.fromEntries(Array.from(document.querySelectorAll('[data-resource-toggle]'), (input) => [input.dataset.resourceToggle, input.checked]));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ duration: refs.duration.value, workers: refs.workers.value, pauseOnHidden: refs.pauseOnHidden.checked, levels, enabled }));
  } catch (error) {
    // 设置记忆失败不应影响压测。
  }
}

function updateEnvironmentSummary() {
  if (!refs.environment || !state.profile) return;
  const cpuHint = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' 个逻辑核心' : '核心数未知';
  const memoryHint = navigator.deviceMemory ? formatMemoryAmount(state.profile.memory.estimatedTotalMb) + ' 浏览器内存估算' : '内存未识别 · 保守额度';
  const gpuHint = state.gpu.supported ? 'WebGL 可用' : 'WebGL 受限';
  refs.environment.textContent = cpuHint + ' · ' + memoryHint + ' · ' + gpuHint;
}

function applyPreset(name) {
  if (state.phase === 'running' || state.phase === 'paused') return;
  const preset = window.WorkloadProfiles.createPreset(name);
  Object.entries(preset.levels).forEach(([resource, level]) => {
    const input = document.querySelector('[data-level="' + resource + '"]');
    if (input) input.value = level;
  });
  Object.entries(preset.enabled).forEach(([resource, enabled]) => {
    const input = document.querySelector('[data-resource-toggle="' + resource + '"]');
    if (!input) return;
    input.checked = enabled;
    state.enabled[resource] = enabled;
    setCardEnabled(resource, enabled);
    const card = document.querySelector('[data-resource-card="' + resource + '"]');
    if (card) card.hidden = !enabled;
    setResourceStatus(resource, !enabled ? '已关闭' : resource === 'gpu' && !state.gpu.supported ? '受限' : resource === 'disk' ? '待测' : '就绪');
  });
  state.profile = selectedProfile();
  saveSettings();
  updateEnvironmentSummary();
  updateMetricUi();
  const labels = { balanced: '均衡', 'full-extreme': '全开极限', 'cpu-memory': 'CPU + 内存' };
  logEvent('已应用“' + (labels[name] || '自定义') + '”预设。');
}

function downloadReport(format = 'json') {
  if (!state.lastReport) return;
  const csv = format === 'csv';
  const content = csv ? window.SessionTools.toCsv(state.lastReport) : JSON.stringify(state.lastReport, null, 2);
  const blob = new Blob([content], { type: csv ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = '硬件压测报告-' + new Date().toISOString().slice(0, 10) + '-' + formatClock(new Date()).replaceAll(':', '') + (csv ? '.csv' : '.json');
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  logEvent(csv ? 'CSV 数据已导出。' : 'JSON 报告已导出。');
}

function updateTimingUi() {
  const duration = state.phase === 'idle' ? Number(refs.duration.value) : state.duration;
  const timing = window.SessionTools.getTiming(duration, state.elapsedMs);
  refs.elapsed.textContent = formatTime(timing.elapsedSeconds);
  refs.remaining.textContent = '剩余 ' + formatTime(timing.remainingSeconds);
  refs.progress.value = timing.percent;
  refs.progressLabel.textContent = Math.floor(timing.percent) + '%';
}

function handleVisibilityChange() {
  if (document.hidden && refs.pauseOnHidden.checked && state.phase === 'running') pauseTest('background');
}

function logEvent(message, tone = '') {
  const empty = refs.log.querySelector('.log-empty');
  if (empty) empty.remove();
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = formatClock(new Date());
  const body = document.createElement('strong');
  body.textContent = message;
  entry.append(time, body);
  if (tone === 'warn') entry.style.color = '#e6b27c';
  if (tone === 'danger') entry.style.color = '#e57268';
  refs.log.prepend(entry);
  while (refs.log.children.length > 200) refs.log.lastElementChild.remove();
  if (state.sessionStartedAt) state.sessionLog.push({ time: new Date().toISOString(), message, tone });
  state.logEntries += 1;
  refs.logCount.textContent = state.logEntries + ' 条';
}

function setResourceStatus(resource, text, live = false) {
  const node = document.querySelector('[data-status="' + resource + '"]');
  if (!node) return;
  if (state.phase === 'paused' && live) {
    node.dataset.resumeLabel = text;
    node.textContent = '已暂停';
    node.dataset.live = 'false';
    return;
  }
  delete node.dataset.resumeLabel;
  node.textContent = text;
  node.dataset.live = live ? 'true' : 'false';
}

function setCardEnabled(resource, enabled) {
  const card = document.querySelector('[data-resource-card="' + resource + '"]');
  const rail = document.querySelector('[data-rail="' + resource + '"]');
  if (card) card.dataset.enabled = enabled ? 'true' : 'false';
  if (rail) rail.style.opacity = enabled ? '1' : '.35';
}

function updatePhaseUi() {
  const running = state.phase === 'running';
  const paused = state.phase === 'paused';
  refs.shell.dataset.state = state.phase;
  refs.runState.textContent = running ? '运行中' : paused ? '已暂停' : state.phase === 'stopped' ? '已结束' : '待机';
  refs.session.textContent = running ? '运行中' : paused ? '已暂停' : state.phase === 'stopped' ? '已结束' : '未开始';
  refs.startLabel.textContent = paused ? '继续压测' : '开始压测';
  refs.start.disabled = running;
  refs.pause.textContent = paused ? '继续' : '暂停';
  refs.pause.disabled = !(running || paused);
  refs.stop.disabled = !(running || paused);
  refs.export.disabled = running || paused || !state.lastReport;
  refs.exportCsv.disabled = refs.export.disabled;
  refs.pauseOnHidden.disabled = running || paused;
  [refs.duration, refs.workers, ...document.querySelectorAll('[data-level]')].forEach((node) => { node.disabled = running || paused; });
  document.querySelectorAll('[data-resource-toggle]').forEach((node) => { node.disabled = running || paused; });
  document.querySelectorAll('[data-preset]').forEach((node) => { node.disabled = running || paused; });
  document.querySelectorAll('[data-status]').forEach((node) => {
    if (paused && node.dataset.live === 'true') {
      node.dataset.resumeLabel = node.textContent;
      node.textContent = '已暂停';
      node.dataset.live = 'false';
    } else if (!paused && node.dataset.resumeLabel) {
      if (running) {
        node.textContent = node.dataset.resumeLabel;
        node.dataset.live = 'true';
      }
      delete node.dataset.resumeLabel;
    }
  });
  updateTimingUi();
}

function clearHistory() {
  Object.keys(state.history).forEach((key) => { state.history[key] = []; });
  state.peak = 0;
  refs.chartEmpty.classList.remove('hidden');
  refs.sample.textContent = '采样 0';
  drawChart();
  ['cpu', 'memory', 'gpu', 'disk'].forEach(drawSparkline);
}

function pushHistory(resource, value) {
  const list = state.history[resource];
  list.push(Math.max(0, Number(value) || 0));
  if (list.length > 45) list.shift();
  drawSparkline(resource);
}

function drawSparkline(resource) {
  const canvas = document.getElementById(resource + 'Spark');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const values = state.history[resource];
  if (!values.length) return;
  ctx.strokeStyle = colors[resource];
  ctx.globalAlpha = .7;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = values.length === 1 ? 0 : index / (values.length - 1) * width;
    const y = height - Math.min(1, value / 100) * (height - 4) - 2;
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawChart() {
  const canvas = refs.chart;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const charts = window.SessionTools.getCharts(state.sessionSamples);
  const names = { cpu: 'CPU', memory: '内存', gpu: 'GPU', disk: '磁盘' };
  refs.chartLegend.replaceChildren();
  for (const chart of charts) {
    const label = document.createElement('span');
    const dot = document.createElement('i');
    dot.className = 'legend-dot';
    dot.style.background = chart.series[0].color;
    const latest = chart.series.map(series => series.values.at(-1)?.value);
    label.setAttribute('aria-label', names[chart.key] + '：' + latest.map(value => value == null ? '无数据' : value.toFixed(1) + ' ' + chart.unit).join(' / '));
    label.append(dot, document.createTextNode(names[chart.key]));
    refs.chartLegend.append(label);
  }
  refs.chartEmpty.classList.add('hidden');
  refs.peak.textContent = '各项独立刻度';
  const laneHeight = (height - 20) / charts.length;
  const left = 48;
  const right = width - 8;
  const number = value => value < 1 ? value.toFixed(2) : value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString();
  ctx.font = '10px "Segoe UI", sans-serif';
  charts.forEach((chart, index) => {
    const origin = index * laneHeight;
    const top = origin + (laneHeight < 50 ? 20 : 26);
    const bottom = Math.max(top + 4, origin + laneHeight - 7);
    ctx.textAlign = 'left';
    ctx.fillStyle = chart.series[0].color;
    ctx.fillText(names[chart.key] + ' · ' + chart.unit, 0, origin + 13);
    ctx.textAlign = 'right';
    let cursor = right;
    for (const series of [...chart.series].reverse()) {
      const value = series.values.at(-1)?.value;
      const text = (chart.key === 'disk' ? series.label + ' ' : '') + (value == null ? '—' : number(value));
      ctx.fillStyle = series.color;
      ctx.fillText(text, cursor, origin + 13);
      cursor -= ctx.measureText(text).width + 12;
    }
    for (let tick = 0; tick <= 2; tick++) {
      const y = bottom - (bottom - top) * tick / 2;
      ctx.strokeStyle = '#303838';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      if (tick === 1) continue;
      ctx.fillStyle = '#a0adaa';
      ctx.textAlign = 'right';
      ctx.fillText(number(chart.maximum * tick / 2), left - 7, y + 3);
    }
    if (!chart.hasData) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#a0adaa';
      ctx.fillText(state.enabled[chart.key] ? '等待采样' : '未启用', (left + right) / 2, (top + bottom) / 2 + 3);
    }
    for (const series of chart.series) {
      ctx.strokeStyle = series.color;
      ctx.fillStyle = series.color;
      ctx.lineWidth = 1.6;
      let connected = false;
      let lastPoint = null;
      ctx.beginPath();
      for (const point of series.values) {
        if (point.value === null) { connected = false; continue; }
        const x = left + (point.time - chart.start) / (chart.end - chart.start) * (right - left);
        const y = bottom - point.value / chart.maximum * (bottom - top);
        if (connected) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        connected = true;
        lastPoint = { x, y };
      }
      ctx.stroke();
      if (lastPoint) {
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  ctx.fillStyle = '#a0adaa';
  ctx.textAlign = 'left';
  ctx.fillText(formatTime(charts[0].start), left, height - 3);
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(charts[0].end), right, height - 3);
}

function updateMetricUi() {
  const cpuPct = state.cpuWorkers.length
    ? Math.max(0, Math.min(100, Math.round(state.cpuRate / (state.cpuWorkers.length * 1100000) * 100)))
    : 0;
  const memoryPct = Math.max(0, Math.min(100, Math.round(state.memoryBytes / ((state.profile?.memory.targetMb || 1) * 1024 * 1024) * 100)));
  const gpuPct = state.phase === 'running' && state.enabled.gpu && state.gpu.supported && state.profile ? Math.min(100, Math.round(state.profile.gpu.workUnits)) : 0;
  const diskPct = state.phase === 'running' && state.enabled.disk && state.diskSupported && state.profile ? Math.min(100, Math.round(state.profile.disk.chunkMb / 0.64)) : 0;
  document.getElementById('cpuValue').textContent = String(cpuPct);
  document.getElementById('cpuMeter').style.width = cpuPct + '%';
  document.getElementById('cpuDetail').textContent = state.workerCount + ' 线程 · ' + (state.phase === 'running' ? '运行中' : state.phase === 'paused' ? '已暂停' : '空闲');
  document.getElementById('cpuRate').textContent = state.cpuRate ? Math.round(state.cpuRate).toLocaleString() + ' 次/秒' : '— 次/秒';
  document.getElementById('memoryValue').textContent = formatBytes(state.memoryBytes);
  document.getElementById('memoryMeter').style.width = memoryPct + '%';
  const memoryProfile = state.profile?.memory;
  document.getElementById('memoryDetail').textContent = memoryProfile?.unlimited
    ? '自动上限 ' + formatMemoryAmount(memoryProfile.safetyCapMb) + ' · 预留 ' + memoryProfile.reservePercent + '%'
    : '目标 ' + formatMemoryAmount(memoryProfile?.targetMb || 384) + ' · 上限 ' + formatMemoryAmount(memoryProfile?.safetyCapMb || 384);
  document.getElementById('memoryRate').textContent = state.memoryThroughput ? state.memoryThroughput.toFixed(0) + ' MB/秒' : '— MB/秒';
  document.getElementById('gpuValue').textContent = state.gpu.supported ? String(Math.round(state.gpu.fps)) : '—';
  document.getElementById('gpuMeter').style.width = gpuPct + '%';
  document.getElementById('gpuDetail').textContent = state.gpu.supported && state.profile
    ? state.profile.gpu.width + ' × ' + state.profile.gpu.height + ' · ' + (state.profile.gpu.unlimited ? '持续绘制' : state.profile.gpu.passesPerFrame + ' 次/帧')
    : '图形加速不可用';
  document.getElementById('gpuRate').textContent = state.gpu.supported && state.profile
    ? state.profile.gpu.unlimited ? '持续绘制 · 屏幕刷新率限制' : state.profile.gpu.iterations + ' 轮/像素'
    : '— 轮/像素';
  document.getElementById('diskValue').textContent = state.diskWriteRate ? state.diskWriteRate.toFixed(0) : '0';
  document.getElementById('diskMeter').style.width = diskPct + '%';
  document.getElementById('diskDetail').textContent = state.diskError || (state.diskSupported ? (state.diskStats.mode === 'sync' ? '同步写入 · 刷新 · 读回校验' : '文件写入 · 关闭提交 · 读回校验') : state.diskChecked ? '本地临时存储不可用' : '开测后检测文件读写');
  document.getElementById('diskDetail').title = document.getElementById('diskDetail').textContent;
  document.getElementById('diskRate').textContent = state.diskSupported ? '读取 ' + (state.diskReadRate ? state.diskReadRate.toFixed(0) : '—') + ' MB/秒' : state.diskChecked ? '无法读取' : '读取 — MB/秒';
  const totals = document.getElementById('diskTotals');
  totals.textContent = '累计写 ' + formatBytes(state.diskStats.totalWrittenBytes) + ' / 读 ' + formatBytes(state.diskStats.totalReadBytes);
  totals.title = totals.textContent + ' · ' + state.diskStats.cycles + ' 轮校验通过 · 测试文件上限 ' + formatBytes(state.diskStats.workingSetBytes);

  const metrics = { cpu: cpuPct, memory: memoryPct, gpu: gpuPct, disk: diskPct };
  Object.entries(metrics).forEach(([key, value]) => {
    const rail = document.querySelector('[data-rail="' + key + '"] b');
    if (rail) rail.style.width = value + '%';
    if (state.enabled[key]) pushHistory(key, value);
  });
  state.peak = Math.max(state.peak, cpuPct, memoryPct, gpuPct, diskPct);
}

function sample() {
  if (state.phase === 'running') {
    state.elapsedMs = performance.now() - state.startedAt;
    if (state.elapsedMs >= state.duration * 1000) {
      stopTest(true);
      return;
    }
    state.sessionSamples.push({
      elapsedSeconds: Number((state.elapsedMs / 1000).toFixed(2)),
      cpuIterationsPerSecond: state.enabled.cpu ? state.cpuRate : null,
      memoryAllocatedBytes: state.enabled.memory && state.memoryWorker ? state.memoryBytes : null,
      memoryWriteMBPerSecond: state.enabled.memory && state.memoryWorker ? state.memoryThroughput : null,
      gpuScreenFPS: state.enabled.gpu && state.gpu.supported ? state.gpu.fps : null,
      diskWriteMBPerSecond: state.enabled.disk && state.diskSupported ? state.diskWriteRate : null,
      diskReadMBPerSecond: state.enabled.disk && state.diskSupported ? state.diskReadRate : null
    });
    refs.sample.textContent = '采样 ' + state.sessionSamples.length;
    drawChart();
  }
  updateTimingUi();
  updateMetricUi();
}

function createCpuWorkers() {
  state.cpuWorkers.forEach((worker) => worker.terminate());
  state.cpuWorkers = [];
  state.cpuRates = [];
  if (!state.enabled.cpu) {
    setResourceStatus('cpu', '已关闭');
    return;
  }
  for (let index = 0; index < state.workerCount; index += 1) {
    const worker = new Worker('workers/cpu-worker.js');
    worker.onmessage = (event) => {
      if (event.data && event.data.type === 'sample') {
        state.cpuRates[index] = event.data.iterationsPerSecond || 0;
        state.cpuRate = state.cpuRates.reduce((sum, value) => sum + value, 0);
      }
    };
    worker.onerror = () => logEvent('CPU 线程 ' + (index + 1) + ' 无法启动，请使用本地服务器打开页面。', 'warn');
    worker.postMessage({ type: 'start', intensity: state.profile.cpu.intensity, unlimited: state.profile.cpu.unlimited });
    state.cpuWorkers.push(worker);
  }
  setResourceStatus('cpu', '运行中', true);
}

function createMemoryWorker() {
  if (state.memoryWorker) state.memoryWorker.terminate();
  state.memoryWorker = null;
  state.memoryBytes = 0;
  state.memoryRate = 0;
  state.memoryThroughput = 0;
  if (!state.enabled.memory) {
    setResourceStatus('memory', '已关闭');
    return;
  }
  const worker = new Worker('workers/memory-worker.js');
  worker.onmessage = (event) => {
    if (event.data && event.data.type === 'sample') {
      state.memoryBytes = event.data.allocatedBytes || 0;
      state.memoryThroughput = event.data.throughputMbPerSecond || 0;
    } else if (event.data && event.data.type === 'limit-reached') {
      const growing = state.profile.memory.unlimited;
      setResourceStatus('memory', growing ? '达到自动上限' : '持续读写', true);
      logEvent(growing ? '内存已达到自动上限，保持读写测试。' : '内存已达到目标，保持读写测试。');
    } else if (event.data && event.data.type === 'allocation-stopped') {
      state.memoryBytes = 0;
      state.memoryThroughput = 0;
      setResourceStatus('memory', '分配受限');
      logEvent(event.data.reason || '浏览器限制了内存分配，已停止内存压测。', 'warn');
      worker.terminate();
      if (state.memoryWorker === worker) state.memoryWorker = null;
      updateMetricUi();
    }
  };
  worker.onerror = () => {
    worker.terminate();
    if (state.memoryWorker === worker) state.memoryWorker = null;
    state.memoryBytes = 0;
    state.memoryThroughput = 0;
    setResourceStatus('memory', '运行失败');
    logEvent('内存线程运行失败，已释放本项任务。', 'warn');
  };
  worker.postMessage({ type: 'start', targetMb: state.profile.memory.targetMb, intervalMs: state.profile.memory.intervalMs, unlimited: state.profile.memory.unlimited });
  state.memoryWorker = worker;
  setResourceStatus('memory', '运行中', true);
}

function initGpu() {
  const gl = refs.gpuCanvas.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
  if (!gl) {
    state.gpu.supported = false;
    setResourceStatus('gpu', '受限');
    return;
  }
  const vertexSource = 'attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }';
  const fragmentSource = 'precision highp float; uniform float t; uniform vec2 resolution; uniform int iterations; void main(){ vec2 uv=gl_FragCoord.xy/resolution; float v=0.0; for(int i=0;i<512;i++){ if(i>=iterations) break; float fi=float(i); v+=sin(uv.x*fi+t)*cos(uv.y*fi-t)+sin((uv.x+uv.y)*fi*0.37+t*0.6); } gl_FragColor=vec4(0.55+0.15*sin(v),0.32+0.18*cos(v),0.12+0.08*sin(v*0.3),1.0); }';
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    state.gpu.supported = false;
    setResourceStatus('gpu', '受限');
    return;
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const attribute = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
  state.gpu = { gl, program, buffer, uniformTime: gl.getUniformLocation(program, 't'), uniformResolution: gl.getUniformLocation(program, 'resolution'), uniformIterations: gl.getUniformLocation(program, 'iterations'), raf: 0, frames: 0, fps: 0, lastFrameAt: performance.now(), supported: true };
  setResourceStatus('gpu', '就绪');
}

function gpuFrame(timestamp) {
  if (!state.gpu.supported) return;
  const gpu = state.gpu;
  if (state.phase === 'running' && state.enabled.gpu) {
    const config = state.profile.gpu;
    if (gpu.gl.canvas.width !== config.width || gpu.gl.canvas.height !== config.height) {
      gpu.gl.canvas.width = config.width;
      gpu.gl.canvas.height = config.height;
      gpu.gl.viewport(0, 0, config.width, config.height);
    }
    gpu.gl.useProgram(gpu.program);
    gpu.gl.uniform1f(gpu.uniformTime, timestamp * 0.001);
    gpu.gl.uniform2f(gpu.uniformResolution, config.width, config.height);
    gpu.gl.uniform1i(gpu.uniformIterations, config.iterations);
    if (config.unlimited) {
      const workSliceEnd = performance.now() + 10;
      do {
        gpu.gl.uniform1f(gpu.uniformTime, timestamp * 0.001 + performance.now() * 0.0001);
        gpu.gl.drawArrays(gpu.gl.TRIANGLE_STRIP, 0, 4);
      } while (performance.now() < workSliceEnd);
    } else {
      for (let pass = 0; pass < config.passesPerFrame; pass += 1) {
        gpu.gl.uniform1f(gpu.uniformTime, timestamp * 0.001 + pass * 0.01);
        gpu.gl.drawArrays(gpu.gl.TRIANGLE_STRIP, 0, 4);
      }
    }
    gpu.frames += 1;
    if (timestamp - gpu.lastFrameAt > 500) {
      gpu.fps = gpu.frames / ((timestamp - gpu.lastFrameAt) / 1000);
      gpu.frames = 0;
      gpu.lastFrameAt = timestamp;
      setResourceStatus('gpu', '运行中', true);
    }
  }
  gpu.raf = requestAnimationFrame(gpuFrame);
}

function stopGpu() {
  if (state.gpu.raf) cancelAnimationFrame(state.gpu.raf);
  state.gpu.raf = 0;
  state.gpu.fps = 0;
  if (state.gpu.gl) state.gpu.gl.clear(state.gpu.gl.COLOR_BUFFER_BIT);
}

function createDiskWorker() {
  if (!state.enabled.disk) {
    setResourceStatus('disk', '已关闭');
    return;
  }
  const worker = new Worker('workers/disk-worker.js?v=2');
  worker.onmessage = (event) => {
    if (state.diskWorker !== worker) return;
    if (event.data.type === 'ready') {
      state.diskChecked = true;
      state.diskSupported = event.data.supported;
      state.diskStats.mode = event.data.mode;
      state.diskStats.workingSetBytes = event.data.workingSetBytes || 0;
      setResourceStatus('disk', event.data.supported ? '准备读写' : '不支持');
      if (!event.data.supported) logEvent('浏览器不支持临时文件读写，磁盘压测未启动。', 'warn');
    } else if (event.data.type === 'sample') {
      state.diskWriteRate = event.data.writeMbPerSecond || 0;
      state.diskReadRate = event.data.readMbPerSecond || 0;
      Object.assign(state.diskStats, {
        mode: event.data.mode, totalWrittenBytes: event.data.totalWrittenBytes,
        totalReadBytes: event.data.totalReadBytes, cycles: event.data.cycles,
        workingSetBytes: event.data.workingSetBytes
      });
      setResourceStatus('disk', '校验通过', true);
    } else if (event.data.type === 'error') {
      state.diskChecked = true;
      state.diskSupported = false;
      state.diskError = event.data.message;
      state.diskWriteRate = 0;
      state.diskReadRate = 0;
      setResourceStatus('disk', '读写失败');
      logEvent('磁盘测试失败：' + event.data.message, 'danger');
    }
    updateMetricUi();
  };
  worker.onerror = () => {
    if (state.diskWorker !== worker) return;
    state.diskChecked = true;
    state.diskSupported = false;
    state.diskError = '磁盘线程加载或执行失败，请检查静态文件与浏览器权限';
    state.diskWriteRate = 0;
    state.diskReadRate = 0;
    setResourceStatus('disk', '读写失败');
    logEvent(state.diskError, 'danger');
    updateMetricUi();
    worker.terminate();
    state.diskWorker = null;
  };
  state.diskWorker = worker;
  worker.postMessage({ type: 'start', ...state.profile.disk });
}

function startTest() {
  if (state.phase === 'running') return;
  if (state.phase === 'paused') {
    state.phase = 'running';
    state.startedAt = performance.now() - state.elapsedMs;
    state.cpuWorkers.forEach((worker) => worker.postMessage({ type: 'resume' }));
    if (state.memoryWorker) state.memoryWorker.postMessage({ type: 'resume' });
    if (state.diskWorker) state.diskWorker.postMessage({ type: 'resume' });
    state.gpu.frames = 0;
    state.gpu.lastFrameAt = performance.now();
    logEvent('测试已继续。');
    updatePhaseUi();
    return;
  }
  if (!Object.values(state.enabled).some(Boolean)) {
    const error = document.getElementById('controlError');
    error.textContent = '请至少选择一项压测资源。';
    error.hidden = false;
    logEvent('请至少选择一项压测资源。', 'warn');
    return;
  }
  document.getElementById('controlError').hidden = true;
  state.duration = Number(refs.duration.value);
  state.workerCount = Number(refs.workers.value);
  state.profile = selectedProfile();
  state.elapsedMs = 0;
  state.cpuRate = 0;
  state.memoryBytes = 0;
  state.memoryRate = 0;
  state.diskWriteRate = 0;
  state.diskReadRate = 0;
  state.diskChecked = false;
  state.diskSupported = false;
  state.diskError = '';
  state.diskStats = { mode: null, totalWrittenBytes: 0, totalReadBytes: 0, cycles: 0, workingSetBytes: 0 };
  state.sessionStartedAt = new Date().toISOString();
  state.sessionLog = [];
  state.sessionSamples = [];
  state.lastReport = null;
  document.getElementById('sessionResult').hidden = true;
  clearHistory();
  state.startedAt = performance.now();
  state.phase = 'running';
  logEvent('测试开始 · CPU ' + state.workerCount + ' 线程');
  if (state.enabled.gpu && state.gpu.supported) {
    state.gpu.lastFrameAt = performance.now();
    state.gpu.frames = 0;
    state.gpu.raf = requestAnimationFrame(gpuFrame);
  }
  createCpuWorkers();
  createMemoryWorker();
  createDiskWorker();
  state.timers.sample = window.setInterval(sample, 500);
  updatePhaseUi();
  updateMetricUi();
}

function pauseTest(reason = 'manual') {
  if (state.phase !== 'running') return;
  state.elapsedMs = performance.now() - state.startedAt;
  state.phase = 'paused';
  state.cpuWorkers.forEach((worker) => worker.postMessage({ type: 'pause' }));
  if (state.memoryWorker) state.memoryWorker.postMessage({ type: 'pause' });
  if (state.diskWorker) state.diskWorker.postMessage({ type: 'pause' });
  logEvent(reason === 'background' ? '页面已切到后台，测试已暂停；返回后点击继续。' : '测试已暂停，资源保持当前状态。');
  updatePhaseUi();
}

function stopTest(completed = false) {
  if (state.phase === 'idle' || state.phase === 'stopped') return;
  if (state.phase === 'running') state.elapsedMs = performance.now() - state.startedAt;
  const reportEndedAt = new Date().toISOString();
  state.lastReport = {
    startedAt: state.sessionStartedAt,
    endedAt: reportEndedAt,
    completed,
    elapsedSeconds: Math.round(state.elapsedMs / 1000),
    durationSeconds: state.duration,
    workerCount: state.workerCount,
    pauseOnHidden: refs.pauseOnHidden.checked,
    enabled: { ...state.enabled },
    profile: state.profile,
    disk: { ...state.diskStats, error: state.diskError || null, cleaned: state.diskWorker ? null : state.diskError ? false : true },
    peakPercent: state.peak,
    measurementNotes: 'CPU 为计算吞吐量；GPU 为屏幕帧率；磁盘为浏览器临时存储（可能受缓存影响）。测试强度刻度不代表系统硬件占用率。内存额度来自浏览器粗略估算，无法读取实时剩余内存。',
    units: { memoryAllocatedBytes: 'bytes', memoryWriteMBPerSecond: 'MiB/s', diskWriteMBPerSecond: 'MiB/s', diskReadMBPerSecond: 'MiB/s', gpuScreenFPS: 'frames/s' },
    samples: state.sessionSamples.slice(),
    log: []
  };
  const diskWasChecked = state.diskChecked;
  const diskWasSupported = state.diskSupported;
  state.phase = 'stopped';
  state.cpuWorkers.forEach((worker) => worker.terminate());
  state.cpuWorkers = [];
  state.cpuRates = [];
  state.cpuRate = 0;
  if (state.memoryWorker) state.memoryWorker.terminate();
  state.memoryWorker = null;
  state.memoryBytes = 0;
  state.memoryRate = 0;
  state.memoryThroughput = 0;
  window.clearInterval(state.timers.sample);
  state.timers.sample = 0;
  if (state.diskWorker) {
    const worker = state.diskWorker;
    const report = state.lastReport;
    let cleanTimer;
    worker.onmessage = (event) => {
      if (event.data.type !== 'stopped') return;
      window.clearTimeout(cleanTimer);
      report.disk.cleaned = event.data.cleaned;
      report.disk.totalWrittenBytes = event.data.totalWrittenBytes;
      report.disk.totalReadBytes = event.data.totalReadBytes;
      report.disk.cycles = event.data.cycles;
      report.disk.error = event.data.error || report.disk.error;
      if (state.lastReport === report) {
        state.diskError = report.disk.error || '';
        Object.assign(state.diskStats, { totalWrittenBytes: event.data.totalWrittenBytes, totalReadBytes: event.data.totalReadBytes, cycles: event.data.cycles });
        setResourceStatus('disk', !event.data.cleaned ? '清理失败' : state.diskError ? '读写失败' : '已清理');
        logEvent(event.data.cleaned ? '磁盘临时文件已清理。' : '磁盘临时文件清理失败。', event.data.cleaned ? '' : 'warn');
        report.log = state.sessionLog.slice();
        updateMetricUi();
      }
      worker.terminate();
    };
    worker.postMessage({ type: 'stop' });
    cleanTimer = window.setTimeout(() => {
      worker.terminate();
      report.disk.cleaned = false;
      if (state.lastReport === report) {
        setResourceStatus('disk', '清理超时');
        logEvent('磁盘临时文件清理超时。', 'warn');
        report.log = state.sessionLog.slice();
      }
    }, 10000);
    state.diskWorker = null;
  }
  state.diskWriteRate = 0;
  state.diskReadRate = 0;
  state.diskChecked = diskWasChecked;
  state.diskSupported = diskWasSupported;
  stopGpu();
  setResourceStatus('cpu', state.enabled.cpu ? '就绪' : '已关闭');
  setResourceStatus('memory', state.enabled.memory ? '就绪' : '已关闭');
  if (state.gpu.supported) setResourceStatus('gpu', state.enabled.gpu ? '就绪' : '已关闭');
  setResourceStatus('disk', state.enabled.disk ? (state.diskError ? '读写失败' : state.lastReport.disk.cleaned === null ? '清理中' : '就绪') : '已关闭');
  logEvent(completed ? '测试完成 · 已达到设定时长。' : '测试已停止。', completed ? '' : 'warn');
  state.lastReport.log = state.sessionLog.slice();
  const peakMemory = state.sessionSamples.reduce((peak, sample) => Math.max(peak, sample.memoryAllocatedBytes || 0), 0);
  const result = document.getElementById('sessionResult');
  result.textContent = (completed ? '已完成' : '已停止') + ' · ' + formatTime(state.elapsedMs / 1000) + ' · ' + state.sessionSamples.length + ' 次采样' + (state.enabled.memory ? ' · 内存峰值 ' + formatBytes(peakMemory) : '');
  result.hidden = false;
  updatePhaseUi();
  sample();
}

function initialize() {
  readSavedSettings();
  state.workerCount = Number(refs.workers.value) || 20;
  document.querySelectorAll('[data-resource-toggle]').forEach((input) => {
    state.enabled[input.dataset.resourceToggle] = input.checked;
  });
  state.profile = selectedProfile();
  initGpu();
  updateEnvironmentSummary();
  setResourceStatus('disk', '待测');
  document.querySelectorAll('[data-resource-toggle]').forEach((input) => {
    input.addEventListener('change', () => {
      state.enabled[input.dataset.resourceToggle] = input.checked;
      setCardEnabled(input.dataset.resourceToggle, input.checked);
      const resource = ({ cpu: 'CPU', memory: '内存', gpu: 'GPU', disk: '磁盘' })[input.dataset.resourceToggle];
      const card = document.querySelector('[data-resource-card="' + input.dataset.resourceToggle + '"]');
      card.hidden = !input.checked;
      setResourceStatus(input.dataset.resourceToggle, !input.checked ? '已关闭' : input.dataset.resourceToggle === 'gpu' && !state.gpu.supported ? '受限' : input.dataset.resourceToggle === 'disk' ? '待测' : '就绪');
      if (Object.values(state.enabled).some(Boolean)) document.getElementById('controlError').hidden = true;
      saveSettings();
      logEvent((input.checked ? '已启用 ' : '已停用 ') + resource + ' 压测。');
    });
    setCardEnabled(input.dataset.resourceToggle, input.checked);
    const card = document.querySelector('[data-resource-card="' + input.dataset.resourceToggle + '"]');
    if (card) card.hidden = !input.checked;
    if (!input.checked) setResourceStatus(input.dataset.resourceToggle, '已关闭');
  });
  document.querySelectorAll('[data-level]').forEach((input) => {
    input.addEventListener('change', () => {
      const resource = ({ cpu: 'CPU', memory: '内存', gpu: 'GPU', disk: '磁盘' })[input.dataset.level];
      state.profile = selectedProfile();
      saveSettings();
      updateEnvironmentSummary();
      updateMetricUi();
      logEvent(resource + '负载设为“' + input.selectedOptions[0].textContent + '”。');
    });
  });
  refs.workers.addEventListener('change', () => {
    state.workerCount = Number(refs.workers.value);
    saveSettings();
    updateMetricUi();
  });
  refs.duration.addEventListener('change', () => { saveSettings(); updateTimingUi(); });
  refs.pauseOnHidden.addEventListener('change', saveSettings);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  document.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.preset)));
  refs.start.addEventListener('click', startTest);
  refs.pause.addEventListener('click', () => state.phase === 'paused' ? startTest() : pauseTest());
  refs.stop.addEventListener('click', () => stopTest(false));
  refs.export.addEventListener('click', () => downloadReport('json'));
  refs.exportCsv.addEventListener('click', () => downloadReport('csv'));
  window.addEventListener('resize', drawChart);
  window.addEventListener('pagehide', () => {
    if (state.diskWorker) {
      state.diskWorker.postMessage({ type: 'stop' });
      window.setTimeout(() => state.diskWorker?.terminate(), 1000);
    }
  });
  refs.timers = state.timers;
  state.timers.clock = window.setInterval(() => { refs.clock.textContent = formatClock(new Date()); }, 1000);
  refs.clock.textContent = formatClock(new Date());
  updatePhaseUi();
  updateMetricUi();
  drawChart();
  logEvent('控制台已就绪。选择资源后点击开始压测。');
}

initialize();





