# 会议白板实施计划

**Goal:** 为现有在线会议增加房间内实时协作白板。
**Architecture:** Yjs 独立文档模型、WebRTC 同步适配器和 Canvas 视图分别实现；
由会议生命周期创建/销毁，视图切换不关闭媒体。静态部署，沿用现有主题。
**Tech Stack:** Yjs、Trystero、Canvas 2D、Pointer Events、IndexedDB。

- [x] 在 `_scratch/meeting-build/src/board-model.mjs` 实现 WhiteboardDoc，
  `add(shape)`, `edit(id,fields)`, `remove(ids)`, `clear()`, `undo()`, `redo()`，
  `encode()`, `vector()`, `diff(vector)`, `apply(update)`；先运行并发合并失败测试。
- [x] 新建 `board-sync.mjs`，消息首字节 0=状态向量、1=更新。构造时绑定 transport
  的 board/peerjoin 事件，入会及每 15 秒交换状态向量，关闭时释放监听和计时器。
  新增 transport.sendBoard(data,target) 和 board 事件，限制成员和数据包大小。
- [x] `board-ui.mjs` 实现工具栏、Canvas 坐标/命中/拖动、文字对话框、撤销重做、
  清空确认、PNG 下载。`board-storage.mjs` 写入 IndexedDB，保存/恢复失败可见。
  build 输出 meeting-board.js，原页面添加白板入口和样式。
- [ ] Node 模型测试与实际多浏览器 WebRTC 白板验证，回归现有会议媒体/聊天。
  更新源码包/许可/运行 manifest，检查 Pages 总容量，精确提交并部署验证。

已通过：6 项白板模型/同步单测、6 项原有会议单测、三端实际 WebRTC 绘图、
状态隔离后的并发合并、晚加入、刷新及重进、文字安全、PNG、原生触控、5 种
布局、音频 RTP 与聊天、原有多路屏幕共享媒体回归，及 Chromium/Firefox/Edge
同房间 CRDT 一致性。未进行实体手机与跨运营商网络测试。
