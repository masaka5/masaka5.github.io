import { randomPassword } from "./transfer-core.js?v=20261117b";
import { TransferStore } from "./transfer-store.js?v=20261117b";
import { TransferEngine } from "./transfer-engine.js?v=20261117b";
import { TransferTransport, MAX_PEERS } from "./transfer-transport.js?v=20261117b";
import {
  TransferPreferences,
  TransferHistory,
  RememberedDevices,
  DestinationDirectory,
} from "./transfer-preferences.js?v=20261117b";

const $ = (id) => document.getElementById(id);
const app = (window.transferApp = {
  store: null,
  transport: null,
  engines: new Map(),
  queue: [],
  offers: [],
  pendingOffer: null,
  records: [],
  busy: false,
  ready: false,
  phase: "idle",
  strategy: "mqtt",
  deleteId: null,
  previewUrl: null,
  preferences: new TransferPreferences(),
  history: new TransferHistory(),
  devices: new RememberedDevices(),
  destination: new DestinationDirectory(),
  queueFiles: null,
});

const recordBusy = new Set();
const terminalStates = new Set([
  "complete",
  "rejected",
  "canceled",
  "failed",
]);
const activeStates = new Set([
  "hashing",
  "offered",
  "transferring",
  "verifying",
]);
const transferIconPaths = {
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" />',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" />',
  play: '<path d="m6 3 14 9-14 9V3Z" />',
  'switch-camera': '<path d="M8 7h8a4 4 0 0 1 4 4v1" /><path d="m17 4 3 3-3 3" /><path d="M16 17H8a4 4 0 0 1-4-4v-1" /><path d="m7 20-3-3 3-3" />',
};
const states = {
  hashing: "校验文件",
  offered: "等待接收",
  transferring: "传输中",
  verifying: "校验中",
  paused: "已暂停",
  rejected: "已拒绝",
  canceled: "已取消",
  failed: "失败",
  complete: "已完成",
  queued: "排队中",
};

const bytes = (value) => {
  const n = Number(value) || 0;
  if (n < 1024) return n <= 0 ? "0 B" : n.toFixed(0) + " B";
  const units = n < 1024 ** 2 ? ["KiB", 1] : n < 1024 ** 3 ? ["MiB", 2] : n < 1024 ** 4 ? ["GiB", 3] : ["TiB", 4];
  return (n / 1024 ** units[1]).toFixed(n < 10 * 1024 ** units[1] ? 1 : 0) + " " + units[0];
};
const speedText = (value) => (Number(value) > 0 ? bytes(value) + "/s" : "0 B/s");
const etaText = (task, speed) => {
  if (!speed || task.offset >= task.size) return "即将完成";
  const seconds = Math.max(1, Math.ceil((task.size - task.offset) / speed));
  if (seconds < 60) return seconds + " 秒";
  if (seconds < 3600) return Math.ceil(seconds / 60) + " 分钟";
  return Math.ceil(seconds / 3600) + " 小时";
};
const shortPeer = (peerId) => {
  if (!peerId) return "设备";
  const index = [...(app.transport?.peers.keys() || [])].indexOf(peerId);
  return index >= 0 ? "设备 " + (index + 1) : "离线设备";
};
const fileExtension = (name) => {
  const match = /\.([a-z0-9]{1,8})$/i.exec(name || "");
  return match ? match[1].toUpperCase() : "FILE";
};
function appendIcon(wrapper, name) {
  if (transferIconPaths[name]) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML = transferIconPaths[name];
    wrapper.append(svg);
    return;
  }
  if (window.ToolboxIcons) wrapper.append(window.ToolboxIcons.svg(name));
}
const icon = (name) => {
  const wrapper = document.createElement("span");
  wrapper.dataset.icon = name;
  appendIcon(wrapper, name);
  return wrapper;
};
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const iconButton = (name, label, className = "icon-button") => {
  const button = node("button", undefined, className);
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.append(icon(name));
  return button;
};
function decorateIcons(root = document) {
  for (const holder of root.querySelectorAll("[data-icon]")) {
    if (holder.firstElementChild) continue;
    appendIcon(holder, holder.dataset.icon);
  }
}
function notice(text, tone = "") {
  $("transferNotice").textContent = text || "";
  $("transferNotice").dataset.tone = tone;
}
function setConnectionPhase(phase, text, detail = "") {
  app.phase = phase;
  $("connectionStatus").dataset.state = phase;
  $("connectionStatusText").textContent = text;
  if (detail !== undefined) $("connectionNote").textContent = detail;
  renderConnection();
}
function setStrategy(value) {
  app.strategy = value === "nostr" ? "nostr" : "mqtt";
  for (const button of $("strategy").querySelectorAll("button"))
    button.setAttribute("aria-checked", String(button.dataset.value === app.strategy));
}
function renderConnection() {
  const count = app.transport?.peers.size || 0;
  $("peerCount").textContent =
    count > 0 ? count + " 台设备已连接" : app.phase === "connecting" ? "正在建立连接" : "等待设备加入";
  $("chooseFile").disabled = !app.ready || count === 0;
  $("chooseFolder").disabled = !app.ready || count === 0;
  $("saveDevice").disabled = count === 0;
  const labels = { idle: "未连接", connecting: "连接中", waiting: "等待设备", connected: count + " 台已连接", failed: "连接失败" };
  $("connectionStatusText").textContent = labels[app.phase] || labels.idle;
  $("networkDetail").textContent = app.transport
    ? "端到端直连 · 最多 " + (MAX_PEERS - 1) + " 台接收设备"
    : "信令只用于建立连接";
}
function lockConnection(locked) {
  $("password").disabled = locked;
  $("newPassword").disabled = locked;
  for (const button of $("strategy").querySelectorAll("button")) button.disabled = locked;
  $("connect").hidden = locked;
  $("disconnect").hidden = !locked;
}
async function run(operation) {
  try {
    return await operation();
  } catch (error) {
    notice(error?.message || "操作失败，请重试", "error");
    return undefined;
  }
}
function currentPeerIds() {
  return app.transport?.peerIds || [];
}

