import { deriveConnection } from "./transfer-core.js";
const jsonSize = (value) =>
  new TextEncoder().encode(JSON.stringify(value)).byteLength;
export class TransferTransport extends EventTarget {
  constructor({ password, via = "mqtt" }) {
    super();
    this.password = password;
    this.via = via;
    this.closed = false;
    this.peer = null;
    this.room = null;
  }
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
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
        appId: "tools.manshii.asia/file-transfer/v1",
        identity: "none",
        password: connection.key,
        maxUsers: 2,
        maxReceiveBytes: 1024 * 1024,
        turnConfig: [],
        relayConfig: { redundancy: 4, warnOnRelayFailure: false },
      },
      connection.room,
    ));
    const control = (this.control = room.makeAction("control")),
      chunk = (this.chunk = room.makeAction("chunk"));
    control.onReceive(
      ({ peerId, byteLength }) => peerId === this.peer && byteLength <= 4096,
    );
    chunk.onReceive(
      ({ peerId, byteLength, metadata }) =>
        peerId === this.peer &&
        byteLength <= 262144 &&
        metadata &&
        jsonSize(metadata) <= 4096,
    );
    control.onMessage((data, { peerId }) => {
      if (
        peerId === this.peer &&
        data &&
        typeof data === "object" &&
        jsonSize(data) <= 4096
      )
        this.emit("control", data);
    });
    chunk.onMessage((bytes, { peerId, metadata }) => {
      if (
        peerId === this.peer &&
        bytes instanceof Uint8Array &&
        bytes.byteLength <= 262144
      )
        this.emit("chunk", { bytes, meta: metadata });
    });
    room.onPeerJoin(({ peerId }) => {
      if (this.closed || (this.peer && this.peer !== peerId)) return;
      this.peer = peerId;
      this.emit("connected", peerId);
    });
    room.onPeerLeave(({ peerId }) => {
      if (this.peer === peerId) {
        this.peer = null;
        this.emit("disconnected");
      }
    });
    room.onError((error) =>
      this.emit(
        "notice",
        {
          "room-full": "已有两台设备连接，请更换密码",
          "peer-connect-failed": "当前网络无法直连，请切换网络后重试",
          "relay-failed": "信令连接失败，可切换连接方式后重试",
          "decrypt-failed": "连接密码不匹配",
        }[error.code] || "连接出现中断，请重新连接",
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
    if (!this.closed) this.emit("ready");
  }
  async sendControl(data) {
    if (this.closed || !this.peer) throw Error("设备已断开");
    if (jsonSize(data) > 4096) throw Error("控制信息超出限制");
    await this.control.send(data, { target: this.peer });
  }
  async sendChunk(bytes, meta) {
    if (this.closed || !this.peer) throw Error("设备已断开");
    if (bytes.byteLength > 262144 || jsonSize(meta) > 4096)
      throw Error("文件块超出限制");
    await this.chunk.send(bytes, { target: this.peer, metadata: meta });
  }
  async stats() {
    const result = {
      state: this.peer ? "已直连" : "等待设备",
      bytesSent: 0,
      bytesReceived: 0,
      local: null,
      remote: null,
    };
    const peer = this.room?.getPeers()?.[this.peer];
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
    this.peer = null;
    await this.room?.leave();
    this.emit("disconnected");
  }
}
