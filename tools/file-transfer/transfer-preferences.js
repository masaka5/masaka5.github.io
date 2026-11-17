const HISTORY_KEY = "toolbox-file-transfer-history-v2";
const DEVICES_KEY = "toolbox-file-transfer-devices-v2";
const SETTINGS_KEY = "toolbox-file-transfer-settings-v2";
const DIRECTORY_DB = "toolbox-file-transfer-settings";
const DIRECTORY_STORE = "handles";

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export class TransferPreferences {
  theme() {
    return readJSON(SETTINGS_KEY, {}).theme === "dark" ? "dark" : "light";
  }
  setTheme(theme) {
    writeJSON(SETTINGS_KEY, { ...readJSON(SETTINGS_KEY, {}), theme });
  }
  autoAccept() {
    return readJSON(SETTINGS_KEY, {}).autoAccept === true;
  }
  setAutoAccept(value) {
    writeJSON(SETTINGS_KEY, {
      ...readJSON(SETTINGS_KEY, {}),
      autoAccept: !!value,
    });
  }
}

export class TransferHistory {
  list() {
    const value = readJSON(HISTORY_KEY, []);
    return Array.isArray(value) ? value.slice(0, 200) : [];
  }
  add(entry) {
    const item = {
      id: crypto.randomUUID?.() || crypto.getRandomValues(new Uint32Array(2)).join("-"),
      name: String(entry.name || "未命名文件").slice(0, 255),
      path: String(entry.path || entry.name || "").slice(0, 512),
      size: Number(entry.size) || 0,
      hash: typeof entry.hash === "string" ? entry.hash : "",
      direction: entry.direction === "receive" ? "receive" : "send",
      state: entry.state || "complete",
      peer: String(entry.peer || "").slice(0, 64),
      at: Date.now(),
    };
    const list = [item, ...this.list()].slice(0, 200);
    writeJSON(HISTORY_KEY, list);
    return list;
  }
  clear() {
    writeJSON(HISTORY_KEY, []);
  }
}

export class RememberedDevices {
  list() {
    const value = readJSON(DEVICES_KEY, []);
    return Array.isArray(value) ? value : [];
  }
  save({ name, password, via }) {
    const cleanName = String(name || "").trim().slice(0, 32);
    if (!cleanName) throw new Error("请输入设备名称");
    if (typeof password !== "string" || password.length < 12)
      throw new Error("连接密码无效");
    const list = this.list();
    const existing = list.find(
      (item) => item.password === password && item.via === via,
    );
    const item = {
      id: existing?.id || crypto.randomUUID?.() || String(Date.now()),
      name: cleanName,
      password,
      via: via === "nostr" ? "nostr" : "mqtt",
      lastUsed: Date.now(),
      uses: (existing?.uses || 0) + 1,
    };
    writeJSON(
      DEVICES_KEY,
      [item, ...list.filter((entry) => entry.id !== item.id)].slice(0, 20),
    );
    return item;
  }
  touch(id) {
    const list = this.list();
    const item = list.find((entry) => entry.id === id);
    if (!item) return;
    item.lastUsed = Date.now();
    item.uses = (item.uses || 0) + 1;
    writeJSON(
      DEVICES_KEY,
      [item, ...list.filter((entry) => entry.id !== id)],
    );
  }
  remove(id) {
    writeJSON(
      DEVICES_KEY,
      this.list().filter((entry) => entry.id !== id),
    );
  }
}

function openHandleDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DIRECTORY_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DIRECTORY_STORE))
        request.result.createObjectStore(DIRECTORY_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function handleRequest(method, args = []) {
  const db = await openHandleDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DIRECTORY_STORE, method === "get" ? "readonly" : "readwrite");
      const store = tx.objectStore(DIRECTORY_STORE);
      const request = store[method](...args);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(tx.error || new Error("目录设置保存失败"));
    });
  } finally {
    db.close();
  }
}

async function hasPermission(handle, request = false) {
  if (!handle) return false;
  if (typeof handle.queryPermission !== "function") return true;
  const options = { mode: "readwrite" };
  if ((await handle.queryPermission(options)) === "granted") return true;
  return (
    request &&
    typeof handle.requestPermission === "function" &&
    (await handle.requestPermission(options)) === "granted"
  );
}

function safeSegments(value, fallback) {
  const parts = String(value || fallback || "file")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[\x00-\x1f\x7f<>:"|?*]/g, "_").trim())
    .filter((part) => part && part !== "." && part !== "..");
  if (!parts.length) parts.push("file");
  return parts.slice(-32).map((part) => part.slice(0, 120));
}

export class DestinationDirectory {
  handle = null;
  async restore() {
    try {
      this.handle = (await handleRequest("get", ["destination"])) || null;
      return this.handle?.name || "";
    } catch {
      this.handle = null;
      return "";
    }
  }
  async choose() {
    if (!window.showDirectoryPicker)
      throw new Error("当前浏览器请使用默认下载位置");
    const handle = await window.showDirectoryPicker({
      id: "toolbox-file-transfer",
      mode: "readwrite",
      startIn: "downloads",
    });
    await handleRequest("put", [handle, "destination"]);
    this.handle = handle;
    return handle.name;
  }
  async inspect(requestPermission = false) {
    if (!this.handle) return false;
    return hasPermission(this.handle, requestPermission);
  }
  async write(record, readChunk, onProgress) {
    const handle = this.handle;
    if (!handle || !(await hasPermission(handle, true)))
      throw new Error("保存目录权限已失效，请重新选择");
    const parts = safeSegments(record.path || record.name, record.name);
    const fileName = parts.pop();
    let directory = handle;
    for (const part of parts)
      directory = await directory.getDirectoryHandle(part, { create: true });
    const file = await directory.getFileHandle(fileName, { create: true });
    const writable = await file.createWritable();
    try {
      for (let offset = 0; offset < record.size; offset += 4 * 1024 ** 2) {
        const end = Math.min(record.size, offset + 4 * 1024 ** 2);
        await writable.write(await readChunk(offset, end));
        onProgress?.(end / Math.max(1, record.size));
      }
      await writable.close();
    } catch (error) {
      await writable.abort().catch(() => {});
      throw error;
    }
  }
}
