/* Browser transports: RFC 9725 WHIP and api.video-browser-to-rtmp Socket.IO 4.
 * Protocol reference (no upstream code copied): apivideo/api.video-browser-to-rtmp
 * e7d4227b025258d41132168157d89c2100facd70, server/src/{connection,types}.ts (MIT).
 * The configured relay is an existing external service, never started by this site.
 */
const abortError = () => new DOMException('推流已停止', 'AbortError');
const failure = (message, retryable = true) => Object.assign(new Error(message), { retryable });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  promise.catch(() => {});
  return { promise, resolve, reject };
};
function waitFor(promise, signal, ms = 20000) {
  return new Promise((resolve, reject) => {
    const done = (fn, value) => { clearTimeout(timer); signal.removeEventListener('abort', aborted); fn(value); };
    const aborted = () => done(reject, abortError());
    const timer = setTimeout(() => done(reject, failure('连接超时，请检查服务地址、跨域设置与网络')), ms);
    signal.addEventListener('abort', aborted, { once: true });
    if (signal.aborted) aborted();
    Promise.resolve(promise).then(v => done(resolve, v), e => done(reject, e));
  });
}
function endpointURL(value, protocols, label) {
  let url;
  try { url = new URL(String(value || '').trim()); } catch { throw failure(`请填写有效的${label}`, false); }
  if (!protocols.includes(url.protocol) || url.username || url.password || url.hash) throw failure(`${label}格式不受支持`, false);
  if (globalThis.location?.protocol === 'https:' && ['http:', 'ws:'].includes(url.protocol)) throw failure(`${label}必须使用 HTTPS / WSS`, false);
  return url;
}

export class BroadcastPublisher {
  constructor({ onState = () => {}, onError = () => {} } = {}) {
    this.onState = onState;
    this.onError = onError;
    this._stats = { state: 'idle', delivery: null, bitrateKbps: 0, fps: 0, width: 0, height: 0, elapsed: 0, attempts: 0 };
    this._generation = 0;
  }

  getStats() {
    return { ...this._stats, elapsed: this._started ? Math.floor((Date.now() - this._started) / 1000) : 0 };
  }

  _state(state) {
    this._stats.state = state;
    try { this.onState(state, this.getStats()); } catch { /* Consumer callback cannot interrupt transport cleanup. */ }
  }

  async start(stream, options = {}) {
    const generation = ++this._generation;
    await this._stop();
    if (generation !== this._generation) throw abortError();
    if (!stream?.getTracks?.().some(track => track.readyState === 'live')) throw failure('请先添加有效的视频或音频来源', false);
    const conf = { ...options };
    if (conf.mode === 'whip') conf.endpoint = endpointURL(conf.endpoint, ['https:', 'http:'], 'WHIP 地址').href;
    else if (conf.mode === 'rtmp') {
      if (!conf.relayURL) throw failure('浏览器不能直接推送 RTMP；请填写已有的 api.video 兼容转发服务地址', false);
      const relay = endpointURL(conf.relayURL, ['https:', 'http:', 'ws:', 'wss:'], '转发服务地址');
      if (relay.search) throw failure('转发服务地址请勿包含查询参数', false);
      relay.protocol = ['https:', 'wss:'].includes(relay.protocol) ? 'wss:' : 'ws:';
      relay.pathname = `${relay.pathname.replace(/\/$/, '').replace(/\/socket\.io$/, '')}/socket.io/`;
      relay.search = 'EIO=4&transport=websocket';
      conf.relayURL = relay.href;
      const address = endpointURL(conf.address, ['rtmp:', 'rtmps:'], 'RTMP 地址');
      if (!String(conf.key || '').trim()) throw failure('请填写串流密钥', false);
      conf.rtmp = `${address.href.replace(/\/$/, '')}/${String(conf.key).trim()}`;
    } else throw failure('请选择 WHIP 或 RTMP 转发模式', false);
    const settings = stream.getTracks().find(track => track.kind === 'video')?.getSettings?.() || {};
    this._stats = { state: 'connecting', delivery: conf.mode === 'rtmp' ? 'relay' : 'peer', bitrateKbps: 0,
      fps: settings.frameRate || conf.fps || 0, width: settings.width || conf.width || 0, height: settings.height || conf.height || 0,
      elapsed: 0, attempts: 0 };
    this._started = 0;
    this._controller = new AbortController();
    const ready = deferred();
    this._runPromise = this._run(stream, conf, this._controller.signal, ready);
    return ready.promise;
  }

  async stop() { ++this._generation; await this._stop(); }