function recordProtected(id) {
  if (recordBusy.has(id)) return true;
  for (const engine of app.engines.values()) {
    if (
      engine.incoming?.id === id &&
      ["offered", "transferring", "verifying"].includes(engine.incoming.state)
    )
      return true;
  }
  return false;
}
function updateRecordActions() {
  for (const button of document.querySelectorAll("[data-delete]"))
    button.disabled = recordProtected(button.dataset.delete);
  for (const button of document.querySelectorAll("[data-download],[data-preview]"))
    button.disabled = recordBusy.has(button.dataset.download || button.dataset.preview);
}

let refreshGeneration = 0;
async function refreshRecords() {
  if (!app.store) return;
  const generation = ++refreshGeneration;
  const records = await app.store.list();
  if (generation !== refreshGeneration) return;
  app.records = records;
  const list = $("savedList");
  list.replaceChildren();
  for (const record of records) {
    const row = node("article", undefined, "saved-record");
    row.dataset.id = record.id;
    const main = node("div", undefined, "saved-main");
    const savedIcon = node("span", undefined, "saved-icon");
    savedIcon.append(icon(previewKind(record) ? "eye" : "file"));
    const copy = node("div", undefined, "saved-copy");
    copy.append(
      node("strong", record.name),
      node(
        "p",
        bytes(record.offset) + " / " + bytes(record.size) + " · " + (record.state === "complete" ? "SHA-256 已验证" : "等待续传"),
      ),
    );
    copy.firstElementChild.title = record.path || record.name;
    main.append(savedIcon, copy);
    const actions = node("div", undefined, "saved-actions");
    if (record.state === "complete") {
      if (previewKind(record)) {
        const preview = node("button", undefined, "secondary");
        preview.type = "button";
        preview.dataset.preview = record.id;
        preview.append(icon("eye"), document.createTextNode("预览"));
        preview.onclick = () => run(() => previewFile(record));
        actions.append(preview);
      }
      const download = node("button", undefined, "secondary");
      download.type = "button";
      download.dataset.download = record.id;
      download.append(icon("download"), document.createTextNode("保存"));
      download.onclick = () => run(() => downloadFile(record));
      actions.append(download);
    }
    const remove = iconButton("trash-2", "删除", "icon-button");
    remove.dataset.delete = record.id;
    remove.onclick = () => {
      if (recordProtected(record.id)) return;
      app.deleteId = record.id;
      $("deleteName").textContent = record.path || record.name;
      $("deleteDialog").showModal();
    };
    actions.append(remove);
    row.append(main, actions);
    list.append(row);
  }
  if (!records.length) {
    const empty = node("div", undefined, "empty-state compact");
    empty.append(icon("download"), node("strong", "暂无已接收文件"));
    list.append(empty);
  }
  updateRecordActions();
}

function previewKind(record) {
  const type = record.type || "";
  const ext = fileExtension(record.name).toLowerCase();
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp"].includes(ext)) return "image";
  if (type.startsWith("video/") || ["mp4", "webm", "mov", "m4v", "ogv"].includes(ext)) return "video";
  if (type.startsWith("text/") || ["txt", "md", "json", "xml", "csv", "log", "js", "ts", "css", "html", "yml", "yaml"].includes(ext)) return "text";
  return "";
}
async function previewFile(record) {
  const kind = previewKind(record);
  if (!kind) return;
  const blob = await app.store.blob(record.id);
  if (app.previewUrl) URL.revokeObjectURL(app.previewUrl);
  app.previewUrl = URL.createObjectURL(blob);
  const content = $("previewContent");
  content.replaceChildren();
  $("previewName").textContent = record.path || record.name;
  if (kind === "text") {
    const text = await blob.slice(0, 1024 * 1024).text();
    content.append(node("pre", text || "空文件"));
  } else if (kind === "image") {
    const image = node("img");
    image.src = app.previewUrl;
    image.alt = record.name;
    content.append(image);
  } else {
    const video = node("video");
    video.src = app.previewUrl;
    video.controls = true;
    video.playsInline = true;
    content.append(video);
  }
  $("previewDialog").showModal();
}
function closePreview() {
  if (app.previewUrl) URL.revokeObjectURL(app.previewUrl);
  app.previewUrl = null;
  $("previewContent").replaceChildren();
  $("previewDialog").close();
}

