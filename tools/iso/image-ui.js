import { ImageEngine } from "./image-engine.js";
import { ImageWorkspace } from "./image-workspace.js";
const $ = (id) => document.getElementById(id),
  workspace = new ImageWorkspace();
const size = (n) =>
  n < 1024
    ? n + " B"
    : (n / 1024 ** (n < 1048576 ? 1 : 2)).toFixed(1) +
      (n < 1048576 ? " KiB" : " MiB");
let selected = new Set(),
  page = 0,
  busy = false,
  job = null,
  protectedHandles = [],
  deletePaths = [];
const current = () => workspace.current;
function message(text, error = false) {
  $("browseStatus").textContent = text;
  $("browseStatus").dataset.tone = error ? "error" : "";
}
function mode(browse) {
  if (busy) return;
  $("createPanel").hidden = browse;
  $("browsePanel").hidden = !browse;
  $("browseTab").setAttribute("aria-pressed", String(browse));
  $("createTab").setAttribute("aria-pressed", String(!browse));
}
$("browseTab").onclick = () => mode(true);
$("createTab").onclick = () => mode(false);
function resetView() {
  selected.clear();
  page = 0;
  $("imageSearch").value = "";
}
function rows() {
  const query = $("imageSearch").value.toLocaleLowerCase();
  return workspace
    .children()
    .filter((e) => e.path.split("/").pop().toLocaleLowerCase().includes(query));
}
function button(text, handler) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.onclick = handler;
  return b;
}
function breadcrumbs() {
  const nav = $("imageBreadcrumbs");
  nav.replaceChildren();
  workspace.frames.forEach((frame, index) => {
    const b = button(frame.name, () =>
      run(async (engine) => {
        while (workspace.frames.length > index + 1) await leaveLayer(engine);
        frame.cwd = "";
        resetView();
      }),
    );
    b.disabled = busy;
    b.title = frame.name;
    nav.append(b, document.createTextNode(" / "));
  });
  let path = "";
  for (const part of (current()?.cwd || "").split("/").filter(Boolean)) {
    path += (path ? "/" : "") + part;
    const target = path,
      b = button(part, () => {
        if (busy) return;
        current().cwd = target;
        resetView();
        render();
      });
    b.disabled = busy;
    nav.append(b, document.createTextNode(" / "));
  }
}
function render() {
  const frame = current(),
    all = rows(),
    pages = Math.max(1, Math.ceil(all.length / 50));
  page = Math.min(page, pages - 1);
  $("imageName").textContent = frame?.name || "未打开";
  $("imageCapability").textContent = frame
    ? frame.listing.writable === "iso"
      ? "重建编辑"
      : frame.listing.writable
        ? "可编辑"
        : "只读"
    : "";
  $("imageNote").textContent =
    frame?.listing.writable === "iso"
      ? "ISO 修改将重建为资料镜像，不保留系统引导。"
      : frame?.listing.writable
        ? "修改后保存新副本；返回上层会更新嵌套文件。"
        : frame
          ? "此格式支持浏览和导出。"
          : "";
  $("imagePage").textContent = `${page + 1} / ${pages}`;
  $("imagePrevious").disabled = busy || !page;
  $("imageNext").disabled = busy || page >= pages - 1;
  $("imageRows").replaceChildren(
    ...all.slice(page * 50, page * 50 + 50).map((e) => {
      const tr = document.createElement("tr"),
        check = document.createElement("td"),
        name = document.createElement("td"),
        bytes = document.createElement("td"),
        input = document.createElement("input");
      input.type = "checkbox";
      input.checked = selected.has(e.path);
      input.disabled = busy || e.symlink;
      input.dataset.select = e.path;
      input.setAttribute("aria-label", "选择 " + e.path);
      input.onchange = () => {
        input.checked ? selected.add(e.path) : selected.delete(e.path);
        controls();
      };
      check.append(input);
      const open = button(
        (e.directory ? "▸ " : "") + e.path.split("/").pop(),
        () => openEntry(e),
      );
      open.dataset.open = e.path;
      open.disabled = busy || e.symlink;
      open.className = "image-entry";
      open.title = e.path;
      name.append(open);
      if (e.added) {
        const mark = document.createElement("span");
        mark.className = "image-change";
        mark.textContent = "已修改";
        name.append(mark);
      }
      bytes.textContent = e.directory ? "文件夹" : size(e.size);
      tr.append(check, name, bytes);
      return tr;
    }),
  );
  $("selectImagePage").checked = false;
  breadcrumbs();
  controls();
}
function controls() {
  const frame = current(),
    writable = !!frame?.listing.writable;
  for (const id of ["openImage", "createTab", "imageSearch"])
    $(id).disabled = busy;
  $("extractSelected").disabled = busy || !selected.size;
  $("enterImage").disabled = busy || selected.size !== 1;
  $("deleteImageEntries").disabled = busy || !writable || !selected.size;
  $("addImageFiles").disabled = busy || !writable;
  $("saveImage").disabled = busy || !writable;
  $("rebuildISO").disabled =
    busy || frame?.listing.format?.toLowerCase() !== "iso";
  $("imageUp").disabled =
    busy || !frame || (!frame.cwd && workspace.frames.length === 1);
  $("browseCancel").hidden = !busy;
  $("selectImagePage").disabled = busy || !frame;
  const byPath = new Map(workspace.entries().map((e) => [e.path, e]));
  for (const b of $("imageRows").querySelectorAll("button,input"))
    b.disabled =
      busy || !!byPath.get(b.dataset.open || b.dataset.select)?.symlink;
}
async function run(work) {
  if (busy) return;
  busy = true;
  controls();
  job = new ImageEngine({
    onProgress: (d) => message(d.message || "正在处理…"),
  });
  try {
    return await work(job);
  } catch (e) {
    message(
      e.name === "AbortError" ? "已取消" : e.message || "处理失败",
      e.name !== "AbortError",
    );
  } finally {
    job.destroy();
    job = null;
    busy = false;
    render();
  }
}
function confirmIso(frame = current()) {
  return frame?.dirty && frame.listing.writable === "iso"
    ? confirm("重建为资料 ISO，不保留系统引导。继续？")
    : true;
}
async function leaveLayer(engine) {
  const frame = current();
  if (!confirmIso(frame)) throw new DOMException("已取消", "AbortError");
  if (frame.dirty && !workspace.frames.at(-2).listing.writable) {
    if (!confirm("上层格式只读。放弃此层修改并返回？"))
      throw new DOMException("已取消", "AbortError");
    await workspace.back(engine, true);
  } else await workspace.back(engine);
}
async function open(blob, name, handles = []) {
  await run(async (engine) => {
    if (
      workspace.frames.some((f) => f.dirty) &&
      !confirm("放弃当前未保存的修改并打开新文件？")
    )
      return;
    message("正在读取…");
    const result = await engine.list(blob);
    workspace.open(blob, name, result);
    protectedHandles = handles;
    resetView();
    message(
      result.warning ||
        (result.warnings || []).join("；") ||
        `${result.entries.length} 个条目`,
    );
  });
}
async function openEntry(entry) {
  if (busy) return;
  if (entry.directory) {
    try {
      workspace.enterDirectory(entry.path);
      resetView();
      render();
    } catch (e) {
      message(e.message, true);
    }
    return;
  }
  await run(async (engine) => {
    await workspace.enterFile(entry.path, engine);
    resetView();
    message("");
  });
}
async function protectOutput(handle) {
  for (const original of protectedHandles)
    if (await original.isSameEntry(handle))
      throw Error("请选择新文件，源镜像不能覆盖");
}
function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
$("openImage").onclick = async () => {
  if (!("showOpenFilePicker" in window)) return $("imageInput").click();
  try {
    const [handle] = await showOpenFilePicker({ multiple: false });
    await open(await handle.getFile(), handle.name, [handle]);
  } catch (e) {
    if (e.name !== "AbortError") message(e.message, true);
  }
};
$("imageInput").removeAttribute("accept");
$("imageInput").onchange = async () => {
  const file = $("imageInput").files[0];
  $("imageInput").value = "";
  if (file) await open(file, file.name);
};
$("imageSearch").oninput = () => {
  page = 0;
  render();
};
$("imagePrevious").onclick = () => {
  page--;
  render();
};
$("imageNext").onclick = () => {
  page++;
  render();
};
$("browseCancel").onclick = () => job?.cancel();
$("imageUp").onclick = () => {
  if (busy) return;
  if (current().cwd) {
    workspace.up();
    resetView();
    render();
  } else
    run(async (engine) => {
      await leaveLayer(engine);
      resetView();
      message("已返回上层");
    });
};
$("selectImagePage").onchange = () => {
  const checked = $("selectImagePage").checked;
  for (const e of rows().slice(page * 50, page * 50 + 50))
    if (!e.symlink) checked ? selected.add(e.path) : selected.delete(e.path);
  render();
  $("selectImagePage").checked = checked;
};
$("enterImage").onclick = () => {
  const entry = workspace.entries().find((e) => e.path === [...selected][0]);
  if (entry) openEntry(entry);
};
$("extractSelected").onclick = () =>
  run(async (engine) => {
    const items = workspace.selectedFiles([...selected]);
    let folder = null;
    if (items.length > 1) {
      if (!("showDirectoryPicker" in window))
        throw Error("批量导出需要 Chrome / Edge，或逐个导出文件");
      folder = await showDirectoryPicker({ mode: "readwrite" });
    }
    const files = await workspace.extract([...selected], engine);
    if (!files.length) throw Error("所选目录中没有文件");
    if (files.length === 1) {
      download(files[0].blob, files[0].path.split("/").pop());
      message("已导出");
      return;
    }
    for (const file of files) {
      let dir = folder;
      const parts = file.path.split("/");
      for (const part of parts.slice(0, -1))
        dir = await dir.getDirectoryHandle(part, { create: true });
      const handle = await dir.getFileHandle(parts.at(-1), { create: true });
      await protectOutput(handle);
      const stream = await handle.createWritable();
      try {
        await file.blob.stream().pipeTo(stream);
      } catch (e) {
        await stream.abort().catch(() => {});
        throw e;
      }
    }
    message(`已导出 ${files.length} 个文件`);
  });
