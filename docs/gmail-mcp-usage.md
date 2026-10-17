# Gmail MCP 日常使用指南

> AI 专用邮箱：`sucipnoto5@gmail.com`
> MCP 服务器：`@gongrzhe/server-gmail-autoauth-mcp`（已在 `.codex/config.toml` 启用）
> 配置日期：2026-10-09

## 启动宿主前：加载凭据

每次新开终端启动 AtomCode/Codex 前，先把环境变量挂上：

```bash
set -a; source ~/.config/gmail-mcp/env; set +a
```

之后正常启动宿主即可。MCP 会自动带出 19 个 Gmail 工具。

> Token 会自动续期，日常无需重新授权。若长期未用导致 refresh token 失效，
> 重跑 `python3 ~/.config/gmail-mcp/gmail_oauth.py` 再走一次浏览器授权。

## 对 AI 说什么（自然语言即可）

MCP 工具直接用自然语言驱动，常见说法和对应工具：

| 你说 | AI 调用的工具 |
|------|--------------|
| "看看收件箱最近 5 封" | `search_emails`（query: `in:inbox`） |
| "搜索来自 xxx 的邮件" | `search_emails`（query: `from:xxx`） |
| "读一下这封邮件" | `read_email`（传邮件 ID） |
| "给 xxx 发封邮件，主题…内容…" | `send_email` |
| "先存草稿别发" | `draft_email` |
| "把验证码邮件都列出来" | `search_emails`（query: `label:AI-验证码`） |
| "把这封标为已读/归档" | `modify_email` |
| "删掉这封" | `delete_email` |
| "下载附件" | `download_attachment` |
| "建个标签 / 列出所有标签" | `get_or_create_label` / `list_email_labels` |
| "以后 xxx 发来的自动归档到某标签" | `create_filter` |

> 注意：没有叫 `list_emails` 的工具，列邮件统一用 `search_emails` + Gmail 搜索语法。

## 常用 Gmail 搜索语法

```
in:inbox                收件箱
label:AI-验证码         已归档的验证码邮件
from:noreply@eigenflux.one   按发件人
is:unread               未读
has:attachment          带附件
subject:"login code"    按主题
newer_than:1d           最近一天
```

可自由组合，如 `label:AI-验证码 is:unread newer_than:7d`。

## 验证码邮件专用流程

验证码邮件已被过滤器自动归档到 `AI-验证码` 标签（不进收件箱、不删除）。
让 AI 取验证码时直接说：

> 「从 AI-验证码 标签里找最新的 EigenFlux 验证码，把验证码数字告诉我」

AI 会执行 `search_emails`（`label:AI-验证码 from:eigenflux.one newer_than:1d`）
→ `read_email` → 提取验证码。全程只读邮箱，不写工作区。

## 安全边界

- 权限范围：`gmail.modify` + `gmail.send` + `gmail.settings.basic`（无删除永久的权限，删除进废纸篓可恢复）
- 凭据位置：`~/.config/gmail-mcp/env` 与 `~/.gmail-mcp/credentials.json`（chmod 600，不在仓库内）
- 建议先让 AI 只做读取/归档，观察一段时间再放开 `send_email` 的日常使用

## 故障排查

| 症状 | 处理 |
|------|------|
| 启动报 "OAuth keys file not found" | 环境变量没挂 → 重新 `source ~/.config/gmail-mcp/env` |
| 调用报 `invalid_grant` | refresh token 过期 → 重跑 `python3 ~/.config/gmail-mcp/gmail_oauth.py` 重新授权 |
| 调用报 403 SERVICE_DISABLED | Google Cloud 项目 `still-descent-482515-f7` 的 Gmail API 被停用 → 去 Console 重新启用 |
| `list_filters` 显示 "No filters found" | 该 MCP 工具的显示 bug；用 Gmail 网页版 设置→过滤器 或直接调 Gmail API 确认 |
