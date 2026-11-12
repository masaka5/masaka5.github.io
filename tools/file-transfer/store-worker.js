/* Dedicated module worker: no file content leaves this origin. */
import { createSHA256 } from "../../vendor/hash-wasm/hash-wasm.js";
const CHUNK = 262144,
  LIMIT = 256 * 1024 * 1024,
  HASH_BLOCK = 1024 * 1024;
let db,
  dir,
  defaultMode = "idb";
const idOK = (id) => typeof id === "string" && /^[a-f0-9]{64}$/.test(id);
function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function transaction(stores, mode, fn) {
  return new Promise((resolve, reject) => {
    let tx;
    try {
      tx = db.transaction(stores, mode, { durability: "strict" });
    } catch {
      tx = db.transaction(stores, mode);
    }
    let result;
    try {
      result = fn(tx);
    } catch (e) {
      tx.abort();
      reject(e);
      return;
    }
    tx.oncomplete = () =>
      resolve(typeof result === "function" ? result() : result);
    tx.onabort = () => reject(tx.error || new Error("本地缓存事务已取消"));
    tx.onerror = () => {};
  });
}
async function get(id) {
  return request(
    db.transaction("records", "readonly").objectStore("records").get(id),
  );
}
async function save(record) {
  await transaction("records", "readwrite", (tx) =>
    tx.objectStore("records").put(record),
  );
  return record;
}
async function fileHandle(id, create = false) {
  if (!dir)
    dir = await (
      await navigator.storage.getDirectory()
    ).getDirectoryHandle("toolbox-file-transfer-v1", { create: true });
  return dir.getFileHandle(id, { create });
}
async function access(id, fn, create = false) {
  const h = await fileHandle(id, create);
  const sync = await h.createSyncAccessHandle();
  try {
    return await fn(sync);
  } finally {
    sync.close();
  }
}
async function available(size) {
  const estimate = await navigator.storage.estimate();
  if (
    Number.isFinite(estimate.quota) &&
    size > estimate.quota - (estimate.usage || 0)
  )
    throw new Error("本地存储空间不足，请清理缓存后重试");
}
async function ensureRecord(id) {
  if (!idOK(id)) throw new Error("文件标识无效");
  const r = await get(id);
  if (!r) throw new Error("接收缓存不存在");
  return r;
}
function chunkRange(id, start = 0, end = Number.MAX_SAFE_INTEGER) {
  return IDBKeyRange.bound([id, start], [id, end]);
}
async function idbChunks(id) {
  return request(
    db
      .transaction("chunks", "readonly")
      .objectStore("chunks")
      .getAll(chunkRange(id)),
  );
}
async function reconcile(r) {
  if (r.storage === "opfs") {
    let length = 0;
    try {
      length = await access(r.id, (s) => s.getSize());
    } catch (e) {
      if (e.name !== "NotFoundError") throw e;
    }
    if (length < r.offset) {
      r.offset = 0;
      r.state = "partial";
      await save(r);
    }
    await access(
      r.id,
      (s) => {
        s.truncate(r.offset);
        s.flush();
      },
      true,
    );
  } else {
    const chunks = await idbChunks(r.id);
    let end = 0;
    for (const c of chunks) {
      if (c.offset !== end || c.offset + c.bytes.byteLength > r.offset) break;
      end += c.bytes.byteLength;
      if (end === r.offset) break;
    }
    if (end !== r.offset) {
      r.offset = 0;
      r.state = "partial";
      await transaction(["records", "chunks"], "readwrite", (tx) => {
        tx.objectStore("chunks").delete(chunkRange(r.id));
        tx.objectStore("records").put(r);
      });
    }
  }
  return r;
}
async function readRange(r, start, end) {
  if (start < 0 || end < start || end > r.offset)
    throw new Error("读取范围超过已保存数据");
  const bytes = new Uint8Array(end - start);
  if (!bytes.length) return bytes;
  if (r.storage === "opfs") {
    await access(r.id, (s) => {
      let read = 0;
      while (read < bytes.length) {
        const n = s.read(bytes.subarray(read), { at: start + read });
        if (!n) throw new Error("接收缓存不完整");
        read += n;
      }
    });
  } else {
    let position = start;
    for (
      let offset = Math.floor(start / CHUNK) * CHUNK;
      offset < end;
      offset += CHUNK
    ) {
      const c = await request(
        db
          .transaction("chunks", "readonly")
          .objectStore("chunks")
          .get([r.id, offset]),
      );
      if (!c) throw new Error("接收缓存不完整");
      const from = Math.max(start, offset),
        to = Math.min(end, offset + c.bytes.byteLength);
      if (to < from) throw new Error("接收缓存不完整");
      bytes.set(
        new Uint8Array(c.bytes).subarray(from - offset, to - offset),
        from - start,
      );
      position = to;
    }
    if (position !== end) throw new Error("接收缓存不完整");
  }
  return bytes;
}
async function hashBlob(blob, end, progress) {
  const hasher = await createSHA256();
  hasher.init();
  for (let n = 0; n < end; n += HASH_BLOCK) {
    hasher.update(
      new Uint8Array(
        await blob.slice(n, Math.min(end, n + HASH_BLOCK)).arrayBuffer(),
      ),
    );
    progress?.(Math.min(1, (n + HASH_BLOCK) / end));
  }
  progress?.(1);
  return hasher.digest("hex");
}
const methods = {
  async init() {
    db = await new Promise((resolve, reject) => {
      const req = indexedDB.open("toolbox-file-transfer-v1", 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        d.createObjectStore("records", { keyPath: "id" });
        d.createObjectStore("chunks", { keyPath: ["id", "offset"] });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (navigator.storage?.getDirectory) {
      try {
        dir = await (
          await navigator.storage.getDirectory()
        ).getDirectoryHandle("toolbox-file-transfer-v1", { create: true });
        const h = await dir.getFileHandle("probe", { create: true });
        const s = await h.createSyncAccessHandle();
        s.close();
        await dir.removeEntry("probe");
        defaultMode = "opfs";
      } catch {
        defaultMode = "idb";
      }
    }
    return defaultMode;
  },
  async list() {
    const records = await request(
      db.transaction("records", "readonly").objectStore("records").getAll(),
    );
    const result = [];
    for (const r of records) result.push(await reconcile(r));
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  },
  async get({ id }) {
    const r = await get(id);
    return r ? await reconcile(r) : null;
  },
  async prepare({ meta }) {
    let r = await get(meta.id);
    if (r) {
      if (r.hash !== meta.hash || r.size !== meta.size)
        throw new Error("已有缓存与文件信息不一致");
      r = await reconcile(r);
    } else {
      r = {
        ...meta,
        offset: 0,
        state: "partial",
        updatedAt: Date.now(),
        storage: defaultMode,
      };
      if (r.storage === "idb" && r.size > LIMIT)
        throw new Error(
          "当前浏览器仅支持缓存 256 MiB，请使用支持 OPFS 的新版浏览器",
        );
      await available(r.size);
      if (r.storage === "opfs")
        await access(
          r.id,
          (s) => {
            s.truncate(0);
            s.flush();
          },
          true,
        );
      await save(r);
    }
    await available(r.size - r.offset);
    return r;
  },
  async write({ id, offset, bytes }) {
    const r = await ensureRecord(id);
    if (
      r.state === "complete" ||
      offset !== r.offset ||
      offset % CHUNK ||
      !bytes.length ||
      bytes.length !== Math.min(CHUNK, r.size - offset)
    )
      throw new Error("分块位置或长度无效");
    await available(bytes.byteLength);
    const next = {
      ...r,
      offset: offset + bytes.byteLength,
      updatedAt: Date.now(),
      state: "partial",
    };
    if (r.storage === "opfs") {
      await access(id, (s) => {
        let written = 0;
        while (written < bytes.length) {
          const n = s.write(bytes.subarray(written), { at: offset + written });
          if (!n) throw new Error("文件写入失败");
          written += n;
        }
        s.flush();
      });
      await save(next);
    } else
      await transaction(["records", "chunks"], "readwrite", (tx) => {
        tx.objectStore("chunks").put({ id, offset, bytes });
        tx.objectStore("records").put(next);
      });
    return next;
  },
  async read({ id, start, end }) {
    return readRange(await ensureRecord(id), start, end);
  },
  async hashPrefix({ id, end }) {
    const r = await ensureRecord(id);
    if (end < 0 || end > r.offset) throw new Error("校验范围无效");
    const hasher = await createSHA256();
    hasher.init();
    for (let n = 0; n < end; n += HASH_BLOCK)
      hasher.update(await readRange(r, n, Math.min(end, n + HASH_BLOCK)));
    return hasher.digest("hex");
  },
  async hashBlob({ blob, end }, progress) {
    return hashBlob(blob, end, progress);
  },
  async complete({ id }) {
    const r = await ensureRecord(id);
    if (r.offset !== r.size) throw new Error("文件尚未接收完整");
    r.state = "complete";
    r.updatedAt = Date.now();
    return save(r);
  },
  async remove({ id }) {
    const r = await get(id);
    if (r?.storage === "opfs") {
      try {
        await (await fileHandle(id)).getFile();
        await dir.removeEntry(id);
      } catch (e) {
        if (e.name !== "NotFoundError") throw e;
      }
    }
    await transaction(["records", "chunks"], "readwrite", (tx) => {
      tx.objectStore("records").delete(id);
      tx.objectStore("chunks").delete(chunkRange(id));
    });
  },
  async blob({ id }) {
    const r = await ensureRecord(id);
    if (r.state !== "complete") throw new Error("文件尚未完成校验");
    if (r.size > LIMIT) throw new Error("大文件请使用流式另存为");
    if (r.storage === "opfs") return (await fileHandle(id)).getFile();
    const parts = [];
    for (let n = 0; n < r.size; n += HASH_BLOCK)
      parts.push(await readRange(r, n, Math.min(r.size, n + HASH_BLOCK)));
    return new Blob(parts, { type: r.type });
  },
};
let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  queue = queue.then(async () => {
    try {
      if (!Object.hasOwn(methods, data.method)) throw new Error("未知存储操作");
      const result = await methods[data.method](data.args, (p) =>
        postMessage({ request: data.request, progress: p }),
      );
      postMessage({ request: data.request, result });
    } catch (e) {
      postMessage({
        request: data.request,
        error:
          e.name === "QuotaExceededError"
            ? "本地存储空间不足，请清理缓存后重试"
            : e.message || "本地缓存失败",
      });
    }
  });
};
