# Decimen 高速稳定光学传输

用户改为集成 bearea/decimen-optical，明确不使用PrismFlow。固定来源
5301fc2020716b5a97d4edf6e1793c3dedbf6e17，AGPL-3.0-or-later。
复用其 qr-raster、worker-pool 和 decimen-codec WASM的readFull/readTracked。
不采用上游64MB整体文件封装，继续本项目5GiB分代喷泉、分块压缩加密校验、
OPFS/IDB、补发、断点恢复。线上不与原版Decimen的DT帧互通，UI不误称互通。

默认自动显示1/2/4/6/9码，按显示区域及模块尺寸选择数量，密度可调，
小屏不盲目堆9个v40。每码独立PQF2、CRC/QR纠错，局部失败不丢其他码。
固定QR掩码4减少8路评分；worker批量编码，主线程只绘制单模块画布，
预取至多2帧，按实际绘制时刻调度，参数/页签/可见性变化取消旧请求。
默认20fps，可调1–60，超过刷新率不假称实际fps。高速不等于强制60fps。

解码最多2个worker，有界单帧在途，1080p/30设备能力内采集。
先定位所有码，再用上次角点readTracked；定期全帧重定位、失败回退。
支持GPU ImageBitmap传递/OffscreenCanvas和RGBA回退；QR图像和旋转可用。
接收批量CRC验证/磁盘顺序写入，相关与重复方程不重复写入，rank不虚增；背压有界。
显示独立源片恢复goodput，停止/隐藏/完成释放镜头与worker。
无信号给降低密度/速度建议，不错误中止镜头。屏幕唤醒锁best-effort。

源码及许可放工具源码下载和设置内源码入口，保留作者/无担保/许可文本。
WASM gzip自托管解压缓存，离线完整，版本隔离沿用2.0.1。页面布局延续Ant，
移动无整页滚动。测试多码/真实摄像头视频/离线/刷新/加密/跨浏览器及同源单码
对比，不挪用上游418.5KB/s作为本项目实测。站点精确发布小于1GiB。
