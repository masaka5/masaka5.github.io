(function exposeSessionTools(root, factory) {
  const tools = factory();
  if (typeof module === 'object' && module.exports) module.exports = tools;
  if (root) root.SessionTools = tools;
})(typeof globalThis === 'object' ? globalThis : this, function createSessionTools() {
  const views = {
    cpu: { unit: '百万次/秒', series: [{ field: 'cpuIterationsPerSecond', divisor: 1e6, label: 'CPU 吞吐量', color: '#f59b45' }] },
    memory: { unit: 'GB', series: [{ field: 'memoryAllocatedBytes', divisor: 1024 ** 3, label: '内存已分配', color: '#79c69a' }] },
    gpu: { unit: '帧/秒', series: [{ field: 'gpuScreenFPS', divisor: 1, label: 'GPU 帧率', color: '#b69adf' }] },
    disk: { unit: 'MB/秒', series: [
      { field: 'diskWriteMBPerSecond', divisor: 1, label: '写入', color: '#73b8d9' },
      { field: 'diskReadMBPerSecond', divisor: 1, label: '读取', color: '#dda15d' }
    ] }
  };

  function getTiming(durationSeconds, elapsedMs) {
    const duration = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 0;
    const elapsed = Math.min(duration * 1000, Math.max(0, Number(elapsedMs) || 0));
    return {
      elapsedSeconds: Math.floor(elapsed / 1000),
      remainingSeconds: Math.ceil(Math.max(0, duration * 1000 - elapsed) / 1000),
      percent: duration ? elapsed / (duration * 10) : 0
    };
  }

  function getChart(selected, samples = []) {
    const key = Object.hasOwn(views, selected) ? selected : 'cpu';
    const view = views[key];
    const end = samples.length ? samples[samples.length - 1].elapsedSeconds : 0;
    const start = Math.max(0, end - 60);
    const recent = samples.filter((sample) => sample.elapsedSeconds >= start);
    let peak = 0;
    let hasData = false;
    const series = view.series.map((definition) => ({
      label: definition.label,
      color: definition.color,
      values: recent.map((sample) => {
        const raw = sample[definition.field];
        const value = typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 ? raw / definition.divisor : null;
        if (value !== null) {
          peak = Math.max(peak, value);
          hasData = true;
        }
        return { time: sample.elapsedSeconds, value };
      })
    }));
    return { key, unit: view.unit, series, hasData, peak, maximum: peak > 0 ? peak * 1.15 : 1, start, end: Math.max(end, 1) };
  }

  function toCsv(report) {
    const fields = [
      ['测试用时（秒）', 'elapsedSeconds', 1],
      ['CPU 计算（次/秒）', 'cpuIterationsPerSecond', 1],
      ['内存已分配（GB）', 'memoryAllocatedBytes', 1024 ** 3],
      ['内存写入（MB/秒）', 'memoryWriteMBPerSecond', 1],
      ['GPU（帧/秒）', 'gpuScreenFPS', 1],
      ['磁盘写入（MB/秒）', 'diskWriteMBPerSecond', 1],
      ['磁盘读取（MB/秒）', 'diskReadMBPerSecond', 1]
    ];
    const rows = [fields.map(([label]) => label).join(',')];
    for (const sample of report.samples || []) {
      rows.push(fields.map(([, field, divisor]) => {
        const value = sample[field];
        return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? String(Number((value / divisor).toFixed(6))) : '';
      }).join(','));
    }
    return '\uFEFF' + rows.join('\r\n') + '\r\n';
  }

  function getCharts(samples = []) {
    return Object.keys(views).map(key => getChart(key, samples));
  }

  return { getTiming, getChart, getCharts, toCsv };
});
