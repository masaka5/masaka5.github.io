# 演示文稿（静态集成）

上游：https://github.com/duchao-duchao/web-ppt
固定版本：6d07815384197d7e7409b5af9743db6ea39bc29a（MIT，见 LICENSE）。

本集成保留实际上游 React Canvas / ElementRenderer / Zustand presentationStore / zundo 历史及 PPTElement / Slide 模型，采用 Vite 构建；工具栏与属性栏为静态版本重新整合。没有服务端、协作连接、外部字体、外部图片或数据上传。

## 重建

在 _scratch/web-ppt-build 下运行：

    npm ci --no-audit --no-fund
    npm run build

输出为 toolbox-site/tools/web-ppt。package-lock.json 固定依赖版本。Node.js 24.16.0 / npm 11.13.0 已验证。

## 使用

文本、图片、矩形/圆形/三角形/圆角矩形、幻灯片、拖动、缩放、旋转、层级、复制粘贴、撤销重做和预览。项目自动写入当前浏览器的 IndexedDB，含图片 data URL。JSON 项目导入上限 30 MB、200 页、3000 元素；单张图片上限 8 MB。导入验证失败保留当前草稿。

导出项目为可重新编辑的 JSON；导出演示文件为真实 PPTX，文本、内嵌图片和基本形状可编辑。画布比例 5:3。PPTX 导出不包含上游动画/时间线；静态工具栏不提供动画编排。文件操作只由点击导入/导出触发。

## 浏览器验收

    python _scratch/ops-tests/web-ppt-browser.py
    python _scratch/ops-tests/web-ppt-editing.py

可设置 TOOLBOX_TEST_BASE 为发布站点的 HTTPS 根地址。