  async _stop() {
    this._controller?.abort();
    await this._runPromise;
    this._controller = null;
    this._runPromise = null;
    this._started = 0;
    this._stats.bitrateKbps = 0;
    this._state('idle');
  }

  async _run(stream, conf, signal, ready) {
    let retries = 0;
    try {
      while (!signal.aborted) {
        this._state(retries ? 'reconnecting' : 'connecting');
        const controller = new AbortController();
        const abortAttempt = () => controller.abort();
        signal.addEventListener('abort', abortAttempt, { once: true });
        if (signal.aborted) controller.abort();
        const attempt = { signal: controller.signal, failed: deferred(), cleanups: [], controller };
        attempt.cleanups.push(() => signal.removeEventListener('abort', abortAttempt));
        this._attempt = attempt;
        try {
          if (conf.mode === 'whip') await this._whip(stream, conf, attempt);
          else await this._relay(stream, conf, attempt);
          if (signal.aborted) throw abortError();
          if (!this._started) this._started = Date.now();
          this._state('live');
          ready.resolve(this.getStats());
          await waitFor(attempt.failed.promise, signal, 2147483647);
        } catch (error) {
          if (signal.aborted || error.name === 'AbortError') throw abortError();
          this._stats.bitrateKbps = 0;
          // Never forward server messages, SDP, destination addresses or credentials.
          const safe = error.retryable === undefined ? failure('推流连接失败，请检查服务配置与网络') : error;
          try { this.onError(safe); } catch { /* Consumer callback. */ }
          if (safe.retryable === false || retries >= 10) { this._state('error'); ready.reject(safe); return; }
          retries++;
          this._stats.attempts = retries;
        } finally {
          await this._cleanup(attempt);
        }
        this._state('reconnecting');
        const pause = new Promise(resolve => {
          const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', finish); resolve(); };
          const timer = setTimeout(finish, Math.min(30000, 1000 * 2 ** (retries - 1)));
          signal.addEventListener('abort', finish, { once: true });
          if (signal.aborted) finish();
        });
        await pause;
      }
    } catch (error) { ready.reject(error); }
    finally {
      if (signal.aborted) ready.reject(abortError());
      conf.token = ''; conf.key = ''; conf.rtmp = ''; conf.endpoint = ''; conf.relayURL = ''; this._attempt = null;
    }
  }

  async _cleanup(attempt) {
    attempt.controller.abort();
    for (const cleanup of attempt.cleanups.reverse()) {
      try { await cleanup(); } catch { /* Best effort close must not block other resources. */ }
    }
    attempt.cleanups.length = 0;
  }

