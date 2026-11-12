// Each layer owns a non-destructive overlay; parent replacement commits only after build succeeds.
const LIMIT = 256 * 1024 ** 2;
const within = (path, parent) =>
  path === parent || path.startsWith(parent + "/");
const removedPath = (path, removed) => {
  let prefix = "";
  for (const part of path.split("/")) {
    prefix += (prefix ? "/" : "") + part;
    if (removed.has(prefix)) return true;
  }
  return false;
};
function pathOK(path) {
  if (
    typeof path !== "string" ||
    !path ||
    path.length > 4096 ||
    path.split("/").length > 64 ||
    /[\\:\x00-\x1f\x7f]/.test(path) ||
    path.startsWith("/") ||
    path.startsWith("@") ||
    path.split("/").some((p) => !p || p === "." || p === "..")
  )
    throw Error("文件路径无效");
  return path;
}
export class ImageWorkspace {
  constructor() {
    this.frames = [];
  }
  get current() {
    return this.frames.at(-1);
  }
  open(blob, name, listing) {
    this.frames = [this.frame(blob, name, listing)];
  }
  frame(blob, name, listing, parentPath = null) {
    return {
      blob,
      name,
      listing,
      parentPath,
      cwd: "",
      updates: new Map(),
      removed: new Set(),
      dirty: false,
    };
  }
  entries(frame = this.current) {
    if (!frame) return [];
    const map = new Map(
      frame.listing.entries
        .filter((e) => !removedPath(e.path, frame.removed))
        .map((e) => [e.path, e]),
    );
    for (const [path, blob] of frame.updates)
      map.set(path, { path, size: blob.size, directory: false, added: true });
    // Some archive formats omit explicit directory entries.
    for (const e of [...map.values()]) {
      const parts = e.path.split("/");
      parts.pop();
      let path = "";
      for (const part of parts) {
        path += (path ? "/" : "") + part;
        if (!map.has(path)) map.set(path, { path, directory: true, size: 0 });
      }
    }
    return [...map.values()];
  }
  children() {
    const cwd = this.current?.cwd || "",
      prefix = cwd ? cwd + "/" : "";
    return this.entries()
      .filter(
        (e) =>
          e.path.startsWith(prefix) &&
          !e.path.slice(prefix.length).includes("/") &&
          e.path !== cwd,
      )
      .sort(
        (a, b) =>
          Number(!!b.directory) - Number(!!a.directory) ||
          a.path.localeCompare(b.path, "zh-CN"),
      );
  }
  enterDirectory(path) {
    if (
      !this.children().some((e) => e.path === path && e.directory && !e.symlink)
    )
      throw Error("目录不存在");
    this.current.cwd = path;
  }
  up() {
    this.current.cwd = this.current.cwd.split("/").slice(0, -1).join("/");
  }
  requireWritable() {
    if (!this.current?.listing.writable) throw Error("此格式只支持浏览和导出");
  }
  retained(
    frames = this.frames,
    replaceFrame = null,
    replacePath = null,
    extra = null,
  ) {
    const blobs = new Set(frames.slice(1).map((f) => f.blob));
    for (const frame of frames)
      for (const [path, blob] of frame.updates)
        if (frame !== replaceFrame || path !== replacePath) blobs.add(blob);
    if (extra) blobs.add(extra);
    return [...blobs].reduce((n, b) => n + b.size, 0);
  }
  remove(paths) {
    this.requireWritable();
    const all = this.entries();
    for (const path of paths) {
      pathOK(path);
      if (!all.some((e) => e.path === path)) throw Error("文件不存在");
    }
    for (const path of paths) {
      if (this.current.listing.entries.some((e) => within(e.path, path)))
        this.current.removed.add(path);
      for (const key of this.current.updates.keys())
        if (within(key, path)) this.current.updates.delete(key);
    }
    this.current.dirty = true;
  }
  add(path, blob) {
    this.requireWritable();
    pathOK(path);
    if (!(blob instanceof Blob)) throw Error("文件数据无效");
    const all = this.entries(),
      existing = all.find((e) => e.path === path);
    if (
      existing?.directory ||
      all.some((e) => !e.directory && path.startsWith(e.path + "/"))
    )
      throw Error("文件与目录路径冲突");
    const total = this.retained(this.frames, this.current, path, blob);
    if (total > LIMIT || (all.length >= 10000 && !existing))
      throw Error("待编辑内容超过处理上限");
    this.current.updates.set(path, blob);
    this.current.dirty = true;
  }
  selectedFiles(paths) {
    return this.entries().filter(
      (e) => !e.directory && paths.some((p) => within(e.path, p)),
    );
  }
  async extract(paths, engine) {
    const items = this.selectedFiles(paths);
    let total = 0;
    const symlinks = this.entries().filter((e) => e.symlink);
    for (const e of items) {
      if (e.symlink || symlinks.some((p) => within(e.path, p.path)))
        throw Error("不支持符号链接");
      total += e.size;
    }
    if (total > LIMIT) throw Error("提取内容超过 256 MiB");
    const base = items.filter((e) => !this.current.updates.has(e.path));
    const out = base.length
      ? await engine.extract(
          this.current.blob,
          base.map((e) => e.path),
        )
      : [];
    const map = new Map(out.map((e) => [e.path, e]));
    return items.map(
      (e) =>
        map.get(e.path) || {
          path: e.path,
          blob: this.current.updates.get(e.path),
        },
    );
  }
  async enterFile(path, engine) {
    if (this.frames.length >= 9) throw Error("嵌套最多支持 8 层");
    const item = this.entries().find((e) => e.path === path && !e.directory);
    if (!item || item.symlink) throw Error("请选择镜像或压缩文件");
    if (
      this.retained() + (this.current.updates.has(path) ? 0 : item.size) >
      LIMIT
    )
      throw Error("嵌套内容超过 256 MiB");
    const [extracted] = await this.extract([path], engine);
    if (this.retained(this.frames, null, null, extracted.blob) > LIMIT)
      throw Error("嵌套内容超过 256 MiB");
    const listing = await engine.list(extracted.blob);
    this.frames.push(
      this.frame(extracted.blob, path.split("/").pop(), listing, path),
    );
  }
  async build(engine, frame = this.current) {
    if (!frame.dirty) return frame.blob;
    if (!frame.listing.writable) throw Error("此格式无法保存修改");
    return engine.update({
      blob: frame.blob,
      format: frame.listing.writable,
      remove: [...frame.removed],
      entries: [...frame.updates].map(([path, blob]) => ({ path, blob })),
    });
  }
  async back(engine, discard = false) {
    if (this.frames.length < 2) return;
    const child = this.current,
      parent = this.frames.at(-2);
    if (child.dirty && !discard) {
      if (!parent.listing.writable)
        throw Error("上层格式只读，请先保存子文件，或放弃修改后返回");
      const blob = await this.build(engine);
      const total = this.retained(
        this.frames.slice(0, -1),
        parent,
        child.parentPath,
        blob,
      );
      if (total > LIMIT) throw Error("上层待编辑内容超过 256 MiB");
      parent.updates.set(child.parentPath, blob);
      parent.dirty = true;
    }
    this.frames.pop();
  }
}
