/* Window Management enhances placement; BroadcastChannel also works without it. */
window.createMonitorLink = function ({
  getState,
  applyState,
  onIntent,
  onEnd,
  startChild,
  patternCount,
}) {
  const $ = (id) => document.getElementById(id);
  const query = new URLSearchParams(location.search);
  const session = query.get("session");
  const isChild =
    query.get("display") === "1" && /^[a-f0-9]{32}$/.test(session || "");
  const randomId = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
      n.toString(16).padStart(2, "0"),
    ).join("");
  const id = isChild ? query.get("window") : randomId();
  let channel,
    sessionId,
    screens = [],
    details,
    ending = false,
    initialized = false,
    helloTimer;
  const windows = new Map();
  const screenKey = (screen) =>
    JSON.stringify([
      screen.label,
      screen.left ?? screen.availLeft,
      screen.top ?? screen.availTop,
      screen.width,
      screen.height,
    ]);
  function refreshScreens() {
    screens = Array.from(details.screens).slice(0, 16);
    for (const [key, entry] of windows) {
      if (!entry.screenKey) continue;
      const index = screens.findIndex(
        (screen) => screenKey(screen) === entry.screenKey,
      );
      if (index < 0) {
        try {
          entry.ref.close();
        } catch (_) {}
        windows.delete(key);
      } else entry.index = index;
    }
    render();
  }
  const status = (text) => {
    $("multiStatus").textContent = text;
  };
  const supported = typeof BroadcastChannel === "function";
  const send = (message) => channel?.postMessage({ ...message, sender: id });
  const validState = (state) =>
    state &&
    Number.isInteger(state.index) &&
    state.index >= 0 &&
    state.index < patternCount &&
    Number.isFinite(state.speed) &&
    state.speed >= 100 &&
    state.speed <= 1500 &&
    typeof state.paused === "boolean" &&
    Number.isFinite(state.elapsed) &&
    state.elapsed >= 0 &&
    state.elapsed < 1e12 &&
    Number.isFinite(state.sentAt);
  function connect(name) {
    channel?.close();
    channel = new BroadcastChannel("toolbox-monitor-" + name);
    sessionId = name;
    channel.onmessage = ({ data }) => {
      if (!data || typeof data !== "object" || data.sender === id) return;
      if (isChild) {
        if (data.target && data.target !== id) return;
        if (data.type === "state" && validState(data.state)) {
          clearInterval(helloTimer);
          applyState(data.state);
          if (!initialized) {
            initialized = true;
            startChild();
            attemptFullscreen();
          }
        } else if (data.type === "end") {
          ending = true;
          onEnd();
          window.close();
        }
      } else {
        if (!windows.has(data.sender)) return;
        if (data.type === "hello")
          send({ type: "state", target: data.sender, state: getState() });
        if (data.type === "intent") {
          const action = data.action;
          if (
            !action ||
            !["select", "pause", "speed", "end"].includes(action.kind)
          )
            return;
          if (
            action.kind === "select" &&
            (!Number.isInteger(action.index) ||
              action.index < 0 ||
              action.index >= patternCount)
          )
            return;
          if (
            action.kind === "speed" &&
            (!Number.isFinite(action.value) ||
              action.value < 100 ||
              action.value > 1500)
          )
            return;
          if (action.kind === "end") end();
          else onIntent(action);
        }
      }
    };
  }
  function ensure() {
    if (!supported) {
      status(
        "当前浏览器不支持多窗口联动，请使用新版 Chrome、Edge 或 Firefox。",
      );
      return false;
    }
    if (!channel) connect(randomId());
    ending = false;
    return true;
  }
  function render() {
    $("screenList").replaceChildren();
    screens.forEach((screen, index) => {
      const row = document.createElement("div");
      row.className = "screen-row";
      const label = document.createElement("span");
      label.textContent = `${screen.label || "显示器 " + (index + 1)}${screen.isPrimary ? " · 主屏" : ""}`;
      const size = document.createElement("small");
      size.textContent = `${screen.width} × ${screen.height}`;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.screen = String(index);
      const open = [...windows.values()].some(
        (w) => w.screenKey === screenKey(screen) && !w.ref.closed,
      );
      button.textContent = open ? "定位窗口" : "开始检测";
      button.onclick = () => openScreen(index);
      label.append(size);
      row.append(label, button);
      $("screenList").append(row);
    });
    $("allScreens").disabled = !screens.length || !supported;
    $("endScreens").disabled = !windows.size;
    $("manualScreen").disabled = !supported;
    $("multiTest").textContent = windows.size
      ? `多屏 ${windows.size}`
      : "多屏检测";
  }
  async function identify() {
    if (!window.getScreenDetails) {
      screens = [];
      render();
      status("当前浏览器不支持屏幕识别，可新增窗口后拖到其他屏幕并点击全屏。");
      return;
    }
    $("identifyScreens").disabled = true;
    try {
      details = await window.getScreenDetails();
      refreshScreens();
      status(`已识别 ${screens.length} 台显示器 · 允许弹窗后可全部启动`);
      details.onscreenschange = () => {
        refreshScreens();
        status("显示器已变更，可重新选择检测窗口。");
      };
    } catch (_) {
      screens = [];
      render();
      status("未获得屏幕识别权限，可新增窗口并手动移到其他屏幕。");
    } finally {
      $("identifyScreens").disabled = false;
    }
  }
  function openScreen(index = -1) {
    if (!ensure()) return false;
    const screen = screens[index];
    const existing = [...windows.values()].find(
      (w) => screen && w.screenKey === screenKey(screen) && !w.ref.closed,
    );
    if (existing) {
      existing.ref.focus();
      return true;
    }
    if (windows.size >= 16) {
      status("最多打开 16 个检测窗口");
      return false;
    }
    const windowId = randomId();
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("display", "1");
    url.searchParams.set("session", sessionId);
    url.searchParams.set("window", windowId);
    if (screen) url.searchParams.set("screen", screenKey(screen));
    const features = screen
      ? `popup=yes,left=${screen.availLeft},top=${screen.availTop},width=${screen.availWidth},height=${screen.availHeight}`
      : "popup=yes,width=1024,height=768";
    const ref = window.open(url.href, "monitor-" + windowId, features);
    if (!ref) {
      status("弹窗被拦截，请允许此站点弹窗，或逐台点击开始检测。");
      return false;
    }
    windows.set(windowId, {
      ref,
      index,
      screenKey: screen ? screenKey(screen) : null,
    });
    if (screen) {
      try {
        ref.moveTo(screen.availLeft, screen.availTop);
        ref.resizeTo(screen.availWidth, screen.availHeight);
      } catch (_) {}
    }
    render();
    status(`已打开 ${windows.size} 个检测窗口 · 图案与操作同步`);
    return true;
  }
  async function attemptFullscreen() {
    try {
      if (query.has("screen") && window.getScreenDetails) {
        const d = await window.getScreenDetails();
        const target = Array.from(d.screens).find(
          (screen) => screenKey(screen) === query.get("screen"),
        );
        if (target) {
          await $("testStage").requestFullscreen({ screen: target });
          return;
        }
      }
      await $("testStage").requestFullscreen();
    } catch (_) {
      /* User activation may be consumed: the in-window fullscreen button stays available. */
    }
  }
  function end() {
    if (ending) return;
    ending = true;
    if (isChild) {
      send({ type: "intent", action: { kind: "end" } });
      onEnd();
      return;
    }
    send({ type: "end" });
    for (const { ref } of windows.values()) {
      try {
        ref.close();
      } catch (_) {}
    }
    windows.clear();
    channel?.close();
    channel = null;
    render();
    status("多屏检测已结束");
  }
  $("multiTest").onclick = () => {
    $("multiPanel").showModal();
    render();
  };
  $("closeMultiPanel").onclick = () => $("multiPanel").close();
  $("identifyScreens").onclick = identify;
  $("manualScreen").onclick = () => openScreen();
  $("allScreens").onclick = () => {
    let failed = 0;
    screens.forEach((_, i) => {
      if (!openScreen(i)) failed++;
    });
    if (failed) status(`${failed} 台未打开，请允许弹窗或逐台开始检测。`);
  };
  $("endScreens").onclick = end;
  const closedTimer = setInterval(() => {
    if (isChild) {
      if (window.opener?.closed) {
        ending = true;
        onEnd();
        window.close();
      }
      return;
    }
    let changed = false;
    for (const [key, { ref }] of windows)
      if (ref.closed) {
        windows.delete(key);
        changed = true;
      }
    if (changed) {
      render();
      status(
        windows.size ? `还有 ${windows.size} 个检测窗口` : "检测窗口已关闭",
      );
    }
  }, 1000);
  window.addEventListener("pagehide", () => {
    clearInterval(closedTimer);
    clearInterval(helloTimer);
    if (!isChild) end();
    channel?.close();
  });
  if (isChild && supported) {
    document.body.classList.add("display-window");
    connect(session);
    helloTimer = setInterval(() => send({ type: "hello" }), 500);
    send({ type: "hello" });
    // A bookmarked or orphaned display URL remains usable without its controller.
    setTimeout(() => {
      if (!initialized) {
        startChild();
        $("fullscreenHint").textContent = "未连接控制页";
      }
    }, 3000);
  }
  return {
    isChild,
    get connected() {
      return isChild ? initialized && !!channel : windows.size > 0;
    },
    publish() {
      if (!isChild && windows.size) send({ type: "state", state: getState() });
    },
    intent(action) {
      if (isChild && initialized && !ending) {
        send({ type: "intent", action });
        return true;
      }
      return false;
    },
    end,
  };
};
