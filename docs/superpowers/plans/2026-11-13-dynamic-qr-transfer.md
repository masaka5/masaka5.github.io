# 动态二维码传输实施计划

**Goal:** 在现有工具箱增加完全本地运行的文件/文本动态二维码发送和摄像头接收。
**Architecture:** 协议和文件包为独立纯函数；worker 封装 Zstd 和 WebCrypto；React
页面只处理状态、二维码和摄像头，IndexedDB 保存原始帧，独立 SW 缓存静态资源。
**Tech Stack:** React 19、Ant Design 5、Zstd WASM、ZXing WASM、WebCrypto、IndexedDB。

按用户已授权范围在当前会话顺序实施，不委派子代理。

- [x] 协议与数据包：先写失败测试，覆盖乱序、重复、CRC、冲突会话和非法长度；
  `src/protocol.mjs` 导出 `encodeFrame`, `decodeFrame`, `Receiver`，`src/package.mjs`
  导出 `packFiles`, `unpackFiles`, `seal`, `open`。实现后运行 `npm test`。
- [x] WASM worker：`src/worker.mjs` 提供准备/恢复消息并转移 ArrayBuffer；
  `src/codec.mjs` 在确认压缩内容长度和 16 MiB 边界后调用 Zstd；实际 WASM
  测试普通文件、压缩后较小、不可压缩、密码错误和正确密码二次恢复。
- [x] 界面：`src/main.jsx`/`src/Send.jsx`/`src/Receive.jsx`/`src/style.css`，页签、
  文件抽屉、发送播放控制、密码设置、扫码进度、缺帧补发及校验后的下载；
  `src/storage.mjs` 负责 IndexedDB，`src/camera.mjs` 管理媒体轨道和扫码节流。
- [x] 离线：`sw.js` 原子缓存完整运行资源，`build.mjs` 固定运行清单，首次缓存
  完成后展示离线可用；浏览器关闭网络重新加载并使用 WASM 完成恢复。
- [ ] 集成与发布：新增 `qr-transfer` 至协作分类、目录、图标、云计数白名单；
  包含源代码、MIT/BSD 等许可、源码及运行哈希；验证 Pages 容量，精确 stage。
  完成实际二维码多帧互传、摄像头/刷新/密码/离线/布局测试后推送并检查线上。

已验证：7 项 Node 测试、Chromium 实际二维码/WASM 往返、动态视频摄像头采集、
加密多文件/错误密码重试、Firefox 与 Edge 接收、刷新续收、双向补帧码、
14 种发送/接收布局、断网重开后压缩和解码。未进行实体手机光学扫码实测。
