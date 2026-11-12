import { randomPassword } from "./transfer-core.js";
import { TransferStore } from "./transfer-store.js";
import { TransferEngine } from "./transfer-engine.js";
import { TransferTransport } from "./transfer-transport.js";
const $ = (id) => document.getElementById(id);
const app = (window.transferApp = {
  store: null,
  engine: null,
  transport: null,
  busy: false,
  ready: false,
  records: [],
  pendingOffer: null,
  deleteId: null,
});
const recordBusy = new Set();
function recordProtected(id) {
  return (
    recordBusy.has(id) ||
    (app.engine?.incoming?.id === id &&
      ["offered", "transferring", "verifying"].includes(
        app.engine.incoming.state,
      ))
  );
}
function updateRecordActions() {
  for (const button of document.querySelectorAll("[data-delete]"))
    button.disabled = recordProtected(button.dataset.delete);
  for (const button of document.querySelectorAll("[data-download]"))
    button.disabled = recordBusy.has(button.dataset.download);
}
const states = {
  hashing: "正在校验原文件",
  offered: "等待接收确认",
  transferring: "正在传输",
  verifying: "正在校验",
  paused: "已暂停",
  rejected: "已拒绝",
  complete: "校验完成",
};
const bytes = (n) =>
  n < 1024
    ? `${n} B`
    : `${(n / 1024 ** (n < 1048576 ? 1 : n < 1073741824 ? 2 : 3)).toFixed(1)} ${n < 1048576 ? "KiB" : n < 1073741824 ? "MiB" : "GiB"}`;
