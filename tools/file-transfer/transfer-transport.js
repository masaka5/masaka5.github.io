import { deriveConnection } from "./transfer-core.js?v=20261117b";

export const MAX_PEERS = 8;
const jsonSize = (value) =>
  new TextEncoder().encode(JSON.stringify(value)).byteLength;

export class TransferTransport extends EventTarget {
  constructor({ password, via = "mqtt" }) {
    super();
    this.password = password;
    this.via = via;
    this.closed = false;
    this.peers = new Map();
    this.room = null;
  }
  get peer() {
    return this.peers.keys().next().value || null;
  }
  get peerIds() {
    return [...this.peers.keys()];
  }
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
  hasPeer(peerId) {
    return !!peerId && this.peers.has(peerId);
  }
  addPeer(peerId) {
    if (!peerId || this.peers.has(peerId) || this.peers.size >= MAX_PEERS - 1)
      return;
    this.peers.set(peerId, { id: peerId, connectedAt: Date.now() });
    this.emit("connected", peerId);
  }
  async connect() {
    if (!["mqtt", "nostr"].includes(this.via)) throw Error("连接方式无效");
    const connection = await deriveConnection(this.password);
    this.password = null;
    const library = await import("../../vendor/meeting/" + this.via + ".js");
    if (this.closed) return;
    this.library = library;
    const room = (this.room = library.joinRoom(
      {
        appId: "tools.manshii.asia/file-transfer/v2",
        identity: "none",
        password: connection.key,
        maxUsers: MAX_PEERS,
        maxReceiveBytes: 1024 * 1024,
        turnConfig: [],
        relayConfig: { redundancy: 4, warnOnRelayFailure: false },
      },
      connection.room,
    ));
    const control = (this.control = room.makeAction("control")),
      chunk = (this.chunk = room.makeAction("chunk"));
    control.onReceive(
      ({ peerId, byteLength }) =>
        this.hasPeer(peerId) && byteLength <= 4096,
    );
    chunk.onReceive(
      ({ peerId, byteLength, metadata }) =>
        this.hasPeer(peerId) &&
        byteLength <= 262144 &&
        metadata &&
        jsonSize(metadata) <= 4096,
    );
    control.onMessage((data, { peerId }) => {
      if (
        this.hasPeer(peerId) &&
        data &&
        typeof data === "object" &&
        jsonSize(data) <= 4096
      )
        this.emit("control", { data, peerId });
    });
    chunk.onMessage((bytes, { peerId, metadata }) => {
      if (
        this.hasPeer(peerId) &&
        bytes instanceof Uint8Array &&
        bytes.byteLength <= 262144
      )
        this.emit("chunk", { bytes, meta: metadata, peerId });
    });
    room.onPeerJoin(({ peerId }) => this.addPeer(peerId));
    room.onPeerLeave(({ peerId }) => {
      if (!this.peers.delete(peerId)) return;
      this.emit("disconnected", peerId);
    });
    room.onError((error) =>
      this.emit(
        "notice",
        {
          "room-full": "房间设备已满",
          "peer-connect-failed": "无法直连，请切换网络后重试",
          "relay-failed": "信令连接失败，请切换信令方式",
          "decrypt-failed": "连接密码不匹配",
        }[error.code] || "连接中断，请重新连接",
      ),
    );
    let timeout;
    try {
      await Promise.race([
        room.ready,
        new Promise((_, reject) => {
          timeout = setTimeout(
            () => reject(Error("信令连接超时，请切换连接方式")),
            30000,
          );
        }),
      ]);
    } catch (error) {
      await this.leave();
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    if (this.closed) return;
    const existing = this.room?.getPeers?.() || {};
    for (const peerId of Object.keys(existing)) this.addPeer(peerId);
    this.emit("ready");
  }
  async sendControl(data, peerId = this.peer) {
    if (this.closed || !this.hasPeer(peerId)) throw Error("设备已断开");
    if (jsonSize(data) > 4096) throw Error("控制信息超出限制");
    await this.control.send(data, { target: peerId });
  }
  async sendChunk(bytes, meta, peerId = this.peer) {
    if (this.closed || !this.hasPeer(peerId)) throw Error("设备已断开");
    if (bytes.byteLength > 262144 || jsonSize(meta) > 4096)
      throw Error("文件块超出限制");
    await this.chunk.send(bytes, { target: peerId, metadata: meta });
  }
  async stats(peerId = this.peer) {
    const result = {
      state: this.hasPeer(peerId) ? "已直连" : "等待设备",
      bytesSent: 0,
      bytesReceived: 0,
      local: null,
      remote: null,
    };
    const peer = this.room?.getPeers()?.[peerId];
    if (!peer) return result;
    const stats = await peer.connection.getStats();
    stats.forEach((item) => {
      if (
        item.type === "candidate-pair" &&
        item.state === "succeeded" &&
        item.nominated
      ) {
        result.bytesSent += item.bytesSent || 0;
        result.bytesReceived += item.bytesReceived || 0;
        result.local = stats.get(item.localCandidateId)?.candidateType;
        result.remote = stats.get(item.remoteCandidateId)?.candidateType;
      }
    });
    return result;
  }
  async leave() {
    if (this.closed) return;
    this.closed = true;
    this.password = null;
    this.peers.clear();
    await this.room?.leave();
    this.emit("disconnected", null);
  }
}