async function downloadFile(record) {
  if (recordBusy.has(record.id)) return;
  recordBusy.add(record.id);
  updateRecordActions();
  try {
    let customDirectory = false;
    try {
      customDirectory =
        !!app.destination.handle && (await app.destination.inspect(true));
    } catch {}
    if (customDirectory) {
      await app.destination.write(
        record,
        (start, end) => app.store.read(record.id, start, end),
      );
      notice("已保存到 " + app.destination.handle.name, "success");
      return;
    }
    let handle;
    if (window.showSaveFilePicker) {
      try {
        handle = await window.showSaveFilePicker({ suggestedName: record.name });
      } catch (error) {
        if (error.name === "AbortError") return;
        throw error;
      }
    } else if (record.size > 256 * 1024 ** 2) {
      throw Error("大文件请使用 Chrome 或 Edge 保存");
    }
    if (handle) {
      const writable = await handle.createWritable();
      try {
        for (let offset = 0; offset < record.size; offset += 4 * 1024 ** 2) {
          await writable.write(
            await app.store.read(record.id, offset, Math.min(record.size, offset + 4 * 1024 ** 2)),
          );
        }
        await writable.close();
      } catch (error) {
        await writable.abort().catch(() => {});
        throw error;
      }
    } else {
      const blob = await app.store.blob(record.id);
      const url = URL.createObjectURL(blob);
      const link = node("a");
      link.href = url;
      link.download = record.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    notice("已保存 " + record.name, "success");
  } finally {
    recordBusy.delete(record.id);
    updateRecordActions();
  }
}

function renderHistory() {
  const list = app.history.list();
  const wrap = $("historyList");
  wrap.replaceChildren();
  for (const item of list) {
    const row = node("article", undefined, "history-record");
    const direction = node("span", undefined, "history-direction");
    direction.dataset.direction = item.direction;
    direction.append(icon(item.direction === "receive" ? "download" : "upload"));
    const copy = node("div", undefined, "history-copy");
    copy.append(
      node("strong", item.name),
      node("span", new Date(item.at).toLocaleString("zh-CN", { hour12: false }) + " · " + bytes(item.size) + (item.peer ? " · " + item.peer : "")),
    );
    const state = node("span", item.state === "complete" ? "已完成" : states[item.state] || item.state, "history-state");
    if (item.hash) state.title = "SHA-256 " + item.hash;
    row.append(direction, copy, state);
    wrap.append(row);
  }
  if (!list.length) {
    const empty = node("div", undefined, "empty-state compact");
    empty.append(node("strong", "暂无记录"));
    wrap.append(empty);
  }
}

function renderDevices() {
  const list = app.devices.list();
  const wrap = $("deviceList");
  wrap.replaceChildren();
  for (const item of list) {
    const row = node("div", undefined, "device-row");
    const load = node("button", undefined, "device-copy");
    load.type = "button";
    load.append(node("strong", item.name), node("span", item.via.toUpperCase() + " · 使用 " + (item.uses || 1) + " 次"));
    load.onclick = () => {
      $("password").value = item.password;
      setStrategy(item.via);
      app.devices.touch(item.id);
      renderDevices();
      if (app.transport) return;
      $("connect").click();
    };
    const remove = iconButton("trash-2", "删除常用设备", "icon-button");
    remove.onclick = () => {
      app.devices.remove(item.id);
      renderDevices();
    };
    row.append(load, remove);
    wrap.append(row);
  }
  if (!list.length) wrap.append(node("div", "暂无常用设备", "empty-inline"));
}

const speedSamples = new WeakMap();
function taskSpeed(task) {
  const now = performance.now();
  let sample = speedSamples.get(task);
  if (!sample || task.offset < sample.offset) {
    sample = { offset: task.offset || 0, time: now, speed: 0 };
    speedSamples.set(task, sample);
  } else if (now - sample.time >= 500) {
    sample.speed = Math.max(0, (task.offset - sample.offset) / ((now - sample.time) / 1000));
    sample.offset = task.offset;
    sample.time = now;
  }
  return sample.speed;
}
function itemForTask(task) {
  return app.queue.find((item) => item.file === task.file);
}
function taskCard(task, engine, peerId, pendingItem = null) {
  const card = node("article", undefined, "task-card");
  const state = pendingItem ? "queued" : task.state;
  card.dataset.state = state;
  const top = node("div", undefined, "task-top");
  const fileIcon = node("span", undefined, "task-file-icon");
  fileIcon.append(icon("file"));

  const copy = node("div", undefined, "task-copy");
  const title = node("div", pendingItem ? pendingItem.path : task.path || task.name, "task-title");
  title.title = title.textContent;
  const subline = node("div", undefined, "task-subline");
  const direction = task && engine.incoming === task ? "接收" : "发送";
  const peer = peerId ? shortPeer(peerId) : "等待设备";
  subline.append(
    node("span", (pendingItem ? "发送" : direction) + " · " + peer + " · " + fileExtension(pendingItem?.path || task.name) + " · " + bytes(pendingItem?.file.size || task.size)),
  );
  if (!pendingItem && task.state === "complete" && task.hash)
    subline.append(node("span", "SHA-256 " + task.hash.slice(0, 10) + "…", "state-chip"));
  else subline.append(node("span", states[state] || state, "state-chip"));
  copy.append(title, subline);

  const actions = node("div", undefined, "task-actions");
  if (!pendingItem) {
    if (activeStates.has(task.state)) {
      const pause = iconButton("pause", "暂停");
      pause.disabled = !app.transport?.hasPeer(peerId);
      pause.onclick = () => engine.pause();
      actions.append(pause);
    }
    if (task.state === "paused") {
      const resume = iconButton("play", "继续");
      resume.disabled = !app.transport?.hasPeer(peerId);
      resume.onclick = () => run(() => {
        if (recordBusy.has(task.id)) throw Error("文件正在使用，请稍后继续");
        return engine.resume();
      });
      actions.append(resume);
    }
    if (activeStates.has(task.state) || task.state === "paused") {
      const cancel = iconButton("x", "取消");
      cancel.onclick = () => run(() => cancelTask(task, engine));
      actions.append(cancel);
    }
    if (terminalStates.has(task.state)) {
      const dismiss = iconButton("x", "移除任务");
      dismiss.onclick = () => {
        if (engine.latest === task) engine.latest = null;
        if (task === engine.incoming) engine.incoming = null;
        if (task === engine.outgoing) engine.outgoing = null;
        engine.changed();
      };
      actions.append(dismiss);
    }
  } else {
    const cancel = iconButton("x", "移出队列");
    cancel.onclick = () => run(() => cancelQueueItem(pendingItem));
    actions.append(cancel);
  }
  top.append(fileIcon, copy, actions);

  const info = progressInfo(pendingItem ? null : task, pendingItem);
  const progress = node("div", undefined, "task-progress");
  const bar = node("progress");
  bar.max = info.total || 1;
  bar.value = info.state === "complete" ? info.total || 1 : info.current;
  bar.setAttribute("aria-label", "传输进度");
  progress.append(bar, node("span", info.meta));
  card.append(top, progress);
  return card;
}
function progressInfo(task, pendingItem = null) {
  const state = pendingItem ? "queued" : task.state;
  const current = pendingItem ? pendingItem.hashProgress || 0 : task.offset || 0;
  const total = pendingItem ? pendingItem.file.size : task.size || 1;
  let meta = "";
  if (pendingItem) {
    meta = pendingItem.hash ? "准备发送" : Math.round((pendingItem.hashProgress || 0) * 100) + "%";
  } else if (state === "hashing") {
    meta = Math.round((task.hashProgress || 0) * 100) + "%";
  } else if (state === "offered") {
    meta = "等待接收";
  } else if (state === "verifying") {
    meta = "校验中";
  } else if (state === "complete") {
    meta = "SHA-256 已校验";
  } else {
    const speed = taskSpeed(task);
    meta = state === "paused" ? bytes(task.offset) + " / " + bytes(task.size) : speedText(speed) + " · " + etaText(task, speed);
  }
  return { current, total, meta, state };
}
function updateTaskCard(card, task, pendingItem = null) {
  const info = progressInfo(task, pendingItem);
  const bar = card.querySelector("progress");
  if (bar) {
    bar.max = info.total || 1;
    bar.value = info.state === "complete" ? info.total || 1 : info.current;
  }
  const meta = card.querySelector(".task-progress span");
  if (meta) meta.textContent = info.meta;
}
function renderTasks() {
  const entries = [];
  for (const [peerId, engine] of app.engines) {
    if (!engine.current) continue;
    entries.push({
      key: "task:" + peerId + ":" + engine.current.token,
      task: engine.current,
      engine,
      peerId,
    });
  }
  const activeFiles = new Set(
    [...app.engines.values()]
      .flatMap((engine) => [engine.outgoing?.file, engine.incoming?.file])
      .filter(Boolean),
  );
  for (const item of app.queue) {
    if (item.canceled || item.completed.size >= item.targets.size || activeFiles.has(item.file)) continue;
    entries.push({ key: "queue:" + item.id, pendingItem: item });
  }

  const signature = entries
    .map((entry) =>
      entry.pendingItem
        ? entry.key + ":queued"
        : entry.key + ":" + entry.task.state + ":" + entry.task.hash + ":" + entry.task.path,
    )
    .join("|");
  const list = $("taskList");
  const pendingItems = app.queue.filter((item) => !item.canceled && item.completed.size < item.targets.size);
  const total = pendingItems.reduce((sum, item) => sum + item.file.size, 0);
  $("queueSummary").textContent = (entries.length || pendingItems.length) + " 项 · " + bytes(total);

  if (app.taskSignature === signature && app.taskNodes) {
    for (const entry of entries) updateTaskCard(app.taskNodes.get(entry.key), entry.task, entry.pendingItem);
    return;
  }
  app.taskSignature = signature;
  app.taskNodes = new Map();
  list.replaceChildren();
  for (const entry of entries) {
    const card = entry.pendingItem
      ? taskCard(null, null, null, entry.pendingItem)
      : taskCard(entry.task, entry.engine, entry.peerId);
    app.taskNodes.set(entry.key, card);
    list.append(card);
  }
  if (!entries.length) {
    const empty = node("div", undefined, "empty-state");
    empty.append(icon("files"), node("strong", "暂无传输任务"), node("p", "连接后添加文件"));
    list.append(empty);
  }
}

async function cancelTask(task, engine) {
  if (!task || !engine) return;
  await engine.cancel();
  const item = itemForTask(task);
  if (item && item.completed.size + 1 >= item.targets.size) {
    item.canceled = true;
  }
}
async function cancelQueueItem(item) {
  const tasks = [];
  for (const [peerId, engine] of app.engines) {
    if (engine.current?.file === item.file) tasks.push(cancelTask(engine.current, engine));
  }
  await Promise.allSettled(tasks);
  item.canceled = true;
  renderTasks();
}

function makeEngine(peerId) {
  const existing = app.engines.get(peerId);
  if (existing) return existing;
  const engine = new TransferEngine({
    store: app.store,
    sendControl: (data) => app.transport.sendControl(data, peerId),
    sendChunk: (bytes, meta) => app.transport.sendChunk(bytes, meta, peerId),
  });
  engine.setConnected(true);
  app.engines.set(peerId, engine);
  engine.addEventListener("change", () => handleEngineChange(engine, peerId));
  engine.addEventListener("notice", (event) => notice(event.detail, "error"));
  engine.addEventListener("offer", (event) => {
    const offer = { engine, task: event.detail, peerId };
    app.offers.push(offer);
    if (app.preferences.autoAccept()) acceptOffer(offer);
    else showNextOffer();
  });
  return engine;
}
function logTask(task, direction, peerId) {
  if (!task || task.historyLogged) return;
  task.historyLogged = true;
  app.history.add({
    name: task.name,
    path: task.path,
    size: task.size,
    hash: task.hash,
    direction,
    state: task.state,
    peer: shortPeer(peerId),
  });
  renderHistory();
}
async function handleEngineChange(engine, peerId) {
  const task = engine.current;
  if (!task) return;
  if (engine.outgoing === task) {
    const item = itemForTask(task);
    if (task.state === "complete") {
      item?.completed.add(peerId);
      logTask(task, "send", peerId);
      pumpPeer(peerId);
    } else if (["rejected", "canceled"].includes(task.state)) {
      item?.completed.add(peerId);
      logTask(task, "send", peerId);
      pumpPeer(peerId);
    }
  }
  if (engine.incoming === task && task.state === "complete") {
    logTask(task, "receive", peerId);
    await refreshRecords().catch((error) => notice(error.message, "error"));
  }
  if (task.state === "paused" && !app.transport?.hasPeer(peerId)) {
    notice("设备已断开，进度已保留", "error");
  }
  renderTasks();
  updateRecordActions();
}

function showNextOffer() {
  if (app.pendingOffer || !app.offers.length) return;
  const offer = app.offers.shift();
  if (!offer || offer.task.state !== "offered") {
    showNextOffer();
    return;
  }
  app.pendingOffer = offer;
  $("offerName").textContent = offer.task.path || offer.task.name;
  $("offerMeta").textContent = bytes(offer.task.size) + " · " + (offer.task.type || fileExtension(offer.task.name));
  $("offerFrom").textContent = shortPeer(offer.peerId);
  if (!$("receiveDialog").open) $("receiveDialog").showModal();
}
async function acceptOffer(offer) {
  if (!offer || offer.task.state !== "offered") return;
  app.offers = app.offers.filter((item) => item !== offer);
  if (app.pendingOffer === offer) app.pendingOffer = null;
  if ($("receiveDialog").open) $("receiveDialog").close();
  await offer.engine.accept(offer.task.id);
  showNextOffer();
}
async function rejectOffer(offer) {
  if (!offer) return;
  app.offers = app.offers.filter((item) => item !== offer);
  if (app.pendingOffer === offer) app.pendingOffer = null;
  if ($("receiveDialog").open) $("receiveDialog").close();
  await offer.engine.reject(offer.task.id);
  showNextOffer();
}

function addQueueItem(file, path) {
  const item = {
    id: crypto.randomUUID?.() || String(Date.now()) + Math.random(),
    file,
    path: path || file.webkitRelativePath || file.name,
    targets: new Set(currentPeerIds()),
    completed: new Set(),
    canceled: false,
    hash: "",
    hashProgress: 0,
    hashPromise: null,
  };
  item.hashPromise = app.store
    .hashFile(file, (progress) => {
      item.hashProgress = progress;
      renderTasks();
    })
    .then((hash) => {
      item.hash = hash;
      item.hashProgress = 1;
      pumpAll();
      renderTasks();
      return hash;
    })
    .catch((error) => {
      item.canceled = true;
      notice(error.message || "文件校验失败", "error");
      renderTasks();
      throw error;
    });
  return item;
}
async function queueFiles(entries) {
  if (!currentPeerIds().length) throw Error("请先连接接收设备");
  const valid = entries.filter((entry) => entry?.file instanceof Blob && entry.file.size >= 0);
  if (!valid.length) return 0;
  const items = valid.map((entry) => addQueueItem(entry.file, entry.path));
  app.queue.push(...items);
  notice("已加入 " + items.length + " 项", "success");
  renderTasks();
  pumpAll();
  return items.length;
}
app.queueFiles = queueFiles;

async function pumpPeer(peerId) {
  if (!app.transport?.hasPeer(peerId)) return;
  const engine = makeEngine(peerId);
  if (engine.current && engine.current.state !== "complete" && engine.current.state !== "rejected" && engine.current.state !== "canceled")
    return;
  const item = app.queue.find(
    (entry) =>
      entry.targets.has(peerId) &&
      !entry.canceled &&
      !entry.completed.has(peerId),
  );
  if (!item || item.dispatching?.has(peerId)) return;
  item.dispatching ||= new Set();
  item.dispatching.add(peerId);
  try {
    const hash = await item.hashPromise;
    if (!hash || !app.transport?.hasPeer(peerId) || engine.current?.state === "transferring") return;
    if (engine.current && !terminalStates.has(engine.current.state)) return;
    if (engine.current) {
      engine.outgoing = null;
      engine.incoming = null;
      engine.latest = null;
    }
    await engine.offer(item.file, { hash, path: item.path });
  } catch (error) {
    notice(error.message || "发送失败", "error");
  } finally {
    item.dispatching.delete(peerId);
  }
}
function pumpAll() {
  for (const peerId of currentPeerIds()) pumpPeer(peerId);
}

function readEntry(entry, output = []) {
  return new Promise((resolve, reject) => {
    if (entry.isFile) {
      entry.file(
        (file) => {
          output.push({ file, path: entry.fullPath?.replace(/^\//, "") || file.name });
          resolve(output);
        },
        reject,
      );
      return;
    }
    if (!entry.isDirectory) {
      resolve(output);
      return;
    }
    const reader = entry.createReader();
    const readBatch = () =>
      reader.readEntries(async (entries) => {
        if (!entries.length) {
          resolve(output);
          return;
        }
        await Promise.all(entries.map((child) => readEntry(child, output)));
        readBatch();
      }, reject);
    readBatch();
  });
}
async function droppedEntries(dataTransfer) {
  const items = [...(dataTransfer.items || [])].filter((item) => item.kind === "file");
  if (!items.length) return [...dataTransfer.files].map((file) => ({ file, path: file.name }));
  const roots = items.map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
  if (!roots.length) return [...dataTransfer.files].map((file) => ({ file, path: file.name }));
  const output = [];
  for (const entry of roots) await readEntry(entry, output);
  return output;
}

async function connect() {
  if (app.busy || !app.ready || app.transport) return;
  if (!isSecureContext || !window.RTCPeerConnection || !crypto.subtle)
    throw Error("请使用支持 WebRTC 的 HTTPS 浏览器");
  const password = $("password").value;
  if (password.length < 12) throw Error("连接密码至少 12 个字符");
  app.busy = true;
  lockConnection(true);
  setConnectionPhase("connecting", "连接中", "正在连接信令…");
  const transport = (app.transport = new TransferTransport({ password, via: app.strategy }));
  transport.addEventListener("connected", (event) => {
    if (app.transport !== transport) return;
    makeEngine(event.detail);
    for (const item of app.queue) {
      if (!item.canceled && item.completed.size < item.targets.size) item.targets.add(event.detail);
    }
    setConnectionPhase("connected", "已连接", "设备已连接，开始传输", "success");
    pumpPeer(event.detail);
  });
  transport.addEventListener("disconnected", (event) => {
    if (app.transport !== transport) return;
    if (!event.detail) {
      setConnectionPhase("idle", "未连接");
      return;
    }
    app.engines.get(event.detail)?.disconnected();
    if (transport.peers.size) setConnectionPhase("connected", "已连接", "一台设备已断开");
    else setConnectionPhase("waiting", "等待设备", "等待设备重新加入");
  });
  transport.addEventListener("ready", () => {
    if (app.transport !== transport) return;
    if (transport.peers.size) setConnectionPhase("connected", "已连接", "设备已连接", "success");
    else setConnectionPhase("waiting", "等待设备", "分享密码或二维码给另一台设备");
  });
  transport.addEventListener("notice", (event) => {
    if (app.transport === transport) {
      $("connectionNote").textContent = event.detail;
      notice(event.detail, "error");
    }
  });
  transport.addEventListener("control", (event) => {
    if (app.transport !== transport) return;
    const engine = makeEngine(event.detail.peerId);
    run(() => engine.receiveControl(event.detail.data));
  });
  transport.addEventListener("chunk", (event) => {
    if (app.transport !== transport) return;
    const engine = makeEngine(event.detail.peerId);
    run(() => engine.receiveChunk(event.detail.bytes, event.detail.meta));
  });
  try {
    await transport.connect();
  } catch (error) {
    if (app.transport === transport) {
      app.transport = null;
      lockConnection(false);
      setConnectionPhase("failed", "连接失败", error.message || "连接失败，请重试");
    }
    throw error;
  } finally {
    app.busy = false;
  }
}

async function disconnect() {
  const transport = app.transport;
  app.transport = null;
  app.busy = false;
  for (const engine of app.engines.values()) engine.disconnected();
  if (transport) await transport.leave();
  lockConnection(false);
  setConnectionPhase("idle", "未连接", "进度已保留，可重新连接");
  renderTasks();
}

function pairUrl() {
  const url = new URL(location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("pair", $("password").value);
  url.searchParams.set("via", app.strategy);
  url.searchParams.set("auto", "1");
  return url.toString();
}
async function showPair() {
  const url = pairUrl();
  $("pairLink").textContent = url.replace(/pair=[^&]+/, "pair=••••••");
  $("pairDialog").showModal();
  try {
    if (!window.QRCode) throw Error("二维码组件未加载");
    await window.QRCode.toCanvas($("pairCanvas"), url, {
      width: 232,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  } catch (error) {
    $("pairDialog").close();
    notice(error.message || "二维码生成失败", "error");
  }
}
const cameraScanner = {
  stream: null,
  running: false,
  generation: 0,
  detector: null,
  decoderKind: "",
  front: false,
  canvas: document.createElement("canvas"),
  context: null,
};
function scanStatus(text, tone = "") {
  const target = $("scanStatus");
  target.textContent = text || "";
  target.dataset.tone = tone;
}
function stopCameraScanner() {
  cameraScanner.running = false;
  cameraScanner.generation++;
  cameraScanner.stream?.getTracks().forEach((track) => track.stop());
  cameraScanner.stream = null;
  const video = $("scanVideo");
  if (video) video.srcObject = null;
  if ($("scannerStart")) $("scannerStart").hidden = false;
}
function pairValuesFromUrl(raw) {
  let url;
  try {
    url = new URL(raw, location.origin);
  } catch {
    throw Error("连接码格式无效");
  }
  if (url.origin !== location.origin || !url.pathname.includes("/tools/file-transfer/"))
    throw Error("不是有效的文件直传连接码");
  const password = url.searchParams.get("pair") || "";
  if (password.length < 12 || password.length > 128)
    throw Error("连接码中的密码无效");
  return { password, via: url.searchParams.get("via") === "nostr" ? "nostr" : "mqtt" };
}
function acceptPairCode(raw) {
  if (app.transport) throw Error("请先断开当前连接");
  const pair = pairValuesFromUrl(raw);
  $("password").value = pair.password;
  setStrategy(pair.via);
  $("scanDialog").close();
  stopCameraScanner();
  notice("连接码已识别", "success");
  if (navigator.vibrate) navigator.vibrate(45);
  setTimeout(() => {
    if (!app.transport) $("connect").click();
  }, 180);
}
async function cameraDevices() {
  let devices = [];
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch {}
  const selected = $("cameraSelect").value;
  $("cameraSelect").replaceChildren();
  const fallback = node("option", "后置 / 默认摄像头");
  fallback.value = "";
  $("cameraSelect").append(fallback);
  for (const [index, device] of devices.filter((item) => item.kind === "videoinput").entries()) {
    const option = node("option", device.label || "摄像头 " + (index + 1));
    option.value = device.deviceId;
    $("cameraSelect").append(option);
  }
  if ([...$("cameraSelect").options].some((option) => option.value === selected))
    $("cameraSelect").value = selected;
}
async function prepareScannerDecoder() {
  if (cameraScanner.detector) return cameraScanner.detector;
  if ("BarcodeDetector" in window) {
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats?.();
      if (!formats || formats.includes("qr_code")) {
        cameraScanner.detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        cameraScanner.decoderKind = "native";
        return cameraScanner.detector;
      }
    } catch {}
  }
  const decoder = window.ZXingWASM;
  if (!decoder) throw Error("浏览器不支持摄像头解码");
  const wasmUrl = new URL("../../vendor/zxing/zxing_reader.wasm", import.meta.url);
  decoder.prepareZXingModule({
    overrides: {
      locateFile: (file) => new URL("../../vendor/zxing/" + file, import.meta.url).href,
    },
  });
  const response = await fetch(wasmUrl, { cache: "force-cache" });
  if (!response.ok) throw Error("扫码组件加载失败");
  cameraScanner.detector = decoder;
  cameraScanner.decoderKind = "zxing";
  return decoder;
}
async function scanVideoFrame() {
  const video = $("scanVideo");
  if (!video.videoWidth || !video.videoHeight) return "";
  if (cameraScanner.decoderKind === "native") {
    const results = await cameraScanner.detector.detect(video);
    return results.find((item) => item.rawValue)?.rawValue || "";
  }
  const ratio = Math.min(1, 960 / video.videoWidth);
  cameraScanner.canvas.width = Math.max(1, Math.round(video.videoWidth * ratio));
  cameraScanner.canvas.height = Math.max(1, Math.round(video.videoHeight * ratio));
  cameraScanner.context ||= cameraScanner.canvas.getContext("2d", {
    willReadFrequently: true,
  });
  cameraScanner.context.drawImage(
    video,
    0,
    0,
    cameraScanner.canvas.width,
    cameraScanner.canvas.height,
  );
  const results = await cameraScanner.detector.readBarcodesFromImageData(
    cameraScanner.context.getImageData(
      0,
      0,
      cameraScanner.canvas.width,
      cameraScanner.canvas.height,
    ),
    { formats: ["QRCode"], tryHarder: true, maxNumberOfSymbols: 1 },
  );
  return results.find((item) => item.text)?.text || "";
}
async function scannerLoop(token) {
  if (!cameraScanner.running || token !== cameraScanner.generation) return;
  try {
    const value = await scanVideoFrame();
    if (token !== cameraScanner.generation) return;
    if (value) {
      acceptPairCode(value);
      return;
    }
  } catch (error) {
    if (cameraScanner.decoderKind !== "zxing" && window.ZXingWASM) {
      cameraScanner.detector = null;
      cameraScanner.decoderKind = "";
      try {
        await prepareScannerDecoder();
      } catch (fallbackError) {
        stopCameraScanner();
        scanStatus(fallbackError.message || "扫码组件加载失败", "error");
        return;
      }
    } else {
      stopCameraScanner();
      scanStatus(error.message || "扫码失败，请调整码面后重试", "error");
      return;
    }
  }
  if (cameraScanner.running && token === cameraScanner.generation)
    setTimeout(() => scannerLoop(token), 220);
}
async function startCameraScanner() {
  if (!$("scanDialog").open) $("scanDialog").showModal();
  stopCameraScanner();
  const token = ++cameraScanner.generation;
  scanStatus("正在启动摄像头…");
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia)
    throw Error("摄像头需要 HTTPS 浏览器");
  const deviceId = $("cameraSelect").value;
  const constraints = deviceId
    ? { audio: false, video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } } }
    : {
        audio: false,
        video: {
          facingMode: { ideal: cameraScanner.front ? "user" : "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    $("scannerStart").hidden = false;
    const messages = {
      NotAllowedError: "摄像头权限未开启",
      NotFoundError: "未找到可用摄像头",
      NotReadableError: "摄像头正被其他应用占用",
      OverconstrainedError: "当前摄像头不支持所需分辨率",
    };
    const message = messages[error?.name] || "无法启动摄像头";
    scanStatus(message, "error");
    throw Error(message);
  }
  if (token !== cameraScanner.generation) {
    stream.getTracks().forEach((track) => track.stop());
    return;
  }
  cameraScanner.stream = stream;
  const video = $("scanVideo");
  video.srcObject = stream;
  try {
    await video.play().catch(() => {});
    $("scannerStart").hidden = true;
    await prepareScannerDecoder();
    if (token !== cameraScanner.generation) {
      stopCameraScanner();
      return;
    }
    await cameraDevices();
    cameraScanner.running = true;
    scanStatus("对准二维码即可自动连接");
    scannerLoop(token);
  } catch (error) {
    stopCameraScanner();
    scanStatus(error.message || "扫码组件启动失败", "error");
    throw error;
  }
}

function applyTheme(theme) {
  const value = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = value;
  app.preferences.setTheme(value);
  $("darkMode").checked = value === "dark";
  const holder = $("themeToggle");
  holder.replaceChildren(icon(value === "dark" ? "sun" : "moon"));
}
function switchTab(name) {
  for (const button of document.querySelectorAll(".tabs button"))
    button.setAttribute("aria-selected", String(button.dataset.tab === name));
  for (const panel of document.querySelectorAll(".tab-panel"))
    panel.hidden = panel.dataset.panel !== name;
}
function initializeQueryPair() {
  const params = new URLSearchParams(location.search);
  if (!params.has("pair")) return false;
  try {
    const pair = pairValuesFromUrl(location.href);
    $("password").value = pair.password;
    setStrategy(pair.via);
  } catch {
    return false;
  }
  const auto = params.get("auto") === "1";
  params.delete("pair");
  params.delete("via");
  params.delete("auto");
  const query = params.toString();
  history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
  return auto;
}

$("newPassword").onclick = () => { $("password").value = randomPassword(); };
$("showPassword").onclick = () => {
  const show = $("password").type === "password";
  $("password").type = show ? "text" : "password";
  const button = $("showPassword");
  button.replaceChildren(icon(show ? "eye" : "eye-off"));
  button.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
};
$("copyPassword").onclick = () => run(async () => {
  await navigator.clipboard.writeText($("password").value);
  $("connectionNote").textContent = "密码已复制";
});
$("showPair").onclick = () => run(showPair);
$("scanPair").onclick = () => run(async () => {
  if (app.transport) throw Error("请先断开当前连接");
  await startCameraScanner();
});
$("closeScan").onclick = () => {
  stopCameraScanner();
  $("scanDialog").close();
};
$("cancelScan").onclick = () => {
  stopCameraScanner();
  $("scanDialog").close();
};
$("scanDialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  stopCameraScanner();
  $("scanDialog").close();
});
$("switchCamera").onclick = () => run(async () => {
  const options = [...$("cameraSelect").options];
  if (options.length > 1) {
    const current = Math.max(0, options.findIndex((option) => option.value === $("cameraSelect").value));
    $("cameraSelect").value = options[(current + 1) % options.length].value;
  } else {
    cameraScanner.front = !cameraScanner.front;
  }
  await startCameraScanner();
});
$("cameraSelect").onchange = () => run(startCameraScanner);
$("pairConnect").onclick = () => {
  $("pairDialog").close();
  if (!app.transport) $("connect").click();
};
$("closePair").onclick = () => $("pairDialog").close();
$("copyPair").onclick = () => run(async () => {
  await navigator.clipboard.writeText(pairUrl());
  notice("配对链接已复制", "success");
});
$("strategy").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value]");
  if (button && !button.disabled) setStrategy(button.dataset.value);
});
$("connect").onclick = () => run(connect);
$("disconnect").onclick = () => run(disconnect);
$("chooseFile").onclick = () => $("files").click();
$("chooseFolder").onclick = () => $("folder").click();
$("files").onchange = () => {
  const entries = [...$("files").files].map((file) => ({ file, path: file.name }));
  $("files").value = "";
  run(() => queueFiles(entries));
};
$("folder").onchange = () => {
  const entries = [...$("folder").files].map((file) => ({ file, path: file.webkitRelativePath || file.name }));
  $("folder").value = "";
  run(() => queueFiles(entries));
};
$("dropZone").onclick = () => $("files").click();
$("dropZone").onkeydown = (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    $("files").click();
  }
};
let pageDragDepth = 0;
function containsFiles(dataTransfer) {
  return [...(dataTransfer?.types || [])].includes("Files");
}
function resetPageDrag() {
  pageDragDepth = 0;
  $("globalDropOverlay").hidden = true;
  $("dropZone").classList.remove("is-over");
}
window.addEventListener("dragenter", (event) => {
  if (!containsFiles(event.dataTransfer)) return;
  event.preventDefault();
  pageDragDepth++;
  $("globalDropOverlay").hidden = false;
  $("dropZone").classList.add("is-over");
});
window.addEventListener("dragover", (event) => {
  if (!containsFiles(event.dataTransfer)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});
window.addEventListener("dragleave", (event) => {
  if (!containsFiles(event.dataTransfer)) return;
  pageDragDepth = Math.max(0, pageDragDepth - 1);
  if (!pageDragDepth) resetPageDrag();
});
window.addEventListener("drop", (event) => {
  if (!containsFiles(event.dataTransfer)) return;
  event.preventDefault();
  resetPageDrag();
  run(async () => {
    const entries = await droppedEntries(event.dataTransfer);
    if (entries.length) await queueFiles(entries);
  });
});
window.addEventListener("dragend", resetPageDrag);
document.addEventListener("paste", (event) => {
  const clipboard = event.clipboardData;
  const files = [];
  for (const item of clipboard?.items || []) {
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (file) files.push(file);
  }
  for (const file of clipboard?.files || []) {
    if (file.type.startsWith("image/") && !files.some((item) => item.name === file.name && item.size === file.size))
      files.push(file);
  }
  if (!files.length) return;
  event.preventDefault();
  const entries = files.map((file, index) => {
    const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]?.replace("+xml", "") || "png";
    const name = file.name || "剪贴板图片-" + Date.now() + "-" + index + "." + extension;
    return { file: new File([file], name, { type: file.type }), path: name };
  });
  run(() => queueFiles(entries));
});

