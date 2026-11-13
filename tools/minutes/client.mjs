export class SpeechClient {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.worker = null;
    this.pending = null;
  }
  call(type, data = {}) {
    if (this.pending) return Promise.reject(Error("语音引擎正在处理"));
    if (!this.worker) {
      const worker=this.worker = new Worker(new URL("./worker.mjs", import.meta.url), {
        type: "module",
      });
      this.worker.onmessage = ({ data: e }) => {
        if(this.worker!==worker)return;
        this.onEvent(e);
        if (["error", "fatal"].includes(e.type)) {
          this.pending?.reject(Error(e.error));
          this.pending = null;
          this.worker?.terminate();
          this.worker = null;
        } else if (
          (e.type === "ready" && this.pending?.type === "init") ||
          ["complete", "speakers"].includes(e.type)
        ) {
          this.pending?.resolve(e);
          this.pending = null;
        }
      };
      this.worker.onerror = (e) => {
        if(this.worker!==worker)return;
        e.preventDefault();
        this.pending?.reject(Error("语音引擎运行中断，请重新加载后重试"));
        this.pending = null;
        this.worker?.terminate();
        this.worker = null;
      };
    }
    return new Promise((resolve, reject) => {
      this.pending = { type, resolve, reject };
      this.worker.postMessage(
        { type, ...data },
        data.samples ? [data.samples.buffer] : [],
      );
    });
  }
  stop() {
    this.dispose();
    this.onEvent({type:'fatal',error:'已停止'});
  }
  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.pending?.reject(Error("已停止"));
    this.pending = null;
  }
}
