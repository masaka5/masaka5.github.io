const ORT_URL = '/tools/ai/assets/ort/ort.webgpu.bundle.min.mjs';
const TRANSFORMERS_URL = '/tools/studio/assets/transformers.web-DoWB8KLV.js';
const MODEL_URLS = {
  superRes: new URL('./models/subpixel-cnn.onnx', import.meta.url).href
};
const TILE = 224;
const STEP = 192;
const PAD = 16;
const SCALE = 3;
let ortPromise;
let segmenterPromise;
let capabilityPromise;
const sessions = new Map();

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function canvas(width, height) {
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  return output;
}
function progress(callback, value, label) { callback?.(clamp(Math.round(value), 0, 100), label); }

export function webgpuSupported() {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}

export async function detectWebGPU(options = {}) {
  if (!webgpuSupported()) return { available: false, reason: '浏览器不支持 WebGPU' };
  if (!capabilityPromise || options.refresh) {
    capabilityPromise = (async () => {
      try {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (!adapter) return { available: false, reason: '未找到可用的 GPU 适配器' };
        return { available: true, adapter };
      } catch (error) {
        return { available: false, reason: error?.message || 'WebGPU 初始化失败' };
      }
    })();
  }
  return capabilityPromise;
}

async function runtime() {
  if (!ortPromise) ortPromise = (async () => {
    const ort = await import(ORT_URL);
    ort.env.wasm.wasmPaths = '/tools/ai/assets/ort/';
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    ort.env.webgpu.powerPreference = 'high-performance';
    return ort;
  })();
  return ortPromise;
}

async function session(kind) {
  if (sessions.has(kind)) return sessions.get(kind);
  const gpu = await detectWebGPU();
  if (!gpu.available) throw new Error(gpu.reason);
  const promise = (async () => {
    const ort = await runtime();
    if (!ort.env.webgpu.device) ort.env.webgpu.adapter = gpu.adapter;
    return ort.InferenceSession.create(MODEL_URLS[kind], {
      executionProviders: ['webgpu'],
      graphOptimizationLevel: 'all',
      logSeverityLevel: 3
    });
  })();
  sessions.set(kind, promise);
  try { return await promise; }
  catch (error) { sessions.delete(kind); throw error; }
}

function imageCanvas(source, width, height, alpha = false) {
  const output = canvas(width, height);
  output.getContext('2d', { alpha }).drawImage(source, 0, 0, width, height);
  return output;
}

async function segmenter() {
  if (!segmenterPromise) segmenterPromise = (async () => {
    const { pipeline, env } = await import(TRANSFORMERS_URL);
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.localModelPath = new URL('./models/', import.meta.url).href;
    env.backends.onnx.wasm.wasmPaths = '/tools/ai/assets/ort/';
    return pipeline('background-removal', 'modnet', { device: 'webgpu', dtype: 'q8' });
  })();
  try { return await segmenterPromise; }
  catch (error) { segmenterPromise = null; throw error; }
}

export async function removeBackgroundWebGPU(source, onProgress) {
  const gpu = await detectWebGPU();
  if (!gpu.available) throw new Error(gpu.reason);
  progress(onProgress, 3, '加载 WebGPU 去背');
  const segment = await segmenter();
  progress(onProgress, 24, '识别人像');
  const width = source.naturalWidth || source.width;
  const height = source.naturalHeight || source.height;
  const prepared = imageCanvas(source, width, height);
  const result = await segment(prepared.toDataURL('image/jpeg', 0.94));
  const item = result?.[0];
  if (!item?.toBlob) throw new Error('WebGPU 去背未返回结果');
  const blob = await item.toBlob();
  const bitmap = await createImageBitmap(blob);
  const output = imageCanvas(bitmap, bitmap.width, bitmap.height, true);
  bitmap.close?.();
  progress(onProgress, 100, 'WebGPU 去背完成');
  return output;
}