$("acceptFile").onclick = () => {
  if (!app.pendingOffer) return;
  run(() => acceptOffer(app.pendingOffer));
};
$("rejectFile").onclick = () => {
  if (app.pendingOffer) run(() => rejectOffer(app.pendingOffer));
};
$("closeReceive").onclick = () => {
  if (app.pendingOffer) run(() => rejectOffer(app.pendingOffer));
};
$("receiveDialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  if (app.pendingOffer) run(() => rejectOffer(app.pendingOffer));
});

$("saveDevice").onclick = () => {
  if (!app.transport) return;
  $("deviceName").value = "";
  $("saveDeviceDialog").showModal();
  $("deviceName").focus();
};
$("confirmSaveDevice").onclick = () => run(async () => {
  app.devices.save({ name: $("deviceName").value, password: $("password").value, via: app.strategy });
  $("saveDeviceDialog").close();
  renderDevices();
  notice("已保存常用设备", "success");
});
$("cancelSaveDevice").onclick = () => $("saveDeviceDialog").close();
$("closeSaveDevice").onclick = () => $("saveDeviceDialog").close();
$("deviceName").addEventListener("keydown", (event) => {
  if (event.key === "Enter") $("confirmSaveDevice").click();
});

for (const button of document.querySelectorAll(".tabs button"))
  button.onclick = () => switchTab(button.dataset.tab);
