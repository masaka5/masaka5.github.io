import { metadata, validId, validOffset, CHUNK_SIZE } from "./transfer-core.js";
export class TransferStore {
  constructor() {
    this.fallbackLimit = 256 * 1024 * 1024;
    this.requests = new Map();
    this.sequence = 0;
    this.closed = false;
  }
  async init() {
    if (this.worker) return this;
    if (!navigator.locks)
      throw new Error("当前浏览器不支持安全的本地缓存锁，请使用新版浏览器");
    let acquired;
    const ready = new Promise((resolve, reject) => {
      acquired = { resolve, reject };
    });
    this.lockPromise = navigator.locks
      .request(
        "toolbox-file-transfer-store-v1",
        { ifAvailable: true },
        (lock) => {
          if (!lock) {
            acquired.reject(
              new Error("另一标签页正在使用文件缓存，请先关闭该页"),
            );
            return;
          }
          return new Promise((resolve) => {
            this.release = resolve;
            acquired.resolve();
          });
        },
      )
      .catch((e) => acquired.reject(e));
    await ready;
    try {
      this.worker = new Worker(new URL("./store-worker.js", import.meta.url), {
        type: "module",
      });
      this.worker.onmessage = ({ data }) => {
        const pending = this.requests.get(data.request);
        if (!pending) return;
        if (data.progress !== undefined) {
          pending.progress?.(data.progress);
          return;
        }
        this.requests.delete(data.request);
        data.error
          ? pending.reject(new Error(data.error))
          : pending.resolve(data.result);
      };
      this.worker.onerror = () => {
        for (const p of this.requests.values())
          p.reject(new Error("本地存储工作线程失败"));
        this.requests.clear();
      };
      this.mode = await this.call("init");
      return this;
    } catch (e) {
      this.close();
      throw e;
    }
  }
  call(method, args = {}, progress) {
    if (this.closed || !this.worker)
      return Promise.reject(new Error("本地缓存已关闭"));
    return new Promise((resolve, reject) => {
      const request = ++this.sequence;
      this.requests.set(request, { resolve, reject, progress });
      this.worker.postMessage({ request, method, args });
    });
  }
  async list() {
    return this.call("list");
  }
  async get(id) {
    this.checkId(id);
    return this.call("get", { id });
  }
  checkId(id) {
    if (!validId(id)) throw new Error("文件标识无效");
  }
  async prepare(meta) {
    return this.call("prepare", { meta: metadata(meta) });
  }
  async write(id, offset, bytes) {
    this.checkId(id);
    if (
      !(bytes instanceof Uint8Array) ||
      !bytes.length ||
      bytes.length > CHUNK_SIZE ||
      !Number.isSafeInteger(offset) ||
      offset < 0
    )
      throw new Error("分块无效");
    return this.call("write", { id, offset, bytes });
  }
  async hashPrefix(id, end) {
    this.checkId(id);
    if (!Number.isSafeInteger(end) || end < 0) throw new Error("校验范围无效");
    return this.call("hashPrefix", { id, end });
  }
  async hashFile(blob, onProgress) {
    if (!(blob instanceof Blob)) throw new Error("文件无效");
    return this.call("hashBlob", { blob, end: blob.size }, onProgress);
  }
  async hashBlobPrefix(blob, end) {
    if (
      !(blob instanceof Blob) ||
      !Number.isSafeInteger(end) ||
      end < 0 ||
      end > blob.size
    )
      throw new Error("校验范围无效");
    return this.call("hashBlob", { blob, end });
  }
  async read(id, start, end) {
    this.checkId(id);
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 0 ||
      end < start ||
      end - start > 16 * 1024 * 1024
    )
      throw new Error("读取范围无效");
    return this.call("read", { id, start, end });
  }
  async complete(id) {
    this.checkId(id);
    return this.call("complete", { id });
  }
  async remove(id) {
    this.checkId(id);
    return this.call("remove", { id });
  }
  async blob(id) {
    this.checkId(id);
    return this.call("blob", { id });
  }
  close() {
    this.closed = true;
    this.worker?.terminate();
    this.worker = null;
    for (const p of this.requests.values())
      p.reject(new Error("本地缓存已关闭"));
    this.requests.clear();
    this.release?.();
    this.release = null;
  }
}