$("deleteImageEntries").onclick = () => {
  if (busy || !selected.size) return;
  deletePaths = [...selected];
  $("imageDeleteDescription").textContent =
    `删除 ${deletePaths.length} 个所选项目，包含目录内的内容。源文件保持不变。`;
  $("imageDeleteDialog").showModal();
};
$("cancelImageDelete").onclick = () => $("imageDeleteDialog").close();
$("confirmImageDelete").onclick = () => {
  if (busy) return;
  try {
    workspace.remove(deletePaths);
    selected.clear();
    $("imageDeleteDialog").close();
    message("已标记删除，保存副本后生效");
    render();
  } catch (e) {
    message(e.message, true);
  }
};
$("addImageFiles").onclick = () => $("imageAddInput").click();
$("imageAddInput").onchange = () => {
  if (busy) return;
  let skipped = 0;
  try {
    const paths = new Set(workspace.entries().map((e) => e.path));
    for (const blob of $("imageAddInput").files) {
      const path = (current().cwd ? current().cwd + "/" : "") + blob.name;
      if (paths.has(path)) {
        skipped++;
        continue;
      }
      workspace.add(path, blob);
      paths.add(path);
    }
    message(skipped ? "已跳过同名文件。" : "已添加至当前目录");
  } catch (e) {
    message(e.message, true);
  }
  $("imageAddInput").value = "";
  render();
};
$("saveImage").onclick = () =>
  run(async (engine) => {
    const frame = current();
    if (!confirmIso(frame)) return;
    const name =
      frame.name.replace(/\.[^.]+$/, "") + "-副本." + frame.listing.writable;
    let handle = null;
    if (protectedHandles.length && "showSaveFilePicker" in window) {
      handle = await showSaveFilePicker({ suggestedName: name });
      await protectOutput(handle);
    }
    const blob = await workspace.build(engine);
    if (handle) {
      const stream = await handle.createWritable();
      try {
        await blob.stream().pipeTo(stream);
      } catch (e) {
        await stream.abort().catch(() => {});
        throw e;
      }
    } else download(blob, name);
    message("已保存副本");
  });
$("rebuildISO").onclick = async () => {
  if (!confirm("重建为资料 ISO，不保留系统引导信息。继续？")) return;
  let entries;
  await run(async (engine) => {
    const all = workspace.entries(),
      files = await workspace.extract(
        all.map((e) => e.path),
        engine,
      );
    entries = [
      ...all
        .filter((e) => e.directory)
        .map((e) => ({ path: e.path, kind: "directory" })),
      ...files.map((e) => ({ ...e, kind: "file" })),
    ];
  });
  if (entries) {
    mode(false);
    window.dispatchEvent(
      new CustomEvent("image-rebuild", {
        detail: { entries, protectedHandles },
      }),
    );
  }
};
window.addEventListener("beforeunload", (e) => {
  if (busy || workspace.frames.some((f) => f.dirty)) {
    e.preventDefault();
    e.returnValue = "";
  }
});
render();
