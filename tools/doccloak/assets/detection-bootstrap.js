const packedUrl = "/tools/doccloak/assets/detection.worker-QZhT_-xF.js.gz?v=20261117";
let worker = null;
const pending = [];
self.onmessage = (event) => {
  if (worker) worker.postMessage(event.data, event.ports || []);
  else pending.push(event.data);
};
(async () => {
  const response = await fetch(packedUrl, { cache: "force-cache" });
  if (!response.ok || !response.body)
    throw new Error("检测引擎加载失败");
  if (typeof DecompressionStream !== "function")
    throw new Error("当前浏览器不支持本地检测引擎解压");
  const source = await new Response(
    response.body.pipeThrough(new DecompressionStream("gzip")),
  ).text();
  const assetRoot = new URL("/tools/doccloak/", self.location.href).href;
  const runtimeSource = source
    .replace('paths:"/tools/doccloak/"', "paths:" + JSON.stringify(assetRoot))
    .replaceAll('new URL("/tools/doccloak/', 'new URL("' + assetRoot);
  const url = URL.createObjectURL(
    new Blob([runtimeSource], { type: "text/javascript" }),
  );
  worker = new Worker(url, { type: "module" });
  worker.onmessage = (event) => self.postMessage(event.data);
  worker.onerror = (event) =>
    self.postMessage({
      type: "error",
      error: event.message || "检测引擎运行失败",
    });
  while (pending.length) worker.postMessage(pending.shift());
})().catch((error) =>
  self.postMessage({ type: "error", error: error.message || "检测引擎加载失败" }),
);
