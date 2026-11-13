import { StreamResampler, decodeWav } from "./core.mjs";
export class MeetingRecorder {
  async start({
    system = false,
    onChunk = () => {},
    onLevel = () => {},
    onPcm = () => {},
    onEnded = () => {},
    onError = () => {},
  } = {}) {
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder)
      throw Error("请使用 HTTPS 或 localhost，并使用支持录音的浏览器");
    this.streams = [];
    try {
      if (system) {
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: { echoCancellation: false, noiseSuppression: false },
        });
        this.streams.push(screen);
        screen
          .getVideoTracks()[0]
          .addEventListener("ended", onEnded, { once: true });
        if (!screen.getAudioTracks().length)
          throw Error("未共享声音，请选择浏览器标签页并勾选“分享音频”");
      }
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.streams.push(mic);
      mic
        .getAudioTracks()
        .forEach((track) =>
          track.addEventListener("ended", onEnded, { once: true }),
        );
      const AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(!AudioContextClass)throw Error('当前浏览器不支持音频采集');
      this.context = new AudioContextClass();
      await this.context.resume();
      this.output = this.context.createMediaStreamDestination();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      // Keep an uncompressed PCM tap beside MediaRecorder.  Container chunks
      // are not independently decodable on mobile, so live transcription uses
      // this tap while the same chunks remain available for the final audio.
      let worklet=false;
      if(this.context.audioWorklet){
        try{
          await this.context.audioWorklet.addModule(new URL('./pcm-worklet.mjs',import.meta.url));
          this.processor=new AudioWorkletNode(this.context,'meeting-pcm',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});worklet=true;
          this.flushes=new Map();
          this.processor.port.onmessage=({data})=>{
            if(data.samples)onPcm(data.samples);
            if(data.type==='flushed'){this.flushes.get(data.id)?.();this.flushes.delete(data.id);}
          };
        }catch{}
      }
      this.worklet=worklet;
      if(!worklet)this.processor = this.context.createScriptProcessor(4096, 2, 1);
      this.resampler = new StreamResampler(this.context.sampleRate, 16000);
      const silent = this.context.createGain();
      silent.gain.value = 0;
      this.processor.connect(silent).connect(this.context.destination);
      if(!worklet)this.processor.onaudioprocess = (event) => {
        if(this.recorder?.state!=="recording")return;
        const input = event.inputBuffer;
        if (!input?.length) return;
        const mono = new Float32Array(input.length);
        for (let channel = 0; channel < input.numberOfChannels; channel++) {
          const data = input.getChannelData(channel);
          for (let i = 0; i < mono.length; i++) mono[i] += data[i] / input.numberOfChannels;
        }
        const samples = this.resampler.push(mono);
        if (samples.length) onPcm(samples);
      };
      const sources = this.streams.map((s) =>
        this.context.createMediaStreamSource(
          new MediaStream(s.getAudioTracks()),
        ),
      );
      sources.forEach((s) => {
        const gain = this.context.createGain();
        gain.gain.value = sources.length > 1 ? 0.7 : 1;
        s.connect(gain).connect(this.output);
        gain.connect(this.analyser);
        gain.connect(this.processor);
      });
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(
        (t) => MediaRecorder.isTypeSupported(t),
      );
      this.recorder = new MediaRecorder(
        this.output.stream,
        mime ? { mimeType: mime, audioBitsPerSecond: 128000 } : {},
      );
      this.mime = this.recorder.mimeType;
      this.recorder.ondataavailable = (e) => {
        if (e.data.size) onChunk(e.data);
      };
      this.recorder.addEventListener("error", () =>
        onError(Error("录音设备中断，已保留可恢复的录音")),
      );
      this.recorder.addEventListener("stop", onEnded, { once: true });
      this.recorder.start(1000);
      if(worklet)this.processor.port.postMessage({type:'state',enabled:true});
      this.startedAt = performance.now();
      this.pausedAt = null;
      this.pausedTotal = 0;
      this.finishedAt = null;
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.meter = setInterval(() => {
        this.analyser.getByteTimeDomainData(data);
        onLevel(
          Math.sqrt(
            data.reduce((n, x) => n + (x - 128) ** 2, 0) / data.length,
          ) / 128,
        );
      }, 100);
    } catch (e) {
      await this.cleanup();
      const errors = {
        NotAllowedError: "未获得录音或屏幕共享权限",
        NotFoundError: "未找到可用麦克风",
        NotReadableError: "音频设备被占用，请关闭其他录音程序",
        AbortError: "已取消采集",
        NotSupportedError: "浏览器不支持此录音方式",
      };
      throw Error(errors[e.name] || e.message);
    }
  }
  pause() {
    if (this.recorder?.state === "recording") {
      this.recorder.pause();
      if(this.worklet)this.processor.port.postMessage({type:'state',enabled:false});
      this.pausedAt = performance.now();
    }
  }
  resume() {
    if (this.recorder?.state === "paused") {
      this.pausedTotal += performance.now() - this.pausedAt;
      this.pausedAt = null;
      this.recorder.resume();
      if(this.worklet)this.processor.port.postMessage({type:'state',enabled:true});
    }
  }
  get duration() {
    if (this.startedAt == null) return 0;
    const end = this.finishedAt ?? performance.now();
    return Math.max(
      0,
      (end -
        this.startedAt -
        this.pausedTotal -
        (this.pausedAt == null ? 0 : end - this.pausedAt)) /
        1000,
    );
  }
  async stop() {
    this.finishedAt ??= performance.now();
    if(this.worklet&&this.context?.state==='running'){
      await new Promise(resolve=>{
        const id=crypto.randomUUID(),timer=setTimeout(resolve,1500);
        this.flushes.set(id,()=>{clearTimeout(timer);resolve();});
        this.processor.port.postMessage({type:'state',enabled:false});
        this.processor.port.postMessage({type:'flush',id});
      });
    }
    if (this.recorder && this.recorder.state !== "inactive")
      await new Promise((resolve) => {
        this.recorder.addEventListener("stop", resolve, { once: true });
        this.recorder.stop();
      });
    await this.cleanup();
  }
  async cleanup() {
    clearInterval(this.meter);
    if (this.processor) {
      this.processor.onaudioprocess = null;
      this.processor.disconnect();
    }
    this.streams?.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    if (this.context?.state !== "closed") await this.context?.close();
  }
}
export async function audioSamples(blob) {
  const bytes=await blob.arrayBuffer(),wav=decodeWav(new Uint8Array(bytes));
  if(wav)return wav.rate===16000?wav.samples:new StreamResampler(wav.rate).push(wav.samples);
  const Context=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext;
  try {
    if(!Context)throw Error('use decoder');
    const context=new Context(1,1,16000),decoded = await context.decodeAudioData(bytes),
      mono = new Float32Array(decoded.length);
    for (let c = 0; c < decoded.numberOfChannels; c++) {
      const channel = decoded.getChannelData(c);
      for (let i = 0; i < mono.length; i++)
        mono[i] += channel[i] / decoded.numberOfChannels;
    }
    return decoded.sampleRate === 16000
      ? mono
      : new StreamResampler(decoded.sampleRate).push(mono);
  } catch {
    const { decodeMedia } = await import("./media.mjs");
    try {
      return await decodeMedia(blob);
    } catch (e) {
      throw Error("音轨解码失败：" + e.message);
    }
  }
}
