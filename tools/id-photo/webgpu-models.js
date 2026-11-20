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
const segmenterPromises = new Map();
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

async function segmenter(kind = 'modnet', onProgress) {
  if (!segmenterPromises.has(kind)) {
    const promise = (async () => {
      const { pipeline, env } = await import(TRANSFORMERS_URL);
      env.allowRemoteModels = false;
      env.allowLocalModels = true;
      env.localModelPath = new URL('./models/', import.meta.url).href;
      env.backends.onnx.wasm.wasmPaths = '/tools/ai/assets/ort/';
      env.backends.onnx.wasm.numThreads = 1;
      const report = (info) => { if (info?.status === 'progress') progress(onProgress, 5 + (Number(info.progress) || 0) * .35, kind === 'ormbg' ? '加载精细模型' : '加载快速模型'); };
      if (kind === 'ormbg') return pipeline('background-removal', 'ormbg', { device: 'wasm', dtype: 'q8', progress_callback: report });
      return pipeline('background-removal', 'modnet', { device: 'webgpu', dtype: 'q8', progress_callback: report });
    })();
    segmenterPromises.set(kind, promise);
    promise.catch(() => segmenterPromises.delete(kind));
  }
  return segmenterPromises.get(kind);
}

function blurRgbCanvas(source, radius) {
  const output = canvas(source.width, source.height);
  const context = output.getContext('2d', { willReadFrequently: true });
  context.filter = radius > 0 ? 'blur(' + radius + 'px)' : 'none';
  context.drawImage(source, 0, 0);
  return context.getImageData(0, 0, output.width, output.height);
}

function estimatePass(image, foreground, background, alpha, width, height, radius) {
  const fa = new ImageData(width, height);
  const ba = new ImageData(width, height);
  const am = new ImageData(width, height);
  for (let pixel = 0, index = 0; pixel < alpha.length; pixel++, index += 4) {
    const a = alpha[pixel];
    fa.data[index] = foreground[index] * a;
    fa.data[index + 1] = foreground[index + 1] * a;
    fa.data[index + 2] = foreground[index + 2] * a;
    fa.data[index + 3] = 255;
    ba.data[index] = background[index] * (1 - a);
    ba.data[index + 1] = background[index + 1] * (1 - a);
    ba.data[index + 2] = background[index + 2] * (1 - a);
    ba.data[index + 3] = 255;
    const mask = Math.round(a * 255);
    am.data[index] = mask;
    am.data[index + 1] = mask;
    am.data[index + 2] = mask;
    am.data[index + 3] = 255;
  }
  const layer = (data) => {
    const value = new ImageData(data, width, height);
    const sourceCanvas = canvas(width, height);
    sourceCanvas.getContext('2d').putImageData(value, 0, 0);
    return blurRgbCanvas(sourceCanvas, radius);
  };
  const blurredFA = layer(fa.data);
  const blurredBA = layer(ba.data);
  const blurredMask = layer(am.data);
  const rgb = new Uint8ClampedArray(image.length);
  const nextBackground = blurredBA.data;
  for (let pixel = 0, index = 0; pixel < alpha.length; pixel++, index += 4) {
    const a = alpha[pixel];
    const blurredAlpha = blurredMask.data[index] / 255;
    for (let channel = 0; channel < 3; channel++) {
      const position = index + channel;
      const estimatedForeground = blurredFA.data[position] / Math.max(blurredAlpha, 1e-3);
      const estimatedBackground = blurredBA.data[position] / Math.max(1 - blurredAlpha, 1e-3);
      const sourceValue = image[position];
      const refined = estimatedForeground + a * (sourceValue - a * estimatedForeground - (1 - a) * estimatedBackground);
      rgb[position] = clamp(Math.round(refined), 0, 255);
    }
    rgb[index + 3] = Math.round(a * 255);
  }
  return { rgb, background: nextBackground };
}

async function refineForeground(source, cutout, onProgress) {
  const sourceWidth = source.naturalWidth || source.width;
  const sourceHeight = source.naturalHeight || source.height;
  const maxDimension = Math.max(sourceWidth, sourceHeight);
  const scale = Math.min(1, 1600 / maxDimension);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const sourceCanvas = imageCanvas(source, width, height);
  const cutoutCanvas = imageCanvas(cutout, width, height, true);
  const image = sourceCanvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data;
  const rgba = cutoutCanvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height);
  const alpha = new Float32Array(width * height);
  for (let pixel = 0, index = 3; pixel < alpha.length; pixel++, index += 4) alpha[pixel] = rgba.data[index] / 255;
  progress(onProgress, 70, '估计前景颜色');
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const radius = Math.min(90, Math.max(10, Math.round(maxDimension * 0.075)));
  const first = estimatePass(image, image, image, alpha, width, height, radius);
  progress(onProgress, 82, '清理背景残色');
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const second = estimatePass(image, first.rgb, first.background, alpha, width, height, 3);
  const result = new ImageData(width, height);
  result.data.set(second.rgb);
  for (let pixel = 0, index = 3; pixel < alpha.length; pixel++, index += 4) result.data[index] = rgba.data[index];
  const output = canvas(width, height);
  output.getContext('2d').putImageData(result, 0, 0);
  return output;
}

