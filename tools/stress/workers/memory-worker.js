let running = false;
let paused = false;
let targetBytes = 192 * 1024 * 1024;
let intervalMs = 100;
let allocatedBytes = 0;
let buffers = [];
let sampleBytes = 0;
let sampleAt = 0;
let cycleCount = 0;
let unlimitedGrowth = false;
let allocationStopped = false;
let limitReported = false;
let timer = null;
const blockBytes = 16 * 1024 * 1024;

function memoryPulse() {
  if (!running || paused) return;
  if (allocatedBytes < targetBytes && !allocationStopped) {
    const nextSize = Math.min(blockBytes, targetBytes - allocatedBytes);
    try {
      buffers.push(new Uint8Array(nextSize));
      allocatedBytes += nextSize;
      if (allocatedBytes >= targetBytes && !limitReported) {
        limitReported = true;
        self.postMessage({ type: 'limit-reached', allocatedBytes, targetBytes });
      }
    } catch (error) {
      allocationStopped = true;
      running = false;
      const peakAllocatedBytes = allocatedBytes;
      buffers = [];
      self.postMessage({ type: 'allocation-stopped', allocatedBytes, reason: '内存分配达到浏览器可用上限' });
      allocatedBytes = peakAllocatedBytes;
      return;
    }
  }
  let bytesTouched = 0;
  for (const buffer of buffers) {
    buffer.fill(cycleCount & 255);
    bytesTouched += buffer.byteLength;
  }
  cycleCount += 1;
  sampleBytes += bytesTouched;
  const now = performance.now();
  if (now - sampleAt >= 500) {
    const throughputMbPerSecond = sampleBytes / 1024 / 1024 / ((now - sampleAt) / 1000);
    self.postMessage({ type: 'sample', allocatedBytes, throughputMbPerSecond, targetBytes, unlimitedGrowth });
    sampleBytes = 0;
    sampleAt = now;
  }
  if (running && !paused) timer = setTimeout(memoryPulse, intervalMs);
}

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type === 'start') {
    targetBytes = Math.max(blockBytes, Number(message.targetMb) * 1024 * 1024 || 192 * 1024 * 1024);
    unlimitedGrowth = Boolean(message.unlimited);
    intervalMs = Math.max(10, Number(message.intervalMs) || 100);
    running = true;
    paused = false;
    buffers = [];
    allocatedBytes = 0;
    sampleBytes = 0;
    sampleAt = performance.now();
    cycleCount = 0;
    allocationStopped = false;
    limitReported = false;
    memoryPulse();
  } else if (message.type === 'pause') {
    paused = true;
    if (timer) clearTimeout(timer);
    self.postMessage({ type: 'paused' });
  } else if (message.type === 'resume') {
    if (running && paused) {
      paused = false;
      sampleAt = performance.now();
      sampleBytes = 0;
      memoryPulse();
      self.postMessage({ type: 'resumed' });
    }
  } else if (message.type === 'stop') {
    running = false;
    paused = false;
    if (timer) clearTimeout(timer);
    buffers = [];
    allocatedBytes = 0;
    allocationStopped = false;
    limitReported = false;
    self.postMessage({ type: 'stopped' });
    self.close();
  }
};
