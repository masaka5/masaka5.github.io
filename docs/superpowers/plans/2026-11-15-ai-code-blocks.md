# AI 助手代码块交互 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 AI 助手的本地和接口回复中识别 Markdown 代码块，提供单段复制、单段折叠以及当前回复全部隐藏/显示。

**Architecture:** 新增无依赖的 `message-render.mjs`，负责代码围栏解析和安全 DOM 渲染；`ai.js` 保留消息生命周期和流式状态，只把正文更新委托给渲染器。通过类名和 `data-code-blocks` 标记接入现有 CSS，避免影响模型 Worker。

**Tech Stack:** 原生 ES modules、DOM `details`、Node `node:test`、现有 CSS/Clipboard 封装。

## Global Constraints

- 不解析或执行模型返回的 HTML/脚本。
- 不新增运行时依赖。
- 本地模型、接口模式、历史记录、流式生成和导出行为保持兼容。
- 未闭合代码围栏继续按普通文本显示。

### Task 1: 纯解析与渲染模块

**Files:**
- Create: `tools/ai/message-render.mjs`
- Create: `tools/ai/message-render.test.mjs`

**Interfaces:**
- `parseMessageBlocks(text) -> Array<{type:'text'|'code', text:string, language:string}>`
- `renderMessageBody(container, text, {onCopy, onToggleAll}={}) -> {codeBlocks:number, toggleAll:Function|null}`

- [ ] **Step 1: Write parser tests**

覆盖普通文本、带语言代码块、无语言代码块、多段代码块、未闭合围栏，以及代码内部的反引号。

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tools/ai/message-render.test.mjs`

Expected: FAIL because the parser module does not exist.

- [ ] **Step 3: Implement parser and safe DOM renderer**

逐行扫描围栏；闭合围栏才创建代码块。普通文本使用 `textContent`，代码使用 `<pre><code>`。每个 `details.code-block` 包含语言标签、复制按钮和代码内容；返回的 `toggleAll()` 统一切换所有代码块。

- [ ] **Step 4: Run parser tests**

Run: `node --test tools/ai/message-render.test.mjs`

Expected: all parser tests pass.

- [ ] **Step 5: Commit parser**

Run: `git add tools/ai/message-render.mjs tools/ai/message-render.test.mjs && git commit -m "feat: add safe AI code block renderer"`

### Task 2: 接入 AI 消息生命周期

**Files:**
- Modify: `tools/ai/ai.js`
- Modify: `tools/ai/ai.css`
- Modify: `tools/ai/index.html`

**Interfaces:**
- `message()` 使用 `renderMessageBody()` 更新回复。
- `renderLocal()` 和接口流式回调调用同一个 `reply.setText()`。

- [ ] **Step 1: Replace direct body text writes**

导入渲染模块，在 `message()` 中为助手回复增加“隐藏代码”按钮；为 reply 保存 `setText(text)`，内部调用 `renderMessageBody`。本地和接口路径的流式更新统一调用 `reply.setText`，错误和历史回复也走同一入口。

- [ ] **Step 2: Add code panel styles**

增加代码面板、工具栏、语言标签、复制按钮和折叠状态样式；移动端保持宽度可用、长行横向滚动，沿用现有颜色变量。

- [ ] **Step 3: Add cache-busting version**

更新 AI 页面脚本引用和 Service Worker shell 缓存版本，确保用户不会拿到旧渲染器。

- [ ] **Step 4: Run syntax and parser regression checks**

Run: `node --check tools/ai/ai.js; node --check tools/ai/message-render.mjs; node --test tools/ai/message-render.test.mjs; node --test tools/ai/spark-cache.test.mjs`

Expected: syntax checks exit 0 and all tests pass.

- [ ] **Step 5: Commit integration**

Run: `git add tools/ai/ai.js tools/ai/ai.css tools/ai/index.html tools/ai/ai-sw.js tools/ai/message-render.mjs tools/ai/message-render.test.mjs && git commit -m "feat: add collapsible copyable AI code blocks"`

### Task 3: 浏览器交互验证与部署

**Files:**
- Verify: `tools/ai/index.html`, `tools/ai/ai.js`, `tools/ai/message-render.mjs`

- [ ] **Step 1: Verify local browser rendering**

打开本地 AI 页面，注入含两段代码的已完成助手消息，确认每段均有语言标签、复制、单段折叠；点击消息头按钮确认全部隐藏/显示。

- [ ] **Step 2: Verify safety and export**

使用包含 `<script>` 和代码围栏的文本，确认脚本以文本显示不执行；导出文本包含完整代码内容。

- [ ] **Step 3: Verify remote shell references**

确认远程页面返回新版本号和 `message-render.mjs`，Worker 文件内容不变。

- [ ] **Step 4: Push deployment**

Run: `git push origin HEAD:main`

- [ ] **Step 5: Final regression check**

Run: `git status --short; git log -3 --oneline; node --test tools/ai/message-render.test.mjs tools/ai/spark-cache.test.mjs`

Expected: clean worktree, deployed commit present, all tests pass.
