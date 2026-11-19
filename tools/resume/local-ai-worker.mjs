import { loadSpark } from '../ai/spark-runtime.mjs?v=20261120-fast2';
import { MODEL_PROFILES } from '../ai/spark-cache.mjs?v=20261120-fast2';

const post = (message) => self.postMessage(message);
let generator = null;
let loading = null;
let active = null;

async function load() {
  if (generator) return generator;
  if (loading) return loading;
  loading = (async () => {
    const profile = MODEL_PROFILES.desktop;
    post({ type: 'progress', value: 0, status: `准备 ${profile.label}` });
    generator = await loadSpark({
      profile,
      onProgress: (info) => post({
        type: 'progress',
        value: info.loaded / info.total,
        status: info.downloadedBytes ? '下载模型' : '读取模型缓存',
        cacheStored: info.cacheStored
      }),
      onDeviceLost: () => {
        generator = null;
        active?.controller.abort(Error('WebGPU device lost'));
        post({ type: 'error', code: 'WebGPU device lost' });
      }
    });
    post({
      type: 'ready',
      device: 'webgpu',
      model: generator.model,
      label: generator.label || profile.label,
      profile: generator.profile || profile.id,
      cacheStored: generator.cacheStored,
      variant: generator.variant,
      contextWindow: generator.contextWindow,
      vocabSize: generator.vocabSize,
      prefillChunk: generator.prefillChunk
    });
    return generator;
  })();
  try {
    return await loading;
  } finally {
    loading = null;
  }
}

async function generate(message) {
  if (active) {
    post({ type: 'error', id: message.id, code: 'local-generation-busy' });
    return;
  }
  const task = active = { id: message.id, controller: new AbortController() };
  const signal = task.controller.signal;
  const options = message.options || {};
  const temperature = Number.isFinite(options.temperature) ? options.temperature : 0.18;
  const topP = Number.isFinite(options.topP) ? options.topP : 0.82;
  const topK = Number.isFinite(options.topK) ? options.topK : 20;
  const maxNewTokens = Number.isFinite(options.maxNewTokens) ? options.maxNewTokens : 2048;
  const started = performance.now();
  try {
    const model = await load();
    signal.throwIfAborted();
    const messages = message.messages.map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content ?? '')
    }));
    const promptTokens = model.chat.encodeChat(messages, { thinking: false }).length;
    const budget = Math.max(64, Math.min(maxNewTokens, model.contextWindow - promptTokens - 16));
    if (budget < 64) throw Error('local-context-overflow');
    const stats = {};
    let text = '';
    for await (const piece of model.generate(messages, {
      thinking: false,
      effort: 'low',
      temperature,
      topP,
      topK,
      maxNewTokens: budget,
      stats,
      signal,
      reuse: true
    })) {
      signal.throwIfAborted();
      text += piece;
      post({ type: 'snapshot', id: message.id, text });
      post({ type: 'activity', id: message.id });
    }
    signal.throwIfAborted();
    const answer = text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<think>[\s\S]*$/gi, '')
      .replace(/<｜end▁of▁sentence｜>/g, '')
      .trim();
    if (!answer) throw Error('local-empty-output');
    post({
      type: 'done',
      id: message.id,
      text: answer,
      device: 'webgpu',
      usage: stats,
      durationMs: performance.now() - started,
      fast: true
    });
  } catch (error) {
    if (signal.aborted) post({ type: 'cancelled', id: message.id });
    else post({ type: 'error', id: message.id, code: String(error?.message || error) });
  } finally {
    if (active === task) active = null;
  }
}

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type === 'init') void load().catch((error) => post({ type: 'error', code: String(error?.message || error) }));
  else if (message.type === 'generate') void generate(message);
  else if (message.type === 'cancel' && active?.id === message.id) active.controller.abort(Error('已停止'));
  else if (message.type === 'reset') generator?.resetContext?.();
};