  async _whip(stream, conf, attempt) {
    if (typeof RTCPeerConnection !== 'function') throw failure('当前浏览器不支持 WebRTC 推流', false);
    const { signal } = attempt;
    const auth = conf.token ? { Authorization: `Bearer ${conf.token}` } : {};
    const request = (url, options) => waitFor(fetch(url, { credentials: 'omit', redirect: 'error', signal, ...options }), signal);
    let iceServers = [];
    const options = await request(conf.endpoint, { method: 'OPTIONS', headers: auth });
    if ([401, 403].includes(options.status)) throw failure('WHIP 鉴权失败，请检查令牌与推流权限', false);
    if (options.ok) {
      for (const match of (options.headers.get('Link') || '').matchAll(/<([^>]+)>;\s*rel="ice-server"([^<]*)/g)) {
        const server = { urls: [match[1]] };
        for (const key of ['username', 'credential']) {
          const value = match[2].match(new RegExp(`${key}="((?:[^"\\\\]|\\\\.)*)"`));
          if (value) { try { server[key] = JSON.parse(`"${value[1]}"`); } catch { /* Ignore malformed optional credentials. */ } }
        }
        iceServers.push(server);
      }
    }
    const pc = new RTCPeerConnection({ iceServers, bundlePolicy: 'max-bundle' });
    let sessionURL = null;
    attempt.cleanups.push(async () => {
      pc.onconnectionstatechange = null;
      pc.close();
      if (sessionURL) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        try { await fetch(sessionURL, { method: 'DELETE', credentials: 'omit', redirect: 'error',
          headers: new URL(sessionURL).origin === new URL(conf.endpoint).origin ? auth : {}, signal: controller.signal, keepalive: true }); }
        finally { clearTimeout(timer); }
      }
    });
    const connected = deferred();
    let disconnectedTimer;
    attempt.cleanups.push(() => clearTimeout(disconnectedTimer));
    const inspect = () => {
      clearTimeout(disconnectedTimer);
      if (pc.connectionState === 'connected') connected.resolve();
      else if (['failed', 'closed'].includes(pc.connectionState)) { const error = failure('WebRTC 连接已中断'); connected.reject(error); attempt.failed.reject(error); }
      else if (pc.connectionState === 'disconnected') disconnectedTimer = setTimeout(() => attempt.failed.reject(failure('WebRTC 网络连接已断开')), 4000);
    };
    pc.onconnectionstatechange = inspect;
    for (const track of stream.getTracks().filter(track => track.readyState === 'live')) {
      const sender = pc.addTrack(track, stream);
      if (track.kind === 'video' && conf.videoBitsPerSecond && sender.getParameters) {
        const parameters = sender.getParameters();
        parameters.encodings = parameters.encodings?.length ? parameters.encodings : [{}];
        parameters.encodings.forEach(encoding => { encoding.maxBitrate = Number(conf.videoBitsPerSecond); if (conf.fps) encoding.maxFramerate = Number(conf.fps); });
        try { await sender.setParameters(parameters); } catch { /* Browser may apply bandwidth only after negotiation. */ }
      }
    }
    await waitFor(pc.setLocalDescription(await waitFor(pc.createOffer(), signal)), signal);
    if (pc.iceGatheringState !== 'complete') {
      await waitFor(new Promise(resolve => {
        const gathered = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', gathered); resolve(); } };
        pc.addEventListener('icegatheringstatechange', gathered);
        attempt.cleanups.push(() => pc.removeEventListener('icegatheringstatechange', gathered));
        gathered();
      }), signal, 15000);
    }
    const response = await request(conf.endpoint, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/sdp', Accept: 'application/sdp' }, body: pc.localDescription.sdp });
    if (response.status !== 201) throw failure(`WHIP 服务拒绝推流（HTTP ${response.status}）`, ![400, 401, 403, 404, 405, 406, 415].includes(response.status));
    const location = response.headers.get('Location');
    if (!location) throw failure('WHIP 服务未返回会话地址；请检查 CORS 是否公开 Location', false);
    sessionURL = endpointURL(new URL(location, conf.endpoint).href, ['http:', 'https:'], 'WHIP 会话地址').href;
    if (!response.headers.get('Content-Type')?.toLowerCase().includes('application/sdp')) throw failure('WHIP 服务没有返回有效的 SDP 应答', false);
    await waitFor(pc.setRemoteDescription({ type: 'answer', sdp: await waitFor(response.text(), signal) }), signal);
    inspect();
    await waitFor(Promise.race([connected.promise, attempt.failed.promise]), signal, 25000);
    let previous = null, sampling = false;
    const sample = async () => {
      if (sampling || signal.aborted || pc.connectionState !== 'connected') return;
      sampling = true;
      try {
        const report = await pc.getStats();
        if (signal.aborted || this._attempt !== attempt) return;
        let bytes = 0, timestamp = 0;
        report.forEach(stat => {
          if (stat.type !== 'outbound-rtp' || stat.isRemote) return;
          bytes += stat.bytesSent || 0; timestamp = Math.max(timestamp, stat.timestamp || 0);
          if ((stat.kind || stat.mediaType) === 'video') {
            this._stats.fps = stat.framesPerSecond || 0;
            this._stats.width = stat.frameWidth || this._stats.width;
            this._stats.height = stat.frameHeight || this._stats.height;
          }
        });
        if (previous && timestamp > previous.timestamp) this._stats.bitrateKbps = Math.round(Math.max(0, bytes - previous.bytes) * 8 / (timestamp - previous.timestamp));
        previous = { bytes, timestamp };
      } catch { /* A closed peer has no stats. */ } finally { sampling = false; }
    };
    await sample();
    const timer = setInterval(sample, 1000);
    attempt.cleanups.push(() => clearInterval(timer));
  }

