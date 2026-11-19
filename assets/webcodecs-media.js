const MEDIABUNNY_URL = new URL('../tools/conversion/assets/index-DQZDNKpl.js', import.meta.url).href;
const VIDEO_EXTENSIONS = new Set(['mp4','m4v','mov','mkv','webm','3gp']);
const MIME_TYPES = {
  mp4:'video/mp4', m4v:'video/x-m4v', mov:'video/quicktime', mkv:'video/x-matroska', webm:'video/webm', '3gp':'video/3gpp'
};
let mediabunnyPromise;

export function canUseWebCodecs() {
  return typeof globalThis.VideoDecoder === 'function'
    && typeof globalThis.VideoEncoder === 'function'
    && typeof globalThis.EncodedVideoChunk === 'function';
}

export function supportsWebCodecsFormat(extension) {
  return VIDEO_EXTENSIONS.has(String(extension || '').replace(/^\./, '').toLowerCase());
}

function loadMediabunny() {
  if (!mediabunnyPromise) mediabunnyPromise = import(MEDIABUNNY_URL);
  return mediabunnyPromise;
}

function createOutputFormat(api, extension) {
  switch (extension) {
    case 'mp4':
    case 'm4v':
    case '3gp': return new api.Mp4OutputFormat();
    case 'mov': return new api.MovOutputFormat();
    case 'mkv': return new api.MkvOutputFormat();
    case 'webm': return new api.WebMOutputFormat();
    default: throw new Error('WebCodecs 不支持该输出容器');
  }
}

function outputName(name, extension) {
  const base = String(name || 'media').replace(/\.[^.]+$/, '') || 'media';
  return `${base}.${extension}`;
}

async function runConversion(api, file, extension, options, hardwareAcceleration) {
  const target = new api.BufferTarget();
  const input = new api.Input({ source: new api.BlobSource(file), formats: api.ALL_FORMATS });
  const output = new api.Output({ format: createOutputFormat(api, extension), target });
  let scaledSize;
  if (Number(options.maxWidth) > 0 || Number(options.maxHeight) > 0) {
    const track = await input.getPrimaryVideoTrack();
    if (track) {
      const sourceWidth = track.squarePixelWidth || track.codedWidth;
      const sourceHeight = track.squarePixelHeight || track.codedHeight;
      const maxWidth = Number(options.maxWidth) > 0 ? Number(options.maxWidth) : Infinity;
      const maxHeight = Number(options.maxHeight) > 0 ? Number(options.maxHeight) : Infinity;
      const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
      if (scale < 1) scaledSize = { width: Math.max(2, Math.round(sourceWidth * scale / 2) * 2), height: Math.max(2, Math.round(sourceHeight * scale / 2) * 2), fit: 'contain' };
    }
  }
  const conversionOptions = {
    input,
    output,
    showWarnings: false,
    video: {
      ...(hardwareAcceleration ? { hardwareAcceleration } : {}),
      bitrate: Math.max(250_000, Number(options.videoBitrate) || 2_500_000),
      keyFrameInterval: 2,
      ...(scaledSize || {}),
      ...(Number.isFinite(options.rotation) ? { rotate: ((Math.round(options.rotation / 90) * 90) % 360 + 360) % 360 } : {})
    },
    audio: options.mute ? { discard: true } : {
      bitrate: Math.max(64_000, Number(options.audioBitrate) || 128_000)
    }
  };
  if (Number.isFinite(options.start) || Number.isFinite(options.end)) {
    conversionOptions.trim = {
      ...(Number.isFinite(options.start) ? { start: Math.max(0, options.start) } : {}),
      ...(Number.isFinite(options.end) ? { end: Math.max(0, options.end) } : {})
    };
  }
  const conversion = await api.Conversion.init(conversionOptions);
  if (!conversion.isValid) {
    await conversion.cancel();
    throw new Error('当前媒体编解码器无法由 WebCodecs 完成');
  }
  let canceled = false;
  const cancel = () => {
    if (!canceled) {
      canceled = true;
      conversion.cancel().catch(() => {});
    }
  };
  options.signal?.addEventListener('abort', cancel, { once: true });
  conversion.onProgress = progress => options.onProgress?.(Math.max(0, Math.min(100, Math.round(progress * 100))));
  try {
    await conversion.execute();
    options.signal?.throwIfAborted();
    const buffer = target.buffer;
    if (!buffer?.byteLength) throw new Error('WebCodecs 未生成媒体数据');
    return new File([buffer], outputName(file.name, extension), { type: MIME_TYPES[extension] || 'application/octet-stream' });
  } finally {
    options.signal?.removeEventListener('abort', cancel);
    input.dispose();
  }
}

export async function transcodeWithWebCodecs(file, targetFormat, options = {}) {
  const extension = String(targetFormat || '').replace(/^\./, '').toLowerCase();
  if (!(file instanceof Blob)) throw new TypeError('需要媒体文件');
  if (!canUseWebCodecs()) throw new Error('浏览器不支持 WebCodecs');
  if (!supportsWebCodecsFormat(extension)) throw new Error('WebCodecs 不支持该输出容器');

  options.signal?.throwIfAborted();
  const api = await loadMediabunny();
  let lastError;
  for (const acceleration of ['no-preference', 'prefer-hardware']) {
    options.signal?.throwIfAborted();
    try {
      return await runConversion(api, file, extension, options, acceleration);
    } catch (error) {
      if (options.signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError || new Error('WebCodecs 转码失败');
}


export async function extractFrameWithWebCodecs(file, timeSeconds = 0, options = {}) {
  if (!(file instanceof Blob)) throw new TypeError('需要视频文件');
  if (!canUseWebCodecs()) throw new Error('浏览器不支持 WebCodecs');
  options.signal?.throwIfAborted();
  const api = await loadMediabunny();
  const input = new api.Input({ source: new api.BlobSource(file), formats: api.ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error('未检测到视频轨道');
    if (!(await track.canDecode())) throw new Error('浏览器无法解码该视频');
    const sinkOptions = { fit: options.fit || 'contain' };
    if (Number.isInteger(options.width) && options.width > 0) sinkOptions.width = options.width;
    if (Number.isInteger(options.height) && options.height > 0) sinkOptions.height = options.height;
    if (Number.isFinite(options.rotation)) sinkOptions.rotation = ((Math.round(options.rotation / 90) * 90) % 360 + 360) % 360;
    const targetTime = Math.max(0, Number(timeSeconds) || 0);
    let sample = null;
    for await (const candidate of new api.CanvasSink(track, sinkOptions).canvases(0, targetTime + 1)) {
      options.signal?.throwIfAborted();
      sample = candidate;
      if (candidate.timestamp >= targetTime) break;
    }
    if (!sample?.canvas) throw new Error('当前位置没有可用画面');
    const blob = await new Promise((resolve, reject) => sample.canvas.toBlob(value => value ? resolve(value) : reject(new Error('缩略图编码失败')), 'image/png'));
    return new File([blob], `${String(file.name || 'video').replace(/\.[^.]+$/, '')}-thumbnail.png`, { type: 'image/png' });
  } finally {
    input.dispose();
  }
}
