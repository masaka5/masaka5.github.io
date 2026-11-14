# AI 助手移动端界面优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 优化 AI 助手桌面与移动端布局，同时保持模型和业务逻辑不变。

**Architecture:** 只修改 `ai.css` 的布局样式和 `index.html` 的语义辅助属性；通过现有 `ai.js` 入口验证交互，不改模型运行时与会话数据结构。移动端使用 CSS 媒体查询处理安全区、窄屏按钮和弹窗。

**Tech Stack:** 原生 HTML/CSS/ES modules、Playwright、现有口袋工具箱设计变量。

## Global Constraints

- 不新增依赖或服务。
- 不修改模型、附件格式、上下文压缩、会话持久化和 API 请求逻辑。
- 保持中文界面和现有功能入口。

### Task 1: 优化 AI 页面布局样式

**Files:**
- Modify: `toolbox-site/tools/ai/ai.css`

- [ ] 调整 shell、顶部栏、工具栏、对话区和 composer 的最小/最大尺寸，使窄屏不会被固定宽度撑开。
- [ ] 增加安全区、软键盘和横屏规则，保持发送区可见。
- [ ] 调整按钮和附件列表的溢出策略，避免文字和控件相互挤压。
- [ ] 调整 dialog 在小屏幕上的宽度、边距和底部安全区。

### Task 2: 增强可用性语义

**Files:**
- Modify: `toolbox-site/tools/ai/index.html`

- [ ] 为顶部操作和输入区补充稳定的 `aria-label`/`title`，不增加可见冗余文案。
- [ ] 保持现有按钮 id 和表单结构，确保 `ai.js` 无需改动。

### Task 3: 浏览器回归验证

**Files:**
- Create: `_scratch/ops-tests/ai-mobile-browser.py`

- [ ] 使用 Playwright 检查四种视口的横向溢出。
- [ ] 检查本地模型入口、接口设置弹窗、附件按钮、发送快捷键控件可见。
- [ ] 检查页面无 `pageerror`。

### Task 4: 同步并发布

**Files:**
- Sync: `_scratch/masaka5-toolbox-upstream/tools/ai`
- Sync: `_scratch/masaka5-toolbox-upstream/docs/superpowers/specs/2026-11-14-ai-mobile-ui-design.md`
- Sync: `_scratch/masaka5-toolbox-upstream/docs/superpowers/plans/2026-11-14-ai-mobile-ui.md`

- [ ] 运行回归测试和 `git diff --check`。
- [ ] 提交并推送 `main`。
- [ ] 等待 GitHub Pages 当前提交构建完成，并请求线上 AI 页面。
