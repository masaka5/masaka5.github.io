(function exposeWorkloadProfiles(root, factory) {
  const profiles = factory();
  if (typeof module === 'object' && module.exports) module.exports = profiles;
  if (root) root.WorkloadProfiles = profiles;
})(typeof globalThis === 'object' ? globalThis : this, function createWorkloadProfiles() {
  const levels = {
    low: { key: 'low', label: '轻度' },
    standard: { key: 'standard', label: '标准' },
    high: { key: 'high', label: '高负载' },
    extreme: { key: 'extreme', label: '极限' }
  };

  const workloads = {
    memory: {
      low: { targetMb: 64, intervalMs: 180 },
      standard: { targetMb: 192, intervalMs: 100 },
      high: { targetMb: 640, intervalMs: 45 },
      extreme: { targetMb: 1024, intervalMs: 15 }
    },
    cpu: {
      low: { intensity: 0.45 },
      standard: { intensity: 0.72 },
      high: { intensity: 0.92 },
      extreme: { intensity: 1.12 },
      unlimited: { intensity: 2.4, unlimited: true }
    },
    gpu: {
      low: { width: 640, height: 360, iterations: 48, passesPerFrame: 1, workUnits: 1 },
      standard: { width: 1280, height: 720, iterations: 96, passesPerFrame: 1, workUnits: 8 },
      high: { width: 1600, height: 900, iterations: 256, passesPerFrame: 3, workUnits: 32 },
      extreme: { width: 1920, height: 1080, iterations: 512, passesPerFrame: 8, workUnits: 100 },
      unlimited: { width: 1920, height: 1080, iterations: 512, passesPerFrame: 0, workUnits: 160, unlimited: true }
    },
    disk: {
      low: { chunkMb: 8, datasetMb: 64, intervalMs: 300 },
      standard: { chunkMb: 16, datasetMb: 256, intervalMs: 100 },
      high: { chunkMb: 32, datasetMb: 512, intervalMs: 10 },
      extreme: { chunkMb: 64, datasetMb: 1024, intervalMs: 0 }
    }
  };

  const presets = {
    balanced: {
      enabled: { cpu: true, memory: true, gpu: true, disk: true },
      levels: { cpu: 'standard', memory: 'standard', gpu: 'standard', disk: 'standard' }
    },
    'full-extreme': {
      enabled: { cpu: true, memory: true, gpu: true, disk: true },
      levels: { cpu: 'extreme', memory: 'extreme', gpu: 'extreme', disk: 'extreme' }
    },
    'cpu-memory': {
      enabled: { cpu: true, memory: true, gpu: false, disk: false },
      levels: { cpu: 'extreme', memory: 'high', gpu: 'standard', disk: 'standard' }
    },
    custom: {
      enabled: { cpu: true, memory: true, gpu: true, disk: true },
      levels: { cpu: 'high', memory: 'high', gpu: 'high', disk: 'high' }
    }
  };

  function selectLevel(level) {
    return levels[level] ? level : 'high';
  }

  function createPreset(name) {
    const preset = presets[name] || presets.custom;
    return {
      enabled: { ...preset.enabled },
      levels: { ...preset.levels }
    };
  }

  function estimateSystemMemoryMb(deviceMemoryGb) {
    const reportedGb = Number(deviceMemoryGb);
    if (!Number.isFinite(reportedGb) || reportedGb <= 0) return 512;
    return Math.max(256, Math.floor(reportedGb * 1024));
  }

  function createProfile(selection = {}, memoryLimitMb = 1024) {
    const reportedTotalMb = Number(memoryLimitMb);
    const memoryTotalMb = Number.isFinite(reportedTotalMb) && reportedTotalMb > 0
      ? Math.max(256, Math.floor(reportedTotalMb))
      : 512;
    // Keep most of the reported memory free while allowing high-memory hosts
    // to exercise a meaningful workload. The absolute ceiling is 48 GiB.
    const memoryCap = Math.min(48 * 1024, Math.max(16, Math.floor(memoryTotalMb * 0.2)));
    const cpuLevel = workloads.cpu[selection.cpu] ? selection.cpu : 'high';
    const memoryLevel = selection.memory === 'unlimited' ? 'unlimited' : selectLevel(selection.memory);
    const gpuLevel = selection.gpu === 'unlimited' ? 'unlimited' : selectLevel(selection.gpu);
    const diskLevel = selectLevel(selection.disk);
    const memoryWorkload = memoryLevel === 'unlimited'
      ? { targetMb: memoryCap, intervalMs: 15, unlimited: true }
      : { ...workloads.memory[memoryLevel], targetMb: Math.min(workloads.memory[memoryLevel].targetMb, memoryCap), unlimited: false };
    return {
      cpu: { level: cpuLevel, ...workloads.cpu[cpuLevel] },
      memory: {
        level: memoryLevel,
        ...memoryWorkload,
        estimatedTotalMb: memoryTotalMb,
        safetyCapMb: memoryCap,
        reservedMb: memoryTotalMb - memoryCap,
        reservePercent: Math.floor(((memoryTotalMb - memoryCap) / memoryTotalMb) * 100)
      },
      gpu: { level: gpuLevel, ...workloads.gpu[gpuLevel], unlimited: gpuLevel === 'unlimited' },
      disk: { level: diskLevel, ...workloads.disk[diskLevel] }
    };
  }

  return { createProfile, createPreset, estimateSystemMemoryMb };
});
