import { sizeBuckets } from "./folder-core.js";
import { createSHA256 } from "../../vendor/hash-wasm/hash-wasm.js";
const CHUNK = 4 * 1024 * 1024,
  LIMIT = 200000;
let files = [],
  directories = [],
  cancelled = false,
  busy = false,
  lastProgress = 0,
  stats = {},
  scanPartial = false;
function progress(phase, extra = {}) {
  const now = Date.now();
  if (now - lastProgress > 100) {
    postMessage({ type: "progress", phase, ...stats, ...extra });
    lastProgress = now;
  }
}
const publicFile = (f) => ({
  path: f.path,
  size: f.size,
  lastModified: f.lastModified,
  kind: "file",
  name: f.path.split("/").pop(),
  parent: f.path.split("/").slice(0, -1).join("/"),
});
async function current(record) {
  try {
    const f = record.handle ? await record.handle.getFile() : record.file;
    if (f.size !== record.size || f.lastModified !== record.lastModified) {
      stats.changed++;
      return null;
    }
    return f;
  } catch {
    stats.unreadable++;
    return null;
  }
}
async function scan(message) {
  files = [];
  directories = [];
  stats = {
    unreadable: 0,
    changed: 0,
    entries: 0,
    limited: false,
    fallback: !message.handle,
  };
  let stop = false;
  function accept() {
    if (cancelled || stop) return false;
    if (stats.entries >= LIMIT) {
      stats.limited = true;
      stop = true;
      return false;
    }
    stats.entries++;
    return true;
  }
  async function walk(handle, path = "") {
    try {
      for await (const [name, h] of handle.entries()) {
        if (!accept()) break;
        const p = path ? path + "/" + name : name;
        if (h.kind === "directory") {
          directories.push(p);
          await walk(h, p);
        } else {
          try {
            const f = await h.getFile();
            files.push({
              path: p,
              size: f.size,
              lastModified: f.lastModified,
              handle: h,
            });
          } catch {
            stats.unreadable++;
          }
        }
        progress("scan", { files: files.length });
      }
    } catch {
      stats.unreadable++;
    }
  }
  if (message.handle) await walk(message.handle);
  else {
    const knownDirectories = new Set();
    for (const entry of message.files) {
      const file = entry.file || entry;
      const path =
        entry.path ||
        file.webkitRelativePath?.split("/").slice(1).join("/") ||
        file.name;
      const segments = path.split("/");
      segments.pop();
      let parent = "";
      for (const segment of segments) {
        parent = parent ? parent + "/" + segment : segment;
        if (!knownDirectories.has(parent)) {
          if (!accept()) break;
          knownDirectories.add(parent);
          directories.push(parent);
        }
      }
      if (!accept()) break;
      files.push({
        path,
        size: file.size,
        lastModified: file.lastModified,
        file,
      });
      progress("scan", { files: files.length });
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  scanPartial = cancelled || stats.limited;
  postMessage({
    type: "scan",
    files: files.map(publicFile),
    directories,
    stats,
    partial: scanPartial,
  });
}
async function duplicates() {
  const { candidates, empty, skipped } = sizeBuckets(files),
    hashes = new Map(),
    groups = [];
  stats = {
    ...stats,
    changed: 0,
    unreadable: 0,
    hashed: 0,
    readBytes: 0,
    compared: 0,
    uniqueSkipped: skipped,
  };
  const hasher = await createSHA256();
  async function exact(a, b) {
    const fa = await current(a),
      fb = await current(b);
    if (!fa || !fb) return false;
    for (let offset = 0; offset < a.size; offset += CHUNK) {
      if (cancelled) return false;
      const [aa, bb] = await Promise.all([
        fa.slice(offset, offset + CHUNK).arrayBuffer(),
        fb.slice(offset, offset + CHUNK).arrayBuffer(),
      ]);
      stats.readBytes += aa.byteLength + bb.byteLength;
      const x = new Uint8Array(aa),
        y = new Uint8Array(bb);
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
      progress("duplicate", { total: candidates.length });
    }
    if (!(await current(a)) || !(await current(b))) return false;
    stats.compared++;
    return true;
  }
  for (const record of candidates) {
    if (cancelled) break;
    const f = await current(record);
    if (!f) continue;
    try {
      hasher.init();
      for (let offset = 0; offset < f.size; offset += CHUNK) {
        if (cancelled) break;
        const buffer = await f.slice(offset, offset + CHUNK).arrayBuffer();
        hasher.update(new Uint8Array(buffer));
        stats.readBytes += buffer.byteLength;
        progress("duplicate", { total: candidates.length });
      }
      if (cancelled) break;
      if (!(await current(record))) continue;
      const key = record.size + ":" + hasher.digest();
      if (!hashes.has(key)) hashes.set(key, []);
      hashes.get(key).push(record);
      stats.hashed++;
    } catch {
      stats.unreadable++;
    }
  }
  for (const bucket of hashes.values()) {
    if (cancelled) break;
    const partitions = [];
    for (const record of bucket) {
      if (cancelled) break;
      let found = false;
      for (const p of partitions) {
        try {
          if (await exact(p[0], record)) {
            p.push(record);
            found = true;
            break;
          }
        } catch {
          stats.unreadable++;
        }
      }
      if (!found) partitions.push([record]);
    }
    groups.push(
      ...partitions.filter((p) => p.length > 1).map((p) => p.map(publicFile)),
    );
  }
  if (!cancelled && empty.length > 1) {
    const valid = [];
    for (const e of empty) {
      if (cancelled) break;
      if (await current(e)) valid.push(publicFile(e));
    }
    if (valid.length > 1) groups.push(valid);
  }
  postMessage({
    type: "duplicates",
    groups,
    stats,
    partial: cancelled || scanPartial,
    scanPartial,
    cancelled,
    redundant: groups.reduce((n, g) => n + g[0].size * (g.length - 1), 0),
  });
}
onmessage = async ({ data }) => {
  if (data.type === "cancel") {
    cancelled = true;
    return;
  }
  if (busy) return;
  busy = true;
  cancelled = false;
  try {
    if (data.type === "scan") await scan(data);
    if (data.type === "duplicates") await duplicates();
  } catch (error) {
    postMessage({ type: "error", message: error.message });
  } finally {
    busy = false;
  }
};
