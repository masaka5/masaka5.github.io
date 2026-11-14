import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import{existsSync}from'node:fs';
const root = fileURLToPath(new URL("./", import.meta.url)),
  deps = existsSync(new URL('./node_modules/esbuild',import.meta.url))?path.join(root,'node_modules'):fileURLToPath(new URL("../anki/node_modules", import.meta.url)),
  aiRoot = fileURLToPath(new URL("../ai/", import.meta.url));
const require = createRequire(path.join(deps,'../package.json')),
  { build } = require("esbuild");
const result = await build({
  entryPoints: [path.join(root, "src/app.jsx")],
  outfile: path.join(root, "assets/app.js"),
  nodePaths: [deps],
  external: ["../*.mjs", "../../ai/*", "../../../assets/*"],
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2022"],
  legalComments: "none",
  metafile: true,
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});
let worker = await readFile(
  path.join(aiRoot, "local-ai-worker-source.js"),
  "utf8",
);
if (
  !worker.includes("messages,thinking=true") ||
  !worker.includes("initialPrefix:'<think>'")
)
  throw Error("AI adapter contract changed");
worker = worker
  .replace("messages,thinking=true", "messages,thinking=false")
  .replace("initialPrefix:'<think>'", "initialPrefix:''");
const summaryBuild = await build({
  stdin: {
    contents: worker,
    resolveDir: aiRoot,
    sourcefile: "summary-worker-source.js",
  },
  outfile: path.join(root, "assets/summary-worker.js"),
  nodePaths: [
    deps,
    fileURLToPath(
      new URL("../../../_scratch/local-ai-build/node_modules", import.meta.url),
    ),
  ],
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  legalComments: "none",
  metafile: true,
  plugins: [
    {
      name: "shared-ai-runtime",
      setup(b) {
        b.onLoad({ filter: /spark-runtime\.mjs$/ }, async (args) => ({
          contents: (await readFile(args.path, "utf8")).replace(
            "new URL('./ort/',import.meta.url)",
            "new URL('../../ai/assets/ort/',import.meta.url)",
          ),
          loader: "js",
        }));
        b.onResolve({ filter: /assets\/pi-runtime\.js$/ }, () => ({
          path: "../../ai/assets/pi-runtime.js?v=20261114-spark1",
          external: true,
        }));
        b.onResolve({ filter: /^onnxruntime-web\/webgpu$/ }, () => ({
          path: "../../ai/assets/ort/ort.webgpu.bundle.min.mjs",
          external: true,
        }));
      },
    },
  ],
});
const files = ["app.js", "app.css", "summary-worker.js", "../../assets/tool-use.mjs", "../../assets/usage.js", "../../assets/usage-config.json"],
  artifacts = {};
for (const file of files) {
  const bytes = await readFile(file.startsWith("../../") ? path.resolve(root, file) : path.join(root, "assets", file));
  artifacts[file] = {
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
for(const file of ['client.mjs','capture.mjs','core.mjs','storage.mjs','media.mjs','worker.mjs','models.mjs','summary-client.mjs','vendor/sherpa.mjs','vendor/sherpa.wasm','vendor/asr.mjs','vendor/vad.mjs','vendor/speaker-diarization.mjs','vendor/silero_vad.onnx','vendor/campplus.onnx']){const bytes=await readFile(path.join(root,file));artifacts[file]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
const shell=(await readFile(path.join(root,'sw.js'),'utf8')).replace(/pocket-minutes-shell-[a-z0-9-]+/g,'pocket-minutes-shell-BUILD').replace(/app\.(js|css)\?v=[a-z0-9-]+/g,'app.$1?v=BUILD');
const version=createHash('sha256').update(JSON.stringify(artifacts)).update(shell).digest('hex').slice(0,12);
for (const file of ["index.html", "sw.js"]) {
  let text = await readFile(path.join(root, file), "utf8");
  text = text
    .replace(
      /app\.(js|css)\?v=[a-z0-9-]+/g,
      (_, ext) => `app.${ext}?v=${version}`,
    )
    .replace(
      /pocket-minutes-shell-[a-z0-9-]+/g,
      `pocket-minutes-shell-${version}`,
    );
  await writeFile(path.join(root, file), text);
}
await writeFile(
  path.join(root, "manifest.json"),
  JSON.stringify(
    {
      name: "会议纪要",
      engine: "sherpa-onnx 2.0.1 SIMD WASM",
      model: "Fun-ASR-Nano INT8",
      revision: "6f16bd378457e13f36ccf3910df9017f96c346fb",
      summary: "Spark-X2.6-4B Q4 + Pi; direct-answer document mode",
      version,
      artifacts,
    },
    null,
    2,
  ) + "\n",
);
const notices = [];
for (const input of [...Object.keys(result.metafile.inputs),...Object.keys(summaryBuild.metafile.inputs)]) {
  const normalized=path.resolve(input).replaceAll('\\','/'),at=normalized.lastIndexOf('/node_modules/');
  const match=at<0?null:normalized.slice(at).match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (!match || notices.some((p) => p.name === match[1])) continue;
  const name = match[1],
    folder = normalized.slice(0,at+'/node_modules/'.length)+name,
    pkg = JSON.parse(await readFile(path.join(folder, "package.json"), "utf8"));
  let texts = [];
  for (const file of await readdir(folder))
    if (/^(licen[sc]e|notice|copying)([.\-_]|$)/i.test(file)) {
      try {
        texts.push(await readFile(path.join(folder, file), "utf8"));
      } catch {}
    }
  if (!texts.length) {
    const cached = path.join(
      root,
      "notices",
      name.replaceAll("/", "_") + ".txt",
    );
    texts = [await readFile(cached, "utf8")];
  }
  notices.push({ name, version: pkg.version, text: texts.join("\n") });
}
for (const name of [
  "sherpa",
  "emscripten",
  "funasr",
  "campplus",
  "pyannote",
  "silero",
])
  notices.push({
    name,
    version: "",
    text: await readFile(
      path.join(root, "notices", name + "-LICENSE"),
      "utf8",
    ),
  });
await writeFile(
  path.join(root, "THIRD-PARTY-NOTICES.txt"),
  notices
    .map((n) => `===== ${n.name} ${n.version} =====\n${n.text}`)
    .join("\n\n"),
);
console.log(JSON.stringify({ version, artifacts }));
