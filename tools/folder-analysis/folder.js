import { aggregate, bytes, csvCell } from "./folder-core.js";
const $ = (id) => document.getElementById(id),
  worker = new Worker("./folder-worker.js", { type: "module" });
let snapshot = { files: [], directories: [] },
  tree = aggregate([]),
  groups = [],
  view = "tree",
  path = "",
  page = 0,
  busy = false,
  partial = false;
const PAGE = 60;
function status(text) {
  $("status").textContent = text;
}
function setBusy(value) {
  busy = value;
  $("choose").disabled = value;
  $("duplicate").disabled = value || !snapshot.files.length;
  $("cancel").disabled = !value;
}
function statistics(s) {
  return `无法读取 ${s.unreadable || 0} · 已变化 ${s.changed || 0}${s.fallback ? " · 兼容模式不含空文件夹" : ""}`;
}
worker.onerror = (event) => {
  setBusy(false);
  status("处理失败：" + event.message);
};
worker.onmessage = ({ data: d }) => {
  if (d.type === "progress") {
    status(
      d.phase === "scan"
        ? `扫描中 · ${d.files} 个文件`
        : `检测中 · 已哈希 ${d.hashed}/${d.total} · 已读 ${bytes(d.readBytes)} · ${statistics(d)}`,
    );
    return;
  }
  if (d.type === "error") {
    setBusy(false);
    status("处理失败：" + d.message);
    return;
  }
  setBusy(false);
  if (d.type === "scan") {
    snapshot = d;
    tree = aggregate(d.files, d.directories);
    groups = [];
    path = "";
    page = 0;
    partial = d.partial;
    $("total").textContent = bytes(tree.root.size);
    $("counts").textContent =
      `${tree.root.count} 个文件 · ${tree.nodes.length - 1} 个文件夹`;
    $("saved").textContent = "重复冗余 0 B";
    $("export").disabled = false;
    status(
      `${d.partial ? "部分扫描（已取消或达到 200000 条上限）" : "扫描完成"} · ${statistics(d.stats)}${d.stats.limited ? " · 已达条目上限" : ""}`,
    );
  } else {
    groups = d.groups;
    $("saved").textContent = `重复冗余 ${bytes(d.redundant)}`;
    status(
      `${d.cancelled ? "检测已取消 · 部分结果" : d.scanPartial ? "部分扫描 · 仅检测已扫描文件" : "检测完成"} · ${groups.length} 组 · 跳过 ${d.stats.uniqueSkipped} 个唯一大小 · ${statistics(d.stats)}`,
    );
    view = "duplicate";
    page = 0;
  }
  render();
};
$("choose").onclick = async () => {
  try {
    if (!window.showDirectoryPicker) {
      $("fallback").click();
      return;
    }
    const handle = await showDirectoryPicker({ mode: "read" });
    setBusy(true);
    status("扫描中…");
    worker.postMessage({ type: "scan", handle });
  } catch (e) {
    if (e.name !== "AbortError") status("无法选择文件夹：" + e.message);
  }
};
$("fallback").onchange = () => {
  if (!$("fallback").files.length) return;
  setBusy(true);
  status("兼容模式：无法记录空文件夹。扫描中…");
  worker.postMessage({
    type: "scan",
    files: [...$("fallback").files].map((file) => ({
      file,
      path: file.webkitRelativePath?.split("/").slice(1).join("/") || file.name,
    })),
  });
};
$("duplicate").onclick = () => {
  setBusy(true);
  status("正在准备 WASM 检测…");
  worker.postMessage({ type: "duplicates" });
};
$("cancel").onclick = () => {
  worker.postMessage({ type: "cancel" });
  status("正在取消，保留已处理结果…");
};
document.querySelectorAll("[data-view]").forEach(
  (b) =>
    (b.onclick = () => {
      view = b.dataset.view;
      page = 0;
      render();
    }),
);
$("search").oninput = () => {
  page = 0;
  render();
};
$("sort").onchange = () => {
  page = 0;
  render();
};
$("up").onclick = () => navigate(path.split("/").slice(0, -1).join("/"));
$("prev").onclick = () => {
  page--;
  render();
};
$("next").onclick = () => {
  page++;
  render();
};
function navigate(p) {
  path = p;
  page = 0;
  render();
}
function dataRows() {
  let list;
  if (view === "extension") list = tree.extensions;
  else if (view === "duplicate")
    list = groups.flatMap((g, i) =>
      g.map((f) => ({ ...f, group: i + 1, count: g.length })),
    );
  else
    list = [
      ...tree.nodes.filter((n) => n.path && n.parent === path),
      ...snapshot.files.filter((f) => f.parent === path),
    ];
  const q = $("search").value.toLocaleLowerCase();
  if (q)
    list = (
      view === "tree"
        ? [...tree.nodes.filter((n) => n.path), ...snapshot.files]
        : list
    ).filter((n) => (n.path || n.name).toLocaleLowerCase().includes(q));
  const sort = $("sort").value;
  return [...list].sort((a, b) =>
    sort === "name"
      ? (a.path || a.name).localeCompare(b.path || b.name, "zh")
      : (b[sort] || 0) - (a[sort] || 0) ||
        (a.path || a.name).localeCompare(b.path || b.name, "zh"),
  );
}
function render() {
  $("duplicate").disabled = busy || !snapshot.files.length;
  document
    .querySelectorAll("[data-view]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.view === view)),
    );
  $("up").disabled = !path;
  $("crumbs").replaceChildren();
  const root = document.createElement("button");
  root.textContent = "全部";
  root.onclick = () => navigate("");
  $("crumbs").append(root);
  let p = "";
  for (const segment of path.split("/").filter(Boolean)) {
    p = p ? p + "/" + segment : segment;
    const target = p,
      b = document.createElement("button");
    b.textContent = "/ " + segment;
    b.onclick = () => navigate(target);
    $("crumbs").append(b);
  }
  const rows = dataRows(),
    pages = Math.ceil(rows.length / PAGE);
  page = Math.max(0, Math.min(page, pages - 1));
  $("rows").replaceChildren();
  for (const n of rows.slice(page * PAGE, (page + 1) * PAGE)) {
    const tr = document.createElement("tr"),
      name = document.createElement("td"),
      size = document.createElement("td"),
      percent = document.createElement("td");
    const label = (n.kind === "directory" ? "▸ " : "") + (n.path || n.name);
    if (n.kind === "directory") {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = () => navigate(n.path);
      name.append(b);
    } else name.textContent = label;
    if (n.group) {
      const small = document.createElement("small");
      small.textContent = `第 ${n.group} 组 · ${n.count} 份`;
      name.append(small);
    }
    size.textContent = bytes(n.size);
    percent.textContent =
      view === "duplicate"
        ? `${n.count} 份`
        : (tree.root.size ? (n.size / tree.root.size) * 100 : 0).toFixed(1) +
          "%" +
          (n.count !== undefined ? " · " + n.count : "");
    tr.append(name, size, percent);
    $("rows").append(tr);
  }
  $("empty").hidden = rows.length > 0;
  $("empty").textContent = snapshot.files.length
    ? "没有匹配项"
    : "选择文件夹，查看空间分布";
  $("page").textContent = `${pages ? page + 1 : 0} / ${pages}`;
  $("prev").disabled = page === 0;
  $("next").disabled = page + 1 >= pages;
  draw(rows);
}
function draw(rows) {
  const canvas = $("map"),
    r = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, r.width * devicePixelRatio);
  canvas.height = Math.max(1, r.height * devicePixelRatio);
  const c = canvas.getContext("2d");
  c.scale(devicePixelRatio, devicePixelRatio);
  const items = rows.filter((n) => n.size > 0).slice(0, 30),
    total = items.reduce((s, n) => s + n.size, 0);
  let x = 0;
  items.forEach((n, i) => {
    const w = (n.size / total) * r.width;
    c.fillStyle = ["#285de5", "#5a85ed", "#8faaf0", "#4776ce", "#b6c9f4"][
      i % 5
    ];
    c.fillRect(x, 0, Math.max(0, w - 2), r.height);
    if (w > 60) {
      c.fillStyle = "#fff";
      c.font = "11px Segoe UI";
      c.save();
      c.beginPath();
      c.rect(x + 5, 0, w - 10, r.height);
      c.clip();
      c.fillText(n.name || n.path, x + 7, 24);
      c.fillText(bytes(n.size), x + 7, 43);
      c.restore();
    }
    x += w;
  });
}
new ResizeObserver(() => draw(dataRows())).observe($("map"));
$("export").onclick = () => {
  const chunks = ["\ufeff路径,类型,字节,重复组,扫描状态\r\n"];
  const membership = new Map(
    groups.flatMap((g, i) => g.map((f) => [f.path, i + 1])),
  );
  for (const f of snapshot.files)
    chunks.push(
      [
        f.path,
        "文件",
        f.size,
        membership.get(f.path) || "",
        partial ? "部分" : "完整",
      ]
        .map(csvCell)
        .join(",") + "\r\n",
    );
  const url = URL.createObjectURL(
      new Blob(chunks, { type: "text/csv;charset=utf-8" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = "文件夹分析.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
render();