const node = (tag, text, cls) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (cls) el.className = cls;
  return el;
};
function notice(text, error = false) {
  $("transferNotice").textContent = text;
  $("transferNotice").dataset.tone = error ? "error" : "";
}
function connection(text, ready = false) {
  $("connectionStatus").textContent = text;
  $("connectionStatus").dataset.ready = String(ready);
  $("chooseFile").disabled = !ready || !app.ready;
}
function lockConnection(locked) {
  for (const id of ["password", "strategy", "newPassword"])
    $(id).disabled = locked;
  $("connect").hidden = locked;
  $("disconnect").hidden = !locked;
}
async function run(fn) {
  try {
    await fn();
  } catch (e) {
    notice(e.message || "操作失败，请重试", true);
  }
}
let sample = { id: null, offset: 0, at: 0, speed: 0 };
function renderTask() {
  const task = app.engine?.current;
  const wrap = $("taskCurrent");
  wrap.replaceChildren();
  if (!task) {
    wrap.append(
      node("div", "连接后选择文件，接收方确认后开始。", "task-empty"),
    );
    return;
  }
  if (task.id !== sample.id || task.offset < sample.offset)
    sample = {
      id: task.id,
      offset: task.offset || 0,
      at: performance.now(),
      speed: 0,
    };
  const now = performance.now();
  if (now - sample.at >= 500) {
    sample.speed = Math.max(
      0,
      (task.offset - sample.offset) / ((now - sample.at) / 1000),
    );
    sample.offset = task.offset;
    sample.at = now;
  }
  const title = node("div", task.name, "task-title");
  title.title = task.name;
  wrap.append(title);
  const meta = node("div", undefined, "task-meta");
  meta.append(
    node(
      "span",
      (app.engine.outgoing === task ? "发送 · " : "接收 · ") +
        (states[task.state] || task.state),
    ),
    node(
      "span",
      task.state === "hashing"
        ? `${Math.round((task.hashProgress || 0) * 100)}%`
        : `${bytes(task.offset || 0)} / ${bytes(task.size)}`,
    ),
  );
  wrap.append(meta);
  const progress = node("progress");
  progress.max = task.size || 1;
  progress.value =
    task.state === "complete" ? task.size || 1 : task.offset || 0;
  progress.setAttribute("aria-label", "文件传输进度");
  wrap.append(progress);
  const actions = node("div", undefined, "task-actions");
  if (
    ["hashing", "offered", "transferring", "verifying"].includes(task.state)
  ) {
    const pause = node("button", "暂停", "secondary");
    pause.id = "pauseTransfer";
    pause.onclick = () => app.engine.pause();
    actions.append(pause);
  }
  if (task.state === "paused") {
    const resume = node("button", "继续", "primary");
    resume.id = "resumeTransfer";
    resume.disabled = !app.transport?.peer;
    resume.onclick = () =>
      run(() => {
        if (recordBusy.has(task.id)) throw Error("文件正在使用，请稍后继续");
        return app.engine.resume();
      });
    actions.append(resume);
  }
  if (task.state === "transferring")
    actions.append(node("span", bytes(sample.speed) + "/s", "status"));
  wrap.append(actions);
}
let refreshGeneration = 0;
async function refreshRecords() {
  const generation = ++refreshGeneration;
  const records = await app.store.list();
  if (generation !== refreshGeneration) return;
  app.records = records;
  const list = $("savedList");
  list.replaceChildren();
  for (const record of records) {
    const row = node("div", undefined, "saved-record");
    row.dataset.id = record.id;
    const copy = node("div", undefined, "record-copy");
    copy.append(
      node("h3", record.name),
      node(
        "p",
        `${bytes(record.offset)} / ${bytes(record.size)} · ${record.state === "complete" ? "校验完成" : "等待续传"}`,
      ),
    );
    const actions = node("div", undefined, "record-buttons");
    if (record.state === "complete") {
      const download = node("button", "保存", "secondary");
      download.dataset.download = record.id;
      download.onclick = () => run(() => downloadFile(record, download));
      actions.append(download);
    }
    const remove = node("button", "删除", "secondary");
    remove.dataset.delete = record.id;
    remove.onclick = () => {
      if (recordProtected(record.id)) return;
      app.deleteId = record.id;
      $("deleteName").textContent = record.name;
      $("deleteDialog").showModal();
    };
    actions.append(remove);
    row.append(copy, actions);
    list.append(row);
  }
  if (!records.length) list.append(node("div", "暂无接收文件", "task-empty"));
  updateRecordActions();
}
async function downloadFile(record, button) {
  if (recordBusy.has(record.id)) return;
  recordBusy.add(record.id);
  updateRecordActions();
  try {
    // Invoke the native picker before awaiting any storage operation (user activation).
    let handle;
    if (window.showSaveFilePicker) {
      try {
        handle = await showSaveFilePicker({ suggestedName: record.name });
      } catch (e) {
        if (e.name === "AbortError") return;
        throw e;
      }
    } else if (record.size > 256 * 1024 ** 2)
      throw Error("此文件请使用 Chrome 或 Edge 保存，避免占用过多内存");
    if (handle) {
      const writable = await handle.createWritable();
      try {
        for (let offset = 0; offset < record.size; offset += 4 * 1024 ** 2)
          await writable.write(
            await app.store.read(
              record.id,
              offset,
              Math.min(record.size, offset + 4 * 1024 ** 2),
            ),
          );
        await writable.close();
      } catch (e) {
        await writable.abort().catch(() => {});
        throw e;
      }
    } else {
      const blob = await app.store.blob(record.id),
        url = URL.createObjectURL(blob),
        a = node("a");
      a.href = url;
      a.download = record.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    notice("已保存 " + record.name);
  } finally {
    recordBusy.delete(record.id);
    updateRecordActions();
  }
}
function makeEngine() {
  const engine = (app.engine = new TransferEngine({
    store: app.store,
    sendControl: (data) => app.transport.sendControl(data),
    sendChunk: (data, meta) => app.transport.sendChunk(data, meta),
  }));
  engine.addEventListener("change", () => {
    renderTask();
    updateRecordActions();
    if (
      engine.current?.state === "complete" ||
      engine.current?.state === "paused"
    )
      refreshRecords().catch((e) => notice(e.message, true));
    if (app.pendingOffer && engine.incoming?.state !== "offered") {
      $("receiveDialog").close();
      app.pendingOffer = null;
    }
  });
  engine.addEventListener("notice", (e) => notice(e.detail, true));
  engine.addEventListener("offer", (e) => {
    app.pendingOffer = e.detail;
    $("offerName").textContent = e.detail.name;
    $("offerSize").textContent = bytes(e.detail.size);
    if (!$("receiveDialog").open) $("receiveDialog").showModal();
  });
  return engine;
}
async function disconnect() {
  const transport = app.transport;
  app.transport = null;
  app.busy = false;
  app.engine?.disconnected();
  if (transport) await transport.leave();
  connection("未连接");
  lockConnection(false);
  $("connectionNote").textContent = "进度已保留，可用相同密码重新连接。";
  await refreshRecords();
}
$("connect").onclick = () =>
  run(async () => {
    if (app.busy || !app.ready) return;
    if (!isSecureContext || !window.RTCPeerConnection || !crypto.subtle)
      throw Error("请使用支持 WebRTC 的 HTTPS 浏览器");
    app.busy = true;
    lockConnection(true);
    connection("正在连接");
    $("connectionNote").textContent = "正在连接信令…";
    const transport = (app.transport = new TransferTransport({
      password: $("password").value,
      via: $("strategy").value,
    }));
    transport.addEventListener("connected", () => {
      if (app.transport !== transport) return;
      app.engine.setConnected(true);
      connection("已直连", true);
      $("connectionNote").textContent = "另一台设备已连接";
      renderTask();
    });
    transport.addEventListener("disconnected", () => {
      if (app.transport !== transport) return;
      app.engine.disconnected();
      connection("等待重连");
      $("connectionNote").textContent = "设备已断开，已接收进度保留。";
    });
    transport.addEventListener("ready", () => {
      if (app.transport === transport && !transport.peer) {
        connection("等待设备");
        $("connectionNote").textContent = "在另一台设备输入相同密码并连接。";
      }
    });
    transport.addEventListener("notice", (e) => {
      if (app.transport === transport)
        $("connectionNote").textContent = e.detail;
    });
    transport.addEventListener("control", (e) => {
      if (app.transport === transport)
        run(() => app.engine.receiveControl(e.detail));
    });
    transport.addEventListener("chunk", (e) => {
      if (app.transport === transport)
        run(() => app.engine.receiveChunk(e.detail.bytes, e.detail.meta));
    });
    try {
      await transport.connect();
    } catch (e) {
      if (app.transport === transport) {
        app.transport = null;
        lockConnection(false);
        connection("连接失败");
        $("connectionNote").textContent = e.message || "连接失败，请重试";
      }
      throw e;
    } finally {
      if (!app.transport || app.transport === transport) app.busy = false;
    }
  });
$("disconnect").onclick = () => run(disconnect);
$("newPassword").onclick = () => {
  $("password").value = randomPassword();
};
$("showPassword").onclick = () => {
  const show = $("password").type === "password";
  $("password").type = show ? "text" : "password";
  $("showPassword").textContent = show ? "隐藏" : "显示";
  $("showPassword").setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
};
$("copyPassword").onclick = () =>
  run(async () => {
    await navigator.clipboard.writeText($("password").value);
    $("connectionNote").textContent = "密码已复制";
  });
$("chooseFile").onclick = () => $("files").click();
$("files").onchange = () => {
  const file = $("files").files[0];
  $("files").value = "";
  if (file)
    run(async () => {
      notice("");
      await app.engine.offer(file);
    });
};
$("acceptFile").onclick = () => {
  const offer = app.pendingOffer;
  if (!offer) return;
  if (recordBusy.has(offer.id)) {
    notice("文件正在保存或删除，请稍后接收", true);
    return;
  }
  $("receiveDialog").close();
  app.pendingOffer = null;
  run(() => app.engine.accept(offer.id));
};
$("rejectFile").onclick = () => {
  const offer = app.pendingOffer;
  $("receiveDialog").close();
  app.pendingOffer = null;
  if (offer) run(() => app.engine.reject(offer.id));
};
$("receiveDialog").addEventListener("cancel", (e) => {
  e.preventDefault();
  $("rejectFile").click();
});
$("cancelDelete").onclick = () => $("deleteDialog").close();
$("confirmDelete").onclick = () =>
  run(async () => {
    const id = app.deleteId;
    $("deleteDialog").close();
    if (id) {
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
    }
  });
window.addEventListener("pagehide", () => {
  app.engine?.close();
  app.transport?.leave().catch(() => {});
  app.store?.close();
});
$("password").value = randomPassword();
try {
  app.store = await new TransferStore().init();
  makeEngine();
  app.ready = true;
  $("storageMode").textContent =
    app.store.mode === "opfs" ? "本地磁盘缓存" : "浏览器缓存 · 单文件 256 MiB";
  await refreshRecords();
  document.body.dataset.ready = "true";
} catch (e) {
  notice(e.message || "无法创建本地接收缓存", true);
  $("connect").disabled = true;
}
