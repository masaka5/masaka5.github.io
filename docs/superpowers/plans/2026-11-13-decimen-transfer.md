# Decimen实施计划

按当前会话执行，保留已授权部署步骤；发布前按复核技能进行只读代码审查。

- [x] tests/grid.test.mjs：autoGrid、framePlan、QR固定掩码/多码栅格、CRC筛选、
  >4GiB位置。先失败再实现src/grid.mjs，使用vendor/decimen/qr-raster.ts。
- [x] src/fountain-worker.mjs新增grid-frame批生成/矩阵，单frame兼容；
  src/client.mjs支持转移缓冲；磁盘accept-batch有界，单次批最多9。
- [x] src/decode-worker.mjs包装自托管gzip WASM、tracked与full回退；
  src/decode-pool.mjs复用vendor/decimen/worker-pool.ts，最多2worker。
  camera.mjs原QR扫描保留降级，批结果顺序处理、取消和资源生命周期测试。
- [x] ui.jsx增加GridCode尺寸；FountainSend.jsx自动多码、预取与fps调度；
  FountainReceive.jsx计数速率、批接收背压；CameraView.jsx批回调和进度。
  设置保持中文Ant、源码许可入口、唤醒锁、无滚动。
- [x] 构建decode-worker.js与codec.wasm.gz，SW缓存/版本hash、sourceZIP许可。
  tests/grid-browser.py和grid-camera.py测试图片/getUserMedia、多码相对单码、
  漏扫重复/刷新/密码/离线以及原QR回归。
- [ ] 精确打包站点<1GiB、release-check、推送Pages、线上资源一致/扫描。

验证记录：20项Node测试通过；1/2/4/6/9码生产WASM实际解码和跟踪、
2294B M纠错、离线worker重启通过；四码10fps模拟摄像头视频漏扫首组仍恢复，
80KB文件约1秒（非实体手机实拍速率）。Firefox/Edge恢复、14视口、旧缓存升级、
刷新断点、密码、降级扫描通过。5GiB文件流式准备/恢复/哈希74秒通过，
不是5GiB全量摄像头传输。只读复核发现暂存清理和设备枚举状态问题，已修复；
双发送页锁保护与刷新孤儿回收测试通过。
