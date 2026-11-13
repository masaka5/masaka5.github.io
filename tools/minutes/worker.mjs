import factory from "./vendor/sherpa.mjs";
import { OfflineRecognizer } from "./vendor/asr.mjs";
import { createVad } from "./vendor/vad.mjs";
import { createOfflineSpeakerDiarization } from "./vendor/speaker-diarization.mjs";
import { ModelCache } from "../ai/spark-cache.mjs";
import { ASR_BASE, ASR_FILES, DIARIZATION_FILES } from "./models.mjs";
let M,
  recognizer,
  vad,
  diarizer,
  cache,
  loading,
  stopped = false,
  logs = [],
  decodeOptions = {};
const emit = (type, value = {}) => postMessage({ type, ...value });
async function mount(name, bytes) {
  const path = "/models/" + name;
  M.FS.mkdirTree(path.slice(0, path.lastIndexOf("/")));
  M.FS.writeFile(path, bytes, { canOwn: true });
}
async function init(options = {}) {
  if (recognizer?.handle) {
    emit("ready", { version: "2.0.1", heap: M.HEAPU8.length });
    return;
  }
  if (loading) return loading;
  loading = (async () => {
    let store;
    try {
      store = await caches.open("pocket-minutes-funasr-20261230-v1");
    } catch {
      emit("cache", { stored: false });
    }
    cache = new ModelCache({
      cache: store,
      chunkSize: 16 * 1024 * 1024,
      onState: (s) => emit("cache", s),
    });
    emit("progress", { label: "初始化语音引擎", percent: 0 });
    M = await factory({
      wasmBinary: new Uint8Array(
        await (await fetch("./vendor/sherpa.wasm")).arrayBuffer(),
      ),
      print: () => {},
      printErr: (s) => {
        logs.push(String(s));
        if (logs.length > 30) logs.shift();
      },
      onAbort: (s) => emit("fatal", { error: String(s) }),
    });
    M.FS.mkdirTree("/models/Qwen3-0.6B");
    let done = 0,
      total = ASR_FILES.reduce((n, f) => n + f[1], 0);
    for (const [name, size] of ASR_FILES) {
      const bytes = await cache.bytes(`${ASR_BASE}/${name}`, size, (n) => {
        done += n;
        emit("progress", {
          label: "加载 " + name.split("/").at(-1),
          percent: Math.round((done / total) * 95),
        });
      });
      await mount(name, bytes);
    }
    await mount(
      "silero_vad.onnx",
      new Uint8Array(
        await (await fetch("./vendor/silero_vad.onnx")).arrayBuffer(),
      ),
    );
    emit("progress", { label: "编译识别模型", percent: 96 });
    recognizer = new OfflineRecognizer(
      {
        featConfig: { sampleRate: 16000, featureDim: 80 },
        modelConfig: {
          funasrNano: {
            encoderAdaptor: "/models/encoder_adaptor.int8.onnx",
            llm: "/models/llm.int8.onnx",
            embedding: "/models/embedding.int8.onnx",
            tokenizer: "/models/Qwen3-0.6B",
            maxNewTokens: 512,
            temperature: 1e-6,
            topP: 0.8,
            seed: 42,
            language: options.language || "",
            itn: 1,
            hotwords: options.hotwords || "",
          },
          numThreads: 1,
          provider: "cpu",
          debug: 0,
          tokens: "",
        },
      },
      M,
    );
    if (!recognizer.handle)
      throw Error("识别模型初始化失败：" + logs.slice(-4).join(" "));
    vad = createVad(M, {
      sileroVad: {
        model: "/models/silero_vad.onnx",
        threshold: 0.5,
        minSilenceDuration: 0.55,
        minSpeechDuration: 0.2,
        maxSpeechDuration: 20,
        windowSize: 512,
      },
      sampleRate: 16000,
      numThreads: 1,
      provider: "cpu",
      bufferSizeInSeconds: 60,
    });
    if (!vad.handle) throw Error("语音分段模型初始化失败");
    // ONNX sessions own weights now; release model file buffers from MEMFS.
    for (const [name] of ASR_FILES) M.FS.unlink("/models/" + name);
    emit("ready", {
      version: M.UTF8ToString(M._SherpaOnnxGetVersionStr()),
      heap: M.HEAPU8.length,
    });
  })();
  try {
    await loading;
  } catch (e) {
    loading = null;
    throw e;
  }
}
function decode(samples, start) {
  const stream = recognizer.createStream();
  try {
    stream.setOption("language", decodeOptions.language || "");
    stream.setOption("hotwords", decodeOptions.hotwords || "");
    stream.setOption("itn", "1");
    stream.acceptWaveform(16000, samples);
    recognizer.decode(stream);
    const r = recognizer.getResult(stream);
    const text = (r.text || "").trim();
    if (text)
      emit("segment", {
        segment: {
          id: crypto.randomUUID(),
          start: start / 16000,
          end: (start + samples.length) / 16000,
          text,
          speaker: null,
        },
      });
  } finally {
    stream.free();
  }
}
async function transcribe(samples, options = {}) {
  stopped = false;
  decodeOptions = options;
  await init(options);
  if (stopped) {
    emit("complete", { cancelled: true });
    return;
  }
  vad.reset();
  let processed = 0;
  for (let at = 0; at < samples.length; at += 512) {
    if (stopped) break;
    vad.acceptWaveform(samples.subarray(at, at + 512));
    while (!vad.isEmpty()) {
      const seg = vad.front();
      vad.pop();
      decode(seg.samples, seg.start);
      processed = at / samples.length;
      emit("progress", {
        label: "正在转写",
        percent: Math.floor(processed * 100),
      });
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  if (!stopped) {
    vad.flush();
    while (!vad.isEmpty()) {
      const seg = vad.front();
      vad.pop();
      decode(seg.samples, seg.start);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  emit("complete", {
    cancelled: stopped,
    duration: samples.length / 16000,
    heap: M.HEAPU8.length,
  });
}
async function speakers(samples, count) {
  await init();
  if (!diarizer) {
    emit("progress", { label: "加载说话人模型", percent: 0 });
    const optionalCache = new ModelCache({
      cache: cache.cache,
      chunkSize: 32 * 1024 * 1024,
    });
    for (const [name, url, size] of DIARIZATION_FILES) {
      const bytes = await optionalCache.bytes(url, size);
      await mount(name, bytes);
    }
    diarizer = createOfflineSpeakerDiarization(M, {
      segmentation: {
        pyannote: { model: "/models/segmentation.onnx", windowShiftRatio: 0.5 },
        numThreads: 1,
      },
      embedding: { model: "/models/campplus.onnx", numThreads: 1 },
      clustering: { numClusters: count || -1, threshold: 0.5 },
      minDurationOn: 0.3,
      minDurationOff: 0.5,
    });
    if (!diarizer.handle) throw Error("说话人模型初始化失败");
    for (const [name] of DIARIZATION_FILES) M.FS.unlink("/models/" + name);
  } else
    diarizer.setConfig({
      ...diarizer.config,
      clustering: { numClusters: count || -1, threshold: 0.5 },
    });
  emit("progress", { label: "正在区分说话人", percent: 50 });
  const turns = diarizer.process(samples);
  emit("speakers", { turns });
}
let queue = Promise.resolve();
onmessage = ({ data }) => {
  if (data.type === "stop") {
    stopped = true;
    return;
  }
  queue = queue.then(async () => {
    try {
      if (data.type === "init") await init(data.options);
      else if (data.type === "transcribe")
        await transcribe(data.samples, data.options);
      else if (data.type === "speakers")
        await speakers(data.samples, data.count);
    } catch (e) {
      emit("error", {
        error: e.message || String(e),
        detail: logs.slice(-5).join("\n"),
      });
    }
  });
};
