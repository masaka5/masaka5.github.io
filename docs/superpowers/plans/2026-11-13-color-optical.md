# 彩色光学传输实施计划

当前会话直接执行；用户已明确功能、界面清理和既有部署目标。

- [x] color.test.mjs先验证缺失的彩色协议标志/三通道栅格，再实现fountain.mjs、grid.mjs。
- [x] fountain-worker.mjs批位置扩展到27，按RGB每通道独立QR生成；保持单码兼容。
- [x] color.mjs提取色彩平面，decode-worker.mjs按通道定位和跟踪；camera.mjs图片与降级同步。
- [x] FountainSend.jsx增加彩色/黑白选择，按三通道计算轮帧；清除界面源码与许可链接。
- [x] color-browser.py直接测试生产worker、颜色畸变、旋转和完整下载；color-camera.py连续视频。
- [ ] 完成单元/黑白回归/跨浏览器/离线与布局，打包<1GiB，推送Pages并线上验证。

验证：22项Node测试通过。Chromium/Firefox/Edge直接生产WASM识别3/6/12/18/27片，
偏色、旋转、蓝通道丢失仍保存其余通道、刷新/离线/下载校验通过。
1920×1080 YUV420模拟摄像头双彩色码(6片)漏首帧仍恢复90KB，约1秒；
非实体手机吞吐量承诺。原黑白9码、加密多文件、旧缓存升级和14视口回归通过。
源码/许可入口16工具×2视口无可见链接，静态全站HTML检查只发现并移除了VM项目源码入口。
独立代码复核发现彩色环境PFR2过滤问题已修复，repair-color.py通过；
同步补齐fallback超过9片批处理。无剩余重要复核缺陷。
