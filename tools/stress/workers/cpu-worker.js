let running = false;
let paused = false;
let intensity = 0.72;
let unlimited = false;
let totalIterations = 0;
let lastReport = performance.now();
let lastIterations = 0;
let timer = null;

function spin() {
  if (!running || paused) return;
  const started = performance.now();
  const budget = Math.max(180000, Math.floor(460000 * Math.min(intensity, 1.12)));
  let value = Math.random() + 0.1;
  if (unlimited) {
    while (performance.now() - started < 24 && running && !paused) {
      for (let i = 0; i < 12000 && running && !paused; i += 1) {
        value = Math.sin(value) * Math.cos(value + i * 0.00001) + Math.sqrt(Math.abs(value) + 0.00001);
        totalIterations += 1;
      }
    }
  } else {
    for (let i = 0; i < budget && running && !paused; i += 1) {
      value = Math.sin(value) * Math.cos(value + i * 0.00001) + Math.sqrt(Math.abs(value) + 0.00001);
      totalIterations += 1;
    }
  }
  const now = performance.now();
  if (now - lastReport > 220) {
    const delta = totalIterations - lastIterations;
    self.postMessage({ type: 'sample', iterationsPerSecond: Math.round(delta / ((now - lastReport) / 1000)), totalIterations });
    lastReport = now;
    lastIterations = totalIterations;
  }
  if (running && !paused) timer = setTimeout(spin, 0);
}

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type === 'start') {
    intensity = Number(message.intensity) || 0.72;
    unlimited = Boolean(message.unlimited);
    running = true;
    paused = false;
    totalIterations = 0;
    lastReport = performance.now();
    lastIterations = 0;
    spin();
  } else if (message.type === 'pause') {
    paused = true;
    if (timer) clearTimeout(timer);
    self.postMessage({ type: 'paused' });
  } else if (message.type === 'resume') {
    if (running && paused) {
      paused = false;
      lastReport = performance.now();
      lastIterations = totalIterations;
      spin();
      self.postMessage({ type: 'resumed' });
    }
  } else if (message.type === 'stop') {
    running = false;
    paused = false;
    if (timer) clearTimeout(timer);
    self.postMessage({ type: 'stopped', totalIterations });
    self.close();
  }
};