export async function removeBackgroundWebGPU(source, onProgress, requestedEngine = 'auto') {
  const precise = requestedEngine === 'precise';
  const width = source.naturalWidth || source.width;
  const height = source.naturalHeight || source.height;
  progress(onProgress, 3, precise ? '加载精细去背' : '加载 WebGPU 去背');
  const segment = await segmenter(precise ? 'ormbg' : 'modnet', onProgress);
  progress(onProgress, precise ? 42 : 24, precise ? '识别人像与发丝' : '识别人像');
  const prepared = imageCanvas(source, width, height);
  const result = await segment(prepared.toDataURL('image/jpeg', 0.96));
  const item = result?.[0];
  if (!item?.toBlob) throw new Error('AI 去背未返回结果');
  const blob = await item.toBlob();
  const bitmap = await createImageBitmap(blob);
  let output = imageCanvas(bitmap, bitmap.width, bitmap.height, true);
  bitmap.close?.();
  if (precise && output.width === width && output.height === height) output = await refineForeground(source, output, onProgress);
  progress(onProgress, 100, precise ? '精细去背完成' : 'WebGPU 去背完成');
  return output;
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
  const sourceContext = prepared.getContext('2d', { willReadFrequently: true });
  const outputWidth = width * SCALE;
  const outputHeight = height * SCALE;
  const luma = new Float32Array(outputWidth * outputHeight);
  const weights = new Float32Array(outputWidth * outputHeight);
  const tilesX = Math.max(1, Math.ceil(width / STEP));
  const tilesY = Math.max(1, Math.ceil(height / STEP));
  const total = tilesX * tilesY;
  const ort = await runtime();
  const blend = 8;
  let completed = 0;
  for (let tileY = 0; tileY < tilesY; tileY++) {
    for (let tileX = 0; tileX < tilesX; tileX++) {
      const x = tileX * STEP;
      const y = tileY * STEP;
      const tile = canvas(TILE, TILE);
      const tileContext = tile.getContext('2d', { willReadFrequently: true });
      tileContext.fillStyle = '#000';
      tileContext.fillRect(0, 0, TILE, TILE);
      tileContext.imageSmoothingEnabled = true;
      tileContext.imageSmoothingQuality = 'high';
      for (let row = -1; row <= 1; row++) {
        for (let column = -1; column <= 1; column++) {
          tileContext.drawImage(prepared, PAD - x + column * width, PAD - y + row * height);
        }
      }
      const pixels = tileContext.getImageData(0, 0, TILE, TILE).data;
      const input = new Float32Array(TILE * TILE);
      for (let index = 0, pixel = 0; index < input.length; index++, pixel += 4) {
        input[index] = (0.299 * pixels[pixel] + 0.587 * pixels[pixel + 1] + 0.114 * pixels[pixel + 2]) / 255;
      }
      const result = await net.run({ [net.inputNames[0]]: new ort.Tensor('float32', input, [1, 1, TILE, TILE]) });
      const enhanced = result[net.outputNames[0]].data;
      const enhancedWidth = result[net.outputNames[0]].dims?.[3] || TILE * SCALE;
      const enhancedHeight = result[net.outputNames[0]].dims?.[2] || TILE * SCALE;
      for (let py = 0; py < enhancedHeight; py++) {
        const globalY = (y - PAD) * SCALE + py;
        if (globalY < 0 || globalY >= outputHeight) continue;
        const sourceY = y - PAD + py / SCALE;
        const weightY = clamp(Math.min((sourceY - y + blend) / (blend * 2), (y + STEP + blend - sourceY) / (blend * 2)), 0, 1);
        if (!weightY) continue;
        for (let px = 0; px < enhancedWidth; px++) {
          const globalX = (x - PAD) * SCALE + px;
          if (globalX < 0 || globalX >= outputWidth) continue;
          const sourceX = x - PAD + px / SCALE;
          const weightX = clamp(Math.min((sourceX - x + blend) / (blend * 2), (x + STEP + blend - sourceX) / (blend * 2)), 0, 1);
          const weight = weightX * weightY;
          if (!weight) continue;
          const target = globalY * outputWidth + globalX;
          luma[target] += enhanced[py * enhancedWidth + px] * weight;
          weights[target] += weight;
        }
      }
      completed++;
      progress(onProgress, 12 + Math.round((completed / total) * 70), 'WebGPU 超分 ' + completed + '/' + total);
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
    const enhancedLuma = weights[index] > 0 ? luma[index] / weights[index] : oldLuma;
    const nextLuma = clamp(oldLuma * 0.32 + enhancedLuma * 0.68, 0, 1);
    image.data[pixel] = clamp((nextLuma + 1.402 * cr) * 255, 0, 255);
    image.data[pixel + 1] = clamp((nextLuma - 0.344 * cb - 0.714 * cr) * 255, 0, 255);
    image.data[pixel + 2] = clamp((nextLuma + 1.772 * cb) * 255, 0, 255);
    image.data[pixel + 3] = 255;
  }
  colorContext.putImageData(image, 0, 0);
  progress(onProgress, 100, 'WebGPU 超分完成');
  return color;
}
