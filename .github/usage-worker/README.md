# 口袋工具箱点击统计

Workers 接收首页工具入口的打开事件，D1 累计全站次数。没有文件存储、浏览记录或用户身份数据。公开匿名事件不能证明独立真人，次数表示接受的打开事件，不是人数或成功执行次数。

部署：`npm ci`，创建 D1 `pocket-toolbox-usage` 并填写 wrangler.jsonc 的数据库 ID，执行 schema.sql，然后配置 Worker secrets `RATE_SALT`（随机值）和 `SNAPSHOT_TOKEN`（随机值），`npm run deploy`。不要在源码或网页保存 Cloudflare Token。

网站 endpoint 为 `https://pocket-toolbox-usage.pages.dev`，配置在 assets/usage-config.json。同一 Worker 作为 Pages 高级模式入口部署，绑定同一个 D1 和 secrets；保留 workers.dev 部署执行每日清理任务。允许来源只有 tools.manshii.asia 和 masaka5.github.io。每 IP 每分钟最多 60 个事件，以带服务端随机盐的短期哈希限流；原始 IP 不保存。重复 UUID 在八天内不会再次累加，本地未发送队列只保留一天。每日清理事件和限流行，不清理累计结果。Cloudflare 平台可能按其自身规则处理网络元数据。

GitHub workflow 每小时拉取 /snapshot，Bearer 使用仓库 secret `USAGE_SNAPSHOT_TOKEN`，Worker 地址使用变量 `USAGE_API_URL`。在 usage-data 独立分支保留 counts.json 和提交历史，不触发主分支 Pages 构建。快照可用于端点暂时失败时的只读回退。

右侧留言板使用同一数据库的 comments 表。昵称与正文为公开纯文本，不解释 HTML，不自动链接。评论不会被每日清理任务删除；每 IP 每十分钟最多三次发表，重复 UUID 重试不重复插入。限流仅存短期加盐哈希，不存 IP。匿名昵称不是已验证身份；不要发表密码或隐私信息。管理员可在 D1 将 hidden 设为 1 隐藏不当留言。

每小时快照同时将新增评论分批保存到 usage-data 分支 comments/ 目录；单批最多一百条，包含永久历史，索引为 comments/index.json。先验证已有快照、评论及游标，再以保留原树的非 force 提交更新；不会覆盖之前批次。Cloudflare 与 GitHub 的服务可用性和配额仍适用。

本地验证：`npm test`，`npx wrangler dev --port 8788` 与隔离的本地 D1；生产密钥必须通过环境或 secret API 传入。更新目录后将 catalog.js 的工具 ID 同步至 src/tool-ids.json 并部署 Worker。
