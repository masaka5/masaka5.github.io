import { bugcheckInfo, stopCodeReference } from "./bugchecks.js";
const $ = (id) => document.getElementById(id);
let records = [],
  nextId = 1,
  activeId = null,
  compared = new Set(),
  tab = "overview",
  worker = null,
  busy = false,
  cancelled = false,
  settleJob = null;
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function message(text, error = false) {
  $("status").textContent = text;
  $("status").dataset.tone = error ? "error" : "";
}
const bytes = (n) =>
  n < 1024
    ? n + " B"
    : (n / 1024 ** (n < 1048576 ? 1 : n < 1073741824 ? 2 : 3)).toFixed(1) +
      " " +
      (n < 1048576 ? "KiB" : n < 1073741824 ? "MiB" : "GiB");
const when = (value) =>
  value && Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleString("zh-CN", { hour12: false })
    : "未记录";
const typeName = (result) =>
  !result ? "—" : result.kind === "kernel" ? "系统转储" : "程序转储";
const codeOf = (result) =>
  result?.bugcheck?.code || result?.exception?.code || "—";
const evidenceName = (value) =>
  ({
    "triage-driver-list": "转储驱动列表",
    "minidump-module-list": "转储模块列表",
  })[value] || value;
function lock(value) {
  busy = value;
  $("addFiles").disabled = value;
  $("clear").disabled = value || !records.length;
  $("cancel").hidden = !value;
  $("dumpFiles").disabled = value;
  for (const button of $("dumpRows").querySelectorAll("[data-remove]"))
    button.disabled = value;
}
function report() {
  return {
    tool: "蓝屏分析",
    schemaVersion: 1,
    parserVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    records: records.map(({ file, ...record }) => record),
    note: "地址关联不代表故障原因；无符号地址扫描不等于调用栈展开。",
  };
}
function save(blob, name) {
  const url = URL.createObjectURL(blob),
    a = el("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function renderRecords() {
  const query = $("search").value.toLocaleLowerCase();
  const shown = records.filter((r) =>
    [
      r.name,
      r.error,
      codeOf(r.result),
      r.result?.bugcheck && bugcheckInfo(r.result.bugcheck.code).name,
      ...(r.result?.modules || []).map((m) => m.path || m.name),
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  $("empty").hidden = !!records.length;
  $("dumpTable").hidden = !records.length;
  $("counts").textContent = records.length
    ? `${records.filter((r) => r.state === "done").length} / ${records.length}`
    : "";
  const fragment = document.createDocumentFragment();
  for (const r of shown) {
    const tr = el("tr");
    tr.dataset.active = String(r.id === activeId);
    tr.dataset.state = r.state;
    const check = el("td"),
      box = el("input");
    box.type = "checkbox";
    box.checked = compared.has(r.id);
    box.disabled = !r.result;
    box.setAttribute("aria-label", "对比 " + r.name);
    box.onchange = () => {
      if (box.checked && compared.size >= 2) {
        box.checked = false;
        return message("最多选择两份转储进行对比");
      }
      box.checked ? compared.add(r.id) : compared.delete(r.id);
      $("compareCount").textContent = String(compared.size);
      if (tab === "compare") renderDetail();
    };
    check.append(box);
    const name = el("td"),
      open = el("button", r.name);
    open.dataset.open = String(r.id);
    open.onclick = () => {
      activeId = r.id;
      renderRecords();
      renderDetail();
    };
    name.append(
      open,
      el(
        "small",
        r.state === "error"
          ? r.error
          : r.state === "queued"
            ? "等待解析"
            : r.state === "working"
              ? "正在解析"
              : bytes(r.size) + (r.result?.complete ? "" : " · 部分信息"),
      ),
    );
    const time = el("td", when(r.result?.crashTime)),
      code = el("td", codeOf(r.result), "code");
    if (r.result?.bugcheck)
      code.append(el("small", bugcheckInfo(r.result.bugcheck.code).name));
    const type = el("td", typeName(r.result)),
      remove = el("td"),
      button = el("button", "×");
    button.dataset.remove = String(r.id);
    button.disabled = busy;
    button.setAttribute("aria-label", "移除 " + r.name);
    button.onclick = () => {
      records = records.filter((x) => x.id !== r.id);
      compared.delete(r.id);
      if (activeId === r.id) activeId = records[0]?.id ?? null;
      renderRecords();
      renderDetail();
    };
    remove.append(button);
    tr.append(check, name, time, code, type, remove);
    fragment.append(tr);
  }
  $("dumpRows").replaceChildren(fragment);
  $("exportJSON").disabled = $("exportText").disabled = !records.length;
  $("clear").disabled = busy || !records.length;
  $("compareCount").textContent = String(compared.size);
}
function datum(parent, label, value, wide = false) {
  const node = el("div", undefined, "datum" + (wide ? " wide" : ""));
  node.append(
    el("dt", label),
    el("dd", value == null ? "未记录" : String(value)),
  );
  parent.append(node);
}
function renderOverview(r) {
  const result = r.result,
    body = $("detailBody");
  if (!result) {
    body.append(el("div", r.error || "正在等待解析", "detail-empty"));
    return;
  }
  const code = result.bugcheck || result.exception;
  if (code) {
    body.append(el("h2", code.code, "code-title"));
    if (result.bugcheck) {
      const info = bugcheckInfo(code.code);
      body.append(
        el("p", info.name, "mono"),
        el("p", info.description, "code-description"),
      );
    } else
      body.append(
        el(
          "p",
          "程序异常 · " + (code.address || "地址未记录"),
          "code-description",
        ),
      );
  }
  const fields = el("dl", undefined, "overview");
  datum(fields, "转储格式", result.format);
  datum(fields, "处理器", result.architecture);
  datum(fields, "系统", result.system);
  datum(fields, "发生时间", when(result.crashTime));
  datum(fields, "文件大小", bytes(r.size));
  datum(fields, "已记录模块", result.modules?.length || 0);
  if (code?.parameters?.length) {
    const params = el("div", undefined, "params");
    code.parameters.forEach((p, i) =>
      params.append(el("span", `参数 ${i + 1}  ${p}`)),
    );
    const field = el("div", undefined, "datum wide");
    field.append(el("dt", result.bugcheck ? "停止参数" : "异常参数"), params);
    fields.append(field);
  }
  body.append(fields);
  if (result.warnings?.length) {
    const list = el("ul", undefined, "warnings");
    for (const warning of result.warnings) list.append(el("li", warning));
    body.append(list);
  }
  const note = el(
    "p",
    "地址关联不代表故障原因。未加载调试符号。",
    "evidence-note",
  );
  if (result.bugcheck) {
    const a = el("a", "停止代码参考");
    a.href = stopCodeReference;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.marginLeft = "12px";
    note.append(a);
  }
  body.append(note);
}
function pagedTable(headings, rows, options = {}) {
  const wrap = el("div"),
    table = el("table", undefined, "detail-table"),
    thead = el("thead"),
    hr = el("tr"),
    tbody = el("tbody"),
    pager = el("div", undefined, "pager");
  let page = 0;
  headings.forEach((h) => hr.append(el("th", h)));
  thead.append(hr);
  table.append(thead, tbody);
  wrap.append(table, pager);
  const previous = el("button", "←"),
    next = el("button", "→"),
    count = el("span");
  previous.setAttribute("aria-label", "上一页");
  next.setAttribute("aria-label", "下一页");
  pager.append(previous, count, next);
  function draw() {
    tbody.replaceChildren(
      ...rows.slice(page * 100, page * 100 + 100).map((cells) => {
        const tr = el("tr");
        cells.forEach((value, i) => {
          const td = el(
            "td",
            value ?? "—",
            options.mono?.includes(i) ? "mono" : "",
          );
          tr.append(td);
        });
        return tr;
      }),
    );
    const pages = Math.max(1, Math.ceil(rows.length / 100));
    count.textContent = `${page + 1} / ${pages} · ${rows.length}`;
    previous.disabled = !page;
    next.disabled = page >= pages - 1;
    pager.hidden = pages === 1;
  }
  previous.onclick = () => {
    page--;
    draw();
  };
  next.onclick = () => {
    page++;
    draw();
  };
  draw();
  return wrap;
}
function renderModules(result) {
  const modules = result?.modules || [];
  if (!modules.length)
    return $("detailBody").append(
      el("div", "该转储未提供可解析的模块列表", "detail-empty"),
    );
  const input = el("input", undefined, "module-filter");
  input.type = "search";
  input.placeholder = "搜索驱动或模块";
  input.setAttribute("aria-label", "搜索驱动或模块");
  const target = el("div");
  const draw = () =>
    target.replaceChildren(
      pagedTable(
        ["模块 / 路径", "地址范围", "版本 / 时间戳", "关联依据"],
        modules
          .filter((m) =>
            (m.path || m.name || "")
              .toLocaleLowerCase()
              .includes(input.value.toLocaleLowerCase()),
          )
          .map((m) => [
            m.path || m.name,
            `${m.base} – ${m.end}`,
            `${m.version || "未记录"}\n${m.timestamp ? when(typeof m.timestamp === "number" ? new Date(m.timestamp * 1000).toISOString() : m.timestamp) : "时间戳未记录"}`,
            Array.isArray(m.evidence)
              ? m.evidence.map(evidenceName).join("；")
              : evidenceName(m.evidence) || "已加载模块",
          ]),
        { mono: [1] },
      ),
    );
  input.oninput = draw;
  $("detailBody").append(
    input,
    target,
    el(
      "p",
      "模块时间戳是编译标记，不是蓝屏时间。关联不代表已确认的故障驱动。",
      "evidence-note",
    ),
  );
  draw();
}
function renderAddresses(result) {
  const addresses = result?.addresses || [];
  if (!addresses.length)
    return $("detailBody").append(
      el("div", "该转储未提供可解析的地址记录", "detail-empty"),
    );
  const sourceNames = {
    "stack-scan": "栈内地址扫描",
    "exception-address": "异常地址",
    "bugcheck-parameter": "停止参数",
    exception: "异常地址",
    bugcheck: "停止参数",
    context: "上下文指令地址",
    instruction: "指令地址",
  };
  $("detailBody").append(
    pagedTable(
      ["地址", "关联模块", "偏移", "来源"],
      addresses.map((a) => [
        a.address,
        a.module || "未匹配",
        a.offset || "—",
        sourceNames[a.source] || a.source || "记录地址",
      ]),
      { mono: [0, 2] },
    ),
    el(
      "p",
      "栈内扫描仅匹配地址范围，不是调试器展开的调用栈。",
      "evidence-note",
    ),
  );
}
function renderCompare() {
  const pair = records.filter((r) => compared.has(r.id) && r.result);
  if (pair.length !== 2)
    return $("detailBody").append(
      el("div", "勾选两份转储进行对比", "detail-empty"),
    );
  const table = el("table", undefined, "detail-table compare-table"),
    head = el("tr");
  const parameterCount = Math.max(
    4,
    ...pair.map(
      (r) => (r.result.bugcheck || r.result.exception)?.parameters?.length || 0,
    ),
  );
  ["项目", ...pair.map((r) => r.name)].forEach((x) => head.append(el("th", x)));
  const thead = el("thead");
  thead.append(head);
  table.append(thead);
  const values = (r) => {
    const result = r.result,
      code = result.bugcheck || result.exception;
    return [
      typeName(result),
      code?.code || "未记录",
      result.bugcheck ? bugcheckInfo(code.code).name : "程序异常",
      when(result.crashTime),
      result.architecture,
      result.system,
      ...Array.from(
        { length: parameterCount },
        (_, i) => code?.parameters?.[i] || "未记录",
      ),
      (result.modules || []).length,
    ];
  };
  const columns = pair.map(values),
    labels = [
      "类型",
      "停止代码 / 异常",
      "代码名称",
      "发生时间",
      "处理器",
      "系统",
      ...Array.from({ length: parameterCount }, (_, i) => `参数 ${i + 1}`),
      "模块数",
    ];
  labels.forEach((label, i) => {
    const tr = el("tr");
    tr.dataset.different = String(
      String(columns[0][i]) !== String(columns[1][i]),
    );
    [label, columns[0][i], columns[1][i]].forEach((v) =>
      tr.append(el("td", v ?? "未记录")),
    );
    table.append(tr);
  });
  $("detailBody").append(table);
}
function renderDetail() {
  $("detailBody").replaceChildren();
  const r = records.find((r) => r.id === activeId);
  $("activeName").textContent = r?.name || "";
  for (const b of document.querySelectorAll("[data-tab]"))
    b.setAttribute("aria-pressed", String(b.dataset.tab === tab));
  if (tab === "compare") return renderCompare();
  if (!r)
    return $("detailBody").append(
      el("div", "选择一份转储查看详情", "detail-empty"),
    );
  if (tab === "overview") renderOverview(r);
  else if (tab === "modules") renderModules(r.result);
  else renderAddresses(r.result);
}
function analyze(record) {
  return new Promise((resolve, reject) => {
    let ended = false,
      timer;
    const finish = (error, result) => {
      if (ended) return;
      ended = true;
      clearTimeout(timer);
      worker?.terminate();
      worker = null;
      settleJob = null;
      error ? reject(error) : resolve(result);
    };
    settleJob = finish;
    try {
      worker = new Worker(new URL("./dump-worker.js", import.meta.url), {
        type: "module",
      });
      timer = setTimeout(
        () => finish(Error("解析引擎加载超时，请重试")),
        30000,
      );
      worker.onmessage = ({ data }) => {
        if (data.type === "ready") {
          clearTimeout(timer);
          worker.postMessage({
            type: "start",
            id: record.id,
            file: record.file,
          });
        } else if (data.type === "progress") {
          message(
            "正在解析 " +
              record.name +
              (data.message ? " · " + data.message : ""),
          );
        } else if (data.type === "result") {
          finish(null, data.result);
        } else if (data.type === "error")
          finish(Error(data.message || "无法解析转储"));
      };
      worker.onerror = (e) => {
        e.preventDefault();
        finish(Error(e.message || "解析进程异常"));
      };
      worker.onmessageerror = () => finish(Error("解析结果传输失败"));
    } catch (e) {
      finish(e);
    }
  });
}
async function addFiles(files) {
  if (busy || !files.length) return;
  const available = 32 - records.length;
  if (files.length > available)
    return message("最多保留 32 份转储，请先移除部分记录", true);
  const added = files.map((file) => ({
    id: nextId++,
    name: file.name,
    size: file.size,
    file,
    state: "queued",
    result: null,
    error: null,
  }));
  records.push(...added);
  if (activeId === null) activeId = added[0].id;
  cancelled = false;
  lock(true);
  renderRecords();
  try {
    for (const record of added) {
      if (cancelled) {
        record.state = "error";
        record.error = "已取消";
        continue;
      }
      record.state = "working";
      renderRecords();
      message("正在解析 " + record.name);
      try {
        record.result = await analyze(record);
        record.state = "done";
      } catch (e) {
        record.error = e.name === "AbortError" ? "已取消" : e.message;
        record.state = "error";
      }
      record.file = null;
      renderRecords();
      renderDetail();
    }
  } finally {
    for (const r of added) r.file = null;
    lock(false);
    renderRecords();
    message(
      cancelled
        ? "已取消，已完成的记录仍保留"
        : `已处理 ${added.length} 份 · ${added.filter((r) => r.state === "error").length} 份未解析`,
    );
  }
}
$("addFiles").onclick = $("emptyAdd").onclick = () => $("dumpFiles").click();
$("dumpFiles").onchange = () => {
  const files = [...$("dumpFiles").files];
  $("dumpFiles").value = "";
  addFiles(files);
};
$("cancel").onclick = () => {
  cancelled = true;
  settleJob?.(new DOMException("已取消", "AbortError"));
};
$("clear").onclick = () => {
  if (busy) return;
  records = [];
  compared.clear();
  activeId = null;
  renderRecords();
  renderDetail();
  message("拖入 .dmp 文件，最多 32 份。");
};
$("search").oninput = renderRecords;
for (const button of document.querySelectorAll("[data-tab]"))
  button.onclick = () => {
    tab = button.dataset.tab;
    renderDetail();
  };
$("exportJSON").onclick = () =>
  save(
    new Blob([JSON.stringify(report(), null, 2)], { type: "application/json" }),
    "蓝屏分析.json",
  );
$("exportText").onclick = () => {
  const lines = ["蓝屏分析", "解析器版本：1.0.0", ""];
  for (const r of records) {
    const d = r.result,
      code = d?.bugcheck || d?.exception;
    lines.push(
      r.name,
      typeName(d) + " · " + (d?.format || r.error || r.state),
      "发生时间：" + (d?.crashTime || "未记录"),
      "处理器：" + (d?.architecture || "未记录"),
      "系统：" + (d?.system || "未记录"),
      "异常地址：" + (d?.exception?.address || "未记录"),
      (d?.bugcheck ? "停止代码：" : "异常代码：") + (code?.code || "未记录"),
      ...(code?.parameters || []).map((v, i) => `参数 ${i + 1}：${v}`),
      ...(d?.modules || []).map(
        (m) =>
          `${m.path || m.name}  ${m.base} – ${m.end}\n大小：${m.size}  版本：${m.version || "未记录"}  时间戳：${m.timestamp || "未记录"}\n关联依据：${Array.isArray(m.evidence) ? m.evidence.map(evidenceName).join("；") : evidenceName(m.evidence) || "未记录"}`,
      ),
      ...(d?.addresses || []).map(
        (a) =>
          `地址：${a.address}  模块：${a.module || "未匹配"}  偏移：${a.offset || "未记录"}  来源：${a.source}`,
      ),
      ...(d?.warnings || []),
      "",
    );
  }
  lines.push("地址关联不代表故障原因；未加载调试符号。");
  save(
    new Blob(["\ufeff" + lines.join("\r\n")], {
      type: "text/plain;charset=utf-8",
    }),
    "蓝屏分析.txt",
  );
};
$("dropZone").ondragover = (e) => {
  e.preventDefault();
  if (!busy) $("dropZone").classList.add("dragging");
};
$("dropZone").ondragleave = (e) => {
  if (!$("dropZone").contains(e.relatedTarget))
    $("dropZone").classList.remove("dragging");
};
$("dropZone").ondrop = (e) => {
  e.preventDefault();
  $("dropZone").classList.remove("dragging");
  addFiles([...e.dataTransfer.files]);
};
window.addEventListener("beforeunload", (e) => {
  if (busy) {
    e.preventDefault();
    e.returnValue = "";
  }
});
renderRecords();
renderDetail();