function paddedSource(source) {
  const width = source.naturalWidth || source.width;
  const height = source.naturalHeight || source.height;
  const output = canvas(width + PAD * 2, height + PAD * 2);
  const context = output.getContext('2d');
  for (let row = -1; row <= 1; row++) {
    for (let column = -1; column <= 1; column++) {
      context.drawImage(source, column * width, row * height);
    }
  }
  return { canvas: output, width, height };
}

export async function superResolutionWebGPU(source, onProgress = undefined) {
  progress(onProgress, 2, '加载 WebGPU 超分');
  const net = await session('superRes');
  const originalWidth = source.naturalWidth || source.width;
  const originalHeight = source.naturalHeight || source.height;
  const ratio = Math.min(1, 672 / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * ratio));
  const height = Math.max(1, Math.round(originalHeight * ratio));
  const prepared = imageCanvas(source, width, height);
  const padded = paddedSource(prepared);
  const outputWidth = width * SCALE;
  const outputHeight = height * SCALE;
  const luma = new Float32Array(outputWidth * outputHeight);
  const tilesX = Math.max(1, Math.ceil(width / STEP));
  const tilesY = Math.max(1, Math.ceil(height / STEP));
  const total = tilesX * tilesY;
  const ort = await runtime();
  let completed = 0;
  for (let tileY = 0; tileY < tilesY; tileY++) {
    for (let tileX = 0; tileX < tilesX; tileX++) {
      const x = tileX * STEP;
      const y = tileY * STEP;
      const tile = canvas(TILE, TILE);
      tile.getContext('2d').drawImage(padded.canvas, x, y, TILE, TILE, 0, 0, TILE, TILE);
      const pixels = tile.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, TILE, TILE).data;
      const input = new Float32Array(TILE * TILE);
      for (let index = 0, pixel = 0; index < input.length; index++, pixel += 4) {
        input[index] = (0.299 * pixels[pixel] + 0.587 * pixels[pixel + 1] + 0.114 * pixels[pixel + 2]) / 255;
      }
      const result = await net.run({ [net.inputNames[0]]: new ort.Tensor('float32', input, [1, 1, TILE, TILE]) });
      const enhanced = result[net.outputNames[0]].data;
      const cropWidth = Math.min(STEP, width - x);
      const cropHeight = Math.min(STEP, height - y);
      for (let py = 0; py < cropHeight * SCALE; py++) {
        const sourceY = (PAD * SCALE + py) * TILE * SCALE;
        const targetY = (y * SCALE + py) * outputWidth + x * SCALE;
        for (let px = 0; px < cropWidth * SCALE; px++) {
          luma[targetY + px] = enhanced[sourceY + PAD * SCALE + px];
        }
      }
      completed++;
      progress(onProgress, 12 + Math.round((completed / total) * 78), 'WebGPU 超分 ' + completed + '/' + total);
    }
  }
  const color = imageCanvas(prepared, outputWidth, outputHeight);
  const colorContext = color.getContext('2d', { willReadFrequently: true });
  const image = colorContext.getImageData(0, 0, outputWidth, outputHeight);
  for (let pixel = 0, index = 0; pixel < image.data.length; pixel += 4, index++) {
    const red = image.data[pixel] / 255;
    const green = image.data[pixel + 1] / 255;
    const blue = image.data[pixel + 2] / 255;
    const oldLuma = 0.299 * red + 0.587 * green + 0.114 * blue;
    const cb = (blue - oldLuma) / 1.772;
    const cr = (red - oldLuma) / 1.402;
    const nextLuma = clamp(oldLuma * 0.32 + luma[index] * 0.68, 0, 1);
    image.data[pixel] = clamp((nextLuma + 1.402 * cr) * 255, 0, 255);
    image.data[pixel + 1] = clamp((nextLuma - 0.344 * cb - 0.714 * cr) * 255, 0, 255);
    image.data[pixel + 2] = clamp((nextLuma + 1.772 * cb) * 255, 0, 255);
    image.data[pixel + 3] = 255;
  }
  colorContext.putImageData(image, 0, 0);
  progress(onProgress, 100, 'WebGPU 超分完成');
  return color;
}
