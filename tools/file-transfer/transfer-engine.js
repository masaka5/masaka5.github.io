import {
  CHUNK_SIZE,
  MAX_FILE_SIZE,
  validId,
  validOffset,
  digest,
  randomPassword,
  metadata,
} from "./transfer-core.js?v=20261117e";
const active = (task) =>
  task &&
  ["hashing", "offered", "transferring", "verifying"].includes(task.state);
const validToken = (t) => typeof t === "string" && /^[a-f0-9]{24}$/.test(t);
const ACK_WINDOW_BYTES = CHUNK_SIZE * 16;
export class TransferEngine extends EventTarget {
  constructor({ store, sendControl, sendChunk }) {
    super();
    Object.assign(this, { store, sendControl, sendChunk });
    this.connected = false;
    this.generation = 0;
    this.closed = false;
    this.sendingWindow = false;
    this.chunkQueue = Promise.resolve();
  }
  get current() {
    return this.latest || null;
  }
  changed() {
    this.dispatchEvent(new CustomEvent("change", { detail: this.current }));
  }
  notice(text) {
    this.dispatchEvent(new CustomEvent("notice", { detail: text }));
  }
  fresh(task, generation) {
    return (
      !this.closed &&
      this.generation === generation &&
      (this.outgoing === task || this.incoming === task)
    );
  }
  clearTimer() {
    clearTimeout(this.timer);
    this.timer = null;
  }
  arm() {
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.pause();
      this.notice("等待对方超时，请重新连接后继续");
    }, 30000);
    this.timer?.unref?.();
  }
  async control(type, task, extra = {}) {
    if (this.connected && !this.closed)
      await this.sendControl({
        v: 1,
        type,
        id: task.id,
        token: task.token,
        ...extra,
      });
  }
  async failure(error, task) {
    if (task && (this.outgoing === task || this.incoming === task)) {
      task.state = "paused";
      this.clearTimer();
      this.generation++;
      this.changed();
      this.notice(error?.message || "传输失败，请重试");
      try {
        await this.control("error", task);
      } catch {}
    }
  }
  setConnected(value) {
    this.connected = !!value;
    if (!value) this.disconnected();
  }
  disconnected() {
    this.connected = false;
    this.pause(false);
  }
  async offer(file, options = {}) {
    if (!this.connected || this.closed) throw new Error("请先连接另一台设备");
    if (active(this.incoming) || active(this.outgoing))
      throw new Error("已有文件正在传输");
    if (!(file instanceof Blob) || file.size > MAX_FILE_SIZE)
      throw new Error("文件过大或无效");
    const task = (this.outgoing = {
      name: file.name || "未命名文件",
      path: options.path || file.webkitRelativePath || file.name || "未命名文件",
      size: file.size,
      type: file.type || "",
      offset: 0,
      state: "hashing",
      file,
      token: randomPassword(),
    });
    const generation = ++this.generation;
    this.latest = task;
    this.changed();
    try {
      const hash = validId(options.hash)
        ? options.hash
        : await this.store.hashFile(file, (progress) => {
            if (this.fresh(task, generation)) {
              task.hashProgress = progress;
              this.changed();
            }
          });
      task.hashProgress = 1;
      if (!this.fresh(task, generation)) return;
      const content = metadata({ ...task, id: hash, hash });
      const taskId = await digest(
        new TextEncoder().encode(hash + "\0" + content.path + "\0v4"),
      );
      Object.assign(task, metadata({ ...content, id: taskId }), {
        state: "offered",
      });
      await this.control("offer", task, {
        hash,
        name: task.name,
        path: task.path,
        size: task.size,
        mime: task.type,
      });
      if (!this.fresh(task, generation) || this.current !== task || task.state !== "offered") return;
      this.clearTimer();
      this.changed();
    } catch (e) {
      if (this.fresh(task, generation)) await this.failure(e, task);
    }
    return task;
  }
  async receiveControl(data) {
    let originTask = null;
    const originGeneration = this.generation;
    try {
      if (
        !this.connected ||
        this.closed ||
        !data ||
        typeof data !== "object" ||
        new TextEncoder().encode(JSON.stringify(data)).byteLength > 4096 ||
        data.v !== 1 ||
        !validId(data.id) ||
        !validToken(data.token)
      )
        return;
      if (data.type === "offer") {
        const m = metadata({ ...data, type: data.mime });
        if (active(this.outgoing) || active(this.incoming)) {
          const busyOutgoing = this.outgoing;
          await this.sendControl({
            v: 1,
            type: "reject",
            id: data.id,
            token: data.token,
            reason: "busy",
          });
          if (
            busyOutgoing?.state === "offered" &&
            this.fresh(busyOutgoing, originGeneration) &&
            busyOutgoing === this.current
          )
            await this.failure(
              new Error("双方同时发送，请一方先接收"),
              busyOutgoing,
            );
          return;
        }
        this.generation++;
        this.incoming = {
          ...m,
          token: data.token,
          offset: 0,
          state: "offered",
        };
        this.latest = this.incoming;
        this.dispatchEvent(new CustomEvent("offer", { detail: this.incoming }));
        this.changed();
        return;
      }
      const out = this.outgoing,
        inc = this.incoming;
      const task =
        out?.id === data.id && out.token === data.token
          ? out
          : inc?.id === data.id && inc.token === data.token
            ? inc
            : null;
      if (!task || task !== this.current) return;
      originTask = task;
      if (["pause", "error", "reject", "cancel"].includes(data.type)) {
        if (active(task)) {
          this.generation++;
          task.state =
            data.type === "reject"
              ? "rejected"
              : data.type === "cancel"
                ? "canceled"
                : "paused";
          this.clearTimer();
          this.changed();
        }
        return;
      }
      if (task !== out) {
        if (data.type === "finish" && task.state === "transferring")
          await this.finishIncoming(task);
        return;
      }
      if (
        data.type === "accept" &&
        ["offered", "paused"].includes(task.state)
      ) {
        if (!validOffset(data.offset, task.size) || !validId(data.prefixHash))
          throw new Error("续传位置无效");
        this.clearTimer();
        const generation = this.generation;
        const actual = await this.store.hashBlobPrefix(task.file, data.offset);
        if (!this.fresh(task, generation)) return;
        if (actual !== data.prefixHash)
          throw new Error("已有文件校验不一致，请删除接收缓存后重试");
        task.offset = data.offset;
        task.state = "transferring";
        this.clearTimer();
        this.changed();
        await this.next(task);
        return;
      }
      if (data.type === "ack" && task.state === "transferring") {
        if (
          !this.pending ||
          data.offset !== this.pending.end ||
          this.pending.token !== task.token
        )
          throw new Error("确认位置无效");
        task.offset = data.offset;
        task.transferred = Math.max(task.transferred || 0, data.offset);
        this.pending = null;
        this.clearTimer();
        this.changed();
        if (!this.sendingWindow) await this.next(task);
        return;
      }
      if (
        data.type === "complete" &&
        task.state === "verifying" &&
        task.offset === task.size
      ) {
        task.state = "complete";
        this.clearTimer();
        this.changed();
      }
    } catch (e) {
      if (originTask && this.fresh(originTask, originGeneration))
        await this.failure(e, originTask);
    }
  }
  async accept(id) {
    const task = this.incoming;
    if (
      !task ||
      task.id !== id ||
      !["offered", "paused"].includes(task.state) ||
      !this.connected
    )
      return;
    const generation = ++this.generation;
    task.state = "verifying";
    this.changed();
    try {
      const record = await this.store.prepare(task);
      if (!this.fresh(task, generation)) return;
      const prefixHash = await this.store.hashPrefix(id, record.offset);
      if (!this.fresh(task, generation)) return;
      task.offset = record.offset;
      task.state = "transferring";
      this.changed();
      this.clearTimer();
      await this.control("accept", task, { offset: task.offset, prefixHash });
    } catch (e) {
      if (this.fresh(task, generation)) await this.failure(e, task);
    }
  }
  async reject(id) {
    const task = this.incoming;
    if (!task || task.id !== id) return;
    this.generation++;
    task.state = "rejected";
    await this.control("reject", task);
    this.changed();
  }
  async next(task) {
    const generation = this.generation;
    if (
      this.sendingWindow ||
      !this.fresh(task, generation) ||
      task.state !== "transferring"
    )
      return;
    if (task.offset === task.size) {
      task.state = "verifying";
      task.transferred = task.size;
      this.changed();
      this.clearTimer();
      await this.control("finish", task);
      return;
    }
    const windowStart = task.offset;
    const windowEnd = Math.min(task.size, windowStart + ACK_WINDOW_BYTES);
    this.pending = { end: windowEnd, token: task.token };
    this.sendingWindow = true;
    this.arm();
    try {
      let offset = windowStart;
      while (offset < windowEnd) {
        if (!this.fresh(task, generation) || task.state !== "transferring")
          return;
        const end = Math.min(task.size, offset + CHUNK_SIZE);
        const bytes = new Uint8Array(
          await task.file.slice(offset, end).arrayBuffer(),
        );
        const hash = await digest(bytes);
        if (!this.fresh(task, generation) || task.state !== "transferring")
          return;
        task.transferred = end;
        this.changed();
        await this.sendChunk(bytes, {
          v: 1,
          id: task.id,
          token: task.token,
          offset,
          hash,
          ack: end === windowEnd || end === task.size,
        });
        offset = end;
      }
    } finally {
      this.sendingWindow = false;
    }
    if (!this.pending && this.fresh(task, generation))
      await this.next(task);
  }
  receiveChunk(bytes, meta) {
    const queued = this.chunkQueue.then(() => this.processChunk(bytes, meta));
    this.chunkQueue = queued.catch(() => {});
    return queued;
  }
  async processChunk(bytes, meta) {
    const task = this.incoming;
    const generation = this.generation;
    if (
      !this.connected ||
      !task ||
      task !== this.current ||
      task.state !== "transferring" ||
      !meta ||
      meta.v !== 1 ||
      meta.id !== task.id ||
      meta.token !== task.token
    )
      return;
    try {
      if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
      if (
        new TextEncoder().encode(JSON.stringify(meta)).byteLength > 4096 ||
        meta.offset !== task.offset ||
        bytes.length !== Math.min(CHUNK_SIZE, task.size - task.offset) ||
        !bytes.length ||
        !validId(meta.hash) ||
        (await digest(bytes)) !== meta.hash
      )
        throw new Error("文件分块校验失败，请继续重试");
      if (!this.fresh(task, generation) || task.state !== "transferring")
        return;
      const record = await this.store.write(task.id, task.offset, bytes);
      if (!this.fresh(task, generation) || task.state !== "transferring")
        return;
      task.offset = record.offset;
      task.transferred = record.offset;
      this.changed();
      this.arm();
      if (meta.ack || task.offset === task.size)
        await this.control("ack", task, { offset: task.offset });
    } catch (e) {
      if (this.fresh(task, generation)) await this.failure(e, task);
    }
  }
  async finishIncoming(task) {
    const generation = this.generation;
    if (task.offset !== task.size) throw new Error("文件尚未接收完整");
    task.state = "verifying";
    this.changed();
    this.clearTimer();
    const hash = await this.store.hashPrefix(task.id, task.size);
    if (!this.fresh(task, generation) || task.state !== "verifying") return;
    if (hash !== task.hash)
      throw new Error("完整文件校验失败，请删除缓存后重试");
    await this.store.complete(task.id);
    if (!this.fresh(task, generation) || task.state !== "verifying") return;
    task.state = "complete";
    this.clearTimer();
    this.changed();
    await this.control("complete", task);
  }
  async cancel() {
    const task = this.current;
    if (
      !task ||
      !["hashing", "offered", "transferring", "verifying", "paused"].includes(
        task.state,
      )
    )
      return;
    this.generation++;
    this.clearTimer();
    this.pending = null;
    task.state = "canceled";
    this.changed();
    try {
      if (this.connected) await this.control("cancel", task);
    } catch {}
  }
  pause(notify = true) {
    const tasks = [this.outgoing, this.incoming].filter(active);
    this.generation++;
    this.clearTimer();
    this.pending = null;
    this.sendingWindow = false;
    for (const task of tasks) {
      task.state = "paused";
      if (notify) this.control("pause", task).catch(() => {});
    }
    this.changed();
  }
  async resume() {
    const task = this.current;
    if (task?.state !== "paused") return;
    if (task === this.outgoing && task.file)
      return this.offer(task.file, { hash: task.hash, path: task.path });
    if (task === this.incoming) return this.accept(task.id);
  }
  close() {
    this.pause(false);
    this.closed = true;
    this.connected = false;
  }
}

