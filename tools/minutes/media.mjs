// Reuse the toolbox's existing FFmpeg WASM, in a separate worker released after decoding.
export async function decodeMedia(blob) {
  const worker = new Worker(
      new URL("../media-player/assets/ffmpeg-worker.js", import.meta.url),
      { type: "module" },
    ),
    pending = new Map();
  let id = 0;
  worker.onmessage = ({ data: m }) => {
    const job = pending.get(m.id);
    if (!job) return;
    pending.delete(m.id);
    m.type === "ERROR" ? job.reject(Error(m.data)) : job.resolve(m.data);
  };
  worker.onerror = (e) => {
    for (const job of pending.values()) job.reject(Error(e.message));
    pending.clear();
  };
  const call = (type, data = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      worker.postMessage({ id: n, type, data });
    });
  try {
    await call("LOAD", {
      coreURL: new URL(
        "../studio/runtime/ffmpeg/ffmpeg-core.js",
        import.meta.url,
      ).href,
      wasmURL: new URL(
        "../studio/runtime/ffmpeg/ffmpeg-core.wasm",
        import.meta.url,
      ).href,
    });
    await call("CREATE_DIR", { path: "/input" });
    await call("MOUNT", {
      fsType: "WORKERFS",
      options: { blobs: [{ name: "media", data: blob }] },
      mountPoint: "/input",
    });
    const code = await call("EXEC", {
      args: [
        "-i",
        "/input/media",
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "f32le",
        "/out.f32",
      ],
    });
    if (code !== 0) throw Error("无法解码音视频中的音轨");
    const bytes = await call("READ_FILE", { path: "/out.f32" });
    return new Float32Array(
      bytes.buffer,
      bytes.byteOffset,
      Math.floor(bytes.byteLength / 4),
    ).slice();
  } finally {
    worker.terminate();
  }
}