$("clearHistory").onclick = () => {
  if (!confirm("清空全部传输记录？")) return;
  app.history.clear();
  renderHistory();
};
$("autoAccept").onchange = () => {
  app.preferences.setAutoAccept($("autoAccept").checked);
  if ($("autoAccept").checked)
    for (const offer of [...app.offers]) acceptOffer(offer).catch((error) => notice(error.message, "error"));
};
$("darkMode").onchange = () => applyTheme($("darkMode").checked ? "dark" : "light");
$("themeToggle").onclick = () =>
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
$("chooseDestination").onclick = () => run(async () => {
  const name = await app.destination.choose();
  $("destinationName").textContent = name;
  notice("接收目录：" + name, "success");
});

$("closePreview").onclick = closePreview;
$("previewDialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  closePreview();
});
$("cancelDelete").onclick = () => $("deleteDialog").close();
$("confirmDelete").onclick = () => run(async () => {
  const id = app.deleteId;
  $("deleteDialog").close();
  if (!id) return;
  if (recordProtected(id)) throw Error("文件正在使用，请暂停后再删除");
  recordBusy.add(id);
  updateRecordActions();
  try {
    await app.store.remove(id);
    await refreshRecords();
  } finally {
    recordBusy.delete(id);
    updateRecordActions();
  }
});

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  stopCameraScanner();
  for (const engine of app.engines.values()) engine.close();
  app.transport?.leave().catch(() => {});
  app.store?.close();
});

decorateIcons();
applyTheme(app.preferences.theme());
$("autoAccept").checked = app.preferences.autoAccept();
$("password").value = randomPassword();
renderDevices();
renderHistory();
renderTasks();
const autoConnect = initializeQueryPair();
try {
  app.store = await new TransferStore().init();
  app.ready = true;
  $("storageMode").textContent = app.store.mode === "opfs" ? "设备缓存" : "浏览器缓存";
  const destinationName = await app.destination.restore();
  $("destinationName").textContent = destinationName || "浏览器默认下载位置";
  if (!window.showDirectoryPicker) {
    $("chooseDestination").disabled = true;
    $("chooseDestination").textContent = "浏览器下载";
  }
  await refreshRecords();
  renderConnection();
  document.body.dataset.ready = "true";
  if (autoConnect)
    setTimeout(() => {
      if (!app.transport) $("connect").click();
    }, 180);
} catch (error) {
  notice(error.message || "无法创建本地接收缓存", "error");
  $("connect").disabled = true;
}