  async _relay(stream, conf, attempt) {
    if (typeof MediaRecorder !== 'function' || typeof WebSocket !== 'function') throw failure('当前浏览器不支持 WebSocket / MediaRecorder 推流', false);
    const mimeType = ['video/webm;codecs=vp8,opus', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw failure('当前浏览器不支持转发服务要求的 WebM 编码', false);
    const { signal } = attempt;
    const socket = new WebSocket(conf.relayURL);
    const opened = deferred(), firstMedia = deferred(), acknowledgements = new Map();
    let nextID = 0, recorder, heartbeat, queuedBytes = 0, bytes = 0, previous = { bytes: 0, timestamp: Date.now() };
    const reject = error => { opened.reject(error); firstMedia.reject(error); attempt.failed.reject(error); for (const ack of acknowledgements.values()) ack.reject(error); acknowledgements.clear(); };
    const armHeartbeat = ms => { clearTimeout(heartbeat); heartbeat = setTimeout(() => reject(failure('转发服务心跳超时')), ms); };
    const emit = (name, value, binary = false) => {
      const id = nextID++, ack = deferred();
      acknowledgements.set(id, ack);
      if (binary) { socket.send(`451-${id}${JSON.stringify([name, { _placeholder: true, num: 0 }])}`); socket.send(value); }
      else socket.send(`42${id}${JSON.stringify(value === undefined ? [name] : [name, value])}`);
      return waitFor(ack.promise, signal, 15000).finally(() => acknowledgements.delete(id));
    };
    let heartbeatWindow = 45000;
    socket.onmessage = event => {
      if (typeof event.data !== 'string' || event.data.length > 65536) return;
      const packet = event.data;
      try {
        if (packet[0] === '0') {
          const hello = JSON.parse(packet.slice(1));
          heartbeatWindow = Math.min(120000, Math.max(5000, Number(hello.pingInterval || 25000) + Number(hello.pingTimeout || 20000)));
          armHeartbeat(heartbeatWindow); socket.send('40');
        } else if (packet[0] === '2') { socket.send(`3${packet.slice(1)}`); armHeartbeat(heartbeatWindow); }
        else if (packet.startsWith('40')) opened.resolve();
        else if (packet.startsWith('43')) {
          const match = packet.match(/^43(\d+)(\[.*\])$/); if (!match) return;
          const ack = acknowledgements.get(Number(match[1]));
          if (ack) { const values = JSON.parse(match[2]); values[0] ? ack.reject(failure('转发服务未能接收媒体，请检查目的地址与密钥')) : ack.resolve(); }
        } else if (packet.startsWith('42')) {
          const data = JSON.parse(packet.slice(2));
          if (data[0] === 'error') reject(failure('转发服务推流失败，请检查 RTMP 地址、密钥与服务状态', data[1]?.name !== 'INVALID_PARAMETERS'));
        } else if (packet.startsWith('44')) reject(failure('转发服务拒绝连接，请检查访问权限', false));
        else if (packet === '1' || packet.startsWith('41')) reject(failure('转发服务关闭了连接'));
      } catch { reject(failure('转发服务返回了不兼容的协议数据', false)); }
    };
    socket.onclose = () => reject(failure('转发连接已断开'));
    socket.onerror = () => reject(failure('无法连接转发服务，请检查地址、证书与网络'));
    attempt.cleanups.push(() => {
      clearTimeout(heartbeat);
      if (recorder) { recorder.ondataavailable = null; recorder.onerror = null; if (recorder.state !== 'inactive') recorder.stop(); }
      socket.onmessage = socket.onclose = socket.onerror = null;
      if (socket.readyState === 1) { try { socket.send('42["stop"]'); socket.send('41'); } catch { /* Closing socket. */ } }
      socket.close();
      for (const ack of acknowledgements.values()) ack.reject(abortError());
      acknowledgements.clear();
    });
    await waitFor(Promise.race([opened.promise, attempt.failed.promise]), signal);
    await emit('start', { rtmp: conf.rtmp, framerate: Number(conf.fps) || 30, audioSampleRate: 48000,
      audioBitsPerSecond: 128000, videoBitsPerSecond: Number(conf.videoBitsPerSecond) || 2500000 });
    recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000, videoBitsPerSecond: Number(conf.videoBitsPerSecond) || 2500000 });
    recorder.onerror = () => reject(failure('浏览器媒体编码失败'));
    // One FIFO chain preserves WebM header/chunk order and bounds memory during a slow relay.
    let chain = Promise.resolve();
    recorder.ondataavailable = event => {
      if (!event.data?.size || signal.aborted) return;
      queuedBytes += event.data.size;
      if (queuedBytes > 8 * 1024 * 1024 || socket.bufferedAmount > 8 * 1024 * 1024) { reject(failure('转发服务接收过慢，正在重新连接')); return; }
      chain = chain.then(async () => {
        if (signal.aborted || this._attempt !== attempt) return;
        await emit('binarystream', event.data, true);
        bytes += event.data.size; queuedBytes -= event.data.size;
        const timestamp = Date.now();
        if (timestamp > previous.timestamp) this._stats.bitrateKbps = Math.round((bytes - previous.bytes) * 8 / (timestamp - previous.timestamp));
        previous = { bytes, timestamp };
        firstMedia.resolve();
      }).catch(reject);
    };
    recorder.start(250);
    await waitFor(Promise.race([firstMedia.promise, attempt.failed.promise]), signal);
  }
}
